'use strict';
const API='https://script.google.com/macros/s/AKfycbw-LK3MI_j0CQRiArzDwy-e-nfpZdN2Sn1dLhgTfmt-yxXc3inKuljEy9U3IIvfKZPdrQ/exec', TEST_MIN=45, MAX_PLAYS=2;
const $=id=>document.getElementById(id);
// ---- EDIT QUESTIONS HERE (no answer key is stored in the browser; you grade manually) ----
const SECTIONS=[
{id:'grammar',title:'Grammar',type:'mc',items:[{q:'[Grammar question 1]',o:['A','B','C','D']},{q:'[Grammar question 2]',o:['A','B','C','D']}]},
{id:'vocab',title:'Vocabulary',type:'mc',items:[{q:'[Vocabulary question 1]',o:['A','B','C','D']}]},
{id:'listening',title:'Listening (you can play each audio twice)',type:'mc',items:[{audio:'audio/listening1.mp3',q:'[Listening question 1]',o:['A','B','C','D']}]},
{id:'reading',title:'Reading',type:'text',passage:'[Paste the reading passage here]',items:[{q:'[Reading question 1]'}]},
{id:'writing',title:'Writing',type:'essay',min:90,max:250,items:[{q:'[Writing prompt: write 90-250 words]'}]},
{id:'speaking',title:'Speaking (30-90 seconds each, you may re-record)',type:'speak',max:90,items:[{q:'[Speaking prompt 1]'},{q:'[Speaking prompt 2]'},{q:'[Speaking prompt 3]'},{q:'[Speaking prompt 4]'},{q:'[Speaking prompt 5]'}]}];
// -----------------------------------------------------------------------------------------
const S={i:0,ans:{},aud:{},user:null,token:sessionStorage.getItem('tk'),end:0,tick:null,sent:false};
const show=id=>{['s-intro','s-test','s-done','s-book'].forEach(x=>$(x).hidden=x!==id);$('timer').hidden=id!=='s-test';scrollTo(0,0)};
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const post=async b=>{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(b)});return r.json()};

$('age').addEventListener('input',()=>{$('guardian-row').hidden=!($('age').value&&+$('age').value<18)});
$('f-start').addEventListener('submit',e=>{e.preventDefault();const er=$('err-start'),a=+$('age').value;er.textContent='';
 if(!$('name').value.trim()||!/^\S+@\S+\.\S+$/.test($('email').value))return er.textContent='Please enter your name and a valid email.';
 if(a<13)return er.textContent='This test is for students aged 13 or older.';
 if(a<18&&!$('guardian').checked)return er.textContent='A parent or guardian must give consent.';
 if(!$('consent').checked)return er.textContent='Please accept the privacy consent to continue.';
 S.user={name:$('name').value.trim(),email:$('email').value.trim(),age:a,guardian:$('guardian').checked,tz:Intl.DateTimeFormat().resolvedOptions().timeZone,hp:$('hp').value};
 S.end=Date.now()+TEST_MIN*6e4;S.tick=setInterval(tick,1000);render();show('s-test')});
function tick(){const l=Math.max(0,S.end-Date.now());$('timer').textContent=Math.floor(l/6e4)+':'+String(Math.floor(l/1e3)%60).padStart(2,'0');if(!l)submit()}
function wc(t){return t.trim()?t.trim().split(/\s+/).length:0}
function render(){const sec=SECTIONS[S.i],b=$('sec-body');b.replaceChildren();$('err-test').textContent='';
 $('progress').textContent=`Part ${S.i+1} of ${SECTIONS.length}`;$('sec-title').textContent=sec.title;
 $('prev').disabled=!S.i;$('next').textContent=S.i==SECTIONS.length-1?'Submit test':'Next';
 if(sec.passage)b.append(el('div','card',sec.passage));
 sec.items.forEach((it,n)=>{const k=sec.id+n,w=el('div','q');w.append(el('p',null,`${n+1}. ${it.q}`));
  if(it.audio){const a=el('audio');a.src=it.audio;a.controls=true;let p=S.ans['_p'+k]||0;const note=el('p','lead','Plays used: '+p+'/'+MAX_PLAYS);
   a.addEventListener('play',()=>{if(a.dataset.c)return;if(p>=MAX_PLAYS){a.pause();return}p++;a.dataset.c=1;S.ans['_p'+k]=p;note.textContent='Plays used: '+p+'/'+MAX_PLAYS});
   a.addEventListener('ended',()=>{delete a.dataset.c;if(p>=MAX_PLAYS){a.controls=false;note.textContent='No plays left'}});
   a.addEventListener('pause',()=>{});w.append(a,note)}
  if(sec.type==='mc'||sec.type==='mc')it.o.forEach(o=>{const l=el('label','opt'),r=el('input');r.type='radio';r.name=k;r.checked=S.ans[k]===o;r.addEventListener('change',()=>S.ans[k]=o);l.append(r,el('span',null,o));w.append(l)});
  if(sec.type==='text'||sec.type==='essay'){const t=el('textarea'),c=el('p','lead');t.value=S.ans[k]||'';t.setAttribute('aria-label','Your answer');t.maxLength=3000;
   const u=()=>{S.ans[k]=t.value;c.textContent=sec.type==='essay'?`${wc(t.value)} words (${sec.min}-${sec.max})`:''};t.addEventListener('input',u);u();w.append(t,c)}
  if(sec.type==='speak')recorder(w,k,sec.max);b.append(w)})}
