// =========================
// ADMIN JS
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // ELEMENTS
  // =========================
  const loginOverlay = document.getElementById("loginOverlay");
  const loginBtn = document.getElementById("loginBtn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const adminPanel = document.getElementById("adminPanel");

  const eventTitleInput = document.getElementById("eventTitleInput");
  const eventSubtitleInput = document.getElementById("eventSubtitleInput");
  const eventDescriptionInput = document.getElementById("eventDescriptionInput");
  const eventDateInput = document.getElementById("eventDateInput");
  const eventStartTimeInput = document.getElementById("eventStartTimeInput");
  const eventEndTimeInput = document.getElementById("eventEndTimeInput");
  const eventLocationInput = document.getElementById("eventLocationInput");
  const saveBtn = document.getElementById("saveBtn");

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // =========================
  // GITHUB PAGES PROTECTION
  // =========================
  if (!isLocalhost) {
    if (loginOverlay) {
      loginOverlay.innerHTML = `
        <div class="restricted-card">
          <h2>Restricted Access</h2>
          <p>Sorry, this page is restricted to Admins of Hull Red CIO ONLY.</p>
          <a href="../index.html" class="return-home-btn">Return to Home</a>
        </div>
      `;
    }
    if (adminPanel) adminPanel.style.display = "none";
    return; // stop running JS on non-localhost
  }

  // =========================
  // LOGIN LOGIC (LOCAL ONLY)
  // =========================
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
          loginOverlay.style.display = "none";
          adminPanel.style.display = "block";
          loadEvent();
        } else {
          alert("Invalid credentials");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Could not connect to local server. Is server.js running?");
      }
    });
  }

  // =========================
  // TIME DROPDOWNS
  // =========================
  function generateTimes() {
    const times = [];
    for (let h = 0; h < 24; h++) {
      ["00", "30"].forEach(m => {
        times.push(`${String(h).padStart(2, "0")}:${m}`);
      });
    }
    return times;
  }

  const allTimes = generateTimes();

  function populateDropdown(drop, options) {
    if (!drop) return;
    drop.innerHTML = "";
    options.forEach(time => {
      const opt = document.createElement("option");
      opt.value = time;
      opt.textContent = time;
      drop.appendChild(opt);
    });
  }

  function adjustEndTimes() {
    const startIndex = allTimes.indexOf(eventStartTimeInput.value);
    const allowedEndTimes = allTimes.slice(startIndex + 1);
    populateDropdown(eventEndTimeInput, allowedEndTimes);
    eventEndTimeInput.value = allowedEndTimes.includes(eventEndTimeInput.value)
      ? eventEndTimeInput.value
      : allowedEndTimes[0];
  }

  if (eventStartTimeInput) {
    eventStartTimeInput.addEventListener("change", adjustEndTimes);
  }

  // =========================
  // LOAD EVENT
  // =========================
  async function loadEvent() {
    let event;
    try {
      const res = await fetch("/api/event");
      if (!res.ok) throw new Error("Server returned error");
      event = await res.json();
    } catch (err) {
      console.error("Could not load event.json:", err);
      // fallback test data
      event = {
        title: "Test Event",
        subtitle: "Subtitle",
        description: "Event Description",
        date: "Monday, 1st of January 2026",
        startTime: "19:30",
        endTime: "23:00",
        location: "Hull Red CIO Hall"
      };
    }

    if (eventTitleInput) eventTitleInput.value = event.title || "";
    if (eventSubtitleInput) eventSubtitleInput.value = event.subtitle || "";
    if (eventDescriptionInput) eventDescriptionInput.value = event.description || "";
    if (eventDateInput) eventDateInput.value = event.date || "";
    if (eventLocationInput) eventLocationInput.value = event.location || "";

    // populate start/end dropdowns
    populateDropdown(eventStartTimeInput, allTimes);
    eventStartTimeInput.value = event.startTime || "19:30";
    adjustEndTimes();
    eventEndTimeInput.value = event.endTime || "23:00";
  }

  // =========================
  // SAVE EVENT
  // =========================
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const updatedEvent = {
        title: eventTitleInput?.value.trim() || "",
        subtitle: eventSubtitleInput?.value.trim() || "",
        description: eventDescriptionInput?.value.trim() || "",
        date: eventDateInput?.value.trim() || "",
        startTime: eventStartTimeInput?.value || "",
        endTime: eventEndTimeInput?.value || "",
        location: eventLocationInput?.value.trim() || ""
      };

      try {
        const res = await fetch("/api/save-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEvent)
        });
        const data = await res.json();
        if (data.success) {
          alert(data.pushed
            ? "Event saved locally and pushed to GitHub Pages successfully."
            : "Event saved locally only.");
        } else {
          alert(data.message || "Failed to save event.");
          console.error(data.details || data);
        }
      } catch (err) {
        console.error("Save error:", err);
        alert("Could not save event. Is server.js running?");
      }
    });
  }

  // =========================
  // CALENDAR PICKER
  // =========================
  if (eventDateInput && eventDateInput.parentNode) {
    const calendarContainer = document.createElement("div");
    calendarContainer.className = "calendar-container";
    eventDateInput.parentNode.appendChild(calendarContainer);

    const calendarHeader = document.createElement("div");
    calendarHeader.className = "calendar-header";

    const monthWheel = document.createElement("select");
    monthWheel.className = "calendar-wheel month-wheel";

    const yearWheel = document.createElement("select");
    yearWheel.className = "calendar-wheel year-wheel";

    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    months.forEach((month, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = month;
      monthWheel.appendChild(opt);
    });

    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 5; y <= currentYear + 8; y++) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      yearWheel.appendChild(opt);
    }

    monthWheel.value = new Date().getMonth();
    yearWheel.value = currentYear;

    calendarHeader.appendChild(monthWheel);
    calendarHeader.appendChild(yearWheel);
    calendarContainer.appendChild(calendarHeader);

    const weekdayRow = document.createElement("div");
    weekdayRow.className = "calendar-weekdays";
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(day => {
      const d = document.createElement("div");
      d.className = "calendar-weekday";
      d.textContent = day;
      weekdayRow.appendChild(d);
    });
    calendarContainer.appendChild(weekdayRow);

    const calendarGrid = document.createElement("div");
    calendarGrid.className = "calendar-grid";
    calendarContainer.appendChild(calendarGrid);

    let selectedDay = null;

    function renderCalendar(month, year) {
      calendarGrid.innerHTML = "";
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-empty";
        calendarGrid.appendChild(empty);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const day = document.createElement("button");
        day.type = "button";
        day.className = "calendar-day rounded-cell"; // rounded cells
        day.textContent = d;
        if (selectedDay === d) day.classList.add("selected");

        day.addEventListener("click", () => {
          selectedDay = d;
          document.querySelectorAll(".calendar-day").forEach(el => el.classList.remove("selected"));
          day.classList.add("selected");
          const fullDate = new Date(year, month, d);
          const weekday = fullDate.toLocaleDateString("en-GB", { weekday: "long" });
          const ordinal = getOrdinal(d);
          eventDateInput.value = `${weekday}, ${d}${ordinal} of ${months[month]} ${year}`;
        });

        calendarGrid.appendChild(day);
      }
    }

    function getOrdinal(n) {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    }

    monthWheel.addEventListener("change", () => {
      selectedDay = null;
      renderCalendar(parseInt(monthWheel.value, 10), parseInt(yearWheel.value, 10));
    });
    yearWheel.addEventListener("change", () => {
      selectedDay = null;
      renderCalendar(parseInt(monthWheel.value, 10), parseInt(yearWheel.value, 10));
    });

    renderCalendar(parseInt(monthWheel.value, 10), parseInt(yearWheel.value, 10));
  }
});
