import React from 'react';
import { Star } from 'lucide-react';

export const RatingBadge = ({ score, size = 'md' }) => {
  if (!score) return null;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-1.5 font-bold',
  };

  const getScoreColor = (val) => {
    if (val >= 9.0) return 'text-amber-300 bg-amber-950/40 border-amber-500/30';
    if (val >= 8.0) return 'text-indigo-300 bg-indigo-950/40 border-indigo-500/30';
    if (val >= 7.0) return 'text-sky-300 bg-sky-950/40 border-sky-500/30';
    return 'text-zinc-300 bg-zinc-900/60 border-zinc-700/40';
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-mono font-semibold backdrop-blur-md shadow-sm ${getScoreColor(
        score
      )} ${sizeClasses[size]}`}
    >
      <Star className="w-3 h-3 fill-current shrink-0" />
      {Number(score).toFixed(score % 1 === 0 ? 1 : 1)}
    </span>
  );
};

export const RatingSelector = ({ value, onChange, max = 10, min = 1, step = 0.5 }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zenkai-muted">Personal Rating</span>
        <span className="text-sm font-mono font-bold text-amber-400">
          {value ? `${Number(value).toFixed(1)} / 10.0` : 'Not Rated'}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || 0}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zenkai-elevated rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
      <div className="flex justify-between text-[10px] text-zenkai-dim font-mono">
        <span>1.0</span>
        <span>5.0</span>
        <span>7.5</span>
        <span>10.0</span>
      </div>
    </div>
  );
};
