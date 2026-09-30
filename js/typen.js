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
