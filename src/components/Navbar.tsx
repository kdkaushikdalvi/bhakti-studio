import React, { useState } from 'react';
import {
  Menu,
  RotateCw,
  Video,
  Image as ImageIcon,
  Disc3,
} from 'lucide-react';
import { ThemeMode, MediaTypeFilter } from '../types';

interface NavbarProps {
  onOpenSidebar: () => void;
  onRefresh: () => void;
  theme: ThemeMode;
  mediaType?: MediaTypeFilter;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  onRefresh,
  theme,
  mediaType = 'videos',
}) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRefreshClick = () => {
    setIsSpinning(true);
    onRefresh();
    setTimeout(() => setIsSpinning(false), 700);
  };

  const isVideos = mediaType === 'videos';
  const isPhotos = mediaType === 'photos';
  const isAudio = mediaType === 'audio';

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors shadow-xs ${
        isVideos
          ? 'bg-gradient-to-r from-[#021815]/95 via-[#06332e]/95 to-[#021815]/95 border-teal-700/40 text-teal-100'
          : isPhotos
          ? 'bg-gradient-to-r from-[#110320]/95 via-[#290c4c]/95 to-[#110320]/95 border-purple-700/40 text-purple-100'
          : 'bg-gradient-to-r from-[#1b0c02]/95 via-[#351604]/95 to-[#1b0c02]/95 border-amber-700/40 text-amber-100'
      }`}
    >
      <div className="w-full px-3.5 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Sidebar 3-rows-line hamburger button + App Logo */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Sidebar 3 rows line Hamburger Button */}
            <button
              onClick={onOpenSidebar}
              id="btn-sidebar-toggle"
              className={`p-2 rounded-xl border transition-all shrink-0 cursor-pointer active:scale-95 flex items-center justify-center ${
                isVideos
                  ? 'bg-teal-900/50 border-teal-700/50 text-teal-200 hover:bg-teal-800/60 hover:text-white'
                  : isPhotos
                  ? 'bg-purple-900/50 border-purple-700/50 text-purple-200 hover:bg-purple-800/60 hover:text-white'
                  : 'bg-amber-900/50 border-amber-700/50 text-amber-200 hover:bg-amber-800/60 hover:text-white'
              }`}
              title="Open Menu (3 lines)"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 stroke-[2.4]" />
            </button>

            {/* App Brand */}
            <div
              onClick={onOpenSidebar}
              className="flex items-center gap-2 min-w-0 cursor-pointer group"
            >
              <div
                className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow-xs select-none shrink-0 group-hover:scale-105 transition-transform ring-2 ${
                  isVideos
                    ? 'ring-teal-400/70 shadow-teal-950/40 bg-teal-950'
                    : isPhotos
                    ? 'ring-purple-400/70 shadow-purple-950/40 bg-purple-950'
                    : 'ring-amber-400/70 shadow-amber-950/40 bg-amber-950'
                }`}
              >
                <img
                  src="/BhaktiLogo.png"
                  alt="Bhakti Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-sm font-serif font-bold tracking-tight truncate">
                  Bhakti
                </h1>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border flex items-center gap-1 ${
                    isVideos
                      ? 'bg-teal-950/80 text-teal-300 border-teal-500/40'
                      : isPhotos
                      ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {isVideos ? (
                    <>
                      <Video className="w-2.5 h-2.5" />
                      <span>Videos</span>
                    </>
                  ) : isPhotos ? (
                    <>
                      <ImageIcon className="w-2.5 h-2.5" />
                      <span>Photos</span>
                    </>
                  ) : (
                    <>
                      <Disc3 className="w-2.5 h-2.5" />
                      <span>Audio</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Refresh button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleRefreshClick}
              id="btn-header-refresh"
              className={`p-2 rounded-xl border transition-all shrink-0 cursor-pointer active:scale-95 flex items-center justify-center ${
                isVideos
                  ? 'bg-teal-900/40 border-teal-700/40 text-teal-200 hover:bg-teal-800/60 hover:text-white'
                  : isPhotos
                  ? 'bg-purple-900/40 border-purple-700/40 text-purple-200 hover:bg-purple-800/60 hover:text-white'
                  : 'bg-amber-900/40 border-amber-700/40 text-amber-200 hover:bg-amber-800/60 hover:text-white'
              }`}
              title="Refresh Vault Feed"
              aria-label="Refresh Vault Feed"
            >
              <RotateCw
                className={`w-3.5 h-3.5 transition-transform duration-700 ${
                  isSpinning ? 'rotate-180 text-amber-300' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


