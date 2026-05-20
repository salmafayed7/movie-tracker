CREATE DATABASE IF NOT EXISTS movie_watchlist;
USE movie_watchlist;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  poster_url TEXT,
  description TEXT,
  status ENUM('watchlist','watched') NOT NULL DEFAULT 'watchlist',
  rating TINYINT CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample data (insert after creating a user, user_id=1)
INSERT INTO users (username, email, password) VALUES
('demo', 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO movies (user_id, title, genre, poster_url, description, status, rating, notes) VALUES
(1, 'Inception', 'Sci-Fi',
 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
 'watched', 5, 'Mind-bending masterpiece by Nolan.'),
(1, 'Interstellar', 'Sci-Fi',
 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
 'A team of explorers travel through a wormhole in space in an attempt to ensure humanitys survival.',
 'watchlist', 4, 'Beautiful visuals and emotional story.');
