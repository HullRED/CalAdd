// admin.js

// === LOGIN LOGIC ===
const loginOverlay = document.getElementById("loginOverlay");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const adminPanel = document.getElementById("adminPanel");

// Replace with your real admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password";

loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    loginOverlay.style.display = "none";
    adminPanel.style.display = "block";
    loadEvent();
  } else {
    alert("Invalid credentials");
  }
});

// === EVENT JSON LOGIC ===
const fs = window.fs || null; // Only works locally with Node.js
const eventPath = "event.json"; // Relative to server root

function loadEvent() {
  fetch(eventPath)
    .then(res => res.json())
    .then(event => {
      document.getElementById("eventTitleInput").value = event.title;
      document.getElementById("eventSubtitleInput").value = event.subtitle;
      document.getElementById("eventDescriptionInput").value = event.description;
      document.getElementById("eventDateInput").value = event.date;
      document.getElementById("eventTimeInput").value = event.time;
      document.getElementById("eventLocationInput").value = event.location;
    })
    .catch(err => console.error("Could not load event.json:", err));
}

document.getElementById("saveBtn").addEventListener("click", () => {
  const updatedEvent = {
    title: document.getElementById("eventTitleInput").value,
    subtitle: document.getElementById("eventSubtitleInput").value,
    description: document.getElementById("eventDescriptionInput").value,
    date: document.getElementById("eventDateInput").value,
    time: document.getElementById("eventTimeInput").value,
    location: document.getElementById("eventLocationInput").value
  };

  if (!fs) {
    alert("Saving only works on a local server environment with Node.js");
    console.log("Updated event:", updatedEvent);
    return;
  }

  fs.writeFile(eventPath, JSON.stringify(updatedEvent, null, 2), err => {
    if (err) return console.error(err);
    alert("Event saved successfully!");
  });
});

// === CALENDAR PICKER ===
const calendarContainer = document.createElement("div");
calendarContainer.className = "calendar-container";
document.getElementById("eventDateInput").parentNode.appendChild(calendarContainer);

// Generate month/year wheels
const calendarHeader = document.createElement("div");
calendarHeader.className = "calendar-header";

const monthSelect = document.createElement("select");
const yearSelect = document.createElement("select");

// Populate month options
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
months.forEach((m, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = m;
  monthSelect.appendChild(opt);
});

// Populate year options (current year ±5)
const currentYear = new Date().getFullYear();
for (let y = currentYear - 5; y <= currentYear + 5; y++) {
  const opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearSelect.appendChild(opt);
}

calendarHeader.appendChild(monthSelect);
calendarHeader.appendChild(yearSelect);
calendarContainer.appendChild(calendarHeader);

// Calendar grid
const calendarGrid = document.createElement("div");
calendarGrid.className = "calendar-grid";
calendarContainer.appendChild(calendarGrid);

function renderCalendar(month, year) {
  calendarGrid.innerHTML = "";
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Fill empty days
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarGrid.appendChild(empty);
  }

  // Fill days
  for (let d = 1; d <= daysInMonth; d++) {
    const day = document.createElement("div");
    day.className = "calendar-day";
    day.textContent = d;

    day.addEventListener("click", () => {
      document.querySelectorAll(".calendar-day").forEach(e => e.classList.remove("selected"));
      day.classList.add("selected");
      document.getElementById("eventDateInput").value = `${d} ${months[month]} ${year}`;
    });

    calendarGrid.appendChild(day);
  }
}

// Initial render
renderCalendar(new Date().getMonth(), new Date().getFullYear());

// Update on wheel change
monthSelect.addEventListener("change", () => renderCalendar(+monthSelect.value, +yearSelect.value));
yearSelect.addEventListener("change", () => renderCalendar(+monthSelect.value, +yearSelect.value));
