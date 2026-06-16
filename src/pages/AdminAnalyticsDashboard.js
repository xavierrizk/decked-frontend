import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CYAN  = '#00D9FF';
const PINK  = '#FF006E';
const GREY  = '#5A6470';
const GREEN = '#22c55e';
const AMBER = '#f59e0b';

const TYPE_COLORS = {
  dj_set:       CYAN,
  concert:      PINK,
  festival_set: AMBER,
  live_band:    GREEN,
  rave:         '#a855f7',
  other:        GREY,
};
const TYPE_LABELS = {
  dj_set: 'DJ Set', concert: 'Concert', festival_set: 'Festival',
  live_band: 'Live Band', rave: 'Rave', other: 'Other',
};

const TABS = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'content',  icon: '🎵', label: 'Content'  },
  { id: 'users',    icon: '👥', label: 'Users'    },
  { id: 'djs',      icon: '🎧', label: 'DJs'      },
  { id: 'reviews',  icon: '⭐', label: 'Reviews'  },
  { id: 'growth',   icon: '📈', label: 'Growth'   },
];

const GROWTH_OPTS = [{ label: '7D', days: 7 }, { label: '30D', days: 30 }, { label: '90D', days: 90 }];

// ─── Shared UI ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`rounded-xl border p-5 bg-[#111114] ${accent || 'border-white/[0.07]'}`}>
      <div className="text-xl mb-3">{icon}</div>
      <p className="text-2xl font-extrabold text-white tabular-nums">
        {value ?? <span className="text-gray-700">—</span>}
      </p>
      <p className="text-gray-500 text-xs mt-1 font-medium">{label}</p>
      {sub && <p className="text-[11px] mt-1 text-gray-600">{sub}</p>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-5 mb-6">
      <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  );
}

function Skeleton({ h = 'h-24' }) {
  return <div className={`bg-white/[0.03] border border-white/[0.04] rounded-xl animate-pulse ${h}`} />;
}

