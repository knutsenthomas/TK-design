
## 2025-09-15 - [SSRF in Proxy Endpoint]
**Vulnerability:** Weak domain validation using `.includes()` in `/api/proxy-pdf` allowed Server-Side Request Forgery (SSRF) bypasses (e.g., `attacker.com/?firebasestorage.googleapis.com`). Also missing protocol validation.
**Learning:** `URL.hostname` must be validated strictly using exact matches and `.endsWith()` with a dot to prevent subdomain takeovers/bypasses. Protocol must also be enforced to `https:`.
**Prevention:** Use strict hostname validation and enforce `https:` protocol when proxying user-supplied URLs.
