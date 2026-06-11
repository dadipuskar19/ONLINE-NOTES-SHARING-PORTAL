const express = require('express');
const router = express.Router();
const User = require('../models/User');
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


// Get all students (Faculty only)
router.get('/students', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update student attendance (Faculty only)
router.put('/students/:id/attendance', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { attendance } = req.body;
        const student = await User.findByIdAndUpdate(req.params.id, { attendance }, { new: true });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update student marks (Faculty only)
router.put('/students/:id/marks', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { marks } = req.body;
        const student = await User.findByIdAndUpdate(req.params.id, { marks }, { new: true });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
