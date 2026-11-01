'use strict';
const tk=sessionStorage.getItem('tk');
if(sessionStorage.getItem('done'))location.replace('book.html');
else if(!tk||!/^http/.test(API))location.replace('start.html');
const ORDER=['grammar','vocab','listening','reading','writing','speaking'];
let st=null,lastR=null,openData=null,phase='i',sel=null,tick=null,sent=false,curSec='',introArgs=null;
try{st=JSON.parse(sessionStorage.getItem('st')||'null')}catch(e){}
const plays={},aud={},writ={text:''},stage=$('stage');
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const wc=t=>t.trim()?t.trim().split(/\s+/).length:0;
const ltr=e=>{e.dir='ltr';return e};
const b64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b)});
function updBar(sec,f){const n=ORDER.indexOf(sec);document.querySelectorAll('#secbar i').forEach((e,k)=>e.style.setProperty('--p',(k<n?100:k===n?Math.round((f||0)*100):0)+'%'))}
// every section has its own colour theme (body[data-sec]) and header band
function frame(sec,sub){stage.replaceChildren();stage.className='sec-'+sec;document.body.dataset.sec=sec;$('app').classList.toggle('wide',sec==='reading');updBar(sec,0);
 const b=el('div','band'),d=el('div');b.append(el('span','no',String(ORDER.indexOf(sec)+1).padStart(2,'0')));d.append(el('h2',null,T('sec_'+sec)));if(sub)d.append(el('p','small',sub));b.append(d);stage.append(b)}
function plain(key){stage.replaceChildren(el('h2',null,T(key)))}
function foot(label,fn){const e=el('p','err'),n=el('div','nav'),b=el('button','btn',T(label));e.setAttribute('role','alert');b.type='button';b.onclick=()=>{e.textContent='';fn(b,e)};n.append(el('span'),b);stage.append(e,n);return b}
function startTimer(){if(tick)return;const end=Date.now()+TEST_MINUTES*6e4,t=$('timer');t.hidden=false;
 tick=setInterval(()=>{const l=Math.max(0,end-Date.now());t.textContent=Math.floor(l/6e4)+':'+String(Math.floor(l/1e3)%60).padStart(2,'0');if(!l){clearInterval(tick);stage.replaceChildren(el('p','lead',T('timeUp')));finish()}},1000)}
function showIntro(){phase='i';plain('tIntro');stage.append(el('p',null,T('adaptNote')),el('p','lead',T('tipsTest')));foot('begin',()=>{startTimer();load(null)})}
function secIntro(sec,total,go){phase='si';introArgs=[sec,total,go];curSec=sec;frame(sec,T('part',ORDER.indexOf(sec)+1,6));
 const c=el('div','intro-card');c.append(el('p',null,T('ins_'+sec)));if(total)c.append(el('p','small',T('nQ',total)));stage.append(c);foot('startSec',()=>go())}
const toWriting=()=>openData.writing?secIntro('writing',0,showWriting):toSpeaking();
const toSpeaking=()=>openData.speaking.length?secIntro('speaking',0,showSpeaking):finish();
async function load(ans){phase='l';plain('loading');
 try{const r=await post({action:'next',token:tk,state:st,answer:ans});if(!r.ok)throw 0;st=r.state;sessionStorage.setItem('st',JSON.stringify(st));
  if(r.phase==='open'){openData=r;writ.text='';return toWriting()}
  r.q.o=shuf(r.q.o);lastR=r;sel=null;
  if(r.sec!==curSec)secIntro(r.sec,r.total,showQ);else showQ()}
 catch(e){plain('eTest');foot('begin',()=>load(ans))}}
function showQ(){phase='q';const r=lastR,q=r.q,sec=r.sec;frame(sec,T('qOf',r.i,r.total));updBar(sec,(r.i-1)/r.total);
 const body=el('div',sec==='reading'?'split2':'qbody'),L1=sec==='reading'?el('div'):body,R1=sec==='reading'?el('div'):body;if(sec==='reading')body.append(L1,R1);
 if(q.p)L1.append(ltr(el('div','passage',q.p)));
 if(sec==='listening'&&!q.a)R1.append(el('p','err',T('audioErr')));
 if(q.a){const box=el('div','player'),eq=el('span','eq'),a=el('audio'),n=el('p','small'),k=q.id;for(let i=0;i<9;i++)eq.append(el('i'));
  a.src=AUDIO_DIR+q.a.split('/').map(encodeURIComponent).join('/');a.addEventListener('error',()=>{n.className='err';n.dir='ltr';n.textContent=T('audioErr')+' ['+a.getAttribute('src')+']'});a.controls=true;plays[k]=plays[k]||0;let busy=false;const upd=()=>n.textContent=T('listenNote')+' '+T('plays',plays[k],MAX_PLAYS);upd();
  a.addEventListener('play',()=>{if(busy)return;if(plays[k]>=MAX_PLAYS){a.pause();return}busy=true;plays[k]++;upd()});
  a.addEventListener('ended',()=>{busy=false;if(plays[k]>=MAX_PLAYS){a.controls=false;n.textContent=T('noPlays')}});box.append(eq,a);R1.append(box,n)}
 R1.append(ltr(el('p','qtext',q.q)));
 let nb;const inputs=[],clr=el('button','linkbtn',T('clear'));clr.type='button';clr.hidden=sel==null;
 const setSel=v=>{sel=v;inputs.forEach(x=>x.checked=v!=null&&x.value===v);clr.hidden=v==null;if(nb)nb.textContent=T(v==null?'skip':'next')};
 clr.onclick=()=>setSel(null);
 const ops=el('div','opts');q.o.forEach((o,k)=>{const l=ltr(el('label','opt')),i=el('input');i.type='radio';i.name='o';i.value=o;i.checked=sel===o;i.onclick=()=>setSel(sel===o?null:o);inputs.push(i);l.append(i,el('b','let','ABCD'[k]),el('span',null,o));ops.append(l)});
 R1.append(ops,el('p','small',T('skipHint')),clr);stage.append(body);
 nb=foot(sel==null?'skip':'next',b=>{b.disabled=true;load(sel==null?{id:q.id,skip:true}:{id:q.id,text:sel})})}
