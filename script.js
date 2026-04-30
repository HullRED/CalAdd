document.addEventListener("DOMContentLoaded", () => {

fetch("data/event.json")
.then(r => r.json())
.then(event => {

  /* ======================================================
     CORE ELEMENTS
  ====================================================== */
  const startDate = new Date(event.date + "T" + event.startTime);
  const get = (id) => document.getElementById(id);

  const countdown = get("countdown");
  if (!countdown) return;

  countdown.innerHTML = "";

  /* ======================================================
     DIGITS
  ====================================================== */
  const ids = [
    "M1","M2",
    "W1","W2",
    "D1","D2",
    "H1","H2",
    "m1","m2",
    "s1","s2"
  ];

  const state = {};

  const row = document.createElement("div");
  row.className = "flip-row";

  row.style.display = "flex";
  row.style.flexDirection = "row";
  row.style.flexWrap = "nowrap";
  row.style.gap = "8px";
  row.style.alignItems = "center";

  function createDigit(id) {
    const el = document.createElement("div");
    el.className = "flip-digit";
    el.id = id;

    el.innerHTML = `
      <div class="flip-current current">0</div>
      <div class="flip-next next">0</div>
    `;

    row.appendChild(el);
    state[id] = null;
  }

  ids.forEach(createDigit);
  countdown.appendChild(row);

  /* ======================================================
     REAL CALENDAR DIFF
  ====================================================== */
  function diff(from, to) {

    let start = new Date(from);
    let end = new Date(to);

    if (end < start) [start, end] = [end, start];

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    let hours = end.getHours() - start.getHours();
    let minutes = end.getMinutes() - start.getMinutes();
    let seconds = end.getSeconds() - start.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }

    if (days < 0) {
      const prev = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prev.getDate();
      months--;
    }

    if (months < 0) {
      months += 12;
      years--;
    }

    return {
      months: months + years * 12,
      weeks: Math.floor(days / 7),
      days: days % 7,
      hours,
      minutes,
      seconds
    };
  }

  const pad2 = (n) => String(n).padStart(2, "0");

  /* ======================================================
     FLIP DIGIT (UP ONLY)
  ====================================================== */
  function flipDigit(id, newVal) {

    const box = get(id);
    if (!box) return;

    const current = box.querySelector(".current");
    const next = box.querySelector(".next");

    if (!current || !next) return;

    const currentVal = parseInt(current.innerText || "0");

    if (state[id] === null) {
      current.innerText = newVal;
      state[id] = newVal;
      return;
    }

    if (currentVal === newVal) return;

    /* ONLY DOWNWARD */
    if (newVal > currentVal) return;

    next.innerText = newVal;

    box.classList.add("flipping");

    current.style.color = "#fff";
    next.style.color = "#777";

    setTimeout(() => {
      current.innerText = newVal;

      box.classList.remove("flipping");

      current.style.color = "#fff";
      next.style.color = "#fff";

      state[id] = newVal;
    }, 260);
  }

  /* ======================================================
     MAIN LOOP
  ====================================================== */
  function update() {

    const now = new Date();
    const t = diff(now, startDate);

    const full =
      pad2(t.months) +
      pad2(t.weeks) +
      pad2(t.days) +
      pad2(t.hours) +
      pad2(t.minutes) +
      pad2(t.seconds);

    const digits = full.split("");

    for (let i = 0; i < ids.length; i++) {
      flipDigit(ids[i], digits[i]);
    }
  }

  update();
  setInterval(update, 1000);

  /* ======================================================
     TEXT CONTENT
  ====================================================== */
  const set = (id, val) => {
    const el = get(id);
    if (el) el.innerText = val;
  };

  set("eventTitle", event.title);
  set("eventSubtitle", event.subtitle);
  set("eventDescription", event.description);
  set("eventLocation", event.location);
  set("eventDate", startDate.toLocaleDateString("en-GB"));
  set("eventTime", event.startTime + " - " + event.endTime);

  /* ======================================================
     MAP LINKS
  ====================================================== */
  const loc = encodeURIComponent(event.location);

  const g = get("googleMapLink");
  if (g) g.href = `https://www.google.com/maps/search/?api=1&query=${loc}`;

  const a = get("appleMapLink");
  if (a) a.href = `https://maps.apple.com/?q=${loc}`;

  /* ======================================================
     CALENDAR LINKS (ALL PLATFORMS FIXED)
  ====================================================== */

  const startISO = startDate.toISOString();
  const endISO = new Date(startDate.getTime() + 3600000).toISOString();

  const title = encodeURIComponent(event.title);
  const desc = encodeURIComponent(event.subtitle + "\n" + event.description);

  const link = (id, url) => {
    const el = get(id);
    if (el) el.href = url;
  };

  /* Google Calendar */
  link("googleLink",
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${desc}&location=${loc}`
  );

  /* Outlook Web */
  link("outlookLink",
    `https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`
  );

  /* Microsoft 365 */
  link("officeLink",
    `https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`
  );

  /* Yahoo */
  link("yahooLink",
    `https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${desc}&in_loc=${loc}`
  );

  /* ======================================================
     🍎 iOS / macOS / iPadOS (NATIVE CALENDAR FILE)
  ====================================================== */

  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hull Red CIO//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTART:${startISO.replace(/[-:]/g,"").split(".")[0]}Z
DTEND:${endISO.replace(/[-:]/g,"").split(".")[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.subtitle} ${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);

  const apple = get("appleLink");
  if (apple) {
    apple.href = url;
    apple.download = "event.ics";
  }

  /* ======================================================
     POSTER MODAL
  ====================================================== */

  const modal = get("posterModal");
  const thumb = get("posterThumb");
  const close = get("posterClose");

  if (modal && thumb) {
    thumb.onclick = () => modal.classList.add("show");
  }

  if (modal && close) {
    close.onclick = () => modal.classList.remove("show");
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove("show");
    };
  }

})
.catch(err => console.error("Countdown error:", err));

});
