// admin.js

// === LOGIN LOGIC ===
const loginOverlay = document.getElementById("loginOverlay");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const adminPanel = document.getElementById("adminPanel");

// Fetch credentials from environment via backend (for local testing)
const ADMIN_USERNAME = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASS || "password123";

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

// === LOAD EVENT ===
function loadEvent() {
  fetch('/event')
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

// === SAVE EVENT ===
document.getElementById("saveBtn").addEventListener("click", async () => {
  const updatedEvent = {
    title: document.getElementById("eventTitleInput").value,
    subtitle: document.getElementById("eventSubtitleInput").value,
    description: document.getElementById("eventDescriptionInput").value,
    date: document.getElementById("eventDateInput").value,
    time: document.getElementById("eventTimeInput").value,
    location: document.getElementById("eventLocationInput").value
  };

  try {
    const resp = await fetch('/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent)
    });
    const data = await resp.json();
    if (data.success) {
      alert('Event updated successfully and pushed to GitHub!');
    } else {
      alert('Failed to push to GitHub: ' + JSON.stringify(data.error));
    }
  } catch (err) {
    console.error(err);
    alert('Error updating event.');
  }
});

// === CALENDAR PICKER ===
const calendarContainer = document.createElement("div");
calendarContainer.className = "calendar-container";
document.getElementById("eventDateInput").parentNode.appendChild(calendarContainer);

const calendarHeader = document.createElement("div");
calendarHeader.className = "calendar-header";

const monthSelect = document.createElement("select");
const yearSelect = document.createElement("select");

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
months.forEach((m,i)=> { const o=document.createElement("option"); o.value=i;o.textContent=m;monthSelect.appendChild(o); });

const currentYear = new Date().getFullYear();
for(let y=currentYear-5; y<=currentYear+5; y++){ const o=document.createElement("option"); o.value=y;o.textContent=y;yearSelect.appendChild(o); }

calendarHeader.appendChild(monthSelect);
calendarHeader.appendChild(yearSelect);
calendarContainer.appendChild(calendarHeader);

const calendarGrid = document.createElement("div");
calendarGrid.className="calendar-grid";
calendarContainer.appendChild(calendarGrid);

function renderCalendar(month, year) {
  calendarGrid.innerHTML="";
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1,0).getDate();

  for(let i=0;i<firstDay;i++){ calendarGrid.appendChild(document.createElement("div")); }

  for(let d=1; d<=daysInMonth; d++){
    const day = document.createElement("div");
    day.className="calendar-day";
    day.textContent=d;

    day.addEventListener("click",()=>{
      document.querySelectorAll(".calendar-day").forEach(e=>e.classList.remove("selected"));
      day.classList.add("selected");
      document.getElementById("eventDateInput").value=`${d} ${months[month]} ${year}`;
    });

    calendarGrid.appendChild(day);
  }
}

// Initial render
renderCalendar(new Date().getMonth(), new Date().getFullYear());

// Update calendar on month/year change
monthSelect.addEventListener("change", ()=> renderCalendar(+monthSelect.value, +yearSelect.value));
yearSelect.addEventListener("change", ()=> renderCalendar(+monthSelect.value, +yearSelect.value));
