import React from 'react';
import {
  Search,
  Star,
  Clock,
  X,
  ArrowUpDown,
  Youtube,
  Image as ImageIcon,
} from 'lucide-react';
import { FilterState, SortOption } from '../types';

interface CategoryFilterBarProps {
  filterState: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
  totalVideoCount: number;
  totalPhotoCount: number;
  favoriteCount: number;
  watchLaterCount: number;
  onOpenAddModal: () => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  filterState,
  onFilterChange,
  totalVideoCount,
  totalPhotoCount,
  favoriteCount,
  watchLaterCount,
}) => {
  return (
    <div className="space-y-2 mb-4">
      {/* Top Row: Search Bar & Sort Selector */}
      <div className="flex items-center gap-2">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search videos, photos, mantras..."
            className="w-full pl-8 pr-7 py-2 bg-white border border-orange-200/90 rounded-xl text-base sm:text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all shadow-2xs"
          />
          {filterState.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Menu */}
        <div className="relative shrink-0">
          <select
            value={filterState.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
            className="bg-white border border-orange-200/90 rounded-xl pl-2.5 pr-6 py-2 text-base sm:text-[11px] font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer appearance-none shadow-2xs"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-stone-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Media Type Filter Segment + Quick Filters */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-1 bg-orange-50/60 border border-orange-200/80 rounded-xl">
        {/* Media Type Switcher: Videos / Photos */}
        <div className="flex items-center gap-1 flex-1 min-w-[200px]">
          <button
            type="button"
            onClick={() => onFilterChange({ mediaType: 'videos' })}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filterState.mediaType === 'videos'
                ? 'bg-white text-orange-600 shadow-2xs border border-orange-200/90'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>Videos ({totalVideoCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ mediaType: 'photos' })}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filterState.mediaType === 'photos'
                ? 'bg-white text-orange-600 shadow-2xs border border-orange-200/90'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Photos ({totalPhotoCount})</span>
          </button>
        </div>

        {/* Quick Filter Badges (Starred, Queue) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Starred */}
          <button
            onClick={() =>
              onFilterChange({
                onlyFavorites: !filterState.onlyFavorites,
                onlyWatchLater: false,
              })
            }
            className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold shrink-0 transition-all cursor-pointer rounded-lg ${
              filterState.onlyFavorites
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-white text-stone-700 hover:text-orange-600 border border-orange-200/80'
            }`}
            title="Show Starred Only"
          >
            <Star className={`w-3 h-3 ${filterState.onlyFavorites ? 'fill-white text-white' : 'fill-orange-400 text-orange-500'}`} />
            <span>({favoriteCount})</span>
          </button>

          {/* Queue */}
          <button
            onClick={() =>
              onFilterChange({
                onlyWatchLater: !filterState.onlyWatchLater,
                onlyFavorites: false,
              })
            }
            className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold shrink-0 transition-all cursor-pointer rounded-lg ${
              filterState.onlyWatchLater
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-stone-700 hover:text-emerald-700 border border-orange-200/80'
            }`}
            title="Show Queue Only"
          >
            <Clock className={`w-3 h-3 ${filterState.onlyWatchLater ? 'text-white' : 'text-emerald-600'}`} />
            <span>({watchLaterCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
