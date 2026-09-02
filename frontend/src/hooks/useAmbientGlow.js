import { useState, useEffect } from 'react';

// Generates smooth ambient glowing gradient styles derived from anime cover or genre
export const useAmbientGlow = (anime) => {
  const [ambientStyle, setAmbientStyle] = useState({});

  useEffect(() => {
    if (!anime) {
      setAmbientStyle({
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent 70%)',
      });
      return;
    }

    // Genre-based dynamic lighting fallback
    const genreColors = {
      action: 'rgba(239, 68, 68, 0.22)',
      adventure: 'rgba(245, 158, 11, 0.22)',
      comedy: 'rgba(234, 179, 8, 0.2)',
      drama: 'rgba(168, 85, 247, 0.22)',
      fantasy: 'rgba(99, 102, 241, 0.25)',
      horror: 'rgba(225, 29, 72, 0.25)',
      mystery: 'rgba(14, 165, 233, 0.22)',
      psychological: 'rgba(139, 92, 246, 0.25)',
      romance: 'rgba(236, 72, 153, 0.22)',
      'sci-fi': 'rgba(6, 182, 212, 0.25)',
      cyberpunk: 'rgba(168, 85, 247, 0.25)',
      supernatural: 'rgba(129, 140, 248, 0.25)',
    };

    let primaryColor = 'rgba(99, 102, 241, 0.22)';
    let secondaryColor = 'rgba(168, 85, 247, 0.15)';

    if (anime.genres && anime.genres.length > 0) {
      const g1 = (typeof anime.genres[0] === 'string' ? anime.genres[0] : anime.genres[0]?.name || '').toLowerCase();
      const g2 = anime.genres[1] ? (typeof anime.genres[1] === 'string' ? anime.genres[1] : anime.genres[1]?.name || '').toLowerCase() : null;

      if (genreColors[g1]) primaryColor = genreColors[g1];
      if (g2 && genreColors[g2]) secondaryColor = genreColors[g2];
    }

    setAmbientStyle({
      background: `radial-gradient(circle 600px at 50% 100px, ${primaryColor}, ${secondaryColor} 45%, transparent 75%)`,
    });
  }, [anime]);

  return ambientStyle;
};
