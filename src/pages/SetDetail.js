import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function SetDetail() {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/sets/${id}`),
      axios.get(`${API_URL}/api/ratings/set/${id}`)
    ])
      .then(([setRes, ratingsRes]) => {
        setSet(setRes.data);
        setRatings(ratingsRes.data.ratings || []);
        setAverageRating(ratingsRes.data.averageRating || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!set) return <div>Set not found</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>{set.title}</h1>
      <p>📍 {set.location}</p>
      <p>⏱️ {set.duration_minutes} minutes</p>
      {set.video_url && (
        <iframe
          width="400"
          height="300"
          src={`https://www.youtube.com/embed/${set.video_url}`}
          title={set.title}
        ></iframe>
      )}
      <h2>⭐ Average Rating: {averageRating.toFixed(1)} / 5</h2>
      <Link to={`/rate/${set.id}`}>Rate This Set</Link>

      <h3>Reviews</h3>
      {ratings.length === 0 ? (
        <p>No ratings yet. Be the first!</p>
      ) : (
        ratings.map((rating, idx) => (
          <div key={idx} style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0' }}>
            <p>⭐ {rating.rating}/5</p>
            <p>{rating.review_text}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default SetDetail;