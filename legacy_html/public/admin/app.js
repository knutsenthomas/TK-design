function getAdminApiUrl() {
    const host = window.location.hostname || 'localhost';
    const isLocalHost = ['localhost', '127.0.0.1'].includes(host);

    if (window.location.protocol === 'file:') {
        return `http://${host}:3000/api`;
    }

    if (isLocalHost && window.location.port && window.location.port !== '3000') {
        return `http://${host}:3000/api`;
    }

    return '/api';
}

const API_URL = getAdminApiUrl();
const ADMIN_LOGIN_PATH = '/admin/login.html';
let contentData = {};
let blogData = [];
let currentLang = 'no';
let seoData = { global: {}, pages: {} };
let socialPlannerState = null;
let socialPlannerAnalytics = null;
let socialPlannerLoaded = false;
let socialPlannerLoading = false;
let socialPlannerEntryFilter = 'queue';
let socialPlannerEntrySearch = '';
let socialPlannerChannelFilter = 'all';
let socialPlannerTagFilter = 'all';
let socialPlannerStreamViewMode = 'list';
let socialPlannerDisplayTimezone = '';
let socialPlannerCalendarCursor = new Date();
let socialPlannerComposerPanel = 'preview';
let socialPlannerAssistantInFlight = false;
const SOCIAL_PLANNER_UI_PLATFORMS = ['facebook', 'instagram', 'linkedin', 'x', 'tiktok'];
const ADMIN_SIDEBAR_COLLAPSE_KEY = 'tk_admin_sidebar_collapsed';
const ADMIN_MOBILE_BREAKPOINT = 900;
let quill; // Define quill globally but initialize later
const TABLE_EMBED_CLASS = 'ql-table-embed';
const TABLE_CELL_SELECTOR = `.${TABLE_EMBED_CLASS} th, .${TABLE_EMBED_CLASS} td`;
let activeTableEditorCell = null;
let activeTableEditorInput = null;

// Section Translations
// Section Translations
const sectionTranslations = {
    'no': {
        'nav': 'NAVIGASJON',
        'hero': 'HERO SEKSJON',
        'about': 'OM MEG',
        'services': 'TJENESTER',
        'portfolio': 'PORTEFØLJE',
        'projects': 'PROSJEKTER',
        'testimonial': 'ATTESTER',
        'blog': 'BLOGG',
        'contact': 'KONTAKT',
        'footer': 'FOOTER'
    },
    'en': {
        'nav': 'NAVIGATION',
        'hero': 'HERO SECTION',
        'about': 'ABOUT ME',
        'services': 'SERVICES',
        'portfolio': 'PORTFOLIO',
        'projects': 'PROJECTS',
        'testimonial': 'TESTIMONIALS',
        'blog': 'BLOG',
        'contact': 'CONTACT',
        'footer': 'FOOTER'
    }
};

console.log('[DEBUG] Loading legacy_html/public/admin/app.js');
const adminTranslations = {
    'no': {
        'nav_home': 'Hjem',
        'nav_blog': 'Blogg',
        'nav_content': 'Sideinnhold',
        'nav_style': 'Design',
        'nav_seo': 'SEO',
        'nav_media': 'Media',
        'nav_view_site': 'Se Nettside',
        'nav_logout': 'Logg ut',
        'sidebar_menu': 'Meny',
        'welcome': 'Velkommen tilbake',
        'new_post': '+ Nytt Innlegg',
        'dashboard_kicker': 'Nettstedsoversikt',
        'dashboard_title': 'Ett sted for å holde tk-design oppdatert',
        'dashboard_desc': 'Administrer forsiden, blogg, media, SEO og nøkkelsider fra dette dashboardet.',
        'dashboard_latest_post': 'Siste innlegg',
        'dashboard_focus_label': 'Fokus nå',
        'dashboard_focus_value': 'Hold prosjekter, SEO og innhold oppdatert',
        'stats_posts_live': 'Publiserte innlegg',
        'stats_posts_live_note': 'Vises på Aktuelt-siden',
        'stats_sections': 'Redigerbare seksjoner',
        'stats_sections_note': 'Innhold du kan oppdatere her',
        'stats_services_live': 'Tjenestekort',
        'stats_services_live_note': 'Kort i innholdsredigeringen',
        'stats_languages_live': 'Språk',
        'stats_languages_live_note': 'Norsk og engelsk',
        'dashboard_manage_title': 'Hva du styrer her',
        'dashboard_manage_desc': 'Bruk dashbordet til å holde hele nettsiden konsistent og oppdatert.',
        'dashboard_section_home_label': 'Forside',
        'dashboard_section_home_title': 'Hero, tjenester og prosjekter',
        'dashboard_section_home_desc': 'Oppdater innholdet som møter besøkende først.',
        'dashboard_section_home_cta': 'Rediger innhold',
        'dashboard_section_blog_label': 'Aktuelt',
        'dashboard_section_blog_title': 'Blogg og detaljsider',
        'dashboard_section_blog_desc': 'Publiser, oppdater og rydd opp i innlegg.',
        'dashboard_section_blog_cta': 'Åpne blogg',
        'dashboard_section_growth_label': 'Synlighet',
        'dashboard_section_growth_title': 'SEO, design og media',
        'dashboard_section_growth_desc': 'Juster metadata, farger og bilder for et helhetlig uttrykk.',
        'dashboard_section_growth_cta': 'Gå til SEO',
        'dashboard_section_site_label': 'Live',
        'dashboard_section_site_title': 'Kontakt og offentlige sider',
        'dashboard_section_site_desc': 'Se hvordan besøkende opplever innholdet ute på siden.',
        'dashboard_section_site_cta': 'Åpne nettsiden',
        'stats_visits': 'Besøk (30d)',
        'stats_read': 'Innlegg Lest',
        'stats_active': 'Aktive Brukere',
        'stats_time': 'Gj.snitt Tid',
        'quick_actions': 'Hurtigvalg',
        'edit_hero': 'Rediger Forsidetekst',
        'upload_images': 'Last opp Bilder',
        'save_changes': 'Lagre Endringer',
        'blog_overview': 'Bloggoversikt',
        'blog_title': 'Tittel',
        'blog_date': 'Dato',
        'blog_author': 'Forfatter',
        'blog_actions': 'Handlinger',
        'design_colors': 'Design & Farger',
        'save_content': 'Lagre Sideinnhold',
        'save_design': 'Lagre Design',
        'color_base': 'Hovedfarge',
        'color_bg': 'Bakgrunnsfarge',
        'color_text': 'Tekstfarge',
        'typography': 'Skrifttype (Google Fonts)',
        'font_example_header': 'Overskrift Eksempel',
        'font_example_text': 'Dette er en tekst for å vise hvordan valgt skrifttype ser ut på nettsiden din. Det er viktig med god lesbarhet.',
        'seo_title': 'Søkemotoroptimalisering (SEO)',
        'save_seo': 'Lagre SEO',
        'global_settings': 'Globale Innstillinger',
        'global_desc': 'Gjelder for hele nettstedet',
        'site_name': 'Nettstedsnavn',
        'title_separator': 'Tittel-separator (f.eks | eller -)',
        'ga_id': 'Google Analytics ID (G-XXXXXXX)',
        'default_keywords': 'Standard Søkeord (skilt med komma)',
        'page_seo': 'Side-spesifikk SEO',
        'page_seo_desc': 'Tilpass tittel og beskrivelse for hver enkelt side',
        'tech_seo': 'Teknisk SEO',
        'view_sitemap': 'Se Sitemap (sitemap.xml)',
        'sitemap_desc': 'Sitemap genereres automatisk basert på dine sider og blogginnlegg.',
        'media_lib': 'Mediebibliotek',
        'upload_img': 'Last opp Bilde',
        'profile_display_name': 'Visningsnavn',
        'profile_name_placeholder': 'Ditt navn',
        'profile_phone': 'Telefon',
        'profile_dob': 'Fødselsdato',
        'profile_address': 'Adresse',
        'profile_address_placeholder': 'Gate, Postnr Sted',
        'profile_bio': 'Om meg (Bio)',
        'profile_bio_placeholder': 'Skriv litt om deg selv...',
        'profile_title': 'Profilinnstillinger',
        'profile_avatar_hint': 'Tillatt: JPG, PNG, GIF, WebP (Maks 2MB)',
        'profile_email': 'E-post',
        'btn_cancel': 'Avbryt',
        'btn_save_changes': 'Lagre endringer'
    },
    'en': {
        'nav_home': 'Home',
        'nav_blog': 'Blog',
        'nav_content': 'Site Content',
        'nav_style': 'Design',
        'nav_seo': 'SEO',
        'nav_media': 'Media',
        'nav_view_site': 'View Site',
        'nav_logout': 'Logout',
        'sidebar_menu': 'Menu',
        'welcome': 'Welcome back',
        'new_post': '+ Nytt innlegg',
        'dashboard_kicker': 'Site Overview',
        'dashboard_title': 'One place to keep tk-design updated',
        'dashboard_desc': 'Manage the homepage, blog, media, SEO and key pages from this dashboard.',
        'dashboard_latest_post': 'Latest Post',
        'dashboard_focus_label': 'Current Focus',
        'dashboard_focus_value': 'Keep projects, SEO and content updated',
        'stats_posts_live': 'Published Posts',
        'stats_posts_live_note': 'Shown on the News page',
        'stats_sections': 'Editable Sections',
        'stats_sections_note': 'Content you can update here',
        'stats_services_live': 'Service Cards',
        'stats_services_live_note': 'Cards in the content editor',
        'stats_languages_live': 'Languages',
        'stats_languages_live_note': 'Norwegian and English',
        'dashboard_manage_title': 'What You Manage Here',
        'dashboard_manage_desc': 'Use the dashboard to keep the entire site consistent and up to date.',
        'dashboard_section_home_label': 'Homepage',
        'dashboard_section_home_title': 'Hero, services and projects',
        'dashboard_section_home_desc': 'Update the content visitors see first.',
        'dashboard_section_home_cta': 'Edit content',
        'dashboard_section_blog_label': 'News',
        'dashboard_section_blog_title': 'Blog and detail pages',
        'dashboard_section_blog_desc': 'Publish, update and tidy up posts.',
        'dashboard_section_blog_cta': 'Open blog',
        'dashboard_section_growth_label': 'Visibility',
        'dashboard_section_growth_title': 'SEO, design and media',
        'dashboard_section_growth_desc': 'Adjust metadata, colors and images for a consistent expression.',
        'dashboard_section_growth_cta': 'Go to SEO',
        'dashboard_section_site_label': 'Live',
        'dashboard_section_site_title': 'Contact and public pages',
        'dashboard_section_site_desc': 'See how visitors experience the public site.',
        'dashboard_section_site_cta': 'Open website',
        'stats_visits': 'Visits (30d)',
        'stats_read': 'Posts Read',
        'stats_active': 'Active Users',
        'stats_time': 'Avg. Time',
        'quick_actions': 'Quick Actions',
        'edit_hero': 'Edit Hero Text',
        'upload_images': 'Upload Images',
        'save_changes': 'Save Changes',
        'blog_overview': 'Blog Overview',
        'blog_title': 'Title',
        'blog_date': 'Date',
        'blog_author': 'Author',
        'blog_actions': 'Actions',
        'design_colors': 'Design & Colors',
        'save_content': 'Save Content',
        'save_design': 'Save Design',
        'color_base': 'Main Color',
        'color_bg': 'Background Color',
        'color_text': 'Text Color',
        'typography': 'Font Family (Google Fonts)',
        'font_example_header': 'Heading Example',
        'font_example_text': 'This is a text to show how the selected font looks on your website. Readability is important.',
        'seo_title': 'Search Engine Optimization (SEO)',
        'save_seo': 'Save SEO',
        'global_settings': 'Global Settings',
        'global_desc': 'Applies to the entire website',
        'site_name': 'Site Name',
        'title_separator': 'Title Separator (e.g. | or -)',
        'ga_id': 'Google Analytics ID (G-XXXXXXX)',
        'default_keywords': 'Default Keywords (comma separated)',
        'page_seo': 'Page-specific SEO',
        'page_seo_desc': 'Customize title and description for each page',
        'tech_seo': 'Technical SEO',
        'view_sitemap': 'View Sitemap (sitemap.xml)',
        'sitemap_desc': 'Sitemap is generated automatically based on your pages and blog posts.',
        'media_lib': 'Media Library',
        'upload_img': 'Upload Image',
        'profile_display_name': 'Display Name',
        'profile_name_placeholder': 'Your Name',
        'profile_phone': 'Phone',
        'profile_dob': 'Date of Birth',
        'profile_address': 'Address',
        'profile_address_placeholder': 'Street, City, Zip',
        'profile_bio': 'About Me (Bio)',
        'profile_bio_placeholder': 'Tell us about yourself...',
        'profile_title': 'Profile Settings',
        'profile_avatar_hint': 'Allowed: JPG, PNG, GIF, WebP (Max 2MB)',
        'profile_email': 'Email',
        'btn_cancel': 'Cancel',
        'btn_save_changes': 'Save Changes'
    }
};

let adminDialogReady = false;
let adminDialogResolver = null;
let adminDialogState = null;

function setupAdminDialog() {
    if (adminDialogReady) return;

    const dialog = document.getElementById('admin-dialog');
    if (!dialog) return;

    const backdrop = dialog.querySelector('[data-dialog-dismiss]');
    const confirmBtn = document.getElementById('admin-dialog-confirm');
    const cancelBtn = document.getElementById('admin-dialog-cancel');

    function finishAdminDialog(result) {
        dialog.classList.remove('active', 'is-success', 'is-warning', 'is-danger');
        dialog.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('admin-dialog-open');

        const resolver = adminDialogResolver;
        adminDialogResolver = null;
        adminDialogState = null;

        if (resolver) {
            resolver(result);
        }
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => finishAdminDialog(true));
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => finishAdminDialog(false));
    }

    if (backdrop) {
        backdrop.addEventListener('click', () => {
            if (adminDialogState?.dismissible !== false) {
                finishAdminDialog(false);
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && dialog.classList.contains('active') && adminDialogState?.dismissible !== false) {
            finishAdminDialog(false);
        }
    });

    adminDialogReady = true;
}

function normalizeAdminErrorMessage(error, fallbackMessage) {
    const rawMessage = typeof error === 'string' ? error : (error?.message || '');

    if (!rawMessage) {
        return fallbackMessage;
    }

    if (/Could not save posts:\s*500/i.test(rawMessage)) {
        return 'Kunne ikke lagre innlegget akkurat nå. Serveren svarte med en intern feil (500).';
    }

    if (/Could not save posts:/i.test(rawMessage)) {
        return 'Kunne ikke lagre innlegget akkurat nå. Prøv igjen om et øyeblikk.';
    }

    if (/TK_FIREBASE_CLIENT_EMAIL|TK_FIREBASE_PRIVATE_KEY|mangler i Vercel-miljøet|mangler i/i.test(rawMessage)) {
        return 'Server mangler TK_FIREBASE_CLIENT_EMAIL eller TK_FIREBASE_PRIVATE_KEY. Sjekk at .env er satt opp riktig.';
    }

    if (/API_KEY_HTTP_REFERRER_BLOCKED|Requests from referer <empty> are blocked|gemini_api_key_http_referrer_blocked/i.test(rawMessage)) {
        return 'Gemini-nøkkelen er blokkert av referrer-regler. Gå til Google Cloud/API Keys og bruk en servernøkkel uten HTTP-referrer-restriksjon (API-restriksjon kan fortsatt være Generative Language API).';
    }

    if (/gemini_model_unavailable|is not found for API version|not supported for generateContent|No supported Gemini model available/i.test(rawMessage)) {
        return 'Gemini-modellen i serveren er ikke tilgjengelig. Sett GEMINI_MODEL til en gyldig modell (f.eks. gemini-2.0-flash), eller la serveren bruke automatisk fallback.';
    }

    if (/Failed to enrich post with AI|Gemini returned invalid JSON payload|Gemini returned empty English content/i.test(rawMessage)) {
        return 'Gemini klarte ikke å generere SEO/oversettelse i riktig format. Prøv igjen med en litt tydeligere tittel eller kortere innhold.';
    }

    return rawMessage;
}

async function parseApiErrorMessage(response, fallbackMessage) {
    let bodyText = '';
    let parsedDetails = '';

    try {
        bodyText = await response.text();
        try {
            const parsed = JSON.parse(bodyText);
            parsedDetails = parsed?.details || parsed?.error || '';
        } catch (parseError) {
            parsedDetails = '';
        }
    } catch (readError) {
        bodyText = '';
        parsedDetails = '';
    }

    return parsedDetails || bodyText || fallbackMessage;
}

function showAdminDialog({
    title = 'Melding',
    message = '',
    confirmText = 'OK',
    cancelText = 'Avbryt',
    variant = 'info',
    showCancel = false,
    dismissible = true
} = {}) {
    setupAdminDialog();

    const dialog = document.getElementById('admin-dialog');
    const titleEl = document.getElementById('admin-dialog-title');
    const messageEl = document.getElementById('admin-dialog-message');
    const iconEl = document.getElementById('admin-dialog-icon');
    const confirmBtn = document.getElementById('admin-dialog-confirm');
    const cancelBtn = document.getElementById('admin-dialog-cancel');

    if (!dialog || !titleEl || !messageEl || !iconEl || !confirmBtn || !cancelBtn) {
        const fallbackResult = showCancel ? window.confirm(`${title}\n\n${message}`) : (window.alert(message), true);
        return Promise.resolve(fallbackResult);
    }

    if (adminDialogResolver) {
        adminDialogResolver(false);
        adminDialogResolver = null;
    }

    const iconMap = {
        info: 'fa-circle-info',
        success: 'fa-circle-check',
        warning: 'fa-triangle-exclamation',
        danger: 'fa-circle-xmark'
    };

    dialog.classList.remove('is-success', 'is-warning', 'is-danger');
    if (variant === 'success') dialog.classList.add('is-success');
    if (variant === 'warning') dialog.classList.add('is-warning');
    if (variant === 'danger') dialog.classList.add('is-danger');

    iconEl.innerHTML = `<i class="fas ${iconMap[variant] || iconMap.info}"></i>`;
    titleEl.textContent = title;
    messageEl.textContent = message;
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;
    cancelBtn.style.display = showCancel ? 'inline-flex' : 'none';

    dialog.setAttribute('aria-hidden', 'false');
    dialog.classList.add('active');
    document.body.classList.add('admin-dialog-open');
    adminDialogState = { dismissible };

    window.setTimeout(() => {
        confirmBtn.focus();
    }, 0);

    return new Promise((resolve) => {
        adminDialogResolver = resolve;
    });
}

function showAdminNotice(message, options = {}) {
    return showAdminDialog({
        title: options.title || 'Oppdatering',
        message,
        confirmText: options.confirmText || 'OK',
        variant: options.variant || 'info',
        showCancel: false,
        dismissible: options.dismissible !== false
    });
}

function showAdminConfirm(message, options = {}) {
    return showAdminDialog({
        title: options.title || 'Bekreft handling',
        message,
        confirmText: options.confirmText || 'Fortsett',
        cancelText: options.cancelText || 'Avbryt',
        variant: options.variant || 'warning',
        showCancel: true,
        dismissible: options.dismissible !== false
    });
}

function updateDashboardLanguage() {
    const t = adminTranslations[currentLang] || adminTranslations['no'];

    // Handle text content and standard data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) {
            // Special handling for dynamic welcome message
            if (key === 'welcome' && currentUser) {
                const displayName = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
                el.textContent = `${t[key]}, ${displayName}`;
                return;
            }

            // Preserve icon if it exists
            const icon = el.querySelector('i');
            if (icon) {
                el.innerHTML = '';
                el.appendChild(icon);
                el.appendChild(document.createTextNode(' ' + t[key]));
            } else {
                el.innerText = t[key];
            }
        }
    });

    // Handle placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (t[key]) {
            el.placeholder = t[key];
        }
    });

    const activeNav = document.querySelector('.nav-btn.active[data-tab]');
    if (activeNav?.dataset.tab) {
        updateBreadcrumb(activeNav.dataset.tab);
    }
}

// ==========================================
// CRITICAL UI FUNCTIONS (DEFINED FIRST)
// ==========================================

// --- Sidebar Navigation Logic ---
window.switchPanel = function (btn, panelType) {
    console.log("Switching panel to:", panelType);

    // 2. Update Panel UI
    const panel = document.getElementById('settings-panel');
    if (!panel) return console.error('Settings panel not found');
    panel.style.display = '';

    const headerTitle = panel.querySelector('.settings-header h2');
    const tabsContainer = panel.querySelector('.settings-tabs');

    // Toggle Logic: If clicking ALREADY active button, close panel
    // We check classList BEFORE we update the active state below
    if (btn && btn.classList.contains('active') && panel.classList.contains('open')) {
        panel.classList.remove('open');
        btn.classList.remove('active');
        return;
    }

    // 1. Update Active State on Sidebar Icons (moved here)
    document.querySelectorAll('.sidebar-icon-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Open Panel
    panel.classList.add('open');

    // Hide all panel views (internal content)
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.main-panel-view').forEach(p => p.style.display = 'none');
    if (tabsContainer) tabsContainer.style.display = 'none';

    // Logic for each panel type
    if (panelType === 'settings') {
        if (headerTitle) headerTitle.textContent = 'Innleggsinnstillinger';
        if (tabsContainer) {
            tabsContainer.style.display = 'flex';
            // Restore active tab
            const activeTabBtn = tabsContainer.querySelector('.tab-btn.active') || tabsContainer.querySelector('.tab-btn');
            if (activeTabBtn) activeTabBtn.click();
        }

    } else if (panelType === 'add') {
        if (headerTitle) headerTitle.textContent = 'Legg til';
        const panelAdd = document.getElementById('panel-add');
        if (panelAdd) panelAdd.style.display = 'block';

    } else if (panelType === 'seo') {
        if (headerTitle) headerTitle.textContent = 'SEO Innstillinger';
        const panelSeo = document.getElementById('panel-seo');
        if (panelSeo) panelSeo.style.display = 'block';

    } else if (panelType === 'monetize') {
        if (headerTitle) headerTitle.textContent = 'Generer inntekter';
        const panelMonetize = document.getElementById('panel-monetize');
        if (panelMonetize) panelMonetize.style.display = 'block';

    } else if (panelType === 'apps') {
        if (headerTitle) headerTitle.textContent = 'AI Skrivehjelp';
        const panelApps = document.getElementById('panel-apps');
        if (panelApps) panelApps.style.display = 'block';

    } else if (panelType === 'translate') {
        if (headerTitle) headerTitle.textContent = 'Oversettelse';
        const panelTranslate = document.getElementById('panel-translate');
        if (panelTranslate) panelTranslate.style.display = 'block';
        if (typeof window.switchTranslateTab === 'function') {
            window.switchTranslateTab('no');
        }
    }
}

window.switchSettingsTab = function (tabName) {
    // 1. Update Buttons
    const buttons = document.querySelectorAll('.settings-tabs .tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Simple logic to activate correct button based on fuzzy match or index
    if (tabName === 'generelt' && buttons[0]) buttons[0].classList.add('active');
    if (tabName === 'kategorier' && buttons[1]) buttons[1].classList.add('active');
    if (tabName === 'tagger' && buttons[2]) buttons[2].classList.add('active');

    // 2. Update Content Panes
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    const targetPane = document.getElementById(`tab-${tabName}`);
    if (targetPane) targetPane.classList.add('active');
}

window.switchTranslateTab = function (lang) {
    const buttons = document.querySelectorAll('#panel-translate .translate-tab-btn');
    buttons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.translateTab === lang);
    });

    const paneNo = document.getElementById('translate-tab-no');
    const paneEn = document.getElementById('translate-tab-en');
    if (paneNo) paneNo.style.display = lang === 'no' ? 'block' : 'none';
    if (paneEn) paneEn.style.display = lang === 'en' ? 'block' : 'none';
}

window.toggleSettingsPanel = function () {
    const panel = document.getElementById('settings-panel');
    if (!panel) return;

    // Keep visibility controlled by the "open" class.
    // Inline display:none prevents the panel from opening again via sidebar buttons.
    panel.style.display = '';
    panel.classList.remove('open');
    document.querySelectorAll('.sidebar-icon-btn').forEach(btn => btn.classList.remove('active'));
}

// Global reference for image insert helper
window.insertUnsplashImage = window.insertUnsplashImage || function () { };

window.navigateBack = function () {
    const activeTab = document.querySelector('.nav-btn.active');
    if (activeTab) {
        activeTab.click();
    }
};

window.openEditModal = function (index) {
    const post = blogData[index];
    currentEditingId = post.id;

    document.getElementById('post-title').value = post.title;
    document.getElementById('post-author').value = post.author || 'Admin';
    setCurrentTaxonomyState(post);
    setCurrentGeneralSettingsState(post);
    renderPostTaxonomyEditors();

    const dateInput = document.getElementById('post-date');
    if (dateInput) {
        dateInput.value = resolvePostDateIso(post);
    }
    document.getElementById('post-image').value = post.image;
    const excerptInput = document.getElementById('post-excerpt');
    if (excerptInput) excerptInput.value = post.excerpt || '';

    // Populate SEO fields
    document.getElementById('post-seo-title').value = post.seoTitle || '';
    document.getElementById('post-seo-desc').value = post.seoDesc || '';
    document.getElementById('post-seo-keywords').value = post.seoKeywords || '';
    applyBlogDetailValuesToForm(post);
    applyEnglishValuesToForm(post);

    if (quill) setEditorHtmlContent(post.content || '');

    openModal();
}

window.deletePost = async function (index) {
    const shouldDelete = await showAdminConfirm(
        'Dette innlegget fjernes fra bloggoversikten. Du kan ikke angre direkte fra dashboardet.',
        {
            title: 'Slette innlegg?',
            confirmText: 'Slett innlegg',
            cancelText: 'Behold',
            variant: 'danger'
        }
    );

    if (shouldDelete) {
        blogData.splice(index, 1);
        await saveBlogPosts();
        await showAdminNotice('Innlegget er slettet fra bloggoversikten.', {
            title: 'Innlegg slettet',
            variant: 'success'
        });
    }
};

async function saveBlogPosts() {
    const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData)
    });

    if (!response.ok) {
        let errorBody = '';
        let serverDetails = '';

        try {
            errorBody = await response.text();
            try {
                const parsed = JSON.parse(errorBody);
                serverDetails = parsed?.details || parsed?.error || '';
            } catch (parseError) {
                serverDetails = '';
            }
        } catch (error) {
            errorBody = '';
            serverDetails = '';
        }

        if (response.status >= 500) {
            throw new Error(serverDetails || `Kunne ikke lagre innlegg. Serveren svarte med ${response.status}.`);
        }

        throw new Error(serverDetails || errorBody || `Kunne ikke lagre innlegg (${response.status}).`);
    }

    renderBlogList();
}

function getNextPostId() {
    return blogData.reduce((maxId, post) => {
        const numericId = Number(post.id) || 0;
        return Math.max(maxId, numericId);
    }, 0) + 1;
}

function normalizeKeywordCsv(value = '') {
    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .join(', ');
}

function normalizeOutlineItems(value = [], maxItems = 6) {
    const source = Array.isArray(value) ? value : String(value || '').split('\n');
    return source
        .map((item) => String(item || '').replace(/^[\-*]\s*/, '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .slice(0, maxItems);
}

function formatOutlineItemsForInput(value = []) {
    return normalizeOutlineItems(value, 20).join('\n');
}

function stripHtmlToPlainText(html = '') {
    const temp = document.createElement('div');
    temp.innerHTML = html || '';
    return String(temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim();
}

function normalizeManualHtmlContent(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return '';

    if (/<[a-z][\s\S]*>/i.test(raw)) {
        return raw;
    }

    const paragraphs = raw
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    if (!paragraphs.length) return '';

    return paragraphs.map((paragraph) => {
        const escapedLines = paragraph
            .split('\n')
            .map((line) => escapeHtmlForUi(line))
            .join('<br>');
        return `<p>${escapedLines}</p>`;
    }).join('');
}

function parseTableDimension(value, fallback = 3, max = 12) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, max);
}

function buildBlogTableHtml(rows = 3, cols = 3) {
    const safeRows = parseTableDimension(rows, 3);
    const safeCols = parseTableDimension(cols, 3);
    let tableHTML = '<table class="blog-table"><tbody>';

    for (let rowIndex = 0; rowIndex < safeRows; rowIndex++) {
        tableHTML += '<tr>';
        for (let colIndex = 0; colIndex < safeCols; colIndex++) {
            const tagName = rowIndex === 0 ? 'th' : 'td';
            tableHTML += `<${tagName}>Celle ${rowIndex + 1},${colIndex + 1}</${tagName}>`;
        }
        tableHTML += '</tr>';
    }

    tableHTML += '</tbody></table>';
    return tableHTML;
}

function decodeTableHtmlValue(value = '') {
    try {
        return decodeURIComponent(String(value || ''));
    } catch (error) {
        return String(value || '');
    }
}

function normalizeBlogTableHtml(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const temp = document.createElement('div');
    temp.innerHTML = raw;

    const table = temp.querySelector('table');
    if (!table) return '';

    table.classList.add('blog-table');
    table.removeAttribute('contenteditable');
    table.querySelectorAll('[contenteditable]').forEach((node) => node.removeAttribute('contenteditable'));
    table.querySelectorAll('[spellcheck]').forEach((node) => node.removeAttribute('spellcheck'));
    table.querySelectorAll('[tabindex]').forEach((node) => node.removeAttribute('tabindex'));
    table.querySelectorAll('[data-table-cell]').forEach((node) => node.removeAttribute('data-table-cell'));
    return table.outerHTML;
}

function unwrapTableEmbedsFromHtml(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const temp = document.createElement('div');
    temp.innerHTML = raw;

    temp.querySelectorAll(`.${TABLE_EMBED_CLASS}`).forEach((node) => {
        const liveHtml = normalizeBlogTableHtml(node.innerHTML);
        const storedHtml = normalizeBlogTableHtml(decodeTableHtmlValue(node.getAttribute('data-table-html') || ''));
        node.outerHTML = liveHtml || storedHtml || '';
    });

    return temp.innerHTML.trim();
}

function refreshTableEmbedValue(node) {
    if (!(node instanceof HTMLElement)) return;
    const normalizedHtml = normalizeBlogTableHtml(node.innerHTML) || buildBlogTableHtml(3, 3);
    node.setAttribute('data-table-html', encodeURIComponent(normalizedHtml));
}

function prepareTableEmbedNode(node) {
    if (!(node instanceof HTMLElement)) return;

    const normalizedHtml = normalizeBlogTableHtml(
        decodeTableHtmlValue(node.getAttribute('data-table-html') || '') || node.innerHTML
    ) || buildBlogTableHtml(3, 3);

    node.setAttribute('contenteditable', 'false');
    node.innerHTML = normalizedHtml;

    node.querySelectorAll('th, td').forEach((cell) => {
        cell.setAttribute('data-table-cell', 'true');
    });

    refreshTableEmbedValue(node);
}

function getAdjacentTableCell(currentCell, direction = 1) {
    const embed = currentCell?.closest?.(`.${TABLE_EMBED_CLASS}`);
    if (!(embed instanceof HTMLElement)) return null;

    const cells = Array.from(embed.querySelectorAll('th, td'));
    const currentIndex = cells.indexOf(currentCell);
    if (currentIndex === -1) return null;

    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= cells.length) return null;

    return cells[nextIndex] || null;
}

function getTableEditorInput() {
    if (activeTableEditorInput) {
        return activeTableEditorInput;
    }

    const input = document.createElement('textarea');
    input.className = 'table-cell-editor-input';
    input.setAttribute('aria-label', 'Rediger tabellcelle');

    input.addEventListener('blur', () => {
        closeTableCellEditor({ save: true });
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            const nextCell = activeTableEditorCell
                ? getAdjacentTableCell(activeTableEditorCell, event.shiftKey ? -1 : 1)
                : null;
            closeTableCellEditor({ save: true });
            if (nextCell) {
                openTableCellEditor(nextCell);
            } else if (quill) {
                quill.focus();
            }
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            closeTableCellEditor({ save: false });
            if (quill) quill.focus();
            return;
        }

        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            closeTableCellEditor({ save: true });
            if (quill) quill.focus();
        }
    });

    input.addEventListener('paste', (event) => {
        if (!activeTableEditorCell) return;
        const clipboardText = event.clipboardData?.getData('text/plain') || '';
        if (!clipboardText.includes('\t')) return;

        event.preventDefault();
        applyTableGridPaste(activeTableEditorCell, clipboardText);
        closeTableCellEditor({ save: false });
    });

    document.body.appendChild(input);
    activeTableEditorInput = input;
    return input;
}

