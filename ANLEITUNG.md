# Anleitung zur Bearbeitung der Webseite (für Alke & Florian)

Diese Webseite ist statisch aufgebaut. Das bedeutet, dass die Inhalte direkt in den Dateien gespeichert sind. Um Änderungen vorzunehmen, müssen diese Dateien bearbeitet werden.

## Dateien Übersicht

Jede Seite der Homepage entspricht einer Datei:

- **Startseite**: `index.html`
- **Kontakt & Anfahrt**: `kontakt.html`
- **Angebot**: `angebot.html`
- **Galerie**: `galerie.html`
- **Expertise & Team**: `expertise.html`
- **Aktuelles**: `aktuelles.html`
- **Impressum**: `impressum.html`

## Texte ändern

1. Öffnen Sie die entsprechende `.html` Datei (z.B. mit einem Texteditor wie Notepad, TextEdit oder einem Code-Editor wie VS Code).
2. Suchen Sie den Text, der geändert werden soll.
3. Ändern Sie den Text vorsichtig. Achten Sie darauf, keine Klammern `<...>` oder andere Code-Elemente zu löschen.
4. Speichern Sie die Datei.

## Bilder ändern

Die Bilder befinden sich im Ordner `/images`.

Um ein Bild auszutauschen:
1. Benennen Sie das neue Bild exakt gleich wie das alte Bild (z.B. `foto1.jpg`).
2. Ersetzen Sie das alte Bild im Ordner `/images` durch das neue.
3. Das Bild wird nun automatisch auf der Webseite aktualisiert.

*Wichtig*: Achten Sie darauf, dass die Bilder nicht zu gross sind (idealerweise unter 500KB), damit die Seite schnell lädt.

## Bilder hinzufügen (Galerie)

Dies erfordert etwas mehr Arbeit im Code (`galerie.html`).
Suchen Sie den Block `<div class="gallery-masonry" ...>`.
Dort finden Sie Einträge wie:

```html
<div class="gallery-item"><img src="/images/neues-foto.jpg" alt="Beschreibung"></div>
```

Kopieren Sie eine solche Zeile und fügen Sie sie an der gewünschten Stelle ein. Passen Sie den Dateinamen (`src`) und die Beschreibung (`alt`) an.
