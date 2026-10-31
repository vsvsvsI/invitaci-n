/* =====================================================================
   INVITACIÓN DE CUMPLEAÑOS · LÓGICA
   Los datos se leen de config.js. Aquí solo hay comportamiento.
   1 Datos · 2 Apertura del sobre · 3 Cuenta regresiva · 4 Mapa
   5 Confirmación (RSVP) · 6 Efectos
   ===================================================================== */
(() => {
  'use strict';

  const C = window.INVITACION;
  if (!C) { console.error('Falta config.js'); return; }

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const root = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => mqReduce.matches;

  if (!reduced()) root.classList.add('motion');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------------------------- 1 · Datos ---------------------------- */
  const tz = C.zonaHoraria || 'America/Santiago';
  const target = new Date(C.fechaISO);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function textoFecha() {
    const opts = { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz };
    if (C.mostrarAnio) opts.year = 'numeric';
    const p = Object.fromEntries(new Intl.DateTimeFormat('es-CL', opts).formatToParts(target).map((x) => [x.type, x.value]));
    return `${cap(p.weekday)} ${p.day} de ${p.month}` + (C.mostrarAnio ? ` de ${p.year}` : '');
  }
  function textoHora() {
    const h = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz }).format(target);
    return `${h} hrs`;
  }

  const view = {
    nombre: C.nombre, edad: C.edad,
    fecha: textoFecha(), hora: textoHora(),
    lugarNombre: C.lugar.nombre, direccion: C.lugar.direccion, sector: C.lugar.sector,
    dresscode: C.dresscode, dresscodeEtiqueta: C.dresscodeEtiqueta, mensaje: C.mensaje, info: C.infoAdicional,
  };
  $$('[data-bind]').forEach((el) => {
    const v = view[el.dataset.bind];
    if (v === undefined || v === null || v === '') el.hidden = true; else el.textContent = v;
  });

  $('#coverTitle').textContent = (C.portadaTitulo || '{nombre} te ha enviado una carta').replace('{nombre}', C.nombre);
  $('#coverHint').textContent = C.portadaPista || 'Toca el sello para abrirla';
  document.title = $('#coverTitle').textContent;
  // "Abrir en Maps": en iPhone/iPad usa el enlace de Apple Maps si se configuró
  const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  $('#mapsBtn').href = (isApple && C.lugar.enlaceApple) || C.lugar.enlaceMaps;

  /* Precarga de imágenes para que la apertura no se entrecorte */
  const IMGS = ['sobre-abierto', 'tarjeta-frente-v2', 'encaje-v2', 'globo-9', 'frutilla-1', 'frutilla-2', 'flor', 'hoja-a', 'hoja-b', 'mono-1', 'mono-2']
    .map((n) => `assets/img/${n}.webp`);
  const preloaded = Promise.all(IMGS.map((src) => { const i = new Image(); i.src = src; return i.decode().catch(() => {}); }));

  /* ------------------------ 2 · Apertura del sobre ------------------------ */
  const cover = $('#cover'), stage = $('#stage'), seal = $('#seal');
  const page = $('#page'), letter = $('#stageLetter'), cardBg = $('#cardBg');
  let state = 'closed'; // closed | opening | open

  async function openEnvelope() {
    if (state !== 'closed') return;
    state = 'opening';
    cover.classList.add('is-opening');
    stage.classList.remove('is-closed');
    await Promise.race([preloaded, wait(4000)]);

    if (reduced()) { showPage(false); return; }

    await wait(380);                          // el sello se despega
    stage.classList.add('is-open');           // la solapa gira y el sobre se acomoda
    await wait(1250);
    stage.classList.add('is-rising');         // la carta sale del sobre
    await wait(1400);
    await flyLetterToPage();
    showPage(true);
  }

  /* La carta viaja desde el sobre hasta su lugar exacto en la página (técnica FLIP) */
  async function flyLetterToPage() {
    page.classList.add('is-visible');
    window.scrollTo(0, 0);
    const from = letter.getBoundingClientRect();
    const to = cardBg.getBoundingClientRect();
    const fly = letter.cloneNode(false);
    fly.removeAttribute('id');
    fly.className = 'fly';
    Object.assign(fly.style, { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px', translate: 'none' });
    document.body.append(fly);
    letter.style.visibility = 'hidden';
    cover.classList.add('is-leaving');

    const dx = to.left - from.left, dy = to.top - from.top, s = to.width / from.width;
    const sh = 'drop-shadow(0 6px 12px rgba(107, 6, 20, .28))';
    const anim = fly.animate(
      [{ transform: 'translate(0,0) scale(1)', filter: `blur(2.4px) ${sh}` }, { transform: `translate(${dx}px,${dy}px) scale(${s})`, filter: `blur(0px) ${sh}` }],
      { duration: 1100, easing: 'cubic-bezier(.45,.02,.2,1)', fill: 'forwards' }
    );
    try { await anim.finished; } catch (_) { /* animación cancelada */ }
    page.classList.add('is-shown');
    requestAnimationFrame(() => fly.remove());
  }

  function showPage(animated) {
    page.classList.add('is-visible', 'is-shown');
    window.scrollTo(0, 0);
    document.body.classList.remove('is-locked');
    page.classList.add('is-open');
    cover.classList.add('is-fading');
    setTimeout(() => { cover.hidden = true; }, animated ? 650 : 0);
    state = 'open';
    if (animated) celebrate(9);
  }

  /* Girar la carta: frente (collage) <-> reverso (blonda con los datos) */
  const deck = $('#deck'), flipEl = $('#card'), faceF = $('#faceFront'), faceB = $('#faceBack');
  const seeBtn = $('#seeDetails'), backChip = $('#backToCard'), after = $('#after');
  let flipped = false, turning = false;
  async function turn(toBack) {
    if (state !== 'open' || turning || flipped === toBack) return;
    turning = true; flipped = toBack;
    const t = reduced() ? 0 : 1200;
    deck.classList.add('is-turning');
    seeBtn.hidden = true; backChip.hidden = true;
    if (toBack) { faceF.inert = true; faceB.inert = false; faceB.removeAttribute('aria-hidden'); }
    else { after.hidden = true; faceB.inert = true; faceB.setAttribute('aria-hidden', 'true'); window.scrollTo({ top: 0, behavior: 'auto' }); }
    flipEl.classList.toggle('is-flipped', toBack);
    await wait(t);
    deck.classList.remove('is-turning');
    if (toBack) { backChip.hidden = false; after.hidden = false; watchReveal(); }
    else { seeBtn.hidden = false; faceF.inert = false; }
    turning = false;
  }
  seeBtn.addEventListener('click', () => turn(true));
  faceF.addEventListener('click', () => turn(true));
  faceF.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); turn(true); } });
  backChip.addEventListener('click', () => turn(false));

  function closeEnvelope() {
    if (state !== 'open') return;
    window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    setTimeout(() => {
      page.classList.remove('is-shown', 'is-open', 'is-visible');
      document.body.classList.add('is-locked');
      cover.classList.remove('is-opening', 'is-leaving', 'is-fading');
      stage.classList.remove('is-open', 'is-rising');
      stage.classList.add('is-closed');
      letter.style.visibility = '';
      cover.hidden = false;
      $$('.reveal').forEach((el) => el.classList.remove('in'));
      flipped = false; turning = false;
      flipEl.classList.remove('is-flipped'); deck.classList.remove('is-turning');
      seeBtn.hidden = false; backChip.hidden = true; after.hidden = true;
      faceF.inert = false; faceB.inert = true; faceB.setAttribute('aria-hidden', 'true');
      $('#mapDrawer').classList.remove('is-open'); $('#mapToggle').setAttribute('aria-expanded', 'false'); $('#mapToggleText').textContent = 'Ver mapa';
      state = 'closed';
    }, reduced() ? 0 : 650);
  }

  stage.addEventListener('click', openEnvelope);
  $('#closeEnvelope').addEventListener('click', closeEnvelope);

  /* Aparición progresiva de las secciones al hacer scroll */
  let io;
  function watchReveal() {
    if (!('IntersectionObserver' in window) || reduced()) { $$('.reveal').forEach((el) => el.classList.add('in')); return; }
    io = io || new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.18 });
    $$('.reveal').forEach((el) => io.observe(el));
  }

  /* --------------------------- 3 · Cuenta regresiva --------------------------- */
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    const d = target.getTime() - Date.now();
    if (d > 0) {
      $('#cDias').textContent = pad(Math.floor(d / 864e5));
      $('#cHoras').textContent = pad(Math.floor(d % 864e5 / 36e5));
      $('#cMin').textContent = pad(Math.floor(d % 36e5 / 6e4));
      $('#cSeg').textContent = pad(Math.floor(d % 6e4 / 1e3));
      return;
    }
    $('#countGrid').hidden = true;
    $('.count__label').hidden = true;
    const done = $('#countDone');
    done.hidden = false;
    done.textContent = (-d < 8 * 36e5) ? '¡La fiesta ya comenzó!' : '¡Gracias por acompañarme!';
  }
  tick();
  setInterval(() => { if (!document.hidden) tick(); }, 1000);

  /* -------------------------------- 4 · Mapa -------------------------------- */
  const mapIframe = $('#mapIframe'), mapframe = $('#mapframe'), leafEl = $('#leafMap');
  let leafLoaded = false;
  function loadScript(src) { return new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s); }); }
  function loadStyle(href) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); }
  function googleFallback() {
    const L = C.lugar;
    leafEl.hidden = true; mapframe.classList.remove('is-leaflet');
    if (!mapIframe.src) mapIframe.src = L.mapaEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(L.mapaBusqueda)}&hl=es&z=16&output=embed`;
  }
  async function loadMap() {
    if (leafLoaded || mapIframe.src) return;
    const L = C.lugar;
    if (typeof L.lat !== 'number' || typeof L.lng !== 'number') return googleFallback();
    leafLoaded = true;
    try {
      loadStyle('assets/vendor/leaflet/leaflet.css');
      await loadScript('assets/vendor/leaflet/leaflet.js');
      leafEl.hidden = false; mapframe.classList.add('is-leaflet');
      const map = window.L.map(leafEl, { zoomControl: false, attributionControl: true, tap: true }).setView([L.lat, L.lng], 16);
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
      window.L.control.zoom({ position: 'bottomright' }).addTo(map);
      const icon = window.L.divIcon({ className: 'leafpin', html: '<img src="assets/img/frutilla-1.webp" alt="">', iconSize: [38, 42], iconAnchor: [19, 40] });
      window.L.marker([L.lat, L.lng], { icon, keyboard: false, title: L.nombre }).addTo(map);
      setTimeout(() => map.invalidateSize(), 800);
      window.addEventListener('resize', () => map.invalidateSize());
    } catch (err) { console.warn('Mapa:', err); leafLoaded = false; googleFallback(); }
  }
  // El mapa se despliega (y recién ahí se carga) al tocar «Ver mapa»
  const drawer = $('#mapDrawer'), mapToggle = $('#mapToggle'), mapToggleText = $('#mapToggleText');
  function setMap(open, fromClose) {
    drawer.classList.toggle('is-open', open);
    mapToggle.setAttribute('aria-expanded', String(open));
    mapToggleText.textContent = open ? 'Ocultar mapa' : 'Ver mapa';
    if (open) {
      loadMap();
      setTimeout(() => drawer.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }), reduced() ? 0 : 250);
    } else {
      mapframe.classList.remove('is-active');
      if (fromClose) mapToggle.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
    }
  }
  mapToggle.addEventListener('click', () => setMap(!drawer.classList.contains('is-open')));
  $('#mapClose').addEventListener('click', () => setMap(false, true));
  // Con el mapa de Google (sin coordenadas) se activa al tocarlo y se desactiva al tocar fuera.
  $('#mapVeil').addEventListener('click', () => mapframe.classList.add('is-active'));
  document.addEventListener('pointerdown', (e) => { if (!mapframe.contains(e.target)) mapframe.classList.remove('is-active'); });

  /* ------------------------ 5 · Confirmación (RSVP) ------------------------ */
  const dlg = $('#rsvp'), form = $('#rsvpForm'), step2 = $('#rsvpStep2');
  const guestsField = $('#guestsField'), guestsOut = $('#guestsOut'), errBox = $('#rsvpError');
  const maxG = Math.max(0, C.rsvp.maxAcompanantes ?? 4);
  let guests = 0;

  const guestNames = $('#guestNames');
  const setGuests = (n) => {
    guests = Math.min(maxG, Math.max(0, n)); guestsOut.textContent = guests;
    while (guestNames.children.length > guests) guestNames.lastElementChild.remove();
    while (guestNames.children.length < guests) {
      const i = guestNames.children.length + 1, inp = document.createElement('input');
      inp.type = 'text'; inp.maxLength = 80; inp.autocomplete = 'off'; inp.placeholder = `Nombre del acompañante ${i}`;
      inp.setAttribute('aria-label', `Nombre del acompañante ${i}`); inp.className = 'guestname';
      guestNames.appendChild(inp);
    }
  };
  const guestList = () => $$('.guestname', guestNames).map((i) => i.value.trim());

  function openRsvp() {
    form.hidden = false; step2.hidden = true; errBox.hidden = true;
    root.classList.add('modal-open');
    dlg.showModal();
  }
  function closeRsvp() { if (dlg.open) dlg.close(); }
  dlg.addEventListener('close', () => root.classList.remove('modal-open'));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeRsvp(); });       // clic en el fondo
  $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', closeRsvp));
  $('#openRsvp').addEventListener('click', openRsvp);

  $$('input[name="asistencia"]', form).forEach((r) => r.addEventListener('change', () => {
    const va = form.asistencia.value === 'si';
    guestsField.hidden = !va || maxG === 0;
    if (!va) setGuests(0);
  }));
  $$('[data-step]', form).forEach((b) => b.addEventListener('click', () => setGuests(guests + Number(b.dataset.step))));

  /* Envío automático (Google Apps Script -> planilla). Si no hay scriptUrl, se usa el formulario de Google. */
  const autoMode = !!C.rsvp.scriptUrl;
  const submitBtn = $('#rsvpSubmit');
  if (autoMode) submitBtn.textContent = 'Enviar confirmación';
  const newId = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
  let rsvpId = newId();

  async function sendRsvp(data) {
    const url = C.rsvp.scriptUrl, body = JSON.stringify(data);
    const headers = { 'Content-Type': 'text/plain;charset=utf-8' };      // "petición simple": no necesita preflight
    try {
      const res = await fetch(url, { method: 'POST', body, headers, redirect: 'follow' });
      const out = await res.json();
      if (out && out.ok) return;
      const err = new Error((out && out.error) || 'respuesta inesperada'); err.fromScript = true; throw err;
    } catch (err) {
      if (err.fromScript) throw err;
      // Puede que el navegador haya bloqueado la lectura de la respuesta aunque se guardó:
      // se reintenta sin leerla (el script ignora el mismo id repetido).
      await fetch(url, { method: 'POST', body, headers, mode: 'no-cors' });
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const asistencia = form.asistencia.value;
    if (!nombre) return showErr('Escribe tu nombre para continuar.', form.nombre);
    if (!asistencia) return showErr('Cuéntanos si vienes o no.');
    const names = asistencia === 'si' ? guestList() : [];
    const miss = names.findIndex((n) => !n);
    if (miss >= 0) return showErr('Escribe el nombre de cada acompañante.', $$('.guestname', guestNames)[miss]);
    errBox.hidden = true;

    const va = asistencia === 'si';
    const comentario = form.comentario.value.trim();
    $('#step2Title').textContent = va ? `¡Qué alegría, ${nombre.split(' ')[0]}!` : `Gracias por avisar, ${nombre.split(' ')[0]}`;
    $('#step2Text').textContent = va
      ? `Último paso: se abrirá el formulario con tus respuestas ya completas${guests ? ` (vienes con ${guests} acompañante${guests > 1 ? 's' : ''})` : ''}. Solo toca «Enviar».`
      : 'Lamentamos que no puedas venir. Último paso: se abrirá el formulario con tu respuesta ya completa. Solo toca «Enviar».';

    if (autoMode) {
      $('#step2Title').textContent = va ? `¡Gracias, ${nombre.split(' ')[0]}!` : `Gracias por avisar, ${nombre.split(' ')[0]}`;
      $('#step2Text').textContent = va
        ? `Recibimos tu confirmación${guests ? ` (vienes con ${guests} acompañante${guests > 1 ? 's' : ''})` : ''}. ¡Te esperamos!`
        : 'Recibimos tu respuesta. ¡Gracias por avisarnos!';
      if (!form.website.value) {                                         // el campo oculto atrapa bots
        submitBtn.disabled = true; const label = submitBtn.textContent; submitBtn.textContent = 'Enviando…';
        try {
          await sendRsvp({ id: rsvpId, nombre, asistencia: va ? 'Sí' : 'No', acompanantes: names, comentario });
        } catch (err) {
          console.warn('RSVP:', err);
          submitBtn.disabled = false; submitBtn.textContent = label;
          return showErr('No pudimos enviar tu confirmación. Revisa tu conexión e inténtalo otra vez.');
        }
        submitBtn.disabled = false; submitBtn.textContent = label;
      }
      rsvpId = newId();
      $('#step2Link').hidden = true; $('#step2Error').hidden = true; $('#step2Note').hidden = true; $('#step2Back').hidden = true;
      form.hidden = true; step2.hidden = false;
      markConfirmed();
      if (va) celebrate(9);
      return;
    }
    $('#step2Note').hidden = false; $('#step2Back').hidden = false;

    const link = $('#step2Link'), err2 = $('#step2Error');
    const url = buildFormUrl({ nombre, asistencia, acompanantes: va ? guests : 0, comentario });
    if (url) { link.href = url; link.hidden = false; err2.hidden = true; }
    else {
      link.hidden = true; err2.hidden = false;
      err2.textContent = 'El formulario de confirmación todavía no está configurado (ver README.md, sección «Confirmaciones»).';
      console.warn('RSVP: falta rsvp.formUrl en config.js');
    }
    form.hidden = true; step2.hidden = false;
    if (url && va) celebrate(9);
  });
  /* La cuenta regresiva aparece cuando la persona completa la confirmación */
  const countEl = $('#count'), rsvpLabel = $('#rsvpLabel'), KEY = 'invitacion-confirmada';
  const wasConfirmed = () => { try { return localStorage.getItem(KEY) === '1'; } catch (_) { return false; } };
  function revealCount(fresh) {
    if (!countEl.hidden) return;
    countEl.hidden = false;
    rsvpLabel.textContent = 'Cambiar mi respuesta';
    if (fresh) setTimeout(() => { countEl.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }); celebrate(12); }, 450);
  }
  function markConfirmed() { try { localStorage.setItem(KEY, '1'); } catch (_) { /* sin almacenamiento */ } revealCount(true); }
  $('#step2Link').addEventListener('click', markConfirmed);
  $('#step2Done').addEventListener('click', markConfirmed);
  if (wasConfirmed()) revealCount(false);

  $('#step2Back').addEventListener('click', () => { step2.hidden = true; form.hidden = false; });

  function showErr(msg, focusEl) { errBox.textContent = msg; errBox.hidden = false; if (focusEl) focusEl.focus(); }

  /* Enlace de Google Forms con las respuestas rellenadas previamente.
     No se simula ningún envío: la confirmación real la da Google al pulsar «Enviar». */
  function buildFormUrl({ nombre, asistencia, acompanantes, comentario }) {
    const R = C.rsvp;
    if (!R.formUrl) return '';
    let u;
    try { u = new URL(R.formUrl); } catch (_) { return ''; }
    u.searchParams.set('usp', 'pp_url');
    const put = (key, val) => { if (key) u.searchParams.set(key, val); };
    put(R.campos.nombre, nombre);
    put(R.campos.asistencia, asistencia === 'si' ? R.opciones.si : R.opciones.no);
    put(R.campos.acompanantes, String(acompanantes));
    if (comentario) put(R.campos.comentario, comentario);
    return u.toString();
  }

  /* ------------------------------ 6 · Efectos ------------------------------ */
  const fx = $('#fx');
  const SPRITES = ['flor', 'hojas', 'flor', 'frutilla-1', 'frutilla-2'].map((n) => `assets/img/${n}.webp`);
  function celebrate(n = 18) {
    if (reduced()) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const img = document.createElement('img');
      const src = SPRITES[Math.floor(Math.random() * SPRITES.length)];
      img.src = src; img.alt = ''; img.className = 'petal';
      const big = src.includes('frutilla') ? 1.15 : 1;
      img.style.cssText = `left:${Math.random() * 96}vw;width:${(20 + Math.random() * 22) * big}px;` +
        `--dur:${3.4 + Math.random() * 2.6}s;--delay:${Math.random() * 1.2}s;` +
        `--sway:${(Math.random() - .5) * 140}px;--rot:${(Math.random() - .5) * 900}deg`;
      img.addEventListener('animationend', () => img.remove(), { once: true });
      frag.append(img);
    }
    fx.append(frag);
  }
  $('#celebrate').addEventListener('click', () => celebrate(22));
})();
