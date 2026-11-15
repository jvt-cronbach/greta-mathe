/* =====================================================================
   AUFGABENTYPEN – wiederverwendbare Bausteine für alle Themen
   ---------------------------------------------------------------------
   rechnen  – Zeilen aus Zahlen/Text und Eingabefeldern
   auswahl  – Multiple Choice („Was fällt dir auf?“)
   tafel    – Rechentafel: Fehler finden ODER Lücken ausfüllen
   mauer    – Rechenmauer (Stein = Summe der zwei Steine darunter)
   kette    – Rechenkette mit Pfeilen (Kettenaufgaben)
   ===================================================================== */
'use strict';

/* ---------- rechnen ----------
   { art:'rechnen', anweisung, zeilen:[ [47, ':', 6, '=', App.feld(7), 'Rest', App.feld(5)] ], hilfe, pruefe(werte) } */
App.typ('rechnen', {
  baue(s, box, api) {
    const spalten = Math.max(...s.zeilen.map((z) => z.length));
    const g = api.el('div', 'rechen-gitter');
    g.style.gridTemplateColumns = `repeat(${spalten}, auto)`;
    s.zeilen.forEach((z) => {
      for (let i = 0; i < spalten; i++) {
        const tok = z[i];
        if (tok && tok.feld) {
          const f = api.feld(tok.loesung, tok);
          g.append(f.el);
        } else if (tok === undefined || tok === '') {
          g.append(api.el('span', 'tok'));
        } else if (typeof tok === 'object' && tok.text !== undefined) {
          // {text:'4 · 5', klasse:'punkt'} – z. B. zum Hervorheben
          g.append(api.el('span', 'tok op ' + (tok.klasse || ''), String(tok.text)));
        } else {
          const istWort = typeof tok === 'string' && /[a-zäöüß]/i.test(tok);
          const cls = typeof tok === 'number' ? 'tok zahl' : istWort ? 'tok wort' : 'tok op';
          g.append(api.el('span', cls, String(tok)));
        }
      }
    });
    box.append(g);
    return {};
  },
});

/* ---------- auswahl ----------
   { art:'auswahl', frage, optionen:['richtig', 'falsch', ...], richtig:0, hilfe }
   oder optionen:[{text, richtig:true, meldung}] */
App.typ('auswahl', {
  numpad: false,
  sofort: true, // prüft direkt beim Antippen
  sprechblase: 'Tipp auf die Antwort, die passt.',
  baue(s, box, api) {
    if (s.frage) box.append(api.el('p', 'frage', s.frage));
    const liste = api.el('div', 'optionen');
    const opts = api.mischen(s.optionen.map((o, i) => (typeof o === 'string' ? { text: o, richtig: i === (s.richtig || 0) } : o)));
    let gewaehlt = null;
    opts.forEach((o) => {
      o.b = api.el('button', 'option', o.text);
      o.b.onclick = () => { if (o.b.disabled) return; gewaehlt = o; api.pruefen(); };
      liste.append(o.b);
    });
    box.append(liste);
    return {
      pruefe() {
        if (gewaehlt.richtig) {
          gewaehlt.b.classList.add('richtig');
          opts.forEach((o) => { o.b.disabled = true; });
          return { ok: true };
        }
        gewaehlt.b.classList.add('falsch');
        gewaehlt.b.disabled = true;
        return { ok: false, meldung: gewaehlt.meldung };
      },
      loesung() {
        opts.forEach((o) => { o.b.disabled = true; if (o.richtig) o.b.classList.add('richtig', 'loesung'); });
      },
    };
  },
});

/* ---------- tafel ----------
   { art:'tafel', modus:'fehler'|'ausfuellen', op:'+', oben:[..], links:[..],
     zellen:[[ {wert:35, richtig:35}, ... ]]  // fehler: wert≠richtig ist ein Fehler
     zellen:[[ {wert:35}, {loesung:47}, ... ]] // ausfuellen: loesung = Eingabefeld
   } */
