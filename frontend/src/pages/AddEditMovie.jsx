import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import './AddEditMovie.css';

const GENRES = ['Action','Comedy','Drama','Horror','Sci-Fi','Thriller','Romance','Animation','Documentary','Fantasy','Mystery','Crime','Musical', 'Other'];
const STATUSES = [
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'watched',   label: 'Watched' },
];

function getInitials(title) {
  if (!title) return '?';
  return title.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function AddEditMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const formRef = useRef(null);

  const [form, setForm] = useState({
    title: '', genre: '', poster_url: '', description: '',
    status: 'watchlist', rating: 0, notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [posterError, setPosterError] = useState(false);
  const [fetchingPoster, setFetchingPoster] = useState(false);
  const [posterAutoFetched, setPosterAutoFetched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [fillLoading, setFillLoading] = useState(false);
  const debounceRef = useRef(null);
  const titleWrapperRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    api.get('/movies')
      .then(({ data }) => {
        const movie = data.find((m) => m.id === parseInt(id));
        if (!movie) { navigate('/'); return; }
        setForm({
          title: movie.title || '',
          genre: movie.genre || '',
          poster_url: movie.poster_url || '',
          description: movie.description || '',
          status: movie.status || 'watchlist',
          rating: movie.rating || 0,
          notes: movie.notes || '',
        });
      })
      .catch(() => navigate('/'))
      .finally(() => setFetchLoading(false));
  }, [id, isEdit, navigate]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.genre) e.genre = 'Genre is required';
    if (!form.status) e.status = 'Status is required';
    if (!form.rating && form.status === 'watched') e.rating = 'Rating is required';
    return e;
  };

  const shakeForm = () => {
    if (formRef.current) {
      formRef.current.classList.remove('shake');
      void formRef.current.offsetWidth;
      formRef.current.classList.add('shake');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); shakeForm(); return; }
    setErrors({});
    setSubmitError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/movies/${id}`, form);
      } else {
        await api.post('/movies', form);
      }
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong.';
      setSubmitError(msg);
      shakeForm();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [form.description]);

  useEffect(() => {
    const handler = (e) => {
      if (titleWrapperRef.current && !titleWrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setPosterAutoFetched(false);
    clearTimeout(debounceRef.current);
    if (value === '') {
      setForm(f => ({ ...f, title: '', description: '', poster_url: '', genre: '' }));
      setPosterError(false);
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setForm(f => ({ ...f, title: value }));
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await api.get('/movies/search-omdb', { params: { query: value.trim() } });
        setSuggestions(data.results || []);
        setShowDropdown((data.results || []).length > 0);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  };

  const handleSuggestionSelect = async (suggestion) => {
    setShowDropdown(false);
    setSuggestions([]);
    setFillLoading(true);
    setForm(f => ({ ...f, title: suggestion.Title }));
    try {
      const { data } = await api.get('/movies/omdb-detail', { params: { imdbID: suggestion.imdbID } });
      setForm(f => ({
        ...f,
        title:       data.title      || f.title,
        description: data.plot       || f.description,
        poster_url:  data.poster_url || f.poster_url,
        genre:       data.genre      || f.genre,
      }));
      if (data.poster_url) { setPosterError(false); setPosterAutoFetched(true); }
    } catch { /* silent */ }
    finally { setFillLoading(false); }
  };

  const handleTitleBlur = async () => {
    if (!form.title.trim() || form.poster_url || fillLoading) return;
    setFetchingPoster(true);
    try {
      const { data } = await api.get('/movies/search-poster', {
        params: { title: form.title.trim() },
      });
      if (data.poster_url) {
        setForm((f) => ({ ...f, poster_url: data.poster_url }));
        setPosterError(false);
        setPosterAutoFetched(true);
      }
    } catch { /* silent */ }
    finally { setFetchingPoster(false); }
  };

  if (fetchLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-warning" />
      </div>
    );
  }

  return (
    <div className="addedit-page page-wrapper">
      <div className="container">
        <div className="addedit-grid">
          {/* Form card */}
          <div className="addedit-form-col">
            <div className="dark-card addedit-card" ref={formRef}>
              <h2 className="addedit-title heading-font">
                {isEdit ? '✏️ Edit Movie' : '🎬 Add Movie'}
              </h2>

              <form onSubmit={handleSubmit} noValidate>
                {/* Title */}
                <div className="form-group-ae" ref={titleWrapperRef}>
                  <label>
                    Title <span className="required">*</span>
                    {(searchLoading || fillLoading) && <span className="omdb-spinner" />}
                  </label>
                  <input
                    type="text"
                    className={`form-control-dark ${errors.title ? 'is-invalid' : ''}`}
                    placeholder="Movie title"
                    value={form.title}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                  />
                  {showDropdown && (
                    <ul className="omdb-suggestions">
                      {suggestions.map((s) => (
                        <li
                          key={s.imdbID}
                          className="omdb-suggestions__item"
                          onMouseDown={() => handleSuggestionSelect(s)}
                        >
                          {s.Poster && s.Poster !== 'N/A' && (
                            <img src={s.Poster} alt="" className="omdb-suggestions__thumb" />
                          )}
                          <span className="omdb-suggestions__text">
                            <strong>{s.Title}</strong>
                            <em>{s.Year}</em>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.title && <span className="field-error">{errors.title}</span>}
                </div>

                {/* Genre */}
                <div className="form-group-ae">
                  <label>Genre <span className="required">*</span></label>
                  <select
                    className={`form-control-dark ${errors.genre ? 'is-invalid' : ''}`}
                    value={form.genre}
                    onChange={set('genre')}
                  >
                    <option value="">Select genre...</option>
                    {GENRES.map((g) => <option key={g}>{g}</option>)}
                  </select>
                  {errors.genre && <span className="field-error">{errors.genre}</span>}
                </div>

                {/* Status */}
                <div className="form-group-ae">
                  <label>Status <span className="required">*</span></label>
                  <select
                    className={`form-control-dark ${errors.status ? 'is-invalid' : ''}`}
                    value={form.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setForm(f => ({ ...f, status: newStatus, rating: newStatus !== 'watched' ? 0 : f.rating }));
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {errors.status && <span className="field-error">{errors.status}</span>}
                </div>

                {/* Rating — only shown when watched */}
                {form.status === 'watched' && (
                  <div className="form-group-ae">
                    <label>Rating</label>
                    <div>
                      <StarRating
                        value={form.rating}
                        onChange={(val) => setForm(f => ({ ...f, rating: val }))}
                        size="xl"
                      />
                    </div>
                    {errors.rating && <span className="field-error">{errors.rating}</span>}
                  </div>
                )}

                {/* Poster URL */}
                <div className="form-group-ae">
                  <label>Poster URL</label>
                  <input
                    type="url"
                    className="form-control-dark"
                    placeholder="https://example.com/poster.jpg"
                    value={form.poster_url}
                    onChange={(e) => { set('poster_url')(e); setPosterError(false); setPosterAutoFetched(false); }}
                  />
                  {posterAutoFetched && (
                    <span style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '4px', display: 'block' }}>
                      ✓ Poster auto-fetched
                    </span>
                  )}
                  {fetchingPoster && (
                    <span style={{ fontSize: '0.78rem', color: '#a0a0b8', marginTop: '4px', display: 'block' }}>
                      Searching for poster…
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="form-group-ae">
                  <label>Description</label>
                  <textarea
                    ref={descriptionRef}
                    className="form-control-dark"
                    rows={3}
                    placeholder="Brief plot summary..."
                    value={form.description}
                    onChange={set('description')}
                  />
                </div>

                {/* Notes */}
                <div className="form-group-ae">
                  <label>Notes</label>
                  <textarea
                    className="form-control-dark"
                    rows={2}
                    placeholder="Your personal notes..."
                    value={form.notes}
                    onChange={set('notes')}
                  />
                </div>

                {submitError && (
                  <div style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '0.75rem', textAlign: 'center' }}>
                    {submitError}
                  </div>
                )}

                <div className="addedit-actions">
                  <button type="button" className="btn btn-outline-pink" onClick={() => navigate(-1)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-pink" disabled={loading}>
                    {loading
                      ? <span className="spinner-border spinner-border-sm" />
                      : isEdit ? 'Save Changes' : 'Add Movie'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Poster preview */}
          <div className="addedit-preview-col">
            <div className="poster-preview dark-card">
              <h5 className="poster-preview__label">Poster Preview</h5>
              {fetchingPoster ? (
                <div className="poster-preview__placeholder">
                  <div className="spinner-border text-warning" />
                </div>
              ) : form.poster_url && !posterError ? (
                <img
                  src={form.poster_url}
                  alt="Poster preview"
                  className="poster-preview__img"
                  onError={() => setPosterError(true)}
                />
              ) : (
                <div className="poster-preview__placeholder">
                  <span>{getInitials(form.title)}</span>
                  {form.poster_url && posterError && (
                    <p className="poster-preview__err">Could not load image</p>
                  )}
                </div>
              )}
              {form.title && <p className="poster-preview__title">{form.title}</p>}
              {form.status && (
                <span className={`badge badge-${form.status} poster-preview__status`}>
                  {STATUSES.find((s) => s.value === form.status)?.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
