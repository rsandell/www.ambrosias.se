# Review before WP 6: findings to fix

Code review of WP 1 to 5 (up to commit `6837f7c`), done 2026-11-22 against `docs/migration.md` and the stage documents.
Verdict: the work is good and follows the plan. Fix items 1 and 2 before WP 6. Items 3 to 5 should be fixed but do not block WP 6, and items under "Nits" are optional.

Rules for the agent doing this: read `docs/migration.md` section 0 and 9 first (work on `master`, no push, follow the rules there about asking the owner before committing). When done, write the stage document `docs/review-fixes.md` (what was fixed, what was not and why) and correct the false claims in the existing docs listed below.

## Must fix before WP 6

### 1. Internal links break when the site is served under a sub-path

WP 6 step 1 is testing on `https://rsandell.github.io/www.ambrosias.se/` (baseURL with a path). In that build 17 internal link targets are broken: the logo link on every page, all klädkod cross-links (index and sub pages), and the two `/album/` links on the Om page. With the production baseURL there are 0 broken links.

Cause: Hugo's `relURL` does **not** add the baseURL path to input that starts with `/` (documented Hugo behaviour). So:

- `layouts/_markup/render-link.html:4` `{{ $dest = $dest | relURL }}` leaves `/klädkod/frack/` unchanged.
- `layouts/_partials/header.html:4` `{{ "/" | relURL }}` gives `/`.

Fix:

- render hook: `{{ $dest = strings.TrimPrefix "/" $dest | relURL }}` (keep the existing check that skips `//` protocol-relative links).
- header: `href="{{ site.Home.RelPermalink }}"`.
- Grep `layouts/` for any other `"/..." | relURL` and fix the same way (menu links are fine, Hugo handles them).
- `docs/wp2-wp3-decisions.md` ("Länkar i Markdown") says this already works under the sub-path. Correct it.

Verify (see "How to verify" below): build with `--baseURL https://rsandell.github.io/www.ambrosias.se/` and with the production baseURL. Both must give 0 broken links.

### 2. `./dev serve --drafts` does not work

`hugo server` has no `--drafts` flag (only `-D` / `--buildDrafts`), so it fails with `ERROR command error: unknown flag: --drafts`. Checked with the pinned Hugo 0.170.1. Yet `--drafts` is documented as working in:

- `dev:52` (usage text `serve [--drafts]`)
- `README.md` lines 15, 37, 91 and 231 (the Felsökning table)
- `docs/wp2-wp3-decisions.md` ("Hugo-flaggan för utkast är `-D` ... `./dev serve --drafts` stämmer med `hugo server`")

Fix: in `dev`, translate `--drafts` to `-D` for both `serve` and `build`, for example before the `case`:

```sh
for a; do shift; [ "$a" = --drafts ] && a=-D; set -- "$@" "$a"; done
```

Then both `./dev serve --drafts` and `./dev build --drafts` work. Update the README: remove the caveat on line 37 and the Felsökning row for `./dev build --drafts` on line 239, and keep `--drafts` as the documented flag. Correct the decisions doc.

Verify: `./dev build --drafts` builds and includes `content/album/nyar/2012/henrik-karlsson/`. `./dev serve --drafts` starts and serves the draft albums (stop with Ctrl+C).

## Should fix (does not block WP 6)

### 3. Contrast still below WCAG AA in a few places

The plan (section 4, "Contrast to fix") asks for 4.5:1 for normal text and specifically warns against light text on mid blue. Measured:

| Where | Colours | Ratio | Needed |
|---|---|---|---|
| `assets/css/main.css:144` active recipe in the list | `#fff` on `--blue-mid` `#658ADD` | 3.4:1 | 4.5:1 |
| `assets/css/main.css:158` and `:163` footer text and link (0.9rem) | `--gold` on `--blue` | 4.1:1 | 4.5:1 |
| `assets/css/main.css:137` `.badge` (0.8em) | `#fff` on `--bronze` `#9A7B3D` | 4.0:1 | 4.5:1 |
| `assets/css/main.css:50` focus outline on the page background | `--gold` on cream `#f4efe2` | 1.9:1 | 3:1 (non-text) |

Suggestions: active recipe `--navy` background with `#fff` or `--gold-light` text (like the course tabs). Footer text `--gold-light` (6.6:1) and keep gold for the border line. Badge: darken the bronze slightly or use `--navy`. Focus: use `--blue` or `--navy` for the outline on light backgrounds and keep gold only inside the header/footer (`.site-header :focus-visible`). Small tone changes are allowed by the plan.

### 4. `import_album` throws away manual edits in `index.md`

`migration/scripts/import_album:347` rewrites the whole `index.md`. Only `date`, `cover` and `legacy_id` are kept (`read_old`, line 204). Any body text or extra front matter added by hand is lost on a re-run, and the README does not warn about this. Also `read_old` reads `title` but never uses it.

Fix (pick one): keep everything after the closing `---` (the body) when rewriting, and ideally unknown front matter keys too; or at least document in the README ("Lägg till album") that a re-import overwrites `index.md` except `date`, `cover` and `legacy_id`. Remove the unused `title` read, or use it (keep a hand-edited title unless `--title` is given) and document whichever you pick.

