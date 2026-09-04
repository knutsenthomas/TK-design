
## 2024-05-24 - SSRF Vulnerability in /api/proxy-pdf
**Vulnerability:** The `/api/proxy-pdf` endpoint used `.includes('googleapis.com')` to validate the domain of the URL it was proxying. This allowed attackers to bypass the check using domains like `https://attacker-googleapis.com`.
**Learning:** Using `.includes()` for domain validation is insecure because it matches substrings anywhere in the hostname.
**Prevention:** Always use exact matching (`===`) or strict suffix matching (`.endsWith('.domain.com')`) for domain validation. Additionally, enforce the expected protocol (e.g., `https:`).
