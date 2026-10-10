/* THEMA: Rechenmauern lösen */
'use strict';
(function () {
  const { zufall, wahl, mischen, feld } = App;

  // Mauer aus Grundreihe bauen: reihen[0] = Spitze, letzte Reihe = unten
  function baueMauer(basis) {
    const reihen = [basis];
    while (reihen[0].length > 1) {
      const u = reihen[0];
      reihen.unshift(u.slice(1).map((_, i) => u[i] + u[i + 1]));
    }
    return reihen;
  }

  // Ist die Mauer mit diesen bekannten Steinen eindeutig lösbar (Schritt für Schritt)?
  function loesbar(n, bekannt) {
    const k = new Set(bekannt);
    const id = (r, i) => r + ',' + i;
    let neu = true;
    while (neu) {
      neu = false;
      for (let r = 0; r < n - 1; r++) {
        for (let i = 0; i <= r; i++) {
          const drei = [id(r, i), id(r + 1, i), id(r + 1, i + 1)];
          const fehlt = drei.filter((x) => !k.has(x));
          if (fehlt.length === 1) { k.add(fehlt[0]); neu = true; }
        }
      }
    }
    return k.size === (n * (n + 1)) / 2;
  }

  function basisWerte(n, stufe) {
    if (stufe === 0) return Array.from({ length: n }, () => zufall(2, 25));
    // Mittel: kleine Grundsteine, damit die Spitze höchstens 200 wird; oft glatte Fünfer und Zehner
    if (stufe === 1) return Array.from({ length: n }, () => (Math.random() < 0.5 ? zufall(1, 6) * 5 : zufall(3, 28)));
    return Array.from({ length: n }, () => (Math.random() < 0.5 ? zufall(1, 12) * 10 : zufall(5, 120)));
  }

  App.thema({
    id: 'rechenmauern',
    titel: 'Rechenmauern',
    symbol: '🧱',
    farbe: '#c0662b',
    beschreibung: 'Zwei Steine zusammen ergeben den Stein darüber',
    stufen: [
      { name: 'Leicht', info: '3 Reihen, von unten nach oben, bis 100' },
      { name: 'Mittel', info: '4 Reihen bis 200, ein Stein unten fehlt' },
      { name: 'Schwer', info: '4 Reihen, unten fehlen mehrere Steine' },
    ],
    anzahl: (stufe) => (stufe === 0 ? 5 : 4),
    erzeuge(stufe) {
      const n = stufe === 0 ? 3 : 4;
      let reihen;
      do { reihen = baueMauer(basisWerte(n, stufe)); } while (reihen[0][0] > [100, 200, 1000][stufe]);

      const alle = [];
      reihen.forEach((reihe, r) => reihe.forEach((_, i) => alle.push(r + ',' + i)));
      const unten = (x) => Number(x.split(',')[0]) === n - 1;
      let bekannt;
      if (stufe === 0) {
        bekannt = alle.filter(unten);
      } else if (stufe === 1) {
        // Unten fehlt genau ein Stein. Der Stein direkt darüber ist vorgegeben:
        // also ein einziges Mal minus mit kleinen Zahlen, danach nur noch plus nach oben.
        const j = zufall(0, n - 1);
        const darueber = wahl([j - 1, j].filter((i) => i >= 0 && i <= n - 2));
        bekannt = alle.filter((x) => unten(x) && x !== (n - 1) + ',' + j).concat((n - 2) + ',' + darueber);
      } else {
        for (let v = 0; v < 500; v++) {
          const probe = mischen(alle).slice(0, n);
          if (probe.filter(unten).length <= 2 && loesbar(n, probe)) { bekannt = probe; break; }
        }
      }
      if (!bekannt) bekannt = alle.filter(unten);
      const k = new Set(bekannt);
      const steine = reihen.map((reihe, r) => reihe.map((w, i) => (k.has(r + ',' + i) ? w : feld(w))));

      return {
        art: 'mauer',
        reihen: steine,
        anweisung: [
          'Rechne die Mauer aus: Zwei Steine nebeneinander ergeben zusammen den Stein darüber.',
          'Löse die Mauer. Unten fehlt ein Stein, dort rechnest du <b>minus</b>: Stein darüber − Nachbarstein. Danach geht es mit plus nach oben.',
          'Löse die Mauer. Fehlt unten ein Stein, rechnest du <b>minus</b>: Stein oben − Nachbarstein.',
        ][stufe],
        hilfe: [
          'Nimm zwei Steine, die nebeneinander liegen, und zähle sie zusammen. Das Ergebnis kommt in den Stein genau darüber.',
          'Fang unten beim leeren Stein an. Schau auf den Stein direkt darüber und rechne: Stein darüber minus der Stein daneben. Danach zählst du immer zwei Nachbarn zusammen.',
          'Such eine Stelle, an der du zwei von drei Steinen schon kennst. Unten fehlt einer? Dann: Stein oben minus der Stein daneben.',
        ][stufe],
        wert: stufe === 0 ? 2 : 3,
        schluessel: reihen[n - 1],
      };
    },
  });
})();
