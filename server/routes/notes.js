const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const jwt = require('jsonwebtoken');

// Middleware to verify token (Simple inline version for now)
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Get all notes
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find().populate('addedBy', 'name').sort({ addedOn: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a note (Faculty only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { title, description, link } = req.body;
        const newNote = new Note({
            title,
            description,
            link,
            addedBy: req.user.id
        });
        await newNote.save();
        res.json(newNote);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
