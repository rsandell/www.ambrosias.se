# Beslut och avvikelser i arbetspaket 2 och 3

Kompletterar `docs/migration.md`. Här står det som gjordes annorlunda än planen, varför,
och sådant som kan överraska den som granskar eller underhåller sajten senare.
Skrivet efter WP 2 (recept och statiska sidor) och WP 3 (album).

## Avvikelser från planen

| Plan (migration.md) | Vad som gjordes | Varför |
|---|---|---|
| Taxonomierna `kategorier`, `ar`, `fotografer` skapas från `category`, `year`, `photographer` | Importskriptet skriver **både** `category/year/photographer` och `kategorier/ar/fotografer` i front matter | Hugo hämtar termer från taxonomins plural-nyckel, inte från singularnycklarna. Ändra inte de tre taxonomiraderna för hand |
| Fotografsidor på `/album/fotografer/<namn>/` (valfritt) | De ligger på `/fotografer/<namn>/`, och `/kategorier/` och `/ar/` finns också | Hugo lägger taxonomier i sajtroten. Drill-down-navigeringen använder i stället sektionerna under `/album/` |
| 17 klädkodssidor | 16 filer (index + 15 undersidor) | Det är så många som finns i `views/dresscode/`. Siffran 17 i planen var fel |
| Importskriptet kopierar AVI "som den är, eller hoppar över" | Hoppar över med varning | Ingen videospelare ingår. Berör bara Nyår 2005 Mark (1 fil). Filen finns kvar i originalzippen |
| Storleksuppskattning 450 till 600 MB | Uppmätt 221 MB (2 282 filer) | Många original var redan små. Därför användes inte reservvärdena 1400 px och kvalitet 78 |
| `import_album` tar zip direkt | `./dev import-album` översätter värdsökvägen (zipen monteras skrivskyddat som `/originals` eller `/zips`) | Skriptet körs i containern och ser inte värdens filer |
| Receptens `servings` som i exemplet (`"2"`) | Skrivs som `"N personer"` | Enhetligt format. Fältet visas inte i någon mall än |
| De två prototyprecepten (WP 1) var handskrivna | Skrevs över av skriptet | Handversionerna hade små ordändringar ("tid 30min" blev "30 min", ett kommatecken lades till, "svalan av" blev "svalan"). Texten ska enligt planen inte skrivas om |
| Taggen/licensfilen för PhotoSwipe | Copyright-raden på Om-sidan är "2014-2022 Dmitry Semenov" | Hämtad ur paketets egen LICENSE. Ett första utkast hade fel namn och år |

## Beslut som fattades under arbetet

