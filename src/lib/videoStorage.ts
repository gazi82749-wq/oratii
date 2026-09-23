// src/lib/videoStorage.ts
// Universal IndexedDB storage for Audio and Video media previews with 7-Day Auto-Purge

const DB_NAME = 'OratiiMediaDB';
const STORE_NAME = 'session_media';
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days in milliseconds
const MAX_MEDIA_COUNT = 15;

let dbPromise: Promise<IDBDatabase> | null = null;

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function initDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') return Promise.reject('Not in browser environment');
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
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

export async function saveMediaBlob(
  sessionId: string,
  blob: Blob,
  mediaType: 'video' | 'audio' = 'audio'
): Promise<void> {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const now = Date.now();
    await idbRequest(
      store.put({
        sessionId,
        blob,
        mediaType,
        mimeType: blob.type || (mediaType === 'video' ? 'video/webm' : 'audio/webm'),
        timestamp: now,
        expiresAt: now + RETENTION_MS,
      })
    );

    // Auto-purge records older than 7 days
    const allRecords: any[] = await idbRequest(store.getAll());
    const expired = allRecords.filter(r => now - (r.timestamp || 0) > RETENTION_MS);
    expired.forEach(r => store.delete(r.sessionId));

    // Enforce max item cap
    const active = allRecords.filter(r => now - (r.timestamp || 0) <= RETENTION_MS);
    if (active.length > MAX_MEDIA_COUNT) {
      active.sort((a, b) => b.timestamp - a.timestamp);
      active.slice(MAX_MEDIA_COUNT).forEach(r => store.delete(r.sessionId));
    }
  } catch (error) {
    console.error('[MediaStorage] Failed to save media blob to IndexedDB:', error);
  }
}

export async function getMediaBlob(
  sessionId: string
): Promise<{ blob: Blob; mediaType: 'video' | 'audio'; mimeType: string } | null> {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const result = await idbRequest(store.get(sessionId));

    if (!result) return null;

    // Check if expired (> 7 days)
    if (Date.now() - (result.timestamp || 0) > RETENTION_MS) {
      // Async delete expired item
      initDB().then(d => {
        const delTx = d.transaction(STORE_NAME, 'readwrite');
        delTx.objectStore(STORE_NAME).delete(sessionId);
      });
      return null;
    }

    return {
      blob: result.blob,
      mediaType: result.mediaType || 'audio',
      mimeType: result.mimeType || result.blob.type,
    };
  } catch (error) {
    console.error('[MediaStorage] Failed to fetch media blob from IndexedDB:', error);
    return null;
  }
}

// Backward-compatible wrappers for videoStorage
export async function saveVideoBlob(sessionId: string, blob: Blob) {
  return saveMediaBlob(sessionId, blob, 'video');
}

export async function getVideoBlob(sessionId: string): Promise<Blob | null> {
  const media = await getMediaBlob(sessionId);
  return media?.blob || null;
}
