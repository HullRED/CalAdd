// admin/admin.js

// Hard-coded local admin credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password';

const loginOverlay = document.getElementById('loginOverlay');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const saveStatus = document.getElementById('saveStatus');

// Login event
loginBtn.addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    loginOverlay.style.display = 'none';
    adminPanel.style.display = 'block';
    loadEvent();
  } else {
    loginError.style.display = 'block';
  }
});

// Load event.json into form
function loadEvent() {
  fetch('../data/event.json')
    .then(res => res.json())
    .then(data => {
      document.getElementById('eventTitleInput').value = data.title;
      document.getElementById('eventSubtitleInput').value = data.subtitle;
      document.getElementById('eventDescriptionInput').value = data.description;
      document.getElementById('eventDateInput').value = data.date;
      document.getElementById('eventTimeInput').value = data.time;
      document.getElementById('eventLocationInput').value = data.location;
    })
    .catch(err => {
      saveStatus.innerText = 'Failed to load event.';
    });
}

// Save event locally (requires Node.js server)
document.getElementById('saveBtn').addEventListener('click', () => {
  const eventData = {
    title: document.getElementById('eventTitleInput').value,
    subtitle: document.getElementById('eventSubtitleInput').value,
    description: document.getElementById('eventDescriptionInput').value,
    date: document.getElementById('eventDateInput').value,
    time: document.getElementById('eventTimeInput').value,
    location: document.getElementById('eventLocationInput').value
  };

  fetch('/admin/save-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  })
    .then(res => res.json())
    .then(resp => {
      saveStatus.innerText = resp.message;
    })
    .catch(err => {
      saveStatus.innerText = 'Failed to save event locally.';
    });
});
