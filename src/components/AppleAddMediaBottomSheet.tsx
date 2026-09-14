import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Youtube,
  Image as ImageIcon,
  Disc3,
  Music,
  X,
  Check,
  AlertCircle,
  UploadCloud,
  ClipboardPaste,
  Loader2,
  Sparkles,
  HardDrive,
  Play,
  Pause,
  Volume2,
  FolderUp,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { VideoItem, PhotoItem, AudioItem, CategoryInfo } from '../types';
import { extractYouTubeId, getYouTubeThumbnail, fetchYouTubeMetadata } from '../utils/youtube';
import { processImageFile, formatBytes } from '../utils/imageUtils';
import { translateCategoryToMarathi, normalizeCategory } from './CategoryPillsRow';
import { extractGoogleDriveId } from '../utils/googleDrive';
import { getAudioFileMetadata } from '../utils/audioStorage';

interface AppleAddMediaBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (video: Omit<VideoItem, 'id' | 'createdAt' | 'isFavorite' | 'isWatchLater'>) => void;
  onAddPhoto: (photo: Omit<PhotoItem, 'id' | 'createdAt' | 'isFavorite'>) => void;
  onAddAudio: (audio: Omit<AudioItem, 'id' | 'createdAt' | 'isFavorite'>, audioBlob?: Blob) => void;
  initialTab?: 'video' | 'photo' | 'audio';
  initialCategory?: string;
  categories?: CategoryInfo[];
}

const DEFAULT_DEVOTIONAL_CATEGORIES = [
  'भजन',
  'अभंग',
  'कीर्तन',
  'प्रवचन',
  'आरती',
  'हरिपाठ',
  'स्तोत्र',
  'ध्यान',
  'मंत्र',
  'दर्शन',
  'कथा',
];

const DEFAULT_AUDIO_CATEGORIES = ['निखिलानंद महाराज', 'महाराज', 'प्रभुपाद', 'इतर'];

