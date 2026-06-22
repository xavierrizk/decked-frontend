import React, { useRef, useState } from 'react';

const MAX_SIZE_MB = 500;
const MAX_DURATION_S = 30;
const ALLOWED = ['video/mp4', 'video/quicktime', 'video/webm'];

export default function VideoUploader({ onFileSelected, onClear, disabled }) {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const [preview, setPreview]   = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError]       = useState('');
  const [checking, setChecking] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    setError('');

    if (!ALLOWED.includes(file.type)) {
      setError('Only MP4, MOV, and WebM videos are supported.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Video must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    const url = URL.createObjectURL(file);
    setChecking(true);

    const vid = document.createElement('video');
    vid.preload = 'metadata';
    vid.src = url;
    vid.onloadedmetadata = () => {
      if (vid.duration > MAX_DURATION_S) {
        URL.revokeObjectURL(url);
        setChecking(false);
        setError(`Video must be ${MAX_DURATION_S} seconds or shorter (yours is ${Math.round(vid.duration)}s).`);
        onFileSelected(null);
        return;
      }
      setPreview(url);
      setFileName(file.name);
      setChecking(false);
      onFileSelected(file);
    };
    vid.onerror = () => {
      setChecking(false);
      setError('Could not read video file.');
      URL.revokeObjectURL(url);
    };
  };

  const handleChange = (e) => handleFile(e.target.files?.[0]);

  const handleClear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onClear?.();
    onFileSelected(null);
  };

  return (
    <div>
      {!preview ? (
        <div
          onClick={() => !disabled && !checking && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer
            ${disabled ? 'opacity-40 cursor-not-allowed border-white/10' : 'border-white/15 hover:border-[#00D9FF]/50 hover:bg-[#00D9FF]/5'}`}>
          <span className="text-2xl">{checking ? '⏳' : '🎬'}</span>
          <p className="text-sm font-medium text-gray-300">
            {checking ? 'Checking video…' : 'Tap to add a video clip'}
          </p>
          <p className="text-[11px] text-gray-600">MP4 · MOV · WebM · Max {MAX_DURATION_S}s · Max {MAX_SIZE_MB}MB</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
          <video
            ref={videoRef}
            src={preview}
            controls
            playsInline
            className="w-full max-h-56 object-contain"
          />
          <div className="flex items-center justify-between px-3 py-2 bg-[#111114]">
            <span className="text-gray-400 text-xs truncate max-w-[200px]">{fileName}</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1 flex-shrink-0">
              ✕ Remove
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input — accept="video/*" opens camera roll on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        capture={false}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {error && (
        <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}
