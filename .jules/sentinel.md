## 2023-10-19 - Ensure req.ip usage over raw x-forwarded-for
**Vulnerability:** IP spoofing and Host Header Injection risks because Express trust proxy is not configured and `x-forwarded-for` is manually extracted without sanitization.
**Learning:** `req.ip` respects Express trust proxy if configured correctly, and is safer than manually reading headers. If proxy is not trusted, `req.ip` safely returns `req.socket.remoteAddress`.
**Prevention:** Always set `app.set('trust proxy', 1)` or appropriate proxy configuration when running behind proxies/load balancers, and exclusively use `req.ip` instead of `req.headers['x-forwarded-for']`.
