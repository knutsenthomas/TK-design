import React, { startTransition, useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Facebook,
  Gauge,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  Monitor,
  Search,
  Shield,
  Smartphone,
  X,
  Zap,
} from 'lucide-react';

const SCORE_DEFINITIONS = [
  { key: 'performance', label: 'Ytelse' },
  { key: 'accessibility', label: 'Tilgjengelighet' },
  { key: 'bestPractices', label: 'Beste praksis' },
  { key: 'seo', label: 'SEO' },
];

const METRIC_DEFINITIONS = [
  {
    key: 'largest-contentful-paint',
    label: 'LCP',
    title: 'Største innhold',
    description: 'Hvor raskt hovedinnholdet faktisk blir synlig for brukeren.',
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
    icon: Monitor,
  },
  {
    title: 'Fjern blokkerende kode',
    description: 'Last inn unødvendig JavaScript og CSS senere, ikke før første skjermbilde.',
    icon: Gauge,
  },
  {
    title: 'Reserver plass i layouten',
    description: 'Gi bilder, embeds og dynamiske moduler faste dimensjoner så innholdet ikke hopper.',
    icon: Shield,
  },
];

const PAGE_HIGHLIGHTS = [
  {
    title: 'Mobil først',
    text: 'Vi starter med strategien som vanligvis er tregest og mest kritisk for konvertering.',
    icon: Smartphone,
  },
  {
    title: 'Menneskespråk',
    text: 'Tallene fra Lighthouse blir oversatt til tydelige prioriteringer du faktisk kan jobbe med.',
    icon: Gauge,
  },
  {
    title: 'Konkrete neste steg',
    text: 'Rapporten slutter ikke på en score. Den peker på hva som bør ryddes opp først.',
    icon: Shield,
  },
];

const TRUST_POINTS = [
  {
    title: 'Mobil og desktop',
    text: 'Bytt mellom enhetene og se hvor opplevelsen glipper først.',
    icon: Smartphone,
  },
  {
    title: 'Tydelig plan',
    text: 'Du får tre prioriterte grep i stedet for en bunke rådata.',
    icon: Zap,
  },
  {
    title: 'Ingen lagring',
    text: 'Vi henter bare offentlig Lighthouse-data direkte fra Google.',
    icon: Shield,
  },
];

