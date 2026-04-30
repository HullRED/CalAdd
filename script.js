document.addEventListener("DOMContentLoaded", () => {

fetch("data/event.json")
.then(r => r.json())
.then(event => {

  /* ======================================================
     CORE
  ====================================================== */
  const startDate = new Date(event.date + "T" + event.startTime);
  const get = (id) => document.getElementById(id);

  const countdown = get("countdown");
  if (!countdown) return;

  countdown.innerHTML = "";

  /* ======================================================
     BUILD COUNTDOWN UI
     [M1][M2] Months [W1][W2] Weeks ...
  ====================================================== */

  const units = [
    { key:"M", label:"Months" },
    { key:"W", label:"Weeks" },
    { key:"D", label:"Days" },
    { key:"H", label:"Hours" },
    { key:"m", label:"Minutes" },
    { key:"s", label:"Seconds" }
  ];

  const ids = [];
  const state = {};

  const row = document.createElement("div");
  row.className = "flip-row";
  row.style.display = "flex";
  row.style.flexWrap = "wrap";
  row.style.gap = "14px";
  row.style.alignItems = "center";

  units.forEach(unit => {

    const group = document.createElement("div");
    group.className = "flip-group";
    group.style.display = "flex";
    group.style.alignItems = "center";
    group.style.gap = "6px";

    for (let i = 1; i <= 2; i++) {

      const id = unit.key + i;
      ids.push(id);
      state[id] = null;

      const digit = document.createElement("div");
      digit.className = "flip-digit";
      digit.id = id;

      digit.innerHTML = `
        <div class="flip-current current">0</div>
        <div class="flip-next next">0</div>
      `;

      group.appendChild(digit);
    }

    const label = document.createElement("span");
    label.className = "flip-unit-label";
    label.innerText = unit.label;
    label.style.fontSize = "15px";
    label.style.fontWeight = "700";
    label.style.color = "#fff";
    label.style.minWidth = "72px";

    group.appendChild(label);
    row.appendChild(group);
  });

  countdown.appendChild(row);

  /* ======================================================
     REAL DATE DIFFERENCE
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

  const pad2 = (n) => String(Math.max(0, n)).padStart(2, "0");

  /* ======================================================
     TRUE INDIVIDUAL FLIP ENGINE
     only changed digit flips
     always upward
  ====================================================== */
  function flipDigit(id, newVal) {

    const box = get(id);
    if (!box) return;

    const current = box.querySelector(".current");
    const next = box.querySelector(".next");

    if (!current || !next) return;

    if (state[id] === null) {
      current.innerText = newVal;
      state[id] = newVal;
      return;
    }

    if (String(state[id]) === String(newVal)) return;

    next.innerText = newVal;

    box.classList.remove("flipping");
    void box.offsetWidth; // reflow restart animation
    box.classList.add("flipping");

    current.style.color = "#fff";
    next.style.color = "#777";

    setTimeout(() => {
      current.innerText = newVal;
      current.style.color = "#fff";
      next.style.color = "#fff";
      box.classList.remove("flipping");
      state[id] = newVal;
    }, 260);
  }

  /* ======================================================
     MAIN LOOP
  ====================================================== */
  function update() {

    const now = new Date();
    const t = diff(now, startDate);

    const values = [
      pad2(t.months),
      pad2(t.weeks),
      pad2(t.days),
      pad2(t.hours),
      pad2(t.minutes),
      pad2(t.seconds)
    ];

    const digits = values.join("").split("");

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

  const googleMap = get("googleMapLink");
  if (googleMap) {
    googleMap.href =
      `https://www.google.com/maps/search/?api=1&query=${loc}`;
  }

  const appleMap = get("appleMapLink");
  if (appleMap) {
    appleMap.href =
      `https://maps.apple.com/?q=${loc}`;
  }

  /* ======================================================
     CALENDAR LINKS
  ====================================================== */
  const startISO = startDate.toISOString();
  const endISO = new Date(startDate.getTime() + 3600000).toISOString();

  const title = encodeURIComponent(event.title);
  const desc = encodeURIComponent(
    event.subtitle + "\n" + event.description
  );

  function setLink(id, url) {
    const el = get(id);
    if (el) el.href = url;
  }

  setLink(
    "googleLink",
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${desc}&location=${loc}`
  );

  setLink(
    "outlookLink",
    `https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`
  );

  setLink(
    "officeLink",
    `https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`
  );

  setLink(
    "yahooLink",
    `https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${desc}&in_loc=${loc}`
  );

  /* ======================================================
     APPLE / IOS / MACOS / IPADOS
  ====================================================== */
  const stamp = (d) =>
    d.toISOString().replace(/[-:]/g,"").split(".")[0] + "Z";

  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hull Red CIO//EN
BEGIN:VEVENT
UID:${Date.now()}@hullred
DTSTAMP:${stamp(new Date())}
DTSTART:${stamp(startDate)}
DTEND:${stamp(new Date(startDate.getTime()+3600000))}
SUMMARY:${event.title}
DESCRIPTION:${event.subtitle}\\n${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type:"text/calendar" });
  const url = URL.createObjectURL(blob);

  const apple = get("appleLink");
  if (apple) {
    apple.href = url;
    apple.download = "event.ics";
  }

  const icsBtn = get("icsLink");
  if (icsBtn) {
    icsBtn.href = url;
    icsBtn.download = "event.ics";
  }

  /* ======================================================
     POSTER MODAL
  ====================================================== */
  const modal = get("posterModal");
  const thumb = get("posterThumb");
  const close = get("posterClose");

  if (thumb && modal) {
    thumb.onclick = () => modal.classList.add("show");
  }

  if (close && modal) {
    close.onclick = () => modal.classList.remove("show");
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    };
  }

})
.catch(err => console.error("Countdown error:", err));

});
