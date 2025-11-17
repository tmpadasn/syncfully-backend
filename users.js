const express = require("express");
const router = express.Router();

// Temporary in-memory "database"
let users = [];
let nextId = 1;

// Utility: Convert internal user to public API format
function formatUser(user) {
  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    profilePictureUrl: user.profilePictureUrl,
    ratedWorksCount: user.ratedWorks.length
  };
}

/**
 * POST /users
 * Register a new user
 */
router.post("/", (req, res) => {
  const { username, email, password } = req.body;

  let errors = [];

  // Required fields
  if (!username) errors.push("username is required");
  if (!email) errors.push("email is required");
  if (!password) errors.push("password is required");

  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid input", details: errors });
  }

  // Username length
  if (username.length < 3 || username.length > 20) {
    errors.push("username must be between 3 and 20 characters");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push("email format is invalid");
  }

  // Password validation
  if (password.length < 6) {
    errors.push("password must be at least 6 characters long");
  }

  // Duplicate checks
  if (users.some(u => u.email === email)) {
    errors.push("email is already registered");
  }

  if (users.some(u => u.username === username)) {
    errors.push("username is already taken");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid input", details: errors });
  }

  // Create new user (internal model)
  const newUser = {
    id: nextId++,
    username,
    email,
    password, // later replace with hashed
    profilePictureUrl: null, // default
    ratedWorks: {}           // empty initially
  };

  users.push(newUser);

  // Return public version
  res.status(201).json(formatUser(newUser));
});

/**
 * GET /users
 * Retrieve all users
 */
router.get("/", (req, res) => {
  res.json(users.map(formatUser));
});

/**
 * GET /users/:userId
 * Retrieve a specific user
 */
router.get("/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
      details: `User with ID ${userId} does not exist`
    });
  }

  res.json(formatUser(user));
});

/**
 * PUT /users/:userId
 * Update a user
 */
router.put("/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
      details: `User with ID ${userId} does not exist`
    });
  }

  const { username, email, password } = req.body;
  let errors = [];

  // Required
  if (!username) errors.push("username is required");
  if (!email) errors.push("email is required");
  if (!password) errors.push("password is required");

  // Username length
  if (username && (username.length < 3 || username.length > 20)) {
    errors.push("username must be between 3 and 20 characters");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push("email format is invalid");
  }

  // Password length
  if (password && password.length < 6) {
    errors.push("password must be at least 6 characters long");
  }

  // Duplicate username/email (excluding current user)
  const conflict = users.find(
    u => u.id !== userId && (u.username === username || u.email === email)
  );

  if (conflict) {
    if (conflict.username === username) errors.push("username is already taken");
    if (conflict.email === email) errors.push("email is already registered");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Invalid input",
      details: errors
    });
  }

  // Perform update
  user.username = username;
  user.email = email;
  user.password = password;

  res.json(formatUser(user));
});

/**
 * DELETE /users/:userId
 * Delete a user
 */
router.delete("/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);

  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    return res.status(404).json({
      error: "User not found",
      details: `User with ID ${userId} does not exist`
    });
  }

  users.splice(idx, 1);
  res.status(204).send();
});

/**
 * GET /users/:userId/ratings
 * Retrieve all rated works for the user
 */
router.get("/:userId/ratings", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
      details: `User with ID ${userId} does not exist`
    });
  }

  // OpenAPI requires a map of workId -> rating object
  res.json(user.ratedWorks);
});

/**
 * POST /users/:userId/ratings
 * Rate a work for a user
 */
/* NEED TO VALIDATE IF workID is available (After work.js is final) */
router.post("/:userId/ratings", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
      details: `User with ID ${userId} does not exist`
    });
  }

  const { workId, ratingValue } = req.body;
  let errors = [];

  // Validation
  if (workId === undefined) errors.push("workId is required");
  if (ratingValue === undefined) errors.push("ratingValue is required");

  if (typeof workId !== "number") errors.push("workId must be a number");
  if (typeof ratingValue !== "number") errors.push("ratingValue must be a number");

  if (ratingValue < 1 || ratingValue > 5) {
    errors.push("ratingValue must be between 1 and 5");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Invalid input",
      details: errors
    });
  }

  // Save rating (as map entry)
  user.ratedWorks[workId] = {
    ratingValue,
    ratedAt: new Date().toISOString()
  };

  return res.status(200).json({
    message: "Work rated successfully"
  });
});

module.exports = router;
