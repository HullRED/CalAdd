document.addEventListener("DOMContentLoaded", () => {

fetch("data/event.json")
.then(r => r.json())
.then(event => {

const startDate = new Date(event.date + "T" + event.startTime);
const get = id => document.getElementById(id);

const countdown = get("countdown");
if (!countdown) return;

countdown.innerHTML = "";

/* ======================================================
   BUILD UI
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
const animating = {};
const labels = {};

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

  for(let i=1;i<=2;i++){

    const id = unit.key + i;

    ids.push(id);
    state[id] = null;
    animating[id] = false;

    const digit = document.createElement("div");
    digit.className = "flip-digit";
    digit.id = id;

    digit.innerHTML = `
      <div class="flip-current current">0</div>
      <div class="flip-next next">9</div>
    `;

    group.appendChild(digit);
  }

  const label = document.createElement("span");
  label.innerText = unit.label;
  label.className = "flip-unit-label";
  label.style.minWidth = "78px";
  label.style.fontWeight = "700";
  label.style.fontSize = "15px";
  label.style.color = "#fff";

  labels[unit.key] = label;

  group.appendChild(label);
  row.appendChild(group);

});

countdown.appendChild(row);

/* ======================================================
   DATE DIFFERENCE
====================================================== */
function diff(from,to){

if(to <= from){
return {
months:0,weeks:0,days:0,
hours:0,minutes:0,seconds:0
};
}

let start = new Date(from);
let end = new Date(to);

let years = end.getFullYear()-start.getFullYear();
let months = end.getMonth()-start.getMonth();
let days = end.getDate()-start.getDate();
let hours = end.getHours()-start.getHours();
let minutes = end.getMinutes()-start.getMinutes();
let seconds = end.getSeconds()-start.getSeconds();

if(seconds < 0){ seconds+=60; minutes--; }
if(minutes < 0){ minutes+=60; hours--; }
if(hours < 0){ hours+=24; days--; }

if(days < 0){
const prev = new Date(end.getFullYear(),end.getMonth(),0);
days += prev.getDate();
months--;
}

if(months < 0){
months += 12;
years--;
}

return {
months: years*12 + months,
weeks: Math.floor(days/7),
days: days%7,
hours,
minutes,
seconds
};
}

const pad2 = n => String(Math.max(0,n)).padStart(2,"0");

/* ======================================================
   LIMITS
====================================================== */
const maxMap = {
M1:9,M2:9,W1:9,W2:9,D1:9,D2:9,
H1:2,H2:9,m1:5,m2:9,s1:5,s2:9
};

/* ======================================================
   FLIP ANIMATION
====================================================== */
function animateDigit(id,target){

if(animating[id]) return;

const box = get(id);
const current = box.querySelector(".current");
const next = box.querySelector(".next");

target = parseInt(target);

if(state[id] === null){
current.innerText = target;
next.innerText = target;
state[id] = target;
return;
}

if(state[id] === target) return;

animating[id] = true;

function step(){

if(state[id] === target){
animating[id] = false;
return;
}

let nextVal = state[id]-1;
if(nextVal < 0) nextVal = maxMap[id];

next.innerText = nextVal;

current.style.transition = "none";
next.style.transition = "none";

current.style.transform = "translateY(0%)";
next.style.transform = "translateY(100%)";

current.style.color = "#fff";
next.style.color = "#777";

void box.offsetWidth;

current.style.transition = "transform .26s ease,color .26s ease";
next.style.transition = "transform .26s ease,color .26s ease";

current.style.transform = "translateY(-100%)";
next.style.transform = "translateY(0%)";

setTimeout(()=>{

current.innerText = nextVal;
state[id] = nextVal;

current.style.transition = "none";
next.style.transition = "none";

current.style.transform = "translateY(0%)";
next.style.transform = "translateY(100%)";

requestAnimationFrame(step);

},260);
}

step();
}

/* ======================================================
   COLOURS
====================================================== */
function applyColours(values, digits) {

  const order = ["M","W","D","H","m","s"];

  // Build cumulative check (highest → lowest)
  let seenNonZero = false;

  order.forEach(key => {

    const label = labels[key];
    const value = values[key];

    // Once we hit a non-zero unit, everything after stays active
    if (value > 0) {
      seenNonZero = true;
      label.style.color = "#fff";
    } else {
      // Only grey out if NOTHING above it has value
      label.style.color = seenNonZero ? "#fff" : "#666";
    }
  });

  // digit greying (unchanged but correct)
  let firstNonZero = digits.findIndex(x => x !== "0");

  ids.forEach((id, index) => {
    const cur = get(id).querySelector(".current");

    if (firstNonZero === -1 || index < firstNonZero) {
      cur.style.color = "#666";
    } else {
      cur.style.color = "#fff";
    }
  });
}

/* ======================================================
   MAIN LOOP
====================================================== */
function update(){

const now = new Date();
const t = diff(now,startDate);

const values = {
M:t.months,W:t.weeks,D:t.days,
H:t.hours,m:t.minutes,s:t.seconds
};

const full =
pad2(t.months)+
pad2(t.weeks)+
pad2(t.days)+
pad2(t.hours)+
pad2(t.minutes)+
pad2(t.seconds);

const digits = full.split("");

for(let i=0;i<ids.length;i++){
animateDigit(ids[i],digits[i]);
}

applyColours(values,digits);
}

update();
setInterval(update,1000);

/* ======================================================
   TEXT
====================================================== */
get("eventTitle").innerText = event.title;
get("eventSubtitle").innerText = event.subtitle;
get("eventDescription").innerText = event.description;
get("eventLocation").innerText = event.location;
get("eventDate").innerText = startDate.toLocaleDateString("en-GB");
get("eventTime").innerText = event.startTime + " - " + event.endTime;

/* ======================================================
   MAP LINKS
====================================================== */
const loc = encodeURIComponent(event.location);

get("googleMapLink").href =
`https://www.google.com/maps/search/?api=1&query=${loc}`;

get("appleMapLink").href =
`https://maps.apple.com/?q=${loc}`;

/* ======================================================
   CALENDAR LINKS
====================================================== */
const startISO = startDate.toISOString();
const endISO = new Date(startDate.getTime()+3600000).toISOString();

const title = encodeURIComponent(event.title);
const desc = encodeURIComponent(event.subtitle + "\n" + event.description);

/* Google */
get("googleLink").href =
`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${desc}&location=${loc}`;

/* Outlook */
get("outlookLink").href =
`https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`;

/* Office */
get("officeLink").href =
`https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${startISO}&enddt=${endISO}&location=${loc}&body=${desc}`;

/* Yahoo */
get("yahooLink").href =
`https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${desc}&in_loc=${loc}`;

/* ======================================================
   APPLE / IOS / MAC FIX (SAFARI SAFE)
====================================================== */

const stamp = d =>
  d.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";

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

const safeTitle = (event.title || "event")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const fileName = `${safeTitle}.ics`;

/* Detect Safari */
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

/* Create file */
const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });

if (isSafari) {
  // Safari workaround: open instead of download
  const reader = new FileReader();

  reader.onload = function() {
    const dataUrl = reader.result;

    get("appleLink").href = dataUrl;
    get("icsLink").href = dataUrl;
  };

  reader.readAsDataURL(blob);

} else {
  // Normal browsers
  const url = URL.createObjectURL(blob);

  get("appleLink").href = url;
  get("appleLink").download = fileName;

  get("icsLink").href = url;
  get("icsLink").download = fileName;
}

/* ======================================================
   POSTER MODAL
====================================================== */
const modal = get("posterModal");
const thumb = get("posterThumb");
const close = get("posterClose");

if(thumb) thumb.onclick = ()=>modal.classList.add("show");
if(close) close.onclick = ()=>modal.classList.remove("show");

if(modal){
modal.onclick = e=>{
if(e.target === modal) modal.classList.remove("show");
};
}

})
.catch(err => console.error("Countdown error:", err));

});
