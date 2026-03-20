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
      surface: 'bg-[#eefaf3]',
      border: 'border-[#cdeedb]',
      text: 'text-[#18794f]',
      dot: 'bg-[#19b46b]',
    };
  }

  if (status === 'warn') {
    return {
      surface: 'bg-[#fff7eb]',
      border: 'border-[#f2dfbf]',
      text: 'text-[#c67a00]',
      dot: 'bg-[#ffb02e]',
    };
  }

  return {
    surface: 'bg-[#fff1ee]',
    border: 'border-[#f0d0c8]',
    text: 'text-[#d04b2c]',
    dot: 'bg-[#ef6a4a]',
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

const normalizeUrl = (raw) => {
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new Error('missing-url');
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol).toString();
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
      className="rounded-[30px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_60px_rgba(16,32,51,0.08)] backdrop-blur"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102033] text-white">
        <Icon size={22} />
      </div>
      <h3 className="mt-5 text-xl font-bold text-[#102033]">{item.title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-[#5b6676]">{item.text}</p>
    </Motion.article>
  );
};

const ScoreCard = ({ label, score, dark = false }) => {
  const tone = getScoreTone(score);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`rounded-[28px] border p-5 ${
        dark ? 'border-white/10 bg-white/5' : 'border-[#102033]/10 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
              dark ? 'text-white/55' : 'text-[#6b7280]'
            }`}
          >
            {label}
          </p>
          <span
            className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: tone.soft, color: tone.accent }}
          >
            {tone.label}
          </span>
        </div>

        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="transparent"
              stroke={dark ? 'rgba(255,255,255,0.12)' : 'rgba(16,32,51,0.1)'}
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-black ${dark ? 'text-white' : 'text-[#102033]'}`}>
              {score}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ metric }) => {
  const tone = getMetricTone(metric.status);

  return (
    <div className={`rounded-[28px] border p-6 ${tone.surface} ${tone.border}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
            {metric.label}
          </p>
          <h4 className="mt-2 text-xl font-bold text-[#102033]">{metric.title}</h4>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone.text}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
          {metric.status === 'pass' ? 'Bra' : metric.status === 'warn' ? 'Se på dette' : 'Viktig'}
        </span>
      </div>

      <p className="mt-6 text-4xl font-black leading-none text-[#102033]">{metric.value}</p>
      <p className="mt-4 text-[15px] leading-7 text-[#5b6676]">{metric.description}</p>
    </div>
  );
};

