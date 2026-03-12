# Alcova Lounge Bar Website

Static website for Alcova Lounge Bar.

## Structure
- `index.html`: homepage
- `privacy-policy.html`, `cookie-policy.html`, `termini-condizioni.html`: legal pages
- `styles.css`: shared styles
- `script.js`: shared frontend behavior
- `config.js`: runtime-configurable operational values
- `images/`: static assets
- `data/gallery-manifest.json`: auto-generated gallery source
- `scripts/generate-gallery-manifest.js`: manifest generator
- `docs/TECHNICAL_AUDIT_2026-03-08.md`: audit and modernization report

## Runtime configuration
All operational values are centralized in `config.js`.

Key fields:
- `contact.whatsappNumber`
- `contact.mapEmbedUrl`
- `contact.instagramUrl`
- `contact.tiktokUrl`
- `menu.brunchUrl`
- `features.cookieBanner`
- `features.googleTranslate`

## Security notes
- CSP is defined via `<meta http-equiv="Content-Security-Policy">` in each page.
- If `features.googleTranslate` is set to `true`, update CSP accordingly to allow translate domains.
- Never store secrets in frontend files.

## Local preview
You can serve the folder with any static server.

Example (PowerShell with Python installed):

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Gallery workflow (automatic manifest)
The gallery page is populated from `data/gallery-manifest.json`, not from hardcoded `<img>` tags in HTML.

To add new gallery images:
1. Copy new files into `images/` (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`).
2. Regenerate the manifest:

```powershell
npm run gallery:manifest
```

3. Reload the site.

Notes:
- No backend is required: everything stays static.
- Layout variation is stable (deterministic), so the same images keep a consistent visual composition across refreshes.
