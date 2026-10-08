import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  INITIAL_VIDEOS,
  INITIAL_PHOTOS,
  INITIAL_AUDIOS,
} from './data/initialVideos';
import {
  VideoItem,
  PhotoItem,
  AudioItem,
  MediaItem,
  FilterState,
  MediaTypeFilter,
  UserProfile,
  AppSettings,
  ThemeMode,
} from './types';
import { VideoListItem } from './components/VideoListItem';
import { PhotoListItem } from './components/PhotoListItem';
import { AudioListItem } from './components/AudioListItem';
import { AudioPlayerModal } from './components/AudioPlayerModal';
import { Navbar } from './components/Navbar';
import { FloatingGlassFooter } from './components/FloatingGlassFooter';
import { InlineAddMediaSection } from './components/InlineAddMediaSection';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { EditVideoModal } from './components/EditVideoModal';
import { PhotoLightboxModal } from './components/PhotoLightboxModal';
import { SidebarDrawer } from './components/SidebarDrawer';
import { InstallPwaModal } from './components/InstallPwaModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import {
  saveLocalAudioFile,
  deleteLocalAudioFile,
  clearAllLocalAudioFiles,
} from './utils/audioStorage';
import {
  STORAGE_KEY_VIDEOS,
  STORAGE_KEY_PHOTOS,
  STORAGE_KEY_AUDIOS,
  STORAGE_KEY_PROFILE,
  STORAGE_KEY_SETTINGS,
  STORAGE_KEY_THEME,
  STORE_VAULT_RECORDS,
  openMasterDatabase,
  persistVaultCollection,
  getInitialFromLocalStorage,
  getRecordFromIndexedDb,
  mergeItemsById,
  enablePersistentStorage,
  exportVaultDataToFile,
  parseVaultBackupFile,
} from './utils/vaultPersistence';
import {
  Youtube,
  Image as ImageIcon,
  Disc3,
  Check,
  ChevronDown,
} from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Devotee',
  mantra: '|| भक्ती हीच माझी शक्ती ||',
  spiritualGoal: 'Daily Sadhana & Contemplation',
  avatarIcon: '🕉️',
};

const DEFAULT_SETTINGS: AppSettings = {
  autoPlayNext: true,
  compactCards: false,
  timeFormat: '12h',
  enableVibrations: true,
};

const cleanAndSequencePhotos = (rawList: PhotoItem[]): PhotoItem[] => {
  const filtered = (rawList || []).filter(
    (p) =>
      p &&
      p.id !== 'photo-swami-darshan' &&
      p.id !== 'photo-darshan' &&
      !p.title?.toLowerCase().includes('swami darshan')
  );

  const initialLegacyIds = new Set([
    'photo-1',
    'photo-2',
    'photo-3',
    'photo-4',
    'photo-5',
    'photo-swami-blessing',
    'photo-swami-divine',
    'photo-swami-grace',
    'photo-mind-state',
    'photo-self-pleasure',
  ]);

  // Keep custom user-added photos uploaded via the Add Photo feature
  const customUserPhotos = filtered.filter((p) => !initialLegacyIds.has(p.id));

  // Merge INITIAL_PHOTOS with any user custom photos
  const combined = [...INITIAL_PHOTOS, ...customUserPhotos];

  return combined.map((p, idx) => ({
    ...p,
    title: `Photo ${idx + 1}`,
  }));
};

