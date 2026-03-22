const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/admin', express.static('admin'));

const DATA_PATH = path.join(__dirname, 'data', 'event.json');

app.post('/save-event', (req,res)=>{
  fs.writeFile(DATA_PATH, JSON.stringify(req.body,null,2), err=>{
    if(err) return res.status(500).send('Error saving event');
    res.send('Event saved');
  });
});

app.listen(3000, ()=>console.log('Local server running on http://localhost:3000'));
