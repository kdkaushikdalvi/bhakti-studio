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
  ViewMode,
  UserProfile,
  AppSettings,
  ThemeMode,
} from './types';
import { VideoCard } from './components/VideoCard';
import { VideoListItem } from './components/VideoListItem';
import { PhotoCard } from './components/PhotoCard';
import { PhotoListItem } from './components/PhotoListItem';
import { AudioCard } from './components/AudioCard';
import { AudioListItem } from './components/AudioListItem';
import { AudioPlayerModal } from './components/AudioPlayerModal';
import { SplitPlayerView } from './components/SplitPlayerView';
import { Navbar } from './components/Navbar';
import { FloatingGlassFooter } from './components/FloatingGlassFooter';
import { AppleAddMediaBottomSheet } from './components/AppleAddMediaBottomSheet';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { EditVideoModal } from './components/EditVideoModal';
import { PhotoLightboxModal } from './components/PhotoLightboxModal';
import { SidebarDrawer } from './components/SidebarDrawer';
import { InstallPwaModal } from './components/InstallPwaModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { CategorySwitchBottomSheet } from './components/CategorySwitchBottomSheet';
import { CategoryAccordionFeed } from './components/CategoryAccordionFeed';
import { normalizeCategory, DEFAULT_PRESET_CATEGORIES, translateCategoryToMarathi } from './components/CategoryPillsRow';
import { CategoryInfo } from './types';
import {
  saveLocalAudioFile,
  deleteLocalAudioFile,
  clearAllLocalAudioFiles,
} from './utils/audioStorage';
import {
  STORAGE_KEY_VIDEOS,
  STORAGE_KEY_PHOTOS,
  STORAGE_KEY_AUDIOS,
  STORAGE_KEY_CATEGORIES,
  STORAGE_KEY_PROFILE,
  STORAGE_KEY_SETTINGS,
  STORAGE_KEY_THEME,
  STORAGE_KEY_VIEW_MODE,
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
  defaultCategory: '',
  defaultVideoCategory: '',
  defaultPhotoCategory: '',
  defaultAudioCategory: '',
  enableVibrations: true,
};

const isAartiCategory = (cat?: string) => {
  if (!cat) return false;
  const n = cat.toLowerCase().trim();
  return n === 'आरती' || n === 'aarti' || n === 'aarati' || n === 'arti';
};

