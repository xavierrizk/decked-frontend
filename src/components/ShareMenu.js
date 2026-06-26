import React, { useState, useRef, useEffect } from 'react';

/**
 * ShareMenu — floating share panel
 * Props:
 *   url       — full URL to share (defaults to window.location.href)
 *   text      — pre-filled share text for social platforms
 *   label     — button label (default: icon only)
 *   className — extra classes on trigger button
 */
export default function ShareMenu({ url, text, label, className = '' }) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const shareUrl  = url  || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = text || shareUrl;

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.addEventListener('mousedown', onClick);
    }
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [open]);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); }
    catch { /* fallback */ const el = document.createElement('textarea'); el.value = shareUrl; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1200);
  };

  const openWindow = (href) => { window.open(href, '_blank', 'noopener,noreferrer'); setOpen(false); };

  const tweetUrl   = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const waUrl      = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const fbUrl      = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center gap-1.5 w-9 h-9 rounded-lg border border-white/[0.07] text-gray-500 hover:text-white hover:border-white/20 transition-all"
        title="Share"
        aria-label="Share"
      >
        {label || (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 z-50 w-52 rounded-xl border border-white/[0.10] bg-[#151520] shadow-xl overflow-hidden">
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/[0.05] transition-colors"
          >
            {copied ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-[#00D9FF] font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                <span className="text-gray-300">Copy link</span>
              </>
            )}
          </button>

          <div className="h-px bg-white/[0.06]" />

          <button onClick={() => openWindow(tweetUrl)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/[0.05] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-gray-300">Share on X</span>
          </button>

          <button onClick={() => openWindow(waUrl)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/[0.05] transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-gray-300">WhatsApp</span>
          </button>

          <button onClick={() => openWindow(fbUrl)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/[0.05] transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-gray-300">Facebook</span>
          </button>
        </div>
      )}
    </div>
  );
}
