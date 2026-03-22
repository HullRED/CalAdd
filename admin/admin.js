const loginOverlay = document.getElementById('loginOverlay');
const adminPanel = document.getElementById('adminPanel');

const USER = 'admin';
const PASS = 'password';

const loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if(username === USER && password === PASS) {
    loginOverlay.style.display = 'none';
    adminPanel.style.display = 'block';
    loadEvent();
  } else {
    alert('Incorrect credentials');
  }
});

// Load event.json values into form
function loadEvent() {
  fetch('../public/event.json')
    .then(res => res.json())
    .then(event => {
      document.getElementById('eventTitleInput').value = event.title;
      document.getElementById('eventSubtitleInput').value = event.subtitle;
      document.getElementById('eventDescriptionInput').value = event.description;
      document.getElementById('eventDateInput').value = event.date;
      document.getElementById('eventTimeInput').value = event.time;
      document.getElementById('eventLocationInput').value = event.location;
    });
}

// Save updated event
document.getElementById('saveBtn').addEventListener('click', () => {
  const updatedEvent = {
    title: document.getElementById('eventTitleInput').value,
    subtitle: document.getElementById('eventSubtitleInput').value,
    description: document.getElementById('eventDescriptionInput').value,
    date: document.getElementById('eventDateInput').value,
    time: document.getElementById('eventTimeInput').value,
    location: document.getElementById('eventLocationInput').value
  };

  // Save to JSON (Node.js server required)
  fetch('/save-event', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(updatedEvent)
  })
  .then(res => res.json())
  .then(resp => alert('Event saved!'))
  .catch(err => alert('Error saving event'));
});

/* --- Calendar logic --- */
const calendarDiv = document.getElementById('calendar');
let selectedDate = null;
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

function renderCalendar(month=currentMonth, year=currentYear){
  calendarDiv.innerHTML = '';

  const header = document.createElement('div');
  header.innerHTML = `
    <button id="prevMonth">&lt;</button>
    <span>${year}-${month+1}</span>
    <button id="nextMonth">&gt;</button>
  `;
  calendarDiv.appendChild(header);

  const table = document.createElement('table');
  const daysRow = document.createElement('tr');
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    const th = document.createElement('th');
    th.innerText = d;
    daysRow.appendChild(th);
  });
  table.appendChild(daysRow);

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month+1, 0).getDate();

  let tr = document.createElement('tr');
  for(let i=0;i<firstDay;i++){
    const td = document.createElement('td');
    tr.appendChild(td);
  }

  for(let d=1; d<=lastDate; d++){
    if(tr.children.length===7){
      table.appendChild(tr);
      tr = document.createElement('tr');
    }
    const td = document.createElement('td');
    td.innerText = d;
    td.addEventListener('click', () => {
      if(selectedDate) selectedDate.classList.remove('selected');
      td.classList.add('selected');
      selectedDate = td;
      document.getElementById('eventDateInput').value = `${d}-${month+1}-${year}`;
    });
    tr.appendChild(td);
  }
  table.appendChild(tr);
  calendarDiv.appendChild(table);

  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if(currentMonth<0){currentMonth=11;currentYear--;}
    renderCalendar(currentMonth,currentYear);
  });
  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if(currentMonth>11){currentMonth=0;currentYear++;}
    renderCalendar(currentMonth,currentYear);
  });
}

renderCalendar();
