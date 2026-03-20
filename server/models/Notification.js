const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdOn: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
