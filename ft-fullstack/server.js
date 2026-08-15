require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

// initializing this module also creates the DB tables + seeds default data
require("./src/db");

const authRoutes = require("./src/routes/auth.routes");
const contentRoutes = require("./src/routes/content.routes");
const usersRoutes = require("./src/routes/users.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ---------- API ----------
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/users", usersRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---------- static frontend ----------
app.use(express.static(path.join(__dirname, "public")));

// fallback to index.html for the root site (simple multi-page app, not SPA routing)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Future Technology server running at http://localhost:${PORT}`);
});
