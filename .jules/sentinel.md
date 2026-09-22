## 2024-03-24 - [Strict URL Validation for Proxy Endpoints]
**Vulnerability:** The `/api/proxy-pdf` endpoint in `legacy_html/server.js` was vulnerable to Server-Side Request Forgery (SSRF) because it used `.includes()` for domain validation and did not verify the protocol.
**Learning:** Using `.includes()` allows bypasses like `googleapis.com.evil.com`. Failing to enforce the `https:` protocol can also lead to unintended request types.
**Prevention:** Always use strict domain matching (e.g., checking exactly for `domain.com` or `.endsWith('.domain.com')` to avoid spoofing like `evildomain.com`) and enforce protocol checks (e.g. `protocol === 'https:'`) when proxying requests based on user-supplied URLs.
