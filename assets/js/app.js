// assets/js/app.js

// ========== GLOBAL DATA (Populated via API) ==========
let notesData = [];
let notificationsData = [];
let homeworkAssignments = [];
let homeworkSubmissions = [];
let studentsList = [];

// ========== APP STATE ==========
let currentUser = null;
let currentRole = null;



// ========== INIT ==========

document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initNav();
  initFacultyForms();
  initStudentForms();
  initQuiz();
});

/* ========= LOGIN ========= */

function initLogin() {
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const logoutBtn = document.getElementById("logout-btn");

  // Check for existing session
  const storedUser = api.getUser();
  const storedToken = api.getToken();
  if (storedUser && storedToken) {
    currentUser = storedUser;
    currentRole = currentUser.role;
    document.getElementById("login-view").classList.add("hidden");
    document.getElementById("dashboard-view").classList.remove("hidden");
    setupDashboardForRole();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const data = await api.login(username, password);
        currentUser = data.user;
        currentRole = currentUser.role;

        document.getElementById("login-view").classList.add("hidden");
        document.getElementById("dashboard-view").classList.remove("hidden");

        setupDashboardForRole();
    } catch (err) {
        loginError.textContent = err.message;
    }
  });

  logoutBtn.addEventListener("click", () => {
    api.logout();
    currentUser = null;
    currentRole = null;
    document.getElementById("dashboard-view").classList.add("hidden");
    document.getElementById("login-view").classList.remove("hidden");
    document.getElementById("login-form").reset();
    loginError.textContent = "";
    document
      .querySelectorAll(".nav-link")
      .forEach((btn) => btn.classList.remove("active"));
  });
}


/* ========= DASHBOARD & NAVIGATION ========= */

function setupDashboardForRole() {
  const roleBadge = document.getElementById("role-badge");
  const userNameDisplay = document.getElementById("user-name-display");

  roleBadge.textContent = currentRole === "faculty" ? "Faculty" : "Student";
  userNameDisplay.textContent = currentUser.name;

  toggleNavByRole();
  renderAllViews();
}

function toggleNavByRole() {
  const facultyOnly = document.querySelectorAll(".faculty-only");
  const studentOnly = document.querySelectorAll(".student-only");

  if (currentRole === "faculty") {
    facultyOnly.forEach((el) => (el.style.display = "block"));
    studentOnly.forEach((el) => (el.style.display = "none"));
  } else {
    facultyOnly.forEach((el) => (el.style.display = "none"));
    studentOnly.forEach((el) => (el.style.display = "block"));
  }

  showSection("overview-section");
  const defaultBtn = document.querySelector(
    '.nav-link[data-view="overview-section"]'
  );
  document
    .querySelectorAll(".nav-link")
    .forEach((btn) => btn.classList.remove("active"));
  if (defaultBtn) defaultBtn.classList.add("active");
}

