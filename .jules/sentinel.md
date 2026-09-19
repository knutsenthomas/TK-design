## 2024-03-24 - SSRF vulnerability in Proxy PDF Endpoint
**Vulnerability:** Server-Side Request Forgery (SSRF) in `/api/proxy-pdf` endpoint due to weak URL validation. The code used `.includes()` to validate domains, allowing requests to arbitrary servers (e.g. `malicious.com/?q=googleapis.com`) and did not restrict the protocol, allowing `http` or potentially other schemes.
**Learning:** Using `.includes()` for domain validation is insecure as it matches anywhere in the string. Protocol must also be strictly enforced when fetching remote resources.
**Prevention:** Always use strict equality (`===`) or `.endsWith()` for domain validation. Always strictly validate the protocol (e.g., `parsed.protocol === 'https:'`).
