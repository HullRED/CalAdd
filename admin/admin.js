const STORAGE_KEY = "hullRedCioEventData";
const AUTH_KEY = "hullRedCioAdminAuth";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "HullRed2026!";

const defaultEvent = {
  title: "Hull Red CIO Community Event",
  startDate: "2026-04-25",
  endDate: "2026-04-25",
  startTime: "18:30",
  endTime: "21:00",
  location: "Hull, United Kingdom",
  description: "Join us for our latest Hull Red CIO gathering. Add this event to your calendar so you never miss important updates, activities, or community moments."
};

function loadEvent() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...defaultEvent };
    const parsed = JSON.parse(saved);
    return { ...defaultEvent, ...parsed };
  } catch (err) {
    return { ...defaultEvent };
  }
}

function saveEvent(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function setAuthState(isAuthed) {
  localStorage.setItem(AUTH_KEY, isAuthed ? "1" : "0");
}

function isAuthed() {
  return localStorage.getItem(AUTH_KEY) === "1";
}

function populateAdminForm(data) {
  document.getElementById("eventTitle").value = data.title || "";
  document.getElementById("eventStartDate").value = data.startDate || "";
  document.getElementById("eventEndDate").value = data.endDate || "";
  document.getElementById("eventStartTime").value = data.startTime || "";
  document.getElementById("eventEndTime").value = data.endTime || "";
  document.getElementById("eventLocation").value = data.location || "";
  document.getElementById("eventDescription").value = data.description || "";
}

function getFormData() {
  return {
    title: document.getElementById("eventTitle").value.trim(),
    startDate: document.getElementById("eventStartDate").value,
    endDate: document.getElementById("eventEndDate").value,
    startTime: document.getElementById("eventStartTime").value,
    endTime: document.getElementById("eventEndTime").value,
    location: document.getElementById("eventLocation").value.trim(),
    description: document.getElementById("eventDescription").value.trim()
  };
}

function validateEvent(data) {
  if (!data.title || !data.startDate || !data.endDate || !data.startTime || !data.endTime || !data.location) {
    return "Please complete all required fields.";
  }

  const start = new Date(`${data.startDate}T${data.startTime}:00`);
  const end = new Date(`${data.endDate}T${data.endTime}:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Please enter valid date and time values.";
  }

  if (end <= start) {
    return "End date/time must be after the start date/time.";
  }

  return "";
}

function setStatus(el, message, type = "") {
  el.textContent = message;
  el.className = "status";
  if (type) el.classList.add(type);
}

function showAdminUI() {
  document.getElementById("loginCard").classList.add("hidden");
  document.getElementById("adminPanel").classList.remove("hidden");
  populateAdminForm(loadEvent());
  setStatus(document.getElementById("adminStatus"), "");
}

function showLoginUI() {
  document.getElementById("loginCard").classList.remove("hidden");
  document.getElementById("adminPanel").classList.add("hidden");
}

function login() {
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    setAuthState(true);
    showAdminUI();
    setStatus(document.getElementById("loginStatus"), "");
    setStatus(document.getElementById("adminStatus"), "Admin access granted.", "success");
  } else {
    setStatus(document.getElementById("loginStatus"), "Invalid username or password.", "error");
  }
}

function logout() {
  setAuthState(false);
  showLoginUI();
  setStatus(document.getElementById("loginStatus"), "Logged out.", "success");
}

function initAdminPage() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const adminPassword = document.getElementById("adminPassword");
  const adminUsername = document.getElementById("adminUsername");
  const adminStatus = document.getElementById("adminStatus");

  if (isAuthed()) {
    showAdminUI();
  } else {
    showLoginUI();
  }

  loginBtn.addEventListener("click", login);

  adminPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") login();
  });

  adminUsername.addEventListener("keydown", (e) => {
    if (e.key === "Enter") login();
  });

  saveBtn.addEventListener("click", () => {
    const updated = getFormData();
    const validationError = validateEvent(updated);

    if (validationError) {
      setStatus(adminStatus, validationError, "error");
      return;
    }

    saveEvent(updated);
    setStatus(adminStatus, "Event saved successfully. The public page will reflect this in the same browser.", "success");
  });

  resetBtn.addEventListener("click", () => {
    saveEvent(defaultEvent);
    populateAdminForm(defaultEvent);
    setStatus(adminStatus, "Event reset to default values.", "success");
  });

  logoutBtn.addEventListener("click", logout);
}

document.addEventListener("DOMContentLoaded", initAdminPage);
