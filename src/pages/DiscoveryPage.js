import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import VisualizerBackground from '../components/backgrounds/VisualizerBackground';
import DJCard from '../components/cards/DJCard';
import SetCard from '../components/cards/SetCard';

export default function DiscoveryPage() {
  const [trending, setTrending]   = useState([]);
  const [topRated, setTopRated]   = useState([]);
  const [recent, setRecent]       = useState([]);
  const [topDjs, setTopDjs]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/feed/trending?sort=likes`),
      axios.get(`${API_URL}/api/search/top-rated`),
      axios.get(`${API_URL}/api/search/recent`),
      axios.get(`${API_URL}/api/search/top-djs`),
    ]).then(([trendRes, topRes, recentRes, djRes]) => {
      setTrending(trendRes.data.slice(0, 6));
      setTopRated(topRes.data.slice(0, 6));
      setRecent(recentRes.data.slice(0, 6));
      setTopDjs(djRes.data.slice(0, 6));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <VisualizerBackground />
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}>
          Discover <span className="text-brand-gradient">New Music</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Trending sets, top-rated classics, fresh uploads, and the best DJs on the platform.
        </p>
        <Link to="/search"
          className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105">
          🔍 Search everything
        </Link>
      </div>

      {/* Trending Now */}
      {trending.length > 0 && (
        <Section title="🔥 Trending Now" subtitle="Most liked this week" linkTo="/trending">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
            {trending.map((set, i) => <SetCard key={set.id} set={set} rank={i + 1} />)}
          </div>
        </Section>
      )}

      {/* Top Rated All Time */}
      {topRated.length > 0 && (
        <Section title="⭐ Top Rated All Time" subtitle="Highest average ratings">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
            {topRated.map((set, i) => <SetCard key={set.id} set={set} rank={i + 1} />)}
          </div>
        </Section>
      )}

      {/* Newest Sets */}
      {recent.length > 0 && (
        <Section title="🆕 Just Uploaded" subtitle="Fresh sets from the community">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
            {recent.map(set => <SetCard key={set.id} set={set} />)}
          </div>
        </Section>
      )}

      {/* Top DJs */}
      {topDjs.length > 0 && (
        <Section title="🎧 Top DJs" subtitle="Most followed artists on Decked">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topDjs.map((dj) => <DJCard key={dj.id} dj={dj} showFollow={false} />)}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, subtitle, linkTo, children }) {
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-white font-bold text-xl" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
        {linkTo && (
          <Link to={linkTo} className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
            See all →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
