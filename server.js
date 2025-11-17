const express = require("express");
const cors = require("cors");

const usersRoutes = require("./users");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount users.js on /users
app.use("/users", usersRoutes);

// Root test route
app.get("/", (req, res) => {
  res.json({ message: "SyncFully API is running!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});