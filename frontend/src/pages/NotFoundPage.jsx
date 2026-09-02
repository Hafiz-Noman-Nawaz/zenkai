import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="py-24 text-center max-w-md mx-auto space-y-5 animate-fade-in">
      <div className="w-16 h-16 rounded-3xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
        <Compass className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-widest">
          404 Error
        </span>
        <h1 className="font-display font-black text-3xl text-white">Page Not Found</h1>
        <p className="text-xs text-zenkai-muted leading-relaxed">
          The page you were looking for doesn't exist or has moved into another timeline.
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};
