import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const SiteContext = createContext({});

export const SiteProvider = ({ children }) => {
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('site_lang') || 'no');

    const switchLanguage = (lang) => {
        setCurrentLang(lang);
        localStorage.setItem('site_lang', lang);
    };

    const t = (path) => {
        const keys = path.split('.');
        let value = translations[currentLang];
        for (const key of keys) {
            if (value[key] === undefined) {
                // Fallback to English if key missing in current language
                value = translations['en'];
                break;
            }
            value = value[key];
        }
        // Deep search in English if still not found
        if (typeof value === 'object') {
            let enValue = translations['en'];
            for (const key of keys) {
                if (enValue[key] === undefined) return path;
                enValue = enValue[key];
            }
            return enValue;
        }
        return value || path;
    };

    return (
        <SiteContext.Provider value={{ currentLang, switchLanguage, t }}>
            {children}
        </SiteContext.Provider>
    );
};

export const useSite = () => {
    const context = useContext(SiteContext);
    if (!context) {
        throw new Error('useSite must be used within a SiteProvider');
    }
    return context;
};
