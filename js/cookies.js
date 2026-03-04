/**
 * Cookie Consent System
 * Styled consent banner with category preferences.
 */

(function () {
    const COOKIE_PREFERENCE_KEY = 'tk_cookie_consent';

    function getCurrentLanguage() {
        return window.currentLang ||
            localStorage.getItem('site_lang') ||
            localStorage.getItem('selectedLanguage') ||
            'no';
    }

    function getTranslation(path, fallback = '') {
        if (typeof translations === 'undefined') {
            return fallback || path;
        }

        const lang = getCurrentLanguage();
        const keys = path.split('.');
        let value = translations[lang];

        for (const key of keys) {
            if (value && Object.prototype.hasOwnProperty.call(value, key)) {
                value = value[key];
            } else {
                return fallback || path;
            }
        }

        return value;
    }

    function hasSavedPreferences() {
        return Boolean(localStorage.getItem(COOKIE_PREFERENCE_KEY));
    }

    function savePreferences(preferences) {
        localStorage.setItem(COOKIE_PREFERENCE_KEY, JSON.stringify({
            essential: true,
            analytics: Boolean(preferences.analytics),
            marketing: Boolean(preferences.marketing),
            choice: preferences.choice || 'custom',
            savedAt: new Date().toISOString()
        }));

        window.dispatchEvent(new CustomEvent('cookiePreferencesSaved', {
            detail: preferences
        }));
    }

    function removeBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.remove();
        }
    }

    function buildDescriptionHtml() {
        const cookieText = getTranslation('privacy_policy.section3_content', getTranslation('cookies.text'));
        const accessibilityText = getTranslation('accessibility_statement.goal', '');
        const learnMore = getTranslation('cookies.learn_more', 'Les mer her');

        const pieces = [cookieText, accessibilityText].filter(Boolean);
        return `${pieces.join(' ')} <a href="privacy.html">${learnMore}</a>`;
    }

    function createToggle(labelText, type, active, locked) {
        const item = document.createElement('div');
        item.className = 'cookie-option';

        const label = document.createElement('span');
        label.className = 'cookie-option-label';
        label.textContent = labelText;

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'cookie-toggle';
        toggle.dataset.type = type;
        toggle.dataset.active = active ? 'true' : 'false';
        toggle.setAttribute('aria-pressed', active ? 'true' : 'false');
        toggle.setAttribute('aria-label', labelText);

        if (locked) {
            toggle.disabled = true;
            toggle.classList.add('is-locked');
        }

        const knob = document.createElement('span');
        knob.className = 'cookie-toggle-knob';
        toggle.appendChild(knob);

        item.appendChild(label);
        item.appendChild(toggle);

        return { item, toggle };
    }

    function applyToggleState(toggle, active) {
        toggle.dataset.active = active ? 'true' : 'false';
        toggle.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    function buildBanner() {
        if (hasSavedPreferences()) {
            return;
        }

        removeBanner();

        const state = {
            analytics: false,
            marketing: false
        };

        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';

        const heading = document.createElement('h3');
        heading.className = 'cookie-banner-title';
        heading.textContent = getTranslation('cookies.title', 'Cookies & Personvern');

        const description = document.createElement('p');
        description.className = 'cookie-banner-description';
        description.innerHTML = buildDescriptionHtml();

        const options = document.createElement('div');
        options.className = 'cookie-options';

        const necessaryToggle = createToggle(
            getTranslation('cookies.necessary', 'Nødvendige'),
            'essential',
            true,
            true
        );
        const analyticsToggle = createToggle(
            getTranslation('cookies.analytics', 'Statistikk'),
            'analytics',
            state.analytics,
            false
        );
        const marketingToggle = createToggle(
            getTranslation('cookies.marketing', 'Markedsføring'),
            'marketing',
            state.marketing,
            false
        );

        options.appendChild(necessaryToggle.item);
        options.appendChild(analyticsToggle.item);
        options.appendChild(marketingToggle.item);

        const actions = document.createElement('div');
        actions.className = 'cookie-actions';

        const allowAllButton = document.createElement('button');
        allowAllButton.type = 'button';
        allowAllButton.className = 'cookie-action-primary';
        allowAllButton.textContent = getTranslation('cookies.allow_all', 'Tillat alle');

        const saveSelectionButton = document.createElement('button');
        saveSelectionButton.type = 'button';
        saveSelectionButton.className = 'cookie-action-secondary';
        saveSelectionButton.textContent = getTranslation('cookies.save_selection', 'Lagre valg');

        const onlyNecessaryButton = document.createElement('button');
        onlyNecessaryButton.type = 'button';
        onlyNecessaryButton.className = 'cookie-action-tertiary';
        onlyNecessaryButton.textContent = getTranslation('cookies.only_necessary', 'Kun nødvendige');

        actions.appendChild(allowAllButton);
        actions.appendChild(saveSelectionButton);
        actions.appendChild(onlyNecessaryButton);

        banner.appendChild(heading);
        banner.appendChild(description);
        banner.appendChild(options);
        banner.appendChild(actions);

        document.body.appendChild(banner);

        [analyticsToggle.toggle, marketingToggle.toggle].forEach((toggle) => {
            toggle.addEventListener('click', () => {
                const type = toggle.dataset.type;
                state[type] = !state[type];
                applyToggleState(toggle, state[type]);
            });
        });

        allowAllButton.addEventListener('click', () => {
            state.analytics = true;
            state.marketing = true;
            applyToggleState(analyticsToggle.toggle, true);
            applyToggleState(marketingToggle.toggle, true);
            savePreferences({
                analytics: true,
                marketing: true,
                choice: 'all'
            });
            removeBanner();
        });

        saveSelectionButton.addEventListener('click', () => {
            savePreferences({
                analytics: state.analytics,
                marketing: state.marketing,
                choice: 'custom'
            });
            removeBanner();
        });

        onlyNecessaryButton.addEventListener('click', () => {
            state.analytics = false;
            state.marketing = false;
            applyToggleState(analyticsToggle.toggle, false);
            applyToggleState(marketingToggle.toggle, false);
            savePreferences({
                analytics: false,
                marketing: false,
                choice: 'necessary'
            });
            removeBanner();
        });
    }

    function initCookieBanner() {
        buildBanner();

        if (typeof window.switchLanguage === 'function' && !window.__cookieBannerWrapped) {
            const originalSwitchLanguage = window.switchLanguage;
            window.switchLanguage = function wrappedSwitchLanguage(lang) {
                originalSwitchLanguage(lang);

                if (!hasSavedPreferences()) {
                    buildBanner();
                }
            };
            window.__cookieBannerWrapped = true;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieBanner);
    } else {
        initCookieBanner();
    }
})();
