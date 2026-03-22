// public/script.js

// Fetch event.json from GitHub Pages root
fetch('/CalAdd/data/event.json')
  .then(res => res.json())
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
    document.getElementById('appleMapLink').href = `https://maps.apple.com/?q=${loc}`;

    // Calendar links
    const [startStr, endStr] = event.time.split('–').map(t => t.trim());
    const startTime = new Date(`${event.date} ${startStr}`).toISOString().replace(/-|:|\.\d+/g,'');
    const endTime = new Date(`${event.date} ${endStr}`).toISOString().replace(/-|:|\.\d+/g,'');

    const title = encodeURIComponent(event.title);
    const description = encodeURIComponent(`${event.subtitle}\n${event.description}`);
    const location = encodeURIComponent(event.location);

    // Apple ICS
    document.getElementById('appleLink').href = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
DTSTART:${startTime}
DTEND:${endTime}
END:VEVENT
END:VCALENDAR`;

    // Google Calendar
    document.getElementById('googleLink').href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${description}&location=${location}`;

    // Outlook.com
    document.getElementById('outlookLink').href = `https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${startTime}&enddt=${endTime}&location=${location}&body=${description}`;

    // Office 365
    document.getElementById('officeLink').href = `https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${startTime}&enddt=${endTime}&location=${location}&body=${description}`;

    // Yahoo Calendar
    document.getElementById('yahooLink').href = `https://calendar.yahoo.com/?v=60&title=${title}&st=${startTime}&et=${endTime}&desc=${description}&in_loc=${location}`;

    // ICS download fallback
    const icsLink = document.getElementById('icsLink');
    icsLink.href = document.getElementById('appleLink').href;
    icsLink.setAttribute('download', `${event.title}.ics`);

    // Add hover + selected effect for buttons
    document.querySelectorAll('.calendar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.calendar-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  })
  .catch(err => console.error('Could not load event.json:', err));
