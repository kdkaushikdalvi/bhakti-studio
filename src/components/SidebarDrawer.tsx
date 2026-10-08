import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { MediaTypeFilter } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentMediaType?: MediaTypeFilter;
  onFilterMediaType?: (type: MediaTypeFilter) => void;
  videoCount?: number;
  photoCount?: number;
  audioCount?: number;
  onClearCache: () => void;
  onOpenInstallPwa: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  currentMediaType = 'videos',
  onFilterMediaType,
  videoCount = 0,
  photoCount = 0,
  audioCount = 0,
  onClearCache,
  onOpenInstallPwa,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const isVideos = currentMediaType === 'videos';
  const isPhotos = currentMediaType === 'photos';
  const isAudio = currentMediaType === 'audio';

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="sidebar-drawer-root" className="fixed inset-0 z-50 flex pointer-events-auto font-sans">
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Container: Light background */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-[280px] sm:w-[320px] h-full shadow-2xl flex flex-col z-10 bg-[#FAF6EE] border-r border-stone-200 text-black overflow-hidden"
          >
            {/* Header: Subtle light tone, Clean Border, Black Text */}
            <div className="p-4 border-b border-stone-200/90 bg-[#F4EFE6]/80 flex items-center justify-between shrink-0">
              <h3 className="font-serif font-bold text-base text-black tracking-wide leading-tight">
                Bhakti
              </h3>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-stone-200/60 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body: Light background, Media Type on top, Actions at the bottom */}
            <div className="flex-1 flex flex-col justify-between p-4 bg-[#FAF6EE] overflow-y-auto">
              {/* SECTION: MEDIA TYPE */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-1">
                  MEDIA TYPE
                </div>

                <div className="space-y-2">
                  {/* Videos */}
                  <button
                    onClick={() => {
                      if (onFilterMediaType) onFilterMediaType('videos');
                      onClose();
                    }}
                    className={`w-full py-2.5 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isVideos
                        ? 'bg-white border-neutral-900 text-black font-semibold shadow-xs ring-1 ring-neutral-900/10'
                        : 'bg-white/85 border-stone-200 text-neutral-800 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <span className="text-sm font-medium">Videos</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-bold border transition-colors ${
                        isVideos
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}
                    >
                      {videoCount}
                    </span>
                  </button>

                  {/* Audio */}
                  <button
                    onClick={() => {
                      if (onFilterMediaType) onFilterMediaType('audio');
                      onClose();
                    }}
                    className={`w-full py-2.5 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isAudio
                        ? 'bg-white border-neutral-900 text-black font-semibold shadow-xs ring-1 ring-neutral-900/10'
                        : 'bg-white/85 border-stone-200 text-neutral-800 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <span className="text-sm font-medium">Audio</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-bold border transition-colors ${
                        isAudio
                          ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {audioCount}
                    </span>
                  </button>

                  {/* Photos */}
                  <button
                    onClick={() => {
                      if (onFilterMediaType) onFilterMediaType('photos');
                      onClose();
                    }}
                    className={`w-full py-2.5 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isPhotos
                        ? 'bg-white border-neutral-900 text-black font-semibold shadow-xs ring-1 ring-neutral-900/10'
                        : 'bg-white/85 border-stone-200 text-neutral-800 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <span className="text-sm font-medium">Photos</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-bold border transition-colors ${
                        isPhotos
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {photoCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* SECTION: ACTIONS (Moved to bottom, no subtext) */}
              <div className="space-y-2 pt-4 mt-auto">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-1">
                  ACTIONS
                </div>

                <div className="space-y-2">
                  {/* Option 1: Clear cache */}
                  <button
                    id="drawer-clear-cache-btn"
                    onClick={() => {
                      onClearCache();
                      showToast('Cache cleared successfully');
                    }}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-stone-200 bg-white/85 hover:bg-white hover:border-stone-300 text-left flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] shadow-2xs"
                  >
                    <span className="text-sm font-semibold text-black">Clear cache</span>
                  </button>

                  {/* Option 2: Install app [PWA] */}
                  <button
                    onClick={() => {
                      onOpenInstallPwa();
                      onClose();
                    }}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-stone-200 bg-white/85 hover:bg-white hover:border-stone-300 text-left flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] shadow-2xs"
                  >
                    <span className="text-sm font-semibold text-black">Install app [PWA]</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
              <div className="absolute bottom-4 left-4 right-4 bg-neutral-900 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fadeIn z-30">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
