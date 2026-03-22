const STORAGE_KEY = "hullRedCioEventData";
const LOGIN_KEY = "hullRedCioAdminLoggedIn";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "HullRed2026!";

const defaultEvent = {
  title: "Hull Red CIO Event",
  subtitle: "Add this event to your calendar.",
  description: "Join us for our upcoming Hull Red CIO event.",
  location: "Hull, United Kingdom",
  startDate: "2026-05-30",
  startTime: "18:00",
  endDate: "2026-05-30",
  endTime: "21:00"
};

function loadEventData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultEvent;

    const parsed = JSON.parse(saved);
    return { ...defaultEvent, ...parsed };
  } catch (error) {
    return defaultEvent;
  }
}

function saveEventData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function populateForm(data) {
  document.getElementById("title").value = data.title;
  document.getElementById("subtitle").value = data.subtitle;
  document.getElementById("startDate").value = data.startDate;
  document.getElementById("startTime").value = data.startTime;
  document.getElementById("endDate").value = data.endDate;
  document.getElementById("endTime").value = data.endTime;
  document.getElementById("location").value = data.location;
  document.getElementById("description").value = data.description;
}

function collectFormData() {
  return {
    title: document.getElementById("title").value.trim() || defaultEvent.title,
    subtitle: document.getElementById("subtitle").value.trim() || defaultEvent.subtitle,
    startDate: document.getElementById("startDate").value || defaultEvent.startDate,
    startTime: document.getElementById("startTime").value || defaultEvent.startTime,
    endDate: document.getElementById("endDate").value || defaultEvent.endDate,
    endTime: document.getElementById("endTime").value || defaultEvent.endTime,
    location: document.getElementById("location").value.trim() || defaultEvent.location,
    description: document.getElementById("description").value.trim() || defaultEvent.description
  };
}

function showAdmin() {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("adminShell").classList.remove("hidden");
  populateForm(loadEventData());
}

function showLogin() {
  document.getElementById("adminShell").classList.add("hidden");
  document.getElementById("loginBox").classList.remove("hidden");
}

function setNotice(id, message) {
  document.getElementById(id).textContent = message;
}

document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem(LOGIN_KEY) === "true";

  if (isLoggedIn) {
    showAdmin();
  } else {
    showLogin();
  }

  document.getElementById("loginBtn").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(LOGIN_KEY, "true");
      setNotice("loginNotice", "");
      showAdmin();
    } else {
      setNotice("loginNotice", "Invalid username or password.");
    }
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    const data = collectFormData();
    saveEventData(data);
    setNotice("saveNotice", "Event saved successfully. Refresh the main page if it's already open.");
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    saveEventData(defaultEvent);
    populateForm(defaultEvent);
    setNotice("saveNotice", "Event reset to default values.");
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(LOGIN_KEY);
    setNotice("saveNotice", "");
    showLogin();
  });
});