function initNav() {
  const navButtons = document.querySelectorAll(".nav-link");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-view");
      showSection(target);

      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

async function showSection(sectionId) {
  document.querySelectorAll(".view-section").forEach((sec) => {
    if (sec.id === sectionId) {
      sec.classList.remove("hidden");
    } else {
      sec.classList.add("hidden");
    }
  });

  await renderedRefresh(sectionId);
}


async function renderedRefresh(sectionId) {
  switch (sectionId) {
    case "overview-section":
      await renderOverview();
      break;
    case "faculty-attendance-section":
      renderFacultyAttendance();
      break;
    case "faculty-homework-section":
      homeworkAssignments = await api.fetchHomework();
      homeworkSubmissions = await api.fetchSubmissions();
      renderFacultyHomework();
      renderHomeworkSubmissions();
      break;
    case "faculty-notes-section":
      notesData = await api.fetchNotes();
      renderFacultyNotes();
      break;
    case "faculty-notifications-section":
      notificationsData = await api.fetchNotifications();
      renderFacultyNotifications();
      break;
    case "faculty-students-section":
      renderFacultyStudents();
      break;
    case "faculty-marks-section":
      renderFacultyMarks();
      break;
    case "student-notes-section":

      notesData = await api.fetchNotes();
      renderStudentNotes();
      break;
    case "student-attendance-section":
      renderStudentAttendance();
      break;
    case "student-marks-section":
      renderStudentMarks();
      break;
    case "student-homework-section":
      homeworkAssignments = await api.fetchHomework();
      renderStudentHomework();
      break;
    case "student-notifications-section":
      notificationsData = await api.fetchNotifications();
      renderStudentNotifications();
      break;
    default:
      break;
  }
}

async function renderAllViews() {
  try {
      const promises = [
          api.fetchNotes(),
          api.fetchNotifications(),
          api.fetchHomework()
      ];
      
      // If logged in, fetch latest profile to get updated marks/attendance
      if (api.getToken()) {
          promises.push(api.fetchProfile());
      }

      const results = await Promise.all(promises);
      notesData = results[0];
      notificationsData = results[1];
      homeworkAssignments = results[2];
      
      const profile = results[3]; // The result of fetchProfile
      if (profile && profile.role) {
          currentUser = profile;
          currentRole = currentUser.role;
      }

      if (currentRole === 'faculty') {
          homeworkSubmissions = await api.fetchSubmissions();
          studentsList = await api.fetchStudents();
      }
  } catch (err) {
      console.error("Error fetching data:", err);
  }


  renderOverview();
  renderFacultyAttendance();
  renderFacultyHomework();
  renderHomeworkSubmissions();
  renderFacultyNotes();
  renderFacultyNotifications();
  renderFacultyStudents();
  renderStudentNotes();
  renderStudentAttendance();
  renderStudentMarks();
  renderStudentHomework();
  renderStudentNotifications();
}


/* ========= OVERVIEW ========= */

function renderOverview() {
  const overviewCards = document.getElementById("overview-cards");
  const notifList = document.getElementById("overview-notifications-list");
  const notesList = document.getElementById("overview-notes-list");

  overviewCards.innerHTML = "";
  notifList.innerHTML = "";
  notesList.innerHTML = "";

  if (!currentUser) return;

  const totalStudents = studentsList.length;
  const totalNotes = notesData.length;
  const totalHw = homeworkAssignments.length;


  if (currentRole === "faculty") {
    const avgAttendance =
      totalStudents === 0
        ? 0
        : Math.round(
            studentsList.reduce(
              (sum, s) => sum + (s.attendance || 0),
              0
            ) / totalStudents
          );

    overviewCards.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total Students</div>
        <div class="stat-value">${totalStudents}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Average Attendance</div>
        <div class="stat-value">${avgAttendance}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Notes Shared</div>
        <div class="stat-value">${totalNotes}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Homeworks Assigned</div>
        <div class="stat-value">${totalHw}</div>
      </div>
    `;
  } else {
    overviewCards.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">My Attendance</div>
        <div class="stat-value">${currentUser.attendance || 0}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Notes Available</div>
        <div class="stat-value">${totalNotes}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Homeworks Assigned</div>
        <div class="stat-value">${totalHw}</div>
      </div>
    `;
  }

  // Latest notifications (max 3)
  notificationsData
    .slice()
    .reverse()
    .slice(0, 3)
    .forEach((n) => {
      const li = document.createElement("li");
      li.textContent = `${n.title} – ${n.message}`;
      notifList.appendChild(li);
    });

  // Latest notes (max 3)
  notesData
    .slice()
    .reverse()
    .slice(0, 3)
    .forEach((note) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${note.title}</strong> – <a href="${note.link}" target="_blank">Open</a>`;
      notesList.appendChild(li);
    });
}

/* ========= FACULTY: ATTENDANCE ========= */

function renderFacultyAttendance() {
  if (currentRole !== "faculty") return;
  const tbody = document.getElementById("faculty-attendance-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  studentsList.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.roll}</td>
      <td>${s.name}</td>
      <td>${s.attendance || 0}%</td>
      <td>
        <input
          type="number"
          min="0"
          max="100"
          value="${s.attendance || 0}"
          data-student-id="${s._id}"
          class="attendance-input"
        />
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".attendance-input").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const id = e.target.getAttribute("data-student-id");
      const newVal = Number(e.target.value);
      if (Number.isNaN(newVal) || newVal < 0 || newVal > 100) {
        alert("Please enter a value between 0 and 100.");
        return;
      }
      try {
          await api.updateAttendance(id, newVal);
          await renderAllViews();
      } catch (err) {
          console.error(err);
      }
    });
  });
}


/* ========= FACULTY: HOMEWORK ========= */

function initFacultyForms() {
  const hwForm = document.getElementById("create-homework-form");
  const hwMessage = document.getElementById("hw-create-message");

  if (hwForm) {
    hwForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("hw-title").value.trim();
      const desc = document.getElementById("hw-description").value.trim();
      const due = document.getElementById("hw-due-date").value;

      if (!title || !desc || !due) return;

      try {
          await api.addHomework({ title, description: desc, dueDate: due });
          hwForm.reset();
          hwMessage.textContent = "Homework created successfully!";
          setTimeout(() => (hwMessage.textContent = ""), 2000);

          await renderAllViews();
      } catch (err) {
          console.error(err);
      }
    });
  }

  const notesForm = document.getElementById("add-note-form");
  const noteMsg = document.getElementById("note-add-message");
  if (notesForm) {
    notesForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("note-title").value.trim();
      const desc = document.getElementById("note-description").value.trim();
      const link = document.getElementById("note-link").value.trim();

      if (!title || !desc || !link) return;

      try {
          await api.addNote({ title, description: desc, link });
          notesForm.reset();
          noteMsg.textContent = "Notes shared successfully!";
          setTimeout(() => (noteMsg.textContent = ""), 2000);

          await renderAllViews();
      } catch (err) {
          console.error(err);
      }
    });
  }

  const notifForm = document.getElementById("add-notification-form");
  const notifMsg = document.getElementById("notif-add-message");
  if (notifForm) {
    notifForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("notif-title").value.trim();
      const msg = document.getElementById("notif-message").value.trim();
      if (!title || !msg) return;

      try {
          await api.addNotification({ title, message: msg });
          notifForm.reset();
          notifMsg.textContent = "Notification posted!";
          setTimeout(() => (notifMsg.textContent = ""), 2000);

          await renderAllViews();
      } catch (err) {
          console.error(err);
      }
    });
  }
}


function renderFacultyHomework() {
  if (currentRole !== "faculty") return;
  const list = document.getElementById("faculty-homework-list");
  if (!list) return;
  list.innerHTML = "";

  if (!homeworkAssignments.length) {
    list.innerHTML = "<li>No homework assigned yet.</li>";
    return;
  }

  homeworkAssignments.forEach((hw) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${hw.title}</strong><br/>
      <span>${hw.description}</span><br/>
      <small>Due: ${hw.dueDate}</small>
    `;
    list.appendChild(li);
  });
}

