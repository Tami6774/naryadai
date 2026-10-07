/**
 * Очередь офлайн-действий исполнителя (Раздел 5.4, п. 5 ТЗ):
 * Сохранение действий при отсутствии связи (под землей, в экранированных цехах)
 * и автоматическая фоновая синхронизация при восстановлении сети.
 *
 * Метаданные действий — в localStorage, фото — в IndexedDB (photoStore).
 * Фото сохраняется в IndexedDB раньше записи в очередь, поэтому запись
 * никогда не ссылается на отсутствующее фото.
 */
import { deletePhoto, getPhoto, putPhoto } from './photoStore';

export type PhotoKind = 'before' | 'after';

export interface QueuedPhoto {
  key: string;   // ключ в IndexedDB
  kind: PhotoKind;
}

export interface OfflineAction {
  id: string;
  orderId: number;
  orderNumber?: number;
  action: string;
  reason?: string;
  comment?: string;
  closing?: any;
  photos?: QueuedPhoto[];  // ещё не загруженные фото; загружаются перед действием
  createdAt: string;
  // conflict — сервер ответил 409 и наряд не в ожидаемом статусе: нужно решение пользователя
  status: 'pending' | 'syncing' | 'failed' | 'conflict';
  errorMessage?: string;
}

export interface SyncDeps {
  applyAction: (id: number, action: string, reason?: string, comment?: string, closing?: any) => Promise<any>;
  uploadPhoto: (orderId: number, kind: PhotoKind, file: File) => Promise<any>;
  getOrder: (id: number) => Promise<{ status: string; status_label?: string }>;
}

export interface SyncResult {
  synced: number;
  failed: number;
  conflicts: number;
}

const STORAGE_KEY = 'naryad_offline_actions';
type Listener = (queue: OfflineAction[]) => void;
const listeners: Set<Listener> = new Set();

// Статусы наряда, в которых действие считается уже применённым (ответ потерялся, а запрос дошёл)
const APPLIED_STATUSES: Record<string, string[]> = {
  accept: ['accepted'],
  queue: ['queued'],
  reject: ['rejected'],
  start: ['in_progress'],
  pause: ['paused'],
  resume: ['in_progress'],
  complete: ['done', 'ai_review', 'closed'],
  approve: ['closed'],
  return_rework: ['rework'],
  cancel: ['cancelled'],
};

// Статус для оптимистичного отображения действия, сохранённого офлайн
export const OPTIMISTIC_STATUS: Record<string, string> = {
  accept: 'accepted',
  queue: 'queued',
  reject: 'rejected',
  start: 'in_progress',
  pause: 'paused',
  resume: 'in_progress',
  complete: 'done',
  approve: 'closed',
  return_rework: 'rework',
  cancel: 'cancelled',
};

/** Сеть/сервер недоступны (в отличие от ответа сервера с HTTP-ошибкой). */
export function isNetworkError(err: any): boolean {
  if (err?.status !== undefined) return false;
  return !navigator.onLine
    || err instanceof TypeError
    || /Failed to fetch|NetworkError|Load failed|network/i.test(err?.message || '');
}

function notifyListeners(queue: OfflineAction[]) {
  listeners.forEach((fn) => {
    try {
      fn(queue);
    } catch (e) {
      console.error('Offline queue listener error', e);
    }
  });
}

function writeQueue(queue: OfflineAction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  notifyListeners(queue);
}

function updateItem(id: string, fn: (item: OfflineAction) => void) {
  const queue = getOfflineQueue();
  const target = queue.find((x) => x.id === id);
  if (target) {
    fn(target);
    writeQueue(queue);
  }
}

export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function newId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

type NewAction = Omit<OfflineAction, 'id' | 'createdAt' | 'status' | 'photos'>;

