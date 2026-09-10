
## 2024-05-18 - [SSRF in Proxy PDF Endpoint]
**Vulnerability:** The `/api/proxy-pdf` endpoint used loose `.includes()` matching for domain validation and did not restrict the protocol to HTTPS, allowing potential Server-Side Request Forgery (SSRF) bypasses (e.g., matching `my-googleapis.com.evil.com` or using `http:`/`file:`).
**Learning:** Using `.includes()` on a hostname is dangerous because it can match subdomains or unexpected domains. However, using strict exact matching (e.g., `['googleapis.com']`) can cause functional regressions if the endpoint is meant to accept various subdomains like `storage.googleapis.com` or `firebasestorage.googleapis.com`. The lack of protocol validation also leaves the door open to other URL schemes.
**Prevention:** Use a combination of exact match (`=== 'domain.com'`) and suffix match (`.endsWith('.domain.com')`) to securely validate domains while allowing their subdomains. Always validate the URL protocol (e.g. `parsed.protocol === 'https:'`).
