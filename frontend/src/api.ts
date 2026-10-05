import { WorkOrder, User, NotificationItem, AssistantResponse, Priority } from './types';

const API_BASE = '/api';

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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = `Ошибка запроса (${res.status})`;
    try {
      const data = await res.json();
      if (data.detail) errMessage = data.detail;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
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
  applyAction: (id: number, action: string, reason?: string, comment?: string, closing?: any) =>
    request<WorkOrder>(`/orders/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason, comment, closing }),
    }),
  uploadPhoto: async (orderId: number, kind: 'before' | 'after', file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('kind', kind);
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/orders/${orderId}/photos`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Ошибка загрузки фото');
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
    return `${API_BASE}/orders/${orderId}/print${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  // Excel Downloads
  downloadShiftExcel: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/reports/shift/export/excel`, {
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
    const res = await fetch(`${API_BASE}/reports/rating/export/excel?days=${days}`, {
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
    const res = await fetch(`${API_BASE}/reports/materials/export/excel?days=${days}`, {
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
