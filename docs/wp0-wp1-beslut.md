# WP 0 och WP 1: beslut och avvikelser (rekonstruerat)

Det här dokumentet saknades eftersom WP 0 och WP 1 gjordes innan kravet på stegdokument fanns. Det är **rekonstruerat i efterhand från git-historiken** (`3f928d7`, `aec3379`, `c23fbef` och taggen), inte från agentens egna anteckningar. Det som står här är det historiken visar. Skälen bakom valen är därför inte alltid kända och är markerade så.

## WP 0: den gamla sajten sparas

- **Commit `3f928d7`** "Final state of the AngularJS site before the Hugo migration" innehåller sex filer: `index.html`, `js/modules/ambrosias-app.js`, `node/package.json`, `node/routes/styrelse.js`, `views/album.html`, `views/info.html`. Det är de verkliga ändringarna som planen listade (https-adresser, styrelselistan, avgiftsåret, den rättade taggen i albumvyn, mysql-versionen).
- **Avvikelse mot planen:** planen nämnde också "små ändringar i `.gitignore`". De ingår **inte** i committen. Skälet är inte dokumenterat. Filmoderna (644 till 755) och de binära bakgrundsbilderna togs inte heller med, som planen sa.
- **Inte committat, som planen krävde:** `nyår-2004-bosse/` (46 MB), `node/routes/conf.js` (databaslösenord), `ambrosias.sublime-workspace`. De ligger kvar lokalt och är ignorerade i den nya `.gitignore`.
- **Tagg:** `legacy-angularjs-2014` (annoterad), med meddelandet "AngularJS 1.2 + Node/MySQL site by Robert Sandell, built 2013-2014, final state before the Hugo migration (2026)". Både `master` (då `3f928d7`) och taggen är pushade till GitHub. Det är det enda som hittills pushats.
- Ingen historia skrevs om och ingen force-push gjordes.

## WP 1: Hugo-skelettet (commit `aec3379`, plus `c23fbef`)

- **Arbetsgrenen:** en lokal gren `hugo` skapades och användes för skelettet. Sedan bestämdes att arbeta direkt på `master` (avsnitt 0 i planen). Grenen `hugo` är kvar, ligger efter `master` och används inte.
- **Rensning** (som planen sa, "kvar i taggen"): `js/`, den gamla Angular-appen, `index.html`, `views/`, `node/`, zip-filerna, oanvända texturer (`textured_paper*`, `bg-logo.png`, `bg-logo-010.png`), `ambrosias.sublime-project`, `colorschemedesigner-export.htm` och de två interimsstadgarna i `doc/` togs bort med en vanlig commit. Historiken är orörd.
- **Flyttat med `git mv`:** `img/*.xcf` till `design/`, de 16 klädkodssidorna från `views/dresscode/` till `migration/live-views/views/dresscode/` (källa för WP 2).
- **Licenser:** `LICENSE_MIT.txt` blev `LICENSE` och `LICENSE_CC_BY-NC.txt` blev `LICENSE-CONTENT.txt`. Åren är 2013-2026 (kod) och 2005-2026 (innehåll), och tecknet i "Föreningen" är rättat, som planen sa.
- **Verktyg:** `Dockerfile` (`python:3.12-slim` plus Hugo 0.170.1, extended, som en fast version via `ARG HUGO_VERSION`) och skriptet `dev` (Docker eller Podman, utan `docker compose`). Arbetsflödet `.github/workflows/pages.yml` bygger med samma Dockerfile.
- **Hugo-konfiguration:** `hugo.toml` med taxonomierna `courses`, `kategorier`, `ar` och `fotografer`, menyn, `params.blog` (`external_url`, `native = false`) och `locale = "sv"`. Arkivtyper (`archetypes/recept.md`, `album.md`, `blogg.md`), grundmallar, rubrik och sidfot, receptlayout, bloggavsnittet som utkast och `robots.txt`.
- **Temaprototyp:** `assets/css/main.css` med färgerna från planen som CSS-variabler, två prov-recept (`chockladmousse`, `lyxpizza`).
- **`c23fbef`:** gjorde `dev` körbart i git (filläget hade inte följt med).
- Skälen till detaljval i temat (till exempel storlekar och avstånd) är inte dokumenterade och gicks inte igenom här. Granskningen före WP 6 (`docs/review-before-wp6.md`) och rättningarna (`docs/review-fixes.md`) täcker kontrast, länkar och menyn.

## Sådant som kan överraska

- Flera av planens WP 1-punkter blev klara först i senare paket: logotypen som SVG (WP 4), README och Dependabot (WP 5), och publiceringen (WP 6).
- Pages-adressen för det här kontot är `rsandell.com/www.ambrosias.se/` och inte `rsandell.github.io/...`, eftersom användarsajten har en egen domän. Se `docs/wp6-publicering.md` när det finns.
