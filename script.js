const STORAGE_KEY = "hullRedCioEventData";

const defaultEvent = {
  title: "Hull Red CIO Event",
  subtitle: "Add this event to your calendar.",
  description: "Hull Red CIO event.",
  location: "Hull, United Kingdom",
  startDate: "2026-05-30",
  startTime: "18:00",
  endDate: "2026-05-30",
  endTime: "21:00"
};

function loadEventData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultEvent;
    const parsed = JSON.parse(saved);
    return { ...defaultEvent, ...parsed };
  } catch (error) {
    return defaultEvent;
  }
}

function formatDateForDisplay(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatTimeForDisplay(startTime, endTime) {
  return `${startTime} – ${endTime}`;
}

function toCalendarDateTime(dateStr, timeStr) {
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const mi = String(dt.getUTCMinutes()).padStart(2, "0");
  const ss = String(dt.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

function escapeICS(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildICS(event) {
  const dtStart = toCalendarDateTime(event.startDate, event.startTime);
  const dtEnd = toCalendarDateTime(event.endDate, event.endTime);
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hull Red CIO//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@hullredcio.local`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    `LOCATION:${escapeICS(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

// Functions to build Google, Office365, Outlook, Yahoo same as previous version...

function applyEventToPage(event) {
  document.getElementById("eventTitle").textContent = event.title;
  document.getElementById("eventSubtitle").textContent = event.subtitle;
  document.getElementById("eventDate").textContent = formatDateForDisplay(event.startDate);
  document.getElementById("eventTime").textContent = formatTimeForDisplay(event.startTime, event.endTime);
  document.getElementById("eventLocation").textContent = event.location;
  document.getElementById("eventDescription").textContent = event.description;

  const icsContent = buildICS(event);
  const icsBlob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const icsUrl = URL.createObjectURL(icsBlob);

  document.getElementById("btnGoogle").href = buildGoogleUrl(event);
  document.getElementById("btnOffice365").href = buildOffice365Url(event);
  document.getElementById("btnOutlook").href = buildOutlookUrl(event);
  document.getElementById("btnYahoo").href = buildYahooUrl(event);
  document.getElementById("btnApple").href = icsUrl;
  document.getElementById("btnICS").href = icsUrl;
}

document.addEventListener("DOMContentLoaded", () => {
  const event = loadEventData();
  applyEventToPage(event);
});