const FixItem = ({ fix, index }) => {
  const Icon = fix.icon;

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#62B6CB]/20 text-[#62B6CB]">
          <Icon size={22} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
            Prioritet {index + 1}
          </p>
          <h4 className="mt-2 text-lg font-bold text-white">{fix.title}</h4>
          <p className="mt-2 text-sm leading-7 text-white/70">{fix.description}</p>
        </div>
      </div>
    </div>
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
      const apiKey = import.meta.env.VITE_PAGESPEED_API_KEY || '';
      const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        normalizedUrl,
      )}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo${
        apiKey ? `&key=${apiKey}` : ''
      }`;

      const response = await fetch(apiEndpoint);
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Kunne ikke hente PageSpeed-data.');
      }

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
      setError('Kunne ikke analysere nettstedet akkurat nå. Sjekk URL-en og prøv igjen.');
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
    <div className="speed-test-shell relative min-h-screen overflow-hidden text-[#102033]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px]"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(98, 182, 203, 0.28), transparent 32%), radial-gradient(circle at 12% 18%, rgba(255, 106, 27, 0.16), transparent 24%), linear-gradient(180deg, rgba(255, 253, 248, 0.95) 0%, rgba(246, 243, 237, 0) 100%)',
        }}
      />
      <div className="pointer-events-none absolute left-[-140px] top-[280px] h-[360px] w-[360px] rounded-full bg-[#62B6CB]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-100px] top-[130px] h-[260px] w-[260px] rounded-full bg-[#ff6a1b]/10 blur-3xl" />

      <div className="relative flex min-h-screen flex-col">
        <Header
          isScrolled={headerScrolled}
          isMobileMenuOpen={isMobileMenuOpen}
          language={language}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          onLanguageChange={handleLanguageChange}
          onToggleMobileMenu={() => setIsMobileMenuOpen((current) => !current)}
        />

        <main className="speed-test-main flex-1">
          <section className="container speed-test-container speed-test-section speed-test-hero-grid">
            <div className="speed-test-intro">
              <Motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#102033]/10 bg-white/70 px-4 py-2 text-sm font-semibold text-[#102033] shadow-[0_16px_40px_rgba(16,32,51,0.08)] backdrop-blur"
              >
                <Shield size={16} className="text-[#ff6a1b]" />
                Drevet av Google Lighthouse API
              </Motion.div>

              <Motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.55 }}
                className="mt-7"
              >
                <p
                  className="speed-test-handwritten text-[#ff6a1b]"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  Finn friksjonen før kunden gjør det
                </p>
                <h1 className="speed-test-hero-title mt-3 font-black text-[#102033]">
                  <span className="block">Er nettsiden</span>
                  <span className="block">din rask nok til</span>
                  <span className="block">å holde på</span>
                  <span className="block">oppmerksomheten?</span>
                </h1>
                <p className="speed-test-hero-lead mt-6 text-[#5b6676]">
                  Lim inn en URL og få en visuell rapport som viser hvor opplevelsen bremser opp på mobil
                  eller desktop, og hvilke grep som gir mest effekt først.
                </p>
              </Motion.div>

              <Motion.form
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.55 }}
                onSubmit={testSite}
                className="mt-10 rounded-[34px] border border-white/70 bg-white/90 p-4 shadow-[0_30px_80px_rgba(16,32,51,0.12)] backdrop-blur"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="speed-url" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
                      Nettadresse
                    </label>
                    <div className="mt-2 flex items-center gap-3 rounded-[24px] border border-[#102033]/10 bg-[#f7f3ee] px-4 py-4">
                      <Search size={18} className="shrink-0 text-[#7b8794]" />
                      <input
                        id="speed-url"
                        type="text"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        placeholder="f.eks. tk-design.no"
                        className="w-full bg-transparent text-base font-semibold text-[#102033] outline-none"
                      />
                    </div>
                  </div>

                  <div className="xl:min-w-[240px]">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
                      Analyser for
                    </span>
                    <div className="mt-2 inline-flex w-full rounded-[24px] border border-[#102033]/10 bg-[#f7f3ee] p-1">
                      <button
                        type="button"
                        onClick={() => setStrategy('mobile')}
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition-all ${
                          strategy === 'mobile'
                            ? 'bg-white text-[#102033] shadow-[0_8px_20px_rgba(16,32,51,0.08)]'
                            : 'text-[#708090] hover:text-[#102033]'
                        }`}
                      >
                        <Smartphone size={17} />
                        Mobil
                      </button>
                      <button
                        type="button"
                        onClick={() => setStrategy('desktop')}
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition-all ${
                          strategy === 'desktop'
                            ? 'bg-white text-[#102033] shadow-[0_8px_20px_rgba(16,32,51,0.08)]'
                            : 'text-[#708090] hover:text-[#102033]'
                        }`}
                      >
                        <Monitor size={17} />
                        Desktop
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-[60px] items-center justify-center gap-2 rounded-[22px] bg-[#102033] px-7 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#173651] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 rounded-full border-2 border-white/25 border-t-white animate-spin" />
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

                <div className="mt-4 flex flex-col gap-2 text-sm text-[#5f6c7b] md:flex-row md:items-center md:justify-between">
                  <p>Ingen data lagres. Vi henter kun offentlig Lighthouse-data direkte fra Google.</p>
                  <a href="#resultat" className="inline-flex items-center gap-2 font-semibold text-[#102033] transition-colors hover:text-[#ff6a1b]">
                    Se eksempelrapport
                    <ArrowRight size={16} />
                  </a>
                </div>

                {loading && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-5 overflow-hidden"
                  >
                    <div className="h-2 overflow-hidden rounded-full bg-[#e4e7eb]">
                      <Motion.div
                        className="h-full rounded-full bg-[#62B6CB]"
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: 'easeOut' }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-[#5f6c7b]">
                      Henter Lighthouse-data fra Google. Dette tar vanligvis 10-15 sekunder.
                    </p>
                  </Motion.div>
                )}

                {error && (
                  <Motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 flex items-start gap-3 rounded-[22px] border border-[#f0d0c8] bg-[#fff1ee] px-4 py-3 text-sm text-[#d04b2c]"
                  >
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </Motion.div>
                )}
              </Motion.form>
            </div>

            <Motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22, duration: 0.55 }}
                className="speed-test-preview-column relative mx-auto w-full xl:ml-auto"
              >
              <div className="speed-test-preview-shell overflow-hidden rounded-[38px] border border-white/10 bg-[#102033] p-8 text-white shadow-[0_30px_80px_rgba(16,32,51,0.28)]">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle at top right, rgba(98, 182, 203, 0.36), transparent 34%), radial-gradient(circle at bottom left, rgba(255, 106, 27, 0.2), transparent 38%)',
                  }}
                />
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                      Live Lighthouse
                    </span>
                    <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                      {getStrategyLabel(activeReport.strategy)}
                    </span>
                  </div>

                  <h2 className="mt-6 max-w-[12ch] text-3xl font-black leading-tight">
                    {results ? `Rapport klar for ${activeReport.analyzedUrl}` : 'Se hvordan rapporten er bygget opp'}
                  </h2>
                  <p className="mt-3 max-w-[30ch] text-sm leading-7 text-white/70">
                    {results
                      ? activeReport.summary
                      : 'Du får scorekort, nøkkelmålinger og en prioritert handlingsplan i ett og samme overblikk.'}
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {SCORE_DEFINITIONS.map(({ key, label }) => (
                      <ScoreCard key={key} label={label} score={activeReport.scores[key]} dark />
                    ))}
                  </div>
                </div>
              </div>

              <div className="speed-test-priority-card relative rounded-[30px] border border-[#102033]/10 bg-white/95 p-6 shadow-[0_24px_60px_rgba(16,32,51,0.12)] backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
                  Prioritet nå
                </p>
                <h3 className="mt-3 text-2xl font-black text-[#102033]">{activeReport.topFixes[0].title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#5b6676]">{activeReport.topFixes[0].description}</p>
                <a
                  href="#resultat"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#102033] transition-colors hover:text-[#ff6a1b]"
                >
                  Se hele rapporten
                  <ArrowRight size={16} />
                </a>
              </div>
            </Motion.div>
          </section>

          <section id="fordeler" className="container speed-test-container speed-test-section speed-test-highlights-section">
            <div className="speed-test-highlights-grid">
              {PAGE_HIGHLIGHTS.map((item, index) => (
                <HighlightCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </section>

          <section id="resultat" className="container speed-test-container speed-test-section speed-test-results-section">
            <div className="speed-test-results-header mb-8">
              <div className="speed-test-results-copy">
                <span className="inline-flex rounded-full border border-[#102033]/10 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#102033] shadow-[0_16px_40px_rgba(16,32,51,0.08)] backdrop-blur">
                  {results ? 'Din rapport' : 'Eksempelrapport'}
                </span>
                <h2 className="speed-test-section-title mt-5 font-black text-[#102033]">
                  {results
                    ? `Dette er det neste du bør fikse på ${activeReport.analyzedUrl}`
                    : 'Kjør testen for å bytte ut eksempeltallene med dine egne.'}
                </h2>
                <p className="speed-test-section-lead mt-4 text-[#5b6676]">
                  {results
                    ? activeReport.summary
                    : 'Under ser du hvordan Lighthouse-data presenteres når testen er ferdig: scorekort, nøkkelmålinger og en prioritert plan for hva som bør tas først.'}
                </p>
              </div>

              <div className="speed-test-results-meta flex flex-wrap gap-3">
                <span className="inline-flex rounded-full border border-[#102033]/10 bg-white/75 px-4 py-2 text-sm font-semibold text-[#102033]">
                  {getStrategyLabel(activeReport.strategy)}
                </span>
                <span className="inline-flex rounded-full border border-[#102033]/10 bg-white/75 px-4 py-2 text-sm font-semibold text-[#5b6676]">
                  {formatTimestamp(activeReport.fetchedAt)}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <Motion.div
                key={results ? activeReport.fetchedAt : 'preview'}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45 }}
                className="space-y-6"
              >
                <div className="speed-test-report-grid">
                  <div className="rounded-[38px] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(16,32,51,0.12)] backdrop-blur">
                    <div className="speed-test-score-header flex flex-col gap-6">
                      <div className="speed-test-score-copy">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
                          {results ? `Analysert domene: ${activeReport.analyzedUrl}` : 'Demooppsett'}
                        </p>
                        <h3 className="mt-3 text-3xl font-black text-[#102033]">
                          {results ? 'Scoreoversikt' : 'Slik ser scoreoversikten ut'}
                        </h3>
                        <p className="mt-3 text-[15px] leading-7 text-[#5b6676]">
                          {results
                            ? 'Fire scorekort gir deg et raskt overblikk over hva som fungerer, og hvor du taper mest friksjonsfritt tempo.'
                            : 'Når rapporten er klar, ser du med en gang om problemet ligger i ren ytelse, teknisk kvalitet, SEO eller tilgjengelighet.'}
                        </p>
                      </div>

                      <div className="rounded-[28px] border border-[#102033]/10 bg-[#f7f3ee] px-5 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
                          Første prioritet
                        </p>
                        <p className="mt-2 text-lg font-bold text-[#102033]">{activeReport.topFixes[0].title}</p>
                      </div>
                    </div>

                    <div className="speed-test-score-grid mt-8">
                      {SCORE_DEFINITIONS.map(({ key, label }) => (
                        <ScoreCard key={key} label={label} score={activeReport.scores[key]} />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[38px] border border-white/10 bg-[#102033] p-8 text-white shadow-[0_30px_80px_rgba(16,32,51,0.22)]">
                    <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                      Tolkning
                    </p>
                    <h3 className="mt-5 text-3xl font-black leading-tight">
                      {results ? 'Hva betyr tallene i praksis?' : 'Rapporten er laget for å kunne brukes med en gang.'}
                    </h3>
                    <div className="mt-6 space-y-4 text-sm leading-7 text-white/70">
                      <p>Ytelse viser hvor raskt brukeren ser og kan bruke siden.</p>
                      <p>Tilgjengelighet og beste praksis peker ofte på friksjon som også påvirker kvalitet og tillit.</p>
                      <p>Handlingsplanen under er prioritert etter grep som vanligvis gir størst effekt først.</p>
                    </div>
                    <a
                      href={results ? '/contact' : '#fordeler'}
                      className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15"
                    >
                      {results ? 'Vil du ha hjelp til å fikse dette?' : 'Se hva du får med testen'}
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </div>

                <div className="speed-test-detail-grid">
                  <div className="rounded-[38px] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(16,32,51,0.12)] backdrop-blur">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
                          Nøkkelmålinger
                        </p>
                        <h3 className="mt-3 text-3xl font-black text-[#102033]">
                          Målinger som styrer opplevelsen
                        </h3>
                      </div>
                      <p className="max-w-[20rem] text-sm leading-7 text-[#5b6676]">
                        Vi viser kun tallene som betyr mest for førsteinntrykk, respons og stabilitet.
                      </p>
                    </div>

                    <div className="speed-test-metrics-grid mt-8">
                      {activeReport.metrics.map((metric) => (
                        <MetricCard key={metric.key} metric={metric} />
                      ))}
                    </div>
                  </div>

                  <div className="speed-test-side-stack">
                    <div className="rounded-[38px] border border-white/10 bg-[#102033] p-8 text-white shadow-[0_30px_80px_rgba(16,32,51,0.22)]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#62B6CB]/20 text-[#62B6CB]">
                          <Zap size={24} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                            Handlingsplan
                          </p>
                          <h3 className="mt-1 text-2xl font-black">Det jeg ville gjort først</h3>
                        </div>
                      </div>

                      <div className="mt-8 space-y-4">
                        {activeReport.topFixes.map((fix, index) => (
                          <FixItem key={fix.title} fix={fix} index={index} />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[38px] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(16,32,51,0.12)] backdrop-blur">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
                        Neste steg
                      </p>
                      <h3 className="mt-4 text-2xl font-black text-[#102033]">
                        Vil du ha hjelp til å rydde opp?
                      </h3>
                      <p className="mt-4 text-[15px] leading-7 text-[#5b6676]">
                        Vi kan gjøre rapporten om til en gjennomførbar prioriteringsliste for design, kode, SEO og lastetid.
                      </p>

                      <div className="mt-7 flex flex-col gap-3">
                        <a
                          href={`mailto:thomas@tk-design.no?subject=${mailSubject}`}
                          className="inline-flex items-center justify-between rounded-[22px] bg-[#102033] px-5 py-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#173651]"
                        >
                          Send rapporten på e-post
                          <Mail size={18} />
                        </a>
                        <a
                          href="/contact"
                          className="inline-flex items-center justify-between rounded-[22px] border border-[#102033]/10 bg-[#f7f3ee] px-5 py-4 text-sm font-semibold text-[#102033] transition-all hover:-translate-y-0.5 hover:border-[#102033]/20"
                        >
                          Book en gjennomgang
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </div>
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
