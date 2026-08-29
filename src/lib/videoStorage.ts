// src/lib/videoStorage.ts

const DB_NAME = 'OratiiVideoDB';
const STORE_NAME = 'session_videos';
const MAX_VIDEOS = 5;

let dbPromise: Promise<IDBDatabase> | null = null;

// Promisify any IndexedDB request to avoid repetitive onsuccess/onerror wrappers
function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function initDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') return Promise.reject('Not in browser');
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' });
      }
    };
  });

  return dbPromise;
}

export async function saveVideoBlob(sessionId: string, blob: Blob) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await idbRequest(store.put({ sessionId, blob, timestamp: Date.now() }));

    // Enforce rolling limit (keep only the 5 most recent)
    const allRecords = await idbRequest(store.getAll());
    if (allRecords.length > MAX_VIDEOS) {
      allRecords.sort((a: any, b: any) => b.timestamp - a.timestamp);
      allRecords.slice(MAX_VIDEOS).forEach((r: any) => store.delete(r.sessionId));
    }
  } catch (error) {
    console.error('Error saving video to IndexedDB:', error);
  }
}

export async function getVideoBlob(sessionId: string): Promise<Blob | null> {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const result = await idbRequest(store.get(sessionId));
    return result?.blob || null;
  } catch (error) {
    console.error('Error getting video from IndexedDB:', error);
    return null;
  }
}
