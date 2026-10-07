import React from 'react';
import { motion } from 'motion/react';
import { Video, Image as ImageIcon, Disc3, Plus } from 'lucide-react';
import { MediaTypeFilter, ThemeMode } from '../types';

interface FloatingGlassFooterProps {
  currentMediaType: MediaTypeFilter;
  onSelectMediaType: (type: MediaTypeFilter) => void;
  onOpenPlusMenu: () => void;
  isAddSectionOpen?: boolean;
  videoCount?: number;
  photoCount?: number;
  audioCount?: number;
  theme?: ThemeMode;
}

export const FloatingGlassFooter: React.FC<FloatingGlassFooterProps> = ({
  currentMediaType,
  onSelectMediaType,
  onOpenPlusMenu,
  isAddSectionOpen = false,
  videoCount = 0,
  photoCount = 0,
  audioCount = 0,
}) => {
  const isVideos = currentMediaType === 'videos';
  const isPhotos = currentMediaType === 'photos';

  const tabs: {
    type: MediaTypeFilter;
    label: string;
    icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
    count: number;
  }[] = [
    { type: 'videos', label: 'Videos', icon: Video, count: videoCount },
    { type: 'photos', label: 'Photos', icon: ImageIcon, count: photoCount },
    { type: 'audio', label: 'Audio', icon: Disc3, count: audioCount },
  ];

  return (
    <div
      id="floating-glass-footer-container"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-[520px] px-3.5 pointer-events-none select-none flex items-center justify-center gap-2 sm:gap-2.5"
    >
      {/* 3-Tab Segmented Selection Bar */}
      <div
        id="media-tabs-bottom-bar"
        className={`pointer-events-auto flex-1 flex items-center p-1 sm:p-1.5 rounded-full border shadow-xl backdrop-blur-md transition-colors duration-300 ${
          isVideos
            ? 'bg-white/95 border-rose-200/90 shadow-[0_8px_24px_rgba(244,63,94,0.16)] ring-1 ring-rose-300/40'
            : isPhotos
            ? 'bg-white/95 border-emerald-200/90 shadow-[0_8px_24px_rgba(16,185,129,0.16)] ring-1 ring-emerald-300/40'
            : 'bg-white/95 border-yellow-200/90 shadow-[0_8px_24px_rgba(234,179,8,0.16)] ring-1 ring-yellow-300/40'
        }`}
      >
        {tabs.map((tab) => {
          const isActive = currentMediaType === tab.type;
          const Icon = tab.icon;

          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => onSelectMediaType(tab.type)}
              className={`relative flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? tab.type === 'videos'
                    ? 'text-white shadow-xs'
                    : tab.type === 'photos'
                    ? 'text-white shadow-xs'
                    : 'text-amber-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBottomTabPill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className={`absolute inset-0 rounded-full ${
                    tab.type === 'videos'
                      ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 shadow-md shadow-rose-900/25'
                      : tab.type === 'photos'
                      ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 shadow-md shadow-emerald-900/25'
                      : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 shadow-md shadow-amber-900/15'
                  }`}
                />
              )}
              <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    tab.type === 'audio' && isActive ? 'animate-spin' : ''
                  }`}
                  style={
                    tab.type === 'audio' && isActive
                      ? { animationDuration: '4s' }
                      : undefined
                  }
                />
                <span className="text-[11px] sm:text-xs font-sans tracking-tight">
                  {tab.label}
                </span>
                {tab.count > 0 && (
                  <span
                    className={`text-[9px] px-1 sm:px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                      isActive
                        ? tab.type === 'audio'
                          ? 'bg-amber-950/20 text-amber-950'
                          : 'bg-white/25 text-white'
                        : 'bg-stone-200/70 text-stone-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Floating Plus Add Button */}
      <motion.button
        id="footer-btn-plus"
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onOpenPlusMenu}
        aria-label="Add Media"
        className={`pointer-events-auto flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full cursor-pointer focus:outline-none focus:ring-2 shrink-0 shadow-lg border text-white transition-all ${
          isVideos
            ? 'bg-gradient-to-tr from-rose-500 to-red-600 border-rose-300 shadow-[0_6px_20px_rgba(244,63,94,0.35)]'
            : isPhotos
            ? 'bg-gradient-to-tr from-emerald-500 to-green-600 border-emerald-300 shadow-[0_6px_20px_rgba(16,185,129,0.35)]'
            : 'bg-gradient-to-tr from-amber-400 to-yellow-500 border-yellow-200 text-amber-950 shadow-[0_6px_20px_rgba(234,179,8,0.35)]'
        }`}
        title={isAddSectionOpen ? 'Close Add Section' : `Add ${isVideos ? 'Video' : isPhotos ? 'Photo' : 'Audio'}`}
      >
        <Plus className={`w-4 h-4 stroke-[2.6] transition-transform duration-200 ${isAddSectionOpen ? 'rotate-45' : ''}`} />
      </motion.button>
    </div>
  );
};

