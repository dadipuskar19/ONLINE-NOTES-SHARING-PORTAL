const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');

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

// GET all quizzes (any logged-in user)
router.get('/', auth, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ isActive: true })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET a single quiz by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create a new quiz (Faculty only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { title, description, questions } = req.body;
        const quiz = new Quiz({
            title,
            description,
            questions,
            createdBy: req.user.id
        });
        await quiz.save();
        const populated = await quiz.populate('createdBy', 'name');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT update a quiz (Faculty only)
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { title, description, questions, isActive } = req.body;
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { title, description, questions, isActive },
            { new: true }
        ).populate('createdBy', 'name');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE a quiz (Faculty only)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST submit a quiz (Student only)
router.post('/:id/submit', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
    try {
        // Prevent duplicate submissions
        const existing = await QuizSubmission.findOne({ quizId: req.params.id, studentId: req.user.id });
        if (existing) return res.status(400).json({ message: 'You have already submitted this quiz.' });

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const { answers } = req.body;

        // Auto-calculate score for MCQ questions
        let score = 0;
        let mcqCount = 0;
        quiz.questions.forEach((q) => {
            if (q.type === 'mcq') {
                mcqCount++;
                const studentAns = answers.find(a => String(a.questionId) === String(q._id));
                if (studentAns && Number(studentAns.answer) === q.correctOption) {
                    score++;
                }
            }
        });

        const submission = new QuizSubmission({
            quizId: req.params.id,
            studentId: req.user.id,
            answers,
            score: mcqCount > 0 ? score : null
        });
        await submission.save();
        res.status(201).json({ message: 'Quiz submitted successfully!', score, totalMcq: mcqCount });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET results for a quiz (Faculty only)
router.get('/:id/results', auth, async (req, res) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
    try {
        const submissions = await QuizSubmission.find({ quizId: req.params.id })
            .populate('studentId', 'name roll')
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET check if current student has submitted a specific quiz
router.get('/:id/my-submission', auth, async (req, res) => {
    try {
        const sub = await QuizSubmission.findOne({ quizId: req.params.id, studentId: req.user.id });
        res.json(sub || null);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
