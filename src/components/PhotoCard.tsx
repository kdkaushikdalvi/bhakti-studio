import React from 'react';
import {
  Star,
  Trash2,
  Maximize2,
} from 'lucide-react';
import { PhotoItem } from '../types';

interface PhotoCardProps {
  photo: PhotoItem;
  onView: (photo: PhotoItem) => void;
  onToggleFavorite: (photoId: string) => void;
  onDelete: (photoId: string) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onView,
  onToggleFavorite,
  onDelete,
}) => {
  return (
    <div className="bg-white border border-emerald-200 hover:border-emerald-300 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group relative">
      {/* Image Container with aspect ratio */}
      <div
        onClick={() => onView(photo)}
        className="relative w-full aspect-[4/3] bg-emerald-50/50 overflow-hidden cursor-pointer group"
      >
        <img
          src={photo.photoUrl}
          alt={photo.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover / Touch View Icon overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-white/90 text-stone-900 shadow-md flex items-center justify-center">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Card Info & Actions */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <h4
            onClick={() => onView(photo)}
            className="text-xs font-serif font-bold text-emerald-950 line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer leading-snug"
          >
            {photo.title}
          </h4>
          <div className="flex items-center gap-2 text-[10px] text-emerald-800/60 mt-1">
            <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
            {photo.fileSize && (
              <>
                <span>•</span>
                <span>{photo.fileSize}</span>
              </>
            )}
          </div>
        </div>

        {/* Quick Card Controls */}
        <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between text-stone-500">
          <div className="flex items-center gap-1">
            {/* Favorite Button */}
            <button
              type="button"
              onClick={() => onToggleFavorite(photo.id)}
              className={`hidden p-1.5 rounded-lg transition-colors cursor-pointer ${
                photo.isFavorite
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'hover:bg-emerald-50 text-stone-400 hover:text-emerald-600'
              }`}
              title={photo.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
            >
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(photo.id)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
