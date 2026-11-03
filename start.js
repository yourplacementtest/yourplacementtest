'use strict';
const D={name:'',age:'',guardian:false,email:'',phone:'',pn:'',cc:'',consent:false};
let step=0,busy=false;
const steps=()=>['name','age',...(+D.age&&+D.age<18?['guardian']:[]),'email','phone','terms'];
const HEAD={name:'qName',age:'qAge',guardian:'guardTitle',email:'qEmail',phone:'qPhone',terms:'qTerms'};
function collect(){const i=$('fld');if(!i)return;const k=steps()[step];if(k==='guardian')D.guardian=i.checked;else if(k==='terms')D.consent=i.checked;else D[k==='phone'?'pn':k]=i.value.trim()}
function render(){const ss=steps(),k=ss[step],box=$('stepbox');box.replaceChildren();$('err').textContent='';
 $('stepno').textContent=T('stepOf',step+1,ss.length);
 $('bar').replaceChildren(...ss.map((_,n)=>el('i',n<=step?'on':'')));
 const h=el('h2','big',T(HEAD[k]));h.id='qh';box.append(h);let f;
 if(k==='phone'){f=phoneUI(box)}
 else if(k==='guardian'||k==='terms'){const l=el('label','check');f=el('input');f.type='checkbox';f.checked=k==='guardian'?D.guardian:D.consent;
  const s=el('span',null,T(k==='guardian'?'guardian':'consent'));l.append(f,s);if(k==='terms'){s.append(' ');const a=el('a',null,T('privLink'));a.href='#privacy';s.append(a)}box.append(l)}
 else{f=el('input');f.value=D[k];f.setAttribute('aria-labelledby','qh');
  const m={name:['text','name'],age:['number',''],email:['email','email'],phone:['tel','tel']}[k];f.type=m[0];if(m[1])f.autocomplete=m[1];
  if(k==='name')f.maxLength=80;if(k==='email')f.maxLength=120;
  if(k==='age'){f.min=13;f.max=99;f.inputMode='numeric'}box.append(f)}
 f.id='fld';$('cont').textContent=T(step===ss.length-1?'start':'cont');if(k!=='terms')f.focus()}
function check(k){const v=($('fld').value||'').trim();
 if(k==='name')return v.length<2?T('eName'):'';
 if(k==='age')return !+v?T('eAge'):+v<13?T('e3'):+v>99?T('eAge'):'';
 if(k==='guardian')return $('fld').checked?'':T('e4');
 if(k==='email')return /^\S+@\S+\.\S+$/.test(v)?'':T('eEmail');
 if(k==='phone'){if(!D.cc&&!v.trim().startsWith('+')){flashFn();return T('eCountry')}const p=fullPhone(v);if(!p)return T('e2');D.phone=p;return ''}
 return $('fld').checked?'':T('e5')}
$('wz').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;const ss=steps(),er=check(ss[step]);if(er)return $('err').textContent=er;collect();
 if(step<ss.length-1){step++;return render()}
 busy=true;$('cont').disabled=true;
 try{const r=await post({action:'begin',user:{name:D.name,age:+D.age,email:D.email,phone:D.phone,guardian:D.guardian,tz:Intl.DateTimeFormat().resolvedOptions().timeZone,lang:L,hp:$('hp').value}});
  if(!r.ok){if(r.error==='duplicate'){busy=false;$('cont').disabled=false;return $('err').textContent=T('eDup')}throw 0}sessionStorage.setItem('tk',r.token);sessionStorage.removeItem('st');sessionStorage.removeItem('done');sessionStorage.removeItem('booked');location.href='test.html'}
 catch(x){busy=false;$('cont').disabled=false;$('err').textContent=T('eNet')}});
$('back').onclick=()=>{collect();if(step>0){step--;render()}else location.href='home.html'};
document.addEventListener('langchange',()=>{if(!busy){collect();render()}});
initLang($('lang'));
