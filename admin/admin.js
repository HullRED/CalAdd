const loginOverlay = document.getElementById("loginOverlay");
const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.getElementById("loginBtn");

const USERNAME = "admin"; // you can move to server-side/env
const PASSWORD = "password123";

// Login logic
loginBtn.addEventListener("click", () => {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  if (u === USERNAME && p === PASSWORD) {
    loginOverlay.style.display = "none";
    adminPanel.style.display = "block";
    loadEvent();
  } else {
    alert("Incorrect username or password");
  }
});

// Load event from server (mocked with fetch to event.json)
function loadEvent() {
  fetch("../data/event.json")
    .then(res => res.json())
    .then(data => {
      document.getElementById("eventTitleInput").value = data.title;
      document.getElementById("eventSubtitleInput").value = data.subtitle;
      document.getElementById("eventDescriptionInput").value = data.description;
      document.getElementById("eventDateInput").value = data.date;
      document.getElementById("eventTimeInput").value = data.time;
      document.getElementById("eventLocationInput").value = data.location;
      document.getElementById("eventLatInput").value = data.lat;
      document.getElementById("eventLngInput").value = data.lng;
    });
}

// Save event (requires Node.js backend)
document.getElementById("saveBtn").addEventListener("click", () => {
  const event = {
    title: document.getElementById("eventTitleInput").value,
    subtitle: document.getElementById("eventSubtitleInput").value,
    description: document.getElementById("eventDescriptionInput").value,
    date: document.getElementById("eventDateInput").value,
    time: document.getElementById("eventTimeInput").value,
    location: document.getElementById("eventLocationInput").value,
    lat: parseFloat(document.getElementById("eventLatInput").value),
    lng: parseFloat(document.getElementById("eventLngInput").value)
  };

  fetch("../save-event", { // POST endpoint in server.js
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  })
  .then(res => res.json())
  .then(data => {
    if(data.success) alert("Event saved successfully!");
    else alert("Error saving event");
  });
});
