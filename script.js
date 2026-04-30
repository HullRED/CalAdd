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
     [00 Months] [00 Weeks] etc
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
        <div class="flip-next next">1</div>
      `;

      group.appendChild(digit);
    }

    const label = document.createElement("span");
    label.innerText = unit.label;
    label.style.color = "#fff";
    label.style.fontWeight = "700";
    label.style.fontSize = "15px";
    label.style.minWidth = "76px";

    group.appendChild(label);
    row.appendChild(group);
  });

  countdown.appendChild(row);

  /* ======================================================
     DATE DIFFERENCE
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
     UPWARD NUMBER SEQUENCE FLIP
     0 ↑ 1 ↑ 2 ↑ 3 etc
  ====================================================== */
  function flipDigit(id, targetVal) {

    const box = get(id);
    if (!box) return;

    const current = box.querySelector(".current");
    const next = box.querySelector(".next");

    if (!current || !next) return;

    targetVal = parseInt(targetVal);

    if (state[id] === null) {
      current.innerText = targetVal;
      next.innerText = (targetVal + 1) % 10;
      state[id] = targetVal;
      return;
    }

    let currentVal = state[id];

    if (currentVal === targetVal) return;

    /* always count upward until target reached */
    const nextVal = (currentVal + 1) % 10;

    next.innerText = nextVal;

    box.classList.remove("flipping");
    void box.offsetWidth;
    box.classList.add("flipping");

    setTimeout(() => {

      current.innerText = nextVal;
      next.innerText = (nextVal + 1) % 10;

      box.classList.remove("flipping");

      state[id] = nextVal;

      /* keep climbing until target reached */
      if (nextVal !== targetVal) {
        setTimeout(() => flipDigit(id, targetVal), 40);
      }

    }, 220);
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
     LINKS
  ====================================================== */
  const loc = encodeURIComponent(event.location);

  const gMap = get("googleMapLink");
  if (gMap) gMap.href =
    `https://www.google.com/maps/search/?api=1&query=${loc}`;

  const aMap = get("appleMapLink");
  if (aMap) aMap.href =
    `https://maps.apple.com/?q=${loc}`;

  const startISO = startDate.toISOString();
  const endISO =
    new Date(startDate.getTime() + 3600000).toISOString();

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
      if (e.target === modal) modal.classList.remove("show");
    };
  }

})
.catch(err => console.error("Countdown error:", err));

});
