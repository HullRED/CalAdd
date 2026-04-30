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
     BUILD UI
  ====================================================== */
  const units = [
    { key:"M", label:"Months"  },
    { key:"W", label:"Weeks"   },
    { key:"D", label:"Days"    },
    { key:"H", label:"Hours"   },
    { key:"m", label:"Minutes" },
    { key:"s", label:"Seconds" }
  ];

  const ids = [];
  const state = {};
  const animating = {};

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
      animating[id] = false;

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
    label.style.color = "#fff";
    label.style.fontWeight = "700";
    label.style.fontSize = "15px";
    label.style.minWidth = "78px";

    group.appendChild(label);
    row.appendChild(group);

  });

  countdown.appendChild(row);

  /* ======================================================
     DATE DIFFERENCE
  ====================================================== */
  function diff(from, to) {

    if (to <= from) {
      return {
        months:0,
        weeks:0,
        days:0,
        hours:0,
        minutes:0,
        seconds:0
      };
    }

    let start = new Date(from);
    let end = new Date(to);

    let years   = end.getFullYear() - start.getFullYear();
    let months  = end.getMonth() - start.getMonth();
    let days    = end.getDate() - start.getDate();
    let hours   = end.getHours() - start.getHours();
    let minutes = end.getMinutes() - start.getMinutes();
    let seconds = end.getSeconds() - start.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0)   { hours += 24; days--; }

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
      months : years * 12 + months,
      weeks  : Math.floor(days / 7),
      days   : days % 7,
      hours,
      minutes,
      seconds
    };
  }

  /* ======================================================
     ALWAYS LEADING ZERO
     0 => 00
     4 => 04
     9 => 09
  ====================================================== */
  function pad2(n) {
    return String(Math.max(0, n)).padStart(2, "0");
  }

  /* ======================================================
     DIGIT LIMITS
  ====================================================== */
  const maxMap = {
    M1:9, M2:9,
    W1:9, W2:9,
    D1:9, D2:9,
    H1:2, H2:9,
    m1:5, m2:9,
    s1:5, s2:9
  };

  /* ======================================================
     DOWNWARD COUNT
     9 ↑ 8 ↑ 7 ↑ 6 ...
  ====================================================== */
  function animateDigit(id, target) {

    if (animating[id]) return;

    const box = get(id);
    if (!box) return;

    const current = box.querySelector(".current");
    const next = box.querySelector(".next");

    target = parseInt(target);

    if (state[id] === null) {
      current.innerText = target;
      next.innerText = target;
      state[id] = target;
      return;
    }

    if (state[id] === target) return;

    animating[id] = true;

    function step() {

      if (state[id] === target) {
        animating[id] = false;
        return;
      }

      const max = maxMap[id];

      let nextVal = state[id] - 1;
      if (nextVal < 0) nextVal = max;

      next.innerText = nextVal;

      box.classList.remove("flipping");
      void box.offsetWidth;
      box.classList.add("flipping");

      setTimeout(() => {

        current.innerText = nextVal;
        state[id] = nextVal;

        box.classList.remove("flipping");

        requestAnimationFrame(step);

      }, 180);
    }

    step();
  }

  /* ======================================================
     MAIN LOOP
     ALWAYS SHOWS:
     00 Months 00 Weeks 00 Days etc
  ====================================================== */
  function update() {

    const now = new Date();
    const t = diff(now, startDate);

    const digits =
      (
        pad2(t.months) +
        pad2(t.weeks) +
        pad2(t.days) +
        pad2(t.hours) +
        pad2(t.minutes) +
        pad2(t.seconds)
      ).split("");

    for (let i = 0; i < ids.length; i++) {
      animateDigit(ids[i], digits[i]);
    }
  }

  update();
  setInterval(update, 1000);

  /* ======================================================
     TEXT
  ====================================================== */
  const set = (id,val)=>{
    const el = get(id);
    if(el) el.innerText = val;
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

  const gm = get("googleMapLink");
  if (gm) gm.href =
    `https://www.google.com/maps/search/?api=1&query=${loc}`;

  const am = get("appleMapLink");
  if (am) am.href =
    `https://maps.apple.com/?q=${loc}`;

  /* ======================================================
     CALENDAR LINKS
  ====================================================== */
  const startISO = startDate.toISOString();
  const endISO =
    new Date(startDate.getTime()+3600000).toISOString();

  const title = encodeURIComponent(event.title);
  const desc  = encodeURIComponent(
    event.subtitle + "\n" + event.description
  );

  function setLink(id,url){
    const el = get(id);
    if(el) el.href = url;
  }

  setLink("googleLink",
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${desc}&location=${loc}`);

  setLink("outlookLink",
    `https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`);

  setLink("officeLink",
    `https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`);

  setLink("yahooLink",
    `https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${desc}&in_loc=${loc}`);

  /* ======================================================
     APPLE / IOS / MACOS / IPADOS
  ====================================================== */
  const stamp = d =>
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

  const blob = new Blob([ics], {type:"text/calendar"});
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
    modal.onclick = (e)=>{
      if(e.target === modal){
        modal.classList.remove("show");
      }
    };
  }

})
.catch(err => console.error(err));

});
