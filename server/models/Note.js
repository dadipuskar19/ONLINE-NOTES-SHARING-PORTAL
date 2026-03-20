const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addedOn: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
