const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password';

app.use(bodyParser.json());
app.use(express.static('.')); // serve index.html and public/

// Simple Basic Auth for admin
app.use('/admin', (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send('Restricted to Admins only');
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic') return res.status(401).send('Restricted to Admins only');
  const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
  if (user === ADMIN_USER && pass === ADMIN_PASS) return next();
  return res.status(401).send('Restricted to Admins only');
});

// Admin POST endpoint to save event
app.post('/admin/save-event', (req, res) => {
  const eventPath = path.join(__dirname, 'data', 'event.json');
  fs.writeFile(eventPath, JSON.stringify(req.body, null, 2), err => {
    if(err) return res.status(500).json({ message: 'Failed to save event' });
    res.json({ message: 'Event saved successfully!' });
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
