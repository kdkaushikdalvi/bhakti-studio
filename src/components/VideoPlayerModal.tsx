import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Star,
  Clock,
  Share2,
  Check,
} from 'lucide-react';
import { VideoItem } from '../types';

interface VideoPlayerModalProps {
  video: VideoItem;
  startTimestamp?: number;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onAddTimestamp?: (id: string, timestamp: { time: number; label: string }) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  startTimestamp = 0,
  onClose,
  onToggleFavorite,
  onToggleWatchLater,
}) => {
  const [currentStart] = useState<number>(startTimestamp);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(video.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&start=${currentStart}&rel=0`;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-white border border-orange-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 rounded-2xl w-full max-w-[580px] max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-orange-50/60 border-b border-orange-100 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-stone-500 truncate block mb-0.5">
              {video.channelTitle || 'Spiritual Archive'}
            </span>
            <h3 className="text-sm font-serif font-bold text-stone-900 truncate" title={video.title}>
              {video.title}
            </h3>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggleWatchLater(video.id)}
              className={`hidden p-1.5 border transition-colors rounded-lg cursor-pointer ${
                video.isWatchLater
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-orange-200 bg-white text-stone-600 hover:text-emerald-700'
              }`}
              title="Queue"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleFavorite(video.id)}
              className={`hidden p-1.5 border transition-colors rounded-lg cursor-pointer ${
                video.isFavorite
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'border-orange-200 bg-white text-stone-600 hover:text-orange-600'
              }`}
              title="Starred"
            >
              <Star className={`w-3.5 h-3.5 ${video.isFavorite ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              className="hidden p-1.5 border border-orange-200 bg-white text-stone-600 hover:text-stone-900 transition-colors rounded-lg cursor-pointer"
              title="Copy Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden p-1.5 border border-orange-200 bg-white text-stone-600 hover:text-stone-900 transition-colors rounded-lg cursor-pointer"
              title="Open on YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-orange-100/70 transition-colors rounded-lg ml-0.5 cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player & Content Body */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-white">
          {/* Main YouTube Embed Frame */}
          <div className="w-full bg-black aspect-video shrink-0">
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full aspect-video border-0"
            />
          </div>

          {/* Guide & Meta */}
          <div className="p-4 flex items-center justify-between text-xs border-t border-orange-100">
            <span className="font-semibold text-stone-700">
              {video.channelTitle || 'Spiritual Archive'}
            </span>
            <span className="text-[10px] text-stone-400">
              {new Date(video.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
