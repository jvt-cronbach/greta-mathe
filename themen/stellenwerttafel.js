/* THEMA: Stellenwerttafel (Zahlenraum bis 1000, Buch S. 18–19 und 21) */
'use strict';
(function () {
  const { zufall, wahl, feld } = App;
  const WER = ['WuschWusch', 'BabyAffi', 'Lenchen'];
  const NAME = { h: 'Hunderter', z: 'Zehner', e: 'Einer' };
  const HZE = (n) => ({ h: Math.floor(n / 100), z: Math.floor(n / 10) % 10, e: n % 10 });
  const ZAEHLEN = 'Zähle zuerst die Hunderterplatten, dann die Zehnerstangen, dann die Einerwürfel. Fehlt etwas? Dann schreibst du eine 0.';
  const NULL_TIPP = 'Wenn es keine Zehner (oder keine Einer) gibt, steht an dieser Stelle eine 0.';

  /* ---------- Leicht ---------- */
  // Mengenbild → Stellenwerttafel und Zahl
  function mengenbild(mitNull) {
    const h = zufall(1, 9);
    let z = zufall(1, 9), e = zufall(1, 9);
    if (mitNull) { if (Math.random() < 0.5) z = 0; else e = 0; }
    const n = 100 * h + 10 * z + e;
    return {
      art: 'stellentafel',
      anweisung: 'Wie heißt die Zahl? Trag sie in die Stellenwerttafel ein.',
      oben: App.bild.menge({ h, z, e }),
      reihen: [[feld(h), feld(z), feld(e), feld(n)]],
      hilfe: ZAEHLEN,
      schluessel: ['mb', n],
    };
  }

  // Zahl → Stellenwerttafel
  function zahlEintragen() {
    const n = zufall(101, 999), { h, z, e } = HZE(n);
    return {
      art: 'stellentafel',
      anweisung: `Trag die Zahl <b>${n}</b> in die Stellenwerttafel ein.`,
      reihen: [[feld(h), feld(z), feld(e), n]],
      hilfe: 'Die erste Ziffer sind die Hunderter, die zweite die Zehner, die letzte die Einer.',
      schluessel: ['ein', n],
    };
  }

  // Plättchen in der Tafel → Zahl
  function plaettchen() {
    const h = zufall(1, 9), z = zufall(0, 9), e = zufall(0, 9), n = 100 * h + 10 * z + e;
    return {
      art: 'stellentafel',
      anweisung: 'Wie heißt die Zahl?',
      reihen: [[{ punkte: h }, { punkte: z }, { punkte: e }, feld(n)]],
      hilfe: 'Zähl die Plättchen in jeder Spalte. Ein leeres Feld bedeutet 0.',
      pruefe: (w) => (w[0] === h + z + e ? 'Du hast alle Plättchen zusammengezählt. Jede Spalte ist eine eigene Ziffer!' : null),
      schluessel: ['pl', n],
    };
  }

  /* ---------- Mittel ---------- */
  // „3 E 1 H 8 Z“ → Tafel und Zahl (Reihenfolge durcheinander, manchmal fehlt eine Stelle)
  function durcheinander() {
    const h = zufall(1, 9), z = Math.random() < 0.25 ? 0 : zufall(1, 9), e = Math.random() < 0.25 && z ? 0 : zufall(1, 9);
    const n = 100 * h + 10 * z + e;
    const teile = [];
    if (h) teile.push(`${h} H`);
    if (z) teile.push(`${z} Z`);
    if (e) teile.push(`${e} E`);
    const text = (Math.random() < 0.7 ? App.mischen(teile) : teile).join('</span><span class="angabe">');
    return {
      art: 'stellentafel',
      anweisung: `Trag in die Stellenwerttafel ein. Wie heißt die Zahl?<br><span class="angabe">${text}</span>`,
      reihen: [[feld(h), feld(z), feld(e), feld(n)]],
      hilfe: 'H heißt Hunderter, Z heißt Zehner, E heißt Einer. Schau genau, welcher Buchstabe hinter der Zahl steht! ' + NULL_TIPP,
      schluessel: ['dd', n],
    };
  }

  // Fehler erklären (wie Julius im Buch): Es fehlt eine Stelle
  function fehlerErklaeren() {
    const wer = wahl(WER), h = zufall(2, 9), keineZehner = Math.random() < 0.5;
    const z = keineZehner ? 0 : zufall(1, 9), e = keineZehner ? zufall(1, 9) : 0;
    const n = 100 * h + 10 * z + e;
    const falsch = keineZehner ? 10 * h + e : 10 * h + z;
    const anders = keineZehner ? 100 * h + 10 * e : 100 * h + z;
    const fehlt = keineZehner ? 'Zehner' : 'Einer';
    return {
      art: 'auswahl',
      anweisung: `<b>${wer}</b> hat diese Zahl gelegt und schreibt <b>${falsch}</b>.`,
      frage: `${App.bild.menge({ h, z, e })}<br>Wie heißt die Zahl richtig?`,
      optionen: [
        { text: `${n}, denn es gibt keine ${fehlt}. Dort steht eine 0.`, richtig: true },
        { text: `${falsch} stimmt.`, meldung: `Zähl die großen Platten: Das sind ${h} Hunderter! Die Zahl muss dreistellig sein.` },
        { text: `${anders}`, meldung: `Schau genau: Was fehlt – Zehner oder Einer?` },
      ],
      hilfe: NULL_TIPP,
      schluessel: ['fe', n],
    };
  }

  // Plättchen dazulegen oder wegnehmen
  function plaettchenAendern(direkt) {
    for (;;) {
      const h = zufall(1, 8), z = zufall(0, 8), e = zufall(0, 8), n = 100 * h + 10 * z + e;
      const st = wahl(['h', 'z', 'e']), dazu = Math.random() < 0.6;
      const wert = { h: 100, z: 10, e: 1 }[st], anz = HZE(n)[st];
      if (!dazu && anz === 0) continue;
      if (st === 'h' && !dazu && h === 1) continue;
      const neu = n + (dazu ? wert : -wert);
      const satz = dazu ? `Leg <b>ein Plättchen</b> bei den <b>${NAME[st]}n</b> dazu.` : `Nimm <b>ein Plättchen</b> bei den <b>${NAME[st]}n</b> weg.`;
      const hilfe = `Ein Plättchen bei den ${NAME[st]}n ist ${wert} ${dazu ? 'mehr' : 'weniger'}. Nur diese Ziffer ändert sich.`;
      const pruefe = (w) => {
        const x = w[w.length - 1];
        if (x === n + (dazu ? -wert : wert)) return dazu ? 'Dazulegen heißt: Die Zahl wird größer!' : 'Wegnehmen heißt: Die Zahl wird kleiner!';
        if (x !== neu && x !== null && Math.abs(x - n) in { 1: 1, 10: 1, 100: 1 }) return `Schau nochmal, in welcher Spalte du das Plättchen ${dazu ? 'dazulegst' : 'wegnimmst'}.`;
        return null;
      };
      const tafel = [{ punkte: h }, { punkte: z }, { punkte: e }];
      if (direkt) {
        const d = HZE(neu);
        return {
          art: 'stellentafel',
          anweisung: `${satz} Trag die neue Zahl in die untere Reihe ein.`,
          reihen: [tafel.concat([n]), [feld(d.h), feld(d.z), feld(d.e), feld(neu)]],
          hilfe, pruefe,
          schluessel: ['pa', n, st, dazu],
        };
      }
      return {
        schluessel: ['pa', n, st, dazu],
        schritte: [
          { art: 'stellentafel', anweisung: 'Wie heißt die Zahl?', reihen: [tafel.concat([feld(n)])], hilfe: 'Zähl die Plättchen in jeder Spalte.' },
          { art: 'rechnen', anweisung: `${satz} Welche Zahl entsteht?`, zeilen: [['neue Zahl', feld(neu)]], hilfe, pruefe },
        ],
      };
    }
  }

  // 1 Tausender = 10 Hunderter = 100 Zehner = 1000 Einer
  function tausender() {
    const v = wahl([
      { anweisung: 'Wie heißt die Zahl?', oben: App.bild.menge({ h: 10 }), zeilen: [['Zahl', feld(1000)]], hilfe: '10 Hunderter sind 1 Tausender. Das ist 1000.' },
      { anweisung: 'Ergänze.', zeilen: [[{ text: '1 Tausender' }, '=', feld(10), 'Hunderter'], ['', '=', feld(100), 'Zehner']], hilfe: '1 Hunderter sind 10 Zehner. Also sind 10 Hunderter 100 Zehner.' },
      { anweisung: 'Wie heißt die Zahl?', oben: App.bild.menge({ t: 1 }), zeilen: [['Zahl', feld(1000)]], hilfe: 'Der große Würfel ist 1 Tausender. Das ist 1000.' },
    ]);
    return { art: 'rechnen', anweisung: (v.oben ? v.oben + '<br>' : '') + v.anweisung, zeilen: v.zeilen, hilfe: v.hilfe, schluessel: ['t', v.anweisung, v.zeilen.length] };
  }

  /* ---------- Schwer ---------- */
  // Bündeln: „1 H 26 Z 4 E“
  function buendeln() {
    for (;;) {
      const art = zufall(0, 3);
      let h, z, e;
      if (art === 0) { h = zufall(1, 6); z = zufall(10, 35); e = zufall(0, 9); }
      else if (art === 1) { h = zufall(1, 8); z = zufall(0, 9); e = zufall(10, 49); }
      else if (art === 2) { h = 0; z = zufall(10, 69); e = zufall(10, 39); }
      else { h = zufall(1, 7); z = zufall(10, 25); e = zufall(10, 25); }
      const n = 100 * h + 10 * z + e;
      if (n > 1000) continue;
      const teile = [];
      if (h) teile.push(`${h} H`);
      teile.push(`${z} Z`, `${e} E`);
      const gross = z >= 10 ? `${z} Z sind ${Math.floor(z / 10)} H und ${z % 10} Z.` : `${e} E sind ${Math.floor(e / 10)} Z und ${e % 10} E.`;
      return {
        art: 'rechnen',
        anweisung: 'Bündle und schreib die Zahl.<br><small>Immer 10 Einer sind 1 Zehner, 10 Zehner sind 1 Hunderter.</small>',
        zeilen: [[{ text: teile.join('&nbsp;&nbsp;') }, '=', feld(n)]],
        hilfe: `${gross} Rechne alles zusammen: ${teile.map((t) => t.replace(' H', ' · 100').replace(' Z', ' · 10').replace(' E', '')).join(' + ')}.`,
        pruefe: (w) => (String(w[0]) === `${h || ''}${z}${e}` ? 'Achtung: Mehr als 9 an einer Stelle geht nicht – du musst bündeln!' : null),
        schluessel: ['bu', h, z, e],
      };
    }
  }

  // Wie viele Zehner (Einer, Hunderter) insgesamt?
  function insgesamt() {
    const v = zufall(0, 2);
    if (v === 0) {
      const n = zufall(11, 99) * 10;
      return { art: 'rechnen', anweisung: `Wie viele <b>Zehner</b> hat die Zahl <b>${n}</b> insgesamt?`, zeilen: [[n, '=', feld(n / 10), 'Zehner']], hilfe: `Jeder Hunderter sind 10 Zehner. ${Math.floor(n / 100)} Hunderter sind ${Math.floor(n / 100) * 10} Zehner – und dann kommen noch die anderen Zehner dazu.`, pruefe: (w) => (w[0] === (n / 10) % 10 ? 'Das sind nur die Zehner in der Zehnerspalte. Die Hunderter bestehen auch aus Zehnern!' : null), schluessel: ['iz', n] };
    }
    if (v === 1) {
      const z = zufall(12, 95);
      return { art: 'rechnen', anweisung: `<b>${z} Zehner</b> – welche Zahl ist das?`, zeilen: [[{ text: `${z} Z` }, '=', feld(10 * z)]], hilfe: `10 Zehner sind 100. ${z} Zehner sind ${z} · 10.`, schluessel: ['zz', z] };
    }
    const h = zufall(2, 9);
    return { art: 'rechnen', anweisung: `Wie viele <b>Zehner</b> sind <b>${h} Hunderter</b>?`, zeilen: [[{ text: `${h} H` }, '=', feld(10 * h), 'Zehner']], hilfe: '1 Hunderter sind 10 Zehner.', schluessel: ['hz', h] };
  }

  // Plättchen-Knobeleien (Buch S. 21)
  function knobeln() {
    const v = zufall(0, 2);
    if (v === 0) {
      const k = zufall(3, 8);
      return {
        art: 'rechnen',
        anweisung: `Du hast <b>${k} Plättchen</b> für die Stellenwerttafel. Welche ist die <b>größte</b> Zahl, die du legen kannst?`,
        zeilen: [['größte Zahl', feld(100 * k)]],
        hilfe: 'Leg die Plättchen dorthin, wo jedes am meisten wert ist.',
        wert: 2, schluessel: ['kg', k],
      };
    }
    if (v === 1) {
      const k = zufall(3, 9);
      return {
        art: 'rechnen',
        anweisung: `Du hast <b>${k} Plättchen</b>. Welche ist die <b>kleinste dreistellige</b> Zahl, die du legen kannst?`,
        zeilen: [['kleinste Zahl', feld(100 + k - 1)]],
        hilfe: 'Dreistellig heißt: Mindestens ein Plättchen muss bei den Hundertern liegen. Die anderen legst du dorthin, wo sie am wenigsten wert sind.',
        pruefe: (w) => (w[0] === k ? 'Diese Zahl ist nicht dreistellig. Ein Plättchen muss bei den Hundertern liegen!' : null),
        wert: 2, schluessel: ['kk', k],
      };
    }
    const h = wahl([1, 2]);
    return {
      art: 'stellentafel',
      anweisung: `Lenchen hat <b>${7 * h} Plättchen</b> gelegt. Es sind doppelt so viele Einer wie Zehner und doppelt so viele Zehner wie Hunderter. Welche Zahl ist es?`,
      reihen: [[feld(h), feld(2 * h), feld(4 * h), feld(100 * h + 20 * h + 4 * h)]],
      hilfe: `Probier es aus: Mit 1 Hunderter wären es 2 Zehner und 4 Einer – zusammen 7 Plättchen.${h === 2 ? ' Reicht das?' : ''}`,
      wert: 2, schluessel: ['kd', h],
    };
  }

  App.thema({
    id: 'stellenwerttafel',
    titel: 'Stellenwerttafel',
    symbol: '🧱',
    farbe: '#e8590c',
    beschreibung: 'Hunderter, Zehner, Einer – wie heißt die Zahl?',
    stufen: [
      { name: 'Leicht', info: 'Bilder und Plättchen in die Tafel' },
      { name: 'Mittel', info: 'Durcheinander, Nullen und 1 Tausender' },
      { name: 'Schwer', info: 'Bündeln und Plättchen-Knobeleien' },
    ],
    anzahl: (stufe) => [10, 8, 8][stufe],
    erzeuge(stufe) {
      if (stufe === 0) return wahl([() => mengenbild(false), () => mengenbild(false), zahlEintragen, plaettchen])();
      if (stufe === 1) return wahl([() => mengenbild(true), durcheinander, durcheinander, fehlerErklaeren, () => plaettchenAendern(false), tausender])();
      return wahl([buendeln, buendeln, insgesamt, knobeln, () => plaettchenAendern(true)])();
    },
  });

})();
