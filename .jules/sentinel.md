## 2025-02-14 - Add missing authentication to admin API endpoints
**Vulnerability:** Several administrative API endpoints (including analytics, messages, debug, and social-planner routes) were missing authentication checks.
**Learning:** Endpoints that handle sensitive data or administrative actions must be protected by authentication to prevent unauthorized access. The `verifyAdminToken` middleware is available but wasn't consistently applied to all relevant endpoints, particularly GET and non-POST methods.
**Prevention:** Consistently apply `verifyAdminToken` to all API endpoints that are part of the administrative panel or return sensitive information, regardless of the HTTP method used.
