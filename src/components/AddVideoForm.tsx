import React, { useState, useEffect } from 'react';
import {
  Youtube,
  Sparkles,
  Tag,
  FolderPlus,
  Clock,
  FileText,
  Check,
  AlertCircle,
  Link,
  Plus,
  X,
  Loader2,
  Bookmark,
  ChevronDown,
  Flame,
} from 'lucide-react';
import { CategoryInfo, VideoItem } from '../types';
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  fetchYouTubeMetadata,
} from '../utils/youtube';

interface AddVideoFormProps {
  categories: CategoryInfo[];
  onAddVideo: (video: Omit<VideoItem, 'id' | 'createdAt'>) => void;
  onAddCategory: (category: CategoryInfo) => void;
  initialUrl?: string;
  initialCategory?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const AddVideoForm: React.FC<AddVideoFormProps> = ({
  categories,
  onAddVideo,
  onAddCategory,
  initialUrl = '',
  initialCategory = '',
  onClose,
  isModal = false,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState('');
  const [channelTitle, setChannelTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || (categories.length > 0 ? categories[0].name : 'Sadhana')
  );
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#FF6F00');

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  
  // Timestamps list
  const [timestamps, setTimestamps] = useState<{ time: number; label: string }[]>([]);
  const [tsInputTime, setTsInputTime] = useState('');
  const [tsInputLabel, setTsInputLabel] = useState('');

  // States
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Saffron & Colorful palette for new categories
  const SAFFRON_PALETTE = [
    '#FF6F00', '#FF9100', '#EA580C', '#D97706', '#059669',
    '#7C3AED', '#E11D48', '#2563EB', '#0D9488', '#B45309'
  ];

  // Validate and parse URL whenever it changes
  useEffect(() => {
    if (!url.trim()) {
      setIsValidUrl(false);
      setYoutubeId(null);
      setThumbnailUrl('');
      setErrorMessage('');
      return;
    }

    const id = extractYouTubeId(url);
    if (id) {
      setIsValidUrl(true);
      setYoutubeId(id);
      const thumb = getYouTubeThumbnail(id, 'hq');
      setThumbnailUrl(thumb);
      setErrorMessage('');

      if (!title) {
        setIsLoadingMeta(true);
        fetchYouTubeMetadata(url).then((meta) => {
          if (meta.title) {
            setTitle(meta.title);
          } else {
            setTitle(`YouTube Video (${id})`);
          }
          if (meta.author_name) {
            setChannelTitle(meta.author_name);
          }
          setIsLoadingMeta(false);
        });
      }
    } else {
      setIsValidUrl(false);
      setYoutubeId(null);
      setThumbnailUrl('');
      if (url.length > 10) {
        setErrorMessage('Please enter a valid YouTube video address');
      }
    }
  }, [url]);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
      }
    } catch {
      // Ignore
    }
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddTimestamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tsInputTime || !tsInputLabel) return;
    
    const parts = tsInputTime.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (!isNaN(Number(tsInputTime))) {
      seconds = Number(tsInputTime);
    }

    setTimestamps([...timestamps, { time: seconds, label: tsInputLabel.trim() }]);
    setTsInputTime('');
    setTsInputLabel('');
  };

  const handleRemoveTimestamp = (index: number) => {
    setTimestamps(timestamps.filter((_, i) => i !== index));
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setSelectedCategory(name);
      setIsCreatingNewCategory(false);
      return;
    }

    const newCat: CategoryInfo = {
      id: `cat-${Date.now()}`,
      name,
      color: newCategoryColor,
      description: `Collection for ${name}`,
    };

    onAddCategory(newCat);
    setSelectedCategory(name);
    setIsCreatingNewCategory(false);
    setNewCategoryName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeId || !isValidUrl) {
      setErrorMessage('A valid YouTube link is required to archive.');
      return;
    }

    const videoCategory = selectedCategory || 'Sadhana';
    const videoTitle = title.trim() || `Recorded Practice (${youtubeId})`;

    onAddVideo({
      youtubeId,
      url: url.trim(),
      title: videoTitle,
      channelTitle: channelTitle.trim() || 'Spiritual Guide / Channel',
      category: videoCategory,
      tags: tags.length > 0 ? tags : [videoCategory],
      notes: notes.trim(),
      timestamps,
      isFavorite: false,
      isWatchLater: false,
      thumbnailUrl: thumbnailUrl || getYouTubeThumbnail(youtubeId, 'hq'),
    });

    setSuccessMessage(`Archived "${videoTitle.slice(0, 28)}..." in ${videoCategory}`);
    setTimeout(() => {
      setSuccessMessage('');
      if (onClose) {
        onClose();
      }
    }, 1200);

    if (!isModal) {
      setUrl('');
      setTitle('');
      setChannelTitle('');
      setTags([]);
      setNotes('');
      setTimestamps([]);
    }
  };

  return (
    <div
      id="add-video-panel"
      className={`bg-white text-stone-900 border border-orange-200/90 rounded-2xl shadow-sm ${
        isModal ? 'p-5 sm:p-6 max-h-[90vh] overflow-y-auto' : 'p-5 mb-6'
      }`}
    >
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-orange-100">
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
            <h3 className="text-base font-serif italic font-bold text-stone-900">
              Add YouTube Video
            </h3>
            <span className="text-[10px] text-orange-700/80 font-medium block">
              Add to your spiritual video archive
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-orange-50 transition-colors rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 rounded-xl">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* YouTube URL input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-video-url" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <span>YouTube Video URL</span>
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
              id="input-video-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=Ywd9xNcvAFM"
              className="w-full bg-orange-50/40 border border-orange-200/90 rounded-xl px-3.5 py-2.5 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white text-stone-900 placeholder-stone-400 transition-all font-mono"
              required
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute right-2.5 text-stone-400 hover:text-stone-700 p-1"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {isValidUrl && (
            <p className="mt-1 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Valid YouTube ID: <strong>{youtubeId}</strong></span>
            </p>
          )}
        </div>

        {/* Category Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <span>Category</span>
              <span className="text-orange-500">*</span>
            </label>
            {!isCreatingNewCategory && (
              <button
                type="button"
                onClick={() => setIsCreatingNewCategory(true)}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider"
              >
                + New Category
              </button>
            )}
          </div>

          {isCreatingNewCategory ? (
            <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2.5">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name (e.g. Sadhana)"
                className="w-full bg-white border border-orange-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                autoFocus
              />
              <div className="flex items-center gap-1.5 pt-0.5">
                {SAFFRON_PALETTE.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCategoryColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      newCategoryColor === c ? 'scale-125 ring-2 ring-stone-900' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingNewCategory(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-lg"
                >
                  Save Category
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-orange-50/40 border border-orange-200/90 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white appearance-none cursor-pointer text-stone-900 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name} className="bg-white text-stone-900">
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Live Preview Card if URL is parsed */}
        {isValidUrl && youtubeId && (
          <div className="p-3 bg-gradient-to-r from-orange-50/80 to-amber-50/60 border border-orange-200/90 rounded-xl flex gap-3 items-center">
            <div className="relative w-24 aspect-video bg-orange-100 rounded-lg overflow-hidden shrink-0 border border-orange-200">
              <img
                src={thumbnailUrl}
                alt="Thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getYouTubeThumbnail(youtubeId, 'mq');
                }}
              />
              <div className="absolute bottom-1 left-1 bg-black/75 px-1 py-0.2 rounded text-[7px] text-white uppercase font-bold">
                {selectedCategory}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] uppercase tracking-wider text-orange-700 font-bold">
                  Video Preview
                </span>
                {isLoadingMeta && (
                  <span className="text-[10px] text-orange-600 flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Fetching...
                  </span>
                )}
              </div>
              <h4 className="text-xs font-serif font-bold text-stone-900 truncate">
                {title || 'Loading title...'}
              </h4>
              <p className="text-[10px] text-stone-600 truncate">
                {channelTitle || 'Spiritual Guide / Channel'}
              </p>
            </div>
          </div>
        )}

        {/* Title & Channel */}
        <div className="space-y-3">
          <div>
            <label htmlFor="input-video-title" className="block text-xs font-semibold text-stone-700 mb-1">
              Title / Topic
            </label>
            <input
              id="input-video-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sadhana Practice &amp; Inner Awakening Discourse"
              className="w-full bg-orange-50/40 border border-orange-200/90 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white text-stone-900 placeholder-stone-400 font-serif"
            />
          </div>

          <div>
            <label htmlFor="input-channel-title" className="block text-xs font-semibold text-stone-700 mb-1">
              Speaker / Channel / Tradition
            </label>
            <input
              id="input-channel-title"
              type="text"
              value={channelTitle}
              onChange={(e) => setChannelTitle(e.target.value)}
              placeholder="e.g. Spiritual Discourses &amp; Sadhana"
              className="w-full bg-orange-50/40 border border-orange-200/90 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white text-stone-900 placeholder-stone-400"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Tags / Keywords
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-orange-50/30 border border-orange-200/90 rounded-xl min-h-[38px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-orange-200 text-orange-900 text-[11px] font-medium"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-stone-400 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tags.length === 0 ? "Type tag (e.g. Sadhana) and press Enter" : "Add tag..."}
              className="flex-1 bg-transparent border-none text-xs text-stone-900 placeholder-stone-400 focus:outline-none min-w-[130px] py-0.5"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-stone-500 hover:text-stone-800 px-3 py-2"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            id="btn-save-video"
            disabled={!isValidUrl || !youtubeId}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 px-6 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            Save Video Entry
          </button>
        </div>
      </form>
    </div>
  );
};