function renderHomeworkSubmissions() {
  if (currentRole !== "faculty") return;
  const tbody = document.querySelector("#homework-submissions-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!homeworkSubmissions.length) {
    tbody.innerHTML = "<tr><td colspan='6'>No submissions yet.</td></tr>";
    return;
  }

  homeworkSubmissions
    .slice()
    .reverse()
    .forEach((sub) => {
      const hw = homeworkAssignments.find((h) => h._id === sub.assignmentId._id);
      const student = sub.studentId;
      const tr = document.createElement("tr");
      const hwTitle = hw ? hw.title : "Unknown Homework";
      const studentName = student ? student.name : "Unknown Student";

      tr.innerHTML = `
        <td>${hwTitle}</td>
        <td>${studentName}</td>
        <td><a href="${sub.link}" target="_blank">View</a></td>
        <td>${sub.notes || "—"}</td>
        <td><input type="number" class="marks-input" data-id="${sub._id}" value="${sub.marks || ''}" min="0" max="100" /></td>
        <td><button class="btn small-btn update-marks-btn" data-id="${sub._id}">Update</button></td>
      `;

      tbody.appendChild(tr);
    });

  // Add event listeners for update buttons
  document.querySelectorAll('.update-marks-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const input = document.querySelector(`.marks-input[data-id="${id}"]`);
      const marks = parseInt(input.value);
      if (isNaN(marks) || marks < 0 || marks > 100) {
        alert('Please enter a valid marks between 0 and 100');
        return;
      }
      try {
        await api.updateSubmissionMarks(id, marks);
        alert('Marks updated successfully');
        // Refresh submissions
        homeworkSubmissions = await api.fetchSubmissions();
        renderHomeworkSubmissions();
      } catch (err) {
        alert('Error updating marks: ' + err.message);
      }
    });
  });
}

/* ========= FACULTY: NOTES ========= */

