# Album som väntar på bilder

Båda finns som `draft: true`-sidor utan bilder, så sajten byggs utan dem.

| Album | Fotograf | Sida | Var bilderna finns |
|---|---|---|---|
| Nyår 2012 (gamla id 19) | Henrik Karlsson | `content/album/nyar/2012/henrik-karlsson/` | Henrik Karlsson, t.ex. Google Takeout |
| Midsommar 2008 (19 bilder i gamla Gallery2) | Mogge | `content/album/midsommar/2008/mogge/` | Mogge, gamla serverns `g2data/` |

När zipfilen finns: lägg den i `../gallery/` (eller valfri mapp) och kör

    ./dev import-album "Nyår 2012 Henrik Karlsson.zip"
    ./dev import-album "Midsommar 2008 Mogge.zip" --date 2008-06-20

Skriptet fyller i bilderna, uppdaterar `photo_count`, tar bort `draft` (även på
kategori- och årssidorna) och `photos_status`.
