import React, { useState } from 'react';
import {
  X,
  Trash2,
  Tag,
} from 'lucide-react';
import { VideoItem, CategoryInfo } from '../types';
import { translateCategoryToMarathi, normalizeCategory } from './CategoryPillsRow';

interface EditVideoModalProps {
  video: VideoItem;
  categories?: CategoryInfo[];
  onSave: (updated: VideoItem) => void;
  onClose: () => void;
}

const DEFAULT_CATEGORIES = [
  'भजन',
  'अभंग',
  'कीर्तन',
  'प्रवचन',
  'आरती',
  'हरिपाठ',
  'स्तोत्र',
  'ध्यान',
  'मंत्र',
  'दर्शन',
  'कथा',
];

export const EditVideoModal: React.FC<EditVideoModalProps> = ({
  video,
  categories,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(video.title);
  const [channelTitle, setChannelTitle] = useState(video.channelTitle || '');
  const [category, setCategory] = useState(translateCategoryToMarathi(video.category || 'भजन'));
  const [notes, setNotes] = useState(video.notes || '');

  const availableCategories = React.useMemo(() => {
    if (!categories || categories.length === 0) return DEFAULT_CATEGORIES;
    const names = categories
      .map((c) => translateCategoryToMarathi(c.name))
      .filter((n) => n && normalizeCategory(n) !== 'all');
    return names.length > 0 ? Array.from(new Set(names)) : DEFAULT_CATEGORIES;
  }, [categories]);
  
  // Tags
  const [tags, setTags] = useState<string[]>(video.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Timestamps
  const [timestamps, setTimestamps] = useState(video.timestamps || []);
  const [tsTime, setTsTime] = useState('');
  const [tsLabel, setTsLabel] = useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleAddTimestamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tsTime || !tsLabel) return;
    const parts = tsTime.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (!isNaN(Number(tsTime))) {
      seconds = Number(tsTime);
    }
    setTimestamps([...timestamps, { time: seconds, label: tsLabel.trim() }]);
    setTsTime('');
    setTsLabel('');
  };

  const handleRemoveTimestamp = (idx: number) => {
    setTimestamps(timestamps.filter((_, i) => i !== idx));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...video,
      title: title.trim() || video.title,
      channelTitle: channelTitle.trim() || video.channelTitle,
      category: category.trim() || video.category || 'भजन',
      tags,
      notes: notes.trim(),
      timestamps,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white border border-orange-200 rounded-2xl w-full max-w-[540px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 bg-orange-50/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-orange-700 block font-bold">
              Edit Details
            </span>
            <h3 className="text-base font-serif font-bold text-stone-900">Revise Video Entry</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 transition-colors rounded-lg hover:bg-orange-100/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-orange-800 mb-1 font-bold">
              Video Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-orange-50/30 border border-orange-200 rounded-xl px-3 py-2 text-base sm:text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          {/* Channel */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-orange-800 mb-1 font-bold">
              Channel / Speaker
            </label>
            <input
              type="text"
              value={channelTitle}
              onChange={(e) => setChannelTitle(e.target.value)}
              placeholder="Speaker or Channel"
              className="w-full bg-orange-50/30 border border-orange-200 rounded-xl px-3 py-2 text-base sm:text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-orange-800 mb-1 font-bold">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-orange-50/30 border border-orange-200 rounded-xl max-h-28 overflow-y-auto">
              {availableCategories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    normalizeCategory(category) === normalizeCategory(c)
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'bg-white text-stone-700 hover:bg-orange-100/60 border border-orange-200/70'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-orange-800 mb-1 font-bold">
              Tags / Keywords
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-orange-50/30 border border-orange-200 rounded-xl min-h-[38px]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 border border-orange-200 bg-white text-orange-800 text-[11px] font-semibold rounded-md shadow-2xs"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag and press Enter"
                className="flex-1 bg-transparent border-none text-base sm:text-xs text-stone-800 placeholder-stone-400 focus:outline-none min-w-[120px]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-orange-800 mb-1 font-bold">
              Reflections &amp; Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record reflections or notes..."
              className="w-full p-2.5 bg-orange-50/30 border border-orange-200 rounded-xl text-base sm:text-xs font-serif text-stone-900 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Timestamps */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-orange-800 mb-1 font-bold">
              Chapters
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tsTime}
                onChange={(e) => setTsTime(e.target.value)}
                placeholder="1:45"
                className="w-20 px-2 py-1 bg-orange-50/30 border border-orange-200 rounded-lg text-base sm:text-xs font-mono text-stone-900 focus:outline-none"
              />
              <input
                type="text"
                value={tsLabel}
                onChange={(e) => setTsLabel(e.target.value)}
                placeholder="Chapter name"
                className="flex-1 px-2 py-1 bg-orange-50/30 border border-orange-200 rounded-lg text-base sm:text-xs text-stone-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTimestamp}
                disabled={!tsTime || !tsLabel}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg disabled:opacity-40 cursor-pointer"
              >
                +
              </button>
            </div>

            <div className="space-y-1 max-h-24 overflow-y-auto">
              {timestamps.map((ts, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-2.5 py-1 bg-orange-50/40 border border-orange-100 rounded-lg"
                >
                  <span className="text-orange-700 font-mono text-[11px] font-bold">
                    {Math.floor(ts.time / 60)}:{(ts.time % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-stone-800 truncate max-w-[240px]">{ts.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTimestamp(idx)}
                    className="text-stone-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-orange-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-800 px-3 py-2 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
