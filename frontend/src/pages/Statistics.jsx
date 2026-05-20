import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import './Statistics.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const chartDefaults = {
  plugins: {
    legend: {
      labels: { color: '#ffffff', font: { family: 'Inter' } }
    }
  }
};

export default function Statistics() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/movies')
      .then(({ data }) => setMovies(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-warning" />
      </div>
    );
  }

  const watched   = movies.filter((m) => m.status === 'watched').length;
  const watchlist = movies.filter((m) => m.status === 'watchlist').length;

  const genreMap = {};
  movies.forEach((m) => {
    genreMap[m.genre] = (genreMap[m.genre] || 0) + 1;
  });
  const genres = Object.keys(genreMap);
  const genreCounts = genres.map((g) => genreMap[g]);

  const topRated = movies.filter((m) => m.rating >= 4).sort((a, b) => b.rating - a.rating);

  const doughnutData = {
    labels: ['Watched', 'Watchlist'],
    datasets: [{
      data: [watched, watchlist],
      backgroundColor: ['#097652', '#3b82f6'],
      borderColor: ['#0a0a0f'],
      borderWidth: 1,
      hoverOffset: 8,
    }]
  };

  const barData = {
    labels: genres,
    datasets: [{
      label: 'Movies',
      data: genreCounts,
      backgroundColor: '#760550',
      borderColor: '#460330',
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  const barOptions = {
    ...chartDefaults,
    responsive: true,
    scales: {
      x: {
        ticks: { color: '#ffffff', font: { family: 'Inter' } },
        grid: { color: 'transparent' },
        border: { display: false },
      },
      y: {
        ticks: { color: '#ffffff', stepSize: 1, font: { family: 'Inter' } },
        grid: { color: 'transparent' },
        border: { display: false },
        beginAtZero: true,
      }
    }
  };

  return (
    <div className="stats-page page-wrapper">
      <div className="container">
        <h1 className="stats-heading heading-font">📊 My Statistics</h1>
        <p className="stats-sub">An overview of your movie collection</p>

        {movies.length === 0 ? (
          <div className="stats-empty">
            <div style={{ fontSize: '3rem' }}>🎬</div>
            <h3>No movies yet</h3>
            <p>Add movies to your watchlist to see statistics.</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="stats-summary">
              <div className="stats-card dark-card">
                <span className="stats-card__num">{movies.length}</span>
                <span className="stats-card__label">Total</span>
              </div>
              <div className="stats-card dark-card watched">
                <span className="stats-card__num">{watched}</span>
                <span className="stats-card__label">Watched</span>
              </div>
              <div className="stats-card dark-card wl">
                <span className="stats-card__num">{watchlist}</span>
                <span className="stats-card__label">Watchlist</span>
              </div>
            </div>

            {/* Charts */}
            <div className="stats-charts">
              <div className="dark-card stats-chart-box">
                <h3 className="stats-chart-title">Status Breakdown</h3>
                <div className="doughnut-wrap">
                  <Doughnut data={doughnutData} options={{ ...chartDefaults, cutout: '65%' }} />
                </div>
              </div>

              <div className="dark-card stats-chart-box">
                <h3 className="stats-chart-title">Movies by Genre</h3>
                {genres.length === 0 ? (
                  <p style={{ color: '#ffffff', textAlign: 'center', padding: '2rem' }}>No genre data</p>
                ) : (
                  <Bar data={barData} options={barOptions} />
                )}
              </div>
            </div>

            {/* Top rated */}
            {topRated.length > 0 && (
              <div className="stats-top-rated">
                <h3 className="stats-chart-title">⭐ Top Rated</h3>
                <div className="top-rated-scroll">
                  {topRated.map((movie) => (
                    <div key={movie.id} className="top-rated-card dark-card">
                      <div className="top-rated-poster">
                        {movie.poster_url ? (
                          <img src={movie.poster_url} alt={movie.title} />
                        ) : (
                          <div className="top-rated-placeholder">
                            <span>{movie.title.slice(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <div className="top-rated-info">
                        <p className="top-rated-title">{movie.title}</p>
                        <StarRating value={movie.rating} readOnly size="sm" />
                        <span className="top-rated-genre">{movie.genre}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
