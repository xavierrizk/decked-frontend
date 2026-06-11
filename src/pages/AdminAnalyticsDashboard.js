import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getIsAdmin } from '../utils/auth';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#7C3AED', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`rounded-2xl border p-5 bg-white/[0.03] ${accent || 'border-white/[0.07]'}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-3xl font-extrabold text-white">{value ?? <span className="text-gray-600">—</span>}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
      {sub && <p className="text-xs mt-1 text-gray-600">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  );
}

function Skeleton() {
  return <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 animate-pulse h-32" />;
}

export default function AdminAnalyticsDashboard() {
  const isAdmin = getIsAdmin();
  const [dash, setDash] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [content, setContent] = useState({ sets: [], ratings: [] });
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      axios.get(`${API_URL}/api/admin/analytics/dashboard`, { headers }),
      axios.get(`${API_URL}/api/admin/analytics/growth`, { headers }),
      axios.get(`${API_URL}/api/admin/analytics/content`, { headers }),
    ]).then(([d, g, c]) => {
      setDash(d.data);
      setGrowth(g.data.map(r => ({ date: r.date?.slice(5, 10), count: parseInt(r.count) })));
      setContent({
        sets: c.data.sets.map(r => ({ date: r.date?.slice(5, 10), count: parseInt(r.count) })),
        ratings: c.data.ratings.map(r => ({ date: r.date?.slice(5, 10), count: parseInt(r.count) })),
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAdmin]); // eslint-disable-line

  if (!isAdmin) return <Navigate to="/" />;

  const growthPct = dash && dash.newUsersLastWeek > 0
    ? Math.round(((dash.newUsersThisWeek - dash.newUsersLastWeek) / dash.newUsersLastWeek) * 100)
    : null;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white mb-1">Analytics Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Platform at a glance</p>

      {/* Hero stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {loading ? [...Array(5)].map((_, i) => <Skeleton key={i} />) : <>
          <StatCard icon="👥" label="Total Users" value={dash?.totalUsers}
            sub={growthPct !== null ? `${growthPct >= 0 ? '+' : ''}${growthPct}% vs last week` : null}
            accent={growthPct > 0 ? 'border-green-500/30 bg-green-500/5' : undefined} />
          <StatCard icon="🎧" label="Total DJs" value={dash?.totalDJs} />
          <StatCard icon="🎵" label="Total Sets" value={dash?.totalSets} />
          <StatCard icon="⭐" label="Total Ratings" value={dash?.totalRatings} />
          <StatCard icon="🚩" label="Active Reports" value={dash?.activeReports}
            accent={dash?.activeReports > 0 ? 'border-red-500/30 bg-red-500/5' : undefined} />
        </>}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <ChartCard title="User Growth — Last 30 Days">
          {loading ? <div className="animate-pulse bg-white/[0.04] h-40 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#111114', border: '1px solid #ffffff1a', borderRadius: 8, color: '#fff' }} />
                <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Sets per Day — Last 7 Days">
          {loading ? <div className="animate-pulse bg-white/[0.04] h-40 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={content.sets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#111114', border: '1px solid #ffffff1a', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top 5 DJs by Followers">
          {loading ? <div className="animate-pulse bg-white/[0.04] h-40 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={dash?.topDJs?.map(d => ({ name: d.name, value: parseInt(d.follower_count) || 0 }))}
                  cx="50%" cy="50%" outerRadius={60}
                  dataKey="value"
                >
                  {dash?.topDJs?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111114', border: '1px solid #ffffff1a', borderRadius: 8, color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Platform health */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/[0.03] border border-red-500/20 rounded-2xl p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Active Reports</p>
          {loading ? <div className="animate-pulse bg-white/[0.04] h-8 rounded" /> : (
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-red-300">{dash?.activeReports}</span>
              <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">pending</span>
            </div>
          )}
        </div>
        <div className="bg-white/[0.03] border border-orange-500/20 rounded-2xl p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Active Bans</p>
          {loading ? <div className="animate-pulse bg-white/[0.04] h-8 rounded" /> : (
            <span className="text-3xl font-extrabold text-orange-300">{dash?.activeBans}</span>
          )}
        </div>
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Recent Announcements</p>
          {loading ? <div className="animate-pulse bg-white/[0.04] h-16 rounded" /> : (
            dash?.recentAnnouncements?.length === 0
              ? <p className="text-gray-600 text-sm">None</p>
              : <div className="space-y-1">
                {dash?.recentAnnouncements?.map(a => (
                  <p key={a.id} className="text-white text-sm truncate">{a.title}</p>
                ))}
              </div>
          )}
        </div>
      </div>

      {/* Top content tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Top 5 DJs</p>
          {loading ? <Skeleton /> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-600 text-xs">
                  <th className="text-left pb-2">Name</th>
                  <th className="text-right pb-2">Followers</th>
                  <th className="text-right pb-2">Sets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {dash?.topDJs?.map(dj => (
                  <tr key={dj.id}>
                    <td className="py-2">
                      <Link to={`/dj/${dj.id}`} className="text-white hover:text-brand-400 font-medium transition-colors">{dj.name}</Link>
                    </td>
                    <td className="py-2 text-right text-gray-300">{dj.follower_count}</td>
                    <td className="py-2 text-right text-gray-300">{dj.set_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Top 5 Sets</p>
          {loading ? <Skeleton /> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-600 text-xs">
                  <th className="text-left pb-2">Title</th>
                  <th className="text-right pb-2">Ratings</th>
                  <th className="text-right pb-2">Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {dash?.topSets?.map(s => (
                  <tr key={s.id}>
                    <td className="py-2">
                      <Link to={`/set/${s.id}`} className="text-white hover:text-brand-400 font-medium transition-colors truncate block max-w-[160px]">{s.title}</Link>
                      <span className="text-gray-600 text-xs">{s.dj_name}</span>
                    </td>
                    <td className="py-2 text-right text-gray-300">{s.rating_count}</td>
                    <td className="py-2 text-right text-brand-400 font-semibold">{s.avg_rating ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
