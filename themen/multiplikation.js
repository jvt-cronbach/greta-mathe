/* THEMA: Multiplikation (Malnehmen) */
'use strict';
(function () {
  const { zufall, wahl, feld } = App;

  function kernHilfe(a, b) {
    if (a === 10 || b === 10) return 'Mal 10: Hänge einfach eine 0 an die Zahl.';
    if (a > 5) return `Nutze eine leichte Aufgabe: 5 · ${b} = ${5 * b}. Dann noch ${a - 5} · ${b} dazu.`;
    if (a === 5) return `Die Hälfte von 10 · ${b} = ${10 * b}.`;
    return `Zähle in ${b}er-Schritten: ${b}, ${2 * b}, … – ${a}-mal.`;
  }
  const plusFalle = (a, b) => (w) => (w[w.length - 1] === a + b && a + b !== a * b
    ? 'Achtung: Das ist die Plus-Aufgabe. Hier heißt es <b>mal</b>!' : null);

  App.thema({
    id: 'multiplikation',
    titel: 'Malnehmen',
    symbol: '✖️',
    farbe: '#e2458f',
    beschreibung: 'Einmaleins, Lücken und große Malaufgaben',
    stufen: [
      { name: 'Leicht', info: 'Das kleine Einmaleins' },
      { name: 'Mittel', info: 'Mit Lücken: __ · 7 = 42' },
      { name: 'Schwer', info: 'Zehnerzahlen und Zerlegen: 6 · 23' },
    ],
    anzahl: (stufe) => (stufe === 2 ? 6 : 10),
    erzeuge(stufe) {
      if (stufe === 0 || (stufe === 1 && Math.random() < 0.35)) {
        const a = zufall(2, 10), b = zufall(2, 10);
        return {
          art: 'rechnen', anweisung: 'Rechne.',
          zeilen: [[a, '·', b, '=', feld(a * b)]],
          hilfe: kernHilfe(a, b), pruefe: plusFalle(a, b), schluessel: [a, b],
        };
      }

      if (stufe === 1) {
        const a = zufall(2, 10), b = zufall(2, 10), p = a * b;
        const vorne = Math.random() < 0.5;
        return {
          art: 'rechnen', anweisung: 'Welche Zahl fehlt?',
          zeilen: [vorne ? [feld(a), '·', b, '=', p] : [a, '·', feld(b), '=', p]],
          hilfe: vorne ? `Welche Zahl mal ${b} ergibt ${p}? Geh die ${b}er-Reihe durch.` : `${a} mal welche Zahl ergibt ${p}? Geh die ${a}er-Reihe durch.`,
          schluessel: [a, b, vorne],
        };
      }

      // Schwer
      if (Math.random() < 0.4) {
        const a = zufall(2, 9), b = zufall(2, 9);
        const zehnerVorne = Math.random() < 0.5;
        return {
          art: 'rechnen', anweisung: 'Rechne. Tipp: Denk an die kleine Aufgabe!',
          zeilen: [zehnerVorne ? [a * 10, '·', b, '=', feld(a * b * 10)] : [a, '·', b * 10, '=', feld(a * b * 10)]],
          hilfe: `Rechne zuerst ${a} · ${b} = ?. Das Ergebnis ist dann 10-mal so groß – hänge eine 0 an.`,
          wert: 2, schluessel: [a, b, zehnerVorne],
        };
      }
      const a = zufall(2, 9);
      let n;
      do { n = zufall(12, 49); } while (n % 10 === 0 || a * n > 400);
      const z = n - (n % 10), e = n % 10;
      return {
        art: 'rechnen',
        anweisung: `Zerlege ${a} · ${n}: Rechne erst mit dem Zehner, dann mit dem Einer – und dann zusammen.`,
        zeilen: [
          [a, '·', z, '=', feld(a * z)],
          [a, '·', e, '=', feld(a * e)],
          [a, '·', n, '=', feld(a * n)],
        ],
        hilfe: `${a} · ${n} ist dasselbe wie ${a} · ${z} plus ${a} · ${e}. Zähl die beiden Ergebnisse zusammen.`,
        wert: 2, schluessel: [a, n],
      };
    },
  });
})();
