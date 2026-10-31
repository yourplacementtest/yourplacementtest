'use strict';
// ===== HOW TO EDIT =====
// Each language has its own block in CV below. Replace every [bracketed hint] with your real text.
// Leave a value as '' to hide it. Add or delete items inside the experience, education, skills and languages lists.
// The page labels (Profile, Experience...) are the cv_* lines further down.
const CV={
en:{name:'[Your name]',role:'[Your title]',email:'[email]',whatsapp:'[WhatsApp number]',location:'[City, country]',
 profile:'[Short profile: who you are and how you teach]',
 experience:[{title:'[Job title]',place:'[Place]',dates:'[Years]',text:'[What you did]'},{title:'[Job title]',place:'[Place]',dates:'[Years]',text:'[What you did]'}],
 education:[{title:'[Degree or certificate]',place:'[Institution]',dates:'[Year]'},{title:'[Degree or certificate]',place:'[Institution]',dates:'[Year]'}],
 skills:['[Skill]','[Skill]','[Skill]','[Skill]'],languages:[{name:'[Language]',level:'[Level]'},{name:'[Language]',level:'[Level]'}]},
tr:{name:'[Adınız]',role:'[Unvanınız]',email:'[e-posta]',whatsapp:'[WhatsApp numarası]',location:'[Şehir, ülke]',
 profile:'[Kısa tanıtım: kim olduğunuz ve nasıl öğrettiğiniz]',
 experience:[{title:'[Görev]',place:'[Kurum]',dates:'[Yıllar]',text:'[Neler yaptınız]'},{title:'[Görev]',place:'[Kurum]',dates:'[Yıllar]',text:'[Neler yaptınız]'}],
 education:[{title:'[Diploma veya sertifika]',place:'[Kurum]',dates:'[Yıl]'},{title:'[Diploma veya sertifika]',place:'[Kurum]',dates:'[Yıl]'}],
 skills:['[Beceri]','[Beceri]','[Beceri]','[Beceri]'],languages:[{name:'[Dil]',level:'[Seviye]'},{name:'[Dil]',level:'[Seviye]'}]},
ar:{name:'[اسمك]',role:'[المسمى الوظيفي]',email:'[البريد الإلكتروني]',whatsapp:'[رقم واتساب]',location:'[المدينة، الدولة]',
 profile:'[نبذة قصيرة: من أنت وكيف تدرّس]',
 experience:[{title:'[المسمى الوظيفي]',place:'[جهة العمل]',dates:'[السنوات]',text:'[ما الذي قمت به]'},{title:'[المسمى الوظيفي]',place:'[جهة العمل]',dates:'[السنوات]',text:'[ما الذي قمت به]'}],
 education:[{title:'[الشهادة أو الدرجة]',place:'[الجهة]',dates:'[السنة]'},{title:'[الشهادة أو الدرجة]',place:'[الجهة]',dates:'[السنة]'}],
 skills:['[مهارة]','[مهارة]','[مهارة]','[مهارة]'],languages:[{name:'[اللغة]',level:'[المستوى]'},{name:'[اللغة]',level:'[المستوى]'}]},
fa:{name:'[نام شما]',role:'[عنوان شغلی]',email:'[ایمیل]',whatsapp:'[شماره واتس‌اپ]',location:'[شهر، کشور]',
 profile:'[معرفی کوتاه: شما کیستید و چگونه تدریس می‌کنید]',
 experience:[{title:'[عنوان شغلی]',place:'[محل کار]',dates:'[سال‌ها]',text:'[کارهایی که انجام دادید]'},{title:'[عنوان شغلی]',place:'[محل کار]',dates:'[سال‌ها]',text:'[کارهایی که انجام دادید]'}],
 education:[{title:'[مدرک یا گواهینامه]',place:'[مؤسسه]',dates:'[سال]'},{title:'[مدرک یا گواهینامه]',place:'[مؤسسه]',dates:'[سال]'}],
 skills:['[مهارت]','[مهارت]','[مهارت]','[مهارت]'],languages:[{name:'[زبان]',level:'[سطح]'},{name:'[زبان]',level:'[سطح]'}]}};