function positionTableEditorInput(cell) {
    const input = getTableEditorInput();
    const rect = cell.getBoundingClientRect();
    input.style.display = 'block';
    input.style.top = `${rect.top}px`;
    input.style.left = `${rect.left}px`;
    input.style.width = `${Math.max(rect.width, 120)}px`;
    input.style.height = `${Math.max(rect.height, 52)}px`;
}

function setTableCellText(cell, value = '') {
    if (!(cell instanceof HTMLElement)) return;

    const normalizedValue = String(value || '').replace(/\r\n/g, '\n');
    const lines = normalizedValue.split('\n');
    cell.innerHTML = lines.map((line) => escapeHtmlForUi(line)).join('<br>');

    const embed = cell.closest(`.${TABLE_EMBED_CLASS}`);
    if (embed) {
        refreshTableEmbedValue(embed);
    }
}

function applyTableGridPaste(startCell, rawText = '') {
    const embed = startCell?.closest?.(`.${TABLE_EMBED_CLASS}`);
    const table = startCell?.closest?.('table');
    if (!(embed instanceof HTMLElement) || !(table instanceof HTMLTableElement)) return;

    const row = startCell.parentElement;
    const startRowIndex = Array.from(table.rows).indexOf(row);
    const startColIndex = Array.from(row?.cells || []).indexOf(startCell);
    if (startRowIndex < 0 || startColIndex < 0) return;

    const rows = String(rawText || '')
        .replace(/\r\n/g, '\n')
        .split('\n')
        .filter((line, index, collection) => line.length > 0 || index < collection.length - 1)
        .map((line) => line.split('\t'));

    rows.forEach((columns, rowOffset) => {
        const targetRow = table.rows[startRowIndex + rowOffset];
        if (!targetRow) return;

        columns.forEach((columnValue, colOffset) => {
            const targetCell = targetRow.cells[startColIndex + colOffset];
            if (!targetCell) return;
            setTableCellText(targetCell, columnValue);
        });
    });

    refreshTableEmbedValue(embed);
}

function openTableCellEditor(cell) {
    if (!(cell instanceof HTMLElement)) return;

    if (activeTableEditorCell && activeTableEditorCell !== cell) {
        closeTableCellEditor({ save: true });
    }

    activeTableEditorCell = cell;
    const input = getTableEditorInput();
    input.value = String(cell.innerText || cell.textContent || '');
    positionTableEditorInput(cell);
    window.requestAnimationFrame(() => {
        input.focus();
        input.select();
    });
}

function closeTableCellEditor({ save = true } = {}) {
    if (!activeTableEditorInput || !activeTableEditorCell) {
        return;
    }

    const currentCell = activeTableEditorCell;
    const input = activeTableEditorInput;

    if (save) {
        setTableCellText(currentCell, input.value);
    }

    input.style.display = 'none';
    activeTableEditorCell = null;
}

function setEditorHtmlContent(value = '') {
    if (!quill) return;

    closeTableCellEditor({ save: true });

    const normalizedHtml = unwrapTableEmbedsFromHtml(value);
    quill.setText('');

    if (!normalizedHtml) return;

    quill.clipboard.dangerouslyPasteHTML(0, normalizedHtml, Quill.sources.SILENT);
}

function getEditorHtmlContent() {
    if (!quill) return '';
    closeTableCellEditor({ save: true });
    return unwrapTableEmbedsFromHtml(quill.root?.innerHTML || '');
}

function getTodayIsoDate() {
    const now = new Date();
    const local = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return local.toISOString().slice(0, 10);
}

function normalizeIsoDate(value = '') {
    const raw = String(value || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return '';
    return raw;
}

function parseNorwegianDateToIso(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const monthMap = {
        januar: '01',
        februar: '02',
        mars: '03',
        april: '04',
        mai: '05',
        juni: '06',
        juli: '07',
        august: '08',
        september: '09',
        oktober: '10',
        november: '11',
        desember: '12'
    };

    const numericMatch = raw.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
    if (numericMatch) {
        const day = numericMatch[1].padStart(2, '0');
        const month = numericMatch[2].padStart(2, '0');
        const year = numericMatch[3];
        return `${year}-${month}-${day}`;
    }

    const norwegianMatch = raw.toLowerCase().match(/^(\d{1,2})\.\s*([a-zæøå]+)\s+(\d{4})$/i);
    if (norwegianMatch) {
        const day = norwegianMatch[1].padStart(2, '0');
        const monthName = norwegianMatch[2];
        const month = monthMap[monthName];
        const year = norwegianMatch[3];
        if (month) {
            return `${year}-${month}-${day}`;
        }
    }

    return '';
}

function resolvePostDateIso(post = {}) {
    const directIso = normalizeIsoDate(post.dateIso || post.date);
    if (directIso) {
        return directIso;
    }

    const parsedNoDate = parseNorwegianDateToIso(post.date);
    if (parsedNoDate) {
        return parsedNoDate;
    }

    const parsedDate = new Date(String(post.date || '').trim());
    if (Number.isFinite(parsedDate.getTime())) {
        return parsedDate.toISOString().slice(0, 10);
    }

    return getTodayIsoDate();
}

function formatDateForPost(isoDate = '') {
    const normalized = normalizeIsoDate(isoDate) || getTodayIsoDate();
    const dateObj = new Date(`${normalized}T12:00:00`);
    if (!Number.isFinite(dateObj.getTime())) {
        return new Date().toLocaleDateString('no-NO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    return new Intl.DateTimeFormat('no-NO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(dateObj);
}

function escapeHtmlForUi(value = '') {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeTaxonomyValue(value = '') {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function dedupeTaxonomyValues(values = []) {
    const deduped = [];
    const seen = new Set();

    (Array.isArray(values) ? values : []).forEach((value) => {
        const normalized = normalizeTaxonomyValue(value);
        if (!normalized) return;
        const key = normalized.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        deduped.push(normalized);
    });

    return deduped;
}

function syncPrimaryCategoryField() {
    const hiddenCategoryInput = document.getElementById('post-category');
    if (hiddenCategoryInput) {
        hiddenCategoryInput.value = currentPostCategories[0] || 'Generelt';
    }
}

function syncTaxonomyCounters() {
    const buttons = document.querySelectorAll('.settings-tabs .tab-btn');
    const categoryCounter = buttons[1]?.querySelector('.counter');
    const tagCounter = buttons[2]?.querySelector('.counter');

    if (categoryCounter) categoryCounter.textContent = String(currentPostCategories.length || 0);
    if (tagCounter) tagCounter.textContent = String(currentPostTags.length || 0);
}

function renderPostTaxonomyEditors() {
    const categoryPane = document.getElementById('tab-kategorier');
    const tagPane = document.getElementById('tab-tagger');

    if (categoryPane) {
        const categoryChips = currentPostCategories.length
            ? currentPostCategories.map((category, index) => `
                <div class="taxonomy-chip">
                    <span>${escapeHtmlForUi(category)}${index === 0 ? ' <em class="taxonomy-primary-badge">Hoved</em>' : ''}</span>
                    <button type="button" onclick="removePostCategory(${index})" aria-label="Fjern kategori">×</button>
                </div>
            `).join('')
            : '<p class="empty-state">Ingen kategorier ennå.</p>';

        categoryPane.innerHTML = `
            <div class="taxonomy-panel">
                <p class="taxonomy-help-text">Legg til en eller flere kategorier. Første kategori brukes som hovedkategori.</p>
                <div class="taxonomy-input-row">
                    <input type="text" id="post-category-input" placeholder="F.eks Webdesign">
                    <button type="button" class="action-btn" onclick="addPostCategory()">Legg til</button>
                </div>
                <div class="taxonomy-chip-list">${categoryChips}</div>
            </div>
        `;
    }

    if (tagPane) {
        const tagChips = currentPostTags.length
            ? currentPostTags.map((tag, index) => `
                <div class="taxonomy-chip">
                    <span>#${escapeHtmlForUi(tag)}</span>
                    <button type="button" onclick="removePostTag(${index})" aria-label="Fjern tagg">×</button>
                </div>
            `).join('')
            : '<p class="empty-state">Ingen tagger ennå.</p>';

        tagPane.innerHTML = `
            <div class="taxonomy-panel">
                <p class="taxonomy-help-text">Tagger brukes til filtrering og interne søk.</p>
                <div class="taxonomy-input-row">
                    <input type="text" id="post-tag-input" placeholder="F.eks SEO">
                    <button type="button" class="action-btn" onclick="addPostTag()">Legg til</button>
                </div>
                <div class="taxonomy-chip-list">${tagChips}</div>
            </div>
        `;
    }

    const categoryInput = document.getElementById('post-category-input');
    if (categoryInput) {
        categoryInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                window.addPostCategory();
            }
        });
    }

    const tagInput = document.getElementById('post-tag-input');
    if (tagInput) {
        tagInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                window.addPostTag();
            }
        });
    }

    syncPrimaryCategoryField();
    syncTaxonomyCounters();
}

window.addPostCategory = function () {
    const input = document.getElementById('post-category-input');
    if (!input) return;

    const normalized = normalizeTaxonomyValue(input.value);
    if (!normalized) return;

    const merged = dedupeTaxonomyValues([...currentPostCategories, normalized]).slice(0, POST_MAX_CATEGORIES);
    currentPostCategories = merged.length ? merged : ['Generelt'];
    input.value = '';
    renderPostTaxonomyEditors();
};

window.removePostCategory = function (index) {
    if (!Number.isInteger(index) || index < 0 || index >= currentPostCategories.length) return;
    currentPostCategories.splice(index, 1);
    if (!currentPostCategories.length) {
        currentPostCategories = ['Generelt'];
    }
    renderPostTaxonomyEditors();
};

window.addPostTag = function () {
    const input = document.getElementById('post-tag-input');
    if (!input) return;

    const normalized = normalizeTaxonomyValue(input.value).replace(/^#/, '');
    if (!normalized) return;

    currentPostTags = dedupeTaxonomyValues([...currentPostTags, normalized]).slice(0, POST_MAX_TAGS);
    input.value = '';
    renderPostTaxonomyEditors();
};

window.removePostTag = function (index) {
    if (!Number.isInteger(index) || index < 0 || index >= currentPostTags.length) return;
    currentPostTags.splice(index, 1);
    renderPostTaxonomyEditors();
};

function setCurrentTaxonomyState(post = {}) {
    const categories = dedupeTaxonomyValues([
        ...(Array.isArray(post.categories) ? post.categories : []),
        post.category
    ]);

    currentPostCategories = categories.length ? categories.slice(0, POST_MAX_CATEGORIES) : ['Generelt'];

    const tagCandidates = Array.isArray(post.tags) && post.tags.length
        ? post.tags
        : normalizeKeywordCsv(post.seoKeywords || '').split(',');

    currentPostTags = dedupeTaxonomyValues(tagCandidates).slice(0, POST_MAX_TAGS);
    syncPrimaryCategoryField();
    syncTaxonomyCounters();
}

function normalizeRelatedPostIds(value = [], maxItems = POST_MAX_RELATED) {
    const source = Array.isArray(value) ? value : String(value || '').split(',');
    const normalized = [];
    const seen = new Set();

    source.forEach((item) => {
        const id = Number(String(item || '').trim());
        if (!Number.isFinite(id) || id <= 0) return;
        if (seen.has(id)) return;
        seen.add(id);
        normalized.push(id);
    });

    return normalized.slice(0, maxItems);
}

function getCurrentRelatedPosts() {
    const activePostId = Number(currentEditingId);
    return (Array.isArray(blogData) ? blogData : [])
        .filter((post) => Number(post.id) !== activePostId)
        .map((post) => ({
            id: Number(post.id),
            title: String(post.title || `Innlegg ${post.id}`),
            date: String(post.date || '')
        }))
        .filter((post) => Number.isFinite(post.id));
}

function syncRelatedPostsUi() {
    const countEl = document.getElementById('related-post-count');
    if (countEl) {
        countEl.textContent = `${currentRelatedPostIds.length}/${POST_MAX_RELATED}`;
    }

    const picker = document.getElementById('related-posts-picker');
    if (!picker) return;

    const posts = getCurrentRelatedPosts();
    const selectedPosts = currentRelatedPostIds
        .map((id) => posts.find((post) => post.id === id))
        .filter(Boolean);

    const chipsHtml = selectedPosts.length
        ? selectedPosts.map((post) => `
            <div class="related-post-chip">
                <span>${escapeHtmlForUi(post.title)}</span>
                <button type="button" onclick="toggleRelatedPostSelection(${post.id})" aria-label="Fjern relatert innlegg">×</button>
            </div>
        `).join('')
        : '<p class="empty-state">Ingen relaterte innlegg valgt.</p>';

    const optionsHtml = posts.length
        ? posts.map((post) => `
            <label class="related-post-option">
                <input type="checkbox" ${currentRelatedPostIds.includes(post.id) ? 'checked' : ''} onchange="toggleRelatedPostSelection(${post.id})">
                <span>${escapeHtmlForUi(post.title)}</span>
            </label>
        `).join('')
        : '<p class="empty-state">Ingen andre innlegg tilgjengelig ennå.</p>';

    picker.innerHTML = `
        <div class="related-post-chip-list">${chipsHtml}</div>
        <div class="related-post-options">${optionsHtml}</div>
    `;
}

window.toggleRelatedPostsPicker = function () {
    const picker = document.getElementById('related-posts-picker');
    if (!picker) return;

    const isOpen = picker.style.display === 'block';
    picker.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
        syncRelatedPostsUi();
    }
};

window.toggleRelatedPostSelection = function (postId) {
    const numericId = Number(postId);
    if (!Number.isFinite(numericId)) return;

    const existingIndex = currentRelatedPostIds.indexOf(numericId);
    if (existingIndex >= 0) {
        currentRelatedPostIds.splice(existingIndex, 1);
        syncRelatedPostsUi();
        return;
    }

    if (currentRelatedPostIds.length >= POST_MAX_RELATED) {
        showAdminNotice(`Du kan velge maks ${POST_MAX_RELATED} relaterte innlegg.`, {
            title: 'Maks antall nådd',
            variant: 'warning'
        });
        syncRelatedPostsUi();
        return;
    }

    currentRelatedPostIds.push(numericId);
    syncRelatedPostsUi();
};

function setCurrentGeneralSettingsState(post = {}) {
    const relatedIds = normalizeRelatedPostIds(post.relatedPostIds || post.relatedPosts || []);
    currentRelatedPostIds = relatedIds;

    const showFeaturedImageToggle = document.getElementById('post-show-featured-image-toggle');
    const featuredToggle = document.getElementById('post-featured-toggle');
    const commentsToggle = document.getElementById('post-comments-toggle');

    if (showFeaturedImageToggle) showFeaturedImageToggle.checked = post.showFeaturedImage !== false;
    if (featuredToggle) featuredToggle.checked = Boolean(post.isFeatured);
    if (commentsToggle) commentsToggle.checked = post.allowComments !== false;

    syncRelatedPostsUi();
}

function buildAiSourceSignature(postPayload = {}) {
    return [
        String(postPayload.title || '').trim(),
        String(postPayload.excerpt || '').trim(),
        String(postPayload.category || '').trim(),
        String(postPayload.content || '').trim()
    ].join('||');
}

function shouldAutoEnrichPost(postPayload = {}) {
    const missingNorwegianSeo = !String(postPayload.seoTitle || '').trim()
        || !String(postPayload.seoDesc || '').trim()
        || !String(postPayload.seoKeywords || '').trim();
    const missingEnglishVersion = !String(postPayload.titleEn || '').trim()
        || !String(postPayload.excerptEn || '').trim()
        || !String(postPayload.contentEn || '').trim()
        || !String(postPayload.seoTitleEn || '').trim()
        || !String(postPayload.seoDescEn || '').trim();
    const missingDetailSuggestions = !String(postPayload.autoSummary || '').trim()
        || !Array.isArray(postPayload.autoOutline)
        || postPayload.autoOutline.length === 0
        || !String(postPayload.autoSummaryEn || '').trim()
        || !Array.isArray(postPayload.autoOutlineEn)
        || postPayload.autoOutlineEn.length === 0;
    const signature = buildAiSourceSignature(postPayload);

    return missingNorwegianSeo
        || missingEnglishVersion
        || missingDetailSuggestions
        || String(postPayload.aiSourceSignature || '') !== signature;
}

function buildPostPayload() {
    const title = document.getElementById('post-title')?.value.trim();
    if (!title) {
        throw new Error('Innleggstittel mangler');
    }

    const postId = currentEditingId || getNextPostId();
    const content = getEditorHtmlContent().trim();
    const dateInput = document.getElementById('post-date');
    const dateIso = normalizeIsoDate(dateInput?.value) || getTodayIsoDate();
    const categories = currentPostCategories.length ? [...currentPostCategories] : ['Generelt'];
    const tags = [...currentPostTags];
    const primaryCategory = categories[0] || 'Generelt';
    const seoKeywordsFromField = normalizeKeywordCsv(document.getElementById('post-seo-keywords')?.value || '');
    const seoKeywordsEnFromField = normalizeKeywordCsv(document.getElementById('post-seo-keywords-en')?.value || '');
    const detailSummary = document.getElementById('post-detail-summary')?.value.trim() || '';
    const detailOutline = normalizeOutlineItems(document.getElementById('post-detail-outline')?.value || '');
    const detailSummaryEn = document.getElementById('post-detail-summary-en')?.value.trim() || '';
    const detailOutlineEn = normalizeOutlineItems(document.getElementById('post-detail-outline-en')?.value || '');
    const manualContentEn = normalizeManualHtmlContent(document.getElementById('post-content-en')?.value || '');
    const relatedPostIds = normalizeRelatedPostIds(currentRelatedPostIds);
    const showFeaturedImage = document.getElementById('post-show-featured-image-toggle')?.checked !== false;
    const isFeatured = Boolean(document.getElementById('post-featured-toggle')?.checked);
    const allowComments = document.getElementById('post-comments-toggle')?.checked !== false;

    return {
        id: postId,
        title,
        author: document.getElementById('post-author')?.value || 'Admin',
        category: primaryCategory,
        categories,
        tags,
        dateIso,
        date: formatDateForPost(dateIso),
        image: document.getElementById('post-image')?.value || 'img/blog/bblog1.png',
        excerpt: document.getElementById('post-excerpt')?.value.trim() || '',
        content: content || '<p>Nytt innlegg uten innhold.</p>',
        titleEn: document.getElementById('post-title-en')?.value.trim() || '',
        excerptEn: document.getElementById('post-excerpt-en')?.value.trim() || '',
        categoryEn: document.getElementById('post-category-en')?.value.trim() || '',
        contentEn: manualContentEn,
        seoTitle: document.getElementById('post-seo-title')?.value.trim() || '',
        seoDesc: document.getElementById('post-seo-desc')?.value.trim() || '',
        seoKeywords: seoKeywordsFromField || normalizeKeywordCsv(tags.join(', ')),
        seoTitleEn: document.getElementById('post-seo-title-en')?.value.trim() || '',
        seoDescEn: document.getElementById('post-seo-desc-en')?.value.trim() || '',
        seoKeywordsEn: seoKeywordsEnFromField,
        detailSummary,
        detailOutline,
        detailSummaryEn,
        detailOutlineEn,
        relatedPostIds,
        relatedPosts: relatedPostIds,
        showFeaturedImage,
        isFeatured,
        allowComments,
        link: `blog-details.html?id=${postId}`
    };
}

async function requestAiSeoAndTranslation(postPayload) {
    const response = await fetch(`${API_URL}/blog/ai-enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: postPayload.title,
            content: postPayload.content,
            excerpt: postPayload.excerpt,
            category: postPayload.category,
            seoTitle: postPayload.seoTitle,
            seoDesc: postPayload.seoDesc,
            seoKeywords: postPayload.seoKeywords
        })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload?.details || payload?.error || `AI-feil (${response.status})`);
    }

    return payload;
}

function mergeAiEnhancementsIntoPost(postPayload, aiPayload, { forceSeo = false } = {}) {
    const mergedPayload = { ...postPayload };
    const aiSeo = aiPayload?.seo || {};
    const aiSummary = aiPayload?.summary || {};
    const aiOutline = aiPayload?.outline || {};
    const aiTranslation = aiPayload?.translation || {};

    const generatedSeoTitle = String(aiSeo.title || '').trim();
    const generatedSeoDesc = String(aiSeo.description || '').trim();
    const generatedSeoKeywords = normalizeKeywordCsv(aiSeo.keywords || '');
    const shouldUpdateSeo = forceSeo || !mergedPayload.seoTitle || !mergedPayload.seoDesc || !mergedPayload.seoKeywords;

    if (shouldUpdateSeo) {
        mergedPayload.seoTitle = generatedSeoTitle || mergedPayload.seoTitle || mergedPayload.title;
        mergedPayload.seoDesc = generatedSeoDesc || mergedPayload.seoDesc || '';
        mergedPayload.seoKeywords = generatedSeoKeywords || mergedPayload.seoKeywords || '';
    } else {
        mergedPayload.seoTitle = mergedPayload.seoTitle || mergedPayload.title;
        mergedPayload.seoKeywords = normalizeKeywordCsv(mergedPayload.seoKeywords);
    }

    const translatedTitle = String(aiTranslation.title || '').trim();
    const translatedExcerpt = String(aiTranslation.excerpt || '').trim();
    const translatedCategory = String(aiTranslation.category || '').trim();
    const translatedContent = String(aiTranslation.content || '').trim();
    const translatedSeoTitle = String(aiTranslation.seoTitle || '').trim();
    const translatedSeoDesc = String(aiTranslation.seoDesc || '').trim();
    const translatedSeoKeywords = normalizeKeywordCsv(aiTranslation.seoKeywords || '');
    const translatedFallbackExcerpt = stripHtmlToPlainText(translatedContent).slice(0, 220).trim();
    const generatedSummaryNo = String(aiSummary.no || aiPayload?.overviewNo || '').trim();
    const generatedSummaryEn = String(aiSummary.en || aiTranslation.summary || '').trim();
    const generatedOutlineNo = normalizeOutlineItems(aiOutline.no || aiPayload?.outlineNo || []);
    const generatedOutlineEn = normalizeOutlineItems(aiOutline.en || aiTranslation.outline || []);

    mergedPayload.titleEn = translatedTitle || mergedPayload.title;
    mergedPayload.excerptEn = translatedExcerpt || translatedFallbackExcerpt || mergedPayload.excerpt || '';
    mergedPayload.categoryEn = translatedCategory || mergedPayload.category || 'General';
    mergedPayload.contentEn = translatedContent || mergedPayload.content;
    mergedPayload.seoTitleEn = translatedSeoTitle || mergedPayload.titleEn;
    mergedPayload.seoDescEn = translatedSeoDesc || mergedPayload.excerptEn || '';
    mergedPayload.seoKeywordsEn = translatedSeoKeywords || normalizeKeywordCsv(mergedPayload.seoKeywordsEn || '');
    if (generatedSummaryNo) mergedPayload.autoSummary = generatedSummaryNo;
    if (generatedSummaryEn) mergedPayload.autoSummaryEn = generatedSummaryEn;
    if (generatedOutlineNo.length) mergedPayload.autoOutline = generatedOutlineNo;
    if (generatedOutlineEn.length) mergedPayload.autoOutlineEn = generatedOutlineEn;
    mergedPayload.aiLocalizedAt = new Date().toISOString();

    return mergedPayload;
}

function applySeoValuesToForm(postPayload) {
    const seoTitleInput = document.getElementById('post-seo-title');
    const seoDescInput = document.getElementById('post-seo-desc');
    const seoKeywordsInput = document.getElementById('post-seo-keywords');

    if (seoTitleInput) seoTitleInput.value = postPayload.seoTitle || '';
    if (seoDescInput) seoDescInput.value = postPayload.seoDesc || '';
    if (seoKeywordsInput) seoKeywordsInput.value = postPayload.seoKeywords || '';
}

function applyBlogDetailValuesToForm(postPayload = {}) {
    const summaryInput = document.getElementById('post-detail-summary');
    const outlineInput = document.getElementById('post-detail-outline');
    const summaryValue = String(postPayload.detailSummary || postPayload.autoSummary || '').trim();
    const outlineSource = Array.isArray(postPayload.detailOutline) && postPayload.detailOutline.length
        ? postPayload.detailOutline
        : (Array.isArray(postPayload.autoOutline) ? postPayload.autoOutline : []);

    if (summaryInput) summaryInput.value = summaryValue;
    if (outlineInput) outlineInput.value = formatOutlineItemsForInput(outlineSource);
}

function applyEnglishValuesToForm(postPayload = {}) {
    const titleInput = document.getElementById('post-title-en');
    const excerptInput = document.getElementById('post-excerpt-en');
    const categoryInput = document.getElementById('post-category-en');
    const contentInput = document.getElementById('post-content-en');
    const seoTitleInput = document.getElementById('post-seo-title-en');
    const seoDescInput = document.getElementById('post-seo-desc-en');
    const seoKeywordsInput = document.getElementById('post-seo-keywords-en');
    const detailSummaryInput = document.getElementById('post-detail-summary-en');
    const detailOutlineInput = document.getElementById('post-detail-outline-en');

    if (titleInput) titleInput.value = postPayload.titleEn || '';
    if (excerptInput) excerptInput.value = postPayload.excerptEn || '';
    if (categoryInput) categoryInput.value = postPayload.categoryEn || '';
    if (contentInput) contentInput.value = postPayload.contentEn || '';
    if (seoTitleInput) seoTitleInput.value = postPayload.seoTitleEn || '';
    if (seoDescInput) seoDescInput.value = postPayload.seoDescEn || '';
    if (seoKeywordsInput) seoKeywordsInput.value = postPayload.seoKeywordsEn || '';
    if (detailSummaryInput) detailSummaryInput.value = String(postPayload.detailSummaryEn || postPayload.autoSummaryEn || '').trim();

    const outlineSource = Array.isArray(postPayload.detailOutlineEn) && postPayload.detailOutlineEn.length
        ? postPayload.detailOutlineEn
        : (Array.isArray(postPayload.autoOutlineEn) ? postPayload.autoOutlineEn : []);
    if (detailOutlineInput) detailOutlineInput.value = formatOutlineItemsForInput(outlineSource);
}

async function persistPostPayload(postPayload) {
    const existingIndex = blogData.findIndex((post) => Number(post.id) === Number(postPayload.id));
    const previousSnapshot = Array.isArray(blogData) ? blogData.map((post) => ({ ...post })) : [];

    if (existingIndex >= 0) {
        blogData[existingIndex] = postPayload;
    } else {
        blogData.unshift(postPayload);
    }

    try {
        await saveBlogPosts();
    } catch (error) {
        blogData = previousSnapshot;
        throw error;
    }
}

async function enrichPostInBackground(postPayload) {
    const postId = Number(postPayload.id);
    if (!Number.isFinite(postId)) return;

    const signature = buildAiSourceSignature(postPayload);
    const existingSignature = aiEnrichmentInFlight.get(postId);
    if (existingSignature === signature) {
        return;
    }

    aiEnrichmentInFlight.set(postId, signature);

    try {
        const aiPayload = await requestAiSeoAndTranslation(postPayload);
        if (aiEnrichmentInFlight.get(postId) !== signature) {
            return;
        }

        const currentIndex = blogData.findIndex((post) => Number(post.id) === postId);
        if (currentIndex === -1) return;

        const currentPost = blogData[currentIndex];
        const forceSeo = !String(currentPost.seoTitle || '').trim()
            || !String(currentPost.seoDesc || '').trim()
            || !String(currentPost.seoKeywords || '').trim();
        const mergedPayload = mergeAiEnhancementsIntoPost(currentPost, aiPayload, { forceSeo });
        mergedPayload.aiSourceSignature = signature;

        await persistPostPayload(mergedPayload);
    } catch (error) {
        console.warn('Background AI enrichment failed:', error);
    } finally {
        if (aiEnrichmentInFlight.get(postId) === signature) {
            aiEnrichmentInFlight.delete(postId);
        }
    }
}

async function triggerSocialAutopost(postPayload) {
    try {
        const response = await fetch(`${API_URL}/social/autopost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: postPayload })
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            const details = payload?.details || payload?.error || `SoMe-feil (${response.status})`;
            await showAdminNotice(`Innlegget er publisert, men SoMe-autopost feilet: ${details}`, {
                title: 'SoMe autopost feilet',
                variant: 'warning'
            });
            return;
        }

        if (payload?.sent === false) {
            console.info('[SoMe] Autopost er ikke aktivert:', payload?.details || payload?.code || 'not_configured');
            return;
        }

        console.info('[SoMe] Autopost trigget.');
    } catch (error) {
        console.warn('Social autopost request failed:', error);
        await showAdminNotice('Innlegget er publisert, men kunne ikke sende SoMe-autopost.', {
            title: 'SoMe autopost feilet',
            variant: 'warning'
        });
    }
}

async function upsertCurrentPost(successMessage, options = {}) {
    const basePayload = buildPostPayload();
    const existingPost = blogData.find((post) => Number(post.id) === Number(basePayload.id));
    const postPayload = existingPost ? { ...existingPost, ...basePayload } : basePayload;

    applySeoValuesToForm(postPayload);
    applyBlogDetailValuesToForm(postPayload);
    applyEnglishValuesToForm(postPayload);
    await persistPostPayload(postPayload);

    currentEditingId = postPayload.id;
    closeModal();
    await showAdminNotice(successMessage, {
        title: 'Innlegg oppdatert',
        variant: 'success'
    });

    if (options?.triggerSocialAutopost) {
        void triggerSocialAutopost(postPayload);
    }

    if (shouldAutoEnrichPost(postPayload)) {
        void enrichPostInBackground(postPayload);
    }
}

window.generateSeoForCurrentDraft = async function () {
    if (aiSeoInFlight) return;

    let basePayload;
    try {
        basePayload = buildPostPayload();
    } catch (error) {
        await showAdminNotice(
            normalizeAdminErrorMessage(error, 'Skriv minst en tittel før SEO-generering.'),
            {
                title: 'Mangler data',
                variant: 'warning'
            }
        );
        return;
    }

    const generateBtn = document.getElementById('ai-generate-seo-btn');
    const originalBtnContent = generateBtn ? generateBtn.innerHTML : '';

    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Genererer SEO...';
    }

    aiSeoInFlight = true;
    try {
        const aiPayload = await requestAiSeoAndTranslation(basePayload);
        const mergedPayload = mergeAiEnhancementsIntoPost(basePayload, aiPayload, { forceSeo: true });
        applySeoValuesToForm(mergedPayload);
        applyBlogDetailValuesToForm(mergedPayload);
        applyEnglishValuesToForm(mergedPayload);

        await showAdminNotice('SEO og detaljforslag er oppdatert med Gemini.', {
            title: 'Forslag generert',
            variant: 'success'
        });
    } catch (error) {
        console.error('Error generating SEO with AI:', error);
        await showAdminNotice(
            normalizeAdminErrorMessage(error, 'Det oppstod en feil ved SEO-generering.'),
            {
                title: 'SEO-generering feilet',
                variant: 'danger'
            }
        );
    } finally {
        aiSeoInFlight = false;
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalBtnContent;
        }
    }
};

window.translateCurrentDraftWithAi = async function () {
    if (aiTranslateInFlight) return;

    let basePayload;
    try {
        basePayload = buildPostPayload();
    } catch (error) {
        await showAdminNotice(
            normalizeAdminErrorMessage(error, 'Skriv minst en tittel før oversettelse.'),
            {
                title: 'Mangler data',
                variant: 'warning'
            }
        );
        return;
    }

    const existingPost = blogData.find((post) => Number(post.id) === Number(basePayload.id));
    const sourcePayload = existingPost ? { ...existingPost, ...basePayload } : basePayload;

    const translateBtn = document.getElementById('ai-translate-btn');
    const originalBtnContent = translateBtn ? translateBtn.innerHTML : '';

    if (translateBtn) {
        translateBtn.disabled = true;
        translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Oversetter...';
    }

    aiTranslateInFlight = true;
    try {
        const aiPayload = await requestAiSeoAndTranslation(sourcePayload);
        const mergedPayload = mergeAiEnhancementsIntoPost(sourcePayload, aiPayload, { forceSeo: false });
        mergedPayload.aiSourceSignature = buildAiSourceSignature(sourcePayload);

        applySeoValuesToForm(mergedPayload);
        applyBlogDetailValuesToForm(mergedPayload);
        applyEnglishValuesToForm(mergedPayload);
        await persistPostPayload(mergedPayload);
        currentEditingId = mergedPayload.id;

        renderBlogList();
        await showAdminNotice('Oversettelse er generert og lagret for innlegget.', {
            title: 'Oversettelse ferdig',
            variant: 'success'
        });
    } catch (error) {
        console.error('Error generating translation with AI:', error);
        await showAdminNotice(
            normalizeAdminErrorMessage(error, 'Det oppstod en feil ved oversettelse.'),
            {
                title: 'Oversettelse feilet',
                variant: 'danger'
            }
        );
    } finally {
        aiTranslateInFlight = false;
        if (translateBtn) {
            translateBtn.disabled = false;
            translateBtn.innerHTML = originalBtnContent;
        }
    }
};

