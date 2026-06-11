const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answer: { type: mongoose.Schema.Types.Mixed } // Number for MCQ, String for short/long
});

const QuizSubmissionSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [AnswerSchema],
    score: { type: Number, default: null }, // Auto-calculated for MCQ
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('QuizSubmission', QuizSubmissionSchema);
