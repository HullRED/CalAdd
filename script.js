document.addEventListener("DOMContentLoaded", () => {

fetch("data/event.json")
.then(r => {
  if (!r.ok) throw new Error("event.json not found");
  return r.json();
})
.then(event => {

  /* ===============================
     CORE SETUP
  ================================= */
  const startDate = new Date(event.date + "T" + event.startTime);

  const get = (id) => document.getElementById(id);

  const countdown = get("countdown");
  if (!countdown) return;

  countdown.innerHTML = "";

  /* ===============================
     LABELS ROW (RESTORED)
  ================================= */
  const labelRow = document.createElement("div");
  labelRow.className = "flip-label-row";

  const labels = [
    "M","M",
    "W","W",
    "D","D",
    "H","H",
    "m","m",
    "s","s"
  ];

  labels.forEach(l => {
    const el = document.createElement("div");
    el.className = "flip-label";
    el.innerText = l;
    labelRow.appendChild(el);
  });

  countdown.appendChild(labelRow);

  /* ===============================
     DIGITS ROW
  ================================= */
  const digitIds = [];

  const digitRow = document.createElement("div");
  digitRow.className = "flip-row";

  function createDigit(id) {
    const el = document.createElement("div");
    el.className = "flip-digit";
    el.id = id;

    el.innerHTML = `
      <div class="flip-current current">0</div>
      <div class="flip-next next">0</div>
    `;

    digitRow.appendChild(el);
    digitIds.push(id);
  }

  const ids = [
    "M1","M2",
    "W1","W2",
    "D1","D2",
    "H1","H2",
    "m1","m2",
    "s1","s2"
  ];

  ids.forEach(createDigit);
  countdown.appendChild(digitRow);

  /* ===============================
     FLIP ENGINE (STABLE + CORRECT)
  ================================= */
  function flipDigit(id, value) {

    const box = get(id);
    if (!box) return;

    const current = box.querySelector(".current");
    const next = box.querySelector(".next");

    if (!current || !next) return;

    if (current.innerText === value) return;

    next.innerText = value;

    /* trigger animation */
    box.classList.add("flipping");

    current.style.color = "#fff";
    next.style.color = "#777";

    setTimeout(() => {

      current.innerText = value;

      box.classList.remove("flipping");

      current.style.color = "#fff";
      next.style.color = "#fff";

    }, 280);
  }

  /* ===============================
     REAL CALENDAR DIFFERENCE ENGINE
  ================================= */
  function getCalendarDiff(from, to) {

    let start = new Date(from);
    let end = new Date(to);

    if (end < start) [start, end] = [end, start];

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    let hours = end.getHours() - start.getHours();
    let minutes = end.getMinutes() - start.getMinutes();
    let seconds = end.getSeconds() - start.getSeconds();

    if (seconds < 0) {
      seconds += 60;
      minutes--;
    }

    if (minutes < 0) {
      minutes += 60;
      hours--;
    }

    if (hours < 0) {
      hours += 24;
      days--;
    }

    if (days < 0) {
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }

    if (months < 0) {
      months += 12;
      years--;
    }

    const weeks = Math.floor(days / 7);
    const remDays = days % 7;

    return {
      months: months + years * 12,
      weeks,
      days: remDays,
      hours,
      minutes,
      seconds
    };
  }

  /* ===============================
     MAIN LOOP (MOBILE SAFE)
  ================================= */
  function updateCountdown() {

    const now = new Date();
    const t = getCalendarDiff(now, startDate);

    const values = [
      t.months,
      t.months % 10,
      t.weeks,
      t.weeks % 10,
      t.days,
      t.days % 10,
      t.hours,
      t.hours % 10,
      t.minutes,
      t.minutes % 10,
      t.seconds,
      t.seconds % 10
    ].map(n => String(n).padStart(1, "0"));

    for (let i = 0; i < ids.length; i++) {
      flipDigit(ids[i], values[i]);
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ===============================
     TEXT CONTENT (SAFE)
  ================================= */
  const setText = (id, val) => {
    const el = get(id);
    if (el) el.innerText = val;
  };

  setText("eventTitle", event.title);
  setText("eventSubtitle", event.subtitle);
  setText("eventDescription", event.description);
  setText("eventLocation", event.location);
  setText("eventDate", startDate.toLocaleDateString("en-GB"));
  setText("eventTime", event.startTime + " - " + event.endTime);

  /* ===============================
     MAP LINKS
  ================================= */
  const loc = encodeURIComponent(event.location);

  const gMap = get("googleMapLink");
  if (gMap) gMap.href = `https://www.google.com/maps/search/?api=1&query=${loc}`;

  const aMap = get("appleMapLink");
  if (aMap) aMap.href = `https://maps.apple.com/?q=${loc}`;

  /* ===============================
     CALENDAR LINKS
  ================================= */
  const startISO = startDate.toISOString();
  const endISO = new Date(startDate.getTime() + 3600000).toISOString();

  const title = encodeURIComponent(event.title);
  const desc = encodeURIComponent(event.subtitle + "\n" + event.description);

  const setHref = (id, url) => {
    const el = get(id);
    if (el) el.href = url;
  };

  setHref("googleLink",
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${desc}&location=${loc}`
  );

  setHref("outlookLink",
    `https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`
  );

  setHref("officeLink",
    `https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`
  );

  setHref("yahooLink",
    `https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${desc}&in_loc=${loc}`
  );

  /* ===============================
     POSTER MODAL
  ================================= */
  const modal = get("posterModal");
  const open = get("posterThumb");
  const close = get("posterClose");

  if (modal && open) {
    open.onclick = () => modal.classList.add("show");
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
