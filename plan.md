1. **Identify the vulnerability:**
   - I have found SSRF / Path Traversal vulnerability when constructing Firestore URLs in `legacy_html/server.js`.
   - The memory states: `When constructing Firestore API URLs in legacy_html/server.js using user input (like request parameters e.g., req.params.id, or object keys from req.body used in query strings), always sanitize the values using encodeURIComponent() to prevent SSRF and path traversal vulnerabilities.`
   - In `legacy_html/server.js` lines 1626 and 1666, `id` and `collection` are used without being sanitized via `encodeURIComponent()`.
2. **Fix the vulnerability:**
   - I will modify `legacy_html/server.js` at line 1626 and 1666 to wrap `collection` and `id` in `encodeURIComponent()`.
     - Change: `` `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${collection}/${id}?${updateMask}` ``
     - To: `` `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${encodeURIComponent(collection)}/${encodeURIComponent(id)}?${updateMask}` ``
     - Change: `` `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${collection}/${id}` ``
     - To: `` `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${encodeURIComponent(collection)}/${encodeURIComponent(id)}` ``
3. **Verify the fix:**
   - I will run the tests in `legacy_html/` via `node --test tests/*.js`.
   - I will run a lint or syntax check `node -c legacy_html/server.js`.
4. **Pre-commit and Submit:**
   - I will call `pre_commit_instructions` to make sure proper testing, verifications, reviews, and reflections are done.
   - I will submit a PR with the title '🛡️ Sentinel: [CRITICAL] Fix Path Traversal in Firestore URLs' and descriptive summary following Sentinel guidelines.
