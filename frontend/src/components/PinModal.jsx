import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Pin,
  Star,
  Loader2,
  Film,
} from 'lucide-react';
import { animeApi } from '../api/anime';
import { AnimeImage } from './AnimeImage';
import { soundFX } from '../utils/soundEffects';
import { useToast } from '../context/ToastContext';

export const PinModal = ({
  isOpen,
  onClose,
  initialPins = [],
  libraryAnimes = [],
  onSavePins,
}) => {
  const toast = useToast();
  if (!isOpen) return null;

  const [pins, setPins] = useState(initialPins || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setPins(initialPins || []);
  }, [initialPins]);

  // Search anime
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(libraryAnimes.slice(0, 20));
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await animeApi.searchAnime(searchQuery.trim(), 15);
        const list = res.data?.anime || res.data?.animes || [];
        setSearchResults(list);
      } catch (err) {
        // Fallback filter library
        const filtered = libraryAnimes.filter((a) =>
          a.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, libraryAnimes]);

  const handleTogglePin = (anime) => {
    const isAlreadyPinned = pins.some((p) => p.id === anime.id);

    if (isAlreadyPinned) {
      soundFX.playClick();
      setPins((prev) => prev.filter((p) => p.id !== anime.id));
    } else {
      if (pins.length >= 4) {
        toast.info('Maximum 4 anime can be pinned. Remove one first.');
        return;
      }
      soundFX.playEpisodeChime();
      setPins((prev) => [...prev, anime]);
    }
  };

  const handleRemovePin = (idx) => {
    soundFX.playClick();
    setPins((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    soundFX.playCompleteFanfare();
    onSavePins(pins);
    toast.success('Top 4 anime milestones updated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-zenkai-card border border-zenkai-border rounded-3xl shadow-2xl p-5 sm:p-7 flex flex-col max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zenkai-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Pin className="w-4 h-4 rotate-45 fill-amber-400/20" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">
                Curate Top 4 Favorite Anime
              </h3>
              <p className="text-xs text-zenkai-muted">
                Pin up to 4 anime milestones to showcase on your profile milestone board.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border border-zenkai-border transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current 4 Pinned Slots Grid */}
        <div className="py-4 border-b border-zenkai-border shrink-0">
          <p className="text-[11px] font-mono font-bold text-zenkai-dim uppercase tracking-wider mb-2.5">
            Pinned Slots ({pins.length} / 4):
          </p>
          <div className="grid grid-cols-4 gap-2.5">
            {[0, 1, 2, 3].map((slotIdx) => {
              const pinnedAnime = pins[slotIdx];
              return (
                <div
                  key={slotIdx}
                  className={`relative aspect-[2/3] rounded-xl overflow-hidden border-2 flex flex-col items-center justify-center transition-all ${
                    pinnedAnime
                      ? 'border-amber-500/40 bg-zenkai-surface shadow-md'
                      : 'border-dashed border-zenkai-border bg-zenkai-surface/30 text-zenkai-dim'
                  }`}
                >
                  {pinnedAnime ? (
                    <>
                      <img
                        src={pinnedAnime.coverImage}
                        alt={pinnedAnime.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-black font-black text-[9px]">
                        #{slotIdx + 1}
                      </div>
                      <button
                        onClick={() => handleRemovePin(slotIdx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title="Remove pin"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <Pin className="w-4 h-4 opacity-30 mx-auto mb-1 rotate-45" />
                      <span className="text-[10px] font-mono">Slot #{slotIdx + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Search / Select Anime */}
        <div className="pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zenkai-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime to pin (e.g. Naruto, Steins;Gate, Attack on Titan)..."
              className="w-full bg-zenkai-surface border border-zenkai-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zenkai-dim focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 pt-1 hide-scrollbar">
          {searchResults.length > 0 ? (
            searchResults.map((anime) => {
              const isPinned = pins.some((p) => p.id === anime.id);
              return (
                <div
                  key={anime.id}
                  onClick={() => handleTogglePin(anime)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isPinned
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-zenkai-surface/60 hover:bg-zenkai-surface border-zenkai-border'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-14 shrink-0 rounded-lg overflow-hidden bg-zenkai-card shadow-sm">
                      <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-white truncate max-w-[320px]">
                        {anime.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] text-zenkai-muted mt-0.5">
                        <span>{anime.type || 'TV'}</span>
                        {anime.score && (
                          <span className="text-amber-400 font-bold">★ {anime.score}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isPinned
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'bg-zenkai-card hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border border-zenkai-border'
                    }`}
                  >
                    {isPinned ? 'Pinned ✓' : '+ Pin'}
                  </button>
                </div>
              );
            })
          ) : isSearching ? (
            <div className="py-12 text-center text-xs text-zenkai-dim flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Searching Anime...</span>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zenkai-dim">
              No anime found. Search any title above to pin it to your profile.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zenkai-border flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zenkai-muted hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all btn-press cursor-pointer"
          >
            Save Pinned Top 4
          </button>
        </div>
      </div>
    </div>
  );
};