window.savePost = async function () {
    try {
        await upsertCurrentPost('Innlegg lagret.');
    } catch (error) {
        console.error('Error saving post:', error);
        await showAdminNotice(
            normalizeAdminErrorMessage(error, 'Kunne ikke lagre innlegget.'),
            {
                title: 'Kunne ikke lagre',
                variant: 'danger'
            }
        );
    }
};

window.publishPost = async function () {
    try {
        await upsertCurrentPost('Innlegg publisert.', { triggerSocialAutopost: true });
    } catch (error) {
        console.error('Error publishing post:', error);
        await showAdminNotice(
            normalizeAdminErrorMessage(error, 'Kunne ikke publisere innlegget.'),
            {
                title: 'Publisering feilet',
                variant: 'danger'
            }
        );
    }
};


// ==========================================
// INITIALIZATION LOGIC
// ==========================================

// Initial Load
async function init() {

    // Initialize Quill Safely
    if (typeof Quill !== 'undefined') {
        try {
            quill = new Quill('#editor-container', {
                theme: 'bubble',
                placeholder: 'Start å skrive din historie...',
                modules: {}
            });
            registerCustomBlots();// Register blots after quill runs
        } catch (e) {
            console.error("Quill initialization failed:", e);
        }
    } else {
        console.error("Quill library not loaded!");
    }

    setupEventListeners();
    setupAdminSidebarToggle();
    setupLogout();
    syncAdminScrollMode();

    await Promise.allSettled([
        fetchStyles(),
        fetchContent(),
        fetchBlogPosts(),
        fetchSeo(),
        refreshSocialPlannerState({ silent: true })
    ]);

    try {
        renderContentEditor();
    } catch (error) {
        console.error('Error rendering content editor:', error);
    }

    try {
        renderBlogList();
    } catch (error) {
        console.error('Error rendering blog list:', error);
    }

    try {
        renderDashboardOverview();
    } catch (error) {
        console.error('Error rendering dashboard overview:', error);
    }
}

function registerCustomBlots() {
    if (typeof Quill === 'undefined') return;

    // Custom Divider Blot
    const BlockEmbed = Quill.import('blots/block/embed');
    const Delta = Quill.import('delta');
    class DividerBlot extends BlockEmbed { }
    DividerBlot.blotName = 'divider';
    DividerBlot.tagName = 'hr';
    Quill.register(DividerBlot);

    const Block = Quill.import('blots/block');
    class AlertBlot extends Block {
        static create(value) {
            let node = super.create();
            node.setAttribute('class', `alert alert-${value}`);
            node.setAttribute('data-type', value);
            return node;
        }

        static formats(node) {
            return node.getAttribute('data-type');
        }
    }

    AlertBlot.blotName = 'alert';
    AlertBlot.tagName = 'div';
    AlertBlot.className = 'alert';
    Quill.register(AlertBlot);

    // Video Embedding
    class VideoBlot extends BlockEmbed {
        static create(url) {
            let node = super.create();
            let videoId, platform;

            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                platform = 'youtube';
                if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                } else {
                    videoId = url.split('v=')[1]?.split('&')[0];
                }
            } else if (url.includes('vimeo.com')) {
                platform = 'vimeo';
                videoId = url.split('vimeo.com/')[1].split('?')[0];
            }

            if (!videoId) {
                showAdminNotice('Bruk en gyldig YouTube- eller Vimeo-lenke for å legge inn video.', {
                    title: 'Ugyldig videolenke',
                    variant: 'warning'
                });
                return null;
            }

            const embedUrl = platform === 'youtube'
                ? `https://www.youtube.com/embed/${videoId}`
                : `https://player.vimeo.com/video/${videoId}`;

            node.setAttribute('src', embedUrl);
            node.setAttribute('frameborder', '0');
            node.setAttribute('allowfullscreen', true);
            node.setAttribute('class', 'video-embed');

            return node;
        }

        static value(node) {
            return node.getAttribute('src');
        }
    }

    VideoBlot.blotName = 'video';
    VideoBlot.tagName = 'iframe';
    Quill.register(VideoBlot);

    class TableEmbedBlot extends BlockEmbed {
        static create(value) {
            const node = super.create();
            const tableHtml = normalizeBlogTableHtml(value) || buildBlogTableHtml(3, 3);
            node.setAttribute('data-table-html', encodeURIComponent(tableHtml));
            node.innerHTML = tableHtml;
            prepareTableEmbedNode(node);
            return node;
        }

        static value(node) {
            return normalizeBlogTableHtml(node.innerHTML)
                || normalizeBlogTableHtml(decodeTableHtmlValue(node.getAttribute('data-table-html') || ''));
        }
    }

    TableEmbedBlot.blotName = 'tableEmbed';
    TableEmbedBlot.tagName = 'div';
    TableEmbedBlot.className = TABLE_EMBED_CLASS;
    Quill.register(TableEmbedBlot);

    if (quill?.clipboard?.addMatcher) {
        quill.clipboard.addMatcher('TABLE', (node, delta) => {
            const tableHtml = normalizeBlogTableHtml(node.outerHTML || '');
            if (!tableHtml) return delta;
            return new Delta().insert({ tableEmbed: tableHtml });
        });
    }
}


async function fetchSeo() {
    try {
        const response = await fetch(`${API_URL}/seo`);
        seoData = await response.json();
        renderSeoEditor();
    } catch (error) {
        console.error('Error fetching SEO:', error);
    }
}

function renderSeoEditor() {
    const siteTitleEl = document.getElementById('seo-site-title');
    const logoTextEl = document.getElementById('seo-logo-text');
    const logoImageEl = document.getElementById('seo-logo-image');
    const separatorEl = document.getElementById('seo-separator');
    const keywordsEl = document.getElementById('seo-default-keywords');
    const gaIdEl = document.getElementById('seo-ga-id');
    const blogCommentsEnabledEl = document.getElementById('seo-blog-comments-enabled');

    if (siteTitleEl) siteTitleEl.value = seoData.global.siteTitle || '';
    if (logoTextEl) logoTextEl.value = seoData.global.logoText || '';
    if (logoImageEl) logoImageEl.value = seoData.global.logoImage || '';
    if (separatorEl) separatorEl.value = seoData.global.separator || '|';
    if (keywordsEl) keywordsEl.value = seoData.global.defaultKeywords || '';
    if (gaIdEl) gaIdEl.value = seoData.global.googleAnalyticsId || '';
    if (blogCommentsEnabledEl) blogCommentsEnabledEl.checked = seoData.global.blogCommentsEnabled !== false;

    const pagesList = document.getElementById('seo-pages-list');
    if (!pagesList) return;
    pagesList.innerHTML = '';

    for (const [pageFile, pageConfig] of Object.entries(seoData.pages)) {
        const pageItem = document.createElement('div');
        pageItem.className = 'section-card';
        pageItem.style.marginBottom = '15px';
        pageItem.style.padding = '15px';
        pageItem.style.border = '1px solid var(--border-color)';
        pageItem.style.borderRadius = '8px';

        pageItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0; color: var(--primary-color);">${pageFile}</h4>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label>Sidetittel</label>
                    <input type="text" class="form-control page-seo-title" data-page="${pageFile}" value="${pageConfig.title || ''}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #cbd5e1;">
                </div>
                <div class="form-group">
                    <label>Søkeord</label>
                    <input type="text" class="form-control page-seo-keywords" data-page="${pageFile}" value="${pageConfig.keywords || ''}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #cbd5e1;">
                </div>
                <div class="form-group" style="grid-column: 1 / -1;">
                    <label>Metabeskrivelse</label>
                    <textarea class="form-control page-seo-desc" data-page="${pageFile}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #cbd5e1; height: 60px;">${pageConfig.description || ''}</textarea>
                </div>
            </div>
        `;
        pagesList.appendChild(pageItem);
    }
}

async function saveSeo() {
    const saveBtn = document.getElementById('save-seo-btn');
    if (!saveBtn) return;
    saveBtn.innerText = 'Lagrer...';

    seoData.global = {
        ...(seoData.global || {}),
        siteTitle: document.getElementById('seo-site-title').value,
        logoText: document.getElementById('seo-logo-text')?.value?.trim() || '',
        logoImage: document.getElementById('seo-logo-image')?.value?.trim() || '',
        separator: document.getElementById('seo-separator').value,
        defaultKeywords: document.getElementById('seo-default-keywords').value,
        googleAnalyticsId: document.getElementById('seo-ga-id').value,
        blogCommentsEnabled: document.getElementById('seo-blog-comments-enabled')?.checked !== false
    };

    const pageTitles = document.querySelectorAll('.page-seo-title');
    pageTitles.forEach(input => {
        const pageFile = input.dataset.page;
        if (!seoData.pages[pageFile]) seoData.pages[pageFile] = {};
        seoData.pages[pageFile].title = input.value;
    });

    const pageKeywords = document.querySelectorAll('.page-seo-keywords');
    pageKeywords.forEach(input => {
        const pageFile = input.dataset.page;
        seoData.pages[pageFile].keywords = input.value;
    });

    const pageDescs = document.querySelectorAll('.page-seo-desc');
    pageDescs.forEach(textarea => {
        const pageFile = textarea.dataset.page;
        seoData.pages[pageFile].description = textarea.value;
    });

    try {
        const response = await fetch(`${API_URL}/seo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(seoData)
        });

        if (!response.ok) {
            const apiMessage = await parseApiErrorMessage(response, `Kunne ikke lagre SEO (${response.status})`);
            throw new Error(apiMessage);
        }

        await showAdminNotice('SEO-innstillingene er lagret.', {
            title: 'SEO oppdatert',
            variant: 'success'
        });
    } catch (error) {
        console.error('Error saving SEO:', error);
        await showAdminNotice('Det oppstod en feil ved lagring av SEO-innstillingene.', {
            title: 'SEO ble ikke lagret',
            variant: 'danger'
        });
    } finally {
        saveBtn.innerText = 'Lagre SEO';
    }
}

function getSocialPlannerWorkspaceIdCandidate() {
    const select = document.getElementById('sp-workspace-select');
    if (select?.value) {
        return String(select.value).trim();
    }
    return String(socialPlannerState?.settings?.activeWorkspaceId || 'default');
}

function getSocialPlannerActiveWorkspaceId() {
    const candidate = getSocialPlannerWorkspaceIdCandidate();
    const workspaces = Array.isArray(socialPlannerState?.workspaces) ? socialPlannerState.workspaces : [];
    if (workspaces.some((workspace) => workspace.id === candidate)) {
        return candidate;
    }
    return workspaces[0]?.id || 'default';
}

function getSocialPlannerActiveWorkspace() {
    const activeWorkspaceId = getSocialPlannerActiveWorkspaceId();
    const workspaces = Array.isArray(socialPlannerState?.workspaces) ? socialPlannerState.workspaces : [];
    return workspaces.find((workspace) => workspace.id === activeWorkspaceId) || workspaces[0] || null;
}

function getSocialPlannerScopedAccounts() {
    const workspaceId = getSocialPlannerActiveWorkspaceId();
    const accounts = Array.isArray(socialPlannerState?.socialAccounts) ? socialPlannerState.socialAccounts : [];
    return accounts.filter((account) => account.workspaceId === workspaceId);
}

function getSocialPlannerScopedEntries() {
    const workspaceId = getSocialPlannerActiveWorkspaceId();
    const entries = Array.isArray(socialPlannerState?.entries) ? socialPlannerState.entries : [];
    return entries.filter((entry) => entry.workspaceId === workspaceId);
}

function getSocialPlannerScopedTemplates() {
    const workspaceId = getSocialPlannerActiveWorkspaceId();
    const templates = Array.isArray(socialPlannerState?.templates) ? socialPlannerState.templates : [];
    return templates.filter((template) => template.workspaceId === workspaceId);
}

function normalizeSocialPlannerEntryFilter(filter = '') {
    const value = String(filter || '').trim().toLowerCase();
    if (value === 'drafts') return 'draft';
    if (value === 'approvals') return 'approval';
    if (value === 'published') return 'sent';
    if (value === 'scheduled') return 'queue';
    const allowed = new Set(['all', 'queue', 'draft', 'approval', 'sent', 'analytics']);
    return allowed.has(value) ? value : 'queue';
}

function isSocialPlannerPublishedLikeStatus(status = '') {
    const normalized = toSocialPlannerStatusClass(status);
    return normalized === 'published' || normalized === 'partially_published';
}

function isSocialPlannerApprovalLikeStatus(status = '') {
    const normalized = toSocialPlannerStatusClass(status);
    if (!normalized) return false;
    return normalized.includes('approval')
        || normalized === 'pending_review'
        || normalized === 'needs_review';
}

function normalizeSocialPlannerStreamViewMode(mode = '') {
    const value = String(mode || '').trim().toLowerCase();
    return value === 'calendar' ? 'calendar' : 'list';
}

function normalizeSocialPlannerChannelFilter(value = '') {
    const normalized = String(value || '').trim();
    return normalized || 'all';
}

function normalizeSocialPlannerTagFilter(value = '') {
    const normalized = String(value || '').trim().toLowerCase().replace(/^#/, '');
    return normalized || 'all';
}

function matchesSocialPlannerEntryFilter(entry = {}, filter = 'all') {
    const normalizedFilter = normalizeSocialPlannerEntryFilter(filter);
    if (normalizedFilter === 'all') return true;

    const status = toSocialPlannerStatusClass(entry?.status);
    if (normalizedFilter === 'queue') {
        return status === 'scheduled' || status === 'publishing';
    }
    if (normalizedFilter === 'approval') {
        return isSocialPlannerApprovalLikeStatus(status);
    }
    if (normalizedFilter === 'sent') {
        return isSocialPlannerPublishedLikeStatus(status);
    }
    return status === normalizedFilter;
}

function matchesSocialPlannerEntrySearch(entry = {}, query = '') {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    if (!normalizedQuery) return true;

    const parts = [
        entry?.title,
        entry?.masterText,
        entry?.lastError,
        entry?.linkUrl,
        entry?.mediaUrl,
        Array.isArray(entry?.hashtags) ? entry.hashtags.join(' ') : '',
        Array.isArray(entry?.targetAccountIds) ? entry.targetAccountIds.join(' ') : ''
    ];

    return parts
        .filter(Boolean)
        .map((part) => String(part).toLowerCase())
        .some((part) => part.includes(normalizedQuery));
}

function matchesSocialPlannerEntryChannelFilter(entry = {}, channelFilter = 'all') {
    const normalizedFilter = normalizeSocialPlannerChannelFilter(channelFilter);
    if (normalizedFilter === 'all') return true;
    const targetIds = Array.isArray(entry?.targetAccountIds) ? entry.targetAccountIds : [];
    return targetIds.map((value) => String(value)).includes(normalizedFilter);
}

function matchesSocialPlannerEntryTagFilter(entry = {}, tagFilter = 'all') {
    const normalizedFilter = normalizeSocialPlannerTagFilter(tagFilter);
    if (normalizedFilter === 'all') return true;
    const hashtags = Array.isArray(entry?.hashtags) ? entry.hashtags : [];
    return hashtags
        .map((tag) => normalizeSocialPlannerTagFilter(tag))
        .filter(Boolean)
        .includes(normalizedFilter);
}

function buildSocialPlannerEntryCounts(entries = []) {
    const scopedEntries = Array.isArray(entries) ? entries : [];
    const counts = {
        queue: 0,
        draft: 0,
        approval: 0,
        sent: 0
    };

    scopedEntries.forEach((entry) => {
        const status = toSocialPlannerStatusClass(entry?.status);
        if (status === 'scheduled' || status === 'publishing') {
            counts.queue += 1;
        }
        if (status === 'draft') {
            counts.draft += 1;
        }
        if (isSocialPlannerApprovalLikeStatus(status)) {
            counts.approval += 1;
        }
        if (isSocialPlannerPublishedLikeStatus(status)) {
            counts.sent += 1;
        }
    });

    return counts;
}

function renderSocialPlannerEntryFilters(entries = []) {
    const tabs = document.querySelectorAll('#sp-status-tabs .social-planner-tab-btn');
    if (tabs.length === 0) return;

    const counts = buildSocialPlannerEntryCounts(entries);
    tabs.forEach((tab) => {
        const filter = normalizeSocialPlannerEntryFilter(tab.dataset.filter);
        const countEl = tab.querySelector('span');
        if (countEl) {
            countEl.textContent = formatNumberForUi(counts[filter] || 0);
        }
        tab.classList.toggle('active', filter === socialPlannerEntryFilter);
    });
}

function getSocialPlannerUiPlatforms() {
    const supported = Array.isArray(socialPlannerState?.supports?.platforms)
        ? socialPlannerState.supports.platforms
        : SOCIAL_PLANNER_UI_PLATFORMS;
    const normalized = supported
        .map((platform) => String(platform || '').trim().toLowerCase())
        .filter((platform) => SOCIAL_PLANNER_UI_PLATFORMS.includes(platform));
    return normalized.length > 0 ? normalized : SOCIAL_PLANNER_UI_PLATFORMS.slice();
}

function formatPlatformLabel(platform = '') {
    const normalized = String(platform || '').trim().toLowerCase();
    if (normalized === 'x') return 'X';
    if (normalized === 'tiktok') return 'TikTok';
    if (normalized === 'linkedin') return 'LinkedIn';
    if (normalized === 'facebook') return 'Facebook';
    if (normalized === 'instagram') return 'Instagram';
    return normalized || 'Platform';
}

function getSocialPlannerPlatformIconClass(platform = '') {
    const normalized = String(platform || '').trim().toLowerCase();
    if (normalized === 'facebook') return 'fab fa-facebook-f';
    if (normalized === 'instagram') return 'fab fa-instagram';
    if (normalized === 'linkedin') return 'fab fa-linkedin-in';
    if (normalized === 'x') return 'fa-brands fa-x-twitter';
    if (normalized === 'tiktok') return 'fab fa-tiktok';
    return 'fas fa-share-nodes';
}

function getSocialPlannerEntryPrimaryDateValue(entry = {}) {
    const status = toSocialPlannerStatusClass(entry?.status);
    if (isSocialPlannerPublishedLikeStatus(status) && entry?.publishedAt) {
        return String(entry.publishedAt);
    }
    if (entry?.scheduledFor) {
        return String(entry.scheduledFor);
    }
    if (entry?.updatedAt) {
        return String(entry.updatedAt);
    }
    return String(entry?.createdAt || '');
}

function getSocialPlannerEntryPrimaryDate(entry = {}) {
    const candidate = getSocialPlannerEntryPrimaryDateValue(entry);
    const parsed = new Date(String(candidate || '').trim());
    return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function getSocialPlannerEntryPrimaryTimestamp(entry = {}) {
    const primaryDate = getSocialPlannerEntryPrimaryDate(entry);
    return primaryDate ? primaryDate.getTime() : 0;
}

function getSocialPlannerDateKey(date) {
    const parts = getSocialPlannerDateParts(date);
    return parts?.key || 'unknown';
}

function isValidSocialPlannerTimezone(value = '') {
    const candidate = String(value || '').trim();
    if (!candidate) return false;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(new Date());
        return true;
    } catch (error) {
        return false;
    }
}

function getSocialPlannerDefaultTimezone() {
    const workspaceTimezone = String(getSocialPlannerActiveWorkspace()?.timezone || '').trim();
    if (isValidSocialPlannerTimezone(workspaceTimezone)) {
        return workspaceTimezone;
    }
    return 'Europe/Oslo';
}

function getSocialPlannerDisplayTimezone() {
    if (isValidSocialPlannerTimezone(socialPlannerDisplayTimezone)) {
        return socialPlannerDisplayTimezone;
    }
    socialPlannerDisplayTimezone = getSocialPlannerDefaultTimezone();
    return socialPlannerDisplayTimezone;
}

function getSocialPlannerDateParts(date, options = {}) {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
        return null;
    }
    const timezone = options.timeZone || getSocialPlannerDisplayTimezone();
    try {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const parts = formatter.formatToParts(date);
        const year = parts.find((part) => part.type === 'year')?.value || '';
        const month = parts.find((part) => part.type === 'month')?.value || '';
        const day = parts.find((part) => part.type === 'day')?.value || '';
        if (!year || !month || !day) return null;
        return {
            year: Number.parseInt(year, 10),
            month: Number.parseInt(month, 10),
            day: Number.parseInt(day, 10),
            key: `${year}-${month}-${day}`
        };
    } catch (error) {
        return null;
    }
}

function formatSocialPlannerFeedDate(date) {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
        return 'Ukjent dato';
    }
    const locale = currentLang === 'en' ? 'en-GB' : 'nb-NO';
    return new Intl.DateTimeFormat(locale, {
        timeZone: getSocialPlannerDisplayTimezone(),
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).format(date);
}

