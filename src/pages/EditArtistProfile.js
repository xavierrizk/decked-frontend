import API_URL from '../api';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUserId } from '../utils/auth';
import CityAutocomplete from '../components/CityAutocomplete';
import { useToast } from '../components/Toast';
import Toast from '../components/Toast';

function ImageUploadZone({ label, hint, current, onUpload, onDelete, uploading, accept = 'image/*', aspectClass = 'aspect-[3/1]' }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    await onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const displaySrc = preview || current;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</label>
        {hint && <span className="text-gray-600 text-xs">{hint}</span>}
      </div>
      <div
        className={`relative ${aspectClass} w-full rounded-xl border-2 transition-all duration-200 overflow-hidden cursor-pointer group ${
          dragOver
            ? 'border-[#00D9FF] bg-[#00D9FF]/5'
            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {displaySrc ? (
          <>
            <img src={displaySrc} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-semibold">Change image</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-2xl">{uploading ? '⏳' : '📷'}</span>
            <p className="text-gray-500 text-sm text-center px-4">
              {uploading ? 'Uploading…' : 'Drag & drop or click to upload'}
            </p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {displaySrc && !uploading && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setPreview(null); onDelete(); }}
          className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Remove {label.toLowerCase()}
        </button>
      )}
    </div>
  );
}

export default function EditArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const [toast, showToast] = useToast();
  const authHeaders = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') });

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/artist-profiles/${id}`)
      .then(r => {
        const p = r.data;
        // Check ownership
        if (p.user_id !== currentUserId) {
          navigate(`/artist/${id}`);
          return;
        }
        setProfile(p);
        setBio(p.bio || '');
        setLocation(p.location || '');
        setWebsite(p.website || '');
        setLoading(false);
      })
      .catch(() => { navigate(`/artist/${id}`); });
  }, [id, currentUserId, navigate]);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(
        `${API_URL}/api/artist-profiles/${id}`,
        { bio, location, website },
        { headers: authHeaders() }
      );
      setProfile(prev => ({ ...prev, ...res.data }));
      showToast('Profile updated!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save');
    }
    setSaving(false);
  };

  const uploadPfp = async (file) => {
    setUploadingPfp(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post(
        `${API_URL}/api/artist-profiles/${id}/profile-picture`,
        fd,
        { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } }
      );
      setProfile(prev => ({ ...prev, profile_image_url: res.data.profile_image_url }));
      showToast('Profile picture updated!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Upload failed');
    }
    setUploadingPfp(false);
  };

  const deletePfp = async () => {
    try {
      await axios.delete(`${API_URL}/api/artist-profiles/${id}/profile-picture`, { headers: authHeaders() });
      setProfile(prev => ({ ...prev, profile_image_url: null }));
      showToast('Profile picture removed');
    } catch { showToast('Failed to remove'); }
  };

  const uploadBanner = async (file) => {
    setUploadingBanner(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post(
        `${API_URL}/api/artist-profiles/${id}/banner`,
        fd,
        { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } }
      );
      setProfile(prev => ({ ...prev, banner_image_url: res.data.banner_image_url }));
      showToast('Banner updated!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Upload failed');
    }
    setUploadingBanner(false);
  };

  const deleteBanner = async () => {
    try {
      await axios.delete(`${API_URL}/api/artist-profiles/${id}/banner`, { headers: authHeaders() });
      setProfile(prev => ({ ...prev, banner_image_url: null }));
      showToast('Banner removed');
    } catch { showToast('Failed to remove'); }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-8">
      <Toast message={toast} />

      <Link to={`/artist/${id}`} className="text-gray-500 hover:text-[#00D9FF] text-sm transition-colors mb-6 block">
        ← Back to profile
      </Link>

      <h1 className="text-2xl font-extrabold text-white mb-8">Edit Artist Profile</h1>

      <div className="space-y-8">
        {/* Banner */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <ImageUploadZone
            label="Banner Image"
            hint="Recommended: 1400×400px · Max 10MB · JPEG/PNG/WebP"
            current={profile?.banner_image_url}
            onUpload={uploadBanner}
            onDelete={deleteBanner}
            uploading={uploadingBanner}
            aspectClass="aspect-[3.5/1]"
          />
        </div>

        {/* Profile picture */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <ImageUploadZone
            label="Profile Picture"
            hint="Recommended: 400×400px · Max 5MB · JPEG/PNG/WebP"
            current={profile?.profile_image_url}
            onUpload={uploadPfp}
            onDelete={deletePfp}
            uploading={uploadingPfp}
            aspectClass="aspect-square max-w-[200px]"
          />
        </div>

        {/* Bio / Info */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-white font-bold text-base mb-5">Profile Info</h2>
          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Bio</label>
                <span className="text-gray-600 text-xs">{bio.length}/500</span>
              </div>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Tell listeners about this artist…"
                className="w-full bg-white/[0.04] border border-white/10 focus:border-[#00D9FF]/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Location</label>
              <CityAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="e.g. Berlin, Germany"
                className="w-full bg-white/[0.04] border border-white/10 focus:border-[#00D9FF]/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Website</label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                maxLength={500}
                placeholder="https://yoursite.com"
                className="w-full bg-white/[0.04] border border-white/10 focus:border-[#00D9FF]/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary disabled:opacity-40 font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
