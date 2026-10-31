'use strict';
const API='PASTE_APPS_SCRIPT_WEB_APP_URL', TEST_MIN=45, MAX_PLAYS=2;
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
 if(!$('name').value.trim()||!/^\S+@\S+\.\S+$/.test($('email').value))return er.textContent=T('e1');
 if(($('phone').value.match(/\d/g)||[]).length<7)return er.textContent=T('e2');
 if(a<13)return er.textContent=T('e3');
 if(a<18&&!$('guardian').checked)return er.textContent=T('e4');
 if(!$('consent').checked)return er.textContent=T('e5');
 S.user={name:$('name').value.trim(),email:$('email').value.trim(),phone:$('phone').value.trim(),age:a,guardian:$('guardian').checked,tz:Intl.DateTimeFormat().resolvedOptions().timeZone,lang:L,hp:$('hp').value};
 S.end=Date.now()+TEST_MIN*6e4;S.tick=setInterval(tick,1000);render();show('s-test')});
function tick(){const l=Math.max(0,S.end-Date.now());$('timer').textContent=Math.floor(l/6e4)+':'+String(Math.floor(l/1e3)%60).padStart(2,'0');if(!l)submit()}
function wc(t){return t.trim()?t.trim().split(/\s+/).length:0}
function render(){const sec=SECTIONS[S.i],b=$('sec-body');b.replaceChildren();$('err-test').textContent='';
 $('progress').textContent=T('part',S.i+1,SECTIONS.length);$('sec-title').textContent=T('sec_'+sec.id);
 $('prev').disabled=!S.i;$('next').textContent=S.i==SECTIONS.length-1?T('submit'):T('next');
 if(sec.passage)b.append(Object.assign(el('div','passage',sec.passage),{dir:'ltr'}));
 sec.items.forEach((it,n)=>{const k=sec.id+n,w=el('div','q');const qp=el('p',null,`${n+1}. ${it.q}`);qp.dir='ltr';w.append(qp);
  if(it.audio){const a=el('audio');a.src=it.audio;a.controls=true;let p=S.ans['_p'+k]||0;const note=el('p','lead',T('plays',p,MAX_PLAYS));
   a.addEventListener('play',()=>{if(a.dataset.c)return;if(p>=MAX_PLAYS){a.pause();return}p++;a.dataset.c=1;S.ans['_p'+k]=p;note.textContent=T('plays',p,MAX_PLAYS)});
   a.addEventListener('ended',()=>{delete a.dataset.c;if(p>=MAX_PLAYS){a.controls=false;note.textContent=T('noPlays')}});
   a.addEventListener('pause',()=>{});w.append(a,note)}
  if(sec.type==='mc'||sec.type==='mc')it.o.forEach(o=>{const l=el('label','opt'),r=el('input');r.type='radio';r.name=k;r.checked=S.ans[k]===o;r.addEventListener('change',()=>S.ans[k]=o);l.dir='ltr';l.append(r,el('span',null,o));w.append(l)});
  if(sec.type==='text'||sec.type==='essay'){const t=el('textarea'),c=el('p','lead');t.value=S.ans[k]||'';t.setAttribute('aria-label',T('ans'));t.dir='ltr';t.maxLength=3000;
   const u=()=>{S.ans[k]=t.value;c.textContent=sec.type==='essay'?T('words',wc(t.value),sec.min,sec.max):''};t.addEventListener('input',u);u();w.append(t,c)}
  if(sec.type==='speak')recorder(w,k,sec.max);b.append(w)})}
function recorder(w,k,max){const row=el('div','rec'),btn=el('button','btn',T('rec')),st=el('span','lead',S.aud[k]?T('recd'):''),pl=el('audio');btn.type='button';pl.controls=true;if(S.aud[k])pl.src=URL.createObjectURL(S.aud[k]);else pl.hidden=true;
 let mr,ch=[],to;const stop=()=>{if(mr&&mr.state==='recording')mr.stop()};
 btn.onclick=async()=>{if(mr&&mr.state==='recording')return stop();
  try{const s=await navigator.mediaDevices.getUserMedia({audio:true});mr=new MediaRecorder(s,{audioBitsPerSecond:32000});ch=[];
   mr.ondataavailable=e=>ch.push(e.data);
   mr.onstop=()=>{clearTimeout(to);s.getTracks().forEach(t=>t.stop());S.aud[k]=new Blob(ch,{type:mr.mimeType});pl.src=URL.createObjectURL(S.aud[k]);pl.hidden=false;btn.textContent=T('rerec');st.textContent=T('recd')};
   mr.start();btn.textContent=T('stop');st.textContent=T('recing',max);to=setTimeout(stop,max*1000)}
  catch{st.textContent=T('mic')}};
 if(S.aud[k])btn.textContent=T('rerec');row.append(btn,st,pl);w.append(row)}
