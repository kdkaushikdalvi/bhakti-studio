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
  HardDrive,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { VideoItem, PhotoItem, AudioItem, MediaTypeFilter } from '../types';
import { extractYouTubeId, getYouTubeThumbnail, fetchYouTubeMetadata } from '../utils/youtube';
import { processImageFile, formatBytes } from '../utils/imageUtils';
import { extractGoogleDriveId } from '../utils/googleDrive';
import { getAudioFileMetadata } from '../utils/audioStorage';

interface InlineAddMediaSectionProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: MediaTypeFilter;
  onSelectMediaType: (type: MediaTypeFilter) => void;
  onAddVideo: (video: Omit<VideoItem, 'id' | 'createdAt' | 'isFavorite' | 'isWatchLater'>) => void;
  onAddPhoto: (photo: Omit<PhotoItem, 'id' | 'createdAt' | 'isFavorite'>) => void;
  onAddAudio: (audio: Omit<AudioItem, 'id' | 'createdAt' | 'isFavorite'>, audioBlob?: Blob) => void;
}

export const InlineAddMediaSection: React.FC<InlineAddMediaSectionProps> = ({
  isOpen,
  onClose,
  mediaType,
  onSelectMediaType,
  onAddVideo,
  onAddPhoto,
  onAddAudio,
}) => {
  // Local active tab within the section (defaults to current mediaType)
  const [activeTab, setActiveTab] = useState<'videos' | 'photos' | 'audio'>(mediaType);

  useEffect(() => {
    setActiveTab(mediaType);
  }, [mediaType]);

  // YouTube States
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [channelTitle, setChannelTitle] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [isValidYoutubeUrl, setIsValidYoutubeUrl] = useState(false);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  // Photo States
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoFileSize, setPhotoFileSize] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio States
  const [audioSourceMode, setAudioSourceMode] = useState<'device' | 'drive'>('device');
  const [localAudioFile, setLocalAudioFile] = useState<File | null>(null);
  const [localAudioTitle, setLocalAudioTitle] = useState('');
  const [localAudioArtist, setLocalAudioArtist] = useState('');
  const [localAudioDuration, setLocalAudioDuration] = useState(0);
  const [localAudioFileSize, setLocalAudioFileSize] = useState('');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const [audioUrl, setAudioUrl] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [audioArtist, setAudioArtist] = useState('');
  const [isValidDriveUrl, setIsValidDriveUrl] = useState(false);
  const [driveId, setDriveId] = useState<string | null>(null);

  // Feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-validate YouTube link
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
          if (meta.title) setVideoTitle(meta.title);
          else setVideoTitle(`Devotional Video (${id})`);
          if (meta.author_name) setChannelTitle(meta.author_name);
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

  // Validate Drive link
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

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setVideoUrl(text.trim());
    } catch {
      setErrorMessage('Unable to read clipboard. Please paste manually into the field.');
    }
  };

  const handlePasteAudioClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setAudioUrl(text.trim());
    } catch {
      setErrorMessage('Unable to read clipboard. Please paste manually into the field.');
    }
  };

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

  const handleProcessAudioFile = async (file: File) => {
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg|flac|opus|weba)$/i.test(file.name)) {
      setErrorMessage('Please select a valid audio file (MP3, WAV, M4A, AAC, OGG).');
      return;
    }
    setIsProcessingAudio(true);
    setErrorMessage('');
    try {
      setLocalAudioFile(file);
      const meta = await getAudioFileMetadata(file);
      setLocalAudioDuration(meta.duration);
      setLocalAudioFileSize(meta.formattedSize);
      if (!localAudioTitle) setLocalAudioTitle(meta.cleanTitle);
      if (!localAudioArtist) setLocalAudioArtist('Device Audio');
    } catch {
      setErrorMessage('Could not load audio file. Please try another track.');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
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
      tags: [],
      thumbnailUrl: videoThumbnail || getYouTubeThumbnail(youtubeId, 'hq'),
    });
    setIsSuccess(true);
    setTimeout(() => {
      setVideoUrl('');
      setVideoTitle('');
      setChannelTitle('');
      setVideoThumbnail('');
      setIsSuccess(false);
      onClose();
    }, 500);
  };

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl) {
      setErrorMessage('Please choose an image file.');
      return;
    }
    onAddPhoto({
      title: photoTitle.trim() || 'Photo',
      photoUrl: photoDataUrl,
      thumbnailUrl: photoDataUrl,
      fileSize: photoFileSize || undefined,
    });
    setIsSuccess(true);
    setTimeout(() => {
      setPhotoDataUrl(null);
      setPhotoTitle('');
      setIsSuccess(false);
      onClose();
    }, 500);
  };

  const handleAudioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (audioSourceMode === 'device') {
      if (!localAudioFile) {
        setErrorMessage('Please select an audio file from your device.');
        return;
      }
      onAddAudio({
        title: localAudioTitle.trim() || localAudioFile.name,
        url: localAudioFile.name,
        artistOrSource: localAudioArtist.trim() || 'Device Audio',
        tags: [],
        sourceType: 'local',
        fileName: localAudioFile.name,
        fileSize: localAudioFileSize || undefined,
        duration: localAudioDuration || undefined,
      }, localAudioFile);
    } else {
      if (!isValidDriveUrl || !driveId) {
        setErrorMessage('Please enter a valid Google Drive link.');
        return;
      }
      onAddAudio({
        driveId,
        url: audioUrl.trim(),
        title: audioTitle.trim() || `Devotional Audio (${driveId.substring(0, 6)})`,
        artistOrSource: audioArtist.trim() || 'Google Drive Audio',
        tags: [],
        sourceType: 'drive',
      });
    }
    setIsSuccess(true);
    setTimeout(() => {
      setLocalAudioFile(null);
      setLocalAudioTitle('');
      setLocalAudioArtist('');
      setAudioUrl('');
      setAudioTitle('');
      setAudioArtist('');
      setIsSuccess(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  const accentColorClass =
    activeTab === 'videos'
      ? 'border-t-4 border-rose-500 shadow-rose-900/10'
      : activeTab === 'photos'
      ? 'border-t-4 border-emerald-500 shadow-emerald-900/10'
      : 'border-t-4 border-amber-500 shadow-amber-900/10';

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -14, scale: 0.98 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        id="inline-add-section-card"
        className={`w-full bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden transition-all ${accentColorClass}`}
      >
        {/* Card Header on same page level */}
        <div className="px-4 sm:px-5 pt-3.5 pb-2.5 flex items-center justify-between border-b border-stone-100 bg-stone-50/50">
          {/* Quick tab switcher inside the add card */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-full border border-stone-200/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('videos');
                onSelectMediaType('videos');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'videos'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('photos');
                onSelectMediaType('photos');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('audio');
                onSelectMediaType('audio');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'audio'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" />
              <span>Audio</span>
            </button>
          </div>

          {/* Right Action Icons (Close on top) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              title="Close section"
              aria-label="Close add section"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Feedback */}
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Added successfully!</span>
            </div>
          )}

          {/* TAB 1: ADD VIDEO */}
          {activeTab === 'videos' && (
            <form onSubmit={handleVideoSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  YouTube Link
                </label>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    autoFocus
                    className="w-full pl-3 pr-20 py-2 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 focus:border-rose-400 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="absolute right-1 px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <ClipboardPaste className="w-3 h-3 text-stone-500" />
                    <span>Paste</span>
                  </button>
                </div>
              </div>

              {/* Preview when link is valid */}
              {isValidYoutubeUrl && (
                <div className="p-2.5 bg-rose-50/60 border border-rose-200/80 rounded-2xl flex items-center gap-3">
                  {videoThumbnail && (
                    <img
                      src={videoThumbnail}
                      alt="Thumbnail"
                      className="w-16 h-12 rounded-lg object-cover border border-rose-200 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    {isFetchingMeta ? (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                        <span>Fetching video title...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {videoTitle || 'YouTube Video'}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">
                          {channelTitle || 'Spiritual Archive'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValidYoutubeUrl || isSuccess}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold shadow-xs disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Video</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ADD PHOTO */}
          {activeTab === 'photos' && (
            <form onSubmit={handlePhotoSubmit} className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessFile(file);
                }}
                className="hidden"
              />

              {!photoDataUrl ? (
                <div
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
                  className={`py-6 px-4 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDraggingOver
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-stone-200 hover:border-emerald-400 bg-stone-50/60 hover:bg-emerald-50/30'
                  }`}
                >
                  {isProcessingPhoto ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Optimizing photo...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-stone-800">
                        Choose photo from device
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        PNG, JPG, or WebP
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative rounded-xl overflow-hidden bg-stone-900 border border-stone-200 max-h-40 flex items-center justify-center">
                    <img
                      src={photoDataUrl}
                      alt="Uploaded Preview"
                      className="w-full h-36 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoDataUrl(null);
                        setPhotoTitle('');
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {photoFileSize && (
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white/90">
                        {photoFileSize}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Caption / Title
                    </label>
                    <input
                      type="text"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      placeholder="e.g. Sacred Darshan"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!photoDataUrl || isSuccess}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold shadow-xs disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Photo</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ADD AUDIO */}
          {activeTab === 'audio' && (
            <div className="space-y-3">
              {/* Audio mode selector: Device vs Google Drive */}
              <div className="flex items-center gap-2 p-1 bg-amber-50 rounded-xl border border-yellow-200">
                <button
                  type="button"
                  onClick={() => setAudioSourceMode('device')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    audioSourceMode === 'device'
                      ? 'bg-amber-400 text-amber-950 shadow-2xs font-bold'
                      : 'text-amber-900/70 hover:text-amber-950'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>From Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAudioSourceMode('drive')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    audioSourceMode === 'drive'
                      ? 'bg-amber-400 text-amber-950 shadow-2xs font-bold'
                      : 'text-amber-900/70 hover:text-amber-950'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Google Drive Link</span>
                </button>
              </div>

              <form onSubmit={handleAudioSubmit} className="space-y-3">
                {audioSourceMode === 'device' ? (
                  <>
                    <input
                      ref={audioFileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProcessAudioFile(file);
                      }}
                      className="hidden"
                    />

                    {!localAudioFile ? (
                      <div
                        onClick={() => audioFileInputRef.current?.click()}
                        className="py-6 px-4 border border-dashed border-yellow-300 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50/80 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                      >
                        {isProcessingAudio ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                            <span>Processing audio file...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center mb-1.5">
                              <HardDrive className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold text-amber-950">
                              Tap to choose audio from device
                            </p>
                            <p className="text-[11px] text-amber-700/70 mt-0.5">
                              MP3, WAV, M4A, or AAC
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/80 border border-yellow-300 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-950 truncate max-w-[200px]">
                            {localAudioFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setLocalAudioFile(null)}
                            className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={localAudioTitle}
                          onChange={(e) => setLocalAudioTitle(e.target.value)}
                          placeholder="Track Title"
                          className="w-full px-3 py-1.5 bg-white border border-yellow-200 rounded-lg text-xs text-stone-900 focus:outline-none"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Google Drive Audio Link
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="url"
                          value={audioUrl}
                          onChange={(e) => setAudioUrl(e.target.value)}
                          placeholder="https://drive.google.com/file/d/..."
                          className="w-full pl-3 pr-20 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handlePasteAudioClipboard}
                          className="absolute right-1 px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <ClipboardPaste className="w-3 h-3 text-stone-500" />
                          <span>Paste</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Audio Track Title
                      </label>
                      <input
                        type="text"
                        value={audioTitle}
                        onChange={(e) => setAudioTitle(e.target.value)}
                        placeholder="Title of track"
                        className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-1.5 border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSuccess || (audioSourceMode === 'device' ? !localAudioFile : !isValidDriveUrl)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-stone-950 font-bold rounded-xl text-xs shadow-xs disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Audio</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </motion.section>
    </AnimatePresence>
  );
};
