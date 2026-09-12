/**
 * Extracts the YouTube video ID from various YouTube URL formats.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Handle standard watch?v= format
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?(?:.*&)?v=)([^#&?]+)/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // Handle youtu.be shortlinks
  const shortMatch = trimmed.match(/(?:youtu\.be\/)([^#&?]+)/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // Handle embed URLs
  const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([^#&?]+)/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // Handle shorts URLs
  const shortsMatch = trimmed.match(/(?:youtube\.com\/shorts\/)([^#&?]+)/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // Handle live stream URLs
  const liveMatch = trimmed.match(/(?:youtube\.com\/live\/)([^#&?]+)/);
  if (liveMatch && liveMatch[1]) return liveMatch[1];

  // If already just an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Returns thumbnail URLs for a YouTube video ID
 */
export function getYouTubeThumbnail(videoId: string, quality: 'max' | 'hq' | 'mq' = 'hq'): string {
  if (quality === 'max') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  if (quality === 'mq') {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Fetches oEmbed video details from YouTube's public oEmbed service
 */
export async function fetchYouTubeMetadata(url: string): Promise<{ title?: string; author_name?: string }> {
  try {
    const encodedUrl = encodeURIComponent(url.trim());
    // Using noembed fallback which supports CORS or youtube oembed
    const res = await fetch(`https://noembed.com/embed?url=${encodedUrl}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return {
          title: data.title,
          author_name: data.author_name,
        };
      }
    }
  } catch {
    // Fallback gracefully on network/CORS issues
  }
  return {};
}

/**
 * Parses timestamp string like "1:30" or "01:25:00" into seconds
 */
export function parseTimestampToSeconds(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatSecondsToTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
