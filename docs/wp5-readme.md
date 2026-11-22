# WP 5: README, licenser, tredjepartsnotiser och Dependabot

Kompletterar `docs/migration.md` (avsnitt 7, 8 och 9). Nya filer: `README.md`, `THIRD-PARTY-NOTICES.txt`, `.github/dependabot.yml`.

## Vad som gjordes

- **README.md** på svenska med alla avsnitt från planen (Översikt, Mappar, Lägg till recept/album/dokument, Styrelsen, Info-sida och sidor, Blogg, Publicera, Felsökning, Underhåll) samt checklistan före publicering och avsnittet **Bildvisaren** (knapparna och Space, krav från `docs/wp3-5-slideshow.md`).
- **THIRD-PARTY-NOTICES.txt:** PhotoSwipe 5.4.4 med MIT-texten och rätt copyright (2014-2022 Dmitry Semenov), Cream paper (Devin Holmes), Color Scheme Designer (Petr Stanicek), samt bygg-verktygen Hugo (Apache-2.0) och Pillow.
- **Dependabot:** månadsvis, en samlad pull request per ekosystem, för `github-actions` och `docker`.
- **Licensfilerna** (`LICENSE`, `LICENSE-CONTENT.txt`) var redan omdöpta och fixade (tecknet i "Föreningen", åren 2013-2026 och 2005-2026) av tidigare paket. Ingen ändring behövdes. Om-sidan stämmer med dem.

## Avvikelser från planen

- **Dependabot för `npm` utelämnad.** PhotoSwipe är vendorad, inte installerad med npm, och det finns ingen `package.json`. Ett npm-block skulle bara ge fel. `docker` lades till enligt planens avsnitt "Containerised tooling".
- **Hugo-versionen bevakas inte av Dependabot.** Den ligger som `ARG HUGO_VERSION` i `Dockerfile` (hämtas som en release-tarball), vilket Dependabot inte läser. `docker`-blocket bevakar bara basbilden `python:3.12-slim`. README säger det och ber om en årlig manuell kontroll av Hugo och PhotoSwipe.
- **"Slå på Dependabot security alerts"** är en inställning på GitHub och kan inte göras från repot. Den står i README som uppgift för ägaren.
- Planens exempel `migration/scripts/import_album <zip>` ersattes i README av `./dev import-album <zip>` (det som faktiskt fungerar utan lokala installationer).

## Testat

Alla kommandon i README kördes mot repot (Docker 29.1.3; Podman finns inte på maskinen och är **inte** testat):

- `./dev build` och `./dev build -D` gröna; `./dev build --drafts` ger fel, som README säger.
- `./dev new recept/...`, `album/...` och `blogg/2026/...` skapar rätt filer med mallarna (testfilerna togs bort).
- `./dev import-album "Valborg 2007-Bobby.zip"` ger samma album som i repot, `git status` visade inga ändringar (idempotent).
- Bloggbytet (`native = true` plus bort med `draft` i `content/blogg/_index.md`): `/blogg/` byggs, "Äldre inlägg på Blogspot" visas, RSS finns på `/blogg/index.xml`. Ändringen återställdes.
- Inte körda: `./dev serve` i webbläsare (bara bygget), `git clone`-raden, `./dev shell` interaktivt, `./dev rebuild-image`.

## Saknas eller skjutet upp

- `static/CNAME` finns inte än och läggs till i WP 6. README beskriver det som något som görs vid publiceringen.
- Dependabot security alerts och GitHub Pages-inställningarna görs av ägaren på GitHub (WP 6).
- README är inte läst av en person som inte är utvecklare. Gör en genomläsning innan publicering.
- `docs/wp2-wp3-decisions.md` har en gammal punkt "Ännu inte gjort ... `README.md`, `THIRD-PARTY-NOTICES.txt`, Dependabot (WP 5)". Den är nu gjord (detta dokument är posten).
- `migration/logo-trial/psd_to_svg.py` har ändringar som inte kommer från WP 5 (WP 4 pågår). De ingår inte i WP 5-committen.
