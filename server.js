const express = require("express");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Use native fetch if available (Node 18+), otherwise node-fetch fallback
let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use("/data", express.static(path.join(__dirname, "data")));
app.use(express.static(__dirname));

// Paths
const EVENT_FILE = path.join(__dirname, "data", "event.json");

// ENV values
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "password123";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_OWNER = process.env.GITHUB_OWNER || "HullRED";
const GITHUB_REPO = process.env.GITHUB_REPO || "CalAdd";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH || "data/event.json";

// =========================
// LOGIN ENDPOINT
// =========================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// =========================
// GET EVENT JSON
// =========================
app.get("/api/event", (req, res) => {
  fs.readFile(EVENT_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading event.json:", err);
      return res.status(500).json({ success: false, message: "Could not read event.json" });
    }

    try {
      const json = JSON.parse(data);
      res.json(json);
    } catch (parseErr) {
      console.error("Invalid JSON in event.json:", parseErr);
      res.status(500).json({ success: false, message: "Invalid event.json format" });
    }
  });
});

// =========================
// SAVE EVENT JSON LOCALLY
// + PUSH TO GITHUB
// =========================
app.post("/api/save-event", async (req, res) => {
  const updatedEvent = req.body;

  // Basic validation
  if (!updatedEvent || typeof updatedEvent !== "object") {
    return res.status(400).json({ success: false, message: "Invalid event payload" });
  }

  try {
    // Save locally first
    fs.writeFileSync(EVENT_FILE, JSON.stringify(updatedEvent, null, 2), "utf8");

    // If no GitHub token, stop here (local save only)
    if (!GITHUB_TOKEN) {
      return res.json({
        success: true,
        pushed: false,
        message: "Saved locally only (no GITHUB_TOKEN set)"
      });
    }

    // Get current file SHA from GitHub
    const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;

    const getResponse = await fetchFn(getUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json"
      }
    });

    if (!getResponse.ok) {
      const errText = await getResponse.text();
      console.error("GitHub GET failed:", errText);
      return res.status(500).json({
        success: false,
        message: "Saved locally, but failed to fetch GitHub file SHA",
        details: errText
      });
    }

    const getData = await getResponse.json();
    const currentSha = getData.sha;

    // Push updated file to GitHub
    const newContent = Buffer.from(JSON.stringify(updatedEvent, null, 2), "utf8").toString("base64");

    const putUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

    const putResponse = await fetchFn(putUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Update event.json via admin panel",
        content: newContent,
        sha: currentSha,
        branch: GITHUB_BRANCH
      })
    });

    if (!putResponse.ok) {
      const errText = await putResponse.text();
      console.error("GitHub PUT failed:", errText);
      return res.status(500).json({
        success: false,
        message: "Saved locally, but failed to push to GitHub",
        details: errText
      });
    }

    return res.json({
      success: true,
      pushed: true,
      message: "Event saved locally and pushed to GitHub successfully"
    });
  } catch (err) {
    console.error("Save error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while saving event",
      details: err.message
    });
  }
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


const posterThumb = document.getElementById('posterThumb');
const posterModal = document.getElementById('posterModal');
const posterClose = document.getElementById('posterClose');

posterThumb.addEventListener('click', () => {
  posterModal.classList.add('show');
});

posterClose.addEventListener('click', () => {
  posterModal.classList.remove('show');
});

posterModal.addEventListener('click', (e) => {
  if (e.target === posterModal) {
    posterModal.classList.remove('show');
  }
});
