import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import './MovieDetails.css';

function getInitials(title) {
  return title.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const statusConfig = {
  watchlist: { label: 'Watchlist', color: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
  watched:   { label: 'Watched',   color: '#10b981', glow: 'rgba(16,185,129,0.4)' },
};

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    api.get('/movies')
      .then(({ data }) => {
        const found = data.find((m) => m.id === parseInt(id));
        if (!found) navigate('/');
        else setMovie(found);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this movie from your watchlist?')) return;
    setDeleting(true);
    try {
      await api.delete(`/movies/${id}`);
      navigate('/');
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-warning" />
      </div>
    );
  }

  if (!movie) return null;

  const sc = statusConfig[movie.status] || statusConfig.watchlist;

  return (
    <div className="details-page">
      {/* Banner */}
      <div className="details-banner">
        {movie.poster_url && !imgError ? (
          <img className="details-banner__bg" src={movie.poster_url} alt="" onError={() => setImgError(true)} />
        ) : (
          <div className="details-banner__placeholder" />
        )}
        <div className="details-banner__overlay" />

        <div className="container details-banner__content">
          <button className="btn btn-outline-pink btn-sm details-back" onClick={() => navigate('/')}>
            ← Back
          </button>

          <div className="details-main">
            <div className="details-poster">
              {movie.poster_url && !imgError ? (
                <img src={movie.poster_url} alt={movie.title} onError={() => setImgError(true)} />
              ) : (
                <div className="details-poster__placeholder">
                  <span>{getInitials(movie.title)}</span>
                </div>
              )}
            </div>

            <div className="details-info">
              <h1 className="details-title">{movie.title}</h1>
              <div className="details-meta">
                <span className="details-genre">{movie.genre}</span>
                <span
                  className="details-status-badge"
                  style={{
                    background: `${sc.color}22`,
                    border: `1px solid ${sc.color}`,
                    color: sc.color,
                    boxShadow: `0 0 12px ${sc.glow}`,
                  }}
                >
                  {sc.label}
                </span>
              </div>

              {movie.rating && (
                <div className="details-rating">
                  <StarRating value={movie.rating} readOnly size="lg" />
                  <span className="details-rating-num">{movie.rating}/5</span>
                </div>
              )}

              {movie.description && (
                <p className="details-description">{movie.description}</p>
              )}

              <div className="details-actions">
                <button className="btn btn-pink" onClick={() => navigate(`/edit/${movie.id}`)}>
                  ✏️ Edit
                </button>
                <button className="btn btn-outline-pink" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <span className="spinner-border spinner-border-sm" /> : '🗑️ Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {movie.notes && (
        <div className="container">
          <div className="details-notes">
            <div className="sticky-note">
              <h4>📝 My Notes</h4>
              <p>{movie.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Date */}
      <div className="container">
        <p className="details-date">
          Added on {new Date(movie.date_added).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}
