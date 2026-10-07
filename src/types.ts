export interface VideoItem {
  id: string;
  youtubeId: string;
  url: string;
  title: string;
  channelTitle?: string;
  tags: string[];
  notes?: string;
  timestamps?: { time: number; label: string }[];
  isFavorite: boolean;
  isWatchLater: boolean;
  isPinned?: boolean;
  createdAt: string; // ISO string
  thumbnailUrl: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  photoUrl: string; // Data URL or Web URL
  thumbnailUrl?: string;
  isFavorite: boolean;
  createdAt: string; // ISO string
  fileSize?: string;
}

export interface AudioItem {
  id: string;
  sourceType?: 'drive' | 'local';
  driveId?: string;
  url: string; // Google drive link or local filename
  streamUrl?: string;
  previewUrl?: string;
  localBlobId?: string; // IndexedDB key
  fileName?: string;
  fileSize?: string;
  title: string;
  artistOrSource?: string;
  artist?: string;
  tags?: string[];
  notes?: string;
  isFavorite: boolean;
  createdAt: string; // ISO string
  duration?: number;
}

export type MediaItem = 
  | (VideoItem & { mediaType: 'video' }) 
  | (PhotoItem & { mediaType: 'photo' })
  | (AudioItem & { mediaType: 'audio' });

export type ViewMode = 'list';

export type MediaTypeFilter = 'videos' | 'photos' | 'audio';

export type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

export interface FilterState {
  searchQuery: string;
  mediaType: MediaTypeFilter;
  onlyFavorites: boolean;
  onlyWatchLater: boolean;
  sortBy: SortOption;
}

export interface UserProfile {
  name: string;
  mantra: string;
  spiritualGoal: string;
  avatarIcon: string;
}

export type ThemeMode = 'light' | 'warm' | 'dark' | 'blue';

export interface AppSettings {
  autoPlayNext: boolean;
  compactCards: boolean;
  timeFormat: '12h' | '24h';
  enableVibrations: boolean;
  theme?: ThemeMode;
}
