function getAdminApiUrl() {
    if (window.location.protocol === 'file:') {
        return 'http://localhost:3000/api';
    }
    return '/api';
}

const API_URL = getAdminApiUrl();
let contentData = {};
let blogData = [];
let currentLang = 'no';
let seoData = { global: {}, pages: {} };
let quill; // Define quill globally but initialize later

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

console.log('[DEBUG] Loading legacy_html/admin/app.js');
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
        'nav_messages': 'Meldinger',
        'msg_sender': 'Avsender',
        'msg_subject': 'Melding',
        'msg_date': 'Dato',
        'msg_loading': 'Laster meldinger...',
        'msg_empty': 'Ingen meldinger funnet.',
        'msg_delete_confirm': 'Er du sikker på at du vil slette denne meldingen?',
        'msg_archive_confirm': 'Vil du arkivere denne meldingen?',
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
        'nav_messages': 'Messages',
        'msg_sender': 'Sender',
        'msg_subject': 'Message',
        'msg_date': 'Date',
        'msg_loading': 'Loading messages...',
        'msg_empty': 'No messages found.',
        'msg_delete_confirm': 'Are you sure you want to delete this message?',
        'msg_archive_confirm': 'Do you want to archive this message?',
        'sidebar_menu': 'Menu',
        'welcome': 'Welcome back',
        'new_post': '+ New Post',
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

    if (quill) quill.root.innerHTML = post.content || '';

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
    const content = quill ? quill.root.innerHTML.trim() : '';
    const dateInput = document.getElementById('post-date');
    const dateIso = normalizeIsoDate(dateInput?.value) || getTodayIsoDate();
    const categories = currentPostCategories.length ? [...currentPostCategories] : ['Generelt'];
    const tags = [...currentPostTags];
    const primaryCategory = categories[0] || 'Generelt';
    const seoKeywordsFromField = normalizeKeywordCsv(document.getElementById('post-seo-keywords')?.value || '');
    const detailSummary = document.getElementById('post-detail-summary')?.value.trim() || '';
    const detailOutline = normalizeOutlineItems(document.getElementById('post-detail-outline')?.value || '');
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
        seoTitle: document.getElementById('post-seo-title')?.value.trim() || '',
        seoDesc: document.getElementById('post-seo-desc')?.value.trim() || '',
        seoKeywords: seoKeywordsFromField || normalizeKeywordCsv(tags.join(', ')),
        detailSummary,
        detailOutline,
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
        await persistPostPayload(mergedPayload);
        currentEditingId = mergedPayload.id;

        await renderBlogPosts();
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
// CONTACT MESSAGES LOGIC
// ==========================================

let contactMessages = [];

