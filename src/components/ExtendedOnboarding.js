import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const GENRES = [
  'House', 'Techno', 'Drum & Bass', 'Trance', 'Dubstep',
  'Hip-Hop', 'Trap', 'Jungle', 'Ambient', 'Disco',
  'Electro', 'Other',
];

const SET_LENGTHS = [
  { value: 'short',  label: 'Short',    desc: '30–45 mins' },
  { value: 'medium', label: 'Medium',   desc: '45–90 mins' },
  { value: 'long',   label: 'Long',     desc: '90+ mins'   },
  { value: 'any',    label: 'Mix it up', desc: 'No preference' },
];

const TOTAL_STEPS = 8;

function ProgressBar({ step }) {
  return (
    <div className="w-full h-0.5 bg-white/[0.06] mb-8">
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: '#00D9FF' }}
      />
    </div>
  );
}

function StepLabel({ step }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'rgba(0,217,255,0.6)' }}>
      Step {step} of {TOTAL_STEPS}
    </p>
  );
}

export default function ExtendedOnboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1); // 1=forward, -1=back
  const [animating, setAnimating] = useState(false);

  // Preferences state
  const [selectedGenres, setSelectedGenres]   = useState([]);
  const [selectedDJs,    setSelectedDJs]       = useState([]);
  const [vibeText,       setVibeText]          = useState('');
  const [setLength,      setSetLength]         = useState('');
  const [location,       setLocation]          = useState('');

  // DJ list for step 3
  const [djList, setDjList] = useState([]);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/artist-profiles/featured`)
      .then(r => setDjList(r.data.slice(0, 18)))
      .catch(() => {});
  }, []);

  const goTo = useCallback((next) => {
    if (animating) return;
    setDir(next > step ? 1 : -1);
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 220);
  }, [animating, step]);

  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const toggleGenre = (g) =>
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const toggleDJ = (id) =>
    setSelectedDJs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleComplete = async () => {
    try {
      await axios.patch(`${API_URL}/api/auth/preferences`, {
        favorite_genres:          selectedGenres,
        favorite_djs:             selectedDJs,
        music_taste_description:  vibeText || null,
        preferred_set_length:     setLength || null,
        location:                 location  || null,
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
    localStorage.setItem('onboarding_shown', '1');
    if (onComplete) onComplete();
  };

  const handleSkip = async () => {
    try {
      await axios.patch(`${API_URL}/api/auth/preferences`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
    localStorage.setItem('onboarding_shown', '1');
    if (onComplete) onComplete();
  };

  const slideStyle = {
    opacity:   animating ? 0 : 1,
    transform: animating ? `translateX(${dir * 24}px)` : 'translateX(0)',
    transition: 'opacity 0.22s ease, transform 0.22s ease',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-xl mx-4 bg-[#0d0d0f] border border-white/[0.08] flex flex-col" style={{ maxHeight: '90vh' }}>

        {/* Top bar */}
        <div className="px-8 pt-8 flex-shrink-0">
          <ProgressBar step={step} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 pb-6">
          <div style={slideStyle}>

            {/* ── Step 1: Welcome ─────────────────── */}
            {step === 1 && (
              <div className="text-center py-4">
                <StepLabel step={1} />
                <div className="text-6xl mb-6">🎵</div>
                <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Welcome to DECK'D
                </h1>
                <p className="text-gray-400 text-base leading-relaxed mb-2">
                  Let's set up your music taste so we can recommend the right DJ sets for you.
                </p>
                <p className="text-gray-600 text-sm">Takes about 2 minutes.</p>
              </div>
            )}

            {/* ── Step 2: Genres ──────────────────── */}
            {step === 2 && (
              <div>
                <StepLabel step={2} />
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  What genres do you love?
                </h2>
                <p className="text-gray-500 text-sm mb-6">Select all that apply.</p>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`px-4 py-2 text-sm font-medium border transition-all duration-150 ${
                        selectedGenres.includes(g)
                          ? 'border-[#00D9FF] text-[#00D9FF] bg-[#00D9FF]/10'
                          : 'border-white/[0.08] text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {selectedGenres.length > 0 && (
                  <p className="text-[#00D9FF] text-xs mt-4">{selectedGenres.length} selected</p>
                )}
              </div>
            )}

            {/* ── Step 3: Favorite DJs ────────────── */}
            {step === 3 && (
              <div>
                <StepLabel step={3} />
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Who are your favourite DJs?
                </h2>
                <p className="text-gray-500 text-sm mb-6">Pick up to 5. Optional.</p>
                <div className="grid grid-cols-3 gap-2">
                  {djList.map(dj => {
                    const selected = selectedDJs.includes(dj.id);
                    return (
                      <button
                        key={dj.id}
                        onClick={() => {
                          if (!selected && selectedArtists.length >= 5) return;
                          toggleDJ(dj.id);
                        }}
                        className={`relative overflow-hidden aspect-square flex flex-col items-end justify-end p-2 border transition-all duration-150 ${
                          selected
                            ? 'border-[#00D9FF]'
                            : 'border-white/[0.06] hover:border-white/20'
                        } ${!selected && selectedArtists.length >= 5 ? 'opacity-40' : ''}`}
                        style={{
                          backgroundImage: dj.profile_image_url ? `url(${dj.profile_image_url})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          background: dj.profile_image_url ? undefined : 'linear-gradient(135deg, #2a2a35, #1a1a22)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        {selected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: '#00D9FF', color: '#0a0a0a' }}>
                            ✓
                          </div>
                        )}
                        <p className="relative text-white text-xs font-semibold leading-tight text-left w-full">
                          {dj.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {selectedArtists.length > 0 && (
                  <p className="text-[#00D9FF] text-xs mt-4">{selectedArtists.length}/5 selected</p>
                )}
              </div>
            )}

            {/* ── Step 4: Vibe ────────────────────── */}
            {step === 4 && (
              <div>
                <StepLabel step={4} />
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Describe your vibe
                </h2>
                <p className="text-gray-500 text-sm mb-6">Optional. A few words is fine.</p>
                <textarea
                  value={vibeText}
                  onChange={e => setVibeText(e.target.value)}
                  maxLength={300}
                  rows={4}
                  placeholder="e.g. Dark and moody, high energy underground sets, peak-time techno…"
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00D9FF] text-white placeholder-gray-600 text-sm px-4 py-3 outline-none resize-none transition-colors"
                />
                <p className="text-gray-700 text-xs mt-1 text-right">{vibeText.length}/300</p>
              </div>
            )}

            {/* ── Step 5: Set length ──────────────── */}
            {step === 5 && (
              <div>
                <StepLabel step={5} />
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  How long do you prefer sets?
                </h2>
                <p className="text-gray-500 text-sm mb-6">Optional.</p>
                <div className="space-y-2">
                  {SET_LENGTHS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSetLength(setLength === opt.value ? '' : opt.value)}
                      className={`w-full flex items-center justify-between px-5 py-4 border transition-all duration-150 ${
                        setLength === opt.value
                          ? 'border-[#00D9FF] bg-[#00D9FF]/08'
                          : 'border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center flex-shrink-0 ${
                          setLength === opt.value ? 'border-[#00D9FF]' : 'border-white/20'
                        }`}>
                          {setLength === opt.value && (
                            <div className="w-2 h-2 rounded-full" style={{ background: '#00D9FF' }} />
                          )}
                        </div>
                        <span className={`font-semibold text-sm ${setLength === opt.value ? 'text-white' : 'text-gray-400'}`}>
                          {opt.label}
                        </span>
                      </div>
                      <span className="text-gray-600 text-xs">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 6: Location ────────────────── */}
            {step === 6 && (
              <div>
                <StepLabel step={6} />
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Where are you based?
                </h2>
                <p className="text-gray-500 text-sm mb-6">Optional. Helps surface local Artists.</p>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City, e.g. London, Berlin, Sydney…"
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00D9FF] text-white placeholder-gray-600 text-sm px-4 py-3 outline-none transition-colors"
                />
              </div>
            )}

            {/* ── Step 7: Summary ─────────────────── */}
            {step === 7 && (
              <div>
                <StepLabel step={7} />
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Your music taste
                </h2>
                <div className="space-y-3">
                  <SummaryRow
                    label="Genres"
                    value={selectedGenres.length ? selectedGenres.join(', ') : 'None selected'}
                    onEdit={() => goTo(2)}
                  />
                  <SummaryRow
                    label="Favourite Artists"
                    value={selectedArtists.length ? `${selectedArtists.length} selected` : 'None selected'}
                    onEdit={() => goTo(3)}
                  />
                  <SummaryRow
                    label="Vibe"
                    value={vibeText || 'Not set'}
                    onEdit={() => goTo(4)}
                  />
                  <SummaryRow
                    label="Set length"
                    value={SET_LENGTHS.find(l => l.value === setLength)?.label || 'No preference'}
                    onEdit={() => goTo(5)}
                  />
                  <SummaryRow
                    label="Location"
                    value={location || 'Not set'}
                    onEdit={() => goTo(6)}
                  />
                </div>
              </div>
            )}

            {/* ── Step 8: Done ────────────────────── */}
            {step === 8 && (
              <div className="text-center py-4">
                <StepLabel step={8} />
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  You're all set
                </h2>
                <p className="text-gray-400 text-base leading-relaxed">
                  We'll use your taste to recommend DJ sets you'll actually love.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Bottom actions */}
        <div className="px-8 pb-8 pt-4 flex-shrink-0 border-t border-white/[0.05] flex items-center justify-between gap-3">
          {/* Back / Skip */}
          <div className="flex items-center gap-3">
            {step > 1 && step < 8 && (
              <button onClick={back} className="text-gray-500 hover:text-white text-sm transition-colors">
                ← Back
              </button>
            )}
            {step < 8 && (
              <button onClick={handleSkip} className="text-gray-700 hover:text-gray-400 text-xs transition-colors">
                Skip all
              </button>
            )}
          </div>

          {/* Primary CTA */}
          {step === 1 && (
            <button onClick={next} className="btn-primary px-8 py-2.5 text-sm font-semibold">
              Let's Go →
            </button>
          )}
          {step === 2 && (
            <button
              onClick={next}
              disabled={selectedGenres.length === 0}
              className="btn-primary disabled:opacity-40 px-8 py-2.5 text-sm font-semibold"
            >
              Next →
            </button>
          )}
          {(step === 3 || step === 4 || step === 5 || step === 6) && (
            <button onClick={next} className="btn-primary px-8 py-2.5 text-sm font-semibold">
              Next →
            </button>
          )}
          {step === 7 && (
            <button onClick={() => { handleComplete(); goTo(8); }} className="btn-primary px-8 py-2.5 text-sm font-semibold">
              Complete →
            </button>
          )}
          {step === 8 && (
            <button onClick={() => { if (onComplete) onComplete(); navigate('/'); }} className="btn-primary px-8 py-2.5 text-sm font-semibold">
              Go to Home →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/[0.05]">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(0,217,255,0.6)' }}>{label}</p>
        <p className="text-gray-300 text-sm">{value}</p>
      </div>
      <button onClick={onEdit} className="text-xs text-gray-600 hover:text-[#00D9FF] transition-colors flex-shrink-0 mt-1">
        Edit
      </button>
    </div>
  );
}