const REPORT_POINTS = [
  'Ytelse viser hvor raskt brukeren faktisk ser og kan bruke siden.',
  'Tilgjengelighet og beste praksis avslører friksjon som også påvirker tillit.',
  'Handlingsplanen er sortert etter grep som vanligvis rydder mest først.',
];

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/?section=about', label: 'About' },
  { href: '/?section=services', label: 'Services' },
  { href: '/?section=projects', label: 'Portfolio' },
  { href: '/?section=testimonial', label: 'Testimonial' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

const SOCIAL_LINKS = [
  {
    href: 'https://www.facebook.com/profile.php?id=61574614704737&locale=nb_NO',
    label: 'Facebook',
    icon: Facebook,
  },
  {
    href: 'https://www.instagram.com/tkdesign777',
    label: 'Instagram',
    icon: Instagram,
  },
  {
    href: 'https://www.linkedin.com/in/thomas-knutsen-a6aa2793/',
    label: 'LinkedIn',
    icon: Linkedin,
  },
];

const PREVIEW_REPORT = {
  analyzedUrl: 'din-side.no',
  strategy: 'mobile',
  fetchedAt: null,
  summary: 'Slik ser en ferdig rapport ut når testen er kjørt.',
  scores: {
    performance: 84,
    accessibility: 92,
    bestPractices: 81,
    seo: 90,
  },
  metrics: [
    {
      key: 'largest-contentful-paint',
      label: 'LCP',
      title: 'Største innhold',
      value: '2.7 s',
      description: 'Hvor raskt hovedinnholdet faktisk blir synlig for brukeren.',
      status: 'warn',
    },
    {
      key: 'first-contentful-paint',
      label: 'FCP',
      title: 'Første inntrykk',
      value: '1.4 s',
      description: 'Når første tekst eller grafikk dukker opp på skjermen.',
      status: 'pass',
    },
    {
      key: 'speed-index',
      label: 'Speed Index',
      title: 'Visuell fremdrift',
      value: '3.2 s',
      description: 'Hvor fort det synlige innholdet fylles inn i viewporten.',
      status: 'warn',
    },
    {
      key: 'total-blocking-time',
      label: 'TBT',
      title: 'Interaktivitet',
      value: '180 ms',
      description: 'Hvor lenge JavaScript blokkerer siden før klikk og scrolling svarer.',
      status: 'warn',
    },
    {
      key: 'cumulative-layout-shift',
      label: 'CLS',
      title: 'Visuell stabilitet',
      value: '0.04',
      description: 'Hvor mye layouten hopper mens siden lastes inn.',
      status: 'pass',
    },
  ],
  topFixes: DEFAULT_FIXES,
};

const getCookie = (name) => {
  if (typeof document === 'undefined') {
    return '';
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : '';
};

const getStrategyLabel = (strategy) => (strategy === 'desktop' ? 'Desktop' : 'Mobil');

const clampScore = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
};

const getScoreTone = (score) => {
  if (score >= 90) {
    return {
      accent: '#19b46b',
      soft: 'rgba(25, 180, 107, 0.14)',
      label: 'Sterk',
    };
  }

  if (score >= 50) {
    return {
      accent: '#ff9e00',
      soft: 'rgba(255, 158, 0, 0.16)',
      label: 'Kan forbedres',
    };
  }

  return {
    accent: '#ef6a4a',
    soft: 'rgba(239, 106, 74, 0.14)',
    label: 'Krever tiltak',
  };
};

const getMetricTone = (status) => {
  if (status === 'pass') {
    return {
      surface: '#eefaf3',
      border: '#cdeedb',
      text: '#18794f',
      dot: '#19b46b',
      pill: 'rgba(25, 180, 107, 0.14)',
      label: 'Bra',
    };
  }

  if (status === 'warn') {
    return {
      surface: '#fff7eb',
      border: '#f2dfbf',
      text: '#c67a00',
      dot: '#ffb02e',
      pill: 'rgba(255, 176, 46, 0.16)',
      label: 'Se på dette',
    };
  }

  return {
    surface: '#fff1ee',
    border: '#f0d0c8',
    text: '#d04b2c',
    dot: '#ef6a4a',
    pill: 'rgba(239, 106, 74, 0.14)',
    label: 'Viktig',
  };
};

const getAuditStatus = (audit) => {
  const score = typeof audit?.score === 'number' ? audit.score : 0;

  if (score >= 0.9) {
    return 'pass';
  }

  if (score >= 0.5) {
    return 'warn';
  }

  return 'error';
};

const getHostLabel = (input) => {
  try {
    return new URL(input).hostname.replace(/^www\./, '');
  } catch {
    return input;
  }
};

const PUBLIC_HOSTNAME_REGEX = /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

const normalizeUrl = (raw) => {
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new Error('missing-url');
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsedUrl = new URL(withProtocol);

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('invalid-url');
  }

  if (!PUBLIC_HOSTNAME_REGEX.test(parsedUrl.hostname.replace(/\.$/, ''))) {
    throw new Error('invalid-url');
  }

  parsedUrl.hash = '';
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

  if (/quota exceeded|resource_exhausted|rate_limit_exceeded/i.test(details)) {
    return 'Google PageSpeed-kvoten er brukt opp akkurat nå. Prøv igjen senere.';
  }

  if (/api key|service_disabled|permission_denied/i.test(details)) {
    return 'Google PageSpeed API er ikke riktig konfigurert på serveren akkurat nå.';
  }

  if (/unable to resolve host|requested url is not available|dns|invalid_argument/i.test(details)) {
    return 'URL-en kunne ikke analyseres. Sjekk at domenet finnes og er offentlig tilgjengelig.';
  }

  return 'Kunne ikke analysere nettstedet akkurat nå. Prøv igjen om litt.';
};

