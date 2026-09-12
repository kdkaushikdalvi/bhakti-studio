import React from 'react';
import { motion } from 'motion/react';
import {
  Menu,
  Sun,
  Moon,
  Flame,
  Sparkles,
  LayoutGrid,
  List,
  Columns2,
  Trash2,
} from 'lucide-react';
import { ThemeMode, ViewMode } from '../types';

interface SidecarFloatingBarProps {
  onOpenSidecar: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onClearCache: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

export const SidecarFloatingBar: React.FC<SidecarFloatingBarProps> = ({
  onOpenSidecar,
  theme,
  onToggleTheme,
  onClearCache,
  viewMode,
  onChangeViewMode,
}) => {
  return (
    <div
      id="sidecar-quick-bar"
      className="flex items-center justify-between gap-2 p-1.5 rounded-2xl backdrop-blur-xl border shadow-sm transition-all duration-200"
      style={{
        backgroundColor:
          theme === 'blue'
            ? 'rgba(10, 25, 47, 0.88)'
            : theme === 'dark'
            ? 'rgba(30, 27, 25, 0.85)'
            : theme === 'light'
            ? 'rgba(255, 255, 255, 0.9)'
            : 'rgba(255, 251, 245, 0.88)',
        borderColor:
          theme === 'blue'
            ? 'rgba(56, 189, 248, 0.4)'
            : theme === 'dark'
            ? 'rgba(70, 60, 55, 0.6)'
            : theme === 'light'
            ? 'rgba(230, 230, 230, 0.9)'
            : 'rgba(254, 215, 170, 0.8)',
      }}
    >
      {/* Sidecar Menu Trigger Button */}
      <motion.button
        id="sidecar-menu-btn"
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={onOpenSidecar}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
          theme === 'dark'
            ? 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700'
            : 'bg-white hover:bg-orange-50 text-stone-800 border border-orange-200/90'
        }`}
        title="Open Sidecar Menu"
      >
        <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-orange-400 dark:ring-cyan-400 bg-white shrink-0">
          <img
            src="/BhaktiLogo.png"
            alt="Bhakti"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <Menu className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
        <span className="text-xs font-serif font-bold tracking-tight">Menu</span>
      </motion.button>

      {/* Center Actions: View Mode toggles (List 1st & Default, Grid 2nd, Split 3rd) */}
      <div
        className={`flex items-center gap-0.5 p-0.5 rounded-xl border ${
          theme === 'blue'
            ? 'bg-blue-950/80 border-blue-800/80'
            : theme === 'dark'
            ? 'bg-stone-900/90 border-stone-800'
            : 'bg-stone-100/90 border-stone-200/60'
        }`}
      >
        <button
          type="button"
          onClick={() => onChangeViewMode('list')}
          className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
            viewMode === 'list'
              ? theme === 'blue'
                ? 'bg-blue-800 text-cyan-300 shadow-2xs font-bold ring-1 ring-cyan-400/40'
                : 'bg-white dark:bg-stone-800 text-orange-600 shadow-2xs font-bold'
              : theme === 'blue'
              ? 'text-blue-300 hover:text-white'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
          title="List View (Default)"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onChangeViewMode('grid')}
          className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
            viewMode === 'grid'
              ? theme === 'blue'
                ? 'bg-blue-800 text-cyan-300 shadow-2xs font-bold ring-1 ring-cyan-400/40'
                : 'bg-white dark:bg-stone-800 text-orange-600 shadow-2xs font-bold'
              : theme === 'blue'
              ? 'text-blue-300 hover:text-white'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
          title="Grid View"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onChangeViewMode('split')}
          className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
            viewMode === 'split'
              ? theme === 'blue'
                ? 'bg-blue-800 text-cyan-300 shadow-2xs font-bold ring-1 ring-cyan-400/40'
                : 'bg-white dark:bg-stone-800 text-orange-600 shadow-2xs font-bold'
              : theme === 'blue'
              ? 'text-blue-300 hover:text-white'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
          title="Split Cinema View"
        >
          <Columns2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Side: Theme Toggle in side button & Clear Cache */}
      <div className="flex items-center gap-1">
        {/* Instant Clear Cache Button */}
        <motion.button
          id="side-clear-cache-btn"
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onClearCache}
          className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
            theme === 'dark'
              ? 'bg-stone-800 hover:bg-amber-950/60 text-amber-400 border border-stone-700'
              : 'bg-white hover:bg-amber-50 text-amber-700 border border-amber-200/90'
          }`}
          title="Clear Cache & Flush Memory"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline font-bold">Clear Cache</span>
        </motion.button>

        {/* Theme Toggle in Side Button */}
        <motion.button
          id="side-theme-toggle-btn"
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onToggleTheme}
          className={`p-1.5 px-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
            theme === 'blue'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-950/50'
              : theme === 'dark'
              ? 'bg-stone-800 text-indigo-300 hover:bg-stone-700 border border-stone-700'
              : theme === 'light'
              ? 'bg-white text-amber-600 hover:bg-stone-50 border border-stone-200'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
          }`}
          title={`Active Theme: ${theme.toUpperCase()} (Click to toggle)`}
        >
          {theme === 'blue' ? (
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300/30" />
          ) : theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-300" />
          ) : theme === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Flame className="w-3.5 h-3.5 text-white" />
          )}
          <span className="text-[10px] capitalize font-sans">{theme}</span>
        </motion.button>
      </div>
    </div>
  );
};
