(() => {
  const lang = document.body.dataset.language;
  const base = document.body.dataset.base || '';
  const bn = lang === 'bn';
  const text = (b, e) => bn ? b : e;
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key = 'iqa-saved-lessons';
  function saved() {try {const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(x=>typeof x==='string'):[];}catch{return [];}}
  function writeSaved(value) {try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  const toggle=document.querySelector('.menu-toggle');
  toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));document.querySelector('#main-nav').classList.toggle('is-open',open);});
  const save=document.querySelector('#save-lesson');
  function syncButton(){if(!save)return;const active=saved().includes(save.dataset.slug);save.setAttribute('aria-pressed',String(active));save.textContent=active?text('সংরক্ষিত ✓','Saved ✓'):text('সংরক্ষণ করুন ♡','Save lesson ♡');}
  syncButton();
  save?.addEventListener('click',()=>{const current=saved();const slug=save.dataset.slug;const active=current.includes(slug);const ok=writeSaved(active?current.filter(x=>x!==slug):[...current,slug]);syncButton();document.querySelector('#save-status').textContent=ok?text(active?'তালিকা থেকে সরানো হয়েছে।':'এই ব্রাউজারে সংরক্ষিত হয়েছে।',active?'Removed from your list.':'Saved in this browser.'):text('এই ব্রাউজারে সংরক্ষণ করা যাচ্ছে না।','Storage is unavailable in this browser.');});
  let font=1.13;
  function resize(delta){font=Math.min(1.6,Math.max(.95,font+delta));document.documentElement.style.setProperty('--reading-size',`${font}rem`);}
  document.querySelector('#font-smaller')?.addEventListener('click',()=>resize(-.1));
  document.querySelector('#font-larger')?.addEventListener('click',()=>resize(.1));
  const form=document.querySelector('#search-form');
  const savedResults=document.querySelector('#saved-results');
  if(!form&&!savedResults)return;
  let all=[];
  const card=(p)=>`<a class="lesson-card" href="${escape(p.url)}"><div class="lesson-card-meta"><span>${p.kind==='lesson'?text('পাঠ','Lesson'):text('বিভাগ ও নির্দেশিকা','Guide')}</span></div><h3>${escape(p.title)}</h3><p>${escape(p.description)}</p><span class="text-link">${text('পড়ুন','Read')} ↗</span></a>`;
  function showSaved(){const list=all.filter(p=>p.kind==='lesson'&&saved().includes(p.route.split('/')[1]));savedResults.innerHTML=list.length?list.map(card).join(''):`<div class="empty-state"><span aria-hidden="true">♡</span><h2>${text('এখনো কোনো পাঠ সংরক্ষিত নেই','Your reading shelf is empty')}</h2><p>${text('কোনো পাঠে “সংরক্ষণ করুন” চাপুন। পরে এখানে ফিরে পড়তে পারবেন।','Select “Save lesson” while reading a lesson to find it here later.')}</p><a class="text-link" href="${base}/${lang}/start/">${text('পড়া শুরু করুন','Begin reading')} ↗</a></div>`;}
  function search(){const input=document.querySelector('#search-input');const q=input.value.trim().normalize('NFKC').toLocaleLowerCase(lang);const results=document.querySelector('#search-results');const status=document.querySelector('#search-status');const matches=all.filter(p=>!['search/','saved/'].includes(p.route)&&(!q||`${p.title} ${p.description}`.normalize('NFKC').toLocaleLowerCase(lang).includes(q)));results.innerHTML=matches.map(card).join('');status.textContent=q?text(`${matches.length}টি ফলাফল`,`${matches.length} result${matches.length===1?'':'s'}`):text('প্রকাশিত পাঠ ও বিষয়ের নির্দেশিকা','Published lessons and subject guides');const u=new URL(location.href);q?u.searchParams.set('q',input.value.trim()):u.searchParams.delete('q');history.replaceState(null,'',u);}
  form?.addEventListener('submit',e=>{e.preventDefault();search();});
  fetch(`${base}/search-index.json`).then(r=>{if(!r.ok)throw Error('index');return r.json();}).then(data=>{all=data.filter(p=>p.l===lang);if(savedResults)showSaved();if(form){document.querySelector('#search-input').value=new URLSearchParams(location.search).get('q')||'';document.querySelector('#search-input').addEventListener('input',search);search();}}).catch(()=>{const message=text('তালিকা লোড হয়নি। পাতা রিফ্রেশ করুন অথবা বিষয়ের তালিকা থেকে পড়ুন।','The list could not load. Refresh the page or browse the subject collection.');if(form)document.querySelector('#search-status').textContent=message;if(savedResults)savedResults.textContent=message;});
})();
