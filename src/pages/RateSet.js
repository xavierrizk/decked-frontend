import API_URL from '../api';
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function RateSet() {
  const { setId } = useParams();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        `${API_URL}/api/ratings/set/${setId}`,
        { score: rating, review: reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Rating submitted!');
      setTimeout(() => navigate(`/set/${setId}`), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating');
      setLoading(false);
    }
  };

  const labels = { 1: 'Meh', 2: 'OK', 3: 'Good', 4: 'Great', 5: 'Decked! 🔥' };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
        <Link to={`/set/${setId}`} className="text-brand-400 hover:text-brand-300 text-sm font-medium block mb-4">
          ← Back to set
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Rate This Set</h1>
        <p className="text-gray-400 text-sm mb-6">Share your thoughts on this DJ set</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3 mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star rating */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n} type="button" onClick={() => setRating(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    rating >= n
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-brand-400 text-sm font-medium mt-2 text-center">{labels[rating]}</p>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Review <span className="text-gray-500">(optional)</span></label>
            <textarea
              value={reviewText} onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors resize-none h-28"
              placeholder="What did you think of this set?"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-brand-900/50"
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RateSet;
