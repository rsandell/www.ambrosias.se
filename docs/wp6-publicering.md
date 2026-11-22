# WP 6: publicering (pågår)

Status 2026-11-22. Förs vidare av den som gör push och DNS-bytet.

## Gjort

- **GitHub Pages påslaget** för `rsandell/www.ambrosias.se` med källa **GitHub Actions** (`gh api -X POST repos/rsandell/www.ambrosias.se/pages -f build_type=workflow`). Ingen anpassad domän är satt än.
- **`static/CNAME`** (`www.ambrosias.se`) och en svensk **404-sida** (`content/404.md`, byggs till `404.html`, inte med i sitemap) är tillagda.
- **WP 0 och WP 1 dokumenterade** i `docs/wp0-wp1-beslut.md` (rekonstruerat från historiken).

## Push och första bygget (2026-11-22)

- `master` pushades (`3f928d7..4b9d066`). Arbetsflödet "Publicera sajten" gick grönt och sajten ligger på `http://rsandell.com/www.ambrosias.se/`.
- Genomgång av den publicerade sajten: 40 sidor och tillgångar hämtades via länkarna från startsidan, 0 felaktiga länkar, inga absoluta länkar till fel domän. Startsidan, recept, ett recept, albumsidor (även `/album/nyar/` med 136 KB data), klädkod, info, om, 404-sidan, favicon, sitemap och `robots.txt` svarar 200 och bilder laddas. `/blogg/` ger 404, som det ska (utkast).
- **Bara HTTP på testadressen.** `https://rsandell.com/...` ger certifikatfel (domänen tillhör användarsajten, inte den här sajten), och `https://rsandell.github.io/www.ambrosias.se/` omdirigerar till `http://rsandell.com/...`. Det påverkar bara testet. Med `www.ambrosias.se` som anpassad domän får sajten eget certifikat.
- Dependabot körde sina första uppdateringskontroller direkt efter pushen och kan öppna pull requests. De tidigare säkerhetslarmen gällde den gamla `node/package.json` (express, mysql) och står som åtgärdade.
- Bildvisaren, bildspelet och helskärm är inte provade på den publicerade sajten (bara hämtning av sidorna). Titta på dem en gång för hand.

## Att veta

- **Testadressen är inte `rsandell.github.io/...`.** GitHub visar `http://rsandell.com/www.ambrosias.se/`, eftersom användarsajten har en egen domän. Arbetsflödet sätter baseURL automatiskt från Pages, så det spelar ingen roll för bygget, men testa på den adress GitHub anger.
- **Med GitHub Actions som källa ignorerar GitHub filen `static/CNAME`.** Domänen sätts under Settings, Pages. Filen är kvar som dokumentation.
- **Inget av Hugo-sajten är pushat.** GitHub har bara den gamla sajten (`3f928d7`) och taggen `legacy-angularjs-2014`. `master` ligger flera commits före. Första pushen startar arbetsflödet (`on: push` till `master`).

## Kvar

1. ~~Push och första bygge~~ gjort (se ovan). Kvar: titta själv på testadressen (menyn, album med bildspel och helskärm, Drive-länkarna).
2. Sätt anpassad domän `www.ambrosias.se` i Settings, Pages, och verifiera domänen på kontot. Ändra DNS: `www` som CNAME till `rsandell.github.io`; `ambrosias.se` (apex) får GitHubs A- och AAAA-poster och skickas då vidare till `www`. **Rör inte MX- eller TXT-poster** (styrelsens adresser använder domänen). Kontrollera var MX pekar innan hemservern stängs av.
3. Slå på "Enforce HTTPS" när certifikatet är utfärdat.
4. Behåll den gamla servern en tid (återgång = peka DNS tillbaka). Radera inte `api/db/`, den innehåller också de andra databaserna.
5. Ägarens uppgifter: återkalla den gamla Blogger-nyckeln, slå på Dependabot security alerts, titta på ett album, `/album/nyar/` och vattenmärket för hand.
