document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

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
    const menuClose = document.querySelector('.menu-close');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    if (menuTrigger && mobileMenuOverlay) {
        menuTrigger.addEventListener('click', () => {
            mobileMenuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }

    if (menuClose && mobileMenuOverlay) {
        menuClose.addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close menu when clicking a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
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

    // Language Init
    initLanguage();
});

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

// Default to Norwegian as requested by user ("Oversett hele siden til norsk")
// storedLang -> 'no' or 'en'
let currentLang = localStorage.getItem('site_lang') || 'no';

function initLanguage() {
    // Apply key translations
    applyLanguage(currentLang);
    updateLangButtons(currentLang);
}

function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('site_lang', lang);
    applyLanguage(lang);
    updateLangButtons(lang);
}

function applyLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        // key like "nav.home" -> translations[lang].nav.home
        const text = getNestedTranslation(translations[lang], key);
        if (text) {
            el.textContent = text;
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
