import React from 'react';
import { X } from 'lucide-react';

export const TrailerModal = ({ isOpen, onClose, trailerUrl, title }) => {
  if (!isOpen || !trailerUrl) return null;

  // Extract YouTube ID
  let videoId = '';
  if (trailerUrl.includes('watch?v=')) {
    videoId = trailerUrl.split('watch?v=')[1]?.split('&')[0];
  } else if (trailerUrl.includes('youtu.be/')) {
    videoId = trailerUrl.split('youtu.be/')[1]?.split('?')[0];
  }

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : trailerUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-4xl bg-zenkai-card border border-zenkai-border rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 bg-zenkai-surface/90 border-b border-zenkai-border">
          <h3 className="text-sm font-bold text-white truncate">{title} — Official Trailer</h3>
          <button
            onClick={onClose}
            className="p-1 text-zenkai-dim hover:text-white rounded-lg hover:bg-zenkai-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            title={`${title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          ></iframe>
        </div>
      </div>
    </div>
  );
};
