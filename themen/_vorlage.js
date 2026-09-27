/* =====================================================================
   VORLAGE FÜR EIN NEUES THEMA  (wird NICHT geladen – nur zum Kopieren)
   ---------------------------------------------------------------------
   1. Datei kopieren, z. B. themen/schriftliche-addition.js
   2. In index.html eine Zeile ergänzen:
        <script src="themen/schriftliche-addition.js"></script>
   Fertig. Engine, Figur und Fortschritt funktionieren automatisch.

   Verfügbare Aufgabentypen (js/typen.js):
     rechnen  – zeilen: [[12, '+', 7, '=', App.feld(19)]]
     auswahl  – optionen: [{text:'richtig', richtig:true}, {text:'falsch'}]
     tafel    – modus 'fehler' oder 'ausfuellen' (siehe typen.js)
   Eine Aufgabe ist entweder EIN Schritt ({art:...}) oder
   mehrere Schritte nacheinander ({schritte:[{...},{...}]}).

   Optionale Felder pro Schritt:
     anweisung  – Text über der Aufgabe (HTML erlaubt)
     hilfe      – Tipp (Tipp-Knopf und nach 2 Fehlversuchen)
     wert       – Gewicht für Sterne (Standard 1 → 2 ⭐ beim 1. Versuch)
     pruefe(w)  – eigene Hinweise bei Fehlern; w = Werte aller Felder,
                  gibt einen Text zurück oder null
   ===================================================================== */
'use strict';
(function () {
  const { zufall, wahl, feld } = App;

  App.thema({
    id: 'mein-thema',              // eindeutig, ohne Leerzeichen
    titel: 'Mein Thema',
    symbol: '✨',
    farbe: '#c04fd8',
    beschreibung: 'Kurzer Satz für die Kachel',
    stufen: [
      { name: 'Leicht', info: '…' },
      { name: 'Mittel', info: '…' },
      { name: 'Schwer', info: '…' },
    ],
    anzahl: 8,                     // Aufgaben pro Runde (oder (stufe) => …)
    erzeuge(stufe) {
      const a = zufall(10, 50), b = zufall(1, 9);
      return {
        art: 'rechnen',
        anweisung: 'Rechne.',
        zeilen: [[a, '+', b, '=', feld(a + b)]],
        hilfe: 'Erst bis zum nächsten Zehner, dann weiter.',
        schluessel: [a, b],        // verhindert doppelte Aufgaben in einer Runde
      };
    },
  });
})();
