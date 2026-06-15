import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { StarRatingInput } from '../components/StarRating';
import { getCurrentUserId } from '../utils/auth';
import { useToast } from '../components/Toast';
import Toast from '../components/Toast';

const LABELS = {
  0.5: '½ star', 1: 'Meh', 1.5: 'Poor', 2: 'OK', 2.5: 'Decent',
  3: 'Good', 3.5: 'Very Good', 4: 'Great', 4.5: 'Excellent', 5: '🔥 Decked!'
};

export default function EnhancedRateSet() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const [toast, showToast] = useToast();

  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState(null);

  // Form state
  const [rating, setRating] = useState(3);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  const authHeaders = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [setRes, reviewsRes] = await Promise.all([
          axios.get(`${API_URL}/api/sets/${setId}`),
          axios.get(`${API_URL}/api/reviews/set/${setId}`, {
            headers: authHeaders(),
            params: { limit: 100 }
          }),
        ]);
        setSet(setRes.data);

        // Check if user already has a review
        if (currentUserId) {
          const existing = reviewsRes.data.reviews?.find(r => r.user?.id === currentUserId);
          if (existing) {
            setIsEditMode(true);
            setExistingReviewId(existing.id);
            setRating(existing.rating);
            setReviewTitle(existing.review_title || '');
            setReviewText(existing.review_text || '');
            setIsFavorited(existing.is_favorited || false);
          }
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [setId, currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!reviewTitle.trim()) {
      setError('Please enter a review title.');
      return;
    }
    setSubmitting(true);
    try {
      if (isEditMode && existingReviewId) {
        await axios.patch(
          `${API_URL}/api/reviews/${existingReviewId}`,
          { rating, review_title: reviewTitle, review_text: reviewText },
          { headers: authHeaders() }
        );
        showToast('Review updated!');
      } else {
        await axios.post(
          `${API_URL}/api/reviews/set/${setId}`,
          { rating, review_title: reviewTitle, review_text: reviewText, is_favorited: isFavorited },
          { headers: authHeaders() }
        );
        showToast('Review posted!');
      }
      setTimeout(() => navigate(`/set/${setId}`), 1200);
    } catch (err) {
      if (err.response?.status === 409) {
        const reviewId = err.response.data.reviewId;
        setExistingReviewId(reviewId);
        setIsEditMode(true);
        setError('You already reviewed this set — switching to edit mode.');
      } else {
        setError(err.response?.data?.error || 'Failed to submit review');
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <Toast message={toast} />
      <div className="w-full max-w-lg">
        <Link to={`/set/${setId}`} className="text-gray-500 hover:text-[#00D9FF] text-sm transition-colors block mb-6">
          ← Back to set
        </Link>

        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-7 shadow-2xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white mb-1">
              {isEditMode ? 'Edit Your Review' : 'Write a Review'}
            </h1>
            {set && (
              <p className="text-gray-400 text-sm">
                <span className="text-white font-semibold">{set.title}</span>
                {set.dj_name && <span className="text-gray-500"> by {set.dj_name}</span>}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Your Rating <span className="text-red-400">*</span>
              </label>
              <StarRatingInput value={rating} onChange={setRating} size={38} />
              <p className="text-[#00D9FF] text-sm font-semibold mt-2 h-5">{LABELS[rating] || ''}</p>
            </div>

            {/* Review Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Review Title <span className="text-red-400">*</span>
                </label>
                <span className="text-gray-500 text-xs">{reviewTitle.length}/100</span>
              </div>
              <input
                type="text"
                value={reviewTitle}
                onChange={e => setReviewTitle(e.target.value)}
                maxLength={100}
                placeholder="Summarize your experience…"
                className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200"
              />
            </div>

            {/* Review Text */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Your Review{' '}
                  <span className="text-gray-600 normal-case tracking-normal font-normal">(optional)</span>
                </label>
                <span className="text-gray-500 text-xs">{reviewText.length}/5000</span>
              </div>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                maxLength={5000}
                rows={6}
                placeholder="Share your thoughts on this set…"
                className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200 resize-none"
              />
            </div>

            {/* Coming soon: video */}
            <div className="relative group">
              <button
                disabled
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-gray-600 cursor-not-allowed opacity-50"
              >
                <span className="text-lg">🎬</span>
                <span className="text-sm font-medium">Add Videos</span>
                <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">COMING SOON</span>
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1a1f] border border-white/10 rounded-xl text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                🎬 Video reviews launching soon! Upload clips of your favourite moments.
              </div>
            </div>

            {/* Favorite toggle */}
            {!isEditMode && (
              <button
                type="button"
                onClick={() => setIsFavorited(!isFavorited)}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  isFavorited ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                }`}
              >
                <span>{isFavorited ? '⭐' : '☆'}</span>
                {isFavorited ? 'Added to favorites' : 'Add to my favorites'}
              </button>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary disabled:opacity-40  font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {submitting ? (isEditMode ? 'Updating…' : 'Posting…') : (isEditMode ? 'Update Review' : 'Post Review')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
