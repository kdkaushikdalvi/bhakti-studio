import React from 'react';
import { UserProfile } from '../types';

interface StatsDashboardProps {
  userProfile?: UserProfile;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  userProfile,
}) => {
  return (
    <div className="mb-3">
      {/* Devotee Banner with Bhakti Logo */}
      <div className="p-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-2xl text-white shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-xs overflow-hidden shrink-0 ring-2 ring-white/80">
            <img
              src="/BhaktiLogo.png"
              alt="Bhakti"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-serif font-bold text-white truncate">
                {userProfile?.name ? `Namaste, ${userProfile.name}` : 'My Bhakti'}
              </span>
              <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded-full font-bold">
                {userProfile?.avatarIcon || '🕉️'}
              </span>
            </div>
            <p className="text-[11px] text-orange-100 font-serif italic truncate mt-0.5">
              {userProfile?.mantra || '|| भक्ती हीच माझी शक्ती ||'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
