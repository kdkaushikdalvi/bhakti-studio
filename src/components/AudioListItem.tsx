import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Trash2,
  Share2,
  Check,
  HardDrive,
  MoreVertical,
} from 'lucide-react';
import { AudioItem } from '../types';

interface AudioListItemProps {
  audio: AudioItem;
  isPlaying?: boolean;
  onPlay: (audio: AudioItem) => void;
  onToggleFavorite?: (id: string) => void;
  onEdit?: (audio: AudioItem) => void;
  onDelete: (id: string) => void;
}

export const AudioListItem: React.FC<AudioListItemProps> = ({
  audio,
  isPlaying = false,
  onPlay,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLocalAudio = audio.sourceType === 'local' || (!audio.driveId && !audio.url.startsWith('http'));

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
    navigator.clipboard.writeText(audio.url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 1200);
  };

  return (
    <div
      id={`audio-row-${audio.id}`}
      className={`group p-3 transition-all flex items-center justify-between gap-3 rounded-xl border relative shadow-2xs ${
        isPlaying
          ? 'bg-neutral-50/80 border-neutral-900 ring-1 ring-neutral-900/10'
          : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/40'
      }`}
    >
      {/* Play/Pause Button (No Logo) + Title + Artist */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onPlay(audio)}
          className={`w-9 h-9 rounded-full border transition-all shrink-0 cursor-pointer flex items-center justify-center ${
            isPlaying
              ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
              : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300'
          }`}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          title={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="text-[10px] font-semibold text-neutral-500 truncate max-w-[140px] flex items-center gap-1">
              {isLocalAudio && <HardDrive className="w-2.5 h-2.5 text-neutral-500 shrink-0" />}
              <span>{audio.artistOrSource || (isLocalAudio ? 'Device Audio' : 'Google Drive Audio')}</span>
            </span>
            {audio.fileSize && (
              <span className="text-[9px] font-mono text-neutral-600 bg-neutral-100 border border-neutral-200 px-1 rounded">
                {audio.fileSize}
              </span>
            )}
          </div>

          <h4
            onClick={() => onPlay(audio)}
            className="text-xs font-serif font-bold text-neutral-900 hover:text-black transition-colors line-clamp-1 cursor-pointer"
            title={audio.title}
          >
            {audio.title}
          </h4>

          {/* Notes */}
          {audio.notes && (
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[9px] text-neutral-500 italic truncate max-w-[180px]">
                "{audio.notes}"
              </span>
            </div>
          )}
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

        {showMenu && (
          <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-1.5 text-xs text-neutral-800 animate-fadeIn font-sans">
            {/* Share / Copy Link */}
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

            {/* Delete */}
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                if (window.confirm(`Delete "${audio.title}"?`)) {
                  onDelete(audio.id);
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
