import React, { useState, useEffect } from 'react';
import { X, Star, Loader2, Check } from 'lucide-react';
import { animeApi } from '../api/anime';
import { reviewsApi } from '../api/reviews';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { RatingSelector } from './RatingStars';

export const ReviewModal = ({
  isOpen,
  onClose,
  anime,
  initialReview = null,
  onSaved,
}) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(8.0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialReview) {
      setTitle(initialReview.title || '');
      setContent(initialReview.content || '');
      setRating(initialReview.rating || 8.0);
    } else {
      setTitle('');
      setContent('');
      setRating(8.0);
    }
  }, [initialReview, isOpen]);

  if (!isOpen || !anime) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to write a review');
      return;
    }

    if (title.trim().length < 3) {
      toast.error('Review title must be at least 3 characters');
      return;
    }

    if (content.trim().length < 10) {
      toast.error('Review content must be at least 10 characters');
      return;
    }

    setSaving(true);
    try {
      if (initialReview) {
        // Edit existing review
        const response = await reviewsApi.updateReview(initialReview.id, {
          title: title.trim(),
          content: content.trim(),
          rating: Number(rating),
        });
        if (response.success) {
          toast.success('Review updated successfully!');
          if (onSaved) onSaved(response.data.review);
          onClose();
        }
      } else {
        // Create new review
        const response = await animeApi.createReview(anime.id, {
          title: title.trim(),
          content: content.trim(),
          rating: Number(rating),
        });
        if (response.success) {
          toast.success('Review published successfully!');
          if (onSaved) onSaved(response.data.review);
          onClose();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-xl bg-zenkai-card border border-zenkai-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-zenkai-border bg-zenkai-surface/80">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">
              {initialReview ? 'Edit Review' : `Review "${anime.title}"`}
            </h3>
            <p className="text-[11px] text-zenkai-muted">
              Share your perspective and in-depth thoughts with the Zenkai community.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zenkai-dim hover:text-white rounded-lg hover:bg-zenkai-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
          {/* Rating Slider */}
          <div className="bg-zenkai-surface/70 border border-zenkai-border rounded-xl p-4">
            <RatingSelector value={rating} onChange={setRating} />
          </div>

          {/* Review Title */}
          <div>
            <label className="text-xs font-semibold text-zenkai-muted block mb-1.5">
              Review Headline / Thesis
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. A Masterpiece in Pacing and Emotional Resonance"
              className="w-full bg-zenkai-surface border border-zenkai-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Review Content */}
          <div>
            <label className="text-xs font-semibold text-zenkai-muted block mb-1.5">
              Detailed Critique & Reflections
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Analyze the animation, thematic depth, character dynamics, soundtrack, and memorable moments..."
              className="w-full bg-zenkai-surface border border-zenkai-border rounded-xl p-3.5 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zenkai-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zenkai-muted hover:text-white hover:bg-zenkai-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {initialReview ? 'Save Edits' : 'Publish Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
