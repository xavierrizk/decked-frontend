import React, { useState } from 'react';

/**
 * Single star SVG — supports filled, half, empty via clipPath
 */
function Star({ fill = 'empty', size = 36, color = '#facc15' }) {
  const id = `half-${Math.random().toString(36).slice(2)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {fill === 'half' && (
        <defs>
          <clipPath id={id}>
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
      )}
      {/* Empty outline */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={fill === 'full' ? color : '#1f1f2e'}
        stroke={fill === 'empty' ? '#374151' : 'none'}
        strokeWidth="1.5"
      />
      {/* Half overlay */}
      {fill === 'half' && (
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={color}
          clipPath={`url(#${id})`}
        />
      )}
    </svg>
  );
}

/**
 * Interactive star rating — click once = full, click same star again = half
 */
export function StarRatingInput({ value, onChange, size = 36 }) {
  const [hovered, setHovered] = useState(null);
  const displayed = hovered !== null ? hovered : value;

  const handleClick = (star) => {
    onChange(value === star ? star - 0.5 : star);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = displayed >= star ? 'full' : displayed >= star - 0.5 ? 'half' : 'empty';
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleClick(star)}
            className="transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none"
            style={{ filter: fill === 'full' ? 'drop-shadow(0 0 6px rgba(250,204,21,0.5))' : 'none' }}
            aria-label={`Rate ${star}`}
          >
            <Star fill={fill} size={size} />
          </button>
        );
      })}
      <span className="ml-2 text-white font-bold text-lg">
        {value}
        <span className="text-gray-600 font-normal text-sm">/5</span>
      </span>
    </div>
  );
}

/**
 * Read-only star display — supports half stars
 */
export function StarDisplay({ value, size = 18 }) {
  const num = parseFloat(value) || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = num >= star ? 'full' : num >= star - 0.5 ? 'half' : 'empty';
        const color = fill === 'half' ? '#4ade80' : '#facc15';
        return <Star key={star} fill={fill} size={size} color={color} />;
      })}
    </div>
  );
}

// Default export for backwards compat
export default StarRatingInput;
