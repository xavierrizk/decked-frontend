import API_URL from '../api';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function RateSet() {
  const { setId } = useParams();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Rate This Set</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Rating (1-5): </label>
          <select
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            style={{ padding: '8px' }}
          >
            <option value={1}>1 - Meh</option>
            <option value={2}>2 - OK</option>
            <option value={3}>3 - Good</option>
            <option value={4}>4 - Great</option>
            <option value={5}>5 - Decked!</option>
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Review (optional): </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            style={{ width: '100%', padding: '8px', height: '100px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Submit Rating
        </button>
      </form>
    </div>
  );
}

export default RateSet;