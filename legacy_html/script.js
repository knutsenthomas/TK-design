document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.querySelector('.header');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Tab Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            const targetTab = document.getElementById(`${tabId}-tab`);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });

    // Mobile Menu Toggle
    const menuTrigger = document.querySelector('.menu-trigger');
    const menuIcon = menuTrigger ? menuTrigger.querySelector('i') : null;
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    function toggleMenu(forceClose = false) {
        const isOpen = mobileMenuOverlay.classList.contains('active');
        const shouldClose = forceClose || isOpen;

        if (shouldClose) {
            mobileMenuOverlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-active');
            document.body.style.overflow = '';
            if (menuIcon) {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        } else {
            mobileMenuOverlay.classList.add('active');
            document.body.classList.add('mobile-menu-active');
            document.body.style.overflow = 'hidden';
            if (menuIcon) {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            }
        }
    }

    if (menuTrigger && mobileMenuOverlay) {
        menuTrigger.addEventListener('click', () => toggleMenu());
    }

    // Close menu when clicking a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });

    // Video Modal
    const playBtn = document.querySelector('.play-video-btn');
    const videoModal = document.querySelector('.video-modal');
    const modalClose = document.querySelector('.modal-close');
    const videoIframe = document.querySelector('.video-modal iframe');
    const videoUrl = "https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1"; // Example video

    if (playBtn && videoModal) {
        playBtn.addEventListener('click', () => {
            videoModal.classList.add('active');
            if (videoIframe) videoIframe.src = videoUrl;
        });
    }

    if (modalClose && videoModal) {
        modalClose.addEventListener('click', () => {
            videoModal.classList.remove('active');
            if (videoIframe) videoIframe.src = ""; // Stop video
        });
    }

    // Close modal on outside click
    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                videoModal.classList.remove('active');
                if (videoIframe) videoIframe.src = "";
            }
        });
    }

    // Testimonial Init
    initTestimonialSlider();

    // Contact Form Simulation (for Footer Link or Meeting Section)
    const contactLinks = document.querySelectorAll('a[href^="mailto:"]');
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // e.preventDefault();
            // alert("Opening your email client...");
        });
    });

    // Language init moved outside to prevent flash of untranslated content

    // Keep homepage URL clean while still supporting section navigation
    initHomepageSectionRouting();

    // Back To Top
    initBackToTopButton();
});

function initHomepageSectionRouting() {
    const isHomepage = document.body && document.body.id === 'home';
    const sectionLinks = document.querySelectorAll('a[href*="?section="]');

    const scrollToSection = (section, behavior = 'smooth') => {
        if (!isHomepage) return false;

        if (!section || section === 'home') {
            window.scrollTo({ top: 0, behavior });
            return true;
        }

        const target = document.getElementById(section);
        if (!target) return false;

        const header = document.querySelector('.header');
        const headerOffset = header ? header.offsetHeight + 12 : 0;
        const top = Math.max(target.getBoundingClientRect().top + window.scrollY - headerOffset, 0);
        window.scrollTo({ top, behavior });
        return true;
    };

    const clearHomepageUrl = () => {
        if (!isHomepage || !window.history || typeof window.history.replaceState !== 'function') return;
        if (window.location.pathname === '/index.html' || window.location.search || window.location.hash) {
            window.history.replaceState({}, '', '/');
        }
    };

    sectionLinks.forEach((link) => {
        let section = '';
        try {
            const url = new URL(link.getAttribute('href') || '', window.location.origin);
            section = (url.searchParams.get('section') || '').trim();
        } catch (error) {
            section = '';
        }

        if (!section || !isHomepage) return;

        link.addEventListener('click', (event) => {
            event.preventDefault();
            if (scrollToSection(section, 'smooth')) {
                clearHomepageUrl();
            }
        });
    });

    if (!isHomepage) {
        return;
    }

    let initialSection = '';
    const querySection = new URLSearchParams(window.location.search).get('section');
    if (querySection) {
        initialSection = querySection.trim();
    } else if (window.location.hash) {
        initialSection = window.location.hash.replace('#', '').trim();
    }

    if (initialSection) {
        window.requestAnimationFrame(() => {
            if (scrollToSection(initialSection, 'auto')) {
                clearHomepageUrl();
            }
        });
        return;
    }

    if (window.location.pathname === '/index.html') {
        clearHomepageUrl();
    }
}

function initBackToTopButton() {
    if (document.querySelector('.back-to-top-btn')) {
        return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'back-to-top-btn';
    button.setAttribute('aria-label', 'Tilbake til toppen');
    button.innerHTML = '<span aria-hidden="true">↑</span>';

    let bttTicking = false;
    const toggleVisibility = () => {
        if (!bttTicking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 320) {
                    button.classList.add('visible');
                } else {
                    button.classList.remove('visible');
                }
                bttTicking = false;
            });
            bttTicking = true;
        }
    };

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    document.body.appendChild(button);
    toggleVisibility(); // Run once on init
}

function initTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.querySelector('.testimonial-dots');
    if (!slides.length || !dotsContainer) return;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    let currentSlide = 0;
    const dots = document.querySelectorAll('.dot');

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        currentSlide = index;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    // Auto rotate
    setInterval(() => {
        let next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }, 5000);
}

// --- LANGUAGE SWITCHER LOGIC ---

// Helper to get cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Default to Norwegian as requested by user ("Oversett hele siden til norsk")
// priority: cookie -> localStorage -> default 'no'
let currentLang = getCookie('site_lang') || localStorage.getItem('site_lang') || 'no';

function initLanguage() {
    // Apply key translations
    applyLanguage(currentLang);
    updateLangButtons(currentLang);
}

// Run immediately to avoid flash of untranslated content when switching pages
initLanguage();

function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('site_lang', lang);
    // Set cookie for server-side detection (expires in 1 year)
    document.cookie = `site_lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    applyLanguage(lang);
    updateLangButtons(lang);
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}

function applyLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        // key like "nav.home" -> translations[lang].nav.home
        const text = getNestedTranslation(translations[lang], key);
        if (text) {
            el.textContent = text;
            if (el.classList.contains('designers')) {
                el.setAttribute('data-text', text);
            }
        }
    });

    // Optional: Update html lang attribute
    document.documentElement.lang = lang;
}

function getNestedTranslation(obj, path) {
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, obj);
}

function updateLangButtons(lang) {
    const btns = document.querySelectorAll('.lang-btn');
    btns.forEach(btn => {
        // e.g. onclick="switchLanguage('en')"
        const btnLang = btn.getAttribute('onclick').includes("'en'") ? 'en' : 'no';
        if (btnLang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
