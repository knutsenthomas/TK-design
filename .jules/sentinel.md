## 2024-05-15 - Fix SSRF Vulnerability in /api/proxy-pdf
**Vulnerability:** Weak domain validation in `/api/proxy-pdf` allowed Server-Side Request Forgery (SSRF) because `.includes()` was used instead of exact matching or `.endsWith()`, and protocol validation was missing.
**Learning:** Using `String.prototype.includes()` for URL hostname validation allows attackers to bypass restrictions by crafting malicious domains (e.g., `attacker-firebasestorage.googleapis.com.evil.com`).
**Prevention:** Always use exact matching (`===`) or strict suffix matching (`.endsWith()`) with a leading dot for domain validation, and explicitly restrict allowed protocols (e.g., `https:`).
