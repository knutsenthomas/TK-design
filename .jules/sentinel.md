## 2025-02-14 - Fix vulnerable `x-forwarded-*` header extraction
**Vulnerability:** IP Spoofing vulnerabilities caused by manually parsing the `x-forwarded-for` and `x-forwarded-proto` headers directly from the `req.headers` object.
**Learning:** `legacy_html/server.js` manually extracted these values to determine the client IP (for rate limiting and contact form logging). This allowed attackers to easily forge IPs and circumvent rate limiters if placed behind certain reverse proxies.
**Prevention:** Always configure `app.set('trust proxy', 1)` in Express when deployed behind a reverse proxy (like Vercel) and rely on Express' native abstractions (`req.ip`, `req.protocol`) instead of manually reading headers.
