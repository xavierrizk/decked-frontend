import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function DJProfile() {
  const { id } = useParams();
  const [dj, setDJ] = useState(null);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/djs/${id}`),
      axios.get(`${API_URL}/api/sets/dj/${id}`)
    ])
      .then(([djRes, setsRes]) => {
        setDJ(djRes.data);
        setSets(setsRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!dj) return <div>DJ not found</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>{dj.name}</h1>
      <p>{dj.bio}</p>
      <h2>Sets by {dj.name}</h2>
      {sets.length === 0 ? (
        <p>No sets yet</p>
      ) : (
        sets.map((set) => (
          <div key={set.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>{set.title}</h3>
            <p>📍 {set.location} | ⏱️ {set.duration_minutes} mins</p>
            <Link to={`/set/${set.id}`}>View Set</Link>
          </div>
        ))
      )}
    </div>
  );
}

export default DJProfile;