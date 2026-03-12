# Alcova Website - Technical Audit (2026-03-08)

## 1) Repository analysis

### Current stack
- Type: static multi-page website (no backend runtime in this repository)
- Core files: `index.html`, `styles.css`, `script.js`, `privacy-policy.html`, `cookie-policy.html`, `termini-condizioni.html`
- Static assets: `images/*`
- Build system: none
- Package/dependency manager: none
- CI/CD config: none
- Environment handling before refactor: none
- Environment/config handling after refactor: centralized client runtime config in `config.js`

### Architecture (current)
- Presentation: HTML pages + shared global stylesheet
- Behavior: shared JS bootstrap in `script.js`
- Data/operations: static copy + external services (Google Maps iframe, optional Google Translate, WhatsApp deep-link)

### Key issues found during audit (pre-refactor)
- Encoding corruption across pages (`Ã`, `â€™`, emoji corruption) reducing content quality and SEO readability
- Inline-script reliance and permissive CSP with inline allowances (`unsafe-inline`) in main page
- Cookie banner logic gated by an unrelated AOS check (banner failed when AOS missing)
- Multiple hardcoded operational values scattered in HTML/JS (WhatsApp number, menu URL, social URL, map URL)
- Accessibility gaps:
  - no skip link
  - hamburger lacked ARIA state management
  - placeholder-only form labels
  - icon-only social links without accessible text
- Security gaps:
  - external `target="_blank"` links lacking `rel="noopener noreferrer"`
  - broad CSP source list and inline script allowance
- Maintainability issues:
  - duplicated legal-page inline styles
  - duplicated/unused CSS blocks and undefined CSS vars (`--accent-color`, `--color-accent`)
  - JS injected a mobile-menu stylesheet at runtime
- Consistency issue: legal pages referenced `menu.html` which does not exist
- Privacy/legal mismatch risk: cookie text claimed only technical cookies while third-party integrations were present

## 2) Hardcoded-values and security inventory

### Values now centralized in `config.js`
- `contact.whatsappNumber`
- `contact.mapEmbedUrl`
- `contact.instagramUrl`
- `contact.tiktokUrl`
- `menu.brunchUrl`
- feature flags (`cookieBanner`, `googleTranslate`)

### Why these were risky when scattered
- Operational drift: different pages/scripts could diverge
- Harder incident response: endpoint change required edits in multiple files
- Higher chance of broken links during updates

### Safer alternative implemented
- Centralized runtime config (`config.js`) consumed by `script.js`
- Single-source update path for operational URLs/contact values
- Feature flagging for optional third-party integrations

### Remaining security boundary note
- This is a browser-delivered static app, so true secrets must never be stored client-side.
- If future integrations require private keys/tokens, move them to a backend API and inject only non-sensitive public configuration into the frontend.

## 3) Architecture review

### Assessment
- For the current scope (marketing + contact + WhatsApp booking), static architecture is valid.
- Main weaknesses are not framework-level but engineering hygiene: config sprawl, accessibility, CSP policy, and maintainability.

### Target architecture (implemented direction)
- `index.html` + legal pages as content layer
- `styles.css` as shared design system + responsive behavior
- `config.js` for runtime operational values and feature flags
- `script.js` as behavior layer with clearly separated initializers:
  - runtime config wiring
  - cookie consent
  - optional translation bootstrapping
  - mobile navigation
  - smooth scrolling
  - navbar state
  - booking flow
  - reveal animations

### Recommended next folder split (future)
- `assets/css/styles.css`
- `assets/js/config.js`
- `assets/js/main.js`
- `assets/images/*`
- `pages/*.html` (or static-site generator templates)

## 4) Modernization plan

### Completed in this pass
- Security hardening:
  - removed inline scripts
  - tightened CSP (`script-src 'self'` by default)
  - added `noopener noreferrer` to external links
- Configuration management:
  - introduced `config.js`
  - removed scattered business endpoints from logic
- Accessibility:
  - skip link
  - ARIA state for mobile nav
  - keyboard escape close
  - form labels via `.sr-only`
  - status region for form feedback
  - reduced-motion handling
- Maintainability:
  - replaced JS-injected CSS with static CSS
  - removed duplicated legal-page inline styles
  - fixed broken links and corrected copy encoding
- Performance and UX:
  - image dimensions and lazy loading on content imagery
  - simplified dependency surface (optional translate feature disabled by default)

### Still recommended (next iterations)
- Add image pipeline (WebP/AVIF, responsive `srcset`)
- Add automated checks (HTML validation, linting, Lighthouse CI)
- Add static hosting headers (CSP as response header, HSTS, cache-control)
- Add sitemap + robots.txt with production canonical domain

## 5) Performance and SEO

### Improvements implemented
- Added descriptive meta description and robots metadata on home page
- Added image dimensions + lazy loading to reduce CLS and bandwidth
- Added image preload for hero background asset
- Corrected malformed/garbled text that affected readability and indexing quality
- Strengthened semantic structure (`main`, better sectioning)

### Remaining constraints
- Large JPEG assets are still original quality and not next-gen formats
- No build pipeline to automate critical CSS, minification, or image optimization

## 6) UI/UX and accessibility

### Implemented
- Responsive mobile navigation with keyboard-safe behavior
- Focus-visible styles across interactive controls
- Cleaner social links and clearer hierarchy
- Improved legal pages readability and consistency
- Better booking-form feedback with inline status messaging

### Remaining
- Full WCAG audit (contrast matrix, screen-reader user testing)
- Optional multilingual IA beyond machine translation

## 7) Refactor summary

- Converted monolithic `script.js` into modular initializer functions
- Rebuilt `styles.css` into a coherent tokenized stylesheet
- Standardized page shells (nav/footer/headers/CSP/asset includes)
- Introduced centralized runtime config and removed duplication

## 8) Verification summary

- JS syntax check passed: `node --check script.js`
- Repository rescans found no obvious API keys/tokens/secrets
- No references to missing `menu.html` remain

