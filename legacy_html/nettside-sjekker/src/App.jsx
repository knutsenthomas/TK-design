import React, { startTransition, useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Gauge,
  Mail,
  Monitor,
  Search,
  Shield,
  Smartphone,
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

const Header = () => (
  <header className="sticky top-0 z-40 border-b border-[#102033]/10 bg-[rgba(246,243,237,0.82)] backdrop-blur-xl">
    <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-5 py-4 md:px-8">
      <a href="/" className="flex items-center gap-3 text-[#102033] transition-transform hover:-translate-y-0.5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6a1b] shadow-[0_18px_40px_rgba(255,106,27,0.26)]">
          <img src="/img/logo/d.webp" alt="TK-design" className="h-7 w-7 object-contain" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6b7280]">
            TK-design
          </span>
          <span className="mt-1 text-lg font-bold">Speed Test</span>
        </span>
      </a>

      <nav className="hidden items-center gap-8 text-sm font-semibold text-[#546171] lg:flex">
        <a href="#fordeler" className="transition-colors hover:text-[#102033]">
          Hvorfor testen
        </a>
        <a href="#resultat" className="transition-colors hover:text-[#102033]">
          Rapporten
        </a>
        <a href="#kontakt" className="transition-colors hover:text-[#102033]">
          Kontakt
        </a>
      </nav>

      <div className="flex items-center gap-3">
        <a
          href="/contact"
          className="hidden rounded-full border border-[#102033]/10 bg-white/80 px-4 py-2 text-sm font-semibold text-[#102033] transition-all hover:-translate-y-0.5 hover:border-[#102033]/20 md:inline-flex"
        >
          Snakk med oss
        </a>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#102033] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#173651]"
        >
          Til forsiden
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer id="kontakt" className="relative border-t border-[#102033]/10 bg-white/70">
    <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[30rem]">
          <p
            className="text-2xl font-bold text-[#102033]"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            Vil du ha hjelp til å rydde opp i ytelsen?
          </p>
          <p className="mt-3 text-[15px] leading-7 text-[#5b6676]">
            Vi bruker samme rammeverk som i testen, men gjør funnene om til konkrete grep i design,
            kode og innholdsstruktur.
          </p>
          <a
            href="mailto:thomas@tk-design.no"
            className="mt-5 inline-flex items-center gap-2 text-lg font-bold text-[#102033] underline decoration-[#ff6a1b] decoration-2 underline-offset-4"
          >
            thomas@tk-design.no
            <Mail size={18} />
          </a>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:thomas@tk-design.no?subject=Jeg%20vil%20ha%20en%20full%20ytelsesrapport"
            className="inline-flex items-center gap-2 rounded-full bg-[#102033] px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#173651]"
          >
            Be om full rapport
            <ArrowRight size={16} />
          </a>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-[#102033]/10 bg-white px-5 py-3 text-sm font-semibold text-[#102033] transition-all hover:-translate-y-0.5 hover:border-[#102033]/20"
          >
            Book gjennomgang
            <ExternalLink size={16} />
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

  return (
    <div className="relative min-h-screen overflow-hidden text-[#102033]">
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
        <Header />

        <main className="flex-1">
          <section className="mx-auto grid max-w-[1240px] gap-10 px-5 pb-16 pt-14 md:px-8 lg:grid-cols-[minmax(0,1.08fr)_430px] lg:items-start lg:pt-20">
            <div>
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
                className="mt-7 max-w-[42rem]"
              >
                <p
                  className="text-3xl text-[#ff6a1b]"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  Finn friksjonen før kunden gjør det
                </p>
                <h1 className="mt-2 text-[clamp(3.3rem,7vw,6.3rem)] font-black leading-[0.93] tracking-[-0.04em] text-[#102033]">
                  Er nettsiden din rask nok til å holde på oppmerksomheten?
                </h1>
                <p className="mt-6 max-w-[38rem] text-lg leading-8 text-[#5b6676]">
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
              className="relative"
            >
              <div className="overflow-hidden rounded-[38px] border border-white/10 bg-[#102033] p-8 text-white shadow-[0_30px_80px_rgba(16,32,51,0.28)]">
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

              <div className="relative -mt-12 ml-5 rounded-[30px] border border-[#102033]/10 bg-white/95 p-6 shadow-[0_24px_60px_rgba(16,32,51,0.12)] backdrop-blur">
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

          <section id="fordeler" className="mx-auto max-w-[1240px] px-5 pb-20 md:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {PAGE_HIGHLIGHTS.map((item, index) => (
                <HighlightCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </section>

          <section id="resultat" className="mx-auto max-w-[1240px] px-5 pb-24 md:px-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-[44rem]">
                <span className="inline-flex rounded-full border border-[#102033]/10 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#102033] shadow-[0_16px_40px_rgba(16,32,51,0.08)] backdrop-blur">
                  {results ? 'Din rapport' : 'Eksempelrapport'}
                </span>
                <h2 className="mt-5 text-[clamp(2.4rem,4.8vw,4.2rem)] font-black leading-[0.96] tracking-[-0.04em] text-[#102033]">
                  {results
                    ? `Dette er det neste du bør fikse på ${activeReport.analyzedUrl}`
                    : 'Kjør testen for å bytte ut eksempeltallene med dine egne.'}
                </h2>
                <p className="mt-4 text-base leading-8 text-[#5b6676]">
                  {results
                    ? activeReport.summary
                    : 'Under ser du hvordan Lighthouse-data presenteres når testen er ferdig: scorekort, nøkkelmålinger og en prioritert plan for hva som bør tas først.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
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
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
                  <div className="rounded-[38px] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(16,32,51,0.12)] backdrop-blur">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                      <div className="max-w-[40rem]">
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

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
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

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_0.92fr]">
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

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                      {activeReport.metrics.map((metric) => (
                        <MetricCard key={metric.key} metric={metric} />
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6">
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
