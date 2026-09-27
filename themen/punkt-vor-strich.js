/* THEMA: Punkt- vor Strichrechnung (und Klammern) */
'use strict';
(function () {
  const { zufall, wahl, feld } = App;

  /* Ausdruck als Liste: Zahlen, Operatoren ('+','−','·',':') und Unterlisten (= Klammer). */
  const OPS = {
    '+': (a, b) => a + b, '−': (a, b) => a - b,
    '·': (a, b) => a * b, ':': (a, b) => (b && a % b === 0 ? a / b : NaN),
  };
  const gueltig = (v) => Number.isInteger(v) && v >= 0;

  // Richtig: Klammern zuerst, dann Punkt vor Strich
  function werte(t) {
    const x = t.map((e) => (Array.isArray(e) ? werte(e) : e));
    const ohnePunkt = [x[0]];
    for (let i = 1; i < x.length; i += 2) {
      const op = x[i], z = x[i + 1];
      if (op === '·' || op === ':') ohnePunkt.push(OPS[op](ohnePunkt.pop(), z));
      else ohnePunkt.push(op, z);
    }
    let v = ohnePunkt[0];
    for (let i = 1; i < ohnePunkt.length; i += 2) {
      v = OPS[ohnePunkt[i]](v, ohnePunkt[i + 1]);
      if (!gueltig(v)) return NaN;
    }
    return x.some((e) => Number.isNaN(e)) || ohnePunkt.some((e) => Number.isNaN(e)) ? NaN : v;
  }
  // Typischer Fehler 1: stur von links nach rechts
  function linksNachRechts(t) {
    const x = flach(t);
    let v = x[0];
    for (let i = 1; i < x.length; i += 2) v = OPS[x[i]](v, x[i + 1]);
    return v;
  }
  const flach = (t) => t.flatMap((e) => (Array.isArray(e) ? flach(e) : [e]));
  // Typischer Fehler 2: Klammern übersehen
  const ohneKlammern = (t) => werte(flach(t));
  const zeige = (t) => t.map((e) => (Array.isArray(e) ? `(${zeige(e)})` : e)).join(' ');

  const r = (a, b) => zufall(a, b);
  const LEICHT = [ // [Ausdruck, Index des Punkt-Teils]
    () => [r(2, 50), '+', r(2, 10), '·', r(2, 10)],
    () => [r(2, 10), '·', r(2, 10), '+', r(2, 50)],
    () => [r(20, 100), '−', r(2, 9), '·', r(2, 9)],
    () => [r(2, 10), '·', r(2, 10), '−', r(2, 30)],
    () => { const c = r(2, 9); return [r(2, 50), '+', c * r(2, 10), ':', c]; },
  ];
  const MITTEL = [
    ...LEICHT,
    () => [r(2, 9), '·', r(2, 9), '+', r(2, 9), '·', r(2, 9)],
    () => [r(5, 10), '·', r(5, 10), '−', r(2, 5), '·', r(2, 5)],
    () => { const c = r(2, 9); return [c * r(2, 10), ':', c, '+', r(2, 9), '·', r(2, 9)]; },
    () => [r(100, 500), '+', r(2, 9), '·', r(2, 9) * 10],
  ];
  const SCHWER = [
    () => [[r(2, 20), '+', r(2, 20)], '·', r(2, 9)],
    () => [r(2, 9), '·', [r(10, 40), '−', r(2, 9)]],
    () => { const c = r(2, 9); const s = c * r(3, 10); const a = r(1, s - 1); return [[a, '+', s - a], ':', c]; },
    () => [r(10, 90), '+', r(2, 9), '·', r(2, 9), '−', r(2, 20)],
    () => [r(2, 9), '·', r(2, 9), '+', r(2, 9), '·', r(2, 9), '−', r(2, 30)],
    () => [r(100, 400), '−', [r(2, 9), '+', r(2, 9)], '·', r(2, 9)],
  ];

  function ziehe(liste, max) {
    for (let n = 0; n < 500; n++) {
      const t = wahl(liste)();
      const v = werte(t);
      if (gueltig(v) && v <= max) return { t, v };
    }
  }

  const PUNKT_REGEL = 'Punkt vor Strich: Rechne zuerst <b>mal</b> und <b>geteilt</b>, danach <b>plus</b> und <b>minus</b>.';

  App.thema({
    id: 'punkt-vor-strich',
    titel: 'Punkt vor Strich',
    symbol: '🎯',
    farbe: '#0f9fbf',
    beschreibung: 'Erst mal und geteilt, dann plus und minus',
    stufen: [
      { name: 'Leicht', info: 'Mit Zwischenschritt' },
      { name: 'Mittel', info: 'Ohne Zwischenschritt, auch zwei Malaufgaben' },
      { name: 'Schwer', info: 'Mit Klammern und langen Aufgaben' },
    ],
    anzahl: 10,
    erzeuge(stufe) {
      if (stufe === 0) {
        const { t, v } = ziehe(LEICHT, 100);
        // Punkt-Teil finden und hervorheben
        const i = t.findIndex((e) => e === '·' || e === ':');
        const p = OPS[t[i]](t[i - 1], t[i + 1]);
        const vorher = t.slice(0, i - 1), nachher = t.slice(i + 2);
        const html = [...vorher, `<span class="punkt">${t[i - 1]} ${t[i]} ${t[i + 1]}</span>`, ...nachher].join(' ');
        const lr = linksNachRechts(t);
        return {
          art: 'rechnen',
          anweisung: `${PUNKT_REGEL}<br><small>Schreib zuerst das Ergebnis vom gelben Teil hin.</small>`,
          zeilen: [
            [{ text: html }, '=', ...vorher.map(String), feld(p), ...nachher.map(String)],
            ['', '=', feld(v)],
          ],
          hilfe: `Rechne zuerst ${t[i - 1]} ${t[i]} ${t[i + 1]}. Dann rechnest du mit diesem Ergebnis weiter.`,
          pruefe: (w) => (w[1] === lr && lr !== v ? 'Achtung: Punkt vor Strich! Du hast von links nach rechts gerechnet.' : null),
          schluessel: t,
        };
      }

      const { t, v } = ziehe(stufe === 1 ? MITTEL : SCHWER, 1000);
      const lr = linksNachRechts(t), ok = ohneKlammern(t);
      const hatKlammer = t.some(Array.isArray);
      const schritte = [];
      const erstesPunkt = t.findIndex((e) => e === '·' || e === ':');
      if (stufe === 1 && Math.random() < 0.35 && erstesPunkt > 0 && t.length === 5) {
        const punkt = `${t[erstesPunkt - 1]} ${t[erstesPunkt]} ${t[erstesPunkt + 1]}`;
        const strichIdx = erstesPunkt === 1 ? 3 : 1;
        const strich = `${t[strichIdx - 1]} ${t[strichIdx]} ${t[strichIdx + 1]}`;
        schritte.push({
          art: 'auswahl',
          anweisung: `Bei <b>${zeige(t)}</b>: Was rechnest du zuerst?`,
          optionen: [{ text: punkt, richtig: true }, { text: strich, meldung: 'Nein – erst Punkt, dann Strich!' }],
          hilfe: PUNKT_REGEL,
        });
      }
      schritte.push({
        art: 'rechnen',
        anweisung: hatKlammer ? 'Was in der Klammer steht, wird <b>zuerst</b> gerechnet. Dann Punkt vor Strich.' : PUNKT_REGEL,
        zeilen: [[{ text: zeige(t) }, '=', feld(v)]],
        hilfe: hatKlammer ? 'Rechne zuerst die Klammer aus. Schreib dir das Ergebnis im Kopf auf und rechne dann weiter.' : 'Such zuerst alle Mal- und Geteilt-Aufgaben und rechne sie aus. Dann plus und minus von links nach rechts.',
        pruefe: (w) => {
          if (hatKlammer && w[0] === ok && ok !== v) return 'Achtung: Die Klammer wird zuerst gerechnet!';
          if (w[0] === lr && lr !== v) return 'Achtung: Punkt vor Strich! Du hast einfach von links nach rechts gerechnet.';
          return null;
        },
        wert: stufe === 2 ? 2 : 1,
      });
      return { schluessel: t, schritte };
    },
  });
})();
