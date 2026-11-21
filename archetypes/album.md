---
# Album skapas normalt med ./dev import-album, inte för hand.
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
category: "Nyår"        # Nyår | Valborg | Midsommar
year: 2000
# date: 2000-12-30      # Nyår = 30 dec, Valborg = 30 apr. Midsommar måste anges.
photographer: ""
photo_count: 0
photos_status: missing
draft: true
---
