document.addEventListener("DOMContentLoaded", () => {

fetch("data/event.json")
.then(r => {
  if (!r.ok) throw new Error("event.json not found");
  return r.json();
})
.then(event => {

  /* ======================================================
     CORE SETUP
  ====================================================== */
  const startDate = new Date(event.date + "T" + event.startTime);
  const get = (id) => document.getElementById(id);

  const countdown = get("countdown");
  if (!countdown) return;

  countdown.innerHTML = "";

  /* ======================================================
     DIGIT STRUCTURE (M W D H m s)
  ====================================================== */

  const digitIds = [
    "M1","M2",
    "W1","W2",
    "D1","D2",
    "H1","H2",
    "m1","m2",
    "s1","s2"
  ];

  const digitState = {};

  function createDigit(id) {
    const el = document.createElement("div");
    el.className = "flip-digit";
    el.id = id;

    el.innerHTML = `
      <div class="flip-current current">0</div>
      <div class="flip-next next">0</div>
    `;

    countdown.appendChild(el);

    digitState[id] = null;
  }

  digitIds.forEach(createDigit);

  /* ======================================================
     REAL CALENDAR DIFFERENCE ENGINE
  ====================================================== */

  function getDiff(from, to) {

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

  /* ======================================================
     DIGIT FLIP (DOWNWARD ONLY, NO JITTER)
  ====================================================== */

  function flipDigit(id, newVal) {

    const box = get(id);
    if (!box) return;

    const current = box.querySelector(".current");
    const next = box.querySelector(".next");

    if (!current || !next) return;

    const currentVal = parseInt(current.innerText || "0");

    /* INIT STATE */
    if (digitState[id] === null) {
      current.innerText = newVal;
      digitState[id] = newVal;
      return;
    }

    /* ONLY COUNT DOWN */
    if (newVal > currentVal) return;

    /* NO CHANGE */
    if (currentVal === newVal) return;

    next.innerText = newVal;

    box.classList.add("flipping");

    current.style.color = "#fff";
    next.style.color = "#777";

    setTimeout(() => {

      current.innerText = newVal;

      box.classList.remove("flipping");

      current.style.color = "#fff";
      next.style.color = "#fff";

      digitState[id] = newVal;

    }, 260);
  }

  /* ======================================================
     MAIN LOOP (STABLE + MOBILE SAFE)
  ====================================================== */

  function update() {

    const now = new Date();
    const t = getDiff(now, startDate);

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
    ];

    for (let i = 0; i < digitIds.length; i++) {
      flipDigit(digitIds[i], values[i]);
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
     CALENDAR LINKS
  ====================================================== */

  const startISO = startDate.toISOString();
  const endISO = new Date(startDate.getTime() + 3600000).toISOString();

  const title = encodeURIComponent(event.title);
  const desc = encodeURIComponent(event.subtitle + "\n" + event.description);

  const link = (id, url) => {
    const el = get(id);
    if (el) el.href = url;
  };

  link("googleLink",
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${desc}&location=${loc}`
  );

  link("outlookLink",
    `https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`
  );

  link("officeLink",
    `https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`
  );

  link("yahooLink",
    `https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${desc}&in_loc=${loc}`
  );

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
