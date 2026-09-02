import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { RatingBadge } from './RatingStars';
import { TrackModal } from './TrackModal';
import { AnimeImage } from './AnimeImage';

export const AnimeCard = ({
  anime,
  variant = 'standard',
  userEntry = null,
  onTrackUpdated,
}) => {
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  if (!anime) return null;

  const currentStatus = userEntry?.status;
  const statusColors = {
    WATCHING: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    COMPLETED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    PLAN_TO_WATCH: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    ON_HOLD: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    DROPPED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  const formattedStatus = currentStatus ? currentStatus.replace(/_/g, ' ') : null;

  // COMPACT VARIANT (Horizontal Row / List)
  if (variant === 'compact') {
    return (
      <>
        <div className="group relative flex items-center gap-4 p-3 bg-zenkai-surface/70 hover:bg-zenkai-elevated/90 border border-zenkai-border/70 hover:border-indigo-500/40 rounded-2xl transition-spring shadow-zenkai-subtle hover:shadow-zenkai-hover">
          <Link to={`/anime/${anime.id}`} className="shrink-0 w-14 aspect-[2/3] rounded-xl overflow-hidden bg-zenkai-card group-hover:scale-105 transition-transform duration-300">
            <AnimeImage
              src={anime.coverImage}
              alt={anime.title}
              aspectRatio="aspect-[2/3]"
              className="w-full h-full object-cover"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/anime/${anime.id}`}
                className="font-bold text-xs sm:text-sm text-white hover:text-indigo-300 transition-colors truncate"
              >
                {anime.title}
              </Link>
            </div>

            <div className="flex items-center gap-2 mt-1 text-[11px] text-zenkai-muted">
              {anime.type && (
                <span className="font-mono uppercase text-zenkai-dim">{anime.type}</span>
              )}
              {anime.episodes && (
                <span>• {anime.episodes} Ep{anime.episodes > 1 ? 's' : ''}</span>
              )}
              {anime.seasonYear && (
                <span>• {anime.seasonYear}</span>
              )}
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 mt-2 flex-wrap">
                {anime.genres.slice(0, 3).map((g) => (
                  <span
                    key={g.id || g.slug || g.name}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zenkai-card border border-zenkai-border/80 text-zenkai-dim"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {anime.score && (
              <div className="hidden sm:block">
                <RatingBadge score={anime.score} size="md" />
              </div>
            )}

            {formattedStatus && (
              <span
                className={`hidden md:inline-block text-[11px] font-semibold uppercase font-mono px-2.5 py-1 rounded-lg border ${statusColors[currentStatus]}`}
              >
                {formattedStatus}
              </span>
            )}

            <button
              onClick={() => setIsTrackModalOpen(true)}
              className={`p-2 rounded-xl border btn-press transition-spring ${
                currentStatus
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
                  : 'bg-zenkai-card hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border-zenkai-border'
              }`}
              title={currentStatus ? `Tracking: ${formattedStatus}` : 'Add to My Anime'}
            >
              {currentStatus ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <TrackModal
          isOpen={isTrackModalOpen}
          onClose={() => setIsTrackModalOpen(false)}
          anime={anime}
          initialEntry={userEntry}
          onUpdated={onTrackUpdated}
        />
      </>
    );
  }

  // STANDARD POSTER CARD VARIANT
  return (
    <>
      <div className="group relative flex flex-col rounded-2xl bg-zenkai-surface/60 hover:bg-zenkai-elevated/90 border border-zenkai-border/70 hover:border-indigo-500/40 p-2.5 hover-card-lift transition-spring shadow-zenkai-subtle">
        {/* Poster Box with 2:3 Aspect Ratio */}
        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-zenkai-card mb-2 shadow-sm">
          <Link to={`/anime/${anime.id}`} className="block w-full h-full overflow-hidden">
            <AnimeImage
              src={anime.coverImage}
              alt={anime.title}
              aspectRatio="aspect-[2/3]"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            />
            {/* Subtle Gradient Shadow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zenkai-bg/95 via-transparent to-transparent opacity-75 group-hover:opacity-40 transition-opacity duration-300" />
          </Link>

          {/* Top Score Badge */}
          {anime.score && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <RatingBadge score={anime.score} size="sm" />
            </div>
          )}

          {/* Quick Track Action Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsTrackModalOpen(true);
            }}
            className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-md border btn-press transition-spring shadow-md ${
              currentStatus
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-black/60 text-white/80 hover:text-white border-white/10 hover:bg-indigo-600 hover:border-indigo-500'
            }`}
            title={currentStatus ? `Tracking: ${formattedStatus}` : 'Track Anime'}
          >
            {currentStatus ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>

          {/* Bottom Badge Info inside Poster */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none text-[10px] font-mono text-white/90">
            {anime.type && (
              <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 uppercase">
                {anime.type}
              </span>
            )}
            {anime.status && (
              <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                {anime.status === 'RELEASING' ? 'AIRING' : anime.status}
              </span>
            )}
          </div>
        </div>

        {/* Content Info */}
        <div className="flex-1 flex flex-col justify-between px-1">
          <div>
            <Link
              to={`/anime/${anime.id}`}
              className="font-bold text-xs text-white hover:text-indigo-300 transition-colors line-clamp-1 block"
              title={anime.title}
            >
              {anime.title}
            </Link>

            <p className="text-[11px] text-zenkai-muted mt-0.5 line-clamp-1">
              {anime.genres?.map((g) => g.name).join(' • ') || 'Anime'}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zenkai-border/40 text-[11px] text-zenkai-dim">
            <span>{anime.seasonYear ? `${anime.season || ''} ${anime.seasonYear}` : 'Year TBA'}</span>
            <span>{anime.episodes ? `${anime.episodes} eps` : 'Ongoing'}</span>
          </div>
        </div>
      </div>

      <TrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        anime={anime}
        initialEntry={userEntry}
        onUpdated={onTrackUpdated}
      />
    </>
  );
};
