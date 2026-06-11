const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    type: { type: String, enum: ['mcq', 'short', 'long'], required: true },
    questionText: { type: String, required: true },
    options: [{ type: String }], // Only for MCQ
    correctOption: { type: Number, default: null } // Index of correct option for MCQ
});

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [QuestionSchema],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