function formatSocialPlannerTime(date) {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
        return '--:--';
    }
    const locale = currentLang === 'en' ? 'en-GB' : 'nb-NO';
    return new Intl.DateTimeFormat(locale, {
        timeZone: getSocialPlannerDisplayTimezone(),
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function getSocialPlannerEntryTimeLabel(entry = {}) {
    const status = toSocialPlannerStatusClass(entry?.status);
    if (isSocialPlannerPublishedLikeStatus(status)) {
        return 'Publisert';
    }
    if (status === 'publishing') {
        return 'Publiserer';
    }
    if (status === 'scheduled') {
        return 'Planlagt';
    }
    return 'Oppdatert';
}

function resolveSocialPlannerEntryCaption(entry = {}) {
    const master = String(entry?.masterText || '').trim();
    if (master) return master;

    const variants = (entry?.variants && typeof entry.variants === 'object' && !Array.isArray(entry.variants))
        ? entry.variants
        : {};
    const fallbackVariant = Object.values(variants)
        .map((value) => String(value || '').trim())
        .find(Boolean);
    return String(fallbackVariant || '').trim();
}

function truncateSocialPlannerText(value = '', maxLength = 220) {
    const normalized = String(value || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function deriveSocialPlannerEntryTitle(title = '', masterText = '', variants = {}) {
    const explicitTitle = String(title || '').trim();
    if (explicitTitle) {
        return truncateSocialPlannerText(explicitTitle, 180);
    }

    const sources = [
        String(masterText || '').trim(),
        ...Object.values((variants && typeof variants === 'object' && !Array.isArray(variants)) ? variants : {})
            .map((value) => String(value || '').trim())
    ];
    const firstText = sources.find(Boolean) || '';
    const firstLine = String(firstText)
        .split('\n')
        .map((line) => line.trim())
        .find(Boolean) || '';

    if (!firstLine) return '';
    return truncateSocialPlannerText(firstLine, 180);
}

function formatNumberForUi(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return '0';
    return new Intl.NumberFormat('nb-NO').format(number);
}

function formatSocialPlannerDateTime(value = '') {
    const date = new Date(String(value || '').trim());
    if (!Number.isFinite(date.getTime())) {
        return 'Ikke satt';
    }
    const locale = currentLang === 'en' ? 'en-GB' : 'nb-NO';
    return new Intl.DateTimeFormat(locale, {
        timeZone: getSocialPlannerDisplayTimezone(),
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function formatSocialPlannerStatus(status = '') {
    const normalized = String(status || '').trim().toLowerCase();
    if (!normalized) return 'draft';
    return normalized.replace(/_/g, ' ');
}

function toSocialPlannerStatusClass(status = '') {
    return String(status || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_') || 'draft';
}

function computeSocialPlannerEntryEngagement(entry = {}) {
    const metrics = entry?.metrics && typeof entry.metrics === 'object' ? entry.metrics : {};
    const likes = Number.parseInt(metrics.likes, 10) || 0;
    const comments = Number.parseInt(metrics.comments, 10) || 0;
    const shares = Number.parseInt(metrics.shares, 10) || 0;
    const clicks = Number.parseInt(metrics.clicks, 10) || 0;
    return likes + comments + shares + clicks;
}

function setSocialPlannerStatus(message, variant = 'info') {
    const statusEl = document.getElementById('sp-status');
    if (!statusEl) return;
    statusEl.textContent = String(message || '');
    statusEl.style.color = variant === 'danger'
        ? '#b91c1c'
        : variant === 'success'
            ? '#065f46'
            : '#64748b';
}

async function requestSocialPlanner(path = '', options = {}, fallbackMessage = 'Kunne ikke hente social planner-data.') {
    const url = `${API_URL}/social-planner${path}`;
    const headers = { ...(options.headers || {}) };
    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, {
        ...options,
        headers
    });
    if (!response.ok) {
        const apiMessage = await parseApiErrorMessage(response, fallbackMessage);
        throw new Error(apiMessage);
    }
    return response.json();
}

function toIsoFromLocalDateTime(value = '') {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    const parsed = new Date(trimmed);
    if (!Number.isFinite(parsed.getTime())) return '';
    return parsed.toISOString();
}

function parseHashtagInput(value = '') {
    return String(value || '')
        .split(/[\s,]+/)
        .map((token) => token.trim())
        .filter(Boolean);
}

function getSocialPlannerComposerAdvancedSection() {
    return document.querySelector('#sp-entry-form .social-planner-compose-advanced');
}

function syncSocialPlannerTagPillState() {
    const tagPill = document.getElementById('sp-compose-tag-pill');
    const tagCount = document.getElementById('sp-compose-tag-count');
    const hashtagInput = document.getElementById('sp-entry-hashtags');
    const advancedSection = getSocialPlannerComposerAdvancedSection();
    if (!tagPill) return;

    const hashtags = parseHashtagInput(hashtagInput?.value || '');
    const count = hashtags.length;
    const isOpen = !!advancedSection?.open;

    if (tagCount) {
        tagCount.textContent = String(count);
    }

    tagPill.classList.toggle('is-open', isOpen);
    tagPill.classList.toggle('has-tags', count > 0);
    tagPill.setAttribute('aria-expanded', String(isOpen));
}

function toggleSocialPlannerTagEditor(forceOpen = null) {
    const advancedSection = getSocialPlannerComposerAdvancedSection();
    const hashtagInput = document.getElementById('sp-entry-hashtags');
    if (!advancedSection || !hashtagInput) return;

    const shouldOpen = typeof forceOpen === 'boolean'
        ? forceOpen
        : !advancedSection.open;
    advancedSection.open = shouldOpen;
    syncSocialPlannerTagPillState();

    if (shouldOpen) {
        hashtagInput.focus();
    }
}

window.toggleSocialPlannerTagEditor = toggleSocialPlannerTagEditor;

function renderSocialPlannerTemplateBody(templateBody = '', context = {}) {
    const source = String(templateBody || '');
    const contextMap = (context && typeof context === 'object' && !Array.isArray(context)) ? context : {};
    return source.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
        const lookup = String(key || '').trim().toLowerCase();
        if (!lookup) return '';
        if (!(lookup in contextMap)) return '';
        return String(contextMap[lookup] ?? '');
    });
}

function syncSocialPlannerScheduleFieldState() {
    const statusSelect = document.getElementById('sp-entry-status');
    const scheduleInput = document.getElementById('sp-entry-scheduled-for');
    const scheduleWrap = document.getElementById('sp-compose-schedule-wrap');
    if (!statusSelect || !scheduleInput) return;

    const isScheduled = String(statusSelect.value || '').trim() === 'scheduled';
    scheduleInput.required = isScheduled;
    scheduleInput.disabled = !isScheduled;
    if (scheduleWrap) {
        scheduleWrap.style.display = isScheduled ? '' : 'none';
    }
    if (!isScheduled) {
        scheduleInput.value = '';
    }
}

function renderSocialPlannerWorkspaceSelect() {
    const select = document.getElementById('sp-workspace-select');
    if (!select) return;

    const workspaces = Array.isArray(socialPlannerState?.workspaces) ? socialPlannerState.workspaces : [];
    const activeWorkspaceId = getSocialPlannerActiveWorkspaceId();
    select.innerHTML = '';

    if (workspaces.length === 0) {
        const option = document.createElement('option');
        option.value = 'default';
        option.textContent = 'default';
        select.appendChild(option);
        select.value = 'default';
        return;
    }

    workspaces.forEach((workspace) => {
        const option = document.createElement('option');
        option.value = workspace.id;
        option.textContent = workspace.name || workspace.id;
        select.appendChild(option);
    });

    select.value = workspaces.some((workspace) => workspace.id === activeWorkspaceId)
        ? activeWorkspaceId
        : workspaces[0].id;
}

function resetSocialPlannerWorkspaceForm() {
    const editIdInput = document.getElementById('sp-workspace-edit-id');
    const nameInput = document.getElementById('sp-workspace-name');
    const timezoneInput = document.getElementById('sp-workspace-timezone');
    const submitBtn = document.getElementById('sp-workspace-submit-btn');

    if (editIdInput) editIdInput.value = '';
    if (nameInput) nameInput.value = '';
    if (timezoneInput) timezoneInput.value = 'Europe/Oslo';
    if (submitBtn) submitBtn.textContent = 'Opprett workspace';
}

function resetSocialPlannerTemplateForm() {
    const editIdInput = document.getElementById('sp-template-edit-id');
    const nameInput = document.getElementById('sp-template-name');
    const categoryInput = document.getElementById('sp-template-category');
    const bodyInput = document.getElementById('sp-template-body');
    const submitBtn = document.getElementById('sp-template-submit-btn');

    if (editIdInput) editIdInput.value = '';
    if (nameInput) nameInput.value = '';
    if (categoryInput) categoryInput.value = '';
    if (bodyInput) bodyInput.value = '';
    if (submitBtn) submitBtn.textContent = 'Lagre mal';
}

function resetSocialPlannerAccountForm() {
    const form = document.getElementById('sp-account-form');
    if (form) {
        form.reset();
    }

    const editIdInput = document.getElementById('sp-account-edit-id');
    const submitBtn = document.getElementById('sp-account-submit-btn');
    if (editIdInput) editIdInput.value = '';
    if (submitBtn) submitBtn.textContent = 'Legg til konto';
}

function getSocialPlannerEntryFormVariants() {
    const variants = {};
    getSocialPlannerUiPlatforms().forEach((platform) => {
        const input = document.getElementById(`sp-entry-variant-${platform}`);
        variants[platform] = String(input?.value || '').trim();
    });
    return variants;
}

function setSocialPlannerEntryFormVariants(variants = {}) {
    const source = (variants && typeof variants === 'object' && !Array.isArray(variants)) ? variants : {};
    getSocialPlannerUiPlatforms().forEach((platform) => {
        const input = document.getElementById(`sp-entry-variant-${platform}`);
        if (!input) return;
        input.value = String(source[platform] || '');
    });
}

function buildSocialPlannerCaptionPreview(platform = 'facebook') {
    const variants = getSocialPlannerEntryFormVariants();
    const masterText = String(document.getElementById('sp-entry-master-text')?.value || '').trim();
    const linkValue = String(document.getElementById('sp-entry-link')?.value || '').trim();
    const hashtagTokens = parseHashtagInput(document.getElementById('sp-entry-hashtags')?.value || '');
    const hashtags = hashtagTokens.join(' ');
    const variantText = String(variants[platform] || '').trim();
    return [variantText || masterText, linkValue, hashtags].filter(Boolean).join('\n\n').trim();
}

function renderSocialPlannerEntryPreview() {
    const container = document.getElementById('sp-entry-preview-grid');
    if (!container) return;

    const platforms = getSocialPlannerUiPlatforms();
    const hasAnyText = platforms.some((platform) => buildSocialPlannerCaptionPreview(platform));
    container.innerHTML = '';

    if (!hasAnyText) {
        const empty = document.createElement('p');
        empty.className = 'social-planner-list-empty';
        empty.textContent = 'Fyll ut tekst for å se preview.';
        container.appendChild(empty);
        return;
    }

    platforms.forEach((platform) => {
        const caption = buildSocialPlannerCaptionPreview(platform);
        if (!caption) return;

        const card = document.createElement('article');
        card.className = 'social-planner-preview-card';

        const label = document.createElement('strong');
        label.textContent = formatPlatformLabel(platform);

        const text = document.createElement('pre');
        text.textContent = caption;

        card.appendChild(label);
        card.appendChild(text);
        container.appendChild(card);
    });

    if (!container.children.length) {
        const empty = document.createElement('p');
        empty.className = 'social-planner-list-empty';
        empty.textContent = 'Fyll ut tekst for å se preview.';
        container.appendChild(empty);
    }
}

function renderSocialPlannerComposerMediaPreview() {
    const preview = document.getElementById('sp-entry-media-preview');
    const mediaInput = document.getElementById('sp-entry-media');
    if (!preview || !mediaInput) return;

    const mediaUrl = String(mediaInput.value || '').trim();
    preview.innerHTML = '';

    if (!mediaUrl) {
        preview.hidden = true;
        return;
    }

    const thumb = document.createElement('img');
    thumb.className = 'social-planner-compose-media-thumb';
    thumb.src = mediaUrl;
    thumb.alt = 'Valgt innleggsbilde';
    thumb.loading = 'lazy';

    const meta = document.createElement('div');
    meta.className = 'social-planner-compose-media-meta';

    const title = document.createElement('strong');
    title.textContent = 'Valgt bilde';

    const link = document.createElement('a');
    link.href = mediaUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = mediaUrl;

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'social-planner-compose-media-remove';
    clearButton.innerHTML = '<i class="fas fa-trash"></i> Fjern';
    clearButton.addEventListener('click', () => {
        setSocialPlannerMediaUrl('');
        setSocialPlannerStatus('Bilde fjernet fra innlegget.', 'success');
    });

    meta.appendChild(title);
    meta.appendChild(link);
    preview.appendChild(thumb);
    preview.appendChild(meta);
    preview.appendChild(clearButton);
    preview.hidden = false;
}

function setSocialPlannerMediaUrl(mediaUrl = '') {
    const mediaInput = document.getElementById('sp-entry-media');
    if (!mediaInput) return;

    mediaInput.value = String(mediaUrl || '').trim();
    renderSocialPlannerComposerMediaPreview();
    renderSocialPlannerEntryPreview();
}

const SOCIAL_PLANNER_ASSISTANT_ACTIONS = new Set(['write', 'improve', 'variants', 'shorten', 'expand', 'hashtags']);

function normalizeSocialPlannerAssistantAction(action = '') {
    const normalized = String(action || '').trim().toLowerCase();
    return SOCIAL_PLANNER_ASSISTANT_ACTIONS.has(normalized) ? normalized : 'write';
}

function formatSocialPlannerAssistantActionLabel(action = '') {
    const normalized = normalizeSocialPlannerAssistantAction(action);
    if (normalized === 'improve') return 'forbedring';
    if (normalized === 'variants') return 'plattformvarianter';
    if (normalized === 'shorten') return 'forkorting';
    if (normalized === 'expand') return 'utvidelse';
    if (normalized === 'hashtags') return 'hashtags';
    return 'skriving';
}

function normalizeSocialPlannerHashtagToken(token = '') {
    const cleaned = String(token || '')
        .trim()
        .replace(/^#+/, '')
        .replace(/[^\wæøåÆØÅ-]+/g, '');
    if (!cleaned) return '';
    return `#${cleaned.toLowerCase()}`;
}

function normalizeSocialPlannerHashtagList(values = []) {
    const source = Array.isArray(values) ? values : String(values || '').split(/[\s,]+/);
    const seen = new Set();
    const output = [];
    source.forEach((value) => {
        const normalized = normalizeSocialPlannerHashtagToken(value);
        if (!normalized || seen.has(normalized)) return;
        seen.add(normalized);
        output.push(normalized);
    });
    return output.slice(0, 20);
}

function getSocialPlannerAssistantSelectedPlatforms() {
    const supportedPlatforms = getSocialPlannerUiPlatforms();
    const accountSelect = document.getElementById('sp-entry-target-accounts');
    const selectedAccountIds = Array.from(accountSelect?.selectedOptions || [])
        .map((option) => String(option.value || '').trim())
        .filter(Boolean);

    if (selectedAccountIds.length === 0) {
        return supportedPlatforms;
    }

    const scopedAccounts = getSocialPlannerScopedAccounts();
    const scopedAccountLookup = new Map(scopedAccounts.map((account) => [String(account.id), account]));
    const selectedPlatforms = [];
    const seen = new Set();

    selectedAccountIds.forEach((accountId) => {
        const platform = String(scopedAccountLookup.get(accountId)?.platform || '').trim().toLowerCase();
        if (!supportedPlatforms.includes(platform) || seen.has(platform)) return;
        seen.add(platform);
        selectedPlatforms.push(platform);
    });

    return selectedPlatforms.length > 0 ? selectedPlatforms : supportedPlatforms;
}

function setSocialPlannerAssistantBusy(isBusy = false, action = '') {
    const normalizedAction = normalizeSocialPlannerAssistantAction(action);
    const actionButtons = document.querySelectorAll('.social-planner-assistant-action-btn');
    actionButtons.forEach((button) => {
        const isActiveButton = String(button.dataset.action || '').trim().toLowerCase() === normalizedAction;
        if (isBusy && isActiveButton) {
            button.dataset.originalLabel = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Jobber...';
        } else if (!isBusy && button.dataset.originalLabel) {
            button.innerHTML = button.dataset.originalLabel;
            delete button.dataset.originalLabel;
        }
        button.disabled = !!isBusy;
    });

    const promptInput = document.getElementById('sp-assistant-prompt');
    const toneSelect = document.getElementById('sp-assistant-tone');
    if (promptInput) promptInput.disabled = !!isBusy;
    if (toneSelect) toneSelect.disabled = !!isBusy;
}

function setSocialPlannerAssistantOutput(message = '', variant = 'info', details = '') {
    const container = document.getElementById('sp-assistant-output');
    if (!container) return;
    container.innerHTML = '';

    const normalizedVariant = String(variant || 'info').trim().toLowerCase();
    const title = document.createElement('p');
    title.className = `social-planner-assistant-output-title${normalizedVariant === 'success' ? ' is-success' : normalizedVariant === 'danger' ? ' is-danger' : ''}`;
    title.textContent = String(message || 'Gi en instruks, og velg hva AI skal gjøre.');
    container.appendChild(title);

    const detailText = String(details || '').trim();
    if (detailText) {
        const detail = document.createElement('p');
        detail.className = 'social-planner-assistant-output-detail';
        detail.textContent = detailText;
        container.appendChild(detail);
    }
}

function resetSocialPlannerAssistantState() {
    const promptInput = document.getElementById('sp-assistant-prompt');
    const toneSelect = document.getElementById('sp-assistant-tone');
    if (promptInput) promptInput.value = '';
    if (toneSelect) toneSelect.value = 'professional';
    setSocialPlannerAssistantOutput('Gi en instruks, og velg hva AI skal gjøre.', 'info');
}

async function requestSocialPlannerAssistantSuggestion(payload = {}) {
    const response = await fetch(`${API_URL}/social-planner/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result?.details || result?.error || `AI-feil (${response.status})`);
    }
    return result;
}

function applySocialPlannerAssistantSuggestion(suggestion = {}, action = 'write') {
    const normalizedAction = normalizeSocialPlannerAssistantAction(action);
    const touched = [];

    const masterTextSuggestion = String(suggestion?.masterText || '').trim();
    const shouldApplyMasterText = ['write', 'improve', 'shorten', 'expand'].includes(normalizedAction);
    if (masterTextSuggestion && shouldApplyMasterText) {
        const masterInput = document.getElementById('sp-entry-master-text');
        if (masterInput) {
            masterInput.value = masterTextSuggestion;
            touched.push('mastertekst');
        }
    }

    const variantSource = (suggestion?.variants && typeof suggestion.variants === 'object' && !Array.isArray(suggestion.variants))
        ? suggestion.variants
        : {};
    let variantCount = 0;
    getSocialPlannerUiPlatforms().forEach((platform) => {
        const variantValue = String(variantSource[platform] || '').trim();
        if (!variantValue) return;
        const variantInput = document.getElementById(`sp-entry-variant-${platform}`);
        if (!variantInput) return;
        variantInput.value = variantValue;
        variantCount += 1;
    });
    if (variantCount > 0) {
        touched.push(`${variantCount} varianter`);
    }

    const hashtagsSuggestion = normalizeSocialPlannerHashtagList(suggestion?.hashtags || []);
    let hashtagsUpdated = false;
    if (hashtagsSuggestion.length > 0) {
        const hashtagInput = document.getElementById('sp-entry-hashtags');
        if (hashtagInput) {
            const existingHashtags = normalizeSocialPlannerHashtagList(parseHashtagInput(hashtagInput.value || ''));
            const mergedHashtags = normalizedAction === 'hashtags'
                ? normalizeSocialPlannerHashtagList([...hashtagsSuggestion, ...existingHashtags])
                : (existingHashtags.length > 0 ? existingHashtags : hashtagsSuggestion);
            hashtagInput.value = mergedHashtags.join(' ');
            touched.push('hashtags');
            hashtagsUpdated = true;
        }
    }

    if (touched.length > 0) {
        renderSocialPlannerEntryPreview();
    }
    if (hashtagsUpdated) {
        syncSocialPlannerTagPillState();
    }

    return touched;
}

async function runSocialPlannerAssistant(action = 'write') {
    const normalizedAction = normalizeSocialPlannerAssistantAction(action);
    if (socialPlannerAssistantInFlight) return;

    const promptInput = document.getElementById('sp-assistant-prompt');
    const toneSelect = document.getElementById('sp-assistant-tone');
    const prompt = String(promptInput?.value || '').trim();
    const tone = String(toneSelect?.value || 'professional').trim() || 'professional';
    const masterText = String(document.getElementById('sp-entry-master-text')?.value || '').trim();
    const variants = getSocialPlannerEntryFormVariants();
    const linkUrl = String(document.getElementById('sp-entry-link')?.value || '').trim();
    const hashtags = parseHashtagInput(document.getElementById('sp-entry-hashtags')?.value || '');
    const selectedPlatforms = getSocialPlannerAssistantSelectedPlatforms();

    if (!prompt && !masterText && normalizedAction !== 'hashtags') {
        setSocialPlannerAssistantOutput('Skriv en instruks eller start med litt tekst først.', 'danger');
        return;
    }

    socialPlannerAssistantInFlight = true;
    setSocialPlannerAssistantBusy(true, normalizedAction);
    setSocialPlannerAssistantOutput(`Kjører AI ${formatSocialPlannerAssistantActionLabel(normalizedAction)}...`, 'info');

    try {
        const payload = await requestSocialPlannerAssistantSuggestion({
            action: normalizedAction,
            prompt,
            tone,
            masterText,
            variants,
            linkUrl,
            hashtags,
            selectedPlatforms
        });

        const suggestion = (payload?.suggestion && typeof payload.suggestion === 'object' && !Array.isArray(payload.suggestion))
            ? payload.suggestion
            : {};
        const touched = applySocialPlannerAssistantSuggestion(suggestion, normalizedAction);
        const appliedSummary = touched.length > 0
            ? `Oppdatert: ${touched.join(', ')}.`
            : 'AI ga forslag, men ingen felt ble oppdatert automatisk.';
        const details = [
            String(suggestion.notes || '').trim(),
            payload?.model ? `Model: ${payload.model}` : ''
        ].filter(Boolean).join(' • ');
        setSocialPlannerAssistantOutput(appliedSummary, 'success', details);
        setSocialPlannerStatus('AI-assistent oppdaterte composer-forslag.', 'success');
    } catch (error) {
        console.error('Error running social planner assistant:', error);
        const message = normalizeAdminErrorMessage(error, 'AI-assistenten kunne ikke generere forslag.');
        setSocialPlannerAssistantOutput(message, 'danger');
        setSocialPlannerStatus(message, 'danger');
    } finally {
        socialPlannerAssistantInFlight = false;
        setSocialPlannerAssistantBusy(false, normalizedAction);
    }
}

window.runSocialPlannerAssistant = runSocialPlannerAssistant;

function syncSocialPlannerComposerMeta() {
    const editId = String(document.getElementById('sp-entry-edit-id')?.value || '').trim();
    const titleEl = document.getElementById('sp-compose-title');
    const submitBtn = document.getElementById('sp-entry-submit-btn');

    if (titleEl) {
        titleEl.textContent = editId ? 'Edit Post' : 'Create Post';
    }
    if (submitBtn) {
        submitBtn.innerHTML = editId
            ? 'Oppdater <i class="fas fa-check"></i>'
            : '<i class="fas fa-save"></i> Lagre';
    }
}

function renderSocialPlannerComposerAccountChips() {
    const container = document.getElementById('sp-compose-account-chips');
    const select = document.getElementById('sp-entry-target-accounts');
    if (!container || !select) return;

    const options = Array.from(select.options || []);
    container.innerHTML = '';

    if (options.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'social-planner-list-empty';
        empty.textContent = 'Ingen kontoer er koblet til i dette workspace.';
        container.appendChild(empty);
        return;
    }

    options.forEach((option) => {
        const accountId = String(option.value || '');
        const account = getSocialPlannerScopedAccounts().find((row) => row.id === accountId);
        const platform = String(account?.platform || '').toLowerCase();

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `social-planner-compose-account-chip${option.selected ? ' active' : ''}`;
        button.dataset.platform = platform;

        const icon = document.createElement('i');
        icon.className = getSocialPlannerPlatformIconClass(platform);
        const label = document.createElement('span');
        label.textContent = account?.displayName || option.textContent || accountId || 'Konto';

        button.appendChild(icon);
        button.appendChild(label);
        button.addEventListener('click', () => {
            option.selected = !option.selected;
            renderSocialPlannerComposerAccountChips();
            renderSocialPlannerEntryPreview();
        });
        container.appendChild(button);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'social-planner-compose-account-add-btn';
    addBtn.innerHTML = '<i class="fas fa-plus"></i>';
    addBtn.title = 'Velg kontoer i avanserte felt';
    addBtn.addEventListener('click', () => {
        const advanced = document.querySelector('.social-planner-compose-advanced');
        if (advanced && !advanced.open) {
            advanced.open = true;
        }
        select.focus();
    });
    container.appendChild(addBtn);
}

function setSocialPlannerComposerPanel(panel = 'preview') {
    const normalizedPanel = String(panel || '').trim().toLowerCase() === 'assistant'
        ? 'assistant'
        : 'preview';
    socialPlannerComposerPanel = normalizedPanel;

    const previewPanel = document.getElementById('sp-compose-panel-preview');
    const assistantPanel = document.getElementById('sp-compose-panel-assistant');
    const previewBtn = document.getElementById('sp-compose-preview-btn');
    const assistantBtn = document.getElementById('sp-compose-assistant-btn');

    if (previewPanel) previewPanel.classList.toggle('is-active', normalizedPanel === 'preview');
    if (assistantPanel) assistantPanel.classList.toggle('is-active', normalizedPanel === 'assistant');
    if (previewBtn) previewBtn.classList.toggle('active', normalizedPanel === 'preview');
    if (assistantBtn) assistantBtn.classList.toggle('active', normalizedPanel === 'assistant');
}

window.setSocialPlannerComposerPanel = setSocialPlannerComposerPanel;

function toSocialPlannerDateTimeInputValueFromDate(date, options = {}) {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
        return '';
    }
    const parts = getSocialPlannerDateParts(date);
    if (!parts) return '';

    const hourCandidate = Number.parseInt(options.hour, 10);
    const minuteCandidate = Number.parseInt(options.minute, 10);
    const hour = Number.isFinite(hourCandidate) ? Math.min(23, Math.max(0, hourCandidate)) : 9;
    const minute = Number.isFinite(minuteCandidate) ? Math.min(59, Math.max(0, minuteCandidate)) : 0;
    const pad = (value) => String(value).padStart(2, '0');

    return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(hour)}:${pad(minute)}`;
}

function openSocialPlannerComposer(options = {}) {
    const resolvedOptions = (options && typeof options === 'object' && !Array.isArray(options))
        ? options
        : {};
    const modal = document.getElementById('sp-compose-modal');
    if (!modal) return;

    const shouldReset = resolvedOptions.reset !== false;
    if (shouldReset) {
        resetSocialPlannerEntryForm();
    }

    syncSocialPlannerComposerMeta();
    renderSocialPlannerComposerAccountChips();
    setSocialPlannerComposerPanel(resolvedOptions.panel || socialPlannerComposerPanel || 'preview');
    syncSocialPlannerTagPillState();

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('social-planner-compose-open');

    window.setTimeout(() => {
        const primaryInput = document.getElementById('sp-entry-master-text');
        primaryInput?.focus();
    }, 20);
}

window.openSocialPlannerComposer = openSocialPlannerComposer;

function openSocialPlannerComposerForDate(date) {
    const selectedDate = (date instanceof Date && Number.isFinite(date.getTime()))
        ? date
        : null;
    if (!selectedDate) return;

    openSocialPlannerComposer({ reset: true, panel: 'preview' });

    const statusSelect = document.getElementById('sp-entry-status');
    const scheduledInput = document.getElementById('sp-entry-scheduled-for');

    if (statusSelect) {
        statusSelect.value = 'scheduled';
    }
    syncSocialPlannerScheduleFieldState();

    if (scheduledInput) {
        const now = new Date();
        const selectedParts = getSocialPlannerDateParts(selectedDate);
        const todayParts = getSocialPlannerDateParts(now);
        const isToday = !!(selectedParts && todayParts && selectedParts.key === todayParts.key);
        const defaultHour = isToday ? Math.min(23, Math.max(0, now.getHours() + 1)) : 9;
        const defaultMinute = isToday ? (now.getMinutes() >= 30 ? 30 : 0) : 0;
        scheduledInput.value = toSocialPlannerDateTimeInputValueFromDate(selectedDate, {
            hour: defaultHour,
            minute: defaultMinute
        });
    }

    syncSocialPlannerComposerMeta();
    renderSocialPlannerEntryPreview();

    setSocialPlannerStatus(`Nytt innlegg klargjort for ${formatSocialPlannerFeedDate(selectedDate)}.`, 'success');
}

window.openSocialPlannerComposerForDate = openSocialPlannerComposerForDate;

function extractFirstUrlFromText(value = '') {
    const text = String(value || '').trim();
    if (!text) return '';
    const match = text.match(/https?:\/\/[^\s<>"')]+/i);
    return match ? String(match[0]) : '';
}

function resolveSocialPlannerViewUrl(rawUrl = '') {
    const value = String(rawUrl || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) {
        return value;
    }
    try {
        return new URL(value, window.location.origin).toString();
    } catch (error) {
        return '';
    }
}

function getSocialPlannerEntryViewUrl(entry = {}) {
    const directUrl = resolveSocialPlannerViewUrl(entry?.linkUrl || '');
    if (directUrl) return directUrl;

    const publishLog = Array.isArray(entry?.publishLog) ? entry.publishLog : [];
    for (let index = publishLog.length - 1; index >= 0; index -= 1) {
        const foundUrl = resolveSocialPlannerViewUrl(extractFirstUrlFromText(publishLog[index]?.details || ''));
        if (foundUrl) {
            return foundUrl;
        }
    }

    return '';
}

function openSocialPlannerEntryFromCalendar(entry = {}) {
    const entryId = String(entry?.id || '').trim();
    if (!entryId) return;

    const statusClass = toSocialPlannerStatusClass(entry?.status || 'draft');
    if (statusClass === 'draft') {
        window.editSocialPlannerEntry(entryId);
        return;
    }

    if (isSocialPlannerPublishedLikeStatus(statusClass)) {
        const viewUrl = getSocialPlannerEntryViewUrl(entry);
        if (viewUrl) {
            window.open(viewUrl, '_blank', 'noopener,noreferrer');
            setSocialPlannerStatus('Åpnet publisert innlegg i ny fane.', 'success');
            return;
        }

        setSocialPlannerStatus('Publisert innlegg mangler visningslenke. Åpner i redigering i stedet.', 'danger');
        window.editSocialPlannerEntry(entryId);
        return;
    }

    window.editSocialPlannerEntry(entryId);
}

function closeSocialPlannerComposer() {
    const modal = document.getElementById('sp-compose-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('social-planner-compose-open');
}

window.closeSocialPlannerComposer = closeSocialPlannerComposer;

function resetSocialPlannerEntryForm() {
    const form = document.getElementById('sp-entry-form');
    if (form) {
        form.reset();
    }

    const editIdInput = document.getElementById('sp-entry-edit-id');
    const templateSelect = document.getElementById('sp-entry-template');

    if (editIdInput) editIdInput.value = '';
    if (templateSelect) templateSelect.value = '';
    const advancedSection = getSocialPlannerComposerAdvancedSection();
    if (advancedSection) {
        advancedSection.open = false;
    }
    setSocialPlannerEntryFormVariants({});
    syncSocialPlannerComposerMeta();
    syncSocialPlannerScheduleFieldState();
    renderSocialPlannerComposerAccountChips();
    renderSocialPlannerEntryPreview();
    renderSocialPlannerComposerMediaPreview();
    syncSocialPlannerTagPillState();
    socialPlannerAssistantInFlight = false;
    setSocialPlannerAssistantBusy(false);
    resetSocialPlannerAssistantState();
}

function setMultiSelectValues(selectElement, values = []) {
    if (!selectElement) return;
    const selected = new Set((Array.isArray(values) ? values : []).map((value) => String(value)));
    Array.from(selectElement.options).forEach((option) => {
        option.selected = selected.has(String(option.value));
    });
}

function renderSocialPlannerWorkspaceList() {
    const container = document.getElementById('sp-workspaces-list');
    if (!container) return;

    const workspaces = Array.isArray(socialPlannerState?.workspaces) ? socialPlannerState.workspaces : [];
    const activeWorkspaceId = getSocialPlannerActiveWorkspaceId();
    container.innerHTML = '';

    if (workspaces.length === 0) {
        container.className = 'social-planner-list-empty';
        container.textContent = 'Ingen workspaces funnet.';
        return;
    }

    container.className = 'social-planner-generic-list';
    workspaces.forEach((workspace) => {
        const item = document.createElement('article');
        item.className = 'social-planner-generic-item';

        const meta = document.createElement('div');
        meta.className = 'social-planner-generic-meta';

        const title = document.createElement('strong');
        title.textContent = workspace.name || workspace.id;

        const details = document.createElement('span');
        const activeSuffix = workspace.id === activeWorkspaceId ? ' • aktiv' : '';
        details.textContent = `${workspace.timezone || 'Europe/Oslo'}${activeSuffix}`;

        meta.appendChild(title);
        meta.appendChild(details);

        const actions = document.createElement('div');
        actions.className = 'social-planner-generic-actions';

        const activateBtn = document.createElement('button');
        activateBtn.type = 'button';
        activateBtn.className = 'action-btn';
        activateBtn.title = 'Sett som aktiv';
        activateBtn.innerHTML = '<i class="fas fa-location-dot"></i>';
        activateBtn.disabled = workspace.id === activeWorkspaceId;
        activateBtn.addEventListener('click', () => {
            window.changeSocialPlannerWorkspace(workspace.id);
        });

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'action-btn';
        editBtn.title = 'Rediger workspace';
        editBtn.innerHTML = '<i class="fas fa-pen"></i>';
        editBtn.addEventListener('click', () => {
            window.editSocialPlannerWorkspace(workspace.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'action-btn delete';
        deleteBtn.title = 'Slett workspace';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => {
            window.deleteSocialPlannerWorkspace(workspace.id);
        });

        actions.appendChild(activateBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(meta);
        item.appendChild(actions);
        container.appendChild(item);
    });
}

function renderSocialPlannerTemplateSelect() {
    const select = document.getElementById('sp-entry-template');
    if (!select) return;

    const previousValue = String(select.value || '').trim();
    const templates = getSocialPlannerScopedTemplates();
    select.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Velg mal (valgfritt)';
    select.appendChild(emptyOption);

    templates.forEach((template) => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.name}${template.category ? ` (${template.category})` : ''}`;
        select.appendChild(option);
    });

    if (previousValue && templates.some((template) => template.id === previousValue)) {
        select.value = previousValue;
    } else {
        select.value = '';
    }
}

function renderSocialPlannerTemplatesList() {
    const container = document.getElementById('sp-templates-list');
    if (!container) return;

    const templates = getSocialPlannerScopedTemplates();
    container.innerHTML = '';

    if (templates.length === 0) {
        container.className = 'social-planner-list-empty';
        container.textContent = 'Ingen maler i dette workspace.';
        return;
    }

    container.className = 'social-planner-generic-list';
    templates.forEach((template) => {
        const item = document.createElement('article');
        item.className = 'social-planner-generic-item';

        const meta = document.createElement('div');
        meta.className = 'social-planner-generic-meta';

        const title = document.createElement('strong');
        title.textContent = template.name || template.id;

        const preview = String(template.body || '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 120);
        const details = document.createElement('span');
        details.textContent = `${template.category || 'generelt'} • ${preview || 'Ingen tekst'}`;

        meta.appendChild(title);
        meta.appendChild(details);

        const actions = document.createElement('div');
        actions.className = 'social-planner-generic-actions';

        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'action-btn';
        applyBtn.title = 'Bruk mal';
        applyBtn.innerHTML = '<i class="fas fa-bolt"></i>';
        applyBtn.addEventListener('click', () => {
            window.applySocialPlannerTemplateToEntry(template.id);
        });

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'action-btn';
        editBtn.title = 'Rediger mal';
        editBtn.innerHTML = '<i class="fas fa-pen"></i>';
        editBtn.addEventListener('click', () => {
            window.editSocialPlannerTemplate(template.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'action-btn delete';
        deleteBtn.title = 'Slett mal';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => {
            window.deleteSocialPlannerTemplate(template.id);
        });

        actions.appendChild(applyBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(meta);
        item.appendChild(actions);
        container.appendChild(item);
    });
}

function renderSocialPlannerTargetAccountOptions() {
    const select = document.getElementById('sp-entry-target-accounts');
    if (!select) return;

    const previousSelection = new Set(Array.from(select.selectedOptions).map((option) => option.value));
    const scopedAccounts = getSocialPlannerScopedAccounts();
    select.innerHTML = '';

    scopedAccounts.forEach((account) => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.displayName} (${account.platform})`;
        if (previousSelection.has(account.id)) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    renderSocialPlannerComposerAccountChips();
}

function renderSocialPlannerAccounts() {
    const container = document.getElementById('sp-accounts-list');
    if (!container) return;

    const scopedAccounts = getSocialPlannerScopedAccounts();
    container.innerHTML = '';

    if (scopedAccounts.length === 0) {
        container.className = 'social-planner-list-empty';
        container.textContent = 'Ingen kontoer lagt til i dette workspace.';
        return;
    }

    container.className = 'social-planner-account-list';
    scopedAccounts.forEach((account) => {
        const item = document.createElement('article');
        item.className = 'social-planner-account-item';

        const meta = document.createElement('div');
        meta.className = 'social-planner-account-meta';

        const title = document.createElement('strong');
        title.textContent = account.displayName || account.id;

        const details = document.createElement('span');
        const ext = String(account.externalAccountId || '').trim();
        details.textContent = ext ? `${account.platform} • ${ext}` : account.platform;

        meta.appendChild(title);
        meta.appendChild(details);

        const actions = document.createElement('div');
        actions.className = 'social-planner-account-actions';

        const badge = document.createElement('span');
        badge.className = `social-planner-badge status-${toSocialPlannerStatusClass(account.status)}`;
        badge.textContent = formatSocialPlannerStatus(account.status || 'active');

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'action-btn';
        editBtn.title = 'Rediger konto';
        editBtn.innerHTML = '<i class="fas fa-pen"></i>';
        editBtn.addEventListener('click', () => {
            window.editSocialPlannerAccount(account.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'action-btn delete';
        deleteBtn.title = 'Slett konto';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => {
            window.deleteSocialPlannerAccount(account.id);
        });

        actions.appendChild(badge);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(meta);
        item.appendChild(actions);
        container.appendChild(item);
    });
}

function ensureSocialPlannerCalendarCursor() {
    const cursor = socialPlannerCalendarCursor instanceof Date && Number.isFinite(socialPlannerCalendarCursor.getTime())
        ? new Date(socialPlannerCalendarCursor.getTime())
        : new Date();
    cursor.setDate(1);
    cursor.setHours(12, 0, 0, 0);
    socialPlannerCalendarCursor = cursor;
    return cursor;
}

function applySocialPlannerStreamViewMode() {
    const normalizedViewMode = normalizeSocialPlannerStreamViewMode(socialPlannerStreamViewMode);
    socialPlannerStreamViewMode = normalizedViewMode;
    const isCalendar = normalizedViewMode === 'calendar';
    const isAnalytics = socialPlannerEntryFilter === 'analytics';

    const listView = document.getElementById('sp-entries-feed');
    const calendarView = document.getElementById('sp-calendar-view');
    const analyticsPanel = document.getElementById('sp-analytics-panel');
    const viewToggle = document.getElementById('sp-view-mode-toggle');
    const streamFilters = document.querySelector('.social-planner-stream-filters');
    if (listView) {
        listView.hidden = isCalendar || isAnalytics;
        listView.style.display = isCalendar || isAnalytics ? 'none' : '';
    }
    if (calendarView) {
        calendarView.hidden = !isCalendar || isAnalytics;
        calendarView.style.display = (!isCalendar || isAnalytics) ? 'none' : 'grid';
    }
    if (analyticsPanel) {
        analyticsPanel.hidden = !isAnalytics;
        analyticsPanel.style.display = isAnalytics ? 'grid' : 'none';
    }
    if (viewToggle) {
        viewToggle.hidden = isAnalytics;
        viewToggle.style.display = isAnalytics ? 'none' : '';
    }
    if (streamFilters) {
        streamFilters.hidden = isAnalytics;
        streamFilters.style.display = isAnalytics ? 'none' : '';
    }

    const viewButtons = document.querySelectorAll('#sp-view-mode-toggle .social-planner-view-btn');
    viewButtons.forEach((button) => {
        const viewMode = normalizeSocialPlannerStreamViewMode(button.dataset.view);
        button.classList.toggle('active', viewMode === normalizedViewMode);
    });
}

function renderSocialPlannerStreamFilterControls(entries = [], accounts = []) {
    const scopedEntries = Array.isArray(entries) ? entries : [];
    const scopedAccounts = Array.isArray(accounts) ? accounts : [];

    const channelSelect = document.getElementById('sp-stream-channel-filter');
    if (channelSelect) {
        const nextChannelFilter = normalizeSocialPlannerChannelFilter(socialPlannerChannelFilter);
        channelSelect.innerHTML = '';

        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Kanaler';
        channelSelect.appendChild(allOption);

        scopedAccounts.forEach((account) => {
            const option = document.createElement('option');
            option.value = String(account.id);
            option.textContent = account.displayName || account.id;
            channelSelect.appendChild(option);
        });

        const hasSelectedChannel = nextChannelFilter === 'all'
            || scopedAccounts.some((account) => String(account.id) === nextChannelFilter);
        socialPlannerChannelFilter = hasSelectedChannel ? nextChannelFilter : 'all';
        channelSelect.value = socialPlannerChannelFilter;
    }

    const tagSelect = document.getElementById('sp-stream-tag-filter');
    if (tagSelect) {
        const tags = new Map();
        scopedEntries.forEach((entry) => {
            const hashtags = Array.isArray(entry?.hashtags) ? entry.hashtags : [];
            hashtags.forEach((tagValue) => {
                const token = normalizeSocialPlannerTagFilter(tagValue);
                if (!token || token === 'all') return;
                if (!tags.has(token)) {
                    tags.set(token, `#${token}`);
                }
            });
        });

        const sortedTags = Array.from(tags.entries()).sort((left, right) => left[0].localeCompare(right[0]));
        tagSelect.innerHTML = '';

        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Tagger';
        tagSelect.appendChild(allOption);

        sortedTags.forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            tagSelect.appendChild(option);
        });

        const nextTagFilter = normalizeSocialPlannerTagFilter(socialPlannerTagFilter);
        const hasSelectedTag = nextTagFilter === 'all' || tags.has(nextTagFilter);
        socialPlannerTagFilter = hasSelectedTag ? nextTagFilter : 'all';
        tagSelect.value = socialPlannerTagFilter;
    }

    const timezoneSelect = document.getElementById('sp-stream-timezone-filter');
    if (timezoneSelect) {
        const workspaceTimezone = getSocialPlannerDefaultTimezone();
        const browserTimezone = String(Intl.DateTimeFormat().resolvedOptions().timeZone || '').trim();
        const options = new Map();

        options.set(workspaceTimezone, `Arbeidsområde (${workspaceTimezone})`);
        if (isValidSocialPlannerTimezone(browserTimezone)) {
            options.set(browserTimezone, `Nettleser (${browserTimezone})`);
        }
        ['Europe/Oslo', 'Europe/Berlin', 'UTC', 'America/New_York', 'America/Los_Angeles'].forEach((value) => {
            if (isValidSocialPlannerTimezone(value)) {
                options.set(value, value);
            }
        });

        const normalizedTimezone = getSocialPlannerDisplayTimezone();
        if (!options.has(normalizedTimezone)) {
            options.set(normalizedTimezone, normalizedTimezone);
        }

        timezoneSelect.innerHTML = '';
        options.forEach((label, value) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            timezoneSelect.appendChild(option);
        });
        timezoneSelect.value = normalizedTimezone;
    }
}

window.shiftSocialPlannerCalendarMonth = function (delta = 0) {
    const step = Number.parseInt(delta, 10);
    if (!Number.isFinite(step) || step === 0) return;
    const cursor = ensureSocialPlannerCalendarCursor();
    cursor.setMonth(cursor.getMonth() + step);
    socialPlannerCalendarCursor = cursor;
    renderSocialPlannerEntries();
};

function renderSocialPlannerCalendarView(entries = []) {
    const calendar = document.getElementById('sp-calendar-view');
    if (!calendar) return;
    calendar.innerHTML = '';

    const scopedEntries = Array.isArray(entries) ? entries : [];
    if (scopedEntries.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'social-planner-list-empty social-planner-feed-empty';
        if (socialPlannerEntrySearch) {
            empty.textContent = `Ingen innlegg matcher søket "${socialPlannerEntrySearch}".`;
        } else {
            empty.textContent = 'Ingen innlegg i valgt filter.';
        }
        calendar.appendChild(empty);
        return;
    }

    const locale = currentLang === 'en' ? 'en-GB' : 'nb-NO';
    const timezone = getSocialPlannerDisplayTimezone();
    const cursor = ensureSocialPlannerCalendarCursor();
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const monthStart = new Date(year, month, 1, 12, 0, 0, 0);
    const monthEnd = new Date(year, month + 1, 0, 12, 0, 0, 0);
    const daysInMonth = monthEnd.getDate();
    const startWeekday = (monthStart.getDay() + 6) % 7;

    const header = document.createElement('div');
    header.className = 'social-planner-calendar-header';
    const monthLabel = document.createElement('h4');
    monthLabel.textContent = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        month: 'long',
        year: 'numeric'
    }).format(monthStart);
    const nav = document.createElement('div');
    nav.className = 'social-planner-calendar-nav';
    nav.innerHTML = `
        <button type="button" class="action-btn" title="Forrige måned" aria-label="Forrige måned" onclick="shiftSocialPlannerCalendarMonth(-1)"><i class="fas fa-chevron-left"></i></button>
        <button type="button" class="action-btn" title="Neste måned" aria-label="Neste måned" onclick="shiftSocialPlannerCalendarMonth(1)"><i class="fas fa-chevron-right"></i></button>
    `;
    header.appendChild(monthLabel);
    header.appendChild(nav);
    calendar.appendChild(header);

    const weekdays = document.createElement('div');
    weekdays.className = 'social-planner-calendar-weekdays';
    const weekdayLabels = currentLang === 'en'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['man', 'tir', 'ons', 'tor', 'fre', 'lor', 'son'];
    weekdayLabels.forEach((weekdayLabel) => {
        const label = document.createElement('span');
        label.textContent = weekdayLabel;
        weekdays.appendChild(label);
    });
    calendar.appendChild(weekdays);

    const entriesByDate = new Map();
    scopedEntries.forEach((entry) => {
        const primaryDate = getSocialPlannerEntryPrimaryDate(entry);
        const key = getSocialPlannerDateKey(primaryDate);
        if (!key || key === 'unknown') return;
        if (!entriesByDate.has(key)) {
            entriesByDate.set(key, []);
        }
        entriesByDate.get(key).push(entry);
    });

    entriesByDate.forEach((dayEntries) => {
        dayEntries.sort((left, right) => getSocialPlannerEntryPrimaryTimestamp(right) - getSocialPlannerEntryPrimaryTimestamp(left));
    });

    const grid = document.createElement('div');
    grid.className = 'social-planner-calendar-grid';

    const cells = 42;
    for (let cellIndex = 0; cellIndex < cells; cellIndex += 1) {
        const dayOffset = cellIndex - startWeekday;
        const cellDate = new Date(year, month, dayOffset + 1, 12, 0, 0, 0);
        const cellParts = getSocialPlannerDateParts(cellDate);
        const cellKey = cellParts?.key || '';
        const dayEntries = entriesByDate.get(cellKey) || [];
        const isCurrentMonth = dayOffset >= 0 && dayOffset < daysInMonth;

        const dayCell = document.createElement('article');
        dayCell.className = `social-planner-calendar-day${isCurrentMonth ? '' : ' is-outside'}`;
        dayCell.tabIndex = 0;
        dayCell.setAttribute('role', 'button');
        const cellLabel = new Intl.DateTimeFormat(locale, {
            timeZone: timezone,
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(cellDate);
        dayCell.setAttribute('aria-label', `Nytt innlegg ${cellLabel}`);
        dayCell.title = `Opprett innlegg ${cellLabel}`;
        dayCell.addEventListener('click', () => {
            openSocialPlannerComposerForDate(cellDate);
        });
        dayCell.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            openSocialPlannerComposerForDate(cellDate);
        });

        const dayNumber = document.createElement('div');
        dayNumber.className = 'social-planner-calendar-day-number';
        dayNumber.textContent = String(cellParts?.day || cellDate.getDate());
        dayCell.appendChild(dayNumber);

        dayEntries.slice(0, 2).forEach((entry) => {
            const statusClass = toSocialPlannerStatusClass(entry?.status || 'draft');
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'social-planner-calendar-day-item';
            item.title = statusClass === 'draft'
                ? 'Åpne utkast for redigering'
                : isSocialPlannerPublishedLikeStatus(statusClass)
                    ? 'Se publisert innlegg'
                    : 'Åpne innlegg';
            item.setAttribute('aria-label', `${item.title}: ${String(entry?.title || 'Uten tittel')}`);
            item.addEventListener('click', (event) => {
                event.stopPropagation();
                openSocialPlannerEntryFromCalendar(entry);
            });

            const title = document.createElement('strong');
            title.textContent = truncateSocialPlannerText(entry.title || resolveSocialPlannerEntryCaption(entry) || 'Uten tittel', 56);
            const time = document.createElement('span');
            time.textContent = formatSocialPlannerTime(getSocialPlannerEntryPrimaryDate(entry));

            item.appendChild(title);
            item.appendChild(time);
            dayCell.appendChild(item);
        });

        if (dayEntries.length > 2) {
            const more = document.createElement('span');
            more.className = 'social-planner-calendar-day-more';
            more.textContent = `+${dayEntries.length - 2} flere`;
            dayCell.appendChild(more);
        }

        grid.appendChild(dayCell);
    }

    calendar.appendChild(grid);
}

function renderSocialPlannerEntries() {
    const feed = document.getElementById('sp-entries-feed');
    const calendar = document.getElementById('sp-calendar-view');
    const analyticsPanel = document.getElementById('sp-analytics-panel');
    if (!feed || !calendar || !analyticsPanel) return;

    const scopedEntries = getSocialPlannerScopedEntries();
    const scopedAccounts = getSocialPlannerScopedAccounts();
    const accountLookup = new Map(scopedAccounts.map((account) => [String(account.id), account]));
    renderSocialPlannerStreamFilterControls(scopedEntries, scopedAccounts);

    const baseEntries = scopedEntries.filter((entry) => {
        return matchesSocialPlannerEntrySearch(entry, socialPlannerEntrySearch)
            && matchesSocialPlannerEntryChannelFilter(entry, socialPlannerChannelFilter)
            && matchesSocialPlannerEntryTagFilter(entry, socialPlannerTagFilter);
    });
    renderSocialPlannerEntryFilters(baseEntries);

    const filteredEntries = baseEntries.filter((entry) => {
        return matchesSocialPlannerEntryFilter(entry, socialPlannerEntryFilter);
    });

    if (socialPlannerEntryFilter === 'analytics') {
        feed.innerHTML = '';
        calendar.innerHTML = '';
        renderSocialPlannerStats();
        renderSocialPlannerTopEntries();
        applySocialPlannerStreamViewMode();
        return;
    }

    const sortedEntries = filteredEntries.slice().sort((left, right) => {
        const rightTs = getSocialPlannerEntryPrimaryTimestamp(right);
        const leftTs = getSocialPlannerEntryPrimaryTimestamp(left);
        if (rightTs !== leftTs) {
            return rightTs - leftTs;
        }
        return String(right?.updatedAt || '').localeCompare(String(left?.updatedAt || ''));
    });
    const shouldRenderCalendar = normalizeSocialPlannerStreamViewMode(socialPlannerStreamViewMode) === 'calendar';

    feed.innerHTML = '';
    calendar.innerHTML = '';

    if (sortedEntries.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'social-planner-list-empty social-planner-feed-empty';
        const hasScopedEntries = scopedEntries.length > 0;
        if (!hasScopedEntries) {
            empty.textContent = 'Ingen innlegg i dette workspace enda. Opprett første innlegg for å komme i gang.';
        } else if (socialPlannerEntrySearch) {
            empty.textContent = `Ingen innlegg matcher søket "${socialPlannerEntrySearch}".`;
        } else if (socialPlannerChannelFilter !== 'all' || socialPlannerTagFilter !== 'all') {
            empty.textContent = 'Ingen innlegg matcher valgte kanal- eller tag-filtre.';
        } else {
            empty.textContent = 'Ingen innlegg i valgt statusfilter.';
        }
        feed.appendChild(empty);
        if (shouldRenderCalendar) {
            renderSocialPlannerCalendarView(sortedEntries);
        }
        applySocialPlannerStreamViewMode();
        return;
    }

    const groupedEntries = new Map();
    sortedEntries.forEach((entry) => {
        const primaryDate = getSocialPlannerEntryPrimaryDate(entry);
        const key = getSocialPlannerDateKey(primaryDate);
        if (!groupedEntries.has(key)) {
            groupedEntries.set(key, {
                date: primaryDate,
                entries: []
            });
        }
        groupedEntries.get(key).entries.push(entry);
    });

    groupedEntries.forEach((group) => {
        const groupSection = document.createElement('section');
        groupSection.className = 'social-planner-feed-group';

        const groupTitle = document.createElement('h4');
        groupTitle.className = 'social-planner-feed-date';
        groupTitle.textContent = formatSocialPlannerFeedDate(group.date);
        groupSection.appendChild(groupTitle);

        const list = document.createElement('div');
        list.className = 'social-planner-feed-list';

        group.entries.forEach((entry) => {
            const primaryDate = getSocialPlannerEntryPrimaryDate(entry);
            const statusClass = toSocialPlannerStatusClass(entry.status);

            const row = document.createElement('article');
            row.className = 'social-planner-feed-item';

            const timeCol = document.createElement('div');
            timeCol.className = 'social-planner-feed-time';

            const timeValue = document.createElement('strong');
            timeValue.textContent = formatSocialPlannerTime(primaryDate);

            const timeLabel = document.createElement('span');
            timeLabel.textContent = getSocialPlannerEntryTimeLabel(entry);

            timeCol.appendChild(timeValue);
            timeCol.appendChild(timeLabel);

            const card = document.createElement('article');
            card.className = 'social-planner-entry-card';

            const head = document.createElement('div');
            head.className = 'social-planner-entry-card-head';

            const accountsWrap = document.createElement('div');
            accountsWrap.className = 'social-planner-entry-accounts';

            const targetIds = Array.isArray(entry.targetAccountIds) ? entry.targetAccountIds : [];
            const resolvedAccounts = targetIds.map((accountId) => {
                const account = accountLookup.get(String(accountId));
                if (account) return account;
                return {
                    id: String(accountId || ''),
                    displayName: String(accountId || 'Ukjent konto'),
                    platform: 'custom'
                };
            });

            if (resolvedAccounts.length === 0) {
                const emptyChip = document.createElement('span');
                emptyChip.className = 'social-planner-account-chip';
                emptyChip.innerHTML = '<i class="fas fa-user-plus"></i> Ingen konto';
                accountsWrap.appendChild(emptyChip);
            } else {
                const visibleAccounts = resolvedAccounts.slice(0, 3);
                visibleAccounts.forEach((account) => {
                    const chip = document.createElement('span');
                    chip.className = 'social-planner-account-chip';
                    chip.dataset.platform = String(account.platform || '').toLowerCase();

                    const icon = document.createElement('i');
                    icon.className = getSocialPlannerPlatformIconClass(account.platform);

                    const label = document.createElement('span');
                    label.textContent = account.displayName || account.id || 'Konto';

                    chip.appendChild(icon);
                    chip.appendChild(label);
                    accountsWrap.appendChild(chip);
                });

                if (resolvedAccounts.length > visibleAccounts.length) {
                    const overflowChip = document.createElement('span');
                    overflowChip.className = 'social-planner-account-chip';
                    overflowChip.textContent = `+${resolvedAccounts.length - visibleAccounts.length}`;
                    accountsWrap.appendChild(overflowChip);
                }
            }

            const badge = document.createElement('span');
            badge.className = `social-planner-badge status-${statusClass}`;
            badge.textContent = formatSocialPlannerStatus(entry.status || 'draft');

            head.appendChild(accountsWrap);
            head.appendChild(badge);

            const body = document.createElement('div');
            body.className = 'social-planner-entry-card-body';

            const title = document.createElement('h5');
            title.className = 'social-planner-entry-title';
            title.textContent = entry.title || 'Uten tittel';

            const caption = truncateSocialPlannerText(resolveSocialPlannerEntryCaption(entry), 320);
            if (caption) {
                const text = document.createElement('p');
                text.className = 'social-planner-entry-text';
                text.textContent = caption;
                body.appendChild(title);
                body.appendChild(text);
            } else {
                body.appendChild(title);
            }

            const meta = document.createElement('div');
            meta.className = 'social-planner-entry-meta';

            const updatedMeta = document.createElement('span');
            updatedMeta.className = 'social-planner-entry-updated';
            updatedMeta.textContent = `Oppdatert ${formatSocialPlannerDateTime(entry.updatedAt)}`;
            meta.appendChild(updatedMeta);

            const linkUrl = String(entry.linkUrl || '').trim();
            if (linkUrl) {
                const hasHttpScheme = /^https?:\/\//i.test(linkUrl);
                const linkEl = hasHttpScheme
                    ? document.createElement('a')
                    : document.createElement('span');
                linkEl.className = 'social-planner-entry-link';
                if (hasHttpScheme) {
                    linkEl.href = linkUrl;
                    linkEl.target = '_blank';
                    linkEl.rel = 'noopener noreferrer';
                }
                linkEl.textContent = linkUrl;
                meta.appendChild(linkEl);
            }

            const hashtags = Array.isArray(entry.hashtags) ? entry.hashtags.filter(Boolean) : [];
            if (hashtags.length > 0) {
                const hashtagWrap = document.createElement('div');
                hashtagWrap.className = 'social-planner-entry-hashtags';

                hashtags.slice(0, 8).forEach((tag) => {
                    const tagEl = document.createElement('span');
                    tagEl.className = 'social-planner-entry-hashtag';
                    const normalizedTag = String(tag).trim();
                    tagEl.textContent = normalizedTag.startsWith('#') ? normalizedTag : `#${normalizedTag}`;
                    hashtagWrap.appendChild(tagEl);
                });

                meta.appendChild(hashtagWrap);
            }

            if (entry.lastError) {
                const error = document.createElement('p');
                error.className = 'social-planner-entry-error';
                error.textContent = `Feil: ${entry.lastError}`;
                meta.appendChild(error);
            }

            body.appendChild(meta);

            const metricsRow = document.createElement('div');
            metricsRow.className = 'social-planner-entry-metrics';

            const metrics = (entry.metrics && typeof entry.metrics === 'object') ? entry.metrics : {};
            const metricItems = [
                { label: 'Likes', value: metrics.likes || 0 },
                { label: 'Comments', value: metrics.comments || 0 },
                { label: 'Shares', value: metrics.shares || 0 },
                { label: 'Clicks', value: metrics.clicks || 0 },
                { label: 'Reach', value: metrics.reach || 0 }
            ];

            metricItems.forEach((metric) => {
                const metricCell = document.createElement('div');
                metricCell.className = 'social-planner-entry-metric';

                const metricLabel = document.createElement('span');
                metricLabel.textContent = metric.label;

                const metricValue = document.createElement('strong');
                metricValue.textContent = formatNumberForUi(metric.value);

                metricCell.appendChild(metricLabel);
                metricCell.appendChild(metricValue);
                metricsRow.appendChild(metricCell);
            });

            const footer = document.createElement('div');
            footer.className = 'social-planner-entry-footer';

            const source = document.createElement('p');
            source.className = 'social-planner-entry-source';
            const platforms = Array.from(new Set(
                resolvedAccounts
                    .map((account) => formatPlatformLabel(account.platform))
                    .filter(Boolean)
            ));
            const sourcePrefix = isSocialPlannerPublishedLikeStatus(statusClass) ? 'Publisert via' : 'Kontoer';
            source.innerHTML = '<i class="fas fa-share-nodes"></i>';
            const sourceText = document.createTextNode(
                platforms.length > 0
                    ? `${sourcePrefix} ${platforms.join(', ')}`
                    : 'Ingen konto valgt'
            );
            source.appendChild(sourceText);

            const actions = document.createElement('div');
            actions.className = 'social-planner-entry-actions';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'action-btn';
            editBtn.title = 'Rediger innlegg';
            editBtn.innerHTML = '<i class="fas fa-pen"></i><span>Rediger</span>';
            editBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                window.editSocialPlannerEntry(entry.id);
            });

            const publishBtn = document.createElement('button');
            publishBtn.type = 'button';
            publishBtn.className = 'action-btn';
            const isPublishing = statusClass === 'publishing';
            publishBtn.title = isPublishing ? 'Prøv publisering på nytt' : 'Publiser nå';
            publishBtn.innerHTML = isPublishing
                ? '<i class="fas fa-rotate-right"></i><span>Prøv igjen</span>'
                : '<i class="fas fa-paper-plane"></i><span>Publiser</span>';
            publishBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                window.publishSocialPlannerEntry(entry.id);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'action-btn delete';
            deleteBtn.title = 'Slett innlegg';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                window.deleteSocialPlannerEntry(entry.id);
            });

            actions.appendChild(editBtn);
            actions.appendChild(publishBtn);
            actions.appendChild(deleteBtn);

            footer.appendChild(source);
            footer.appendChild(actions);

            card.appendChild(head);
            card.appendChild(body);
            card.appendChild(metricsRow);
            card.appendChild(footer);

            row.appendChild(timeCol);
            row.appendChild(card);
            list.appendChild(row);
        });

        groupSection.appendChild(list);
        feed.appendChild(groupSection);
    });

    if (shouldRenderCalendar) {
        renderSocialPlannerCalendarView(sortedEntries);
    }
    applySocialPlannerStreamViewMode();
}

window.setSocialPlannerEntryFilter = async function (filter = 'queue') {
    socialPlannerEntryFilter = normalizeSocialPlannerEntryFilter(filter);
    renderSocialPlannerEntries();
    if (socialPlannerEntryFilter === 'analytics') {
        await fetchSocialPlannerAnalytics('7d', { silent: true });
        renderSocialPlannerEntries();
    }
};

function renderSocialPlannerStats() {
    const overview = socialPlannerAnalytics?.overview || {};
    const publishedEl = document.getElementById('sp-stat-published');
    const reachEl = document.getElementById('sp-stat-reach');
    const engagementEl = document.getElementById('sp-stat-engagement');
    const bestTimeEl = document.getElementById('sp-stat-best-time');

    const likes = Number.parseInt(overview.likes, 10) || 0;
    const comments = Number.parseInt(overview.comments, 10) || 0;
    const shares = Number.parseInt(overview.shares, 10) || 0;
    const clicks = Number.parseInt(overview.clicks, 10) || 0;
    const totalEngagement = likes + comments + shares + clicks;

    if (publishedEl) {
        publishedEl.textContent = formatNumberForUi(overview.publishedPosts || 0);
    }
    if (reachEl) {
        reachEl.textContent = formatNumberForUi(overview.reach || 0);
    }
    if (engagementEl) {
        engagementEl.textContent = formatNumberForUi(totalEngagement);
    }
    if (bestTimeEl) {
        const bestDay = String(overview.bestDay || '').trim();
        const bestHour = String(overview.bestHour || '').trim();
        if (bestDay && bestDay !== 'Ingen data' && bestHour && bestHour !== 'Ingen data') {
            bestTimeEl.textContent = `${bestDay}, ${bestHour}`;
        } else {
            bestTimeEl.textContent = 'Ingen data';
        }
    }
}

function renderSocialPlannerTopEntries() {
    const container = document.getElementById('sp-top-entries');
    if (!container) return;
    container.innerHTML = '';

    const topEntries = Array.isArray(socialPlannerAnalytics?.topEntries) ? socialPlannerAnalytics.topEntries : [];
    if (topEntries.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'social-planner-list-empty';
        empty.textContent = 'Ingen analytics-data enda.';
        container.appendChild(empty);
        return;
    }

    topEntries.forEach((entry) => {
        const item = document.createElement('article');
        item.className = 'social-planner-top-item';

        const title = document.createElement('strong');
        title.textContent = entry.title || 'Uten tittel';

        const engagement = document.createElement('p');
        engagement.className = 'meta';
        engagement.textContent = `Engasjement: ${formatNumberForUi(entry.engagement || 0)}`;

        const publishedAt = document.createElement('p');
        publishedAt.className = 'meta';
        publishedAt.textContent = `Publisert: ${formatSocialPlannerDateTime(entry.publishedAt)}`;

        item.appendChild(title);
        item.appendChild(engagement);
        item.appendChild(publishedAt);
        container.appendChild(item);
    });
}

function renderSocialPlannerTab() {
    socialPlannerEntryFilter = normalizeSocialPlannerEntryFilter(socialPlannerEntryFilter);
    socialPlannerChannelFilter = normalizeSocialPlannerChannelFilter(socialPlannerChannelFilter);
    socialPlannerTagFilter = normalizeSocialPlannerTagFilter(socialPlannerTagFilter);
    socialPlannerStreamViewMode = normalizeSocialPlannerStreamViewMode(socialPlannerStreamViewMode);
    socialPlannerDisplayTimezone = getSocialPlannerDisplayTimezone();
    ensureSocialPlannerCalendarCursor();
    renderSocialPlannerWorkspaceSelect();
    renderSocialPlannerWorkspaceList();
    renderSocialPlannerTemplateSelect();
    renderSocialPlannerTemplatesList();
    renderSocialPlannerTargetAccountOptions();
    renderSocialPlannerAccounts();
    const searchInput = document.getElementById('sp-entry-search');
    if (searchInput && String(searchInput.value || '') !== socialPlannerEntrySearch) {
        searchInput.value = socialPlannerEntrySearch;
    }
    renderSocialPlannerEntries();
    syncSocialPlannerComposerMeta();
    renderSocialPlannerComposerAccountChips();
    syncSocialPlannerScheduleFieldState();
    renderSocialPlannerEntryPreview();
}

async function fetchSocialPlannerAnalytics(period = '7d', options = {}) {
    if (!socialPlannerState) {
        socialPlannerAnalytics = null;
        renderSocialPlannerStats();
        renderSocialPlannerTopEntries();
        return null;
    }

    const safePeriod = String(period || '7d').trim() || '7d';
    const params = new URLSearchParams({
        scope: 'workspace',
        workspaceId: getSocialPlannerActiveWorkspaceId(),
        period: safePeriod
    });

    try {
        const response = await fetch(`${API_URL}/social-planner/analytics?${params.toString()}`);
        if (!response.ok) {
            const apiMessage = await parseApiErrorMessage(response, 'Kunne ikke hente analytics.');
            throw new Error(apiMessage);
        }
        const payload = await response.json();
        socialPlannerAnalytics = payload?.analytics || null;
        renderSocialPlannerStats();
        renderSocialPlannerTopEntries();
        return socialPlannerAnalytics;
    } catch (error) {
        socialPlannerAnalytics = null;
        renderSocialPlannerStats();
        renderSocialPlannerTopEntries();
        if (!options.silent) {
            setSocialPlannerStatus(
                normalizeAdminErrorMessage(error, 'Kunne ikke hente analytics.'),
                'danger'
            );
        }
        return null;
    }
}

async function refreshSocialPlannerState(options = {}) {
    if (socialPlannerLoading) {
        if (options.retryOnBusy) {
            const retryOptions = { ...options, retryOnBusy: false };
            window.setTimeout(() => {
                refreshSocialPlannerState(retryOptions);
            }, 350);
        }
        return;
    }
    socialPlannerLoading = true;

    const requestedWorkspaceId = String(options.workspaceId || getSocialPlannerWorkspaceIdCandidate() || 'default');
    const params = new URLSearchParams({
        scope: 'all',
        workspaceId: requestedWorkspaceId
    });
    if (options.runScheduler) {
        params.set('runScheduler', 'true');
        params.set('maxEntries', String(options.maxEntries || 10));
    }

    if (!options.silent) {
        setSocialPlannerStatus('Laster social planner-data...');
    }

    try {
        const payload = await requestSocialPlanner(`?${params.toString()}`, {}, 'Kunne ikke hente social planner-data.');
        if (!payload?.success || !payload.state) {
            throw new Error(String(payload?.error || 'Ugyldig svar fra social planner API.'));
        }

        socialPlannerState = payload.state;
        socialPlannerLoaded = true;
        renderSocialPlannerTab();
        if (socialPlannerEntryFilter === 'analytics') {
            await fetchSocialPlannerAnalytics('7d', { silent: true });
            renderSocialPlannerEntries();
        }

        if (payload.scheduler && options.runScheduler) {
            const scheduler = payload.scheduler;
            setSocialPlannerStatus(
                `Scheduler ferdig: ${scheduler.published || 0} publisert, ${scheduler.failed || 0} feilet (av ${scheduler.processed || 0}).`,
                scheduler.ok ? 'success' : 'danger'
            );
        } else {
            setSocialPlannerStatus(`Oppdatert ${new Date().toLocaleTimeString('nb-NO')}`, 'success');
        }
    } catch (error) {
        console.error('Error refreshing social planner:', error);
        setSocialPlannerStatus(
            normalizeAdminErrorMessage(error, 'Kunne ikke hente social planner-data.'),
            'danger'
        );
    } finally {
        socialPlannerLoading = false;
    }
}

window.refreshSocialPlanner = async function () {
    await refreshSocialPlannerState({ silent: false });
};

window.changeSocialPlannerWorkspace = async function (workspaceId) {
    const normalizedWorkspaceId = String(workspaceId || '').trim();
    if (!normalizedWorkspaceId) return;

    try {
        await requestSocialPlanner('/settings', {
            method: 'PATCH',
            body: JSON.stringify({ activeWorkspaceId: normalizedWorkspaceId })
        }, 'Kunne ikke bytte workspace.');

        if (socialPlannerState) {
            socialPlannerState.settings = {
                ...(socialPlannerState.settings || {}),
                activeWorkspaceId: normalizedWorkspaceId
            };
        }

        resetSocialPlannerWorkspaceForm();
        resetSocialPlannerTemplateForm();
        resetSocialPlannerAccountForm();
        resetSocialPlannerEntryForm();
        closeSocialPlannerComposer();
        socialPlannerEntryFilter = 'queue';
        socialPlannerEntrySearch = '';
        socialPlannerChannelFilter = 'all';
        socialPlannerTagFilter = 'all';
        socialPlannerStreamViewMode = 'list';
        socialPlannerDisplayTimezone = getSocialPlannerDefaultTimezone();
        socialPlannerCalendarCursor = new Date();
        renderSocialPlannerTab();
        if (socialPlannerEntryFilter === 'analytics') {
            await fetchSocialPlannerAnalytics('7d', { silent: true });
            renderSocialPlannerEntries();
        }
        setSocialPlannerStatus('Workspace byttet.', 'success');
    } catch (error) {
        console.error('Error changing social planner workspace:', error);
        setSocialPlannerStatus(
            normalizeAdminErrorMessage(error, 'Kunne ikke bytte workspace.'),
            'danger'
        );
    }
};

window.changeSocialPlannerAnalyticsPeriod = async function (period) {
    const safePeriod = String(period || '').trim() || '7d';
    await fetchSocialPlannerAnalytics(safePeriod);
};

window.resetSocialPlannerWorkspaceForm = resetSocialPlannerWorkspaceForm;

window.saveSocialPlannerWorkspace = async function (event) {
    event.preventDefault();

    const editId = String(document.getElementById('sp-workspace-edit-id')?.value || '').trim();
    const name = String(document.getElementById('sp-workspace-name')?.value || '').trim();
    const timezone = String(document.getElementById('sp-workspace-timezone')?.value || '').trim() || 'Europe/Oslo';

    if (!name) {
        setSocialPlannerStatus('Workspace-navn er påkrevd.', 'danger');
        return;
    }

    try {
        let nextWorkspaceId = getSocialPlannerActiveWorkspaceId();
        if (editId) {
            const payload = await requestSocialPlanner(`/workspaces/${encodeURIComponent(editId)}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    name,
                    timezone
                })
            }, 'Kunne ikke oppdatere workspace.');
            nextWorkspaceId = String(payload?.workspace?.id || editId);
            setSocialPlannerStatus('Workspace oppdatert.', 'success');
        } else {
            const payload = await requestSocialPlanner('/workspaces', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    timezone,
                    setActive: true
                })
            }, 'Kunne ikke opprette workspace.');
            nextWorkspaceId = String(payload?.workspace?.id || nextWorkspaceId);
            setSocialPlannerStatus('Workspace opprettet.', 'success');
        }

        resetSocialPlannerWorkspaceForm();
        await refreshSocialPlannerState({
            silent: true,
            workspaceId: nextWorkspaceId
        });
    } catch (error) {
        console.error('Error saving social planner workspace:', error);
        setSocialPlannerStatus(
            normalizeAdminErrorMessage(error, 'Kunne ikke lagre workspace.'),
            'danger'
        );
    }
};

window.editSocialPlannerWorkspace = function (workspaceId) {
    const normalizedWorkspaceId = String(workspaceId || '').trim();
    if (!normalizedWorkspaceId) return;

    const workspaces = Array.isArray(socialPlannerState?.workspaces) ? socialPlannerState.workspaces : [];
    const workspace = workspaces.find((item) => item.id === normalizedWorkspaceId);
    if (!workspace) {
        setSocialPlannerStatus('Workspace ble ikke funnet.', 'danger');
        return;
    }

    const editIdInput = document.getElementById('sp-workspace-edit-id');
    const nameInput = document.getElementById('sp-workspace-name');
    const timezoneInput = document.getElementById('sp-workspace-timezone');
    const submitBtn = document.getElementById('sp-workspace-submit-btn');

    if (editIdInput) editIdInput.value = workspace.id;
    if (nameInput) nameInput.value = workspace.name || '';
    if (timezoneInput) timezoneInput.value = workspace.timezone || 'Europe/Oslo';
    if (submitBtn) submitBtn.textContent = 'Oppdater workspace';
    nameInput?.focus();
};

window.deleteSocialPlannerWorkspace = async function (workspaceId) {
    const normalizedWorkspaceId = String(workspaceId || '').trim();
    if (!normalizedWorkspaceId) return;

    const shouldDelete = await showAdminConfirm(
        'Workspace og tilhørende kontoer, maler og innlegg blir slettet.',
        {
            title: 'Slette workspace?',
            confirmText: 'Slett workspace',
            cancelText: 'Avbryt',
            variant: 'warning'
        }
    );
    if (!shouldDelete) return;

    try {
        await requestSocialPlanner(`/workspaces/${encodeURIComponent(normalizedWorkspaceId)}`, {
            method: 'DELETE'
        }, 'Kunne ikke slette workspace.');

        if (document.getElementById('sp-workspace-edit-id')?.value === normalizedWorkspaceId) {
            resetSocialPlannerWorkspaceForm();
        }

        await refreshSocialPlannerState({ silent: true });
        setSocialPlannerStatus('Workspace slettet.', 'success');
    } catch (error) {
        console.error('Error deleting social planner workspace:', error);
        setSocialPlannerStatus(
            normalizeAdminErrorMessage(error, 'Kunne ikke slette workspace.'),
            'danger'
        );
    }
};

window.resetSocialPlannerTemplateForm = resetSocialPlannerTemplateForm;

window.saveSocialPlannerTemplate = async function (event) {
    event.preventDefault();

    const editId = String(document.getElementById('sp-template-edit-id')?.value || '').trim();
    const name = String(document.getElementById('sp-template-name')?.value || '').trim();
    const category = String(document.getElementById('sp-template-category')?.value || '').trim();
    const body = String(document.getElementById('sp-template-body')?.value || '').trim();

    if (!name || !body) {
        setSocialPlannerStatus('Template-navn og tekst er påkrevd.', 'danger');
        return;
    }

    try {
        if (editId) {
            await requestSocialPlanner(`/templates/${encodeURIComponent(editId)}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    workspaceId: getSocialPlannerActiveWorkspaceId(),
                    name,
                    category,
                    body
                })
            }, 'Kunne ikke oppdatere mal.');
            setSocialPlannerStatus('Mal oppdatert.', 'success');
        } else {
            await requestSocialPlanner('/templates', {
                method: 'POST',
                body: JSON.stringify({
                    workspaceId: getSocialPlannerActiveWorkspaceId(),
                    name,
                    category,
                    body
                })
            }, 'Kunne ikke lagre mal.');
            setSocialPlannerStatus('Mal lagret.', 'success');
        }

        resetSocialPlannerTemplateForm();
        await refreshSocialPlannerState({
            silent: true,
            workspaceId: getSocialPlannerActiveWorkspaceId()
        });
    } catch (error) {
        console.error('Error saving social planner template:', error);
        setSocialPlannerStatus(
            normalizeAdminErrorMessage(error, 'Kunne ikke lagre mal.'),
            'danger'
        );
    }
};

window.editSocialPlannerTemplate = function (templateId) {
    const normalizedTemplateId = String(templateId || '').trim();
    if (!normalizedTemplateId) return;

    const templates = Array.isArray(socialPlannerState?.templates) ? socialPlannerState.templates : [];
    const template = templates.find((item) => item.id === normalizedTemplateId);
    if (!template) {
        setSocialPlannerStatus('Malen ble ikke funnet.', 'danger');
        return;
    }

    const editIdInput = document.getElementById('sp-template-edit-id');
    const nameInput = document.getElementById('sp-template-name');
    const categoryInput = document.getElementById('sp-template-category');
    const bodyInput = document.getElementById('sp-template-body');
    const submitBtn = document.getElementById('sp-template-submit-btn');

    if (editIdInput) editIdInput.value = template.id;
    if (nameInput) nameInput.value = template.name || '';
    if (categoryInput) categoryInput.value = template.category || '';
    if (bodyInput) bodyInput.value = template.body || '';
    if (submitBtn) submitBtn.textContent = 'Oppdater mal';
    nameInput?.focus();
};

window.deleteSocialPlannerTemplate = async function (templateId) {
    const normalizedTemplateId = String(templateId || '').trim();
    if (!normalizedTemplateId) return;

    const shouldDelete = await showAdminConfirm(
        'Malen blir permanent slettet fra dette workspace.',
        {
            title: 'Slette mal?',
            confirmText: 'Slett mal',
            cancelText: 'Avbryt',
            variant: 'warning'
        }
    );
    if (!shouldDelete) return;

    try {
        await requestSocialPlanner(`/templates/${encodeURIComponent(normalizedTemplateId)}`, {
            method: 'DELETE'
        }, 'Kunne ikke slette mal.');

        if (document.getElementById('sp-template-edit-id')?.value === normalizedTemplateId) {
            resetSocialPlannerTemplateForm();
        }

        await refreshSocialPlannerState({
            silent: true,
            workspaceId: getSocialPlannerActiveWorkspaceId()
        });
        setSocialPlannerStatus('Mal slettet.', 'success');
    } catch (error) {
        console.error('Error deleting social planner template:', error);
        setSocialPlannerStatus(
            normalizeAdminErrorMessage(error, 'Kunne ikke slette mal.'),
            'danger'
        );
    }
};

window.applySocialPlannerTemplateToEntry = async function (templateId = '') {
    const select = document.getElementById('sp-entry-template');
    const titleInput = document.getElementById('sp-entry-title');
    const linkInput = document.getElementById('sp-entry-link');
    const hashtagInput = document.getElementById('sp-entry-hashtags');
    const masterTextInput = document.getElementById('sp-entry-master-text');
    if (!masterTextInput) return;

    const chosenTemplateId = String(templateId || select?.value || '').trim();
    if (!chosenTemplateId) {
        setSocialPlannerStatus('Velg en mal først.', 'danger');
        return;
    }

    const templates = getSocialPlannerScopedTemplates();
    const template = templates.find((item) => item.id === chosenTemplateId);
    if (!template) {
        setSocialPlannerStatus('Malen ble ikke funnet i dette workspace.', 'danger');
        return;
    }

    const existingText = String(masterTextInput.value || '').trim();
    const titleValue = String(titleInput?.value || '').trim();
    const linkValue = String(linkInput?.value || '').trim();
    const hashtagValue = String(hashtagInput?.value || '').trim();
    const summaryValue = existingText.replace(/\s+/g, ' ').trim().slice(0, 220);
    const resolvedTemplateBody = renderSocialPlannerTemplateBody(template.body || '', {
        title: titleValue,
        summary: summaryValue,
        url: linkValue,
        link: linkValue,
        hook: titleValue,
        hashtags: hashtagValue
    }).trim();
    const templateToApply = resolvedTemplateBody || String(template.body || '').trim();

    if (existingText && existingText !== templateToApply) {
        const shouldReplace = await showAdminConfirm(
            'Master-teksten har innhold allerede. Vil du erstatte med valgt mal?',
            {
                title: 'Erstatte tekst?',
                confirmText: 'Erstatt',
                cancelText: 'Avbryt',
                variant: 'warning'
            }
        );
        if (!shouldReplace) {
            return;
        }
    }

    masterTextInput.value = templateToApply;
    if (select) {
        select.value = template.id;
    }
    renderSocialPlannerEntryPreview();
    setSocialPlannerStatus('Mal satt inn i master-tekst.', 'success');
};

window.resetSocialPlannerAccountForm = resetSocialPlannerAccountForm;

window.editSocialPlannerAccount = function (accountId) {
    const normalizedAccountId = String(accountId || '').trim();
    if (!normalizedAccountId) return;

    const accounts = Array.isArray(socialPlannerState?.socialAccounts) ? socialPlannerState.socialAccounts : [];
    const account = accounts.find((item) => item.id === normalizedAccountId);
    if (!account) {
        setSocialPlannerStatus('Kontoen ble ikke funnet.', 'danger');
        return;
    }

    const editIdInput = document.getElementById('sp-account-edit-id');
    const nameInput = document.getElementById('sp-account-name');
    const platformSelect = document.getElementById('sp-account-platform');
    const externalInput = document.getElementById('sp-account-external');
    const statusSelect = document.getElementById('sp-account-status');
    const submitBtn = document.getElementById('sp-account-submit-btn');

    if (editIdInput) editIdInput.value = account.id;
    if (nameInput) nameInput.value = account.displayName || '';
    if (platformSelect) platformSelect.value = String(account.platform || 'facebook');
    if (externalInput) externalInput.value = account.externalAccountId || '';
    if (statusSelect) statusSelect.value = String(account.status || 'active');
    if (submitBtn) submitBtn.textContent = 'Oppdater konto';
    nameInput?.focus();
};

window.createSocialPlannerAccount = async function (event) {
    event.preventDefault();

    const editId = String(document.getElementById('sp-account-edit-id')?.value || '').trim();
    const displayName = String(document.getElementById('sp-account-name')?.value || '').trim();
    const platform = String(document.getElementById('sp-account-platform')?.value || 'facebook').trim();
    const externalAccountId = String(document.getElementById('sp-account-external')?.value || '').trim();
    const status = String(document.getElementById('sp-account-status')?.value || 'active').trim();

    if (!displayName) {
        setSocialPlannerStatus('Skriv inn visningsnavn for kontoen.', 'danger');
        return;
    }

    try {
        const requestPath = editId
            ? `/accounts/${encodeURIComponent(editId)}`
            : '/accounts';
        const requestMethod = editId ? 'PATCH' : 'POST';

        await requestSocialPlanner(requestPath, {
            method: requestMethod,
            body: JSON.stringify({
                workspaceId: getSocialPlannerActiveWorkspaceId(),
                displayName,
                platform,
                externalAccountId,
                status
            })
        }, 'Kunne ikke lagre konto.');

        resetSocialPlannerAccountForm();
        await refreshSocialPlannerState({
            silent: true,
            workspaceId: getSocialPlannerActiveWorkspaceId()
        });
        setSocialPlannerStatus(editId ? 'Konto oppdatert.' : 'Konto lagret.', 'success');
    } catch (error) {
        console.error('Error creating social planner account:', error);
        setSocialPlannerStatus(
            normalizeAdminErrorMessage(error, 'Kunne ikke lagre konto.'),
            'danger'
        );
    }
};

window.deleteSocialPlannerAccount = async function (accountId) {
    const normalizedAccountId = String(accountId || '').trim();
    if (!normalizedAccountId) return;

    const shouldDelete = await showAdminConfirm(
        'Kontoen fjernes fra workspace, og innlegg mister koblingen til denne kontoen.',
        {
            title: 'Slette konto?',
            confirmText: 'Slett konto',
            cancelText: 'Behold',
            variant: 'warning'
        }
    );
    if (!shouldDelete) return;

    try {
        await requestSocialPlanner(`/accounts/${encodeURIComponent(normalizedAccountId)}`, {
            method: 'DELETE'
        }, 'Kunne ikke slette konto.');

        if (document.getElementById('sp-account-edit-id')?.value === normalizedAccountId) {
            resetSocialPlannerAccountForm();
        }

        await refreshSocialPlannerState({
            silent: true,
            workspaceId: getSocialPlannerActiveWorkspaceId()
        });
        setSocialPlannerStatus('Konto slettet.', 'success');
    } catch (error) {
        console.error('Error deleting social planner account:', error);
        setSocialPlannerStatus(
            normalizeAdminErrorMessage(error, 'Kunne ikke slette konto.'),
            'danger'
        );
    }
};

function setSocialPlannerComposerSubmitState(isSubmitting = false, action = 'save') {
    const saveBtn = document.getElementById('sp-entry-save-btn');
    const publishBtn = document.getElementById('sp-entry-publish-btn');

    if (saveBtn) {
        if (!saveBtn.dataset.defaultHtml) saveBtn.dataset.defaultHtml = saveBtn.innerHTML;
        saveBtn.disabled = !!isSubmitting;
        saveBtn.innerHTML = isSubmitting && action === 'save'
            ? '<i class="fas fa-spinner fa-spin"></i> Lagrer...'
            : saveBtn.dataset.defaultHtml;
    }

    if (publishBtn) {
        if (!publishBtn.dataset.defaultHtml) publishBtn.dataset.defaultHtml = publishBtn.innerHTML;
        publishBtn.disabled = !!isSubmitting;
        publishBtn.innerHTML = isSubmitting && action === 'publish-now'
            ? '<i class="fas fa-spinner fa-spin"></i> Publiserer...'
            : publishBtn.dataset.defaultHtml;
    }
}

window.createSocialPlannerEntry = async function (event, options = {}) {
    if (event?.preventDefault) {
        event.preventDefault();
    }

    const explicitAction = String(options?.action || '').trim().toLowerCase();
    const submitter = !explicitAction && event ? event.submitter || null : null;
    const action = explicitAction || String(submitter?.dataset?.action || '').trim().toLowerCase();
    const publishNow = action === 'publish-now';
    const saveDraft = action === 'save-draft';

    const editId = String(document.getElementById('sp-entry-edit-id')?.value || '').trim();
    const rawTitle = String(document.getElementById('sp-entry-title')?.value || '').trim();
    const masterText = String(document.getElementById('sp-entry-master-text')?.value || '').trim();
    const status = String(document.getElementById('sp-entry-status')?.value || 'draft').trim();
    const scheduledFor = toIsoFromLocalDateTime(document.getElementById('sp-entry-scheduled-for')?.value || '');
    const linkUrl = String(document.getElementById('sp-entry-link')?.value || '').trim();
    const mediaUrl = String(document.getElementById('sp-entry-media')?.value || '').trim();
    const hashtags = parseHashtagInput(document.getElementById('sp-entry-hashtags')?.value || '');
    const variants = getSocialPlannerEntryFormVariants();
    const title = deriveSocialPlannerEntryTitle(rawTitle, masterText, variants);
    const targetAccountIds = Array.from(document.getElementById('sp-entry-target-accounts')?.selectedOptions || [])
        .map((option) => option.value)
        .filter(Boolean);

    if (!title) {
        setSocialPlannerStatus('Skriv inn tekst eller tittel før du lagrer innlegget.', 'danger');
        return;
    }

    if (!publishNow && status === 'scheduled' && !scheduledFor) {
        setSocialPlannerStatus('Velg tidspunkt når status er scheduled.', 'danger');
        return;
    }

    try {
        setSocialPlannerComposerSubmitState(true, publishNow ? 'publish-now' : 'save');
        const resolvedStatus = (publishNow || saveDraft) ? 'draft' : status;
        const payload = {
            workspaceId: getSocialPlannerActiveWorkspaceId(),
            title,
            masterText,
            status: resolvedStatus,
            hashtags,
            linkUrl,
            mediaUrl,
            variants,
            targetAccountIds
        };
        if (!publishNow && scheduledFor) {
            payload.scheduledFor = scheduledFor;
        } else if (resolvedStatus !== 'scheduled') {
            payload.scheduledFor = '';
        }
        if (publishNow) {
            payload.publishNow = true;
        }

        const requestPath = editId
            ? `/entries/${encodeURIComponent(editId)}`
            : '/entries';
        const requestMethod = editId ? 'PATCH' : 'POST';

        const apiResponse = await requestSocialPlanner(requestPath, {
            method: requestMethod,
            body: JSON.stringify(payload)
        }, 'Kunne ikke lagre innlegg.');

        const createAnother = !publishNow && !saveDraft && !editId && !!document.getElementById('sp-compose-create-another')?.checked;
        resetSocialPlannerEntryForm();
        if (publishNow) {
            closeSocialPlannerComposer();
        } else if (createAnother) {
            openSocialPlannerComposer({ reset: false, panel: 'preview' });
        } else {
            closeSocialPlannerComposer();
        }
        await refreshSocialPlannerState({
            silent: true,
            workspaceId: getSocialPlannerActiveWorkspaceId()
        });
        if (publishNow) {
            closeSocialPlannerComposer();
        }
        const responseDetails = String(apiResponse?.details || '').trim();
        if (publishNow) {
            const detailsText = responseDetails ? ` ${responseDetails}` : '';
            const message = `Innlegg publisert.${detailsText}`.trim();
            setSocialPlannerStatus(message, 'success');
            void showAdminNotice(message, {
                title: 'Social Planner',
                confirmText: 'OK',
                variant: 'success'
            });
        } else if (saveDraft) {
            const message = 'Innlegg lagret. Du kan åpne det senere fra Utkast.';
            setSocialPlannerStatus(message, 'success');
            void showAdminNotice(message, {
                title: 'Social Planner',
                confirmText: 'OK',
                variant: 'success'
            });
        } else {
            const message = editId ? 'Innlegg oppdatert i planner.' : 'Innlegg lagret i planner.';
            setSocialPlannerStatus(message, 'success');
            void showAdminNotice(message, {
                title: 'Social Planner',
                confirmText: 'OK',
                variant: 'success'
            });
        }
    } catch (error) {
        console.error('Error creating social planner entry:', error);
        const errorMessage = normalizeAdminErrorMessage(error, 'Kunne ikke lagre innlegg.');
        setSocialPlannerStatus(errorMessage, 'danger');
        void showAdminNotice(errorMessage, {
            title: publishNow ? 'Publisering feilet' : 'Lagring feilet',
            confirmText: 'OK',
            variant: 'danger'
        });
    } finally {
        setSocialPlannerComposerSubmitState(false);
    }
};

window.saveSocialPlannerDraft = function () {
    return window.createSocialPlannerEntry(null, { action: 'save-draft' });
};

window.publishSocialPlannerFromComposer = function () {
    return window.createSocialPlannerEntry(null, { action: 'publish-now' });
};

window.resetSocialPlannerEntryForm = resetSocialPlannerEntryForm;

function toLocalDateTimeInputValue(value = '') {
    const date = new Date(String(value || '').trim());
    if (!Number.isFinite(date.getTime())) {
        return '';
    }
    const pad = (number) => String(number).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

window.editSocialPlannerEntry = function (entryId) {
    const normalizedEntryId = String(entryId || '').trim();
    if (!normalizedEntryId) return;

    const entries = Array.isArray(socialPlannerState?.entries) ? socialPlannerState.entries : [];
    const entry = entries.find((item) => item.id === normalizedEntryId);
    if (!entry) {
        setSocialPlannerStatus('Innlegget ble ikke funnet.', 'danger');
        return;
    }

    const editIdInput = document.getElementById('sp-entry-edit-id');
    const titleInput = document.getElementById('sp-entry-title');
    const masterInput = document.getElementById('sp-entry-master-text');
    const statusSelect = document.getElementById('sp-entry-status');
    const scheduledInput = document.getElementById('sp-entry-scheduled-for');
    const linkInput = document.getElementById('sp-entry-link');
    const mediaInput = document.getElementById('sp-entry-media');
    const hashtagsInput = document.getElementById('sp-entry-hashtags');
    const accountSelect = document.getElementById('sp-entry-target-accounts');
    const templateSelect = document.getElementById('sp-entry-template');

    if (editIdInput) editIdInput.value = entry.id;
    if (titleInput) titleInput.value = String(entry.title || '');
    if (masterInput) masterInput.value = String(entry.masterText || '');
    if (statusSelect) {
        const normalizedStatus = String(entry.status || '').trim();
        statusSelect.value = normalizedStatus === 'scheduled' ? 'scheduled' : 'draft';
    }
    syncSocialPlannerScheduleFieldState();
    if (scheduledInput) {
        scheduledInput.value = toLocalDateTimeInputValue(entry.scheduledFor || '');
    }
    if (linkInput) linkInput.value = String(entry.linkUrl || '');
    if (mediaInput) mediaInput.value = String(entry.mediaUrl || '');
    if (hashtagsInput) hashtagsInput.value = Array.isArray(entry.hashtags) ? entry.hashtags.join(' ') : '';
    setSocialPlannerEntryFormVariants(entry.variants || {});
    setMultiSelectValues(accountSelect, Array.isArray(entry.targetAccountIds) ? entry.targetAccountIds : []);
    if (templateSelect) templateSelect.value = '';
    syncSocialPlannerComposerMeta();
    renderSocialPlannerComposerAccountChips();
    renderSocialPlannerEntryPreview();
    renderSocialPlannerComposerMediaPreview();
    syncSocialPlannerTagPillState();
    openSocialPlannerComposer({ reset: false, panel: 'preview' });

    masterInput?.focus();
    setSocialPlannerStatus('Innlegg lastet i skjema for redigering.', 'success');
};

window.publishSocialPlannerEntry = async function (entryId) {
    const normalizedEntryId = String(entryId || '').trim();
    if (!normalizedEntryId) return;

    try {
        setSocialPlannerStatus('Publiserer innlegg...', 'info');
        const payload = await requestSocialPlanner(`/entries/${encodeURIComponent(normalizedEntryId)}/publish`, {
            method: 'POST',
            body: JSON.stringify({})
        }, 'Kunne ikke publisere innlegg.');

        await refreshSocialPlannerState({
            silent: true,
            workspaceId: getSocialPlannerActiveWorkspaceId()
        });

        if (payload?.success) {
            closeSocialPlannerComposer();
            const details = String(payload?.details || '').trim();
            const hasAcceptedOnlySignal = /\baccepted\b/i.test(details) && !/\bok\b|published|publisert/i.test(details);
            const successMessage = details
                ? `Publisering sendt. ${details}`
                : 'Innlegg publisert.';
            setSocialPlannerStatus(successMessage, hasAcceptedOnlySignal ? 'info' : 'success');
            void showAdminNotice(successMessage, {
                title: 'Social Planner',
                confirmText: 'OK',
                variant: hasAcceptedOnlySignal ? 'info' : 'success'
            });
        } else {
            const errorMessage = String(payload?.details || payload?.error || 'Publisering feilet.');
            setSocialPlannerStatus(errorMessage, 'danger');
            void showAdminNotice(errorMessage, {
                title: 'Publisering feilet',
                confirmText: 'OK',
                variant: 'danger'
            });
        }
    } catch (error) {
        console.error('Error publishing social planner entry:', error);
        const errorMessage = normalizeAdminErrorMessage(error, 'Kunne ikke publisere innlegg.');
        setSocialPlannerStatus(errorMessage, 'danger');
        void showAdminNotice(errorMessage, {
            title: 'Publisering feilet',
            confirmText: 'OK',
            variant: 'danger'
        });
    }
};

window.deleteSocialPlannerEntry = async function (entryId) {
    const normalizedEntryId = String(entryId || '').trim();
    if (!normalizedEntryId) return;

    const shouldDelete = await showAdminConfirm(
        'Innlegget fjernes fra social planner-listen.',
        {
            title: 'Slette innlegg?',
            confirmText: 'Slett innlegg',
            cancelText: 'Avbryt',
            variant: 'warning'
        }
    );
    if (!shouldDelete) return;

    const removeEntryFromLocalState = () => {
        if (!socialPlannerState || !Array.isArray(socialPlannerState.entries)) return false;
        const previousLength = socialPlannerState.entries.length;
        socialPlannerState.entries = socialPlannerState.entries.filter(
            (entry) => String(entry?.id || '') !== normalizedEntryId
        );
        if (socialPlannerState.entries.length !== previousLength) {
            renderSocialPlannerEntries();
            return true;
        }
        return false;
    };

    try {
        await requestSocialPlanner(`/entries/${encodeURIComponent(normalizedEntryId)}`, {
            method: 'DELETE'
        }, 'Kunne ikke slette innlegg.');
        removeEntryFromLocalState();

        if (document.getElementById('sp-entry-edit-id')?.value === normalizedEntryId) {
            resetSocialPlannerEntryForm();
        }

        await refreshSocialPlannerState({
            silent: true,
            workspaceId: getSocialPlannerActiveWorkspaceId(),
            retryOnBusy: true
        });
        setSocialPlannerStatus('Innlegg slettet.', 'success');
        void showAdminNotice('Innlegg slettet.', {
            title: 'Social Planner',
            confirmText: 'OK',
            variant: 'success'
        });
    } catch (error) {
        const apiMessage = String(error?.message || '');
        if (/Innlegg finnes ikke/i.test(apiMessage)) {
            removeEntryFromLocalState();
            if (document.getElementById('sp-entry-edit-id')?.value === normalizedEntryId) {
                resetSocialPlannerEntryForm();
            }
            await refreshSocialPlannerState({
                silent: true,
                workspaceId: getSocialPlannerActiveWorkspaceId(),
                retryOnBusy: true
            });
            setSocialPlannerStatus('Innlegg var allerede slettet.', 'info');
            void showAdminNotice('Innlegg var allerede slettet.', {
                title: 'Social Planner',
                confirmText: 'OK',
                variant: 'info'
            });
            return;
        }
        console.error('Error deleting social planner entry:', error);
        setSocialPlannerStatus(
            normalizeAdminErrorMessage(error, 'Kunne ikke slette innlegg.'),
            'danger'
        );
    }
};

window.runSocialPlannerScheduler = async function () {
    try {
        const payload = await requestSocialPlanner('/scheduler/run', {
            method: 'POST',
            body: JSON.stringify({ maxEntries: 10 })
        }, 'Kunne ikke kjøre scheduler.');

        await refreshSocialPlannerState({
            silent: true,
            workspaceId: getSocialPlannerActiveWorkspaceId()
        });

        const scheduler = payload?.scheduler || {};
        const success = !!payload?.success;
        setSocialPlannerStatus(
            `Scheduler: ${scheduler.published || 0} publisert, ${scheduler.failed || 0} feilet.`,
            success ? 'success' : 'danger'
        );
    } catch (error) {
        console.error('Error running social planner scheduler:', error);
        setSocialPlannerStatus(
            normalizeAdminErrorMessage(error, 'Kunne ikke kjøre scheduler.'),
            'danger'
        );
    }
};


function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (window.adminAuthClient) {
                await window.adminAuthClient.auth.signOut();
                window.location.href = ADMIN_LOGIN_PATH;
            }
        });
    }
}