- **Konvertering:** egen liten HTML-till-Markdown-omvandlare (`migration/scripts/htmlmd.py`) i stället för pandoc, som inte finns i verktygsbilden. Varje konverteringsskript jämför orden före och efter och avslutar med felkod om de skiljer sig.
- **Receptformat:** ett stycke med 3 rader eller fler i tillredningen blir numrerad lista. Ett stycke med 1 till 2 rader blir vanligt stycke, med hård radbrytning (`\`) där källan hade `<br>`. Ingrediensrader som bara är fetstil (till exempel "Till Garnering" i Ambrosia Tårta) blir en egen rad mellan två punktlistor. Dryckesförslag med fler än en rad blir punktlista.
- **Länkar i Markdown:** länkar som börjar med `/` får baseURL-prefix via `layouts/_markup/render-link.html`. Det gör att sajten fungerar även på `rsandell.github.io/www.ambrosias.se/` vid testpubliceringen. **Rättat i granskningen före WP 6:** `relURL` lägger inte till baseURL-sökvägen för indata som börjar med `/`, så kroken tar bort inledande `/` först (`strings.TrimPrefix "/"`), och logotypen i sidhuvudet använder `site.Home.RelPermalink`.
- **`{.kalla}`-attribut:** blockattribut är påslagna i `hugo.toml` (`markup.goldmark.parser.attribute.block`) så att källraden på klädkodssidorna kan få en CSS-klass.
- **Info-sidan** använder `layout: info` och mallen `layouts/info.html`. Innehållet (avgiftstexten) ligger i `content/info.md`, dokument och styrelse i `data/`.
- **Bildfiler:** i varje albumpaket ligger webbversionerna som `001.jpg` osv. och miniatyrerna i `thumbs/001.jpg`. Om en bild är 400 px eller mindre finns ingen miniatyr och själva bilden används.
- **Metadata:** EXIF, GPS, XMP och IPTC tas bort. Original som kopieras oförändrade rensas utan omkodning (`strip_jpeg`). Bilder med EXIF-orientering omkodas alltid, så att bredd och höjd i Hugo stämmer med det webbläsaren visar.
- **Bevarade värden vid omkörning:** `import_album` behåller `date`, `cover`, `legacy_id`, titeln (utan `--title`) och texten efter front matter från en befintlig `index.md` (ändrat i granskningen före WP 6). Övriga fält skrivs om. Ett eget datum överlever alltså en omkörning, men `--date` har företräde.
- **Ordning i bildspel:** albumen sorteras efter datum och sedan fotografens namn. Hugos sortering är skiftlägesokänslig, så "eAx" hamnar före "Mannenmedspannen".
- **Lightbox:** PhotoSwipe 5.4.4, vendorad (inte npm) med exakt version i `assets/vendor/photoswipe/VERSION`, och buntad med `js.Build`. Albumdata läggs som JSON i sidan. Knappen "Visa alla bilder" är `hidden` tills JavaScript körs. Miniatyrerna är riktiga länkar till bilden, så sidan fungerar utan JavaScript.
- **Uppskjutna album:** Nyår 2012 (Henrik Karlsson) och Midsommar 2008 finns som `draft: true`. Midsommar-kategorin och årssidan är också draft, så en tom Midsommar-panel visas inte. Importskriptet tar bort `draft` på kategori- och årssidorna när albumet importeras.

## Sådant som kan överraska

- **Repot är undermappen `www.ambrosias.se/`**, inte projektmappen. `migration/db/` och `../gallery/` ligger utanför repot och ska aldrig dit. `convert_recipes` läser därför `../migration/db/tables` som standard.
- **Allt är committat på `master`** (WP 2 och 3 i commit `73c254d`, granskningsrättningar i `bf34d7d`). Inget är pushat. `public/`, `resources/_gen/` och `__pycache__/` är ignorerade.
- **Hugo-flaggan för utkast är `-D`**, inte `--drafts`; `hugo server --drafts` finns inte. **Rättat i granskningen före WP 6:** `./dev` översätter `--drafts` till `-D`, så både `./dev serve --drafts` och `./dev build --drafts` fungerar.
- **`./dev import-album` kräver att zipens sökväg saknar mellanslag** om zipen ligger utanför `ORIGINALS_DIR`. Samma begränsning finns i `./dev` för repots egen sökväg (`-v $PWD:/site`).
- **Gamla zip-namn:** `Nyårsafton ...-Bobby.zip` ger kategori Nyår, fotograf Robert Sandell och titeln "Nyårsafton 2011". Övriga zippar ger titeln av filnamnet. Titeln kan ändras med `--title`.
- **`legacy_id`** skickas bara med av `import_all_albums`. Vid en vanlig enskild import saknas det om albumet är nytt.
- **Samma fotograf, år och kategori** ger samma mapp, så en andra import skriver över den första. Två album med samma tripplett kan alltså inte finnas.
- **Klädkodssidornas länkar** är absoluta (`/klädkod/frack/`) i Markdown och görs om av länkhooken. Skriv nya länkar på samma sätt, inte som relativa filnamn.
- **Styrelselistan** är en ögonblicksbild från gamla koden. Kontrollera namn och titlar före publicering. Drive-länkarna i `dokument.yaml` måste vara delade som "alla med länken", vilket inte kan testas härifrån.
- **Ännu inte gjort** (senare paket): `README.md`, `THIRD-PARTY-NOTICES.txt`, Dependabot (WP 5), logotypen som SVG (WP 4) och publicering (WP 6). Footerns och Om-sidans årtal är 2005 till 2026, genererat från aktuellt år i footern men fast på Om-sidan.
- **Testat** med Chrome i huvudlöst läge (info-sida, albumsida, album- och bildspelsvy) men inte på en riktig telefon, och inte tillgänglighet (skärmläsare, tangentbord) utöver det PhotoSwipe ger som standard.
