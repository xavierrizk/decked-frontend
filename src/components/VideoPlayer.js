import React, { useEffect, useRef } from 'react';

export default function VideoPlayer({ url, open, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!open && videoRef.current) videoRef.current.pause();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !url) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-black shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-white/20 transition-colors text-sm">
          ✕
        </button>
        <video
          ref={videoRef}
          src={url}
          controls
          autoPlay
          playsInline
          className="w-full max-h-[70vh] object-contain"
        />
      </div>
    </div>
  );
}
