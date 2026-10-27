## 2025-02-28 - [Express IP Spoofing Prevention]
**Vulnerability:** The application was manually parsing `x-forwarded-for` and `x-forwarded-proto` headers instead of using Express's built-in `trust proxy` configuration, leading to potential IP spoofing vulnerabilities.
**Learning:** Manual extraction of headers without validating the proxy chain can allow attackers to easily bypass rate limits or spoof their source IP.
**Prevention:** Use `app.set('trust proxy', 1)` (or appropriate trust level based on infrastructure) and access IPs via `req.ip` and protocols via `req.protocol` to let Express securely handle the header chain.