const STYLE_COLOR_FIELD_MAP = {
    'clr-base': '--clr-base',
    'theme-bg': '--theme-bg',
    'clr-common-text': '--clr-common-text',
    'refresh-accent': '--refresh-accent',
    'refresh-accent-soft': '--refresh-accent-soft',
    'refresh-heading': '--refresh-heading',
    'refresh-text': '--refresh-text',
    'refresh-bg': '--refresh-bg'
};

const DEFAULT_STYLE_VARIABLES = {
    '--clr-base': '#6366f1',
    '--theme-bg': '#f8fafc',
    '--clr-common-text': '#0f172a',
    '--refresh-accent': '#ff6a1b',
    '--refresh-accent-soft': '#fff1e7',
    '--refresh-heading': '#11263c',
    '--refresh-text': '#5a697d',
    '--refresh-bg': '#f3f7fb'
};

const DEFAULT_BODY_FONT_FAMILY = "'Manrope', sans-serif";
const DEFAULT_HEADING_FONT_FAMILY = "'Space Grotesk', sans-serif";

function normalizeHexColor(value = '') {
    const match = String(value).trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    if (!match) return '';

    const hex = match[1];
    if (hex.length === 3) {
        return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
    }

    return `#${hex}`.toLowerCase();
}

function extractCssVariables(cssText = '') {
    const variables = {};
    const variablePattern = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;{}]+);/g;
    let match = variablePattern.exec(cssText);
    while (match) {
        variables[match[1].trim()] = match[2].trim();
        match = variablePattern.exec(cssText);
    }
    return variables;
}

