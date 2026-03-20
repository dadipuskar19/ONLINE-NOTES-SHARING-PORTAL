const express = require('express');
const router = express.Router();
const Homework = require('../models/Homework');
const Submission = require('../models/Submission');
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

// Get all homework
router.get('/', async (req, res) => {
    try {
        const hw = await Homework.find().populate('createdBy', 'name').sort({ createdAt: -1 });
        res.json(hw);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create homework (Faculty only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { title, description, dueDate } = req.body;
        const newHw = new Homework({
            title,
            description,
            dueDate,
            createdBy: req.user.id
        });
        await newHw.save();
        res.json(newHw);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit homework (Student only)
router.post('/submit', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { assignmentId, link, notes } = req.body;
        const submission = new Submission({
            assignmentId,
            studentId: req.user.id,
            link,
            notes
        });
        await submission.save();
        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get submissions (Faculty only)
router.get('/submissions', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        const subs = await Submission.find()
            .populate('assignmentId', 'title')
            .populate('studentId', 'name')
            .sort({ submittedOn: -1 });
        res.json(subs);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update marks (Faculty only)
router.put('/submissions/:id/marks', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { marks } = req.body;
        const submission = await Submission.findByIdAndUpdate(req.params.id, { marks }, { new: true });
        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
