## 2024-05-18 - Hardcoded Social Media Secrets
**Vulnerability:** Hardcoded Facebook Page ID and Page Access Token were found in `legacy_html/server.js` (`publishToFacebookPageApi` function) as fallback values.
**Learning:** Developers sometimes use real production credentials as fallback values during testing or quick fixes, which then get committed to the repository, leading to critical credentials being exposed in the source code.
**Prevention:** Never use real secrets as fallback values in code. Use empty strings or throw errors if required environment variables are missing. Ensure all sensitive tokens are strictly loaded from environment variables or a secure secret manager.
