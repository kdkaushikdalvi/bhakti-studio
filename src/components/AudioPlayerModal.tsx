import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Repeat,
  Volume2,
  VolumeX,
  Star,
  ExternalLink,
  Tag,
  Disc3,
  Globe,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import { AudioItem } from '../types';
import { translateCategoryToMarathi } from './CategoryPillsRow';
import {
  getGoogleDriveStreamUrl,
  getGoogleDrivePreviewUrl,
  formatAudioTime,
} from '../utils/googleDrive';
import { getLocalAudioUrl } from '../utils/audioStorage';

interface AudioPlayerModalProps {
  audio: AudioItem;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  audio,
  onClose,
  onToggleFavorite,
  onUpdateNotes,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audio.duration || 0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [notes, setNotes] = useState(audio.notes || '');
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [hasStreamError, setHasStreamError] = useState(false);
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string>('');

  const isLocalAudio = audio.sourceType === 'local' || (!audio.driveId && !audio.url.startsWith('http'));
  const previewUrl = audio.previewUrl || (audio.driveId ? getGoogleDrivePreviewUrl(audio.driveId) : '');

  // Resolve audio URL (local from IndexedDB or remote stream)
  useEffect(() => {
    let isMounted = true;

    async function loadAudioSource() {
      try {
        if (isLocalAudio) {
          const localUrl = await getLocalAudioUrl(audio.localBlobId || audio.id);
          if (isMounted) {
            if (localUrl) {
              setResolvedAudioUrl(localUrl);
            } else if (audio.streamUrl) {
              setResolvedAudioUrl(audio.streamUrl);
            }
          }
        } else if (audio.driveId) {
          const driveStream = audio.streamUrl || getGoogleDriveStreamUrl(audio.driveId);
          if (isMounted) {
            setResolvedAudioUrl(driveStream);
          }
        } else {
          if (isMounted) {
            setResolvedAudioUrl(audio.streamUrl || audio.url);
          }
        }
      } catch (err) {
        console.warn('Could not resolve audio source', err);
        if (isMounted) setHasStreamError(true);
      }
    }

    loadAudioSource();

    return () => {
      isMounted = false;
    };
  }, [audio.id, audio.sourceType, audio.localBlobId, audio.driveId, isLocalAudio]);

