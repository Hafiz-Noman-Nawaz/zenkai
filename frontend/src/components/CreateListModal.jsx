import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Layers,
  Check,
  Loader2,
  Film,
} from 'lucide-react';
import { listApi } from '../api/lists';
import { animeApi } from '../api/anime';
import { useToast } from '../context/ToastContext';
import { AnimeImage } from './AnimeImage';

export const CreateListModal = ({ isOpen, onClose, onListCreated }) => {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await animeApi.searchAnime(searchQuery.trim(), 6);
      const list = res.data?.anime || res.data?.animes || [];
      setSearchResults(list);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleAddAnime = (anime) => {
    if (selectedAnime.some((a) => a.id === anime.id)) {
      toast.info('Anime is already in this collection');
      return;
    }
    setSelectedAnime((prev) => [...prev, anime]);
  };

  const handleRemoveAnime = (animeId) => {
    setSelectedAnime((prev) => prev.filter((a) => a.id !== animeId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('Please provide a collection title');
      return;
    }
    if (selectedAnime.length === 0) {
      toast.warning('Please add at least 1 anime to your collection');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        isPublic,
        animeIds: selectedAnime.map((a) => a.id),
      };

      const res = await listApi.createList(payload);
      if (res.success) {
        toast.success(`Created collection "${title}"!`);
        if (onListCreated) onListCreated(res.data.list);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create collection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zenkai-card border border-zenkai-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zenkai-border">
          <div className="flex items-center gap-2 text-white font-display font-black text-lg">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Create Custom Curated Collection</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-zenkai-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Collection Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Top 10 Mind-Bending Psychological Anime"
              className="w-full bg-zenkai-surface border border-zenkai-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Description / Curatorial Notes
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share what makes this list special, themes, or ranking criteria..."
              className="w-full bg-zenkai-surface border border-zenkai-border rounded-xl p-3 text-xs sm:text-sm text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Search & Add Anime */}
          <div className="space-y-3 pt-2 border-t border-zenkai-border/50">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Search & Add Anime to Collection ({selectedAnime.length} Added)
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zenkai-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type anime title (e.g. Frieren, Steins;Gate)..."
                  className="w-full bg-zenkai-surface border border-zenkai-border rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </div>

            {/* Search Results Dropdown/Row */}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-zenkai-surface/60 border border-zenkai-border">
                {searchResults.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleAddAnime(a)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-zenkai-card hover:bg-zenkai-elevated border border-zenkai-border text-left transition-all group"
                  >
                    <div className="w-8 aspect-[2/3] rounded overflow-hidden shrink-0">
                      <AnimeImage src={a.coverImage} alt={a.title} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-bold text-white group-hover:text-indigo-300 truncate">
                      {a.title}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Anime Chips/Row */}
            {selectedAnime.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedAnime.map((a, idx) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zenkai-surface border border-zenkai-border text-xs font-semibold text-white"
                  >
                    <span className="font-mono text-[10px] text-indigo-400">#{idx + 1}</span>
                    <span className="max-w-[140px] truncate">{a.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAnime(a.id)}
                      className="text-zenkai-dim hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zenkai-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border text-xs font-semibold text-zenkai-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-40"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Publish Collection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
