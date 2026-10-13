## 2024-05-30 - Fix SSRF Vulnerability in /api/proxy-pdf
**Vulnerability:** A Server-Side Request Forgery (SSRF) vulnerability was identified in the `/api/proxy-pdf` endpoint. The endpoint took a user-provided URL and fetched it server-side. The validation used `.includes('googleapis.com')` to check the hostname, which could easily be bypassed with malicious subdomains or similarly named domains.
**Learning:** URL validation using loose substring matching methods like `.includes` is insufficient and vulnerable to bypass.
**Prevention:** Use strictly matching logic for exact domain names (`===`) or end-of-string matching for specific subdomains (`.endsWith()`). Also restrict the allowed protocol to prevent usage of schemes like `file://` or `http://`.
