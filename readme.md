# Notes Sharing Portal (Prototype)

A simple **faculty–student notes sharing web application** built using only HTML, CSS, and vanilla JavaScript. This is a **frontend-only prototype** with no real authentication or database.

---

## Features

### Faculty Login

- Login as a faculty member with a sample username/password.
- **Manage Attendance**  
  - Update overall attendance percentage for each student.
- **Manage Homework**
  - Create new homework with title, description, and due date.
  - View a list of all created homeworks.
  - View student homework submissions (links, notes, date).
- **Share Class Notes**
  - Add notes with title, description, and URL (e.g., Google Drive, PDF link).
  - View all notes shared so far.
- **Send Notifications**
  - Post notifications for students to see.
- **View Students**
  - See list of students with attendance and average marks.
- Overview dashboard with quick stats.

### Student Login

- Login as a student with a sample username/password.
- **View Class Notes**
  - Access all notes shared by faculty.
- **View Attendance**
  - See your own attendance percentage.
- **View Marks**
  - See your marks for different exams (Midterm1, Midterm2, etc.).
- **Homework & Upload**
  - See all homework assigned.
  - Select a homework and submit your work as a URL plus optional notes.
- **Quick Quiz**
  - Take a small quiz and see your score immediately.
- **Notifications**
  - View all notifications posted by faculty.
- Overview dashboard with quick stats (attendance, notes count, etc.).

> All data is stored in front-end JavaScript objects. Refreshing the page resets everything.

---

## Tech Stack

- **HTML5**
- **CSS3**
- **Vanilla JavaScript (ES6)**
- No backend, no database.

---

## File Structure

```text
notes-portal/
│
├─ index.html              # Main single-page app with login + dashboards
│
├─ assets/
│  ├─ css/
│  │  └─ styles.css        # All styles
│  │
│  └─ js/
│     ├─ data.js           # Mock users, notes, notifications, homework, quiz data
│     └─ app.js            # All UI logic and event handling
│
└─ README.md
