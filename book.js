'use strict';
const tk=sessionStorage.getItem('tk');let slot=null,isBooked=sessionStorage.getItem('booked')==='1';
function showBooked(){$('slots').hidden=true;$('confirm').hidden=true;$('err-book').textContent='';$('tzinfo').textContent='';$('booked').textContent=T('booked')}
async function load(){if(isBooked)return showBooked();$('err-book').textContent='';$('slots').hidden=false;$('confirm').hidden=true;
 $('tzinfo').textContent=T('tz',Intl.DateTimeFormat().resolvedOptions().timeZone);const g=$('slots');g.replaceChildren();
 try{if(!tk||!/^http/.test(API))throw 0;const r=await (await fetch(API+'?action=info&lang='+L+'&token='+encodeURIComponent(tk))).json();if(!r.ok)throw 0;
  if(!r.slots.length)g.textContent=T('noSlots');
  const days={};r.slots.forEach(iso=>{const d=new Date(iso),k=d.toLocaleDateString(loc(),{weekday:'long',day:'numeric',month:'long'});(days[k]=days[k]||[]).push([iso,d])});
  for(const k in days){g.append(el('h3','day',k));const row=el('div','times');days[k].forEach(([iso,d])=>{const b=el('button','time',d.toLocaleTimeString(loc(),{hour:'2-digit',minute:'2-digit'}));b.type='button';
   b.onclick=()=>{g.hidden=true;$('confirm').hidden=false;$('confirm-t').textContent=T('confirmT',d.toLocaleString(loc(),{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}));slot=iso;$('confirm-b').focus()};row.append(b)});g.append(row)}}
 catch(e){$('err-book').textContent=T('noAccess')}}
$('confirm-c').onclick=()=>{$('confirm').hidden=true;$('slots').hidden=false};
$('confirm-b').onclick=async()=>{$('confirm-b').disabled=true;let x={};try{x=await post({action:'book',token:tk,slot,lang:L})}catch(e){}$('confirm-b').disabled=false;
 if(x.ok){isBooked=true;sessionStorage.setItem('booked','1');['tk','st','done'].forEach(k=>sessionStorage.removeItem(k));showBooked()}
 else load().then(()=>{if(!$('err-book').textContent)$('err-book').textContent=T('gone')})};
document.addEventListener('langchange',load);initLang($('lang'));
