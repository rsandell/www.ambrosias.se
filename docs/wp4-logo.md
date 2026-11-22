# WP 4: logotypen som SVG

Kompletterar `docs/migration.md` (avsnittet "Logo as SVG"). Skriptet, PSD-filen och byggverktyget ligger i `design/`, så logotypen kan byggas om: `design/build-logo.sh` (kräver bara Docker eller Podman). Skriptet läser vektormaskerna i `design/vector_003_clean.psd` direkt, ingen tracing.

## Resultat

| Fil | Vad | Storlek (rå / gzip) |
|---|---|---|
| `static/img/logo.svg` | Hela logotypen, 15 `<path>`-element. Används i sidhuvudet (`<img>`) | 55 KB / 15 KB |
| `static/favicon.svg` | Förenklad sköld utan porträttet, kvadratisk vy | 20 KB / 5 KB |
| `static/favicon-32.png`, `apple-touch-icon.png` (180), `icon-512.png` | PNG-ikoner (de två sista har pappersfärgad bakgrund, iOS tål inte genomskinlighet) | 1 / 11 / 39 KB |
| `static/img/bg-shield.svg` | Enfärgat vattenmärke (mask), `opacity: 0.05` i CSS | 56 KB / 15 KB |

`logo-small.png` och `bg-logo-005.png` är borttagna eftersom inget längre använder dem (finns kvar i git-historiken). `baseof.html` länkar SVG-favikonen, PNG 32 och apple-touch-icon.

## De fyra kända felen

1. **Rutmönstret i glaset: åtgärdat.** Orsaken var delbanor med motsatt lindningsriktning som överlappar. Alla delbanor har operationen "combine", så de vänds nu till samma riktning och `nonzero` ger exakt unionen.
2. **Svarta konturen: åtgärdad.** Den är lagerstilen "Stroke, Outside" (svart, 4 px) på skölden och på den vita innersköldens lager. Den målas som en 8 px linje under fyllningen. Tjockleken mättes mot `vector_003_clean_v2.png` och stämmer.
3. **Innerskölden: ingen ändring.** Hörnen kommer rakt ur PSD:ns bana och är därför det som är ritat. PNG-referensen är gjord ur samma fil.
4. **Storleken: klart.** Relativa koordinater, 2 decimaler, raka segment som `l`. 206 KB (första försöket) blev 55 KB rå, 15 KB gzip, långt under målet 50 KB gzip.

## Kontroller

- Jämförelse mot PSD-renderingen: ca 1 600 av 674 000 pixlar skiljer (kantutjämning, PSD-renderingen saknar konturen).
- Renderat i 120, 400 och 1 500 px och granskat mot `vector_003_clean_v2.png`: ingen synlig skillnad utom skärpan. Kontur och porträttets ring matchar pixel för pixel i 380 px.
- Fungerar som `<img>` (sidhuvudet, kontrollerat i headless Chrome). `viewBox` är satt, ingen fast bredd/höjd, `<title>` och `aria-labelledby` "Ambrosiasorden".
- `./dev build` är grönt.

## Avvikelser och sådant som inte är gjort

- **Ingen SVGO.** Optimeringen sker i skriptet självt (avrundning, relativa koordinater, en bana per lager) eftersom Node inte finns i verktygsbilden. Ger redan mer än tillräckligt.
- **Ikonen utan porträtt behåller den vita innersköldens form** (tom). Vid 16 px syns inget porträtt ändå.
- **Vattenmärket är svart med låg opacitet, inte det gamla vita.** Följer planen ("grått med låg opacitet"). Det blev något synligare än den gamla bilden vid 0.07, därför 0.05. Titta på det en gång.
- **Den gyllene ordbilden (`ambrosiasorden-gold.png`) är oförändrad.** Plan punkt 5: ingen vektorkälla finns, PNG behålls. Spåra med Potrace eller lämna in en vektorfil om skärpan på täta skärmar störs.
- **`cairosvg` kan inte rita masker**, så `bg-shield.svg` ser svart ut i det verktyget. Granskad med `rsvg-convert` och Chrome, där den är rätt. Läs inget in i att PNG-ikonerna saknar mask, de använder inte den.
- Skärmläsartext: bilden i sidhuvudet har `alt="Ambrosiasorden"`, SVG-filens egen `<title>` används bara om filen öppnas direkt eller läggs in inline.
