# 🎬 SyncFully - Entertainment Discovery Platform

> A full-stack web application for discovering, rating, and organizing entertainment content across multiple media types.

**SyncFully** bridges the gap between different kinds of entertainment - movies, books, music, TV series, and graphic novels - helping users discover new content based on their preferences and ratings.

[![Cyclopt rating](https://server.cyclopt.com/api/badges/6913775b2a66d21e430c382b)](https://panorama.cyclopt.com)
---

## 📚 Table of Contents

- [Project Overview](#-project-overview)
- [Quick Start Guide](#-quick-start-guide)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Testing the API](#-testing-the-api)
- [API Documentation](#-api-documentation)

---

## 🎯 Project Overview

This project consists of two main components:

1. **Backend API** (`syncfully-backend/`) - RESTful API built with Express.js and MongoDB
2. **Frontend App** (`syncfully-frontend/`) - React-based single-page application

The application allows users to:
- Browse and search across 5 different media types (movies, series, books, music, graphic novels)
- Rate works on a 1-5 scale and get personalized recommendations
- Create custom shelves to organize their favorite content
- Follow other users and discover what they're watching/reading/listening to
- Search with advanced filters (type, genre, year, rating)

---

## 🚀 Quick Start Guide

### Prerequisites

Make sure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

You do **NOT** need MongoDB - the app works with mock data by default!

### Environment Variables (Optional)

Create a `.env` file in the `syncfully-backend/` directory:

```env
PORT=3000
NODE_ENV=production
# MONGODB_URI=mongodb://localhost:27017/syncfully  # For future MongoDB implementation
```

**Note:** The application works perfectly with mock data. MongoDB support is available for future implementation.

### Step 1: Clone the Repository

```bash
git clone https://github.com/tmpadasn/syncfully-frontend.git
cd Syncfully
```

### Step 2: Start the Backend Server

```bash
# Navigate to backend directory
cd syncfully-backend

# Install dependencies
npm install

# Start the server
npm start
```

You should see:
```
🚀 Server running on port 3000
📝 Environment: development
```

✅ **Backend is now running at** `http://localhost:3000`

### Step 3: Start the Frontend (New Terminal)

Open a **new terminal window** and run:

```bash
# Navigate to frontend directory (from project root)
cd syncfully-frontend

# Install dependencies
npm install

# Start the React app
npm start
```

The browser should automatically open to `http://localhost:3001`

✅ **Frontend is now running!**

### Step 4: Test the Application

You can now:
1. **Sign up** for a new account or **login** with mock users
2. **Browse works** on the home page
3. **Search** for specific content with filters
4. **Rate works** by clicking on them and giving a rating (1-5 stars)
5. **View recommendations** based on your ratings
6. **Create shelves** to organize your favorites

---

## 🧪 Testing the API

### Health Check

Verify the backend is running:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-27T..."
}
```

### Get All Works

```bash
curl http://localhost:3000/api/works
```

### Search for Books

```bash
curl "http://localhost:3000/api/search?query=lord&work-type=book"
```

### Get Popular Works

```bash
curl http://localhost:3000/api/works/popular
```

### Get All Users

```bash
curl http://localhost:3000/api/users
```

### Create a New User (POST)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "alice",
    "password": "alice"
  }'
```

**Note:** Mock users have passwords that match their usernames (e.g., user `alice` has password `alice`).

### Rate a Work

Submit a rating for a work:

```bash
curl -X POST http://localhost:3000/api/works/1/ratings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "score": 5
  }'
```

**Note:** Replace `1` (workId) and `"1"` (userId) with actual IDs from the responses above.

### Get User Recommendations

```bash
curl http://localhost:3000/api/users/1/recommendations
```

**Note:** Replace `1` with an actual user ID from the users list.

---

## ✨ Features

### Core Functionality

- ✅ **Multi-Media Support** - 5 different work types (movies, series, books, music, graphic novels)
- ✅ **User Authentication** - Signup, login, and profile management
- ✅ **Rating System** - Integer ratings (1-5) with calculated averages
- ✅ **Advanced Search** - Filter by type, genre, year, and minimum rating
- ✅ **Recommendations Engine** - Personalized suggestions based on user ratings
- ✅ **Shelf Management** - Create custom collections with filtering options
- ✅ **Social Features** - Follow/unfollow users, view their ratings and shelves
- ✅ **Popular Works** - Discover trending content

### Technical Features

- 🔒 **Password Hashing** - bcrypt for secure password storage
- 🗄️ **Flexible Database** - MongoDB with Mongoose (or mock data fallback)
- 🎨 **Responsive Design** - Works on desktop and mobile
- 🔍 **Smart Filtering** - Dynamic filter options based on available data
- 📱 **RESTful API** - 32 documented endpoints
- 🚀 **Fast Performance** - Optimized queries and caching
- 📝 **Full API Documentation** - OpenAPI 3.0 (Swagger) specification

---

## 🔐 Security Features

- **Password Hashing:** bcrypt for secure password storage
- **Input Validation:** Middleware-based validation on all user inputs
- **Error Sanitization:** Stack traces hidden in production environment
- **Environment Configuration:** Sensitive data stored in .env files (excluded from git)

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** bcrypt
- **Architecture:** MVC + Service Layer
- **API Spec:** OpenAPI 3.0.3 (Swagger)
- **Testing:** AVA with c8 coverage
- **Linting:** ESLint (ES2022, 2-space indent, single quotes)

### Frontend
- **Library:** React 18.2
- **Routing:** React Router 6.12
- **HTTP Client:** Axios 1.4
- **Icons:** React Icons 5.5
- **Build Tool:** Create React App 5.0

---

## 📁 Project Structure

```
Syncfully/
├── syncfully-backend/          # Express.js API server
│   ├── config/                 # Configuration files
│   │   ├── constants.js        # App constants (work types, genres, etc.)
│   │   └── database.js         # MongoDB connection
│   ├── controllers/            # Request handlers
│   │   ├── authController.js   # Login/signup
│   │   ├── userController.js   # User CRUD + social features
│   │   ├── workController.js   # Work CRUD + similar works
│   │   ├── ratingController.js # Rating operations
│   │   ├── shelfController.js  # Shelf management
│   │   └── searchController.js # Search with filters
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js            # User model with password hashing
│   │   ├── Work.js            # Work model (5 types)
│   │   ├── Rating.js          # Rating model (1-5 scale)
│   │   └── Shelf.js           # Shelf model
│   ├── routes/                 # API routes
│   ├── services/               # Business logic layer
│   ├── middleware/             # Auth, validation, error handling
│   ├── utils/                  # Helper functions
│   ├── data/                   # Mock data for testing
│   ├── docs/
│   │   └── swagger.json        # OpenAPI 3.0 specification
│   ├── app.js                  # Express app configuration
│   ├── server.js               # Server entry point
│   └── package.json
│
├── syncfully-frontend/         # React SPA
│   ├── public/                 # Static files
│   ├── src/
│   │   ├── api/               # API client modules
│   │   ├── components/        # Reusable React components
│   │   ├── context/           # React Context (Auth)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── router/            # Routing configuration
│   │   ├── styles/            # Global CSS
│   │   ├── utils/             # Helper functions
│   │   ├── App.js             # Main App component
│   │   └── index.js           # Entry point
│   └── package.json
│
└── README.md                   # This file
```

---

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Main Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - Create new account

#### Users
- `GET /users` - List all users
- `POST /users` - Create user
- `GET /users/:userId` - Get user details
- `PUT /users/:userId` - Update user
- `DELETE /users/:userId` - Delete user
- `GET /users/:userId/ratings` - Get user's ratings
- `POST /users/:userId/ratings` - Add rating
- `GET /users/:userId/recommendations` - Get personalized recommendations
- `GET /users/:userId/shelves` - Get user's shelves
- `POST /users/:userId/shelves` - Create shelf
- `GET /users/:userId/following` - Get following list
- `GET /users/:userId/followers` - Get followers
- `POST /users/:userId/following/:targetUserId` - Follow user
- `DELETE /users/:userId/following/:targetUserId` - Unfollow user

#### Works
- `GET /works` - List all works (with filters: type, year, genres)
- `POST /works` - Create work
- `GET /works/popular` - Get popular works
- `GET /works/:workId` - Get work details
- `PUT /works/:workId` - Update work
- `DELETE /works/:workId` - Delete work
- `GET /works/:workId/similar` - Get similar works
- `GET /works/:workId/ratings` - Get work ratings
- `POST /works/:workId/ratings` - Submit rating
- `GET /works/:workId/ratings/average` - Get average rating

#### Ratings
- `GET /ratings` - List all ratings
- `GET /ratings/:ratingId` - Get rating
- `PUT /ratings/:ratingId` - Update rating
- `DELETE /ratings/:ratingId` - Delete rating

#### Shelves
- `GET /shelves` - List all shelves
- `GET /shelves/:shelfId` - Get shelf details
- `PUT /shelves/:shelfId` - Update shelf
- `DELETE /shelves/:shelfId` - Delete shelf
- `GET /shelves/:shelfId/works` - Get works in shelf (with filters)
- `POST /shelves/:shelfId/works/:workId` - Add work to shelf
- `DELETE /shelves/:shelfId/works/:workId` - Remove work from shelf

#### Search
- `GET /search` - Search users and works
  - Query params: `query`, `item-type` (user/work), `work-type`, `genre`, `rating`, `year`

### Complete API Documentation

For the full OpenAPI 3.0 specification, see:
- **File:** `syncfully-backend/docs/swagger.json`
- **Import into:** [Swagger Editor](https://editor.swagger.io/) or [Postman](https://www.postman.com/)

---

## 📊 Data Models

### Work Types
- `movie` - Films
- `series` - TV shows
- `music` - Albums/songs
- `book` - Books
- `graphic-novel` - Comics/manga

---
