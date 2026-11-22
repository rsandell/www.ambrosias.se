# Rättningar efter granskningen före WP 6

Gäller `docs/review-before-wp6.md`. Inget är committat ännu (väntar på ägarens OK).

## Åtgärdat

1. **Länkar under undersökväg.** `layouts/_markup/render-link.html` tar bort inledande `/` före `relURL`. Logotypen i `layouts/_partials/header.html` använder `site.Home.RelPermalink`. Inga andra `"/..." | relURL` finns i `layouts/`. Länkkontrollen ger `broken 0` för både produktions-baseURL och `https://rsandell.github.io/www.ambrosias.se/`. `docs/wp2-wp3-decisions.md` rättad.
2. **`--drafts`.** `dev` översätter `--drafts` till `-D` för alla kommandon. `./dev build --drafts` tar med `album/nyar/2012/henrik-karlsson/`, och `./dev serve --drafts` startar och serverar utkastet (HTTP 200). README (förbehållet och felsökningsraden borttagna) och beslutsdokumentet rättade. Usage-texten visar `build [--drafts]`.
3. **Kontrast.** Aktivt recept: `--navy` med vit text (10,2:1). Sidfot: `--gold-light` (6,6:1), guld kvar i linjen. `--bronze` mörkare, `#7A5F26` (vit text 6,0:1). Fokusram `--blue` på ljus bakgrund (7,9:1), guld bara i sidhuvud och sidfot.
4. **`import_album`.** Texten efter front matter och titeln bevaras vid omkörning (`--title` har företräde). Förminskad bild används alltid när `need_resize` är sant. CMYK-profilen släpps när bilden konverterats till RGB. Provkört på ett album i en temporär mapp: egen text och titel överlevde en andra körning. README beskriver vad som bevaras. Övriga egna front matter-fält skrivs fortfarande om (dokumenterat, inte åtgärdat).
5. **Mobilmeny utan JS.** `<html>` får klassen `js` från ett inline-skript i `<head>`. Menyn döljs bara med `.js #site-nav`.

Nits: dubbel `.lead` borttagen. `thead` döljs bara när alla rubriker är tomma (Om-sidans tabell). `content/courses/_index.md` ("Kurser") och `content/ar/_index.md` ("År") tillagda. "(PDF)" i dokumentlistan härleds ur filändelsen. Hemsidans foto har `width`/`height` och `fetchpriority="high"` i stället för `loading="lazy"`. README:s "Uppdatera PhotoSwipe" säger att `pswp.goTo` i `album.js` ska kontrolleras.

Efteråt, på ägarens begäran (året visas nu efter titeln i dokumentlistan, om titeln inte redan innehåller det): `year: 2022` för "Stadgar 2.0" i `data/dokument.yaml`, och hemsidans foto centrerat (`.divider-photo`).

## Inte gjort

- Bildvisaren (lightbox och bildspel) är inte provkörd i headless Chrome efter ändringarna. Ingen JS i `album.js` har ändrats, men titta på ett album och `/album/nyar/` en gång för hand.
- Kontrasten är beräknad, inte provad i webbläsare.
