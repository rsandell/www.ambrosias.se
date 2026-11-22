# WP 3.5: bildspel och helskärm i bildvisaren

Kompletterar `docs/migration.md` (avsnittet "WP 3.5 specification"). Ändrade filer: `assets/js/album.js`, `assets/css/main.css`. Inget nytt beroende och inget ändrat i PhotoSwipe.

## Vad som gjordes

- Knappar i verktygsfältet (`ui.registerElement`): **Starta/Pausa bildspel** (`aria-pressed`), **tid per bild** (3, 5 eller 8 s, växlar vid klick) och **Helskärm**.
- **Space** startar och pausar. Bildspelet startar aldrig av sig självt. Intervallet sparas i `localStorage` (try/catch, fungerar utan).
- Loopar (`loop: true`) över hela det öppnade galleriet, också i de kombinerade vyerna.
- Pausar vid: pil, svep/dragning, klick på föregående/nästa, och zoom. Återupptas inte av sig självt.
- Dold flik: timern stoppas och startar igen när fliken syns, bara om bildspelet spelade.
- Stängning stoppar bildspelet och lämnar helskärm. Helskärmsknappen finns inte där API:t saknas, och följer Esc.
- Play- och intervallknapparna döljs om galleriet har en enda bild.
- Skärmläsare: osynlig `role="status"`-region säger "Bildspel startat", "Bildspel pausat" och "Tid per bild N sekunder". Bildtexten uppdateras vid varje automatiskt byte (oförändrad kod).

## Val och avvikelser

- **Hur "eget byte" skiljs från användarens:** bildspelet noterar vilket index det själv går till (`expected`). Ett `change` till något annat index räknas som användarens och pausar. Det kräver ingen timing mot PhotoSwipes interna händelseordning.
- **Zoom** upptäcks via `zoomPanUpdate` när aktuell zoomnivå överstiger startnivån.
- **Space på själva play-knappen** hanteras av knappens egen klickhändelse (annars hade den växlat två gånger).
- Intervallknappen visar siffran som text ("5 s"), ingen ikon.

## Test (headless Chrome, playwright-core, mot ett lokalt bygge)

Kontroll 1 till 8 i planen kördes mot Nyår 2005 eAx (55 bilder) och den kombinerade vyn `/album/nyar/` (912 bilder): inget rör sig utan play, 3 s-intervall går framåt med räknare och bildtext, pil/dragning/zoom pausar, Space växlar, start på sista bilden går till första, intervallet överlever omladdning och blockerad `localStorage`, helskärm in/ut följer Esc och stängning, dold flik stoppar timern. Inga konsolfel. `./dev build` är grön. `album.js` växte med cirka 3,8 KB minifierat (bundeln 69 721 till 73 559 byte inklusive PhotoSwipe), under målet 6 KB.

## Inte gjort

- Ingen test på en riktig telefon. Svep testades som pekardragning med mus (ett försök med syntetisk touch via CDP flyttade inte bilden alls), och ingen test med skärmläsare.
- Helskärm i iPhone Safari saknas i plattformen (knappen döljs). Inte testat där.
- README-avsnittet "Bildvisaren" skrivs i WP 5 (README finns inte än) och ska nämna knapparna och Space.

## Tillägg: glidande bildbyte

PhotoSwipes `next()`/`prev()` (pilar, knappar, bildspelet) byter bild utan rörelse, bara svep animeras. `album.js` ersätter därför `pswp.goTo` med `mainScroll.moveIndexBy(diff, true)`, samma korta fjäderrörelse (cirka 0,2 s) som vid svep. Av vid `prefers-reduced-motion`. Kontrollerat: rörelse mitt i bytet, ingen rörelse med reducerad rörelse, loop och bildspel oförändrade.
