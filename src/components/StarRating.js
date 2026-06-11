import React, { useState } from 'react';

/**
 * StarRating — click once = whole star, click same star again = half star
 * value: number (1–5, supports .5 increments)
 * onChange: (value) => void
 */
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(null); // full star index hovered

  const handleClick = (starIndex) => {
    const full = starIndex;        // e.g. 4
    const half = starIndex - 0.5; // e.g. 3.5
    if (value === full) {
      // already selected this full star → toggle to half
      onChange(half);
    } else {
      onChange(full);
    }
  };

  const displayed = hovered !== null ? hovered : value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayed >= star;
        const half   = !filled && displayed >= star - 0.5;
        return (
          <button
            key={star}
            type="button"
            className="star-btn"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleClick(star)}
            aria-label={`Rate ${star}`}
          >
            {filled ? (
              <span className="text-4xl text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]">★</span>
            ) : half ? (
              <span className="text-4xl" style={{ background: 'linear-gradient(90deg,#facc15 50%,#333 50%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>★</span>
            ) : (
              <span className="text-4xl text-gray-700">★</span>
            )}
          </button>
        );
      })}
      <span className="ml-3 text-white font-bold text-xl">{value}<span className="text-gray-500 text-base font-normal">/5</span></span>
    </div>
  );
}

export default StarRating;
