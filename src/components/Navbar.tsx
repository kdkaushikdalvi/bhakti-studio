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
          ? 'bg-gradient-to-r from-[#fff1f2]/95 via-[#ffe4e6]/95 to-[#fff1f2]/95 border-rose-200/80 text-rose-950'
          : isPhotos
          ? 'bg-gradient-to-r from-emerald-100/95 via-green-100/95 to-emerald-100/95 border-emerald-300/80 text-emerald-950'
          : 'bg-gradient-to-r from-amber-100/95 via-yellow-100/95 to-amber-100/95 border-yellow-300/80 text-amber-950'
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
                  ? 'bg-white/80 border-rose-200 text-rose-800 hover:bg-rose-50 hover:text-rose-950 shadow-2xs'
                  : isPhotos
                  ? 'bg-white/90 border-emerald-300 text-emerald-900 hover:bg-emerald-100 hover:text-emerald-950 shadow-2xs'
                  : 'bg-white/90 border-yellow-300 text-amber-900 hover:bg-yellow-100 hover:text-amber-950 shadow-2xs'
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
                    ? 'ring-rose-400/70 shadow-rose-900/10 bg-white'
                    : isPhotos
                    ? 'ring-emerald-400 shadow-emerald-900/10 bg-emerald-100'
                    : 'ring-yellow-400 shadow-yellow-900/10 bg-yellow-100'
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
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border flex items-center gap-1 ${
                    isVideos
                      ? 'bg-rose-100 text-rose-800 border-rose-300/80'
                      : isPhotos
                      ? 'bg-emerald-200 text-emerald-950 border-emerald-400 font-bold'
                      : 'bg-yellow-200 text-amber-950 border-yellow-400'
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
                  ? 'bg-white/80 border-rose-200 text-rose-800 hover:bg-rose-50 hover:text-rose-950 shadow-2xs'
                  : isPhotos
                  ? 'bg-white/90 border-emerald-300 text-emerald-900 hover:bg-emerald-100 hover:text-emerald-950 shadow-2xs'
                  : 'bg-white/90 border-yellow-300 text-amber-900 hover:bg-yellow-100 hover:text-amber-950 shadow-2xs'
              }`}
              title="Refresh Vault Feed"
              aria-label="Refresh Vault Feed"
            >
              <RotateCw
                className={`w-3.5 h-3.5 transition-transform duration-700 ${
                  isSpinning
                    ? isPhotos
                      ? 'rotate-180 text-emerald-600'
                      : 'rotate-180 text-amber-600'
                    : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

