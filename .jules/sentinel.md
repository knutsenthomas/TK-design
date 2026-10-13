## 2025-02-14 - Fix SSRF in proxy-pdf endpoint
**Vulnerability:** Server-Side Request Forgery (SSRF) allowed bypassing validation in `/api/proxy-pdf` using loose `.includes()` checks for the hostname, and allowed non-HTTPS protocols.
**Learning:** Using `.includes()` on `hostname` can be bypassed by an attacker registering a domain like `googleapis.com.attacker.com`. Additionally, failing to strictly validate the URL protocol enables SSRF attacks using `http:` or other protocols.
**Prevention:** Always use exact matching or strict suffix matching (`.endsWith()`) when validating domains for request proxying, and strictly validate the `https:` protocol.
