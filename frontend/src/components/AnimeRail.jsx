import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { AnimeCard } from './AnimeCard';

export const AnimeRail = ({
  title,
  subtitle,
  animes = [],
  viewAllLink,
  userEntriesMap = {},
  onTrackUpdated,
}) => {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!animes || animes.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zenkai-muted mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors mr-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-full bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border flex items-center justify-center text-zenkai-muted hover:text-white transition-all shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-full bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border flex items-center justify-center text-zenkai-muted hover:text-white transition-all shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 hide-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {animes.map((anime) => (
          <div
            key={anime.id}
            className="w-44 sm:w-52 shrink-0 snap-start"
          >
            <AnimeCard
              anime={anime}
              variant="standard"
              userEntry={userEntriesMap[anime.id]}
              onTrackUpdated={onTrackUpdated}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
