import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Settings2,
  Menu,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react';
import { ThemeMode, CategoryInfo, VideoItem, PhotoItem, AudioItem, MediaTypeFilter } from '../types';
import { normalizeCategory, translateCategoryToMarathi } from './CategoryPillsRow';

const AUDIO_DEFAULT_CATEGORIES: CategoryInfo[] = [
  { id: 'audio-nikhilanand', name: 'निखिलानंद महाराज', color: '#F59E0B' },
  { id: 'audio-maharaj', name: 'महाराज', color: '#F59E0B' },
  { id: 'audio-prabhupad', name: 'प्रभुपाद', color: '#F59E0B' },
  { id: 'audio-other', name: 'इतर', color: '#F59E0B' },
];

interface CategorySwitchBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  defaultCategory?: string;
  onSetDefaultCategory?: (category: string) => void;
  videos: VideoItem[];
  photos: PhotoItem[];
  audios?: AudioItem[];
  theme?: ThemeMode;
  mediaType?: MediaTypeFilter;
  onOpenCategoryManager?: () => void;
  onReorderCategories?: (reordered: CategoryInfo[]) => void;
  onRenameCategory?: (category: CategoryInfo) => void;
  onDeleteCategory?: (category: CategoryInfo) => void;
  onAddCategory?: (category: CategoryInfo) => void;
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
  onRenameCategory,
  onDeleteCategory,
  onAddCategory,
}) => {
  const [draggedCatId, setDraggedCatId] = useState<string | null>(null);
  const [dragOverCatId, setDragOverCatId] = useState<string | null>(null);

  const isVideos = mediaType === 'videos';
  const isPhotos = mediaType === 'photos';
  const isAudio = mediaType === 'audio';

  // Compute full list ensuring "सर्व" is included first
  const fullCategories: CategoryInfo[] = [
    { id: 'cat-all', name: 'सर्व', color: '#EA580C', iconName: 'Compass' },
    ...(isAudio
      ? [...AUDIO_DEFAULT_CATEGORIES, ...categories.filter((c) =>
          normalizeCategory(c.name) !== 'all' && !AUDIO_DEFAULT_CATEGORIES.some((a) => normalizeCategory(a.name) === normalizeCategory(c.name))
        )]
      : categories.filter((c) => normalizeCategory(c.name) !== 'all')),
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
                : 'bg-[#fff1f2] text-rose-950 border-rose-200/80'
            }`}
          >
            {/* Minimal Drag Handle */}
            <div className="pt-2.5 pb-1 flex justify-center shrink-0">
              <div
                className={`w-10 h-1 rounded-full opacity-50 ${
                  isPhotos ? 'bg-purple-400' : isAudio ? 'bg-amber-400' : 'bg-rose-400'
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
                  : 'border-rose-200'
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

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const name = window.prompt('New category name')?.trim();
                    if (name && !categories.some((c) => normalizeCategory(c.name) === normalizeCategory(name))) {
                      onAddCategory?.({ id: `cat-${Date.now()}`, name, color: isPhotos ? '#A855F7' : isAudio ? '#F59E0B' : '#E11D48' });
                    }
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isPhotos
                      ? 'hover:bg-purple-900/60 text-purple-300'
                      : isAudio
                      ? 'hover:bg-amber-900/60 text-amber-300'
                      : 'hover:bg-rose-100 text-rose-800'
                  }`}
                  aria-label="Add category"
                  title="Add category"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isPhotos
                      ? 'hover:bg-purple-900/60 text-purple-300'
                      : isAudio
                      ? 'hover:bg-amber-900/60 text-amber-300'
                      : 'hover:bg-rose-100 text-rose-800'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Names List with Counts and 3-Line Reorder Handle */}
            <div className="p-2 overflow-y-auto space-y-1.5 flex-1 custom-scrollbar">
              {fullCategories.map((cat) => {
                const isAll = normalizeCategory(cat.name) === 'all';
                const catId = cat.id || cat.name;
                const isCurrentActive =
                  normalizeCategory(selectedCategory) === normalizeCategory(cat.name) ||
                  (normalizeCategory(selectedCategory) === 'all' && normalizeCategory(cat.name) === 'all');
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
                          : 'border-rose-400 ring-2 ring-rose-400/40'
                        : ''
                    } ${
                      isCurrentActive
                        ? isPhotos
                          ? 'bg-purple-900/70 border-purple-400/80 text-white font-semibold shadow-xs'
                          : isAudio
                          ? 'bg-amber-900/70 border-amber-400/80 text-white font-semibold shadow-xs'
                          : 'bg-rose-500 border-rose-600 text-white font-semibold shadow-xs'
                        : isPhotos
                        ? 'bg-purple-950/30 hover:bg-purple-900/40 border-purple-900/40 text-purple-200/90'
                        : isAudio
                        ? 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-900/40 text-amber-200/90'
                        : 'bg-white/80 hover:bg-rose-50/80 border-rose-200 text-rose-950'
                    }`}
                  >
                    {/* Category Name & Item Count clickable area */}
                    <button
                      type="button"
                      onClick={() => handleSelect(cat.name)}
                      className="flex-1 flex items-center gap-2 py-0.5 text-left cursor-pointer min-w-0"
                    >
                      <span className={`w-4 h-4 rounded-md border-2 shrink-0 flex items-center justify-center ${
                        isCurrentActive
                          ? isPhotos
                            ? 'border-purple-400 bg-purple-400/20'
                            : isAudio
                            ? 'border-amber-400 bg-amber-400/20'
                            : 'border-white bg-white/20'
                          : 'border-stone-400'
                      }`}>
                        {isCurrentActive && (
                          <Check className={`w-3 h-3 stroke-[3] ${
                            isPhotos ? 'text-purple-300' : isAudio ? 'text-amber-300' : 'text-white'
                          }`} />
                        )}
                      </span>
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
                              : 'bg-white/20 text-white border border-white/40'
                            : isPhotos
                            ? 'bg-purple-900/40 text-purple-300/80 border border-purple-800/40'
                            : isAudio
                            ? 'bg-amber-900/40 text-amber-300/80 border border-amber-800/40'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {count}
                      </span>
                    </button>

                    {/* Right Indicators: Default Mark & Active Check */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {!isAll && (
                        <>
                          <button
                            type="button"
                            aria-label={`Rename ${cat.name}`}
                            title="Rename category"
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              isPhotos
                                ? 'text-purple-300 hover:bg-purple-900/60'
                                : isAudio
                                ? 'text-amber-300 hover:bg-amber-900/60'
                                : isCurrentActive
                                ? 'text-white hover:bg-white/20'
                                : 'text-rose-700 hover:bg-rose-100'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRenameCategory?.(cat);
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${cat.name}`}
                            title="Delete category"
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              isPhotos
                                ? 'text-rose-300 hover:bg-rose-900/60'
                                : isAudio
                                ? 'text-rose-300 hover:bg-rose-900/60'
                                : isCurrentActive
                                ? 'text-rose-100 hover:bg-white/20'
                                : 'text-red-700 hover:bg-red-100'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete category "${translateCategoryToMarathi(cat.name)}"?`))
                                onDeleteCategory?.(cat);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {/* Active Select Checkmark */}
                      {isCurrentActive ? (
                        <Check
                          className={`w-4 h-4 stroke-[2.5] ${
                            isPhotos ? 'text-purple-300' : isAudio ? 'text-amber-300' : 'text-white'
                          }`}
                        />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      {!isAll && (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center ml-1 text-stone-400 hover:text-stone-200 cursor-grab active:cursor-grabbing shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                          title="Drag to reorder"
                        >
                          <Menu className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
