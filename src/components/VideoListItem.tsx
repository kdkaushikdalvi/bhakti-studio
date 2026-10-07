import React, { useState, useRef, useEffect } from 'react';
import {
  Pin,
  Trash2,
  Bookmark,
  Share2,
  Check,
  MoreVertical,
} from 'lucide-react';
import { VideoItem } from '../types';
import { getYouTubeThumbnail } from '../utils/youtube';

interface VideoListItemProps {
  video: VideoItem;
  onPlay: (video: VideoItem, startTimestamp?: number) => void;
  onToggleFavorite?: (id: string) => void;
  onToggleWatchLater?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onEdit?: (video: VideoItem) => void;
  onDelete: (id: string) => void;
}

export const VideoListItem: React.FC<VideoListItemProps> = ({
  video,
  onPlay,
  onTogglePin,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isPinned = !!video.isPinned;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(video.url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 1200);
  };

  return (
    <div
      id={`video-row-${video.id}`}
      className={`group bg-white p-3 transition-all flex items-center justify-between gap-3 rounded-xl border relative shadow-2xs ${
        isPinned
          ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-300/50 shadow-xs'
          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/30'
      }`}
    >
      {/* Thumbnail + Title + Channel */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          onClick={() => onPlay(video)}
          className={`relative w-20 aspect-video bg-neutral-100 overflow-hidden shrink-0 cursor-pointer rounded-lg border ${
            isPinned ? 'border-amber-300' : 'border-neutral-200'
          }`}
        >
          <img
            src={video.thumbnailUrl || getYouTubeThumbnail(video.youtubeId, 'hq')}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getYouTubeThumbnail(video.youtubeId, 'mq');
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="text-[10px] font-medium text-neutral-500 truncate max-w-[140px]">
              {video.channelTitle || 'Spiritual Archive'}
            </span>
          </div>

          <h4
            onClick={() => onPlay(video)}
            className="text-xs font-serif font-bold text-neutral-900 hover:text-black transition-colors line-clamp-1 cursor-pointer"
            title={video.title}
          >
            {video.title}
          </h4>

          {/* Tags / Chapters */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {video.tags && video.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {video.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="text-[9px] text-neutral-500 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {video.timestamps && video.timestamps.length > 0 && (
              <span className="text-[9px] font-semibold text-neutral-700 flex items-center gap-0.5">
                <Bookmark className="w-2.5 h-2.5" /> {video.timestamps.length} Ch
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls: 3-Dot Action Button */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowMenu((prev) => !prev)}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            showMenu
              ? 'bg-neutral-100 border-neutral-300 text-black'
              : 'border-transparent hover:border-neutral-200 hover:bg-neutral-100 text-neutral-400 hover:text-black'
          }`}
          title="More actions"
          aria-label="More actions"
          aria-expanded={showMenu}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* 3-Dot Action Menu: Pin, Share, Delete */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-1.5 text-xs text-neutral-800 animate-fadeIn font-sans">
            {/* 1. Pin / Unpin */}
            {onTogglePin && (
              <button
                type="button"
                onClick={() => {
                  onTogglePin(video.id);
                  setShowMenu(false);
                }}
                className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center gap-2.5 cursor-pointer transition-colors ${
                  isPinned
                    ? 'hover:bg-amber-50 text-amber-700 font-medium'
                    : 'hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                <Pin
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isPinned ? 'fill-amber-500 text-amber-600' : 'text-neutral-500'
                  }`}
                />
                <span>{isPinned ? 'Unpin' : 'Pin to top'}</span>
              </button>
            )}

            {/* 2. Share / Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full px-2.5 py-2 rounded-lg text-left flex items-center gap-2.5 hover:bg-neutral-100 text-neutral-800 cursor-pointer transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              )}
              <span>{copied ? 'Link copied!' : 'Share link'}</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-neutral-100" />

            {/* 3. Delete */}
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                if (window.confirm(`Delete "${video.title}"?`)) {
                  onDelete(video.id);
                }
              }}
              className="w-full px-2.5 py-2 rounded-lg text-left flex items-center gap-2.5 hover:bg-rose-50 text-rose-600 cursor-pointer transition-colors font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