function showWriting(){phase='w';const w=openData.writing;frame('writing',T('wrNote',w.min,w.max));stage.append(ltr(el('p','qtext',w.q)));
 const t=ltr(el('textarea')),c=el('p','small');t.value=writ.text;t.setAttribute('aria-label',T('ans'));t.maxLength=3000;
 const u=()=>{writ.text=t.value;c.textContent=T('words',wc(t.value),w.min,w.max)};t.oninput=u;u();stage.append(t,c);
 foot('next',(b,e)=>{const n=wc(writ.text);if(n<w.min||n>w.max)return e.textContent=T('errWords',w.min,w.max);toSpeaking()})}
function showSpeaking(){const sp=openData.speaking;phase='s';frame('speaking',T('spNote',sp[0].max,MAX_RERECORDS));
 sp.forEach((p,i)=>{const w=el('div','rcard');w.append(el('p','small',T('qOf',i+1,sp.length)),ltr(el('p','qtext',p.q)));recorder(w,i,p.max);stage.append(w)});
 foot('finish',(b,e)=>{if(sp.some((_,i)=>!aud[i]))return e.textContent=T('errRec');b.disabled=true;finish()})}
const rr={}; // recordings made per prompt: 1 first take + MAX_RERECORDS re-records
function recorder(w,k,max){const row=el('div','rec'),btn=el('button','btn',T(aud[k]?'rerec':'rec')),st2=el('span','lead',aud[k]?T('recd'):''),pl=el('audio'),left=el('p','small');btn.type='button';pl.controls=true;if(aud[k])pl.src=URL.createObjectURL(aud[k]);else pl.hidden=true;
 const lft=()=>1+MAX_RERECORDS-(rr[k]||0);
 const upd=()=>{if(!rr[k]){left.textContent='';return}if(lft()<=0){btn.disabled=true;left.textContent=T('rrNone')}else left.textContent=T('rrLeft',lft())};upd();
 let mr,ch=[],to;const stop=()=>{if(mr&&mr.state==='recording')mr.stop()};
 btn.onclick=async()=>{if(mr&&mr.state==='recording')return stop();if(lft()<=0)return;
  try{const s=await navigator.mediaDevices.getUserMedia({audio:true});mr=new MediaRecorder(s,{audioBitsPerSecond:32000});ch=[];
   mr.ondataavailable=e=>ch.push(e.data);
   mr.onstop=()=>{clearTimeout(to);s.getTracks().forEach(t=>t.stop());aud[k]=new Blob(ch,{type:mr.mimeType});rr[k]=(rr[k]||0)+1;pl.src=URL.createObjectURL(aud[k]);pl.hidden=false;btn.textContent=T('rerec');st2.textContent=T('recd');upd()};
   mr.start();btn.textContent=T('stop');st2.textContent=T('recing',max);to=setTimeout(stop,max*1000)}
  catch(e){st2.textContent=T('mic')}};
 row.append(btn,st2,pl);w.append(row,left)}
async function finish(){if(sent)return;sent=true;clearInterval(tick);stage.replaceChildren(el('p','lead',T('sending')));
 try{const sp=[];if(openData)for(const [i,p] of openData.speaking.entries())if(aud[i])sp.push({id:p.id,mime:aud[i].type,data:await b64(aud[i])});
  const r=await post({action:'finish',token:tk,writing:openData&&openData.writing?{id:openData.writing.id,text:writ.text}:null,speaking:sp});
  if(!r.ok)throw 0;sessionStorage.setItem('done','1');location.href='book.html'}
 catch(e){sent=false;stage.replaceChildren(el('p','err',T('sendFail')));foot('finish',()=>finish())}}
addEventListener('beforeunload',e=>{if(phase!=='i'&&!sent){e.preventDefault();e.returnValue=''}});
document.addEventListener('langchange',()=>{({i:showIntro,si:()=>introArgs&&secIntro(...introArgs),q:()=>lastR&&showQ(),w:showWriting,s:showSpeaking})[phase]?.()});
initLang($('lang'));