// ===== Page labels =====
Object.assign(I18N.en,{cv_back:'Back to the placement test',cv_profile:'Profile',cv_exp:'Experience',cv_edu:'Education and certificates',cv_skills:'Skills',cv_langs:'Languages',cv_contact:'Contact',cv_cta:'Take the placement test'});
Object.assign(I18N.tr,{cv_back:'Teste dön',cv_profile:'Profil',cv_exp:'Deneyim',cv_edu:'Eğitim ve sertifikalar',cv_skills:'Beceriler',cv_langs:'Diller',cv_contact:'İletişim',cv_cta:'Seviye belirleme testini çöz'});
Object.assign(I18N.ar,{cv_back:'العودة إلى الاختبار',cv_profile:'نبذة',cv_exp:'الخبرة',cv_edu:'التعليم والشهادات',cv_skills:'المهارات',cv_langs:'اللغات',cv_contact:'التواصل',cv_cta:'ابدأ اختبار تحديد المستوى'});
Object.assign(I18N.fa,{cv_back:'بازگشت به آزمون',cv_profile:'معرفی',cv_exp:'سوابق کاری',cv_edu:'تحصیلات و گواهینامه‌ها',cv_skills:'مهارت‌ها',cv_langs:'زبان‌ها',cv_contact:'تماس',cv_cta:'شرکت در آزمون تعیین سطح'});

const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const has=v=>v&&String(v).trim();
const real=v=>has(v)&&!String(v).trim().startsWith('['); // hints in brackets are never turned into links
function renderCV(){
 const c=CV[L]||CV.en, side=$('cv-side'), main=$('cv-main');side.replaceChildren();main.replaceChildren();
 const ph=el('img','photo');ph.src='photo.jpg';ph.alt=c.name||'';ph.hidden=true;ph.addEventListener('load',()=>ph.hidden=false);side.append(ph); // add photo.jpg next to this file to show it
 if(has(c.name))side.append(el('h1',null,c.name));if(has(c.role))side.append(el('p','lead',c.role));
 const ct=el('ul','contact');
 if(has(c.email)){const li=el('li'),a=el('a',null,c.email);if(real(c.email))a.href='mailto:'+c.email;li.append(a);ct.append(li)}
 if(has(c.whatsapp)){const li=el('li'),a=el('a',null,c.whatsapp),d=String(c.whatsapp).replace(/\D/g,'');if(real(c.whatsapp)&&d.length>=7)a.href='https://wa.me/'+d;li.append(a);ct.append(li)}
 if(has(c.location))ct.append(el('li',null,c.location));
 if(ct.children.length){side.append(el('h2','cvh',T('cv_contact')),ct)}
 const cta=el('a','btn',T('cv_cta'));cta.href='index.html';side.append(cta);
 const sec=(k,nodes)=>{if(nodes.length)main.append(el('h2','cvh',T(k)),...nodes)};
 const item=o=>{const d=el('div','item');if(has(o.title))d.append(el('p','it-title',o.title));
  const m=[o.place,o.dates].filter(has).join(' · ');if(m)d.append(el('p','it-meta',m));if(has(o.text))d.append(el('p',null,o.text));return d};
 sec('cv_profile',has(c.profile)?[el('p',null,c.profile)]:[]);
 sec('cv_exp',(c.experience||[]).map(item));sec('cv_edu',(c.education||[]).map(item));
 const sk=(c.skills||[]).filter(has);if(sk.length){const u=el('ul','tags');sk.forEach(s=>u.append(el('li',null,s)));sec('cv_skills',[u])}
 const lg=(c.languages||[]).filter(l=>has(l.name));if(lg.length){const u=el('ul','tags');lg.forEach(l=>u.append(el('li',null,l.name+(has(l.level)?' — '+l.level:''))));sec('cv_langs',[u])}}
document.addEventListener('langchange',renderCV);
$('lang').onchange=e=>applyLang(e.target.value);
(()=>{let l;try{l=localStorage.getItem('lang')}catch(e){}l=l||(navigator.language||'en').slice(0,2);if(!I18N[l])l='en';$('lang').value=l;applyLang(l)})();
