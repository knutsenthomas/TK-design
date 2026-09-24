## 2024-05-24 - [Auth Bypass & SSRF]
**Vulnerability:**
1. Auth Bypass via Host Header Injection in `verifyAdminToken`. It relies on `req.hostname` which can be easily spoofed by an attacker setting the `Host` header.
2. SSRF in `/api/proxy-pdf`. The endpoint fetches any URL provided, and the domain validation `.includes()` check can be bypassed by an attacker registering a domain like `googleapis.com.attacker.com`.

**Learning:**
1. Never trust user-provided headers like `Host` for security-critical checks like local access verification.
2. When proxying requests, always validate protocols (`https:`) and strictly match hostnames using exact string matching or `.endsWith('.googleapis.com')`.

**Prevention:**
1. Use `req.ip` and `req.socket.remoteAddress` to verify local connections instead of `req.hostname`.
2. Strictly enforce URL validation for proxied resources.
