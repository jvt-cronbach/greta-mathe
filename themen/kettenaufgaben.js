/* THEMA: Kettenaufgaben (Rechenketten) */
'use strict';
(function () {
  const { zufall, wahl, mischen, feld } = App;
  const WER = ['Greta', 'WuschWusch', 'BabyAffi', 'Lenchen'];
  const UMKEHR = { '+': '−', '−': '+', '·': ':', ':': '·' };
  const rechne = (a, op, n) => (op === '+' ? a + n : op === '−' ? a - n : op === '·' ? a * n : a / n);

  // Einen passenden Schritt für die aktuelle Zahl finden
  function schritt(cur, ops, max, stufe, letzterOp) {
    for (let v = 0; v < 60; v++) {
      const op = wahl(ops.filter((o) => o !== letzterOp));
      let n;
      if (op === '+') n = stufe === 0 ? wahl([zufall(2, 19), zufall(1, 4) * 10]) : wahl([zufall(2, 49), zufall(1, 9) * 10, zufall(1, 3) * 50]);
      if (op === '−') { if (cur < 3) continue; n = stufe === 0 ? zufall(2, Math.min(30, cur)) : wahl([zufall(2, Math.min(60, cur)), zufall(1, Math.max(1, Math.floor(cur / 10))) * 10]); }
      if (op === '·') { if (cur > 100 || cur < 2) continue; n = zufall(2, cur > 50 ? 3 : cur > 20 ? 5 : 10); }
      if (op === ':') {
        const teiler = [2, 3, 4, 5, 6, 7, 8, 9, 10].filter((d) => cur % d === 0 && cur / d >= 2);
        if (!teiler.length) continue;
        n = wahl(teiler);
      }
      const neu = rechne(cur, op, n);
      if (neu < 0 || neu > max || !Number.isInteger(neu) || neu === cur) continue;
      return { op, n, neu };
    }
    return null;
  }

  function erzeugeKette(stufe, laenge) {
    const ops = stufe === 0 ? ['+', '−'] : ['+', '−', '·', ':'];
    const max = stufe === 0 ? 100 : 500;
    for (let v = 0; v < 200; v++) {
      let cur = stufe === 0 ? zufall(5, 50) : wahl([zufall(4, 30), zufall(2, 9) * 10]);
      const werte = [cur], ketten = [];
      let letzter = null, ok = true;
      for (let i = 0; i < laenge; i++) {
        const s = schritt(cur, ops, max, stufe, letzter);
        if (!s) { ok = false; break; }
        ketten.push(s); werte.push(s.neu); cur = s.neu; letzter = s.op;
      }
      // Bei Mittel/Schwer soll mindestens ein Mal oder Geteilt vorkommen
      if (ok && (stufe === 0 || ketten.some((s) => s.op === '·' || s.op === ':'))) return { werte, ketten };
    }
  }

  App.thema({
    id: 'kettenaufgaben',
    titel: 'Kettenaufgaben',
    symbol: '⛓️',
    farbe: '#2f9e44',
    beschreibung: 'Von Kreis zu Kreis bis zum Ziel rechnen',
    stufen: [
      { name: 'Leicht', info: 'Plus und Minus bis 100' },
      { name: 'Mittel', info: 'Alle vier Rechenarten, bis 500' },
      { name: 'Schwer', info: 'Rückwärts rechnen und Lücken im Pfeil' },
    ],
    anzahl: (stufe) => (stufe === 2 ? 4 : 6),
    erzeuge(stufe) {
      const laenge = stufe === 0 ? 4 : 5;
      const { werte, ketten } = erzeugeKette(stufe, laenge);
      const wer = wahl(WER);
      const label = (s) => `${s.op} ${s.n}`;

      if (stufe < 2) {
        return {
          art: 'kette',
          glieder: werte.map((w, i) => (i === 0 ? w : feld(w))),
          pfeile: ketten.map(label),
          anweisung: `Hilf ${wer}, den Weg bis zum Ziel zu rechnen! Rechne von Kreis zu Kreis.`,
          hilfe: 'Nimm die Zahl im Kreis und rechne, was auf dem Pfeil steht. Das Ergebnis kommt in den nächsten Kreis.',
          wert: stufe === 0 ? 2 : 2,
          schluessel: werte,
        };
      }

      if (Math.random() < 0.5) {
        // Rückwärts: nur das Ziel ist bekannt
        const umkehr = ketten.slice().reverse().map((s) => `${UMKEHR[s.op]} ${s.n}`).join(', ');
        return {
          art: 'kette',
          rueckwaerts: true,
          glieder: werte.map((w, i) => (i === werte.length - 1 ? w : feld(w))),
          pfeile: ketten.map(label),
          anweisung: `${wer} kennt nur das Ziel! Rechne <b>rückwärts</b> bis zum Start.`,
          hilfe: `Dreh jeden Pfeil um: Aus plus wird minus, aus mal wird geteilt. Vom Ziel aus rechnest du also: ${umkehr}.`,
          wert: 3,
          schluessel: werte,
        };
      }

      // Lücken: zwei Pfeile ohne Zahl, der Rest sind Kreise zum Ausrechnen
      const luecken = new Set(mischen([...Array(laenge).keys()]).slice(0, 2));
      return {
        art: 'kette',
        glieder: werte.map((w, i) => (i === 0 || luecken.has(i - 1) ? w : feld(w))),
        pfeile: ketten.map((s, i) => (luecken.has(i) ? [s.op, feld(s.n)] : label(s))),
        anweisung: 'In manchen Pfeilen fehlt die Zahl. Finde sie – und rechne die leeren Kreise aus.',
        hilfe: 'Vergleiche die Zahl vor dem Pfeil mit der Zahl dahinter: Um wie viel ist sie größer oder kleiner – oder wie oft passt sie hinein?',
        wert: 3,
        schluessel: werte,
      };
    },
  });
})();
