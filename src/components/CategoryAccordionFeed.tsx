import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, Video as VideoIcon, Search, Sparkles } from 'lucide-react';
import { VideoItem, CategoryInfo } from '../types';
import { VideoCard } from './VideoCard';
import { VideoListItem } from './VideoListItem';
import { normalizeCategory, translateCategoryToMarathi } from './CategoryPillsRow';

interface CategoryAccordionFeedProps {
  categories: CategoryInfo[];
  videos: VideoItem[];
  expandedCategory: string | null;
  onToggleCategory: (categoryName: string) => void;
  viewMode: 'grid' | 'list' | 'split';
  searchQuery?: string;
  onlyFavorites?: boolean;
  onlyWatchLater?: boolean;
  sortBy?: 'newest' | 'oldest' | 'title_asc' | 'title_desc';
  onPlayVideo: (video: VideoItem, startTimestamp?: number) => void;
  onToggleFavoriteVideo: (id: string, e: React.MouseEvent) => void;
  onToggleWatchLater: (id: string, e: React.MouseEvent) => void;
  onEditVideo: (video: VideoItem) => void;
  onDeleteVideo: (id: string) => void;
  onAddVideoToCategory: (categoryName: string) => void;
}

export const CategoryAccordionFeed: React.FC<CategoryAccordionFeedProps> = ({
  categories,
  videos,
  expandedCategory,
  onToggleCategory,
  viewMode,
  searchQuery = '',
  onlyFavorites = false,
  onlyWatchLater = false,
  sortBy = 'newest',
  onPlayVideo,
  onToggleFavoriteVideo,
  onToggleWatchLater,
  onEditVideo,
  onDeleteVideo,
  onAddVideoToCategory,
}) => {
  // Normalize and build list of categories to display as accordion sections
  // Excludes the virtual 'All' category and includes any custom categories present on videos
  const accordionCategories = useMemo(() => {
    // Filter out 'all' from preset categories
    const filtered = categories.filter((c) => normalizeCategory(c.name) !== 'all');

    // Collect any distinct category present in videos that isn't already in list
    const existingNorms = new Set(filtered.map((c) => normalizeCategory(c.name)));
    const extraCategories: CategoryInfo[] = [];

    videos.forEach((v) => {
      const norm = normalizeCategory(v.category || '');
      if (norm && norm !== 'all' && !existingNorms.has(norm)) {
        existingNorms.add(norm);
        extraCategories.push({
          id: `cat-extra-${norm}`,
          name: translateCategoryToMarathi(v.category || ''),
          color: '#0D9488',
          iconName: 'Tag',
        });
      }
    });

    return [...filtered, ...extraCategories].map((c) => ({
      ...c,
      name: translateCategoryToMarathi(c.name),
    }));
  }, [categories, videos]);

  // Helper to filter videos for a specific category based on current filters
  const getVideosForCategory = (catName: string): VideoItem[] => {
    const targetNorm = normalizeCategory(catName);
    let result = videos.filter((v) => {
      const catNorm = normalizeCategory(v.category || '');
      if (catNorm === targetNorm) return true;
      if (v.tags && v.tags.some((t) => normalizeCategory(t) === targetNorm)) {
        return true;
      }
      return false;
    });

    // Apply search query if present
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.tags?.some((t) => t.toLowerCase().includes(q)) ||
          v.notes?.toLowerCase().includes(q) ||
          v.channelTitle?.toLowerCase().includes(q)
      );
    }

    // Apply favorites filter
    if (onlyFavorites) {
      result = result.filter((v) => v.isFavorite);
    }

    // Apply watch later filter
    if (onlyWatchLater) {
      result = result.filter((v) => v.isWatchLater);
    }

    // Sort items
    return result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'title_desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });
  };

  return (
    <div className="space-y-2.5 select-none" id="video-categories-accordion-feed">
      {accordionCategories.map((category) => {
        const catVideos = getVideosForCategory(category.name);
        // Check if this category is currently expanded
        const isExpanded = expandedCategory !== null && expandedCategory.split('|').some(
          (name) => normalizeCategory(name) === normalizeCategory(category.name)
        );

        const catColor = category.color || '#E11D48';

        return (
          <div
            key={category.id || category.name}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isExpanded
                ? 'bg-rose-50/90 border-rose-300 shadow-[0_4px_20px_rgba(244,63,94,0.12)] ring-1 ring-rose-400/30'
                : 'bg-white/90 border-rose-200/90 hover:bg-rose-50/70 hover:border-rose-300 shadow-xs'
            }`}
          >
            {/* Accordion Section Header */}
            <button
              id={`accordion-header-${category.id || category.name.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => onToggleCategory(category.name)}
              aria-expanded={isExpanded}
              className="w-full flex items-center justify-between px-3.5 sm:px-4 py-3 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 transition-colors"
            >
              {/* Left: Category Icon + Title */}
              <div className="flex items-center min-w-0 pr-2">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-sans font-semibold text-rose-950 truncate tracking-wide">
                    {category.name}
                  </h3>
                </div>
              </div>

              {/* Right: Pill Badge + Animated Chevron */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-full border bg-white text-rose-800 border-rose-200/80 shadow-2xs">
                  {catVideos.length}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 ${
                    isExpanded
                      ? 'rotate-180 bg-rose-200/70 text-rose-800'
                      : 'text-rose-400 hover:text-rose-700'
                  }`}
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
            </button>

            {/* Accordion Body Content */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-3.5 sm:px-4 pb-4 pt-1 border-t border-rose-200/70">
                    {catVideos.length === 0 ? (
                      /* Appropriate Empty State inside the expanded accordion */
                      <div className="py-7 px-3 text-center flex flex-col items-center justify-center space-y-2.5 bg-white/80 rounded-xl border border-rose-200/60 my-1">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner border"
                          style={{
                            backgroundColor: `${catColor}15`,
                            borderColor: `${catColor}35`,
                            color: catColor,
                          }}
                        >
                          {searchQuery ? (
                            <Search className="w-5 h-5" />
                          ) : (
                            <VideoIcon className="w-5 h-5" />
                          )}
                        </div>

                        <div className="space-y-1 max-w-[280px]">
                          <h4 className="text-xs sm:text-sm font-semibold text-rose-950 font-serif">
                            {searchQuery
                              ? `No matching videos in "${category.name}"`
                              : `No videos in "${category.name}" yet`}
                          </h4>
                          <p className="text-[11px] text-rose-700/80 leading-relaxed">
                            {searchQuery
                              ? `No videos match "${searchQuery}" under ${category.name}.`
                              : `Add devotional YouTube bhajans, kathas, or darshan to this category.`}
                          </p>
                        </div>

                        {!searchQuery && (
                          <button
                            type="button"
                            id={`btn-add-video-to-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => onAddVideoToCategory(category.name)}
                            className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer shadow-sm active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Add Video to {category.name}</span>
                          </button>
                        )}
                      </div>
                    ) : viewMode === 'list' ? (
                      <div className="space-y-2.5 pt-1">
                        {catVideos.map((video) => (
                          <VideoListItem
                            key={video.id}
                            video={video}
                            onPlay={(v) => onPlayVideo(v)}
                            onToggleFavorite={onToggleFavoriteVideo}
                            onToggleWatchLater={onToggleWatchLater}
                            onEdit={(v) => onEditVideo(v)}
                            onDelete={onDeleteVideo}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {catVideos.map((video) => (
                          <VideoCard
                            key={video.id}
                            video={video}
                            onPlay={(v) => onPlayVideo(v)}
                            onToggleFavorite={onToggleFavoriteVideo}
                            onToggleWatchLater={onToggleWatchLater}
                            onEdit={(v) => onEditVideo(v)}
                            onDelete={onDeleteVideo}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
