## 2024-10-31 - Trust proxy security
**Vulnerability:** The application does not use `app.set('trust proxy', 1)` correctly (or it was removed), and manually extracts `req.headers["x-forwarded-for"]` for rate limiting and IP logging.
**Learning:** Manually parsing `x-forwarded-for` header opens up for IP spoofing because anyone can send a fake `x-forwarded-for` header, bypassing rate limiting. Express's `trust proxy` setting securely extracts the real IP when placed behind a proxy/load balancer, protecting against IP spoofing.
**Prevention:** Use `app.set('trust proxy', 1)` when behind a reverse proxy and rely on `req.ip` instead of manually reading `x-forwarded-for`.
## 2023-10-31 - URL Interpolation SSRF/Path Traversal Fix
**Vulnerability:** User-controlled input (like request parameters and object keys) was being interpolated directly into URLs for Firebase/Firestore fetch API requests in `app.patch` and `app.delete` endpoints in `legacy_html/server.js`.
**Learning:** Directly interpolating variables in constructed URLs without escaping allows an attacker to manipulate the URL path (e.g., using `../`) or query parameters, leading to Server-Side Request Forgery or Path Traversal, allowing unauthorized access or modification of other resources.
**Prevention:** Always use `encodeURIComponent()` when interpolating any external or user-provided input (including seemingly safe parameters like IDs or database/collection names) into a URL or query string.
