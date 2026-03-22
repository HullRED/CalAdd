const loginOverlay = document.getElementById("loginOverlay");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const adminPanel = document.getElementById("adminPanel");

// ===== LOGIN LOGIC =====
loginBtn.addEventListener("click", () => {
  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: usernameInput.value.trim(),
      password: passwordInput.value.trim()
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      loginOverlay.style.display = "none";
      adminPanel.style.display = "block";
      loadEvent();
    } else {
      alert("Invalid credentials");
    }
  });
});

// ===== EVENT LOGIC =====
function loadEvent() {
  fetch("/event")
    .then(res => res.json())
    .then(event => {
      document.getElementById("eventTitleInput").value = event.title;
      document.getElementById("eventSubtitleInput").value = event.subtitle;
      document.getElementById("eventDescriptionInput").value = event.description;
      document.getElementById("eventDateInput").value = event.date;
      document.getElementById("eventTimeInput").value = event.time;
      document.getElementById("eventLocationInput").value = event.location;
    })
    .catch(err => console.error("Could not load event:", err));
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

  fetch("/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedEvent)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) alert("Event saved successfully!");
  });
});

// ===== CALENDAR PICKER =====
const calendarContainer = document.querySelector(".calendar-container");

const calendarHeader = document.createElement("div");
calendarHeader.className = "calendar-header";

const monthSelect = document.createElement("select");
const yearSelect = document.createElement("select");

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
months.forEach((m,i)=>{
  const opt = document.createElement("option");
  opt.value=i; opt.textContent=m;
  monthSelect.appendChild(opt);
});

const currentYear = new Date().getFullYear();
for(let y=currentYear-5;y<=currentYear+5;y++){
  const opt = document.createElement("option");
  opt.value=y; opt.textContent=y;
  yearSelect.appendChild(opt);
}

calendarHeader.appendChild(monthSelect);
calendarHeader.appendChild(yearSelect);
calendarContainer.appendChild(calendarHeader);

const calendarGrid = document.createElement("div");
calendarGrid.className="calendar-grid";
calendarContainer.appendChild(calendarGrid);

function renderCalendar(month,year){
  calendarGrid.innerHTML="";
  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();

  for(let i=0;i<firstDay;i++){calendarGrid.appendChild(document.createElement("div"));}
  for(let d=1;d<=daysInMonth;d++){
    const day = document.createElement("div");
    day.className="calendar-day"; day.textContent=d;
    day.addEventListener("click",()=>{
      document.querySelectorAll(".calendar-day").forEach(e=>e.classList.remove("selected"));
      day.classList.add("selected");
      document.getElementById("eventDateInput").value = `${d} ${months[month]} ${year}`;
    });
    calendarGrid.appendChild(day);
  }
}

renderCalendar(new Date().getMonth(), new Date().getFullYear());
monthSelect.addEventListener("change",()=>renderCalendar(+monthSelect.value,+yearSelect.value));
yearSelect.addEventListener("change",()=>renderCalendar(+monthSelect.value,+yearSelect.value));
