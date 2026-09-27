/* =====================================================================
   Gretas Mathe-Welt – ENGINE
   ---------------------------------------------------------------------
   Diese Datei muss für neue Themen NICHT geändert werden.
   Neue Themen: siehe NEUES-THEMA.md und themen/_vorlage.js
   ===================================================================== */
'use strict';

window.App = (function () {
  const config = { name: 'Greta', titel: 'Gretas Mathe-Welt' };
  const themen = [];
  const typen = {};
  const KEY = 'greta-mathe-v1';

  /* ---------------- Hilfsfunktionen (auch für Themen) ---------------- */
  const zufall = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function mischen(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  /** Eingabefeld für eine Rechnung: App.feld(42) oder App.feld(0, {leerIst0:true}) */
  const feld = (loesung, opt) => Object.assign({ feld: true, loesung }, opt || {});
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (tag === 'button') e.type = 'button';
    return e;
  }
  const $ = (s, r) => (r || document).querySelector(s);
  const app = () => document.getElementById('app');
  const txt = (s) => String(s).replace(/\{name\}/g, config.name);

  /* ---------------- Speicher (bleibt auf dem Tablet) ---------------- */
  const neuerStand = () => ({ sterne: 0, ton: true, themen: {} });
  function laden() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === 'object') return Object.assign(neuerStand(), s);
    } catch (e) { /* ignorieren */ }
    return neuerStand();
  }
  let stand = laden();
  function speichern() {
    try { localStorage.setItem(KEY, JSON.stringify(stand)); } catch (e) { /* ignorieren */ }
  }
  function statistik(id) {
    return stand.themen[id] || (stand.themen[id] = { runden: 0, schritte: 0, erster: 0, sterne: 0 });
  }

  /* ---------------- Töne ---------------- */
  let ac = null;
  function ton(art) {
    if (!stand.ton) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const noten = { gut: [660, 880], super: [523, 659, 784, 1047], falsch: [260, 200], klick: [520] }[art] || [440];
      noten.forEach((f, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = art === 'falsch' ? 'triangle' : 'sine';
        o.frequency.value = f;
        const t = ac.currentTime + i * 0.12;
        const laut = art === 'klick' ? 0.05 : 0.18;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(laut, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (art === 'klick' ? 0.08 : 0.28));
        o.connect(g).connect(ac.destination);
        o.start(t);
        o.stop(t + 0.32);
      });
    } catch (e) { /* kein Ton möglich */ }
  }

  const LOB = ['Super!', 'Klasse, {name}!', 'Richtig!', 'Toll gemacht!', 'Stark!', 'Genau so!', 'Prima!', 'Wow, {name}!', 'Spitze!'];
  const LOB_SPAETER = ['Jetzt stimmt’s!', 'Geschafft – gut korrigiert!', 'Richtig! Dranbleiben lohnt sich.'];
  const WEITER = ['Weiter geht’s!', 'Auf zur nächsten!', 'Du machst das super.', 'Schau genau hin.', 'Ich glaub an dich!'];
  const START = ['Du schaffst das!', 'Los geht’s, {name}!', 'Ich bin gespannt!', 'Schau genau hin!'];

  /* ======================= STARTBILDSCHIRM ======================= */
  function zeigeStart() {
    runde = null; akt = null;
    const w = App.welt.info(stand.sterne);
    app().innerHTML = `
      <div class="start">
        <header class="kopfzeile">
          <h1>${config.titel}</h1>
          <div class="sternzahl">⭐ <b>${stand.sterne}</b></div>
        </header>
        <div class="start-inhalt">
          <section class="welt-box">
            <div class="welt">${App.welt.szene(stand.sterne)}</div>
            <div class="welt-info">
              <span class="level">Level ${w.level}</span>
              <div class="balken">
                <div class="balken-spur"><div class="balken-fill" style="width:${Math.max(3, Math.round(w.fortschritt * 100))}%"></div></div>
                <small>Noch <b>${w.fehlen} ⭐</b> bis: <b>${w.naechste.titel}</b></small>
              </div>
            </div>
          </section>
          <section class="themen"></section>
        </div>
        <footer class="fuss">
          <button type="button" class="leise-btn" data-eltern>Für Eltern</button>
          <button type="button" class="leise-btn" data-ton>${stand.ton ? '🔊 Ton an' : '🔇 Ton aus'}</button>
        </footer>
      </div>`;
    const grid = $('.themen');
    themen.forEach((t) => {
      const s = statistik(t.id);
      const k = el('button', 'karte');
      k.style.setProperty('--farbe', t.farbe);
      k.innerHTML = `<span class="symbol">${t.symbol}</span>
        <span class="titel">${t.titel}</span>
        <span class="info">${t.beschreibung || ''}</span>
        <span class="gespielt">${s.runden ? `${s.runden}× geübt` : 'Neu!'}</span>`;
      k.onclick = () => zeigeStufen(t);
      grid.append(k);
    });
    $('[data-eltern]').onclick = zeigeEltern;
    $('[data-ton]').onclick = () => { stand.ton = !stand.ton; speichern(); zeigeStart(); };
  }

  function overlay(inhalt) {
    const ov = el('div', 'overlay');
    const box = el('div', 'dialog');
    if (typeof inhalt === 'string') box.innerHTML = inhalt; else box.append(inhalt);
    ov.append(box);
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
    document.body.append(ov);
    return { ov, box, zu: () => ov.remove() };
  }

  function zeigeStufen(t) {
    const stufen = t.stufen || [{ name: 'Los geht’s' }];
    if (stufen.length === 1) return starteRunde(t, 0);
    const d = overlay(`<h2 style="color:${t.farbe}">${t.symbol} ${t.titel}</h2><p>Wie schwer soll es sein?</p>`);
    const icons = ['🌱', '🌿', '🌳', '🏔️', '🚀'];
    stufen.forEach((s, i) => {
      const b = el('button', 'stufe-btn', `<span class="stufe-icon">${icons[i] || '⭐'}</span><span><b>${s.name}</b><small>${s.info || ''}</small></span>`);
      b.style.setProperty('--farbe', t.farbe);
      b.onclick = () => { d.zu(); starteRunde(t, i); };
      d.box.append(b);
    });
    const zu = el('button', 'leise-btn', 'Zurück');
    zu.onclick = d.zu;
    d.box.append(zu);
  }

  /* ======================= RUNDE ======================= */
  let runde = null;   // aktuelle Runde
  let akt = null;     // aktueller Schritt
  let aktivFeld = null;

  function starteRunde(t, stufe) {
    const anzahl = typeof t.anzahl === 'function' ? t.anzahl(stufe) : (t.anzahl || 8);
    const aufgaben = [];
    const gesehen = new Set();
    for (let i = 0; i < anzahl; i++) {
      let a, k, n = 0;
      do {
        a = t.erzeuge(stufe);
        if (a.art) a = { schritte: [a], schluessel: a.schluessel };
        k = JSON.stringify(a.schluessel != null ? a.schluessel : a);
        n++;
      } while (gesehen.has(k) && n < 40);
      gesehen.add(k);
      aufgaben.push(a);
    }
    runde = { t, stufe, aufgaben, i: 0, sterne: 0, max: 0, vorher: stand.sterne };
    zeigeAufgabe();
  }

  function zeigeAufgabe() {
    const t = runde.t;
    app().innerHTML = `
      <div class="aufgabe-screen" style="--farbe:${t.farbe}">
        <header class="leiste">
          <button type="button" class="rund" data-zurueck aria-label="Beenden">✕</button>
          <div class="punkte">${runde.aufgaben.map((_, j) => `<i class="${j < runde.i ? 'fertig' : j === runde.i ? 'jetzt' : ''}"></i>`).join('')}</div>
          <div class="sternzahl">⭐ <b data-rundensterne>${runde.sterne}</b></div>
        </header>
        <main class="arbeitsflaeche">
          <section class="blatt">
            <div class="blatt-titel">${t.symbol} ${t.titel} · Aufgabe ${runde.i + 1} von ${runde.aufgaben.length}</div>
            <div class="schritte"></div>
          </section>
          <aside class="steuerung">
            <div class="blase"><div class="mini-greta">${App.welt.kopf(stand.sterne)}</div><p class="blase-text"></p></div>
            <div class="numpad"></div>
            <div class="aktionen">
              <button type="button" class="tipp">💡 Tipp</button>
              <button type="button" class="haupt">Prüfen</button>
            </div>
          </aside>
        </main>
      </div>`;
    baueNumpad();
    $('[data-zurueck]').onclick = fragBeenden;
    $('.tipp').onclick = zeigeTipp;
    $('.haupt').onclick = hauptKnopf;
    runde.schrittNr = 0;
    starteSchritt();
  }

  function fragBeenden() {
    const d = overlay(`<h2>Runde beenden?</h2><p>Deine Sterne bleiben gespeichert.</p>`);
    const ja = el('button', 'stufe-btn', '<span><b>Ja, zurück zur Welt</b></span>');
    ja.onclick = () => { d.zu(); zeigeStart(); };
    const nein = el('button', 'stufe-btn', '<span><b>Nein, weiter üben</b></span>');
    nein.onclick = d.zu;
    d.box.append(nein, ja);
  }

  /* ---------------- Ziffernblock ---------------- */
  function baueNumpad() {
    const np = $('.numpad');
    ['7', '8', '9', '4', '5', '6', '1', '2', '3', '⌫', '0', '➜'].forEach((k) => {
      const b = el('button', k === '⌫' || k === '➜' ? 'sonder' : '', k);
      b.setAttribute('aria-label', k === '⌫' ? 'Löschen' : k === '➜' ? 'Nächstes Feld' : k);
      b.onclick = () => taste(k);
      np.append(b);
    });
  }

  function taste(k) {
    if (!akt || akt.fertig) return;
    if (k === '➜') return naechstesFeld();
    const f = aktivFeld;
    if (!f || f.gesperrt) return;
    ton('klick');
    f.el.classList.remove('falsch');
    if (k === '⌫') f.wert = f.wert.slice(0, -1);
    else if (f.wert.length < 5) f.wert = (f.wert === '0' ? '' : f.wert) + k;
    zeigeWert(f);
  }

  function zeigeWert(f) { f.el.textContent = f.wert === '' ? '' : f.wert; }

  function aktiviere(f) {
    if (aktivFeld) aktivFeld.el.classList.remove('aktiv');
    aktivFeld = f && !f.gesperrt ? f : null;
    if (aktivFeld) aktivFeld.el.classList.add('aktiv');
  }

  function naechstesFeld() {
    if (!akt) return;
    const offen = akt.felder.filter((f) => !f.gesperrt);
    if (!offen.length) return;
    const i = offen.indexOf(aktivFeld);
    aktiviere(offen[(i + 1) % offen.length]);
  }

  /* ---------------- API für Aufgabentypen ---------------- */
  const api = {
    el,
    mischen,
    /** Legt ein Eingabefeld an und gibt es zurück ({el, wert, loesung, ...}) */
    feld(loesung, opt) {
      const b = el('button', 'feld');
      const f = { el: b, loesung, wert: '', opt: opt || {}, gesperrt: false };
      b.onclick = () => aktiviere(f);
      akt.felder.push(f);
      return f;
    },
    entferneFeld(f) {
      akt.felder = akt.felder.filter((x) => x !== f);
      if (aktivFeld === f) aktiviere(null);
      f.el.remove();
    },
    aktiviere,
    /** für Typen, die sofort beim Antippen prüfen (z. B. Auswahl) */
    pruefen: () => pruefen(),
    setzeWert(f, w) { f.wert = String(w); zeigeWert(f); },
  };

  /* ---------------- Schritte ---------------- */
  function starteSchritt() {
    const aufgabe = runde.aufgaben[runde.i];
    const s = aufgabe.schritte[runde.schrittNr];
    const impl = typen[s.art];
    if (!impl) throw new Error('Unbekannter Aufgabentyp: ' + s.art);

    const box = el('div', 'schritt');
    if (s.anweisung) box.append(el('p', 'anweisung', txt(s.anweisung)));
    const inhalt = el('div', 'schritt-inhalt');
    box.append(inhalt);
    $('.schritte').append(box);

    akt = { s, impl, box, felder: [], versuche: 0, fertig: false };
    runde.max += 2 * (s.wert || 1);
    akt.ctrl = impl.baue(s, inhalt, api) || {};

    const mitNumpad = impl.numpad !== false;
    $('.numpad').classList.toggle('aus', !mitNumpad);
    $('.numpad').classList.toggle('versteckt', !mitNumpad);
    const haupt = $('.haupt');
    haupt.textContent = 'Prüfen';
    haupt.classList.toggle('versteckt', !!impl.sofort);
    $('.tipp').classList.remove('versteckt');
    blase(s.sprechblase || impl.sprechblase || (runde.schrittNr === 0 && runde.i === 0 ? wahl(START) : wahl(WEITER)), '');
    aktiviere(akt.felder[0] || null);
    setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }

  function blase(text, art) {
    const b = $('.blase');
    if (!b) return;
    b.classList.remove('gut', 'schlecht', 'tipp-art');
    if (art) b.classList.add(art);
    $('.blase-text').innerHTML = txt(text || '');
    const g = $('.mini-greta');
    g.classList.remove('jubel');
    if (art === 'gut') { void g.offsetWidth; g.classList.add('jubel'); }
  }

  function zeigeTipp() {
    if (!akt) return;
    blase('💡 ' + (akt.s.hilfe || 'Lies die Aufgabe noch einmal ganz genau.'), 'tipp-art');
  }

  function hauptKnopf() {
    if (!akt) return;
    if (akt.fertig) return weiter();
    if (akt.impl.sofort) return;
    pruefen();
  }

  function werte() {
    return akt.felder.map((f) => (f.wert === '' ? (f.opt.leerIst0 ? 0 : null) : Number(f.wert)));
  }

  function pruefeFelder() {
    let ok = true;
    akt.felder.forEach((f) => {
      if (f.gesperrt) return;
      const w = f.wert === '' ? (f.opt.leerIst0 ? 0 : null) : Number(f.wert);
      const r = w === f.loesung;
      f.el.classList.toggle('richtig', r);
      f.el.classList.toggle('falsch', !r);
      if (r) { f.gesperrt = true; if (f.opt.leerIst0 && f.wert === '') { f.wert = '0'; zeigeWert(f); } }
      ok = ok && r;
    });
    return { ok };
  }

  function pruefen() {
    if (!akt || akt.fertig) return;
    // leere Felder zuerst ausfüllen lassen (zählt nicht als Versuch)
    const leer = akt.felder.find((f) => !f.gesperrt && f.wert === '' && !f.opt.leerIst0);
    if (leer) {
      aktiviere(leer);
      blase('Da ist noch ein leeres Feld. Tipp es an und trag eine Zahl ein.', 'tipp-art');
      return;
    }
    const erg = akt.ctrl.pruefe ? akt.ctrl.pruefe() : pruefeFelder();
    if (!erg.ok && akt.s.pruefe) {
      const m = akt.s.pruefe(werte());
      if (m) erg.meldung = m;
    }
    akt.versuche++;
    const st = statistik(runde.t.id);

    if (erg.ok) {
      const punkte = (akt.versuche === 1 ? 2 : 1) * (akt.s.wert || 1);
      st.schritte++;
      if (akt.versuche === 1) st.erster++;
      sterneDazu(punkte);
      ton('gut');
      blase(wahl(akt.versuche === 1 ? LOB : LOB_SPAETER) + ` <span class="plus">+${punkte} ⭐</span>`, 'gut');
      abschliessen();
    } else if (akt.versuche >= 3) {
      st.schritte++;
      if (akt.ctrl.loesung) akt.ctrl.loesung(); else zeigeLoesungFelder();
      ton('falsch');
      blase('Schau, so ist es richtig. Das merken wir uns – beim nächsten Mal klappt’s!', 'schlecht');
      abschliessen();
    } else {
      ton('falsch');
      akt.box.classList.remove('wackeln'); void akt.box.offsetWidth; akt.box.classList.add('wackeln');
      let m = erg.meldung || (akt.versuche === 1 ? 'Noch nicht ganz. Schau dir die roten Stellen nochmal an.' : 'Fast! ');
      if (akt.versuche === 2 && akt.s.hilfe && !erg.meldung) m += '💡 ' + akt.s.hilfe;
      blase(m, 'schlecht');
      const falsch = akt.felder.find((f) => !f.gesperrt);
      aktiviere(falsch || null);
    }
    speichern();
  }

  function zeigeLoesungFelder() {
    akt.felder.forEach((f) => {
      if (f.gesperrt) return;
      f.wert = String(f.loesung);
      zeigeWert(f);
      f.el.classList.remove('falsch');
      f.el.classList.add('loesung');
      f.gesperrt = true;
    });
  }

  function abschliessen() {
    akt.fertig = true;
    akt.felder.forEach((f) => { f.gesperrt = true; });
    aktiviere(null);
    akt.box.classList.add('erledigt');
    $('.numpad').classList.add('aus');
    $('.tipp').classList.add('versteckt');
    const h = $('.haupt');
    h.classList.remove('versteckt');
    const letzte = runde.schrittNr >= runde.aufgaben[runde.i].schritte.length - 1;
    h.textContent = letzte && runde.i >= runde.aufgaben.length - 1 ? 'Fertig 🎉' : 'Weiter ➜';
    h.focus({ preventScroll: true });
  }

  function sterneDazu(n) {
    runde.sterne += n;
    stand.sterne += n;
    statistik(runde.t.id).sterne += n;
    const z = $('[data-rundensterne]');
    if (z) z.textContent = runde.sterne;
    // kleiner fliegender Stern
    const h = $('.haupt');
    const ziel = $('.leiste .sternzahl');
    if (h && ziel) {
      const a = h.getBoundingClientRect(), b = ziel.getBoundingClientRect();
      const s = el('div', 'stern-flug', '⭐');
      s.style.left = a.left + a.width / 2 + 'px';
      s.style.top = a.top + 'px';
      s.style.setProperty('--dx', b.left + b.width / 2 - (a.left + a.width / 2) + 'px');
      s.style.setProperty('--dy', b.top - a.top + 'px');
      document.body.append(s);
      setTimeout(() => s.remove(), 900);
    }
  }

  function weiter() {
    const aufgabe = runde.aufgaben[runde.i];
    if (runde.schrittNr < aufgabe.schritte.length - 1) {
      runde.schrittNr++;
      starteSchritt();
      return;
    }
    runde.i++;
    if (runde.i < runde.aufgaben.length) zeigeAufgabe();
    else rundeEnde();
  }

  /* ======================= RUNDEN-ENDE ======================= */
  function rundeEnde() {
    const t = runde.t;
    statistik(t.id).runden++;
    speichern();
    const quote = runde.max ? runde.sterne / runde.max : 0;
    const titel = quote >= 0.9 ? 'Wow, super gemacht, {name}!' : quote >= 0.6 ? 'Toll gemacht, {name}!' : 'Gut geübt, {name}!';
    const unter = quote >= 0.9 ? 'Du bist eine echte Mathe-Heldin!' : quote >= 0.6 ? 'Du wirst immer besser!' : 'Übung macht die Meisterin – weiter so!';
    const neu = App.welt.neu(runde.vorher, stand.sterne);
    ton(neu.length ? 'super' : 'gut');
    const r = runde;
    akt = null;
    app().innerHTML = `
      <div class="ende" style="--farbe:${t.farbe}">
        <div class="konfetti">${Array.from({ length: 40 }, (_, i) => `<i style="--x:${Math.random() * 100}%;--d:${(Math.random() * 1.5 + 1.8).toFixed(2)}s;--v:${(Math.random() * 0.8).toFixed(2)}s;--f:${['#ff5fa2', '#ffd54a', '#7c5cff', '#2ecc71', '#ff9f43', '#4fc3f7'][i % 6]}"></i>`).join('')}</div>
        <h1>${txt(titel)}</h1>
        <p class="ende-unter">${unter}</p>
        <div class="ende-sterne">+${r.sterne} ⭐ <small>von ${r.max}</small></div>
        ${neu.map((n) => `<div class="neu-karte">🎉 <b>Neu freigeschaltet: ${n.titel}</b><br>${txt(n.neu)}</div>`).join('')}
        <div class="welt jubel">${App.welt.szene(stand.sterne)}</div>
        <div class="ende-knoepfe">
          <button type="button" class="knopf zweit" data-nochmal>🔁 Nochmal</button>
          <button type="button" class="knopf" data-welt>🏡 Zur Welt</button>
        </div>
      </div>`;
    $('[data-nochmal]').onclick = () => starteRunde(r.t, r.stufe);
    $('[data-welt]').onclick = zeigeStart;
  }

  /* ======================= ELTERN ======================= */
  function zeigeEltern() {
    const zeilen = themen.map((t) => {
      const s = statistik(t.id);
      const q = s.schritte ? Math.round((s.erster / s.schritte) * 100) + ' %' : '–';
      return `<tr><td>${t.symbol} ${t.titel}</td><td>${s.runden}</td><td>${s.schritte}</td><td>${q}</td><td>${s.sterne}</td></tr>`;
    }).join('');
    const d = overlay(`<h2>Für Eltern</h2>
      <table class="eltern-tabelle"><thead><tr><th>Thema</th><th>Runden</th><th>Aufgaben</th><th>1. Versuch richtig</th><th>⭐</th></tr></thead><tbody>${zeilen}</tbody></table>
      <p class="klein">Sterne gesamt: <b>${stand.sterne}</b>. Pro Teilaufgabe gibt es 2 ⭐ beim ersten Versuch, 1 ⭐ nach Korrektur. Nach 3 Fehlversuchen wird die Lösung gezeigt.<br>Der Fortschritt ist nur auf diesem Gerät gespeichert.</p>`);
    const reset = el('button', 'leise-btn', 'Fortschritt zurücksetzen');
    let sicher = false;
    reset.onclick = () => {
      if (!sicher) { sicher = true; reset.textContent = 'Wirklich alles löschen? Nochmal tippen.'; return; }
      stand = neuerStand(); speichern(); d.zu(); zeigeStart();
    };
    const zu = el('button', 'stufe-btn', '<span><b>Schließen</b></span>');
    zu.onclick = d.zu;
    d.box.append(zu, reset);
  }

  /* ---------------- Tastatur (für PC/Test) ---------------- */
  document.addEventListener('keydown', (e) => {
    if (!akt) return;
    if (/^[0-9]$/.test(e.key)) taste(e.key);
    else if (e.key === 'Backspace') taste('⌫');
    else if (e.key === 'Tab') { e.preventDefault(); taste('➜'); }
    else if (e.key === 'Enter') { e.preventDefault(); hauptKnopf(); }
  });

  function start() {
    zeigeStart();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  return {
    config,
    thema: (def) => themen.push(def),
    typ: (name, impl) => { typen[name] = impl; },
    zufall, wahl, mischen, feld,
    start,
    _stand: () => stand,
    _akt: () => akt, // nur für automatische Tests
    _themen: themen,
  };
})();
