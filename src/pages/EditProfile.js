import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUserId } from '../utils/auth';

export default function EditProfile() {
  const [bio, setBio]                       = useState('');
  const [location, setLocation]             = useState('');
  const [profilePicUrl, setProfilePicUrl]   = useState('');
  const [loading, setLoading]               = useState(false);
  const [fetching, setFetching]             = useState(true);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');
  const navigate                            = useNavigate();
  const userId                              = getCurrentUserId();

  // Pre-fill with existing profile data
  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/api/users/${userId}`)
      .then((res) => {
        setBio(res.data.bio || '');
        setLocation(res.data.location || '');
        setProfilePicUrl(res.data.profile_picture_url || '');
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await axios.post(
        `${API_URL}/api/users/${userId}/profile`,
        { bio, location, profile_picture_url: profilePicUrl },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('Profile saved!');
      setTimeout(() => navigate(`/profile/${userId}`), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
      setLoading(false);
    }
  };

  if (fetching) return <Spinner />;

  const inp = "w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200";

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to={`/profile/${userId}`} className="text-gray-500 hover:text-brand-400 text-sm transition-colors block mb-6">
          ← Back to profile
        </Link>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 shadow-2xl backdrop-blur-sm">
          <h1 className="text-2xl font-extrabold text-white mb-1">Edit Profile</h1>
          <p className="text-gray-500 text-sm mb-6">Customise how others see you on Decked</p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
              <span>✓</span> {success}
            </div>
          )}

          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-6">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-brand-500/40" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                ?
              </div>
            )}
            <p className="text-gray-500 text-xs">Paste an image URL below to set your avatar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Profile Picture URL <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <input type="url" value={profilePicUrl} onChange={(e) => setProfilePicUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg" className={inp} />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Location <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="London, UK" className={inp} />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Bio <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200 resize-none h-28"
                placeholder="House music lover, based in…" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-glow">
              {loading ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
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