Related edge case at line 178: when the photo needed resizing (`need_resize`) but the re-encoded result is larger than the original file, the **full-size original** is used. That breaks the "max 1600 px" rule. None of the current 2,282 files hit this (checked: none exceed 1600 px, thumbnails none exceed 400 px), but fix it: when `need_resize` is true, always use the resized image.

Minor in the same function: a CMYK JPEG is converted to RGB but its CMYK ICC profile is still embedded (`encode(im, q_web, icc)`). Drop `icc` when the source mode was not RGB/L.

### 5. Mobile menu needs JavaScript

`assets/css/main.css:106` hides `#site-nav` below 52rem until the toggle script adds `.open`. Without JS there is no navigation on phones. Fix: hide the menu only when JS is running, for example add a `js` class to `<html>` from an inline script in `<head>` and use `.js #site-nav { display: none }`. Do not break the existing toggle.

## Nits (optional)

- `assets/css/main.css`: `.lead` is defined twice (lines 118 and 172). `thead { display: none; }` (line 191) is global. Scope it to the klädkod tables if that is what it is for.
- Taxonomy list pages have English or ASCII titles: `/courses/` shows "Courses", `/ar/` shows "Ar". Both are in `sitemap.xml`. Add `content/courses/_index.md` (title "Kurser") and `content/ar/_index.md` (title "År"), or exclude them from the sitemap.
- `layouts/_partials/doc-item.html:6` always shows "(PDF)" for a local `file`. Derive it from the extension (`path.Ext`).
- `data/dokument.yaml`: "Stadgar 2.0" has no `year`. The plan's example has `year: 2021`. Ask the owner, don't guess.
- `assets/js/album.js:65` overrides `pswp.goTo` using PhotoSwipe internals (`mainScroll.moveIndexBy`, `potentialIndex`). It matches the vendored 5.4.4 `goTo` apart from the animate flag (checked), so it is fine now. Add a line to the README's "Uppdatera PhotoSwipe" item saying to recheck it after an upgrade.
- `layouts/home.html:5`: the home photo is above the fold but has `loading="lazy"` and no `width`/`height` (it is 700x442). Remove lazy and add the dimensions.

## Checked and OK (no action)

- `hugo --gc --minify` is green. The "Template ... is unused" warnings from `--printUnusedTemplates` are false positives (the taxonomy and term templates do render).
- Production baseURL build: 0 broken internal links.
- Photos: 2,282 files, 216 MB, none over 1600 px (thumbnails none over 400 px), no EXIF left.
- `convert_recipes` and `convert_pages` re-run from the sources give output byte-identical to the committed `content/recept/` and `content/klädkod/`, and all word checks pass.
- Draft albums (Nyår 2012, Midsommar 2008) are not in the build.
- Nothing from `migration/db/`, no zips and no secrets are tracked. `.git` is 229 MB.
- WP 3.5 slideshow behaviour matches the spec. WP 4 logo is within budget (15 KB gzipped).

## How to verify

Build into a temp folder without touching the repo (from the repo root, with the `ambrosias-site` image built):

```sh
OUT=$(mktemp -d)
for b in "https://www.ambrosias.se/ prod" "https://rsandell.github.io/www.ambrosias.se/ sub"; do
  set -- $b; mkdir -p "$OUT/$2"
  docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/site:ro" -v "$OUT/$2:/out" ambrosias-site \
    hugo --gc --minify --baseURL "$1" -d /out --cacheDir /tmp/c --noBuildLock
done
```

Link check (save outside the repo, run with `python3 -I linkcheck.py <dir> <path-prefix>`, e.g. `"$OUT/prod" /` and `"$OUT/sub" /www.ambrosias.se/`). It must print `broken 0` for both:

```python
import os, re, sys, html, urllib.parse
root, prefix = sys.argv[1], sys.argv[2]
bad = {}
for dp, _, fs in os.walk(root):
    for f in fs:
        if not f.endswith(".html"):
            continue
        p = os.path.join(dp, f)
        for m in re.finditer(r'(?:href|src)=["\']?([^"\'\s>]+)', open(p, encoding="utf-8").read()):
            u = html.unescape(m.group(1))
            if re.match(r'^(https?:|mailto:|#|data:|//)', u):
                continue
            u = u.split("#")[0].split("?")[0]
            if not u:
                continue
            if not u.startswith("/"):
                u = "/" + os.path.relpath(os.path.join(dp, u), root)
            fp = os.path.join(root, urllib.parse.unquote(u[len(prefix):])) if u.startswith(prefix) else None
            if fp and os.path.isdir(fp):
                fp = os.path.join(fp, "index.html")
            if not fp or not os.path.exists(fp):
                bad.setdefault(u, set()).add(p[len(root):])
for u, ps in sorted(bad.items()):
    print("BROKEN", u, "<-", sorted(ps)[:3])
print("broken", len(bad))
```

Also: `./dev build` and `./dev build --drafts` are green, `./dev serve --drafts` starts, and an album page plus the combined view `/album/nyar/` still open the lightbox with the slideshow buttons (headless Chrome as in `docs/wp3-5-slideshow.md`, or by hand).
