fetch("data/event.json")
.then(r => r.json())
.then(event => {

const startDate = new Date(event.date + "T" + event.startTime);
const endDate   = new Date(event.date + "T" + event.endTime);

/* ===============================
   TEXT CONTENT
================================= */
document.getElementById("eventTitle").innerText       = event.title;
document.getElementById("eventSubtitle").innerText    = event.subtitle;
document.getElementById("eventDescription").innerText = event.description;
document.getElementById("eventLocation").innerText    = event.location;
document.getElementById("eventDate").innerText        = startDate.toLocaleDateString("en-GB");
document.getElementById("eventTime").innerText        = event.startTime + " - " + event.endTime;

/* ===============================
   FLIP CLOCK ENGINE
================================= */

const digitIds = [
"d1","d2","d3","d4","d5","d6"
];

/* Creates upward mechanical flip */
function flipDigit(id, newVal){

const box = document.getElementById(id);
const current = box.querySelector(".current");
const next    = box.querySelector(".next");

if(current.innerText === newVal) return;

/* new digit enters from below */
next.innerText = newVal;
next.style.transform = "translateY(100%)";
next.style.opacity = "1";

/* old goes upward grey */
current.style.transition = "transform .26s ease, color .26s ease";
next.style.transition    = "transform .26s ease, color .26s ease";

current.style.transform = "translateY(-100%)";
current.style.color = "#777";

next.style.transform = "translateY(0)";
next.style.color = "#fff";

setTimeout(()=>{
current.innerText = newVal;
current.style.transition = "none";
current.style.transform = "translateY(0)";
current.style.color = "#fff";

next.style.transition = "none";
next.style.transform = "translateY(100%)";
},270);

}

/* Roblox grey-leading-zero logic */
function applyDigitColors(fullString){

let firstNonZero = null;

for(let i=0;i<fullString.length;i++){
if(fullString[i] !== "0"){
firstNonZero = i;
break;
}
}

digitIds.forEach((id,index)=>{

const box = document.getElementById(id);
const cur = box.querySelector(".current");
const nxt = box.querySelector(".next");

if(firstNonZero === null || index < firstNonZero){
cur.style.color = "#777";
nxt.style.color = "#777";
}else{
cur.style.color = "#fff";
nxt.style.color = "#fff";
}

});

}

/* ===============================
   MAIN TIMER LOOP
================================= */

function updateCountdown(){

let diff = Math.floor((startDate - new Date()) / 1000);

if(diff <= 0){
diff = 0;
}

const days    = Math.floor(diff / 86400);
const hours   = Math.floor((diff % 86400) / 3600);
const minutes = Math.floor((diff % 3600) / 60);
const seconds = diff % 60;

/* show days text separately */
document.getElementById("dayText").innerText =
days + " Day" + (days !== 1 ? "s" : "");

/* HHMMSS string */
const hh = String(hours).padStart(2,"0");
const mm = String(minutes).padStart(2,"0");
const ss = String(seconds).padStart(2,"0");

const full = hh + mm + ss;

/* flip changed digits */
flipDigit("d1", full[0]);
flipDigit("d2", full[1]);
flipDigit("d3", full[2]);
flipDigit("d4", full[3]);
flipDigit("d5", full[4]);
flipDigit("d6", full[5]);

/* apply grey/white logic */
applyDigitColors(full);

}

/* start */
updateCountdown();
setInterval(updateCountdown,1000);

/* ===============================
   MAP LINKS
================================= */

const loc = encodeURIComponent(event.location);

document.getElementById("googleMapLink").href =
`https://www.google.com/maps/search/?api=1&query=${loc}`;

document.getElementById("appleMapLink").href =
`https://maps.apple.com/?q=${loc}`;

/* ===============================
   CALENDAR LINKS
================================= */

const startISO = startDate.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
const endISO   = endDate.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";

const title = encodeURIComponent(event.title);
const desc  = encodeURIComponent(event.subtitle + "\n" + event.description);
const location = encodeURIComponent(event.location);

/* Google */
document.getElementById("googleLink").href =
`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${desc}&location=${location}`;

/* Outlook */
document.getElementById("outlookLink").href =
`https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&location=${location}&body=${desc}`;

/* Office */
document.getElementById("officeLink").href =
`https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&location=${location}&body=${desc}`;

/* Yahoo */
document.getElementById("yahooLink").href =
`https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${desc}&in_loc=${location}`;

/* ICS / Apple */
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

const blob = new Blob([ics], {type:"text/calendar"});
const url = URL.createObjectURL(blob);

document.getElementById("icsLink").href = url;
document.getElementById("icsLink").download = "event.ics";

document.getElementById("appleLink").href = url;
document.getElementById("appleLink").download = "event.ics";

/* ===============================
   POSTER MODAL
================================= */

const modal = document.getElementById("posterModal");

document.getElementById("posterThumb").onclick = ()=>{
modal.classList.add("show");
};

document.getElementById("posterClose").onclick = ()=>{
modal.classList.remove("show");
};

modal.onclick = (e)=>{
if(e.target === modal){
modal.classList.remove("show");
}
};

});
