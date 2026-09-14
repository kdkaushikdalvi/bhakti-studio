import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Image as ImageIcon, Disc3, Plus, ArrowRightLeft, Layers } from 'lucide-react';
import { MediaTypeFilter, ThemeMode } from '../types';

interface FloatingGlassFooterProps {
  currentMediaType: MediaTypeFilter;
  onSelectMediaType: (type: MediaTypeFilter) => void;
  onOpenPlusMenu: () => void;
  onOpenCategorySwitch?: () => void;
  selectedCategory?: string;
  defaultCategory?: string;
  videoCount?: number;
  photoCount?: number;
  audioCount?: number;
  theme?: ThemeMode;
}

export const FloatingGlassFooter: React.FC<FloatingGlassFooterProps> = ({
  currentMediaType,
  onSelectMediaType,
  onOpenPlusMenu,
  onOpenCategorySwitch,
  selectedCategory = 'all',
  defaultCategory = '',
  videoCount = 0,
  photoCount = 0,
  audioCount = 0,
  theme = 'blue',
}) => {
  const isVideos = currentMediaType === 'videos';
  const isPhotos = currentMediaType === 'photos';
  const isAudio = currentMediaType === 'audio';

  const getNextMediaType = (): MediaTypeFilter => {
    if (isVideos) return 'audio';
    if (isAudio) return 'photos';
    return 'videos';
  };

  const nextType = getNextMediaType();
  const nextLabel = nextType === 'videos' ? 'Videos' : nextType === 'audio' ? 'Audio' : 'Photos';

  const handleToggle = () => {
    onSelectMediaType(nextType);
  };

  return (
    <div
      id="floating-glass-footer-container"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-[520px] px-3.5 pointer-events-none select-none flex items-center justify-center gap-2 sm:gap-2.5"
    >
      {/* Single Dynamic Media Toggle Capsule */}
      <motion.button
        id="single-media-toggle-pill"
        type="button"
        onClick={handleToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        aria-label={`Current: ${isVideos ? 'Videos' : isPhotos ? 'Photos' : 'Audio'}. Click to switch to ${nextLabel}`}
        className={`pointer-events-auto flex-1 flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full cursor-pointer transition-all duration-300 shadow-xl border-2 ring-2 ring-offset-1 select-none overflow-hidden relative ${
          isVideos
            ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white border-rose-300 ring-rose-400/80 ring-offset-rose-950/20 shadow-[0_8px_24px_rgba(244,63,94,0.4)]'
            : isPhotos
            ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 text-emerald-950 border-emerald-200 ring-emerald-400/80 ring-offset-emerald-100 shadow-[0_8px_24px_rgba(16,185,129,0.35)]'
            : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-amber-950 border-yellow-200 ring-yellow-400/80 ring-offset-yellow-100 shadow-[0_8px_24px_rgba(234,179,8,0.35)]'
        }`}
      >
        {/* Left Side: Circular Icon + Title + Devanagari/Sub Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMediaType}
              initial={{ rotate: -30, scale: 0.7, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 30, scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-md flex items-center justify-center shrink-0 border shadow-inner ${
                isAudio
                  ? 'bg-amber-950/15 border-amber-950/20'
                  : isPhotos
                  ? 'bg-emerald-950/15 border-emerald-950/20'
                  : 'bg-white/20 border-white/30'
              }`}
            >
              {isVideos ? (
                <Video className="w-4 h-4 text-white" />
              ) : isPhotos ? (
                <ImageIcon className="w-4 h-4 text-emerald-950" />
              ) : (
                <Disc3 className="w-4 h-4 text-amber-950 animate-spin" style={{ animationDuration: '4s' }} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentMediaType}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={`font-bold text-sm sm:text-base font-sans tracking-tight drop-shadow-xs ${
                  isAudio
                    ? 'text-amber-950'
                    : isPhotos
                    ? 'text-emerald-950'
                    : 'text-white'
                }`}
              >
                {isVideos ? 'Videos' : isPhotos ? 'Photos' : 'Audio'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Next -> Target Action Pill */}
        <div
          className={`flex items-center gap-1 backdrop-blur-md border px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0 transition-colors shadow-inner ${
            isAudio
              ? 'bg-amber-950/15 hover:bg-amber-950/25 border-amber-950/20 text-amber-950'
              : isPhotos
              ? 'bg-emerald-950/15 hover:bg-emerald-950/25 border-emerald-950/20 text-emerald-950'
              : 'bg-black/25 hover:bg-black/35 border-white/20 text-white'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={`next-${nextType}`}
              initial={{ x: 6, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -6, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Next ➔ {nextLabel}</span>
              <ArrowRightLeft className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isAudio ? 'text-amber-950' : isPhotos ? 'text-emerald-950' : 'text-white/90'}`} />
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Floating Category Icon Button (Next to + Add Button) */}
      <motion.button
        id="footer-btn-category-switch"
        type="button"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        onClick={onOpenCategorySwitch}
        aria-label="Switch Category"
        className={`pointer-events-auto flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full cursor-pointer focus:outline-none focus:ring-4 shrink-0 shadow-xl border select-none relative ${
          isVideos
            ? 'bg-gradient-to-tr from-rose-600 via-red-500 to-rose-600 text-white border-rose-300 shadow-[0_8px_24px_rgba(244,63,94,0.4)] ring-2 ring-rose-300/60 focus:ring-rose-300/60'
            : isPhotos
            ? 'bg-gradient-to-tr from-emerald-400 via-green-300 to-emerald-400 text-emerald-950 border-emerald-200 shadow-[0_8px_24px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400/60 focus:ring-emerald-300/60'
            : 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-yellow-400 text-amber-950 border-yellow-200 shadow-[0_8px_24px_rgba(234,179,8,0.4)] ring-2 ring-yellow-400/60 focus:ring-yellow-300/60'
        }`}
        title={
          selectedCategory && selectedCategory !== 'all'
            ? `Category: ${selectedCategory} (Click to switch or pin)`
            : 'Categories (Click to switch or pin default)'
        }
      >
        <Layers className="w-5 h-5 stroke-[2.2]" />
        {defaultCategory && defaultCategory !== 'all' && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs border border-white">
            📌
          </span>
        )}
      </motion.button>

      {/* Modern Floating Circular Add Button */}
      <motion.button
        id="footer-btn-plus"
        type="button"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        onClick={onOpenPlusMenu}
        aria-label="Add Media"
        className={`pointer-events-auto flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full cursor-pointer focus:outline-none focus:ring-4 shrink-0 shadow-xl border ${
          isVideos
            ? 'bg-gradient-to-tr from-rose-500 via-red-500 to-rose-600 text-white border-white/30 shadow-[0_8px_24px_rgba(244,63,94,0.45)] ring-2 ring-rose-300/60 focus:ring-rose-300/60'
            : isPhotos
            ? 'bg-gradient-to-tr from-emerald-400 via-green-400 to-emerald-500 text-emerald-950 border-emerald-200 shadow-[0_8px_24px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400/60 focus:ring-emerald-300/60'
            : 'bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-amber-950 border-yellow-200 shadow-[0_8px_24px_rgba(234,179,8,0.4)] ring-2 ring-yellow-400/60 focus:ring-yellow-300/60'
        }`}
        title={`Add New ${isVideos ? 'Video' : isPhotos ? 'Photo' : 'Audio'}`}
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </motion.button>
    </div>
  );
};