function SortableTable({ cols, rows, defaultSort, loading }) {
  const [sort, setSort] = useState(defaultSort || (cols[0] && cols[0].key));
  const [asc, setAsc]   = useState(false);

  const toggle = (key) => {
    if (sort === key) setAsc(a => !a);
    else { setSort(key); setAsc(false); }
  };

  const sorted = [...(rows || [])].sort((a, b) => {
    const va = a[sort], vb = b[sort];
    const cmp = typeof va === 'number' ? va - vb : String(va || '').localeCompare(String(vb || ''));
    return asc ? cmp : -cmp;
  });

  if (loading) return <Skeleton h="h-40" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.05]">
            {cols.map(c => (
              <th key={c.key} onClick={() => toggle(c.key)}
                className="text-left py-2 px-3 text-gray-500 text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap">
                {c.label} {sort === c.key ? (asc ? '↑' : '↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
              {cols.map(c => (
                <td key={c.key} className="py-2.5 px-3 text-gray-300">
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={cols.length} className="py-8 text-center text-gray-600">No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const fmtNum = n => !n && n !== 0 ? '—'
  : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M'
  : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K'
  : String(n);

const TypeBadge = ({ type }) => (
  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
    style={{ color: TYPE_COLORS[type] || GREY, background: (TYPE_COLORS[type] || GREY) + '20' }}>
    {TYPE_LABELS[type] || type}
  </span>
);

const RatingBar = ({ value }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${(value / 5) * 100}%`, background: CYAN }} />
    </div>
    <span className="text-xs text-gray-400 w-8 text-right">{value > 0 ? value.toFixed(1) : '—'}</span>
  </div>
);

const TOOLTIP_STYLE = { background: '#111114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 };

// ─── Sections ────────────────────────────────────────────────────────────────

function OverviewSection({ headers }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    axios.get(`${API_URL}/api/admin/stats/overview`, { headers }).then(r => setData(r.data)).catch(() => {});
  }, []); // eslint-disable-line

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <StatCard icon="👥" label="Total Users"     value={data ? fmtNum(data.totalUsers) : null} />
        <StatCard icon="🎵" label="Total Content"   value={data ? fmtNum(data.totalContent) : null} />
        <StatCard icon="✍️" label="Reviews Written" value={data ? fmtNum(data.totalReviews) : null} />
        <StatCard icon="✅" label="Verified DJs"    value={data ? fmtNum(data.verifiedDJs) : null} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon="🆕" label="New Users (7d)"    value={data ? fmtNum(data.newUsersThisWeek) : null}
          accent="border-green-500/20 bg-green-500/5" />
        <StatCard icon="📦" label="New Content (7d)"  value={data ? fmtNum(data.newContentThisWeek) : null}
          accent="border-cyan-500/20 bg-cyan-500/5" />
        <StatCard icon="⚡" label="Active Users (7d)" value={data ? fmtNum(data.activeUsersThisWeek) : null}
          accent="border-purple-500/20 bg-purple-500/5" />
        <StatCard icon="⭐" label="Avg Rating"         value={data ? data.avgRating.toFixed(2) + ' / 5' : null}
          accent="border-amber-500/20 bg-amber-500/5" />
      </div>
    </>
  );
}

function ContentSection({ headers }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${API_URL}/api/admin/stats/content`, { headers })
      .then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const pieData = (data?.typeBreakdown || []).map(t => ({
    name: TYPE_LABELS[t.type] || t.type,
    value: t.count,
    color: TYPE_COLORS[t.type] || GREY,
  }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Section title="Content by Type">
          {loading ? <Skeleton h="h-52" /> : (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-shrink-0">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 w-full">
                {(data?.typeBreakdown || []).map(t => (
                  <div key={t.type} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[t.type] || GREY }} />
                    <span className="text-gray-400 text-xs flex-1">{TYPE_LABELS[t.type] || t.type}</span>
                    <span className="text-white text-xs font-semibold">{t.count}</span>
                    <span className="text-gray-600 text-xs w-8 text-right">{t.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        <Section title="By Type (Bar)">
          {loading ? <Skeleton h="h-52" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pieData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>

      <Section title="Top 10 Content by Ratings">
        <SortableTable
          loading={loading}
          defaultSort="rating_count"
          cols={[
            { key: 'title',        label: 'Title',       render: v => <span className="text-white font-medium truncate max-w-[180px] block">{v}</span> },
            { key: 'performer',    label: 'Performer',   render: v => <span className="text-gray-300">{v}</span> },
            { key: 'type',         label: 'Type',        render: v => <TypeBadge type={v} /> },
            { key: 'rating_count', label: 'Ratings',     render: v => <span className="text-cyan-400 font-semibold">{v}</span> },
            { key: 'avg_rating',   label: 'Avg Rating',  render: v => <RatingBar value={v} /> },
            { key: 'review_count', label: 'Reviews',     render: v => <span className="text-pink-400">{v}</span> },
          ]}
          rows={data?.topContent || []}
        />
      </Section>
    </>
  );
}

function UsersSection({ headers }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${API_URL}/api/admin/stats/users`, { headers })
      .then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon="👥" label="Total Users"        value={data ? fmtNum(data.totalUsers) : null} />
        <StatCard icon="📝" label="Avg Ratings / User" value={data ? data.avgRatingsPerUser.toFixed(1) : null} />
      </div>

      <Section title="Top 10 Most Active Users">
        <SortableTable
          loading={loading}
          defaultSort="rating_count"
          cols={[
            { key: 'username',     label: 'Username',        render: v => <span className="text-white font-semibold">@{v}</span> },
            { key: 'rating_count', label: 'Ratings',         render: v => <span className="text-cyan-400 font-semibold">{v}</span> },
            { key: 'review_count', label: 'Written Reviews', render: v => <span className="text-pink-400 font-semibold">{v}</span> },
          ]}
          rows={data?.topUsers || []}
        />
      </Section>
    </>
  );
}

function DJsSection({ headers }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${API_URL}/api/admin/stats/djs`, { headers })
      .then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon="🎧" label="Total DJs"     value={data ? fmtNum(data.totalDJs) : null} />
        <StatCard icon="📦" label="Avg Sets / DJ" value={data ? data.avgSetsPerDJ.toFixed(1) : null} />
      </div>

      <Section title="Top 10 DJs by Followers">
        <SortableTable
          loading={loading}
          defaultSort="follower_count"
          cols={[
            { key: 'name',           label: 'DJ Name',            render: v => <span className="text-white font-semibold">{v}</span> },
            { key: 'follower_count', label: 'Followers',          render: v => <span className="text-cyan-400 font-semibold">{v}</span> },
            { key: 'set_count',      label: 'Sets' },
            { key: 'total_ratings',  label: 'Ratings Received' },
            { key: 'avg_rating',     label: 'Avg Rating',         render: v => <RatingBar value={v} /> },
          ]}
          rows={data?.topDJs || []}
        />
      </Section>
    </>
  );
}

function ReviewsSection({ headers }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${API_URL}/api/admin/stats/reviews`, { headers })
      .then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const maxCount = Math.max(...((data?.ratingDistribution || []).map(r => r.count)), 1);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon="⭐" label="Total Ratings"  value={data ? fmtNum(data.totalRatings) : null} />
        <StatCard icon="✍️" label="Written Reviews" value={data ? fmtNum(data.totalReviews) : null} />
        <StatCard icon="📊" label="Avg Rating"      value={data ? data.avgRating.toFixed(2) : null} />
        <StatCard icon="❤️" label="Total Likes"     value={data ? fmtNum(data.totalLikes) : null} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Rating Distribution (Chart)">
          {loading ? <Skeleton h="h-52" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.ratingDistribution || []} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="score" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip formatter={v => [v, 'Ratings']} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={CYAN} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section title="Rating Distribution (Bars)">
          {loading ? <Skeleton h="h-52" /> : (
            <div className="space-y-2 pt-1">
              {(data?.ratingDistribution || []).map(r => (
                <div key={r.score} className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-8 text-right">{r.score}★</span>
                  <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(r.count / maxCount) * 100}%`, background: CYAN }} />
                  </div>
                  <span className="text-white text-xs font-semibold w-12 text-right tabular-nums">{r.count}</span>
                </div>
              ))}
              {data?.avgReviewLength > 0 && (
                <p className="text-gray-600 text-xs mt-4 pt-4 border-t border-white/[0.04]">
                  Avg written review length: {data.avgReviewLength} characters
                </p>
              )}
            </div>
          )}
        </Section>
      </div>
    </>
  );
}

function GrowthSection({ headers }) {
  const [days, setDays]     = useState(30);
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback((d) => {
    setLoading(true);
    axios.get(`${API_URL}/api/admin/stats/growth?days=${d}`, { headers })
      .then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  useEffect(() => { load(days); }, [days]); // eslint-disable-line

  const fmtDate = s => (s || '').slice(5);

  const merged = (() => {
    const map = {};
    const add = (arr, key) => (arr || []).forEach(r => {
      const d = fmtDate(r.date);
      map[d] = { ...map[d], date: d, [key]: r.count };
    });
    add(data?.users,   'users');
    add(data?.content, 'content');
    add(data?.ratings, 'ratings');
    return Object.values(map).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  })();

  const sumKey = key => (data?.[key] || []).reduce((s, r) => s + r.count, 0);

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        {GROWTH_OPTS.map(o => (
          <button key={o.days} onClick={() => setDays(o.days)}
            className={`px-4 py-1.5 text-xs font-semibold border transition-all duration-150 rounded-lg ${
              days === o.days
                ? 'border-[#00D9FF] text-[#00D9FF] bg-[#00D9FF]/10'
                : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-white'
            }`}>
            {o.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon="👥" label={`New Users (${days}d)`}   value={sumKey('users')}   />
        <StatCard icon="🎵" label={`New Content (${days}d)`} value={sumKey('content')} />
        <StatCard icon="⭐" label={`New Ratings (${days}d)`} value={sumKey('ratings')} />
      </div>

      <Section title="Growth Over Time (Combined)">
        {loading ? <Skeleton h="h-72" /> : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={merged} margin={{ top: 0, right: 16, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line type="monotone" dataKey="users"   name="New Users"   stroke={CYAN}  strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="content" name="New Content" stroke={PINK}  strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ratings" name="New Ratings" stroke={AMBER} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'User Growth',    key: 'users',   color: CYAN,  name: 'Users'   },
          { title: 'Content Growth', key: 'content', color: PINK,  name: 'Content' },
          { title: 'Rating Growth',  key: 'ratings', color: AMBER, name: 'Ratings' },
        ].map(({ title, key, color, name }) => (
          <Section key={key} title={title}>
            {loading ? <Skeleton h="h-32" /> : (
              <ResponsiveContainer width="100%" height={120}>
                <LineChart
                  data={(data?.[key] || []).map(r => ({ date: fmtDate(r.date), count: r.count }))}
                  margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="count" name={name} stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Section>
        ))}
      </div>
    </>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsDashboard() {
  const [tab, setTab] = useState('overview');
  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  return (
    <div>
      {/* Tab strip */}
      <div className="flex flex-wrap gap-1 mb-6 bg-[#0d0d0f] border border-white/[0.06] rounded-xl p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
              tab === t.id
                ? 'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30'
                : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
            }`}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewSection headers={headers} />}
      {tab === 'content'  && <ContentSection  headers={headers} />}
      {tab === 'users'    && <UsersSection    headers={headers} />}
      {tab === 'djs'      && <DJsSection      headers={headers} />}
      {tab === 'reviews'  && <ReviewsSection  headers={headers} />}
      {tab === 'growth'   && <GrowthSection   headers={headers} />}
    </div>
  );
}
