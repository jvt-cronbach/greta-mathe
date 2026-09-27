/* THEMA: Zahlenrätsel – „Ich denke mir eine Zahl …“ */
'use strict';
(function () {
  const { zufall, wahl, feld } = App;
  const WER = ['Greta', 'WuschWusch', 'BabyAffi', 'Lenchen'];
  const RUECKWAERTS = 'Rechne rückwärts! Fang beim Ergebnis an und mach jeden Schritt rückgängig: Aus plus wird minus, aus mal wird geteilt.';

  // Jedes Rätsel: { text, x (Lösung), falle (typischer Fehler), fallenText, hilfe }
  const LEICHT = [
    () => { const x = zufall(5, 70), n = zufall(3, 30); return x + n > 100 ? null : { text: `Wenn ich ${n} dazuzähle, bekomme ich ${x + n}.`, x, falle: x + 2 * n }; },
    () => { const x = zufall(25, 100), n = zufall(3, 20); return { text: `Wenn ich ${n} wegnehme, bleiben ${x - n} übrig.`, x, falle: x - 2 * n }; },
    () => { const x = zufall(5, 50); return { text: `Wenn ich meine Zahl verdopple, bekomme ich ${2 * x}.`, x, falle: 4 * x }; },
    () => { const x = zufall(5, 50) * 2; return { text: `Die Hälfte meiner Zahl ist ${x / 2}.`, x, falle: x / 4 }; },
    () => {
      const z = zufall(1, 9), e = zufall(0, 9), x = 10 * z + e;
      const t = Math.random() < 0.5 ? `${z} Zehner und ${e} Einer` : `${e} Einer und ${z} Zehner`;
      return { text: `Meine Zahl hat ${t}.`, x, falle: e ? 10 * e + z : null, hilfe: 'Die Zehner kommen nach vorne, die Einer nach hinten.' };
    },
    () => { const x = zufall(10, 90), d = wahl([1, 2, 5, 10]); return x - d < 0 || x + d > 100 ? null : { text: `Meine Zahl liegt genau in der Mitte zwischen ${x - d} und ${x + d}.`, x, hilfe: 'Geh von beiden Zahlen gleich viele Schritte aufeinander zu.' }; },
  ];

  const MITTEL = [
    () => { const x = zufall(100, 800), n = wahl([zufall(2, 9) * 10, zufall(1, 4) * 100, zufall(11, 99)]); return x + n > 1000 ? null : { text: `Wenn ich ${n} dazuzähle, bekomme ich ${x + n}.`, x, falle: x + 2 * n }; },
    () => { const x = zufall(200, 1000), n = wahl([zufall(2, 9) * 10, zufall(1, 3) * 100, zufall(11, 99)]); return { text: `Wenn ich ${n} wegnehme, bleiben ${x - n} übrig.`, x, falle: x - 2 * n }; },
    () => { const x = zufall(2, 10), n = zufall(2, 10); return { text: `Wenn ich meine Zahl mit ${n} malnehme, bekomme ich ${x * n}.`, x, falle: x * n * n }; },
    () => { const x = zufall(2, 10), n = zufall(2, 10); return { text: `Wenn ich meine Zahl durch ${n} teile, bekomme ich ${x}.`, x: x * n, falle: null }; },
    () => {
      const h = zufall(1, 9), z = zufall(0, 9), e = zufall(0, 9), x = 100 * h + 10 * z + e;
      const teile = [`${h} Hunderter`, z ? `${z} Zehner` : 'keine Zehner', `${e} Einer`];
      const reihenfolge = Math.random() < 0.5 ? [0, 1, 2] : wahl([[2, 0, 1], [1, 2, 0], [2, 1, 0]]);
      const [p, q, r] = reihenfolge.map((i) => teile[i]);
      return { text: `Meine Zahl hat ${p}, ${q} und ${r}.`, x, hilfe: 'Schreib zuerst die Hunderter, dann die Zehner, dann die Einer. Keine Zehner? Dann kommt dort eine 0 hin.' };
    },
    () => { const x = zufall(3, 9) * 100 + wahl([0, 50]), d = wahl([10, 50, 100]); return { text: `Meine Zahl liegt genau in der Mitte zwischen ${x - d} und ${x + d}.`, x, hilfe: 'Geh von beiden Zahlen gleich viele Schritte aufeinander zu.' }; },
  ];

  const SCHWER = [
    () => { const x = zufall(2, 10), a = zufall(2, 9), b = zufall(1, 30); return { text: `Ich nehme meine Zahl mal ${a} und zähle dann ${b} dazu. Ich bekomme ${x * a + b}.`, x }; },
    () => { const x = zufall(5, 60), b = zufall(3, 30); return { text: `Ich zähle zu meiner Zahl ${b} dazu und verdopple das Ergebnis. Ich bekomme ${2 * (x + b)}.`, x }; },
    () => { const a = zufall(2, 9), q = zufall(4, 10), b = zufall(1, q - 1); return { text: `Ich teile meine Zahl durch ${a} und ziehe dann ${b} ab. Es bleiben ${q - b} übrig.`, x: a * q }; },
    () => { const a = zufall(2, 9), y = zufall(2, 10), b = zufall(3, 40), x = y + b; return { text: `Ich ziehe von meiner Zahl ${b} ab und nehme das Ergebnis mal ${a}. Ich bekomme ${y * a}.`, x }; },
    () => {
      const h = zufall(1, 4), z = 2 * h, k = zufall(1, 3), plus = Math.random() < 0.5 && z + k <= 9;
      const e = plus ? z + k : z - k;
      return {
        text: `Meine Zahl ist dreistellig. Die Hunderterziffer ist ${h}. Die Zehnerziffer ist doppelt so groß wie die Hunderterziffer. Die Einerziffer ist um ${k} ${plus ? 'größer' : 'kleiner'} als die Zehnerziffer.`,
        x: 100 * h + 10 * z + e,
        hilfe: 'Finde die Ziffern nacheinander: erst die Hunderter, dann die Zehner, dann die Einer.',
      };
    },
  ];

  App.thema({
    id: 'zahlenraetsel',
    titel: 'Zahlenrätsel',
    symbol: '🧩',
    farbe: '#7a5af0',
    beschreibung: 'Welche Zahl denken sich Greta und ihre Freunde?',
    stufen: [
      { name: 'Leicht', info: 'Ein Schritt, bis 100' },
      { name: 'Mittel', info: 'Mit Mal, Geteilt und Hundertern' },
      { name: 'Schwer', info: 'Zwei Schritte rückwärts rechnen' },
    ],
    anzahl: (stufe) => (stufe === 2 ? 6 : 8),
    erzeuge(stufe) {
      const liste = [LEICHT, MITTEL, SCHWER][stufe];
      let r = null;
      while (!r) r = wahl(liste)();
      const wer = wahl(WER);
      return {
        art: 'rechnen',
        anweisung: `<b>${wer}</b> sagt: „Ich denke mir eine Zahl. ${r.text}“<br><small>Welche Zahl ist es?</small>`,
        zeilen: [['Die Zahl ist', feld(r.x)]],
        hilfe: r.hilfe || RUECKWAERTS,
        pruefe: (w) => (r.falle != null && w[0] === r.falle
          ? 'Achtung, du hast vorwärts gerechnet! Hier musst du rückwärts rechnen: Aus plus wird minus, aus mal wird geteilt.' : null),
        wert: stufe === 2 ? 2 : 1,
        schluessel: [r.text],
      };
    },
  });
})();
