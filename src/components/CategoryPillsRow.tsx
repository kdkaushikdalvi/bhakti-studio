import React, { useRef } from 'react';
import {
  Sparkles,
  Music,
  Mic,
  Moon,
  Flame,
  Radio,
  Eye,
  BookOpen,
  Tag,
  Compass,
  Settings2,
  Pin,
} from 'lucide-react';
import { ThemeMode, VideoItem, PhotoItem, AudioItem, MediaTypeFilter, CategoryInfo } from '../types';

interface CategoryPillsRowProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  defaultCategory?: string;
  categories?: CategoryInfo[];
  videos: VideoItem[];
  photos: PhotoItem[];
  audios?: AudioItem[];
  mediaType: MediaTypeFilter;
  theme?: ThemeMode;
  onOpenCategoryManager?: () => void;
}

// Canonical default categories in Marathi (मराठी भक्ती वर्गवारी)
export const DEFAULT_PRESET_CATEGORIES: CategoryInfo[] = [
  { id: 'cat-all', name: 'सर्व', color: '#EA580C', iconName: 'Compass' },
  { id: 'cat-aarti', name: 'आरती', color: '#F57C00', iconName: 'Flame' },
  { id: 'cat-jkp', name: 'जेकेपी', color: '#0D9488', iconName: 'Sparkles' },
  { id: 'cat-bhakti-marg', name: 'भक्ती मार्ग', color: '#8B5CF6', iconName: 'Compass' },
  { id: 'cat-kirtan', name: 'कीर्तन', color: '#E65100', iconName: 'Radio' },
  { id: 'cat-bhajan', name: 'भजन', color: '#FF6F00', iconName: 'Music' },
  { id: 'cat-other', name: 'इतर', color: '#64748B', iconName: 'Tag' },
];

export const normalizeCategory = (cat: string): string => {
  if (!cat) return '';
  const c = cat.trim().toLowerCase();
  if (c === 'all' || c === 'सर्व') return 'all';
  if (c === 'bhajans' || c === 'bhajan' || c === 'भजन' || c === 'भजने') return 'bhajan';
  if (c === 'abhang' || c === 'abhangs' || c === 'अभंग' || c === 'अभंगवाणी') return 'abhang';
  if (c === 'kirtans' || c === 'kirtan' || c === 'कीर्तन' || c === 'कीर्तने') return 'kirtan';
  if (c === 'lectures' || c === 'lecture' || c === 'प्रवचन' || c === 'प्रवचने' || c === 'व्याख्यान') return 'lecture';
  if (c === 'aartis' || c === 'aarti' || c === 'आरती' || c === 'आरत्या') return 'aarti';
  if (c === 'haripath' || c === 'हरिपाठ') return 'haripath';
  if (c === 'stotra' || c === 'stotras' || c === 'स्तोत्र' || c === 'स्तोत्रे') return 'stotra';
  if (c === 'meditation' || c === 'ध्यान' || c === 'चिंतन') return 'meditation';
  if (c === 'mantras' || c === 'mantra' || c === 'मंत्र' || c === 'मंत्रोच्चार') return 'mantra';
  if (c === 'darshan' || c === 'दर्शन') return 'darshan';
  if (c === 'kathas' || c === 'katha' || c === 'कथा' || c === 'हरिकथा' || c === 'पुराणकथा') return 'katha';
  return c;
};

export const translateCategoryToMarathi = (name: string): string => {
  if (!name) return '';
  const norm = normalizeCategory(name);
  switch (norm) {
    case 'all': return 'सर्व';
    case 'bhajan': return 'भजन';
    case 'abhang': return 'अभंग';
    case 'kirtan': return 'कीर्तन';
    case 'lecture': return 'प्रवचन';
    case 'aarti': return 'आरती';
    case 'haripath': return 'हरिपाठ';
    case 'stotra': return 'स्तोत्र';
    case 'meditation': return 'ध्यान';
    case 'mantra': return 'मंत्र';
    case 'darshan': return 'दर्शन';
    case 'katha': return 'कथा';
    default: return name;
  }
};

export const getCategoryIconComponent = (name: string): React.FC<{ className?: string }> => {
  const norm = normalizeCategory(name);
  if (norm === 'all') return Compass;
  if (norm === 'bhajan') return Music;
  if (norm === 'abhang') return Sparkles;
  if (norm === 'kirtan') return Radio;
  if (norm === 'lecture') return Mic;
  if (norm === 'aarti') return Flame;
  if (norm === 'haripath') return BookOpen;
  if (norm === 'stotra') return Sparkles;
  if (norm === 'meditation') return Moon;
  if (norm === 'mantra') return Sparkles;
  if (norm === 'darshan') return Eye;
  if (norm === 'katha') return BookOpen;
  return Tag;
};

