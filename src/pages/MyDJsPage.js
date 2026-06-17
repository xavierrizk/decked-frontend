import API_URL from '../api';
import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

function DJImageUpload({ djId, currentImage, onUpload }) {
  const [preview, setPreview] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.patch(
        `${API_URL}/api/artist-profiles/${djId}/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      onUpload(res.data.profile_image_url);
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-32 h-32 rounded-2xl overflow-hidden bg-[#111114] border-2 border-dashed border-white/20 cursor-pointer hover:border-[#00D9FF]/50 transition-colors relative"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Artist profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
            <span className="text-3xl">📸</span>
            <span className="text-xs mt-1">Upload photo</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        onClick={() => fileRef.current?.click()}
        className="text-xs text-[#00D9FF] hover:text-[#00D9FF] transition-colors"
      >
        {uploading ? 'Uploading...' : 'Change photo'}
      </button>
    </div>
  );
}

export default function MyDJsPage() {
  const [djs, setDjs]           = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const token = localStorage.getItem('token');

  const handleImageUpload = (djId, newUrl) => {
    setDjs(prev => prev.map(d => d.id === djId ? { ...d, profile_image_url: newUrl } : d));
  };

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API_URL}/api/artist-requests/my-artist-profiles`,   { headers }),
      axios.get(`${API_URL}/api/artist-requests/my-status`, { headers }),
    ]).then(([djsRes, reqRes]) => {
      setDjs(djsRes.data);
      setRequests(reqRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  if (!token) return <Navigate to="/login" />;
  if (loading) return <Spinner />;

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Artists</h1>
          <p className="text-gray-500 text-sm mt-1">Artist profiles you own and manage</p>
        </div>
        <Link to="/request-artist"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-glow text-sm">
          + Request New DJ
        </Link>
      </div>

      {/* Owned DJs */}
      {djs.length === 0 && pendingRequests.length === 0 ? (
        <div className="text-center py-20 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-5xl mb-4">🎧</p>
          <p className="text-lg font-semibold text-gray-500">You don't own any Artist profiles yet</p>
          <p className="text-sm mt-1 mb-6">Request an Artist profile to start uploading sets</p>
          <Link to="/request-artist"
            className="inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-glow">
            Request an Artist Profile
          </Link>
        </div>
      ) : (
        <>
          {djs.length > 0 && (
            <div className="mb-8">
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">Your Artist Profiles</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {djs.map(dj => (
                  <div key={dj.id} className="bg-white/[0.03] border border-white/[0.07] hover:border-brand-500/30 rounded-2xl p-5 transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <DJImageUpload
                        djId={dj.id}
                        currentImage={dj.profile_image_url}
                        onUpload={(url) => handleImageUpload(dj.id, url)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-extrabold truncate">{dj.name}</p>
                          {dj.verified && <span className="text-sm" title="Verified">✅</span>}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500 mb-3">
                          <span>🎵 {dj.set_count} sets</span>
                          <span>👥 {dj.follower_count} followers</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Link to={`/artist/${dj.id}`}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:border-brand-500/40 hover:text-white transition-all duration-200">
                            View Profile
                          </Link>
                          <Link to={`/create-set?dj=${dj.id}`}
                            className="text-xs px-3 py-1.5 rounded-lg bg-brand-600/20 border border-brand-500/30 text-brand-300 hover:bg-brand-600 hover:text-white transition-all duration-200">
                            + Add Set
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div className="mb-8">
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">Pending Requests</p>
              <div className="space-y-3">
                {pendingRequests.map(r => (
                  <div key={r.id} className="bg-yellow-500/[0.06] border border-yellow-500/20 rounded-xl p-4 flex items-center gap-4">
                    <span className="text-2xl flex-shrink-0">⏳</span>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm">{r.dj_name}</p>
                      <p className="text-yellow-400/70 text-xs mt-0.5">Under review · Submitted {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected requests */}
          {rejectedRequests.length > 0 && (
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">Rejected Requests</p>
              <div className="space-y-3">
                {rejectedRequests.map(r => (
                  <div key={r.id} className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">❌</span>
                      <p className="text-white font-bold text-sm">{r.dj_name}</p>
                    </div>
                    {r.admin_notes && (
                      <p className="text-red-300/70 text-xs ml-8">{r.admin_notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