const getSummaryText = (score, strategy) => {
  const deviceLabel = getStrategyLabel(strategy).toLowerCase();

  if (score >= 90) {
    return `Sterk ${deviceLabel}-ytelse. Siden leverer et raskt og troverdig førsteinntrykk.`;
  }

  if (score >= 50) {
    return `Du har et brukbart utgangspunkt, men ${deviceLabel}-opplevelsen taper fortsatt fart på ting som er synlige for brukeren.`;
  }

  return `Her mister du sannsynligvis oppmerksomhet tidlig. Prioriter ${deviceLabel}-opplevelsen før du bruker mer budsjett på trafikk.`;
};

const buildMetricList = (audits) =>
  METRIC_DEFINITIONS.map((definition) => {
    const audit = audits[definition.key];

    return {
      key: definition.key,
      label: definition.label,
      title: definition.title,
      value: audit?.displayValue ?? 'Ikke tilgjengelig',
      description: definition.description,
      status: getAuditStatus(audit),
    };
  });

const buildTopFixes = (audits) => {
  const fixes = [];

  if ((audits['largest-contentful-paint']?.score ?? 1) < 0.9) {
    fixes.push({
      title: 'Få hovedinnholdet raskere på plass',
      description: 'Komprimer hero-medier, prioriter innholdet over bretten og kutt alt som forsinker første skjermbilde.',
      icon: Zap,
    });
  }

  if (
    (audits['unused-javascript']?.score ?? 1) < 0.9 ||
    (audits['render-blocking-resources']?.score ?? 1) < 0.9
  ) {
    fixes.push({
      title: 'Fjern kode som blokkerer visning',
      description: 'Last inn unødvendig JavaScript og CSS senere, og del opp det som faktisk må være med fra start.',
      icon: Gauge,
    });
  }

  if (
    (audits['modern-image-formats']?.score ?? 1) < 0.9 ||
    (audits['uses-optimized-images']?.score ?? 1) < 0.9 ||
    (audits['uses-responsive-images']?.score ?? 1) < 0.9
  ) {
    fixes.push({
      title: 'Optimaliser bildene bedre',
      description: 'Bruk moderne bildeformater, riktige størrelser og unngå at store desktop-bilder sendes til mobil.',
      icon: Monitor,
    });
  }

  if ((audits['cumulative-layout-shift']?.score ?? 1) < 0.9) {
    fixes.push({
      title: 'Stopp elementer som hopper under lasting',
      description: 'Gi bilder, moduler og embeds reserverte dimensjoner før innholdet lastes inn.',
      icon: Shield,
    });
  }

  if ((audits['server-response-time']?.score ?? 1) < 0.9) {
    fixes.push({
      title: 'Reduser ventetiden fra serveren',
      description: 'Se på hosting, caching og tunge integrasjoner som forsinker første svar fra serveren.',
      icon: Search,
    });
  }

  return fixes.concat(DEFAULT_FIXES).slice(0, 3);
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
    strategy,
    fetchedAt: new Date().toISOString(),
    summary: getSummaryText(scores.performance, strategy),
    scores,
    metrics: buildMetricList(audits),
    topFixes: buildTopFixes(audits),
  };
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return 'Eksempelrapport';
  }

  return new Intl.DateTimeFormat('nb-NO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
};

