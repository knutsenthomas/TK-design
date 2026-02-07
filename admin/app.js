const API_URL = 'http://localhost:3000/api';
let contentData = {};
let blogData = [];
let currentLang = 'en';
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
        'welcome': 'Velkommen tilbake',
        'new_post': '+ Nytt Innlegg',
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
        'welcome': 'Welcome back',
        'new_post': '+ New Post',
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
        if (headerTitle) headerTitle.textContent = 'Apper';
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
    if (panel) {
        if (panel.style.display === 'none') {
            panel.style.display = 'flex';
        } else {
            panel.style.display = 'none';
        }
    }
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
    document.getElementById('post-category').value = post.category || 'Generelt';
    document.getElementById('post-date').value = post.date;
    document.getElementById('post-image').value = post.image;

    // Populate SEO fields
    document.getElementById('post-seo-title').value = post.seoTitle || '';
    document.getElementById('post-seo-desc').value = post.seoDesc || '';
    document.getElementById('post-seo-keywords').value = post.seoKeywords || '';

    if (quill) quill.root.innerHTML = post.content || '';

    openModal();
}

window.deletePost = async function (index) {
    if (confirm('Er du sikker på at du vil slette dette innlegget?')) {
        blogData.splice(index, 1);
        await saveBlogPosts();
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

    await fetchStyles(); // Load Style data
    await fetchContent();
    await fetchBlogPosts();
    await fetchSeo(); // Load SEO data
    renderContentEditor();
    renderBlogList();
    setupEventListeners();
    setupLogout();
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
                alert('Ugyldig video URL. Bruk YouTube eller Vimeo URL.');
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
        await fetch(`${API_URL}/seo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(seoData)
        });
        alert('SEO-innstillinger lagret!');
    } catch (error) {
        console.error('Error saving SEO:', error);
        alert('Feil ved lagring av SEO.');
    } finally {
        saveBtn.innerText = 'Lagre SEO';
    }
}


function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (window.supabaseClient) {
                await window.supabaseClient.auth.signOut();
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

function renderContentEditor() {
    const contentEditor = document.getElementById('content-editor');
    if (!contentEditor) return;

    contentEditor.innerHTML = '';
    const sectionData = contentData[currentLang];

    if (!sectionData) return;

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
                        if (value.length > 80) {
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

                        input.value = value;
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
        await fetch(`${API_URL}/content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contentData)
        });

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
            await fetch(`${API_URL}/style`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cssVariables: styleData,
                    ...fontData
                })
            });
        }
        alert('Endringer lagret!');
    } catch (error) {
        console.error('Error saving:', error);
        alert('Feil ved lagring.');
    } finally {
        if (saveBtn) saveBtn.innerText = 'Lagre Endringer';
    }
}

// ========== HEADER NAVIGATION ==========
const breadcrumbConfig = {
    'home': ['Dashboard'],
    'blog': ['Dashboard', 'Blogg'],
    'content': ['Dashboard', 'Sideinnhold'],
    'style': ['Dashboard', 'Design'],
    'seo': ['Dashboard', 'SEO'],
    'media': ['Dashboard', 'Media']
};

function updateBreadcrumb(section) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;

    const items = breadcrumbConfig[section] || ['Dashboard'];
    breadcrumb.innerHTML = items.map((item, index) => {
        const isActive = index === items.length - 1;
        return `<span class="breadcrumb-item ${isActive ? 'active' : ''}">${item}</span>`;
    }).join('');
}

function updateHeaderActions(section) {
    const actionsContainer = document.getElementById('header-actions');
    if (!actionsContainer) return;

    actionsContainer.innerHTML = '';

    if (section === 'content' || section === 'style' || section === 'seo') {
        const saveBtn = document.createElement('button');
        saveBtn.className = 'header-action-btn primary';
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Lagre';
        saveBtn.onclick = () => {
            if (section === 'content') saveChanges();
            else if (section === 'seo') saveSeo();
        };
        actionsContainer.appendChild(saveBtn);
    }

    if (section === 'blog') {
        // Button moved to content area
    }
}

function setupEventListeners() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            renderContentEditor();
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
}


// --- Blog Management ---
let currentEditingId = null;

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
}

// View Switching Logic
const dashboardContainer = document.getElementById('dashboard-container');
const editorContainerWrapper = document.getElementById('editor-container-wrapper');

function openModal() {
    dashboardContainer.style.display = 'none';
    editorContainerWrapper.style.display = 'flex';
}

function closeModal() {
    editorContainerWrapper.style.display = 'none';
    dashboardContainer.style.display = 'flex';
    currentEditingId = null;
}

window.closeEditor = closeModal; // Alias

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
window.openImagePicker = function () {
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
    selectedImageUrl = null;
    const preview = document.getElementById('upload-preview');
    if (preview) preview.style.display = 'none';
    const results = document.getElementById('unsplash-results');
    if (results) results.innerHTML = '';
};

window.insertImage = function () {
    // Default image insert button action -> open picker or prompt
    // Assuming design uses prompt as fallback or picker
    // We will use the picker if available, else prompt
    const modal = document.getElementById('image-picker-modal');
    if (modal) {
        window.openImagePicker();
    } else {
        const url = prompt('Skriv inn bilde URL:');
        if (url && quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', url);
            quill.setSelection(range.index + 1);
        }
    }
}

// Media Upload
window.uploadImage = async function () {
    const fileInput = document.getElementById('image-upload');
    const file = fileInput.files[0];
    if (!file) return alert('Velg et bilde først');

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Bilde lastet opp!');
        } else {
            alert('Opplasting feilet');
        }
    } catch (error) {
        console.error(error);
        alert('Feil ved opplasting');
    }
};

// Document Ready
document.addEventListener('DOMContentLoaded', async () => {
    // Auth & Profile Setup
    const user = await checkAuth();
    if (user) {
        renderUserProfile(user);
        setupProfileEventListeners();
    }

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
        });
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

    // Modal Events
    const addPostBtn = document.getElementById('add-post-btn');
    if (addPostBtn) {
        addPostBtn.addEventListener('click', () => {
            currentEditingId = null;
            document.getElementById('post-title').value = '';
            const defaultAuthor = currentUser?.user_metadata?.full_name || 'Admin';
            document.getElementById('post-author').value = defaultAuthor;
            document.getElementById('post-category').value = 'Generelt';
            document.getElementById('post-date').value = new Date().toLocaleDateString('no-NO', { year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('post-image').value = 'img/blog/bblog1.png';
            document.getElementById('post-seo-title').value = '';
            document.getElementById('post-seo-desc').value = '';
            document.getElementById('post-seo-keywords').value = '';
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

async function checkAuth() {
    if (!window.supabaseClient) {
        console.error('Supabase client not initialized');
        return null;
    }

    const { data: { session }, error } = await window.supabaseClient.auth.getSession();

    if (error || !session) {
        window.location.href = 'login.html';
        return null;
    }

    currentUser = session.user;
    return currentUser;
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
        if (window.supabaseClient) {
            await window.supabaseClient.auth.signOut();
            window.location.href = 'login.html';
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

            const { data, error: uploadError } = await window.supabaseClient.storage
                .from('images') // Assuming 'images' bucket exists, or create 'avatars' bucket
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = window.supabaseClient.storage
                .from('images')
                .getPublicUrl(filePath);

            avatarUrl = publicUrl;
        }

        // Update User Metadata
        const { data, error } = await window.supabaseClient.auth.updateUser({
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
        alert('Profile updated successfully!');

    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile: ' + error.message);
    } finally {
        saveBtn.innerText = 'Save Changes';
        saveBtn.disabled = false;
    }
}
