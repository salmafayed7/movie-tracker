import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Auth.css';

function getPasswordStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

export default function Auth() {
  const [tab, setTab] = useState('login');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ username: '', email: '', password: '', confirm: '' });

  const strength = getPasswordStrength(regData.password);

  const shakeForm = () => {
    if (formRef.current) {
      formRef.current.classList.remove('shake');
      void formRef.current.offsetWidth;
      formRef.current.classList.add('shake');
    }
  };

  const validateLogin = () => {
    const e = {};
    if (!loginData.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) e.email = 'Enter a valid email';
    if (!loginData.password) e.password = 'Password is required';
    return e;
  };

  const validateRegister = () => {
    const e = {};
    if (!regData.username) e.username = 'Username is required';
    if (!regData.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(regData.email)) e.email = 'Enter a valid email';
    if (!regData.password) e.password = 'Password is required';
    else if (regData.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!regData.confirm) e.confirm = 'Please confirm your password';
    else if (regData.confirm !== regData.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validateLogin();
    if (Object.keys(errs).length) { setErrors(errs); shakeForm(); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', loginData);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      shakeForm();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validateRegister();
    if (Object.keys(errs).length) { setErrors(errs); shakeForm(); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: regData.username,
        email: regData.email,
        password: regData.password,
      });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      shakeForm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <span className="auth-brand__icon">🎬</span>
          <h1 className="auth-brand__name">CineTrack</h1>
          <p className="auth-brand__sub">Your personal movie companion</p>
        </div>

        <div className="auth-card dark-card" ref={formRef}>
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError(''); setErrors({}); }}
            >
              Login
            </button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setError(''); setErrors({}); }}
            >
              Register
            </button>
            <div className={`auth-tab-indicator ${tab === 'register' ? 'right' : 'left'}`} />
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="auth-forms-wrapper">
            <div className={`auth-form-slide ${tab === 'login' ? 'visible' : 'hidden'}`}>
              <form onSubmit={handleLogin} noValidate>
                <div className="form-group-auth">
                  <label>Email</label>
                  <input
                    type="email"
                    className={`form-control-dark ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group-auth">
                  <label>Password</label>
                  <div className="password-wrap">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className={`form-control-dark ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <button type="submit" className="btn btn-pink w-100 auth-submit" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm" /> : 'Sign In'}
                </button>
              </form>
            </div>

            <div className={`auth-form-slide ${tab === 'register' ? 'visible' : 'hidden'}`}>
              <form onSubmit={handleRegister} noValidate>
                <div className="form-group-auth">
                  <label>Username</label>
                  <input
                    type="text"
                    className={`form-control-dark ${errors.username ? 'is-invalid' : ''}`}
                    placeholder="Choose a username"
                    value={regData.username}
                    onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                  />
                  {errors.username && <span className="field-error">{errors.username}</span>}
                </div>

                <div className="form-group-auth">
                  <label>Email</label>
                  <input
                    type="email"
                    className={`form-control-dark ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="you@example.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group-auth">
                  <label>Password</label>
                  <div className="password-wrap">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className={`form-control-dark ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Min. 6 characters"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    />
                    <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}

                  {regData.password && (
                    <div className="strength-bar-wrap">
                      <div className="strength-bar">
                        {[1,2,3,4,5].map((i) => (
                          <div
                            key={i}
                            className="strength-segment"
                            style={{ background: i <= strength ? strengthColor[strength] : '#2a2a3d' }}
                          />
                        ))}
                      </div>
                      <span className="strength-label" style={{ color: strengthColor[strength] }}>
                        {strengthLabel[strength]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group-auth">
                  <label>Confirm Password</label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={`form-control-dark ${errors.confirm ? 'is-invalid' : ''}`}
                    placeholder="Repeat your password"
                    value={regData.confirm}
                    onChange={(e) => setRegData({ ...regData, confirm: e.target.value })}
                  />
                  {errors.confirm && <span className="field-error">{errors.confirm}</span>}
                </div>

                <button type="submit" className="btn btn-pink w-100 auth-submit" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm" /> : 'Create Account'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
