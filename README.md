# Gretas Mathe-Welt

Interaktive Mathe-Übungen für die 3. Klasse, als Web-App für das Android-Tablet.

**App öffnen:** https://jvt-cronbach.github.io/greta-mathe/
Auf dem Tablet in Chrome öffnen → Menü ⋮ → „Zum Startbildschirm hinzufügen“ bzw. „App installieren“.

## Aufbau

| Datei | Zweck | Bei neuen Themen ändern? |
|---|---|---|
| `js/engine.js` | Bildschirme, Ziffernblock, Prüfen, Sterne, Speicher | nein |
| `js/typen.js` | Aufgabentypen: `rechnen`, `auswahl`, `tafel`, `mauer`, `kette` | nur bei ganz neuer Aufgabenform |
| `js/welt.js` | Greta, WuschWusch (Hase), BabyAffi (Affe), Lenchen (Bärin), Belohnungsstufen | nein |
| `themen/*.js` | **ein Thema = eine Datei** | ja – neue Datei |
| `index.html` | lädt alles | ja – eine Zeile pro neuem Thema |

Siehe [NEUES-THEMA.md](NEUES-THEMA.md).

## Sicherung

Der Fortschritt (Sterne und Statistik pro Thema) liegt im Browser-Speicher des Tablets. Unter „Für Eltern“ gibt es dafür:

- **Sicherung teilen:** gibt den Stand als kleine Textdatei (`mathe-welt-sicherung-JJJJ-MM-TT.txt`) über das Teilen-Menü weiter, z. B. per Mail oder in eine Cloud. Ohne Teilen-Menü wird die Datei heruntergeladen.
- **Wiederherstellen:** liest eine solche Datei wieder ein, auch auf einem anderen Gerät. Vor dem Ersetzen werden beide Sternstände angezeigt.
- **Sterne von Hand setzen:** Notlösung ohne Sicherung, geschützt durch eine Rechenaufgabe für Eltern.

Zusätzlich bittet die App den Browser beim Start, den Speicher nicht von selbst aufzuräumen (`navigator.storage.persist()`). Ob das gewährt wurde, steht im Elternbereich.
