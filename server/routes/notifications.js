const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

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

// Get all notifications
router.get('/', async (req, res) => {
    try {
        const notifs = await Notification.find().populate('createdBy', 'name').sort({ createdOn: -1 });
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a notification (Faculty only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { title, message } = req.body;
        const newNotif = new Notification({
            title,
            message,
            createdBy: req.user.id
        });
        await newNotif.save();
        res.json(newNotif);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
