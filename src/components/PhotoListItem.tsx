import React, { useState } from 'react';
import {
  Star,
  Trash2,
  Maximize2,
  Image as ImageIcon,
  MoreVertical,
} from 'lucide-react';
import { PhotoItem } from '../types';

interface PhotoListItemProps {
  photo: PhotoItem;
  onView: (photo: PhotoItem) => void;
  onToggleFavorite: (photoId: string) => void;
  onDelete: (photoId: string) => void;
}

export const PhotoListItem: React.FC<PhotoListItemProps> = ({
  photo,
  onView,
  onToggleFavorite,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const formattedDate = new Date(photo.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      id={`photo-row-${photo.id}`}
      className="group bg-white border border-orange-100 p-2.5 transition-colors flex items-center justify-between gap-3 rounded-xl shadow-2xs relative"
    >
      {/* Thumbnail + Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          onClick={() => onView(photo)}
          className="relative w-16 h-14 bg-orange-50 dark:bg-stone-800 overflow-hidden shrink-0 cursor-pointer rounded-lg border border-orange-100/80 dark:border-stone-700/80 group"
        >
          <img
            src={photo.photoUrl}
            alt={photo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-stone-900/15 group-hover:bg-stone-900/35 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow-xs" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            {photo.fileSize && (
              <>
                <span className="text-[9px] text-stone-300 dark:text-stone-600">•</span>
                <span className="text-[9px] text-stone-400">{photo.fileSize}</span>
              </>
            )}
          </div>

          <h4
            onClick={() => onView(photo)}
            className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100 hover:text-orange-600 dark:hover:text-cyan-300 transition-colors line-clamp-1 cursor-pointer"
            title={photo.title}
          >
            {photo.title}
          </h4>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Favorite Button */}
        <button
          type="button"
          onClick={() => onToggleFavorite(photo.id)}
          className={`p-1.5 border transition-colors rounded-lg cursor-pointer ${
            photo.isFavorite
              ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
              : 'border-orange-100 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-stone-700'
          }`}
          title={photo.isFavorite ? 'Remove Favorite' : 'Mark as Favorite'}
        >
        </button>

        {/* View / Fullscreen Button */}
        <button
          type="button"
          onClick={() => onView(photo)}
          className="p-1.5 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-cyan-600 dark:to-blue-600 text-white text-xs font-semibold rounded-lg shadow-2xs hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer"
          title="View in Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* More actions */}
        <button
          type="button"
          onClick={() => setShowMenu((open) => !open)}
          className="p-1.5 border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          title="More actions"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
        {showMenu && <button type="button" onClick={() => { setShowMenu(false); onDelete(photo.id); }} className="absolute right-2 bottom-10 z-50 px-3 py-2 bg-white border border-orange-200 rounded-lg shadow-lg text-xs text-rose-600">Remove</button>}
      </div>
    </div>
  );
};
