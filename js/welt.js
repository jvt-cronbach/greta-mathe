/* =====================================================================
   GRETAS WELT – Figur, Freunde und was mit den Sternen wächst
   ---------------------------------------------------------------------
   Neue Belohnungen: einfach unten in STUFEN ergänzen (ab = Sterne).
   ===================================================================== */
'use strict';

App.welt = (function () {
  const STUFEN = [
    { ab: 0, titel: 'Gretas Garten', neu: 'Greta startet ihre Mathe-Reise.' },
    { ab: 20, titel: 'WuschWusch der Hase', neu: 'WuschWusch der Hase ist jetzt Gretas Freund!' },
    { ab: 50, titel: 'Glitzer-Schleife', neu: 'Greta bekommt eine Glitzer-Schleife für ihren Pferdeschwanz.' },
    { ab: 90, titel: 'Der Baum wächst', neu: 'Der kleine Baum in Gretas Garten ist gewachsen!' },
    { ab: 140, titel: 'BabyAffi', neu: 'BabyAffi der kleine Affe schaukelt jetzt im großen Baum!' },
    { ab: 200, titel: 'Das Baumhaus', neu: 'Ein Baumhaus! Gebaut aus lauter Mathe-Sternen.' },
    { ab: 270, titel: 'Heldinnen-Umhang', neu: 'Greta trägt jetzt einen Mathe-Heldinnen-Umhang!' },
    { ab: 350, titel: 'Lenchen die Bärin', neu: 'Lenchen die Bärin kommt zu Besuch – und bleibt!' },
    { ab: 440, titel: 'Der Regenbogen', neu: 'Ein Regenbogen leuchtet über Gretas Welt!' },
    { ab: 550, titel: 'Die Mathe-Krone', neu: 'Greta trägt jetzt die Mathe-Krone!' },
  ];
  const BLUME_ALLE = 80; // danach: alle 80 Sterne eine neue Blume
  const BLUMEN_POS = [[30, 236], [262, 238], [375, 232], [110, 242], [170, 246], [240, 244], [300, 240], [50, 246], [390, 246], [140, 236], [10, 240], [355, 244]];

  function info(sterne) {
    let idx = 0;
    STUFEN.forEach((s, i) => { if (sterne >= s.ab) idx = i; });
    const letzte = STUFEN[STUFEN.length - 1];
    const blumen = sterne >= letzte.ab ? Math.floor((sterne - letzte.ab) / BLUME_ALLE) : 0;
    let naechste, von;
    if (idx < STUFEN.length - 1) { naechste = STUFEN[idx + 1]; von = STUFEN[idx].ab; }
    else {
      von = letzte.ab + blumen * BLUME_ALLE;
      naechste = { ab: von + BLUME_ALLE, titel: 'Eine neue Blume', neu: 'Eine neue Blume wächst in Gretas Garten!' };
    }
    return { idx, blumen, level: idx + 1 + blumen, naechste, fortschritt: (sterne - von) / (naechste.ab - von), fehlen: naechste.ab - sterne };
  }

  function neu(vorher, nachher) {
    const liste = STUFEN.filter((s) => s.ab > vorher && s.ab <= nachher);
    const b0 = info(vorher).blumen, b1 = info(nachher).blumen;
    for (let i = b0; i < b1; i++) liste.push({ titel: 'Eine neue Blume', neu: 'Eine neue Blume wächst in Gretas Garten!' });
    return liste;
  }

  function merkmale(sterne) {
    const { idx, blumen } = info(sterne);
    return {
      idx, blumen,
      hase: idx >= 1, schleife: idx >= 2,
      baum: idx >= 4 ? 2 : idx >= 3 ? 1 : 0,
      affe: idx >= 4, baumhaus: idx >= 5, umhang: idx >= 6,
      baer: idx >= 7, regenbogen: idx >= 8, krone: idx >= 9,
      groesse: 0.86 + Math.min(idx, 9) * 0.03,
    };
  }

  /* ---------------- Figuren (Füße bei 0,0) ---------------- */
  function greta(m) {
    const haut = '#f9dcc4', haar = '#f5c84c', haarD = '#d9a526';
    return `<g class="greta-anim">
      ${m.umhang ? `<path d="M-14 -82 Q-36 -52 -34 -22 Q0 -14 34 -22 Q36 -52 14 -82Z" fill="#e8434f"/>` : ''}
      <g class="zopf"><path d="M14 -127 C37 -138 52 -117 45 -94 C42 -84 37 -78 31 -73 C35 -90 31 -107 17 -115Z" fill="${haar}" stroke="${haarD}" stroke-width="1.5"/></g>
      ${m.schleife
        ? `<g transform="translate(18 -122)"><path d="M0 0 L-10 -8 L-10 8Z M0 0 L10 -8 L10 8Z" fill="#ff5fa2" stroke="#e03d85" stroke-width="1"/><circle r="3.5" fill="#ff2d87"/><circle cx="-6" cy="-3" r="1" fill="#fff"/><circle cx="6" cy="3" r="1" fill="#fff"/></g>`
        : `<circle cx="18" cy="-122" r="3.5" fill="#ff5fa2"/>`}
      <rect x="-11" y="-36" width="8" height="32" rx="4" fill="${haut}"/>
      <rect x="3" y="-36" width="8" height="32" rx="4" fill="${haut}"/>
      <ellipse cx="-8" cy="-3" rx="8.5" ry="4.5" fill="#e84393"/>
      <ellipse cx="8" cy="-3" rx="8.5" ry="4.5" fill="#e84393"/>
      <path d="M-14 -82 Q0 -88 14 -82 L27 -32 Q0 -25 -27 -32Z" fill="#7c5cff"/>
      <circle cx="-10" cy="-50" r="2.4" fill="#fff" opacity=".7"/><circle cx="8" cy="-60" r="2.4" fill="#fff" opacity=".7"/>
      <circle cx="14" cy="-40" r="2.4" fill="#fff" opacity=".7"/><circle cx="-4" cy="-38" r="2.4" fill="#fff" opacity=".7"/>
      ${m.umhang ? `<path d="M0 -76 l2.6 5.2 5.8.8 -4.2 4 1 5.8 -5.2-2.7 -5.2 2.7 1-5.8 -4.2-4 5.8-.8z" fill="#ffd54a"/>` : ''}
      <path d="M-13 -76 Q-26 -62 -29 -48" stroke="${haut}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="-29" cy="-46" r="4.5" fill="${haut}"/>
      <g class="winkarm"><path d="M13 -76 Q27 -86 33 -100" stroke="${haut}" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="33.5" cy="-102" r="4.5" fill="${haut}"/></g>
      <rect x="-4" y="-88" width="8" height="8" fill="${haut}"/>
      <circle cx="0" cy="-106" r="23" fill="${haut}"/>
      <path d="M-24 -102 C-28 -128 -12 -135 1 -134 C15 -134 28 -127 24 -102 C21 -113 14 -119 5 -119 C0 -126 -10 -123 -13 -118 C-18 -116 -22 -110 -24 -102Z" fill="${haar}" stroke="${haarD}" stroke-width="1.5"/>
      <circle cx="-8" cy="-103" r="3.3" fill="#3a2e2a"/><circle cx="8" cy="-103" r="3.3" fill="#3a2e2a"/>
      <circle cx="-7" cy="-104.3" r="1.1" fill="#fff"/><circle cx="9" cy="-104.3" r="1.1" fill="#fff"/>
      <circle cx="-14" cy="-95" r="4" fill="#ff9aa2" opacity=".6"/><circle cx="14" cy="-95" r="4" fill="#ff9aa2" opacity=".6"/>
      <path d="M-6 -95 Q0 -89 6 -95" stroke="#b5524f" stroke-width="2" stroke-linecap="round" fill="none"/>
      ${m.krone ? `<path d="M-14 -127 L-15 -143 L-7 -135 L0 -147 L7 -135 L15 -143 L14 -127Z" fill="#ffd54a" stroke="#e0a800" stroke-width="1.5"/><circle cx="0" cy="-133" r="2.3" fill="#e8434f"/><circle cx="-8" cy="-131" r="1.6" fill="#4fc3f7"/><circle cx="8" cy="-131" r="1.6" fill="#2ecc71"/>` : ''}
    </g>`;
  }

  function hase() { // WuschWusch: Widderkaninchen mit Schlappohren und Möhren-Pulli
    const fell = '#efe9e4', rand = '#cbbfb6', pulli = '#d8ecff', pulliRand = '#9fc3e6';
    const moehre = (x, y, w) => `<g transform="translate(${x} ${y}) rotate(${w})"><path d="M-2.4 -3.5 L2.4 -3.5 L0 5.5Z" fill="#ff8c1a"/><path d="M-1.4 -3.5 L-2.6 -6.5 M0 -3.5 L0 -7 M1.4 -3.5 L2.6 -6.5" stroke="#3aa655" stroke-width="1.3" stroke-linecap="round"/></g>`;
    return `<g class="hase-anim">
      <circle cx="17" cy="-12" r="6" fill="#fff" stroke="${rand}"/>
      <ellipse cx="0" cy="-20" rx="17" ry="19" fill="${fell}" stroke="${rand}"/>
      <path d="M-14 -33 Q0 -39 14 -33 Q19 -20 16.5 -7 Q0 -2.5 -16.5 -7 Q-19 -20 -14 -33Z" fill="${pulli}" stroke="${pulliRand}" stroke-width="1.2"/>
      <path d="M-16.5 -8.5 Q0 -4 16.5 -8.5" stroke="${pulliRand}" stroke-width="2.4" fill="none"/>
      ${moehre(-7, -23, -18)}${moehre(6, -17, 14)}${moehre(-3, -12, 4)}
      <ellipse cx="-16" cy="-23" rx="4.5" ry="8.5" fill="${pulli}" stroke="${pulliRand}" stroke-width="1.2" transform="rotate(18 -16 -23)"/>
      <ellipse cx="16" cy="-23" rx="4.5" ry="8.5" fill="${pulli}" stroke="${pulliRand}" stroke-width="1.2" transform="rotate(-18 16 -23)"/>
      <circle cx="-18.5" cy="-15.5" r="3.5" fill="#fff" stroke="${rand}"/><circle cx="18.5" cy="-15.5" r="3.5" fill="#fff" stroke="${rand}"/>
      <circle cx="0" cy="-45" r="14.5" fill="${fell}" stroke="${rand}"/>
      <path d="M-7 -32.5 Q0 -29 7 -32.5" stroke="${pulliRand}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="-5" cy="-46" r="2.3" fill="#3a2e2a"/><circle cx="5" cy="-46" r="2.3" fill="#3a2e2a"/>
      <circle cx="-4.3" cy="-46.8" r=".8" fill="#fff"/><circle cx="5.7" cy="-46.8" r=".8" fill="#fff"/>
      <ellipse cx="0" cy="-40.5" rx="2.4" ry="1.8" fill="#ff8fab"/>
      <path d="M-3 -37 Q0 -35 0 -38 Q0 -35 3 -37" stroke="#9c6b6b" stroke-width="1.1" fill="none"/>
      <circle cx="-8" cy="-39" r="2.4" fill="#ffb3c1" opacity=".6"/><circle cx="8" cy="-39" r="2.4" fill="#ffb3c1" opacity=".6"/>
      <g class="ohr-l"><path d="M-7 -57 C-18 -58 -24 -44 -22 -30 C-21 -24 -15 -23 -14 -29 C-13 -40 -10 -50 -4 -55Z" fill="${fell}" stroke="${rand}"/>
        <path d="M-9 -53 C-16 -50 -19 -40 -18.5 -31" stroke="#ffc2cf" stroke-width="2.5" stroke-linecap="round" fill="none"/></g>
      <g class="ohr-r"><path d="M7 -57 C18 -58 24 -44 22 -30 C21 -24 15 -23 14 -29 C13 -40 10 -50 4 -55Z" fill="${fell}" stroke="${rand}"/>
        <path d="M9 -53 C16 -50 19 -40 18.5 -31" stroke="#ffc2cf" stroke-width="2.5" stroke-linecap="round" fill="none"/></g>
      <ellipse cx="0" cy="-57.5" rx="8" ry="3.5" fill="${fell}"/>
      <ellipse cx="-8" cy="-2.5" rx="7.5" ry="4" fill="${fell}" stroke="${rand}"/><ellipse cx="8" cy="-2.5" rx="7.5" ry="4" fill="${fell}" stroke="${rand}"/>
    </g>`;
  }

  function affe() { // BabyAffi im blau-weiß gestreiften Nachthemd; hängt am Ast, Griff bei 0,0
    const fell = '#8a5a3c', hell = '#e9bf95';
    return `<g class="affe-anim">
      <path d="M0 0 Q3 12 0 24" stroke="${fell}" stroke-width="5.5" stroke-linecap="round" fill="none"/>
      <circle cx="0" cy="0" r="4" fill="${fell}"/>
      <path d="M8 66 C30 72 32 46 19 46 C10 46 12 57 19 55" stroke="${fell}" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M-6 72 Q-9 82 -7 88 M6 72 Q9 82 7 88" stroke="${fell}" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M-9 52 Q-20 58 -24 50" stroke="${fell}" stroke-width="5" stroke-linecap="round" fill="none"/>
      <ellipse cx="0" cy="58" rx="12" ry="15" fill="${fell}"/>
      <path d="M-9 45 Q0 42 9 45 L15 80 Q0 84 -15 80Z" fill="url(#streifen)" stroke="#2f5fb3" stroke-width="1"/>
      <g transform="translate(0 46)"><path d="M0 0 L-6 -4 L-6 4Z M0 0 L6 -4 L6 4Z" fill="#e8343f"/><circle r="1.8" fill="#b81f2a"/></g>
      <circle cx="-13" cy="33" r="5.5" fill="${hell}" stroke="${fell}" stroke-width="2"/>
      <circle cx="13" cy="33" r="5.5" fill="${hell}" stroke="${fell}" stroke-width="2"/>
      <circle cx="0" cy="33" r="13" fill="${fell}"/>
      <ellipse cx="0" cy="36.5" rx="9.5" ry="8" fill="${hell}"/>
      <circle cx="-4" cy="33" r="2" fill="#2d211b"/><circle cx="4" cy="33" r="2" fill="#2d211b"/>
      <path d="M-3.5 40 Q0 43 3.5 40" stroke="#6b3f28" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    </g>`;
  }

  function baer() { // Lenchen: rosa Oberteil, blaue Hose
    const fell = '#9b6238', hell = '#e0b287', rosa = '#ff8cc6', rosaD = '#e8649f', blau = '#3b6fd8', blauD = '#2a55ad';
    return `<g class="baer-anim">
      <circle cx="-15" cy="-80" r="8" fill="${fell}"/><circle cx="15" cy="-80" r="8" fill="${fell}"/>
      <circle cx="-15" cy="-80" r="4" fill="${hell}"/><circle cx="15" cy="-80" r="4" fill="${hell}"/>
      <rect x="-19" y="-18" width="15" height="15" rx="5" fill="${blau}"/><rect x="4" y="-18" width="15" height="15" rx="5" fill="${blau}"/>
      <ellipse cx="-12" cy="-3" rx="10" ry="6" fill="${fell}"/><ellipse cx="12" cy="-3" rx="10" ry="6" fill="${fell}"/>
      <ellipse cx="0" cy="-26" rx="26" ry="27" fill="${blau}"/>
      <path d="M0 -20 L0 -6" stroke="${blauD}" stroke-width="2" stroke-linecap="round"/>
      <path d="M-25.4 -20 A26 27 0 1 1 25.4 -20 Q0 -14 -25.4 -20Z" fill="${rosa}"/>
      <path d="M-25.4 -20 Q0 -14 25.4 -20" stroke="${rosaD}" stroke-width="2.4" fill="none"/>
      <path d="M0 -30 C-6 -36 -10 -30 0 -24 C10 -30 6 -36 0 -30Z" fill="#fff" opacity=".9"/>
      <ellipse cx="-24" cy="-34" rx="7" ry="13" fill="${rosa}" stroke="${rosaD}" stroke-width="1.2" transform="rotate(20 -24 -34)"/>
      <ellipse cx="24" cy="-34" rx="7" ry="13" fill="${rosa}" stroke="${rosaD}" stroke-width="1.2" transform="rotate(-20 24 -34)"/>
      <circle cx="-28.4" cy="-22" r="5.5" fill="${fell}"/><circle cx="28.4" cy="-22" r="5.5" fill="${fell}"/>
      <circle cx="0" cy="-64" r="20" fill="${fell}"/>
      <path d="M-11 -47 Q0 -42 11 -47" stroke="${rosaD}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-57" rx="9" ry="7" fill="${hell}"/>
      <ellipse cx="0" cy="-60" rx="4" ry="3" fill="#3a2a20"/>
      <path d="M-3 -54 Q0 -51 3 -54" stroke="#3a2a20" stroke-width="1.4" stroke-linecap="round" fill="none"/>
      <circle cx="-7" cy="-68" r="2.6" fill="#2d211b"/><circle cx="7" cy="-68" r="2.6" fill="#2d211b"/>
      <circle cx="-6.2" cy="-68.8" r=".9" fill="#fff"/><circle cx="7.8" cy="-68.8" r=".9" fill="#fff"/>
    </g>`;
  }

  function baum(m) {
    const stamm = '#8a5a3c', gruen1 = '#4caf50', gruen2 = '#66c25a';
    if (m.baum === 0) {
      return `<rect x="-2" y="-28" width="4" height="28" rx="2" fill="${stamm}"/>
        <ellipse cx="-7" cy="-27" rx="8" ry="4" fill="${gruen2}" transform="rotate(-30 -7 -27)"/>
        <ellipse cx="7" cy="-32" rx="8" ry="4" fill="${gruen1}" transform="rotate(30 7 -32)"/>`;
    }
    if (m.baum === 1) {
      return `<rect x="-6" y="-62" width="12" height="62" rx="4" fill="${stamm}"/>
        <circle cx="-20" cy="-66" r="20" fill="${gruen1}"/><circle cx="20" cy="-68" r="20" fill="${gruen1}"/>
        <circle cx="0" cy="-82" r="28" fill="${gruen2}"/>
        <circle cx="-10" cy="-86" r="3" fill="#e8434f"/><circle cx="12" cy="-74" r="3" fill="#e8434f"/>`;
    }
    return `<path d="M-11 0 L-8 -110 L8 -110 L11 0Z" fill="${stamm}"/>
      <path d="M-6 -78 Q-30 -86 -52 -96" stroke="${stamm}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="-38" cy="-118" r="30" fill="${gruen1}"/><circle cx="36" cy="-120" r="30" fill="${gruen1}"/>
      <circle cx="0" cy="-142" r="44" fill="${gruen2}"/>
      <circle cx="-18" cy="-150" r="3.5" fill="#e8434f"/><circle cx="20" cy="-132" r="3.5" fill="#e8434f"/><circle cx="-40" cy="-118" r="3.5" fill="#e8434f"/><circle cx="42" cy="-116" r="3.5" fill="#e8434f"/>
      ${m.baumhaus ? `
        <rect x="-16" y="-74" width="56" height="6" rx="2" fill="#6d4128"/>
        <rect x="-10" y="-104" width="44" height="30" rx="3" fill="#c98d56" stroke="#8a5a3c" stroke-width="2"/>
        <path d="M-17 -103 L12 -124 L41 -103Z" fill="#e8434f" stroke="#b92f3a" stroke-width="2" stroke-linejoin="round"/>
        <rect x="-2" y="-97" width="12" height="11" rx="2" fill="#fff7c2" stroke="#8a5a3c" stroke-width="1.5"/>
        <rect x="18" y="-96" width="10" height="22" rx="2" fill="#8a5a3c"/>
        <path d="M10 -68 L10 0 M22 -68 L22 0 M10 -54 L22 -54 M10 -40 L22 -40 M10 -26 L22 -26 M10 -12 L22 -12" stroke="#6d4128" stroke-width="2.5"/>
        <path d="M34 -112 L34 -132 L46 -127 L34 -122" fill="#ffd54a" stroke="#6d4128" stroke-width="1.5"/>` : ''}`;
  }

  function blume(x, y, i) {
    const farben = ['#ff5fa2', '#ffd54a', '#7c5cff', '#ff9f43', '#4fc3f7', '#e8434f'];
    const f = farben[i % farben.length];
    return `<g transform="translate(${x} ${y})"><path d="M0 0 L0 -12" stroke="#3f9b3a" stroke-width="2"/>
      ${[0, 72, 144, 216, 288].map((w) => `<ellipse cx="0" cy="-17" rx="3" ry="4.5" fill="${f}" transform="rotate(${w} 0 -13)"/>`).join('')}
      <circle cx="0" cy="-13" r="2.6" fill="#fff3b0"/></g>`;
  }

  function szene(sterne) {
    const m = merkmale(sterne);
    const bogen = ['#ff5f5f', '#ffa24c', '#ffe066', '#6fd672', '#5fb4ff', '#9b7bff'];
    return `<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gretas Welt">
      <defs><linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fdcff"/><stop offset="1" stop-color="#e6f7ff"/></linearGradient><pattern id="streifen" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><rect width="6" height="3" fill="#4a86e8"/></pattern></defs>
      <rect width="400" height="250" fill="url(#himmel)"/>
      <circle cx="52" cy="44" r="22" fill="#ffd54a"/><circle cx="52" cy="44" r="30" fill="#ffd54a" opacity=".25"/>
      <g class="wolke"><ellipse cx="150" cy="40" rx="24" ry="10" fill="#fff"/><ellipse cx="166" cy="34" rx="14" ry="10" fill="#fff"/></g>
      <g class="wolke langsam"><ellipse cx="250" cy="62" rx="20" ry="8" fill="#fff" opacity=".9"/><ellipse cx="262" cy="56" rx="11" ry="8" fill="#fff" opacity=".9"/></g>
      ${m.regenbogen ? bogen.map((c, i) => `<path d="M${-10 + i * 8} 215 A${210 - i * 8} ${175 - i * 8} 0 0 1 ${410 - i * 8} 215" stroke="${c}" stroke-width="8" fill="none" opacity=".55"/>`).join('') : ''}
      <path d="M0 196 Q100 172 200 190 T400 184 V250 H0Z" fill="#9edb87"/>
      <path d="M0 218 Q200 202 400 218 V250 H0Z" fill="#6cc05a"/>
      <g transform="translate(330 214)">${baum(m)}</g>
      ${m.affe ? `<g transform="translate(282 120)">${affe()}</g>` : ''}
      ${BLUMEN_POS.slice(0, m.blumen).map((p, i) => blume(p[0], p[1], i)).join('')}
      ${m.baer ? `<g transform="translate(70 228) scale(.95)">${baer()}</g>` : ''}
      ${m.hase ? `<g transform="translate(140 230)">${hase()}</g>` : ''}
      <g transform="translate(206 232) scale(${m.groesse})">${greta(m)}</g>
    </svg>`;
  }

  function kopf(sterne) {
    const m = merkmale(sterne);
    return `<svg viewBox="-36 -152 90 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${greta(m)}</svg>`;
  }

  return { info, neu, szene, kopf, STUFEN };
})();
