/**
 * Очередь офлайн-действий исполнителя (Раздел 5.4, п. 5 ТЗ):
 * Сохранение действий при отсутствии связи (под землей, в экранированных цехах)
 * и автоматическая фоновая синхронизация при восстановлении сети.
 */

export interface OfflineAction {
  id: string;
  orderId: number;
  orderNumber?: number;
  action: string;
  reason?: string;
  comment?: string;
  closing?: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
}

const STORAGE_KEY = 'naryad_offline_actions';
type Listener = (queue: OfflineAction[]) => void;
const listeners: Set<Listener> = new Set();

function notifyListeners(queue: OfflineAction[]) {
  listeners.forEach((fn) => {
    try {
      fn(queue);
    } catch (e) {
      console.error('Offline queue listener error', e);
    }
  });
}

export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineAction(item: Omit<OfflineAction, 'id' | 'createdAt' | 'status'>): OfflineAction {
  const queue = getOfflineQueue();
  const newAction: OfflineAction = {
    ...item,
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  queue.push(newAction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  notifyListeners(queue);
  return newAction;
}

export function removeOfflineAction(id: string): void {
  const queue = getOfflineQueue().filter((x) => x.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  notifyListeners(queue);
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(STORAGE_KEY);
  notifyListeners([]);
}

export function subscribeOfflineQueue(listener: Listener): () => void {
  listeners.add(listener);
  listener(getOfflineQueue());
  return () => {
    listeners.delete(listener);
  };
}

let isSyncing = false;

export async function syncOfflineQueue(
  applyActionFn: (
    id: number,
    action: string,
    reason?: string,
    comment?: string,
    closing?: any
  ) => Promise<any>
): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  isSyncing = true;
  let synced = 0;
  let failed = 0;

  try {
    for (const item of [...queue]) {
      try {
        await applyActionFn(
          item.orderId,
          item.action,
          item.reason,
          item.comment,
          item.closing
        );
        removeOfflineAction(item.id);
        synced++;
      } catch (err: any) {
        // Если статус уже перешёл (409 Conflict), действие уже применено на сервере
        if (err?.message?.includes('409') || err?.message?.includes('Нельзя выполнить')) {
          removeOfflineAction(item.id);
          synced++;
        } else if (err?.name === 'TypeError' || !navigator.onLine) {
          // Сеть всё ещё недоступна, прерываем цикл синхронизации до следующей попытки
          failed++;
          break;
        } else {
          // Ошибка валидации или прав
          const current = getOfflineQueue();
          const target = current.find((x) => x.id === item.id);
          if (target) {
            target.status = 'failed';
            target.errorMessage = err?.message || 'Ошибка синхронизации';
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
            notifyListeners(current);
          }
          failed++;
        }
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}