window.fetchAnalyticsData = async function () {
    console.log('[Analytics] Fetching data...');
    const usersEl = document.getElementById('ga-users');
    const viewsEl = document.getElementById('ga-pageviews');
    const realtimeEl = document.getElementById('ga-realtime');
    const searchEl = document.getElementById('ga-search-clicks');

    // Expansion elements
    const pagesContainer = document.getElementById('ga-top-pages');
    const sourcesContainer = document.getElementById('ga-traffic-sources');

    if (!usersEl || !viewsEl || !realtimeEl) {
        console.error('[Analytics] Kunne ikke finne UI-elementer for statistikk.');
        return;
    }

    // Show loading state
    usersEl.textContent = '...';
    viewsEl.textContent = '...';
    realtimeEl.textContent = '...';
    if (searchEl) searchEl.textContent = '...';

    if (pagesContainer) pagesContainer.innerHTML = '<div class="analytics-loading-inline"><i class="fas fa-spinner fa-spin"></i> Laster...</div>';
    if (sourcesContainer) sourcesContainer.innerHTML = '<div class="analytics-loading-inline"><i class="fas fa-spinner fa-spin"></i> Laster...</div>';

    try {
        const response = await fetch(`${API_URL}/analytics`);
        if (!response.ok) throw new Error(`Server returned ${response.status}`);

        const result = await response.json();
        console.log('[Analytics] Mottatt data:', result);

        if (result.status === 'success' || result.status === 'unconfigured') {
            const data = result.data;
            usersEl.textContent = data.active7DayUsers || '0';
            viewsEl.textContent = data.screenPageViews || '0';
            realtimeEl.textContent = data.activeUsers || '0';
            if (searchEl) searchEl.textContent = data.searchClicks || '9';

            // Render Top Pages
            if (pagesContainer && data.topPages) {
                if (data.topPages.length === 0) {
                    pagesContainer.innerHTML = '<div class="analytics-loading-inline">Ingen data tilgjengelig</div>';
                } else {
                    const maxViews = Math.max(...data.topPages.map(p => parseInt(p.views) || 1));
                    pagesContainer.innerHTML = data.topPages.map(page => `
                        <div class="analytics-list-item">
                            <div class="analytics-item-info">
                                <span class="analytics-item-label" title="${page.title}">${page.title}</span>
                                <div class="analytics-item-bar">
                                    <div class="analytics-item-progress" style="width: ${(parseInt(page.views) / maxViews) * 100}%"></div>
                                </div>
                            </div>
                            <span class="analytics-item-value">${page.views}</span>
                        </div>
                    `).join('');
                }
            }

            // Render Traffic Sources
            if (sourcesContainer && data.trafficSources) {
                if (data.trafficSources.length === 0) {
                    sourcesContainer.innerHTML = '<div class="analytics-loading-inline">Ingen data tilgjengelig</div>';
                } else {
                    const maxSessions = Math.max(...data.trafficSources.map(s => parseInt(s.sessions) || 1));
                    sourcesContainer.innerHTML = data.trafficSources.map(source => `
                        <div class="analytics-list-item">
                            <div class="analytics-item-info">
                                <span class="analytics-item-label">${source.source}</span>
                                <div class="analytics-item-bar">
                                    <div class="analytics-item-progress" style="width: ${(parseInt(source.sessions) / maxSessions) * 100}%"></div>
                                </div>
                            </div>
                            <span class="analytics-item-value">${source.sessions}</span>
                        </div>
                    `).join('');
                }
            }

            if (result.status === 'unconfigured') {
                console.warn('[Analytics] OBS: Google Analytics er ikke fullstendig konfigurert i .env.');
            }
        } else {
            throw new Error(result.error || 'Kunne ikke hente analytics');
        }
    } catch (error) {
        console.error('[Analytics] Error fetching analytics:', error);
        usersEl.textContent = 'Feil';
        viewsEl.textContent = 'Feil';
        realtimeEl.textContent = 'Feil';
        if (searchEl) searchEl.textContent = 'Feil';
        if (pagesContainer) pagesContainer.innerHTML = '<div class="analytics-loading-inline">Kunne ikke hente data</div>';
        if (sourcesContainer) sourcesContainer.innerHTML = '<div class="analytics-loading-inline">Kunne ikke hente data</div>';
    }
};

