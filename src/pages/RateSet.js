import API_URL from '../api';
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { StarRatingInput } from '../components/StarRating';

const LABELS = {
  0.5:'½ star', 1:'Meh', 1.5:'Poor', 2:'OK', 2.5:'Decent',
  3:'Good', 3.5:'Very Good', 4:'Great', 4.5:'Excellent', 5:'🔥 Decked!'
};

export default function RateSet() {
  const { setId }                   = useParams();
  const [score, setScore]           = useState(3);
  const [review, setReview]         = useState('');
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [loading, setLoading]       = useState(false);
  const navigate                    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post(
        `${API_URL}/api/ratings/set/${setId}`,
        { score, review },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('Rating submitted!');
      setTimeout(() => navigate(`/set/${setId}`), 1400);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to={`/set/${setId}`} className="text-gray-500 hover:text-brand-400 text-sm transition-colors block mb-6">
          ← Back to set
        </Link>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 shadow-2xl backdrop-blur-sm">
          <h1 className="text-2xl font-extrabold text-white mb-1">Rate This Set</h1>
          <p className="text-gray-500 text-sm mb-6">
            Click a star to rate · Click the same star again for a half star
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
              <span>✓</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Your Rating
              </label>
              <StarRatingInput value={score} onChange={setScore} size={40} />
              <p className="text-brand-400 text-sm font-semibold mt-2 h-5">{LABELS[score] || ''}</p>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Review{' '}
                <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <textarea
                value={review} onChange={(e) => setReview(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200 resize-none h-28"
                placeholder="What did you think of this set?"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary disabled:opacity-40  font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-glow">
              {loading ? 'Submitting…' : 'Submit Rating'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
