const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '../legacy_html');

function updateFile(filename, replacements) {
    const filePath = path.join(DIR, filename);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const { search, replace } of replacements) {
        if (content.includes(search)) {
            content = content.split(search).join(replace);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filename}`);
    }
}

// 1. Index.html replacements
updateFile('index.html', [
    { search: '<p class="info-card-label">SoMe</p>', replace: '<p class="info-card-label" data-i18n="about.experience_tab.some_label">SoMe</p>' },
    { search: '<p>Innhold og synlighet</p>', replace: '<p data-i18n="about.experience_tab.some_desc">Innhold og synlighet</p>' },
    { search: '<p class="info-card-label">Vår misjon</p>', replace: '<p class="info-card-label" data-i18n="about.education_tab.mission_label">Vår misjon</p>' },
    { search: '<span class="chart-label">Før</span>', replace: '<span class="chart-label" data-i18n="seo.chart_before">Før</span>' },
    { search: '<div class="mandal-subline">Regnskap, Fakturering, Lønn og operativ lederstøtte</div>', replace: '<div class="mandal-subline" data-i18n="projects.mandal_subline">Regnskap, Fakturering, Lønn og operativ lederstøtte</div>' },
    { search: '<span>Portefølje</span>', replace: '<span data-i18n="nav.portfolio">Portefølje</span>' },
    { search: '<span>Mandal</span>', replace: '<span data-i18n="nav.portfolio">Mandal</span>' }, // Fix missing if needed, wait, it's just 'Portefølje' that was missing
    { search: '<span class="section-subtitle-lines" style="color: #62B6CB; margin-bottom: 24px;">Gratis verktøy</span>', replace: '<span class="section-subtitle-lines" style="color: #62B6CB; margin-bottom: 24px;" data-i18n="free_tool.subtitle">Gratis verktøy</span>' },
    { search: 'Tast inn din URL til venstre for å teste ytelse, SEO-status og mobilvennlighet.', replace: '<span data-i18n="free_tool.desc">Tast inn din URL til venstre for å teste ytelse, SEO-status og mobilvennlighet.</span>' },
    { search: '<h4>Treg responstid på server (TTFB)</h4>', replace: '<h4 data-i18n="free_tool.report_1_title">Treg responstid på server (TTFB)</h4>' },
    { search: '<p>Siden din bruker 1.4s på første byte, som gjør at du taper opptil 30% av besøkende før siden har lastet.</p>', replace: '<p data-i18n="free_tool.report_1_desc">Siden din bruker 1.4s på første byte, som gjør at du taper opptil 30% av besøkende før siden har lastet.</p>' },
    { search: '<h4>Unødvendig tunge bilder (Mangler WebP)</h4>', replace: '<h4 data-i18n="free_tool.report_2_title">Unødvendig tunge bilder (Mangler WebP)</h4>' },
    { search: '<p>Store bildefiler øker sidelasten med flere megabytes. Google straffer dette tungt i søkeresultatene.</p>', replace: '<p data-i18n="free_tool.report_2_desc">Store bildefiler øker sidelasten med flere megabytes. Google straffer dette tungt i søkeresultatene.</p>' },
    { search: '<p>Viktige søkeord mangler i overskriftsstrukturen, som lar konkurrentene dine rangere høyere på Google.</p>', replace: '<p data-i18n="free_tool.report_3_desc">Viktige søkeord mangler i overskriftsstrukturen, som lar konkurrentene dine rangere høyere på Google.</p>' },
    { search: '<h4>Vil du ha den komplette rapporten med steg-for-steg løsninger?</h4>', replace: '<h4 data-i18n="free_tool.report_cta">Vil du ha den komplette rapporten med steg-for-steg løsninger?</h4>' }
]);

// 2. Portefolje.html replacements
updateFile('portefolje.html', [
    { search: '<title>Portefølje | TK-design</title>', replace: '<title data-i18n="portfolio_page.title">Portefølje | TK-design</title>' },
    { search: '<h1 style="font-size: 3rem; margin-bottom: 16px; font-weight: 700; color: var(--clr-base);">Vår Portefølje</h1>', replace: '<h1 style="font-size: 3rem; margin-bottom: 16px; font-weight: 700; color: var(--clr-base);" data-i18n="portfolio_page.heading">Vår Portefølje</h1>' },
    { search: 'Laster inn grafisk portefølje...', replace: '<span data-i18n="portfolio_page.loading">Laster inn grafisk portefølje...</span>' }
]);

// 3. Contact.html replacements
updateFile('contact.html', [
    { search: '<option value="Webdesign + SEO (Anbefalt)" selected>Webdesign + SEO (Anbefalt - Mest populær)</option>', replace: '<option value="Webdesign + SEO" selected data-i18n="contact_page.opt_1">Webdesign + SEO (Anbefalt - Mest populær)</option>' },
    { search: '<option value="SEO Søkemotoroptimalisering">SEO (Søkemotoroptimalisering)</option>', replace: '<option value="SEO" data-i18n="contact_page.opt_2">SEO (Søkemotoroptimalisering)</option>' },
    { search: '<option value="Løpende drift og support">Løpende drift og support</option>', replace: '<option value="Support" data-i18n="contact_page.opt_3">Løpende drift og support</option>' },
    { search: '<span>Moderne & Rent</span>', replace: '<span data-i18n="contact_page.tag_modern">Moderne & Rent</span>' },
    { search: '<span>Minimalistisk</span>', replace: '<span data-i18n="contact_page.tag_minimal">Minimalistisk</span>' },
    { search: '<span>Eksklusivt & Mørkt</span>', replace: '<span data-i18n="contact_page.tag_dark">Eksklusivt & Mørkt</span>' },
    { search: '<span>Nettbutikk</span>', replace: '<span data-i18n="contact_page.tag_shop">Nettbutikk</span>' },
    { search: '<label style="font-weight: 700; margin-bottom: 6px;">Ønskede funksjoner på nettsiden</label>', replace: '<label style="font-weight: 700; margin-bottom: 6px;" data-i18n="contact_page.desired_features">Ønskede funksjoner på nettsiden</label>' },
    { search: '<span>Flerspråklig</span>', replace: '<span data-i18n="contact_page.tag_multilingual">Flerspråklig</span>' }
]);

// 4. Update translations.js
const transPath = path.join(DIR, 'translations.js');
let trans = fs.readFileSync(transPath, 'utf8');

// Using regex to insert into the `en: {` and `no: {` blocks.
// We'll append to the end of each block (before `}, // End of EN/NO`).
// Oh wait, `translations.js` is quite large, I will just append the new objects to the end of the `en` and `no` objects using regex.

// For EN:
const enInserts = `
        seo: { chart_before: "Before" },
        free_tool: {
            subtitle: "Free tools",
            desc: "Enter your URL on the left to test performance, SEO status, and mobile friendliness.",
            report_1_title: "Slow server response time (TTFB)",
            report_1_desc: "Your site takes 1.4s on the first byte, causing you to lose up to 30% of visitors before the site has loaded.",
            report_2_title: "Unnecessarily heavy images (Missing WebP)",
            report_2_desc: "Large image files increase the page load by several megabytes. Google penalizes this heavily in search results.",
            report_3_desc: "Important keywords are missing in the heading structure, allowing your competitors to rank higher on Google.",
            report_4_desc: "Missing meta descriptions on several key pages.",
            report_cta: "Do you want the complete report with step-by-step solutions?"
        },
        portfolio_page: {
            title: "Portfolio | TK-design",
            heading: "Our Portfolio",
            loading: "Loading graphic portfolio..."
        },
        contact_page: {
            opt_1: "Web design + SEO (Recommended - Most popular)",
            opt_2: "SEO (Search Engine Optimization)",
            opt_3: "Ongoing operations and support",
            tag_modern: "Modern & Clean",
            tag_minimal: "Minimalist",
            tag_dark: "Exclusive & Dark",
            tag_shop: "E-commerce",
            tag_multilingual: "Multilingual",
            desired_features: "Desired website features"
        },`;

// For NO:
const noInserts = `
        seo: { chart_before: "Før" },
        free_tool: {
            subtitle: "Gratis verktøy",
            desc: "Tast inn din URL til venstre for å teste ytelse, SEO-status og mobilvennlighet.",
            report_1_title: "Treg responstid på server (TTFB)",
            report_1_desc: "Siden din bruker 1.4s på første byte, som gjør at du taper opptil 30% av besøkende før siden har lastet.",
            report_2_title: "Unødvendig tunge bilder (Mangler WebP)",
            report_2_desc: "Store bildefiler øker sidelasten med flere megabytes. Google straffer dette tungt i søkeresultatene.",
            report_3_desc: "Viktige søkeord mangler i overskriftsstrukturen, som lar konkurrentene dine rangere høyere på Google.",
            report_4_desc: "Mangler metabeskrivelse på flere sentrale sider.",
            report_cta: "Vil du ha den komplette rapporten med steg-for-steg løsninger?"
        },
        portfolio_page: {
            title: "Portefølje | TK-design",
            heading: "Vår Portefølje",
            loading: "Laster inn grafisk portefølje..."
        },
        contact_page: {
            opt_1: "Webdesign + SEO (Anbefalt - Mest populær)",
            opt_2: "SEO (Søkemotoroptimalisering)",
            opt_3: "Løpende drift og support",
            tag_modern: "Moderne & Rent",
            tag_minimal: "Minimalistisk",
            tag_dark: "Eksklusivt & Mørkt",
            tag_shop: "Nettbutikk",
            tag_multilingual: "Flerspråklig",
            desired_features: "Ønskede funksjoner på nettsiden"
        },`;

// We inject into `en: {` and `no: {`.
// Since the top level has `nav: {`, `hero: {`, etc., we can just find `nav: {` and prepend these objects!

trans = trans.replace(/en:\s*\{/, 'en: {' + enInserts);
trans = trans.replace(/no:\s*\{/, 'no: {' + noInserts);

// Add to 'about: {' and 'projects: {' blocks
trans = trans.replace('junior_role: "Hilde Karin Knutsen",', 'junior_role: "Hilde Karin Knutsen",\n            some_label: "SoMe",\n            some_desc: "Content and visibility",');
trans = trans.replace('degree: "Help businesses succeed online",', 'mission_label: "Our mission",\n            degree: "Help businesses succeed online",');
trans = trans.replace('p7_desc: "Accounting",', 'p7_desc: "Accounting",\n            mandal_subline: "Accounting, Invoicing, Payroll, and operational support",');

trans = trans.replace('junior_role: "Hilde Karin Knutsen"', 'junior_role: "Hilde Karin Knutsen",\n            some_label: "SoMe",\n            some_desc: "Innhold og synlighet"');
trans = trans.replace('degree: "Hjelpe bedrifter å lykkes på nett",', 'mission_label: "Vår misjon",\n            degree: "Hjelpe bedrifter å lykkes på nett",');
trans = trans.replace('p7_desc: "Regnskap",', 'p7_desc: "Regnskap",\n            mandal_subline: "Regnskap, Fakturering, Lønn og operativ lederstøtte",');

fs.writeFileSync(transPath, trans, 'utf8');
console.log("Updated translations.js!");