export function App() {
  // Dual-layer state - initial load from fast LocalStorage
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const loaded = getInitialFromLocalStorage<VideoItem[]>(STORAGE_KEY_VIDEOS, INITIAL_VIDEOS);
    if (!loaded || loaded.length === 0) return INITIAL_VIDEOS;
    const targetAartiYtIds = new Set(['Ywd9xNcvAFM', 'Fql0RCRyFO0', 'A4JcViRiWvE']);
    const nonAarti = loaded.filter(
      (v) => !isAartiCategory(v.category) && !targetAartiYtIds.has(v.youtubeId)
    );
    const uniqueVideos = new Map<string, VideoItem>();
    [...INITIAL_VIDEOS, ...nonAarti].forEach((video) => uniqueVideos.set(video.youtubeId || video.id, video));
    return Array.from(uniqueVideos.values());
  });

  const [photos, setPhotos] = useState<PhotoItem[]>(() =>
    getInitialFromLocalStorage<PhotoItem[]>(STORAGE_KEY_PHOTOS, INITIAL_PHOTOS)
  );

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

  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    const loaded = getInitialFromLocalStorage<CategoryInfo[]>(STORAGE_KEY_CATEGORIES, DEFAULT_PRESET_CATEGORIES);
    if (!loaded || loaded.length === 0) return DEFAULT_PRESET_CATEGORIES;
    const legacySystemIds = new Set([
      'cat-all', 'cat-bhajans', 'cat-abhang', 'cat-lectures', 'cat-haripath',
      'cat-stotra', 'cat-meditation', 'cat-mantras', 'cat-darshan', 'cat-katha',
    ]);
    const legacySystemNames = new Set([
      'abhang', 'lecture', 'haripath', 'stotra', 'meditation', 'mantra', 'darshan', 'katha',
    ]);
    const normalized = loaded.filter((cat) =>
      !legacySystemIds.has(cat.id) && !legacySystemNames.has(normalizeCategory(cat.name))
    ).map((cat) => ({
      ...cat,
      name: translateCategoryToMarathi(cat.name),
    }));
    const preferredOrder = DEFAULT_PRESET_CATEGORIES.map((cat) => normalizeCategory(cat.name));
    normalized.sort((a, b) => {
      const aIndex = preferredOrder.indexOf(normalizeCategory(a.name));
      const bIndex = preferredOrder.indexOf(normalizeCategory(b.name));
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    // Keep exactly the six shared system categories available across all media types.
    const existing = new Set(normalized.map((cat) => normalizeCategory(cat.name)));
    return [...normalized, ...DEFAULT_PRESET_CATEGORIES.filter((cat) =>
      !existing.has(normalizeCategory(cat.name)) && cat.id !== 'cat-all'
    )];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    getInitialFromLocalStorage<UserProfile>(STORAGE_KEY_PROFILE, DEFAULT_PROFILE)
  );

  const [appSettings, setAppSettings] = useState<AppSettings>(() =>
    getInitialFromLocalStorage<AppSettings>(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS)
  );

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    getInitialFromLocalStorage<ViewMode>(STORAGE_KEY_VIEW_MODE, 'list')
  );

  // Track hydration from IndexedDB so we don't overwrite user records on cold boot
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState<'video' | 'photo' | 'audio'>('video');
  const [isInstallPwaOpen, setIsInstallPwaOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isCategorySwitchOpen, setIsCategorySwitchOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null);
  
  // Playback state
  const [activePlaybackVideo, setActivePlaybackVideo] = useState<VideoItem | null>(null);
  const [playbackStartTimestamp, setPlaybackStartTimestamp] = useState<number>(0);
  const [activePlaybackAudio, setActivePlaybackAudio] = useState<AudioItem | null>(null);

  // Filter & Sort State
  const [filterState, setFilterState] = useState<FilterState>(() => {
    let initialCat = 'all';
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const pinned = parsed.defaultVideoCategory || parsed.defaultCategory;
        if (pinned) {
          initialCat = pinned;
        }
      }
    } catch {
      // Fallback
    }
    return {
      searchQuery: '',
      selectedCategory: initialCat,
      onlyFavorites: false,
      onlyWatchLater: false,
      mediaType: 'videos',
      sortBy: 'newest',
    };
  });

  // Accordion Interaction Behavior:
  // - Display all categories as accordion sections on the video feed
  // - By default, all accordion sections should be collapsed/closed (null)
  // - Clicking category header expands; clicking again collapses
  // - Only the selected category should expand; others remain collapsed
  // - Preserves expanded/collapsed state across feed navigation
  const [expandedCategory, setExpandedCategory] = useState<string | null>(() => {
    return null;
  });

  const [addModalInitialCategory, setAddModalInitialCategory] = useState<string | undefined>(undefined);
  const autoExpandedOnce = useRef(false);

  useEffect(() => {
    if (expandedCategory || autoExpandedOnce.current) return;
    const mediaCategories = filterState.mediaType === 'audio'
      ? ['निखिलानंद महाराज', 'महाराज', 'प्रभुपाद', 'इतर']
      : filterState.mediaType === 'photos'
      ? ['आरती', 'जेकेपी', 'भक्ती मार्ग', 'कीर्तन', 'भजन', 'इतर']
      : categories.map((category) => category.name).filter((name) => normalizeCategory(name) !== 'all');
    const firstWithItems = mediaCategories.find((category) => {
      const normalized = normalizeCategory(category);
      return filterState.mediaType === 'audio'
        ? audios.some((item) => normalizeCategory(item.category || '') === normalized)
        : filterState.mediaType === 'photos'
        ? photos.some((item) => normalizeCategory(item.category || '') === normalized)
        : videos.some((item) => normalizeCategory(item.category || '') === normalized);
    });
    if (firstWithItems) {
      autoExpandedOnce.current = true;
      setExpandedCategory(firstWithItems);
    }
  }, [audios, photos, videos, categories, filterState.mediaType, expandedCategory]);

  const handleToggleCategory = useCallback((categoryName: string) => {
    setExpandedCategory((prev) => {
      const current = prev ? prev.split('|').filter(Boolean) : [];
      const target = normalizeCategory(categoryName);
      const nextItems = current.some((item) => normalizeCategory(item) === target)
        ? current.filter((item) => normalizeCategory(item) !== target)
        : [...current, categoryName];
      const next = nextItems.length ? nextItems.join('|') : null;
      try {
        if (next) {
          sessionStorage.setItem('bhakti_expanded_category_video', next);
        } else {
          sessionStorage.removeItem('bhakti_expanded_category_video');
        }
      } catch {
        // Fallback
      }
      return next;
    });
  }, []);

  const handleAddVideoToCategory = (catName: string) => {
    setAddModalTab('video');
    setAddModalInitialCategory(catName);
    setIsAddModalOpen(true);
  };

  // Dual-Layer Hydration: Reconcile state from high-capacity IndexedDB on startup
  useEffect(() => {
    let isMounted = true;

    async function hydrateVaultFromStorage() {
      try {
        await enablePersistentStorage();

        const [idbVideos, idbPhotos, idbAudios, idbCats, idbProf, idbSettings] = await Promise.all([
          getRecordFromIndexedDb<VideoItem[]>(STORAGE_KEY_VIDEOS),
          getRecordFromIndexedDb<PhotoItem[]>(STORAGE_KEY_PHOTOS),
          getRecordFromIndexedDb<AudioItem[]>(STORAGE_KEY_AUDIOS),
          getRecordFromIndexedDb<CategoryInfo[]>(STORAGE_KEY_CATEGORIES),
          getRecordFromIndexedDb<UserProfile>(STORAGE_KEY_PROFILE),
          getRecordFromIndexedDb<AppSettings>(STORAGE_KEY_SETTINGS),
        ]);

        if (!isMounted) return;

        // Safely merge records so existing user data is never overwritten or dropped
        if (idbVideos && Array.isArray(idbVideos) && idbVideos.length > 0) {
          setVideos((prev) => {
            const merged = mergeItemsById(prev, idbVideos);
            const targetAartiYtIds = new Set(['Ywd9xNcvAFM', 'Fql0RCRyFO0', 'A4JcViRiWvE']);
            const nonAarti = merged.filter(
              (v) => !isAartiCategory(v.category) && !targetAartiYtIds.has(v.youtubeId)
            );
            const uniqueVideos = new Map<string, VideoItem>();
            [...INITIAL_VIDEOS, ...nonAarti].forEach((video) => uniqueVideos.set(video.youtubeId || video.id, video));
            return Array.from(uniqueVideos.values());
          });
        }
        if (idbPhotos && Array.isArray(idbPhotos) && idbPhotos.length > 0) {
          setPhotos((prev) => mergeItemsById(prev, idbPhotos));
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
        if (idbCats && Array.isArray(idbCats) && idbCats.length > 0) {
          const marathiIdbCats = idbCats.map((cat) => ({
            ...cat,
            name: translateCategoryToMarathi(cat.name),
          }));
          setCategories((prev) => mergeItemsById(prev, marathiIdbCats));
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
    persistVaultCollection(STORAGE_KEY_CATEGORIES, categories);
  }, [categories, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    persistVaultCollection(STORAGE_KEY_PROFILE, userProfile);
  }, [userProfile, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    persistVaultCollection(STORAGE_KEY_SETTINGS, appSettings);
  }, [appSettings, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    persistVaultCollection(STORAGE_KEY_VIEW_MODE, viewMode);
  }, [viewMode, isHydrated]);

  // Unified Media list combining Videos, Photos, and Audio
  const unifiedMediaItems: MediaItem[] = useMemo(() => {
    let result: MediaItem[] = [];

    const mappedVideos: MediaItem[] = videos.map((v) => ({ ...v, mediaType: 'video' as const }));
    const mappedPhotos: MediaItem[] = photos.map((p) => ({ ...p, mediaType: 'photo' as const }));
    const mappedAudios: MediaItem[] = audios.map((a) => ({ ...a, mediaType: 'audio' as const }));

    // Filter by media type (Never mix Videos, Photos, and Audio in the same view)
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

    // Filter by Category (All or specific category)
    if (filterState.selectedCategory && normalizeCategory(filterState.selectedCategory) !== 'all') {
      const selectedNorm = normalizeCategory(filterState.selectedCategory);
      result = result.filter((item) => {
        if (normalizeCategory(item.category || '') === selectedNorm) return true;
        if (item.mediaType === 'video' && item.tags?.some((t) => normalizeCategory(t) === selectedNorm)) {
          return true;
        }
        return false;
      });
    }

    // Filter by Queue / Watch Later (videos only)
    if (filterState.onlyWatchLater) {
      result = result.filter((item) => item.mediaType === 'video' && item.isWatchLater);
    }

    // Sort order
    return result.sort((a, b) => {
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

  // Counts
  const favoriteCount = useMemo(() => {
    const vidFavs = videos.filter((v) => v.isFavorite).length;
    const photoFavs = photos.filter((p) => p.isFavorite).length;
    const audioFavs = audios.filter((a) => a.isFavorite).length;
    return vidFavs + photoFavs + audioFavs;
  }, [videos, photos, audios]);

  const watchLaterCount = useMemo(() => {
    return videos.filter((v) => v.isWatchLater).length;
  }, [videos]);

  const activeCategoriesForFeed = useMemo(() => {
    if (normalizeCategory(filterState.selectedCategory) === 'all') {
      return categories;
    }
    return categories.filter((c) => normalizeCategory(c.name) === normalizeCategory(filterState.selectedCategory));
  }, [categories, filterState.selectedCategory]);

  // Category Actions
  const handleAddCategory = (newCat: CategoryInfo) => {
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${newCat.name}" added ✨`);
  };

  const handleUpdateCategory = (id: string, updated: Partial<CategoryInfo>, previousName: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );

    // If category name changed, cascade rename to all videos, photos, and audios
    if (updated.name && updated.name !== previousName) {
      const prevNorm = normalizeCategory(previousName);
      const nextName = updated.name;

      setVideos((prevVideos) =>
        prevVideos.map((v) =>
          normalizeCategory(v.category || '') === prevNorm
            ? { ...v, category: nextName }
            : v
        )
      );

      setPhotos((prevPhotos) =>
        prevPhotos.map((p) =>
          normalizeCategory(p.category || '') === prevNorm
            ? { ...p, category: nextName }
            : p
        )
      );

      setAudios((prevAudios) =>
        prevAudios.map((a) =>
          normalizeCategory(a.category || '') === prevNorm
            ? { ...a, category: nextName }
            : a
        )
      );

      // If active filter is on this category, update filter selection
      if (normalizeCategory(filterState.selectedCategory) === prevNorm) {
        setFilterState((prev) => ({
          ...prev,
          selectedCategory: nextName,
        }));
      }
    }

    showToast(`Category updated ✨`);
  };

  const handleDeleteCategory = (catToDelete: CategoryInfo) => {
    if (DEFAULT_PRESET_CATEGORIES.some((cat) => cat.id === catToDelete.id)) {
      showToast('Default categories cannot be deleted');
      return;
    }
    const norm = normalizeCategory(catToDelete.name);
    const assigned = videos.filter((v) => normalizeCategory(v.category || '') === norm).length
      + photos.filter((p) => normalizeCategory(p.category || '') === norm).length
      + audios.filter((a) => normalizeCategory(a.category || '') === norm).length;
    if (assigned > 0) {
      window.alert(`Cannot delete "${catToDelete.name}". Move ${assigned} assigned media item${assigned === 1 ? '' : 's'} to another category first.`);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== catToDelete.id));

    // Reset filter if deleting active category
    if (normalizeCategory(filterState.selectedCategory) === normalizeCategory(catToDelete.name)) {
      setFilterState((prev) => ({
        ...prev,
        selectedCategory: 'all',
      }));
    }

    showToast(`Category "${catToDelete.name}" deleted`);
  };

  // Video Actions
  const handleAddVideo = (newVideo: Omit<VideoItem, 'id' | 'createdAt' | 'isFavorite' | 'isWatchLater'>) => {
    const videoToAdd: VideoItem = {
      ...newVideo,
      id: 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      isFavorite: false,
      isWatchLater: false,
    };
    setVideos([videoToAdd, ...videos]);
    setIsAddModalOpen(false);
    setAddModalInitialCategory(undefined);
    if (videoToAdd.category) {
      setExpandedCategory(videoToAdd.category);
      try {
        sessionStorage.setItem('bhakti_expanded_category_video', videoToAdd.category);
      } catch {
        // Ignore
      }
    }
    showToast(`Video added to ${videoToAdd.category || 'Vault'} ✨`);
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

  // Photo Actions
  const handleAddPhoto = (photoData: Omit<PhotoItem, 'id' | 'createdAt' | 'isFavorite'>) => {
    const photoToAdd: PhotoItem = {
      ...photoData,
      id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };
    setPhotos([photoToAdd, ...photos]);
    setIsAddModalOpen(false);
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
    if (activePhoto?.id === id) {
      setActivePhoto(null);
    }
  };

  const handleToggleFavoritePhoto = (id: string) => {
    setPhotos(
      photos.map((p) => {
        if (p.id === id) {
          const updated = { ...p, isFavorite: !p.isFavorite };
          if (activePhoto?.id === id) setActivePhoto(updated);
          return updated;
        }
        return p;
      })
    );
  };

  // Audio Actions
  const handleAddAudio = async (
    audioData: Omit<AudioItem, 'id' | 'createdAt' | 'isFavorite'>,
    audioBlob?: Blob
  ) => {
    const newId = 'audio_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    if (audioBlob) {
      try {
        await saveLocalAudioFile(newId, audioBlob);
      } catch (err) {
        console.warn('Failed to save audio file to IndexedDB', err);
      }
    }

    const audioToAdd: AudioItem = {
      ...audioData,
      id: newId,
      localBlobId: audioBlob ? newId : undefined,
      sourceType: audioBlob ? 'local' : (audioData.sourceType || 'drive'),
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };
    setAudios([audioToAdd, ...audios]);
    setIsAddModalOpen(false);
    showToast(`Audio "${audioData.title}" added to Vault ✨`);
  };

  const handleDeleteAudio = async (id: string) => {
    setAudios(audios.filter((a) => a.id !== id));
    try {
      await deleteLocalAudioFile(id);
    } catch {
      // Ignore
    }
    if (activePlaybackAudio?.id === id) {
      setActivePlaybackAudio(null);
    }
    showToast('Audio deleted');
  };

  const handleToggleFavoriteAudio = (id: string) => {
    setAudios(
      audios.map((a) => {
        if (a.id === id) {
          const updated = { ...a, isFavorite: !a.isFavorite };
          if (activePlaybackAudio?.id === id) setActivePlaybackAudio(updated);
          return updated;
        }
        return a;
      })
    );
  };

  const handlePlayAudio = (audio: AudioItem) => {
    setActivePlaybackAudio(audio);
  };

  // Video Notes & Timestamps
  const handleUpdateNotes = (id: string, notes: string) => {
    setVideos(
      videos.map((v) => {
        if (v.id === id) {
          const updated = { ...v, notes };
          if (activePlaybackVideo?.id === id) setActivePlaybackVideo(updated);
          return updated;
        }
        return v;
      })
    );
  };

  const handleAddTimestamp = (id: string, timestamp: { time: number; label: string }) => {
    setVideos(
      videos.map((v) => {
        if (v.id === id) {
          const updated = {
            ...v,
            timestamps: [...(v.timestamps || []), timestamp],
          };
          if (activePlaybackVideo?.id === id) setActivePlaybackVideo(updated);
          return updated;
        }
        return v;
      })
    );
  };

  // Playback Trigger
  const handlePlayVideo = (video: VideoItem, startTimestamp = 0) => {
    setActivePlaybackVideo(video);
    setPlaybackStartTimestamp(startTimestamp);
  };

  // Theme State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme === 'light' || savedTheme === 'warm' || savedTheme === 'dark' || savedTheme === 'blue') {
        return savedTheme;
      }
    } catch {
      // Fallback
    }
    return 'blue';
  });

  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleToggleTheme = (specificTheme?: ThemeMode) => {
    let nextTheme: ThemeMode;
    if (specificTheme) {
      nextTheme = specificTheme;
    } else {
      nextTheme =
        theme === 'blue'
          ? 'warm'
          : theme === 'warm'
          ? 'light'
          : theme === 'light'
          ? 'dark'
          : 'blue';
    }
    setTheme(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
    } catch {
      // Ignore
    }
    showToast(`Switched to ${nextTheme.toUpperCase()} theme ✨`);
  };

  // Pin category as default on app launch separately for Videos, Photos & Audio
  const handleSetDefaultCategory = (catName: string) => {
    const isPhoto = filterState.mediaType === 'photos';
    const isAudio = filterState.mediaType === 'audio';
    const updatedSettings: AppSettings = {
      ...appSettings,
      ...(isPhoto
        ? { defaultPhotoCategory: catName }
        : isAudio
        ? { defaultAudioCategory: catName }
        : { defaultVideoCategory: catName, defaultCategory: catName }),
    };
    setAppSettings(updatedSettings);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updatedSettings));
    } catch {
      // Ignore
    }
    const mediaLabel = isPhoto ? 'Photos' : isAudio ? 'Audio' : 'Videos';
    if (catName && catName !== 'all') {
      showToast(`Pinned "${catName}" as Default for ${mediaLabel} 📌`);
    } else {
      showToast(`Cleared default category pin for ${mediaLabel} 📌`);
    }
  };

  // Switch between Videos, Photos, and Audio (and load its corresponding pinned category)
  const handleSwitchMediaType = (type: MediaTypeFilter) => {
    autoExpandedOnce.current = false;
    setExpandedCategory(null);
    setFilterState((prev) => ({
      ...prev,
      mediaType: type,
      selectedCategory: 'all',
    }));
  };

  // Data Management Handlers
  const handleRefreshApp = async () => {
    try {
      // Re-read and reconcile from both localStorage and IndexedDB
      const [idbVideos, idbPhotos, idbAudios, idbCats, idbProf, idbSettings] = await Promise.all([
        getRecordFromIndexedDb<VideoItem[]>(STORAGE_KEY_VIDEOS),
        getRecordFromIndexedDb<PhotoItem[]>(STORAGE_KEY_PHOTOS),
        getRecordFromIndexedDb<AudioItem[]>(STORAGE_KEY_AUDIOS),
        getRecordFromIndexedDb<CategoryInfo[]>(STORAGE_KEY_CATEGORIES),
        getRecordFromIndexedDb<UserProfile>(STORAGE_KEY_PROFILE),
        getRecordFromIndexedDb<AppSettings>(STORAGE_KEY_SETTINGS),
      ]);

      const lsVids = getInitialFromLocalStorage<VideoItem[]>(STORAGE_KEY_VIDEOS, []);
      const lsPhotos = getInitialFromLocalStorage<PhotoItem[]>(STORAGE_KEY_PHOTOS, []);
      const lsAudios = getInitialFromLocalStorage<AudioItem[]>(STORAGE_KEY_AUDIOS, []);

      // Merge safely so existing user items are NEVER dropped on refresh
      setVideos((prev) => {
        const merged = mergeItemsById(prev, mergeItemsById(lsVids, idbVideos || []));
        return merged.length > 0 ? merged : prev;
      });

      setPhotos((prev) => {
        const merged = mergeItemsById(prev, mergeItemsById(lsPhotos, idbPhotos || []));
        return merged.length > 0 ? merged : prev;
      });

      setAudios((prev) => {
        const merged = mergeItemsById(prev, mergeItemsById(lsAudios, idbAudios || []));
        return merged.length > 0 ? merged : prev;
      });

      if (idbCats && idbCats.length > 0) {
        setCategories((prev) => mergeItemsById(prev, idbCats));
      }
      if (idbProf) {
        setUserProfile((prev) => ({ ...prev, ...idbProf }));
      }
      if (idbSettings) {
        setAppSettings((prev) => ({ ...prev, ...idbSettings }));
      }

      showToast('Vault refreshed & media verified safe ✨');
    } catch {
      showToast('Vault refreshed ✨');
    }
  };

  const handleClearCache = async () => {
    try {
      // Clear temporary browser/PWA caches only; preserve vault media and settings.
      sessionStorage.clear();
      if ('caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister().catch(() => false)));
      }
      showToast('Temporary cache cleared. Your media is safe 🧹✨');
      window.setTimeout(() => {
        const separator = window.location.pathname.includes('?') ? '&' : '?';
        window.location.href = `${window.location.pathname}${separator}cacheBust=${Date.now()}`;
      }, 250);
    } catch {
      showToast('Cache could not be fully cleared');
    }
  };

  const handleDeleteAllData = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to clear ALL media and saved settings? This cannot be undone.'
    );
    if (confirmation) {
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
      categories,
      userProfile,
      appSettings,
    });
    showToast('Vault backup file downloaded 📦✨');
  };

  const handleImportBackup = async (file: File) => {
    try {
      const data = await parseVaultBackupFile(file);
      if (Array.isArray(data.videos)) setVideos(data.videos);
      if (Array.isArray(data.photos)) setPhotos(data.photos);
      if (Array.isArray(data.audios)) setAudios(data.audios);
      if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
      if (data.userProfile) setUserProfile(data.userProfile);
      if (data.appSettings) setAppSettings(data.appSettings);
      showToast('Vault backup restored successfully 🎉');
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
          {/* Active Category & Item Count Status Bar */}
          <div className="flex items-center justify-between px-1 text-xs opacity-75 font-medium">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                filterState.mediaType === 'photos'
                  ? 'bg-emerald-500 shadow-emerald-500/50'
                  : filterState.mediaType === 'audio'
                  ? 'bg-amber-400 shadow-amber-500/50'
                  : 'bg-rose-500 shadow-rose-500/50'
              } shadow-xs`} />
              <span>
                {filterState.mediaType === 'videos' ? (
                  expandedCategory ? (
                    <>
                      <span className="font-semibold text-rose-700">{expandedCategory.split('|').join(' • ')}</span>
                      {' • '}
                      {videos.filter((v) => expandedCategory.split('|').some((category) => normalizeCategory(v.category || '') === normalizeCategory(category))).length} videos
                    </>
                  ) : (
                    <>
                      {categories.filter((c) => normalizeCategory(c.name) !== 'all').length} categories • {videos.length} videos (all closed)
                    </>
                  )
                ) : (
                  <>
                    {filterState.selectedCategory && normalizeCategory(filterState.selectedCategory) !== 'all'
                      ? `${translateCategoryToMarathi(filterState.selectedCategory)} • `
                      : ''}
                    {unifiedMediaItems.length} {filterState.mediaType === 'photos'
                      ? (unifiedMediaItems.length === 1 ? 'photo' : 'photos')
                      : (unifiedMediaItems.length === 1 ? 'audio track' : 'audio tracks')}
                  </>
                )}
              </span>
            </span>
            {filterState.searchQuery && (
              <span className="text-[11px] opacity-80 truncate max-w-[140px]">
                Search: "{filterState.searchQuery}"
              </span>
            )}
          </div>

          {/* Dynamic Media Feed: Accordion Category Feed for Videos / Grid / List / Split */}
          {filterState.mediaType === 'videos' ? (
            viewMode === 'split' ? (
              <SplitPlayerView
                videos={
                  unifiedMediaItems.filter(
                    (i): i is VideoItem & { mediaType: 'video' } => i.mediaType === 'video'
                  ).length > 0
                    ? (unifiedMediaItems.filter(
                        (i): i is VideoItem & { mediaType: 'video' } => i.mediaType === 'video'
                      ) as VideoItem[])
                    : videos
                }
                activeVideo={activePlaybackVideo}
                onSelectVideo={(v, ts) => handlePlayVideo(v, ts)}
                onToggleFavorite={handleToggleFavoriteVideo}
                onToggleWatchLater={handleToggleWatchLater}
                onUpdateNotes={handleUpdateNotes}
                onAddTimestamp={handleAddTimestamp}
              />
            ) : (
              <CategoryAccordionFeed
                categories={activeCategoriesForFeed}
                videos={videos}
                expandedCategory={normalizeCategory(filterState.selectedCategory) === 'all'
                  ? expandedCategory
                  : filterState.selectedCategory}
                onToggleCategory={handleToggleCategory}
                viewMode={viewMode}
                searchQuery={filterState.searchQuery}
                onlyFavorites={filterState.onlyFavorites}
                onlyWatchLater={filterState.onlyWatchLater}
                sortBy={filterState.sortBy}
                onPlayVideo={(v, ts) => handlePlayVideo(v, ts)}
                onToggleFavoriteVideo={handleToggleFavoriteVideo}
                onToggleWatchLater={handleToggleWatchLater}
                onEditVideo={(v) => setEditingVideo(v)}
                onDeleteVideo={handleDeleteVideo}
                onAddVideoToCategory={handleAddVideoToCategory}
              />
            )
          ) : filterState.mediaType === 'photos' ? (
            <div className="space-y-2.5">
              {(normalizeCategory(filterState.selectedCategory) === 'all'
                ? ['आरती', 'जेकेपी', 'भक्ती मार्ग', 'कीर्तन', 'भजन', 'इतर'].sort((a, b) => photos.filter((p) => normalizeCategory(p.category || '') === normalizeCategory(b)).length - photos.filter((p) => normalizeCategory(p.category || '') === normalizeCategory(a)).length)
                : [translateCategoryToMarathi(filterState.selectedCategory)]
              ).map((categoryName) => {
                const items = photos.filter((p) => normalizeCategory(p.category || '') === normalizeCategory(categoryName));
                const isExpanded = !!expandedCategory?.split('|').some((name) => normalizeCategory(name) === normalizeCategory(categoryName));
                return <div key={categoryName} className={`rounded-2xl border overflow-hidden transition-colors ${isExpanded ? 'border-emerald-400 bg-emerald-100/90 shadow-2xs' : 'border-emerald-200/80 bg-emerald-50/70'}`}>
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleCategory(categoryName); }} aria-expanded={isExpanded} className="w-full flex items-center justify-between px-4 py-4 text-left cursor-pointer">
                    <span className="font-sans font-bold text-emerald-950">{categoryName}</span>
                    <span className="flex items-center gap-2"><span className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-300 bg-emerald-200/70 text-xs font-bold text-emerald-900">{items.length}</span><ChevronDown className={`w-5 h-5 text-emerald-800 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></span>
                  </button>
                  {isExpanded && items.length > 0 && <div className="px-3 pb-3 space-y-2">{items.map((item) => <PhotoListItem key={item.id} photo={item} onView={(p) => setActivePhoto(p)} onToggleFavorite={handleToggleFavoritePhoto} onDelete={handleDeletePhoto} />)}</div>}
                </div>;
              })}
            </div>
          ) : filterState.mediaType === 'audio' ? (
            <div className="space-y-2.5">
              {(normalizeCategory(filterState.selectedCategory) === 'all'
                ? ['निखिलानंद महाराज', 'महाराज', 'प्रभुपाद', 'इतर'].sort((a, b) => audios.filter((x) => normalizeCategory(x.category || '') === normalizeCategory(b)).length - audios.filter((x) => normalizeCategory(x.category || '') === normalizeCategory(a)).length)
                : [translateCategoryToMarathi(filterState.selectedCategory)]
              ).map((categoryName) => {
                const items = audios.filter((a) => normalizeCategory(a.category || '') === normalizeCategory(categoryName));
                const isExpanded = !!expandedCategory?.split('|').some((name) => normalizeCategory(name) === normalizeCategory(categoryName));
                return <div key={categoryName} className={`rounded-2xl border overflow-hidden transition-colors ${isExpanded ? 'border-yellow-400 bg-yellow-100/90 shadow-2xs' : 'border-yellow-200/80 bg-yellow-50/70'}`}>
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleCategory(categoryName); }} aria-expanded={isExpanded} className="w-full flex items-center justify-between px-4 py-4 text-left cursor-pointer">
                    <span className="font-sans font-bold text-amber-950">{categoryName}</span>
                    <span className="flex items-center gap-2"><span className="w-8 h-8 flex items-center justify-center rounded-full border border-yellow-300 bg-yellow-200/70 text-xs font-bold text-amber-900">{items.length}</span><ChevronDown className={`w-5 h-5 text-amber-800 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></span>
                  </button>
                  {isExpanded && items.length > 0 && <div className="px-3 pb-3 space-y-2">{items.map((item) => <AudioListItem key={item.id} audio={item} isPlaying={activePlaybackAudio?.id === item.id} onPlay={handlePlayAudio} onToggleFavorite={handleToggleFavoriteAudio} onDelete={handleDeleteAudio} />)}</div>}
                </div>;
              })}
            </div>
          ) : unifiedMediaItems.length === 0 ? (
            <div className="py-14 px-4 text-center flex flex-col items-center justify-center space-y-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs ${
                filterState.mediaType === 'photos'
                  ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                  : filterState.mediaType === 'audio'
                  ? 'bg-yellow-200 text-amber-900 border border-yellow-300'
                  : 'bg-amber-500/10 text-amber-400'
              }`}>
                {filterState.mediaType === 'photos' ? (
                  <ImageIcon className="w-6 h-6" />
                ) : (
                  <Disc3 className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className={`text-sm font-bold font-serif ${
                  filterState.mediaType === 'photos'
                    ? 'text-emerald-950'
                    : filterState.mediaType === 'audio'
                    ? 'text-amber-950'
                    : 'text-stone-100'
                }`}>
                  {filterState.selectedCategory && normalizeCategory(filterState.selectedCategory) !== 'all'
                    ? `No ${filterState.mediaType === 'photos' ? 'Photos' : 'Audio Tracks'} in "${translateCategoryToMarathi(filterState.selectedCategory)}"`
                    : `No ${filterState.mediaType === 'photos' ? 'Photos' : 'Audio Tracks'} Found`}
                </h3>
                <p className={`text-xs max-w-[280px] mx-auto ${
                  filterState.mediaType === 'photos'
                    ? 'text-emerald-800/80'
                    : filterState.mediaType === 'audio'
                    ? 'text-amber-800/80'
                    : 'text-stone-400'
                }`}>
                  {filterState.selectedCategory && normalizeCategory(filterState.selectedCategory) !== 'all'
                    ? `Tap "सर्व" to view all items, or tap "+" below to add sacred ${filterState.mediaType === 'photos' ? 'photos' : 'audio'} to this category.`
                    : filterState.mediaType === 'photos'
                    ? `Tap the "+" button below to add your sacred photos.`
                    : `Tap the "+" button below to paste your Google Drive audio track link.`}
                </p>
              </div>
              {filterState.selectedCategory && normalizeCategory(filterState.selectedCategory) !== 'all' && (
                <button
                  onClick={() =>
                    setFilterState((prev) => ({
                      ...prev,
                      selectedCategory: 'all',
                    }))
                  }
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    filterState.mediaType === 'photos'
                      ? 'text-emerald-950 bg-emerald-200 border-emerald-400 hover:bg-emerald-300'
                      : filterState.mediaType === 'audio'
                      ? 'text-amber-950 bg-yellow-200 border-yellow-400 hover:bg-yellow-300'
                      : 'text-orange-400 bg-stone-800/80 border-stone-700 hover:bg-stone-750'
                  }`}
                >
                  Show All Categories
                </button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2.5">
              {unifiedMediaItems.map((item) => {
                if (item.mediaType === 'audio') {
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
                }
                return null;
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {unifiedMediaItems.map((item) => {
                if (item.mediaType === 'audio') {
                  return (
                    <AudioCard
                      key={item.id}
                      audio={item}
                      isPlaying={activePlaybackAudio?.id === item.id}
                      onPlay={handlePlayAudio}
                      onToggleFavorite={handleToggleFavoriteAudio}
                      onDelete={handleDeleteAudio}
                    />
                  );
                } else if (item.mediaType === 'photo') {
                  return (
                    <PhotoCard
                      key={item.id}
                      photo={item}
                      onView={(p) => setActivePhoto(p)}
                      onToggleFavorite={handleToggleFavoritePhoto}
                      onDelete={handleDeletePhoto}
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
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode)}
          currentMediaType={filterState.mediaType}
          videoCount={videos.length}
          photoCount={photos.length}
          audioCount={audios.length}
          onOpenInstallPwa={() => setIsInstallPwaOpen(true)}
          onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
          onRefreshApp={handleRefreshApp}
          onClearCache={handleClearCache}
          onDeleteAllData={handleDeleteAllData}
          onFilterMediaType={handleSwitchMediaType}
        />

        {/* Category Manager Modal (Add, Edit, Rename, Delete categories) */}
        {isCategoryManagerOpen && (
          <CategoryManagerModal
            categories={categories}
            videos={videos}
            photos={photos}
            audios={audios}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onClose={() => setIsCategoryManagerOpen(false)}
          />
        )}

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
            categories={categories}
            onSave={(settings) => setAppSettings(settings)}
            onClose={() => setIsSettingsModalOpen(false)}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            videoCount={videos.length}
            photoCount={photos.length}
            audioCount={audios.length}
          />
        )}

        {/* Apple-style Sleek Add Media Bottom Sheet */}
        <AppleAddMediaBottomSheet
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setAddModalInitialCategory(undefined);
          }}
          onAddVideo={handleAddVideo}
          onAddPhoto={handleAddPhoto}
          onAddAudio={handleAddAudio}
          initialTab={addModalTab}
          initialCategory={addModalInitialCategory}
          categories={categories}
        />

        {/* Quick Category Switcher & Pin Bottom Sheet */}
        <CategorySwitchBottomSheet
          isOpen={isCategorySwitchOpen}
          onClose={() => setIsCategorySwitchOpen(false)}
          categories={categories}
          selectedCategory={filterState.selectedCategory}
          onSelectCategory={(cat) => {
            setFilterState((prev) => ({
              ...prev,
              selectedCategory: cat,
            }));
            if (filterState.mediaType === 'videos') {
              if (normalizeCategory(cat) === 'all') {
                setExpandedCategory(null);
                try {
                  sessionStorage.removeItem('bhakti_expanded_category_video');
                } catch {
                  // Ignore
                }
              } else {
                setExpandedCategory(cat);
                try {
                  sessionStorage.setItem('bhakti_expanded_category_video', cat);
                } catch {
                  // Ignore
                }
              }
            }
          }}
          defaultCategory={
            filterState.mediaType === 'photos'
              ? appSettings.defaultPhotoCategory || ''
              : filterState.mediaType === 'audio'
              ? appSettings.defaultAudioCategory || ''
              : appSettings.defaultVideoCategory || appSettings.defaultCategory || ''
          }
          onSetDefaultCategory={handleSetDefaultCategory}
          videos={videos}
          photos={photos}
          audios={audios}
          theme={theme}
          mediaType={filterState.mediaType}
          onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
          onReorderCategories={(reordered) => setCategories(reordered)}
          onRenameCategory={(cat) => {
            const name = window.prompt('Rename category', cat.name)?.trim();
            if (name && normalizeCategory(name) !== normalizeCategory(cat.name) && !categories.some((c) => normalizeCategory(c.name) === normalizeCategory(name))) {
              handleUpdateCategory(cat.id, { name }, cat.name);
            }
          }}
          onDeleteCategory={handleDeleteCategory}
          onAddCategory={handleAddCategory}
        />

        {/* Modern Floating Glassmorphism Footer: Media Cycle | Category Switch | + */}
        <FloatingGlassFooter
          currentMediaType={filterState.mediaType}
          onSelectMediaType={handleSwitchMediaType}
          onOpenCategorySwitch={() => setIsCategorySwitchOpen(true)}
          selectedCategory={filterState.selectedCategory}
          defaultCategory={
            filterState.mediaType === 'photos'
              ? appSettings.defaultPhotoCategory || ''
              : filterState.mediaType === 'audio'
              ? appSettings.defaultAudioCategory || ''
              : appSettings.defaultVideoCategory || appSettings.defaultCategory || ''
          }
          onOpenPlusMenu={() => {
            setAddModalTab(
              filterState.mediaType === 'photos'
                ? 'photo'
                : filterState.mediaType === 'audio'
                ? 'audio'
                : 'video'
            );
            setIsAddModalOpen(true);
          }}
          videoCount={videos.length}
          photoCount={photos.length}
          audioCount={audios.length}
          theme={theme}
        />

        {/* Video Player Modal (for Grid & List mode playback) */}
        {activePlaybackVideo && viewMode !== 'split' && (
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
            categories={categories}
            onSave={handleUpdateVideo}
            onClose={() => setEditingVideo(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