const Header = ({
  isScrolled,
  isMobileMenuOpen,
  language,
  onCloseMobileMenu,
  onLanguageChange,
  onToggleMobileMenu,
}) => (
  <>
    <header className={`header${isScrolled ? ' scrolled' : ''}`}>
      <div className="container nav-container">
        <a href="/" className="logo" aria-label="tk-design">
          <span className="logo-icon">
            <img src="/img/logo/d.webp" alt="tk-design logo" />
          </span>
          <span className="logo-text">tk-design</span>
        </a>

        <nav className="nav-desktop">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lang-switch-desktop">
          <button
            type="button"
            className={`lang-btn${language === 'en' ? ' active' : ''}`}
            onClick={() => onLanguageChange('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={`lang-btn${language === 'no' ? ' active' : ''}`}
            onClick={() => onLanguageChange('no')}
          >
            NO
          </button>
        </div>

        <button
          type="button"
          className="menu-trigger"
          aria-label={isMobileMenuOpen ? 'Lukk meny' : 'Åpne meny'}
          aria-expanded={isMobileMenuOpen}
          onClick={onToggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>

    <div className={`mobile-menu-overlay${isMobileMenuOpen ? ' active' : ''}`}>
      <nav className="mobile-nav">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={onCloseMobileMenu}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="lang-switch-mobile">
          <button
            type="button"
            className={`lang-btn${language === 'en' ? ' active' : ''}`}
            onClick={() => onLanguageChange('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={`lang-btn${language === 'no' ? ' active' : ''}`}
            onClick={() => onLanguageChange('no')}
          >
            NO
          </button>
        </div>

        <div className="mobile-menu-footer">
          <div className="mobile-contact-info">
            <a href="mailto:thomas@tk-design.no" onClick={onCloseMobileMenu}>
              thomas@tk-design.no
            </a>
            <a href="tel:+4793094615" onClick={onCloseMobileMenu}>
              930 94 615
            </a>
          </div>
          <div className="mobile-social-links">
            {SOCIAL_LINKS.slice(0, 2).map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  aria-label={link.label}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  </>
);

const Footer = () => (
  <footer id="kontakt" className="footer pt_120 pb_120" style={{ borderTop: '1px solid var(--clr-border)' }}>
    <div className="container">
      <div className="footer-cta">
        <h2>La oss starte</h2>
      </div>

      <div className="footer-content">
        <div className="footer-info">
          <p style={{ fontSize: '20px', color: 'var(--clr-base)', marginBottom: '20px' }}>
            Vi bygger din digitale identitet med skreddersydd webdesign, SEO og SoMe-strategi.
          </p>
          <a
            href="mailto:thomas@tk-design.no"
            style={{ fontSize: '30px', textDecoration: 'underline', color: 'var(--clr-base)' }}
          >
            thomas@tk-design.no
          </a>
        </div>

        <div className="footer-links" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="social-link"
              target="_blank"
              rel="nofollow noopener noreferrer"
            >
              <span>{link.label}</span>
              <ArrowRight size={16} />
            </a>
          ))}
        </div>
      </div>

      <div
        className="flex flex-wrap justify-between items-center"
        style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '30px' }}
      >
        <p>
          Copyright © 2026 <a href="/" style={{ color: 'var(--clr-base)' }}>TK-design</a> All rights reserved.
        </p>
        <div className="flex gap-4">
          <a href="/accessibility" style={{ color: 'var(--clr-base)' }}>
            Accessibility Statement
          </a>
          <a href="/privacy" style={{ color: 'var(--clr-base)' }}>
            Privacy Policy
          </a>
          <a href="/admin/" className="admin-secret" style={{ color: '#777', fontSize: '0.8em' }}>
            Admin
          </a>
        </div>
      </div>
    </div>
  </footer>
);

const HighlightCard = ({ item, index }) => {
  const Icon = item.icon;

  return (
    <Motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      viewport={{ once: true, amount: 0.35 }}
      className="st-feature-card"
    >
      <div className="st-feature-icon">
        <Icon size={22} />
      </div>
      <div className="st-feature-body">
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </div>
    </Motion.article>
  );
};

const ScoreCard = ({ label, score, dark = false }) => {
  const tone = getScoreTone(score);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <article className={`st-score-card${dark ? ' is-dark' : ''}`}>
      <div className="st-score-copy">
        <p className="st-score-label">{label}</p>
        <span className="st-score-pill" style={{ backgroundColor: tone.soft, color: tone.accent }}>
          {tone.label}
        </span>
      </div>

      <div className="st-score-ring">
        <svg viewBox="0 0 96 96" className="st-score-svg">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke={dark ? 'rgba(255,255,255,0.12)' : 'rgba(16,32,51,0.08)'}
            strokeWidth="8"
          />
          <Motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke={tone.accent}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </svg>
        <span className="st-score-value">{score}</span>
      </div>
    </article>
  );
};

const MetricCard = ({ metric }) => {
  const tone = getMetricTone(metric.status);

  return (
    <article
      className="st-metric-card"
      style={{ backgroundColor: tone.surface, borderColor: tone.border }}
    >
      <div className="st-metric-top">
        <div>
          <p className="st-metric-kicker">{metric.label}</p>
          <h4>{metric.title}</h4>
        </div>
        <span className="st-metric-pill" style={{ color: tone.text, backgroundColor: tone.pill }}>
          <span className="st-metric-dot" style={{ backgroundColor: tone.dot }} />
          {tone.label}
        </span>
      </div>
      <p className="st-metric-value">{metric.value}</p>
      <p className="st-metric-text">{metric.description}</p>
    </article>
  );
};

