## 2023-10-24 - [Fix SSRF vulnerability in Proxy PDF]
**Vulnerability:** Server-Side Request Forgery (SSRF) bypass in domain validation.
**Learning:** Using `.includes()` for URL validation allows bypasses by appending domains (e.g. `googleapis.com.evil.com`) or embedding in paths if not careful.
**Prevention:** Use `.endsWith()` to check subdomains and exact matches for domain validation along with protocol validation.
