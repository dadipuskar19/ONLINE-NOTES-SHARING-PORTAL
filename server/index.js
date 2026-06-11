const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.static(path.resolve(__dirname, '../')));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes_sharing')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/homework', require('./routes/homework'));
app.use('/api/users', require('./routes/users'));
app.use('/api/quizzes', require('./routes/quizzes'));



// Basic Route
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

