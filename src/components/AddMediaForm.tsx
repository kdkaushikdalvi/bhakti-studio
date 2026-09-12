import React, { useState, useEffect, useRef } from 'react';
import {
  Youtube,
  Image as ImageIcon,
  Check,
  AlertCircle,
  X,
  UploadCloud,
  Plus,
  Loader2,
} from 'lucide-react';
import { VideoItem, PhotoItem } from '../types';
import { extractYouTubeId, getYouTubeThumbnail, fetchYouTubeMetadata } from '../utils/youtube';
import { processImageFile } from '../utils/imageUtils';

interface AddMediaFormProps {
  onAddVideo: (video: Omit<VideoItem, 'id' | 'createdAt'>) => void;
  onAddPhoto: (photo: Omit<PhotoItem, 'id' | 'createdAt'>) => void;
  initialUrl?: string;
  initialMode?: 'video' | 'photo';
  onClose?: () => void;
  isModal?: boolean;
}

export const AddMediaForm: React.FC<AddMediaFormProps> = ({
  onAddVideo,
  onAddPhoto,
  initialUrl = '',
  initialMode = 'video',
  onClose,
  isModal = false,
}) => {
  // Mode selection: 1. Videos | 2. Photos
  const [activeTab, setActiveTab] = useState<'video' | 'photo'>(initialMode);

  // Video State: ONLY YouTube URL
  const [videoUrl, setVideoUrl] = useState(initialUrl);
  const [videoTitle, setVideoTitle] = useState('');
  const [channelTitle, setChannelTitle] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [isValidYoutubeUrl, setIsValidYoutubeUrl] = useState(false);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);

  // Photo State: ONLY File Attachment / Drag & Drop
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoFileSize, setPhotoFileSize] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status message
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-validate & fetch video details
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

      fetchYouTubeMetadata(videoUrl).then((meta) => {
        if (meta.title) {
          setVideoTitle(meta.title);
        } else {
          setVideoTitle(`Devotional Video (${id})`);
        }
        if (meta.author_name) {
          setChannelTitle(meta.author_name);
        }
      }).catch(() => {
        setVideoTitle(`Devotional Video (${id})`);
      });
    } else {
      setIsValidYoutubeUrl(false);
      setYoutubeId(null);
      setVideoThumbnail('');
      if (videoUrl.length > 10) {
        setErrorMessage('Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=...)');
      }
    }
  }, [videoUrl]);

  // Handle Photo File selection or drop
  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please attach a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setErrorMessage('');
    setIsProcessingImage(true);

    try {
      const processed = await processImageFile(file, 1200, 0.85);
      setPhotoDataUrl(processed.dataUrl);
      setPhotoFileSize(processed.fileSize);
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .trim();
      setPhotoTitle(cleanName || 'Sacred Photo');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to process image attachment.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setVideoUrl(text);
      }
    } catch {
      // Ignore
    }
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'video') {
      if (!youtubeId || !isValidYoutubeUrl) {
        setErrorMessage('A valid YouTube URL is required.');
        return;
      }

      const finalTitle = videoTitle.trim() || `Devotional Video (${youtubeId})`;

      onAddVideo({
        youtubeId,
        url: videoUrl.trim(),
        title: finalTitle,
        channelTitle: channelTitle.trim() || 'Spiritual Channel',
        category: 'General',
        tags: [],
        notes: '',
        timestamps: [],
        isFavorite: false,
        isWatchLater: false,
        thumbnailUrl: videoThumbnail || getYouTubeThumbnail(youtubeId, 'hq'),
      });

      setSuccessMessage('Saved Video to Vault!');
      setTimeout(() => {
        setSuccessMessage('');
        if (onClose) onClose();
      }, 900);

      if (!isModal) {
        setVideoUrl('');
        setVideoTitle('');
        setChannelTitle('');
      }
    } else {
      // Photo submission
      if (!photoDataUrl) {
        setErrorMessage('Please attach or drop a photo to save.');
        return;
      }

      onAddPhoto({
        title: photoTitle.trim() || 'Sacred Photo',
        category: 'General',
        photoUrl: photoDataUrl,
        fileSize: photoFileSize,
        isFavorite: false,
      });

      setSuccessMessage('Saved Photo to Vault!');
      setTimeout(() => {
        setSuccessMessage('');
        if (onClose) onClose();
      }, 900);

      if (!isModal) {
        setPhotoDataUrl(null);
        setPhotoTitle('');
        setPhotoFileSize('');
      }
    }
  };

  return (
    <div
      id="add-media-panel"
      className={`bg-white text-stone-900 border border-orange-200/90 rounded-2xl shadow-xs ${
        isModal ? 'p-4 sm:p-5 max-h-[90vh] overflow-y-auto' : 'p-4 mb-4'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-orange-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full ring-2 ring-orange-400 overflow-hidden shrink-0 shadow-xs bg-white">
            <img
              src="/BhaktiLogo.png"
              alt="Bhakti Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900 leading-none">
              Add to Sacred Vault
            </h3>
            <span className="text-[10px] text-orange-800 font-medium block mt-0.5">
              Paste YouTube URL or Attach Photo
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-orange-50 transition-colors rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Media Type Tabs: 1. Videos  |  2. Photos */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-orange-50/70 border border-orange-200/70 rounded-xl mb-3.5">
        <button
          type="button"
          onClick={() => {
            setActiveTab('video');
            setErrorMessage('');
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'video'
              ? 'bg-white text-orange-600 shadow-xs border border-orange-200/80 ring-1 ring-orange-400/30'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
          }`}
        >
          <Youtube className="w-4 h-4 text-red-500" />
          <span>1. Videos (URL)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('photo');
            setErrorMessage('');
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'photo'
              ? 'bg-white text-orange-600 shadow-xs border border-orange-200/80 ring-1 ring-orange-400/30'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span>2. Photos (Upload)</span>
        </button>
      </div>

      {/* Feedback alerts */}
      {successMessage && (
        <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 rounded-xl">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Clean Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* TAB 1: VIDEOS (ONLY URL) */}
        {activeTab === 'video' && (
          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-youtube-url" className="text-xs font-bold text-stone-800 flex items-center gap-1">
                  <span>YouTube URL</span>
                  <span className="text-orange-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="text-[10px] uppercase font-bold tracking-wider text-orange-600 hover:text-orange-700 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200/60 transition-colors cursor-pointer"
                >
                  Paste Link
                </button>
              </div>

              <div className="relative flex items-center">
                <input
                  id="input-youtube-url"
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-orange-50/40 border border-orange-200/90 rounded-xl px-3.5 py-2.5 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white text-stone-900 placeholder-stone-400 transition-all font-mono"
                  required
                />
                {videoUrl && (
                  <button
                    type="button"
                    onClick={() => setVideoUrl('')}
                    className="absolute right-2.5 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isValidYoutubeUrl && youtubeId && (
                <div className="mt-2.5 p-2 bg-orange-50/60 border border-orange-200 rounded-xl flex items-center gap-2.5">
                  <img
                    src={videoThumbnail}
                    alt="Thumbnail"
                    className="w-14 aspect-video rounded-lg object-cover shrink-0 border border-orange-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getYouTubeThumbnail(youtubeId, 'mq');
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-serif font-bold text-stone-900 truncate">
                      {videoTitle || 'Loading video title...'}
                    </p>
                    <p className="text-[10px] text-orange-700 font-medium truncate">
                      {channelTitle || 'YouTube Devotional Video'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PHOTOS (ATTACHMENT / DRAG & DROP) */}
        {activeTab === 'photo' && (
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                <span>Photo Attachment / Drag &amp; Drop</span>
                <span className="text-orange-500 ml-1">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {photoDataUrl ? (
                <div className="relative p-2.5 bg-orange-50/50 border border-orange-200 rounded-2xl flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-orange-200 bg-white">
                    <img
                      src={photoDataUrl}
                      alt="Attachment Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                      <Check className="w-2.5 h-2.5" /> Ready to Store
                    </span>
                    <p className="text-xs font-serif font-bold text-stone-900 truncate mt-1">
                      {photoTitle}
                    </p>
                    <span className="text-[10px] text-stone-500 block">
                      Size: {photoFileSize} • Local Storage
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoDataUrl(null);
                      setPhotoTitle('');
                      setPhotoFileSize('');
                    }}
                    className="absolute top-2 right-2 p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isDraggingOver
                      ? 'border-orange-500 bg-orange-50 scale-[1.01]'
                      : 'border-orange-200 hover:border-orange-400 bg-orange-50/30 hover:bg-orange-50/60'
                  }`}
                >
                  {isProcessingImage ? (
                    <div className="flex flex-col items-center gap-2 py-2 text-orange-600">
                      <Loader2 className="w-7 h-7 animate-spin" />
                      <span className="text-xs font-semibold">Compressing photo for storage...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2 shadow-2xs">
                        <UploadCloud className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <p className="text-xs font-bold text-stone-900">
                        Click to attach photo or drag &amp; drop here
                      </p>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        Supports PNG, JPG, WebP (persisted in local storage)
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Submit */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-stone-500 hover:text-stone-800 px-3 py-2 cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            id="btn-save-media"
            disabled={
              activeTab === 'video'
                ? !isValidYoutubeUrl || !youtubeId
                : !photoDataUrl || isProcessingImage
            }
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 px-6 text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{activeTab === 'video' ? 'Save Video URL' : 'Save Photo'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
