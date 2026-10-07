import { Capacitor } from '@capacitor/core';
import { WorkOrder, User, NotificationItem, AssistantResponse, Priority } from './types';
import { hasPendingForOrder, isNetworkError, OPTIMISTIC_STATUS, saveOfflineAction } from './utils/offlineQueue';

// Адрес сервера по умолчанию для APK (пока пользователь не указал свой на экране входа)
const NATIVE_DEFAULT_API = 'http://192.168.3.81:8000';

export function getApiBaseUrl(): string {
  const host = localStorage.getItem('naryad_api_host');
  if (host && host.trim()) {
    return host.trim().replace(/\/+$/, '');
  }
  // В APK (Capacitor) страница открыта с localhost самого телефона — нужен адрес ПК с сервером.
  // В браузере (uvicorn :8000, vite dev :3000 / preview с proxy) — тот же origin.
  if (Capacitor.isNativePlatform()) {
    return NATIVE_DEFAULT_API;
  }
  return '';
}

export function setApiHost(host: string | null): void {
  if (host && host.trim()) {
    localStorage.setItem('naryad_api_host', host.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('naryad_api_host');
  }
}

export async function checkServerHealth(timeoutMs: number = 3500): Promise<{ ok: boolean; pingMs?: number; error?: string; demoMode?: boolean }> {
  const base = getApiBaseUrl();
  const url = `${base}/api/health`;
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const pingMs = Date.now() - start;
      let demoMode: boolean | undefined;
      try {
        const data = await res.json();
        if (typeof data?.demo_mode === 'boolean') demoMode = data.demo_mode;
      } catch {
        // старый сервер без JSON-поля — оставляем режим по умолчанию
      }
      return { ok: true, pingMs, demoMode };
    }
    return { ok: false, error: `Сервер вернул статус ${res.status}` };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { ok: false, error: `Таймаут подключения к серверу (${timeoutMs} мс)` };
    }
    return { ok: false, error: 'Сетевая ошибка: хост недоступен или сервер выключен' };
  }
}

