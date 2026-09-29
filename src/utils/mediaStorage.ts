import { useState, useEffect } from 'react';

// IndexedDB storage for video and image files
// Bypasses the 5MB localStorage limit and supports large video recordings seamlessly

const DB_NAME = 'college_portal_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// In-memory cache for ObjectURLs so we don't recreate them needlessly
const objectUrlCache = new Map<string, string>();

/**
 * Stores a File or Blob in IndexedDB and returns a storage key `idb:<key>`
 */
export async function saveMediaBlob(key: string, fileOrBlob: Blob): Promise<string> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(fileOrBlob, key);

      req.onsuccess = () => {
        // Also register in memory cache
        const objUrl = URL.createObjectURL(fileOrBlob);
        objectUrlCache.set(key, objUrl);
        resolve(`idb:${key}`);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('Failed to save blob to IndexedDB, fallback to in-memory URL', err);
    const objUrl = URL.createObjectURL(fileOrBlob);
    objectUrlCache.set(key, objUrl);
    return objUrl;
  }
}

/**
 * Resolves a mediaUrl. If it starts with `idb:`, it retrieves the Blob from IndexedDB
 * and returns an active object URL. Otherwise, returns the URL directly.
 */
export async function resolveMediaUrl(url: string): Promise<string> {
  if (!url) return '';
  if (!url.startsWith('idb:')) {
    return url;
  }

  const key = url.replace('idb:', '');
  if (objectUrlCache.has(key)) {
    return objectUrlCache.get(key)!;
  }

  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        const blob = req.result as Blob | undefined;
        if (blob) {
          const objUrl = URL.createObjectURL(blob);
          objectUrlCache.set(key, objUrl);
          resolve(objUrl);
        } else {
          resolve('');
        }
      };

      req.onerror = () => {
        resolve('');
      };
    });
  } catch {
    return '';
  }
}

/**
 * Synchronous resolver using in-memory cache if available, or the URL itself.
 */
export function getCachedMediaUrl(url: string): string {
  if (!url) return '';
  if (!url.startsWith('idb:')) return url;
  const key = url.replace('idb:', '');
  return objectUrlCache.get(key) || '';
}

/**
 * Deletes a media blob from IndexedDB and revokes cached object URL
 */
export async function deleteMediaBlob(urlOrKey: string): Promise<void> {
  const key = urlOrKey.startsWith('idb:') ? urlOrKey.replace('idb:', '') : urlOrKey;
  if (objectUrlCache.has(key)) {
    try {
      URL.revokeObjectURL(objectUrlCache.get(key)!);
    } catch {}
    objectUrlCache.delete(key);
  }

  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(key);
  } catch (err) {
    console.warn('Error deleting media blob from IndexedDB:', err);
  }
}

/**
 * Captures a video thumbnail snapshot from a video file/blob at 1.0 second.
 */
export function generateVideoThumbnail(videoBlob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoBlob);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 1.0;

    let resolved = false;

    const capture = () => {
      if (resolved) return;
      resolved = true;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumb = canvas.toDataURL('image/jpeg', 0.85);
          URL.revokeObjectURL(url);
          resolve(thumb);
          return;
        }
      } catch (e) {
        console.warn('Failed canvas snapshot', e);
      }
      URL.revokeObjectURL(url);
      resolve('');
    };

    video.onloadeddata = () => {
      video.currentTime = 1.0;
    };

    video.onseeked = () => {
      capture();
    };

    video.onerror = () => {
      if (!resolved) {
        resolved = true;
        URL.revokeObjectURL(url);
        resolve('');
      }
    };

    // Timeout fallback
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        URL.revokeObjectURL(url);
        resolve('');
      }
    }, 2500);
  });
}

/**
 * React hook that synchronously and asynchronously resolves media URLs (handling idb: prefix)
 */
export function useMediaUrl(url: string | undefined): string {
  const [resolved, setResolved] = useState<string>(() => {
    if (!url) return '';
    return getCachedMediaUrl(url);
  });

  useEffect(() => {
    if (!url) {
      setResolved('');
      return;
    }
    if (!url.startsWith('idb:')) {
      setResolved(url);
      return;
    }

    let isCurrent = true;
    resolveMediaUrl(url).then((res) => {
      if (isCurrent && res) {
        setResolved(res);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [url]);

  return resolved || url || '';
}
