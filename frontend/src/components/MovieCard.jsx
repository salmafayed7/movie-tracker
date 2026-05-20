import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import './MovieCard.css';

function getInitials(title) {
  return title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const statusClass = {
    watchlist: 'badge-watchlist',
    watched:   'badge-watched',
  }[movie.status] || 'badge-watchlist';

  const statusLabel = {
    watchlist: 'Watchlist',
    watched:   'Watched',
  }[movie.status];

  const showPlaceholder = !movie.poster_url || imgError;

  return (
    <div className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
      <div className="movie-card__poster">
        {showPlaceholder ? (
          <div className="movie-card__placeholder">
            <span>{getInitials(movie.title)}</span>
          </div>
        ) : (
          <img
            src={movie.poster_url}
            alt={movie.title}
            onError={() => setImgError(true)}
          />
        )}
        <div className="movie-card__overlay" />
        <span className={`movie-card__status badge ${statusClass}`}>{statusLabel}</span>
      </div>

      <div className="movie-card__body">
        <h3 className="movie-card__title">{movie.title}</h3>
        <span className="movie-card__genre badge">{movie.genre}</span>
        {movie.rating && (
          <div className="movie-card__rating">
            <StarRating value={movie.rating} readOnly size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
