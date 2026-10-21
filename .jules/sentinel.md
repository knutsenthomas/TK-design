## 2024-05-24 - Header Injection / IP Spoofing Prevention
**Vulnerability:** IP addresses and protocols were blindly trusted via manual `split(',')[0]` parsing of `x-forwarded-for` and `x-forwarded-proto` headers.
**Learning:** Naive extraction of the leftmost `x-forwarded-*` header values directly trusts the client, allowing for IP spoofing and bypassing rate limiters. Express's `trust proxy` mechanism is required to securely identify client metadata when running behind reverse proxies.
**Prevention:** Use `app.set('trust proxy', 1)` and native Express properties like `req.ip` and `req.protocol` rather than manually parsing `x-forwarded-*` HTTP headers.
