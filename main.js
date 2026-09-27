const express = require('express');
const { urlencoded } = require('express');
const path = require('path');
const { exec } = require('child_process');
const notes = require('./routes/notes.js');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notes';
if (mongoUri.endsWith('/')) {
  mongoUri += 'notes';
}

mongoose.connect(mongoUri, { dbName: 'notes' })
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

app.use(express.json());
app.use(urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/notes', notes);

app.get('/', (req, res) => {
  res.redirect('/notes');
});

function openBrowser(p) {
  const url = `http://localhost:${p}`;
  console.log(`\n  Server running at: \x1b[36m\x1b]8;;${url}\x07${url}\x1b]8;;\x07\x1b[0m\n`);
  exec(`xdg-open ${url}`);
}

const server = app.listen(port, () => {
  openBrowser(port);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = Number(port) + 1;
    console.warn(`Port ${port} is in use, attempting port ${fallbackPort}...`);
    server.listen(fallbackPort, () => {
      openBrowser(fallbackPort);
    });
  } else {
    console.error('Server error:', err);
  }
});