async function fetchCssText(url) {
    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) return '';
        return await response.text();
    } catch (error) {
        console.warn(`Could not load CSS from ${url}:`, error);
        return '';
    }
}

function updateColorInputValue(inputId, colorValue) {
    const input = document.getElementById(inputId);
    if (!input || !colorValue) return;

    input.value = colorValue;
    const valueDisplay = input.parentElement?.querySelector('.color-value');
    if (valueDisplay) {
        valueDisplay.textContent = colorValue;
    }
}

async function fetchStyles() {
    try {
        const [baseCssText, customCssText] = await Promise.all([
            fetchCssText('/style.css'),
            fetchCssText('/custom-style.css')
        ]);

        const combinedCssText = `${baseCssText}\n${customCssText}`;
        if (!combinedCssText.trim()) {
            throw new Error('Could not load styles');
        }

        const cssVariables = {
            ...DEFAULT_STYLE_VARIABLES,
            ...extractCssVariables(combinedCssText)
        };

        for (const [inputId, cssVarName] of Object.entries(STYLE_COLOR_FIELD_MAP)) {
            const configuredColor = normalizeHexColor(cssVariables[cssVarName]);
            const fallbackColor = normalizeHexColor(DEFAULT_STYLE_VARIABLES[cssVarName]);
            updateColorInputValue(inputId, configuredColor || fallbackColor);
        }

        const bodyFontValue = String(
            cssVariables['--font-body'] ||
            cssVariables['--font-primary'] ||
            DEFAULT_BODY_FONT_FAMILY
        ).trim();
        const headingFontValue = String(
            cssVariables['--font-heading'] ||
            DEFAULT_HEADING_FONT_FAMILY
        ).trim();

        setFontSelectValue(fontBodySelect, bodyFontValue);
        setFontSelectValue(fontHeadingSelect, headingFontValue);
        updateFontPreview();
    } catch (error) {
        console.error('Error fetching styles:', error);
        updateFontPreview();
    }
}

async function fetchContent() {
    try {
        const response = await fetch(`${API_URL}/content`);
        contentData = await response.json();
    } catch (error) {
        console.error('Error fetching content:', error);
    }
}

function getDashboardBaseContent() {
    return contentData.no || contentData.en || {};
}

function countDashboardSections() {
    const baseContent = getDashboardBaseContent();
    return Object.keys(baseContent).filter((key) => !key.endsWith('_details')).length;
}

function countDashboardServices() {
    const services = getDashboardBaseContent().services || {};
    return Object.keys(services).filter((key) => /^s\d+_title$/.test(key)).length;
}

function renderDashboardOverview() {
    const postCountEl = document.getElementById('dashboard-post-count');
    const sectionCountEl = document.getElementById('dashboard-section-count');
    const serviceCountEl = document.getElementById('dashboard-service-count');
    const languageCountEl = document.getElementById('dashboard-language-count');
    const latestPostEl = document.getElementById('dashboard-latest-post');

    if (postCountEl) {
        postCountEl.textContent = String(blogData.length || 0);
    }

    if (sectionCountEl) {
        sectionCountEl.textContent = String(countDashboardSections());
    }

    if (serviceCountEl) {
        serviceCountEl.textContent = String(countDashboardServices());
    }

    if (languageCountEl) {
        languageCountEl.textContent = String(Object.keys(contentData || {}).length);
    }

    if (latestPostEl) {
        latestPostEl.textContent = blogData[0]?.title || (currentLang === 'en' ? 'No posts yet' : 'Ingen innlegg ennå');
    }
}

