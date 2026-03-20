const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    link: { type: String, required: true },
    notes: { type: String },
    marks: { type: Number, default: null }, // Add marks field
    submittedOn: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
