import React from 'react';
import { Link } from 'react-router-dom';
import { X, Mic, Star, Film, Sparkles, ExternalLink } from 'lucide-react';

export const SeiyuuModal = ({ isOpen, onClose, character, animeTitle }) => {
  if (!isOpen || !character) return null;

  // Curated prominent other roles fallback for famous seiyuu
  const sampleOtherRoles = [
    { title: 'Jujutsu Kaisen', role: 'Kento Nanami', studio: 'MAPPA' },
    { title: 'Attack on Titan', role: 'Levi Ackerman', studio: 'Wit Studio' },
    { title: 'Demon Slayer', role: 'Tengen Uzui', studio: 'Ufotable' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl glass-luxury border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zenkai-surface hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
          <Mic className="w-4 h-4" />
          <span>Voice Actor & Character Chronicle</span>
        </div>

        {/* Character & Voice Actor Showcase */}
        <div className="flex items-center gap-5 p-4 rounded-2xl bg-zenkai-surface/60 border border-white/10">
          <div className="w-20 aspect-[2/3] rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
            <img
              src={character.image || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300'}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">{character.role || 'Main Character'}</span>
            <h3 className="font-display font-black text-lg text-white truncate">{character.name}</h3>
            {character.japaneseName && (
              <p className="text-xs font-mono text-zenkai-dim">{character.japaneseName}</p>
            )}
            <p className="text-xs text-zenkai-muted font-medium pt-1">
              Voiced by <span className="text-white font-bold">{character.voiceActor || 'Kenjiro Tsuda'}</span>
            </p>
          </div>
        </div>

        {/* Other Notable Performances */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Notable Roles by {character.voiceActor || 'Seiyuu'}
          </h4>

          <div className="space-y-2">
            {sampleOtherRoles.map((role) => (
              <div
                key={role.title}
                className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs"
              >
                <div>
                  <p className="font-bold text-white">{role.title}</p>
                  <p className="text-[11px] text-zenkai-muted">{role.role}</p>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {role.studio}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-spring btn-press"
        >
          Close Chronicle
        </button>
      </div>
    </div>
  );
};
