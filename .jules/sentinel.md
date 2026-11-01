## 2024-10-31 - Trust proxy security
**Vulnerability:** The application does not use `app.set('trust proxy', 1)` correctly (or it was removed), and manually extracts `req.headers["x-forwarded-for"]` for rate limiting and IP logging.
**Learning:** Manually parsing `x-forwarded-for` header opens up for IP spoofing because anyone can send a fake `x-forwarded-for` header, bypassing rate limiting. Express's `trust proxy` setting securely extracts the real IP when placed behind a proxy/load balancer, protecting against IP spoofing.
**Prevention:** Use `app.set('trust proxy', 1)` when behind a reverse proxy and rely on `req.ip` instead of manually reading `x-forwarded-for`.

## 2023-11-01 - Path Traversal via Unencoded User Input in SSRF/Fetch
**Vulnerability:** User-provided parameters like `req.params.id` were directly injected into server-to-server `fetch` URLs without being URL-encoded. This could allow an attacker to inject characters like `../` to traverse directories and access or modify unauthorized Firestore paths (SSRF/Path Traversal).
**Learning:** Even internal backend requests using `fetch` or `axios` are susceptible to injection attacks if URL components are constructed using unencoded user input. Express routing decodes URL parameters, so they must be re-encoded before being used in new URLs.
**Prevention:** Always sanitize and encode user-supplied inputs using `encodeURIComponent()` when constructing URLs or query parameters for internal or external API calls.
