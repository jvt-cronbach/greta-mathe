# Gretas Mathe-Welt

Interaktive Mathe-Übungen für die 3. Klasse, als Web-App für das Android-Tablet.

**App öffnen:** https://jvt-cronbach.github.io/greta-mathe/
Auf dem Tablet in Chrome öffnen → Menü ⋮ → „Zum Startbildschirm hinzufügen“ bzw. „App installieren“.

## Aufbau

| Datei | Zweck | Bei neuen Themen ändern? |
|---|---|---|
| `js/engine.js` | Bildschirme, Ziffernblock, Prüfen, Sterne, Speicher | nein |
| `js/typen.js` | Aufgabentypen: `rechnen`, `auswahl`, `tafel` | nur bei ganz neuer Aufgabenform |
| `js/welt.js` | Greta, Tiere, Belohnungsstufen | nein |
| `themen/*.js` | **ein Thema = eine Datei** | ja – neue Datei |
| `index.html` | lädt alles | ja – eine Zeile pro neuem Thema |

Siehe [NEUES-THEMA.md](NEUES-THEMA.md).
