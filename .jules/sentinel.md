## 2024-05-24 - SSRF in PDF Proxy Endpoint
**Vulnerability:** Server-Side Request Forgery (SSRF) risk in `/api/proxy-pdf` due to loose domain matching (`.includes()`).
**Learning:** Using `.includes()` for domain validation allows bypasses (e.g., `attacker.com/?q=googleapis.com` or `googleapis.com.attacker.com`). Protocol validation (`https:`) was also missing.
**Prevention:** Always use strict exact matching or `.endsWith(.googleapis.com)` (with careful dot boundaries) and enforce the `https:` protocol when proxying URLs.