  // Auto-play when audio URL is resolved
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !resolvedAudioUrl) return;

    el.volume = volume;
    el.playbackRate = playbackRate;
    const playPromise = el.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [resolvedAudioUrl]);

  const handleTogglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('Playback blocked or stream error', e);
          setHasStreamError(true);
        });
    }
  };

  const handleTimeUpdate = () => {
    const el = audioRef.current;
    if (!el) return;
    setCurrentTime(el.currentTime);
    if (!isNaN(el.duration) && el.duration > 0) {
      setDuration(el.duration);
    }
  };

  const handleLoadedMetadata = () => {
    const el = audioRef.current;
    if (!el) return;
    if (!isNaN(el.duration)) {
      setDuration(el.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (el) {
      el.currentTime = target;
    }
  };

  const handleSkip = (seconds: number) => {
    const el = audioRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(el.duration || 99999, el.currentTime + seconds));
    el.currentTime = target;
    setCurrentTime(target);
  };

  const handleToggleMute = () => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (el) {
      el.volume = val;
      el.muted = false;
      setIsMuted(false);
    }
  };

  const handleCycleSpeed = () => {
    const rates = [1, 1.25, 1.5, 0.75];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-gradient-to-b from-stone-900 via-[#180e04] to-stone-950 text-amber-50 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-amber-900/40 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Disc3 className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-amber-200 truncate">
                Devotional Audio
              </h3>
              <p className="text-[10px] text-amber-400/70 truncate flex items-center gap-1">
                {isLocalAudio ? (
                  <>
                    <HardDrive className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span>Device Storage {audio.fileSize ? `• ${audio.fileSize}` : ''}</span>
                  </>
                ) : (
                  <span>Google Drive Sacred Audio</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(audio.id)}
              className={`hidden p-2 rounded-xl transition-colors cursor-pointer ${
                audio.isFavorite
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-800/80 text-stone-400 hover:text-amber-400'
              }`}
              title={audio.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
            >
              <Star className={`w-4 h-4 ${audio.isFavorite ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="Close Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Main Visualizer / Disc Art */}
          {!useIframeFallback ? (
            <div className="relative py-6 flex flex-col items-center justify-center">
              {/* Spinning Disc visual */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-amber-950 via-stone-900 to-amber-900 border-4 border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2)] flex items-center justify-center">
                {/* Vinyl Grooves */}
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-amber-500/10 flex items-center justify-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-amber-500/20 flex items-center justify-center">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center shadow-inner ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
                      <Disc3 className="w-10 h-10 text-amber-300" />
                    </div>
                  </div>
                </div>

                {/* Subtle center glow badge */}
                <div className="absolute inset-0 rounded-full bg-radial from-amber-400/10 to-transparent pointer-events-none" />
              </div>

              {/* Title & Artist */}
              <div className="mt-5 text-center max-w-sm px-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-amber-100 line-clamp-2 leading-tight">
                  {audio.title}
                </h2>
                <div className="mt-1.5 flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-xs text-amber-300/80">
                    {audio.artistOrSource || 'Spiritual Audio'}
                  </span>
                  {audio.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{translateCategoryToMarathi(audio.category)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Audio element for playback */}
              <audio
                ref={audioRef}
                src={resolvedAudioUrl}
                loop={isLooping}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                  if (!isLooping) setIsPlaying(false);
                }}
                onError={() => {
                  if (!isLocalAudio) {
                    console.warn('Google Drive direct stream CORS or cookie warning');
                  }
                  setHasStreamError(true);
                }}
              />

              {/* Notice if direct stream hit browser restrictions */}
              {hasStreamError && !isLocalAudio && audio.driveId && (
                <div className="mt-3 p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Browser blocking Drive audio stream?</span>
                  </div>
                  <button
                    onClick={() => setUseIframeFallback(true)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-[11px] shrink-0 transition-colors cursor-pointer"
                  >
                    Switch to Drive Embed
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Google Drive Iframe Embed Player Fallback */
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-amber-500/30 bg-black shadow-inner">
                <iframe
                  src={previewUrl}
                  title={audio.title}
                  className="w-full h-full border-0"
                  allow="autoplay"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => setUseIframeFallback(false)}
                  className="text-amber-400 hover:text-amber-300 underline text-xs cursor-pointer"
                >
                  ← Return to Devotional Player
                </button>
                <a
                  href={audio.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300"
                >
                  <span>Open in Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Player Controls (visible in native player mode) */}
          {!useIframeFallback && (
            <div className="space-y-4 bg-black/40 p-4 rounded-2xl border border-amber-900/30">
              {/* Progress Scrubber */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] font-mono text-amber-400/80">
                  <span>{formatAudioTime(currentTime)}</span>
                  <span>{formatAudioTime(duration)}</span>
                </div>
              </div>

              {/* Main Button Controls */}
              <div className="flex items-center justify-between gap-3">
                {/* Loop / Repeat Button (Great for Mantra Chanting) */}
                <button
                  type="button"
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isLooping
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'text-stone-400 hover:text-amber-300 hover:bg-stone-800'
                  }`}
                  title={isLooping ? 'Continuous Loop Active (Mantra Mode)' : 'Enable Continuous Loop'}
                >
                  <Repeat className="w-4 h-4" />
                </button>

                {/* Center play / skip cluster */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSkip(-10)}
                    className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
                    title="Rewind 10 seconds"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-stone-950" />
                    ) : (
                      <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSkip(10)}
                    className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
                    title="Forward 10 seconds"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed Toggle */}
                <button
                  type="button"
                  onClick={handleCycleSpeed}
                  className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
                  title="Playback Speed"
                >
                  {playbackRate}x
                </button>
              </div>

              {/* Volume Slider & Actions */}
              <div className="pt-2 border-t border-amber-900/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-1 max-w-[170px]">
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseIframeFallback(true)}
                    className="flex items-center gap-1 text-[11px] text-amber-400/80 hover:text-amber-300 cursor-pointer"
                    title="Toggle Google Drive embed player"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Embed</span>
                  </button>

                  <a
                    href={audio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-amber-400/80 hover:text-amber-300 cursor-pointer"
                    title="Open original file in Google Drive"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Drive</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Sadhana Notes / Reflection */}
          <div className="bg-black/30 p-3.5 rounded-2xl border border-amber-900/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
              <span>Sadhana Reflection / Lyrics</span>
              {onUpdateNotes && (
                <button
                  type="button"
                  onClick={() => onUpdateNotes(audio.id, notes)}
                  className="text-[10px] text-amber-400 hover:text-amber-200 underline cursor-pointer"
                >
                  Save Notes
                </button>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal notes, meanings of the bhajan, or mantra japa count..."
              rows={2}
              className="w-full bg-stone-900/80 border border-amber-900/40 rounded-xl p-2 text-xs text-amber-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
