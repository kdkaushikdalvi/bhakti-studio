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
            ? 'bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-500 text-white border-teal-300 ring-teal-400/80 ring-offset-teal-950/40 shadow-[0_8px_24px_rgba(13,148,136,0.45)]'
            : isPhotos
            ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white border-purple-300 ring-purple-400/80 ring-offset-purple-950/40 shadow-[0_8px_24px_rgba(147,51,234,0.45)]'
            : 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-white border-amber-300 ring-amber-400/80 ring-offset-amber-950/40 shadow-[0_8px_24px_rgba(217,119,6,0.45)]'
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
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner"
            >
              {isVideos ? (
                <Video className="w-4 h-4 text-white" />
              ) : isPhotos ? (
                <ImageIcon className="w-4 h-4 text-white" />
              ) : (
                <Disc3 className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '4s' }} />
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
                className="font-bold text-sm sm:text-base font-sans tracking-tight text-white drop-shadow-xs"
              >
                {isVideos ? 'Videos' : isPhotos ? 'Photos' : 'Audio'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Next -> Target Action Pill */}
        <div
          className="flex items-center gap-1 bg-black/25 hover:bg-black/35 backdrop-blur-md border border-white/20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-white shrink-0 transition-colors shadow-inner"
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
              <ArrowRightLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/90 shrink-0" />
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
            ? 'bg-gradient-to-tr from-[#032a24] via-[#083b33] to-[#032a24] text-teal-300 border-teal-500/50 shadow-[0_8px_24px_rgba(4,47,46,0.6)] ring-2 ring-teal-400/40 focus:ring-teal-300/60'
            : isPhotos
            ? 'bg-gradient-to-tr from-[#250942] via-[#3a0d66] to-[#250942] text-purple-300 border-purple-500/50 shadow-[0_8px_24px_rgba(59,7,100,0.6)] ring-2 ring-purple-400/40 focus:ring-purple-300/60'
            : 'bg-gradient-to-tr from-[#2d1603] via-[#422006] to-[#2d1603] text-amber-300 border-amber-500/50 shadow-[0_8px_24px_rgba(69,26,3,0.6)] ring-2 ring-amber-400/40 focus:ring-amber-300/60'
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
        className={`pointer-events-auto flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white cursor-pointer focus:outline-none focus:ring-4 shrink-0 shadow-xl border border-white/30 ${
          isVideos
            ? 'bg-gradient-to-tr from-teal-600 via-emerald-500 to-teal-500 shadow-[0_8px_24px_rgba(13,148,136,0.45)] ring-2 ring-teal-300/60 focus:ring-teal-300/60'
            : isPhotos
            ? 'bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 shadow-[0_8px_24px_rgba(147,51,234,0.45)] ring-2 ring-purple-300/60 focus:ring-purple-300/60'
            : 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-600 shadow-[0_8px_24px_rgba(217,119,6,0.45)] ring-2 ring-amber-300/60 focus:ring-amber-300/60'
        }`}
        title={`Add New ${isVideos ? 'Video' : isPhotos ? 'Photo' : 'Audio'}`}
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </motion.button>
    </div>
  );
};

