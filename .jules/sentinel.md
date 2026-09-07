## 2025-05-16 - [Host Header Injection and SSRF]
**Vulnerability:**
1. Authentication bypass in `verifyAdminToken` due to validating against `req.hostname === 'localhost'`. This allows external attackers to bypass authentication on admin endpoints by forging the `Host: localhost` HTTP header.
2. SSRF vulnerability in `/api/proxy-pdf` due to loose `.includes('googleapis.com')` validation for domains, allowing attackers to proxy requests to endpoints like `attacker-googleapis.com`.
3. Some sensitive `/api/` endpoints lacked `verifyAdminToken` middleware altogether, leading to unauthenticated access to admin routes.

**Learning:**
1. `req.hostname` derives from the `Host` HTTP header in Express, which is fully user-controllable. It should never be used as a trusted source for verifying a request originates from the local loopback interface.
2. Loose domain validation using `.includes()` is dangerous because it permits subdomain or domain spoofing.

**Prevention:**
1. Rely on `req.ip` and `req.socket.remoteAddress` and validate strictly against loopback IPs (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`) rather than `req.hostname`.
2. Use strict string validation like `===` or `.endsWith('.trusted-domain.com')` (with the dot prefix) to prevent domain spoofing.
3. Ensure all administrative routes are consistently wrapped with authentication middleware.