$('prev').onclick=()=>{S.i--;render()};
$('next').onclick=()=>{const sec=SECTIONS[S.i];
 if(sec.type==='essay'){const n=wc(S.ans[sec.id+'0']||'');if(n<sec.min||n>sec.max)return $('err-test').textContent=T('errWords',sec.min,sec.max)}
 if(sec.type==='speak'&&sec.items.some((_,n)=>!S.aud[sec.id+n]))return $('err-test').textContent=T('errRec');
 if(S.i<SECTIONS.length-1){S.i++;render()}else submit()};
const b64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b)});
async function submit(){if(S.sent)return;S.sent=true;clearInterval(S.tick);$('next').disabled=true;$('err-test').textContent=T('sending');
 try{const audio={};for(const k in S.aud)audio[k]={mime:S.aud[k].type,data:await b64(S.aud[k])};
  const rows=[];SECTIONS.forEach(sc=>sc.items.forEach((it,n)=>rows.push({k:sc.id+n,s:sc.title.split(' (')[0],n:n+1,q:it.q,a:sc.type==='speak'?'':String(S.ans[sc.id+n]||'')})));
  const r=await post({action:'submit',user:S.user,rows,audio});
  if(!r.ok)throw new Error(r.error||'failed');S.token=r.token;sessionStorage.setItem('tk',r.token);show('s-done')}
 catch(e){S.sent=false;$('next').disabled=false;$('err-test').textContent=T('sendFail')}}
$('to-book').onclick=loadBook;
async function loadBook(){show('s-book');$('tzinfo').textContent=T('tz',Intl.DateTimeFormat().resolvedOptions().timeZone);
 try{const r=await (await fetch(API+'?action=info&lang='+L+'&token='+encodeURIComponent(S.token))).json();if(!r.ok)throw 0;
  $('pricing').replaceChildren(...r.pricing.split('\n').map(x=>{const i=x.lastIndexOf(':');if(i<1)return el('p',null,x);const d=el('div','row');d.append(el('span',null,x.slice(0,i)),el('i'),el('b',null,x.slice(i+1).trim()));return d}));
  const g=$('slots');g.replaceChildren();if(!r.slots.length)g.textContent=T('noSlots');
  const days={};r.slots.forEach(iso=>{const d=new Date(iso),k=d.toLocaleDateString(loc(),{weekday:'long',day:'numeric',month:'long'});(days[k]=days[k]||[]).push([iso,d])});
  for(const k in days){g.append(el('h3','day',k));const row=el('div','times');days[k].forEach(([iso,d])=>{const b=el('button','time',d.toLocaleTimeString(loc(),{hour:'2-digit',minute:'2-digit'}));b.type='button';
   b.onclick=()=>{g.hidden=true;$('confirm').hidden=false;$('confirm-t').textContent=T('confirmT',d.toLocaleString(loc(),{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}));S.slot=iso;$('confirm-b').focus()};row.append(b)});g.append(row)}}
 catch{$('err-book').textContent=T('noAccess')}}


$('confirm-c').onclick=()=>{$('confirm').hidden=true;$('slots').hidden=false};
$('confirm-b').onclick=async()=>{$('confirm-b').disabled=true;const x=await post({action:'book',token:S.token,slot:S.slot,lang:L});$('confirm-b').disabled=false;
 if(x.ok){$('confirm').hidden=true;$('booked').textContent=T('booked');sessionStorage.removeItem('tk')}
 else{$('err-book').textContent=T('gone');$('confirm').hidden=true;$('slots').hidden=false;loadBook()}};
addEventListener('beforeunload',e=>{if(!$('s-test').hidden&&!S.sent){e.preventDefault();e.returnValue=''}});

document.addEventListener('langchange',()=>{['err-start','err-test','err-book'].forEach(i=>$(i).textContent='');if(!$('s-test').hidden)render();if(!$('s-book').hidden)loadBook()});
$('lang').onchange=e=>applyLang(e.target.value);
(()=>{let l;try{l=localStorage.getItem('lang')}catch(e){}l=l||(navigator.language||'en').slice(0,2);if(!I18N[l])l='en';$('lang').value=l;applyLang(l);if(S.token&&API.startsWith('http'))loadBook()})();
