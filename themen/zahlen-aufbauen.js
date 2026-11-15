/* THEMA: Zahlen aufbauen (Zahlenraum bis 1000, Buch S. 20–22)
   Zahlenkarten, Zahlwörter, größte/kleinste Zahl, Zahlenschloss */
'use strict';
(function () {
  const { zufall, wahl, mischen, feld } = App;
  const HZE = (n) => ({ h: Math.floor(n / 100), z: Math.floor(n / 10) % 10, e: n % 10 });

  /* ---------- Zahlwörter ---------- */
  const EIN = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
  const ZEHN = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  const ZIG = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  function wort(n) {
    if (n === 1000) return 'eintausend';
    const { h } = HZE(n), r = n % 100, z = Math.floor(r / 10), e = r % 10;
    let s = h ? EIN[h] + 'hundert' : '';
    if (r === 0) return s;
    if (r < 10) s += r === 1 ? 'eins' : EIN[r];
    else if (r < 20) s += ZEHN[r - 10];
    else s += (e ? EIN[e] + 'und' : '') + ZIG[z];
    return s;
  }

  // Zahl mit festen Ziffern-Eigenschaften
  const zahl = (ohneNull) => {
    const h = zufall(1, 9), z = ohneNull ? zufall(1, 9) : zufall(0, 9), e = ohneNull ? zufall(1, 9) : zufall(0, 9);
    return 100 * h + 10 * z + e;
  };

  /* ---------- Zahlenkarten ---------- */
  // Karten liegen übereinander → Plusaufgabe aufschreiben (Buch S. 20/2)
  function kartenPlus(mitNull) {
    let n;
    do n = zahl(!mitNull); while (mitNull && n % 10 !== 0 && Math.floor(n / 10) % 10 !== 0);
    const { h, z, e } = HZE(n);
    const karten = [100 * h, 10 * z, e].filter((k) => k);
    const zeile = [];
    karten.forEach((k, i) => { if (i) zeile.push('+'); zeile.push(feld(k)); });
    zeile.push('=', feld(n));
    return {
      art: 'rechnen',
      anweisung: `Welche Zahlenkarten wurden gelegt? Schreib die Plusaufgabe.<br>${App.bild.karten(karten, { zusammen: true })}`,
      zeilen: [zeile],
      hilfe: 'Unter der Einerkarte liegt die Zehnerkarte, darunter die Hunderterkarte. Die Hunderterkarte hat hinten zwei Nullen.',
      schluessel: ['kp', n],
    };
  }

  // Karten liegen nebeneinander (durcheinander) → Zahl legen
  function kartenZahl(mitNull) {
    let n;
    do n = zahl(!mitNull); while (mitNull && n % 10 !== 0 && Math.floor(n / 10) % 10 !== 0);
    const { h, z, e } = HZE(n);
    const karten = mischen([100 * h, 10 * z, e].filter((k) => k));
    return {
      art: 'rechnen',
      anweisung: `Leg die Karten übereinander. Welche Zahl entsteht?<br>${App.bild.karten(karten)}`,
      zeilen: [['Zahl', feld(n)]],
      hilfe: 'Die Hunderterkarte kommt nach unten, dann die Zehner, oben die Einer. Keine Zehnerkarte? Dann bleibt dort die 0 stehen.',
      pruefe: (w) => (w[0] > 1000 ? 'Leg die Karten übereinander, nicht nebeneinander!' : null),
      schluessel: ['kz', n],
    };
  }

  // Zahl zerlegen: 536 = 500 + 30 + 6
  function zerlegen(mitNull) {
    let n;
    do n = zahl(!mitNull); while (mitNull && n % 10 !== 0 && Math.floor(n / 10) % 10 !== 0);
    const { h, z, e } = HZE(n);
    const teile = [100 * h, 10 * z, e].filter((k) => k);
    const zeile = [n, '='];
    teile.forEach((k, i) => { if (i) zeile.push('+'); zeile.push(feld(k)); });
    return {
      art: 'rechnen',
      anweisung: 'Zerlege die Zahl in Hunderter, Zehner und Einer.',
      zeilen: [zeile],
      hilfe: mitNull ? 'Eine 0 an einer Stelle bedeutet: Diese Karte brauchst du nicht.' : 'Die erste Ziffer mit zwei Nullen, die zweite Ziffer mit einer Null, dann die Einer.',
      schluessel: ['zl', n],
    };
  }

  // Durcheinander-Plus: 4 + 600 + 70 = 674
  function plusDurcheinander() {
    const n = zahl(Math.random() < 0.6), { h, z, e } = HZE(n);
    const teile = mischen([100 * h, 10 * z, e].filter((k) => k));
    const zeile = [];
    teile.forEach((k, i) => { if (i) zeile.push('+'); zeile.push(k); });
    zeile.push('=', feld(n));
    return {
      art: 'rechnen', anweisung: 'Rechne.', zeilen: [zeile],
      hilfe: 'Such zuerst die Hunderter, dann die Zehner, dann die Einer.',
      schluessel: ['pd', teile],
    };
  }

  /* ---------- Zahlwörter ---------- */
  function wortZuZahl(schwer) {
    let n;
    if (!schwer) n = zahl(true);
    else n = wahl([
      () => 100 * zufall(1, 9) + zufall(1, 9),           // einhundertdrei
      () => 100 * zufall(1, 9) + zufall(10, 19),         // neunhundertzehn, fünfhundertdreizehn
      () => 100 * zufall(1, 9) + 10 * zufall(2, 9),      // sechshundertzwanzig
      () => 100 * zufall(1, 9),                           // siebenhundert
      () => zahl(false),
    ])();
    return {
      art: 'rechnen',
      anweisung: `Schreib die Zahl mit Ziffern.<br><span class="angabe">${wort(n)}</span>`,
      zeilen: [['Zahl', feld(n)]],
      hilfe: 'Lies langsam: Zuerst kommen die Hunderter. Bei „…und…“ hörst du erst die Einer, dann die Zehner – geschrieben werden aber erst die Zehner!',
      pruefe: (w) => {
        const { h, z, e } = HZE(n);
        if (w[0] === 100 * h + 10 * e + z && z !== e) return 'Zehner und Einer sind vertauscht. Bei „und“ hörst du zuerst die Einer!';
        if (w[0] > 1000) return 'Die Zahl ist dreistellig – sie hat nur drei Ziffern. Wenn es keine Zehner gibt, steht dort eine 0.';
        return null;
      },
      schluessel: ['wz', n],
    };
  }

  // Welches Zahlwort passt?
  function zahlZuWort() {
    const h = zufall(1, 9), e = zufall(1, 9), z = zufall(0, 9);
    const n = 100 * h + 10 * z + e;
    const falsch = [];
    if (z === 0) falsch.push(wort(100 * h + 10 * e), EIN[h] + 'tausend' + (e === 1 ? 'eins' : EIN[e]));
    else if (z !== e) falsch.push(wort(100 * h + 10 * e + z));
    falsch.push(wort(100 * e + 10 * z + h));
    const opts = [{ text: wort(n), richtig: true }].concat([...new Set(falsch)].filter((f) => f !== wort(n)).slice(0, 2).map((t) => ({ text: t })));
    if (opts.length < 3) opts.push({ text: wort(n + 100 > 999 ? n - 100 : n + 100) });
    return {
      art: 'auswahl',
      anweisung: `Wie heißt die Zahl <b>${n}</b>?`,
      optionen: opts,
      hilfe: 'Lies die Zahl laut: zuerst die Hunderter, dann die Einer, dann die Zehner.',
      schluessel: ['zw', n],
    };
  }

  /* ---------- Hohe und niedrige Hausnummer ---------- */
  function hausnummer(mitNull) {
    let d;
    do {
      d = [zufall(1, 9), zufall(1, 9), mitNull ? 0 : zufall(1, 9)];
    } while (new Set(d).size < 3);
    d = mischen(d);
    const sort = d.slice().sort((a, b) => a - b);
    const gross = 100 * sort[2] + 10 * sort[1] + sort[0];
    const kleinOhneNull = sort[0] === 0 ? 100 * sort[1] + sort[2] : 100 * sort[0] + 10 * sort[1] + sort[2];
    const wuerfel = d.map((x) => `<span class="wuerfel">${x}</span>`).join(' ');
    return {
      art: 'rechnen',
      anweisung: `Die hohe und die niedrige Hausnummer: Du hast diese Ziffern gewürfelt.<br>${wuerfel}`,
      zeilen: [['größte Zahl', feld(gross)], ['kleinste Zahl', feld(kleinOhneNull)]],
      hilfe: mitNull
        ? 'Für die größte Zahl: die größte Ziffer nach vorne. Für die kleinste: Die 0 darf nicht vorne stehen – sonst ist die Zahl nicht dreistellig!'
        : 'Für die größte Zahl kommt die größte Ziffer zu den Hundertern. Für die kleinste Zahl die kleinste Ziffer.',
      pruefe: (w) => (mitNull && w[1] !== null && w[1] < 100 ? 'Die Zahl muss dreistellig sein. Die 0 darf nicht vorne stehen!' : null),
      schluessel: ['hn', d],
    };
  }

  // Aus Zahlenkarten die größte/kleinste Zahl legen (Buch S. 20/3)
  function kartenAuswahl() {
    let hs, zs, es;
    do {
      hs = [zufall(1, 9), zufall(1, 9)]; zs = [zufall(1, 9), zufall(1, 9)]; es = [zufall(1, 9), zufall(1, 9)];
    } while (hs[0] === hs[1] || zs[0] === zs[1] || es[0] === es[1]);
    const karten = mischen([hs[0] * 100, hs[1] * 100, zs[0] * 10, zs[1] * 10, es[0], es[1]]);
    const gross = 100 * Math.max(...hs) + 10 * Math.max(...zs) + Math.max(...es);
    const klein = 100 * Math.min(...hs) + 10 * Math.min(...zs) + Math.min(...es);
    return {
      art: 'rechnen',
      anweisung: `Leg dreistellige Zahlen mit diesen Karten. Nimm immer eine Hunderter-, eine Zehner- und eine Einerkarte.<br>${App.bild.karten(karten)}`,
      zeilen: [['größte Zahl', feld(gross)], ['kleinste Zahl', feld(klein)]],
      hilfe: 'Für die größte Zahl nimmst du von jeder Sorte die größere Karte. Für die kleinste die kleinere.',
      wert: 1,
      schluessel: ['ka', karten],
    };
  }

  /* ---------- Zahlenschloss: alle Möglichkeiten ---------- */
  function zahlenschloss() {
    const wer = wahl(['Greta', 'WuschWusch', 'BabyAffi', 'Lenchen']);
    const v = zufall(0, 2);
    let d;
    if (v === 0) { do d = [zufall(1, 9), zufall(1, 9), zufall(1, 9)]; while (new Set(d).size < 3); }
    else if (v === 1) { const a = zufall(1, 9); let b; do b = zufall(1, 9); while (b === a); d = mischen([a, a, b]); }
    else { do d = [zufall(1, 9), zufall(1, 9), 0]; while (new Set(d).size < 3); d = mischen(d); }
    const alle = new Set();
    [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].forEach(([a, b, c]) => {
      if (d[a] !== 0) alle.add(100 * d[a] + 10 * d[b] + d[c]);
    });
    const liste = [...alle].sort((a, b) => a - b);
    const text = v === 1
      ? `Die Ziffern ${d.join(', ')} kommen vor (die ${d.find((x, i) => d.indexOf(x) !== i)} zweimal).`
      : `Die Ziffern ${d.join(', ')} kommen jeweils einmal vor.`;
    return {
      schluessel: ['zs', d.slice().sort()],
      schritte: [
        {
          art: 'folge',
          anweisung: `🔒 ${wer} hat die Zahl für das Zahlenschloss vergessen. ${text} Finde <b>alle</b> dreistelligen Zahlen und schreib sie <b>der Größe nach</b> auf – die kleinste zuerst.`,
          glieder: liste.map((x) => feld(x)),
          hilfe: v === 2
            ? 'Die 0 darf nicht vorne stehen. Fang mit der kleinsten anderen Ziffer vorne an und tausch dann die hinteren beiden Ziffern.'
            : 'Fang mit der kleinsten Ziffer vorne an und tausch die hinteren beiden. Dann kommt die nächstgrößere Ziffer nach vorne.',
          wert: 2,
        },
        {
          art: 'rechnen',
          anweisung: 'Wie viele Möglichkeiten gibt es?',
          zeilen: [['Möglichkeiten', feld(liste.length)]],
          hilfe: 'Zähl die Zahlen, die du gefunden hast.',
        },
      ],
    };
  }

  App.thema({
    id: 'zahlen-aufbauen',
    titel: 'Zahlen aufbauen',
    symbol: '🃏',
    farbe: '#1971c2',
    beschreibung: 'Zahlenkarten, Zahlwörter und das Zahlenschloss',
    stufen: [
      { name: 'Leicht', info: 'Karten legen, zerlegen, Zahlwörter' },
      { name: 'Mittel', info: 'Mit Nullen, größte und kleinste Zahl' },
      { name: 'Schwer', info: 'Hausnummer mit 0 und Zahlenschloss' },
    ],
    anzahl: (stufe) => [10, 9, 8][stufe],
    erzeuge(stufe) {
      if (stufe === 0) return wahl([() => kartenPlus(false), () => kartenZahl(false), () => zerlegen(false), () => wortZuZahl(false)])();
      if (stufe === 1) return wahl([() => kartenPlus(true), () => kartenZahl(true), () => zerlegen(true), plusDurcheinander, () => wortZuZahl(true), () => wortZuZahl(true), () => hausnummer(false), zahlZuWort])();
      return wahl([() => hausnummer(true), kartenAuswahl, zahlenschloss, zahlenschloss, () => wortZuZahl(true), zahlZuWort])();
    },
  });
})();
