import React, { useState } from 'react';
import {
  Play,
  Star,
  Clock,
  ExternalLink,
  Share2,
  Check,
  BookOpen,
  Tag,
} from 'lucide-react';
import { VideoItem } from '../types';
import { translateCategoryToMarathi } from './CategoryPillsRow';
import { getYouTubeThumbnail } from '../utils/youtube';

interface SplitPlayerViewProps {
  videos: VideoItem[];
  activeVideo: VideoItem | null;
  onSelectVideo: (video: VideoItem, timestamp?: number) => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onAddTimestamp: (id: string, timestamp: { time: number; label: string }) => void;
}

export const SplitPlayerView: React.FC<SplitPlayerViewProps> = ({
  videos,
  activeVideo,
  onSelectVideo,
  onToggleFavorite,
  onToggleWatchLater,
  onUpdateNotes,
  onAddTimestamp,
}) => {
  const currentVideo = activeVideo || (videos.length > 0 ? videos[0] : null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Notes state
  const [notes, setNotes] = useState(currentVideo?.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Timestamps state
  const [newTsTime, setNewTsTime] = useState('');
  const [newTsLabel, setNewTsLabel] = useState('');

  React.useEffect(() => {
    if (currentVideo) {
      setNotes(currentVideo.notes || '');
      setIsEditingNotes(false);
      setCurrentTimestamp(0);
    }
  }, [currentVideo?.id]);

  if (!currentVideo) {
    return (
      <div className="p-8 text-center bg-white border border-orange-200 rounded-2xl shadow-xs">
        <BookOpen className="w-10 h-10 text-orange-400 mx-auto mb-2" />
        <h3 className="text-lg font-serif font-bold text-stone-900">No media selected</h3>
        <p className="text-xs text-stone-500 mt-1">Select or add a YouTube video to begin viewing</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&start=${currentTimestamp}&rel=0`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentVideo.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(currentVideo.id, notes);
    setIsEditingNotes(false);
  };

  const handleAddTimestamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTsTime || !newTsLabel) return;
    const parts = newTsTime.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (!isNaN(Number(newTsTime))) {
      seconds = Number(newTsTime);
    }
    onAddTimestamp(currentVideo.id, { time: seconds, label: newTsLabel.trim() });
    setNewTsTime('');
    setNewTsLabel('');
  };

  return (
    <div className="space-y-4">
      {/* Video Player Card */}
      <div className="bg-white border border-orange-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Video Player Frame */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            key={embedUrl}
            src={embedUrl}
            title={currentVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Video Header & Controls */}
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-stone-500 truncate block mb-0.5">
                {currentVideo.channelTitle || 'Spiritual Archive'}
              </span>
              <h2 className="text-lg font-serif font-bold text-stone-900 leading-snug">
                {currentVideo.title}
              </h2>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onToggleWatchLater(currentVideo.id)}
                className={`p-1.5 border transition-colors rounded-lg cursor-pointer ${
                  currentVideo.isWatchLater
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-orange-200 bg-white text-stone-600 hover:text-emerald-700'
                }`}
                title="Queue"
              >
                <Clock className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onToggleFavorite(currentVideo.id)}
                className={`p-1.5 border transition-colors rounded-lg cursor-pointer ${
                  currentVideo.isFavorite
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-orange-200 bg-white text-stone-600 hover:text-orange-500'
                }`}
                title="Starred"
              >
                <Star className={`w-3.5 h-3.5 ${currentVideo.isFavorite ? 'fill-white' : ''}`} />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-1.5 border border-orange-200 bg-white text-stone-600 hover:text-stone-900 transition-colors rounded-lg cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
              <a
                href={currentVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 border border-orange-200 bg-white text-stone-600 hover:text-stone-900 transition-colors rounded-lg cursor-pointer"
                title="Open on YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Chapters */}
          {currentVideo.timestamps && currentVideo.timestamps.length > 0 && (
            <div className="pt-2 border-t border-orange-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 block mb-1.5">
                Chapters
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentVideo.timestamps.map((ts, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTimestamp(ts.time)}
                    className={`px-2.5 py-1 text-xs flex items-center gap-1.5 border transition-colors rounded-lg cursor-pointer ${
                      currentTimestamp === ts.time
                        ? 'bg-orange-500 text-white border-orange-500 font-semibold'
                        : 'bg-orange-50/50 text-stone-800 hover:bg-orange-100/60 border-orange-200'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-80">
                      {Math.floor(ts.time / 60)}:{(ts.time % 60).toString().padStart(2, '0')}
                    </span>
                    <span>{ts.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reflections */}
          <div className="pt-2 border-t border-orange-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
                Reflections &amp; Notes
              </span>
              {!isEditingNotes ? (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
                >
                  {notes ? 'Edit' : '+ Add Notes'}
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                >
                  Save
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record reflections or notes..."
                  className="w-full p-2.5 bg-orange-50/30 border border-orange-200 text-xs font-serif text-stone-900 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-xl"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setNotes(currentVideo.notes || '');
                      setIsEditingNotes(false);
                    }}
                    className="text-xs text-stone-500 px-2 py-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1 bg-orange-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Save Reflection
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-orange-50/40 border border-orange-100 text-xs font-serif italic text-stone-800 leading-relaxed rounded-xl">
                {notes || <span className="text-stone-400 opacity-70">No reflections recorded.</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Queue */}
      <div className="bg-white border border-orange-200 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-orange-100">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
            Queue ({videos.length})
          </span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {videos.map((vid) => {
            const isPlaying = vid.id === currentVideo.id;
            return (
              <div
                key={vid.id}
                onClick={() => onSelectVideo(vid)}
                className={`p-2.5 border transition-all cursor-pointer flex items-center gap-3 rounded-xl ${
                  isPlaying
                    ? 'bg-orange-50/80 border-orange-400 shadow-2xs'
                    : 'bg-white hover:bg-orange-50/30 border-orange-100'
                }`}
              >
                <div className="relative w-16 aspect-video bg-orange-50 overflow-hidden shrink-0 rounded-lg border border-orange-100">
                  <img
                    src={vid.thumbnailUrl || getYouTubeThumbnail(vid.youtubeId, 'mq')}
                    alt={vid.title}
                    className="w-full h-full object-cover"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                      <Play className="w-3 h-3 fill-white text-white" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-stone-500 truncate block">
                    {vid.channelTitle || 'Speaker'}
                  </span>
                  <h4 className={`text-xs font-serif line-clamp-1 leading-snug ${
                    isPlaying ? 'text-orange-950 font-bold' : 'text-stone-700'
                  }`}>
                    {vid.title}
                  </h4>
                  {vid.category && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-1 py-0.2 rounded flex items-center gap-0.5">
                        <Tag className="w-2 h-2 text-teal-600" />
                        <span>{translateCategoryToMarathi(vid.category)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
