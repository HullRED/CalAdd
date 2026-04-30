/* ======================================================
   HULL RED V2 COUNTDOWN ENGINE (FIXED VERSION)
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     LOAD EVENT DATA
  ================================= */
  fetch("data/event.json")
    .then(r => {
      if (!r.ok) throw new Error("event.json not found");
      return r.json();
    })
    .then(event => {

      const startDate = new Date(event.date + "T" + event.startTime);
      const endDate   = new Date(event.date + "T" + event.endTime);

      /* ===============================
         SAFE ELEMENT HELPERS
      ================================= */
      const get = (id) => document.getElementById(id);

      const setText = (id, value) => {
        const el = get(id);
        if (el) el.innerText = value;
      };

      /* ===============================
         TEXT CONTENT
      ================================= */
      setText("eventTitle", event.title);
      setText("eventSubtitle", event.subtitle);
      setText("eventDescription", event.description);
      setText("eventLocation", event.location);
      setText("eventDate", startDate.toLocaleDateString("en-GB"));
      setText("eventTime", event.startTime + " - " + event.endTime);

      /* ===============================
         BUILD FLIP CLOCK DYNAMICALLY
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

      // HH MM SS = 6 digits
      createDigit("d1");
      createDigit("d2");
      createDigit("d3");

      const colon1 = document.createElement("div");
      colon1.className = "flip-colon";
      colon1.innerText = ":";
      countdown.appendChild(colon1);

      createDigit("d4");
      createDigit("d5");

      const colon2 = document.createElement("div");
      colon2.className = "flip-colon";
      colon2.innerText = ":";
      countdown.appendChild(colon2);

      createDigit("d6");

      /* ===============================
         FLIP FUNCTION (SAFE)
      ================================= */
      function flipDigit(id, val) {
        const box = get(id);
        if (!box) return;

        const current = box.querySelector(".current");
        const next = box.querySelector(".next");

        if (!current || !next) return;

        if (current.innerText === val) return;

        next.innerText = val;

        current.style.transition = "transform .25s ease, color .25s ease";
        next.style.transition = "transform .25s ease, color .25s ease";

        next.style.transform = "translateY(0)";
        current.style.transform = "translateY(-100%)";

        setTimeout(() => {
          current.innerText = val;
          current.style.transition = "none";
          current.style.transform = "translateY(0)";

          next.style.transition = "none";
          next.style.transform = "translateY(100%)";
        }, 260);
      }

      /* ===============================
         GREY LOGIC
      ================================= */
      function applyDigitColors(full) {
        let firstNonZero = null;

        for (let i = 0; i < full.length; i++) {
          if (full[i] !== "0") {
            firstNonZero = i;
            break;
          }
        }

        digitIds.forEach((id, index) => {
          const box = get(id);
          if (!box) return;

          const cur = box.querySelector(".current");
          const nxt = box.querySelector(".next");

          if (!cur || !nxt) return;

          const color = (!firstNonZero || index < firstNonZero) ? "#777" : "#fff";

          cur.style.color = color;
          nxt.style.color = color;
        });
      }

      /* ===============================
         MAIN COUNTDOWN LOOP
      ================================= */
      function updateCountdown() {

        let diff = Math.floor((startDate - new Date()) / 1000);
        if (diff < 0) diff = 0;

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        const hh = String(hours).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");
        const ss = String(seconds).padStart(2, "0");

        const full = hh + mm + ss;

        flipDigit("d1", full[0]);
        flipDigit("d2", full[1]);
        flipDigit("d3", full[2]);
        flipDigit("d4", full[3]);
        flipDigit("d5", full[4]);
        flipDigit("d6", full[5]);

        applyDigitColors(full);
      }

      updateCountdown();
      setInterval(updateCountdown, 1000);

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
