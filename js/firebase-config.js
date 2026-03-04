(function () {
    const emptyConfig = {
        apiKey: 'AIzaSyDLYgqo2E1UiHoydEB6-WfFc119HES2U5c',
        authDomain: 'tk-design-f43f6.firebaseapp.com',
        projectId: 'tk-design-f43f6',
        storageBucket: 'tk-design-f43f6.firebasestorage.app',
        messagingSenderId: '729667300921',
        appId: '1:729667300921:web:5061be8d41f10707a727e8'
    };

    function hasUsableConfig(config) {
        return !!(config && config.apiKey && config.authDomain && config.projectId && config.storageBucket && config.appId);
    }

    function getBackendConfigUrl() {
        const host = window.location.hostname || 'localhost';
        const isLocalHost = ['localhost', '127.0.0.1'].includes(host);

        if (window.location.protocol === 'file:') {
            return `http://${host}:3000/js/firebase-config.js`;
        }

        if (isLocalHost && window.location.port && window.location.port !== '3000') {
            return `http://${host}:3000/js/firebase-config.js`;
        }

        return '/js/firebase-config.js';
    }

    async function loadRuntimeFirebaseConfig() {
        if (hasUsableConfig(window.__TK_FIREBASE_CONFIG__)) {
            return window.__TK_FIREBASE_CONFIG__;
        }

        try {
            const response = await fetch(getBackendConfigUrl(), { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const configScript = await response.text();
            new Function(configScript)();

            if (!hasUsableConfig(window.__TK_FIREBASE_CONFIG__)) {
                throw new Error('Mangler nødvendige Firebase-felt.');
            }

            window.__TK_FIREBASE_CONFIG_ERROR__ = null;
            return window.__TK_FIREBASE_CONFIG__;
        } catch (error) {
            window.__TK_FIREBASE_CONFIG_ERROR__ = 'Kunne ikke hente Firebase-konfigurasjonen. Start `node server.js` og sjekk at .env er satt opp.';
            console.error('Firebase config load error:', error);
            return window.__TK_FIREBASE_CONFIG__;
        }
    }

    window.__TK_FIREBASE_CONFIG__ = window.__TK_FIREBASE_CONFIG__ || emptyConfig;
    window.__TK_FIREBASE_CONFIG_READY__ = window.__TK_FIREBASE_CONFIG_READY__ || loadRuntimeFirebaseConfig();
})();
