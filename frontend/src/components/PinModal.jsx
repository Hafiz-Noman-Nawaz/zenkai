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
  ArrowLeftRight,
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
  initialSlot = null,
}) => {
  const toast = useToast();
  if (!isOpen) return null;

  const [pins, setPins] = useState(() => {
    const arr = [...(initialPins || [])];
    while (arr.length < 4) arr.push(null);
    return arr.slice(0, 4);
  });
  const [activeSlot, setActiveSlot] = useState(initialSlot !== null ? initialSlot : 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const arr = [...(initialPins || [])];
    while (arr.length < 4) arr.push(null);
    setPins(arr.slice(0, 4));
    if (initialSlot !== null) setActiveSlot(initialSlot);
  }, [initialPins, initialSlot]);

  // Search anime or show library suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Show library anime or top popular
      const lib = (libraryAnimes || []).slice(0, 25);
      if (lib.length > 0) {
        setSearchResults(lib);
        setIsSearching(false);
      } else {
        // Fetch top popular anime
        setIsSearching(true);
        animeApi
          .getPopularAnime(15)
          .then((res) => {
            setSearchResults(res.data?.anime || res.data?.animes || []);
          })
          .catch(() => {})
          .finally(() => setIsSearching(false));
      }
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await animeApi.searchAnime(searchQuery.trim(), 20);
        const list = res.data?.anime || res.data?.animes || [];
        setSearchResults(list);
      } catch (err) {
        const filtered = (libraryAnimes || []).filter((a) =>
          a.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, libraryAnimes]);

  const handleSelectAnimeForActiveSlot = (anime) => {
    soundFX.playEpisodeChime();
    setPins((prev) => {
      const next = [...prev];
      // If this anime is already pinned in another slot, clear that slot
      const existingIdx = next.findIndex((p) => p && p.id === anime.id);
      if (existingIdx !== -1 && existingIdx !== activeSlot) {
        next[existingIdx] = null;
      }
      next[activeSlot] = anime;
      return next;
    });

    // Automatically advance to the next empty slot
    const nextSlot = (activeSlot + 1) % 4;
    setActiveSlot(nextSlot);
    toast.success(`Pinned "${anime.title}" to Slot #${activeSlot + 1}`);
  };

  const handleRemoveSlot = (slotIdx, e) => {
    if (e) e.stopPropagation();
    soundFX.playClick();
    setPins((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    setActiveSlot(slotIdx);
  };

  const handleSave = () => {
    soundFX.playCompleteFanfare();
    const finalPins = pins.filter(Boolean);
    onSavePins(finalPins);
    toast.success('Top 4 anime milestones successfully updated!');
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
                Customize Top 4 Favorite Anime
              </h3>
              <p className="text-xs text-zenkai-muted">
                Click a slot below, then choose any anime from your library or search the catalog.
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

        {/* 4 Interactive Slot Selectors */}
        <div className="py-4 border-b border-zenkai-border shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-zenkai-dim uppercase tracking-wider">
              Selected Slots (Click slot to replace):
            </span>
            <span className="text-[11px] font-bold text-amber-400">
              Editing: Slot #{activeSlot + 1}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {[0, 1, 2, 3].map((slotIdx) => {
              const pinnedAnime = pins[slotIdx];
              const isActive = activeSlot === slotIdx;
              return (
                <div
                  key={slotIdx}
                  onClick={() => setActiveSlot(slotIdx)}
                  className={`relative aspect-[2/3] rounded-2xl overflow-hidden border-2 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                    isActive
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[1.03] shadow-lg shadow-amber-500/20'
                      : pinnedAnime
                      ? 'border-amber-500/40 bg-zenkai-surface hover:border-amber-400/80'
                      : 'border-dashed border-zenkai-border bg-zenkai-surface/30 hover:border-amber-500/40 text-zenkai-dim'
                  }`}
                >
                  {pinnedAnime ? (
                    <>
                      <img
                        src={pinnedAnime.coverImage}
                        alt={pinnedAnime.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge */}
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-black font-black text-[9px] shadow-sm">
                        #{slotIdx + 1}
                      </div>
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute inset-0 bg-amber-500/20 border-2 border-amber-400 rounded-2xl pointer-events-none" />
                      )}
                      {/* Remove Button */}
                      <button
                        onClick={(e) => handleRemoveSlot(slotIdx, e)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/80 hover:bg-rose-600 text-white transition-colors cursor-pointer opacity-80 group-hover:opacity-100 z-10"
                        title="Remove anime from this slot"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {/* Title overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 text-left">
                        <span className="text-[10px] font-bold text-white line-clamp-1">
                          {pinnedAnime.title}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <Pin
                        className={`w-4 h-4 mx-auto mb-1 rotate-45 ${
                          isActive ? 'text-amber-400' : 'opacity-30'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono font-bold block ${
                          isActive ? 'text-amber-400' : 'text-zenkai-dim'
                        }`}
                      >
                        Slot #{slotIdx + 1}
                      </span>
                      <span className="text-[9px] text-zenkai-muted mt-0.5 block">
                        {isActive ? 'Select below' : 'Empty'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Search / Filter Input */}
        <div className="pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zenkai-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search anime to assign to Slot #${activeSlot + 1}...`}
              className="w-full bg-zenkai-surface border border-zenkai-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zenkai-dim focus:outline-none focus:border-amber-500 shadow-inner"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 pt-1 hide-scrollbar">
          {searchResults.length > 0 ? (
            searchResults.map((anime) => {
              const currentSlotOfThisAnime = pins.findIndex((p) => p && p.id === anime.id);
              const isPinned = currentSlotOfThisAnime !== -1;
              const isCurrentActive = pins[activeSlot]?.id === anime.id;

              return (
                <div
                  key={anime.id}
                  onClick={() => handleSelectAnimeForActiveSlot(anime)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isCurrentActive
                      ? 'bg-amber-500/20 border-amber-400'
                      : isPinned
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-zenkai-surface/60 hover:bg-zenkai-surface border-zenkai-border hover:border-zenkai-muted'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-14 shrink-0 rounded-lg overflow-hidden bg-zenkai-card shadow-sm border border-zenkai-border/50">
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
                        <span className="px-1.5 py-0.2 rounded bg-zenkai-card border border-zenkai-border">
                          {anime.type || 'TV'}
                        </span>
                        {anime.score && (
                          <span className="text-amber-400 font-bold">★ {anime.score}</span>
                        )}
                        {anime.year && <span>{anime.year}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isCurrentActive
                        ? 'bg-amber-400 text-black shadow-sm'
                        : isPinned
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        : 'bg-zenkai-card hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border border-zenkai-border'
                    }`}
                  >
                    {isCurrentActive
                      ? `Slot #${activeSlot + 1} ✓`
                      : isPinned
                      ? `Pinned in #${currentSlotOfThisAnime + 1}`
                      : `Set to Slot #${activeSlot + 1}`}
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
              No anime found. Type any title above to find and pin it to your profile.
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
