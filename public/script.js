// public/script.js

fetch('data/event.json')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(event => {
    // Event details
    document.getElementById('eventTitle').innerText = event.title;
    document.getElementById('eventSubtitle').innerText = event.subtitle;
    document.getElementById('eventDescription').innerText = event.description;
    document.getElementById('eventDate').innerText = event.date;
    document.getElementById('eventTime').innerText = event.time;
    document.getElementById('eventLocation').innerText = event.location;

    // Map links
    const loc = encodeURIComponent(event.location);
    document.getElementById('googleMapLink').href = `https://www.google.com/maps/search/?api=1&query=${loc}`;
    document.getElementById('appleMapLink').href  = `https://maps.apple.com/?q=${loc}`;

    // Helper to parse date and time correctly
    function parseEventDateTime(dateStr, timeStr) {
      // Remove weekday, e.g. "Saturday, 30 May 2026" → "30 May 2026"
      const cleanDate = dateStr.replace(/^[A-Za-z]+, /, '');
      return new Date(`${cleanDate} ${timeStr}`);
    }

    // Split time on any dash type: hyphen, en-dash, em-dash
    const timeParts = event.time.split(/\s*[-–—]\s*/);
    const startISO = parseEventDateTime(event.date, timeParts[0]).toISOString().replace(/-|:|\.\d+/g,'');
    const endISO   = parseEventDateTime(event.date, timeParts[1]).toISOString().replace(/-|:|\.\d+/g,'');

    const title       = encodeURIComponent(event.title);
    const description = encodeURIComponent(`${event.subtitle}\n${event.description}`);
    const location    = encodeURIComponent(event.location);

    // Apple ICS
    document.getElementById('appleLink').href = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
DTSTART:${startISO}
DTEND:${endISO}
END:VEVENT
END:VCALENDAR`;

    // Google Calendar
    document.getElementById('googleLink').href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${description}&location=${location}`;

    // Outlook.com
    document.getElementById('outlookLink').href = `https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${location}&body=${description}`;

    // Office 365
    document.getElementById('officeLink').href = `https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${location}&body=${description}`;

    // Yahoo
    document.getElementById('yahooLink').href = `https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${description}&in_loc=${location}`;

    // ICS download
    const icsLink = document.getElementById('icsLink');
    icsLink.href = document.getElementById('appleLink').href;
    icsLink.setAttribute('download', `${event.title}.ics`);

    // Add selected hover effect for buttons
    document.querySelectorAll('.calendar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.calendar-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  })
  .catch(err => console.error('Could not load event.json:', err));