export function saveOfflineAction(item: NewAction, id: string = newId(), photos?: QueuedPhoto[]): OfflineAction {
  const queue = getOfflineQueue();
  const newAction: OfflineAction = {
    ...item,
    id,
    photos: photos && photos.length ? photos : undefined,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  queue.push(newAction);
  writeQueue(queue);
  return newAction;
}

/** Действие с фото: сначала фото в IndexedDB, затем запись в очередь. Бросает ошибку, если фото не сохранить. */
export async function queueOfflineAction(
  item: NewAction,
  photos: Array<{ kind: PhotoKind; file: File }> = []
): Promise<OfflineAction> {
  const id = newId();
  const stored: QueuedPhoto[] = [];
  try {
    for (const [i, p] of photos.entries()) {
      const key = `${id}_${i}`;
      await putPhoto(key, p.file);
      stored.push({ key, kind: p.kind });
    }
  } catch (err) {
    await Promise.all(stored.map((p) => deletePhoto(p.key).catch(() => {})));
    throw new Error('Не удалось сохранить фото в памяти устройства');
  }
  return saveOfflineAction(item, id, stored);
}

/** Есть ли по наряду ещё не отправленные действия (новые действия должны встать за ними). */
export function hasPendingForOrder(orderId: number): boolean {
  return getOfflineQueue().some((x) => x.orderId === orderId && (x.status === 'pending' || x.status === 'syncing'));
}

export function removeOfflineAction(id: string): void {
  writeQueue(getOfflineQueue().filter((x) => x.id !== id));
}

/** Удаление действия пользователем вместе с неотправленными фото. */
export async function discardOfflineAction(id: string): Promise<void> {
  const item = getOfflineQueue().find((x) => x.id === id);
  await Promise.all((item?.photos || []).map((p) => deletePhoto(p.key).catch(() => {})));
  removeOfflineAction(id);
}

export function retryOfflineAction(id: string): void {
  updateItem(id, (it) => {
    it.status = 'pending';
    it.errorMessage = undefined;
  });
}

export function clearOfflineQueue(): void {
  const queue = getOfflineQueue();
  queue.forEach((it) => (it.photos || []).forEach((p) => deletePhoto(p.key).catch(() => {})));
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

export async function syncOfflineQueue(deps: SyncDeps): Promise<SyncResult> {
  const result: SyncResult = { synced: 0, failed: 0, conflicts: 0 };
  if (isSyncing) return result;
  const queue = getOfflineQueue();
  if (!queue.some((x) => x.status === 'pending')) return result;

  isSyncing = true;
  // Наряды, по которым есть нерешённый конфликт/ошибка: их следующие действия ждут
  const blocked = new Set<number>();

  try {
    for (const item of queue) {
      if (item.status !== 'pending' || blocked.has(item.orderId)) {
        blocked.add(item.orderId);
        continue;
      }

      let phase: 'photo' | 'action' = 'photo';
      try {
        // 1. Фото — по одному; после загрузки удаляем, чтобы повтор не создал дубликат
        for (const p of item.photos || []) {
          const file = await getPhoto(p.key);
          if (file) {
            await deps.uploadPhoto(item.orderId, p.kind, file);
          } else {
            console.warn('Офлайн-фото не найдено в IndexedDB, пропущено', p.key);
          }
          await deletePhoto(p.key);
          updateItem(item.id, (it) => {
            it.photos = (it.photos || []).filter((x) => x.key !== p.key);
          });
        }

        // 2. Само действие
        phase = 'action';
        await deps.applyAction(item.orderId, item.action, item.reason, item.comment, item.closing);
        removeOfflineAction(item.id);
        result.synced++;
      } catch (err: any) {
        if (isNetworkError(err)) {
          // Сеть всё ещё недоступна — остальное отправим при следующей попытке
          result.failed++;
          break;
        }

        if (phase === 'action' && err?.status === 409) {
          let message = err.message;
          try {
            const order = await deps.getOrder(item.orderId);
            if ((APPLIED_STATUSES[item.action] || []).includes(order.status)) {
              // Запрос дошёл раньше, потерялся только ответ — действие уже применено
              removeOfflineAction(item.id);
              result.synced++;
              continue;
            }
            message = `${err.message}. Текущий статус наряда: «${order.status_label || order.status}»`;
          } catch (checkErr: any) {
            if (isNetworkError(checkErr)) {
              result.failed++;
              break;
            }
            message = checkErr?.message || message;
          }
          updateItem(item.id, (it) => {
            it.status = 'conflict';
            it.errorMessage = message;
          });
          result.conflicts++;
        } else {
          // Ошибка валидации или прав — нужна реакция пользователя
          updateItem(item.id, (it) => {
            it.status = 'failed';
            it.errorMessage = err?.message || 'Ошибка синхронизации';
          });
          result.failed++;
        }
        blocked.add(item.orderId);
      }
    }
  } finally {
    isSyncing = false;
  }

  return result;
}
