import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Pin,
  Check,
  Settings2,
  Menu,
} from 'lucide-react';
import { ThemeMode, CategoryInfo, VideoItem, PhotoItem, AudioItem, MediaTypeFilter } from '../types';
import { normalizeCategory, translateCategoryToMarathi } from './CategoryPillsRow';

interface CategorySwitchBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  defaultCategory: string;
  onSetDefaultCategory: (category: string) => void;
  videos: VideoItem[];
  photos: PhotoItem[];
  audios?: AudioItem[];
  theme?: ThemeMode;
  mediaType?: MediaTypeFilter;
  onOpenCategoryManager?: () => void;
  onReorderCategories?: (reordered: CategoryInfo[]) => void;
}

export const CategorySwitchBottomSheet: React.FC<CategorySwitchBottomSheetProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  defaultCategory,
  onSetDefaultCategory,
  videos,
  photos,
  audios = [],
  mediaType = 'videos',
  onOpenCategoryManager,
  onReorderCategories,
}) => {
  const [draggedCatId, setDraggedCatId] = useState<string | null>(null);
  const [dragOverCatId, setDragOverCatId] = useState<string | null>(null);

  const isVideos = mediaType === 'videos';
  const isPhotos = mediaType === 'photos';
  const isAudio = mediaType === 'audio';

  // Compute full list ensuring "सर्व" is included first
  const fullCategories: CategoryInfo[] = [
    { id: 'cat-all', name: 'सर्व', color: '#EA580C', iconName: 'Compass' },
    ...categories.filter((c) => normalizeCategory(c.name) !== 'all'),
  ];

  // Helper to count items per category
  const getItemCount = (catName: string) => {
    const norm = normalizeCategory(catName);
    if (norm === 'all') {
      return isPhotos ? photos.length : isAudio ? audios.length : videos.length;
    }
    if (isPhotos) {
      return photos.filter((p) => normalizeCategory(p.category) === norm).length;
    }
    if (isAudio) {
      return audios.filter((a) => normalizeCategory(a.category) === norm).length;
    }
    return videos.filter((v) => normalizeCategory(v.category) === norm).length;
  };

  const handleSelect = (catName: string) => {
    const target = normalizeCategory(catName) === 'all' ? 'all' : catName;
    onSelectCategory(target);
    onClose();
  };

  const handleTogglePinDefault = (e: React.MouseEvent, catName: string) => {
    e.stopPropagation();
    const target = normalizeCategory(catName) === 'all' ? 'all' : catName;
    if (normalizeCategory(defaultCategory) === normalizeCategory(target)) {
      onSetDefaultCategory('');
    } else {
      onSetDefaultCategory(target);
    }
  };

  // Reorder logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCatId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== 'cat-all' && dragOverCatId !== id) {
      setDragOverCatId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverCatId(null);
    if (!draggedCatId || draggedCatId === targetId || targetId === 'cat-all' || draggedCatId === 'cat-all') {
      setDraggedCatId(null);
      return;
    }

    const nonAllCategories = categories.filter((c) => normalizeCategory(c.name) !== 'all');
    const sourceIdx = nonAllCategories.findIndex((c) => (c.id || c.name) === draggedCatId);
    const targetIdx = nonAllCategories.findIndex((c) => (c.id || c.name) === targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const updated = [...nonAllCategories];
      const [removed] = updated.splice(sourceIdx, 1);
      updated.splice(targetIdx, 0, removed);
      onReorderCategories?.(updated);
    }
    setDraggedCatId(null);
  };

  const mediaLabel = isPhotos ? 'Photos' : isAudio ? 'Audio' : 'Videos';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="category-switch-bottom-sheet-wrapper"
          className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto"
        >
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Minimal Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className={`relative z-10 w-full max-w-md rounded-t-2xl max-h-[75vh] flex flex-col shadow-2xl border-t overflow-hidden ${
              isPhotos
                ? 'bg-[#140624] text-purple-100 border-purple-800/80'
                : isAudio
                ? 'bg-[#1a0c02] text-amber-100 border-amber-800/80'
                : 'bg-[#021815] text-teal-100 border-teal-800/80'
            }`}
          >
            {/* Minimal Drag Handle */}
            <div className="pt-2.5 pb-1 flex justify-center shrink-0">
              <div
                className={`w-10 h-1 rounded-full opacity-50 ${
                  isPhotos ? 'bg-purple-400' : isAudio ? 'bg-amber-400' : 'bg-teal-400'
                }`}
              />
            </div>

            {/* Minimal Header */}
            <div
              className={`px-4 py-2 flex items-center justify-between border-b shrink-0 ${
                isPhotos
                  ? 'border-purple-900/60'
                  : isAudio
                  ? 'border-amber-900/60'
                  : 'border-teal-900/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight">
                  Categories ({mediaLabel})
                </h3>
                <span className="text-[11px] opacity-60 font-mono">
                  ({fullCategories.length - 1})
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isPhotos
                    ? 'hover:bg-purple-900/60 text-purple-300'
                    : isAudio
                    ? 'hover:bg-amber-900/60 text-amber-300'
                    : 'hover:bg-teal-900/60 text-teal-300'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Names List with Counts and 3-Line Reorder Handle */}
            <div className="p-2 overflow-y-auto space-y-1.5 flex-1 custom-scrollbar">
              {fullCategories.map((cat) => {
                const isAll = normalizeCategory(cat.name) === 'all';
                const catId = cat.id || cat.name;
                const isCurrentActive =
                  normalizeCategory(selectedCategory) === normalizeCategory(cat.name) ||
                  (normalizeCategory(selectedCategory) === 'all' && normalizeCategory(cat.name) === 'all');
                const isPinnedDefault =
                  normalizeCategory(defaultCategory) === normalizeCategory(cat.name) ||
                  (defaultCategory === '' && normalizeCategory(cat.name) === 'all');
                const count = getItemCount(cat.name);
                const isDragging = draggedCatId === catId;
                const isDragOver = dragOverCatId === catId;

                return (
                  <div
                    key={catId}
                    draggable={!isAll}
                    onDragStart={(e) => !isAll && handleDragStart(e, catId)}
                    onDragOver={(e) => !isAll && handleDragOver(e, catId)}
                    onDrop={(e) => !isAll && handleDrop(e, catId)}
                    onDragEnd={() => {
                      setDraggedCatId(null);
                      setDragOverCatId(null);
                    }}
                    className={`w-full py-2 px-2.5 rounded-xl border flex items-center justify-between transition-all select-none ${
                      isDragging ? 'opacity-40 scale-[0.98]' : 'opacity-100'
                    } ${
                      isDragOver
                        ? isPhotos
                          ? 'border-purple-400 ring-2 ring-purple-400/40'
                          : isAudio
                          ? 'border-amber-400 ring-2 ring-amber-400/40'
                          : 'border-teal-400 ring-2 ring-teal-400/40'
                        : ''
                    } ${
                      isCurrentActive
                        ? isPhotos
                          ? 'bg-purple-900/70 border-purple-400/80 text-white font-semibold shadow-xs'
                          : isAudio
                          ? 'bg-amber-900/70 border-amber-400/80 text-white font-semibold shadow-xs'
                          : 'bg-teal-900/70 border-teal-400/80 text-white font-semibold shadow-xs'
                        : isPhotos
                        ? 'bg-purple-950/30 hover:bg-purple-900/40 border-purple-900/40 text-purple-200/90'
                        : isAudio
                        ? 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-900/40 text-amber-200/90'
                        : 'bg-teal-950/30 hover:bg-teal-900/40 border-teal-900/40 text-teal-200/90'
                    }`}
                  >
                    {/* Left 3-Line Reorder Handle */}
                    {!isAll ? (
                      <div
                        className="p-1 mr-1.5 text-stone-400 hover:text-stone-200 cursor-grab active:cursor-grabbing shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                        title="Drag 3 lines to reorder"
                      >
                        <Menu className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-3.5 mr-1.5 shrink-0" />
                    )}

                    {/* Category Name & Item Count clickable area */}
                    <button
                      type="button"
                      onClick={() => handleSelect(cat.name)}
                      className="flex-1 flex items-center gap-2 py-0.5 text-left cursor-pointer min-w-0"
                    >
                      <span className="text-sm font-medium tracking-tight truncate">
                        {translateCategoryToMarathi(cat.name)}
                      </span>
                      {/* Item Count Badge */}
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${
                          isCurrentActive
                            ? isPhotos
                              ? 'bg-purple-950/90 text-purple-200 border border-purple-400/50'
                              : isAudio
                              ? 'bg-amber-950/90 text-amber-200 border border-amber-400/50'
                              : 'bg-teal-950/90 text-teal-200 border border-teal-400/50'
                            : isPhotos
                            ? 'bg-purple-900/40 text-purple-300/80 border border-purple-800/40'
                            : isAudio
                            ? 'bg-amber-900/40 text-amber-300/80 border border-amber-800/40'
                            : 'bg-teal-900/40 text-teal-300/80 border border-teal-800/40'
                        }`}
                      >
                        {count}
                      </span>
                    </button>

                    {/* Right Indicators: Default Mark & Active Check */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {/* Default Mark / Toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleTogglePinDefault(e, cat.name)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          isPinnedDefault
                            ? 'text-amber-400 bg-amber-400/15'
                            : 'text-stone-500 hover:text-stone-300 opacity-40 hover:opacity-100'
                        }`}
                        title={
                          isPinnedDefault
                            ? `Pinned default for ${mediaLabel} (Click to unset)`
                            : `Pin as default category for ${mediaLabel}`
                        }
                      >
                        <Pin
                          className={`w-3.5 h-3.5 ${
                            isPinnedDefault ? 'fill-current' : ''
                          }`}
                        />
                      </button>

                      {/* Active Select Checkmark */}
                      {isCurrentActive ? (
                        <Check
                          className={`w-4 h-4 stroke-[2.5] ${
                            isPhotos ? 'text-purple-300' : isAudio ? 'text-amber-300' : 'text-teal-300'
                          }`}
                        />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Minimal Footer */}
            {onOpenCategoryManager && (
              <div
                className={`py-2 px-3 border-t flex items-center justify-between shrink-0 text-[11px] ${
                  isPhotos
                    ? 'border-purple-900/60 bg-purple-950/40 text-purple-300/80'
                    : isAudio
                    ? 'border-amber-900/60 bg-amber-950/40 text-amber-300/80'
                    : 'border-teal-900/60 bg-teal-950/40 text-teal-300/80'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Pin = Default on launch</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCategoryManager();
                  }}
                  className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer px-2 py-0.5 rounded-md ${
                    isPhotos
                      ? 'hover:text-purple-100 hover:bg-purple-900/60 text-purple-300'
                      : isAudio
                      ? 'hover:text-amber-100 hover:bg-amber-900/60 text-amber-300'
                      : 'hover:text-teal-100 hover:bg-teal-900/60 text-teal-300'
                  }`}
                >
                  <Settings2 className="w-3 h-3" />
                  <span>Manage</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

