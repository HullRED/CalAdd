const STORAGE_KEY = "hullRedCioEventData";

const defaultEvent = {
  title: "Hull Red CIO Event",
  subtitle: "Add this event to your calendar.",
  description: "Join us for our upcoming Hull Red CIO event.",
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

function buildGoogleUrl(event) {
  const start = toCalendarDateTime(event.startDate, event.startTime);
  const end = toCalendarDateTime(event.endDate, event.endTime);

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", event.title);
  url.searchParams.set("dates", `${start}/${end}`);
  url.searchParams.set("details", event.description);
  url.searchParams.set("location", event.location);
  return url.toString();
}

function buildOffice365Url(event) {
  const start = new Date(`${event.startDate}T${event.startTime}:00`).toISOString();
  const end = new Date(`${event.endDate}T${event.endTime}:00`).toISOString();

  const url = new URL("https://outlook.office.com/calendar/0/deeplink/compose");
  url.searchParams.set("path", "/calendar/action/compose");
  url.searchParams.set("rru", "addevent");
  url.searchParams.set("subject", event.title);
  url.searchParams.set("startdt", start);
  url.searchParams.set("enddt", end);
  url.searchParams.set("body", event.description);
  url.searchParams.set("location", event.location);
  return url.toString();
}

function buildOutlookUrl(event) {
  const start = new Date(`${event.startDate}T${event.startTime}:00`).toISOString();
  const end = new Date(`${event.endDate}T${event.endTime}:00`).toISOString();

  const url = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
  url.searchParams.set("path", "/calendar/action/compose");
  url.searchParams.set("rru", "addevent");
  url.searchParams.set("subject", event.title);
  url.searchParams.set("startdt", start);
  url.searchParams.set("enddt", end);
  url.searchParams.set("body", event.description);
  url.searchParams.set("location", event.location);
  return url.toString();
}

function buildYahooUrl(event) {
  const start = toCalendarDateTime(event.startDate, event.startTime);
  const end = toCalendarDateTime(event.endDate, event.endTime);

  const startDate = start.slice(0, 8);
  const startTime = start.slice(9, 15);
  const endDate = end.slice(0, 8);
  const endTime = end.slice(9, 15);

  const url = new URL("https://calendar.yahoo.com/");
  url.searchParams.set("v", "60");
  url.searchParams.set("view", "d");
  url.searchParams.set("type", "20");
  url.searchParams.set("title", event.title);
  url.searchParams.set("st", `${startDate}T${startTime}Z`);
  url.searchParams.set("et", `${endDate}T${endTime}Z`);
  url.searchParams.set("desc", event.description);
  url.searchParams.set("in_loc", event.location);
  return url.toString();
}

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
