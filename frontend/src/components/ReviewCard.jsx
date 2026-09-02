import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Edit3,
  Trash2,
  Calendar,
  User,
  Quote,
  ThumbsUp,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { RatingBadge } from './RatingStars';
import { useAuth } from '../context/AuthContext';
import { reviewsApi } from '../api/reviews';
import { useToast } from '../context/ToastContext';
import { ReviewModal } from './ReviewModal';
import { AnimeImage } from './AnimeImage';

export const ReviewCard = ({
  review,
  showAnime = true,
  onDeleted,
  onUpdated,
}) => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Helpful vote state
  const [helpfulCount, setHelpfulCount] = useState(review?.helpfulCount || 0);
  const [isHelpfulByMe, setIsHelpfulByMe] = useState(review?.isHelpfulByMe || false);
  const [voting, setVoting] = useState(false);

  // Spoiler shield state
  const containsSpoilerTag =
    review?.content?.toLowerCase().includes('spoiler') ||
    review?.title?.toLowerCase().includes('spoiler');
  const [isSpoilerRevealed, setIsSpoilerRevealed] = useState(!containsSpoilerTag);

  if (!review) return null;

  const isAuthor = user && (user.id === review.userId || user.username === review.user?.username);
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleVoteHelpful = async () => {
    if (!isAuthenticated) {
      toast.warning('Please log in to vote on reviews');
      return;
    }

    setVoting(true);
    // Optimistic update
    const nextVoted = !isHelpfulByMe;
    setIsHelpfulByMe(nextVoted);
    setHelpfulCount((prev) => (nextVoted ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await reviewsApi.voteHelpful(review.id);
      if (res.success) {
        setHelpfulCount(res.data.helpfulCount);
        setIsHelpfulByMe(res.data.isVoted);
      }
    } catch (err) {
      // Revert on error
      setIsHelpfulByMe(!nextVoted);
      setHelpfulCount((prev) => (!nextVoted ? prev + 1 : Math.max(0, prev - 1)));
      toast.error('Failed to register vote');
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await reviewsApi.deleteReview(review.id);
      if (response.success) {
        toast.info('Review deleted successfully');
        if (onDeleted) onDeleted(review.id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-zenkai-surface/60 hover:bg-zenkai-surface/90 border border-zenkai-border/70 transition-all duration-200 shadow-zenkai-subtle">
        {/* Anime Thumbnail if showAnime is true */}
        {showAnime && review.anime && (
          <Link
            to={`/anime/${review.anime.id}`}
            className="shrink-0 w-16 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-zenkai-card border border-zenkai-border/80 group self-start shadow-sm"
          >
            <AnimeImage
              src={review.anime.coverImage}
              alt={review.anime.title}
              aspectRatio="aspect-[2/3]"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </Link>
        )}

        {/* Review Core Content */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Row: Author + Rating + Actions */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <Link
                to={`/profile/${review.user?.username}`}
                className="flex items-center gap-2 group"
              >
                <img
                  src={
                    review.user?.avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${review.user?.username || 'user'}`
                  }
                  alt={review.user?.username}
                  className="w-6 h-6 rounded-full bg-indigo-950 object-cover"
                />
                <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {review.user?.displayName || review.user?.username || 'Zenkai Critic'}
                </span>
              </Link>

              <span className="text-zenkai-dim text-[11px]">•</span>

              <span className="text-[11px] text-zenkai-dim flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <RatingBadge score={review.rating} size="sm" />

              {isAuthor && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-zenkai-dim hover:text-indigo-400 rounded transition-colors"
                    title="Edit review"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1 text-zenkai-dim hover:text-rose-400 rounded transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Anime Title if showAnime */}
          {showAnime && review.anime && (
            <div>
              <Link
                to={`/anime/${review.anime.id}`}
                className="text-xs font-bold text-indigo-400 hover:underline inline-block"
              >
                Review on {review.anime.title}
              </Link>
            </div>
          )}

          {/* Review Title */}
          <h4 className="text-sm font-bold text-white leading-snug">
            "{review.title}"
          </h4>

          {/* Review Content with Spoiler Shield */}
          {!isSpoilerRevealed ? (
            <div className="relative p-4 rounded-xl bg-zenkai-card border border-amber-500/30 text-center space-y-2 my-2">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>This review may contain story spoilers</span>
              </div>
              <button
                onClick={() => setIsSpoilerRevealed(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border text-xs font-semibold text-white transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reveal Review Content</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <p
                className={`text-xs text-zenkai-text/85 leading-relaxed ${
                  isExpanded ? '' : 'line-clamp-3'
                }`}
              >
                {review.content}
              </p>

              {review.content.length > 220 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors pt-1 block"
                >
                  {isExpanded ? 'Show less' : 'Read full review'}
                </button>
              )}
            </div>
          )}

          {/* Footer Actions: Helpful Counter & Vote */}
          <div className="flex items-center justify-between pt-2 border-t border-zenkai-border/40">
            <button
              onClick={handleVoteHelpful}
              disabled={voting}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                isHelpfulByMe
                  ? 'bg-indigo-600/25 text-indigo-300 border-indigo-500/40 shadow-sm'
                  : 'bg-zenkai-card hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border-zenkai-border'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isHelpfulByMe ? 'fill-indigo-400' : ''}`} />
              <span>Helpful</span>
              {helpfulCount > 0 && (
                <span className="font-mono text-[11px] ml-0.5 opacity-90">({helpfulCount})</span>
              )}
            </button>

            {containsSpoilerTag && isSpoilerRevealed && (
              <button
                onClick={() => setIsSpoilerRevealed(false)}
                className="flex items-center gap-1 text-[11px] text-zenkai-dim hover:text-white transition-colors"
              >
                <EyeOff className="w-3 h-3" />
                <span>Hide Spoilers</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <ReviewModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          anime={review.anime}
          initialReview={review}
          onSaved={(updated) => {
            if (onUpdated) onUpdated(updated);
            setIsEditing(false);
          }}
        />
      )}
    </>
  );
};
