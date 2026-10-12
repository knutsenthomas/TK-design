## 2023-10-25 - [Accessibility Issue Pattern]
**Learning:** Icon-only buttons/links in hidden or overlay components (like mobile menus) are frequently overlooked for ARIA labels, even when the main content properly includes them.
**Action:** Always check mobile navigation overlays, footers, and hidden modals for missing ARIA labels on social icons and utility buttons.
## 2026-08-24 - Added missing ARIA labels on social links
**Learning:** Mobile menu social icons lacked ARIA labels making them inaccessible to screen readers. We need to remember to add aria-label to icon-only links across all navigation items.
**Action:** Check all icon-only buttons for missing ARIA labels.
