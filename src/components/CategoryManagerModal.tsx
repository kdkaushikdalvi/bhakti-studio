import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Folder,
  Tag,
  AlertTriangle,
  RotateCcw,
  Compass,
  Music,
  Mic,
  Moon,
  Flame,
  Radio,
  Sparkles,
  Eye,
  BookOpen,
} from 'lucide-react';
import { CategoryInfo, VideoItem, PhotoItem, AudioItem } from '../types';
import { normalizeCategory, translateCategoryToMarathi } from './CategoryPillsRow';

interface CategoryManagerModalProps {
  categories: CategoryInfo[];
  videos: VideoItem[];
  photos: PhotoItem[];
  audios?: AudioItem[];
  onAddCategory: (category: CategoryInfo) => void;
  onUpdateCategory: (id: string, updated: Partial<CategoryInfo>, previousName: string) => void;
  onDeleteCategory: (category: CategoryInfo) => void;
  onClose: () => void;
}

const CATEGORY_COLORS = [
  '#FF6F00', '#EA580C', '#D97706', '#E65100', '#C2410C',
  '#10B981', '#06B6D4', '#6366F1', '#8B5CF6', '#EC4899',
  '#334155', '#475569',
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  categories,
  videos,
  photos,
  audios = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onClose,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#FF6F00');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [originalEditName, setOriginalEditName] = useState('');

  const [deleteConfirmCat, setDeleteConfirmCat] = useState<CategoryInfo | null>(null);

  // Check if there are non-Marathi preset names
  const hasUntranslatedPresets = categories.some(
    (c) => translateCategoryToMarathi(c.name) !== c.name
  );

  const handleApplyAllMarathi = () => {
    categories.forEach((cat) => {
      const marathi = translateCategoryToMarathi(cat.name);
      if (marathi !== cat.name) {
        onUpdateCategory(cat.id, { name: marathi }, cat.name);
      }
    });
  };

  // Calculate usage counts
  const getItemCount = (categoryName: string): { videoCount: number; photoCount: number; audioCount: number; total: number } => {
    const norm = normalizeCategory(categoryName);
    const videoCount = videos.filter(
      (v) => normalizeCategory(v.category || '') === norm
    ).length;
    const photoCount = photos.filter(
      (p) => normalizeCategory(p.category || '') === norm
    ).length;
    const audioCount = audios.filter(
      (a) => normalizeCategory(a.category || '') === norm
    ).length;
    return {
      videoCount,
      photoCount,
      audioCount,
      total: videoCount + photoCount + audioCount,
    };
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;

    if (categories.some((c) => normalizeCategory(c.name) === normalizeCategory(name))) {
      alert('या नावाची वर्गवारी आधीच अस्तित्वात आहे.');
      return;
    }

    onAddCategory({
      id: `cat-${Date.now()}`,
      name,
      color: newCatColor,
      description: newCatDesc.trim() || undefined,
    });

    setNewCatName('');
    setNewCatDesc('');
  };

  const startEdit = (cat: CategoryInfo) => {
    setEditingId(cat.id);
    setEditName(translateCategoryToMarathi(cat.name));
    setEditColor(cat.color);
    setEditDesc(cat.description || '');
    setOriginalEditName(cat.name);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;

    const trimmed = editName.trim();
    // Check if new name collisions with existing categories (other than this one)
    if (
      categories.some(
        (c) => c.id !== editingId && normalizeCategory(c.name) === normalizeCategory(trimmed)
      )
    ) {
      alert('या नावाची दुसरी वर्गवारी आधीच अस्तित्वात आहे.');
      return;
    }

    onUpdateCategory(
      editingId,
      {
        name: trimmed,
        color: editColor,
        description: editDesc.trim() || undefined,
      },
      originalEditName
    );

    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white border border-orange-200 rounded-3xl w-full max-w-[540px] max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-orange-700 block font-bold">
                Organization & Categories
              </span>
              <h3 className="text-base font-serif font-bold text-stone-900 leading-none">
                Manage Categories
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 transition-colors rounded-lg hover:bg-orange-100/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Add Category Form */}
          <form
            onSubmit={handleCreate}
            className="p-3.5 bg-orange-50/50 border border-orange-200/90 rounded-2xl space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-orange-900 block font-bold flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add New Category
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="उदा. स्तोत्र, अभंग, हरिपाठ..."
                  className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-base sm:text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-2xs"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="थोडक्यात वर्णन (ऐच्छिक)"
                  className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-base sm:text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-2xs"
                />
              </div>
            </div>

            {/* Color Selector */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-stone-500 mr-1">
                  Tag Color:
                </span>
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    className={`w-5 h-5 rounded-full transition-all cursor-pointer ${
                      newCatColor === c
                        ? 'scale-125 ring-2 ring-orange-600 ring-offset-1 shadow-xs'
                        : 'opacity-80 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!newCatName.trim()}
                className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>
          </form>

          {/* List of Existing Categories */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1 flex-wrap gap-2">
              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-orange-900 font-bold">
                  Existing Categories ({categories.length})
                </h4>
                <span className="text-[10px] text-stone-500">
                  वर्गवारी व्यवस्थापन व पुनर्नाव (मराठी)
                </span>
              </div>
              {hasUntranslatedPresets && (
                <button
                  type="button"
                  onClick={handleApplyAllMarathi}
                  className="px-2.5 py-1 text-[11px] font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-orange-300"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>सर्व मराठीत रूपांतरित करा</span>
                </button>
              )}
            </div>

            {categories.length === 0 ? (
              <div className="p-6 text-center bg-orange-50/40 border border-dashed border-orange-200 rounded-2xl">
                <Folder className="w-7 h-7 text-orange-400 mx-auto mb-1.5" />
                <p className="text-xs font-serif font-bold text-stone-800">
                  No categories created yet
                </p>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Add custom categories above to organize your bhajans, lectures, and darshans.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id;
                  const counts = getItemCount(cat.name);
                  const isDefaultCategory = ['cat-all', 'cat-kirtan', 'cat-bhajan', 'cat-bhakti-marg', 'cat-jkp', 'cat-aarti', 'cat-other'].includes(cat.id);

                  if (isEditing) {
                    return (
                      <div
                        key={cat.id}
                        className="p-3.5 bg-amber-50/90 border border-orange-300 space-y-2.5 rounded-2xl shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-orange-800">
                            Editing Category
                          </span>
                          <span className="text-[10px] text-stone-500">
                            Renaming will update {counts.total} item{counts.total === 1 ? '' : 's'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-white border border-orange-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="Category Name"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="bg-white border border-orange-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="Description"
                          />
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            {CATEGORY_COLORS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setEditColor(c)}
                                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                                  editColor === c
                                    ? 'scale-125 ring-2 ring-orange-600'
                                    : 'opacity-80 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="text-xs text-stone-500 hover:text-stone-800 px-2.5 py-1 cursor-pointer font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              className="px-3.5 py-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-bold rounded-xl shadow-2xs hover:from-orange-700 hover:to-amber-700 cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cat.id}
                      className="p-3 bg-white hover:bg-orange-50/40 border border-orange-100 flex items-center justify-between gap-3 transition-colors rounded-2xl shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-stone-900">
                              {translateCategoryToMarathi(cat.name)}
                            </span>
                            {cat.name !== translateCategoryToMarathi(cat.name) && (
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCategory(
                                    cat.id,
                                    { name: translateCategoryToMarathi(cat.name) },
                                    cat.name
                                  )
                                }
                                className="text-[9px] bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                                title="Click to rename to Marathi"
                              >
                                मराठीत बदला
                              </button>
                            )}
                            {counts.total > 0 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-orange-100/70 text-orange-800 font-semibold">
                                {counts.total} {counts.total === 1 ? 'item' : 'items'}
                              </span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="text-[10px] text-stone-500 truncate mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 text-stone-400 hover:text-orange-700 hover:bg-orange-100/60 rounded-lg transition-colors cursor-pointer"
                          title="Rename / Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCat(cat)}
                          disabled={isDefaultCategory}
                          className={`p-1.5 rounded-lg transition-colors ${isDefaultCategory ? 'text-stone-200 cursor-not-allowed' : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'}`}
                          title={isDefaultCategory ? 'Default categories cannot be deleted' : 'Delete Category'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Popup */}
        {deleteConfirmCat && (
          <div className="p-3.5 bg-rose-50 border-t border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {(() => {
                  const counts = getItemCount(deleteConfirmCat.name);
                  return counts.total > 0
                    ? <>{`Category "${deleteConfirmCat.name}" has ${counts.total} assigned media item${counts.total === 1 ? '' : 's'}. Move them to another category before deleting; media will not be deleted.`}</>
                    : <>Delete category <strong>"{deleteConfirmCat.name}"</strong>? Media items will remain intact in your vault.</>;
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                onClick={() => setDeleteConfirmCat(null)}
                className="text-xs text-stone-600 hover:text-stone-900 px-2 py-1 cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                disabled={getItemCount(deleteConfirmCat.name).total > 0}
                onClick={() => {
                  onDeleteCategory(deleteConfirmCat);
                  setDeleteConfirmCat(null);
                }}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-orange-50/60 border-t border-orange-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors rounded-xl shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
