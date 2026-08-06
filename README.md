# pascalsander.ch — Website

Statische Website. Kein Server, kein Build-Zwang, keine laufenden Kosten. Hosting gratis über GitHub Pages oder Cloudflare Pages.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: Index-Navigation, Manifest, Kontaktformular |
| `modeling.html` | My Modeling Journey (9 Kapitel + Galerie) |
| `entrepreneurship.html` | Entrepreneurship and education |
| `health.html` | Sports, nutrition and health |
| `consulting.html` | Consulting & my dream + FAQ |
| `impressum.html`, `datenschutz.html` | Rechtstexte (enthalten [TODO]-Stellen) |
| `css/styles.css` | Fertig kompiliertes Stylesheet. Nicht von Hand editieren |
| `css/input.css` | Quelle des Stylesheets (Design-Tokens). Nur ändern, wenn du das Design anpassen willst |
| `js/main.js` | Uhr, Hover-Chip, Accordion, Formular. Läuft ohne Abhängigkeiten |
| `assets/` | Alle Bilder |
| `ASSETS.md` | Liste aller Bild-Slots, die noch gefüllt werden müssen |

## 1. Veröffentlichen (GitHub Pages, komplett im Browser)

1. Konto auf github.com erstellen (falls nicht vorhanden).
2. Neues Repository anlegen, Name z. B. `website`, Sichtbarkeit Public.
3. "uploading an existing file" anklicken und ALLE Dateien und Ordner aus diesem Projekt per Drag-and-drop hochladen (die Ordnerstruktur `css/`, `js/`, `assets/` muss erhalten bleiben).
4. Commit.
5. Repository → Settings → Pages → Source: "Deploy from a branch" → Branch `main`, Ordner `/ (root)` → Save.
6. Nach 1 bis 2 Minuten ist die Site unter `https://DEINNAME.github.io/website/` erreichbar.

Alternative mit gleichem Resultat: pages.cloudflare.com → "Upload assets" → Ordner hochladen.

## 2. Eigene Domain pascalsander.ch verbinden

1. Domain kaufen, z. B. bei Infomaniak oder Hostpoint (ca. CHF 10–15/Jahr). Das ist der einzige Kostenpunkt.
2. GitHub: Repository → Settings → Pages → Custom domain → `pascalsander.ch` eintragen.
3. Beim Domain-Anbieter im DNS setzen:
   - `A`-Records für `pascalsander.ch` auf: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `CNAME` für `www` auf `DEINNAME.github.io`
4. Zurück in GitHub Pages "Enforce HTTPS" aktivieren, sobald verfügbar (kann bis 24 h dauern).

## 3. Kontaktformular aktivieren (einmalig, 2 Minuten)

Das Formular schickt Anfragen per E-Mail an dich, über den Gratisdienst Web3Forms (250 Nachrichten/Monat, kein Konto nötig).

1. https://web3forms.com öffnen, `pascal.sander@bluewin.ch` eingeben.
2. Den Access Key aus der Bestätigungsmail kopieren.
3. In `index.html` die Zeile mit `YOUR_WEB3FORMS_ACCESS_KEY` suchen und den Key einsetzen.

Bis dahin zeigt das Formular beim Absenden eine Fehlermeldung mit deiner E-Mail-Adresse als Ausweg.

## 4. Texte ändern

Direkt auf github.com: Datei anklicken → Stift-Symbol → Text ändern → "Commit changes". Die Site aktualisiert sich automatisch nach etwa einer Minute. Kein Programm nötig.

Wichtig: Navigation und Footer stehen in JEDER HTML-Datei einzeln. Wenn du dort etwas änderst (z. B. einen Link), muss das in allen Dateien passieren. Die Stellen sind mit `<!-- FOOTER: ... -->` kommentiert.

## 5. Bilder austauschen oder ergänzen

1. Bild als JPG vorbereiten, idealerweise max. 1600 px an der langen Kante.
2. In den Ordner `assets/` hochladen, Dateiname gemäss `ASSETS.md`.
3. In der jeweiligen HTML-Datei den kommentierten `BILD-SLOT` suchen und den Platzhalter-`<div>` durch eine `<img>`-Zeile ersetzen (Vorlage steht direkt daneben im Code).

## 6. Design ändern (optional, braucht einmalig Node.js)

Farben und Schriften sind Tokens in `css/input.css` (Block `@theme`). Nach einer Änderung neu kompilieren:

```
npm install
npx @tailwindcss/cli -i css/input.css -o css/styles.css --minify
```

Für reine Text- und Bildänderungen ist das NICHT nötig.

## Offene [TODO]-Stellen

- Bilder: alle mit `BILD-SLOT` markierten Stellen, Liste in `ASSETS.md`
- `modeling.html`: Bildunterschrift für das Couple-Foto (Kap. 9) und das Studio-Foto (Kap. 3)
- `datenschutz.html`: Hoster eintragen, sobald entschieden; Text einmal durchlesen
- `index.html`: Web3Forms Access Key (Abschnitt 3 oben)
- Domain und Hosting: Abschnitte 1 und 2 oben, wenn du soweit bist
