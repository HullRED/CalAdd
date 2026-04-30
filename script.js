fetch("data/event.json")
.then(r=>r.json())
.then(event=>{

const start = new Date(event.date+"T"+event.startTime);
const end   = new Date(event.date+"T"+event.endTime);

/* TEXT */
eventTitle.innerText = event.title;
eventSubtitle.innerText = event.subtitle;
eventDescription.innerText = event.description;
eventDate.innerText = start.toLocaleDateString("en-GB");
eventTime.innerText = event.startTime+" - "+event.endTime;
eventLocation.innerText = event.location;

/* FLIP CLOCK */
function flip(id,val){
const el=document.getElementById(id);

if(el.innerText!==val){
el.classList.add("flip");
setTimeout(()=>el.classList.remove("flip"),250);
el.innerText=val;
}
}

function tick(){
let diff=Math.max(0,Math.floor((start-new Date())/1000));

let h=String(Math.floor(diff/3600)).padStart(2,"0");
let m=String(Math.floor((diff%3600)/60)).padStart(2,"0");
let s=String(diff%60).padStart(2,"0");

flip("h1",h[0]);
flip("h2",h[1]);
flip("m1",m[0]);
flip("m2",m[1]);
flip("s1",s[0]);
flip("s2",s[1]);
}

tick();
setInterval(tick,1000);

/* MAPS */
const loc=encodeURIComponent(event.location);

googleMapLink.href=`https://www.google.com/maps/search/?api=1&query=${loc}`;
appleMapLink.href=`https://maps.apple.com/?q=${loc}`;

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

const ics =
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

/* MODAL */
posterThumb.onclick=()=>posterModal.classList.add("show");
posterClose.onclick=()=>posterModal.classList.remove("show");
posterModal.onclick=e=>{
if(e.target===posterModal){
posterModal.classList.remove("show");
}
};
