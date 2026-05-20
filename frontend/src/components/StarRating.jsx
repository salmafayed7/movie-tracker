import React, { useState } from 'react';
import './StarRating.css';

export default function StarRating({ value, onChange, readOnly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);

  const stars = [1, 2, 3, 4, 5];
  const display = hovered || value || 0;

  return (
    <div className={`star-rating star-rating--${size}`}>
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${display >= star ? 'star--filled' : 'star--empty'} ${!readOnly ? 'star--clickable' : ''}`}
          onClick={() => !readOnly && onChange && onChange(star === value ? star - 1 : star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          role={!readOnly ? 'button' : undefined}
          aria-label={`${star} star`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
