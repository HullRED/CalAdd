const loginForm = document.getElementById('loginForm');
const editor = document.getElementById('editor');
const saveBtn = document.getElementById('saveBtn');

// Replace with your local credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "password123";

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const u = loginForm.username.value;
  const p = loginForm.password.value;

  if(u === ADMIN_USER && p === ADMIN_PASS){
    loginForm.style.display = 'none';
    editor.style.display = 'block';
    loadEvent();
  } else {
    alert('Invalid credentials');
  }
});

// Load event.json via local server
async function loadEvent(){
  const res = await fetch('../data/event.json');
  const event = await res.json();
  document.getElementById('editTitle').value = event.title;
  document.getElementById('editSubtitle').value = event.subtitle;
  document.getElementById('editDescription').value = event.description;
  document.getElementById('editDate').value = event.date;
  document.getElementById('editTime').value = event.time;
  document.getElementById('editLocation').value = event.location;
}

saveBtn.addEventListener('click', async () => {
  const updatedEvent = {
    title: document.getElementById('editTitle').value,
    subtitle: document.getElementById('editSubtitle').value,
    description: document.getElementById('editDescription').value,
    date: document.getElementById('editDate').value,
    time: document.getElementById('editTime').value,
    location: document.getElementById('editLocation').value
  };

  // Save via Node.js backend (fetch POST)
  const res = await fetch('/save-event', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(updatedEvent)
  });
  if(res.ok) alert('Event saved!');
  else alert('Failed to save event. Make sure Node.js server is running.');
});
