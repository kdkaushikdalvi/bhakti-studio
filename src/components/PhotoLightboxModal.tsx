import React from 'react';
import {
  X,
  Star,
  Trash2,
  Download,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { PhotoItem } from '../types';

interface PhotoLightboxModalProps {
  photo: PhotoItem;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  photo,
  onClose,
  onToggleFavorite,
  onDelete,
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.photoUrl;
    link.download = `${photo.title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="w-full max-w-[540px] bg-[#FFFDF9] rounded-3xl border border-orange-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-3.5 px-4 bg-orange-50/80 border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <h3 className="text-xs font-serif font-bold text-stone-900 truncate">
              {photo.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-orange-100 text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Full Image Container */}
        <div className="flex-1 overflow-auto bg-stone-900 flex items-center justify-center p-2 min-h-[260px] max-h-[58vh]">
          <img
            src={photo.photoUrl}
            alt={photo.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* Info & Metadata Footer */}
        <div className="p-4 bg-white border-t border-orange-100 space-y-3">
          <div className="flex items-center justify-end text-xs">
            <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-400" />
                {new Date(photo.createdAt).toLocaleDateString()}
              </span>
              {photo.fileSize && (
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-stone-400" />
                  {photo.fileSize}
                </span>
              )}
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="pt-2 border-t border-orange-100/70 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onToggleFavorite(photo.id)}
                className={`hidden px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  photo.isFavorite
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-orange-50 text-stone-700 hover:bg-orange-100'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-white' : ''}`} />
                <span>{photo.isFavorite ? 'Favorited' : 'Favorite'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDownload}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                title="Download Photo"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this photo from storage?')) {
                    onDelete(photo.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
