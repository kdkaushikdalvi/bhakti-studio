import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { PhotoItem } from '../types';

interface PhotoListItemProps {
  photo: PhotoItem;
  onView: (photo: PhotoItem) => void;
  onToggleFavorite?: (photoId: string) => void;
  onDelete: (photoId: string) => void;
}

export const PhotoListItem: React.FC<PhotoListItemProps> = ({
  photo,
  onView,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      id={`photo-row-${photo.id}`}
      className="group bg-white border border-neutral-200 hover:border-neutral-300 p-2.5 transition-colors flex items-center justify-between gap-3 rounded-xl shadow-2xs relative"
    >
      {/* Thumbnail + Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          onClick={() => onView(photo)}
          className="relative w-14 h-16 bg-neutral-100 overflow-hidden shrink-0 cursor-pointer rounded-lg border border-neutral-200 group"
        >
          <img
            src={photo.photoUrl}
            alt={photo.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow-xs" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            {photo.fileSize && (
              <span className="text-[9px] font-mono text-neutral-500 bg-neutral-100 border border-neutral-200 px-1 rounded">
                {photo.fileSize}
              </span>
            )}
          </div>

          <h4
            onClick={() => onView(photo)}
            className="text-xs font-serif font-bold text-neutral-900 hover:text-black transition-colors line-clamp-1 cursor-pointer"
            title={photo.title}
          >
            {photo.title}
          </h4>
        </div>
      </div>

      {/* Right Action Controls: 3-Dot Action Button */}
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
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                onView(photo);
              }}
              className="w-full px-2.5 py-2 rounded-lg text-left flex items-center gap-2.5 hover:bg-neutral-100 text-neutral-800 cursor-pointer transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>View photo</span>
            </button>

            <div className="my-1 border-t border-neutral-100" />

            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                if (window.confirm(`Delete "${photo.title}"?`)) {
                  onDelete(photo.id);
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
