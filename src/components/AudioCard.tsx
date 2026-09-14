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
  Music,
  Disc3,
  HardDrive,
} from 'lucide-react';
import { AudioItem } from '../types';
import { translateCategoryToMarathi } from './CategoryPillsRow';

interface AudioCardProps {
  audio: AudioItem;
  isPlaying?: boolean;
  onPlay: (audio: AudioItem) => void;
  onToggleFavorite: (id: string) => void;
  onEdit?: (audio: AudioItem) => void;
  onDelete: (id: string) => void;
}

export const AudioCard: React.FC<AudioCardProps> = ({
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
    <article
      id={`audio-card-${audio.id}`}
      className={`group bg-white/95 border transition-all rounded-2xl p-3.5 flex flex-col justify-between relative shadow-xs hover:shadow-md ${
        isPlaying
          ? 'border-yellow-400 ring-2 ring-yellow-400/50 bg-yellow-50/40'
          : 'border-yellow-200/90 hover:border-yellow-400'
      }`}
    >
      <div>
        {/* Audio Banner / Disc Cover */}
        <div
          className="aspect-video bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-200/80 mb-3 relative overflow-hidden cursor-pointer rounded-xl border border-yellow-300 flex items-center justify-center group/cover shadow-inner"
          onClick={() => onPlay(audio)}
        >
          {/* Subtle spinning vinyl or glowing note */}
          <div className={`relative flex items-center justify-center transition-transform duration-700 ${isPlaying ? 'scale-105' : 'group-hover/cover:scale-105'}`}>
            <div className={`w-16 h-16 rounded-full bg-yellow-400/40 border-2 border-yellow-500/50 flex items-center justify-center backdrop-blur-xs ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
              <Disc3 className="w-9 h-9 text-amber-950" />
            </div>
            <div className="absolute w-8 h-8 rounded-full bg-yellow-400 text-stone-950 flex items-center justify-center shadow-md group-hover/cover:scale-110 transition-transform">
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-stone-950" />
              ) : (
                <Play className="w-4 h-4 fill-stone-950 ml-0.5" />
              )}
            </div>
          </div>

          {/* Audio Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/85 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] text-amber-950 font-semibold border border-yellow-300/80 shadow-2xs">
            {isLocalAudio ? (
              <>
                <HardDrive className="w-3 h-3 text-amber-700" />
                <span>Device Audio</span>
              </>
            ) : (
              <>
                <Music className="w-3 h-3 text-amber-700" />
                <span>Drive Audio</span>
              </>
            )}
          </div>

        </div>

        {/* Title */}
        <h4
          onClick={() => onPlay(audio)}
          className="text-base font-serif font-bold leading-snug mb-1 text-amber-950 group-hover:text-amber-700 transition-colors cursor-pointer line-clamp-2"
          title={audio.title}
        >
          {audio.title}
        </h4>

        {/* Artist/Source & Category */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="text-[11px] font-semibold text-amber-800/90 truncate max-w-[140px]">
            {audio.artistOrSource || (isLocalAudio ? 'Device Audio' : 'Google Drive Audio')}
          </p>
          {audio.fileSize && (
            <span className="text-[9.5px] font-mono text-amber-900 px-1 py-0.2 rounded bg-yellow-100 border border-yellow-200">
              {audio.fileSize}
            </span>
          )}
          {audio.category && (
            <span className="text-[9.5px] font-semibold text-amber-950 bg-yellow-100 border border-yellow-300 px-1.5 py-0.2 rounded-md flex items-center gap-1 shrink-0">
              <Tag className="w-2.5 h-2.5 text-amber-700" />
              <span>{translateCategoryToMarathi(audio.category)}</span>
            </span>
          )}
        </div>

        {/* Notes preview */}
        {audio.notes && (
          <p className="text-xs leading-relaxed text-amber-900/90 line-clamp-2 font-serif italic mb-2 bg-yellow-50/80 p-2 rounded-lg border border-yellow-200/80">
            "{audio.notes}"
          </p>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-2 pt-2.5 border-t border-yellow-200 flex items-center justify-between text-[10px] text-amber-800/80">
        <span className="font-medium text-amber-800/70">Added {formattedDate}</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPlay(audio)}
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-950 hover:text-amber-800 bg-yellow-100 hover:bg-yellow-200 px-2.5 py-1 rounded-lg border border-yellow-300 transition-colors cursor-pointer shadow-2xs"
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-amber-900" /> : <Play className="w-3 h-3 fill-amber-900" />}
            <span>{isPlaying ? 'Playing' : 'Listen'}</span>
          </button>

          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-amber-700 hover:text-amber-950 transition-colors rounded-md hover:bg-yellow-100 cursor-pointer"
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
                <div className="absolute right-0 bottom-full mb-1 w-44 bg-[#fffdf0] border border-yellow-300 rounded-xl shadow-lg z-20 py-1 text-xs text-amber-950 font-medium">
                  {!isLocalAudio && (
                    <>
                      <button
                        onClick={handleCopyLink}
                        className="w-full px-3 py-2 text-left hover:bg-yellow-100 flex items-center gap-2 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-amber-700" />}
                        <span>{copied ? 'Copied Link' : 'Copy Drive Link'}</span>
                      </button>

                      <a
                        href={audio.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowMenu(false)}
                        className="w-full px-3 py-2 text-left hover:bg-yellow-100 flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
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
                      className="w-full px-3 py-2 text-left hover:bg-yellow-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-700" />
                      <span>Play Audio</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (onEdit) onEdit(audio);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-yellow-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Edit Track</span>
                  </button>

                  <div className="h-px bg-yellow-200 my-1" />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(audio.id);
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
