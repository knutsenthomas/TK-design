
## 2025-02-12 - IP Spoofing via Manual `x-forwarded-for` Parsing
**Vulnerability:** Express app parsed `x-forwarded-for` directly (`req.headers["x-forwarded-for"]`) to extract IP addresses for rate limiting and logging, allowing users to easily spoof their IP address by injecting this header.
**Learning:** Directly accessing `x-forwarded-for` without Express' built-in proxy trust mechanisms bypasses security checks and exposes the app to IP spoofing.
**Prevention:** Always use `app.set('trust proxy', 1);` and read from `req.ip` instead of manually extracting headers. Express will automatically parse the headers securely.
