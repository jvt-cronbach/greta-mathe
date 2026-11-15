/* THEMA: Der Tausenderstreifen (Zahlenraum bis 1000, Buch S. 24–25)
   Nachbarzahlen im Kreuz, Zählen, Zahlenfolgen, Muster im Hunderterfeld */
'use strict';
(function () {
  const { zufall, wahl, feld } = App;
  const REGELN = 'Links ist 1 weniger, rechts 1 mehr. Oben ist 10 weniger, unten 10 mehr.';
  const NAMEN = ['A', 'B', 'C', 'D'];

  // Position im Hunderterfeld: Zeile 0–9, Spalte 0–9 (x01 links oben, x00 rechts unten)
  const pos = (n) => ({ r: Math.floor(((n - 1) % 100) / 10), c: (n - 1) % 10 });
  const startVon = (n) => Math.floor((n - 1) / 100) * 100 + 1;
  // Zahl, die im Hunderterfeld nicht am Rand liegt (alle vier Nachbarn sind da)
  function innen(min, max) {
    for (;;) {
      const n = zufall(min, max), p = pos(n);
      if (p.r >= 1 && p.r <= 8 && p.c >= 1 && p.c <= 8) return n;
    }
  }

  /* ---------- Zahlenkreuz ---------- */
  function kreuzMitte() {
    const n = innen(101, 999);
    return {
      art: 'kreuz',
      anweisung: 'Trag die Nachbarzahlen ein. Denk an die vier Regeln.',
      mitte: n, oben: feld(n - 10), links: feld(n - 1), rechts: feld(n + 1), unten: feld(n + 10),
      hilfe: REGELN,
      pruefe: (w) => (w[0] === n + 10 || w[3] === n - 10 ? 'Oben und unten vertauscht? Oben ist die kleinere Zahl (10 weniger).' : null),
      schluessel: ['km', n],
    };
  }

  function kreuzArm(seiten) {
    const n = innen(101, 999), arm = wahl(seiten);
    const werte = { oben: n - 10, links: n - 1, rechts: n + 1, unten: n + 10 };
    const k = { art: 'kreuz', mitte: feld(n) };
    Object.keys(werte).forEach((s) => { k[s] = s === arm ? werte[s] : feld(werte[s]); });
    const wie = { oben: 'Die obere Zahl ist um 10 kleiner – die Mitte also um 10 größer.', unten: 'Die untere Zahl ist um 10 größer – die Mitte also um 10 kleiner.', links: 'Die linke Zahl ist um 1 kleiner – die Mitte also um 1 größer.', rechts: 'Die rechte Zahl ist um 1 größer – die Mitte also um 1 kleiner.' }[arm];
    return Object.assign(k, {
      anweisung: 'Finde zuerst die Zahl in der Mitte. Dann die anderen.',
      hilfe: wie + ' ' + REGELN,
      schluessel: ['ka', n, arm],
    });
  }

  /* ---------- Zählen ---------- */
  function zaehlen(stufe) {
    const vor = Math.random() < 0.5, laenge = 7, offen = stufe === 0 ? 4 : 5;
    let start;
    if (stufe === 0) start = vor ? zufall(101, 990) : zufall(110, 999);
    else start = vor ? 100 * zufall(2, 9) + zufall(-4, -1) : 100 * zufall(1, 9) + zufall(1, 4);
    if (stufe > 0 && !vor && Math.random() < 0.25) start = 1000;
    if (vor && start + laenge > 1000) start = 1000 - laenge;
    const glieder = [];
    for (let i = 0; i < laenge; i++) {
      const x = vor ? start + i : start - i;
      glieder.push(i < laenge - offen ? x : feld(x));
    }
    return {
      art: 'folge',
      anweisung: `Zähle <b>${vor ? 'vorwärts' : 'rückwärts'}</b>.`,
      glieder,
      hilfe: vor ? 'Immer 1 mehr. Nach der 9 bei den Einern kommt der nächste Zehner.' : 'Immer 1 weniger. Nach der 0 bei den Einern kommt die 9 – und der Zehner wird kleiner.',
      schluessel: ['zä', start, vor],
    };
  }

  /* ---------- Zahlenfolgen ---------- */
  const FOLGEN = [
    // [Schritt, Stufe] – Start wird passend gesucht
    { s: 100, st: 1 }, { s: 10, st: 1 }, { s: -10, st: 1 }, { s: -100, st: 1 }, { s: 50, st: 1 }, { s: 5, st: 1 },
    { s: 25, st: 2 }, { s: 99, st: 2 }, { s: 101, st: 2 }, { s: 11, st: 2 }, { s: 9, st: 2 }, { s: -99, st: 2 }, { s: 60, st: 2 }, { s: -25, st: 2 },
  ];
  function folge(stufe) {
    const f = wahl(FOLGEN.filter((x) => x.st === stufe)), s = f.s, laenge = 6, gegeben = 3;
    let start;
    for (;;) {
      if (Math.abs(s) === 100) start = wahl([zufall(0, 9) * 10 + zufall(0, 9), zufall(1, 99)]);
      else if (Math.abs(s) >= 25) start = Math.abs(s) % 25 === 0 ? zufall(0, 39) * 25 : zufall(1, 300);
      else if (Math.abs(s) === 10) start = zufall(10, 990);
      else start = zufall(1, 990);
      if (s < 0) start = 1000 - start;
      const ende = start + s * (laenge - 1);
      if (start >= 0 && ende >= 0 && start <= 1000 && ende <= 1000 && start !== 0) break;
    }
    const glieder = [];
    for (let i = 0; i < laenge; i++) glieder.push(i < gegeben ? start + s * i : feld(start + s * i));
    const tipps = {
      99: '+ 99 ist dasselbe wie + 100 und dann − 1.', 101: '+ 101 ist dasselbe wie + 100 und dann + 1.',
      '-99': '− 99 ist dasselbe wie − 100 und dann + 1.', 11: '+ 11: Ein Zehner und ein Einer mehr – wie die Diagonale im Hunderterfeld.',
      9: '+ 9 ist dasselbe wie + 10 und dann − 1.', 25: '4 mal 25 sind 100. Also 25, 50, 75, 100 …', '-25': '4 mal 25 sind 100. Rückwärts: 100, 75, 50, 25 …',
    };
    return {
      art: 'folge',
      anweisung: 'Wie geht es weiter? Finde die Regel und setze fort.',
      glieder,
      hilfe: tipps[s] || `Schau, um wie viel die Zahlen ${s > 0 ? 'größer' : 'kleiner'} werden.`,
      wert: stufe === 2 ? 2 : 1,
      schluessel: ['fo', start, s],
    };
  }

  /* ---------- Hunderterfeld ---------- */
  function feldFinden(stufe) {
    const start = 100 * zufall(0, 8) + 1;
    const anzahl = stufe === 0 ? 2 : 3;
    const marken = [];
    while (marken.length < anzahl) {
      const p = { r: zufall(1, 8), c: zufall(1, 8) };
      const n = start + 10 * p.r + p.c;
      if (!marken.some((m) => Math.abs(m.zahl - n) < 2 || Math.abs(m.zahl - n) === 10)) marken.push({ zahl: n });
    }
    marken.sort((a, b) => a.zahl - b.zahl).forEach((m, i) => { m.name = NAMEN[i]; });
    return {
      art: 'hunderter',
      anweisung: `Ein Stück vom Tausenderstreifen. Welche Zahlen stehen auf den bunten Feldern?`,
      start, zeige: ['rand', 'zeile', 'ecken'][stufe], marken,
      hilfe: 'In jeder Zeile sind es 10 Zahlen. Nach unten wird es immer 10 mehr, nach rechts immer 1 mehr. Die Zahlen am Ende der Zeile enden mit 0.',
      schluessel: ['hf', marken.map((m) => m.zahl)],
    };
  }

  function muster() {
    const start = 100 * zufall(0, 8) + 1;
    const art = wahl([
      { s: 11, name: 'eine Diagonale', r: [0, 4], c: [0, 4] },
      { s: 9, name: 'eine Diagonale', r: [0, 4], c: [5, 9] },
      { s: 10, name: 'eine Spalte', r: [0, 4], c: [0, 9] },
      { s: 2, name: 'eine Zeile mit Lücken', r: [0, 9], c: [0, 1] },
    ]);
    const r = zufall(art.r[0], art.r[1]), c = zufall(art.c[0], art.c[1]);
    const erste = start + 10 * r + c;
    const sichtbar = [erste, erste + art.s, erste + 2 * art.s];
    const marken = [{ zahl: erste + 3 * art.s, name: 'A' }, { zahl: erste + 4 * art.s, name: 'B' }];
    return {
      art: 'hunderter',
      anweisung: `Die grünen Felder bilden ${art.name}. Setze das Muster fort: Welche Zahlen stehen auf A und B?`,
      start, zeige: 'ecken', muster: sichtbar, marken,
      hilfe: `Schau, wie sich die grünen Zahlen verändern: Es kommen immer ${art.s} dazu.`,
      wert: 1,
      schluessel: ['mu', erste, art.s],
    };
  }

  App.thema({
    id: 'tausenderstreifen',
    titel: 'Tausenderstreifen',
    symbol: '📏',
    farbe: '#0c8599',
    beschreibung: 'Nachbarzahlen, zählen und Muster bis 1000',
    stufen: [
      { name: 'Leicht', info: 'Zahlenkreuz, zählen, Felder finden' },
      { name: 'Mittel', info: 'Mitte gesucht, über den Hunderter zählen, Folgen' },
      { name: 'Schwer', info: 'Knifflige Folgen und Muster' },
    ],
    anzahl: 10,
    erzeuge(stufe) {
      if (stufe === 0) return wahl([kreuzMitte, kreuzMitte, () => zaehlen(0), () => feldFinden(0)])();
      if (stufe === 1) return wahl([() => kreuzArm(['links', 'rechts']), kreuzMitte, () => zaehlen(1), () => folge(1), () => folge(1), () => feldFinden(1)])();
      return wahl([() => kreuzArm(['oben', 'unten', 'links', 'rechts']), () => folge(2), () => folge(2), muster, muster, () => feldFinden(2)])();
    },
  });

  // für Tests
  App._streifen = { pos, startVon };
})();
