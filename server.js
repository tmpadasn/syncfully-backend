import express, { json } from "express";
import cors from "cors";

import usersRoutes from "./users";

const app = express();

// Middleware
app.use(cors());
app.use(json());

// Mount users.js on /users
app.use("/users", usersRoutes);

// Root test route
app.get("/", (_req, res) => {
  res.json({ message: "SyncFully API is running!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


