# Ambrosiasorden, www.ambrosias.se

Föreningen Ambrosiasordens webbplats. Den är en statisk sajt byggd med [Hugo](https://gohugo.io/) och publiceras med GitHub Actions på GitHub Pages. Det finns ingen databas, inga inloggningar och inga cookies. Recept, album, dokument och styrelse är vanliga filer i det här repot.

Den gamla sajten (AngularJS och Node/MySQL, 2013 till 2014) finns kvar i taggen `legacy-angularjs-2014`.

## Översikt

- **Verktyg:** du behöver bara **Git** och **Docker eller Podman**. Hugo, Python och Pillow finns i en verktygsbild som byggs automatiskt första gången. Inget annat behöver installeras.
- **Hugo-versionen** står på ett ställe, `ARG HUGO_VERSION` i `Dockerfile`. Samma `Dockerfile` används lokalt och av GitHub Actions, så förhandsvisningen och den publicerade sajten blir likadana.
- **Allt går via `./dev`** i repots rot:

| Kommando | Gör |
|---|---|
| `./dev serve` | Förhandsvisning på <http://localhost:1313> som laddas om när du sparar. `./dev serve --drafts` visar också utkast. Avsluta med Ctrl+C |
| `./dev build` | Bygger hela sajten till `public/`. Visar fel i front matter och mallar |
| `./dev new <sökväg>` | Skapar en ny sida från en mall i `archetypes/` |
| `./dev import-album <zip> [flaggor]` | Importerar ett fotoalbum |
| `./dev shell` | Öppnar ett skal i verktygsbilden |
| `./dev rebuild-image` | Bygger om verktygsbilden (efter ändrad Hugo-version) |

Första gången du kör något av dem byggs verktygsbilden. Det tar några minuter och laddar ner några hundra MB. Därefter går det snabbt.

**Kom igång:**

```sh
git clone git@github.com:rsandell/www.ambrosias.se.git
cd www.ambrosias.se
./dev serve
```

Öppna sedan <http://localhost:1313>.

Två saker att känna till:

- Sökvägen till repot får inte innehålla mellanslag (Docker-montering).
- `./dev build` tar inte `--drafts`. Använd `-D` (`./dev build -D`). `./dev serve --drafts` fungerar.

## Mappar

| Mapp | Innehåll |
|---|---|
| `content/` | Sidorna: `recept/`, `album/`, `klädkod/`, `blogg/`, `info.md`, `om.md` och startsidan `_index.md` |
| `data/` | `styrelse.yaml` (styrelsen) och `dokument.yaml` (dokumentlistan på sidan Info) |
| `static/` | Filer som kopieras som de är: `img/` (logotyp och bakgrund), `foto/` (startsidans foto), `doc/` (PDF-filer) |
| `archetypes/` | Mallar för nya recept, album och blogginlägg |
| `layouts/` | Sidmallar (HTML) |
| `assets/` | `css/main.css`, `js/album.js` och PhotoSwipe (`vendor/photoswipe/`, exakt version i `VERSION`) |
| `design/` | Logotypens källfiler (GIMP och PSD). Publiceras inte |
| `migration/` | Skript och anteckningar från flytten från den gamla sajten. Sparas som historia, publiceras inte. `migration/scripts/import_album` är det som `./dev import-album` kör |
| `docs/` | `migration.md` (planen) och ett dokument per arbetspaket. Publiceras inte |
| `.github/` | `workflows/pages.yml` (bygger och publicerar) och `dependabot.yml` |
| `public/`, `resources/` | Genereras av bygget. Ignoreras av Git, ändra inte |

Lägg **inte** någon `README.md` inne i `content/`. Hugo skulle göra den till en sida.

## Lägg till recept

```sh
./dev new recept/lyxpizza.md
```

Filen `content/recept/lyxpizza.md` skapas med mall. Mallen är ett utkast (`draft: true`), så det syns inte på den publicerade sajten förrän du tar bort raden. Så här ser en fil ut:

```markdown
---
title: "Lyxpizza"
courses: ["Huvudrätt", "Förrätt"]
servings: "2 personer"    # valfritt
time: "30 min"            # valfritt
---

Kort inledning (valfri).

## Ingredienser
- 1 pkt. Kungsörnen snabbpizza
- 4 msk. Passerade tomater

## Tillredning
1. Ställ ugnen på 200°.
2. Grädda i 12 minuter.

## Dryckesförslag
Rosévin, eller ett lättare rödvin
```

- **Kurser** är en eller flera av `Förrätt`, `Mellanrätt`, `Huvudrätt`, `Efterrätt`, `Till Kaffet`. Stavningen måste vara exakt, annars blir det en ny, tom flik. Ett recept i två kurser visas i båda.
- Rubriken `Dryckesförslag` tas bara med om receptet har ett.
- Texten skrivs i Markdown (listor med `-` och `1.`). Ingen HTML.
- Titeln blir länkadressen (`/recept/lyxpizza/`). Vill du ha en annan adress, lägg till `slug: "annat-namn"`.
- Förhandsgranska med `./dev serve --drafts`, ta bort raden `draft: true` när det ser rätt ut, och publicera (se **Publicera**).

## Lägg till album

Originalfotona läggs **inte** i Git och inte på sajten. De finns i din egen backup. Sajten får bara förminskade kopior som skapas av importskriptet.

1. **Zipfilen.** Lägg den i `../gallery/` (mappen bredvid repot, eller den som `ORIGINALS_DIR` pekar på) och döp den så här: `<Kategori> <År> <Fotograf>.zip`, till exempel `Nyår 2015 Anna.zip`. Kategori är `Nyår`, `Valborg` eller `Midsommar`. Även `<Titel>-Bobby.zip` (till exempel `Nyårsafton 2015-Bobby.zip`) känns igen. Zipen kan ligga i en annan mapp, men då får sökvägen inte ha mellanslag.
2. **Importera:**

   ```sh
   ./dev import-album "Nyår 2015 Anna.zip"
   ```

   Stämmer inte namnet, eller om du vill ange något själv: `--category Nyår --year 2015 --photographer "Anna" --date 2015-12-30 --title "Nyår 2015"`. Midsommar och andra kategorier än Nyår och Valborg **kräver** `--date`.
3. **Vad skriptet gör:** skapar `content/album/<kategori>/<år>/<fotograf>/` med `index.md` och bilderna `001.jpg`, `002.jpg` ... i ursprunglig ordning. Webbversionen har längsta sidan högst **1600 px** och förstoras **aldrig**. Miniatyrer på cirka 400 px läggs i `thumbs/`. EXIF, GPS och annan metadata tas bort och en bild blir aldrig större än originalet. Andra filer än JPEG (till exempel film) hoppas över med en varning. Skriptet ändrar aldrig zipfilen och kan köras om med samma resultat. Det skriver ut antal bilder och storlek före och efter.
4. **Kontrollera** med `./dev serve`. Titta på albumsidan, kategorin och årssidan, och öppna bildvisaren.
5. **Committa** hela albumet (`git add content/album`, `git commit`) och publicera. Kontrollera storleken först: ett album är ofta 2 till 40 MB förminskat.

Notera:
- Samma kategori, år och fotograf ger samma mapp. En andra import skriver över den första, och två album med samma tripplett kan inte finnas. Titeln kan ändras med `--title`.
- Fotografen `Bobby` skrivs `Robert Sandell`.
- Datumet blir 30 december för Nyår och 30 april för Valborg. Ändra `date:` i `index.md` om det ska vara något annat. Det överlever en omkörning (`--date` har företräde).
- Taxonomifälten `kategorier`, `ar` och `fotografer` i front matter skapas av skriptet. Ändra dem inte för hand.

**Album som väntar på bilder.** Nyår 2012 (Henrik Karlsson) och Midsommar 2008 (Mogge) finns som utkast (`draft: true`) utan bilder, och syns inte på sajten. När du har zipfilen, lägg den i `../gallery/` och kör

```sh
./dev import-album "Nyår 2012 Henrik Karlsson.zip"
./dev import-album "Midsommar 2008 Mogge.zip" --date 2008-06-20
```

Skriptet fyller i bilderna, tar bort `draft` (även på kategori- och årssidan) och publicerar albumet. Se `migration/deferred-albums.md`.

### Bildvisaren

Klicka på ett foto i ett album för att öppna visaren. Knappen **Visa alla bilder** på kategori- och årssidorna öppnar alla bilder på nivån som ett enda bildspel.

| Knapp eller tangent | Gör |
|---|---|
| Pilar, föregående/nästa, svep | Byter bild |
| Zoom (knappen, nyp eller dubbelklick) | Förstorar. Pausar bildspelet |
| **Starta bildspel** (play) eller **Space** | Startar och pausar bildspelet. Det startar aldrig av sig självt |
| Tid per bild (till exempel `5 s`) | Växlar mellan 3, 5 och 8 sekunder. Valet kommer ihåg i webbläsaren |
| **Helskärm** | In och ut ur helskärm. Finns inte där webbläsaren saknar stöd (till exempel iPhone) |
| Esc eller stäng | Stänger visaren, stoppar bildspelet och lämnar helskärm |

Bildspelet börjar om från första bilden efter den sista, och pausar när besökaren själv byter bild eller zoomar. Det är byggt så att det alltid går att stoppa.

## Lägg till dokument

Dokumentlistan på sidan Info ligger i `data/dokument.yaml`. Lägg till ett block per dokument:

```yaml
- title: "Stadgar 3.0"
  type: stadgar          # stadgar | protokoll | annat
  year: 2027             # valfritt, nyast först
  url: "https://drive.google.com/..."
- title: "Årsmötesprotokoll 2027"
  type: protokoll
  year: 2027
  file: "doc/Årsmöte_Ambrosiasorden_2027.pdf"
```

- Exakt **ett** av `url` (extern länk, används som den är) eller `file` (en PDF som ligger i `static/doc/`).
- **Ny version av stadgarna:** lägg till ett nytt block med nytt `year` och antingen en Drive-länk eller en PDF i `static/doc/`. Pensionera den gamla genom att lägga till `archived: true` (då hamnar den under "Äldre versioner") eller ändra dess `type` till `annat`. Mallen behöver inte ändras.
- Google Drive- och Docs-länkar måste vara delade som **"alla med länken"**. Testa varje ny länk i ett privat webbläsarfönster.

## Styrelsen

Styrelsen ligger i `data/styrelse.yaml`. Varje person är ett block:

```yaml
- name: "Namn Namnsson"
  title: "Ordförande"
  mail: "ordforande@ambrosias.se"
  replacer:                         # valfritt
    name: "Ersättare Ersättarsson"
    mail: "ersattare@ambrosias.se"
```

Ta bort en person genom att ta bort hela blocket, byt person genom att ändra raderna. Inga telefonnummer läggs in. Adresserna visas som `mailto:`-länkar. Gemensam styrelseadress sätts med `boardMail` i `hugo.toml` (ta bort raden för att dölja den). Listan kom från den gamla sajten: kontrollera att namn och titlar stämmer innan sajten publiceras.

## Info-sida och övriga sidor

- **Medlemsavgift och organisationsnummer** står i `content/info.md`. Vi skriver inget årtal i avgiftstexten, så den blir inte inaktuell.
- **Om-sidan** är `content/om.md` (licenser och tekniklista, se även `THIRD-PARTY-NOTICES.txt`). Lägger du till en ny resurs här, lägg till dess licens i `THIRD-PARTY-NOTICES.txt` också.
- **Startsidan** är `content/_index.md`, och fotot är `static/foto/067.JPG`.
- **Klädkod:** en fil per sida i `content/klädkod/`, och `_index.md` är indexsidan. Länkar mellan sidorna skrivs absolut, till exempel `[frack](/klädkod/frack/)`, inte som filnamn. Källhänvisningen skrivs `{.kalla}` på raden under stycket.
- **Menyn** ligger i `hugo.toml` under `[[menus.main]]`.
- **Årtalet i sidfoten** räknas ut automatiskt (2005 till innevarande år).

## Blogg

I dag länkar menyvalet **Blogg** till den gamla bloggen på Blogspot (`params.blog.external_url` i `hugo.toml`). Det finns en förberedd, ännu opublicerad blogg i Hugo (`content/blogg/`).

**Byta till bloggen i Hugo:**

1. I `hugo.toml`, sätt `native = true` under `[params.blog]`. Menyvalet pekar då på `/blogg/`, och en länk "Äldre inlägg på Blogspot" visas längst ner.
2. I `content/blogg/_index.md`, ta bort raden `draft: true`.

**Skriva ett inlägg:**

```sh
./dev new blogg/2026/mitt-inlagg.md
```

Det ger `content/blogg/2026/mitt-inlagg.md` med `title`, `date`, `author` (Robert Sandell), `tags`, `summary` och `draft: true`. Skriv texten under raden `---` och ta bort `draft: true` när inlägget ska ut. Det finns även en RSS-flöde under `/blogg/index.xml` när bloggen är påslagen. De gamla inläggen finns kvar på Blogspot och är inte importerade.

## Publicera

Sajten publiceras av GitHub Actions varje gång något pushas till grenen `master`.

```sh
./dev build                 # bygg och se att det går igenom
git status                  # kolla att bara det du vill ha är med
git add content data static
git commit -m "Nytt recept: Lyxpizza"
git push
```

- **Följ bygget:** på GitHub under fliken **Actions**, arbetsflödet "Publicera sajten". Det tar någon minut. Grön bock betyder att sajten är uppdaterad.
- **Om bygget blir rött:** öppna körningen, titta i steget "Bygg sajten". Felet pekar nästan alltid ut en fil och en rad. Rätta, kör `./dev build` lokalt tills det är grönt och pusha igen. Den gamla versionen ligger kvar tills ett bygge lyckas.
- **Ångra:** `git revert <commit>` och `git push`. Det gör en ny commit som tar bort ändringen, så historiken bevaras.
- Alla ändringar görs direkt på `master` (inga grenar). Skriv aldrig om historiken (`--force`).
- Dra alltid `git pull` innan du börjar om fler än en person redigerar.

### Checklista före publicering

- [ ] Stavning och bokstäverna å, ä, ö
- [ ] Länkarna öppnar rätt sida (och Drive-länkar i ett privat fönster)
- [ ] Bilderna laddas och bildvisaren öppnas
- [ ] `./dev build` är grön
- [ ] Sidan ser rätt ut i smalt fönster (telefon), helst på en riktig telefon
- [ ] Inga hemligheter eller originalfoton är med (`git status`)

## Felsökning

| Problem | Orsak och åtgärd |
|---|---|
| `./dev build` ger `failed to unmarshal YAML` eller liknande | Fel i front matter. Titta på filen som nämns. Vanligast är ett saknat citationstecken eller tabbar i stället för mellanslag. Text med kolon ska stå inom citationstecken |
| Ett recept, album eller inlägg syns inte | Det är fortfarande `draft: true`. Ta bort raden. Förhandsvisa med `./dev serve --drafts` |
| Receptet hamnar i en ny, konstig flik | `courses` är felstavad. Använd exakt `Förrätt`, `Mellanrätt`, `Huvudrätt`, `Efterrätt` eller `Till Kaffet` |
| Album saknas i listan | Albumet, året eller kategorin är `draft: true`, eller zipfilen hade inga JPEG-bilder. Kör `./dev import-album` igen och läs utskriften |
| Miniatyrer eller bilder saknas | Kontrollera att `thumbs/` och `001.jpg` osv. ligger i albummappen och är committade. Bilder med 400 px eller mindre har ingen miniatyr, det är normalt |
| `Hittar inte zipfilen` | Skriv sökvägen exakt (citationstecken om den har mellanslag) eller lägg zipen i `ORIGINALS_DIR` (standard `../gallery`) |
| `Flytta zipfilen till en sökväg utan mellanslag` | Zipen ligger utanför `ORIGINALS_DIR` i en mapp med mellanslag. Flytta den |
| Konstiga tecken i filnamn eller `Nyårsafton` blir fel kategori | Namnge zipen enligt `<Kategori> <År> <Fotograf>.zip` eller ange `--category --year --photographer` |
| Fotona är för stora | Skriptet håller längsta sidan till 1600 px. Är sajten ändå för stor kan `WEB_EDGE` och `Q_WEB` i `migration/scripts/import_album` sänkas (till exempel 1400 och 78) och albumen importeras om |
| `./dev build --drafts` ger fel | Flaggan heter `-D` vid bygge: `./dev build -D` |
| Filer i repot ägs av root | Kör inte `./dev` med `sudo`. Med Docker som vanlig användare i gruppen `docker` blir ägaren du |
| Bygget går inte efter ändrad Hugo-version | `./dev rebuild-image` |
| SELinux eller rättighetsfel vid montering | `./dev` lägger själv till `:Z` på SELinux-värdar. Med Podman används `--userns=keep-id` |

## Underhåll

- **Uppdatera Hugo:** ändra `ARG HUGO_VERSION` i `Dockerfile` (ett ställe), kör `./dev rebuild-image`, sedan `./dev build` och titta på sajten med `./dev serve`. Commit och push. GitHub Actions använder samma `Dockerfile`. Dependabot bevakar inte Hugo-versionen, så kolla själv en gång om året på <https://github.com/gohugoio/hugo/releases>.
- **Uppdatera PhotoSwipe:** byt filerna i `assets/vendor/photoswipe/` mot den nya versionen (hämta paketet `photoswipe` från npm) och uppdatera `VERSION`. Testa ett album och bildspelet. Uppdatera versionen i `THIRD-PARTY-NOTICES.txt`.
- **Dependabot:** `.github/dependabot.yml` ger **högst en samlad pull request i månaden** för GitHub Actions och basbilden i `Dockerfile`. Slå på Dependabot security alerts under Settings, Code security. Sajten är statisk (inga inloggningar, cookies eller formulär), så ett fel i ett frontend-bibliotek har begränsad påverkan.
- **Årlig rutin:** titta på den öppna Dependabot-pull requesten, uppdatera Hugo och PhotoSwipe, kör `./dev build`, titta på ett album och pusha. Kontrollera också att styrelselistan och Drive-länkarna stämmer.
- **Domän och HTTPS:** GitHub Pages under Settings, Pages. Källa: **GitHub Actions**. Anpassad domän `www.ambrosias.se` (filen `static/CNAME` läggs till vid publiceringen och ska innehålla den). DNS: `www` som CNAME till `rsandell.github.io`. `ambrosias.se` utan `www` pekas till GitHubs Pages-adresser (A- och AAAA-poster, aktuell lista finns i GitHubs dokumentation) och skickas då vidare till `www`. Slå på **Enforce HTTPS** när certifikatet är klart.
- **Backup:** innehållet finns i Git. **Originalfotona (zipfilerna) finns bara i din egen backup**, inte i repot. Kontrollera att backupen finns.
- **Licenser:** kod är MIT (`LICENSE`), text, layout och grafik CC BY-NC 4.0 (`LICENSE-CONTENT.txt`), förutom logotypen. Foton tillhör respektive fotograf. Tredjepartsnotiser finns i `THIRD-PARTY-NOTICES.txt`.
