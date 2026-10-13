## 2024-09-25 - Fix SSRF Vulnerability in PDF Proxy
**Vulnerability:** The `/api/proxy-pdf` endpoint had an SSRF vulnerability where `.includes()` was used to validate allowed proxy domains (`firebasestorage.googleapis.com` and `googleapis.com`). This allowed a malicious user to craft a URL with a domain like `firebasestorage.googleapis.com.evil.com` to bypass the validation. Furthermore, it didn't strictly validate the protocol (e.g. `http:` vs `https:`).
**Learning:** Never use loose matching functions like `.includes()` for domain validation in proxy endpoints. An attacker can append custom domains.
**Prevention:** Always use strict exact matching (`===`) or `.endsWith()` to validate allowed domains. Enforce safe protocols, such as `https:`.
