import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      background: '#0d0d14',
      borderTop: '1px solid #2a2a3d',
      padding: '1.5rem 0',
      marginTop: 'auto',
      textAlign: 'center',
      color: '#a0a0b8',
      fontSize: '0.875rem'
    }}>
      <div className="container">
        <span style={{ color: '#ffffff', fontFamily: 'Bebas Neue', fontSize: '1.1rem', letterSpacing: '0.08em' }}>
          CineTrack
        </span>
        <span style={{ margin: '0 0.5rem' }}>·</span>
        Track every movie you love
        <span style={{ margin: '0 0.5rem' }}>·</span>
        &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}
