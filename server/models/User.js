const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty'], required: true },
    // Student specific fields
    roll: { type: String },
    attendance: { type: Number, default: 0 },
    marks: {
        Midterm1: { type: Number, default: 0 },
        Midterm2: { type: Number, default: 0 },
        Assignment: { type: Number, default: 0 }
    },
    // Faculty specific fields
    subject: { type: String }
}, { timestamps: true });

// Hash password before saving
// UserSchema.pre('save', function(next) {
//     if (!this.isModified('password')) return next();
//     bcrypt.hash(this.password, 10, (err, hash) => {
//         if (err) return next(err);
//         this.password = hash;
//         next();
//     });
// });


// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
