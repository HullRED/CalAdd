/* script.js */

fetch("data/event.json")
.then(r=>r.json())
.then(event=>{

const start = new Date(event.date + "T" + event.startTime);
const end   = new Date(event.date + "T" + event.endTime);

/* TEXT */
eventTitle.innerText = event.title;
eventSubtitle.innerText = event.subtitle;
eventDescription.innerText = event.description;
eventDate.innerText = start.toLocaleDateString("en-GB");
eventTime.innerText = event.startTime + " - " + event.endTime;
eventLocation.innerText = event.location;

/* CLOCK BUILD */
function digit(id){
return `
<div class="flip-digit" id="${id}">
<div class="flip-current">0</div>
<div class="flip-next">0</div>
</div>`;
}

countdown.innerHTML =
digit("mo1")+digit("mo2")+
`<div class="flip-colon">:</div>`+
digit("wk1")+digit("wk2")+
`<div class="flip-colon">:</div>`+
digit("dy1")+digit("dy2")+
`<div class="flip-colon">:</div>`+
digit("hr1")+digit("hr2")+
`<div class="flip-colon">:</div>`+
digit("mi1")+digit("mi2")+
`<div class="flip-colon">:</div>`+
digit("se1")+digit("se2");

/* FLIP */
function setDigit(id,val,grey=false){

const box=document.getElementById(id);
const current=box.querySelector(".flip-current");
const next=box.querySelector(".flip-next");

if(current.textContent===val){
current.classList.toggle("zero-grey",grey);
return;
}

next.textContent=val;

current.classList.remove("zero-grey");
next.classList.remove("zero-grey");

if(grey) next.classList.add("zero-grey");

box.classList.add("flipping");

setTimeout(()=>{
current.textContent=val;
current.className="flip-current";
next.className="flip-next";
if(grey) current.classList.add("zero-grey");
box.classList.remove("flipping");
},340);

}

/* COUNTDOWN */
function pad(n){
return String(n).padStart(2,"0");
}

function tick(){

let diff=Math.max(0,Math.floor((start-new Date())/1000));

let months=Math.floor(diff/2592000);
diff-=months*2592000;

let weeks=Math.floor(diff/604800);
diff-=weeks*604800;

let days=Math.floor(diff/86400);
diff-=days*86400;

let hrs=Math.floor(diff/3600);
diff-=hrs*3600;

let mins=Math.floor(diff/60);
let secs=diff%60;

const vals=[
...pad(months),
...pad(weeks),
...pad(days),
...pad(hrs),
...pad(mins),
...pad(secs)
];

const ids=[
"mo1","mo2",
"wk1","wk2",
"dy1","dy2",
"hr1","hr2",
"mi1","mi2",
"se1","se2"
];

for(let i=0;i<ids.length;i++){

const left=i%2===0;
let grey=false;

if(left && vals[i]==="0") grey=true;
if(!left && vals[i]==="0" && vals[i-1]==="0") grey=true;

setDigit(ids[i],vals[i],grey);
}

}

tick();
setInterval(tick,1000);

/* MAPS */
const loc=encodeURIComponent(event.location);

googleMapLink.href=
`https://www.google.com/maps/search/?api=1&query=${loc}`;

appleMapLink.href=
`https://maps.apple.com/?q=${loc}`;

/* CALENDAR */
const startISO=start.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
const endISO=end.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";

const title=encodeURIComponent(event.title);
const desc=encodeURIComponent(event.subtitle+"\n"+event.description);
const location=encodeURIComponent(event.location);

googleLink.href=
`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${desc}&location=${location}`;

outlookLink.href=
`https://outlook.live.com/owa/?rru=addevent&subject=${title}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&location=${location}&body=${desc}`;

officeLink.href=
`https://outlook.office.com/owa/?path=/calendar/action/compose&subject=${title}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&location=${location}&body=${desc}`;

yahooLink.href=
`https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${desc}&in_loc=${location}`;

/* ICS */
const ics=
`BEGIN:VCALENDAR
VERSION:2.0
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

const blob=new Blob([ics],{type:"text/calendar"});
const url=URL.createObjectURL(blob);

icsLink.href=url;
icsLink.download="event.ics";

appleLink.href=url;
appleLink.download="event.ics";

});

/* POSTER MODAL */
posterThumb.onclick=()=>posterModal.classList.add("show");
posterClose.onclick=()=>posterModal.classList.remove("show");
posterModal.onclick=e=>{
if(e.target===posterModal){
posterModal.classList.remove("show");
}
};
