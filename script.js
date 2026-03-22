const STORAGE_KEY = "hullRedCioEventData";

const defaultEvent = {
  title: "Hull Red CIO Community Event",
  startDate: "2026-04-25",
  endDate: "2026-04-25",
  startTime: "18:30",
  endTime: "21:00",
  location: "Hull, United Kingdom",
  description: "Join us for our latest Hull Red CIO gathering. Add this event to your calendar so you never miss important updates, activities, or community moments."
};

function loadEvent() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...defaultEvent };
    const parsed = JSON.parse(saved);
    return { ...defaultEvent, ...parsed };
  } catch (err) {
    return { ...defaultEvent };
  }
}

function formatDateLong(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatTimeRange(startTime, endTime) {
  return `${startTime} - ${endTime}`;
}

function toICSDateTime(dateStr, timeStr) {
  return `${dateStr.replaceAll("-", "")}T${timeStr.replaceAll(":", "")}00`;
}

function toGoogleDateTime(dateStr, timeStr) {
  return `${dateStr.replaceAll("-", "")}T${timeStr.replaceAll(":", "")}00`;
}

function toYahooDuration(startDate, startTime, endDate, endTime) {
  const start = new Date(`${startDate}T${startTime}:00`);
  const end = new Date(`${endDate}T${endTime}:00`);
  const diffMs = Math.max(0, end - start);
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}${minutes}`;
}

function escapeICS(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildICS(data) {
  const uid = `hull-red-cio-${Date.now()}@hullredcio.local`;
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dtStart = toICSDateTime(data.startDate, data.startTime);
  const dtEnd = toICSDateTime(data.endDate, data.endTime);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hull Red CIO//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(data.title)}`,
    `DESCRIPTION:${escapeICS(data.description)}`,
    `LOCATION:${escapeICS(data.location)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

function downloadICS(data) {
  const ics = buildICS(data);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (data.title || "event").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  a.href = url;
  a.download = `${safeName || "event"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildGoogleUrl(data) {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const params = new URLSearchParams({
    text: data.title,
    dates: `${toGoogleDateTime(data.startDate, data.startTime)}/${toGoogleDateTime(data.endDate, data.endTime)}`,
    details: data.description,
    location: data.location
  });
  return `${base}&${params.toString()}`;
}

function buildOffice365Url(data) {
  const base = "https://outlook.office.com/calendar/0/deeplink/compose";
  const start = `${data.startDate}T${data.startTime}:00`;
  const end = `${data.endDate}T${data.endTime}:00`;
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: data.title,
    body: data.description,
    location: data.location,
    startdt: start,
    enddt: end
  });
  return `${base}?${params.toString()}`;
}

function buildOutlookUrl(data) {
  const base = "https://outlook.live.com/calendar/0/deeplink/compose";
  const start = `${data.startDate}T${data.startTime}:00`;
  const end = `${data.endDate}T${data.endTime}:00`;
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: data.title,
    body: data.description,
    location: data.location,
    startdt: start,
    enddt: end
  });
  return `${base}?${params.toString()}`;
}

function buildYahooUrl(data) {
  const base = "https://calendar.yahoo.com/";
  const params = new URLSearchParams({
    v: "60",
    view: "d",
    type: "20",
    title: data.title,
    st: toICSDateTime(data.startDate, data.startTime),
    dur: toYahooDuration(data.startDate, data.startTime, data.endDate, data.endTime),
    desc: data.description,
    in_loc: data.location
  });
  return `${base}?${params.toString()}`;
}

function initPublicPage() {
  const data = loadEvent();

  const displayTitle = document.getElementById("displayTitle");
  const displayDate = document.getElementById("displayDate");
  const displayTime = document.getElementById("displayTime");
  const displayLocation = document.getElementById("displayLocation");
  const displayDescription = document.getElementById("displayDescription");

  const googleBtn = document.getElementById("googleBtn");
  const office365Btn = document.getElementById("office365Btn");
  const outlookBtn = document.getElementById("outlookBtn");
  const yahooBtn = document.getElementById("yahooBtn");
  const appleBtn = document.getElementById("appleBtn");
  const icsBtn = document.getElementById("icsBtn");

  displayTitle.textContent = data.title;
  displayDate.textContent = formatDateLong(data.startDate);
  displayTime.textContent = formatTimeRange(data.startTime, data.endTime);
  displayLocation.textContent = data.location;
  displayDescription.textContent = data.description || "";

  googleBtn.href = buildGoogleUrl(data);
  office365Btn.href = buildOffice365Url(data);
  outlookBtn.href = buildOutlookUrl(data);
  yahooBtn.href = buildYahooUrl(data);

  appleBtn.addEventListener("click", () => downloadICS(data));
  icsBtn.addEventListener("click", () => downloadICS(data));
}

document.addEventListener("DOMContentLoaded", initPublicPage);
