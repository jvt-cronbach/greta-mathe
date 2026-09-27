/* THEMA: Starke Päckchen
   Schritt 1: Päckchen rechnen · Schritt 2: „Was fällt dir auf?“ · Schritt 3: Päckchen fortsetzen */
'use strict';
(function () {
  const { zufall, wahl, mischen, feld } = App;
  const RECHNE = { '+': (a, b) => a + b, '−': (a, b) => a - b, '·': (a, b) => a * b, ':': (a, b) => a / b };

  function erzeugeMuster(stufe) {
    const max = stufe === 0 ? 100 : 1000;
    const schritte = stufe === 0 ? [1, 2, 5, 10] : [5, 10, 20, 50, 100];
    const arten = stufe < 2
      ? ['plusGleich', 'plusMehr', 'plusBeide', 'minusGleich', 'minusMehr', 'minusWeniger']
      : ['malReihe', 'malZehner', 'geteiltReihe', 'plusGleich', 'minusGleich', 'minusWeniger'];

    for (let n = 0; n < 500; n++) {
      const art = wahl(arten);
      let d = wahl(schritte);
      if (Math.random() < 0.25 && stufe < 2) d = -d;
      let op, a, b, da, db;
      switch (art) {
        case 'plusGleich': op = '+'; da = d; db = -d; break;
        case 'plusMehr': op = '+'; da = d; db = 0; break;
        case 'plusBeide': op = '+'; da = d; db = d; break;
        case 'minusGleich': op = '−'; da = d; db = d; break;
        case 'minusMehr': op = '−'; da = d; db = 0; break;
        case 'minusWeniger': op = '−'; da = 0; db = d; break;
        case 'malReihe': op = '·'; a = zufall(1, 5); b = zufall(3, 9); da = 1; db = 0; break;
        case 'malZehner': op = '·'; a = zufall(1, 5); b = wahl([20, 30, 40, 50, 60, 70, 80, 90]); da = 1; db = 0; break;
        case 'geteiltReihe': op = ':'; b = zufall(3, 9); a = b * zufall(1, 5); da = b; db = 0; break;
      }
      if (a === undefined) {
        if (stufe === 0) { a = zufall(10, 70); b = zufall(3, 45); }
        else {
          a = zufall(10, 80) * 10 + (Math.random() < 0.4 ? zufall(1, 9) : 0);
          b = zufall(2, 45) * 10 + (Math.random() < 0.4 ? zufall(1, 9) : 0);
        }
      }
      const zeilen = [];
      let ok = true;
      for (let i = 0; i < 5; i++) {
        const x = a + i * da, y = b + i * db, e = RECHNE[op](x, y);
        if (x < 1 || y < 1 || e < 0 || x > max || y > max || e > max || !Number.isInteger(e)) { ok = false; break; }
        zeilen.push([x, y, e]);
      }
      if (!ok) continue;
      const schrittweite = Math.abs(da) || Math.abs(db);
      return { op, zeilen, delta: zeilen[1][2] - zeilen[0][2], schrittweite };
    }
  }

  function satz(d) {
    if (d === 0) return 'Das Ergebnis bleibt immer gleich.';
    return `Das Ergebnis wird immer um ${Math.abs(d)} ${d > 0 ? 'größer' : 'kleiner'}.`;
  }

  App.thema({
    id: 'starke-paeckchen',
    titel: 'Starke Päckchen',
    symbol: '📦',
    farbe: '#ff8a3d',
    beschreibung: 'Rechnen, Muster entdecken, weitermachen',
    stufen: [
      { name: 'Leicht', info: 'Plus und Minus bis 100' },
      { name: 'Mittel', info: 'Plus und Minus bis 1000' },
      { name: 'Schwer', info: 'Auch mit Mal und Geteilt' },
    ],
    anzahl: 4,
    erzeuge(stufe) {
      const m = erzeugeMuster(stufe);
      const z = m.zeilen;
      const s = m.schrittweite || 1;
      const falsche = mischen([...new Set([0, s, -s, 2 * s, -2 * s].filter((x) => x !== m.delta))]).slice(0, 3);
      return {
        schluessel: [m.op, z[0][0], z[0][1], z[1][0], z[1][1]],
        schritte: [
          {
            art: 'rechnen',
            anweisung: 'Rechne das Päckchen.',
            zeilen: z.slice(0, 4).map(([x, y, e]) => [x, m.op, y, '=', feld(e)]),
            hilfe: 'Rechne die erste Aufgabe genau. Dann schau: Wie verändern sich die Zahlen von Zeile zu Zeile? So kannst du die nächsten Ergebnisse schlau ableiten.',
            wert: 1,
          },
          {
            art: 'auswahl',
            anweisung: 'Was fällt dir auf?',
            optionen: [{ text: satz(m.delta), richtig: true }, ...falsche.map((d) => ({ text: satz(d) }))],
            hilfe: 'Vergleiche die Ergebnisse untereinander. Was passiert von einer Zeile zur nächsten?',
            wert: 1,
          },
          {
            art: 'rechnen',
            anweisung: 'Setze das Päckchen fort: Wie heißt die nächste Aufgabe?',
            zeilen: [[feld(z[4][0]), m.op, feld(z[4][1]), '=', feld(z[4][2])]],
            hilfe: 'Schau, wie sich die erste Zahl und die zweite Zahl jedes Mal verändern – und mach genauso weiter.',
            wert: 1,
          },
        ],
      };
    },
  });
})();