export function App() {
  // Dual-layer state - initial load from fast LocalStorage
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const loaded = getInitialFromLocalStorage<VideoItem[]>(STORAGE_KEY_VIDEOS, INITIAL_VIDEOS);
    if (!loaded || loaded.length === 0) return INITIAL_VIDEOS;
    const uniqueVideos = new Map<string, VideoItem>();
    [...INITIAL_VIDEOS, ...loaded].forEach((video) => uniqueVideos.set(video.youtubeId || video.id, video));
    return Array.from(uniqueVideos.values());
  });

  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    const loaded = getInitialFromLocalStorage<PhotoItem[]>(STORAGE_KEY_PHOTOS, INITIAL_PHOTOS);
    return cleanAndSequencePhotos(loaded);
  });

  const [audios, setAudios] = useState<AudioItem[]>(() => {
    const loaded = getInitialFromLocalStorage<AudioItem[]>(STORAGE_KEY_AUDIOS, INITIAL_AUDIOS);
    const titles: Record<string, string> = {
      'audio-other-drive-1': 'Stability',
      'audio-other-drive-2': 'Marriage – Depression',
      'audio-other-drive-3': 'Maharajis on Marriage',
    };
    const merged = [...INITIAL_AUDIOS, ...loaded].map((audio) => titles[audio.id] ? { ...audio, title: titles[audio.id] } : audio);
    const unique = new Map<string, AudioItem>();
    merged.forEach((audio) => unique.set(audio.driveId || audio.id, audio));
    return Array.from(unique.values());
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    getInitialFromLocalStorage<UserProfile>(STORAGE_KEY_PROFILE, DEFAULT_PROFILE)
  );

  const [appSettings, setAppSettings] = useState<AppSettings>(() =>
    getInitialFromLocalStorage<AppSettings>(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS)
  );

  // Track hydration from IndexedDB so we don't overwrite user records on cold boot
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isInstallPwaOpen, setIsInstallPwaOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null);
  
  // Playback state
  const [activePlaybackVideo, setActivePlaybackVideo] = useState<VideoItem | null>(null);
  const [playbackStartTimestamp, setPlaybackStartTimestamp] = useState<number>(0);
  const [activePlaybackAudio, setActivePlaybackAudio] = useState<AudioItem | null>(null);

  // Filter & Sort State
  const [filterState, setFilterState] = useState<FilterState>(() => {
    return {
      searchQuery: '',
      onlyFavorites: false,
      onlyWatchLater: false,
      mediaType: 'videos',
      sortBy: 'newest',
    };
  });

  // Dual-Layer Hydration: Reconcile state from high-capacity IndexedDB on startup
  useEffect(() => {
    let isMounted = true;

    async function hydrateVaultFromStorage() {
      try {
        await enablePersistentStorage();

        const [idbVideos, idbPhotos, idbAudios, idbProf, idbSettings] = await Promise.all([
          getRecordFromIndexedDb<VideoItem[]>(STORAGE_KEY_VIDEOS),
          getRecordFromIndexedDb<PhotoItem[]>(STORAGE_KEY_PHOTOS),
          getRecordFromIndexedDb<AudioItem[]>(STORAGE_KEY_AUDIOS),
          getRecordFromIndexedDb<UserProfile>(STORAGE_KEY_PROFILE),
          getRecordFromIndexedDb<AppSettings>(STORAGE_KEY_SETTINGS),
        ]);

        if (!isMounted) return;

        // Safely merge records so existing user data is never overwritten or dropped
        if (idbVideos && Array.isArray(idbVideos) && idbVideos.length > 0) {
          setVideos((prev) => {
            const merged = mergeItemsById(prev, idbVideos);
            const uniqueVideos = new Map<string, VideoItem>();
            [...INITIAL_VIDEOS, ...merged].forEach((video) => uniqueVideos.set(video.youtubeId || video.id, video));
            return Array.from(uniqueVideos.values());
          });
        }
        if (idbPhotos && Array.isArray(idbPhotos) && idbPhotos.length > 0) {
          setPhotos((prev) => cleanAndSequencePhotos(mergeItemsById(prev, idbPhotos)));
        }
        if (idbAudios && Array.isArray(idbAudios) && idbAudios.length > 0) {
          setAudios((prev) => mergeItemsById(prev, idbAudios).map((audio) => ({
            ...audio,
            title: audio.id === 'audio-other-drive-1' ? 'Stability'
              : audio.id === 'audio-other-drive-2' ? 'Marriage – Depression'
              : audio.id === 'audio-other-drive-3' ? 'Maharajis on Marriage'
              : audio.title,
          })));
        }
        if (idbProf) {
          setUserProfile((prev) => ({ ...prev, ...idbProf }));
        }
        if (idbSettings) {
          setAppSettings((prev) => ({ ...prev, ...idbSettings }));
        }
      } catch (err) {
        console.warn('[Bhakti Vault] Hydration note:', err);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    hydrateVaultFromStorage();

    return () => {
      isMounted = false;
    };
  }, []);

  // Dual-layer sync: Writes to both LocalStorage AND IndexedDB with quota fallbacks
  useEffect(() => {
    if (!isHydrated) return;
    persistVaultCollection(STORAGE_KEY_VIDEOS, videos);
  }, [videos, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    persistVaultCollection(STORAGE_KEY_PHOTOS, photos);
  }, [photos, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    persistVaultCollection(STORAGE_KEY_AUDIOS, audios);
  }, [audios, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    persistVaultCollection(STORAGE_KEY_PROFILE, userProfile);
  }, [userProfile, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    persistVaultCollection(STORAGE_KEY_SETTINGS, appSettings);
  }, [appSettings, isHydrated]);

  // Unified Media list combining Videos, Photos, and Audio as a Single List
  const unifiedMediaItems: MediaItem[] = useMemo(() => {
    let result: MediaItem[] = [];

    const mappedVideos: MediaItem[] = videos.map((v) => ({ ...v, mediaType: 'video' as const }));
    const mappedPhotos: MediaItem[] = photos.map((p) => ({ ...p, mediaType: 'photo' as const }));
    const mappedAudios: MediaItem[] = audios.map((a) => ({ ...a, mediaType: 'audio' as const }));

    // Filter by active media type (Videos, Photos, or Audio)
    if (filterState.mediaType === 'photos') {
      result = [...mappedPhotos];
    } else if (filterState.mediaType === 'audio') {
      result = [...mappedAudios];
    } else {
      result = [...mappedVideos];
    }

    // Filter by search query
    if (filterState.searchQuery.trim()) {
      const q = filterState.searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.mediaType === 'video' && (
            item.tags?.some((t) => t.toLowerCase().includes(q)) ||
            item.notes?.toLowerCase().includes(q) ||
            item.channelTitle?.toLowerCase().includes(q)
          )) ||
          (item.mediaType === 'audio' && (
            item.artist?.toLowerCase().includes(q) ||
            item.notes?.toLowerCase().includes(q)
          ))
      );
    }

    // Filter by Starred
    if (filterState.onlyFavorites) {
      result = result.filter((item) => item.isFavorite);
    }

    // Filter by Queue / Watch Later (videos only)
    if (filterState.onlyWatchLater) {
      result = result.filter((item) => item.mediaType === 'video' && item.isWatchLater);
    }

    // Sort order
    return result.sort((a, b) => {
      // Prioritize pinned videos
      if (a.mediaType === 'video' && b.mediaType === 'video') {
        const aPinned = !!(a as VideoItem).isPinned;
        const bPinned = !!(b as VideoItem).isPinned;
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
      }

      if (filterState.sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (filterState.sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (filterState.sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      } else if (filterState.sortBy === 'title_desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });
  }, [videos, photos, audios, filterState]);

  // Video Actions
  const handleTogglePinVideo = (id: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isPinned: !v.isPinned } : v))
    );
    const target = videos.find((v) => v.id === id);
    showToast(target?.isPinned ? 'Video unpinned' : 'Video pinned to top 📌');
  };
  const handleAddVideo = (newVideo: Omit<VideoItem, 'id' | 'createdAt' | 'isFavorite' | 'isWatchLater'>) => {
    const videoToAdd: VideoItem = {
      ...newVideo,
      id: 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      isFavorite: false,
      isWatchLater: false,
    };
    setVideos([videoToAdd, ...videos]);
    setIsAddSectionOpen(false);
    showToast(`Video added ✨`);
  };

  const handleUpdateVideo = (updated: VideoItem) => {
    setVideos(videos.map((v) => (v.id === updated.id ? updated : v)));
    if (activePlaybackVideo?.id === updated.id) {
      setActivePlaybackVideo(updated);
    }
  };

  const handleDeleteVideo = (id: string) => {
    setVideos(videos.filter((v) => v.id !== id));
    if (activePlaybackVideo?.id === id) {
      setActivePlaybackVideo(null);
    }
    showToast('Video deleted');
  };

  const handleToggleFavoriteVideo = (id: string) => {
    setVideos(
      videos.map((v) => {
        if (v.id === id) {
          const updated = { ...v, isFavorite: !v.isFavorite };
          if (activePlaybackVideo?.id === id) setActivePlaybackVideo(updated);
          return updated;
        }
        return v;
      })
    );
  };

  const handleToggleWatchLater = (id: string) => {
    setVideos(
      videos.map((v) => {
        if (v.id === id) {
          const updated = { ...v, isWatchLater: !v.isWatchLater };
          if (activePlaybackVideo?.id === id) setActivePlaybackVideo(updated);
          return updated;
        }
        return v;
      })
    );
  };

  const handlePlayVideo = (video: VideoItem, startTimestamp: number = 0) => {
    setActivePlaybackVideo(video);
    setPlaybackStartTimestamp(startTimestamp);
  };

  const handleUpdateNotes = (videoId: string, notes: string) => {
    setVideos(
      videos.map((v) => (v.id === videoId ? { ...v, notes } : v))
    );
    if (activePlaybackVideo?.id === videoId) {
      setActivePlaybackVideo((prev) => (prev ? { ...prev, notes } : null));
    }
  };

  const handleAddTimestamp = (videoId: string, label: string, time: number) => {
    setVideos(
      videos.map((v) => {
        if (v.id === videoId) {
          const timestamps = [...(v.timestamps || []), { label, time }].sort(
            (a, b) => a.time - b.time
          );
          const updated = { ...v, timestamps };
          if (activePlaybackVideo?.id === videoId) setActivePlaybackVideo(updated);
          return updated;
        }
        return v;
      })
    );
  };

  // Photo Actions
  const handleAddPhoto = (newPhoto: Omit<PhotoItem, 'id' | 'createdAt' | 'isFavorite'>) => {
    const photoToAdd: PhotoItem = {
      ...newPhoto,
      id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };
    setPhotos([photoToAdd, ...photos]);
    setIsAddSectionOpen(false);
    showToast(`Photo added ✨`);
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
    if (activePhoto?.id === id) {
      setActivePhoto(null);
    }
  };

  const handleToggleFavoritePhoto = (id: string) => {
    setPhotos(
      photos.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  // Audio Actions
  const handleAddAudio = async (
    newAudio: Omit<AudioItem, 'id' | 'createdAt' | 'isFavorite'>,
    audioBlob?: Blob
  ) => {
    const newId = 'audio_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    let localBlobId: string | undefined;

    if (audioBlob) {
      try {
        localBlobId = `blob_${newId}`;
        await saveLocalAudioFile(localBlobId, audioBlob);
      } catch (err) {
        console.error('Failed to store audio file locally:', err);
      }
    }

    const audioToAdd: AudioItem = {
      ...newAudio,
      id: newId,
      localBlobId,
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };

    setAudios([audioToAdd, ...audios]);
    setIsAddSectionOpen(false);
    showToast(`Audio added ✨`);
  };

  const handleDeleteAudio = async (id: string) => {
    const target = audios.find((a) => a.id === id);
    if (target?.localBlobId) {
      try {
        await deleteLocalAudioFile(target.localBlobId);
      } catch (err) {
        console.warn('Could not remove audio blob:', err);
      }
    }
    setAudios(audios.filter((a) => a.id !== id));
    if (activePlaybackAudio?.id === id) {
      setActivePlaybackAudio(null);
    }
    showToast('Audio track removed');
  };

  const handleToggleFavoriteAudio = (id: string) => {
    setAudios(
      audios.map((a) => (a.id === id ? { ...a, isFavorite: !a.isFavorite } : a))
    );
  };

  const handlePlayAudio = (audio: AudioItem) => {
    if (activePlaybackAudio?.id === audio.id) {
      setActivePlaybackAudio(null);
    } else {
      setActivePlaybackAudio(audio);
    }
  };

  // Toast feedback state
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  // Theme support
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode) || 'light';
  });

  // Switch between Videos, Photos, and Audio
  const handleSwitchMediaType = (type: MediaTypeFilter) => {
    setFilterState((prev) => ({
      ...prev,
      mediaType: type,
    }));
  };

  // Data Management Handlers
  const handleRefreshApp = async () => {
    try {
      const [idbVideos, idbPhotos, idbAudios, idbProf, idbSettings] = await Promise.all([
        getRecordFromIndexedDb<VideoItem[]>(STORAGE_KEY_VIDEOS),
        getRecordFromIndexedDb<PhotoItem[]>(STORAGE_KEY_PHOTOS),
        getRecordFromIndexedDb<AudioItem[]>(STORAGE_KEY_AUDIOS),
        getRecordFromIndexedDb<UserProfile>(STORAGE_KEY_PROFILE),
        getRecordFromIndexedDb<AppSettings>(STORAGE_KEY_SETTINGS),
      ]);

      const lsVids = getInitialFromLocalStorage<VideoItem[]>(STORAGE_KEY_VIDEOS, []);
      const lsPhotos = getInitialFromLocalStorage<PhotoItem[]>(STORAGE_KEY_PHOTOS, []);
      const lsAudios = getInitialFromLocalStorage<AudioItem[]>(STORAGE_KEY_AUDIOS, []);

      setVideos((prev) => {
        const merged = mergeItemsById(prev, mergeItemsById(lsVids, idbVideos || []));
        const uniqueVideos = new Map<string, VideoItem>();
        [...INITIAL_VIDEOS, ...merged].forEach((video) => uniqueVideos.set(video.youtubeId || video.id, video));
        return Array.from(uniqueVideos.values());
      });

      setPhotos((prev) => {
        const merged = mergeItemsById(prev, mergeItemsById(lsPhotos, idbPhotos || []));
        return cleanAndSequencePhotos(merged);
      });

      setAudios((prev) => {
        const merged = mergeItemsById(prev, mergeItemsById(lsAudios, idbAudios || []));
        return merged.length > 0 ? merged : prev;
      });

      if (idbProf) {
        setUserProfile((prev) => ({ ...prev, ...idbProf }));
      }
      if (idbSettings) {
        setAppSettings((prev) => ({ ...prev, ...idbSettings }));
      }
      showToast('Refreshed ✨');
    } catch {
      showToast('Reloaded');
    }
  };

  const handleClearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      showToast('Cache refreshed ✨');
    } catch {
      showToast('Cache cleared ✨');
    }
  };

  const handleDeleteAllData = async () => {
    if (window.confirm('Delete all data? This will reset all your saved items.')) {
      setVideos([]);
      setPhotos([]);
      setAudios([]);
      await clearAllLocalAudioFiles();
      localStorage.removeItem(STORAGE_KEY_VIDEOS);
      localStorage.removeItem(STORAGE_KEY_PHOTOS);
      localStorage.removeItem(STORAGE_KEY_AUDIOS);
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
      localStorage.removeItem(STORAGE_KEY_THEME);
      try {
        const db = await openMasterDatabase();
        const tx = db.transaction(STORE_VAULT_RECORDS, 'readwrite');
        tx.objectStore(STORE_VAULT_RECORDS).clear();
      } catch {
        // Ignore
      }
      setUserProfile(DEFAULT_PROFILE);
      setAppSettings(DEFAULT_SETTINGS);
      setActivePlaybackVideo(null);
      setActivePhoto(null);
      setActivePlaybackAudio(null);
      setIsSidebarOpen(false);
      showToast('All data reset to defaults');
    }
  };

  const handleExportBackup = () => {
    exportVaultDataToFile({
      version: 1,
      exportedAt: new Date().toISOString(),
      videos,
      photos,
      audios,
      userProfile,
      appSettings,
    });
    showToast('Backup file downloaded 📦✨');
  };

  const handleImportBackup = async (file: File) => {
    try {
      const data = await parseVaultBackupFile(file);
      if (Array.isArray(data.videos)) setVideos(data.videos);
      if (Array.isArray(data.photos)) setPhotos(data.photos);
      if (Array.isArray(data.audios)) setAudios(data.audios);
      if (data.userProfile) setUserProfile(data.userProfile);
      if (data.appSettings) setAppSettings(data.appSettings);
      showToast('Backup restored successfully 🎉');
    } catch {
      showToast('Failed to import backup: invalid file');
    }
  };

  return (
    <div className={`min-h-screen flex justify-center selection:bg-rose-200 selection:text-rose-950 font-sans transition-colors duration-300 ${
      filterState.mediaType === 'photos'
        ? 'bg-gradient-to-br from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0] text-emerald-950 selection:bg-emerald-200 selection:text-emerald-950'
        : filterState.mediaType === 'audio'
        ? 'bg-gradient-to-br from-[#fefce8] via-[#fef9c3] to-[#fef08a] text-amber-950 selection:bg-yellow-200 selection:text-amber-950'
        : 'bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fff5f5] text-stone-900'
    }`}>
      {/* Mobile-first Constrained Container max-w-[600px] */}
      <div className={`w-full max-w-[600px] min-h-screen flex flex-col shadow-2xl border-x relative transition-colors duration-300 ${
        filterState.mediaType === 'photos'
          ? 'bg-[#f4fdf6]/95 border-emerald-300/80 text-emerald-950'
          : filterState.mediaType === 'audio'
          ? 'bg-[#fffdf0]/95 border-yellow-300/80 text-amber-950'
          : 'bg-[#fff5f5]/95 border-rose-200 text-stone-900'
      }`}>
        {/* Small Top Header with 3-lines menu, brand & refresh */}
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onRefresh={handleRefreshApp}
          theme={theme}
          mediaType={filterState.mediaType}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-3.5 sm:px-4 py-2 space-y-3 pb-28">
          {/* Top Level Bar with Pill matching user's design */}
          <div className="flex items-center justify-between px-0.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAddSectionOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs hover:border-stone-300 transition-all cursor-pointer select-none group"
              title={isAddSectionOpen ? 'Close Add Section' : 'Open Add Section'}
              aria-expanded={isAddSectionOpen}
            >
              <span className={`w-2 h-2 rounded-full ${
                filterState.mediaType === 'photos'
                  ? 'bg-emerald-500 shadow-emerald-500/50'
                  : filterState.mediaType === 'audio'
                  ? 'bg-amber-400 shadow-amber-500/50'
                  : 'bg-rose-500 shadow-rose-500/50'
              } shadow-xs shrink-0`} />
              
              <span className="text-xs font-bold text-stone-900">
                All
              </span>

              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-700 border border-stone-200/60">
                {unifiedMediaItems.length}
              </span>

              <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${isAddSectionOpen ? 'rotate-180 text-stone-800' : 'group-hover:text-stone-700'}`} />
            </button>

            {filterState.searchQuery && (
              <span className="text-[11px] opacity-80 truncate max-w-[140px] text-stone-600 font-medium">
                Search: "{filterState.searchQuery}"
              </span>
            )}
          </div>

          {/* Inline Add Media Section on same page level (No popup!) */}
          <InlineAddMediaSection
            isOpen={isAddSectionOpen}
            onClose={() => setIsAddSectionOpen(false)}
            mediaType={filterState.mediaType}
            onSelectMediaType={handleSwitchMediaType}
            onAddVideo={handleAddVideo}
            onAddPhoto={handleAddPhoto}
            onAddAudio={handleAddAudio}
          />

          {/* Dynamic Media Feed: Always List View */}
          {unifiedMediaItems.length === 0 ? (
            <div className="py-14 px-4 text-center flex flex-col items-center justify-center space-y-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs ${
                filterState.mediaType === 'photos'
                  ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                  : filterState.mediaType === 'audio'
                  ? 'bg-yellow-200 text-amber-900 border border-yellow-300'
                  : 'bg-rose-100 text-rose-600 border border-rose-200'
              }`}>
                {filterState.mediaType === 'photos' ? (
                  <ImageIcon className="w-6 h-6" />
                ) : filterState.mediaType === 'audio' ? (
                  <Disc3 className="w-6 h-6" />
                ) : (
                  <Youtube className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className={`text-sm font-bold font-serif ${
                  filterState.mediaType === 'photos'
                    ? 'text-emerald-950'
                    : filterState.mediaType === 'audio'
                    ? 'text-amber-950'
                    : 'text-stone-900'
                }`}>
                  {`No ${filterState.mediaType === 'photos' ? 'Photos' : filterState.mediaType === 'audio' ? 'Audio Tracks' : 'Videos'} Found`}
                </h3>
                <p className={`text-xs max-w-[280px] mx-auto ${
                  filterState.mediaType === 'photos'
                    ? 'text-emerald-800/80'
                    : filterState.mediaType === 'audio'
                    ? 'text-amber-800/80'
                    : 'text-stone-500'
                }`}>
                  {filterState.mediaType === 'photos'
                    ? 'Tap the "+" button below to add your sacred photos.'
                    : filterState.mediaType === 'audio'
                    ? 'Tap the "+" button below to add your audio track.'
                    : 'Tap the "+" button below to add a YouTube video.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {unifiedMediaItems.map((item) => {
                if (item.mediaType === 'video') {
                  return (
                    <VideoListItem
                      key={item.id}
                      video={item}
                      onPlay={(v, ts) => handlePlayVideo(v, ts)}
                      onToggleFavorite={handleToggleFavoriteVideo}
                      onToggleWatchLater={handleToggleWatchLater}
                      onTogglePin={handleTogglePinVideo}
                      onEdit={(v) => setEditingVideo(v)}
                      onDelete={handleDeleteVideo}
                    />
                  );
                } else if (item.mediaType === 'photo') {
                  return (
                    <PhotoListItem
                      key={item.id}
                      photo={item}
                      onView={(p) => setActivePhoto(p)}
                      onToggleFavorite={handleToggleFavoritePhoto}
                      onDelete={handleDeletePhoto}
                    />
                  );
                } else if (item.mediaType === 'audio') {
                  return (
                    <AudioListItem
                      key={item.id}
                      audio={item}
                      isPlaying={activePlaybackAudio?.id === item.id}
                      onPlay={handlePlayAudio}
                      onToggleFavorite={handleToggleFavoriteAudio}
                      onDelete={handleDeleteAudio}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
        </main>

        {/* Global Toast Banner */}
        {toastNotice && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-stone-700 text-xs font-semibold animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastNotice}</span>
          </div>
        )}

        {/* Sidebar Drawer Component */}
        <SidebarDrawer
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          theme={theme}
          currentMediaType={filterState.mediaType}
          videoCount={videos.length}
          photoCount={photos.length}
          audioCount={audios.length}
          onOpenInstallPwa={() => setIsInstallPwaOpen(true)}
          onClearCache={handleClearCache}
          onFilterMediaType={handleSwitchMediaType}
        />

        {/* Photo Lightbox Modal */}
        {activePhoto && (
          <PhotoLightboxModal
            photo={activePhoto}
            onClose={() => setActivePhoto(null)}
            onToggleFavorite={handleToggleFavoritePhoto}
            onDelete={handleDeletePhoto}
          />
        )}

        {/* Audio Player Modal */}
        {activePlaybackAudio && (
          <AudioPlayerModal
            audio={activePlaybackAudio}
            onClose={() => setActivePlaybackAudio(null)}
            onToggleFavorite={handleToggleFavoriteAudio}
            onUpdateNotes={(id, notes) => {
              setAudios(audios.map((a) => (a.id === id ? { ...a, notes } : a)));
            }}
          />
        )}

        {/* Install PWA Guide Modal */}
        {isInstallPwaOpen && (
          <InstallPwaModal onClose={() => setIsInstallPwaOpen(false)} />
        )}

        {/* Seeker Profile Modal */}
        {isProfileModalOpen && (
          <ProfileModal
            userProfile={userProfile}
            onSave={(profile) => setUserProfile(profile)}
            onClose={() => setIsProfileModalOpen(false)}
          />
        )}

        {/* App Settings Modal */}
        {isSettingsModalOpen && (
          <SettingsModal
            settings={appSettings}
            onSave={(settings) => setAppSettings(settings)}
            onClose={() => setIsSettingsModalOpen(false)}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            videoCount={videos.length}
            photoCount={photos.length}
            audioCount={audios.length}
          />
        )}

        {/* Modern Floating Glassmorphism Footer: Media Tabs | + */}
        <FloatingGlassFooter
          currentMediaType={filterState.mediaType}
          onSelectMediaType={handleSwitchMediaType}
          onOpenPlusMenu={() => {
            setIsAddSectionOpen((prev) => !prev);
          }}
          isAddSectionOpen={isAddSectionOpen}
          videoCount={videos.length}
          photoCount={photos.length}
          audioCount={audios.length}
          theme={theme}
        />

        {/* Video Player Modal (for playback) */}
        {activePlaybackVideo && (
          <VideoPlayerModal
            video={activePlaybackVideo}
            startTimestamp={playbackStartTimestamp}
            onClose={() => setActivePlaybackVideo(null)}
            onToggleFavorite={handleToggleFavoriteVideo}
            onToggleWatchLater={handleToggleWatchLater}
            onUpdateNotes={handleUpdateNotes}
            onAddTimestamp={handleAddTimestamp}
          />
        )}

        {/* Edit Video Modal */}
        {editingVideo && (
          <EditVideoModal
            video={editingVideo}
            onSave={handleUpdateVideo}
            onClose={() => setEditingVideo(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
