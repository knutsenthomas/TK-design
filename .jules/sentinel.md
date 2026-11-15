## 2024-10-31 - Trust proxy security
**Vulnerability:** The application does not use `app.set('trust proxy', 1)` correctly (or it was removed), and manually extracts `req.headers["x-forwarded-for"]` for rate limiting and IP logging.
**Learning:** Manually parsing `x-forwarded-for` header opens up for IP spoofing because anyone can send a fake `x-forwarded-for` header, bypassing rate limiting. Express's `trust proxy` setting securely extracts the real IP when placed behind a proxy/load balancer, protecting against IP spoofing.
**Prevention:** Use `app.set('trust proxy', 1)` when behind a reverse proxy and rely on `req.ip` instead of manually reading `x-forwarded-for`.

## 2024-11-20 - Fix SSRF and Path Traversal in Firestore URLs
**Vulnerability:** The `/api/messages/:id` routes in `legacy_html/server.js` constructed Firestore API URLs dynamically using user inputs (`req.params.id` and `Object.keys(req.body)`) without sanitizing them. This allowed potential Server-Side Request Forgery (SSRF) and path traversal attacks where malicious inputs could modify the API path or query string parameters.
**Learning:** When using HTTP clients like `fetch` to proxy requests to an external API (like Firestore) based on user-controlled inputs, the URL structure must be protected. Unsanitized strings in paths or query strings can traverse directories (e.g. `../`) or append unauthorized query parameters (e.g. `?&something=else`).
**Prevention:** Always use `encodeURIComponent()` to wrap user inputs (such as ID path segments or dynamically generated query string keys/values) when constructing API URLs dynamically.