function renderFacultyNotes() {
  if (currentRole !== "faculty") return;
  const list = document.getElementById("faculty-notes-list");
  if (!list) return;

  list.innerHTML = "";

  if (!notesData.length) {
    list.innerHTML = "<li>No notes shared yet.</li>";
    return;
  }

  notesData
    .slice()
    .reverse()
    .forEach((note) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${note.title}</strong><br/>
        <span>${note.description}</span><br/>
        <a href="${note.link}" target="_blank">Open</a><br/>
        <small>Added on: ${note.addedOn}</small>
      `;
      list.appendChild(li);
    });
}

/* ========= FACULTY: NOTIFICATIONS ========= */

function renderFacultyNotifications() {
  if (currentRole !== "faculty") return;
  const list = document.getElementById("faculty-notifications-list");
  if (!list) return;
  list.innerHTML = "";

  if (!notificationsData.length) {
    list.innerHTML = "<li>No notifications yet.</li>";
    return;
  }

  notificationsData
    .slice()
    .reverse()
    .forEach((n) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${n.title}</strong><br/>
        ${n.message}<br/>
        <small>On: ${n.createdOn}</small>
      `;
      list.appendChild(li);
    });
}

/* ========= FACULTY: STUDENTS ========= */

function renderFacultyStudents() {
  if (currentRole !== "faculty") return;
  const tbody = document.getElementById("faculty-students-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  studentsList.forEach((s) => {
    const marks = s.marks || {};
    let markValues = [];
    if (marks instanceof Map) {
        markValues = Array.from(marks.values());
    } else {
        markValues = Object.values(marks);
    }
    const avg =
      markValues.length === 0
        ? 0
        : Math.round(
            markValues.reduce((sum, m) => sum + Number(m || 0), 0) /
              markValues.length
          );
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.roll}</td>
      <td>${s.name}</td>
      <td>${s.attendance || 0}%</td>
      <td>${avg}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ========= FACULTY: MARKS ========= */

function renderFacultyMarks() {
  if (currentRole !== "faculty") return;
  const tbody = document.getElementById("faculty-marks-body") || document.getElementById("faculty-marks-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  studentsList.forEach((s) => {
    const marks = s.marks || {};
    const m1 = marks.Midterm1 || 0;
    const m2 = marks.Midterm2 || 0;
    const ass = marks.Assignment || 0;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.roll}</td>
      <td>${s.name}</td>
      <td><input type="number" class="mark-input" data-student-id="${s._id}" data-exam="Midterm1" value="${m1}"/></td>
      <td><input type="number" class="mark-input" data-student-id="${s._id}" data-exam="Midterm2" value="${m2}"/></td>
      <td><input type="number" class="mark-input" data-student-id="${s._id}" data-exam="Assignment" value="${ass}"/></td>
      <td><button class="btn primary-btn update-marks-btn" data-student-id="${s._id}">Update</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".update-marks-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const studentId = e.target.getAttribute("data-student-id");
      const inputs = tbody.querySelectorAll(`.mark-input[data-student-id="${studentId}"]`);
      const newMarks = {};
      inputs.forEach(input => {
        newMarks[input.getAttribute("data-exam")] = Number(input.value);
      });

      try {
        await api.updateStudentMarks(studentId, newMarks);
        alert("Marks updated successfully!");
        await renderAllViews();
        renderFacultyMarks(); // Refresh the marks section
      } catch (err) {
        console.error(err);
        alert("Failed to update marks.");
      }
    });
  });
}

/* ========= STUDENT: NOTES ========= */


