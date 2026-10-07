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
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-3.5 px-4 bg-white border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <h3 className="text-sm font-serif font-bold text-black truncate">
              {photo.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Full Image Container - Always fits all photos in full view without cutting top or sides */}
        <div className="w-full bg-neutral-950 flex items-center justify-center p-2 sm:p-3 overflow-hidden">
          <img
            src={photo.photoUrl}
            alt={photo.title}
            className="w-auto h-auto max-w-full max-h-[62vh] object-contain rounded select-none block mx-auto"
          />
        </div>

        {/* Info & Action Footer */}
        <div className="p-3 px-4 bg-white border-t border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-neutral-400" />
              {new Date(photo.createdAt).toLocaleDateString()}
            </span>
            {photo.fileSize && (
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-neutral-400" />
                {photo.fileSize}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 hover:text-black transition-colors cursor-pointer"
              title="Download Photo"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete "${photo.title}"?`)) {
                  onDelete(photo.id);
                  onClose();
                }
              }}
              className="p-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
