/**
 * Utilities for extracting Google Drive file IDs and constructing streaming/embed URLs.
 */

export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern 1: drive.google.com/file/d/FILE_ID/...
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Pattern 2: id=FILE_ID query parameter (e.g. drive.google.com/open?id=... or uc?id=...)
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Pattern 3: docs.google.com/file/d/FILE_ID
  const docsDMatch = trimmed.match(/docs\.google\.com\/.*?\/d\/([a-zA-Z0-9_-]+)/);
  if (docsDMatch && docsDMatch[1]) {
    return docsDMatch[1];
  }

  // Pattern 4: If it's a bare alphanumeric Google Drive File ID (typically 25-45 characters)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Returns direct streaming/download URL for Google Drive audio file
 */
export function getGoogleDriveStreamUrl(driveId: string): string {
  return `https://docs.google.com/uc?export=download&id=${driveId}`;
}

/**
 * Returns embed preview URL for Google Drive
 */
export function getGoogleDrivePreviewUrl(driveId: string): string {
  return `https://drive.google.com/file/d/${driveId}/preview`;
}

/**
 * Returns web view URL for Google Drive
 */
export function getGoogleDriveViewUrl(driveId: string): string {
  return `https://drive.google.com/file/d/${driveId}/view`;
}

/**
 * Formats time in seconds to mm:ss or hh:mm:ss
 */
export function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
