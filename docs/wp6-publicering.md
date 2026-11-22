# WP 6: publicering (pågår)

Status 2026-11-22. Förs vidare av den som gör push och DNS-bytet.

## Gjort

- **GitHub Pages påslaget** för `rsandell/www.ambrosias.se` med källa **GitHub Actions** (`gh api -X POST repos/rsandell/www.ambrosias.se/pages -f build_type=workflow`). Ingen anpassad domän är satt än.
- **`static/CNAME`** (`www.ambrosias.se`) och en svensk **404-sida** (`content/404.md`, byggs till `404.html`, inte med i sitemap) är tillagda.
- **WP 0 och WP 1 dokumenterade** i `docs/wp0-wp1-beslut.md` (rekonstruerat från historiken).

## Att veta

- **Testadressen är inte `rsandell.github.io/...`.** GitHub visar `http://rsandell.com/www.ambrosias.se/`, eftersom användarsajten har en egen domän. Arbetsflödet sätter baseURL automatiskt från Pages, så det spelar ingen roll för bygget, men testa på den adress GitHub anger.
- **Med GitHub Actions som källa ignorerar GitHub filen `static/CNAME`.** Domänen sätts under Settings, Pages. Filen är kvar som dokumentation.
- **Inget av Hugo-sajten är pushat.** GitHub har bara den gamla sajten (`3f928d7`) och taggen `legacy-angularjs-2014`. `master` ligger flera commits före. Första pushen startar arbetsflödet (`on: push` till `master`).

## Kvar

1. Ägaren OK för push av `master`. Kontrollera att bygget i Actions går grönt och titta på sajten på testadressen (sidor, menyn, recept, album med bildspel och helskärm, klädkod, Drive-länkarna).
2. Sätt anpassad domän `www.ambrosias.se` i Settings, Pages, och verifiera domänen på kontot. Ändra DNS: `www` som CNAME till `rsandell.github.io`; `ambrosias.se` (apex) får GitHubs A- och AAAA-poster och skickas då vidare till `www`. **Rör inte MX- eller TXT-poster** (styrelsens adresser använder domänen). Kontrollera var MX pekar innan hemservern stängs av.
3. Slå på "Enforce HTTPS" när certifikatet är utfärdat.
4. Behåll den gamla servern en tid (återgång = peka DNS tillbaka). Radera inte `api/db/`, den innehåller också de andra databaserna.
5. Ägarens uppgifter: återkalla den gamla Blogger-nyckeln, slå på Dependabot security alerts, titta på ett album, `/album/nyar/` och vattenmärket för hand.
