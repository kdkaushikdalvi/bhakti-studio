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

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem, startTimestamp?: number) => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
  onEdit: (video: VideoItem) => void;
  onDelete: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
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
    <article
      id={`video-card-${video.id}`}
      className="group bg-white border border-rose-100 hover:border-rose-300 rounded-2xl shadow-xs hover:shadow-md p-3.5 transition-all flex flex-col justify-between relative"
    >
      <div>
        {/* Video Thumbnail */}
        <div
          className="aspect-video bg-rose-50 mb-3 relative overflow-hidden cursor-pointer rounded-xl border border-rose-100/80 mt-1"
          onClick={() => onPlay(video)}
        >
          <img
            src={video.thumbnailUrl || getYouTubeThumbnail(video.youtubeId, 'hq')}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getYouTubeThumbnail(video.youtubeId, 'mq');
            }}
          />

          {/* Top Quick Actions removed: media cards expose Remove from the menu only. */}
          <div className="hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchLater(video.id);
              }}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                video.isWatchLater
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white/90 text-stone-600 hover:bg-white hover:text-rose-700'
              }`}
              title={video.isWatchLater ? 'Queued in Study' : 'Add to Queue'}
            >
              <Clock className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(video.id);
              }}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                video.isFavorite
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white/90 text-stone-600 hover:bg-white hover:text-rose-500'
              }`}
              title={video.isFavorite ? 'Starred Favorite' : 'Mark Favorite'}
            >
            </button>
          </div>

          {/* Chapters indicator */}
          {video.timestamps && video.timestamps.length > 0 && (
            <div className="absolute bottom-2 right-2 bg-stone-950/80 backdrop-blur px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-white font-mono rounded-md flex items-center gap-1">
              <Bookmark className="w-2.5 h-2.5 text-rose-400" />
              <span>{video.timestamps.length} Ch</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h4
          onClick={() => onPlay(video)}
          className="text-base font-serif font-bold leading-snug mb-1 text-stone-900 group-hover:text-rose-600 transition-colors cursor-pointer line-clamp-2"
          title={video.title}
        >
          {video.title}
        </h4>

        {/* Channel & Category */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="text-[11px] font-medium text-stone-500 truncate max-w-[130px]">
            {video.channelTitle || 'Spiritual Archive'}
          </p>
          {video.category && (
            <span className="text-[9.5px] font-semibold text-rose-800 bg-rose-50 border border-rose-200/80 px-1.5 py-0.2 rounded-md flex items-center gap-1 shrink-0">
              <Tag className="w-2.5 h-2.5 text-rose-600" />
              <span>{translateCategoryToMarathi(video.category)}</span>
            </span>
          )}
        </div>

        {/* Notes Preview */}
        {video.notes && (
          <p className="text-xs leading-relaxed text-stone-600 line-clamp-2 font-serif italic mb-2 bg-rose-50/40 p-2 rounded-lg border border-rose-100/60">
            "{video.notes}"
          </p>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-2 pt-2.5 border-t border-rose-100 flex items-center justify-between text-[10px] text-stone-400">
        <span className="font-medium text-stone-400">Added {formattedDate}</span>

        <div className="flex items-center gap-2">
          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-stone-400 hover:text-stone-800 transition-colors rounded-md hover:bg-rose-50 cursor-pointer"
              title="More"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 bottom-full mb-1 w-44 bg-white border border-rose-200 rounded-xl shadow-lg z-20 py-1 text-xs text-stone-800 font-medium">
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-rose-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
                    <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMenu(false)}
                    className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                    <span>Open in YouTube</span>
                  </a>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(video);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Edit Video</span>
                  </button>

                  <div className="h-px bg-rose-100 my-1" />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(video.id);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