App.typ('tafel', {
  baue(s, box, api) {
    const t = api.el('table', 'tafel');
    const kopf = api.el('tr');
    kopf.append(api.el('th', 'ecke', s.op));
    s.oben.forEach((o) => kopf.append(api.el('th', '', String(o))));
    t.append(kopf);
    const liste = [];
    s.zellen.forEach((reihe, r) => {
      const tr = api.el('tr');
      tr.append(api.el('th', '', String(s.links[r])));
      reihe.forEach((z) => {
        const td = api.el('td');
        const c = Object.assign({ td }, z);
        if (s.modus === 'fehler') {
          c.btn = api.el('button', 'zelle', String(z.wert));
          c.btn.onclick = () => umschalten(c);
          td.append(c.btn);
        } else if (z.loesung !== undefined) {
          c.f = api.feld(z.loesung);
          td.append(c.f.el);
        } else {
          td.textContent = z.wert;
        }
        liste.push(c);
        tr.append(td);
      });
      t.append(tr);
    });
    const huelle = api.el('div', 'tafel-huelle');
    huelle.append(t);
    box.append(huelle);

    function umschalten(c) {
      if (c.gesichert) return;
      c.td.classList.remove('war-richtig');
      if (!c.markiert) {
        c.markiert = true;
        c.td.classList.add('markiert');
        c.f = api.feld(c.richtig);
        c.td.append(c.f.el);
        api.aktiviere(c.f);
      } else {
        c.markiert = false;
        c.td.classList.remove('markiert');
        api.entferneFeld(c.f);
        c.f = null;
      }
    }

    if (s.modus !== 'fehler') return {};

    return {
      pruefe() {
        let ok = true, fehlend = 0, falschMarkiert = 0, falschKorrigiert = 0;
        liste.forEach((c) => {
          const istFehler = c.wert !== c.richtig;
          if (c.markiert && !c.gesichert) {
            if (!istFehler) { falschMarkiert++; ok = false; c.td.classList.add('war-richtig'); }
            else {
              const r = c.f.wert !== '' && Number(c.f.wert) === c.richtig;
              c.f.el.classList.toggle('richtig', r);
              c.f.el.classList.toggle('falsch', !r);
              if (r) { c.gesichert = true; c.f.gesperrt = true; c.td.classList.add('gefunden'); }
              else { ok = false; falschKorrigiert++; }
            }
          } else if (!c.markiert && istFehler) { fehlend++; ok = false; }
        });
        const teile = [];
        if (falschMarkiert) teile.push(`${falschMarkiert === 1 ? 'Die rot umrandete Zahl war' : 'Die rot umrandeten Zahlen waren'} richtig – tipp ${falschMarkiert === 1 ? 'sie' : 'sie'} nochmal an.`);
        if (falschKorrigiert) teile.push('Deine Korrektur stimmt noch nicht – rechne nochmal nach.');
        if (fehlend) teile.push(`Es ${fehlend === 1 ? 'fehlt noch 1 Fehler' : `fehlen noch ${fehlend} Fehler`}.`);
        return { ok, meldung: teile.join(' ') };
      },
      loesung() {
        liste.forEach((c) => {
          const istFehler = c.wert !== c.richtig;
          if (istFehler) {
            if (!c.markiert) { c.markiert = true; c.td.classList.add('markiert'); c.f = api.feld(c.richtig); c.td.append(c.f.el); }
            api.setzeWert(c.f, c.richtig);
            c.f.el.classList.remove('falsch');
            c.f.el.classList.add('loesung');
          } else if (c.markiert) {
            c.markiert = false; c.td.classList.remove('markiert', 'war-richtig'); api.entferneFeld(c.f);
          }
        });
      },
    };
  },
});

/* ---------- mauer ----------
   Rechenmauer: jeder Stein = Summe der beiden Steine darunter.
   { art:'mauer', reihen:[ [oben], [.., ..], [unten, .., ..] ] }
   Jeder Stein ist eine Zahl (vorgegeben) oder App.feld(loesung). */
App.typ('mauer', {
  baue(s, box, api) {
    const m = api.el('div', 'mauer');
    s.reihen.forEach((reihe) => {
      const r = api.el('div', 'mauer-reihe');
      reihe.forEach((stein) => {
        if (stein && stein.feld) {
          const f = api.feld(stein.loesung, stein);
          f.el.classList.add('stein');
          r.append(f.el);
        } else {
          r.append(api.el('span', 'stein', String(stein)));
        }
      });
      m.append(r);
    });
    box.append(m);
    return {};
  },
});

/* ---------- kette ----------
   Rechenkette mit Pfeilen: Start → (+ 8) → … → Ziel
   { art:'kette', glieder:[12, App.feld(20), App.feld(60)], pfeile:['+ 8', '· 3'] }
   Ein Pfeil kann auch eine Lücke haben: ['·', App.feld(3)]
   rueckwaerts:true → Eingabe beginnt rechts beim Ziel. */
