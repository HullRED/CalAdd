const loginOverlay = document.getElementById('loginOverlay');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const eventTitleInput = document.getElementById('eventTitleInput');
const eventSubtitleInput = document.getElementById('eventSubtitleInput');
const eventDescriptionInput = document.getElementById('eventDescriptionInput');
const eventDateInput = document.getElementById('eventDateInput');
const eventTimeInput = document.getElementById('eventTimeInput');
const eventLocationInput = document.getElementById('eventLocationInput');

const saveBtn = document.getElementById('saveBtn');

// Admin credentials in .env or local variables
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';

// Login logic
loginBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if(username === ADMIN_USER && password === ADMIN_PASS) {
    loginOverlay.style.display = 'none';
    adminPanel.style.display = 'block';
    loadEvent();
  } else {
    alert('Incorrect username or password');
  }
});

// Load event.json
function loadEvent() {
  fetch('../data/event.json')
    .then(res => res.json())
    .then(event => {
      eventTitleInput.value = event.title;
      eventSubtitleInput.value = event.subtitle;
      eventDescriptionInput.value = event.description;
      eventDateInput.value = event.date;
      eventTimeInput.value = event.time;
      eventLocationInput.value = event.location;
    })
    .catch(err => console.error('Cannot load event.json', err));
}

// Save event.json via POST to server (Node.js required)
saveBtn.addEventListener('click', () => {
  const updatedEvent = {
    title: eventTitleInput.value,
    subtitle: eventSubtitleInput.value,
    description: eventDescriptionInput.value,
    date: eventDateInput.value,
    time: eventTimeInput.value,
    location: eventLocationInput.value
  };

  fetch('/update-event', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(updatedEvent)
  })
  .then(res => {
    if(res.ok) alert('Event updated successfully');
    else alert('Failed to update event');
  })
  .catch(err => alert('Server not running locally'));
});
