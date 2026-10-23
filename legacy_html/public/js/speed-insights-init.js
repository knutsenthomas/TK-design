import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from '@vercel/analytics';
let started = false;
function startOptionalMetrics() {
    if (started || !window.SitePrivacy?.allows('analytics')) return;
    started = true;
    const beforeSend = event => window.SitePrivacy.cleanEvent(event);
    injectSpeedInsights({ beforeSend });
    inject({ beforeSend });
}
window.addEventListener('siteprivacychange', startOptionalMetrics);
startOptionalMetrics();
