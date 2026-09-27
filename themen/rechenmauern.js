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
      { name: 'Mittel', info: '4 Reihen bis 1000, ein Stein unten fehlt' },
      { name: 'Schwer', info: '4 Reihen, unten fehlen mehrere Steine' },
    ],
    anzahl: (stufe) => (stufe === 0 ? 5 : 4),
    erzeuge(stufe) {
      const n = stufe === 0 ? 3 : 4;
      let reihen;
      do { reihen = baueMauer(basisWerte(n, stufe)); } while (reihen[0][0] > (stufe === 0 ? 100 : 1000));

      const alle = [];
      reihen.forEach((reihe, r) => reihe.forEach((_, i) => alle.push(r + ',' + i)));
      const unten = (x) => Number(x.split(',')[0]) === n - 1;
      let bekannt;
      if (stufe === 0) {
        bekannt = alle.filter(unten);
      } else {
        for (let v = 0; v < 500; v++) {
          const probe = mischen(alle).slice(0, n);
          const anzUnten = probe.filter(unten).length;
          const passt = stufe === 1 ? anzUnten === n - 1 : anzUnten <= 2;
          if (passt && loesbar(n, probe)) { bekannt = probe; break; }
        }
      }
      if (!bekannt) bekannt = alle.filter(unten);
      const k = new Set(bekannt);
      const steine = reihen.map((reihe, r) => reihe.map((w, i) => (k.has(r + ',' + i) ? w : feld(w))));

      return {
        art: 'mauer',
        reihen: steine,
        anweisung: stufe === 0
          ? 'Rechne die Mauer aus: Zwei Steine nebeneinander ergeben zusammen den Stein darüber.'
          : 'Löse die Mauer. Fehlt unten ein Stein, rechnest du <b>minus</b>: Stein oben − Nachbarstein.',
        hilfe: stufe === 0
          ? 'Nimm zwei Steine, die nebeneinander liegen, und zähle sie zusammen. Das Ergebnis kommt in den Stein genau darüber.'
          : 'Such eine Stelle, an der du zwei von drei Steinen schon kennst. Unten fehlt einer? Dann: Stein oben minus der Stein daneben.',
        wert: stufe === 0 ? 2 : 3,
        schluessel: reihen[n - 1],
      };
    },
  });
})();
