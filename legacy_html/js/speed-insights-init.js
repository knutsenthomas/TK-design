(async () => {
    try {
        const speedInsightsModule = await import('@vercel/speed-insights').catch(() => null);
        if (speedInsightsModule && typeof speedInsightsModule.injectSpeedInsights === 'function') {
            speedInsightsModule.injectSpeedInsights();
        }
    } catch (e) {
        // Safe fallback for un-bundled static browser environments
    }

    try {
        const analyticsModule = await import('@vercel/analytics').catch(() => null);
        if (analyticsModule && typeof analyticsModule.inject === 'function') {
            analyticsModule.inject();
        }
    } catch (e) {
        // Safe fallback for un-bundled static browser environments
    }
})();
