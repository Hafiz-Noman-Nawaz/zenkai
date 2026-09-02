import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Compass,
  title = 'No anime found',
  description = 'Try adjusting your search criteria or filters to discover other titles.',
  actionLabel = 'Explore Catalog',
  actionLink = '/explore',
  onAction,
}) => {
  return (
    <div className="py-16 px-6 text-center max-w-md mx-auto space-y-4 rounded-2xl bg-zenkai-surface/40 border border-zenkai-border/60">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="font-display font-bold text-base text-white">{title}</h3>
        <p className="text-xs text-zenkai-muted leading-relaxed">{description}</p>
      </div>

      {(actionLink || onAction) && (
        <div className="pt-2">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
