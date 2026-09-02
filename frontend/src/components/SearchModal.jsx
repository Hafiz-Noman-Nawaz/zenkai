import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Star, Calendar, ArrowRight, Loader2, Sparkles, Compass } from 'lucide-react';
import { animeApi } from '../api/anime';
import { AnimeImage } from './AnimeImage';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const quickGenres = [
    'Action',
    'Psychological',
    'Sci-Fi',
    'Fantasy',
    'Drama',
    'Romance',
    'Adventure',
    'Comedy',
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await animeApi.searchAnime(query.trim(), 8);
        if (response.success && response.data?.animes) {
          setResults(response.data.animes);
        } else if (response.data?.anime) {
          setResults(response.data.anime);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelectAnime = (animeId) => {
    onClose();
    navigate(`/anime/${animeId}`);
  };

  const handleKeyDownInList = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectAnime(results[selectedIndex].id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div
        className="w-full max-w-2xl bg-zenkai-card/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] glass-luxury"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/10 bg-zenkai-surface/90">
          <Search className="w-5 h-5 text-indigo-400 shrink-0 mr-3.5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInList}
            placeholder="Search 500+ anime titles, characters, or studios..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zenkai-dim focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0 mx-2" />}
          {query && !loading && (
            <button
              onClick={() => setQuery('')}
              className="text-zenkai-dim hover:text-white p-1 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-zenkai-bg border border-zenkai-border hover:border-zenkai-muted px-2.5 py-1 rounded-lg text-zenkai-dim hover:text-white transition-colors ml-2"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-3 divide-y divide-zenkai-border/40">
          {results.length > 0 ? (
            <>
              {results.map((anime, idx) => (
                <div
                  key={anime.id}
                  onClick={() => handleSelectAnime(anime.id)}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-spring ${
                    selectedIndex === idx
                      ? 'bg-indigo-600/25 border border-indigo-500/40 text-white shadow-lg'
                      : 'hover:bg-zenkai-surface text-zenkai-text'
                  }`}
                >
                  <div className="w-12 aspect-[2/3] rounded-xl overflow-hidden shrink-0 shadow-md">
                    <AnimeImage
                      src={anime.coverImage}
                      alt={anime.title}
                      aspectRatio="aspect-[2/3]"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm truncate">{anime.title}</span>
                      {anime.type && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zenkai-surface border border-zenkai-border text-zenkai-dim shrink-0">
                          {anime.type}
                        </span>
                      )}
                    </div>
                    {anime.englishTitle && anime.englishTitle !== anime.title && (
                      <p className="text-[11px] text-zenkai-muted truncate">{anime.englishTitle}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-zenkai-dim">
                      {anime.score && (
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {anime.score.toFixed(2)}
                        </span>
                      )}
                      {anime.seasonYear && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {anime.season} {anime.seasonYear}
                        </span>
                      )}
                      {anime.episodes && (
                        <span>{anime.episodes} Ep{anime.episodes > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zenkai-dim group-hover:text-indigo-400 shrink-0 opacity-60" />
                </div>
              ))}
              {query.trim() && (
                <div className="pt-3 pb-1 px-2 text-center">
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-bold text-indigo-300 hover:text-white flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <span>View all matching titles on Explore Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          ) : query.trim() && !loading ? (
            <div className="py-14 text-center text-zenkai-dim text-xs">
              No anime found matching <span className="text-white font-medium">"{query}"</span>
            </div>
          ) : (
            <div className="py-8 px-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Quick Genre Exploration</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickGenres.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      onClose();
                      navigate(`/explore?genre=${g.toLowerCase()}`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-zenkai-surface/80 hover:bg-zenkai-elevated border border-zenkai-border hover:border-indigo-500/40 text-xs font-semibold text-zenkai-text hover:text-white transition-all btn-press"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
