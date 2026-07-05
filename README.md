# Themahuisjes

Next.js website for Themahuisjes with multi-language support (NL, FR, DE, EN).

## Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [next-intl](https://next-intl.dev/) for internationalization
- Static generation (SSG) for all pages

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — Dutch is the default locale at `/`.

## Locales

| Locale | URL prefix | File |
|--------|------------|------|
| Nederlands (default) | `/` | `src/messages/nl.json` |
| Français | `/fr` | `src/messages/fr.json` |
| Deutsch | `/de` | `src/messages/de.json` |
| English | `/en` | `src/messages/en.json` |

FR, DE and EN currently contain Dutch placeholder text. Replace via DeepL and update the corresponding JSON files.

## Project structure

```
src/
├── app/[locale]/          # Pages per locale
├── components/            # React components
├── data/huisjes.ts        # Structural data (beds, parking, slugs)
├── i18n/                  # next-intl routing & navigation
├── messages/              # Translation files (DeepL target)
└── styles/                # CSS (migrated from static site)
public/
├── assets/                # Favicons
└── huisjes/*/img/         # Property images & gallery manifests
```

## Adding translations

1. Export or copy strings from `src/messages/nl.json`
2. Translate with DeepL
3. Paste into `fr.json`, `de.json`, or `en.json`
4. Keep JSON keys identical across all locale files

## Build & deploy

```bash
npm run build
npm start
```

Deploy to Vercel, Netlify, or any Node.js host. All pages are statically generated at build time.

## Legacy static site

The original HTML site is preserved in `_legacy/` for reference.
