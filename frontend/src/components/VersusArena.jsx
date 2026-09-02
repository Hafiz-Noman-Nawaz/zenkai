import React, { useState } from 'react';
import { Swords, Flame, Sparkles, Check, Users, MessageCircle, Trophy, Zap } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';
import { useToast } from '../context/ToastContext';

const DEFAULT_DUELS = [
  {
    id: 'duel-1',
    category: 'Epic Shounen Arc of the Century',
    tag: 'Weekly Clash #42',
    left: {
      name: 'Chimera Ant Arc',
      anime: 'Hunter x Hunter',
      votes: 1420,
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
      quote: '"You know nothing of the bottomless malice within the human heart."',
    },
    right: {
      name: 'Pain Invasion Arc',
      anime: 'Naruto Shippuden',
      votes: 1280,
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80',
      quote: '"Those who do not understand true pain can never understand true peace."',
    },
  },
  {
    id: 'duel-2',
    category: 'The Ultimate Mastermind Finale',
    tag: 'Weekly Clash #43',
    left: {
      name: 'Lelouch vi Britannia (Zero Requiem)',
      anime: 'Code Geass',
      votes: 980,
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&q=80',
      quote: '"If the king does not lead, how can he expect his subordinates to follow?"',
    },
    right: {
      name: 'Eren Yeager (The Rumbling)',
      anime: 'Attack on Titan',
      votes: 1150,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
      quote: '"If you win, you live. If you lose, you die. If you don\'t fight, you can\'t win!"',
    },
  },
];

export const VersusArena = () => {
  const toast = useToast();
  const [activeDuelIdx, setActiveDuelIdx] = useState(0);
  const [votedMap, setVotedMap] = useState({}); // { [duelId]: 'left' | 'right' }

  const duel = DEFAULT_DUELS[activeDuelIdx];
  const userVote = votedMap[duel.id];

  const leftVotes = duel.left.votes + (userVote === 'left' ? 1 : 0);
  const rightVotes = duel.right.votes + (userVote === 'right' ? 1 : 0);
  const totalVotes = leftVotes + rightVotes;

  const leftPct = Math.round((leftVotes / totalVotes) * 100);
  const rightPct = 100 - leftPct;

  const handleVote = (side) => {
    if (userVote) return;
    soundFX.playEpisodeChime();
    setVotedMap((prev) => ({ ...prev, [duel.id]: side }));
    toast.success(`Vote cast for ${side === 'left' ? duel.left.name : duel.right.name}!`);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-zenkai-card via-zenkai-surface to-zenkai-elevated border border-indigo-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Background Cyberpunk Ambient Flare */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Swords className="w-4 h-4 animate-bounce" />
            <span>{duel.tag}</span>
          </div>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            {duel.category}
          </h3>
          <p className="text-xs text-zenkai-muted mt-1">
            Cast your vote in this week's community debate and unlock live sentiment analysis.
          </p>
        </div>

        {/* Matchup Switcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-zenkai-surface p-1 rounded-2xl border border-white/10">
          {DEFAULT_DUELS.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => setActiveDuelIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeDuelIdx === idx
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zenkai-muted hover:text-white'
              }`}
            >
              Match 0{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Versus Battle Grid */}
      <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Central VS Badge */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-3xl bg-black border-2 border-amber-400/80 shadow-2xl items-center justify-center font-display font-black text-lg text-amber-400 rotate-12 shadow-amber-400/30 animate-pulse">
          VS
        </div>

        {/* LEFT CONTENDER */}
        <div
          onClick={() => handleVote('left')}
          className={`relative rounded-3xl p-5 sm:p-6 border-2 transition-all cursor-pointer group overflow-hidden ${
            userVote === 'left'
              ? 'bg-rose-950/40 border-rose-500 ring-4 ring-rose-500/30'
              : 'bg-zenkai-surface/60 hover:bg-zenkai-surface border-white/10 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-20 sm:w-20 sm:h-28 rounded-2xl overflow-hidden bg-zenkai-card border border-white/10 shrink-0 shadow-xl group-hover:scale-105 transition-transform">
              <img
                src={duel.left.image}
                alt={duel.left.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                {duel.left.anime}
              </span>
              <h4 className="font-display font-black text-base sm:text-lg text-white group-hover:text-rose-300 transition-colors">
                {duel.left.name}
              </h4>
              <p className="text-[11px] text-zenkai-muted italic leading-relaxed line-clamp-2">
                {duel.left.quote}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-white">
              {leftVotes.toLocaleString()} Votes ({leftPct}%)
            </span>
            <button
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                userVote === 'left'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 group-hover:bg-rose-500 group-hover:text-white'
              }`}
            >
              {userVote === 'left' ? 'Voted ✓' : 'Vote Left'}
            </button>
          </div>
        </div>

        {/* RIGHT CONTENDER */}
        <div
          onClick={() => handleVote('right')}
          className={`relative rounded-3xl p-5 sm:p-6 border-2 transition-all cursor-pointer group overflow-hidden ${
            userVote === 'right'
              ? 'bg-cyan-950/40 border-cyan-400 ring-4 ring-cyan-500/30'
              : 'bg-zenkai-surface/60 hover:bg-zenkai-surface border-white/10 hover:border-cyan-500/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-20 sm:w-20 sm:h-28 rounded-2xl overflow-hidden bg-zenkai-card border border-white/10 shrink-0 shadow-xl group-hover:scale-105 transition-transform">
              <img
                src={duel.right.image}
                alt={duel.right.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                {duel.right.anime}
              </span>
              <h4 className="font-display font-black text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors">
                {duel.right.name}
              </h4>
              <p className="text-[11px] text-zenkai-muted italic leading-relaxed line-clamp-2">
                {duel.right.quote}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-white">
              {rightVotes.toLocaleString()} Votes ({rightPct}%)
            </span>
            <button
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                userVote === 'right'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-white'
              }`}
            >
              {userVote === 'right' ? 'Voted ✓' : 'Vote Right'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Tug-of-War Distribution Bar */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-rose-400">{leftPct}% ({duel.left.name})</span>
          <span className="text-zenkai-dim flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{totalVotes.toLocaleString()} Total Votes</span>
          </span>
          <span className="text-cyan-400">{rightPct}% ({duel.right.name})</span>
        </div>

        {/* Dynamic Dual-Color Tug Bar */}
        <div className="h-3.5 bg-zenkai-surface rounded-full overflow-hidden flex border border-white/10 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-l-full transition-all duration-700 shadow-md"
            style={{ width: `${leftPct}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-r-full transition-all duration-700 shadow-md"
            style={{ width: `${rightPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
