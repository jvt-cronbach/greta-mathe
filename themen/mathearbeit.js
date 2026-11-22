/* THEMA: Fit für die Mathearbeit – nach den Übungsblättern 1–6 (Nov. 2026)
   Stufe 0: Zahlen bis 1000 (Blatt 1, 2, 4) · Stufe 1: Rechnen (Blatt 5, 6) · Stufe 2: Knobeln (Extra-Aufgaben, Blatt 2, 3, 5) */
'use strict';
(function () {
  const { zufall, wahl, feld, mischen } = App;
  const WER = ['Greta', 'WuschWusch', 'BabyAffi', 'Lenchen'];
  const sortiert = (liste) => [...new Set(liste)].sort((a, b) => a - b);
  const anzahlSchritt = (n, hilfe) => ({ art: 'rechnen', anweisung: 'Wie viele Möglichkeiten sind das?', zeilen: [['Möglichkeiten', feld(n)]], hilfe: hilfe || 'Zähl die Zahlen, die du gefunden hast.' });

  /* ---------- Bilder ---------- */
  const pl = (n) => `<span class="plaettchen">${'<i></i>'.repeat(n)}</span>`;
  const plTafel = (h, z, e) => `<table class="tafel swt ma-swt"><tr><th class="swt-h">H</th><th class="swt-z">Z</th><th class="swt-e">E</th></tr><tr><td>${pl(h)}</td><td>${pl(z)}</td><td>${pl(e)}</td></tr></table>`;
  const punkte = (n) => '<i></i>'.repeat(n);
  // Punktebild: Kästchen mit gleich vielen Punkten und lose Punkte daneben
  const punktBild = (kaesten, jeKasten, lose) => `<span class="pb">${`<span class="pb-box">${punkte(jeKasten)}</span>`.repeat(kaesten)}${lose ? `<span class="pb-lose">${punkte(lose)}</span>` : ''}</span>`;

  /* =================== STUFE 0: ZAHLEN BIS 1000 =================== */

  // Blatt 1, Nr. 1: Welche Zahl ist gelegt? (T H Z E + Zahl)
  function gelegt() {
    let t = 0, h, z, e;
    if (Math.random() < 0.2) { t = 1; h = 0; z = zufall(0, 4); e = z ? zufall(0, 5) : zufall(1, 5); }
    else {
      h = zufall(1, 9); z = zufall(0, 9); e = zufall(0, 9);
      if (Math.random() < 0.5) { if (Math.random() < 0.5) z = 0; else e = 0; }
    }
    const n = 1000 * t + 100 * h + 10 * z + e;
    const ohneNull = Number(String(n).replace(/0/g, ''));
    return {
      art: 'stellentafel',
      spalten: ['T', 'H', 'Z', 'E'],
      anweisung: 'Welche Zahl ist gelegt? Trag die Ziffern und die Zahl ein. Schreib 0, wenn eine Stelle leer ist.',
      oben: App.bild.menge({ t, h, z, e }),
      reihen: [[feld(t, t ? null : { leerIst0: true }), feld(h), feld(z), feld(e), feld(n)]],
      hilfe: 'Großer Würfel = 1 Tausender, Platte = 1 Hunderter, Stange = 1 Zehner, kleiner Würfel = 1 Einer. Fehlt etwas, schreibst du 0.',
      pruefe: (w) => (w[4] === ohneNull && ohneNull !== n ? 'Fast! Denk an die 0 für die leere Stelle.' : null),
      wert: 2,
      schluessel: ['gelegt', n],
    };
  }

  // Blatt 1, Nr. 2 (umgedreht): Welches Bild zeigt die Zahl?
  function bildWaehlen() {
    const h = zufall(1, 5);
    let z = zufall(0, 6), e = zufall(0, 6);
    if (Math.random() < 0.6) { if (Math.random() < 0.5) z = 0; else e = 0; }
    if (z === e) e = (e + 2) % 7;
    const n = 100 * h + 10 * z + e;
    const kandidaten = [
      { h, z, e, richtig: true },
      { h, z: e, e: z, meldung: `Schau genau: Das Bild zeigt ${100 * h + 10 * e + z}. Zehner und Einer sind vertauscht.` },
      { h: 0, z: h, e: z || e, meldung: 'Da fehlen die Hunderter-Platten!' },
      { h: z || e || 1, z: h, e, meldung: 'Hunderter und Zehner sind vertauscht.' },
    ];
    const gesehen = new Set();
    const optionen = kandidaten.filter((k) => {
      const key = `${k.h}-${k.z}-${k.e}`;
      if (gesehen.has(key) || (!k.richtig && 100 * k.h + 10 * k.z + k.e === n)) return false;
      gesehen.add(key); return true;
    }).slice(0, 3).map((k) => ({ text: App.bild.menge(k), richtig: !!k.richtig, meldung: k.meldung }));
    return {
      art: 'auswahl',
      frage: `Welches Bild zeigt die Zahl <b>${n}</b>?`,
      optionen,
      hilfe: `${n} hat ${h} Hunderter, ${z} Zehner und ${e} Einer. Platte = Hunderter, Stange = Zehner, Würfel = Einer.`,
      schluessel: ['bild', n],
    };
  }

  // Blatt 1, Nr. 3: Stellenwerte lesen und bündeln
  function buendeln() {
    const v = zufall(0, 5);
    let teile, n;
    if (v === 0) { // durcheinander
      const h = zufall(1, 9), z = zufall(1, 9), e = zufall(1, 9);
      teile = mischen([`${h} H`, `${z} Z`, `${e} E`]); n = 100 * h + 10 * z + e;
    } else if (v === 1) { // Zehner und Einer über 10
      const h = zufall(1, 6), z = zufall(11, 19), e = zufall(10, 19);
      teile = [`${h} H`, `${z} Z`, `${e} E`]; n = 100 * h + 10 * z + e;
    } else if (v === 2) { const z = zufall(11, 39), e = zufall(1, 9); teile = [`${z} Z`, `${e} E`]; n = 10 * z + e; }
    else if (v === 3) { const h = zufall(1, 8), e = zufall(11, 29); teile = [`${h} H`, `${e} E`]; n = 100 * h + e; }
    else if (v === 4) { teile = ['10 H']; n = 1000; if (Math.random() < 0.5) { teile = ['100 Z']; } }
    else { const h = zufall(2, 8), z = zufall(10, 15); teile = [`${h} H`, `${z} Z`]; n = 100 * h + 10 * z; }
    const text = teile.join(', ');
    return {
      art: 'rechnen',
      anweisung: 'Lies die Stellenwerte. Bündle, wenn nötig. Wie heißt die Zahl?<br><small>10 E = 1 Z · 10 Z = 1 H · 10 H = 1 T</small>',
      zeilen: [[{ text }, '=', feld(n)]],
      hilfe: 'Rechne jeden Teil einzeln aus und zähle zusammen: 1 H = 100, 1 Z = 10, 1 E = 1. Zum Beispiel 17 Z = 170.',
      schluessel: ['b', text],
    };
  }

  // Blatt 1, Nr. 4: Fehler finden und verbessern
  function fehler() {
    const wer = wahl(WER);
    const v = zufall(0, 2);
    let angabe, falsch, richtig, grund, andere;
    if (v === 0) {
      const h = zufall(2, 9), e = zufall(1, 9);
      angabe = `${h} H, ${e} E`; falsch = 10 * h + e; richtig = 100 * h + e;
      grund = 'Die 0 für die Zehner fehlt.';
    } else if (v === 1) {
      const h = zufall(1, 9), z = zufall(1, 9);
      angabe = `${h} H, ${z} Z`; falsch = 100 * h + z; richtig = 100 * h + 10 * z;
      grund = 'Die Zehner stehen an der Einerstelle.';
    } else {
      let d; do d = [zufall(1, 9), zufall(1, 9), zufall(1, 9)]; while (new Set(d).size < 3);
      const [e, h, z] = d;
      angabe = `${e} E, ${h} H, ${z} Z`; falsch = 100 * e + 10 * h + z; richtig = 100 * h + 10 * z + e;
      grund = 'Die Ziffern stehen in der falschen Reihenfolge.';
    }
    andere = ['Die 0 für die Zehner fehlt.', 'Die Zehner stehen an der Einerstelle.', 'Die Ziffern stehen in der falschen Reihenfolge.', 'Es ist ein Hunderter zu viel.'].filter((g) => g !== grund);
    return {
      schluessel: ['f', angabe],
      schritte: [
        {
          art: 'rechnen',
          anweisung: `${wer} schreibt: <b>${angabe} = ${falsch}</b>. Das stimmt nicht! Wie heißt die Zahl richtig?`,
          zeilen: [[{ text: angabe }, '=', feld(richtig)]],
          hilfe: 'Trag die Zahl im Kopf in die Stellenwerttafel ein: erst H, dann Z, dann E. Leere Stelle = 0.',
          pruefe: (w) => (w[0] === falsch ? `Das hat ${wer} geschrieben – such den Fehler!` : null),
        },
        {
          art: 'auswahl',
          frage: `Was hat ${wer} falsch gemacht?`,
          optionen: [{ text: grund, richtig: true }, ...mischen(andere).slice(0, 2).map((t) => ({ text: t }))],
          hilfe: `Vergleiche ${falsch} und ${richtig} Stelle für Stelle.`,
        },
      ],
    };
  }

  // Blatt 4, Nr. 1: Zahlenreihen fortsetzen
  function reihe() {
    const v = wahl([
      () => ({ s: zufall(1, 99), d: 100 }),
      () => ({ s: wahl([20, 30, 40, 50]), d: null }),
      () => ({ s: zufall(1, 9) * 10 + 5, d: 50 }),
      () => ({ s: wahl([25, 125, 250]), d: 25 }),
      () => ({ s: zufall(1, 5) * 100 + zufall(1, 9), d: 20 }),
    ])();
    const d = v.d || v.s;
    const glieder = [];
    for (let i = 0; i < 8; i++) glieder.push(v.s + i * d);
    if (glieder[7] > 1000) return null;
    return {
      art: 'folge',
      anweisung: 'Setze die Zahlenreihe fort.',
      glieder: glieder.map((g, i) => (i < 3 ? g : feld(g))),
      hilfe: `Wie viel kommt jedes Mal dazu? Von ${glieder[0]} bis ${glieder[1]} sind es ${d}.`,
      schluessel: ['r', v.s, d],
    };
  }

  // Blatt 4, Nr. 3: Zahlenkreuz
  function kreuz() {
    const m = zufall(11, 98) * 10 + zufall(1, 8);
    const arme = { oben: feld(m - 10), unten: feld(m + 10), links: feld(m - 1), rechts: feld(m + 1) };
    if (Math.random() < 0.4) delete arme[wahl(['oben', 'unten', 'links', 'rechts'])];
    return {
      art: 'kreuz', mitte: m, ...arme,
      anweisung: 'Fülle die leeren Kästchen aus.<br><small>links −1 · rechts +1 · oben −10 · unten +10</small>',
      hilfe: 'Im Tausenderstreifen: Ein Schritt nach rechts ist 1 mehr, ein Schritt nach unten ist 10 mehr.',
      schluessel: ['k', m],
    };
  }

  // Blatt 4, Nr. 4: vorwärts und rückwärts zählen, über den Hunderter
  function zaehlen() {
    const vor = Math.random() < 0.5;
    const grenze = wahl([zufall(2, 9) * 100, 1000]);
    const vorGrenze = zufall(2, 4);
    let glieder;
    if (vor) { const s = Math.min(grenze, 997) - vorGrenze + 0; glieder = Array.from({ length: 7 }, (x, i) => s + i); }
    else { const s = grenze + (grenze === 1000 ? 0 : vorGrenze); glieder = Array.from({ length: 7 }, (x, i) => s - i); }
    if (glieder.some((g) => g > 1000 || g < 1)) return null;
    return {
      art: 'folge',
      anweisung: `Zähle <b>${vor ? 'vorwärts' : 'rückwärts'}</b>.`,
      glieder: glieder.map((g, i) => (i < 2 || i === 6 ? g : feld(g))),
      hilfe: vor ? 'Nach ...99 kommt der nächste volle Hunderter.' : 'Vor einem vollen Hunderter kommt ...99.',
      schluessel: ['z', glieder[0], vor],
    };
  }

  // Blatt 4, Nr. 2: Muster im Tausenderstreifen
  function muster() {
    const [d, name] = wahl([[11, 'schräg nach rechts unten'], [10, 'gerade nach unten'], [9, 'schräg nach links unten'], [1, 'nach rechts']]);
    const h = zufall(1, 8) * 100;
    const r = zufall(0, 4), c = d === 9 ? zufall(4, 9) : d === 1 ? zufall(0, 5) : zufall(1, 5);
    const s = h + 10 * r + c;
    const glieder = [0, 1, 2, 3, 4].map((i) => s + i * d);
    return {
      schluessel: ['m', s, d],
      schritte: [
        {
          art: 'folge',
          anweisung: 'Diese Zahlen sind im Tausenderstreifen markiert. Setze das Muster fort.',
          glieder: glieder.map((g, i) => (i < 3 ? g : feld(g))),
          hilfe: `Rechne ${glieder[1]} − ${glieder[0]}. So viel kommt jedes Mal dazu.`,
        },
        {
          art: 'auswahl',
          frage: 'Wie heißt das Muster?',
          optionen: [11, 10, 9, 1].map((x) => ({ text: `immer + ${x}`, richtig: x === d, meldung: x === d ? '' : `Rechne nach: ${glieder[0]} + ${x} = ${glieder[0] + x}.` })),
          hilfe: `Im Tausenderstreifen geht dieses Muster ${name}.`,
        },
      ],
    };
  }

  // Blatt 2, Nr. 3: Plättchen dazulegen oder wegnehmen – alle Möglichkeiten
  function plaettchenAendern(schwer) {
    const art = schwer ? wahl(['2dazu', '1weg', '2dazu']) : wahl(['1dazu', '1weg']);
    const h = zufall(2, 7), z = zufall(1, 7), e = zufall(1, 7);
    const n = 100 * h + 10 * z + e;
    let liste, text;
    if (art === '1dazu') { liste = [n + 100, n + 10, n + 1]; text = 'Leg <b>1 Plättchen dazu</b>.'; }
    else if (art === '1weg') { liste = [n - 100, n - 10, n - 1]; text = 'Nimm <b>1 Plättchen weg</b>.'; }
    else { liste = [n + 200, n + 20, n + 2, n + 110, n + 101, n + 11]; text = 'Leg <b>2 Plättchen dazu</b>.'; }
    liste = sortiert(liste);
    return {
      schluessel: ['p', art, n],
      schritte: [{
        art: 'folge',
        oben: plTafel(h, z, e),
        anweisung: `Diese Zahl ist gelegt: <b>${n}</b>. ${text} Welche Zahlen können entstehen? Schreib sie <b>der Größe nach</b> auf.`,
        glieder: liste.map((x) => feld(x)),
        hilfe: art === '2dazu'
          ? 'Beide Plättchen können in dieselbe Spalte (H, Z oder E) – oder in zwei verschiedene Spalten. Das sind 6 Möglichkeiten.'
          : 'Das Plättchen kann bei H, bei Z oder bei E liegen. Das sind 3 Möglichkeiten.',
        wert: art === '2dazu' ? 3 : 2,
      }],
    };
  }

  /* =================== STUFE 1: RECHNEN =================== */

  // Blatt 5, Nr. 1: Plusaufgaben im Kopf
  function plus() {
    const v = zufall(0, 3);
    let a, b;
    if (v === 0) { a = zufall(2, 8) * 10 + zufall(4, 9); b = zufall(11 - (a % 10), 9); } // mit Übergang, + Einer
    else if (v === 1) { a = zufall(1, 8) * 10 + zufall(1, 9); b = 10 - (a % 10); } // bis zum Zehner
    else if (v === 2) { a = zufall(2, 6) * 10 + zufall(1, 5); b = zufall(1, 3) * 10 + zufall(1, 9 - (a % 10)); } // ohne Übergang
    else { a = zufall(2, 6) * 10 + zufall(5, 9); b = zufall(1, 3) * 10 + zufall(11 - (a % 10), 9); } // mit Übergang
    const s = a + b;
    return {
      art: 'rechnen', anweisung: 'Rechne im Kopf.',
      zeilen: [[a, '+', b, '=', feld(s)]],
      hilfe: b >= 10 ? `Erst die Zehner: ${a} + ${b - (b % 10)} = ${a + b - (b % 10)}. Dann die Einer: + ${b % 10}.` : `Erst bis zum nächsten Zehner, dann weiter.`,
      pruefe: (w) => (w[0] === s - 10 ? 'Fast! Denk an den Zehnerübergang.' : null),
      schluessel: ['+', a, b],
    };
  }

  // Blatt 5, Nr. 2: Einmaleins
  function mal() {
    const a = zufall(3, 9), b = zufall(3, 9);
    return {
      art: 'rechnen', anweisung: 'Rechne die Malaufgabe.',
      zeilen: [[a, '·', b, '=', feld(a * b)]],
      hilfe: `Nutze eine Kernaufgabe: ${a} · 5 = ${a * 5} oder ${a} · 10 = ${a * 10}. Dann weiterrechnen.`,
      schluessel: ['·', Math.min(a, b), Math.max(a, b)],
    };
  }

  // Blatt 5, Nr. 3: Teilen mit und ohne Rest
  function teilen() {
    const d = zufall(3, 9), q = zufall(2, 9), r = Math.random() < 0.3 ? 0 : zufall(1, d - 1), a = d * q + r;
    return {
      art: 'rechnen',
      anweisung: 'Teile. Schreib den Rest nur auf, wenn etwas übrig bleibt.',
      zeilen: [[a, ':', d, '=', feld(q), 'Rest', feld(r, { leerIst0: true })]],
      hilfe: `Welche Zahl aus der ${d}er-Reihe ist am nächsten an ${a}, aber nicht größer? Der Rest ist der Unterschied.`,
      pruefe: (w) => {
        if (w[0] != null && w[0] * d > a) return `${w[0]} · ${d} = ${w[0] * d} – das ist mehr als ${a}.`;
        if (w[1] != null && w[1] >= d) return `Der Rest muss kleiner als ${d} sein!`;
        return null;
      },
      schluessel: [':', a, d],
    };
  }

  // Blatt 6, Nr. 1 und 2: Punkt vor Strich mit Zwischenschritt
  function punktVorStrich() {
    const f = wahl([
      () => { const a = zufall(2, 40), b = zufall(2, 9), c = zufall(2, 9); return { vor: [a, '+'], p: [b, '·', c], nach: [], v: a + b * c }; },
      () => { const a = zufall(2, 40), b = zufall(2, 9), c = zufall(2, 9); return { vor: [], p: [b, '·', c], nach: ['+', a], v: b * c + a }; },
      () => { const b = zufall(2, 9), c = zufall(2, 9), a = b * c + zufall(1, 30); return { vor: [a, '−'], p: [b, '·', c], nach: [], v: a - b * c }; },
      () => { const b = zufall(3, 9), c = zufall(3, 9), a = zufall(1, b * c - 1); return { vor: [], p: [b, '·', c], nach: ['−', a], v: b * c - a }; },
      () => { const c = zufall(2, 9), q = zufall(2, 9), a = zufall(5, 40); return { vor: [a, '+'], p: [c * q, ':', c], nach: [], v: a + q }; },
      () => { const c = zufall(2, 9), q = zufall(2, 9), a = zufall(2, 20); return { vor: [], p: [c * q, ':', c], nach: ['+', a], v: q + a }; },
      () => { const c = zufall(2, 9), q = zufall(2, 9), a = q + zufall(5, 40); return { vor: [a, '−'], p: [c * q, ':', c], nach: [], v: a - q }; },
    ])();
    const pw = f.p[1] === '·' ? f.p[0] * f.p[2] : f.p[0] / f.p[2];
    const html = [...f.vor, `<span class="punkt">${f.p.join(' ')}</span>`, ...f.nach].join(' ');
    const alle = [...f.vor, ...f.p, ...f.nach];
    let lr = alle[0];
    for (let i = 1; i < alle.length; i += 2) {
      const o = alle[i], z = alle[i + 1];
      lr = o === '+' ? lr + z : o === '−' ? lr - z : o === '·' ? lr * z : lr / z;
    }
    return {
      art: 'rechnen',
      anweisung: 'Punkt vor Strich: Schreib den Zwischenschritt und das Ergebnis auf.<br><small>Beispiel: 2 + 5 · 3 = 2 + 15 = 17</small>',
      zeilen: [
        [{ text: html }, '=', ...f.vor.map(String), feld(pw), ...f.nach.map(String)],
        ['', '=', feld(f.v)],
      ],
      hilfe: `Rechne zuerst ${f.p.join(' ')} = ${pw}. Dann rechnest du mit ${pw} weiter.`,
      pruefe: (w) => (w[1] === lr && lr !== f.v ? 'Achtung: Punkt vor Strich! Du hast von links nach rechts gerechnet.' : null),
      schluessel: ['pvs', html],
    };
  }

  // Blatt 6, Nr. 3: Welche Rechnung passt zum Bild?
  function bildRechnung() {
    let x, y, z;
    do { x = zufall(2, 5); y = zufall(2, 5); z = zufall(2, 6); } while (new Set([x + y + z, x + y * z, x * y + z, x * y * z]).size < 4 || x === y);
    const typ = Math.random() < 0.5 ? 'B' : 'C';
    const bild = typ === 'B' ? punktBild(y, z, x) : punktBild(x, y, z);
    const opt = { A: `${x} + ${y} + ${z}`, B: `${x} + ${y} · ${z}`, C: `${x} · ${y} + ${z}`, D: `${x} · ${y} · ${z}` };
    const wert = { A: x + y + z, B: x + y * z, C: x * y + z, D: x * y * z };
    const lr = typ === 'B' ? (x + y) * z : wert.C;
    return {
      schluessel: ['bild', typ, x, y, z],
      schritte: [
        {
          art: 'auswahl',
          frage: `Welche Rechnung passt zum Bild?<br>${bild}`,
          optionen: Object.keys(opt).map((k) => ({ text: `${k}: ${opt[k]}`, richtig: k === typ })),
          hilfe: typ === 'B'
            ? `Es sind ${y} Kästchen mit je ${z} Punkten. Das ist ${y} · ${z}. Dazu kommen ${x} einzelne Punkte.`
            : `Es sind ${x} Kästchen mit je ${y} Punkten. Das ist ${x} · ${y}. Dazu kommen ${z} einzelne Punkte.`,
        },
        {
          art: 'rechnen',
          anweisung: `Wie viele Punkte sind es? Rechne.<br>${bild}`,
          zeilen: [[{ text: opt[typ] }, '=', feld(wert[typ])]],
          hilfe: 'Punkt vor Strich: Rechne zuerst die Malaufgabe.',
          pruefe: (w) => (w[0] === lr && lr !== wert[typ] ? 'Achtung: Punkt vor Strich!' : null),
        },
      ],
    };
  }

  // Blatt 5, Nr. 4: Welche Zahl ist gemeint?
  const REIHE = { 3: 'Dreierreihe', 4: 'Viererreihe', 5: 'Fünferreihe', 6: 'Sechserreihe', 7: 'Siebenerreihe', 8: 'Achterreihe', 9: 'Neunerreihe' };
  function raetsel() {
    for (let versuch = 0; versuch < 400; versuch++) {
      const quadrat = Math.random() < 0.35;
      const n = zufall(3, 9);
      const x = quadrat ? zufall(3, 10) ** 2 : n * zufall(2, 10);
      const lo = Math.max(0, x - zufall(3, 25)), hi = Math.min(100, x + zufall(3, 25));
      const gerade = x % 2 === 0;
      const regeln = [
        { text: `Meine Zahl ist ${gerade ? 'gerade' : 'ungerade'}.`, ok: (y) => (y % 2 === 0) === gerade, fehler: `Deine Zahl ist ${gerade ? 'ungerade' : 'gerade'}.` },
        { text: `Sie liegt zwischen ${lo} und ${hi}.`, ok: (y) => y > lo && y < hi, fehler: `Deine Zahl liegt nicht zwischen ${lo} und ${hi}.` },
        quadrat
          ? { text: 'Sie ist eine Quadratzahl (zum Beispiel 5 · 5).', ok: (y) => Number.isInteger(Math.sqrt(y)) && y > 0, fehler: 'Deine Zahl ist keine Quadratzahl.' }
          : { text: `Sie steht in der ${REIHE[n]}.`, ok: (y) => y % n === 0 && y > 0 && y <= 10 * n, fehler: `Deine Zahl steht nicht in der ${REIHE[n]}.` },
      ];
      const treffer = [];
      for (let y = 1; y <= 100; y++) if (regeln.every((r) => r.ok(y))) treffer.push(y);
      if (treffer.length !== 1 || treffer[0] !== x) continue;
      // Jeder Hinweis muss gebraucht werden
      const noetig = regeln.every((r, i) => { let k = 0; for (let y = 1; y <= 100; y++) if (regeln.every((q, j) => j === i || q.ok(y))) k++; return k > 1; });
      if (!noetig) continue;
      const wer = wahl(WER);
      return {
        art: 'rechnen',
        anweisung: `<b>${wer}</b>: „${regeln.map((r) => r.text).join(' ')}“<br><small>Welche Zahl ist gemeint?</small>`,
        zeilen: [['Meine Zahl', feld(x)]],
        hilfe: quadrat ? 'Schreib die Quadratzahlen auf: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100. Welche passt zu den anderen Hinweisen?' : `Schreib die Zahlen der ${REIHE[n]} auf. Welche passt zu den anderen Hinweisen?`,
        pruefe: (w) => { if (w[0] == null) return null; const r = regeln.find((q) => !q.ok(w[0])); return r ? r.fehler : null; },
        wert: 2,
        schluessel: ['rt', x, quadrat],
      };
    }
    return null;
  }

  /* =================== STUFE 2: KNOBELN =================== */

  // Blatt 2, Nr. 4: Genau k Plättchen – alle dreistelligen Zahlen
  function genauPlaettchen() {
    const k = wahl([3, 4, 4]);
    const liste = [];
    for (let h = 1; h <= k; h++) for (let z = 0; z <= k - h; z++) liste.push(100 * h + 10 * z + (k - h - z));
    const l = sortiert(liste);
    return {
      schluessel: ['gp', k],
      schritte: [
        {
          art: 'folge',
          anweisung: `Verteile <b>genau ${k} Plättchen</b> auf H, Z und E. Mindestens ein Plättchen muss bei H liegen. Finde <b>alle</b> Zahlen und schreib sie der Größe nach auf.`,
          glieder: l.map((x) => feld(x)),
          hilfe: `Fang mit 1 Plättchen bei H an und verteile die anderen ${k - 1} auf Z und E. Dann 2 bei H, und so weiter.`,
          wert: 3,
        },
        anzahlSchritt(l.length),
      ],
    };
  }

  // Blatt 2, Nr. 5: Doppelt so viele Plättchen
  function doppelt() {
    const r = wahl([
      { text: 'Es gibt doppelt so viele Einer wie Zehner und doppelt so viele Zehner wie Hunderter.', f: (h) => [h, 2 * h, 4 * h] },
      { text: 'Es gibt gleich viele Zehner wie Hunderter und doppelt so viele Einer wie Hunderter.', f: (h) => [h, h, 2 * h] },
      { text: 'Es gibt dreimal so viele Zehner wie Hunderter und gleich viele Einer wie Zehner.', f: (h) => [h, 3 * h, 3 * h] },
    ]);
    const liste = [];
    for (let h = 1; h <= 9; h++) { const [a, b, c] = r.f(h); if (b <= 9 && c <= 9) liste.push(100 * a + 10 * b + c); }
    return {
      art: 'folge',
      anweisung: `${r.text} Finde <b>alle</b> dreistelligen Zahlen und schreib sie der Größe nach auf.`,
      glieder: liste.map((x) => feld(x)),
      hilfe: 'Probier aus: 1 Plättchen bei H – wie viele liegen dann bei Z und bei E? Dann 2 bei H, und so weiter. Mehr als 9 in einer Spalte geht nicht.',
      wert: 2,
      schluessel: ['dp', r.text],
    };
  }

  // Blatt 3, Nr. 3: Ein Code mit zwei Hinweisen
  function codeHinweise() {
    const a = zufall(1, 9);
    let s; do s = zufall(1, 9); while (s === a);
    const doppel = 100 * a + 11 * s;
    return {
      schluessel: ['ch', a, s],
      schritte: [
        {
          art: 'rechnen',
          anweisung: `🔒 Der Code ist dreistellig. Vorne steht eine <b>${a}</b>, danach kommt mindestens eine <b>${s}</b>. Alle Ziffern von 0 bis 9 sind erlaubt, sie dürfen sich wiederholen.<br>Die ${s} steht <b>in der Mitte</b>. Was ist der kleinste und der größte Code? Wie viele Codes gibt es?`,
          zeilen: [['kleinster', feld(100 * a + 10 * s)], ['größter', feld(100 * a + 10 * s + 9)], ['so viele', feld(10)]],
          hilfe: `Die ersten beiden Ziffern sind fest: ${a}${s}_. Hinten kann jede Ziffer von 0 bis 9 stehen.`,
          wert: 2,
        },
        {
          art: 'rechnen',
          anweisung: `Jetzt steht die ${s} <b>nur am Ende</b>: ${a} _ ${s}. In der Mitte darf also keine ${s} stehen. Wie viele Codes gibt es?`,
          zeilen: [['so viele', feld(9)]],
          hilfe: `In der Mitte geht jede Ziffer von 0 bis 9 – aber nicht die ${s}. Der Code ${doppel} zählt hier nicht mit.`,
          pruefe: (w) => (w[0] === 10 ? `Fast! Bei ${doppel} steht die ${s} auch in der Mitte. Der zählt hier nicht mit.` : null),
        },
        {
          art: 'rechnen',
          anweisung: 'Wie viele Codes passen also insgesamt zu den Hinweisen?',
          zeilen: [['insgesamt', feld(19)]],
          hilfe: 'Zähle beide Antworten zusammen.',
        },
      ],
    };
  }

  // Blatt 3, Nr. 4: Ein Schloss mit vier Ziffern
  function schloss4() {
    let d; do d = [zufall(1, 9), zufall(1, 9), zufall(1, 9), zufall(1, 9)]; while (new Set(d).size < 4);
    d.sort((x, y) => x - y);
    const [a, b] = d;
    const rest = d.slice(1);
    const codes = [];
    [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].forEach(([i, j, k]) => codes.push(1000 * a + 100 * rest[i] + 10 * rest[j] + rest[k]));
    return {
      schluessel: ['s4', d],
      schritte: [
        {
          art: 'folge',
          anweisung: `🔒 Ein Schloss mit vier Ziffern: Verwende <b>${mischen(d).join(', ')}</b> in jedem Code genau einmal. Schreib alle Codes auf, die mit <b>${a}</b> beginnen – der Größe nach.`,
          glieder: sortiert(codes).map((x) => feld(x)),
          hilfe: `Vorne steht immer ${a}. Dann kommt ${rest[0]}, ${rest[1]} oder ${rest[2]} an die zweite Stelle. Für die letzten beiden Ziffern gibt es jeweils 2 Möglichkeiten.`,
          wert: 3,
        },
        {
          art: 'rechnen',
          anweisung: `Wie viele Codes beginnen mit <b>${b}</b>? Und wie viele Codes gibt es insgesamt?`,
          zeilen: [[`beginnen mit ${b}`, feld(6)], ['insgesamt', feld(24)]],
          hilfe: 'Für jede Anfangsziffer gibt es gleich viele Codes. Es gibt 4 Anfangsziffern.',
          pruefe: (w) => (w[1] === 6 ? 'Für jede der 4 Anfangsziffern gibt es 6 Codes.' : null),
        },
      ],
    };
  }

  // Blatt 3, Nr. 1 Extra: Je eine Hunderter-, Zehner- und Einerkarte
  function kartenAuswahl() {
    let hs, zs, es;
    do { hs = [zufall(1, 9), zufall(1, 9)].sort(); zs = [zufall(1, 9), zufall(1, 9)].sort(); es = [zufall(1, 9), zufall(1, 9)].sort(); }
    while (hs[0] === hs[1] || zs[0] === zs[1] || es[0] === es[1]);
    const alle = [];
    hs.forEach((h) => zs.forEach((z) => es.forEach((e) => alle.push(100 * h + 10 * z + e))));
    const groesser = Math.random() < 0.5;
    const grenze = groesser ? hs[1] * 100 : hs[1] * 100;
    const liste = sortiert(alle.filter((x) => (groesser ? x > grenze : x < grenze)));
    const karten = [...hs.map((h) => h * 100), ...zs.map((z) => z * 10), ...es];
    return {
      schluessel: ['ka', karten],
      schritte: [
        {
          art: 'folge',
          anweisung: `Wähle je eine Hunderter-, eine Zehner- und eine Einerkarte.<br>${App.bild.karten(karten)}<br>Finde alle Zahlen, die <b>${groesser ? 'größer' : 'kleiner'} als ${grenze}</b> sind. Schreib sie der Größe nach auf.`,
          glieder: liste.map((x) => feld(x)),
          hilfe: `${groesser ? `Größer als ${grenze}: Du musst die ${hs[1] * 100} nehmen.` : `Kleiner als ${grenze}: Du musst die ${hs[0] * 100} nehmen.`} Dann gibt es für Zehner und Einer je 2 Karten.`,
          wert: 2,
        },
        {
          art: 'rechnen',
          anweisung: 'Wie viele verschiedene Zahlen kannst du mit den Karten <b>insgesamt</b> legen?',
          zeilen: [['insgesamt', feld(8)]],
          hilfe: '2 Hunderterkarten · 2 Zehnerkarten · 2 Einerkarten: Für jede Hunderterkarte gibt es 4 Zahlen.',
        },
      ],
    };
  }

  /* =================== THEMA =================== */
  const STUFE = [
    [gelegt, gelegt, bildWaehlen, buendeln, buendeln, fehler, reihe, kreuz, zaehlen, muster, () => plaettchenAendern(false)],
    [plus, plus, mal, mal, teilen, teilen, punktVorStrich, punktVorStrich, bildRechnung, raetsel],
    [genauPlaettchen, doppelt, codeHinweise, schloss4, kartenAuswahl, () => plaettchenAendern(true), raetsel],
  ];

  App.thema({
    id: 'mathearbeit',
    titel: 'Fit für die Mathearbeit',
    symbol: '📝',
    farbe: '#e03131',
    beschreibung: 'Aufgaben wie auf den Übungsblättern',
    stufen: [
      { name: 'Zahlen bis 1000', info: 'Material, Bündeln, Tausenderstreifen' },
      { name: 'Rechnen', info: 'Plus, Einmaleins, Teilen, Punkt vor Strich' },
      { name: 'Knobeln', info: 'Alle Möglichkeiten, Codes, Zahlenrätsel' },
    ],
    anzahl: (stufe) => [9, 10, 5][stufe],
    erzeuge(stufe) {
      let a = null;
      while (!a) a = wahl(STUFE[stufe])();
      return a;
    },
  });
})();