function renderContentEditor() {
    const contentEditor = document.getElementById('content-editor');
    if (!contentEditor) return;

    contentEditor.innerHTML = '';
    const sectionData = contentData[currentLang] || contentData.no || contentData.en;

    if (!sectionData || typeof sectionData !== 'object') return;

    // Define Groups
    const groupTranslations = {
        'no': {
            'general': 'Generelt',
            'home': 'Forside',
            'pages': 'Undersider',
            'other': 'Annet'
        },
        'en': {
            'general': 'General',
            'home': 'Home Page',
            'pages': 'Subpages',
            'other': 'Other'
        }
    };

    const t = groupTranslations[currentLang] || groupTranslations['no'];

    const groups = {
        'general': {
            label: t['general'],
            icon: 'fa-globe',
            sections: ['nav', 'footer', 'contact']
        },
        'home': {
            label: t['home'],
            icon: 'fa-home',
            sections: ['hero', 'about', 'skills', 'services', 'projects', 'process', 'testimonial', 'blog', 'meeting', 'awards']
        },
        'pages': {
            label: t['pages'],
            icon: 'fa-file-alt',
            sections: ['project_details', 'blog_details', 'service_details']
        }
    };

    // Create Layout Containers
    const layout = document.createElement('div');
    layout.className = 'content-editor-layout';

    const sidebar = document.createElement('div');
    sidebar.className = 'content-sidebar';

    const main = document.createElement('div');
    main.className = 'content-main';

    // Helper to find which group a section belongs to
    function getGroupKey(secKey) {
        for (const [gKey, gVal] of Object.entries(groups)) {
            if (gVal.sections.includes(secKey)) return gKey;
        }
        return 'other';
    }

    // Identify "Other" sections dynamically
    const allKnownSections = new Set(Object.values(groups).flatMap(g => g.sections));
    const otherSections = Object.keys(sectionData).filter(k => !allKnownSections.has(k));

    if (otherSections.length > 0) {
        groups['other'] = {
            label: t['other'],
            icon: 'fa-cube',
            sections: otherSections
        };
    }

    // Render Sidebar Groups
    let firstGroupKey = null;

    for (const [groupKey, groupConfig] of Object.entries(groups)) {
        // Skip empty groups
        const hasSections = groupConfig.sections.some(s => sectionData[s]);
        if (!hasSections) continue;

        if (!firstGroupKey) firstGroupKey = groupKey;

        const btn = document.createElement('button');
        btn.className = 'content-sidebar-btn';
        btn.dataset.group = groupKey;
        btn.innerHTML = `<i class="fas ${groupConfig.icon}"></i> <span>${groupConfig.label}</span>`;

        btn.onclick = () => {
            document.querySelectorAll('.content-sidebar-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.content-group-view').forEach(v => v.style.display = 'none');
            const view = document.getElementById(`group-view-${groupKey}`);
            if (view) view.style.display = 'block';
        };

        sidebar.appendChild(btn);

        // Create Main View for THIS Group
        const groupView = document.createElement('div');
        groupView.className = 'content-group-view';
        groupView.id = `group-view-${groupKey}`;
        groupView.style.display = 'none';

        // Render sections belonging to this group
        groupConfig.sections.forEach(sectionKey => {
            if (!sectionData[sectionKey]) return;
            const sectionValue = sectionData[sectionKey];
            const tSections = sectionTranslations[currentLang] || sectionTranslations['no'];
            const labelText = tSections[sectionKey] || sectionKey.replace(/_/g, ' ').toUpperCase();

            // Section Container
            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'content-section-block';
            sectionContainer.style.marginBottom = '40px';

            // Header
            const header = document.createElement('div');
            header.className = 'content-section-header';
            const editText = currentLang === 'en' ? 'Edit content for' : 'Rediger innhold for';
            header.innerHTML = `
                <h2>${labelText}</h2>
                <div style="height: 4px; width: 40px; background: var(--primary-color); margin-top: 10px; border-radius: 2px;"></div>
                <p style="color: #64748b; margin-top: 10px;">${editText} ${labelText.toLowerCase()}-${currentLang === 'en' ? 'section' : 'seksjonen'}</p>
            `;
            sectionContainer.appendChild(header);

            // Fields Wrapper
            const contentWrapper = document.createElement('div');

            // Recursive Field Generation Function
            function createFields(obj, prefix) {
                for (const [key, value] of Object.entries(obj)) {
                    if (typeof value === 'object' && value !== null) {
                        const subHeader = document.createElement('h4');
                        subHeader.className = 'sub-section-title';
                        subHeader.innerText = key.replace(/_/g, ' ');
                        subHeader.style.marginTop = '25px';
                        subHeader.style.marginBottom = '15px';
                        subHeader.style.color = '#334155';
                        subHeader.style.fontSize = '16px';
                        subHeader.style.borderBottom = '1px solid #e2e8f0';
                        subHeader.style.paddingBottom = '8px';
                        contentWrapper.appendChild(subHeader);

                        createFields(value, `${prefix}${key}.`);
                    } else {
                        const safeValue = typeof value === 'string' ? value : String(value ?? '');
                        const formGroup = document.createElement('div');
                        formGroup.className = 'form-group';
                        formGroup.style.marginBottom = '15px';

                        const label = document.createElement('label');
                        label.innerText = key.replace(/_/g, ' ');
                        label.style.display = 'block';
                        label.style.marginBottom = '5px';
                        label.style.fontSize = '14px';
                        label.style.fontWeight = '500';
                        label.style.color = '#475569';

                        let input;
                        if (safeValue.length > 80) {
                            input = document.createElement('textarea');
                            input.rows = 4;
                            input.style.width = '100%';
                            input.style.padding = '10px';
                            input.style.border = '1px solid #cbd5e1';
                            input.style.borderRadius = '6px';
                            input.style.resize = 'vertical';
                        } else {
                            input = document.createElement('input');
                            input.type = 'text';
                            input.style.width = '100%';
                            input.style.padding = '10px';
                            input.style.border = '1px solid #cbd5e1';
                            input.style.borderRadius = '6px';
                        }

                        input.value = safeValue;
                        input.dataset.section = sectionKey;
                        const fullKeyPath = prefix ? `${sectionKey}.${prefix}${key}` : `${sectionKey}.${key}`;

                        input.addEventListener('input', (e) => {
                            updateContentData(currentLang, fullKeyPath, e.target.value);
                        });

                        formGroup.appendChild(label);
                        formGroup.appendChild(input);
                        contentWrapper.appendChild(formGroup);
                    }
                }
            }

            createFields(sectionValue, '');
            sectionContainer.appendChild(contentWrapper);
            groupView.appendChild(sectionContainer);
        });

        main.appendChild(groupView);
    }

    layout.appendChild(sidebar);
    layout.appendChild(main);
    contentEditor.appendChild(layout);

    // Initial Active State
    if (firstGroupKey) {
        // Find the button for first group
        const firstBtn = sidebar.querySelector(`button[data-group="${firstGroupKey}"]`);
        if (firstBtn) firstBtn.click();
    }
}

function updateContentData(lang, path, value) {
    const keys = path.split('.');
    let current = contentData[lang];
    for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

// Font Selection Logic
const fontBodySelect = document.getElementById('font-family-select');
const fontHeadingSelect = document.getElementById('font-heading-select');
const fontPreview = document.getElementById('font-preview');

function normalizeFontFamilyValue(value = '') {
    return String(value).trim().replace(/\s+/g, ' ');
}

function setFontSelectValue(selectElement, fontFamily) {
    if (!selectElement || !fontFamily) return;

    const normalizedTarget = normalizeFontFamilyValue(fontFamily);
    const matchingOption = Array.from(selectElement.options).find((option) => {
        return normalizeFontFamilyValue(option.value) === normalizedTarget;
    });

    if (matchingOption) {
        selectElement.value = matchingOption.value;
    }
}

function getSelectedFontData(selectElement) {
    if (!selectElement || selectElement.selectedIndex < 0) {
        return { family: '', url: '' };
    }

    const selectedOption = selectElement.options[selectElement.selectedIndex];
    return {
        family: selectElement.value,
        url: String(selectedOption?.dataset?.url || '').trim()
    };
}

function applyPreviewFontLink(url, linkId) {
    if (!url) return;

    let link = document.getElementById(linkId);
    if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
    link.href = url;
}

function updateFontPreview() {
    const bodyFont = getSelectedFontData(fontBodySelect);
    const headingFont = getSelectedFontData(fontHeadingSelect);

    applyPreviewFontLink(bodyFont.url, 'preview-font-link-body');
    applyPreviewFontLink(headingFont.url, 'preview-font-link-heading');

    if (!fontPreview) return;

    const bodyFamily = bodyFont.family || DEFAULT_BODY_FONT_FAMILY;
    const headingFamily = headingFont.family || DEFAULT_HEADING_FONT_FAMILY;

    const headingPreview = fontPreview.querySelector('h1, h2, h3, h4, h5, h6');
    const bodyPreview = fontPreview.querySelector('p');

    fontPreview.style.fontFamily = bodyFamily;
    if (headingPreview) headingPreview.style.fontFamily = headingFamily;
    if (bodyPreview) bodyPreview.style.fontFamily = bodyFamily;
}

if (fontBodySelect) {
    fontBodySelect.addEventListener('change', updateFontPreview);
}

if (fontHeadingSelect) {
    fontHeadingSelect.addEventListener('change', updateFontPreview);
}

updateFontPreview();

async function saveChanges(event) {
    const saveBtn = event?.currentTarget || document.getElementById('save-btn');
    const t = adminTranslations[currentLang] || adminTranslations['no'];
    const defaultLabel = saveBtn?.dataset?.i18n && t[saveBtn.dataset.i18n]
        ? t[saveBtn.dataset.i18n]
        : (saveBtn?.dataset?.defaultLabel || saveBtn?.innerText || 'Lagre Endringer');

    if (saveBtn) {
        saveBtn.dataset.defaultLabel = defaultLabel;
        saveBtn.innerText = currentLang === 'en' ? 'Saving...' : 'Lagrer...';
        saveBtn.disabled = true;
    }
    try {
        const contentResponse = await fetch(`${API_URL}/content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contentData)
        });
        if (!contentResponse.ok) {
            const apiMessage = await parseApiErrorMessage(contentResponse, `Kunne ikke lagre innhold (${contentResponse.status})`);
            throw new Error(apiMessage);
        }

        const styleData = {};
        for (const [inputId, cssVarName] of Object.entries(STYLE_COLOR_FIELD_MAP)) {
            const inputValue = normalizeHexColor(document.getElementById(inputId)?.value || '');
            if (inputValue) {
                styleData[cssVarName] = inputValue;
            }
        }

        const bodyFontData = getSelectedFontData(fontBodySelect);
        const headingFontData = getSelectedFontData(fontHeadingSelect);
        const selectedFontUrls = [...new Set([
            bodyFontData.url,
            headingFontData.url
        ].filter(Boolean))];

        const fontData = {};
        if (selectedFontUrls.length > 0) {
            fontData.fontUrls = selectedFontUrls;
        }
        if (bodyFontData.family) {
            fontData.fontBodyFamily = bodyFontData.family;
            fontData.fontFamily = bodyFontData.family;
        }
        if (headingFontData.family) {
            fontData.fontHeadingFamily = headingFontData.family;
        }

        if (Object.keys(styleData).length > 0 || Object.keys(fontData).length > 0) {
            const styleResponse = await fetch(`${API_URL}/style`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cssVariables: styleData,
                    ...fontData
                })
            });
            if (!styleResponse.ok) {
                const apiMessage = await parseApiErrorMessage(styleResponse, `Kunne ikke lagre design (${styleResponse.status})`);
                throw new Error(apiMessage);
            }
        }
        await showAdminNotice('Design- og innholdsinnstillingene er lagret.', {
            title: 'Endringer lagret',
            variant: 'success'
        });
    } catch (error) {
        console.error('Error saving:', error);
        await showAdminNotice(
            normalizeAdminErrorMessage(error, 'Det oppstod en feil ved lagring.'),
            {
                title: 'Lagring feilet',
                variant: 'danger'
            }
        );
    } finally {
        if (saveBtn) {
            saveBtn.innerText = saveBtn.dataset.defaultLabel || 'Lagre Endringer';
            saveBtn.disabled = false;
        }
    }
}

// ========== HEADER NAVIGATION ==========
const breadcrumbConfig = {
    'no': {
        'home': ['Hjem'],
        'blog': ['Blogg'],
        'content': ['Sideinnhold'],
        'style': ['Design'],
        'seo': ['SEO'],
        'media': ['Media'],
        'social-planner': ['Social Planner']
    },
    'en': {
        'home': ['Home'],
        'blog': ['Blog'],
        'content': ['Site Content'],
        'style': ['Design'],
        'seo': ['SEO'],
        'media': ['Media'],
        'social-planner': ['Social Planner']
    }
};

function updateBreadcrumb(section) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;

    const localizedBreadcrumbs = breadcrumbConfig[currentLang] || breadcrumbConfig.no;
    const items = localizedBreadcrumbs[section] || localizedBreadcrumbs.home;
    const activeItem = items[items.length - 1] || localizedBreadcrumbs.home[0];
    breadcrumb.innerHTML = `<span class="breadcrumb-item active">${activeItem}</span>`;
}

function updateHeaderActions(section) {
    const actionsContainer = document.getElementById('header-actions');
    if (!actionsContainer) return;

    actionsContainer.innerHTML = '';

    if (section === 'blog') {
        // Button moved to content area
    } else if (section === 'social-planner') {
        actionsContainer.innerHTML = `
            <button class="header-action-btn" type="button" onclick="refreshSocialPlanner()">
                <i class="fas fa-rotate"></i> Oppdater
            </button>
            <button class="header-action-btn primary" type="button" onclick="runSocialPlannerScheduler()">
                <i class="fas fa-play"></i> Kjør scheduler
            </button>
        `;
    }
}

function syncAdminScrollMode(section = '') {
    const normalizedSection = String(section || '').trim().toLowerCase();
    const activeSection = normalizedSection || String(document.querySelector('.nav-btn.active[data-tab]')?.dataset.tab || '').trim().toLowerCase();
    const singleScrollMode = activeSection === 'social-planner';
    document.body.classList.toggle('social-planner-single-scroll', singleScrollMode);
}

function setSocialPlannerRailOpen(open = false) {
    const modal = document.getElementById('sp-rail-modal');
    const button = document.getElementById('sp-rail-toggle-btn');
    const isOpen = !!open;

    if (modal) {
        modal.hidden = !isOpen;
        modal.classList.toggle('is-open', isOpen);
    }

    if (button) {
        button.setAttribute('aria-expanded', String(isOpen));
        button.setAttribute('aria-label', isOpen ? 'Lukk kontrollpanel' : 'Åpne kontrollpanel');
        button.setAttribute('title', isOpen ? 'Lukk kontrollpanel' : 'Åpne kontrollpanel');
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-angles-left', 'fa-angles-right');
            icon.classList.add('fa-gear');
        }
    }
}

window.toggleSocialPlannerRail = function (forceOpen = null) {
    const modal = document.getElementById('sp-rail-modal');
    if (!modal) return;
    const currentlyOpen = modal.classList.contains('is-open');
    const nextOpen = typeof forceOpen === 'boolean'
        ? forceOpen
        : !currentlyOpen;
    setSocialPlannerRailOpen(nextOpen);
};

let adminSidebarResizeBound = false;

function isAdminMobileViewport() {
    return window.matchMedia(`(max-width: ${ADMIN_MOBILE_BREAKPOINT}px)`).matches;
}

function getAdminSidebarCollapsedFromStorage() {
    try {
        return window.localStorage.getItem(ADMIN_SIDEBAR_COLLAPSE_KEY) === '1';
    } catch (error) {
        return false;
    }
}

function setAdminSidebarCollapsedInStorage(collapsed) {
    try {
        window.localStorage.setItem(ADMIN_SIDEBAR_COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch (error) {
        // Ignore storage write errors (e.g. private mode restrictions)
    }
}

function updateAdminSidebarToggleButton(collapsed) {
    const controls = [
        {
            id: 'sidebar-toggle-btn',
            collapsedIcon: 'fa-bars',
            expandedIcon: 'fa-xmark'
        },
        {
            id: 'sidebar-inline-toggle-btn',
            collapsedIcon: 'fa-angle-right',
            expandedIcon: 'fa-angle-left'
        }
    ];

    controls.forEach((control) => {
        const button = document.getElementById(control.id);
        if (!button) return;

        button.classList.toggle('is-collapsed', !!collapsed);
        button.setAttribute('aria-expanded', String(!collapsed));
        button.setAttribute('title', collapsed ? 'Vis meny' : 'Skjul meny');
        button.setAttribute('aria-label', collapsed ? 'Vis meny' : 'Skjul meny');

        const icon = button.querySelector('i');
        if (!icon) return;
        icon.classList.remove('fa-bars', 'fa-xmark', 'fa-angle-left', 'fa-angle-right', 'fa-angles-left', 'fa-angles-right');
        icon.classList.add(collapsed ? control.collapsedIcon : control.expandedIcon);
    });
}

function setAdminSidebarCollapsed(collapsed, persist = true) {
    const normalizedCollapsed = !!collapsed;
    const mobileViewport = isAdminMobileViewport();
    document.body.classList.toggle('admin-sidebar-collapsed', normalizedCollapsed);
    document.body.classList.toggle('admin-mobile-menu-open', mobileViewport && !normalizedCollapsed);
    updateAdminSidebarToggleButton(normalizedCollapsed);
    if (persist && !mobileViewport) {
        setAdminSidebarCollapsedInStorage(normalizedCollapsed);
    }
}

function applyAdminSidebarViewportState() {
    if (isAdminMobileViewport()) {
        setAdminSidebarCollapsed(true, false);
        return;
    }
    const collapsed = getAdminSidebarCollapsedFromStorage();
    setAdminSidebarCollapsed(collapsed, false);
}

function setupAdminSidebarToggle() {
    const toggleControls = Array.from(document.querySelectorAll('[data-admin-sidebar-toggle]'));
    if (!toggleControls.length) return;

    applyAdminSidebarViewportState();

    toggleControls.forEach((control) => {
        control.addEventListener('click', (event) => {
            event.preventDefault();
            const action = String(control.dataset.adminSidebarToggle || 'toggle').trim().toLowerCase();
            const currentlyCollapsed = document.body.classList.contains('admin-sidebar-collapsed');
            const nextCollapsed = action === 'open'
                ? false
                : action === 'close'
                    ? true
                    : !currentlyCollapsed;
            setAdminSidebarCollapsed(nextCollapsed, !isAdminMobileViewport());
        });
    });

    if (!adminSidebarResizeBound) {
        window.addEventListener('resize', applyAdminSidebarViewportState);
        adminSidebarResizeBound = true;
    }
}

window.toggleAdminSidebar = function (forceCollapsed = null) {
    const currentCollapsed = document.body.classList.contains('admin-sidebar-collapsed');
    const nextCollapsed = typeof forceCollapsed === 'boolean'
        ? forceCollapsed
        : !currentCollapsed;
    setAdminSidebarCollapsed(nextCollapsed, !isAdminMobileViewport());
};

function setupEventListeners() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            const headerLangBtns = document.querySelectorAll('.lang-btn-header');
            headerLangBtns.forEach(b => {
                b.classList.toggle('active', b.dataset.lang === currentLang);
            });
            updateDashboardLanguage();
            renderContentEditor();
            renderDashboardOverview();
        });
    });

    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.tab) {
                const section = btn.dataset.tab;
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));
                const targetTab = document.getElementById(`${section}-tab`);
                if (targetTab) targetTab.classList.add('active');
                updateBreadcrumb(section);
                updateHeaderActions(section);
                syncAdminScrollMode(section);
                if (section === 'social-planner') {
                    refreshSocialPlannerState({ silent: socialPlannerLoaded }).catch((error) => {
                        console.error('Error loading social planner tab:', error);
                    });
                } else {
                    setSocialPlannerRailOpen(false);
                }

                if (isAdminMobileViewport()) {
                    setAdminSidebarCollapsed(true, false);
                }
            }
        });
    });

    // Color Inputs
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        const wrapper = input.parentElement;
        const valueDisplay = wrapper.querySelector('.color-value');
        if (valueDisplay) {
            input.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
            });
        }
    });

    // Save Buttons
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveChanges);

    const saveStyleBtn = document.getElementById('save-style-btn');
    if (saveStyleBtn) saveStyleBtn.addEventListener('click', saveChanges);

    const saveSeoBtn = document.getElementById('save-seo-btn');
    if (saveSeoBtn) saveSeoBtn.addEventListener('click', saveSeo);

    const plannerStatusSelect = document.getElementById('sp-entry-status');
    if (plannerStatusSelect) {
        plannerStatusSelect.addEventListener('change', () => {
            syncSocialPlannerScheduleFieldState();
            renderSocialPlannerEntryPreview();
        });
    }

    const plannerAccountsSelect = document.getElementById('sp-entry-target-accounts');
    if (plannerAccountsSelect) {
        plannerAccountsSelect.addEventListener('change', () => {
            renderSocialPlannerComposerAccountChips();
            renderSocialPlannerEntryPreview();
        });
    }

    const plannerPreviewInputs = [
        'sp-entry-title',
        'sp-entry-master-text',
        'sp-entry-link',
        'sp-entry-media',
        'sp-entry-hashtags',
        'sp-entry-variant-facebook',
        'sp-entry-variant-instagram',
        'sp-entry-variant-linkedin',
        'sp-entry-variant-x',
        'sp-entry-variant-tiktok'
    ];

    plannerPreviewInputs.forEach((inputId) => {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.addEventListener('input', () => {
            renderSocialPlannerEntryPreview();
            if (inputId === 'sp-entry-media') {
                renderSocialPlannerComposerMediaPreview();
            }
            if (inputId === 'sp-entry-hashtags') {
                syncSocialPlannerTagPillState();
            }
        });
    });
    renderSocialPlannerComposerMediaPreview();
    syncSocialPlannerTagPillState();

    const composerAdvancedSection = getSocialPlannerComposerAdvancedSection();
    if (composerAdvancedSection) {
        composerAdvancedSection.addEventListener('toggle', () => {
            syncSocialPlannerTagPillState();
        });
    }

    const assistantPromptInput = document.getElementById('sp-assistant-prompt');
    if (assistantPromptInput) {
        assistantPromptInput.addEventListener('keydown', (event) => {
            const isShortcut = (event.metaKey || event.ctrlKey) && event.key === 'Enter';
            if (!isShortcut) return;
            event.preventDefault();
            runSocialPlannerAssistant('write');
        });
    }

    const plannerFilterTabs = document.querySelectorAll('#sp-status-tabs .social-planner-tab-btn');
    plannerFilterTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            window.setSocialPlannerEntryFilter(tab.dataset.filter || 'queue');
        });
    });

    const plannerViewButtons = document.querySelectorAll('#sp-view-mode-toggle .social-planner-view-btn');
    plannerViewButtons.forEach((button) => {
        button.addEventListener('click', () => {
            socialPlannerStreamViewMode = normalizeSocialPlannerStreamViewMode(button.dataset.view);
            renderSocialPlannerEntries();
        });
    });

    const plannerSearchInput = document.getElementById('sp-entry-search');
    if (plannerSearchInput) {
        plannerSearchInput.addEventListener('input', () => {
            socialPlannerEntrySearch = String(plannerSearchInput.value || '').trim();
            renderSocialPlannerEntries();
        });
    }

    const plannerChannelFilter = document.getElementById('sp-stream-channel-filter');
    if (plannerChannelFilter) {
        plannerChannelFilter.addEventListener('change', () => {
            socialPlannerChannelFilter = normalizeSocialPlannerChannelFilter(plannerChannelFilter.value || 'all');
            renderSocialPlannerEntries();
        });
    }

    const plannerTagFilter = document.getElementById('sp-stream-tag-filter');
    if (plannerTagFilter) {
        plannerTagFilter.addEventListener('change', () => {
            socialPlannerTagFilter = normalizeSocialPlannerTagFilter(plannerTagFilter.value || 'all');
            renderSocialPlannerEntries();
        });
    }

    const plannerTimezoneFilter = document.getElementById('sp-stream-timezone-filter');
    if (plannerTimezoneFilter) {
        plannerTimezoneFilter.addEventListener('change', () => {
            const nextTimezone = String(plannerTimezoneFilter.value || '').trim();
            socialPlannerDisplayTimezone = isValidSocialPlannerTimezone(nextTimezone)
                ? nextTimezone
                : getSocialPlannerDefaultTimezone();
            renderSocialPlannerEntries();
        });
    }

    const socialPlannerRailToggleButton = document.getElementById('sp-rail-toggle-btn');
    if (socialPlannerRailToggleButton) {
        socialPlannerRailToggleButton.addEventListener('click', () => {
            window.toggleSocialPlannerRail();
        });
    }
    setSocialPlannerRailOpen(false);

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const railModal = document.getElementById('sp-rail-modal');
        if (railModal?.classList.contains('is-open')) {
            window.toggleSocialPlannerRail(false);
            return;
        }
        const modal = document.getElementById('sp-compose-modal');
        if (modal?.classList.contains('is-open')) {
            closeSocialPlannerComposer();
        }
    });

    if (quill?.root) {
        quill.root.addEventListener('mousedown', (event) => {
            const cell = event.target?.closest?.(TABLE_CELL_SELECTOR);
            if (!cell) return;

            event.preventDefault();
            event.stopPropagation();
            openTableCellEditor(cell);
        }, true);

        window.addEventListener('resize', () => {
            if (activeTableEditorCell) {
                positionTableEditorInput(activeTableEditorCell);
            }
        });

        document.addEventListener('scroll', () => {
            if (activeTableEditorCell) {
                positionTableEditorInput(activeTableEditorCell);
            }
        }, true);
    }
}


// --- Blog Management ---
let currentEditingId = null;
let selectedImageUrl = null;
let selectedUploadFile = null;
const UNSPLASH_RESULTS_PER_PAGE = 24;
const AI_MAX_CONTEXT_FILES = 6;
const AI_MAX_CONTEXT_FILE_SIZE = 12 * 1024 * 1024;
const POST_MAX_CATEGORIES = 6;
const POST_MAX_TAGS = 20;
const POST_MAX_RELATED = 3;
let unsplashSearchState = {
    query: '',
    page: 0,
    total: 0,
    inFlight: false
};
let currentPostCategories = ['Generelt'];
let currentPostTags = [];
let currentRelatedPostIds = [];
let aiContextFiles = [];
let aiGenerationInFlight = false;
let aiSeoInFlight = false;
let aiTranslateInFlight = false;
const aiEnrichmentInFlight = new Map();
const IMAGE_PICKER_TARGET_EDITOR = 'editor';
const IMAGE_PICKER_TARGET_FEATURED = 'featured';
const IMAGE_PICKER_TARGET_SOCIAL_PLANNER = 'social-planner';
let imagePickerTarget = IMAGE_PICKER_TARGET_EDITOR;

function sanitizeStorageFileName(fileName = 'image') {
    return String(fileName)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'image';
}

function normalizeStorageFolderName(folder = 'media') {
    const normalized = String(folder || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9/_-]+/g, '-')
        .replace(/\/+/g, '/')
        .replace(/^\/|\/$/g, '');
    return normalized || 'media';
}

function isFirebaseStorageUnauthorizedError(error) {
    const code = String(error?.code || '').toLowerCase();
    const message = String(error?.message || error || '').toLowerCase();
    return code.includes('unauthorized')
        || message.includes('storage/unauthorized')
        || (message.includes('permission') && message.includes('storage'));
}

async function uploadFileViaAdminApi(file, folder = 'media') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', normalizeStorageFolderName(folder));

    const response = await fetch(`${API_URL}/admin/storage/upload`, {
        method: 'POST',
        body: formData
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload?.details || payload?.error || `Server upload failed (${response.status})`);
    }

    if (!payload?.publicUrl) {
        throw new Error('Server returnerte ikke en gyldig bilde-URL.');
    }

    return payload.publicUrl;
}

async function uploadFileToFirebaseStorage(file, folder = 'media') {
    if (!file) {
        throw new Error('Ingen fil valgt.');
    }

    const normalizedFolder = normalizeStorageFolderName(folder);
    const safeName = sanitizeStorageFileName(file.name || 'image');
    const filePath = `${normalizedFolder}/${Date.now()}-${safeName}`;

    if (!window.adminAuthClient?.storage) {
        return uploadFileViaAdminApi(file, normalizedFolder);
    }

    const { data, error: uploadError } = await window.adminAuthClient.storage
        .from('uploads')
        .upload(filePath, file);

    if (uploadError) {
        if (isFirebaseStorageUnauthorizedError(uploadError)) {
            return uploadFileViaAdminApi(file, normalizedFolder);
        }
        throw uploadError;
    }

    if (data?.publicUrl) {
        return data.publicUrl;
    }

    const { data: publicData, error: publicUrlError } = await window.adminAuthClient.storage
        .from('uploads')
        .getPublicUrl(filePath);

    if (publicUrlError) {
        if (isFirebaseStorageUnauthorizedError(publicUrlError)) {
            return uploadFileViaAdminApi(file, normalizedFolder);
        }
        throw publicUrlError;
    }

    return publicData.publicUrl;
}

function insertImageIntoEditor(imageUrl) {
    if (!imageUrl || !quill) return;

    const range = quill.getSelection(true);
    const insertIndex = range ? range.index : quill.getLength();
    quill.insertEmbed(insertIndex, 'image', imageUrl, Quill.sources.USER);
    quill.setSelection(insertIndex + 1, Quill.sources.SILENT);
}

function renderFeaturedImagePreview(imageUrl = '') {
    const previewArea = document.getElementById('post-featured-image-area');
    const placeholder = document.getElementById('post-featured-image-placeholder');
    if (!previewArea || !placeholder) return;

    const normalizedUrl = String(imageUrl || '').trim();
    const hasCustomImage = normalizedUrl && !/img\/blog\/bblog1\.png$/i.test(normalizedUrl);

    if (!hasCustomImage) {
        previewArea.classList.remove('has-image');
        placeholder.innerHTML = '<i class="fas fa-plus"></i>';
        return;
    }

    previewArea.classList.add('has-image');
    placeholder.innerHTML = `
        <img src="${escapeHtmlForUi(normalizedUrl)}" alt="Forsidebilde">
        <span class="featured-image-overlay">Bytt bilde</span>
    `;
}

function updatePostImageField(imageUrl, options = {}) {
    const postImageInput = document.getElementById('post-image');
    if (!postImageInput || !imageUrl) return;
    const { force = false } = options;

    if (force || !postImageInput.value || /img\/blog\/bblog1\.png$/i.test(postImageInput.value)) {
        postImageInput.value = imageUrl;
    }

    renderFeaturedImagePreview(postImageInput.value);
}

function renderMediaLibraryItem(imageUrl, label = 'Nytt bilde') {
    const mediaGrid = document.querySelector('.media-grid');
    if (!mediaGrid || !imageUrl) return;

    const item = document.createElement('div');
    item.className = 'media-item-card';

    const thumb = document.createElement('div');
    thumb.className = 'media-item-thumb';
    thumb.innerHTML = `<img src="${imageUrl}" alt="${label}">`;

    const meta = document.createElement('div');
    meta.className = 'media-item-meta';

    const name = document.createElement('strong');
    name.textContent = label;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Åpne bilde';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'media-copy-btn';
    copyBtn.textContent = 'Kopier lenke';
    copyBtn.addEventListener('click', async () => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(imageUrl);
                await showAdminNotice('Bildelenken er kopiert til utklippstavlen.', {
                    title: 'Lenke kopiert',
                    variant: 'success'
                });
            } else {
                throw new Error('Clipboard API unavailable');
            }
        } catch (error) {
            await showAdminNotice('Kunne ikke kopiere lenken automatisk. Åpne bildet og kopier adressen manuelt.', {
                title: 'Kopiering feilet',
                variant: 'warning'
            });
        }
    });

    meta.appendChild(name);
    meta.appendChild(link);
    meta.appendChild(copyBtn);

    item.appendChild(thumb);
    item.appendChild(meta);
    mediaGrid.prepend(item);
}

async function fetchBlogPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`);
        blogData = await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function renderBlogList() {
    const listContainer = document.getElementById('blog-list');
    if (!listContainer) return;
    if (!Array.isArray(blogData)) {
        blogData = [];
    }
    listContainer.innerHTML = '';

    blogData.forEach((post, index) => {
        const item = document.createElement('div');
        item.className = 'blog-item';

        item.innerHTML = `
            <div class="blog-title">${post.title}</div>
            <div class="blog-meta">${post.date}</div>
            <div class="blog-meta">${post.author || 'Admin'}</div>
            <div style="text-align: right;">
                <button onclick="openEditModal(${index})" class="action-btn" title="Rediger"><i class="fas fa-edit"></i></button>
                <button onclick="deletePost(${index})" class="action-btn delete" title="Slett"><i class="fas fa-trash"></i></button>
            </div>
        `;
        listContainer.appendChild(item);
    });

    renderDashboardOverview();
}

// View Switching Logic
const dashboardContainer = document.getElementById('dashboard-container');
const editorContainerWrapper = document.getElementById('editor-container-wrapper');

function openModal() {
    dashboardContainer.style.display = 'none';
    editorContainerWrapper.style.display = 'flex';
    renderPostTaxonomyEditors();
    syncRelatedPostsUi();
    renderFeaturedImagePreview(document.getElementById('post-image')?.value || '');
    switchSettingsTab('generelt');
    resetAiAssistantState({ clearPrompt: true });
}

function resetPostEditorForNewPost() {
    currentEditingId = null;

    const defaultAuthor = currentUser?.user_metadata?.full_name || 'Admin';
    const dateInput = document.getElementById('post-date');
    const excerptInput = document.getElementById('post-excerpt');
    const detailSummaryInput = document.getElementById('post-detail-summary');
    const detailOutlineInput = document.getElementById('post-detail-outline');
    const relatedPicker = document.getElementById('related-posts-picker');

    document.getElementById('post-title').value = '';
    document.getElementById('post-author').value = defaultAuthor;
    if (dateInput) dateInput.value = getTodayIsoDate();
    document.getElementById('post-image').value = 'img/blog/bblog1.png';
    if (excerptInput) excerptInput.value = '';
    document.getElementById('post-seo-title').value = '';
    document.getElementById('post-seo-desc').value = '';
    document.getElementById('post-seo-keywords').value = '';
    if (detailSummaryInput) detailSummaryInput.value = '';
    if (detailOutlineInput) detailOutlineInput.value = '';

    setCurrentTaxonomyState({ category: 'Generelt', categories: ['Generelt'], tags: [] });
    setCurrentGeneralSettingsState({
        relatedPostIds: [],
        showFeaturedImage: true,
        isFeatured: false,
        allowComments: true
    });
    renderPostTaxonomyEditors();
    syncRelatedPostsUi();
    if (relatedPicker) relatedPicker.style.display = 'none';
    applyEnglishValuesToForm({});
    if (typeof window.switchTranslateTab === 'function') {
        window.switchTranslateTab('no');
    }
    if (quill) quill.setText('');
    renderFeaturedImagePreview(document.getElementById('post-image')?.value || '');
}

window.startNewPost = function () {
    resetPostEditorForNewPost();
    openModal();
};

function closeModal() {
    editorContainerWrapper.style.display = 'none';
    dashboardContainer.style.display = 'flex';
    currentEditingId = null;
    currentPostCategories = ['Generelt'];
    currentPostTags = [];
    currentRelatedPostIds = [];
    syncTaxonomyCounters();
    syncRelatedPostsUi();
    const relatedPicker = document.getElementById('related-posts-picker');
    if (relatedPicker) relatedPicker.style.display = 'none';
    resetAiAssistantState({ clearPrompt: true });
}

window.closeEditor = closeModal; // Alias

function formatFileSize(bytes = 0) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isSupportedAiContextFile(file) {
    if (!file) return false;
    const mime = String(file.type || '').toLowerCase();
    const ext = String(file.name || '').toLowerCase().split('.').pop();

    if (mime.startsWith('image/')) return true;
    if (mime === 'application/pdf') return true;
    if (mime === 'text/plain' || mime === 'text/markdown') return true;
    if (['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'txt', 'md'].includes(ext)) return true;

    return false;
}

function renderAiContextFileList() {
    const listContainer = document.getElementById('ai-context-file-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    aiContextFiles.forEach((file, index) => {
        const chip = document.createElement('div');
        chip.className = 'ai-context-file-chip';

        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = `${file.name} (${formatFileSize(file.size)})`;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.title = 'Fjern vedlegg';
        removeBtn.setAttribute('aria-label', `Fjern ${file.name}`);
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => window.removeAiContextFile(index));

        chip.appendChild(name);
        chip.appendChild(removeBtn);
        listContainer.appendChild(chip);
    });
}

function resetAiAssistantState(options = {}) {
    const { clearPrompt = false } = options;

    aiContextFiles = [];
    aiGenerationInFlight = false;
    aiSeoInFlight = false;
    renderAiContextFileList();

    const fileInput = document.getElementById('ai-context-files');
    if (fileInput) fileInput.value = '';

    if (clearPrompt) {
        const promptInput = document.getElementById('ai-prompt-input');
        if (promptInput) promptInput.value = '';

        const toneSelect = document.getElementById('ai-tone-select');
        if (toneSelect) toneSelect.value = 'professional';

        const lengthSelect = document.getElementById('ai-length-select');
        if (lengthSelect) lengthSelect.value = 'medium';

        const includeDraft = document.getElementById('ai-include-draft');
        if (includeDraft) includeDraft.checked = true;
    }
}

window.removeAiContextFile = function (index) {
    if (index < 0 || index >= aiContextFiles.length) return;
    aiContextFiles.splice(index, 1);
    renderAiContextFileList();
};

async function addAiContextFiles(fileList) {
    const incomingFiles = Array.from(fileList || []);
    if (!incomingFiles.length) return;

    const rejectedFiles = [];
    let skippedByLimit = 0;

    incomingFiles.forEach((file) => {
        if (!isSupportedAiContextFile(file)) {
            rejectedFiles.push(`${file.name} (kun bilde/PDF/TXT/MD)`);
            return;
        }

        if (file.size > AI_MAX_CONTEXT_FILE_SIZE) {
            rejectedFiles.push(`${file.name} (maks ${Math.round(AI_MAX_CONTEXT_FILE_SIZE / (1024 * 1024))}MB)`);
            return;
        }

        const duplicate = aiContextFiles.some((existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified
        );

        if (duplicate) return;

        if (aiContextFiles.length >= AI_MAX_CONTEXT_FILES) {
            skippedByLimit += 1;
            return;
        }

        aiContextFiles.push(file);
    });

    renderAiContextFileList();

    if (rejectedFiles.length > 0) {
        await showAdminNotice(`Noen vedlegg ble avvist:\n${rejectedFiles.join('\n')}`, {
            title: 'Ugyldige vedlegg',
            variant: 'warning'
        });
    }

    if (skippedByLimit > 0) {
        await showAdminNotice(`Du kan legge ved maks ${AI_MAX_CONTEXT_FILES} filer per generering.`, {
            title: 'Vedleggsgrense nådd',
            variant: 'warning'
        });
    }
}

window.generateBlogDraftWithAi = async function () {
    if (aiGenerationInFlight) return;

    const promptInput = document.getElementById('ai-prompt-input');
    const toneSelect = document.getElementById('ai-tone-select');
    const lengthSelect = document.getElementById('ai-length-select');
    const includeDraftCheckbox = document.getElementById('ai-include-draft');
    const generateBtn = document.getElementById('ai-generate-btn');

    const topic = String(promptInput?.value || '').trim();
    const tone = String(toneSelect?.value || 'professional');
    const length = String(lengthSelect?.value || 'medium');
    const includeDraft = Boolean(includeDraftCheckbox?.checked);
    const existingDraft = includeDraft ? getEditorHtmlContent().trim() : '';

    if (!topic && !existingDraft && aiContextFiles.length === 0) {
        await showAdminNotice('Skriv en prompt, legg ved filer, eller bruk eksisterende utkast som kontekst.', {
            title: 'Mangler input',
            variant: 'warning'
        });
        return;
    }

    const originalBtnContent = generateBtn ? generateBtn.innerHTML : '';
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Genererer...';
    }
    aiGenerationInFlight = true;

    try {
        const formData = new FormData();
        if (topic) formData.append('topic', topic);
        formData.append('tone', tone);
        formData.append('length', length);
        if (existingDraft) formData.append('existingDraft', existingDraft);
        aiContextFiles.forEach((file) => {
            formData.append('contextFiles', file, file.name);
        });

        const response = await fetch(`${API_URL}/generate-content`, {
            method: 'POST',
            body: formData
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload?.details || payload?.error || `AI-feil (${response.status})`);
        }

        const generatedContent = String(payload?.content || '').trim();
        if (!generatedContent) {
            throw new Error('Gemini returnerte tom tekst.');
        }

        if (quill) {
            setEditorHtmlContent(generatedContent);
            quill.focus();
            const endPos = Math.max(0, (quill.getLength?.() || 1) - 1);
            quill.setSelection(endPos, 0, Quill.sources.SILENT);
        }

        const excerptInput = document.getElementById('post-excerpt');
        if (excerptInput && !String(excerptInput.value || '').trim()) {
            const tempNode = document.createElement('div');
            tempNode.innerHTML = generatedContent;
            const plainText = String(tempNode.textContent || '').replace(/\s+/g, ' ').trim();
            if (plainText) {
                excerptInput.value = plainText.slice(0, 220);
            }
        }

        await showAdminNotice('Utkast er generert og satt inn i editoren.', {
            title: 'Gemini ferdig',
            variant: 'success'
        });
    } catch (error) {
        console.error('Error generating AI draft:', error);
        await showAdminNotice(
            normalizeAdminErrorMessage(error, 'Det oppstod en feil ved generering med Gemini.'),
            {
                title: 'AI-generering feilet',
                variant: 'danger'
            }
        );
    } finally {
        aiGenerationInFlight = false;
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalBtnContent;
        }
    }
};

// Insert Tools
window.insertDivider = function () {
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, 'divider', true, Quill.sources.USER);
    quill.setSelection(range.index + 1, Quill.sources.SILENT);
}

window.insertExpandableList = function () {
    const title = prompt('Liste Tittel:');
    if (title) {
        const range = quill.getSelection(true);
        const html = `
            <details style="margin: 10px 0; border: 1px solid #ddd; padding: 10px; border-radius: 6px;">
                <summary style="font-weight: 600; cursor: pointer;">${title}</summary>
                <p>Liste innhold her...</p>
            </details>
            <p><br></p>
        `;
        const delta = quill.clipboard.convert(html);
        quill.updateContents(new Delta().retain(range.index).concat(delta), Quill.sources.USER);
    }
}

window.insertHtml = function () {
    const code = prompt('Lim inn HTML kode:');
    if (code) {
        const range = quill.getSelection(true);
        const delta = quill.clipboard.convert(code);
        quill.updateContents(new Delta().retain(range.index).concat(delta), Quill.sources.USER);
    }
}

window.insertFile = function () {
    const text = prompt('Filnavn:');
    const url = prompt('Fil URL:');
    if (text && url) {
        const range = quill.getSelection(true);
        quill.insertText(range.index, `📄 ${text}`, 'link', url);
    }
}

window.insertSocial = function () {
    const url = prompt('Lim inn Embed URL:');
    if (url) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'video', url);
    }
}

