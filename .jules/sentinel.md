## 2025-02-28 - [CRITICAL] Remove Hardcoded Secrets
**Vulnerability:** Found hardcoded Facebook Page ID and Access Token in `legacy_html/server.js`, and hardcoded Firebase Web API Key in `legacy_html/server.js` and JS files.
**Learning:** Hardcoded secrets in the codebase allow attackers to gain unauthorized access to APIs and databases if they get access to the source code.
**Prevention:** Always use environment variables (`process.env`) to store sensitive information and never commit them to the repository.
