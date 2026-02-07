/**
 * Cookie Consent System
 * Implementation for TK-design
 */

(function () {
    const COOKIE_PREFERENCE_KEY = 'tk_cookie_consent';

    function initCookieBanner() {
        if (localStorage.getItem(COOKIE_PREFERENCE_KEY)) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: #1a1a1a;
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
            border-left: 4px solid var(--clr-base, #f97316);
            animation: slideUp 0.5s ease-out;
        `;

        const text = document.createElement('div');
        text.style.flex = '1';
        text.style.minWidth = '250px';

        const p = document.createElement('p');
        p.style.margin = '0';
        p.style.fontSize = '14px';
        p.setAttribute('data-i18n', 'cookies.text');
        p.innerText = getTranslation('cookies.text');

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '10px';

        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'save-btn';
        acceptBtn.style.padding = '8px 20px';
        acceptBtn.setAttribute('data-i18n', 'cookies.accept');
        acceptBtn.innerText = getTranslation('cookies.accept');
        acceptBtn.onclick = () => {
            localStorage.setItem(COOKIE_PREFERENCE_KEY, 'accepted');
            banner.style.display = 'none';
        };

        const declineBtn = document.createElement('button');
        declineBtn.style.cssText = `
            background: transparent;
            border: 1px solid #444;
            color: #ccc;
            padding: 8px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        `;
        declineBtn.setAttribute('data-i18n', 'cookies.decline');
        declineBtn.innerText = getTranslation('cookies.decline');
        declineBtn.onclick = () => {
            localStorage.setItem(COOKIE_PREFERENCE_KEY, 'declined');
            banner.style.display = 'none';
        };

        const learnMore = document.createElement('a');
        learnMore.href = 'privacy.html';
        learnMore.style.color = 'var(--clr-base, #f97316)';
        learnMore.style.fontSize = '12px';
        learnMore.style.display = 'block';
        learnMore.style.marginTop = '5px';
        learnMore.setAttribute('data-i18n', 'cookies.learn_more');
        learnMore.innerText = getTranslation('cookies.learn_more');

        text.appendChild(p);
        text.appendChild(learnMore);
        btnContainer.appendChild(declineBtn);
        btnContainer.appendChild(acceptBtn);
        banner.appendChild(text);
        banner.appendChild(btnContainer);

        document.body.appendChild(banner);

        // Add Animation Keyframes
        if (!document.getElementById('cookie-styles')) {
            const style = document.createElement('style');
            style.id = 'cookie-styles';
            style.innerHTML = `
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function getTranslation(key) {
        if (typeof translations === 'undefined') return key;
        const lang = localStorage.getItem('selectedLanguage') || 'no';
        const keys = key.split('.');
        let val = translations[lang];
        for (const k of keys) {
            if (val && val[k]) val = val[k];
            else return key;
        }
        return val;
    }

    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieBanner);
    } else {
        initCookieBanner();
    }
})();
