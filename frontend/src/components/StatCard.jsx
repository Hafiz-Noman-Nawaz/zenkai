import React from 'react';

export const StatCard = ({ icon: Icon, label, value, subtext, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-zenkai-surface/70 border border-zenkai-border/80 shadow-zenkai-subtle flex items-start gap-4">
      {Icon && (
        <div className={`p-2.5 rounded-xl border shrink-0 ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-zenkai-muted uppercase tracking-wider">{label}</p>
        <p className="font-display font-black text-xl sm:text-2xl text-white mt-0.5 tracking-tight truncate">
          {value}
        </p>
        {subtext && <p className="text-[11px] text-zenkai-dim mt-0.5 truncate">{subtext}</p>}
      </div>
    </div>
  );
};
