/* THEMA: Division mit und ohne Rest */
'use strict';
(function () {
  const { zufall, wahl, feld } = App;

  const GESCHICHTEN = [
    (a, d) => `Greta hat ${a} Karotten. Sie verteilt sie gerecht an ${d} Hasen. Wie viele Karotten bekommt jeder Hase? Wie viele bleiben übrig?`,
    (a, d) => `BabyAffi hat ${a} Bananen. Er legt immer ${d} Bananen in einen Korb. Wie viele Körbe werden voll? Wie viele Bananen bleiben übrig?`,
    (a, d) => `Lenchen die Bärin hat ${a} Gläser Honig. In jedes Regal passen ${d} Gläser. Wie viele Regale werden voll? Wie viele Gläser bleiben übrig?`,
    (a, d) => `${a} Kinder fahren zum Reiterhof. In jedes Auto passen ${d} Kinder. Wie viele Autos sind ganz voll? Wie viele Kinder bleiben übrig?`,
    (a, d) => `Greta hat ${a} Sticker. Sie klebt immer ${d} Sticker auf eine Seite. Wie viele Seiten werden voll? Wie viele Sticker bleiben übrig?`,
    (a, d) => `${a} Äpfel werden in Tüten verpackt. In jede Tüte kommen ${d} Äpfel. Wie viele Tüten werden voll? Wie viele Äpfel bleiben übrig?`,
  ];

  function mitRest(dMax) {
    const d = zufall(2, dMax), q = zufall(1, 10);
    const r = Math.random() < 0.25 ? 0 : zufall(1, d - 1);
    return { d, q, r, a: d * q + r };
  }

  function restPruefung(a, d, idxQ, idxR) {
    return (w) => {
      const q = w[idxQ], r = w[idxR];
      if (q != null && q * d > a) return `${q} · ${d} = ${q * d} – das ist mehr als ${a}. Nimm eine kleinere Zahl.`;
      if (r != null && r >= d) return `Achtung: Der Rest muss kleiner als ${d} sein! Sonst passt die ${d} noch einmal hinein.`;
      return null;
    };
  }

  App.thema({
    id: 'division-rest',
    titel: 'Teilen mit Rest',
    symbol: '➗',
    farbe: '#3d7bf0',
    beschreibung: 'Geteilt-Aufgaben mit und ohne Rest',
    stufen: [
      { name: 'Leicht', info: 'Ohne Rest – das Einmaleins rückwärts' },
      { name: 'Mittel', info: 'Mit und ohne Rest' },
      { name: 'Schwer', info: 'Sachaufgaben und Zehnerzahlen' },
    ],
    anzahl: (stufe) => (stufe === 2 ? 6 : 10),
    erzeuge(stufe) {
      if (stufe === 0) {
        const d = zufall(2, 10), q = zufall(2, 10), a = d * q;
        return {
          art: 'rechnen',
          anweisung: 'Teile.',
          zeilen: [[a, ':', d, '=', feld(q)]],
          hilfe: `Denk an die ${d}er-Reihe: Welche Zahl mal ${d} ergibt ${a}?`,
          schluessel: [a, d],
        };
      }

      const art = stufe === 1 ? 'rest' : wahl(['sach', 'sach', 'zehner', 'rest']);

      if (art === 'rest') {
        const { a, d, q, r } = mitRest(stufe === 1 ? 9 : 10);
        return {
          art: 'rechnen',
          anweisung: 'Teile. Wenn nichts übrig bleibt, ist der Rest 0.',
          zeilen: [[a, ':', d, '=', feld(q), 'Rest', feld(r, { leerIst0: true })]],
          hilfe: `Suche in der ${d}er-Reihe die größte Zahl, die nicht größer als ${a} ist. Wie weit ist es von dort bis ${a}? Das ist der Rest.`,
          pruefe: restPruefung(a, d, 0, 1),
          wert: stufe === 2 ? 2 : 1,
          schluessel: [a, d],
        };
      }

      if (art === 'zehner') {
        const d = zufall(2, 9), q = zufall(2, 9), a = d * q * 10;
        return {
          art: 'rechnen',
          anweisung: 'Teile. Tipp: Denk an die kleine Aufgabe!',
          zeilen: [[a, ':', d, '=', feld(q * 10)]],
          hilfe: `Rechne zuerst die kleine Aufgabe: ${a / 10} : ${d}. Das Ergebnis ist dann 10-mal so groß.`,
          wert: 2,
          schluessel: [a, d],
        };
      }

      // Sachaufgabe: Rechnung selbst aufschreiben
      const { a, d, q, r } = mitRest(9);
      const geschichte = wahl(GESCHICHTEN)(a, d);
      return {
        art: 'rechnen',
        anweisung: `${geschichte}<br><small>Schreib die Rechnung auf und rechne aus.</small>`,
        zeilen: [[feld(a), ':', feld(d), '=', feld(q), 'Rest', feld(r, { leerIst0: true })]],
        hilfe: 'Zuerst kommt die Zahl, die verteilt wird. Dann die Zahl, durch die geteilt wird. Welche Zahl aus der Reihe passt am besten?',
        pruefe: (w) => {
          if (w[0] === d && w[1] === a) return 'Achtung: Zuerst kommt die Zahl, die verteilt wird – die große Zahl!';
          return restPruefung(a, d, 2, 3)(w);
        },
        wert: 2,
        schluessel: [a, d, 's'],
      };
    },
  });
})();