window.insertButton = function () {
    const text = prompt('Knappetekst:');
    const url = prompt('Knappe URL:');
    if (text && url) {
        const range = quill.getSelection(true);
        quill.insertText(range.index, text, { 'link': url, 'bold': true });
    }
}

window.insertGallery = function () {
    const count = prompt('Hvor mange bilder? (f.eks. 3)');
    if (count) {
        const range = quill.getSelection(true);
        // Simple placeholder
        let html = `<div class="gallery-placeholder" style="display: flex; gap: 10px; overflow-x: auto; padding: 10px;">`;
        for (let i = 0; i < count; i++) {
            html += `<img src="https://via.placeholder.com/150" style="height: 150px; border-radius: 8px;">`;
        }
        html += `</div><p><br></p>`;
        const delta = quill.clipboard.convert(html);
        quill.updateContents(new Delta().retain(range.index).concat(delta), Quill.sources.USER);
    }
}

window.insertTable = function () {
    if (!quill) return;

    const rowsInput = prompt('Antall rader:', '3');
    if (rowsInput === null) return;

    const colsInput = prompt('Antall kolonner:', '3');
    if (colsInput === null) return;

    const rows = parseTableDimension(rowsInput, 3);
    const cols = parseTableDimension(colsInput, 3);
    const range = quill.getSelection(true);
    const insertIndex = range ? range.index : quill.getLength();

    quill.insertEmbed(insertIndex, 'tableEmbed', buildBlogTableHtml(rows, cols), Quill.sources.USER);
    quill.setSelection(insertIndex + 1, 0, Quill.sources.SILENT);
};

window.insertAlert = function (type) {
    if (!quill) return;
    const icons = { info: '💡', tip: '✨', warning: '⚠️', danger: '🚨' };
    const labels = { info: 'Info', tip: 'Tips', warning: 'Advarsel', danger: 'Viktig' };
    const range = quill.getSelection(true);
    const text = `${icons[type]} ${labels[type]}: Skriv din melding her...`;
    quill.insertText(range.index, '\n', Quill.sources.USER);
    quill.formatLine(range.index + 1, 1, 'alert', type, Quill.sources.USER);
    quill.insertText(range.index + 1, text, Quill.sources.USER);
    quill.insertText(range.index + 1 + text.length, '\n', Quill.sources.USER);
    quill.setSelection(range.index + 1, text.length);
};

window.insertVideo = function () {
    const url = prompt('Lim inn YouTube eller Vimeo URL:');
    if (!url) return;
    if (quill) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'video', url, Quill.sources.USER);
        quill.setSelection(range.index + 1);
    }
};


// Image Picker Integration
function setImagePickerActiveTab(tab = 'upload') {
    const normalizedTab = String(tab || '').trim().toLowerCase() === 'unsplash' ? 'unsplash' : 'upload';
    const tabBtns = document.querySelectorAll('.image-picker-tabs .tab-btn');
    tabBtns.forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === normalizedTab);
    });

    const tabPanels = document.querySelectorAll('.picker-tab');
    tabPanels.forEach((panel) => {
        const panelId = `${normalizedTab}-tab`;
        panel.classList.toggle('active', panel.id === panelId);
    });
}

window.openImagePicker = function (target = IMAGE_PICKER_TARGET_EDITOR, options = {}) {
    const normalizedTarget = String(target || '').trim().toLowerCase();
    if (normalizedTarget === IMAGE_PICKER_TARGET_FEATURED) {
        imagePickerTarget = IMAGE_PICKER_TARGET_FEATURED;
    } else if (normalizedTarget === IMAGE_PICKER_TARGET_SOCIAL_PLANNER) {
        imagePickerTarget = IMAGE_PICKER_TARGET_SOCIAL_PLANNER;
    } else {
        imagePickerTarget = IMAGE_PICKER_TARGET_EDITOR;
    }

    const modal = document.getElementById('image-picker-modal');
    if (modal) modal.style.display = 'flex';

    setImagePickerActiveTab(options?.initialTab);

    // Setup tab switching logic locally or verify it works
    const tabBtns = document.querySelectorAll('.image-picker-tabs .tab-btn');
    tabBtns.forEach((button) => {
        button.onclick = function () {
            setImagePickerActiveTab(this.dataset.tab || 'upload');
        };
    });
};

window.openSocialPlannerMediaPicker = function (initialTab = 'unsplash') {
    window.openImagePicker(IMAGE_PICKER_TARGET_SOCIAL_PLANNER, { initialTab });
};

window.closeImagePicker = function () {
    const modal = document.getElementById('image-picker-modal');
    if (modal) modal.style.display = 'none';
    imagePickerTarget = IMAGE_PICKER_TARGET_EDITOR;
    setImagePickerActiveTab('upload');
    selectedImageUrl = null;
    selectedUploadFile = null;
    unsplashSearchState = { query: '', page: 0, total: 0, inFlight: false };
    const preview = document.getElementById('upload-preview');
    if (preview) preview.style.display = 'none';
    const fileInput = document.getElementById('blog-image-input');
    if (fileInput) fileInput.value = '';
    const results = document.getElementById('unsplash-results');
    if (results) results.innerHTML = '';
};

window.insertImage = function () {
    // Default image insert button action -> open picker or prompt
    // Assuming design uses prompt as fallback or picker
    // We will use the picker if available, else prompt
    const modal = document.getElementById('image-picker-modal');
    if (modal) {
        window.openImagePicker(IMAGE_PICKER_TARGET_EDITOR);
    } else {
        const url = prompt('Skriv inn bilde URL:');
        if (url && quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', url);
            quill.setSelection(range.index + 1);
        }
    }
}

window.insertUploadedImage = async function () {
    if (!selectedUploadFile) {
        await showAdminNotice('Velg et bilde først, så kan det settes inn i innlegget.', {
            title: 'Ingen bildefil valgt',
            variant: 'warning'
        });
        return;
    }

    try {
        const isFeaturedPicker = imagePickerTarget === IMAGE_PICKER_TARGET_FEATURED;
        const isSocialPlannerPicker = imagePickerTarget === IMAGE_PICKER_TARGET_SOCIAL_PLANNER;
        const uploadFolder = isSocialPlannerPicker ? 'social' : 'blog';
        const imageUrl = await uploadFileToFirebaseStorage(selectedUploadFile, uploadFolder);
        selectedImageUrl = imageUrl;

        if (isSocialPlannerPicker) {
            setSocialPlannerMediaUrl(imageUrl);
            renderMediaLibraryItem(imageUrl, selectedUploadFile.name || 'SoMe-bilde');
            closeImagePicker();
            setSocialPlannerStatus('Bilde er lagt til i social-innlegget.', 'success');
            return;
        }

        if (!isFeaturedPicker) {
            insertImageIntoEditor(imageUrl);
        }
        updatePostImageField(imageUrl, { force: isFeaturedPicker });
        renderMediaLibraryItem(imageUrl, selectedUploadFile.name || 'Bloggbilde');
        closeImagePicker();
        await showAdminNotice(
            isFeaturedPicker ? 'Forsidebildet er oppdatert.' : 'Bildet er lastet opp og satt inn i innlegget.',
            {
                title: isFeaturedPicker ? 'Forsidebilde oppdatert' : 'Bilde satt inn',
                variant: 'success'
            }
        );
    } catch (error) {
        console.error('Error uploading blog image:', error);
        await showAdminNotice(
            normalizeAdminErrorMessage(error, 'Det oppstod en feil ved opplasting av bloggbildet.'),
            {
                title: 'Bildeopplasting feilet',
                variant: 'danger'
            }
        );
    }
};

function appendUnsplashLoadMore(resultsContainer) {
    const wrapper = document.createElement('div');
    wrapper.className = 'unsplash-load-more';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'unsplash-load-more-btn';
    button.textContent = 'Vis flere bilder';
    button.addEventListener('click', async () => {
        button.disabled = true;
        button.textContent = 'Laster...';
        await window.searchUnsplash({ loadMore: true });
    });

    wrapper.appendChild(button);
    resultsContainer.appendChild(wrapper);
}

window.searchUnsplash = async function (options = {}) {
    const queryInput = document.getElementById('unsplash-query');
    const results = document.getElementById('unsplash-results');
    const query = queryInput?.value?.trim();
    const loadMore = Boolean(options?.loadMore);

    if (!results) return;

    if (!query) {
        await showAdminNotice('Skriv inn et søkeord før du søker etter bilder.', {
            title: 'Tomt søk',
            variant: 'warning'
        });
        return;
    }

    if (unsplashSearchState.inFlight) return;

    const isSameQuery = unsplashSearchState.query === query;
    const nextPage = loadMore && isSameQuery ? unsplashSearchState.page + 1 : 1;

    if (!loadMore) {
        results.innerHTML = '<p class="media-loading-state">Laster bilder...</p>';
    } else {
        const currentLoadMore = results.querySelector('.unsplash-load-more');
        if (currentLoadMore) currentLoadMore.remove();
    }

    unsplashSearchState.inFlight = true;

    try {
        const response = await fetch(
            `${API_URL}/unsplash/search?query=${encodeURIComponent(query)}&page=${nextPage}&per_page=${UNSPLASH_RESULTS_PER_PAGE}`
        );
        const payload = await response.json();

        if (!response.ok) {
            throw new Error(payload?.details || payload?.error || `Unsplash-feil (${response.status})`);
        }

        const images = Array.isArray(payload?.images) ? payload.images : [];

        if (!images.length && nextPage === 1) {
            results.innerHTML = '<p class="media-loading-state">Ingen bilder funnet for dette søket.</p>';
            unsplashSearchState = { query, page: 0, total: Number(payload?.total) || 0, inFlight: false };
            return;
        }

        if (nextPage === 1) {
            results.innerHTML = '';
        }

        images.forEach((image) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'unsplash-image-card';
            card.innerHTML = `
                <img src="${image.thumb}" alt="${image.alt || image.description || 'Unsplash bilde'}">
                <span class="photographer">av ${image.photographer || 'Unsplash'}</span>
            `;
            card.addEventListener('click', () => window.insertUnsplashImage(image.full || image.url));
            results.appendChild(card);
        });

        unsplashSearchState.query = query;
        unsplashSearchState.page = nextPage;
        unsplashSearchState.total = Number(payload?.total) || unsplashSearchState.total;

        const loadedCards = results.querySelectorAll('.unsplash-image-card').length;
        const hasMore = loadedCards < unsplashSearchState.total && images.length > 0;

        if (hasMore) {
            appendUnsplashLoadMore(results);
        } else if (loadMore && images.length === 0) {
            await showAdminNotice('Du har sett alle bildene for dette søket.', {
                title: 'Ingen flere treff',
                variant: 'warning'
            });
        }
    } catch (error) {
        console.error('Error searching Unsplash:', error);
        if (!loadMore) {
            results.innerHTML = '';
        }
        const errorMsg = error.message || 'Ukjent feil';
        await showAdminNotice(`Kunne ikke hente bilder fra Unsplash: ${errorMsg}`, {
            title: 'Bildesøk feilet',
            variant: 'danger'
        });
    } finally {
        unsplashSearchState.inFlight = false;
    }
};

window.insertUnsplashImage = async function (imageUrl) {
    if (!imageUrl) return;

    const isFeaturedPicker = imagePickerTarget === IMAGE_PICKER_TARGET_FEATURED;
    const isSocialPlannerPicker = imagePickerTarget === IMAGE_PICKER_TARGET_SOCIAL_PLANNER;
    selectedImageUrl = imageUrl;

    if (isSocialPlannerPicker) {
        setSocialPlannerMediaUrl(imageUrl);
        renderMediaLibraryItem(imageUrl, 'Unsplash-bilde');
        closeImagePicker();
        setSocialPlannerStatus('Unsplash-bilde lagt til i social-innlegget.', 'success');
        return;
    }

    if (!isFeaturedPicker) {
        insertImageIntoEditor(imageUrl);
    }
    updatePostImageField(imageUrl, { force: isFeaturedPicker });
    renderMediaLibraryItem(imageUrl, 'Unsplash-bilde');
    closeImagePicker();

    await showAdminNotice(isFeaturedPicker ? 'Forsidebildet er oppdatert.' : 'Bildet er satt inn i innlegget.', {
        title: isFeaturedPicker ? 'Forsidebilde oppdatert' : 'Bilde satt inn',
        variant: 'success'
    });
};

// Media Upload
window.uploadImage = async function () {
    const fileInput = document.getElementById('image-upload');
    const file = fileInput.files[0];
    if (!file) {
        await showAdminNotice('Velg et bilde før du starter opplastingen.', {
            title: 'Ingen fil valgt',
            variant: 'warning'
        });
        return;
    }

    try {
        const imageUrl = await uploadFileToFirebaseStorage(file, 'library');
        renderMediaLibraryItem(imageUrl, file.name || 'Nytt bilde');
        fileInput.value = '';
        await showAdminNotice('Bildet ble lastet opp til Firebase Storage.', {
            title: 'Opplasting fullført',
            variant: 'success'
        });
    } catch (error) {
        console.error(error);
        await showAdminNotice(
            normalizeAdminErrorMessage(error, 'Det oppstod en feil ved opplasting av bildet.'),
            {
                title: 'Opplasting feilet',
                variant: 'danger'
            }
        );
    }
};

// Document Ready
document.addEventListener('DOMContentLoaded', async () => {
    setupAdminDialog();

    // Auth & Profile Setup
    const user = await checkAuth();
    if (!user) return;
    renderUserProfile(user);
    setupProfileEventListeners();

    // Setup Header Language Buttons
    const headerLangBtns = document.querySelectorAll('.lang-btn-header');
    headerLangBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const lang = this.dataset.lang;
            currentLang = lang;
            headerLangBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const mainLangBtns = document.querySelectorAll('.lang-btn');
            mainLangBtns.forEach(b => {
                b.classList.toggle('active', b.dataset.lang === lang);
            });
            updateDashboardLanguage(); // Update dashboard text
            renderContentEditor();
            renderDashboardOverview();
        });
    });

    headerLangBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });

    // Initial Dashboard Language Update
    updateDashboardLanguage();

    // Setup Unsplash Enter Key
    const unsplashInput = document.getElementById('unsplash-query');
    if (unsplashInput) {
        unsplashInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchUnsplash();
            }
        });
    }

    const aiContextInput = document.getElementById('ai-context-files');
    if (aiContextInput) {
        aiContextInput.addEventListener('change', async (event) => {
            await addAiContextFiles(event.target.files);
            aiContextInput.value = '';
        });
    }

    const aiPromptInput = document.getElementById('ai-prompt-input');
    if (aiPromptInput) {
        aiPromptInput.addEventListener('keydown', async (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault();
                await window.generateBlogDraftWithAi();
            }
        });
    }

    renderAiContextFileList();

    const featuredImageArea = document.getElementById('post-featured-image-area');
    if (featuredImageArea) {
        featuredImageArea.addEventListener('click', () => window.openImagePicker(IMAGE_PICKER_TARGET_FEATURED));
        featuredImageArea.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                window.openImagePicker(IMAGE_PICKER_TARGET_FEATURED);
            }
        });
    }
    renderFeaturedImagePreview(document.getElementById('post-image')?.value || '');

    const blogImageInput = document.getElementById('blog-image-input');
    const uploadPreview = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');

    if (blogImageInput && uploadPreview && previewImage) {
        blogImageInput.addEventListener('change', (event) => {
            const file = event.target.files?.[0] || null;
            selectedUploadFile = file;

            if (!file) {
                uploadPreview.style.display = 'none';
                previewImage.removeAttribute('src');
                return;
            }

            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                previewImage.src = loadEvent.target?.result || '';
                uploadPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        });
    }

    // Modal Events
    const addPostBtn = document.getElementById('add-post-btn');
    if (addPostBtn) {
        addPostBtn.addEventListener('click', () => window.startNewPost());
    }

    const savePostBtn = document.getElementById('save-post-btn'); // For old logic if exists?
    // We have new save/publish buttons in header, mapped via onclick in HTML

    // Initialize App
    init();
});
// ==========================================
// AUTHENTICATION & PROFILE MANAGMENT
// ==========================================

let currentUser = null;
const SESSION_CHECK_TIMEOUT_MS = 4000;
const AUTH_STATE_WAIT_TIMEOUT_MS = 2000;
const SESSION_RETRY_TIMEOUT_MS = 2000;

function withUiTimeout(promise, timeoutMs, fallbackValue = null) {
    return Promise.race([
        promise,
        new Promise((resolve) => {
            window.setTimeout(() => resolve(fallbackValue), timeoutMs);
        })
    ]);
}

function buildFallbackSessionUser(firebaseUser) {
    if (!firebaseUser) return null;

    const email = firebaseUser.email || '';
    const displayName = firebaseUser.displayName || email.split('@')[0] || 'Admin';

    return {
        id: firebaseUser.uid,
        email,
        user_metadata: {
            full_name: displayName,
            avatar_url: firebaseUser.photoURL || '',
            phone: '',
            address: '',
            dob: '',
            bio: ''
        }
    };
}

async function checkAuth() {
    try {
        if (!window.adminAuthClient) {
            console.error('Firebase client not initialized');
            window.location.replace(ADMIN_LOGIN_PATH);
            return null;
        }

        const firstSessionResult = await withUiTimeout(
            window.adminAuthClient.auth.getSession(),
            SESSION_CHECK_TIMEOUT_MS,
            { data: { session: null }, error: new Error('Session check timed out') }
        );
        let session = firstSessionResult?.data?.session || null;
        let error = firstSessionResult?.error || null;
        let fallbackUser = buildFallbackSessionUser(window.firebaseAuth?.currentUser);

        if (!session && !fallbackUser) {
            await withUiTimeout(
                new Promise((resolve) => {
                    if (!window.firebaseAuth || typeof window.firebaseAuth.onAuthStateChanged !== 'function') {
                        resolve(null);
                        return;
                    }

                    let unsubscribe = function () { };
                    unsubscribe = window.firebaseAuth.onAuthStateChanged(
                        (firebaseUser) => {
                            unsubscribe();
                            resolve(firebaseUser || null);
                        },
                        () => {
                            unsubscribe();
                            resolve(null);
                        }
                    );
                }),
                AUTH_STATE_WAIT_TIMEOUT_MS,
                null
            );

            const retrySessionResult = await withUiTimeout(
                window.adminAuthClient.auth.getSession(),
                SESSION_RETRY_TIMEOUT_MS,
                { data: { session: null }, error: null }
            );

            session = retrySessionResult?.data?.session || session;
            error = session ? null : (retrySessionResult?.error || error);
            fallbackUser = buildFallbackSessionUser(window.firebaseAuth?.currentUser) || fallbackUser;
        }

        if ((!session || error) && fallbackUser) {
            currentUser = fallbackUser;
            return currentUser;
        }

        if (error || !session) {
            window.location.replace(ADMIN_LOGIN_PATH);
            return null;
        }

        currentUser = session.user;
        return currentUser;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.replace(ADMIN_LOGIN_PATH);
        return null;
    }
}

function renderUserProfile(user) {
    if (!user) return;

    const meta = user.user_metadata || {};
    const avatarUrl = meta.avatar_url || `https://ui-avatars.com/api/?name=${meta.full_name || 'Admin'}&background=random`;
    const displayName = meta.full_name || user.email.split('@')[0];
    const email = user.email;

    // Update Header
    const headerAvatar = document.getElementById('header-avatar');
    const headerName = document.getElementById('header-username');
    if (headerAvatar) headerAvatar.src = avatarUrl;
    if (headerName) headerName.textContent = displayName;

    // Update Welcome Message
    const welcomeHeader = document.querySelector('[data-i18n="welcome"]');
    if (welcomeHeader) {
        const t = adminTranslations[currentLang] || adminTranslations['no'];
        welcomeHeader.textContent = `${t.welcome}, ${displayName}`;
    }

    // Update Dropdown
    const dropdownName = document.getElementById('dropdown-name');
    const dropdownEmail = document.getElementById('dropdown-email');
    if (dropdownName) dropdownName.textContent = displayName;
    if (dropdownEmail) dropdownEmail.textContent = email;

    // Update Profile Modal Inputs
    const modalName = document.getElementById('profile-name-input');
    const modalEmail = document.getElementById('profile-email-input');
    const modalAvatar = document.getElementById('profile-avatar-preview');
    const modalPhone = document.getElementById('profile-phone-input');
    const modalAddress = document.getElementById('profile-address-input');
    const modalDob = document.getElementById('profile-dob-input');
    const modalBio = document.getElementById('profile-bio-input');

    if (modalName) modalName.value = displayName;
    if (modalEmail) modalEmail.value = email;
    if (modalAvatar) modalAvatar.src = avatarUrl;
    if (modalPhone) modalPhone.value = meta.phone || '';
    if (modalAddress) modalAddress.value = meta.address || '';
    if (modalDob) modalDob.value = meta.dob || '';
    if (modalBio) modalBio.value = meta.bio || '';

    // Update Blog Editor Author Dropdown
    const postAuthorSelect = document.getElementById('post-author');
    const postAuthorAvatar = document.getElementById('post-author-avatar');
    if (postAuthorSelect) {
        postAuthorSelect.innerHTML = `
            <option value="${displayName}">${displayName}</option>
            <option value="Admin">Admin</option>
        `;
        postAuthorSelect.value = displayName;
    }
    if (postAuthorAvatar) postAuthorAvatar.src = avatarUrl;
}

function setupProfileEventListeners() {
    // User Menu Dropdown Toggle
    const userBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }

    // Logout
    const logoutBtnMain = document.getElementById('logout-btn'); // Sidebar
    const logoutBtnDropdown = document.getElementById('logout-btn-dropdown'); // Dropdown

    async function handleLogout() {
        if (window.adminAuthClient) {
            await window.adminAuthClient.auth.signOut();
            window.location.href = ADMIN_LOGIN_PATH;
        }
    }

    if (logoutBtnMain) logoutBtnMain.addEventListener('click', handleLogout);
    if (logoutBtnDropdown) logoutBtnDropdown.addEventListener('click', handleLogout);

    // Profile Settings Modal
    const settingsBtn = document.getElementById('profile-settings-btn');
    const modal = document.getElementById('profile-modal');
    const closeBtn = document.getElementById('close-profile-modal');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (modal) {
                modal.style.display = 'flex';
                // Move modal to body to ensure it's on top if not already
                if (modal.parentElement !== document.body) {
                    document.body.appendChild(modal);
                }
            }
            if (userDropdown) userDropdown.classList.remove('active');
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.closeProfileModal = function () {
        if (modal) modal.style.display = 'none';
    }

    // Avatar Upload Preview
    const avatarInput = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('profile-avatar-preview');

    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatarPreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

async function saveUserProfile() {
    if (!currentUser) return;

    const nameInput = document.getElementById('profile-name-input');
    const avatarInput = document.getElementById('avatar-upload');
    const saveBtn = document.getElementById('save-profile-btn');

    if (!nameInput) return;

    saveBtn.innerText = 'Saving...';
    saveBtn.disabled = true;

    try {
        let avatarUrl = currentUser.user_metadata?.avatar_url;

        // Upload new avatar if selected
        if (avatarInput.files && avatarInput.files[0]) {
            const file = avatarInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { data, error: uploadError } = await window.adminAuthClient.storage
                .from('images') // Assuming 'images' bucket exists, or create 'avatars' bucket
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            if (data && data.publicUrl) {
                avatarUrl = data.publicUrl;
            } else {
                const { data: publicData, error: publicUrlError } = await window.adminAuthClient.storage
                    .from('images')
                    .getPublicUrl(filePath);

                if (publicUrlError) throw publicUrlError;
                avatarUrl = publicData.publicUrl;
            }
        }

        // Update User Metadata
        const { data, error } = await window.adminAuthClient.auth.updateUser({
            data: {
                full_name: nameInput.value,
                avatar_url: avatarUrl,
                phone: document.getElementById('profile-phone-input').value,
                address: document.getElementById('profile-address-input').value,
                dob: document.getElementById('profile-dob-input').value,
                bio: document.getElementById('profile-bio-input').value
            }
        });

        if (error) throw error;

        // Update successful
        currentUser = data.user;
        renderUserProfile(currentUser);
        closeProfileModal();
        await showAdminNotice('Profilen din er oppdatert.', {
            title: 'Profil lagret',
            variant: 'success'
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        await showAdminNotice(
            normalizeAdminErrorMessage(error, 'Det oppstod en feil ved oppdatering av profilen.'),
            {
                title: 'Profilen ble ikke lagret',
                variant: 'danger'
            }
        );
    } finally {
        saveBtn.innerText = 'Save Changes';
        saveBtn.disabled = false;
    }
}
