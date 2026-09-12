/**
 * Audio storage manager using browser IndexedDB.
 * Allows storing full-fidelity audio files (.mp3, .wav, .m4a, .aac, .ogg, .flac)
 * from local computer or mobile device storage without exceeding localStorage limits.
 */

const DB_NAME = 'mybhakti_audio_vault_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_tracks';

// Memory cache for active Object URLs
const objectUrlCache = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open audio database'));
    };
  });
}

/**
 * Save an audio file (File or Blob) to IndexedDB
 */
export async function saveLocalAudioFile(id: string, file: Blob | File): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record = {
      id,
      blob: file,
      type: file.type || 'audio/mpeg',
      size: file.size,
      updatedAt: Date.now(),
    };

    const request = store.put(record);

    request.onsuccess = () => {
      // If we had a previous cached URL, revoke and refresh
      if (objectUrlCache.has(id)) {
        URL.revokeObjectURL(objectUrlCache.get(id)!);
        objectUrlCache.delete(id);
      }
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to save audio file'));
    };
  });
}

/**
 * Retrieve an audio Blob from IndexedDB
 */
export async function getLocalAudioBlob(id: string): Promise<Blob | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const result = request.result;
      if (result && result.blob) {
        resolve(result.blob as Blob);
      } else {
        resolve(null);
      }
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to read audio file'));
    };
  });
}

/**
 * Get or create a streamable Object URL for local audio
 */
export async function getLocalAudioUrl(id: string): Promise<string | null> {
  if (objectUrlCache.has(id)) {
    return objectUrlCache.get(id)!;
  }

  const blob = await getLocalAudioBlob(id);
  if (!blob) return null;

  const url = URL.createObjectURL(blob);
  objectUrlCache.set(id, url);
  return url;
}

/**
 * Delete an audio file from IndexedDB and revoke its Object URL
 */
export async function deleteLocalAudioFile(id: string): Promise<void> {
  if (objectUrlCache.has(id)) {
    try {
      URL.revokeObjectURL(objectUrlCache.get(id)!);
    } catch {
      // Ignore
    }
    objectUrlCache.delete(id);
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Graceful cleanup
  }
}

/**
 * Clear all local audio files from IndexedDB
 */
export async function clearAllLocalAudioFiles(): Promise<void> {
  // Revoke all in memory
  objectUrlCache.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore
    }
  });
  objectUrlCache.clear();

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Ignore
  }
}

/**
 * Inspect local audio file metadata (duration, clean title, size)
 */
export function getAudioFileMetadata(
  file: File
): Promise<{ duration: number; cleanTitle: string; formattedSize: string }> {
  return new Promise((resolve) => {
    const cleanTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = file.size === 0 ? 0 : Math.floor(Math.log(file.size) / Math.log(k));
    const formattedSize =
      file.size === 0
        ? '0 B'
        : parseFloat((file.size / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];

    try {
      const tempUrl = URL.createObjectURL(file);
      const testAudio = document.createElement('audio');
      testAudio.preload = 'metadata';

      testAudio.onloadedmetadata = () => {
        const duration =
          testAudio.duration && !isNaN(testAudio.duration) && isFinite(testAudio.duration)
            ? testAudio.duration
            : 0;
        URL.revokeObjectURL(tempUrl);
        resolve({ duration, cleanTitle, formattedSize });
      };

      testAudio.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        resolve({ duration: 0, cleanTitle, formattedSize });
      };

      testAudio.src = tempUrl;
    } catch {
      resolve({ duration: 0, cleanTitle, formattedSize });
    }
  });
}
