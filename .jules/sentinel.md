## 2024-03-24 - [CRITICAL] Prevent SSRF in domain validation
**Vulnerability:** The `/api/proxy-pdf` endpoint validated URLs using `.includes('googleapis.com')`. This allowed SSRF (Server-Side Request Forgery) because a malicious URL like `http://googleapis.com.malicious.com` would pass the validation check.
**Learning:** Using `.includes()` on hostnames is insecure as it matches anywhere in the string, allowing bypasses using subdomains or similarly named malicious domains. Additionally, protocols must be strictly validated.
**Prevention:** Always use strict domain matching (`===` or `.endsWith('.domain.com')`) and explicitly check `parsed.protocol === 'https:'` when validating URLs for proxying or fetching external resources.
