import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Animation', 'Documentary', 'Fantasy', 'Mystery', 'Crime', 'Musical', 'Other'];

function AnimatedNumber({ target }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}</span>;
}

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/movies')
      .then(({ data }) => setMovies(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = movies.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genre === 'All' || m.genre === genre;
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchGenre && matchStatus;
  });

  const total     = movies.length;
  const watched   = movies.filter((m) => m.status === 'watched').length;
  const watchlist = movies.filter((m) => m.status === 'watchlist').length;

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero__bg" />
        <div className="container home-hero__content">
          <h1 className="home-hero__title">Welcome back, {user?.username}</h1>
          <p className="home-hero__sub">Track the films you love. Discover what to watch next.</p>

          <div className="home-stats">
            <div className="stat-pill">
              <span className="stat-num"><AnimatedNumber target={total} /></span>
              <span className="stat-label">Total Movies</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num watched-num"><AnimatedNumber target={watched} /></span>
              <span className="stat-label">Watched</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num watchlist-num"><AnimatedNumber target={watchlist} /></span>
              <span className="stat-label">Watchlist</span>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className="container">
        <div className="home-controls">
          <input
            type="text"
            className="form-control-dark home-search"
            placeholder="🔍  Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="status-filter-btns">
            <button
              className={`status-btn status-btn--watched${statusFilter === 'watched' ? ' active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'watched' ? 'all' : 'watched')}
            >Watched</button>
            <button
              className={`status-btn status-btn--watchlist${statusFilter === 'watchlist' ? ' active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'watchlist' ? 'all' : 'watchlist')}
            >Watchlist</button>
          </div>
          <select
            className="form-control-dark home-genre-select"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            {GENRES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="home-loading">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty__icon">🎞️</div>
            <h3>No movies found</h3>
            <p>{movies.length === 0 ? 'Start building your watchlist!' : 'Try a different search or genre.'}</p>
            {movies.length === 0 && (
              <button className="btn btn-pink mt-3" onClick={() => navigate('/add')}>
                + Add Your First Movie
              </button>
            )}
          </div>
        ) : (
          <div className="movie-grid">
            {filtered.map((movie, i) => (
              <div key={movie.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
