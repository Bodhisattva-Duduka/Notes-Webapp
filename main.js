const express = require('express');
const { urlencoded } = require('express');
const path = require('path');
const notes = require('./routes/notes.js');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB safely
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

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = Number(port) + 1;
    console.warn(`Port ${port} is in use, attempting port ${fallbackPort}...`);
    server.listen(fallbackPort, () => {
      console.log(`Server listening on port ${fallbackPort}`);
    });
  } else {
    console.error('Server error:', err);
  }
});