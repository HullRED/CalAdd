const runningOnServer = true; // Change to false for GitHub Pages detection if fetch/write fails

const loginOverlay = document.getElementById('loginOverlay');
const adminPanel = document.getElementById('adminPanel');
const restrictedMessage = document.getElementById('restrictedMessage');

const USERNAME = 'admin';
const PASSWORD = 'password123'; // replace with your secure credentials

function initAdmin() {
  // Check if running on server
  fetch('../data/event.json')
    .then(() => {
      loginOverlay.style.display = 'flex';
    })
    .catch(() => {
      loginOverlay.style.display = 'none';
      restrictedMessage.style.display = 'block';
    });
}

initAdmin();

// Handle login
document.getElementById('loginBtn').addEventListener('click', () => {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  if (user === USERNAME && pass === PASSWORD) {
    loginOverlay.style.display = 'none';
    adminPanel.style.display = 'block';
    loadEventData();
  } else {
    alert('Incorrect credentials!');
  }
});

// Load current event.json
function loadEventData() {
  fetch('../data/event.json')
    .then(res => res.json())
    .then(event => {
      document.getElementById('eventTitleInput').value = event.title;
      document.getElementById('eventSubtitleInput').value = event.subtitle;
      document.getElementById('eventDescriptionInput').value = event.description;
      document.getElementById('eventDateInput').value = event.date;
      document.getElementById('eventTimeInput').value = event.time;
      document.getElementById('eventLocationInput').value = event.location;
    })
    .catch(err => console.log('Error loading event.json:', err));
}

// Save updated event.json
document.getElementById('saveBtn').addEventListener('click', () => {
  const updatedEvent = {
    title: document.getElementById('eventTitleInput').value,
    subtitle: document.getElementById('eventSubtitleInput').value,
    description: document.getElementById('eventDescriptionInput').value,
    date: document.getElementById('eventDateInput').value,
    time: document.getElementById('eventTimeInput').value,
    location: document.getElementById('eventLocationInput').value
  };

  fetch('../data/event.json', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(updatedEvent, null, 2)
  })
  .then(() => alert('Event updated successfully!'))
  .catch(err => alert('Error saving event.json: ' + err));
});
