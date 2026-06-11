// assets/js/api.js

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : window.location.origin + '/api';

const api = {
    async login(username, password) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken() {
        return localStorage.getItem('token');
    },

    getUser() {
        return JSON.parse(localStorage.getItem('user'));
    },

    async fetchNotes() {
        const res = await fetch(`${API_URL}/notes`);
        return await res.json();
    },

    async addNote(noteData) {
        const res = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': this.getToken()
            },
            body: JSON.stringify(noteData)
        });
        return await res.json();
    },

    async fetchNotifications() {
        const res = await fetch(`${API_URL}/notifications`);
        return await res.json();
    },

    async addNotification(notifData) {
        const res = await fetch(`${API_URL}/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': this.getToken()
            },
            body: JSON.stringify(notifData)
        });
        return await res.json();
    },

    async fetchHomework() {
        const res = await fetch(`${API_URL}/homework`);
        return await res.json();
    },

    async addHomework(hwData) {
        const res = await fetch(`${API_URL}/homework`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': this.getToken()
            },
            body: JSON.stringify(hwData)
        });
        return await res.json();
    },

    async submitHomework(submissionData) {
        const res = await fetch(`${API_URL}/homework/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': this.getToken()
            },
            body: JSON.stringify(submissionData)
        });
        return await res.json();
    },

    async fetchSubmissions() {
        const res = await fetch(`${API_URL}/homework/submissions`, {
            headers: { 'x-auth-token': this.getToken() }
        });
        return await res.json();
    },

    async updateSubmissionMarks(submissionId, marks) {
        const res = await fetch(`${API_URL}/homework/submissions/${submissionId}/marks`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': this.getToken()
            },
            body: JSON.stringify({ marks })
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return await res.json();
    },

    async fetchStudents() {
        const res = await fetch(`${API_URL}/users/students`, {
            headers: { 'x-auth-token': this.getToken() }
        });
        return await res.json();
    },

    async updateAttendance(studentId, attendance) {
        const res = await fetch(`${API_URL}/users/students/${studentId}/attendance`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': this.getToken()
            },
            body: JSON.stringify({ attendance })
        });
        return await res.json();
    },

    async updateStudentMarks(studentId, marks) {
        const res = await fetch(`${API_URL}/users/students/${studentId}/marks`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': this.getToken()
            },
            body: JSON.stringify({ marks })
        });
        return await res.json();
    },

    async fetchProfile() {
        try {
            const token = this.getToken();
            if (!token) return null;
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            if (!res.ok) return null;
            const data = await res.json();
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (err) {
            console.error("fetchProfile error:", err);
            return null;
        }
    },

    // backward compatibility alias
    async updateMarks(studentId, marks) {
        return this.updateStudentMarks(studentId, marks);
    }
};



window.api = api; // Make it available globally for app.js
