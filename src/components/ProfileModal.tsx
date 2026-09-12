import React, { useState } from 'react';
import { X, User, Sparkles, Heart, Flame, Save } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  userProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ userProfile, onSave, onClose }) => {
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });

  const avatarOptions = ['🕉️', '🪷', '🦚', '🔥', '📿', '✨', '☀️', '🌸'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn font-sans">
      <div className="w-full max-w-[460px] bg-[#FFFDF9] rounded-3xl border border-orange-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl border border-white/30 shadow-xs shrink-0">
              {formData.avatarIcon || '🕉️'}
            </div>
            <div>
              <h3 className="text-base font-bold font-serif leading-none">Seeker Profile</h3>
              <p className="text-xs text-indigo-100 mt-1">Manage spiritual identity &amp; goals</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-stone-800">
          {/* Avatar Icon Picker */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Spiritual Emblem
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatarIcon: emoji })}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                    formData.avatarIcon === emoji
                      ? 'bg-indigo-100 border-2 border-indigo-600 scale-110 shadow-xs'
                      : 'bg-white border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Seeker / Devotee Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Kaushik Dalvi"
                className="w-full pl-3.5 pr-3.5 py-2.5 bg-white border border-orange-200 rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Daily Sadhana Mantra */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Daily Mantra / Invocation
            </label>
            <input
              type="text"
              value={formData.mantra}
              onChange={(e) => setFormData({ ...formData, mantra: e.target.value })}
              placeholder="e.g. ॐ नमो भगवते वासुदेवाय or Hare Krishna"
              className="w-full px-3.5 py-2.5 bg-white border border-orange-200 rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* Spiritual Goal */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Daily Practice / Goal
            </label>
            <input
              type="text"
              value={formData.spiritualGoal}
              onChange={(e) => setFormData({ ...formData, spiritualGoal: e.target.value })}
              placeholder="e.g. 30 mins discourse contemplation & 108 japa mala"
              className="w-full px-3.5 py-2.5 bg-white border border-orange-200 rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* App Motto Badge */}
          <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 text-center">
            <p className="text-xs font-serif font-bold text-orange-900">
              || भक्ती हीच माझी शक्ती ||
            </p>
            <p className="text-[10px] text-stone-500 mt-0.5">Devotion is my supreme power</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 bg-white text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-xs hover:from-indigo-700 hover:to-purple-700 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
