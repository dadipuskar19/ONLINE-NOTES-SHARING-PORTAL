const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const users = [
    {
        username: "faculty1",
        password: "pass123",
        name: "faculty1",
        role: "faculty",
        subject: "IT - Java Programming"
    },
    {
        username: "faculty2",
        password: "pass123",
        name: "faculty2",
        role: "faculty",
        subject: "IT - Web Technologies"
    },
    {
        username: "faculty3",
        password: "pass123",
        name: "faculty3",
        role: "faculty",
        subject: "IT - Database Systems"
    },
    {
        username: "faculty4",
        password: "pass123",
        name: "faculty4",
        role: "faculty",
        subject: "IT - Computer Networks"
    }
];

// Add 10 students
for (let i = 1; i <= 10; i++) {
    users.push({
        username: `student${i}`,
        password: "pass123",
        name: `student ${i}`,
        role: "student",
        roll: `IT2-0${i < 10 ? '0' : ''}${i}`,
        attendance: Math.floor(Math.random() * 21) + 75, // 75-95%
        marks: {
            Midterm1: Math.floor(Math.random() * 51) + 40, // 40-90
            Midterm2: Math.floor(Math.random() * 51) + 40,
            Assignment: Math.floor(Math.random() * 11) + 90 // 90-100
        }
    });
}

// Add specifically requested user
users.push({
    username: "dadipuskar",
    password: "password123",
    name: "Dadi Puskar",
    role: "student",
    roll: "IT2-099",
    attendance: 90,
    marks: {
        Midterm1: 85,
        Midterm2: 88,
        Assignment: 95
    }
});

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes_sharing');
        console.log('Connected to MongoDB for seeding');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Insert new users
        for (let u of users) {
            u.password = await bcrypt.hash(u.password, 10);
            const newUser = new User(u);
            await newUser.save();
        }

        console.log('Seeded users successfully');
        mongoose.disconnect();
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

seedDB();
