# CineTrack - Movie Watchlist App

A full-stack movie watchlist application with a dark cinematic theme.

## Tech Stack
- **Frontend**: React.js + Bootstrap 5 + plain CSS
- **Backend**: Node.js + Express.js
- **Database**: MySQL (via XAMPP)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [XAMPP](https://www.apachefriends.org/) (for MySQL)

### Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

---

## Setup Instructions

### 1. Database Setup
1. Start XAMPP and ensure **MySQL** is running
2. Open **phpMyAdmin** (http://localhost/phpmyadmin)
3. Import the `db.sql` file from the root of this project:
   - Click **Import** → Choose File → select `db.sql` → Go
4. This creates the `movie_watchlist` database with sample data

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` folder (this file is not included in the repo):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=movie_watchlist
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
```
Start the backend:
```bash
npm start
# or for development with auto-reload:
npm run dev
```
Backend runs at: http://localhost:5000

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs at: http://localhost:3000

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login and get JWT |
| GET | /api/movies | Yes | Get user's movies |
| POST | /api/movies | Yes | Add a movie |
| PUT | /api/movies/:id | Yes | Update a movie |
| DELETE | /api/movies/:id | Yes | Delete a movie |

---

## Demo Credentials (from sample data)
- **Email**: demo@example.com
- **Password**: password

---

## Features
- JWT authentication (register/login)
- Add, edit, delete movies
- Search and filter by genre
- Status tracking: Watchlist / Watching / Watched
- Star rating (1–5)
- Personal notes per movie
- Statistics dashboard with charts (Chart.js)
- Live poster preview when adding/editing
- Password strength indicator
- Fully responsive (mobile, tablet, desktop)
- Dark cinematic theme with gold accents
