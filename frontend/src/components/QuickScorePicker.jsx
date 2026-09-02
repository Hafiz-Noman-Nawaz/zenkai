import React, { useState, useRef, useEffect } from 'react';
import { Star, Check, X, Sparkles } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

const SCORE_LABELS = {
  10: '10 - Masterpiece',
  9: '9 - Great',
  8: '8 - Very Good',
  7: '7 - Good',
  6: '6 - Fine',
  5: '5 - Average',
  4: '4 - Bad',
  3: '3 - Very Bad',
  2: '2 - Horrible',
  1: '1 - Appalling',
};

export const QuickScorePicker = ({ currentScore, onScoreChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (score) => {
    soundFX.playClick();
    onScoreChange(score);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-spring border cursor-pointer ${
          currentScore
            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-400 shadow-sm shadow-amber-500/10'
            : 'bg-zenkai-card hover:bg-zenkai-elevated text-zenkai-dim hover:text-white border-zenkai-border'
        }`}
        title="Click to quickly change rating"
      >
        <Star
          className={`w-3.5 h-3.5 ${
            currentScore ? 'fill-amber-400 text-amber-400' : 'text-zenkai-dim'
          }`}
        />
        <span>{currentScore ? `${currentScore}.0` : 'Rate'}</span>
      </button>

      {/* Floating Fast Score Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-zenkai-card/95 border border-zenkai-border/90 backdrop-blur-xl rounded-2xl shadow-2xl py-1.5 z-50 animate-scale-in max-h-64 overflow-y-auto hide-scrollbar">
          <div className="px-3 py-1 text-[10px] font-mono text-zenkai-dim border-b border-white/10 uppercase tracking-wider flex items-center justify-between">
            <span>Score (1-10)</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>

          {/* None / Clear */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="w-full text-left px-3 py-1.5 text-xs text-zenkai-dim hover:text-rose-400 hover:bg-rose-950/20 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>— No Score</span>
            {!currentScore && <Check className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* 10 to 1 */}
          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((val) => {
            const isSelected = Math.round(currentScore) === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleSelect(val)}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/25 text-amber-300 font-bold'
                    : 'text-zenkai-text hover:bg-zenkai-surface hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Star
                    className={`w-3 h-3 ${
                      val >= 8
                        ? 'fill-amber-400 text-amber-400'
                        : val >= 5
                        ? 'fill-indigo-400 text-indigo-400'
                        : 'text-zenkai-dim'
                    }`}
                  />
                  <span>{SCORE_LABELS[val]}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
