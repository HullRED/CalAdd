// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();

// Serve static files
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const EVENT_PATH = path.join(__dirname, "data/event.json");

// ===== LOGIN ENDPOINT =====
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ===== EVENT ENDPOINTS =====
app.get("/event", (req, res) => {
  try {
    const data = fs.readFileSync(EVENT_PATH);
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Could not load event.json" });
  }
});

app.post("/event", (req, res) => {
  try {
    fs.writeFileSync(EVENT_PATH, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not save event.json" });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
