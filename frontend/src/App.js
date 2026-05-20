import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import AddEditMovie from './pages/AddEditMovie';
import Auth from './pages/Auth';
import Statistics from './pages/Statistics';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { token } = useAuth();
  return (
    <>
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/movie/:id" element={<ProtectedRoute><MovieDetails /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><AddEditMovie /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><AddEditMovie /></ProtectedRoute>} />
        <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {token && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
