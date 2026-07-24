import React, { useState, useEffect, startTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// --- Configuration & Constants ---

const SCORE_DEFINITIONS = [
  { key: 'performance', label: 'Ytelse', color: '#ff6b35', baseOffset: 58 },
  { key: 'accessibility', label: 'Tilgjengelighet', color: '#00a5de', baseOffset: 29 },
  { key: 'bestPractices', label: 'Beste praksis', color: '#ff6b35', baseOffset: 69 },
  { key: 'seo', label: 'SEO', color: '#4ade80', baseOffset: 36 },
];

const METRIC_DEFINITIONS = [
  {
    key: 'largest-contentful-paint',
    label: 'LCP',
    title: 'Største innhold',
    description: 'Hvor raskt hovedinnholdet blir synlig for brukeren.',
  },
  {
    key: 'first-contentful-paint',
    label: 'FCP',
    title: 'Første inntrykk',
    description: 'Når første tekst eller grafikk dukker opp på skjermen.',
  },
  {
    key: 'speed-index',
    label: 'Speed Index',
    title: 'Visuell fremdrift',
    description: 'Hvor fort det synlige innholdet fylles inn i viewporten.',
  },
  {
    key: 'total-blocking-time',
    label: 'TBT',
    title: 'Interaktivitet',
    description: 'Hvor lenge JavaScript blokkerer siden før klikk og scrolling svarer.',
  },
  {
    key: 'cumulative-layout-shift',
    label: 'CLS',
    title: 'Visuell stabilitet',
    description: 'Hvor mye layouten hopper mens siden lastes inn.',
  },
];

const DEFAULT_FIXES = [
  {
    title: 'Optimaliser bildene',
    description: 'Bruk WebP eller AVIF, riktig størrelse og lazy loading på alt som ikke er kritisk.',
    icon: 'image',
    categoryKey: 'performance',
    impact: 'Høy impact',
    impactColor: 'bg-red-50 text-red-600 border-red-100',
    number: '1',
    bgColor: 'bg-primary-container text-on-primary'
  },
  {
    title: 'Fjern blokkerende kode',
    description: 'Last inn unødvendig JavaScript og CSS senere, ikke før første skjermbilde.',
    icon: 'code',
    categoryKey: 'performance',
    impact: 'Medium impact',
    impactColor: 'bg-orange-50 text-orange-600 border-orange-100',
    number: '2',
    bgColor: 'bg-tertiary-container text-on-tertiary'
  },
  {
    title: 'Reserver plass i layouten',
    description: 'Gi bilder, embeds og dynamiske moduler faste dimensjoner så innholdet ikke hopper.',
    icon: 'aspect_ratio',
    categoryKey: 'performance',
    impact: 'Lav impact',
    impactColor: 'bg-green-50 text-green-600 border-green-100',
    number: '3',
    bgColor: 'bg-surface-container-highest text-on-surface-variant'
  },
];

const CATEGORY_CONFIG = {
  performance: { label: 'Ytelse', icon: 'bolt', basePriority: 320 },
  accessibility: { label: 'Tilgjengelighet', icon: 'verified', basePriority: 240 },
  bestPractices: { label: 'Beste praksis', icon: 'gavel', basePriority: 200 },
  seo: { label: 'SEO', icon: 'analytics', basePriority: 180 },
};

const CATEGORY_FALLBACK_FIXES = {
  performance: DEFAULT_FIXES,
  accessibility: [
    {
      title: 'Rydd opp i kontrast og fokus',
      description: 'Sørg for nok kontrast, tydelig fokusstil og at viktige knapper faktisk kan brukes uten mus.',
      icon: 'contrast',
      categoryKey: 'accessibility',
      impact: 'Høy impact',
      impactColor: 'bg-red-50 text-red-600 border-red-100',
      number: '1',
      bgColor: 'bg-primary-container text-on-primary'
    },
    {
      title: 'Gjør etiketter og navn tydelige',
      description: 'Pass på at skjemaer, knapper og lenker har samme mening visuelt og for hjelpemidler.',
      icon: 'label',
      categoryKey: 'accessibility',
      impact: 'Medium impact',
      impactColor: 'bg-orange-50 text-orange-600 border-orange-100',
      number: '2',
      bgColor: 'bg-tertiary-container text-on-tertiary'
    },
    {
      title: 'Test hovedflytene med tastatur',
      description: 'Gå gjennom meny, skjema og CTA-er uten mus før du lanserer nye sider eller kampanjer.',
      icon: 'keyboard',
      categoryKey: 'accessibility',
      impact: 'Lav impact',
      impactColor: 'bg-green-50 text-green-600 border-green-100',
      number: '3',
      bgColor: 'bg-surface-container-highest text-on-surface-variant'
    },
  ],
  bestPractices: [
    {
      title: 'Rydd opp i konsollfeil og varsler',
      description: 'Tekniske feil i nettleseren skjuler ofte følgeproblemer og bør bort før du finjusterer videre.',
      icon: 'terminal',
      categoryKey: 'bestPractices',
      impact: 'Høy impact',
      impactColor: 'bg-red-50 text-red-600 border-red-100',
      number: '1',
      bgColor: 'bg-primary-container text-on-primary'
    },
    {
      title: 'Stram opp tredjepartsskript',
      description: 'Fjern eller utsett kode som skaper unødvendig risiko, støy eller ustabilitet i første last.',
      icon: 'extension',
      categoryKey: 'bestPractices',
      impact: 'Medium impact',
      impactColor: 'bg-orange-50 text-orange-600 border-orange-100',
      number: '2',
      bgColor: 'bg-tertiary-container text-on-tertiary'
    },
    {
      title: 'Oppdater tekniske standarder',
      description: 'Bruk moderne mønstre og rydd bort utdaterte løsninger som svekker tillit og vedlikeholdbarhet.',
      icon: 'upgrade',
      categoryKey: 'bestPractices',
      impact: 'Lav impact',
      impactColor: 'bg-green-50 text-green-600 border-green-100',
      number: '3',
      bgColor: 'bg-surface-container-highest text-on-surface-variant'
    },
  ],
  seo: [
    {
      title: 'Spiss titler og beskrivelser',
      description: 'Gjør det tydeligere hva siden handler om i søk, delinger og landingsøyeblikket.',
      icon: 'subtitles',
      categoryKey: 'seo',
      impact: 'Høy impact',
      impactColor: 'bg-red-50 text-red-600 border-red-100',
      number: '1',
      bgColor: 'bg-primary-container text-on-primary'
    },
    {
      title: 'Forbedre innholdsstrukturen',
      description: 'Sørg for at overskrifter, hierarki og lenker peker tydelig mot det viktigste innholdet.',
      icon: 'format_align_left',
      categoryKey: 'seo',
      impact: 'Medium impact',
      impactColor: 'bg-orange-50 text-orange-600 border-orange-100',
      number: '2',
      bgColor: 'bg-tertiary-container text-on-tertiary'
    },
    {
      title: 'Prioriter mobil tydelighet',
      description: 'SEO taper fort verdi når innholdet blir tregt eller utydelig på mobil der brukeren møter deg først.',
      icon: 'smartphone',
      categoryKey: 'seo',
      impact: 'Lav impact',
      impactColor: 'bg-green-50 text-green-600 border-green-100',
      number: '3',
      bgColor: 'bg-surface-container-highest text-on-surface-variant'
    },
  ],
};

const DEFAULT_SPEED_TEST_COPY = {
  hero: {
    kicker: 'PRESTASJONSANALYSE',
    title: 'Se hvorfor nettsiden taper fart før kunden gjør det.',
    urlPlaceholder: 'Skriv inn din URL (f.eks. eksempel.no)',
    submitLabel: 'Kjør Test',
    submitLoadingLabel: 'Kjører test...',
    helperText: 'Gratis analyse av Core Web Vitals på 30 sekunder.',
    mobileLabel: 'Mobil',
    desktopLabel: 'Desktop',
    loadingText: 'Henter Lighthouse-data for mobil og desktop. Dette tar vanligvis 10 til 20 sekunder.',
  },
  preview: {
    title: 'Analyse-oversikt',
    liveLabel: 'NÅTIDSRAPPORT',
    resultLabel: 'KJØRT TEST',
  },
  report: {
    kicker: 'SCOREOVERSIKT',
    title: 'Først får du hele bildet fra testen.',
    summaryIntro: 'Her ser du totalscorene for',
    summaryOutro: 'før du går videre til målinger og tiltak.',
  },
  value: {
    kicker: 'VERDISKAPNING',
    title: 'Ikke bare tall, men tiltak.',
    description:
      'Vi oversetter komplekse tekniske funn til konkrete forretningsmuligheter, og viser nøyaktig hva som hindrer et bedre førsteinntrykk.',
  },
  metrics: {
    kicker: 'CORE WEB VITALS',
    title: 'Målingene som styrer førsteinntrykket.',
  },
  action: {
    kicker: 'HANDLINGSPLAN',
    title: 'Dette ville jeg gjort først for ytelse.',
    description: 'En prioritert liste over tiltakene som vanligvis gir størst utslag først.',
    impactHigh: 'Høy impact',
    impactMedium: 'Medium impact',
    impactLow: 'Lav impact',
  },
  faq: {
    kicker: 'VANLIGE SPØRSMÅL',
    title: 'Det viktigste du lurer på før du tester.',
    items: [
      {
        question: 'Hvor nøyaktig er denne testen?',
        answer: 'Vi bruker Google Lighthouse som datamotor og pakker resultatet om til en tydeligere rapport for ytelse, stabilitet, tilgjengelighet og SEO. Det er industristandard for nettsideanalyse.'
      },
      {
        question: 'Hvorfor varierer poengsummen?',
        answer: 'Nettverk, serverrespons og tredjepartsressurser kan endre seg mellom hver kjøring. Kjør gjerne testen et par ganger for å få et tydeligere gjennomsnittsbilde av prestasjonen.'
      }
    ]
  },
  newsletter: {
    title: 'Få din personlige handlingsplan på e-post.',
    description: 'Vi sender deg en konkret rapport med de viktigste tiltakene og neste steg for siden din.',
    emailPlaceholder: 'Din e-postadresse',
    submitReadyLabel: 'Send meg rapporten',
    submitIdleLabel: 'Kjør testen først',
    submitSendingLabel: 'Sender rapport...',
    note: 'Ved å sende inn godtar du våre vilkår og personvernerklæring.',
  },
  footer: {
    cta: 'La oss starte',
    intro: 'Vi bygger din digitale identitet med skreddersydd webdesign, SEO og SoMe-strategi.',
    copyright: 'Copyright © 2026',
    rights: 'Alle rettigheter forbeholdt.',
    privacy: 'Personvernerklæring',
    accessibility: 'Tilgjengelighetserklæring',
  },
};

const SITE_NAV_ITEMS = [
  { key: 'home', href: '/', label: 'Hjem' },
  { key: 'about', href: '/#about', label: 'Om oss' },
  { key: 'services', href: '/#services', label: 'Tjenester' },
  { key: 'portfolio', href: '/#projects', label: 'Prosjekter' },
  { key: 'contact', href: '/#contact', label: 'Kontakt' },
];

const PREVIEW_REPORT = {
  scores: { performance: 84, accessibility: 92, bestPractices: 81, seo: 90 },
  metrics: [
    { key: 'largest-contentful-paint', label: 'LCP', title: 'Største innhold', value: '2.7 s', status: 'warn', description: 'Hvor raskt hovedinnholdet blir synlig.' },
    { key: 'first-contentful-paint', label: 'FCP', title: 'Første inntrykk', value: '1.4 s', status: 'pass', description: 'Når første tekst eller grafikk dukker opp.' },
    { key: 'speed-index', label: 'SI', title: 'Visuell fremdrift', value: '3.2 s', status: 'warn', description: 'Hvor fort innholdet fylles inn.' },
    { key: 'total-blocking-time', label: 'TBT', title: 'Interaktivitet', value: '180 ms', status: 'warn', description: 'Forsinkelse på brukerens handlinger.' },
    { key: 'cumulative-layout-shift', label: 'CLS', title: 'Visuell stabilitet', value: '0.04', status: 'pass', description: 'Hvor mye elementene flytter på seg.' },
  ],
  topFixes: DEFAULT_FIXES,
};

// --- Helper Functions ---

const clampScore = (val) => Math.max(0, Math.min(100, Math.round(val)));

const getScoreStatus = (score) => {
  if (score >= 90) return 'pass';
  if (score >= 50) return 'warn';
  return 'error';
};

const getAuditStatus = (score) => {
  if (score >= 0.9) return 'pass';
  if (score >= 0.5) return 'warn';
  return 'error';
};

const getHostLabel = (input) => {
  try {
    return new URL(input).hostname.replace(/^www\./, '');
  } catch {
    return input;
  }
};

const getSummaryText = (score, strategy) => {
  const deviceLabel = strategy === 'desktop' ? 'desktop' : 'mobil';
  if (score >= 90) {
    return `Sterk ${deviceLabel}-ytelse. Siden leverer et raskt og troverdig førsteinntrykk.`;
  }
  if (score >= 50) {
    return `Du har et brukbart utgangspunkt, men ${deviceLabel}-opplevelsen taper fortsatt fart på ting som er synlige for brukeren.`;
  }
  return `Her mister du sannsynligvis oppmerksomhet tidlig. Prioriter ${deviceLabel}-opplevelsen før du bruker mer budsjett på trafikk.`;
};

const getAuditImpactScore = (audit, config) => {
  const score = audit?.score ?? 0;
  const rawWeight = Number(config?.basePriority) || 100;
  if (score >= 0.9) return 0;
  const penalty = Math.max(0, 1 - score);
  return Math.round(rawWeight * penalty);
};

const buildMetricList = (audits) =>
  METRIC_DEFINITIONS.map((def) => {
    const audit = audits[def.key];
    const score = audit?.score !== undefined ? audit.score : 0.5;
    return {
      key: def.key,
      label: def.label,
      title: def.title,
      value: audit?.displayValue ?? 'Ikke tilgjengelig',
      description: def.description,
      status: getAuditStatus(score),
    };
  });

const buildTopFixes = (audits) => {
  const fixes = [];
  const performanceAudits = [
    { key: 'modern-image-formats', title: 'Optimaliser bildene', description: 'Bruk WebP eller AVIF og pass på bildekomprimering.', icon: 'image', cat: 'performance', priority: 300 },
    { key: 'render-blocking-resources', title: 'Fjern blokkerende kode', description: 'Utsett CSS og JS som ikke trengs til første skjermbilde.', icon: 'code', cat: 'performance', priority: 280 },
    { key: 'cumulative-layout-shift', title: 'Reserver plass i layouten', description: 'Sett faste dimensjoner på bilder og moduler så innholdet ikke hopper.', icon: 'aspect_ratio', cat: 'performance', priority: 250 }
  ];

  performanceAudits.forEach((candidate) => {
    const audit = audits[candidate.key];
    const impact = getAuditImpactScore(audit, { basePriority: candidate.priority });
    
    let fixImpact = 'Lav impact';
    let impactColor = 'bg-green-50 text-green-600 border-green-100';
    if (impact > 150) {
      fixImpact = 'Høy impact';
      impactColor = 'bg-red-50 text-red-600 border-red-100';
    } else if (impact > 50) {
      fixImpact = 'Medium impact';
      impactColor = 'bg-orange-50 text-orange-600 border-orange-100';
    }

    fixes.push({
      title: candidate.title,
      description: candidate.description,
      icon: candidate.icon,
      categoryKey: candidate.cat,
      impact: fixImpact,
      impactColor,
      number: String(fixes.length + 1),
      bgColor: fixes.length === 0 ? 'bg-primary-container text-on-primary' : fixes.length === 1 ? 'bg-tertiary-container text-on-tertiary' : 'bg-surface-container-highest text-on-surface-variant'
    });
  });

  return fixes.length > 0 ? fixes : DEFAULT_FIXES;
};

const buildReport = (lighthouse, requestedUrl, strategy) => {
  const categories = lighthouse.categories ?? {};
  const audits = lighthouse.audits ?? {};

  const scores = {
    performance: clampScore((categories.performance?.score ?? 0) * 100),
    accessibility: clampScore((categories.accessibility?.score ?? 0) * 100),
    bestPractices: clampScore((categories['best-practices']?.score ?? 0) * 100),
    seo: clampScore((categories.seo?.score ?? 0) * 100),
  };

  return {
    analyzedUrl: getHostLabel(requestedUrl),
    requestedUrl,
    strategy,
    fetchedAt: new Date().toISOString(),
    summary: getSummaryText(scores.performance, strategy),
    scores,
    metrics: buildMetricList(audits),
    topFixes: buildTopFixes(audits),
  };
};

const fetchPagespeedReport = async (requestedUrl, strategy) => {
  const response = await fetch('/api/pagespeed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: requestedUrl,
      strategy,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success || !payload?.data) {
    const nextError = new Error(payload?.error || 'Kunne ikke hente PageSpeed-data.');
    nextError.code = payload?.code || 'pagespeed_request_failed';
    nextError.details = payload?.details || '';
    throw nextError;
  }

  return buildReport(payload.data.lighthouseResult, requestedUrl, strategy);
};

const normalizeUrl = (raw) => {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('missing-url');
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsedUrl = new URL(withProtocol);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('invalid-url');
  const hostname = parsedUrl.hostname.replace(/^www\./, '');
  if (hostname.split('.').length < 2) throw new Error('invalid-url');
  return parsedUrl.toString();
};

const getAnalysisErrorMessage = (requestError) => {
  const code = String(requestError?.code || '').trim().toLowerCase();
  const details = String(requestError?.details || requestError?.message || '').trim();

  if (code === 'invalid_url' || code === 'missing_url') {
    return 'URL-en ser ikke gyldig ut. Sjekk domenet og prøv igjen, for eksempel tk-design.no.';
  }
  if (code === 'missing_api_key') {
    return 'Speed-testen er ikke koblet til Google PageSpeed API ennå. Legg inn en API-nøkkel på serveren for å kjøre tester.';
  }
  if (code === 'quota_exceeded') {
    return 'Google PageSpeed-kvoten er brukt opp akkurat nå. Prøv igjen senere eller oppdater API-nøkkelen.';
  }
  if (code === 'invalid_api_key' || code === 'api_not_configured') {
    return 'Google PageSpeed API er ikke riktig konfigurert på serveren akkurat nå.';
  }
  if (code === 'pagespeed_request_failed' || code === 'invalid_response') {
    return 'Google klarte ikke å levere Lighthouse-data akkurat nå. Prøv igjen om litt.';
  }
  if (code === 'report_build_failed') {
    return 'Lighthouse-data kom tilbake, men rapporten kunne ikke bygges akkurat nå. Prøv igjen om litt.';
  }
  return 'Kunne ikke analysere nettstedet akkurat nå. Prøv igjen om litt.';
};

// --- Core App Component ---

export default function App() {
  const [url, setUrl] = useState('');
  const [strategy, setStrategy] = useState('mobile');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState(null);
  const [activeTab, setActiveTab] = useState('oversikt'); // 'oversikt' | 'analyse' | 'rapporter' | 'support'
  const [reportEmail, setReportEmail] = useState('');
  const [sendingReport, setSendingReport] = useState(false);
  const [reportEmailFeedback, setReportEmailFeedback] = useState(null);
  
  // Simulated stats for interactive ROI calculator
  const [monthlyTraffic, setMonthlyTraffic] = useState(15000);
  const [conversionRate, setConversionRate] = useState(2.2);
  const [speedImprovement, setSpeedImprovement] = useState(1.5);

  const pageCopy = DEFAULT_SPEED_TEST_COPY;

  // Retrieve previous email preference
  useEffect(() => {
    setReportEmail(window.localStorage.getItem('speed_test_report_email') || '');
  }, []);

  // Sync URL search param if present on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryUrl = params.get('url');
    if (queryUrl) {
      const cleaned = queryUrl.trim();
      setUrl(cleaned);
      testSite(null, cleaned);
    }
  }, []);

  // Simulate progress bar count-up
  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return undefined;
    }
    setProgress(12);
    const timer = window.setInterval(() => {
      setProgress((curr) => {
        if (curr >= 92) return curr;
        return Math.min(92, curr + Math.max(3, Math.round((92 - curr) * 0.18)));
      });
    }, 420);
    return () => window.clearInterval(timer);
  }, [loading]);

  const testSite = async (event, urlOverride) => {
    event?.preventDefault();
    const targetUrl = urlOverride || url;
    if (!targetUrl.trim()) {
      setError('Skriv inn en nettadresse for å starte.');
      return;
    }

    let normalized;
    try {
      normalized = normalizeUrl(targetUrl);
    } catch {
      setError('Lim inn en gyldig URL, for eksempel tk-design.no.');
      return;
    }

    setLoading(true);
    setError(null);
    setReports(null);
    setReportEmailFeedback(null);

    try {
      const [mobileReport, desktopReport] = await Promise.all([
        fetchPagespeedReport(normalized, 'mobile'),
        fetchPagespeedReport(normalized, 'desktop'),
      ]);
      setProgress(100);
      startTransition(() => {
        setReports({
          mobile: mobileReport,
          desktop: desktopReport,
        });
        setActiveTab('oversikt');
      });
    } catch (requestError) {
      console.error(requestError);
      setError(getAnalysisErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleSendReportEmail = async () => {
    if (!reports) {
      setReportEmailFeedback({ type: 'error', message: 'Kjør testen først for å sende rapporten.' });
      return;
    }
    const email = reportEmail.trim().toLowerCase();
    if (!email || !EMAIL_PATTERN.test(email)) {
      setReportEmailFeedback({ type: 'error', message: 'Legg inn en gyldig e-postadresse.' });
      return;
    }

    setSendingReport(true);
    setReportEmailFeedback(null);

    try {
      const response = await fetch('/api/speed-test/report-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: reports,
          recipientEmail: email,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Kunne ikke sende e-post.');
      }
      window.localStorage.setItem('speed_test_report_email', email);
      setReportEmailFeedback({ type: 'success', message: 'Handlingsplanen har blitt sendt til din e-post!' });
    } catch (e) {
      setReportEmailFeedback({ type: 'error', message: e.message || 'Kunne ikke sende e-post akkurat nå.' });
    } finally {
      setSendingReport(false);
    }
  };

  const hasResults = Boolean(reports?.mobile && reports?.desktop);
  const activeReport = reports?.[strategy] ?? PREVIEW_REPORT;

  // Compute average of current strategy scores
  const avgScore = Math.round(
    (activeReport.scores.performance +
      activeReport.scores.accessibility +
      activeReport.scores.bestPractices +
      activeReport.scores.seo) / 4
  );

  // ROI Calculator Math
  const oldConversionRate = conversionRate;
  const newConversionRate = parseFloat((conversionRate * (1 + (speedImprovement * 0.1))).toFixed(2));
  const currentLeads = Math.round(monthlyTraffic * (oldConversionRate / 100));
  const expectedLeads = Math.round(monthlyTraffic * (newConversionRate / 100));
  const extraLeads = expectedLeads - currentLeads;
  const leadValue = 750;
  const potentialSavings = extraLeads * leadValue;

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-container selection:text-white">
      <AnimatePresence mode="wait">
        {!hasResults ? (
          // ==================== LANDING VIEW (DESIGN 1) ====================
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen"
          >
            {/* Top Navbar */}
            <header className="header">
              <div className="container nav-container">
                <a href="/" className="logo" aria-label="tk-design">
                  <span className="logo-icon">
                    <img src="/img/logo/d.webp" alt="tk-design logo" />
                  </span>
                  <span className="logo-text">tk-design</span>
                </a>
                <nav className="nav-desktop">
                  <ul>
                    <li><a href="/" data-i18n="nav.home">Hjem</a></li>
                    <li><a href="/?section=about" data-i18n="nav.about">Om oss</a></li>
                    <li className="has-dropdown">
                      <a href="/?section=services" data-i18n="nav.services">Tjenester <i className="fas fa-chevron-down nav-chevron"></i></a>
                      <ul className="submenu">
                        <li><a href="/?section=services" data-i18n="nav.sub_webdesign">Webdesign & Utvikling</a></li>
                        <li><a href="/?section=services" data-i18n="nav.sub_seo">SEO-Grunnoppsett</a></li>
                        <li><a href="/contact?service=support" data-i18n="nav.sub_support">Support & Drift</a></li>
                        <li><a href="/nettside-sjekker" data-i18n="nav.sub_analyzer">Nettside-sjekker</a></li>
                      </ul>
                    </li>
                    <li><a href="/?section=projects" data-i18n="nav.portfolio">Prosjekter</a></li>
                    <li><a href="/blog" data-i18n="nav.blog">Aktuelt</a></li>
                    <li><a href="/contact" data-i18n="nav.contact">Kontakt</a></li>
                  </ul>
                </nav>
                <div className="lang-switch-desktop">
                  <button className="lang-btn">EN</button>
                  <button className="lang-btn active">NO</button>
                </div>
              </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-6 flex-grow">
              {/* Hero Section */}
              <section className="py-20 flex flex-col items-center text-center">
                <span className="text-primary font-label-bold text-label-bold mb-4 uppercase tracking-widest">
                  {pageCopy.hero.kicker}
                </span>
                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg max-w-4xl mb-6 leading-tight">
                  {pageCopy.hero.title}
                </h1>
                
                <form
                  onSubmit={testSite}
                  className="w-full max-w-2xl bg-surface-container-lowest p-2 rounded-xl shadow-sm border border-outline-variant flex flex-col md:flex-row gap-2 mb-4"
                >
                  <div className="flex-grow flex items-center px-4">
                    <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                    <input
                      className="w-full border-none focus:outline-none focus:ring-0 bg-transparent py-4 font-body-md"
                      placeholder={pageCopy.hero.urlPlaceholder}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      type="text"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-on-primary px-10 py-4 rounded-lg font-label-bold text-label-bold flex items-center justify-center gap-2 hover:brightness-110 hover:scale-[1.01] transition-all active:scale-[0.98] cursor-pointer disabled:opacity-80"
                  >
                    <span className="material-symbols-outlined">{loading ? 'sync' : 'bolt'}</span>
                    {loading ? pageCopy.hero.submitLoadingLabel : pageCopy.hero.submitLabel}
                  </button>
                </form>
                
                <p className="text-on-surface-variant text-body-md mb-8">{pageCopy.hero.helperText}</p>

                {/* Loading State Overlay */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg bg-surface-container p-6 rounded-xl border border-outline-variant/60 shadow-sm"
                  >
                    <div className="w-full bg-surface-container-highest rounded-full h-3 mb-4 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm font-label-bold text-primary mb-1">
                      Analyserer... {progress}%
                    </p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {pageCopy.hero.loadingText}
                    </p>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg bg-error-container/20 text-error border border-error-container p-4 rounded-xl flex items-center gap-3 text-left"
                  >
                    <span className="material-symbols-outlined text-error">error</span>
                    <p className="text-sm font-body-md text-on-error-container">{error}</p>
                  </motion.div>
                )}
              </section>

              {/* Bento Scores (Default state preview) */}
              <section className="pb-20">
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
                    {SCORE_DEFINITIONS.map(({ key, label, color, baseOffset }) => {
                      const scoreVal = PREVIEW_REPORT.scores[key];
                      return (
                        <div key={key} className="flex flex-col items-center justify-center p-4">
                          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                            <svg className="w-full h-full -rotate-90">
                              <circle cx="64" cy="64" fill="none" r="58" stroke="#e0e3e5" strokeWidth="8"></circle>
                              <circle
                                className="circle-progress"
                                cx="64"
                                cy="64"
                                fill="none"
                                r="58"
                                stroke={color}
                                strokeDasharray="364.4"
                                strokeDashoffset={baseOffset}
                                strokeWidth="8"
                              ></circle>
                            </svg>
                            <span className="absolute font-stats-number text-stats-number text-on-surface">{scoreVal}</span>
                          </div>
                          <span className="font-label-bold text-label-bold text-on-surface-variant uppercase">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Core Web Vitals Overview Section */}
              <section className="py-20 bg-surface-container-low -mx-6 px-6 rounded-2xl">
                <div className="max-w-[1200px] mx-auto">
                  <div className="text-center mb-16">
                    <span className="text-primary font-label-bold text-label-bold uppercase mb-4 block">
                      {pageCopy.metrics.kicker}
                    </span>
                    <h2 className="font-headline-md text-headline-md">{pageCopy.metrics.title}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {PREVIEW_REPORT.metrics.map((metric) => (
                      <div
                        key={metric.key}
                        className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-lg transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-primary-container/10 text-primary-container px-2.5 py-1 rounded text-xs font-bold uppercase">
                            {metric.label}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded border font-semibold ${
                              metric.status === 'pass'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : metric.status === 'warn'
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {metric.status === 'pass' ? 'Bra' : 'Se på dette'}
                          </span>
                        </div>
                        <p className="font-stats-number text-stats-number mb-2">{metric.value}</p>
                        <p className="font-body-md text-on-surface-variant text-sm">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Action Plan Section */}
              <section className="py-20">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3">
                    <span className="text-primary font-label-bold text-label-bold uppercase mb-4 block">
                      {pageCopy.action.kicker}
                    </span>
                    <h2 className="font-headline-md text-headline-md mb-4">{pageCopy.action.title}</h2>
                    <p className="text-on-surface-variant body-lg mb-8">{pageCopy.action.description}</p>
                    <div className="p-6 bg-surface-container rounded-xl border border-outline-variant">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                          <span className="material-symbols-outlined text-2xl">lightbulb</span>
                        </div>
                        <div>
                          <p className="font-label-bold text-label-bold text-primary">Proff-tips</p>
                          <p className="text-sm text-on-surface-variant">
                            Små endringer i bildeformat kan ofte redusere lastetid med 50%.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-2/3 flex flex-col gap-4">
                    {PREVIEW_REPORT.topFixes.map((fix) => (
                      <div
                        key={fix.title}
                        className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col md:flex-row items-center gap-6 hover:translate-x-2 transition-transform cursor-pointer"
                      >
                        <div
                          className={`w-12 h-12 rounded-full font-stats-number text-2xl flex items-center justify-center shrink-0 ${fix.bgColor}`}
                        >
                          {fix.number}
                        </div>
                        <div className="flex-grow text-center md:text-left">
                          <h3 className="font-headline-sm text-headline-sm mb-1">{fix.title}</h3>
                          <p className="text-on-surface-variant text-sm">{fix.description}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border uppercase shrink-0 ${fix.impactColor}`}
                        >
                          {fix.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section className="py-20 border-t border-outline-variant">
                <div className="text-center mb-16">
                  <span className="text-primary font-label-bold text-label-bold uppercase mb-4 block">
                    {pageCopy.faq.kicker}
                  </span>
                  <h2 className="font-headline-md text-headline-md">{pageCopy.faq.title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pageCopy.faq.items.map((item, idx) => (
                    <div key={idx} className="bg-surface-container-low p-6 rounded-xl">
                      <h4 className="font-headline-sm text-headline-sm mb-2 flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined font-semibold">
                          {idx === 0 ? 'verified' : 'analytics'}
                        </span>
                        {item.question}
                      </h4>
                      <p className="text-on-surface-variant body-lg">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Email Form CTA Banner */}
              <section className="mb-20">
                <div className="bg-inverse-surface text-on-surface-variant rounded-2xl p-8 md:p-16 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="md:w-1/2">
                      <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-4">
                        {pageCopy.newsletter.title}
                      </h2>
                      <p className="text-surface-variant body-lg">{pageCopy.newsletter.description}</p>
                    </div>
                    <div className="md:w-5/12 w-full">
                      <div className="bg-surface-container-highest/10 border border-surface-variant/20 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center bg-white rounded-lg px-4 border border-outline-variant focus-within:ring-2 ring-primary transition-all">
                            <span className="material-symbols-outlined text-on-surface-variant">mail</span>
                            <input
                              className="w-full border-none focus:outline-none focus:ring-0 py-4 px-3 font-body-md text-on-surface"
                              placeholder={pageCopy.newsletter.emailPlaceholder}
                              value={reportEmail}
                              onChange={(e) => setReportEmail(e.target.value)}
                              type="email"
                              disabled={sendingReport}
                            />
                          </div>
                          
                          <button
                            onClick={handleSendReportEmail}
                            disabled={sendingReport}
                            className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-bold text-label-bold hover:brightness-110 transition-all shadow-lg active:scale-[0.98] disabled:opacity-75 cursor-pointer"
                          >
                            {sendingReport ? pageCopy.newsletter.submitSendingLabel : pageCopy.newsletter.submitReadyLabel}
                          </button>

                          {reportEmailFeedback && (
                            <p
                              className={`text-sm text-center font-semibold ${
                                reportEmailFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {reportEmailFeedback.message}
                            </p>
                          )}
                          <p className="text-xs text-center text-surface-variant">{pageCopy.newsletter.note}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>

            {/* Footer */}
            <footer className="footer pt_120 pb_120" style={{ borderTop: '1px solid var(--clr-border)' }}>
              <div className="container">
                <div className="footer-cta">
                  <h2 data-i18n="footer.cta">La oss starte</h2>
                </div>

                <div className="footer-content">
                  <div className="footer-info">
                    <p style={{ fontSize: '20px', color: 'var(--clr-base)', marginBottom: '20px' }} data-i18n="footer.intro">
                      Vi bygger din digitale identitet med skreddersydd webdesign, SEO og SoMe-strategi.
                    </p>
                    <a
                      href="mailto:thomas@tk-design.no"
                      style={{ fontSize: '30px', textDecoration: 'underline', color: 'var(--clr-base)' }}
                      data-i18n="contact.email_val"
                    >
                      thomas@tk-design.no
                    </a>
                  </div>

                  <div className="footer-links" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <a
                      href="https://www.facebook.com/profile.php?id=61574614704737&amp;locale=nb_NO"
                      className="social-link"
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                    >
                      Facebook <i className="fas fa-arrow-right"></i>
                    </a>
                    <a
                      href="https://www.instagram.com/tkdesign777"
                      className="social-link"
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                    >
                      Instagram <i className="fas fa-arrow-right"></i>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/thomas-knutsen-a6aa2793/"
                      className="social-link"
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                    >
                      LinkedIn <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>
                </div>

                <div
                  className="flex flex-wrap justify-between items-center"
                  style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '30px' }}
                >
                  <p>
                    <span data-i18n="footer.copyright">Copyright © 2026</span>{' '}
                    <a href="/" style={{ color: 'var(--clr-base)' }}>
                      TK-design
                    </a>{' '}
                    <span data-i18n="footer.rights">All rights reserved.</span>
                  </p>
                  <div className="flex gap-4">
                    <a href="/accessibility" style={{ color: 'var(--clr-base)' }} data-i18n="footer.accessibility">
                      Accessibility Statement
                    </a>
                    <a href="/privacy" style={{ color: 'var(--clr-base)' }} data-i18n="footer.privacy">
                      Privacy Policy
                    </a>
                    <a href="/admin/" className="admin-secret" style={{ color: '#777', fontSize: '0.8em' }}>
                      Admin
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : (
          // ==================== DASHBOARD VIEW (DESIGN 2) ====================
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-background text-on-background flex"
          >
            {/* Sidebar Navigation */}
            <aside className="w-64 fixed left-0 top-0 h-screen bg-surface-container-low flex flex-col py-6 px-4 border-r border-outline-variant/30 shadow-sm">
              <div className="mb-8 px-2">
                <div className="flex items-center gap-2">
                  <img src="/img/logo/d.webp" alt="tk-design logo" className="w-8 h-8 object-contain rounded-md" />
                  <h1 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">InsightEngine</h1>
                </div>
                <p className="font-label-md text-label-md text-secondary opacity-70">tk-design.no • Analyse</p>
              </div>

              <nav className="flex-1 space-y-1">
                <button
                  onClick={() => setActiveTab('oversikt')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'oversikt'
                      ? 'bg-surface-container-highest text-primary border-r-4 border-primary'
                      : 'text-secondary hover:bg-surface-container-highest/50'
                  }`}
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <span className="font-label-md text-label-md">Oversikt</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('analyse')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'analyse'
                      ? 'bg-surface-container-highest text-primary border-r-4 border-primary'
                      : 'text-secondary hover:bg-surface-container-highest/50'
                  }`}
                >
                  <span className="material-symbols-outlined">analytics</span>
                  <span className="font-label-md text-label-md">Analyse</span>
                </button>

                <button
                  onClick={() => setActiveTab('rapporter')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'rapporter'
                      ? 'bg-surface-container-highest text-primary border-r-4 border-primary'
                      : 'text-secondary hover:bg-surface-container-highest/50'
                  }`}
                >
                  <span className="material-symbols-outlined">assessment</span>
                  <span className="font-label-md text-label-md">Rapporter</span>
                </button>

                <button
                  onClick={() => setActiveTab('support')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'support'
                      ? 'bg-surface-container-highest text-primary border-r-4 border-primary'
                      : 'text-secondary hover:bg-surface-container-highest/50'
                  }`}
                >
                  <span className="material-symbols-outlined">support_agent</span>
                  <span className="font-label-md text-label-md">Support / FAQ</span>
                </button>
              </nav>

              <div className="mt-auto pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => setReports(null)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-surface-container-highest transition-all text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span className="font-label-md text-label-md">Kjør ny sjekk</span>
                </button>
              </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
              {/* Header */}
              <header className="bg-surface border-b border-outline-variant/30 sticky top-0 z-40">
                <div className="flex justify-between items-center px-8 py-4 w-full">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setReports(null)}
                      className="p-2 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
                      title="Tilbake til forsiden"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                        <span>Rapport:</span>
                        <span className="text-secondary">{activeReport.analyzedUrl}</span>
                      </h2>
                      <p className="text-xs text-on-surface-variant font-semibold">Generert fra Google PageSpeed Insights</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Strategy Toggles */}
                    <div className="bg-surface-container p-1 rounded-xl flex gap-1 border border-outline-variant/40">
                      <button
                        onClick={() => setStrategy('mobile')}
                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          strategy === 'mobile'
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'text-secondary hover:text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">smartphone</span>
                        Mobil
                      </button>
                      <button
                        onClick={() => setStrategy('desktop')}
                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          strategy === 'desktop'
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'text-secondary hover:text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">computer</span>
                        Desktop
                      </button>
                    </div>

                    <div className="w-px h-6 bg-outline-variant"></div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm">
                        TK
                      </div>
                      <span className="font-label-md text-label-md text-primary font-bold">Thomas Knutsen</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Tab Contents */}
              <main className="p-8 flex-grow max-w-[1200px] w-full mx-auto">
                {activeTab === 'oversikt' && (
                  // ==================== TAB: OVERSIKT ====================
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-surface-container-lowest p-6 rounded-xl card-elevation border border-outline-variant/10 group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">Gjennomsnittsscore</p>
                            <h3 className="font-headline-md text-headline-md font-bold text-primary">{avgScore} / 100</h3>
                          </div>
                          <div className="p-2 bg-primary/5 rounded-lg text-primary shrink-0">
                            <span className="material-symbols-outlined">dashboard</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className={`font-bold flex items-center ${avgScore >= 90 ? 'text-green-600' : avgScore >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                            <span className="material-symbols-outlined text-[14px] mr-0.5 font-semibold">
                              {avgScore >= 50 ? 'trending_up' : 'trending_down'}
                            </span>
                            {avgScore >= 90 ? 'God standard' : avgScore >= 50 ? 'Kan optimaliseres' : 'Kritisk tiltak trengs'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-surface-container-lowest p-6 rounded-xl card-elevation border border-outline-variant/10 group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">Lastetid (LCP)</p>
                            <h3 className="font-headline-md text-headline-md font-bold text-primary font-stats-number">
                              {activeReport.metrics.find(m => m.label === 'LCP')?.value || '2.7 s'}
                            </h3>
                          </div>
                          <div className="p-2 bg-tertiary-fixed/30 rounded-lg text-on-tertiary-fixed-variant shrink-0">
                            <span className="material-symbols-outlined">schedule</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold">
                          <span className="text-secondary font-bold">Hastighet for visning</span>
                        </div>
                      </div>

                      <div className="bg-surface-container-lowest p-6 rounded-xl card-elevation border border-outline-variant/10 group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">Interaktivitet (TBT)</p>
                            <h3 className="font-headline-md text-headline-md font-bold text-primary font-stats-number">
                              {activeReport.metrics.find(m => m.label === 'TBT')?.value || '180 ms'}
                            </h3>
                          </div>
                          <div className="p-2 bg-secondary-container rounded-lg text-secondary shrink-0">
                            <span className="material-symbols-outlined">bolt</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold">
                          <span className="text-on-secondary-container font-bold">Responsiv side</span>
                        </div>
                      </div>

                      <div className="bg-surface-container-lowest p-6 rounded-xl card-elevation border border-outline-variant/10 group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">Stabilitet (CLS)</p>
                            <h3 className="font-headline-md text-headline-md font-bold text-primary font-stats-number">
                              {activeReport.metrics.find(m => m.label === 'CLS')?.value || '0.04'}
                            </h3>
                          </div>
                          <div className="p-2 bg-surface-container-highest rounded-lg text-primary shrink-0">
                            <span className="material-symbols-outlined">layers</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold">
                          <span className="text-primary font-bold">Ingen uventede hopp</span>
                        </div>
                      </div>
                    </div>

                    {/* Bento Circle Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
                      {SCORE_DEFINITIONS.map(({ key, label, color }) => {
                        const scoreVal = activeReport.scores[key];
                        const circ = 364.4;
                        const dashOffset = circ * (1 - scoreVal / 100);
                        return (
                          <div key={key} className="flex flex-col items-center justify-center p-4">
                            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                              <svg className="w-full h-full -rotate-90">
                                <circle cx="64" cy="64" fill="none" r="58" stroke="#e0e3e5" strokeWidth="8"></circle>
                                <circle
                                  className="circle-progress"
                                  cx="64"
                                  cy="64"
                                  fill="none"
                                  r="58"
                                  stroke={color}
                                  strokeDasharray="364.4"
                                  strokeDashoffset={dashOffset}
                                  strokeWidth="8"
                                ></circle>
                              </svg>
                              <span className="absolute font-stats-number text-stats-number text-on-surface">{scoreVal}</span>
                            </div>
                            <span className="font-label-bold text-label-bold text-on-surface-variant uppercase">{label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* SVG Chart & Smart Tips */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Growth / Performance Profile Chart */}
                      <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl card-elevation border border-outline-variant/10">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Simulert innlastingsprofil</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Viser visuell fullføring per sekund under lasting</p>
                          </div>
                        </div>
                        <div className="relative h-64 w-full">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 800 300">
                            {/* Grid lines */}
                            <line stroke="#f2f4f6" strokeWidth="1" x1="0" x2="800" y1="50" y2="50"></line>
                            <line stroke="#f2f4f6" strokeWidth="1" x1="0" x2="800" y1="125" y2="125"></line>
                            <line stroke="#f2f4f6" strokeWidth="1" x1="0" x2="800" y1="200" y2="200"></line>
                            <line stroke="#f2f4f6" strokeWidth="1" x1="0" x2="800" y1="275" y2="275"></line>
                            {/* Smooth Area Chart Path */}
                            <path
                              fill="rgba(171, 53, 0, 0.08)"
                              d="M0,280 C100,270 150,210 200,200 C250,190 300,100 400,80 C500,60 600,120 700,90 L800,40 L800,300 L0,300 Z"
                            ></path>
                            <path
                              d="M0,280 C100,270 150,210 200,200 C250,190 300,100 400,80 C500,60 600,120 700,90 L800,40"
                              fill="none"
                              stroke="#ab3500"
                              strokeLinecap="round"
                              strokeWidth="3"
                            ></path>
                            <circle cx="200" cy="200" fill="white" stroke="#ab3500" strokeWidth="2" r="4"></circle>
                            <circle cx="400" cy="80" fill="white" stroke="#ab3500" strokeWidth="2" r="4"></circle>
                            <circle cx="800" cy="40" fill="white" stroke="#ab3500" strokeWidth="2" r="4"></circle>
                          </svg>
                          <div className="flex justify-between mt-4 text-xs font-semibold text-on-surface-variant/50">
                            <span>0s (Start)</span>
                            <span>1s (FCP)</span>
                            <span>2s</span>
                            <span>3s (LCP)</span>
                            <span>4s</span>
                            <span>5s+ (Ferdig)</span>
                          </div>
                        </div>
                      </div>

                      {/* Smart Tips */}
                      <div className="bg-surface-container-lowest p-6 rounded-xl card-elevation border border-outline-variant/10 flex flex-col justify-between">
                        <div>
                          <h3 className="font-headline-sm text-headline-sm font-bold text-primary mb-6">Smarte tips</h3>
                          <div className="space-y-4">
                            <div className="p-4 bg-tertiary-fixed/10 border-l-4 border-on-tertiary-container rounded-r-lg">
                              <div className="flex items-center gap-1 text-on-tertiary-container mb-1">
                                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                                <span className="font-label-bold text-label-bold text-xs uppercase tracking-wider font-semibold">Optimalisering</span>
                              </div>
                              <p className="font-body-sm text-body-sm text-primary font-bold mb-0.5">Bildekomprimering utgjør mest</p>
                              <p className="text-xs text-secondary leading-relaxed">
                                {activeReport.scores.performance < 90 
                                  ? 'Siden din taper fart på tunge bildeelementer. Å bytte til WebP/AVIF vil løfte ytelsesscoren din vesentlig.'
                                  : 'Bildene dine ser greie ut, men sjekk om du kan spare mer ved å lazy-loade elementer under folden.'}
                              </p>
                            </div>
                            <div className="p-4 bg-secondary-container/20 border-l-4 border-secondary rounded-r-lg">
                              <div className="flex items-center gap-1 text-secondary mb-1">
                                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                                <span className="font-label-bold text-label-bold text-xs uppercase tracking-wider font-semibold">Vekstmulighet</span>
                              </div>
                              <p className="font-body-sm text-body-sm text-primary font-bold mb-0.5">Lavere bounce-rate</p>
                              <p className="text-xs text-secondary leading-relaxed">
                                Hvert sekund spart øker konverteringsraten på landingssiden din med opptil 10%.
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('analyse')}
                          className="w-full mt-6 py-3 border border-outline-variant rounded-lg text-label-md font-label-md text-primary hover:bg-surface-container-low transition-colors active:scale-95 text-sm cursor-pointer"
                        >
                          Se dypere analyse
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'analyse' && (
                  // ==================== TAB: ANALYSE & ROI SIMULATOR ====================
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Interactive ROI Calculator */}
                    <div className="bg-surface-container-lowest p-6 rounded-xl card-elevation border border-outline-variant/10">
                      <div className="flex items-center gap-2 mb-4 text-primary">
                        <span className="material-symbols-outlined">calculate</span>
                        <h3 className="font-headline-sm text-headline-sm font-bold">Lønnsomhets- og Konverteringssimulator</h3>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-6 font-semibold">
                        Se hvordan raskere lastetid påvirker konverteringsraten og den økonomiske verdiskapningen på nettstedet ditt direkte.
                      </p>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-6 bg-surface-container-low p-6 rounded-xl border border-outline-variant/40">
                          <div>
                            <label className="block text-xs font-bold text-primary uppercase mb-2">Månedlig Trafikk (besøkende)</label>
                            <input
                              type="range"
                              min="1000"
                              max="100000"
                              step="1000"
                              value={monthlyTraffic}
                              onChange={(e) => setMonthlyTraffic(Number(e.target.value))}
                              className="w-full accent-primary mb-2"
                            />
                            <div className="flex justify-between text-xs font-bold text-on-surface">
                              <span>1 000</span>
                              <span className="text-primary bg-primary/10 px-2 py-0.5 rounded">{monthlyTraffic.toLocaleString('nb-NO')}</span>
                              <span>100 000</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-primary uppercase mb-2">Dagens Konverteringsrate (%)</label>
                            <input
                              type="number"
                              min="0.1"
                              max="20"
                              step="0.1"
                              value={conversionRate}
                              onChange={(e) => setConversionRate(parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-primary uppercase mb-2">Forbedring i Lastetid (sekunder)</label>
                            <input
                              type="range"
                              min="0.2"
                              max="4"
                              step="0.1"
                              value={speedImprovement}
                              onChange={(e) => setSpeedImprovement(parseFloat(e.target.value))}
                              className="w-full accent-primary mb-2"
                            />
                            <div className="flex justify-between text-xs font-bold text-on-surface">
                              <span>0.2s</span>
                              <span className="text-primary bg-primary/10 px-2 py-0.5 rounded">{speedImprovement} s</span>
                              <span>4.0s</span>
                            </div>
                          </div>
                        </div>

                        {/* ROI Results Display */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary-container/[0.04] p-6 rounded-xl border border-primary-container/20">
                          <div className="flex flex-col justify-between p-4 bg-white rounded-xl border border-outline-variant/60">
                            <div>
                              <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Forventet Konverteringsrate</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-stats-number text-primary">{newConversionRate}%</span>
                                <span className="text-xs text-green-600 font-bold">+{Math.round((newConversionRate - oldConversionRate) / oldConversionRate * 100)}% økning</span>
                              </div>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-4 leading-relaxed font-semibold">
                              Basert på gjennomsnittlig forbedring i brukeropplevelsen.
                            </p>
                          </div>

                          <div className="flex flex-col justify-between p-4 bg-white rounded-xl border border-outline-variant/60">
                            <div>
                              <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Ekstra Henvendelser / Salg</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-stats-number text-primary">+{extraLeads}</span>
                                <span className="text-xs text-on-surface-variant font-bold">per måned</span>
                              </div>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-4 leading-relaxed font-semibold">
                              Fra {currentLeads} til {expectedLeads} fullførte konverteringer.
                            </p>
                          </div>

                          <div className="md:col-span-2 flex items-center justify-between p-6 bg-primary text-on-primary rounded-xl">
                            <div>
                              <p className="text-xs uppercase tracking-wider opacity-85 font-bold mb-1">Estimert Årlig Merverdi</p>
                              <h4 className="text-3xl font-stats-number">kr {(potentialSavings * 12).toLocaleString('nb-NO')},-</h4>
                            </div>
                            <span className="material-symbols-outlined text-4xl opacity-80">monetization_on</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Metrics Table */}
                    <div className="bg-surface-container-lowest p-6 rounded-xl card-elevation border border-outline-variant/10">
                      <h3 className="font-headline-sm text-headline-sm font-bold text-primary mb-6">Nøkkelmålinger og tilstand</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-outline-variant text-xs uppercase font-bold text-on-surface-variant/80">
                              <th className="py-3 px-4">Måling</th>
                              <th className="py-3 px-4">Kortnavn</th>
                              <th className="py-3 px-4">Resultat</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Beskrivelse</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeReport.metrics.map((metric) => (
                              <tr key={metric.key} className="border-b border-outline-variant/40 hover:bg-surface-container-low/50">
                                <td className="py-4 px-4 font-bold text-primary">{metric.title}</td>
                                <td className="py-4 px-4"><span className="bg-surface-container-highest px-2 py-0.5 rounded text-xs font-semibold">{metric.label}</span></td>
                                <td className="py-4 px-4 font-stats-number text-base font-bold">{metric.value}</td>
                                <td className="py-4 px-4">
                                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                                    metric.status === 'pass'
                                      ? 'bg-green-50 text-green-700 border-green-200'
                                      : metric.status === 'warn'
                                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                                      : 'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                    {metric.status === 'pass' ? 'Bra' : metric.status === 'warn' ? 'Trenger tiltak' : 'Kritisk'}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-on-surface-variant text-xs max-w-xs font-semibold">{metric.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'rapporter' && (
                  // ==================== TAB: RAPPORTER / EKSPORT ====================
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Action plan checklist */}
                    <div className="bg-surface-container-lowest p-6 rounded-xl card-elevation border border-outline-variant/10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-primary font-label-bold text-label-bold uppercase mb-2 block">
                            ANBEFALTE TILTAK
                          </span>
                          <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Prioritert utbedringsplan</h3>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {activeReport.topFixes.map((fix) => (
                          <div
                            key={fix.title}
                            className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row items-center gap-6 hover:shadow-sm transition-all"
                          >
                            <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-stats-number text-lg flex items-center justify-center shrink-0">
                              {fix.number}
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-headline-sm text-headline-sm mb-1 text-primary">{fix.title}</h4>
                              <p className="text-on-surface-variant text-sm font-semibold">{fix.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase shrink-0 ${fix.impactColor}`}>
                              {fix.impact}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Email report form */}
                    <div className="bg-inverse-surface text-on-surface-variant rounded-2xl p-8 relative overflow-hidden">
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="md:w-1/2">
                          <h3 className="font-headline-md text-headline-md text-white mb-2">Send handlingsplanen til utvikleren din</h3>
                          <p className="text-surface-variant text-sm font-semibold">
                            Vi pakker sammen resultatene og tiltakene til en ryddig PDF/rapport, og sender den direkte til e-posten din.
                          </p>
                        </div>
                        <div className="md:w-5/12 w-full">
                          <div className="bg-surface-container-highest/10 border border-surface-variant/20 rounded-xl p-6 backdrop-blur-sm">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center bg-white rounded-lg px-4 border border-outline-variant focus-within:ring-2 ring-primary transition-all">
                                <span className="material-symbols-outlined text-on-surface-variant">mail</span>
                                <input
                                  className="w-full border-none focus:outline-none focus:ring-0 py-4 px-3 font-body-md text-on-surface"
                                  placeholder="Mottaker e-post"
                                  value={reportEmail}
                                  onChange={(e) => setReportEmail(e.target.value)}
                                  type="email"
                                  disabled={sendingReport}
                                />
                              </div>
                              
                              <button
                                onClick={handleSendReportEmail}
                                disabled={sendingReport}
                                className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-bold text-label-bold hover:brightness-110 transition-all shadow-lg active:scale-[0.98] disabled:opacity-75 cursor-pointer"
                              >
                                {sendingReport ? 'Sender...' : 'Send rapport nå'}
                              </button>

                              {reportEmailFeedback && (
                                <p className={`text-sm text-center font-semibold ${reportEmailFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                  {reportEmailFeedback.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'support' && (
                  // ==================== TAB: SUPPORT / FAQ ====================
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="bg-surface-container-lowest p-6 rounded-xl card-elevation border border-outline-variant/10">
                      <h3 className="font-headline-sm text-headline-sm font-bold text-primary mb-6">Hjelpesenter og Spørsmål</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pageCopy.faq.items.map((item, idx) => (
                          <div key={idx} className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20">
                            <h4 className="font-headline-sm text-headline-sm mb-2 text-primary flex items-center gap-2">
                              <span className="material-symbols-outlined font-semibold">help</span>
                              {item.question}
                            </h4>
                            <p className="text-on-surface-variant leading-relaxed font-semibold">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
