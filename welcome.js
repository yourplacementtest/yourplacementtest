'use strict';
document.querySelectorAll('.langs a').forEach(a=>a.addEventListener('click',()=>{try{localStorage.setItem('lang',a.dataset.lang)}catch(e){}}));
