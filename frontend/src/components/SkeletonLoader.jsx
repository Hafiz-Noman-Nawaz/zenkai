import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="rounded-2xl bg-zenkai-surface/50 border border-zenkai-border/50 p-2.5 space-y-3 animate-pulse">
      <div className="aspect-[3/4.2] w-full rounded-xl bg-zenkai-elevated" />
      <div className="space-y-2 px-1">
        <div className="h-3.5 bg-zenkai-elevated rounded w-3/4" />
        <div className="h-2.5 bg-zenkai-elevated rounded w-1/2" />
      </div>
    </div>
  );
};

export const RailSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-6 w-48 bg-zenkai-surface rounded-lg animate-pulse" />
        <div className="h-4 w-16 bg-zenkai-surface rounded animate-pulse" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="w-44 sm:w-52 shrink-0">
            <CardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};

export const GridSkeleton = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};
