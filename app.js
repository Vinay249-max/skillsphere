const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const courseRoutes = require("./routes/courses");
const userRoutes = require("./routes/users");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Status Route ─────────────────────────────────────────────────────────────
app.get("/status", (req, res) => {
  res.status(200).json({ message: "App is live" });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

module.exports = app;
