import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  X,
  Compass,
  Zap,
  Flame,
  Heart,
  Moon,
  Sun,
  Shield,
  Loader2,
  Check,
  ChevronRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import { animeApi } from '../api/anime';
import { AnimeImage } from './AnimeImage';
import { RatingBadge } from './RatingStars';
import { soundFX } from '../utils/soundEffects';

const VIBE_TAGS = [
  { id: 'plot-twist', label: 'Mind-Bending Plot Twists', genre: 'Mystery', scoreMin: 8.2 },
  { id: 'dark-gritty', label: 'Dark & Psychological', genre: 'Psychological', scoreMin: 8.0 },
  { id: 'god-tier-anim', label: 'High-Octane Action & Sakuga', genre: 'Action', scoreMin: 8.3 },
  { id: 'cry-heavy', label: 'Deep Emotional Drama', genre: 'Drama', scoreMin: 8.0 },
  { id: 'cyberpunk', label: 'Cyberpunk & Sci-Fi Dystopia', genre: 'Sci-Fi', scoreMin: 7.8 },
  { id: 'cozy-iyashikei', label: 'Cozy & Wholesome Slice of Life', genre: 'Slice of Life', scoreMin: 7.6 },
  { id: 'epic-hype', label: 'Zero-to-Hero Shounen Hype', genre: 'Adventure', scoreMin: 8.1 },
  { id: 'romance-spark', label: 'Heartfelt Romance & Drama', genre: 'Romance', scoreMin: 7.9 },
];

export const ZenkaiOracleModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [selectedVibes, setSelectedVibes] = useState(['god-tier-anim']);
  const [maxEpisodes, setMaxEpisodes] = useState(26);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const [hasRun, setHasRun] = useState(false);

  const toggleVibe = (id) => {
    soundFX.playClick();
    setSelectedVibes((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((v) => v !== id) : prev) : [...prev, id]
    );
  };

  const handleDiscover = async () => {
    soundFX.playEpisodeChime();
    setAnalyzing(true);
    setHasRun(true);

    try {
      const selectedObj = VIBE_TAGS.filter((v) => selectedVibes.includes(v.id));
      const targetGenre = selectedObj[0]?.genre || 'Action';

      const res = await animeApi.getAnimeList({
        genre: targetGenre,
        limit: 15,
        sortBy: 'score',
      });

      const list = res.data?.anime || res.data?.animes || [];

      // Filter by max episodes if specified
      let filtered = list.filter((a) => {
        if (!a.episodes) return true;
        return a.episodes <= maxEpisodes + 12;
      });

      if (filtered.length === 0) filtered = list;

      const scoredResults = filtered.slice(0, 3).map((a, idx) => {
        const synergy = Math.min(99, Math.max(88, Math.round(92 + (a.score ? a.score * 0.7 : 4) - idx * 2)));
        const tagNames = selectedObj.map((o) => o.label).join(' + ');

        let curatorNote = `Curated for high resonance with ${tagNames}.`;
        if (a.score && a.score >= 8.5) {
          curatorNote = `Universal Masterpiece: Ranked in the top echelon with a community score of ${a.score.toFixed(1)}/10.`;
        }

        return {
          ...a,
          synergy,
          curatorNote,
        };
      });

      setTimeout(() => {
        setResults(scoredResults);
        setAnalyzing(false);
      }, 400);
    } catch (err) {
      console.error('Vibe discovery failed:', err);
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div
        className="w-full max-w-2xl bg-gradient-to-br from-zenkai-card via-zenkai-surface to-zenkai-elevated border border-purple-500/40 rounded-3xl shadow-2xl p-5 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto hide-scrollbar relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Flares */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-600/30">
              <div className="w-full h-full rounded-2xl bg-zenkai-card flex items-center justify-center text-cyan-300">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                <span>Vibe Discovery Engine</span>
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  CURATED DISCOVERY
                </span>
              </h3>
              <p className="text-xs text-zenkai-muted">
                Match your exact mood with top-tier anime recommendations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vibe Selection Tags */}
        <div className="py-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Step 1: Select Your Vibe (Pick 1 or more)</span>
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
              {VIBE_TAGS.map((tag) => {
                const isSelected = selectedVibes.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleVibe(tag.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-spring border flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-600/25 scale-[1.03]'
                        : 'bg-zenkai-surface/80 hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border-white/10'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Episode Length Preference */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider block">
              Step 2: Pacing & Length Preference
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { val: 13, label: 'Short Series (≤13 eps)' },
                { val: 26, label: 'Standard (≤26 eps)' },
                { val: 999, label: 'Long Journey (All)' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setMaxEpisodes(opt.val)}
                  className={`p-2.5 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    maxEpisodes === opt.val
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-zenkai-surface/60 text-zenkai-muted hover:text-white border-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Discovery Launcher Button */}
          <div className="pt-3">
            <button
              onClick={handleDiscover}
              disabled={analyzing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-display font-black text-sm shadow-xl shadow-indigo-600/30 transition-spring flex items-center justify-center gap-2 btn-press cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Matching Catalog Records...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Find My Next Anime</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Showcase */}
        {hasRun && !analyzing && (
          <div className="pt-4 border-t border-white/10 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                <span>Curated Recommendations</span>
              </span>
              <span className="text-[11px] font-mono text-zenkai-dim">
                Top Matches Found
              </span>
            </div>

            <div className="space-y-3">
              {results.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zenkai-surface/80 hover:bg-zenkai-surface border border-purple-500/30 shadow-xl group transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-14 h-20 shrink-0 rounded-xl overflow-hidden bg-zenkai-card relative shadow-md">
                      <AnimeImage
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-black font-black text-[9px]">
                        #{idx + 1}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                          {item.synergy}% MATCH
                        </span>
                        {item.score && (
                          <span className="text-xs font-bold text-amber-400">
                            ★ {Number(item.score).toFixed(1)}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-white truncate group-hover:text-purple-300 transition-colors">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-zenkai-muted leading-relaxed line-clamp-1">
                        {item.curatorNote}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/anime/${item.id}`}
                    onClick={onClose}
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <span>View Anime</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
