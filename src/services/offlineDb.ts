// IndexedDB service for offline field data caching and sync queue
const DB_NAME = 'agroscan_offline_db';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('cached_fields')) {
        db.createObjectStore('cached_fields', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cached_scans')) {
        db.createObjectStore('cached_scans', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending_sync_queue')) {
        db.createObjectStore('pending_sync_queue', { keyPath: 'queueId', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFieldsToOfflineCache(fields: any[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('cached_fields', 'readwrite');
    const store = tx.objectStore('cached_fields');
    for (const field of fields) {
      store.put(field);
    }
  } catch (err) {
    console.warn('Failed to cache fields in IndexedDB:', err);
  }
}

export async function getFieldsFromOfflineCache(): Promise<any[]> {
  try {
    const db = await openDB();
    const tx = db.transaction('cached_fields', 'readonly');
    const store = tx.objectStore('cached_fields');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function addPendingSyncItem(type: 'field' | 'scan' | 'observation', payload: any): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('pending_sync_queue', 'readwrite');
    const store = tx.objectStore('pending_sync_queue');
    store.add({
      type,
      payload,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Failed to add to pending sync queue:', err);
  }
}

export async function getPendingSyncItems(): Promise<any[]> {
  try {
    const db = await openDB();
    const tx = db.transaction('pending_sync_queue', 'readonly');
    const store = tx.objectStore('pending_sync_queue');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function clearPendingSyncQueue(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('pending_sync_queue', 'readwrite');
    tx.objectStore('pending_sync_queue').clear();
  } catch (err) {
    console.warn('Failed to clear pending sync queue:', err);
  }
}
