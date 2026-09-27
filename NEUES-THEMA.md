# Ein neues Thema hinzufügen

## Für Joost (so bittest du Claude um ein neues Thema)
Einfach schreiben, z. B.:
> „Neues Thema: Schriftliche Addition bis 1000. Leicht ohne Übertrag, Mittel mit einem Übertrag, Schwer mit zwei.“

Hilfreich, aber optional: Beispielaufgabe aus dem Schulheft (Foto), Zahlenraum, typische Fehler von Greta.

## Für Claude (technisch)
1. `themen/_vorlage.js` nach `themen/<id>.js` kopieren und `erzeuge(stufe)` schreiben.
2. In `index.html` unter „THEMEN“ eine `<script>`-Zeile ergänzen.
3. Engine, Welt und Service Worker **nicht** anfassen (der Service Worker liest die Dateien automatisch aus `index.html`).
4. Nur wenn eine wirklich neue Aufgabenform nötig ist (z. B. Zahlenstrahl, Zuordnen): neuen Typ in `js/typen.js` mit `App.typ(name, { baue(s, box, api) { … return { pruefe, loesung } } })`.
5. Testen: lokaler Server + Playwright, Tablet-Größen 1280×800 und 800×1280. `App._akt()` gibt den aktuellen Schritt (mit `felder[].loesung`) für automatische Tests.
6. Commit + Push auf `main` → GitHub Pages ist in ca. 1 Minute aktualisiert.

### Aufgabenformat
```js
// ein Schritt
{ art:'rechnen', anweisung:'Teile.', zeilen:[[47, ':', 6, '=', App.feld(7), 'Rest', App.feld(5, {leerIst0:true})]],
  hilfe:'…', wert:1, pruefe:(w)=> w[1] >= 6 ? 'Der Rest muss kleiner als 6 sein!' : null, schluessel:[47,6] }

// mehrere Schritte nacheinander
{ schluessel:[…], schritte:[ {art:'rechnen', …}, {art:'auswahl', optionen:[{text:'…', richtig:true}, {text:'…'}]} ] }

// Rechentafel
{ art:'tafel', modus:'fehler', op:'+', oben:[10,20], links:[5,7], zellen:[[{wert:15,richtig:15},{wert:26,richtig:25}], …] }
{ art:'tafel', modus:'ausfuellen', …, zellen:[[{wert:15},{loesung:25}], …] }
```

### Sterne
Pro Schritt `2 × wert` beim 1. Versuch, `1 × wert` nach Korrektur, 0 nach 3 Fehlversuchen (dann Lösung). Eine Runde sollte etwa 20–24 ⭐ bringen. Belohnungsstufen stehen in `js/welt.js` (`STUFEN`).
