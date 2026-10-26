
## 2023-10-26 - [Trust Proxy configuration]
**Vulnerability:** IP Spoofing bypass rate-limiting and contact form submission.
**Learning:** Hard-coded header parsing (`req.headers["x-forwarded-for"]`) creates a vulnerability, as a malicious user can inject false IP addresses. `trust proxy` setting isn't properly enabled in Express server to correctly and securely rely on proxy headers.
**Prevention:** In a setup with reverse proxy, set `app.set('trust proxy', 1);` and rely on built-in properties like `req.ip` and `req.protocol`.
