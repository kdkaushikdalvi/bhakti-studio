import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  Share,
  PlusSquare,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPwaModalProps {
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn font-sans">
      <div className="w-full max-w-[480px] bg-[#FFFDF9] rounded-3xl border border-orange-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-full bg-white p-0.5 shadow-lg overflow-hidden shrink-0 ring-2 ring-white/80">
              <img
                src="/BhaktiLogo.png"
                alt="Bhakti PWA"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold font-serif leading-none">Install Bhakti</h3>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold">
                  PWA
                </span>
              </div>
              <p className="text-xs text-orange-100 mt-1">1-Tap Offline Spiritual Companion</p>
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
        <div className="p-5 overflow-y-auto space-y-3.5 custom-scrollbar text-stone-700">
          {/* Quick Install Button if supported by browser */}
          {deferredPrompt && !isInstalled && (
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl flex flex-col gap-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Instant 1-Click Install Available</span>
              </div>
              <button
                onClick={handleTriggerInstall}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install Bhakti Now</span>
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bhakti is installed on this device!</span>
            </div>
          )}

          {/* Storage & Data Safety Guarantee */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-950">Data Safety Guarantee</p>
              <p className="text-emerald-900 leading-relaxed text-[11px]">
                Installing as a PWA, refreshing, or cleaning cache will <strong>never clear your data</strong>.
                All your saved videos, photos, and audio files are securely kept in permanent storage.
              </p>
            </div>
          </div>

          <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
            <p className="text-xs text-orange-950 font-medium">
              Enjoy instant app loading, full offline playback, and zero app store downloads!
            </p>
          </div>

          {/* Android / Chrome Guide */}
          <div className="p-3.5 bg-white border border-stone-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <Smartphone className="w-4 h-4 text-orange-600" />
              <span>Android &amp; Google Chrome</span>
            </div>
            <ol className="text-xs text-stone-600 space-y-1 pl-5 list-decimal">
              <li>Tap the three dots menu (<strong className="text-stone-900">⋮</strong>) in the top right.</li>
              <li>Select <strong className="text-orange-700">"Install app"</strong> or <strong className="text-orange-700">"Add to Home Screen"</strong>.</li>
              <li>Tap <strong className="text-stone-900">Install</strong> to add the Bhakti icon to your launcher.</li>
            </ol>
          </div>

          {/* iOS Safari Guide */}
          <div className="p-3.5 bg-white border border-stone-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <Share className="w-4 h-4 text-orange-600" />
              <span>iPhone &amp; iPad (Apple Safari)</span>
            </div>
            <ol className="text-xs text-stone-600 space-y-1 pl-5 list-decimal">
              <li>Tap the <strong className="text-stone-900">Share</strong> button (<Share className="w-3.5 h-3.5 inline text-sky-600 mx-0.5" />) at the bottom toolbar.</li>
              <li>Scroll down and tap <strong className="text-orange-700">"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-stone-700 mx-0.5" />).</li>
              <li>Confirm <strong className="text-stone-900">Add</strong> in the top right corner.</li>
            </ol>
          </div>

          {/* Desktop Guide */}
          <div className="p-3.5 bg-white border border-stone-200 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <Laptop className="w-4 h-4 text-orange-600" />
              <span>Desktop (Chrome, Edge, Brave)</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Click the <Download className="w-3.5 h-3.5 inline text-orange-600 mx-0.5" /> icon inside your browser address bar to install Bhakti as a standalone desktop window.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 font-medium">Free &amp; Privacy Friendly</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-xs hover:from-orange-600 hover:to-amber-600 cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

