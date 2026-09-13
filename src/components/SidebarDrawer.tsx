import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  RotateCw,
  Sparkles,
  Trash2,
  Youtube,
  Image as ImageIcon,
  Disc3,
  Check,
  LayoutGrid,
  List,
  Columns,
  Layers,
  Settings,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { ThemeMode, ViewMode, MediaTypeFilter } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  currentMediaType?: MediaTypeFilter;
  onFilterMediaType?: (type: MediaTypeFilter) => void;
  videoCount?: number;
  photoCount?: number;
  audioCount?: number;
  onRefreshApp: () => void;
  onClearCache: () => void;
  onDeleteAllData: () => void;
  onOpenInstallPwa: () => void;
  onOpenCategoryManager?: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  theme = 'blue',
  viewMode = 'list',
  onViewModeChange,
  currentMediaType = 'videos',
  onFilterMediaType,
  videoCount = 0,
  photoCount = 0,
  audioCount = 0,
  onRefreshApp,
  onClearCache,
  onDeleteAllData,
  onOpenInstallPwa,
  onOpenCategoryManager,
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
        <div className="fixed inset-0 z-50 flex font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Left-to-Right Drawer Container */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative w-[290px] sm:w-[330px] h-full shadow-2xl flex flex-col z-10 border-r rounded-r-[28px] overflow-hidden transition-colors ${
              isPhotos
                ? 'bg-gradient-to-b from-[#18082c] via-[#120421] to-[#0c0216] border-purple-800 text-purple-100 shadow-purple-950/80'
                : isAudio
                ? 'bg-gradient-to-b from-[#241303] via-[#1a0c02] to-[#120801] border-amber-800 text-amber-100 shadow-amber-950/80'
                : 'bg-gradient-to-b from-[#032420] via-[#021815] to-[#011210] border-teal-800 text-teal-100 shadow-teal-950/80'
            }`}
          >
            {/* Drawer Header */}
            <div
              className={`relative py-2.5 px-3.5 border-b flex items-center justify-between transition-colors ${
                isPhotos
                  ? 'bg-purple-950/90 border-purple-800/80'
                  : isAudio
                  ? 'bg-amber-950/90 border-amber-800/80'
                  : 'bg-teal-950/90 border-teal-800/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shadow-md select-none shrink-0 ring-1.5 ${
                    isPhotos
                      ? 'ring-purple-400/60 shadow-purple-950/40 bg-purple-950'
                      : isAudio
                      ? 'ring-amber-400/60 shadow-amber-950/40 bg-amber-950'
                      : 'ring-teal-400/60 shadow-teal-950/40 bg-teal-950'
                  }`}
                >
                  <img
                    src="/BhaktiLogo.png"
                    alt="Bhakti Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-serif font-bold tracking-tight leading-tight">
                    Bhakti
                  </span>
                  <span className={`text-[9px] font-serif italic leading-tight ${
                    isPhotos ? 'text-purple-300' : isAudio ? 'text-amber-300' : 'text-teal-300'
                  }`}>
                    || भक्ती हीच माझी शक्ती ||
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Body - Vertical Compact List Layout */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-3 custom-scrollbar">
              {/* SECTION 1: MEDIA TYPE SELECTION (Vertical List) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 px-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                  <Layers className="w-3 h-3" />
                  <span>Media Category</span>
                </div>

                <div className="space-y-1">
                  {/* Videos Option */}
                  <button
                    onClick={() => {
                      if (onFilterMediaType) onFilterMediaType('videos');
                      onClose();
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                      isVideos
                        ? 'bg-teal-900/60 border-teal-400 text-white shadow-teal-950/40 ring-1 ring-teal-400/40'
                        : 'bg-teal-950/30 border-teal-900/40 hover:bg-teal-900/40 text-teal-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isVideos
                          ? 'bg-teal-500 text-slate-950 shadow-xs'
                          : 'bg-teal-500/20 text-teal-400'
                      }`}>
                        <Youtube className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold truncate">Videos</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/10 opacity-75 font-semibold">
                          {videoCount}
                        </span>
                      </div>
                    </div>
                    {isVideos && (
                      <Check className="w-3.5 h-3.5 text-teal-300 shrink-0 ml-1 stroke-[2.5]" />
                    )}
                  </button>

                  {/* Audio Option */}
                  <button
                    onClick={() => {
                      if (onFilterMediaType) onFilterMediaType('audio');
                      onClose();
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                      isAudio
                        ? 'bg-amber-900/60 border-amber-400 text-white shadow-amber-950/40 ring-1 ring-amber-400/40'
                        : 'bg-amber-950/30 border-amber-900/40 hover:bg-amber-900/40 text-amber-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isAudio
                          ? 'bg-amber-500 text-stone-950 shadow-xs'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        <Disc3 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold truncate">Audio</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/10 opacity-75 font-semibold">
                          {audioCount}
                        </span>
                      </div>
                    </div>
                    {isAudio && (
                      <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 ml-1 stroke-[2.5]" />
                    )}
                  </button>

                  {/* Photos Option */}
                  <button
                    onClick={() => {
                      if (onFilterMediaType) onFilterMediaType('photos');
                      onClose();
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                      isPhotos
                        ? 'bg-purple-900/60 border-purple-400 text-white shadow-purple-950/40 ring-1 ring-purple-400/40'
                        : 'bg-purple-950/30 border-purple-900/40 hover:bg-purple-900/40 text-purple-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isPhotos
                          ? 'bg-purple-500 text-white shadow-xs'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        <ImageIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold truncate">Photos</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/10 opacity-75 font-semibold">
                          {photoCount}
                        </span>
                      </div>
                    </div>
                    {isPhotos && (
                      <Check className="w-3.5 h-3.5 text-purple-300 shrink-0 ml-1 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION 2: VIEW LAYOUT (LIST / GRID / SPLIT) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 px-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                  <List className="w-3 h-3" />
                  <span>Display Layout</span>
                </div>

                <div className="space-y-1">
                  {/* List View (1st & Default) */}
                  <button
                    onClick={() => {
                      if (onViewModeChange) onViewModeChange('list');
                      showToast('Switched to List Layout 📄');
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                      viewMode === 'list'
                        ? currentMediaType === 'photos'
                          ? 'bg-purple-900/70 border-purple-400 text-white ring-1 ring-purple-400/30'
                          : 'bg-teal-900/70 border-teal-400 text-white ring-1 ring-teal-400/30'
                        : currentMediaType === 'photos'
                        ? 'bg-purple-950/40 border-purple-900/50 hover:bg-purple-900/40 text-purple-200'
                        : 'bg-teal-950/40 border-teal-900/50 hover:bg-teal-900/40 text-teal-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-md bg-sky-500/10 text-sky-400 shrink-0">
                        <List className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold">List Layout</span>
                    </div>
                    {viewMode === 'list' && (
                      <Check className={`w-3.5 h-3.5 stroke-[2.5] ${currentMediaType === 'photos' ? 'text-purple-300' : 'text-teal-300'}`} />
                    )}
                  </button>

                  {/* Grid View */}
                  <button
                    onClick={() => {
                      if (onViewModeChange) onViewModeChange('grid');
                      showToast('Switched to Grid Layout 🔲');
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                      viewMode === 'grid'
                        ? currentMediaType === 'photos'
                          ? 'bg-purple-900/70 border-purple-400 text-white ring-1 ring-purple-400/30'
                          : 'bg-teal-900/70 border-teal-400 text-white ring-1 ring-teal-400/30'
                        : currentMediaType === 'photos'
                        ? 'bg-purple-950/40 border-purple-900/50 hover:bg-purple-900/40 text-purple-200'
                        : 'bg-teal-950/40 border-teal-900/50 hover:bg-teal-900/40 text-teal-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-md bg-orange-500/10 text-orange-400 shrink-0">
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold">Grid Layout</span>
                    </div>
                    {viewMode === 'grid' && (
                      <Check className={`w-3.5 h-3.5 stroke-[2.5] ${currentMediaType === 'photos' ? 'text-purple-300' : 'text-teal-300'}`} />
                    )}
                  </button>

                  {/* Split Player View */}
                  <button
                    onClick={() => {
                      if (onViewModeChange) onViewModeChange('split');
                      showToast('Switched to Split Player 🎬');
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                      viewMode === 'split'
                        ? currentMediaType === 'photos'
                          ? 'bg-purple-900/70 border-purple-400 text-white ring-1 ring-purple-400/30'
                          : 'bg-teal-900/70 border-teal-400 text-white ring-1 ring-teal-400/30'
                        : currentMediaType === 'photos'
                        ? 'bg-purple-950/40 border-purple-900/50 hover:bg-purple-900/40 text-purple-200'
                        : 'bg-teal-950/40 border-teal-900/50 hover:bg-teal-900/40 text-teal-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0">
                        <Columns className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold">Split Workspace</span>
                    </div>
                    {viewMode === 'split' && (
                      <Check className={`w-3.5 h-3.5 stroke-[2.5] ${currentMediaType === 'photos' ? 'text-purple-300' : 'text-teal-300'}`} />
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION 3: SYSTEM UTILITIES (Vertical Items) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 px-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                  <Settings className="w-3 h-3" />
                  <span>Actions & Memory</span>
                </div>

                <div className="space-y-1">
                  {/* Refresh App */}
                  <button
                    onClick={() => {
                      onRefreshApp();
                      showToast('Vault refreshed ✨');
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                      currentMediaType === 'photos'
                        ? 'bg-purple-950/40 border-purple-900/50 hover:bg-purple-900/50 text-purple-100'
                        : 'bg-teal-950/40 border-teal-900/50 hover:bg-teal-900/50 text-teal-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-sky-500/15 text-sky-400 shrink-0">
                        <RotateCw className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold">Refresh Feed</span>
                    </div>
                  </button>

                  {/* Clear Cache (Safe) */}
                  <button
                    id="drawer-clear-cache-btn"
                    onClick={() => {
                      onClearCache();
                      showToast('Temporary cache refreshed ✨ (Saved media safe)');
                    }}
                    className={`w-full py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                      currentMediaType === 'photos'
                        ? 'bg-purple-950/40 border-purple-900/50 hover:bg-purple-900/50 text-purple-100'
                        : 'bg-teal-950/40 border-teal-900/50 hover:bg-teal-900/50 text-teal-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-amber-500/15 text-amber-400 shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">Clean Temp Cache</span>
                        <span className="text-[9px] opacity-60">Never clears your saved media</span>
                      </div>
                    </div>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </button>

                  {/* Install PWA */}
                  <button
                    onClick={() => {
                      onOpenInstallPwa();
                      onClose();
                    }}
                    className={`w-full py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                      currentMediaType === 'photos'
                        ? 'bg-purple-950/40 border-purple-900/50 hover:bg-purple-900/50 text-purple-100'
                        : 'bg-teal-950/40 border-teal-900/50 hover:bg-teal-900/50 text-teal-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-emerald-500/15 text-emerald-400 shrink-0">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">Install App (PWA)</span>
                        <span className="text-[9px] opacity-60">Persistent offline vault</span>
                      </div>
                    </div>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </button>

                  {/* Delete All Data */}
                  <button
                    onClick={() => {
                      onDeleteAllData();
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                      currentMediaType === 'photos'
                        ? 'bg-rose-950/30 border-rose-900/50 hover:bg-rose-900/40 text-rose-200'
                        : 'bg-rose-950/30 border-rose-900/50 hover:bg-rose-900/40 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-rose-500/15 text-rose-500 shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold">Delete All Data</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer with Seal */}
            <div
              className={`py-2 px-3 border-t flex items-center justify-between text-[11px] transition-colors ${
                currentMediaType === 'photos'
                  ? 'bg-purple-950/80 border-purple-800/60 text-purple-300'
                  : 'bg-teal-950/80 border-teal-800/60 text-teal-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <img
                  src="/BhaktiLogo.png"
                  alt="Bhakti Emblem"
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-orange-400 dark:ring-cyan-400"
                  referrerPolicy="no-referrer"
                />
                <span className="font-serif italic font-bold text-stone-900 dark:text-stone-200 text-[10px]">
                  Bhakti Archive
                </span>
              </div>
              <span className="text-[9px] text-cyan-400 dark:text-cyan-400 font-semibold">
                Offline PWA
              </span>
            </div>

            {/* Floating Toast Notice */}
            {toastMessage && (
              <div className="absolute bottom-14 left-4 right-4 bg-stone-900 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn z-30">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
