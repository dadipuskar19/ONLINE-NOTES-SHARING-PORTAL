const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const users = [
    // Faculty
    {
        username: "faculty1",
        password: "pass123",
        name: "Prasana",
        role: "faculty",
        subject: "IT - Java Programming"
    },
    {
        username: "faculty2",
        password: "pass123",
        name: "G.MANI",
        role: "faculty",
        subject: "IT - Web Technologies"
    },
    {
        username: "faculty3",
        password: "pass123",
        name: "NEELIMA HOD-IT",
        role: "faculty",
        subject: "IT - Database Systems"
    },
    // Students
    {
        username: "student1",
        password: "pass123",
        name: "Puskar",
        role: "student",
        roll: "IT2-001",
        attendance: 90,
        marks: { Midterm1: 85, Midterm2: 88, Assignment: 95 }
    },
    {
        username: "student2",
        password: "pass123",
        name: "Hemant",
        role: "student",
        roll: "IT2-002",
        attendance: 85,
        marks: { Midterm1: 80, Midterm2: 82, Assignment: 90 }
    },
    {
        username: "student3",
        password: "pass123",
        name: "Chaitanya",
        role: "student",
        roll: "IT2-003",
        attendance: 88,
        marks: { Midterm1: 82, Midterm2: 85, Assignment: 92 }
    },
    {
        username: "student4",
        password: "pass123",
        name: "Divya",
        role: "student",
        roll: "IT2-004",
        attendance: 92,
        marks: { Midterm1: 88, Midterm2: 90, Assignment: 95 }
    },
    {
        username: "student5",
        password: "pass123",
        name: "Navya",
        role: "student",
        roll: "IT2-005",
        attendance: 87,
        marks: { Midterm1: 84, Midterm2: 86, Assignment: 91 }
    }
];

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

        console.log('Seeded users successfully with ONLY requested names');
        mongoose.disconnect();
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

seedDB();