export const CategoryPillsRow: React.FC<CategoryPillsRowProps> = ({
  selectedCategory,
  onSelectCategory,
  defaultCategory = '',
  categories = DEFAULT_PRESET_CATEGORIES,
  videos,
  photos,
  audios = [],
  mediaType,
  theme = 'blue',
  onOpenCategoryManager,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Active items pool
  const currentItems = mediaType === 'photos' ? photos : mediaType === 'audio' ? audios : videos;

  // Build the list of categories to display
  // 1. Start with "All"
  // 2. Add all categories from configured category state (custom & presets)
  // 3. Add any categories detected on existing items that might not be in categories array
  const categoryNamesSet = new Set<string>();
  const renderedCategories: { name: string; color?: string; icon: React.FC<{ className?: string }> }[] = [];

  // Always ensure 'सर्व' is first
  renderedCategories.push({
    name: 'सर्व',
    color: '#EA580C',
    icon: Compass,
  });
  categoryNamesSet.add('all');

  // Add categories from the user categories state
  categories.forEach((cat) => {
    const norm = normalizeCategory(cat.name);
    if (norm && !categoryNamesSet.has(norm)) {
      categoryNamesSet.add(norm);
      renderedCategories.push({
        name: translateCategoryToMarathi(cat.name),
        color: cat.color,
        icon: getCategoryIconComponent(cat.name),
      });
    }
  });

  // Check for any legacy or extra item categories
  currentItems.forEach((item) => {
    const cat = item.category?.trim();
    if (cat) {
      const norm = normalizeCategory(cat);
      if (!categoryNamesSet.has(norm)) {
        categoryNamesSet.add(norm);
        renderedCategories.push({
          name: translateCategoryToMarathi(cat),
          color: '#EA580C',
          icon: Tag,
        });
      }
    }
  });

  // Helper to count items
  const getItemCount = (categoryName: string): number => {
    if (normalizeCategory(categoryName) === 'all') {
      return currentItems.length;
    }
    const norm = normalizeCategory(categoryName);
    return currentItems.filter((item) => normalizeCategory(item.category || '') === norm).length;
  };

  const isSelected = (catName: string): boolean => {
    if (normalizeCategory(catName) === 'all') {
      return !selectedCategory || normalizeCategory(selectedCategory) === 'all';
    }
    return normalizeCategory(selectedCategory) === normalizeCategory(catName);
  };

  return (
    <div className="relative w-full -mx-1 px-1 my-1">
      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth whitespace-nowrap"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {renderedCategories.map(({ name, color, icon: IconComponent }) => {
          const active = isSelected(name);
          const count = getItemCount(name);

          return (
            <button
              key={name}
              onClick={() => {
                if (active && normalizeCategory(name) !== 'all') {
                  onSelectCategory('all');
                } else {
                  onSelectCategory(normalizeCategory(name) === 'all' ? 'all' : name);
                }
              }}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all duration-200 active:scale-95 select-none ${
                active
                  ? mediaType === 'audio'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-950/50 font-bold ring-1 ring-amber-400/40'
                    : mediaType === 'photos'
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md shadow-purple-950/50 font-bold ring-1 ring-purple-400/40'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-950/50 font-bold ring-1 ring-teal-400/40'
                  : mediaType === 'audio'
                  ? 'bg-amber-950/40 text-amber-200 border border-amber-800/70 hover:bg-amber-800/50 hover:border-amber-400/50 hover:text-white'
                  : mediaType === 'photos'
                  ? 'bg-purple-950/40 text-purple-200 border border-purple-800/70 hover:bg-purple-800/50 hover:border-purple-400/50 hover:text-white'
                  : 'bg-teal-950/40 text-teal-200 border border-teal-800/70 hover:bg-teal-800/50 hover:border-teal-400/50 hover:text-white'
              }`}
            >
              <IconComponent
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  active
                    ? 'text-white scale-105'
                    : mediaType === 'audio'
                    ? 'text-amber-400 group-hover:scale-110'
                    : mediaType === 'photos'
                    ? 'text-purple-400 group-hover:scale-110'
                    : 'text-teal-400 group-hover:scale-110'
                }`}
              />
              <span>{name}</span>

              {/* Pin Indicator for Default Launch Category */}
              {defaultCategory &&
                (normalizeCategory(defaultCategory) === normalizeCategory(name) ||
                  (defaultCategory === 'all' && normalizeCategory(name) === 'all')) && (
                  <span title="Pinned as default category on launch">
                    <Pin className={`w-2.5 h-2.5 ${active ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'} rotate-45 shrink-0`} />
                  </span>
                )}

              {/* Count badge */}
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                    active
                      ? 'bg-white/25 text-white'
                      : theme === 'blue'
                      ? 'bg-blue-950/60 text-cyan-300'
                      : theme === 'dark'
                      ? 'bg-stone-900/80 text-stone-400'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

      </div>
    </div>
  );
};
