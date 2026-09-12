import React, { useState } from 'react';
import {
  Star,
  Clock,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Share2,
  Check,
  Bookmark,
  Tag,
} from 'lucide-react';
import { VideoItem } from '../types';
import { translateCategoryToMarathi } from './CategoryPillsRow';
import { getYouTubeThumbnail } from '../utils/youtube';

interface VideoListItemProps {
  video: VideoItem;
  onPlay: (video: VideoItem, startTimestamp?: number) => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
  onEdit: (video: VideoItem) => void;
  onDelete: (id: string) => void;
}

export const VideoListItem: React.FC<VideoListItemProps> = ({
  video,
  onPlay,
  onToggleFavorite,
  onToggleWatchLater,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(video.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  const formattedDate = new Date(video.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      id={`video-row-${video.id}`}
      className="group bg-white hover:bg-orange-50/40 border border-orange-100 p-3 transition-colors flex items-center justify-between gap-3 rounded-xl shadow-2xs relative"
    >
      {/* Thumbnail + Title + Channel */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          onClick={() => onPlay(video)}
          className="relative w-20 aspect-video bg-orange-50 overflow-hidden shrink-0 cursor-pointer rounded-lg border border-orange-100/80"
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
            <span className="text-[10px] font-medium text-stone-500 truncate max-w-[140px]">
              {video.channelTitle || 'Spiritual Guide'}
            </span>
            <span className="text-[9px] text-stone-400">Added {formattedDate}</span>
          </div>

          <h4
            onClick={() => onPlay(video)}
            className="text-xs font-serif font-bold text-stone-900 hover:text-orange-600 transition-colors line-clamp-1 cursor-pointer"
            title={video.title}
          >
            {video.title}
          </h4>

          {/* Category & Tags / Chapters */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {video.category && (
              <span className="text-[9.5px] font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-1.5 py-0.2 rounded-md flex items-center gap-1 shrink-0">
                <Tag className="w-2.5 h-2.5 text-teal-600" />
                <span>{translateCategoryToMarathi(video.category)}</span>
              </span>
            )}
            {video.tags && video.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {video.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="text-[9px] text-stone-500 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {video.timestamps && video.timestamps.length > 0 && (
              <span className="text-[9px] font-semibold text-orange-600 flex items-center gap-0.5">
                <Bookmark className="w-2.5 h-2.5" /> {video.timestamps.length} Ch
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggleWatchLater(video.id)}
          className={`p-1.5 border transition-colors rounded-lg ${
            video.isWatchLater
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'border-orange-100 bg-white text-stone-500 hover:text-emerald-700 hover:bg-orange-50'
          }`}
          title={video.isWatchLater ? 'In Contemplation' : 'Queue for Study'}
        >
          <Clock className="w-3 h-3" />
        </button>

        <button
          onClick={() => onToggleFavorite(video.id)}
          className={`p-1.5 border transition-colors rounded-lg ${
            video.isFavorite
              ? 'bg-orange-500 text-white border-orange-500'
              : 'border-orange-100 bg-white text-stone-500 hover:text-orange-500 hover:bg-orange-50'
          }`}
          title={video.isFavorite ? 'Essential Gem' : 'Mark as Essential'}
        >
          <Star className={`w-3 h-3 ${video.isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-orange-200 rounded-xl shadow-lg z-20 py-1 text-xs text-stone-800 font-medium animate-fadeIn">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>

                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMenu(false)}
                  className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                  <span>Open in YouTube</span>
                </a>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(video);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Edit Entry</span>
                </button>

                <div className="h-px bg-orange-100 my-1" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(video.id);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Entry</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
