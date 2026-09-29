(function(){
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const get = (o, p) => p.split('.').reduce((a, k) => a && a[k], o);
  const $ = id => document.getElementById(id);
  const set = (id, html) => { const el = $(id); if (el) el.innerHTML = html; };

  const UI = {
    en: { nav_work:'Work', nav_services:'Services', nav_about:'About', nav_contact:'Contact', cta:'Start a project',
      k_work:'Selected work', all_behance:'All projects on Behance ↗', k_services:'Services',
      services_h:'Marketing, creative and technology, <span class="hl-purple">under one roof.</span>',
      k_reels:'Latest from Instagram', k_about:'About', k_approach:'How we work', k_industries:'Industries', k_clients:'Clients include',
      email_us:'Email us ↗', whatsapp:'WhatsApp', m_email:'Email', m_phone:'Phone', m_studio:'Studio',
      views:'views', likes:'likes', saves:'saves', comments:'comments', play:'Play', toggle:'ع', mute:'Sound', dashboard:'Dashboard',
      footer_seo:'Media Store — digital marketing agency in Banha, Qalyubia, Egypt. Social media, production, ads, websites and apps.' },
    ar: { nav_work:'أعمالنا', nav_services:'خدماتنا', nav_about:'من نحن', nav_contact:'تواصل', cta:'ابدأ مشروعك',
      k_work:'أعمال مختارة', all_behance:'كل المشاريع على Behance ↗', k_services:'الخدمات',
      services_h:'تسويق وإبداع وتكنولوجيا، <span class="hl-purple">تحت سقف واحد.</span>',
      k_reels:'أحدث ما على إنستجرام', k_about:'من نحن', k_approach:'طريقة عملنا', k_industries:'القطاعات', k_clients:'من عملائنا',
      email_us:'راسلنا ↗', whatsapp:'واتساب', m_email:'البريد', m_phone:'الهاتف', m_studio:'الاستوديو',
      views:'مشاهدة', likes:'إعجاب', saves:'حفظ', comments:'تعليق', play:'تشغيل', toggle:'EN', mute:'الصوت', dashboard:'لوحة التحكم',
      footer_seo:'ميديا ستور — شركة تسويق رقمي في بنها، القليوبية، مصر. سوشيال ميديا، تصوير وإنتاج، إعلانات ممولة، مواقع وتطبيقات.' }
  };
  const ICON = {
    eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.5-9.5-9C.8 8.5 2.7 4 7 4c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 4.3 0 6.2 4.5 4.5 8-2.5 4.5-9.5 9-9.5 9z"/></svg>',
    save:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/></svg>',
    chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.4A8.5 8.5 0 1 1 21 12z"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    sound:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    muted:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="m16 9 6 6M22 9l-6 6"/></svg>'
  };

  let lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('ms-lang') || ((navigator.language || '').startsWith('ar') ? 'ar' : 'en');
  let data = null, feed = [], cur = -1;
  const L = () => UI[lang];
  const tr = (o, k) => (lang === 'ar' && o && o[k + '_ar']) ? o[k + '_ar'] : (o ? o[k] : '');
  const trPath = p => { const i = p.lastIndexOf('.'); return tr(get(data, p.slice(0, i)), p.slice(i + 1)); };
  const fmt = n => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  const num = v => (v === null || v === undefined || v === '') ? null : Number(v);
  const codeOf = u => (String(u || '').match(/instagram\.com\/(?:p|reel|reels)\/([^/?#]+)/) || [])[1] || '';

  function applyLang() {
    const h = document.documentElement;
    h.lang = lang; h.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = L()[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = L()[el.dataset.i18nHtml]; });
    $('lang-toggle').textContent = L().toggle;
  }

  function render() {
    const d = data;
    document.querySelectorAll('[data-bind]').forEach(el => { el.textContent = trPath(el.dataset.bind) || ''; });
    document.querySelectorAll('[data-src]').forEach(el => { const v = get(d, el.dataset.src); if (v && el.getAttribute('src') !== v) el.src = v; });

    const title = tr(d.contact, 'title') || '';
    const parts = title.split(/(?<=\.)\s+/);
    const last = parts.length > 1 ? parts.pop() : '';
    $('contact-title').innerHTML = esc(parts.join(' ')) + (last ? ' <span>' + esc(last) + '</span>' : '');

    set('stats', (d.stats || []).map(s => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(tr(s, 'label'))}</span></div>`).join(''));
    set('work-grid', (d.work || []).map(w => `
      <a class="work-card" href="${esc(w.link)}" target="_blank" rel="noopener">
        <div class="work-thumb"><img src="${esc(w.cover)}" alt="${esc(tr(w, 'title'))}" loading="lazy" referrerpolicy="no-referrer"></div>
        <div class="work-meta"><b>${esc(tr(w, 'title'))}</b><span>${esc(tr(w, 'sector'))} · ${esc(w.year)}</span></div>
      </a>`).join(''));
    const openIdx = [...document.querySelectorAll('.svc')].findIndex(x => x.open);
    set('services-list', (d.services || []).map((s, i) => `
      <details class="svc"${i === (openIdx < 0 ? 0 : openIdx) ? ' open' : ''}>
        <summary><span class="svc-n">${String(i + 1).padStart(2, '0')}</span><span class="svc-t">${esc(tr(s, 'title'))}</span><span class="svc-i" aria-hidden="true">+</span></summary>
        <div class="svc-body"><span></span><div><p>${esc(tr(s, 'body'))}</p><div class="svc-tags">${esc(tr(s, 'tags'))}</div></div></div>
      </details>`).join(''));
    set('about-points', (d.about?.points || []).map(p => `<li>${esc(tr(p, 'text'))}</li>`).join(''));
    set('steps', (d.approach || []).map(s => `<li><b>${esc(tr(s, 'title'))}</b><p>${esc(tr(s, 'body'))}</p></li>`).join(''));
    set('industries', (d.industries || []).map(x => `<li>${esc(tr(x, 'text'))}</li>`).join(''));
    set('clients', (d.clients || []).map(x => `<li>${esc(tr(x, 'text'))}</li>`).join(''));

    const c = d.contact || {};
    set('contact-actions', [
      c.email && `<a class="btn btn-dark" href="mailto:${esc(c.email)}">${L().email_us}</a>`,
      c.whatsapp && `<a class="btn btn-light" href="https://wa.me/${esc(c.whatsapp)}" target="_blank" rel="noopener">${L().whatsapp}</a>`
    ].filter(Boolean).join(''));
    set('contact-meta', [
      c.email && `<div><small>${L().m_email}</small><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>`,
      (c.phone_eg || c.phone_ksa) && `<div><small>${L().m_phone}</small>${[c.phone_eg, c.phone_ksa].filter(Boolean).map(p => `<a href="tel:${esc(p.replace(/\s/g, ''))}" dir="ltr">${esc(p)}</a>`).join('<br>')}</div>`,
      c.address && `<div><small>${L().m_studio}</small>${esc(tr(c, 'address'))}</div>`
    ].filter(Boolean).join(''));
    set('socials', (d.social || []).filter(s => s.url).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join(''));
    renderReels();
  }

  // —— Instagram ——
  const statList = (m, keys) => keys.map(([k, icon]) => m[k] == null ? '' : `<span>${ICON[icon]}${fmt(m[k])}</span>`).join('');

  function renderReels() {
    set('reels-list', feed.map((m, i) => {
      if (m.image) return `<button type="button" class="reel" data-i="${i}" aria-label="${L().play}">
        <img src="${esc(m.image)}" alt="" loading="lazy" referrerpolicy="no-referrer"><span class="reel-grad"></span>
        ${m.video ? `<span class="reel-play">${ICON.play}</span>` : ''}
        <span class="reel-stats">${statList(m, [['views','eye'],['likes','heart'],['saves','save']])}</span></button>`;
      if (m.code) return `<button type="button" class="reel reel-embed" data-i="${i}" data-code="${esc(m.code)}" aria-label="${L().play}"><span class="reel-play">${ICON.play}</span></button>`;
      return '';
    }).join(''));
    lazyEmbeds();
  }

  function lazyEmbeds() {
    const load = el => {
      if (el.dataset.loaded) return; el.dataset.loaded = '1';
      const f = document.createElement('iframe');
      f.src = `https://www.instagram.com/p/${el.dataset.code}/embed`;
      f.loading = 'lazy'; f.title = 'Instagram'; f.tabIndex = -1; f.setAttribute('scrolling', 'no');
      el.prepend(f);
    };
    const els = document.querySelectorAll('.reel-embed');
    if (!('IntersectionObserver' in window)) return els.forEach(load);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } }), { rootMargin: '300px' });
    els.forEach(el => io.observe(el));
  }

  async function loadFeed() {
    try {
      const r = await fetch('api/instagram', { headers: { accept: 'application/json' } });
      if (r.ok && (r.headers.get('content-type') || '').includes('json')) {
        const j = await r.json();
        if (j.items && j.items.length) return j.items;
      }
    } catch (e) {}
    return (data.reels || []).map(r => ({
      image: r.cover || '', video: r.video || '', caption: r.caption || '', code: codeOf(r.url),
      views: num(r.views), likes: num(r.likes), saves: num(r.saves), comments: null
    }));
  }

  // —— Player ——
  const player = $('player');
  let muted = false;
  function open(i) {
    cur = (i + feed.length) % feed.length;
    const m = feed[cur], box = $('pl-media');
    box.style.aspectRatio = '9/16';
    if (m.video) {
      box.innerHTML = `<video src="${esc(m.video)}" poster="${esc(m.image)}" playsinline loop preload="auto"></video>
        <button type="button" class="pl-mute" aria-label="${L().mute}">${muted ? ICON.muted : ICON.sound}</button>
        <span class="pl-paused">${ICON.play}</span>`;
      const v = box.querySelector('video');
      v.muted = muted;
      v.addEventListener('loadedmetadata', () => { if (v.videoWidth) box.style.aspectRatio = v.videoWidth + '/' + v.videoHeight; });
      v.addEventListener('play', () => box.classList.remove('is-paused'));
      v.addEventListener('pause', () => box.classList.add('is-paused'));
      v.addEventListener('click', () => v.paused ? v.play() : v.pause());
      box.querySelector('.pl-mute').addEventListener('click', e => { e.stopPropagation(); muted = !muted; v.muted = muted; e.currentTarget.innerHTML = muted ? ICON.muted : ICON.sound; });
      v.play().catch(() => { v.muted = muted = true; box.querySelector('.pl-mute').innerHTML = ICON.muted; v.play().catch(() => {}); });
    } else if (m.image) {
      box.innerHTML = `<img src="${esc(m.image)}" alt="" referrerpolicy="no-referrer">`;
      const im = box.querySelector('img');
      im.onload = () => { box.style.aspectRatio = im.naturalWidth + '/' + im.naturalHeight; };
    } else {
      box.style.aspectRatio = '4/5';
      box.innerHTML = `<div class="pl-embed"><iframe src="https://www.instagram.com/p/${esc(m.code)}/embed" title="Instagram" scrolling="no"></iframe></div>`;
    }
    const s = [['views','eye'],['likes','heart'],['saves','save'],['comments','chat']]
      .filter(([k]) => m[k] != null).map(([k, ic]) => `<div class="pl-stat">${ICON[ic]}<b>${fmt(m[k])}</b><span>${L()[k]}</span></div>`).join('');
    set('pl-stats', s);
    $('pl-cap').textContent = (m.caption || '').split('\n')[0].slice(0, 180);
    player.querySelectorAll('.pl-nav').forEach(b => b.hidden = feed.length < 2);
    if (player.hidden) { player.hidden = false; document.body.style.overflow = 'hidden'; }
  }
  function close() {
    player.hidden = true; document.body.style.overflow = ''; $('pl-media').innerHTML = ''; cur = -1;
  }
  const step = dir => open(cur + dir);

  player.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') close();
    else if (act === 'prev') step(lang === 'ar' ? 1 : -1);
    else if (act === 'next') step(lang === 'ar' ? -1 : 1);
    else if (e.target === player) close();
  });
  addEventListener('keydown', e => {
    if (player.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(lang === 'ar' ? -1 : 1);
    if (e.key === 'ArrowLeft') step(lang === 'ar' ? 1 : -1);
  });
  let tx = null;
  player.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  player.addEventListener('touchend', e => {
    if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) step((dx < 0) !== (lang === 'ar') ? 1 : -1);
  });
  $('reels-list').addEventListener('click', e => { const b = e.target.closest('.reel'); if (b) open(+b.dataset.i); });

  // —— Boot ——
  $('lang-toggle').addEventListener('click', () => {
    lang = lang === 'ar' ? 'en' : 'ar'; localStorage.setItem('ms-lang', lang);
    applyLang(); if (data) render(); if (cur >= 0) open(cur);
  });
  const nav = document.querySelector('.nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });
  $('year').textContent = new Date().getFullYear();
  applyLang();

  fetch('content/site.json', { cache: 'no-cache' }).then(r => r.json()).then(async d => {
    data = d; render();
    feed = await loadFeed(); renderReels();
  }).catch(e => console.error('Content failed to load', e));
})();
