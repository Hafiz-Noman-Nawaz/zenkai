import React, { useState } from 'react';
import { Film } from 'lucide-react';

// Global memory cache of successfully loaded image URLs to prevent re-flashing skeletons on scroll/re-render
const loadedImagesCache = new Set();

export const AnimeImage = ({
  src,
  alt = 'Anime Poster',
  className = '',
  aspectRatio = 'aspect-[2/3]',
  priority = false,
}) => {
  const isAlreadyLoaded = src ? loadedImagesCache.has(src) : false;
  const [isLoaded, setIsLoaded] = useState(isAlreadyLoaded);
  const [hasError, setHasError] = useState(false);

  // If there's no valid src or if error occurred
  if (hasError || !src) {
    return (
      <div
        className={`relative w-full h-full ${aspectRatio} rounded-xl bg-gradient-to-br from-zenkai-card via-zenkai-surface to-zenkai-elevated border border-zenkai-border flex flex-col items-center justify-center p-3 text-center overflow-hidden ${className}`}
      >
        <div className="w-8 h-8 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center mb-1 text-indigo-400">
          <Film className="w-4 h-4" />
        </div>
        <span className="font-display font-black text-xs text-white uppercase tracking-wider line-clamp-2">
          {alt}
        </span>
        <span className="text-[10px] text-zenkai-dim font-mono mt-0.5">ZENKAI ARCHIVE</span>
      </div>
    );
  }

  const handleLoad = () => {
    loadedImagesCache.add(src);
    setIsLoaded(true);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${aspectRatio} ${className}`}>
      {/* Skeleton placeholder while loading (skipped if already in memory cache) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zenkai-elevated animate-pulse rounded-xl" />
      )}

      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoad={handleLoad}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
