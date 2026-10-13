## 2024-05-18 - [Fix SSRF vulnerability in URL validation]
**Vulnerability:** The `/api/proxy-pdf` endpoint in `legacy_html/server.js` validated domains using `.includes()`, which allowed an attacker to bypass the check (e.g. `firebasestorage.googleapis.com.evil.com`) and permitted non-HTTPS protocols, creating an SSRF vulnerability.
**Learning:** Checking for allowed domains using string subset searches (`.includes()`) is insecure because it matches unauthorized domains containing the target string as a substring. Not checking protocols allows unintended schemes.
**Prevention:** Always use strict equality (`===`) and `.endsWith()` with a leading dot for domain validation, and strictly check protocols (`protocol === 'https:'`) when proxying or fetching user-supplied URLs.