App.typ('kette', {
  baue(s, box, api) {
    const k = api.el('div', 'kette');
    const teile = [];
    const glied = (g, i) => {
      const n = s.glieder.length;
      const z = api.el('div', 'glied' + (i === 0 ? ' k-start' : i === n - 1 ? ' k-ziel' : ''));
      if (g && g.feld) { z.classList.add('hat-feld'); return { z, f: () => z.append(api.feld(g.loesung, g).el) }; }
      z.append(api.el('span', 'glied-zahl', String(g)));
      return { z, f: () => {} };
    };
    const pfeil = (pf) => {
      const p = api.el('div', 'pfeil');
      const text = api.el('div', 'pfeil-text');
      const aufgaben = [];
      (Array.isArray(pf) ? pf : [pf]).forEach((t) => {
        if (t && t.feld) { const platz = api.el('span'); text.append(platz); aufgaben.push(() => platz.replaceWith(api.feld(t.loesung, t).el)); }
        else text.append(api.el('span', '', String(t)));
      });
      p.append(text, api.el('div', 'pfeil-linie'));
      return { p, f: () => aufgaben.forEach((a) => a()) };
    };
    s.glieder.forEach((g, i) => {
      const gl = glied(g, i);
      if (i === 0) { teile.push({ el: gl.z, felder: [gl.f] }); return; }
      const pf = pfeil(s.pfeile[i - 1]);
      const t = api.el('div', 'kette-teil');
      t.append(pf.p, gl.z);
      teile.push({ el: t, felder: [pf.f, gl.f] });
    });
    teile.forEach((t) => k.append(t.el));
    // Felder in Eingabe-Reihenfolge anlegen (vorwärts oder vom Ziel rückwärts)
    const reihenfolge = s.rueckwaerts ? teile.slice().reverse().map((t) => ({ felder: t.felder.slice().reverse() })) : teile;
    reihenfolge.forEach((t) => t.felder.forEach((f) => f()));
    box.append(k);
    return {};
  },
});

/* =====================================================================
   ZAHLENRAUM BIS 1000 – Bilder und Aufgabentypen (seit 15.11.2026)
   ===================================================================== */

/* ---------- Bilder (HTML-Schnipsel, nur <span>s → passen auch in anweisung/frage) ----------
   App.bild.menge({t, h, z, e})      Tausenderwürfel, Hunderterplatten, Zehnerstangen, Einerwürfel
   App.bild.karten([800, 20, 4], {zusammen:true})   Zahlenkarten, übereinander oder nebeneinander */
App.bild = (function () {
  const gruppen = (n, cls, je) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      if (i && i % je === 0) s += '<span class="mb-luecke"></span>';
      s += `<span class="${cls}"></span>`;
    }
    return s;
  };
  function menge(m) {
    const t = m.t || 0, h = m.h || 0, z = m.z || 0, e = m.e || 0;
    let s = '<span class="mb">';
    if (t) s += `<span class="mb-gruppe">${gruppen(t, 'mb-t', 5)}</span>`;
    if (h) s += `<span class="mb-gruppe">${gruppen(h, 'mb-h', 5)}</span>`;
    if (z) s += `<span class="mb-gruppe">${gruppen(z, 'mb-z', 5)}</span>`;
    if (e) s += `<span class="mb-einer">${gruppen(e, 'mb-e', 99)}</span>`;
    return s + '</span>';
  }
  const stelle = (k) => (k >= 100 ? 'h' : k >= 10 ? 'z' : 'e');
  const karte = (k) => `<span class="zk zk-${stelle(k)}">${String(k).split('').map((d) => `<span class="zk-d">${d}</span>`).join('')}</span>`;
  function karten(liste, opt) {
    if (opt && opt.zusammen) {
      const sortiert = liste.slice().sort((a, b) => b - a);
      return `<span class="zk-stapel">${sortiert.map((k, i) => karte(k).replace('class="zk ', `style="z-index:${i + 1}" class="zk zk-abs `)).join('')}</span>`;
    }
    return `<span class="zk-reihe">${liste.map(karte).join('')}</span>`;
  }
  return { menge, karten };
})();

/* ---------- stellentafel ----------
   { art:'stellentafel', spalten:['H','Z','E'] (oder mit 'T'), zahl:true (Spalte „Zahl“),
     oben:'<span>…</span>' (Bild über der Tafel, optional),
     reihen:[ [2, App.feld(3), {punkte:4}, App.feld(234)] ] }
   Zellen: Zahl, '' (leer), App.feld(loesung) oder {punkte:n} (Plättchen) */
App.typ('stellentafel', {
  baue(s, box, api) {
    const spalten = s.spalten || ['H', 'Z', 'E'];
    const mitZahl = s.zahl !== false;
    if (s.oben) { const o = api.el('div', 'bild-oben', s.oben); box.append(o); }
    const t = api.el('table', 'tafel swt');
    const kopf = api.el('tr');
    spalten.forEach((k) => kopf.append(api.el('th', 'swt-' + k.toLowerCase(), k)));
    if (mitZahl) kopf.append(api.el('th', 'swt-zahl', 'Zahl'));
    t.append(kopf);
    s.reihen.forEach((reihe) => {
      const tr = api.el('tr');
      reihe.forEach((z, i) => {
        const td = api.el('td', i === spalten.length ? 'swt-zahlzelle' : '');
        if (z && z.feld) td.append(api.feld(z.loesung, z).el);
        else if (z && z.punkte !== undefined) {
          const p = api.el('span', 'plaettchen');
          for (let k = 0; k < z.punkte; k++) p.append(api.el('i'));
          td.append(p);
        } else td.textContent = z === undefined ? '' : String(z);
        tr.append(td);
      });
      t.append(tr);
    });
    const h = api.el('div', 'tafel-huelle');
    h.append(t);
    box.append(h);
    return {};
  },
});

