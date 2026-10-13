## 2024-05-18 - SSRF Vulnerability in proxy-pdf endpoint
**Vulnerability:** Server-Side Request Forgery (SSRF) vulnerability in the `/api/proxy-pdf` endpoint due to loose URL validation using `.includes('googleapis.com')` instead of strict matching. An attacker could bypass the check by providing a URL like `http://attacker.googleapis.com.evil.com`.
**Learning:** URL validation using `.includes()` is dangerous because it allows attackers to bypass domain checks by incorporating the target string anywhere in the hostname or path.
**Prevention:** Always use strict protocol validation (e.g., `protocol === 'https:'`) and strict domain validation (e.g., `hostname === 'target.com'` or `hostname.endsWith('.target.com')`) when proxying requests to external URLs.