function recorder(w,k,max){const row=el('div','rec'),btn=el('button','btn','Record'),st=el('span','lead',S.aud[k]?'Recorded ✓':''),pl=el('audio');btn.type='button';pl.controls=true;if(S.aud[k])pl.src=URL.createObjectURL(S.aud[k]);else pl.hidden=true;
 let mr,ch=[],to;const stop=()=>{if(mr&&mr.state==='recording')mr.stop()};
 btn.onclick=async()=>{if(mr&&mr.state==='recording')return stop();
  try{const s=await navigator.mediaDevices.getUserMedia({audio:true});mr=new MediaRecorder(s,{audioBitsPerSecond:32000});ch=[];
   mr.ondataavailable=e=>ch.push(e.data);
   mr.onstop=()=>{clearTimeout(to);s.getTracks().forEach(t=>t.stop());S.aud[k]=new Blob(ch,{type:mr.mimeType});pl.src=URL.createObjectURL(S.aud[k]);pl.hidden=false;btn.textContent='Re-record';st.textContent='Recorded ✓'};
   mr.start();btn.textContent='Stop';st.textContent=`Recording… (max ${max}s)`;to=setTimeout(stop,max*1000)}
  catch{st.textContent='Microphone blocked. Allow access in your browser, or contact your teacher.'}};
 if(S.aud[k])btn.textContent='Re-record';row.append(btn,st,pl);w.append(row)}
$('prev').onclick=()=>{S.i--;render()};
$('next').onclick=()=>{const sec=SECTIONS[S.i];
 if(sec.type==='essay'){const n=wc(S.ans[sec.id+'0']||'');if(n<sec.min||n>sec.max)return $('err-test').textContent=`Please write between ${sec.min} and ${sec.max} words.`}
 if(sec.type==='speak'&&sec.items.some((_,n)=>!S.aud[sec.id+n]))return $('err-test').textContent='Please record all answers.';
 if(S.i<SECTIONS.length-1){S.i++;render()}else submit()};
const b64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b)});
async function submit(){if(S.sent)return;S.sent=true;clearInterval(S.tick);$('next').disabled=true;$('err-test').textContent='Sending… please keep this page open.';
 try{const audio={};for(const k in S.aud)audio[k]={mime:S.aud[k].type,data:await b64(S.aud[k])};
  const r=await post({action:'submit',user:S.user,answers:S.ans,audio});
  if(!r.ok)throw new Error(r.error||'failed');S.token=r.token;sessionStorage.setItem('tk',r.token);show('s-done')}
 catch(e){S.sent=false;$('next').disabled=false;$('err-test').textContent='Sending failed. Check your connection and press Submit again, or email your teacher.'}}
$('to-book').onclick=loadBook;
async function loadBook(){show('s-book');$('tzinfo').textContent='Times are shown in your time zone: '+Intl.DateTimeFormat().resolvedOptions().timeZone;
 try{const r=await (await fetch(API+'?action=info&token='+encodeURIComponent(S.token))).json();if(!r.ok)throw 0;
  $('pricing').replaceChildren(el('h2',null,'Courses and prices'),...r.pricing.split('\n').map(x=>el('p',null,x)));
  const g=$('slots');g.replaceChildren();if(!r.slots.length)g.textContent='No free times right now. I will contact you by email.';
  r.slots.forEach(iso=>{const b=el('button','btn',new Date(iso).toLocaleString([],{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}));
   b.onclick=async()=>{g.querySelectorAll('button').forEach(x=>x.disabled=true);const x=await post({action:'book',token:S.token,slot:iso});
    if(x.ok){g.replaceChildren();$('booked').textContent='Booked! A confirmation was sent to your email.';sessionStorage.removeItem('tk')}
    else{$('err-book').textContent=x.error||'That time is no longer available.';loadBook()}};g.append(b)})}
 catch{$('err-book').textContent='Booking is available after you complete the test (one session per student).'}}
if(S.token&&API.startsWith('http'))loadBook();
