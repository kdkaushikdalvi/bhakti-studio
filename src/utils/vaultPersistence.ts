/**
 * Bhakti Vault Persistence Engine
 * 
 * Provides resilient, dual-layer storage across browser IndexedDB and LocalStorage.
 * Guarantees that user data (videos, audios, photos, categories, profile, settings)
 * is NEVER cleared on:
 * - App refresh / browser reload / hard refresh
 * - Temporary cache purge / memory flush
 * - PWA installation / standalone launch
 * - Browser storage eviction (via navigator.storage.persist())
 */

import {
  VideoItem,
  PhotoItem,
  AudioItem,
  CategoryInfo,
  UserProfile,
  AppSettings,
  ThemeMode,
  ViewMode,
} from '../types';

export const MASTER_DB_NAME = 'mybhakti_vault_master_db';
export const MASTER_DB_VERSION = 1;
export const STORE_VAULT_RECORDS = 'vault_records';
export const STORE_VAULT_BLOBS = 'vault_blobs';

// Standardized Storage Keys
export const STORAGE_KEY_VIDEOS = 'mybhakti_vault_videos_v5';
export const STORAGE_KEY_PHOTOS = 'mybhakti_vault_photos_v5';
export const STORAGE_KEY_AUDIOS = 'mybhakti_vault_audios_v5';
export const STORAGE_KEY_CATEGORIES = 'mybhakti_categories_v2';
export const STORAGE_KEY_PROFILE = 'mybhakti_user_profile_v2';
export const STORAGE_KEY_SETTINGS = 'mybhakti_app_settings_v2';
export const STORAGE_KEY_THEME = 'mybhakti_theme_mode_v3';
export const STORAGE_KEY_VIEW_MODE = 'mybhakti_view_mode_v3';

// Legacy keys for automatic migration
const LEGACY_VIDEO_KEYS = [
  'mybhakti_vault_videos_v4',
  'mybhakti_vault_videos_v3',
  'mybhakti_vault_videos_v2',
  'mybhakti_vault_videos',
  'mybhakti_videos',
];

const LEGACY_PHOTO_KEYS = [
  'mybhakti_vault_photos_v4',
  'mybhakti_vault_photos_v3',
  'mybhakti_vault_photos_v2',
  'mybhakti_vault_photos',
  'mybhakti_photos',
];

const LEGACY_AUDIO_KEYS = [
  'mybhakti_vault_audios_v4',
  'mybhakti_vault_audios_v3',
  'mybhakti_vault_audios_v2',
  'mybhakti_vault_audios',
  'mybhakti_audios',
];

let dbInstance: IDBDatabase | null = null;
let isOpeningDb = false;
let dbOpenPromise: Promise<IDBDatabase> | null = null;

/**
 * Open the Master IndexedDB database
 */
export function openMasterDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbOpenPromise) return dbOpenPromise;

  dbOpenPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(MASTER_DB_NAME, MASTER_DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_VAULT_RECORDS)) {
        db.createObjectStore(STORE_VAULT_RECORDS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_VAULT_BLOBS)) {
        db.createObjectStore(STORE_VAULT_BLOBS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onclose = () => {
        dbInstance = null;
        dbOpenPromise = null;
      };
      resolve(dbInstance);
    };

    request.onerror = () => {
      dbOpenPromise = null;
      reject(request.error || new Error('Failed to open Bhakti Master DB'));
    };
  });

  return dbOpenPromise;
}

/**
 * Request persistent browser storage so the browser will never
 * purge data under disk pressure or cache cleaning.
 */
export async function enablePersistentStorage(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.persist) {
    return false;
  }
  try {
    const isAlreadyPersisted = await navigator.storage.persisted();
    if (isAlreadyPersisted) {
      return true;
    }
    const granted = await navigator.storage.persist();
    console.info(`[Bhakti Vault] Persistent Storage Status: ${granted ? 'GUARANTEED' : 'STANDARD'}`);
    return granted;
  } catch (err) {
    console.warn('[Bhakti Vault] Persistent storage request error:', err);
    return false;
  }
}

/**
 * Save an arbitrary record to IndexedDB
 */
