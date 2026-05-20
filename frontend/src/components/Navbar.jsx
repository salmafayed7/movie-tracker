import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar-dark-custom sticky-top">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand-custom">
            <span className="brand-icon">🎬</span>
            <span className="brand-text">CineTrack</span>
          </Link>

          <button className="navbar-toggler-custom" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>

          <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <Link
              to="/"
              className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              My Watchlist
            </Link>
            <Link
              to="/statistics"
              className={`nav-link-custom ${isActive('/statistics') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Statistics
            </Link>
            <Link
              to="/add"
              className="btn btn-pink btn-sm nav-add-btn"
              onClick={() => setMenuOpen(false)}
            >
              + Add Movie
            </Link>

            <div className="nav-user">
              <span className="user-greeting">Hey, <strong>{user?.username}</strong></span>
              <button className="btn btn-outline-pink btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
