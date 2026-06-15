import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ProfileReviewCard from './ProfileReviewCard';

const PAGE = 5;

export default function ReviewSection({ heading, reviews, loading, onOpen, empty }) {
  const [visible, setVisible] = useState(PAGE);
  const sentinelRef = useRef(null);

  useEffect(() => { setVisible(PAGE); }, [reviews]);

  const loadMore = useCallback(() => {
    setVisible(v => (v < reviews.length ? v + PAGE : v));
  }, [reviews.length]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [loadMore]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="text-center py-16 border border-white/[0.05]">
        <p className="text-3xl mb-2">{empty.icon}</p>
        <p className="text-gray-500">{empty.text}</p>
        {empty.cta && (
          <Link to={empty.cta.to} className="inline-block mt-3 text-sm font-medium transition-colors" style={{ color: '#00D9FF' }}>
            {empty.cta.label} →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      {heading && (
        <p className="section-label mb-4">{heading}</p>
      )}
      <div className="space-y-4">
        {reviews.slice(0, visible).map(r => (
          <ProfileReviewCard key={r.id} review={r} onOpen={onOpen} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex bg-[#0f0f1a] border border-white/[0.06] overflow-hidden animate-pulse">
      <div className="w-[200px] h-32 bg-white/[0.04] flex-shrink-0" />
      <div className="flex-1 p-4 space-y-2">
        <div className="h-4 w-1/2 bg-white/[0.05]" />
        <div className="h-3 w-1/3 bg-white/[0.04]" />
        <div className="h-3 w-full bg-white/[0.03] mt-3" />
        <div className="h-3 w-2/3 bg-white/[0.03]" />
      </div>
    </div>
  );
}