window.fetchMessages = async function () {
    const listContainer = document.getElementById('messages-list');
    if (listContainer) {
        listContainer.innerHTML = `
            <div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-muted);">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p data-i18n="msg_loading">${adminTranslations[currentLang]?.msg_loading || 'Laster meldinger...'}</p>
            </div>
        `;
    }

    try {
        const response = await fetch(`${API_URL}/messages`);
        if (!response.ok) throw new Error(`Server svarte med status ${response.status}`);

        contactMessages = await response.json();
        renderMessages();
    } catch (error) {
        console.error('[Messages] Error fetching messages:', error);
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="empty-state" style="padding: 40px; text-align: center; color: #ef4444;">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>Feil ved henting av meldinger: ${error.message}</p>
                </div>
            `;
        }
    }
};

function renderMessages() {
    const listContainer = document.getElementById('messages-list');
    if (!listContainer) return;

    if (!contactMessages || contactMessages.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-muted);">
                <i class="fas fa-envelope-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p data-i18n="msg_empty">${adminTranslations[currentLang]?.msg_empty || 'Ingen meldinger funnet.'}</p>
            </div>
        `;
        return;
    }

    // Sort by date descending
    const sortedMessages = [...contactMessages].sort((a, b) => {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    listContainer.innerHTML = '';
    sortedMessages.forEach(msg => {
        const dateStr = msg.created_at ? new Date(msg.created_at).toLocaleString('no-NO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : '-';

        const item = document.createElement('div');
        item.className = `blog-item message-item ${msg.status === 'archived' ? 'archived' : ''}`;
        if (msg.status === 'archived') item.style.opacity = '0.6';

        item.innerHTML = `
            <div class="blog-title message-author">
                <div style="font-weight: 700;">${msg.name || 'Anonym'}</div>
                <div style="font-size: 12px; color: var(--text-muted); font-weight: 400;">${msg.email || ''}</div>
            </div>
            <div class="blog-meta message-preview">
                ${msg.message || ''}
            </div>
            <div class="blog-meta message-date">${dateStr}</div>
            <div class="message-actions">
                <button class="action-btn" onclick="viewMessage('${msg.id}')" title="Vis">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn archive-btn" onclick="archiveMessage('${msg.id}')" title="Arkiver" ${msg.status === 'archived' ? 'disabled' : ''}>
                    <i class="fas fa-archive"></i>
                </button>
                <button class="action-btn delete" onclick="deleteMessage('${msg.id}')" title="Slett">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

window.viewMessage = async function (id) {
    const msg = contactMessages.find(m => m.id === id);
    if (!msg) return;

    await showAdminNotice(msg.message, {
        title: `Fra: ${msg.name} (${msg.email})`,
        confirmText: 'Lukk'
    });
};

window.archiveMessage = async function (id) {
    const confirmed = await showAdminConfirm(
        adminTranslations[currentLang]?.msg_archive_confirm || 'Vil du arkivere denne meldingen?',
        { title: 'Arkiver melding' }
    );
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'archived' })
        });
        if (!response.ok) throw new Error('Kunne ikke arkivere melding');

        await fetchMessages();
    } catch (error) {
        console.error('Error archiving message:', error);
        showAdminNotice('Kunne ikke arkivere meldingen: ' + error.message, { variant: 'danger' });
    }
};

window.deleteMessage = async function (id) {
    const confirmed = await showAdminConfirm(
        adminTranslations[currentLang]?.msg_delete_confirm || 'Er du sikker på at du vil slette denne meldingen?',
        { title: 'Slett melding', variant: 'danger', confirmText: 'Slett' }
    );
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Kunne ikke slette melding');

        await fetchMessages();
    } catch (error) {
        console.error('Error deleting message:', error);
        showAdminNotice('Kunne ikke slette meldingen: ' + error.message, { variant: 'danger' });
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
    setupLogout();

    await Promise.allSettled([
        fetchStyles(),
        fetchContent(),
        fetchBlogPosts(),
        fetchSeo()
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
    const separatorEl = document.getElementById('seo-separator');
    const keywordsEl = document.getElementById('seo-default-keywords');
    const gaIdEl = document.getElementById('seo-ga-id');

    if (siteTitleEl) siteTitleEl.value = seoData.global.siteTitle || '';
    if (separatorEl) separatorEl.value = seoData.global.separator || '|';
    if (keywordsEl) keywordsEl.value = seoData.global.defaultKeywords || '';
    if (gaIdEl) gaIdEl.value = seoData.global.googleAnalyticsId || '';

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
        siteTitle: document.getElementById('seo-site-title').value,
        separator: document.getElementById('seo-separator').value,
        defaultKeywords: document.getElementById('seo-default-keywords').value,
        googleAnalyticsId: document.getElementById('seo-ga-id').value
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


function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (window.adminAuthClient) {
                await window.adminAuthClient.auth.signOut();
                window.location.href = 'login.html';
            }
        });
    }
}

async function fetchStyles() {
    try {
        const response = await fetch('custom-style.css');
        if (!response.ok) throw new Error('Could not load styles');
        const cssText = await response.text();

        // Regex to extract variables
        const baseMatch = cssText.match(/--clr-base:\s*(#[0-9a-fA-F]{6})/);
        const bgMatch = cssText.match(/--theme-bg:\s*(#[0-9a-fA-F]{6})/);
        const textMatch = cssText.match(/--clr-common-text:\s*(#[0-9a-fA-F]{6})/);

        if (baseMatch) {
            const val = baseMatch[1];
            const input = document.getElementById('clr-base');
            if (input) {
                input.value = val;
                if (input.parentElement.querySelector('.color-value'))
                    input.parentElement.querySelector('.color-value').textContent = val;
            }
        }

        if (bgMatch) {
            const val = bgMatch[1];
            const input = document.getElementById('theme-bg');
            if (input) {
                input.value = val;
                if (input.parentElement.querySelector('.color-value'))
                    input.parentElement.querySelector('.color-value').textContent = val;
            }
        }

        if (textMatch) {
            const val = textMatch[1];
            const input = document.getElementById('clr-common-text');
            if (input) {
                input.value = val;
                if (input.parentElement.querySelector('.color-value'))
                    input.parentElement.querySelector('.color-value').textContent = val;
            }
        }

    } catch (error) {
        console.error('Error fetching styles:', error);
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
const fontSelect = document.getElementById('font-family-select');
const fontPreview = document.getElementById('font-preview');

if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
        const option = e.target.options[e.target.selectedIndex];
        const fontUrl = option.dataset.url;
        const fontFamily = e.target.value;

        let link = document.getElementById('preview-font-link');
        if (!link) {
            link = document.createElement('link');
            link.id = 'preview-font-link';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        link.href = fontUrl;
        fontPreview.style.fontFamily = fontFamily.replace(/['"]/g, '');
    });
}

async function saveChanges() {
    const saveBtn = document.getElementById('save-btn'); // Local definition for safety
    if (saveBtn) saveBtn.innerText = 'Lagrer...';
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

        const styleData = {
            "--clr-base": document.getElementById('clr-base').value,
            "--theme-bg": document.getElementById('theme-bg').value,
            "--clr-common-text": document.getElementById('clr-common-text').value
        };

        const fontOption = fontSelect ? fontSelect.options[fontSelect.selectedIndex] : null;
        const fontData = fontOption ? {
            fontUrl: fontOption.dataset.url,
            fontFamily: fontSelect.value
        } : {};

        if (styleData["--clr-base"]) {
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
        if (saveBtn) saveBtn.innerText = 'Lagre Endringer';
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
        'media': ['Media']
    },
    'en': {
        'home': ['Home'],
        'blog': ['Blog'],
        'content': ['Site Content'],
        'style': ['Design'],
        'seo': ['SEO'],
        'media': ['Media']
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
    }
}

function setActiveSection(section) {
    document.querySelectorAll('.nav-btn[data-tab]').forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === section);
    });
}

function closeMobileSidebarMenu() {
    document.body.classList.remove('mobile-sidebar-open');
}

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

    const navBtns = document.querySelectorAll('.nav-btn[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    const initialActiveSection =
        document.querySelector('.sidebar .nav-btn.active[data-tab]')?.dataset.tab ||
        document.querySelector('.nav-btn.active[data-tab]')?.dataset.tab ||
        'home';

    setActiveSection(initialActiveSection);

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.tab) {
                const section = btn.dataset.tab;
                setActiveSection(section);
                tabContents.forEach(content => content.classList.remove('active'));
                const targetTab = document.getElementById(`${section}-tab`);
                if (targetTab) targetTab.classList.add('active');
                updateBreadcrumb(section);
                updateHeaderActions(section);

                // Fetch messages if tab is selected
                if (section === 'messages') {
                    fetchMessages();
                }

                // Fetch analytics if tab is selected
                if (section === 'analytics') {
                    fetchAnalyticsData();
                }

                if (window.innerWidth <= 900) {
                    closeMobileSidebarMenu();
                }
            }
        });
    });

    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            document.body.classList.toggle('mobile-sidebar-open');
        });
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileSidebarMenu);
    }

    if (mobileSidebarOverlay) {
        mobileSidebarOverlay.addEventListener('click', closeMobileSidebarMenu);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileSidebarMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            closeMobileSidebarMenu();
        }
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
let imagePickerTarget = IMAGE_PICKER_TARGET_EDITOR;

function sanitizeStorageFileName(fileName = 'image') {
    return String(fileName)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'image';
}

async function uploadFileToFirebaseStorage(file, folder = 'media') {
    if (!file) {
        throw new Error('Ingen fil valgt.');
    }

    if (!window.adminAuthClient?.storage) {
        throw new Error('Firebase Storage er ikke tilgjengelig.');
    }

    const safeName = sanitizeStorageFileName(file.name || 'image');
    const filePath = `${folder}/${Date.now()}-${safeName}`;

    const { data, error: uploadError } = await window.adminAuthClient.storage
        .from('uploads')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    if (data?.publicUrl) {
        return data.publicUrl;
    }

    const { data: publicData, error: publicUrlError } = await window.adminAuthClient.storage
        .from('uploads')
        .getPublicUrl(filePath);

    if (publicUrlError) {
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
    const existingDraft = includeDraft && quill ? String(quill.root?.innerHTML || '').trim() : '';

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
            quill.root.innerHTML = generatedContent;
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
    const rows = parseInt(prompt('Antall rader:', '3')) || 3;
    const cols = parseInt(prompt('Antall kolonner:', '3')) || 3;
    let tableHTML = '<table class="blog-table"><tbody>';
    for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < cols; j++) {
            const tag = i === 0 ? 'th' : 'td';
            tableHTML += `<${tag}>Celle ${i + 1},${j + 1}</${tag}>`;
        }
        tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table><p><br></p>';
    const range = quill.getSelection(true);
    quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML, Quill.sources.USER);
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
window.openImagePicker = function (target = IMAGE_PICKER_TARGET_EDITOR) {
    imagePickerTarget = target === IMAGE_PICKER_TARGET_FEATURED
        ? IMAGE_PICKER_TARGET_FEATURED
        : IMAGE_PICKER_TARGET_EDITOR;

    const modal = document.getElementById('image-picker-modal');
    if (modal) modal.style.display = 'flex';

    // Setup tab switching logic locally or verify it works
    const tabBtns = document.querySelectorAll('.image-picker-tabs .tab-btn');
    tabBtns.forEach(btn => {
        btn.onclick = function () {
            const tab = this.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.picker-tab').forEach(t => t.classList.remove('active'));
            document.getElementById(`${tab}-tab`).classList.add('active');
        };
    });
};

window.closeImagePicker = function () {
    const modal = document.getElementById('image-picker-modal');
    if (modal) modal.style.display = 'none';
    imagePickerTarget = IMAGE_PICKER_TARGET_EDITOR;
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
        const imageUrl = await uploadFileToFirebaseStorage(selectedUploadFile, 'blog');
        const isFeaturedPicker = imagePickerTarget === IMAGE_PICKER_TARGET_FEATURED;
        selectedImageUrl = imageUrl;
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
    selectedImageUrl = imageUrl;
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
        addPostBtn.addEventListener('click', () => {
            currentEditingId = null;
            document.getElementById('post-title').value = '';
            const defaultAuthor = currentUser?.user_metadata?.full_name || 'Admin';
            document.getElementById('post-author').value = defaultAuthor;
            setCurrentTaxonomyState({ category: 'Generelt', categories: ['Generelt'], tags: [] });
            setCurrentGeneralSettingsState({
                relatedPostIds: [],
                showFeaturedImage: true,
                isFeatured: false,
                allowComments: true
            });
            renderPostTaxonomyEditors();
            const dateInput = document.getElementById('post-date');
            if (dateInput) dateInput.value = getTodayIsoDate();
            document.getElementById('post-image').value = 'img/blog/bblog1.png';
            const excerptInput = document.getElementById('post-excerpt');
            if (excerptInput) excerptInput.value = '';
            document.getElementById('post-seo-title').value = '';
            document.getElementById('post-seo-desc').value = '';
            document.getElementById('post-seo-keywords').value = '';
            const detailSummaryInput = document.getElementById('post-detail-summary');
            const detailOutlineInput = document.getElementById('post-detail-outline');
            if (detailSummaryInput) detailSummaryInput.value = '';
            if (detailOutlineInput) detailOutlineInput.value = '';
            if (quill) quill.setText('');
            openModal();
        });
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
            window.location.replace('login.html');
            return null;
        }

        const firstSessionResult = await withUiTimeout(
            window.adminAuthClient.auth.getSession(),
            12000,
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
                6000,
                null
            );

            const retrySessionResult = await withUiTimeout(
                window.adminAuthClient.auth.getSession(),
                6000,
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
            window.location.replace('login.html');
            return null;
        }

        currentUser = session.user;
        return currentUser;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.replace('login.html');
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
    const settingsBtn = document.getElementById('profile-settings-btn');
    const modal = document.getElementById('profile-modal');
    const closeBtn = document.getElementById('close-profile-modal');

    const openProfileModal = () => {
        if (modal) {
            modal.style.display = 'flex';
            // Move modal to body to ensure it's on top if not already
            if (modal.parentElement !== document.body) {
                document.body.appendChild(modal);
            }
        }
        if (userDropdown) userDropdown.classList.remove('active');
    };

    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.innerWidth <= 900) {
                openProfileModal();
                return;
            }
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
            window.location.href = 'login.html';
        }
    }

    if (logoutBtnMain) logoutBtnMain.addEventListener('click', handleLogout);
    if (logoutBtnDropdown) logoutBtnDropdown.addEventListener('click', handleLogout);

    // Profile Settings Modal
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openProfileModal);
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
