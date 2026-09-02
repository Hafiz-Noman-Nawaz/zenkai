import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Sparkles, Filter, Loader2, ArrowRight } from 'lucide-react';
import { reviewsApi } from '../api/reviews';
import { ReviewCard } from '../components/ReviewCard';
import { EmptyState } from '../components/EmptyState';

export const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reviewsApi.getRecentReviews({ page, limit: 12 });
      if (response.success && response.data?.reviews) {
        setReviews(response.data.reviews);
        if (response.meta) {
          setMeta(response.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-zenkai-border/70 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <MessageSquare className="w-4 h-4" />
          <span>Zenkai Criticism & Essays</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
          Community Anime Reviews
        </h1>
        <p className="text-xs text-zenkai-muted">
          Read candid perspectives, thematic analyses, and scores published by anime enthusiasts.
        </p>
      </div>

      {/* Reviews Stream */}
      {loading ? (
        <div className="py-20 text-center text-xs text-zenkai-dim flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading community reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews published yet"
          description="Explore our anime catalog and publish the very first review!"
          actionLabel="Browse Catalog"
          actionLink="/explore"
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              showAnime={true}
              onDeleted={(id) => setReviews((prev) => prev.filter((r) => r.id !== id))}
              onUpdated={(updated) =>
                setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