export const AppleAddMediaBottomSheet: React.FC<AppleAddMediaBottomSheetProps> = ({
  isOpen,
  onClose,
  onAddVideo,
  onAddPhoto,
  onAddAudio,
  initialTab = 'video',
  initialCategory,
  categories,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'photo' | 'audio'>(initialTab);

  // Available categories list in Marathi
  const availableCategories = React.useMemo(() => {
    if (activeTab === 'audio') {
      const configured = (categories || [])
        .map((c) => translateCategoryToMarathi(c.name))
        .filter((n) => n && normalizeCategory(n) !== 'all');
      return Array.from(new Set([...DEFAULT_AUDIO_CATEGORIES, ...configured]));
    }
    if (!categories || categories.length === 0) return DEFAULT_DEVOTIONAL_CATEGORIES;
    const names = categories
      .map((c) => translateCategoryToMarathi(c.name))
      .filter((n) => n && normalizeCategory(n) !== 'all');
    return names.length > 0 ? Array.from(new Set(names)) : DEFAULT_DEVOTIONAL_CATEGORIES;
  }, [categories, activeTab]);

  // YouTube Video States
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [channelTitle, setChannelTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState(() => availableCategories[0] || 'भजन');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [isValidYoutubeUrl, setIsValidYoutubeUrl] = useState(false);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  // Photo States
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState(() => availableCategories.find(c => normalizeCategory(c) === 'darshan') || availableCategories[0] || 'दर्शन');
  const [photoFileSize, setPhotoFileSize] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio States
  const [audioSourceMode, setAudioSourceMode] = useState<'device' | 'drive'>('device');

  // Device Audio (Local computer or mobile storage)
  const [localAudioFile, setLocalAudioFile] = useState<File | null>(null);
  const [localAudioPreviewUrl, setLocalAudioPreviewUrl] = useState<string | null>(null);
  const [localAudioTitle, setLocalAudioTitle] = useState('');
  const [localAudioArtist, setLocalAudioArtist] = useState('');
  const [localAudioCategory, setLocalAudioCategory] = useState(() => availableCategories.find(c => normalizeCategory(c) === 'bhajan') || availableCategories[0] || 'भजन');
  const [localAudioDuration, setLocalAudioDuration] = useState(0);
  const [localAudioFileSize, setLocalAudioFileSize] = useState('');
  const [isAudioDraggingOver, setIsAudioDraggingOver] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Audio States (Google Drive)
  const [audioUrl, setAudioUrl] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [audioArtist, setAudioArtist] = useState('');
  const [audioCategory, setAudioCategory] = useState(() => availableCategories.find(c => normalizeCategory(c) === 'kirtan') || availableCategories[0] || 'कीर्तन');
  const [isValidDriveUrl, setIsValidDriveUrl] = useState(false);
  const [driveId, setDriveId] = useState<string | null>(null);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsSuccess(false);
      setErrorMessage('');
      setIsPlayingAudioPreview(false);
      if (initialCategory) {
        const marathiCat = translateCategoryToMarathi(initialCategory);
        setVideoCategory(marathiCat);
        setPhotoCategory(marathiCat);
        setLocalAudioCategory(marathiCat);
        setAudioCategory(marathiCat);
      }
    } else {
      // Pause preview audio when closed
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingAudioPreview(false);
    }
  }, [isOpen, initialTab, initialCategory]);

  useEffect(() => {
    if (activeTab === 'audio') {
      setLocalAudioCategory((current) => DEFAULT_AUDIO_CATEGORIES.includes(current) ? current : DEFAULT_AUDIO_CATEGORIES[0]);
      setAudioCategory((current) => DEFAULT_AUDIO_CATEGORIES.includes(current) ? current : DEFAULT_AUDIO_CATEGORIES[0]);
    }
  }, [activeTab]);

  // Validate Google Drive link
  useEffect(() => {
    if (!audioUrl.trim()) {
      setIsValidDriveUrl(false);
      setDriveId(null);
      setAudioTitle('');
      setAudioArtist('');
      return;
    }

    const id = extractGoogleDriveId(audioUrl);
    if (id) {
      setIsValidDriveUrl(true);
      setDriveId(id);
      setErrorMessage('');
      if (!audioTitle) {
        setAudioTitle(`Devotional Audio (${id.substring(0, 6)})`);
      }
    } else {
      setIsValidDriveUrl(false);
      setDriveId(null);
      if (audioUrl.length > 15) {
        setErrorMessage('Please enter a valid Google Drive file or share link.');
      }
    }
  }, [audioUrl]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-validate and parse YouTube link
  useEffect(() => {
    if (!videoUrl.trim()) {
      setIsValidYoutubeUrl(false);
      setYoutubeId(null);
      setVideoThumbnail('');
      setVideoTitle('');
      setChannelTitle('');
      setErrorMessage('');
      return;
    }

    const id = extractYouTubeId(videoUrl);
    if (id) {
      setIsValidYoutubeUrl(true);
      setYoutubeId(id);
      setVideoThumbnail(getYouTubeThumbnail(id, 'hq'));
      setErrorMessage('');
      setIsFetchingMeta(true);

      fetchYouTubeMetadata(videoUrl)
        .then((meta) => {
          if (meta.title) {
            setVideoTitle(meta.title);
          } else {
            setVideoTitle(`Devotional Video (${id})`);
          }
          if (meta.author_name) {
            setChannelTitle(meta.author_name);
          }
        })
        .catch(() => {
          setVideoTitle(`Devotional Video (${id})`);
        })
        .finally(() => {
          setIsFetchingMeta(false);
        });
    } else {
      setIsValidYoutubeUrl(false);
      setYoutubeId(null);
      setVideoThumbnail('');
      if (videoUrl.length > 15) {
        setErrorMessage('Please enter a valid YouTube video or shorts link.');
      }
    }
  }, [videoUrl]);

  // Paste from clipboard handler
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setVideoUrl(text.trim());
      }
    } catch {
      setErrorMessage('Unable to read clipboard. Please paste manually into the field.');
    }
  };

  // Process selected image file
  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setErrorMessage('');
    setIsProcessingPhoto(true);

    try {
      const processed = await processImageFile(file, 1600, 0.88);
      setPhotoDataUrl(processed.dataUrl);
      setPhotoFileSize(processed.fileSize || formatBytes(file.size));

      if (!photoTitle) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setPhotoTitle(cleanName);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing image.';
      setErrorMessage(msg);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Submit Video
  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidYoutubeUrl || !youtubeId) {
      setErrorMessage('Please enter a valid YouTube URL first.');
      return;
    }

    const titleToUse = videoTitle.trim() || `Devotional Video (${youtubeId})`;

    onAddVideo({
      youtubeId,
      url: videoUrl.trim(),
      title: titleToUse,
      channelTitle: channelTitle.trim() || 'Spiritual Archive',
      category: videoCategory,
      tags: [],
      thumbnailUrl: videoThumbnail || getYouTubeThumbnail(youtubeId, 'hq'),
    });

    setIsSuccess(true);
    setTimeout(() => {
      setVideoUrl('');
      setVideoTitle('');
      setChannelTitle('');
      setVideoThumbnail('');
      onClose();
    }, 600);
  };

  // Submit Photo
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl) {
      setErrorMessage('Please pick or attach an image file.');
      return;
    }

    const titleToUse = photoTitle.trim() || 'Sacred Darshan';

    onAddPhoto({
      title: titleToUse,
      category: photoCategory,
      photoUrl: photoDataUrl,
      thumbnailUrl: photoDataUrl,
      fileSize: photoFileSize || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setPhotoDataUrl(null);
      setPhotoTitle('');
      onClose();
    }, 600);
  };

  // Process uploaded local audio file (computer or mobile storage)
  const processAudioFile = async (file: File) => {
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg|flac|opus|weba)$/i.test(file.name)) {
      setErrorMessage('Please select a valid audio file (MP3, WAV, M4A, AAC, OGG, FLAC).');
      return;
    }

    setIsProcessingAudio(true);
    setErrorMessage('');

    try {
      // Create local preview URL
      if (localAudioPreviewUrl) {
        URL.revokeObjectURL(localAudioPreviewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      setLocalAudioPreviewUrl(previewUrl);
      setLocalAudioFile(file);

      // Extract duration and friendly metadata
      const meta = await getAudioFileMetadata(file);
      setLocalAudioDuration(meta.duration);
      setLocalAudioFileSize(meta.formattedSize);

      // Default title from clean file name if not already typed
      if (!localAudioTitle) {
        setLocalAudioTitle(meta.cleanTitle);
      }

      if (!localAudioArtist) {
        setLocalAudioArtist('Device Audio');
      }
    } catch (err) {
      console.error('Failed to process audio file:', err);
      setErrorMessage('Could not load audio file. Please try a different track.');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAudioFile(file);
    }
    // reset input value so re-selecting the same file works
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsAudioDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAudioFile(file);
    }
  };

  const handleToggleAudioPreview = () => {
    if (!previewAudioRef.current || !localAudioPreviewUrl) return;

    if (isPlayingAudioPreview) {
      previewAudioRef.current.pause();
      setIsPlayingAudioPreview(false);
    } else {
      previewAudioRef.current.play().then(() => {
        setIsPlayingAudioPreview(true);
      }).catch((err) => {
        console.warn('Playback error:', err);
        setIsPlayingAudioPreview(false);
      });
    }
  };

  const handleClearLocalAudio = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    if (localAudioPreviewUrl) {
      URL.revokeObjectURL(localAudioPreviewUrl);
    }
    setLocalAudioFile(null);
    setLocalAudioPreviewUrl(null);
    setLocalAudioTitle('');
    setLocalAudioArtist('');
    setLocalAudioDuration(0);
    setLocalAudioFileSize('');
    setIsPlayingAudioPreview(false);
  };

  // Submit Device Audio
  const handleAddDeviceAudioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localAudioFile) {
      setErrorMessage('Please choose or drop an audio file from your device first.');
      return;
    }

    const titleToUse = localAudioTitle.trim() || localAudioFile.name.replace(/\.[^/.]+$/, '');

    // Stop preview playback if running
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    onAddAudio({
      url: localAudioPreviewUrl || 'local://' + localAudioFile.name,
      title: titleToUse,
      artistOrSource: localAudioArtist.trim() || 'Device Audio',
      category: localAudioCategory,
      tags: [],
      sourceType: 'local',
      fileName: localAudioFile.name,
      fileSize: localAudioFileSize || undefined,
      duration: localAudioDuration || undefined,
    }, localAudioFile);

    setIsSuccess(true);
    setTimeout(() => {
      handleClearLocalAudio();
      onClose();
    }, 600);
  };

  // Paste Audio link handler
  const handlePasteAudioClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAudioUrl(text.trim());
      }
    } catch {
      setErrorMessage('Unable to read clipboard. Please paste manually into the field.');
    }
  };

  // Submit Drive Audio
  const handleAddDriveAudioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidDriveUrl || !driveId) {
      setErrorMessage('Please enter a valid Google Drive link first.');
      return;
    }

    const titleToUse = audioTitle.trim() || `Devotional Audio (${driveId.substring(0, 6)})`;

    onAddAudio({
      driveId,
      url: audioUrl.trim(),
      title: titleToUse,
      artistOrSource: audioArtist.trim() || 'Google Drive Audio',
      category: audioCategory,
      tags: [],
      sourceType: 'drive',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setAudioUrl('');
      setAudioTitle('');
      setAudioArtist('');
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="apple-bottom-sheet-root"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-auto"
        >
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-md cursor-pointer"
          />

          {/* Bottom Sheet Card */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className={`relative z-10 w-full max-w-[540px] max-h-[90vh] flex flex-col rounded-t-[32px] sm:rounded-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t sm:border overflow-hidden transition-colors ${
              activeTab === 'audio'
                ? 'bg-[#fffdf0] text-amber-950 border-yellow-300'
                : 'bg-[#FFFDFB] text-stone-900 border-white/80'
            }`}
          >
            {/* Top Handle Pill */}
            <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
              <div className={`w-10 h-1.5 rounded-full ${activeTab === 'audio' ? 'bg-yellow-300' : 'bg-stone-300/80'}`} />
            </div>

            {/* Header: current section is selected automatically by the app */}
            <div className={`px-5 pt-2 pb-3 border-b flex items-center justify-end ${activeTab === 'audio' ? 'border-yellow-200 bg-yellow-50/50' : 'border-stone-100'}`}>
              {activeTab === 'video' && (
                <button
                  id="btn-submit-video-header"
                  type="button"
                  disabled={!isValidYoutubeUrl || isSuccess}
                  onClick={() => (document.getElementById('video-add-form') as HTMLFormElement | null)?.requestSubmit()}
                  className="mr-2 px-5 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold shadow-xs disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              )}
              {activeTab === 'photo' && (
                photoDataUrl ? (
                  <button type="button" disabled={isSuccess} onClick={() => (document.getElementById('photo-add-form') as HTMLFormElement | null)?.requestSubmit()} className="mr-2 px-5 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold shadow-xs disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer"><ImageIcon className="w-3.5 h-3.5" /><span>Upload Photo</span></button>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="mr-2 px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"><ImageIcon className="w-3.5 h-3.5" /><span>Upload Photo</span></button>
                )
              )}
              {activeTab === 'audio' && (
                <button
                  id="btn-submit-audio-header"
                  type="button"
                  onClick={() => {
                    if (audioSourceMode === 'device') {
                      if (!localAudioFile) {
                        audioFileInputRef.current?.click();
                      } else {
                        (document.getElementById('device-audio-form') as HTMLFormElement | null)?.requestSubmit();
                      }
                    } else {
                      (document.getElementById('drive-audio-form') as HTMLFormElement | null)?.requestSubmit();
                    }
                  }}
                  className="mr-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-bold rounded-xl text-xs shadow-xs border border-yellow-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>{audioSourceMode === 'device' && !localAudioFile ? 'Select Audio' : 'Add Audio'}</span>
                </button>
              )}
              {/* Close Button */}
              <button
                id="btn-close-bottom-sheet"
                onClick={onClose}
                type="button"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'audio'
                    ? 'bg-yellow-100 hover:bg-yellow-200 text-amber-900'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800'
                }`}
                aria-label="Close sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Scrollable Body */}
            <div className="px-5 py-4 overflow-y-auto space-y-4 flex-1">
              {/* Feedback messages */}
              {errorMessage && (
                <div className="p-3 bg-red-50/90 border border-red-200/80 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isSuccess && (
                <div className="p-3 bg-emerald-50/90 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Successfully added to your vault!</span>
                </div>
              )}

              {/* Option 1: YouTube Form */}
              {activeTab === 'video' ? (
                <form id="video-add-form" onSubmit={handleAddVideoSubmit} className="space-y-4">
                  {/* YouTube Link Input Area */}
                  <div>
                    <label
                      htmlFor="youtube-url-field"
                      className="block text-xs font-semibold text-stone-700 mb-1.5"
                    >
                      Paste YouTube link
                    </label>

                    <div className="relative flex items-center">
                      <input
                        id="youtube-url-field"
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Paste YouTube link here"
                        autoFocus
                        className="w-full pl-3.5 pr-20 py-2.5 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 focus:border-stone-400 rounded-xl text-base sm:text-xs text-stone-900 placeholder-stone-400 focus:outline-none transition-colors"
                      />

                      <button
                        type="button"
                        onClick={handlePasteClipboard}
                        className="absolute right-1.5 px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        title="Paste from clipboard"
                      >
                        <ClipboardPaste className="w-3 h-3 text-stone-500" />
                        <span>Paste</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                    </span>
                  </div>

                  {/* Thumbnail / Meta Preview Card */}
                  {isValidYoutubeUrl && (
                    <div className="p-2.5 bg-stone-50 border border-stone-200/80 rounded-xl flex items-center gap-3 animate-fadeIn">
                      <div className="relative w-20 h-13 rounded-lg overflow-hidden bg-stone-900 shrink-0 shadow-2xs">
                        {videoThumbnail ? (
                          <img
                            src={videoThumbnail}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-100">
                            <Youtube className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {isFetchingMeta ? (
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 py-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-600" />
                            <span>Fetching video title...</span>
                          </div>
                        ) : (
                          <>
                            <input
                              type="text"
                              value={videoTitle}
                              onChange={(e) => setVideoTitle(e.target.value)}
                              placeholder="Title"
                              className="w-full text-base sm:text-xs font-semibold text-stone-900 bg-transparent border-b border-transparent focus:border-stone-300 focus:outline-none py-0.5 truncate"
                            />
                            <p className="text-[11px] text-stone-500 truncate mt-0.5">
                              {channelTitle || 'Spiritual Archive'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Select Category
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto py-0.5">
                      {availableCategories.map((cat) => {
                        const isSelected = videoCategory.toLowerCase() === cat.toLowerCase();
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setVideoCategory(cat)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'bg-stone-900 text-white shadow-xs font-semibold'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </form>
              ) : activeTab === 'photo' ? (
                /* Option 2: Photo Upload Option */
                <form id="photo-add-form" onSubmit={handleAddPhotoSubmit} className="space-y-4">
                  {/* Hidden File Input for Device Image Picker */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProcessFile(file);
                    }}
                  />

                  {/* Photo Drop Zone or Quick Image Picker Button */}
                  {!photoDataUrl ? (
                    <div
                      id="photo-upload-picker-box"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(true);
                      }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleProcessFile(file);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`py-8 px-4 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isDraggingOver
                          ? 'border-stone-900 bg-stone-50'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 hover:bg-stone-50'
                      }`}
                    >
                      {isProcessingPhoto ? (
                        <div className="py-2 flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 text-stone-700 animate-spin" />
                          <span className="text-xs font-medium text-stone-600">
                            Optimizing photo...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mb-2 shadow-2xs">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-semibold text-stone-800">
                            Tap to choose photo from device
                          </p>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            PNG, JPG, or WebP
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    /* Selected Photo Preview */
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden bg-stone-900 border border-stone-200 shadow-xs max-h-48 flex items-center justify-center">
                        <img
                          src={photoDataUrl}
                          alt="Uploaded Preview"
                          className="w-full h-40 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoDataUrl(null);
                            setPhotoTitle('');
                          }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {photoFileSize && (
                          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white/90">
                            {photoFileSize}
                          </div>
                        )}
                      </div>

                      {/* Photo Title Field */}
                      <div>
                        <label
                          htmlFor="input-photo-title"
                          className="block text-xs font-semibold text-stone-700 mb-1"
                        >
                          Title / Caption
                        </label>
                        <input
                          id="input-photo-title"
                          type="text"
                          value={photoTitle}
                          onChange={(e) => setPhotoTitle(e.target.value)}
                          placeholder="e.g. Morning Aarti Darshan"
                          className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
                        />
                      </div>

                      {/* Photo Category Selection */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                          Select Category
                        </label>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-0.5">
                          {availableCategories.map((cat) => {
                            const isSelected = photoCategory.toLowerCase() === cat.toLowerCase();
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setPhotoCategory(cat)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer select-none ${
                                  isSelected
                                    ? 'bg-stone-900 text-white shadow-xs font-semibold'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                                }`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                </form>
              ) : (
                /* Option 3: Audio (Device Local Storage or Google Drive) */
                <div className="space-y-4">
                  {/* Hidden file input and preview audio player */}
                  <input
                    ref={audioFileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.opus,.weba"
                    onChange={handleAudioFileChange}
                    className="hidden"
                  />
                  <audio
                    ref={previewAudioRef}
                    src={localAudioPreviewUrl || undefined}
                    onEnded={() => setIsPlayingAudioPreview(false)}
                    className="hidden"
                  />

                  {/* Audio Source Mode Switcher: Device vs Google Drive */}
                  <div className="flex bg-yellow-100/70 p-1 rounded-xl border border-yellow-200">
                    <button
                      type="button"
                      onClick={() => {
                        setAudioSourceMode('device');
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        audioSourceMode === 'device'
                          ? 'bg-yellow-400 text-amber-950 shadow-2xs font-bold border border-yellow-500/40'
                          : 'text-amber-800 hover:text-amber-950'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5 text-amber-900" />
                      <span>Device Storage</span>
                      <span className="text-[10px] px-1 py-0.2 bg-yellow-200 text-amber-950 rounded font-normal hidden sm:inline">
                        PC / Mobile
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAudioSourceMode('drive');
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        audioSourceMode === 'drive'
                          ? 'bg-yellow-400 text-amber-950 shadow-2xs font-bold border border-yellow-500/40'
                          : 'text-amber-800 hover:text-amber-950'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-amber-900" />
                      <span>Google Drive Link</span>
                    </button>
                  </div>

                  {/* SUB-FORM A: Device Audio Upload (Local Computer or Phone Storage) */}
                  {audioSourceMode === 'device' ? (
                    <form id="device-audio-form" onSubmit={handleAddDeviceAudioSubmit} className="space-y-4">
                      {!localAudioFile ? (
                        /* Drag and drop / browse box */
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsAudioDraggingOver(true);
                          }}
                          onDragLeave={() => setIsAudioDraggingOver(false)}
                          onDrop={handleAudioDrop}
                          onClick={() => audioFileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                            isAudioDraggingOver
                              ? 'border-yellow-500 bg-yellow-100/80 scale-[1.01]'
                              : 'border-yellow-300 bg-yellow-50/60 hover:bg-yellow-100/60 hover:border-yellow-400'
                          }`}
                        >
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 border border-yellow-300 flex items-center justify-center text-amber-950 shadow-md">
                            {isProcessingAudio ? (
                              <Loader2 className="w-7 h-7 animate-spin" />
                            ) : (
                              <FolderUp className="w-7 h-7" />
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-bold text-amber-950">
                              {isProcessingAudio
                                ? 'Reading Audio File...'
                                : 'Attach from Computer or Mobile Storage'}
                            </p>
                            <p className="text-[11px] text-amber-800 mt-1 max-w-xs mx-auto">
                              Tap to browse device storage or drag & drop devotional audio
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-amber-950 font-medium bg-yellow-100 px-2.5 py-1 rounded-full border border-yellow-300">
                            <Smartphone className="w-3 h-3 text-amber-800" />
                            <span>Phones & Tablets</span>
                            <span className="text-yellow-400">•</span>
                            <Laptop className="w-3 h-3 text-amber-800" />
                            <span>PC & Mac</span>
                          </div>

                          <span className="text-[9.5px] font-mono text-amber-700/80">
                            Supports MP3, M4A, WAV, AAC, OGG, FLAC
                          </span>
                        </div>
                      ) : (
                        /* Selected Audio Preview Card */
                        <div className="p-3.5 bg-yellow-50/80 border border-yellow-200 rounded-2xl space-y-3 animate-fadeIn">
                          <div className="flex items-center gap-3">
                            {/* Mini Vinyl Record with Preview Play Button */}
                            <button
                              type="button"
                              onClick={handleToggleAudioPreview}
                              className="relative w-14 h-14 rounded-xl bg-yellow-300 flex items-center justify-center shadow-md border border-yellow-400 shrink-0 cursor-pointer group"
                              title={isPlayingAudioPreview ? 'Pause Preview' : 'Listen Preview'}
                            >
                              <Disc3
                                className={`w-8 h-8 text-amber-950 transition-transform ${
                                  isPlayingAudioPreview ? 'animate-spin' : 'group-hover:scale-110'
                                }`}
                                style={{ animationDuration: '3s' }}
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-xl">
                                {isPlayingAudioPreview ? (
                                  <Pause className="w-5 h-5 text-amber-950 fill-amber-950" />
                                ) : (
                                  <Play className="w-5 h-5 text-amber-950 fill-amber-950 ml-0.5" />
                                )}
                              </div>
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-200 text-[10px] font-bold text-amber-950 border border-yellow-300">
                                  <HardDrive className="w-2.5 h-2.5 text-amber-800" />
                                  <span>Device File Attached</span>
                                </span>
                                {localAudioFileSize && (
                                  <span className="text-[9.5px] font-mono text-amber-900 bg-white/90 px-1.5 py-0.5 rounded border border-yellow-200">
                                    {localAudioFileSize}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] font-semibold text-amber-950 truncate mt-1">
                                {localAudioFile.name}
                              </p>

                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => audioFileInputRef.current?.click()}
                                  className="text-[10px] font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer"
                                >
                                  Change file
                                </button>
                                <span className="text-yellow-400">•</span>
                                <button
                                  type="button"
                                  onClick={handleClearLocalAudio}
                                  className="text-[10px] font-bold text-rose-700 hover:text-rose-800 cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Editable Audio Title */}
                          <div>
                            <label
                              htmlFor="local-audio-title-field"
                              className="block text-[11px] font-bold text-amber-950 mb-1"
                            >
                              Track Title
                            </label>
                            <input
                              id="local-audio-title-field"
                              type="text"
                              value={localAudioTitle}
                              onChange={(e) => setLocalAudioTitle(e.target.value)}
                              placeholder="e.g. Gayatri Mantra 108 Times"
                              className="w-full px-3 py-2 bg-white border border-yellow-200 focus:border-yellow-400 rounded-xl text-xs text-amber-950 placeholder:text-amber-800/40 focus:outline-none transition-all"
                              required
                            />
                          </div>

                          {/* Artist / Singer */}
                          <div>
                            <label
                              htmlFor="local-audio-artist-field"
                              className="block text-[11px] font-bold text-amber-950 mb-1"
                            >
                              Singer / Source (Optional)
                            </label>
                            <input
                              id="local-audio-artist-field"
                              type="text"
                              value={localAudioArtist}
                              onChange={(e) => setLocalAudioArtist(e.target.value)}
                              placeholder="e.g. Anuradha Paudwal / Morning Kirtan"
                              className="w-full px-3 py-2 bg-white border border-yellow-200 focus:border-yellow-400 rounded-xl text-xs text-amber-950 placeholder:text-amber-800/40 focus:outline-none transition-all"
                            />
                          </div>

                          {/* Category Pills */}
                          <div>
                            <span className="block text-[11px] font-bold text-amber-950 mb-1.5">
                              Category
                            </span>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                              {availableCategories.map((cat) => {
                                const isSelected = localAudioCategory.toLowerCase() === cat.toLowerCase();
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setLocalAudioCategory(cat)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-yellow-400 text-amber-950 border border-yellow-500 font-bold shadow-2xs'
                                        : 'bg-white text-amber-900 border border-yellow-200 hover:border-yellow-300'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Device Audio Primary Action Button */}
                      <div className="pt-2">
                        {localAudioFile ? (
                          <button
                            id="btn-submit-device-audio"
                            type="submit"
                            disabled={isSuccess}
                            className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-bold rounded-xl text-xs shadow-md border border-yellow-400/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Music className="w-3.5 h-3.5" />
                            <span>Add Audio to Vault</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => audioFileInputRef.current?.click()}
                            className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-bold rounded-xl text-xs shadow-md border border-yellow-400/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>Choose Audio from Device</span>
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    /* SUB-FORM B: Google Drive Audio Form */
                    <form id="drive-audio-form" onSubmit={handleAddDriveAudioSubmit} className="space-y-4">
                      {/* Google Drive Link Input Area */}
                      <div>
                        <label
                          htmlFor="audio-drive-url-field"
                          className="block text-xs font-bold text-amber-950 mb-1.5"
                        >
                          Paste Google Drive Audio Link
                        </label>

                        <div className="relative flex items-center">
                          <input
                            id="audio-drive-url-field"
                            type="url"
                            value={audioUrl}
                            onChange={(e) => setAudioUrl(e.target.value)}
                            placeholder="https://drive.google.com/file/d/..."
                            className="w-full pl-3 pr-20 py-2.5 bg-white border border-yellow-200 focus:border-yellow-400 rounded-xl text-xs text-amber-950 placeholder:text-amber-800/40 focus:outline-none transition-all"
                            autoFocus
                          />

                          <div className="absolute right-1.5 flex items-center gap-1">
                            {audioUrl && (
                              <button
                                type="button"
                                onClick={() => setAudioUrl('')}
                                className="p-1.5 text-amber-700 hover:text-amber-950 rounded-lg hover:bg-yellow-100 cursor-pointer"
                                title="Clear"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={handlePasteAudioClipboard}
                              className="px-2.5 py-1 bg-yellow-100 hover:bg-yellow-200 text-amber-950 border border-yellow-300 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              title="Paste from clipboard"
                            >
                              <ClipboardPaste className="w-3 h-3 text-amber-800" />
                              <span>Paste</span>
                            </button>
                          </div>
                        </div>

                        <p className="mt-1 text-[10.5px] text-amber-800 font-medium">
                          Supports audio links from Google Drive (e.g. Bhajan, Aarti, Mantra audio).
                        </p>
                      </div>

                      {/* Audio Preview Card and Customization */}
                      {isValidDriveUrl && driveId && (
                        <div className="p-3.5 bg-yellow-50/80 border border-yellow-200 rounded-2xl space-y-3 animate-fadeIn">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-200 via-amber-200 to-yellow-300 flex items-center justify-center shadow-xs shrink-0 border border-yellow-400">
                              <Disc3 className="w-8 h-8 text-amber-950" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-200 text-[10px] font-bold text-amber-950 border border-yellow-300">
                                <Disc3 className="w-2.5 h-2.5 text-amber-800" />
                                <span>Drive Audio Ready</span>
                              </span>

                              <p className="text-[10px] text-amber-800/80 font-mono mt-0.5 truncate">
                                File ID: {driveId}
                              </p>
                            </div>
                          </div>

                          {/* Custom Audio Title */}
                          <div>
                            <label
                              htmlFor="audio-title-field"
                              className="block text-[11px] font-bold text-amber-950 mb-1"
                            >
                              Audio Title / Track Name
                            </label>
                            <input
                              id="audio-title-field"
                              type="text"
                              value={audioTitle}
                              onChange={(e) => setAudioTitle(e.target.value)}
                              placeholder="e.g. Shri Krishna Govind Hare Murari"
                              className="w-full px-3 py-2 bg-white border border-yellow-200 focus:border-yellow-400 rounded-xl text-xs text-amber-950 placeholder:text-amber-800/40 focus:outline-none transition-all"
                            />
                          </div>

                          {/* Artist or Source */}
                          <div>
                            <label
                              htmlFor="audio-artist-field"
                              className="block text-[11px] font-bold text-amber-950 mb-1"
                            >
                              Singer / Source (Optional)
                            </label>
                            <input
                              id="audio-artist-field"
                              type="text"
                              value={audioArtist}
                              onChange={(e) => setAudioArtist(e.target.value)}
                              placeholder="e.g. Jagjit Singh / Radha Krishna Kirtan"
                              className="w-full px-3 py-2 bg-white border border-yellow-200 focus:border-yellow-400 rounded-xl text-xs text-amber-950 placeholder:text-amber-800/40 focus:outline-none transition-all"
                            />
                          </div>

                          {/* Category Pills */}
                          <div>
                            <span className="block text-[11px] font-bold text-amber-950 mb-1.5">
                              Category
                            </span>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                              {availableCategories.map((cat) => {
                                const isSelected = audioCategory.toLowerCase() === cat.toLowerCase();
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setAudioCategory(cat)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-yellow-400 text-amber-950 border border-yellow-500 font-bold shadow-2xs'
                                        : 'bg-white text-amber-900 border border-yellow-200 hover:border-yellow-300'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Audio Primary Action Button */}
                      <div className="pt-2">
                        <button
                          id="btn-submit-audio"
                          type="submit"
                          disabled={!isValidDriveUrl || isSuccess}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                            isValidDriveUrl && !isSuccess
                              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 cursor-pointer shadow-md border border-yellow-400/60'
                              : 'bg-yellow-100/80 text-amber-900/40 border border-yellow-200/60 cursor-not-allowed'
                          }`}
                        >
                          <Music className="w-3.5 h-3.5" />
                          <span>Add Audio to Vault</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
