const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
const verifyToken = require('../middleware/auth');

const APP_GENRES = ['Action','Comedy','Drama','Horror','Sci-Fi','Thriller','Romance','Animation','Documentary','Fantasy','Mystery','Crime','Musical','Other'];

function mapGenre(omdbStr) {
  if (!omdbStr || omdbStr === 'N/A') return null;
  for (const part of omdbStr.split(',').map(s => s.trim())) {
    const match = APP_GENRES.find(g => g.toLowerCase() === part.toLowerCase());
    if (match) return match;
  }
  return 'Other';
}

// GET /api/movies/search-omdb?query=... - search OMDB for title suggestions
router.get('/search-omdb', verifyToken, async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json({ results: [] });
  try {
    const resp = await axios.get('https://www.omdbapi.com/', {
      params: { s: query, apikey: process.env.OMDB_API_KEY },
    });
    console.log('OMDB search response:', resp.data);
    if (resp.data?.Response === 'False') return res.json({ results: [] });
    const results = (resp.data?.Search || []).map(({ imdbID, Title, Year, Poster }) => ({
      imdbID, Title, Year, Poster,
    }));
    res.json({ results });
  } catch (err) {
    console.error('OMDB search error:', err.message);
    res.json({ results: [] });
  }
});

// GET /api/movies/omdb-detail?imdbID=... - fetch full movie detail from OMDB
router.get('/omdb-detail', verifyToken, async (req, res) => {
  const { imdbID } = req.query;
  if (!imdbID) return res.status(400).json({ error: 'imdbID required' });
  try {
    const resp = await axios.get('https://www.omdbapi.com/', {
      params: { i: imdbID, apikey: process.env.OMDB_API_KEY },
    });
    const d = resp.data;
    res.json({
      title:      d?.Title      && d.Title      !== 'N/A' ? d.Title      : null,
      plot:       d?.Plot       && d.Plot        !== 'N/A' ? d.Plot       : null,
      poster_url: d?.Poster     && d.Poster      !== 'N/A' ? d.Poster     : null,
      genre:      mapGenre(d?.Genre),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch details' });
  }
});

// GET /api/movies/search-poster?title=... - auto-fetch poster from OMDB
router.get('/search-poster', verifyToken, async (req, res) => {
  const { title } = req.query;
  if (!title) return res.status(400).json({ error: 'title required' });
  try {
    const resp = await axios.get('https://www.omdbapi.com/', {
      params: { t: title, apikey: process.env.OMDB_API_KEY },
    });
    const poster = resp.data?.Poster && resp.data.Poster !== 'N/A'
      ? resp.data.Poster
      : null;
    res.json({ poster_url: poster });
  } catch {
    res.json({ poster_url: null });
  }
});

// GET /api/movies - get all movies for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const [movies] = await db.query(
      'SELECT * FROM movies WHERE user_id = ? ORDER BY date_added DESC',
      [req.user.id]
    );
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch movies.' });
  }
});

// POST /api/movies - add a new movie
router.post('/', verifyToken, async (req, res) => {
  const { title, genre, poster_url, description, status, rating, notes } = req.body;

  if (!title || !genre || !status) {
    return res.status(400).json({ message: 'Title, genre, and status are required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO movies (user_id, title, genre, poster_url, description, status, rating, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, genre, poster_url || null, description || null, status, rating || null, notes || null]
    );

    const [newMovie] = await db.query('SELECT * FROM movies WHERE id = ?', [result.insertId]);
    res.status(201).json(newMovie[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'You already have a movie with this title.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Failed to add movie.' });
  }
});

// PUT /api/movies/:id - update a movie
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, genre, poster_url, description, status, rating, notes } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT id FROM movies WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    await db.query(
      `UPDATE movies SET title=?, genre=?, poster_url=?, description=?, status=?, rating=?, notes=?
       WHERE id = ? AND user_id = ?`,
      [title, genre, poster_url || null, description || null, status, rating || null, notes || null, id, req.user.id]
    );

    const [updated] = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update movie.' });
  }
});

// DELETE /api/movies/:id - delete a movie
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.query(
      'SELECT id FROM movies WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    await db.query('DELETE FROM movies WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Movie deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete movie.' });
  }
});

module.exports = router;
