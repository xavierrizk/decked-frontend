import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function getYouTubeId(url) {
  if (!url) return null;
  let m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  m = url.match(/youtube\.com\/(?:embed|shorts)\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  return null;
}

const PLACEHOLDER_ICON = {
  dj_set:       '🎧',
  concert:      '🎤',
  live_band:    '🎸',
  festival_set: '⛺',
  rave:         '💿',
  other:        '🎵',
};

function YouTubeThumb({ videoId, alt, className }) {
  const [src, setSrc] = useState(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)}
    />
  );
}

export default function SetThumbnail({ setId, youtubeUrl, performanceType, fallbackImage, alt, className }) {
  const [videos, setVideos] = useState([]);
  const [index, setIndex]   = useState(0);
  const ytId = getYouTubeId(youtubeUrl);

  useEffect(() => {
    if (ytId) return;
    let cancelled = false;
    axios.get(`${API_URL}/api/sets/${setId}/thumbnail-videos`)
      .then(r => { if (!cancelled) setVideos(r.data.thumbnail_videos || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [setId, ytId]);

  useEffect(() => {
    if (videos.length < 2) return;
    const interval = setInterval(() => setIndex(i => (i + 1) % videos.length), 3500);
    return () => clearInterval(interval);
  }, [videos]);

  if (ytId) {
    return <YouTubeThumb videoId={ytId} alt={alt} className={className} />;
  }

  if (videos.length > 0) {
    return (
      <div className="relative w-full h-full">
        <video
          key={videos[index]}
          src={videos[index]}
          autoPlay
          muted
          loop
          playsInline
          className={className}
        />
        {videos.length > 1 && (
          <span className="absolute top-1.5 right-1.5 bg-black/70 text-[#00D9FF] text-[9px] font-bold px-1.5 py-0.5 rounded">
            {index + 1} / {videos.length}
          </span>
        )}
      </div>
    );
  }

  if (fallbackImage) {
    return <img src={fallbackImage} alt={alt} className={className} />;
  }

  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-3xl opacity-40`}>
      {PLACEHOLDER_ICON[performanceType] || '🎵'}
    </div>
  );
}
