# Source and deployment structure

The deployed application starts at `legacy_html/server.js`. It retains route registration, security middleware and startup order. Backend implementations live in `legacy_html/server/`, grouped into Firebase storage, page/SEO rendering, performance reports, content generation, social publishing and site data. The shared context resolves dependencies when operations run; requests keep the same data sources and authorization boundaries.

## Editable assets

- Edit JavaScript in `legacy_html/js/`. Matching root/public assets are filesystem aliases, not independent source copies.
- Edit CSS in `legacy_html/styles/`. `manifest.json` records the cascade order. Run `npm run build:styles` in `legacy_html/` to generate `style.css`; it is also generated before startup and Vercel builds.
- `legacy_html/public/style.css` points to that same generated stylesheet.
- `legacy_html/public/admin/` remains the source of the administration UI. Archive folders are historical references, not active editing targets.
- Each independently deployed website keeps its own consent controller. Do not replace it with an externally hosted tracking dependency.

Run `node --test tests/*.test.js` from `legacy_html/`. Tests mock outbound providers. Generated CSS must match `scripts/build-styles.cjs` exactly.
