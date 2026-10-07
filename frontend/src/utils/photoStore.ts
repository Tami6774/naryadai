/**
 * Хранилище фото офлайн-очереди в IndexedDB.
 * localStorage не подходит: лимит ~5 МБ и только строки, а фото — бинарные и крупные.
 */

const DB_NAME = 'naryad_offline';
const STORE = 'photos';

export interface StoredPhoto {
  blob: Blob;
  name: string;
  type: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function putPhoto(key: string, file: File): Promise<void> {
  const value: StoredPhoto = { blob: file, name: file.name || 'photo.jpg', type: file.type || 'image/jpeg' };
  await run('readwrite', (s) => s.put(value, key));
}

export async function getPhoto(key: string): Promise<File | null> {
  const value = await run<StoredPhoto | undefined>('readonly', (s) => s.get(key));
  return value ? new File([value.blob], value.name, { type: value.type }) : null;
}

export async function deletePhoto(key: string): Promise<void> {
  await run('readwrite', (s) => s.delete(key));
}
