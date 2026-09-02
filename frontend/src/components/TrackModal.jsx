import React, { useState, useEffect } from 'react';
import { X, Heart, Plus, Minus, Check, Trash2, Loader2, Sparkles } from 'lucide-react';
import { userAnimeApi } from '../api/userAnime';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { RatingSelector } from './RatingStars';

export const TrackModal = ({ isOpen, onClose, anime, initialEntry = null, onUpdated }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [status, setStatus] = useState('WATCHING');
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialEntry) {
      setStatus(initialEntry.status || 'WATCHING');
      setProgress(initialEntry.progress || 0);
      setScore(initialEntry.score || null);
      setIsFavorite(!!initialEntry.isFavorite);
      setNotes(initialEntry.notes || '');
    } else {
      setStatus('WATCHING');
      setProgress(0);
      setScore(null);
      setIsFavorite(false);
      setNotes('');
    }
  }, [initialEntry, anime]);

  if (!isOpen || !anime) return null;

  const totalEpisodes = anime.episodes || 0;

  const statusOptions = [
    { value: 'WATCHING', label: 'Watching', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { value: 'PLAN_TO_WATCH', label: 'Plan to Watch', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    { value: 'ON_HOLD', label: 'On Hold', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { value: 'DROPPED', label: 'Dropped', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  ];

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to track anime in your library.');
      return;
    }

    setSaving(true);
    try {
      const response = await userAnimeApi.upsertEntry(anime.id, {
        status,
        progress: Number(progress),
        score: score ? Number(score) : null,
        isFavorite,
        notes,
      });

      if (response.success) {
        toast.success(`Updated "${anime.title}" in your library`);
        if (onUpdated) onUpdated(response.data.entry);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update tracking');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialEntry) return;
    setDeleting(true);
    try {
      const response = await userAnimeApi.removeEntry(anime.id);
      if (response.success) {
        toast.info(`Removed "${anime.title}" from your library`);
        if (onUpdated) onUpdated(null);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove entry');
    } finally {
      setDeleting(false);
    }
  };

  const handleProgressChange = (newVal) => {
    let bounded = Math.max(0, newVal);
    if (totalEpisodes > 0) {
      bounded = Math.min(bounded, totalEpisodes);
    }
    setProgress(bounded);
    if (totalEpisodes > 0 && bounded === totalEpisodes) {
      setStatus('COMPLETED');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg bg-zenkai-card border border-zenkai-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zenkai-border/80 bg-zenkai-surface/80">
          <div className="flex items-center gap-3">
            <img
              src={anime.coverImage || 'https://via.placeholder.com/100x150'}
              alt={anime.title}
              className="w-10 h-14 rounded-lg object-cover bg-zenkai-bg shrink-0 shadow-sm"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{anime.title}</h3>
              <p className="text-[11px] text-zenkai-muted truncate">
                {anime.type} • {totalEpisodes ? `${totalEpisodes} Episodes` : 'Episodes TBA'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zenkai-dim hover:text-white rounded-lg hover:bg-zenkai-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Status Chips */}
          <div>
            <label className="text-xs font-semibold text-zenkai-muted block mb-2.5">Watch Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-center ${
                    status === opt.value
                      ? `${opt.color} shadow-sm font-bold scale-[1.02]`
                      : 'bg-zenkai-surface border-zenkai-border text-zenkai-muted hover:text-white hover:border-zenkai-subtle'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Episode Stepper */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zenkai-muted">Episode Progress</label>
              <span className="text-xs font-mono font-bold text-indigo-300">
                {progress} / {totalEpisodes || '??'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleProgressChange(progress - 1)}
                disabled={progress <= 0}
                className="w-10 h-10 rounded-xl bg-zenkai-surface border border-zenkai-border flex items-center justify-center text-zenkai-text hover:bg-zenkai-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0"
                  max={totalEpisodes || 9999}
                  value={progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-center bg-zenkai-surface border border-zenkai-border rounded-xl py-2 font-mono font-bold text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleProgressChange(progress + 1)}
                disabled={totalEpisodes > 0 && progress >= totalEpisodes}
                className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 hover:bg-indigo-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>

              {totalEpisodes > 0 && (
                <button
                  type="button"
                  onClick={() => handleProgressChange(totalEpisodes)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-zenkai-surface border border-zenkai-border hover:bg-zenkai-elevated text-zenkai-muted hover:text-white transition-all"
                >
                  Max
                </button>
              )}
            </div>
          </div>

          {/* Rating Selector */}
          <div className="bg-zenkai-surface/60 border border-zenkai-border/70 rounded-xl p-4">
            <RatingSelector value={score} onChange={setScore} />
          </div>

          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
              isFavorite
                ? 'bg-pink-950/30 border-pink-500/40 text-pink-300'
                : 'bg-zenkai-surface border-zenkai-border text-zenkai-muted hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
              <span className="text-xs font-semibold">
                {isFavorite ? 'Favorited Anime' : 'Add to Favorites'}
              </span>
            </div>
            <span className="text-[11px] font-medium text-zenkai-dim">
              {isFavorite ? 'Featured on your Profile' : 'Off'}
            </span>
          </button>

          {/* Personal Notes */}
          <div>
            <label className="text-xs font-semibold text-zenkai-muted block mb-2">Personal Notes & Reflections</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your personal thoughts, favorite arcs, or viewing notes..."
              className="w-full bg-zenkai-surface border border-zenkai-border rounded-xl p-3 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-zenkai-border/80 bg-zenkai-surface/90">
          {initialEntry ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Remove
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zenkai-muted hover:text-white hover:bg-zenkai-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || deleting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
