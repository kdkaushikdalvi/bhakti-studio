import React, { useState, useRef } from 'react';
import {
  X,
  Settings,
  Clock,
  Sliders,
  Check,
  Volume2,
  Save,
  Pin,
  Layers,
  ShieldCheck,
  Download,
  Upload,
  HardDrive,
} from 'lucide-react';
import { AppSettings, CategoryInfo } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
  categories?: CategoryInfo[];
  onExportBackup?: () => void;
  onImportBackup?: (file: File) => void;
  videoCount?: number;
  photoCount?: number;
  audioCount?: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
  categories = [],
  onExportBackup,
  onImportBackup,
  videoCount = 0,
  photoCount = 0,
  audioCount = 0,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportBackup) {
      onImportBackup(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn font-sans">
      <div className="w-full max-w-[460px] bg-[#FFFDF9] rounded-3xl border border-orange-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shadow-xs shrink-0">
              <Settings className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif leading-none">App Preferences</h3>
              <p className="text-xs text-orange-100 mt-1">Time format, default category &amp; layout</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-stone-800">
          {/* Default Launch Category for Videos */}
          <div className="p-3.5 bg-white border border-teal-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h4 className="text-xs font-bold text-stone-900">Videos Pinned Category</h4>
              </div>
              <span className="text-[10px] text-teal-700 font-serif font-medium">
                {(formData.defaultVideoCategory || formData.defaultCategory) ? `Pinned: ${formData.defaultVideoCategory || formData.defaultCategory}` : 'All Categories'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Default category opened when viewing Videos.
            </p>
            <select
              value={formData.defaultVideoCategory ?? (formData.defaultCategory || '')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultVideoCategory: e.target.value,
                  defaultCategory: e.target.value,
                })
              }
              className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="">All Categories (सर्व संग्रह)</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Default Launch Category for Photos */}
          <div className="p-3.5 bg-white border border-purple-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h4 className="text-xs font-bold text-stone-900">Photos Pinned Category</h4>
              </div>
              <span className="text-[10px] text-purple-700 font-serif font-medium">
                {formData.defaultPhotoCategory ? `Pinned: ${formData.defaultPhotoCategory}` : 'All Categories'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Default category opened when viewing Photos.
            </p>
            <select
              value={formData.defaultPhotoCategory || ''}
              onChange={(e) => setFormData({ ...formData, defaultPhotoCategory: e.target.value })}
              className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">All Categories (सर्व संग्रह)</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Format */}
          <div className="p-3.5 bg-white border border-orange-200 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-stone-900">Timestamp Display Format</h4>
              <p className="text-[11px] text-stone-500">Choose between 12-hour or 24-hour video markers</p>
            </div>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, timeFormat: '12h' })}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  formData.timeFormat === '12h'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                12h
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, timeFormat: '24h' })}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  formData.timeFormat === '24h'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                24h
              </button>
            </div>
          </div>

          {/* Compact Cards Toggle */}
          <div className="p-3.5 bg-white border border-orange-200 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-stone-900">Compact Mobile Cards</h4>
              <p className="text-[11px] text-stone-500">Condense video cards for higher density view</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.compactCards}
                onChange={(e) => setFormData({ ...formData, compactCards: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {/* Data Safety & Dual-Layer Storage Protection */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <h4 className="text-xs font-bold text-emerald-950">Data Safety &amp; Durability</h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold">
                Protected
              </span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Your media vault is stored in high-capacity <strong>IndexedDB &amp; Persistent Local Storage</strong>.
              Refreshing the page, cleaning temporary caches, or installing as a PWA will <strong>never clear your data</strong>.
            </p>

            <div className="flex items-center justify-between text-[11px] text-stone-600 bg-white/80 p-2 rounded-xl border border-emerald-100">
              <span>Saved Items:</span>
              <span className="font-semibold text-stone-900">
                {videoCount} Videos • {audioCount} Audios • {photoCount} Photos
              </span>
            </div>

            {/* Export & Import Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {onExportBackup && (
                <button
                  type="button"
                  onClick={onExportBackup}
                  className="w-full py-1.5 px-2 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Backup</span>
                </button>
              )}
              {onImportBackup && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-1.5 px-2 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Import Backup</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 bg-white text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-xs hover:from-orange-600 hover:to-amber-600 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
