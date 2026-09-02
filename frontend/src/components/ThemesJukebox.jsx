import React, { useState } from 'react';
import { Music, Play, Disc3, Sparkles, ExternalLink } from 'lucide-react';
import { TrailerModal } from './TrailerModal';

export const ThemesJukebox = ({ anime }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Generate iconic sample openings & endings if none in DB
  const defaultThemes = [
    { type: 'Opening 1', title: anime.title ? `${anime.title} Main Opening Theme` : 'The Hero Theme', artist: 'Iconic Artist', videoUrl: anime.trailerUrl },
    { type: 'Ending 1', title: anime.title ? `${anime.title} Climax Ending` : 'Sunset Melancholy', artist: 'Orchestral Seiyuu', videoUrl: anime.trailerUrl },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
          <Disc3 className="w-4 h-4 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Theme Songs & Jukebox (OP / ED)</span>
        </div>
        <span className="text-[11px] font-mono text-zenkai-dim">Original Soundtrack Audio</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {defaultThemes.map((theme, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-zenkai-surface/60 border border-white/5 hover:border-indigo-500/40 transition-spring flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/30 to-rose-600/30 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-300 group-hover:scale-105 transition-transform">
                <Music className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{theme.type}</span>
                <p className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {theme.title}
                </p>
                <p className="text-[11px] text-zenkai-muted font-mono">{theme.artist}</p>
              </div>
            </div>

            {theme.videoUrl && (
              <button
                onClick={() => setSelectedVideo({ url: theme.videoUrl, title: theme.title })}
                className="p-2 rounded-xl bg-black/40 hover:bg-black/70 border border-white/10 text-rose-400 hover:text-white transition-spring shrink-0 btn-press ml-2"
                title="Play Theme"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedVideo && (
        <TrailerModal
          isOpen={Boolean(selectedVideo)}
          onClose={() => setSelectedVideo(null)}
          trailerUrl={selectedVideo.url}
          title={selectedVideo.title}
        />
      )}
    </div>
  );
};
