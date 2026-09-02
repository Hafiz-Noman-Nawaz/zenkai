import React, { useState, useRef, useEffect } from 'react';
import {
  Headphones,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Music2,
  Volume1,
  Bell,
  BellOff,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

const STATIONS = [
  {
    id: 'lofi-tokyo',
    name: 'Tokyo Midnight Lofi',
    genre: 'Chilled Anime Beats',
    // High-availability icecast lofi stream
    url: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    cover: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=150&q=80',
  },
  {
    id: 'synthwave-cyber',
    name: 'Cyberpunk Neo-Shinjuku',
    genre: 'Synthwave & Retrowave',
    url: 'https://stream.zeno.fm/9k9fs6e408zuv',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&q=80',
  },
  {
    id: 'anime-piano',
    name: 'Studio Ghibli & Piano Nostalgia',
    genre: 'Acoustic Anime Melodies',
    url: 'https://stream.zeno.fm/yr6ua10ag0zuv',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&q=80',
  },
];

export const ZenkaiLounge = () => {
  const audioRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStationIdx, setCurrentStationIdx] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [fxMuted, setFxMuted] = useState(false);

  const currentStation = STATIONS[currentStationIdx];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    soundFX.playClick();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('Playback error:', e);
          setIsPlaying(false);
        });
    }
  };

  const changeStation = (idx) => {
    soundFX.playClick();
    setCurrentStationIdx(idx);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.src = STATIONS[idx].url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleFx = () => {
    const next = !fxMuted;
    setFxMuted(next);
    soundFX.setMuted(next);
    if (!next) soundFX.playEpisodeChime();
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentStation.url}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Widget (Bottom-Left) */}
      <div className="fixed bottom-5 left-5 z-40 select-none">
        {/* Expanded Music Player Dock */}
        {isOpen && (
          <div className="mb-3 w-72 sm:w-80 rounded-3xl bg-zenkai-card/95 border border-zenkai-border/80 backdrop-blur-2xl shadow-2xl p-4 space-y-4 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-indigo-400" />
                <span className="font-display font-black text-xs text-white uppercase tracking-wider">
                  Zenkai Lounge Radio
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-zenkai-dim hover:text-white rounded-lg"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Current Station Art & Track Info */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-zenkai-surface border border-white/10 shrink-0 shadow-md">
                <img
                  src={currentStation.cover}
                  alt={currentStation.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isPlaying ? 'scale-110' : ''
                  }`}
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-indigo-950/40 flex items-center justify-center gap-0.5">
                    <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="w-1 h-5 bg-indigo-400 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2.5 bg-purple-400 rounded-full animate-pulse delay-150" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h5 className="font-bold text-xs text-white truncate">{currentStation.name}</h5>
                <p className="text-[10px] text-zenkai-muted font-mono">{currentStation.genre}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>24/7 Simulcast</span>
                </span>
              </div>
            </div>

            {/* Station Switcher List */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-zenkai-dim uppercase">Select Station:</p>
              {STATIONS.map((station, idx) => (
                <button
                  key={station.id}
                  onClick={() => changeStation(idx)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                    currentStationIdx === idx
                      ? 'bg-indigo-600/25 border-indigo-400 text-white font-bold'
                      : 'bg-zenkai-surface/60 hover:bg-zenkai-elevated border-white/5 text-zenkai-muted hover:text-white'
                  }`}
                >
                  <span className="truncate">{station.name}</span>
                  {currentStationIdx === idx && isPlaying && (
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>

            {/* Volume & FX Controls */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-zenkai-dim hover:text-white p-1"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="flex-1 accent-indigo-500 h-1.5 bg-zenkai-surface rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zenkai-muted pt-1">
                <button
                  onClick={toggleFx}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-mono font-semibold transition-all ${
                    fxMuted
                      ? 'bg-zenkai-surface text-zenkai-dim border-white/5'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  }`}
                >
                  {fxMuted ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                  <span>UI Sound Effects: {fxMuted ? 'Muted' : 'Active'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Minified Trigger Pill */}
        <div className="flex items-center gap-2 bg-zenkai-card/90 border border-zenkai-border/80 backdrop-blur-xl p-1.5 pr-3 rounded-2xl shadow-xl hover:border-indigo-500/40 transition-all">
          <button
            onClick={togglePlay}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-600/30'
                : 'bg-zenkai-surface hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border border-white/10'
            }`}
            title={isPlaying ? 'Pause Radio' : 'Play Lofi Radio'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-left"
          >
            <div>
              <p className="text-xs font-bold text-white max-w-[110px] sm:max-w-[130px] truncate">
                {currentStation.name}
              </p>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-zenkai-dim">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-cyan-400 animate-ping' : 'bg-zenkai-dim'}`} />
                <span>{isPlaying ? 'Streaming' : 'Zenkai Lounge'}</span>
              </div>
            </div>
            <ChevronUp className={`w-3.5 h-3.5 text-zenkai-dim transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </>
  );
};
