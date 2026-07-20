import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import BucketListCard from '../components/BucketListCard';

export default function PublicBucketListPage() {
  const { userId } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/users/${userId}/bucket-list`)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D9FF', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!data) return <div className="text-center py-20 text-gray-600">User not found</div>;

  const list = data.bucket_list || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to={`/profile/${userId}`} className="text-gray-500 hover:text-[#00D9FF] text-xs transition-colors">← Back to {data.username}'s profile</Link>
        <h1 className="text-white text-xl font-bold mt-2">{data.username}'s Bucket List</h1>
        <p className="text-gray-500 text-sm mt-0.5">{list.length} DJ{list.length !== 1 ? 's' : ''}</p>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] rounded-xl text-gray-600">
          <p className="text-3xl mb-3">🎧</p>
          <p>Nothing on the bucket list yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {list.map(dj => (
            <BucketListCard key={dj.artist_id} dj={dj} />
          ))}
        </div>
      )}
    </div>
  );
}
