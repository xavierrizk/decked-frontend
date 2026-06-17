import React from 'react';
import { Link } from 'react-router-dom';
import { relativeTime } from './helpers';

const STARS = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(Math.max(0, 5 - Math.round(n)));

function ActivityRow({ item }) {
  let icon, content;

  if (item.type === 'rating') {
    icon = '⭐';
    content = (
      <span>
        {item.has_review ? 'Reviewed' : 'Rated'}{' '}
        <Link to={`/set/${item.set_id}`} className="text-white hover:text-[#00D9FF] font-medium transition-colors">
          {item.set_title}
        </Link>
        {item.dj_name && <span className="text-gray-600"> by {item.dj_name}</span>}{' '}
        <span style={{ color: '#00D9FF' }}>{STARS(item.rating)}</span>
      </span>
    );
  } else if (item.type === 'follow') {
    icon = '🎧';
    content = (
      <span>
        Followed{' '}
        <Link to={`/artist/${item.dj_id}`} className="text-white hover:text-[#00D9FF] font-medium transition-colors">
          {item.dj_name}
        </Link>
      </span>
    );
  } else {
    icon = '🤝';
    content = (
      <span>
        Became friends with{' '}
        <Link to={`/profile/${item.friend_id}`} className="text-white hover:text-[#00D9FF] font-medium transition-colors">
          {item.friend_name}
        </Link>
      </span>
    );
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/[0.05]">
      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0 text-sm text-gray-400">{content}</div>
      <span className="text-gray-600 text-xs flex-shrink-0 whitespace-nowrap">{relativeTime(item.ts)}</span>
    </div>
  );
}

export default function ActivityFeed({ activity, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-white/[0.05]" />
            <div className="h-3 flex-1 bg-white/[0.04]" />
          </div>
        ))}
      </div>
    );
  }

  if (!activity.length) {
    return (
      <div className="text-center py-16 border border-white/[0.05]">
        <p className="text-3xl mb-2">📡</p>
        <p className="text-gray-500">No activity yet.</p>
      </div>
    );
  }

  return (
    <div>
      {activity.map((item, i) => <ActivityRow key={i} item={item} />)}
    </div>
  );
}
