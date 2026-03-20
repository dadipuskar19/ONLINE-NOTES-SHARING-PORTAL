// server/mock-server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'demo_secret';

app.use(cors());
app.use(express.json());

// Mock Data
let users = [
    { id: "1", username: "faculty1", password: "pass123", name: "Dr. Aparna Singh", role: "faculty", subject: "IT - Java Programming" },
    { id: "2", username: "student1", password: "pass123", name: "Dadi Puskar", role: "student", roll: "IT2-001", attendance: 85, marks: { Midterm1: 82, Midterm2: 88, Assignment: 90 } }
];

let notes = [
    { id: "1", title: "Unit 1 - Introduction to Java", description: "OOps, Basic Syntax, Fundamentals.", link: "https://example.com/unit1-notes.pdf", addedBy: { name: "Dr. Aparna Singh" }, addedOn: new Date() }
];

let notifications = [
    { id: "1", title: "Class Test Announcement", message: "Class test on Unit 1 will be held on Monday.", createdBy: { name: "Dr. Aparna Singh" }, createdOn: new Date() }
];

let homework = [
    { id: "1", title: "Java Assignment 1", description: "Solve problem statements from Q1 to Q5.", dueDate: "2025-11-25", createdBy: { name: "Dr. Aparna Singh" } }
];

let submissions = [];

// API Routes
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

app.get('/api/notes', (req, res) => res.json(notes));
app.post('/api/notes', (req, res) => {
    const note = { ...req.body, id: Date.now().toString(), addedBy: { name: "Current User" }, addedOn: new Date() };
    notes.push(note);
    res.json(note);
});

app.get('/api/notifications', (req, res) => res.json(notifications));
app.post('/api/notifications', (req, res) => {
    const notif = { ...req.body, id: Date.now().toString(), createdBy: { name: "Current User" }, createdOn: new Date() };
    notifications.push(notif);
    res.json(notif);
});

app.get('/api/homework', (req, res) => res.json(homework));
app.post('/api/homework', (req, res) => {
    const hw = { ...req.body, id: Date.now().toString(), createdBy: { name: "Current User" } };
    homework.push(hw);
    res.json(hw);
});

app.get('/api/homework/submissions', (req, res) => res.json(submissions));
app.post('/api/homework/submit', (req, res) => {
    const sub = { ...req.body, id: Date.now().toString(), studentId: { name: "Current Student" }, submittedOn: new Date() };
    submissions.push(sub);
    res.json(sub);
});

app.get('/api/users/students', (req, res) => res.json(users.filter(u => u.role === 'student')));
app.put('/api/users/students/:id/attendance', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (user) user.attendance = req.body.attendance;
    res.json(user);
});

app.listen(PORT, () => {
    console.log(`Demo Mock Server running on port ${PORT}`);
    console.log('No MongoDB required for this mode!');
});
