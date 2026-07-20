import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import SetThumbnail from '../components/SetThumbnail';

const GENRES = [
  { slug: 'techno',            label: 'Techno',            color: '#FF006E', bg: 'rgba(255,0,110,0.12)'   },
  { slug: 'tech-house',        label: 'Tech House',        color: '#00D9FF', bg: 'rgba(0,217,255,0.10)'   },
  { slug: 'house',             label: 'House',             color: '#A855F7', bg: 'rgba(168,85,247,0.10)'  },
  { slug: 'deep-house',        label: 'Deep House',        color: '#6366F1', bg: 'rgba(99,102,241,0.10)'  },
  { slug: 'drum-and-bass',     label: 'Drum & Bass',       color: '#F59E0B', bg: 'rgba(245,158,11,0.10)'  },
  { slug: 'dubstep',           label: 'Dubstep',           color: '#EF4444', bg: 'rgba(239,68,68,0.10)'   },
  { slug: 'jungle',            label: 'Jungle',            color: '#10B981', bg: 'rgba(16,185,129,0.10)'  },
  { slug: 'ukg',               label: 'UK Garage',         color: '#F97316', bg: 'rgba(249,115,22,0.10)'  },
  { slug: 'edm',               label: 'EDM',               color: '#EC4899', bg: 'rgba(236,72,153,0.10)'  },
  { slug: 'progressive-house', label: 'Progressive House', color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)'  },
  { slug: 'electro',           label: 'Electro',           color: '#14B8A6', bg: 'rgba(20,184,166,0.10)'  },
  { slug: 'future-bass',       label: 'Future Bass',       color: '#F43F5E', bg: 'rgba(244,63,94,0.10)'   },
  { slug: 'hard-groove',       label: 'Hard Groove',       color: '#DC2626', bg: 'rgba(220,38,38,0.10)'   },
  { slug: 'dance',             label: 'Dance',             color: '#0EA5E9', bg: 'rgba(14,165,233,0.10)'  },
  { slug: 'speed-garage',      label: 'Speed Garage',      color: '#D946EF', bg: 'rgba(217,70,239,0.10)'  },
  { slug: 'ambient',           label: 'Ambient',           color: '#64748B', bg: 'rgba(100,116,139,0.10)' },
];

// Map slug → search term(s)
const GENRE_SEARCH = {
  'techno':            'Techno',
  'tech-house':        'Tech House',
  'house':             'House',
  'deep-house':        'Deep House',
  'drum-and-bass':     'Drum',
  'dubstep':           'Dubstep',
  'jungle':            'Jungle',
  'ukg':               'UKG',
  'edm':               'EDM',
  'progressive-house': 'Progressive',
  'electro':           'Electro',
  'future-bass':       'Future Bass',
  'hard-groove':       'Hard Groove',
  'dance':             'Dance',
  'speed-garage':      'Speed Garage',
  'ambient':           'Ambient',
};

// Genre grid tile
function GenreTile({ genre, count }) {
  return (
    <Link to={`/genre/${genre.slug}`}
      className="group relative rounded-xl border overflow-hidden flex flex-col items-start justify-end p-4 aspect-[4/3] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      style={{ background: genre.bg, borderColor: `${genre.color}30` }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: `radial-gradient(ellipse at bottom left, ${genre.color}20, transparent 70%)` }} />
      <p className="text-white font-bold text-lg leading-tight relative z-10">{genre.label}</p>
      {count != null && (
        <p className="text-[11px] mt-0.5 relative z-10" style={{ color: genre.color }}>{count} set{count !== 1 ? 's' : ''}</p>
      )}
    </Link>
  );
}

