# El Pollo Loco

2D Jump-and-Run-Browser-Spiel: Hilf **Pepe**, durch die Wüste zu laufen, Münzen und Salsa-Flaschen zu sammeln und den Endboss zu besiegen.

## Features

- Side-Scrolling-Level mit Parallax-Hintergrund
- Gegner (kleine & große Hühner) und Endboss
- Sammelbare Münzen und Salsa-Flaschen
- Statusleisten für Leben, Münzen, Flaschen und Endboss
- Tastatur- und Touch-Steuerung (Desktop & Mobil)
- Vollbildmodus und Mute-Funktion
- Startbildschirm, Spielanleitung und Steuerungs-Overlay

## Technologie

- HTML5, CSS3, Vanilla JavaScript (ES6-Klassen)
- HTML5 Canvas für die Spieldarstellung
- Keine Frameworks oder Build-Tools nötig

## Starten

1. Repository klonen oder herunterladen
2. `index.html` im Browser öffnen  
   **Empfohlen:** lokalen Server nutzen (z.?B. Live Server in VS Code/Cursor), damit Audio und Assets zuverlässig laden

```bash
# Optional mit Python
python -m http.server 5500
```

Dann im Browser: `http://localhost:5500`

## Steuerung

### Tastatur

| Taste | Aktion |
| --- | --- |
| ? ? oder A D | Laufen |
| ? oder W | Springen |
| ? oder S | Ducken |
| Leertaste | Flasche im hohen Bogen werfen |
| ? + Leertaste | Flasche am Boden werfen (kleine Gegner) |

### Touch (Handy & Tablet)

| Button | Aktion |
| --- | --- |
| ? ? | Laufen |
| ? | Springen |
| ? | Ducken |
| Flasche | Hoher Wurf |
| ? + Flasche | Wurf von unten |

Auf Mobilgeräten im Querformat spielen.

## Spielziel

1. Laufe durch die Wüste und weiche Gegnern aus oder besiege sie.
2. Sammle Münzen und Salsa-Flaschen.
3. Alle 5 Münzen oder 5 besiegte Gegner gibt es eine Extra-Flasche.
4. Besiege den Endboss mit Salsa-Flaschen.

## Projektstruktur

```
El Pollo Loco/
??? index.html          # Einstieg / Spiel-UI
??? impressum.html      # Impressum
??? style.css           # Styles
??? script.js           # Einstiegspunkt
??? favicon.png
??? img/                # Grafiken & Animationen
??? Audio/              # Soundeffekte & Musik
??? assets/             # Weitere Assets
??? js/
    ??? classes/        # Spielobjekte (Character, World, Enemies, …)
    ??? constants/      # Konstanten (Steuerung, Frames, Audio)
    ??? Templates/      # HTML-Templates (Modals, Screens)
    ??? *.function.js   # Spiel-Logik (Kollision, Bewegung, Audio, …)
```

## Hinweise

- Im Portrait-Modus erscheint ein Hinweis, das Gerät zu drehen.
- Mute-Einstellung wird gespeichert und beim erneuten Öffnen übernommen.

## Lizenz / Credits

Lernprojekt im Rahmen einer Weiterbildung. Grafiken und Sounds stammen aus dem bereitgestellten Asset-Paket des Kurses.
