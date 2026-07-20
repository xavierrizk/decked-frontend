import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';

export default function AddToBucketListButton({ artistId, isLoggedIn, onToast }) {
  const [onList, setOnList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const authHeaders = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') });

  useEffect(() => {
    if (!isLoggedIn || !artistId) { setChecked(true); return; }
    axios.get(`${API_URL}/api/bucket-list/check/${artistId}`, { headers: authHeaders() })
      .then(r => setOnList(!!r.data.on_bucket_list))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [artistId, isLoggedIn]);

  const handleClick = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      if (onList) {
        await axios.delete(`${API_URL}/api/bucket-list/remove/${artistId}`, { headers: authHeaders() });
        setOnList(false);
        onToast && onToast('Removed from bucket list');
      } else {
        await axios.post(`${API_URL}/api/bucket-list/add/${artistId}`, {}, { headers: authHeaders() });
        setOnList(true);
        onToast && onToast('Added to bucket list');
      }
    } catch (err) {
      if (err.response?.status === 409) setOnList(true);
      else onToast && onToast('Something went wrong');
    }
    setLoading(false);
  };

  if (!checked) return null;

  return (
    <button
      onClick={handleClick}
      disabled={!isLoggedIn || loading}
      className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all duration-150 disabled:opacity-50 ${
        onList
          ? 'bg-white/[0.06] border-white/15 text-white hover:bg-[#FF006E]/10 hover:border-[#FF006E]/30 hover:text-[#FF006E]'
          : 'border-[#00D9FF] text-black'
      }`}
      style={onList ? {} : { background: '#00D9FF' }}
      title={!isLoggedIn ? 'Log in to add to bucket list' : ''}
    >
      {loading ? '…' : onList ? '✓ On Your Bucket List' : '+ Add to Bucket List'}
    </button>
  );
}
