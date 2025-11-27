# Syncfully Backend

> Rate what you love, find out what's next.

Syncfully helps users discover new works based on their ratings, connect with friends, and create personalized playlists across different entertainment mediums.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Contributing](#contributing)

## ✨ Features

- **Multi-Media Support** - Works with movies, series, books, music, and graphic novels
- **Smart Search** - Filter works by type, genre, year, and rating
- **Rating System** - Rate works on a scale of 1 to 5 (integers only, averages display as decimals)
- **User Profiles** - Create and manage user accounts
- **Recommendations** - Get personalized recommendations based on ratings
- **Popular Works** - Discover trending content
- **Similar Works** - Find related content based on genre and type
- **Flexible Storage** - Works with MongoDB or in-memory mock data

## 🛠 Tech Stack

- **Runtime:** Node.js v25+
- **Framework:** Express.js 5.x
- **Database:** MongoDB (optional) with Mongoose ODM
- **Authentication:** bcrypt for password hashing
- **Architecture:** MVC pattern with service layer
- **Code Style:** ES6+ modules with async/await

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (optional - falls back to mock data if not provided)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tmpadasn/syncfully-backend.git
   cd syncfully-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=          # Optional - leave empty for mock data
   JWT_SECRET=your-secret-key-here
   ```

4. **Start the server**
   ```bash
   # Production mode
   npm start

   # Development mode with auto-reload
   npm run dev
   ```

5. **Verify it's running**
   ```bash
   curl http://localhost:3000/health
   ```

## 📚 API Documentation

Base URL: `http://localhost:3000/api`

### 🏥 Health Check

```http
GET /health
```

### 👥 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | Get all users |
| `POST` | `/users` | Create a new user |
| `GET` | `/users/:userId` | Get user by ID |
| `PUT` | `/users/:userId` | Update user |
| `DELETE` | `/users/:userId` | Delete user |
| `GET` | `/users/:userId/ratings` | Get user's ratings |
| `POST` | `/users/:userId/ratings` | Add user rating |
| `GET` | `/users/:userId/recommendations` | Get user recommendations |

### 📖 Works

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/works` | Get all works (with filters) |
| `POST` | `/works` | Create a new work |
| `GET` | `/works/popular` | Get popular works |
| `GET` | `/works/:workId` | Get work by ID |
| `PUT` | `/works/:workId` | Update work |
| `DELETE` | `/works/:workId` | Delete work |
| `GET` | `/works/:workId/similar` | Get similar works |
| `GET` | `/works/:workId/ratings` | Get all ratings for a work |
| `POST` | `/works/:workId/ratings` | Submit a rating |
| `GET` | `/works/:workId/ratings/average` | Get average rating |

### ⭐ Ratings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ratings` | Get all ratings |
| `GET` | `/ratings/:ratingId` | Get rating by ID |
| `PUT` | `/ratings/:ratingId` | Update a rating |
| `DELETE` | `/ratings/:ratingId` | Delete a rating |

### 🔍 Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/search` | Search items with filters |

**Query Parameters:**
- `query` - Search term
- `item-type` - Filter by item type (user, work, shelf)
- `work-type` - Filter by work type (book, movie, series, music)
- `genre` - Filter by genre
- `rating` - Minimum rating
- `year` - Filter by year

### 📝 Request/Response Examples

#### Create a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

#### Rate a Work
```bash
curl -X POST http://localhost:3000/api/works/1/ratings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "score": 4.5
  }'
```

#### Search Works
```bash
curl "http://localhost:3000/api/works?type=movie&year=2010"
```

### Response Format

All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error details",
  "message": "Error message"
}
```

## 📁 Project Structure

```
syncfully-backend/
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection
│   └── constants.js     # App constants
├── controllers/         # Request handlers
│   ├── userController.js
│   ├── workController.js
│   ├── ratingController.js
│   └── searchController.js
├── data/                # Mock data
│   ├── mockUsers.js
│   ├── mockWorks.js
│   └── mockRatings.js
├── middleware/          # Express middleware
│   ├── auth.js          # Authentication
│   ├── validation.js    # Input validation
│   ├── errorHandler.js  # Error handling
│   └── logger.js        # Request logging
├── models/              # Mongoose models
│   ├── User.js
│   ├── Work.js
│   └── Rating.js
├── routes/              # Route definitions
│   ├── index.js         # Route aggregator
│   ├── userRoutes.js
│   ├── workRoutes.js
│   ├── ratingRoutes.js
│   └── searchRoutes.js
├── services/            # Business logic
│   ├── userService.js
│   ├── workService.js
│   ├── ratingService.js
│   └── recommendationService.js
├── utils/               # Utility functions
│   ├── responses.js     # Response helpers
│   ├── validators.js    # Validation helpers
│   └── helpers.js       # General helpers
├── app.js               # Express app setup
├── server.js            # Server entry point
├── .env.example         # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🌍 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `3000` |
| `NODE_ENV` | Environment (development/production) | No | `development` |
| `MONGODB_URI` | MongoDB connection string | No | `null` (uses mock data) |
| `JWT_SECRET` | Secret for JWT tokens | Yes | - |

## 🧪 Testing

### Manual Testing with cURL

```bash
# Health check
curl http://localhost:3000/health

# Get all users
curl http://localhost:3000/api/users

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Get works filtered by type
curl "http://localhost:3000/api/works?type=movie"
```

### Using Postman or Thunder Client

1. Import the API endpoints
2. Set base URL to `http://localhost:3000/api`
3. Test each endpoint with sample data

## 🎯 Work Types

- `movie` - Films
- `series` - TV shows
- `music` - Albums/songs
- `book` - Books
- `graphic-novel` - Comics/graphic novels

## 🏷 Available Genres

Action, Adventure, Comedy, Drama, Fantasy, Horror, Mystery, Romance, Sci-Fi, Thriller, Documentary, Animation, Crime, Biography, History

## 📊 Rating System

- **User Ratings:** Integers only (1, 2, 3, 4, 5)
- **Average Ratings:** Calculated as decimals (e.g., 3.85, 4.12)
- **Display:** Average ratings shown with 1-2 decimal places for precision

## 🔄 Mock Data vs MongoDB

The application can run in two modes:

### Mock Data Mode (Default)
- No MongoDB required
- Data stored in memory
- Perfect for development and testing
- Data resets on server restart

### MongoDB Mode
- Persistent data storage
- Set `MONGODB_URI` in `.env`
- Recommended for production

## 🚦 Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Successful GET/PUT requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## 🔐 Security Notes

- Passwords are hashed using bcrypt
- Input validation on all endpoints
- CORS enabled for cross-origin requests
- Error messages sanitized to prevent information leakage

---

**Note:** This is the backend API only. For the complete Syncfully experience, you'll also need to run the [frontend application](https://github.com/tmpadasn/syncfully-frontend).
