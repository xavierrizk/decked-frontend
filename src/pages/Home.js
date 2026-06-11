import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [djs, setDJs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    axios
      .get(API_URL + '/api/djs')
      .then((res) => {
        setDJs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading DJs...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🎵 DJs on Decked</h1>
        {isLoggedIn && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/create-dj">
              <button style={{ padding: '8px 16px', cursor: 'pointer' }}>+ Create DJ</button>
            </Link>
            <Link to="/create-set">
              <button style={{ padding: '8px 16px', cursor: 'pointer' }}>+ Create Set</button>
            </Link>
          </div>
        )}
      </div>
      <div>
        {djs.length === 0 ? (
          <p>No DJs yet. Create one!</p>
        ) : (
          djs.map((dj) => (
            <div key={dj.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <h3>{dj.name}</h3>
              <p>{dj.bio}</p>
              <Link to={`/dj/${dj.id}`}>View Profile</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