// Set card for genre results
function GenreSetCard({ set }) {
  const avg   = set.avg_rating ? parseFloat(set.avg_rating) : null;
  const venue = set.venue_name || set.festival_name || set.location || null;

  return (
    <Link to={`/set/${set.id}`}
      className="group block rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.16] bg-white/[0.02] transition-all duration-200 hover:scale-[1.01]">
      <div className="relative aspect-video bg-white/[0.04] overflow-hidden">
        <SetThumbnail
          setId={set.id}
          youtubeUrl={set.video_url}
          performanceType={set.performance_type}
          alt={set.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {avg && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1">
            <span className="text-yellow-400 text-[10px]">★</span>
            <span className="text-white text-xs font-bold">{avg.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="text-white text-sm font-semibold leading-tight truncate group-hover:text-[#00D9FF] transition-colors">{set.title}</p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-gray-600 text-[11px] truncate">{set.dj_name || venue || ''}</p>
          {set.like_count > 0 && (
            <span className="text-gray-700 text-[10px] flex-shrink-0 ml-2">♥ {set.like_count}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Browse index page ──────────────────────────────────────────────────
function BrowseIndex() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    axios.get(`${API_URL}/api/search/genres-with-counts`)
      .then(r => {
        const map = {};
        (r.data || []).forEach(({ genre, count }) => {
          if (genre) map[genre.toLowerCase()] = parseInt(count);
        });
        setCounts(map);
      }).catch(() => {});
  }, []);

  const getCount = (genre) => {
    const term = GENRE_SEARCH[genre.slug]?.toLowerCase();
    const total = Object.entries(counts).reduce((sum, [k, v]) => {
      return k.includes(term) ? sum + v : sum;
    }, 0);
    return total || null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Browse by Genre</h1>
        <p className="text-gray-500 text-sm">Find sets by the music you love</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {GENRES.map(g => (
          <GenreTile key={g.slug} genre={g} count={getCount(g)} />
        ))}
      </div>
    </div>
  );
}

// ── Genre detail page ──────────────────────────────────────────────────
function GenreDetail({ slug }) {
  const navigate = useNavigate();
  const genre = GENRES.find(g => g.slug === slug);
  const [sets, setSets]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort]     = useState('top_rated');

  useEffect(() => {
    if (!genre) return;
    setLoading(true);
    const q = GENRE_SEARCH[slug] || genre.label;
    axios.get(`${API_URL}/api/search/sets?genre=${encodeURIComponent(q)}&sort=${sort}`)
      .then(r => setSets(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, sort]); // eslint-disable-line

  if (!genre) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-600">
      <p className="text-3xl mb-3">🎛️</p>
      <p>Genre not found.</p>
      <Link to="/genre" className="text-[#00D9FF] text-sm mt-2 inline-block">← Browse all genres</Link>
    </div>
  );

  const SORT_OPTIONS = [
    { value: 'top_rated',  label: 'Top Rated' },
    { value: 'most_liked', label: 'Most Liked' },
    { value: 'newest',     label: 'Newest' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden border mb-6 px-6 py-8"
        style={{ background: genre.bg, borderColor: `${genre.color}30` }}>
        <div className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse at top left, ${genre.color}40, transparent 60%)` }} />
        <Link to="/genre" className="relative z-10 flex items-center gap-1 text-xs mb-3 transition-colors"
          style={{ color: genre.color }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          All genres
        </Link>
        <h1 className="relative z-10 text-3xl font-extrabold text-white mb-1">{genre.label}</h1>
        {sets.length > 0 && (
          <p className="relative z-10 text-sm" style={{ color: genre.color }}>{sets.length} sets</p>
        )}
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Sets</p>
        <div className="flex gap-1">
          {SORT_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setSort(o.value)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                sort === o.value
                  ? 'text-[#00D9FF] border-[#00D9FF]/30 bg-[#00D9FF]/10'
                  : 'text-gray-500 border-transparent hover:text-white'
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white/[0.03] aspect-video animate-pulse" />
          ))}
        </div>
      ) : sets.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] rounded-xl text-gray-600">
          <p className="text-3xl mb-3">🎧</p>
          <p className="font-medium">No {genre.label} sets yet</p>
          <p className="text-sm mt-1">Be the first to add one</p>
          <Link to="/create-set" className="text-[#00D9FF] text-sm mt-3 inline-block">+ Add a set</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sets.map(s => <GenreSetCard key={s.id} set={s} />)}
        </div>
      )}
    </div>
  );
}

// ── Router wrapper ─────────────────────────────────────────────────────
export default function GenrePage() {
  const { slug } = useParams();
  return slug ? <GenreDetail slug={slug} /> : <BrowseIndex />;
}