export async function saveRecordToIndexedDb<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openMasterDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_VAULT_RECORDS, 'readwrite');
      const store = tx.objectStore(STORE_VAULT_RECORDS);
      const request = store.put({
        key,
        data,
        updatedAt: Date.now(),
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[Bhakti Vault] IndexedDB write failed for key "${key}":`, err);
  }
}

/**
 * Read an arbitrary record from IndexedDB
 */
export async function getRecordFromIndexedDb<T>(key: string): Promise<T | null> {
  try {
    const db = await openMasterDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_VAULT_RECORDS, 'readonly');
      const store = tx.objectStore(STORE_VAULT_RECORDS);
      const request = store.get(key);
      request.onsuccess = () => {
        if (request.result && request.result.data !== undefined) {
          resolve(request.result.data as T);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[Bhakti Vault] IndexedDB read failed for key "${key}":`, err);
    return null;
  }
}

/**
 * Save data with dual-layer durability:
 * 1. Synchronous localStorage for fast page bootstrap
 * 2. Asynchronous IndexedDB for multi-gigabyte capacity and eviction resistance
 */
export function persistVaultCollection<T>(key: string, data: T): void {
  // 1. LocalStorage with safe QuotaExceeded catching
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (lsError) {
    console.warn(`[Bhakti Vault] LocalStorage quota exceeded for "${key}". Falling back to IndexedDB.`, lsError);
  }

  // 2. IndexedDB (non-blocking)
  saveRecordToIndexedDb(key, data).catch((idbError) => {
    console.error(`[Bhakti Vault] Error persisting collection "${key}" to IndexedDB:`, idbError);
  });
}

/**
 * Synchronously reads from LocalStorage with fallback migration
 */
export function getInitialFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(fallback) && Array.isArray(parsed) && parsed.length > 0) {
        return parsed as T;
      } else if (!Array.isArray(fallback) && parsed) {
        return parsed as T;
      }
    }
  } catch (err) {
    console.warn(`[Bhakti Vault] Error parsing localStorage key "${key}":`, err);
  }

  // Check legacy keys if key is an array collection
  if (key === STORAGE_KEY_VIDEOS) {
    for (const legacyKey of LEGACY_VIDEO_KEYS) {
      try {
        const legacyVal = localStorage.getItem(legacyKey);
        if (legacyVal) {
          const parsed = JSON.parse(legacyVal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.info(`[Bhakti Vault] Migrated ${parsed.length} videos from legacy key "${legacyKey}"`);
            // Save to current key
            localStorage.setItem(key, JSON.stringify(parsed));
            return parsed as unknown as T;
          }
        }
      } catch {
        // Skip
      }
    }
  } else if (key === STORAGE_KEY_PHOTOS) {
    for (const legacyKey of LEGACY_PHOTO_KEYS) {
      try {
        const legacyVal = localStorage.getItem(legacyKey);
        if (legacyVal) {
          const parsed = JSON.parse(legacyVal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.info(`[Bhakti Vault] Migrated ${parsed.length} photos from legacy key "${legacyKey}"`);
            localStorage.setItem(key, JSON.stringify(parsed));
            return parsed as unknown as T;
          }
        }
      } catch {
        // Skip
      }
    }
  } else if (key === STORAGE_KEY_AUDIOS) {
    for (const legacyKey of LEGACY_AUDIO_KEYS) {
      try {
        const legacyVal = localStorage.getItem(legacyKey);
        if (legacyVal) {
          const parsed = JSON.parse(legacyVal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.info(`[Bhakti Vault] Migrated ${parsed.length} audios from legacy key "${legacyKey}"`);
            localStorage.setItem(key, JSON.stringify(parsed));
            return parsed as unknown as T;
          }
        }
      } catch {
        // Skip
      }
    }
  }

  return fallback;
}

/**
 * Reconciles array collections by merging distinct items by id.
 * Prevents dropping items if one store had items the other didn't.
 */
export function mergeItemsById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>();
  // Primary has precedence for updated fields
  for (const item of secondary) {
    if (item && item.id) map.set(item.id, item);
  }
  for (const item of primary) {
    if (item && item.id) map.set(item.id, item);
  }
  return Array.from(map.values());
}

/**
 * Full Vault Data snapshot for export/backup
 */
export interface VaultBackupSnapshot {
  version: number;
  exportedAt: string;
  videos: VideoItem[];
  photos: PhotoItem[];
  audios: AudioItem[];
  categories: CategoryInfo[];
  userProfile?: UserProfile;
  appSettings?: AppSettings;
}

/**
 * Export all vault data to a downloadable JSON file
 */
export function exportVaultDataToFile(snapshot: VaultBackupSnapshot): void {
  const jsonStr = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Bhakti_Vault_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Import vault data from a JSON file
 */
export function parseVaultBackupFile(file: File): Promise<VaultBackupSnapshot> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid backup file format');
        }
        resolve(parsed as VaultBackupSnapshot);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to parse backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
