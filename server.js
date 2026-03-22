// server.js
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); // serve static files
app.use(express.static('.'));      // serve index.html, style.css, event.json

const EVENT_FILE = 'event.json';

// GET event.json
app.get('/event', (req, res) => {
  fs.readFile(EVENT_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading event.json');
    res.json(JSON.parse(data));
  });
});

// POST updated event.json
app.post('/event', async (req, res) => {
  const eventData = req.body;

  // Save locally first
  fs.writeFile(EVENT_FILE, JSON.stringify(eventData, null, 2), err => {
    if (err) return res.status(500).send('Error saving locally');
  });

  // Push to GitHub
  try {
    const githubUrl = `https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.GITHUB_REPO}/contents/${EVENT_FILE}`;
    
    // Get SHA of existing file
    const getResp = await fetch(githubUrl, {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
    });
    const getData = await getResp.json();
    const sha = getData.sha;

    const commitResp = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update event.json via admin panel`,
        content: Buffer.from(JSON.stringify(eventData, null, 2)).toString('base64'),
        branch: process.env.GITHUB_BRANCH,
        sha
      })
    });

    if (commitResp.ok) {
      res.json({ success: true });
    } else {
      const errData = await commitResp.json();
      res.status(500).json({ success: false, error: errData });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
