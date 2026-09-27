/* THEMA: Fehler finden in Rechentafeln
   Falsche Zahlen antippen und die richtige Zahl hineinschreiben. */
'use strict';
(function () {
  const { zufall, wahl, mischen } = App;

  function verschiedene(anzahl, erzeuger) {
    const s = new Set();
    let n = 0;
    while (s.size < anzahl && n++ < 200) s.add(erzeuger());
    return [...s];
  }

  function falscherWert(c, op, oben) {
    const k = [c + 1, c - 1, c + 10, c - 10];
    if (c >= 100) k.push(c + 100, c - 100);
    const t = String(c);
    if (t.length === 2 && t[0] !== t[1] && t[1] !== '0') k.push(Number(t[1] + t[0]));
    if (t.length === 3 && t[1] !== t[2]) k.push(Number(t[0] + t[2] + t[1]));
    if (op === '·') k.push(c + oben, c - oben);
    return wahl(k.filter((x) => x >= 0 && x !== c));
  }

  App.thema({
    id: 'rechentafel-fehler',
    titel: 'Fehler finden',
    symbol: '🔍',
    farbe: '#12a88a',
    beschreibung: 'Wer hat sich in der Rechentafel verrechnet?',
    stufen: [
      { name: 'Leicht', info: 'Plus-Tafel bis 100' },
      { name: 'Mittel', info: 'Plus- und Minus-Tafel bis 1000' },
      { name: 'Schwer', info: 'Mal-Tafel mit Zehnerzahlen' },
    ],
    anzahl: 4,
    erzeuge(stufe) {
      let op, oben, links, anzahlFehler;
      if (stufe === 0) {
        op = '+';
        oben = verschiedene(3, () => zufall(10, 55));
        links = verschiedene(3, () => zufall(4, 40));
        anzahlFehler = 2;
      } else if (stufe === 1) {
        op = wahl(['+', '−']);
        const mitEinern = () => (Math.random() < 0.5 ? zufall(1, 9) : 0);
        if (op === '+') {
          oben = verschiedene(3, () => zufall(10, 50) * 10 + mitEinern());
          links = verschiedene(3, () => zufall(2, 40) * 10 + mitEinern());
        } else {
          links = verschiedene(3, () => zufall(50, 99) * 10 + mitEinern());
          oben = verschiedene(3, () => zufall(1, 45) * 10 + mitEinern());
        }
        anzahlFehler = wahl([2, 3]);
      } else {
        op = '·';
        oben = verschiedene(4, () => zufall(2, 9));
        links = verschiedene(3, () => (Math.random() < 0.5 ? zufall(3, 9) : zufall(2, 9) * 10));
        anzahlFehler = 3;
      }
      const rechne = (l, o) => (op === '+' ? l + o : op === '−' ? l - o : l * o);
      const zellen = links.map((l) => oben.map((o) => ({ wert: rechne(l, o), richtig: rechne(l, o) })));
      const positionen = mischen(zellen.flatMap((reihe, r) => reihe.map((_, c) => [r, c]))).slice(0, anzahlFehler);
      positionen.forEach(([r, c]) => { zellen[r][c].wert = falscherWert(zellen[r][c].richtig, op, oben[c]); });

      const regel = `Rechne: Zahl links ${op} Zahl oben.`;
      const anweisung = stufe < 2
        ? `In dieser Rechentafel sind <b>${anzahlFehler} Fehler</b> versteckt. Tippe die falschen Zahlen an und schreib die richtige Zahl hinein. <br><small>${regel}</small>`
        : `In dieser Mal-Tafel sind Fehler versteckt – findest du alle? Tippe die falschen Zahlen an und schreib die richtige Zahl hinein. <br><small>${regel}</small>`;

      return {
        art: 'tafel',
        modus: 'fehler',
        op, oben, links, zellen,
        anweisung,
        hilfe: `Rechne jedes Feld einzeln nach: Zahl links ${op} Zahl oben. Tipp: In einer Reihe verändern sich die Ergebnisse genauso wie die Zahlen oben.`,
        wert: 3,
        schluessel: [op, oben, links],
      };
    },
  });
})();
