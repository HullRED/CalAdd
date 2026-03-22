fetch('data/event.json')
  .then(res => res.json())
  .then(event => {
    document.getElementById('eventTitle').innerText = event.title;
    document.getElementById('eventSubtitle').innerText = event.subtitle;
    document.getElementById('eventDescription').innerText = event.description;

    document.getElementById('eventLocation').innerHTML = event.location.replace(/\n/g, '<br>');
    document.getElementById('eventDate').innerText = event.date;
    document.getElementById('eventTime').innerText = event.time;

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.replace(/\n/g, ' '))}`;
    document.getElementById('mapLink').href = mapUrl;

    const title = encodeURIComponent(event.title);
    const description = encodeURIComponent(`${event.subtitle}\n${event.description}`);
    const location = encodeURIComponent(event.location.replace(/\n/g, ' '));
    
    const timeParts = event.time.split('–').map(t => t.trim());
    const startDate = new Date(`${event.date} ${timeParts[0]}`).toISOString().replace(/-|:|\.\d+/g,'');
    const endDate = new Date(`${event.date} ${timeParts[1]}`).toISOString().replace(/-|:|\.\d+/g,'');

    // Apple ICS
    const appleIcs = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
DTSTART:${startDate}
DTEND:${endDate}
END:VEVENT
END:VCALENDAR`;
    document.getElementById('appleLink').href = appleIcs;

    // Google Calendar
    const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}&location=${location}`;
    document.getElementById('googleLink').href = gcal;

    // Outlook.com
    const outlook = `https://outlook.live.com/owa/?rru=addevent&startdt=${startDate}&enddt=${endDate}&subject=${title}&location=${location}&body=${description}`;
    document.getElementById('outlookLink').href = outlook;

    // Office 365
    const office365 = `https://outlook.office.com/owa/?rru=addevent&startdt=${startDate}&enddt=${endDate}&subject=${title}&location=${location}&body=${description}`;
    document.getElementById('officeLink').href = office365;

    // Yahoo
    const yahoo = `https://calendar.yahoo.com/?v=60&title=${title}&st=${startDate}&et=${endDate}&desc=${description}&in_loc=${location}`;
    document.getElementById('yahooLink').href = yahoo;

    // ICS download
    const icsFile = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
DTSTART:${startDate}
DTEND:${endDate}
END:VEVENT
END:VCALENDAR`;
    document.getElementById('icsLink').href = icsFile;
    document.getElementById('icsLink').setAttribute('download', `${event.title}.ics`);
  })
  .catch(err => console.log('Could not load event.json:', err));