const FixItem = ({ fix, index }) => {
  const Icon = fix.icon;

  return (
    <article className="st-plan-item">
      <div className="st-plan-icon">
        <Icon size={20} />
      </div>
      <div className="st-plan-copy">
        <p className="st-plan-kicker">Prioritet {index + 1}</p>
        <h4>{fix.title}</h4>
        <p>{fix.description}</p>
      </div>
    </article>
  );
};

export default function App() {
  const [url, setUrl] = useState('');
  const [strategy, setStrategy] = useState('mobile');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('no');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedLang = getCookie('site_lang') || window.localStorage.getItem('site_lang') || 'no';
    setLanguage(storedLang === 'en' ? 'en' : 'no');
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > 50);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-active', isMobileMenuOpen);
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.classList.remove('mobile-menu-active');
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return undefined;
    }

    setProgress(12);

    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) {
          return current;
        }

        return Math.min(92, current + Math.max(3, Math.round((92 - current) * 0.18)));
      });
    }, 420);

    return () => window.clearInterval(timer);
  }, [loading]);

  const testSite = async (event) => {
    event?.preventDefault();

    let normalizedUrl;

    try {
      normalizedUrl = normalizeUrl(url);
    } catch {
      setError('Lim inn en gyldig URL, for eksempel tk-design.no.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/pagespeed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl,
          strategy,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        const nextError = new Error(payload?.error || 'Kunne ikke hente PageSpeed-data.');
        nextError.code = payload?.code || 'pagespeed_request_failed';
        nextError.details = payload?.details || '';
        throw nextError;
      }

      const data = payload.data;
      if (!data.lighthouseResult?.categories || !data.lighthouseResult?.audits) {
        throw new Error('Mangler Lighthouse-data i svaret.');
      }

      const nextReport = buildReport(data.lighthouseResult, normalizedUrl, strategy);
      setProgress(100);

      startTransition(() => {
        setResults(nextReport);
      });

      if (typeof document !== 'undefined') {
        window.requestAnimationFrame(() => {
          document.getElementById('resultat')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    } catch (requestError) {
      console.error(requestError);
      setError(getAnalysisErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const activeReport = results ?? PREVIEW_REPORT;
  const mailSubject = encodeURIComponent(`Rapport for ${activeReport.analyzedUrl}`);

  const handleLanguageChange = (nextLanguage) => {
    const resolvedLanguage = nextLanguage === 'en' ? 'en' : 'no';
    setLanguage(resolvedLanguage);
    window.localStorage.setItem('site_lang', resolvedLanguage);
    document.cookie = `site_lang=${resolvedLanguage}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  };

  return (
    <div className="st-page">
      <div className="st-bg-orb st-bg-orb--warm" />
      <div className="st-bg-orb st-bg-orb--cool" />
      <div className="st-bg-wash" />

      <div className="st-app">
        <Header
          isScrolled={headerScrolled}
          isMobileMenuOpen={isMobileMenuOpen}
          language={language}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          onLanguageChange={handleLanguageChange}
          onToggleMobileMenu={() => setIsMobileMenuOpen((current) => !current)}
        />

        <main className="st-main">
          <section className="st-shell st-hero">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="st-hero-copy"
            >
              <div className="st-chip st-chip--light">
                <Shield size={15} />
                Drevet av Google Lighthouse API
              </div>

              <p className="st-script">Finn friksjonen før kunden gjør det</p>
              <h1 className="st-title">Se om nettsiden taper fart før brukeren gjør det.</h1>
              <p className="st-lead">
                Lim inn en URL og få en tydelig rapport som viser hva som bremser opplevelsen,
                hvilke tall som betyr noe og hva som bør ryddes først.
              </p>

              <div className="st-trust-grid">
                {TRUST_POINTS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="st-trust-card">
                      <div className="st-trust-icon">
                        <Icon size={18} />
                      </div>
                      <div className="st-trust-copy">
                        <strong>{item.title}</strong>
                        <span>{item.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Motion.form
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.45 }}
                onSubmit={testSite}
                className="st-form"
              >
                <div className="st-form-grid">
                  <label className="st-field st-field--url" htmlFor="speed-url">
                    <span className="st-label">Nettadresse</span>
                    <span className="st-input">
                      <Search size={18} />
                      <input
                        id="speed-url"
                        type="text"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        autoCapitalize="none"
                        autoComplete="url"
                        autoCorrect="off"
                        inputMode="url"
                        placeholder="f.eks. tk-design.no"
                        spellCheck={false}
                      />
                    </span>
                  </label>

                  <div className="st-field st-field--strategy">
                    <span className="st-label">Analyser for</span>
                    <div className="st-toggle">
                      <button
                        type="button"
                        className={strategy === 'mobile' ? 'is-active' : ''}
                        onClick={() => setStrategy('mobile')}
                      >
                        <Smartphone size={17} />
                        Mobil
                      </button>
                      <button
                        type="button"
                        className={strategy === 'desktop' ? 'is-active' : ''}
                        onClick={() => setStrategy('desktop')}
                      >
                        <Monitor size={17} />
                        Desktop
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="st-submit">
                    {loading ? (
                      <>
                        <span className="st-spinner" />
                        Kjører test
                      </>
                    ) : (
                      <>
                        Test nettstedet
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>

                <div className="st-form-meta">
                  <p>Ingen data lagres. Vi henter bare offentlig Lighthouse-data fra Google.</p>
                  <a href="#resultat">
                    Se eksempelrapport
                    <ArrowRight size={15} />
                  </a>
                </div>

                {loading && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="st-progress"
                  >
                    <div className="st-progress-track">
                      <Motion.div
                        className="st-progress-bar"
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: 'easeOut' }}
                      />
                    </div>
                    <p>Henter Lighthouse-data. Dette tar vanligvis 10 til 15 sekunder.</p>
                  </Motion.div>
                )}

                {error && (
                  <Motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    aria-live="polite"
                    className="st-error"
                  >
                    <AlertCircle size={18} />
                    <p>{error}</p>
                  </Motion.div>
                )}
              </Motion.form>
            </Motion.div>

            <Motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.14, duration: 0.45 }}
              className="st-stage"
            >
              <div className="st-stage-card">
                <div className="st-stage-top">
                  <span className="st-chip st-chip--dark">Live Lighthouse</span>
                  <span className="st-stage-device">{getStrategyLabel(activeReport.strategy)}</span>
                </div>

                <h2>{results ? `Rapport klar for ${activeReport.analyzedUrl}` : 'Dette får du tilbake etter testen'}</h2>
                <p>
                  {results
                    ? activeReport.summary
                    : 'En kompakt rapport med scorekort, nøkkelmålinger og en prioriteringsliste du faktisk kan bruke.'}
                </p>

                <div className="st-stage-scores">
                  {SCORE_DEFINITIONS.map(({ key, label }) => (
                    <ScoreCard key={key} label={label} score={activeReport.scores[key]} dark />
                  ))}
                </div>
              </div>

              <div className="st-stage-callout">
                <p className="st-callout-kicker">Første grep</p>
                <h3>{activeReport.topFixes[0].title}</h3>
                <p>{activeReport.topFixes[0].description}</p>
                <a href="#resultat">
                  Se hele rapporten
                  <ArrowRight size={16} />
                </a>
              </div>
            </Motion.aside>
          </section>

          <section id="fordeler" className="st-shell st-section">
            <div className="st-section-head st-section-head--compact">
              <span className="st-chip st-chip--light">Hva du får</span>
              <div>
                <h2>Rapporten er laget for beslutninger, ikke bare scores.</h2>
                <p>Vi oversetter Lighthouse-data til språk, prioriteringer og tiltak som faktisk kan brukes videre.</p>
              </div>
            </div>

            <div className="st-feature-grid">
              {PAGE_HIGHLIGHTS.map((item, index) => (
                <HighlightCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </section>

          <section id="resultat" className="st-shell st-section st-results">
            <div className="st-section-head">
              <div>
                <span className="st-chip st-chip--light">{results ? 'Din rapport' : 'Eksempelrapport'}</span>
                <h2>
                  {results
                    ? `Dette er det neste du bør fikse på ${activeReport.analyzedUrl}`
                    : 'Slik er rapporten bygget når testen er ferdig.'}
                </h2>
                <p>
                  {results
                    ? activeReport.summary
                    : 'Under ser du hvordan vi pakker Lighthouse-data om til scorekort, nøkkelmålinger og en konkret handlingsplan.'}
                </p>
              </div>

              <div className="st-meta-pills">
                <span>{getStrategyLabel(activeReport.strategy)}</span>
                <span>{formatTimestamp(activeReport.fetchedAt)}</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <Motion.div
                key={results ? activeReport.fetchedAt : 'preview'}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="st-results-stack"
              >
                <div className="st-results-grid">
                  <article className="st-panel st-panel--light">
                    <div className="st-panel-head">
                      <div>
                        <p className="st-panel-kicker">{results ? `Analysert domene: ${activeReport.analyzedUrl}` : 'Scoreoversikt'}</p>
                        <h3>{results ? 'Her ser du hvor friksjonen ligger akkurat nå' : 'Først får du et raskt overblikk over kvaliteten.'}</h3>
                        <p>
                          Fire scorekort gir deg et tydelig bilde av ytelse, tilgjengelighet, beste praksis og SEO i ett blikk.
                        </p>
                      </div>
                      <div className="st-priority-box">
                        <span>Første prioritet</span>
                        <strong>{activeReport.topFixes[0].title}</strong>
                      </div>
                    </div>

                    <div className="st-score-grid">
                      {SCORE_DEFINITIONS.map(({ key, label }) => (
                        <ScoreCard key={key} label={label} score={activeReport.scores[key]} />
                      ))}
                    </div>
                  </article>

                  <article className="st-panel st-panel--dark">
                    <p className="st-panel-kicker st-panel-kicker--dark">Tolkning</p>
                    <h3>{results ? 'Hva betyr tallene i praksis?' : 'Rapporten er laget for å kunne brukes umiddelbart.'}</h3>
                    <ul className="st-reading-list">
                      {REPORT_POINTS.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <a href={results ? '/contact' : '#fordeler'} className="st-ghost-link">
                      {results ? 'Vil du ha hjelp til å fikse dette?' : 'Se hva du får med testen'}
                      <ArrowRight size={16} />
                    </a>
                  </article>
                </div>

                <div className="st-results-grid st-results-grid--secondary">
                  <article className="st-panel st-panel--light">
                    <div className="st-panel-head st-panel-head--stack">
                      <div>
                        <p className="st-panel-kicker">Nøkkelmålinger</p>
                        <h3>Målingene som styrer førsteinntrykket.</h3>
                        <p>Vi viser kun tallene som betyr mest for fart, respons og stabilitet.</p>
                      </div>
                    </div>

                    <div className="st-metric-grid">
                      {activeReport.metrics.map((metric) => (
                        <MetricCard key={metric.key} metric={metric} />
                      ))}
                    </div>
                  </article>

                  <div className="st-aside-stack">
                    <article className="st-panel st-panel--dark">
                      <p className="st-panel-kicker st-panel-kicker--dark">Handlingsplan</p>
                      <h3>Dette ville jeg gjort først.</h3>
                      <div className="st-plan-list">
                        {activeReport.topFixes.map((fix, index) => (
                          <FixItem key={fix.title} fix={fix} index={index} />
                        ))}
                      </div>
                    </article>

                    <article className="st-panel st-panel--light st-panel--cta">
                      <p className="st-panel-kicker">Neste steg</p>
                      <h3>Vil du ha hjelp til å rydde opp?</h3>
                      <p>
                        Vi kan gjøre rapporten om til en konkret prioriteringsliste for design, kode, SEO og lastetid.
                      </p>
                      <div className="st-cta-actions">
                        <a href={`mailto:thomas@tk-design.no?subject=${mailSubject}`} className="st-button st-button--primary">
                          Send rapporten på e-post
                          <Mail size={18} />
                        </a>
                        <a href="/contact" className="st-button st-button--secondary">
                          Book en gjennomgang
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </article>
                  </div>
                </div>
              </Motion.div>
            </AnimatePresence>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
