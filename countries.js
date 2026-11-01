'use strict';
// Country list for the phone step: ISO code + dial code. Names come from the browser in the student's language.
const CC='AF93 AL355 DZ213 AD376 AO244 AR54 AM374 AU61 AT43 AZ994 BH973 BD880 BY375 BE32 BJ229 BT975 BO591 BA387 BW267 BR55 BN673 BG359 BF226 BI257 KH855 CM237 CA1 CV238 CF236 TD235 CL56 CN86 CO57 KM269 CG242 CD243 CR506 CI225 HR385 CU53 CY357 CZ420 DK45 DJ253 EC593 EG20 SV503 GQ240 ER291 EE372 SZ268 ET251 FJ679 FI358 FR33 GA241 GM220 GE995 DE49 GH233 GR30 GT502 GN224 GW245 GY592 HT509 HN504 HK852 HU36 IS354 IN91 ID62 IR98 IQ964 IE353 IL972 IT39 JM1876 JP81 JO962 KZ7 KE254 KW965 KG996 LA856 LV371 LB961 LS266 LR231 LY218 LI423 LT370 LU352 MO853 MG261 MW265 MY60 MV960 ML223 MT356 MR222 MU230 MX52 MD373 MC377 MN976 ME382 MA212 MZ258 MM95 NA264 NP977 NL31 NZ64 NI505 NE227 NG234 MK389 NO47 OM968 PK92 PS970 PA507 PG675 PY595 PE51 PH63 PL48 PT351 QA974 RO40 RU7 RW250 SA966 SN221 RS381 SC248 SL232 SG65 SK421 SI386 SO252 ZA27 KR82 SS211 ES34 LK94 SD249 SR597 SE46 CH41 SY963 TW886 TJ992 TZ255 TH66 TL670 TG228 TT1868 TN216 TR90 TM993 UG256 UA380 AE971 GB44 US1 UY598 UZ998 VE58 VN84 YE967 ZM260 ZW263'.split(' ').map(s=>[s.slice(0,2),s.slice(2)]);
function flagsWork(){try{const c=document.createElement('canvas');c.width=c.height=20;const x=c.getContext('2d');x.font='16px sans-serif';x.fillText('\u{1F1F9}\u{1F1F7}',0,16);
 const d=x.getImageData(0,0,20,20).data;for(let i=0;i<d.length;i+=4)if(d[i+3]&&Math.abs(d[i]-d[i+1])>60)return true}catch(e){}return false}
const FLAGS_OK=flagsWork(); // Windows has no flag emoji: then a small ISO code (TR, DE...) is shown instead
const emoji=iso=>String.fromCodePoint(...[...iso].map(c=>0x1F1E6+c.charCodeAt(0)-65));
const fl=iso=>FLAGS_OK?el('span','fl',emoji(iso)):el('span','fl iso',iso);
const cname=iso=>{try{return new Intl.DisplayNames([L],{type:'region'}).of(iso)||iso}catch(e){return iso}};
const guess=()=>{const m=(navigator.language||'').match(/-([A-Za-z]{2})$/);const r=m?m[1].toUpperCase():'';return CC.some(c=>c[0]===r)?r:''};
let wrapRef=null,closePop=()=>{};
document.addEventListener('click',e=>{if(wrapRef&&!wrapRef.contains(e.target))closePop()});
function fullPhone(v){const d=v.replace(/\D/g,'');if(v.trim().startsWith('+'))return d.length>=7&&d.length<=15?'+'+d:'';
 const c=CC.find(x=>x[0]===D.cc);if(!c||!d)return '';const n=D.cc==='IT'?d:d.replace(/^0+/,'');const t=c[1]+n;return n.length>=5&&t.length<=15?'+'+t:''}
function phoneUI(box){
 const wrap=el('div','phonewrap'),row=el('div','phone'),btn=el('button','cc'),inp=el('input'),pop=el('div','pop'),sr=el('input'),ul=el('ul','clist');
 row.dir='ltr';btn.type='button';btn.setAttribute('aria-haspopup','listbox');btn.setAttribute('aria-expanded','false');
 const lab=()=>{btn.replaceChildren();const c=CC.find(x=>x[0]===D.cc);if(c)btn.append(fl(c[0]),el('span',null,'+'+c[1]));else btn.append(el('span',null,T('phSelect')));btn.append(el('span',null,'▾'))};
 inp.type='tel';inp.value=D.pn;inp.maxLength=20;inp.autocomplete='tel-national';inp.inputMode='tel';inp.setAttribute('aria-labelledby','qh');
 pop.hidden=true;sr.type='search';sr.placeholder=T('phSearch');sr.setAttribute('aria-label',T('phSearch'));
 const close=()=>{pop.hidden=true;btn.setAttribute('aria-expanded','false')};
 const fill=()=>{const q=sr.value.trim().toLowerCase().replace(/^\+/,'');ul.replaceChildren();
  CC.map(c=>[c,cname(c[0])]).sort((a,b)=>a[1].localeCompare(b[1],L)).filter(([c,n])=>!q||n.toLowerCase().includes(q)||c[0].toLowerCase()===q||c[1].startsWith(q)).forEach(([c,n])=>{
   const li=el('li'),b=el('button');b.type='button';b.append(fl(c[0]),el('span','nm',n),el('span','dl','+'+c[1]));b.onclick=()=>{D.cc=c[0];lab();close();inp.focus()};li.append(b);ul.append(li)})};
 const open=()=>{pop.hidden=false;btn.setAttribute('aria-expanded','true');sr.value='';fill();sr.focus()};
 btn.onclick=()=>pop.hidden?open():close();sr.oninput=fill;
 sr.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const b=ul.querySelector('button');if(b)b.click()}};
 pop.addEventListener('keydown',e=>{if(e.key==='Escape'){close();btn.focus()}});
 lab();pop.append(sr,ul);row.append(btn,inp);wrap.append(row,pop);box.append(el('p','small',T('hPhone')),wrap);wrapRef=wrap;closePop=close;return inp}
