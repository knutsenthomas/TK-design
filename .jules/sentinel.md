## 2026-08-25 - [Fix SSRF vulnerability in proxy-pdf]
**Vulnerability:** Server-Side Request Forgery (SSRF) bypass in the `/api/proxy-pdf` endpoint due to using `.includes('googleapis.com')` for domain validation. This allowed attackers to use domains like `evil-googleapis.com`.
**Learning:** Checking for substrings in hostnames is insecure.
**Prevention:** Use strict equality (`===`) or correct suffix matching (`.endsWith('.googleapis.com')`) for hostnames.