function renderStudentNotes() {
  if (currentRole !== "student") return;
  const list = document.getElementById("student-notes-list");
  if (!list) return;

  list.innerHTML = "";
  if (!notesData.length) {
    list.innerHTML = "<li>No notes shared yet.</li>";
    return;
  }

  notesData
    .slice()
    .reverse()
    .forEach((note) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${note.title}</strong><br/>
        ${note.description}<br/>
        <a href="${note.link}" target="_blank">Open</a>
      `;
      list.appendChild(li);
    });
}

/* ========= STUDENT: ATTENDANCE ========= */

function renderStudentAttendance() {
  if (currentRole !== "student") return;
  const span = document.getElementById("student-attendance-value");
  if (!span) return;
  span.textContent = currentUser.attendance || 0;
}

/* ========= STUDENT: MARKS ========= */

function renderStudentMarks() {
  if (currentRole !== "student") return;
  const tbody = document.getElementById("student-marks-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  const marks = currentUser.marks || {};
  const entries = Object.entries(marks);

  if (!entries.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="2">No marks available yet.</td>`;
    tbody.appendChild(tr);
    return;
  }

  entries.forEach(([exam, mark]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exam}</td>
      <td>${mark}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ========= STUDENT: HOMEWORK ========= */

function initStudentForms() {
  const form = document.getElementById("student-upload-homework-form");
  const message = document.getElementById("student-hw-submit-message");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentUser || currentRole !== "student") return;

      const select = document.getElementById("student-hw-select");
      const linkInput = document.getElementById("student-hw-link");
      const notesInput = document.getElementById("student-hw-notes");

      const assignmentId = select.value; // MongoDB ID is a string
      const link = linkInput.value.trim();
      const notes = notesInput.value.trim();

      if (!assignmentId || !link) return;

      try {
          await api.submitHomework({ assignmentId, link, notes });
          form.reset();
          message.textContent = "Homework submitted!";
          setTimeout(() => (message.textContent = ""), 2000);

          await renderAllViews();
      } catch (err) {
          console.error(err);
      }
    });
  }
}


function renderStudentHomework() {
  if (currentRole !== "student") return;
  const list = document.getElementById("student-homework-list");
  const select = document.getElementById("student-hw-select");
  if (!list || !select) return;

  list.innerHTML = "";
  select.innerHTML = "";

  if (!homeworkAssignments.length) {
    list.innerHTML = "<li>No homework assigned yet.</li>";
    select.innerHTML = `<option value="">No homework available</option>`;
    return;
  }

  homeworkAssignments
    .slice()
    .reverse()
    .forEach((hw) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${hw.title}</strong><br/>
        <span>${hw.description}</span><br/>
        <small>Due: ${hw.dueDate}</small>
      `;
      list.appendChild(li);
    });

  homeworkAssignments.forEach((hw) => {
    const option = document.createElement("option");
    option.value = hw._id;
    option.textContent = `${hw.title} (Due ${hw.dueDate})`;
    select.appendChild(option);
  });
}

/* ========= STUDENT: NOTIFICATIONS ========= */

function renderStudentNotifications() {
  if (currentRole !== "student") return;
  const list = document.getElementById("student-notifications-list");
  if (!list) return;

  list.innerHTML = "";
  if (!notificationsData.length) {
    list.innerHTML = "<li>No notifications yet.</li>";
    return;
  }

  notificationsData
    .slice()
    .reverse()
    .forEach((n) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${n.title}</strong><br/>
        ${n.message}<br/>
        <small>On: ${n.createdOn}</small>
      `;
      list.appendChild(li);
    });
}

/* ========= STUDENT: QUIZ ========= */

function initQuiz() {
  const form = document.getElementById("quiz-form");
  const result = document.getElementById("quiz-result");
  if (!form || !result) return;

  form.innerHTML = "";
  quizQuestions.forEach((q, qIndex) => {
    const div = document.createElement("div");
    div.className = "quiz-question";
    let optionsHtml = "";

    q.options.forEach((opt, optIndex) => {
      const name = `quiz-q-${qIndex}`;
      const id = `quiz-q-${qIndex}-opt-${optIndex}`;
      optionsHtml += `
        <label for="${id}" style="display:block; margin-bottom:2px;">
          <input type="radio" id="${id}" name="${name}" value="${optIndex}"/>
          ${opt}
        </label>
      `;
    });

    div.innerHTML = `
      <p><strong>Q${qIndex + 1}.</strong> ${q.question}</p>
      ${optionsHtml}
      <hr/>
    `;
    form.appendChild(div);
  });

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "btn primary-btn";
  submitBtn.textContent = "Submit Quiz";
  form.appendChild(submitBtn);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let score = 0;

    quizQuestions.forEach((q, qIndex) => {
      const name = `quiz-q-${qIndex}`;
      const selected = form.querySelector(`input[name="${name}"]:checked`);
      if (selected && Number(selected.value) === q.correctIndex) {
        score += 1;
      }
    });

    result.textContent = `You scored ${score} / ${quizQuestions.length}.`;
  });
}
