# Browser storage review — 2026-10-23

Scope: TK-design client source and configured public website.

| Storage/service | Purpose and duration |
| --- | --- |
| hkp-app-privacy-v1 | Consent categories, version and time are remembered for 180 days. Reject or withdraw using the cookie settings link. |
| Google Analytics | Optional visitor analytics starts only after approval. Google may use _ga and _ga_* (configured for up to 180 days). Withdrawal stops future measurement and removes accessible analytics cookies on our domain. |
| Språk: site_lang | Your chosen language is remembered in localStorage and a cookie lasting up to one year so the server can return the correct language. |
| KI-sjekkliste | Reviewed checklist items are saved locally after you use the checklist. This does not create a visitor ID. |
| Nettside-sjekker | A report email address is remembered only in this tab’s sessionStorage after you request an emailed report. The submitted address and report are sent to the service for delivery. |
| Frakoblet bruk | App caching in Cache Storage and any public content snapshots in localStorage start only when you enable offline use. Rejection unregisters this site’s offline worker and removes its caches. This does not delete your account, cart or notes. |
| Skjema og drift | Contact and report forms process the information you submit. Hosting/CDN services and any external font providers receive technical details when resources are requested. |

Verification must cover initial rejection, selective approval, withdrawal, cross-tab updates, unavailable storage, service-worker cleanup, and existing login/cart functions. Provider retention and agreements are not certified by this source review. No real payment or message submission is part of the review.
