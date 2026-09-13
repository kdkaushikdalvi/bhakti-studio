import React, { useState } from 'react';
import {
  Star,
  Play,
  Pause,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Share2,
  Check,
  Tag,
  Disc3,
  HardDrive,
} from 'lucide-react';
import { AudioItem } from '../types';
import { translateCategoryToMarathi } from './CategoryPillsRow';

interface AudioListItemProps {
  audio: AudioItem;
  isPlaying?: boolean;
  onPlay: (audio: AudioItem) => void;
  onToggleFavorite: (id: string) => void;
  onEdit?: (audio: AudioItem) => void;
  onDelete: (id: string) => void;
}

export const AudioListItem: React.FC<AudioListItemProps> = ({
  audio,
  isPlaying = false,
  onPlay,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLocalAudio = audio.sourceType === 'local' || (!audio.driveId && !audio.url.startsWith('http'));

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(audio.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  const formattedDate = new Date(audio.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      id={`audio-row-${audio.id}`}
      className="group bg-white border border-orange-100 p-3 transition-colors flex items-center justify-between gap-3 rounded-xl shadow-2xs relative"
    >
      {/* Vinyl / Audio Icon + Title + Artist */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onPlay(audio)}
          className="relative w-12 h-12 bg-gradient-to-br from-amber-950 to-stone-900 overflow-hidden shrink-0 cursor-pointer rounded-lg border border-amber-800/40 flex items-center justify-center group-hover:scale-105 transition-transform"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          <Disc3 className={`w-7 h-7 text-amber-300 ${isPlaying ? 'animate-spin text-amber-400' : ''}`} style={{ animationDuration: '3s' }} />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white fill-white" />
            ) : (
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            )}
          </div>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="text-[10px] font-medium text-stone-500 truncate max-w-[140px] flex items-center gap-1">
              {isLocalAudio && <HardDrive className="w-2.5 h-2.5 text-amber-600 shrink-0" />}
              <span>{audio.artistOrSource || (isLocalAudio ? 'Device Audio' : 'Google Drive Audio')}</span>
            </span>
            {audio.fileSize && (
              <span className="text-[9px] font-mono text-stone-400 bg-stone-100 px-1 rounded">
                {audio.fileSize}
              </span>
            )}
          </div>

          <h4
            onClick={() => onPlay(audio)}
            className="text-xs font-serif font-bold text-stone-900 hover:text-amber-700 transition-colors line-clamp-1 cursor-pointer"
            title={audio.title}
          >
            {audio.title}
          </h4>

          {/* Notes */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {audio.notes && (
              <span className="text-[9px] text-stone-400 italic truncate max-w-[120px]">
                "{audio.notes}"
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggleFavorite(audio.id)}
          className={`p-1.5 border transition-colors rounded-lg ${
            audio.isFavorite
              ? 'bg-amber-500 text-white border-amber-500'
              : 'border-amber-200/80 bg-white text-stone-500 hover:text-amber-500 hover:bg-amber-50'
          }`}
          title={audio.isFavorite ? 'Starred Favorite' : 'Mark as Favorite'}
        >
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
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-amber-200 rounded-xl shadow-lg z-20 py-1 text-xs text-stone-800 font-medium animate-fadeIn">
                {!isLocalAudio && (
                  <>
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
                      <span>{copied ? 'Copied' : 'Copy Drive Link'}</span>
                    </button>

                    <a
                      href={audio.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMenu(false)}
                      className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                      <span>Open in Drive</span>
                    </a>
                  </>
                )}

                {isLocalAudio && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onPlay(audio);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-stone-500" />
                    <span>Play Audio</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (onEdit) onEdit(audio);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Edit Track</span>
                </button>

                <div className="h-px bg-amber-100 my-1" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(audio.id);
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
