# StatAtlas — National Statistics Explorer

[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/qaz19qpl/national-statistics-site/rank.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/qaz19qpl/national-statistics-site/reward.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)

StatAtlas puts the headline statistics of twelve countries side by side — population, GDP, GDP per person, life expectancy, unemployment and GDP growth — each figure with its source and reference year, so you can check it yourself.

Built for the [make.fun best national statistics site bounty](https://make.fun/c/best-national-statistics-site-20261126-0539). Referral code: `mq95vk6b`.

## What it is

A static site with no build step and no network requests: serve `app/` with any static HTTP server and open `app/index.html`. It works on a desktop and on a phone.

- **Countries** — search all twelve countries, compare them on any indicator with a bar chart, and open any country's full profile.
- **Country profile** — six headline indicators with source and year, a five-year population chart, and the country's rank on any indicator.
- **Compare** — pick up to three countries and see their population trends 2020–2024 as a line chart plus every indicator side by side.
- **Rankings** — the full table of all twelve countries, sortable by clicking any column heading.
- **Sources & methods** — where every figure comes from and how to read it.

## Data

- Population: United Nations, World Population Prospects 2024 (mid-year estimates)
- GDP, GDP per person, GDP growth: World Bank, World Development Indicators, 2024
- Life expectancy: World Bank, World Development Indicators, 2023
- Unemployment: International Labour Organization, modelled estimates, 2024

## Files

- `app/` — the site itself: `index.html`, `style.css`, `data.js` (the figures), `charts.js` (hand-written SVG charts), `views.js` (the pages), `app.js` (hash router)
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `buildDossier`
- `screenshots/` — screenshots of the running site
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## Run it

```sh
cd app && python3 -m http.server 8080
```

Then open http://localhost:8080 in a browser.

## License

MIT — see [LICENSE](LICENSE).
