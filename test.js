'use strict';
const tk=sessionStorage.getItem('tk');
if(sessionStorage.getItem('done'))location.replace('book.html');
else if(!tk||!/^http/.test(API))location.replace('start.html');
let st=null,lastR=null,openData=null,phase='i',sel=null,tick=null,sent=false;
try{st=JSON.parse(sessionStorage.getItem('st')||'null')}catch(e){}
const plays={},aud={},writ={text:''},stage=$('stage');
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const wc=t=>t.trim()?t.trim().split(/\s+/).length:0;
const ltr=e=>{e.dir='ltr';return e};
const b64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b)});
function frame(no,key,sub){stage.replaceChildren();if(no)stage.append(el('p','stamp',T('part',no,6)));stage.append(el('h2',null,T(key)));if(sub)stage.append(el('p','lead',sub))}
function foot(label,fn){const e=el('p','err'),n=el('div','nav'),b=el('button','btn',T(label));e.setAttribute('role','alert');b.type='button';b.onclick=()=>{e.textContent='';fn(b,e)};n.append(el('span'),b);stage.append(e,n);return b}
function startTimer(){if(tick)return;const end=Date.now()+TEST_MINUTES*6e4,t=$('timer');t.hidden=false;
 tick=setInterval(()=>{const l=Math.max(0,end-Date.now());t.textContent=Math.floor(l/6e4)+':'+String(Math.floor(l/1e3)%60).padStart(2,'0');if(!l){clearInterval(tick);stage.replaceChildren(el('p','lead',T('timeUp')));finish()}},1000)}
function showIntro(){phase='i';frame(0,'tIntro');stage.append(el('p',null,T('adaptNote')),el('p','lead',T('tipsTest')));foot('begin',()=>{startTimer();load(null)})}
async function load(ans){phase='l';frame(0,'loading');
 try{const r=await post({action:'next',token:tk,state:st,answer:ans});if(!r.ok)throw 0;st=r.state;sessionStorage.setItem('st',JSON.stringify(st));
  if(r.phase==='open'){openData=r;writ.text='';return r.writing?showWriting():showSpeaking()}
  r.q.o=shuf(r.q.o);lastR=r;sel=null;showQ()}
 catch(e){frame(0,'eTest');foot('begin',()=>load(ans))}}
function showQ(){phase='q';const r=lastR,q=r.q;frame(r.secNo,'sec_'+r.sec,T('qOf',r.i,r.total));
 if(q.p)stage.append(ltr(el('div','passage',q.p)));
 if(/^audio\/[\w.\-]+\.mp3$/.test(q.a)){const a=el('audio'),n=el('p','small'),k=q.id;a.src=q.a;a.controls=true;plays[k]=plays[k]||0;let busy=false;
  const upd=()=>n.textContent=T('listenNote')+' '+T('plays',plays[k],MAX_PLAYS);upd();
  a.addEventListener('play',()=>{if(busy)return;if(plays[k]>=MAX_PLAYS){a.pause();return}busy=true;plays[k]++;upd()});
  a.addEventListener('ended',()=>{busy=false;if(plays[k]>=MAX_PLAYS){a.controls=false;n.textContent=T('noPlays')}});stage.append(a,n)}
 stage.append(ltr(el('p','qtext',q.q)));
 q.o.forEach(o=>{const l=ltr(el('label','opt')),i=el('input');i.type='radio';i.name='o';i.checked=sel===o;i.onchange=()=>sel=o;l.append(i,el('span',null,o));stage.append(l)});
 foot('next',(b,e)=>{if(sel==null)return e.textContent=T('errPick');b.disabled=true;load({id:q.id,text:sel})})}
function showWriting(){phase='w';const w=openData.writing;frame(5,'sec_writing',T('wrNote',w.min,w.max));stage.append(ltr(el('p','qtext',w.q)));
 const t=ltr(el('textarea')),c=el('p','small');t.value=writ.text;t.setAttribute('aria-label',T('ans'));t.maxLength=3000;
 const u=()=>{writ.text=t.value;c.textContent=T('words',wc(t.value),w.min,w.max)};t.oninput=u;u();stage.append(t,c);
 foot('next',(b,e)=>{const n=wc(writ.text);if(n<w.min||n>w.max)return e.textContent=T('errWords',w.min,w.max);showSpeaking()})}
function showSpeaking(){const sp=openData.speaking;if(!sp.length)return finish();phase='s';frame(6,'sec_speaking',T('spNote',sp[0].max));
 sp.forEach((p,i)=>{const w=el('div','q');w.append(ltr(el('p','qtext',(i+1)+'. '+p.q)));recorder(w,i,p.max);stage.append(w)});
 foot('finish',(b,e)=>{if(sp.some((_,i)=>!aud[i]))return e.textContent=T('errRec');b.disabled=true;finish()})}
function recorder(w,k,max){const row=el('div','rec'),btn=el('button','btn',T(aud[k]?'rerec':'rec')),st2=el('span','lead',aud[k]?T('recd'):''),pl=el('audio');btn.type='button';pl.controls=true;if(aud[k])pl.src=URL.createObjectURL(aud[k]);else pl.hidden=true;
 let mr,ch=[],to;const stop=()=>{if(mr&&mr.state==='recording')mr.stop()};
 btn.onclick=async()=>{if(mr&&mr.state==='recording')return stop();
  try{const s=await navigator.mediaDevices.getUserMedia({audio:true});mr=new MediaRecorder(s,{audioBitsPerSecond:32000});ch=[];
   mr.ondataavailable=e=>ch.push(e.data);
   mr.onstop=()=>{clearTimeout(to);s.getTracks().forEach(t=>t.stop());aud[k]=new Blob(ch,{type:mr.mimeType});pl.src=URL.createObjectURL(aud[k]);pl.hidden=false;btn.textContent=T('rerec');st2.textContent=T('recd')};
   mr.start();btn.textContent=T('stop');st2.textContent=T('recing',max);to=setTimeout(stop,max*1000)}
  catch(e){st2.textContent=T('mic')}};
 row.append(btn,st2,pl);w.append(row)}
async function finish(){if(sent)return;sent=true;clearInterval(tick);stage.replaceChildren(el('p','lead',T('sending')));
 try{const sp=[];if(openData)for(const [i,p] of openData.speaking.entries())if(aud[i])sp.push({id:p.id,mime:aud[i].type,data:await b64(aud[i])});
  const r=await post({action:'finish',token:tk,writing:openData&&openData.writing?{id:openData.writing.id,text:writ.text}:null,speaking:sp});
  if(!r.ok)throw 0;sessionStorage.setItem('done','1');location.href='book.html'}
 catch(e){sent=false;stage.replaceChildren(el('p','err',T('sendFail')));foot('finish',()=>finish())}}
addEventListener('beforeunload',e=>{if(phase!=='i'&&!sent){e.preventDefault();e.returnValue=''}});
document.addEventListener('langchange',()=>{({i:showIntro,q:()=>lastR&&showQ(),w:showWriting,s:showSpeaking})[phase]?.()});
initLang($('lang'));
