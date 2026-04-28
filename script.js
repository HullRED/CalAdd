fetch("data/event.json")
.then(r => r.json())
.then(event => {

const start = new Date(event.date + "T" + event.startTime);
const end = new Date(event.date + "T" + event.endTime);

/* TEXT */
document.getElementById("eventTitle").innerText = event.title;
document.getElementById("eventSubtitle").innerText = event.subtitle;
document.getElementById("eventDescription").innerText = event.description;
document.getElementById("eventLocation").innerText = event.location;
document.getElementById("eventDate").innerText = start.toLocaleDateString("en-GB");
document.getElementById("eventTime").innerText = event.startTime + " - " + event.endTime;

/* FLIP CLOCK CORE */
function flip(id,val){
const el=document.getElementById(id);
if(el.innerText!==val){
el.classList.add("flip-anim");
setTimeout(()=>el.classList.remove("flip-anim"),250);
el.innerText=val;
}
}

function update(){
let diff=Math.max(0,Math.floor((start-new Date())/1000));

let h=String(Math.floor(diff/3600)).padStart(2,"0");
let m=String(Math.floor((diff%3600)/60)).padStart(2,"0");
let s=String(diff%60).padStart(2,"0");

flip("h1",h[0]); flip("h2",h[1]);
flip("m1",m[0]); flip("m2",m[1]);
flip("s1",s[0]); flip("s2",s[1]);
}

setInterval(update,1000);
update();

/* MAPS */
const loc=encodeURIComponent(event.location);
document.getElementById("googleMapLink").href=`https://www.google.com/maps/search/?api=1&query=${loc}`;
document.getElementById("appleMapLink").href=`https://maps.apple.com/?q=${loc}`;

/* CALENDAR */
const startISO = start.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
const endISO = end.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";

const title = encodeURIComponent(event.title);
const desc = encodeURIComponent(event.subtitle + "\n" + event.description);
const location = encodeURIComponent(event.location);

/* =========================
ICS FILE (CREATE FIRST)
========================= */

const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hull Red CIO
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

/* =========================
APPLE LOGIC (FIXED)
========================= */

const appleLink = document.getElementById("appleLink");

const isAppleDevice =
/iPhone|iPad|iPod|Mac/i.test(navigator.userAgent);

if (isAppleDevice) {
  appleLink.href = url;
  appleLink.download = "event.ics";
} else {
  appleLink.href = url;
  appleLink.download = "event.ics";
}

/* =========================
OTHER CALENDARS
========================= */

document.getElementById("googleLink").href =
`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${desc}&location=${location}`;

document.getElementById("outlookLink").href =
`https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&location=${location}&body=${desc}`;

document.getElementById("officeLink").href =
`https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&location=${location}&body=${desc}`;

document.getElementById("yahooLink").href =
`https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${desc}&in_loc=${location}`;

/* ICS BUTTON */
document.getElementById("icsLink").href = url;
document.getElementById("icsLink").download = "event.ics";

/* POSTER */
const modal=document.getElementById("posterModal");
document.getElementById("posterThumb").onclick=()=>modal.classList.add("show");
document.getElementById("posterClose").onclick=()=>modal.classList.remove("show");
modal.onclick=e=>{if(e.target===modal)modal.classList.remove("show");};

});