export function getWsBaseUrl(): string {
  const base = getApiBaseUrl();
  if (base) {
    const wsProto = base.startsWith('https://') ? 'wss://' : 'ws://';
    return base.replace(/^https?:\/\//, wsProto);
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}`;
}

export function getFullApiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}/api${cleanEndpoint}`;
}

export function getToken(): string | null {
  return localStorage.getItem('naryad_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('naryad_token', token);
  } else {
    localStorage.removeItem('naryad_token');
  }
}

/** Ошибка ответа сервера: сообщение из `detail` + HTTP-статус (для офлайн-очереди). */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function errorFromResponse(res: Response, fallback: string): Promise<ApiError> {
  let errMessage = fallback;
  try {
    const data = await res.json();
    if (data.detail) errMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
  } catch {
    // ignore
  }
  return new ApiError(errMessage, res.status);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = getFullApiUrl(endpoint);
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw await errorFromResponse(res, `Ошибка запроса (${res.status})`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (login: string, pin: string) => 
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, pin }),
    }),
  getMe: () => request<User>('/auth/me'),
  getDemoUsers: () => request<Array<{ login: string; full_name: string; role: string; specialty: string }>>('/auth/demo-users'),

  // Dictionaries
  getDictionaries: () => request<{
    sections: Array<{ id: number; name: string }>;
    equipment: Array<any>;
    brigades: Array<{ id: number; name: string }>;
    fault_codes: Array<any>;
    materials: Array<any>;
  }>('/dictionaries'),

  // Workers
  getWorkers: () => request<User[]>('/workers'),
  setOnShift: (on_shift: boolean) => request<User>('/workers/me/on-shift', {
    method: 'POST',
    body: JSON.stringify({ on_shift }),
  }),

  // Orders
  getOrders: (params?: { scope?: string; status?: string[]; assignee_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.scope) q.set('scope', params.scope);
    if (params?.assignee_id) q.set('assignee_id', String(params.assignee_id));
    if (params?.status) params.status.forEach(s => q.append('status', s));
    return request<WorkOrder[]>(`/orders?${q.toString()}`);
  },
  getOrder: (id: number) => request<WorkOrder>(`/orders/${id}`),
  createOrder: (data: any) => request<WorkOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  suggestAssignee: (equipment_id: number, description: string) => 
    request<Array<User & { match_score: number; reason: string }>>('/orders/suggest-assignee', {
      method: 'POST',
      body: JSON.stringify({ equipment_id, description }),
    }),

  // Direct action (без авто-очереди, для выполнения очереди синхронизации)
  applyActionDirect: (id: number, action: string, reason?: string, comment?: string, closing?: any) =>
    request<WorkOrder>(`/orders/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason, comment, closing }),
    }),

  // Action с поддержкой офлайн-режима
  applyAction: async (id: number, action: string, reason?: string, comment?: string, closing?: any) => {
    const queueOffline = () => {
      saveOfflineAction({ orderId: id, action, reason, comment, closing });
      return { id, status: OPTIMISTIC_STATUS[action], __offline: true } as any;
    };
    // По наряду уже есть неотправленные действия — встаём за ними, иначе сервер получит их не по порядку
    if (hasPendingForOrder(id)) return queueOffline();
    try {
      return await request<WorkOrder>(`/orders/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, reason, comment, closing }),
      });
    } catch (err: any) {
      // При отсутствии сети или сетевом сбое (Failed to fetch) сохраняем в офлайн-очередь
      if (isNetworkError(err)) return queueOffline();
      throw err;
    }
  },

  uploadPhoto: async (orderId: number, kind: 'before' | 'after', file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('kind', kind);
    formData.append('file', file);
    const res = await fetch(getFullApiUrl(`/orders/${orderId}/photos`), {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) throw await errorFromResponse(res, 'Ошибка загрузки фото');
    return res.json();
  },
  setMasterScore: (id: number, score: number, comment?: string) =>
    request<WorkOrder>(`/orders/${id}/master-score`, {
      method: 'POST',
      body: JSON.stringify({ score, comment }),
    }),
  reassignOrder: (id: number, assignee_id: number, comment?: string) =>
    request<WorkOrder>(`/orders/${id}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ assignee_id, comment }),
    }),
  changeOrderPriority: (id: number, priority: Priority, deadline?: string) =>
    request<WorkOrder>(`/orders/${id}/priority`, {
      method: 'POST',
      body: JSON.stringify({ priority, deadline }),
    }),
  cancelOrder: (id: number, reason: string) =>
    request<WorkOrder>(`/orders/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'cancel', reason }),
    }),
  askAssistant: (query: string) =>
    request<AssistantResponse>('/assistant/ask', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  readAllNotifications: () => request<{ ok: boolean }>('/notifications/read-all', { method: 'POST' }),

  // Reports & Analytics
  getCounters: () => request<{ shift: string; issued: number; done: number; overdue: number; equipment_down: number }>('/dashboard/counters'),
  getShiftReport: (start?: string, end?: string) => request<any>('/reports/shift'),
  getRating: () => request<any>('/reports/rating'),
  getBrigadesRating: (days: number = 30) => request<any>(`/reports/brigades?days=${days}`),
  getAnomalies: (days: number = 90) => request<any>(`/analytics/anomalies?days=${days}`),
  getMaterialsReport: (days: number = 30) => request<any>(`/reports/materials?days=${days}`),

  // Smart AI Suggestions & Printing
  suggestFaultCode: (description: string) =>
    request<{
      fault_code_id?: number;
      code?: string;
      name?: string;
      norm_hours?: number;
      confidence?: number;
      reason?: string;
    }>('/orders/suggest-fault-code', {
      method: 'POST',
      body: JSON.stringify({ description }),
    }),
  getOrderPrintUrl: (orderId: number) => {
    const token = getToken();
    return `${getFullApiUrl(`/orders/${orderId}/print`)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  // Excel Downloads
  downloadShiftExcel: async () => {
    const token = getToken();
    const res = await fetch(getFullApiUrl('/reports/shift/export/excel'), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Ошибка выгрузки отчёта за смену');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smena_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  downloadRatingExcel: async (days: number = 30) => {
    const token = getToken();
    const res = await fetch(getFullApiUrl(`/reports/rating/export/excel?days=${days}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Ошибка выгрузки рейтинга');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reiting_ispolnitelei_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  downloadMaterialsExcel: async (days: number = 30) => {
    const token = getToken();
    const res = await fetch(getFullApiUrl(`/reports/materials/export/excel?days=${days}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Ошибка выгрузки списания ТМЦ');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tmc_spisanie_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
