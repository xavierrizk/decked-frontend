import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { StarDisplay } from '../components/StarRating';
import { getCurrentUserId } from '../utils/auth';

export default function ProfilePage() {
  const { userId }              = useParams();
  const [profile, setProfile]   = useState(null);
  const [ratings, setRatings]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const currentUserId           = getCurrentUserId();
  const isOwn                   = parseInt(userId) === currentUserId;

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/users/${userId}`),
      axios.get(`${API_URL}/api/users/${userId}/ratings`)
    ])
      .then(([profileRes, ratingsRes]) => {
        setProfile(profileRes.data);
        setRatings(ratingsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) return <Spinner />;
  if (!profile) return <div className="text-center py-20 text-gray-600">User not found</div>;

  const joined = profile.member_since
    ? new Date(profile.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-900/50 to-black border border-white/[0.07] rounded-2xl p-8 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/5 to-indigo-600/5 pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profile.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt={profile.username}
                className="w-24 h-24 rounded-full object-cover border-2 border-brand-500/50 shadow-glow" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-4xl font-extrabold text-white shadow-glow">
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-white">{profile.username}</h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-1 text-gray-500 text-sm">
              {profile.location && <span>📍 {profile.location}</span>}
              {joined && <span>📅 Joined {joined}</span>}
            </div>
            {profile.bio && (
              <p className="text-gray-300 mt-3 text-sm max-w-md">{profile.bio}</p>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              <StatPill label="Sets Rated" value={ratings.length} />
            </div>
          </div>

          {/* Edit button */}
          {isOwn && (
            <Link to="/profile/edit"
              className="flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:border-brand-500/50 hover:text-white transition-all duration-200">
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Ratings */}
      <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">
        Reviews by {profile.username}
      </p>

      {ratings.length === 0 ? (
        <div className="text-center py-14 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-3xl mb-2">🎵</p>
          <p>No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map((r) => (
            <Link key={r.id} to={`/set/${r.set_id}`}
              className="group block bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-brand-500/30 rounded-2xl p-4 transition-all duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm group-hover:text-brand-400 transition-colors truncate">
                    {r.set_title}
                  </p>
                  {r.review && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{r.review}</p>
                  )}
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <StarDisplay value={r.score} size={14} />
                  <span className="text-gray-600 text-xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2 text-center">
      <p className="text-white font-bold text-lg">{value}</p>
      <p className="text-gray-500 text-xs">{label}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
