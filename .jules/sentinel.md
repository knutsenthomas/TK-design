## 2025-02-28 - Sanitize Path Parameters in External Fetch Requests
**Vulnerability:** Path traversal vulnerability in Firestore API requests where `req.params.id` was directly injected into the fetch URL.
**Learning:** External fetch request URLs constructed using Express route parameters can be manipulated (e.g. `../`) if the parameters are not encoded, leading to unintended API calls.
**Prevention:** Always use `encodeURIComponent()` on URL or path parameters (e.g. `req.params.id`) when interpolating them into external API endpoints (like Firestore URLs).
