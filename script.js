document.addEventListener("DOMContentLoaded", () => {

fetch("data/event.json")
.then(r => {
  if (!r.ok) throw new Error("event.json missing");
  return r.json();
})
.then(event => {

  const startDate = new Date(event.date + "T" + event.startTime);

  const get = (id) => document.getElementById(id);

  /* ===============================
     BUILD FLIP CLOCK
  ================================= */
  const countdown = get("countdown");
  if (!countdown) return;

  countdown.innerHTML = "";

  const digitIds = [];

  function createDigit(id) {
    const el = document.createElement("div");
    el.className = "flip-digit";
    el.id = id;

    el.innerHTML = `
      <div class="flip-current current">0</div>
      <div class="flip-next next">0</div>
    `;

    countdown.appendChild(el);
    digitIds.push(id);
  }

  /* FORMAT:
     MM WW DD HH MM SS
  */

  const labels = ["M1","M2","W1","W2","D1","D2","H1","H2","m1","m2","S1","S2"];

  labels.forEach(createDigit);

  /* ===============================
     FLIP ENGINE (FIXED COLORS)
  ================================= */

  function flipDigit(id, val, state) {
    const box = get(id);
    if (!box) return;

    const current = box.querySelector(".current");
    const next = box.querySelector(".next");

    if (!current || !next) return;

    if (current.innerText === val) return;

    /* STATES:
       current = white
       next = grey (during flip)
    */

    next.innerText = val;

    current.style.color = "#fff";
    next.style.color = "#777";

    next.style.transform = "translateY(0)";
    current.style.transform = "translateY(-100%)";

    setTimeout(() => {

      current.innerText = val;

      /* settle state back to white */
      current.style.color = "#fff";
      next.style.color = "#fff";

      current.style.transition = "none";
      current.style.transform = "translateY(0)";

      next.style.transition = "none";
      next.style.transform = "translateY(100%)";

    }, 260);
  }

  /* ===============================
     TIME CONVERSION
  ================================= */

  function getTimeParts(diffSeconds) {

    const seconds = diffSeconds;

    const minutes = Math.floor(seconds / 60);
    const hours   = Math.floor(minutes / 60);
    const days    = Math.floor(hours / 24);
    const weeks   = Math.floor(days / 7);
    const months  = Math.floor(days / 30.44); // average month

    const remWeeks = weeks % 4;
    const remDays  = days % 7;
    const remHours = hours % 24;
    const remMins  = minutes % 60;
    const remSecs  = seconds % 60;

    return {
      months,
      weeks: remWeeks,
      days: remDays,
      hours: remHours,
      minutes: remMins,
      seconds: remSecs
    };
  }

  /* ===============================
     MAIN LOOP
  ================================= */

  function updateCountdown() {

    let diff = Math.floor((startDate - new Date()) / 1000);
    if (diff < 0) diff = 0;

    const t = getTimeParts(diff);

    const parts = [
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

    digitIds.forEach((id, i) => {
      flipDigit(id, parts[i]);
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

});
});

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
      const startISO = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const endISO   = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      const title = encodeURIComponent(event.title);
      const desc  = encodeURIComponent(event.subtitle + "\n" + event.description);

      const setHref = (id, url) => {
        const el = get(id);
        if (el) el.href = url;
      };

      setHref("googleLink",
        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${desc}&location=${loc}`
      );

      setHref("outlookLink",
        `https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&location=${loc}&body=${desc}`
      );

      setHref("officeLink",
        `https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&location=${loc}&body=${desc}`
      );

      setHref("yahooLink",
        `https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${desc}&in_loc=${loc}`
      );

      /* ===============================
         ICS FILE
      ================================= */
      const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hull Red CIO//EN
BEGIN:VEVENT
UID:${Date.now()}@hullred
DTSTAMP:${startISO}
DTSTART:${startISO}
DTEND:${endISO}
SUMMARY:${event.title}
DESCRIPTION:${event.subtitle}\\n${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([ics], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);

      const icsLink = get("icsLink");
      if (icsLink) {
        icsLink.href = url;
        icsLink.download = "event.ics";
      }

      const appleLink = get("appleLink");
      if (appleLink) {
        appleLink.href = url;
        appleLink.download = "event.ics";
      }

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
    .catch(err => {
      console.error("Event loader error:", err);
    });

});
