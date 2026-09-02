import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swords, Flame, Sparkles, Check, Users, MessageCircle, Trophy, Zap, Star, Loader2 } from 'lucide-react';
import { animeApi } from '../api/anime';
import { AnimeImage } from './AnimeImage';
import { soundFX } from '../utils/soundEffects';
import { useToast } from '../context/ToastContext';

export const VersusArena = () => {
  const toast = useToast();
  const [matchups, setMatchups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDuelIdx, setActiveDuelIdx] = useState(0);
  const [votedMap, setVotedMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('zenkai_versus_votes') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const fetchDuels = async () => {
      try {
        const res = await animeApi.getPopularAnime(8);
        const list = res.data?.anime || res.data?.animes || [];
        if (list.length >= 4) {
          const generatedDuels = [
            {
              id: 'duel-clash-1',
              category: 'Pinnacle Popularity Titan Clash',
              tag: 'Headline Clash #1',
              left: {
                id: list[0]?.id,
                name: list[0]?.title,
                score: list[0]?.score || 8.9,
                votes: 1420,
                image: list[0]?.coverImage,
                genres: (list[0]?.genres || []).map((g) => g.name || g.genre?.name || g).slice(0, 2).join(' • '),
              },
              right: {
                id: list[1]?.id,
                name: list[1]?.title,
                score: list[1]?.score || 8.8,
                votes: 1280,
                image: list[1]?.coverImage,
                genres: (list[1]?.genres || []).map((g) => g.name || g.genre?.name || g).slice(0, 2).join(' • '),
              },
            },
            {
              id: 'duel-clash-2',
              category: 'Masterpiece Tier Showdown',
              tag: 'Headline Clash #2',
              left: {
                id: list[2]?.id,
                name: list[2]?.title,
                score: list[2]?.score || 8.7,
                votes: 980,
                image: list[2]?.coverImage,
                genres: (list[2]?.genres || []).map((g) => g.name || g.genre?.name || g).slice(0, 2).join(' • '),
              },
              right: {
                id: list[3]?.id,
                name: list[3]?.title,
                score: list[3]?.score || 8.6,
                votes: 1150,
                image: list[3]?.coverImage,
                genres: (list[3]?.genres || []).map((g) => g.name || g.genre?.name || g).slice(0, 2).join(' • '),
              },
            },
          ];
          setMatchups(generatedDuels);
        }
      } catch (err) {
        console.error('Failed to load Versus matchups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDuels();
  }, []);

  if (loading || matchups.length === 0) {
    return null;
  }

  const duel = matchups[activeDuelIdx] || matchups[0];
  const userVote = votedMap[duel.id];

  const leftVotes = duel.left.votes + (userVote === 'left' ? 1 : 0);
  const rightVotes = duel.right.votes + (userVote === 'right' ? 1 : 0);
  const totalVotes = leftVotes + rightVotes;

  const leftPct = Math.round((leftVotes / totalVotes) * 100);
  const rightPct = 100 - leftPct;

  const handleVote = (side) => {
    if (userVote) return;
    soundFX.playEpisodeChime();
    const newVotes = { ...votedMap, [duel.id]: side };
    setVotedMap(newVotes);
    try {
      localStorage.setItem('zenkai_versus_votes', JSON.stringify(newVotes));
    } catch {}
    toast.success(`Vote recorded for ${side === 'left' ? duel.left.name : duel.right.name}!`);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-zenkai-card via-zenkai-surface to-zenkai-elevated border border-indigo-500/30 p-5 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Ambient Cyberpunk Glow Flares */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Swords className="w-4 h-4 animate-bounce" />
            <span>{duel.tag}</span>
          </div>
          <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
            {duel.category}
          </h3>
          <p className="text-xs text-zenkai-muted mt-1">
            Cast your vote in this week's community debate and unlock live sentiment distribution.
          </p>
        </div>

        {/* Matchup Switcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-zenkai-surface p-1 rounded-2xl border border-white/10">
          {matchups.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => setActiveDuelIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
      <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative">
        {/* Central VS Badge */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-2xl bg-black border-2 border-amber-400/80 shadow-2xl items-center justify-center font-display font-black text-base text-amber-400 rotate-12 shadow-amber-400/30 animate-pulse pointer-events-none">
          VS
        </div>

        {/* LEFT CONTENDER */}
        <div
          onClick={() => handleVote('left')}
          className={`relative rounded-3xl p-4 sm:p-6 border-2 transition-all cursor-pointer group overflow-hidden ${
            userVote === 'left'
              ? 'bg-rose-950/40 border-rose-500 ring-4 ring-rose-500/30'
              : 'bg-zenkai-surface/60 hover:bg-zenkai-surface border-white/10 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-16 h-22 sm:w-20 sm:h-28 rounded-2xl overflow-hidden bg-zenkai-card border border-white/10 shrink-0 shadow-xl group-hover:scale-105 transition-transform">
              <AnimeImage
                src={duel.left.image}
                alt={duel.left.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block truncate">
                {duel.left.genres || 'Popular Masterwork'}
              </span>
              <h4 className="font-display font-black text-sm sm:text-base text-white group-hover:text-rose-300 transition-colors line-clamp-2">
                {duel.left.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{Number(duel.left.score).toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-white">
              {leftVotes.toLocaleString()} Votes ({leftPct}%)
            </span>
            <button
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                userVote === 'left'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 group-hover:bg-rose-500 group-hover:text-white'
              }`}
            >
              {userVote === 'left' ? 'Voted ✓' : 'Vote Contender'}
            </button>
          </div>
        </div>

        {/* RIGHT CONTENDER */}
        <div
          onClick={() => handleVote('right')}
          className={`relative rounded-3xl p-4 sm:p-6 border-2 transition-all cursor-pointer group overflow-hidden ${
            userVote === 'right'
              ? 'bg-cyan-950/40 border-cyan-400 ring-4 ring-cyan-500/30'
              : 'bg-zenkai-surface/60 hover:bg-zenkai-surface border-white/10 hover:border-cyan-500/50'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-16 h-22 sm:w-20 sm:h-28 rounded-2xl overflow-hidden bg-zenkai-card border border-white/10 shrink-0 shadow-xl group-hover:scale-105 transition-transform">
              <AnimeImage
                src={duel.right.image}
                alt={duel.right.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block truncate">
                {duel.right.genres || 'Popular Masterwork'}
              </span>
              <h4 className="font-display font-black text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                {duel.right.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{Number(duel.right.score).toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-white">
              {rightVotes.toLocaleString()} Votes ({rightPct}%)
            </span>
            <button
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                userVote === 'right'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-white'
              }`}
            >
              {userVote === 'right' ? 'Voted ✓' : 'Vote Contender'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Tug-of-War Distribution Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-rose-400 truncate max-w-[35%]">{leftPct}% ({duel.left.name})</span>
          <span className="text-zenkai-dim flex items-center gap-1 shrink-0">
            <Users className="w-3.5 h-3.5" />
            <span>{totalVotes.toLocaleString()} Votes</span>
          </span>
          <span className="text-cyan-400 truncate max-w-[35%] text-right">{rightPct}% ({duel.right.name})</span>
        </div>

        {/* Dynamic Dual-Color Tug Bar */}
        <div className="h-3 bg-zenkai-surface rounded-full overflow-hidden flex border border-white/10 p-0.5">
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
