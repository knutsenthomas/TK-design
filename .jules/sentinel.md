
## 2023-10-27 - Host Header Injection in Express Authentication
**Vulnerability:** The Express middleware `verifyAdminToken` bypassed authentication for localhost requests by checking `req.hostname === 'localhost'`. An attacker could inject a fake `Host: localhost` header from any external IP, bypassing the authentication check.
**Learning:** `req.hostname` derives from the HTTP Host header, which is strictly user input and should never be trusted for authentication or authorization logic without proper proxy configurations (like trusting proxies).
**Prevention:** For IP-based access controls or local bypasses, always use network-level attributes such as `req.ip` or `req.socket.remoteAddress`, which accurately reflect the client's actual connection IP and cannot be spoofed via standard HTTP headers.