/* ---------- folge ----------
   Zahlenfolge zum Fortsetzen / Zählen: { art:'folge', glieder:[506, 507, App.feld(508), …] } */
App.typ('folge', {
  baue(s, box, api) {
    if (s.oben) box.append(api.el('div', 'bild-oben', s.oben));
    const f = api.el('div', 'folge');
    s.glieder.forEach((g, i) => {
      const w = api.el('span', 'folge-glied');
      if (g && g.feld) w.append(api.feld(g.loesung, g).el);
      else w.append(api.el('span', 'folge-zahl', String(g)));
      if (i < s.glieder.length - 1) w.append(api.el('span', 'folge-komma', ','));
      f.append(w);
    });
    box.append(f);
    return {};
  },
});

/* ---------- kreuz ----------
   Nachbarzahlen im Tausenderstreifen: links −1, rechts +1, oben −10, unten +10
   { art:'kreuz', mitte:123, oben:App.feld(113), unten:…, links:…, rechts:… }  (fehlende Arme: weglassen) */
App.typ('kreuz', {
  baue(s, box, api) {
    const k = api.el('div', 'kreuz');
    const zelle = (name) => {
      const v = s[name];
      const c = api.el('div', 'kreuz-zelle kz-' + name);
      if (v === undefined) { c.classList.add('kz-leer'); return c; }
      if (v && v.feld) { c.classList.add('hat-feld'); c._feld = v; }
      else c.textContent = String(v);
      return c;
    };
    const z = {};
    ['oben', 'links', 'mitte', 'rechts', 'unten'].forEach((n) => { z[n] = zelle(n); k.append(z[n]); });
    // Felder in Lesereihenfolge anlegen: Mitte zuerst, falls gesucht
    const reihenfolge = s.mitte && s.mitte.feld ? ['mitte', 'oben', 'links', 'rechts', 'unten'] : ['oben', 'links', 'rechts', 'unten'];
    reihenfolge.forEach((n) => { if (z[n]._feld) z[n].append(api.feld(z[n]._feld.loesung, z[n]._feld).el); });
    box.append(k);
    return {};
  },
});

/* ---------- hunderter ----------
   Ein Hunderterfeld aus dem Tausenderstreifen (10 × 10), z. B. 301 bis 400.
   { art:'hunderter', start:301, zeige:'rand'|'ecken'|'zeile', muster:[312, 323] (sichtbar, gefärbt),
     marken:[{zahl:345, name:'A'}] }  → unter dem Feld: „A = __“ */
App.typ('hunderter', {
  baue(s, box, api) {
    const zeige = s.zeige || 'rand';
    const marken = s.marken || [];
    const muster = new Set(s.muster || []);
    const wrap = api.el('div', 'hf-wrap');
    wrap.append(api.el('div', 'hf-titel', `${s.start} bis ${s.start + 99}`));
    const g = api.el('div', 'hf');
    for (let i = 0; i < 100; i++) {
      const n = s.start + i, r = Math.floor(i / 10), c = i % 10;
      const m = marken.findIndex((x) => x.zahl === n);
      const c1 = api.el('span', 'hf-z');
      let sichtbar = false;
      if (zeige === 'rand') sichtbar = r === 0 || c === 0 || c === 9 || r === 9;
      if (zeige === 'zeile') sichtbar = r === 0 || c === 0;
      if (zeige === 'ecken') sichtbar = (r === 0 || r === 9) && (c === 0 || c === 9);
      if (m >= 0) { c1.classList.add('hf-marke', 'hf-m' + m); c1.textContent = marken[m].name; }
      else if (muster.has(n)) { c1.classList.add('hf-muster'); c1.textContent = n; }
      else if (sichtbar) c1.textContent = n;
      g.append(c1);
    }
    wrap.append(g);
    box.append(wrap);
    if (marken.length) {
      const gl = api.el('div', 'rechen-gitter hf-fragen');
      gl.style.gridTemplateColumns = 'repeat(3, auto)';
      marken.forEach((m, i) => {
        gl.append(api.el('span', 'tok hf-marke hf-m' + i, m.name), api.el('span', 'tok op', '='), api.feld(m.zahl).el);
      });
      box.append(gl);
    }
    return {};
  },
});
