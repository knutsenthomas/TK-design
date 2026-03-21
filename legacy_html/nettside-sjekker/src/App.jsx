import React, { startTransition, useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
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
    categoryKey: 'performance',
  },
  {
    title: 'Fjern blokkerende kode',
    description: 'Last inn unødvendig JavaScript og CSS senere, ikke før første skjermbilde.',
    icon: Gauge,
    categoryKey: 'performance',
  },
  {
    title: 'Reserver plass i layouten',
    description: 'Gi bilder, embeds og dynamiske moduler faste dimensjoner så innholdet ikke hopper.',
    icon: Shield,
    categoryKey: 'performance',
  },
];

const AUTHORITY_ITEMS = [
  {
    title: 'Google PageSpeed Insights',
    text: 'Offentlig datagrunnlag direkte fra Google.',
    icon: Search,
  },
  {
    title: 'Lighthouse',
    text: 'Samme metodikk for ytelse, tilgjengelighet, beste praksis og SEO.',
    icon: Zap,
  },
  {
    title: 'Core Web Vitals',
    text: 'Tallene som oftest avgjør om førsteinntrykket holder.',
    icon: Gauge,
  },
];

const PAGE_HIGHLIGHTS = [
  {
    title: 'Dypere innsikt',
    text: 'Vi analyserer det som påvirker førsteinntrykket, og peker ut hvor brukeropplevelsen begynner å tape fart.',
    icon: Search,
  },
  {
    title: 'Prioritert liste',
    text: 'Slutt å gjette. Få en tydelig rekkefølge på hva som bør fikses først for å løfte siden raskest mulig.',
    icon: Shield,
  },
  {
    title: 'Lønnsomhets-fokus',
    text: 'Se sammenhengen mellom lastetid, friksjon og hvorfor tregere sider gjør det dyrere å kjøpe trafikk.',
    icon: Gauge,
  },
];

const TRUST_POINTS = [
  {
    title: 'Gratis å prøve',
    text: 'Kjør testen uten innlogging eller oppsett.',
    icon: CheckCircle2,
  },
  {
    title: 'Mobil og desktop',
    text: 'Se hvordan opplevelsen endrer seg på ulike flater.',
    icon: Smartphone,
  },
  {
    title: 'Ingen lagring',
    text: 'Vi henter bare offentlig Lighthouse-data når du kjører testen.',
    icon: Shield,
  },
];

const PROOF_ITEMS = [
  {
    title: 'Ikke bare tall, men tiltak',
    text: 'Vi oversetter tekniske Lighthouse-data til en konkret handlingsplan du faktisk kan prioritere etter.',
    icon: Search,
  },
  {
    title: 'Forstår hva som bremser',
    text: 'Du ser nøyaktig hva som skaper friksjon i fart, stabilitet og tillit før kundene faller av.',
    icon: Zap,
  },
  {
    title: 'Laget for kommersielle sider',
    text: 'Bruk sjekken på forsider, landingssider og kampanjer når du vil vite hvorfor siden taper fart før kunden gjør det.',
    icon: Monitor,
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Lim inn nettadressen',
    text: 'Start med forsiden eller landingssiden som betyr mest for konvertering akkurat nå.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Velg mobil eller desktop',
    text: 'Kjør mobil først når du vil se den mest krevende opplevelsen, eller desktop når større flater betyr mest.',
    icon: Smartphone,
  },
  {
    step: '03',
    title: 'Få en ferdig plan',
    text: 'Rapporten pakker tallene om til scorekort, fokusområder og tiltak du kan sende videre med en gang.',
    icon: Gauge,
  },
];

const CHECKLIST_ITEMS = [
  'Hvor raskt hovedinnholdet faktisk blir synlig for brukeren',
  'Om CSS, JavaScript eller tredjepartsressurser blokkerer førsteinntrykket',
  'Om layouten hopper eller blir treg å bruke på mobil',
  'Om SEO, tilgjengelighet og beste praksis holder et trygt nivå',
];

const FAQ_ITEMS = [
  {
    question: 'Hvor nøyaktig er denne testen?',
    answer:
      'Vi bruker Google Lighthouse som datamotor og pakker resultatet om til en tydeligere rapport for ytelse, stabilitet, tilgjengelighet og SEO.',
  },
  {
    question: 'Hvorfor varierer poengsummen?',
    answer:
      'Nettverk, serverrespons og tredjepartsressurser kan endre seg mellom hver kjøring. Kjør gjerne testen et par ganger for å få et tydeligere bilde.',
  },
];

const SITE_NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/?section=about', label: 'About' },
  { href: '/?section=services', label: 'Services' },
  { href: '/?section=projects', label: 'Portfolio' },
  { href: '/?section=testimonial', label: 'Testimonial' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

const FOOTER_SOCIAL_LINKS = [
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
  requestedUrl: 'https://din-side.no',
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
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const normalizeCategoryKey = (categoryKey) =>
  categoryKey === 'best-practices' ? 'bestPractices' : categoryKey;

const getScoreStatus = (score) => {
  if (score >= 90) {
    return 'pass';
  }

  if (score >= 50) {
    return 'warn';
  }

  return 'error';
};

const dedupeFixes = (fixes) => {
  const seenTitles = new Set();

  return fixes.filter((fix) => {
    const title = String(fix?.title || '').trim();
    if (!title || seenTitles.has(title)) {
      return false;
    }

    seenTitles.add(title);
    return true;
  });
};

const buildSyntheticMetrics = (categoryKey, score) => {
  const config = CATEGORY_VIEW_CONFIG[categoryKey];
  const status = getScoreStatus(score);

  return (config?.metricTemplates || []).map((item) => ({
    key: `${categoryKey}-${item.key}`,
    label: item.label,
    title: item.title,
    value: item.values[status],
    description: item.description,
    status,
  }));
};

const buildCategoryFixes = (categoryKey, topFixes) =>
  dedupeFixes([
    ...(topFixes || []).filter((fix) => fix.categoryKey === categoryKey),
    ...(CATEGORY_FALLBACK_FIXES[categoryKey] || []),
  ]).slice(0, 3);

const buildCategoryViews = (scores, metrics, topFixes) =>
  Object.fromEntries(
    SCORE_DEFINITIONS.map(({ key }) => {
      const config = CATEGORY_VIEW_CONFIG[key];
      const nextMetrics = config.metricKeys
        ? metrics.filter((metric) => config.metricKeys.includes(metric.key))
        : buildSyntheticMetrics(key, scores[key]);

      return [
        key,
        {
          ...config,
          score: scores[key],
          metrics: nextMetrics,
          fixes: buildCategoryFixes(key, topFixes),
        },
      ];
    }),
  );

const enrichReport = (report) => ({
  ...report,
  categoryViews: buildCategoryViews(report.scores, report.metrics, report.topFixes),
});

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

  if (code === 'report_build_failed') {
    return 'Lighthouse-data kom tilbake, men rapporten kunne ikke bygges akkurat nå. Prøv igjen om litt.';
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

  if (/failed to fetch|load failed|networkerror/i.test(details)) {
    return 'Kunne ikke kontakte analysetjenesten akkurat nå. Prøv igjen om litt.';
  }

  return 'Kunne ikke analysere nettstedet akkurat nå. Prøv igjen om litt.';
};

const getReportEmailErrorMessage = (requestError) => {
  const code = String(requestError?.code || '').trim().toLowerCase();

  if (code === 'missing_report' || code === 'invalid_report_payload') {
    return 'Kjør testen først, så kan rapporten sendes på e-post.';
  }

  if (code === 'missing_recipient_email') {
    return 'Legg inn en e-postadresse før du sender rapporten.';
  }

  if (code === 'invalid_recipient_email') {
    return 'E-postadressen ser ikke gyldig ut. Sjekk den og prøv igjen.';
  }

  if (code === 'missing_email_config') {
    return 'Rapporten kan ikke sendes ennå fordi e-post ikke er konfigurert på serveren.';
  }

  return 'Kunne ikke sende rapporten akkurat nå. Prøv igjen om litt.';
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

const CATEGORY_CONFIG = {
  performance: {
    label: 'Ytelse',
    icon: Zap,
    basePriority: 320,
  },
  accessibility: {
    label: 'Tilgjengelighet',
    icon: Shield,
    basePriority: 240,
  },
  'best-practices': {
    label: 'Beste praksis',
    icon: Monitor,
    basePriority: 200,
  },
  seo: {
    label: 'SEO',
    icon: Search,
    basePriority: 180,
  },
};

const CATEGORY_VIEW_CONFIG = {
  performance: {
    label: 'Ytelse',
    metricKicker: 'Nøkkelmålinger',
    metricTitle: 'Målingene som styrer førsteinntrykket.',
    metricDescription: 'Her ser du de konkrete tallene som avgjør om siden føles rask og stabil tidlig i besøket.',
    guideTitle: 'Slik leser du ytelse.',
    guidePoints: [
      'Se først på hva brukeren opplever før siden er ferdig lastet, ikke bare totalscoren.',
      'LCP, TBT og CLS peker ofte raskest på hvorfor siden føles treg eller ustabil.',
      'Bilder, blokkerende kode og tunge tredjepartsskript er vanligvis første sted å rydde opp.',
    ],
    metricKeys: [
      'largest-contentful-paint',
      'first-contentful-paint',
      'speed-index',
      'total-blocking-time',
      'cumulative-layout-shift',
    ],
  },
  accessibility: {
    label: 'Tilgjengelighet',
    metricKicker: 'Kontrollpunkter',
    metricTitle: 'Hva som gjør siden enklere å bruke for flere.',
    metricDescription: 'Når du klikker på tilgjengelighet, ser du hvilke områder rapporten løfter frem før du gjør større grep.',
    guideTitle: 'Slik leser du tilgjengelighet.',
    guidePoints: [
      'Scoren sier noe om hvor trygt dagens løsning er for tastaturbrukere og hjelpemidler.',
      'Kontrast, etiketter og fokusflyt er ofte de raskeste forbedringene å få effekt av.',
      'Tilgjengelighet handler like mye om tydelighet og trygg navigasjon som om teknisk compliance.',
    ],
    metricTemplates: [
      {
        key: 'contrast',
        label: 'Kontrast',
        title: 'Lesbarhet og tydelighet',
        description: 'Om tekst, knapper og viktige grensesnittelementer er tydelige nok å lese og bruke.',
        values: {
          pass: 'Trygt nivå',
          warn: 'Bør gjennomgås',
          error: 'Må ryddes opp',
        },
      },
      {
        key: 'labels',
        label: 'Etiketter',
        title: 'Skjermleser-navn',
        description: 'Om knapper, lenker og skjemaelementer sier det samme til hjelpemidler som de gjør visuelt.',
        values: {
          pass: 'Henger sammen',
          warn: 'Delvis tydelig',
          error: 'Skaper friksjon',
        },
      },
      {
        key: 'keyboard',
        label: 'Navigasjon',
        title: 'Tastatur og fokus',
        description: 'Om de viktigste flytene kan brukes uten mus og med tydelig fokus gjennom hele reisen.',
        values: {
          pass: 'Trygg flyt',
          warn: 'Bør testes',
          error: 'Høy risiko',
        },
      },
    ],
  },
  bestPractices: {
    label: 'Beste praksis',
    metricKicker: 'Kontrollpunkter',
    metricTitle: 'Hva som påvirker teknisk tillit og hygiene.',
    metricDescription: 'Her viser rapporten hva som ofte bør ryddes opp før du skrur opp trafikk eller lanserer noe nytt.',
    guideTitle: 'Slik leser du beste praksis.',
    guidePoints: [
      'Denne delen handler om teknisk hygiene, robuste løsninger og friksjon som ofte blir oversett.',
      'Konsollfeil, sikkerhet og utdaterte mønstre er ofte varsellamper før større problemer dukker opp.',
      'Et ryddig nivå her gjør både ytelse, sporing og videreutvikling mindre risikabelt.',
    ],
    metricTemplates: [
      {
        key: 'security',
        label: 'Sikkerhet',
        title: 'Trygge standarder',
        description: 'Om siden følger moderne tekniske standarder som ikke svekker tillit eller stabilitet.',
        values: {
          pass: 'Ser ryddig ut',
          warn: 'Noe bør ryddes',
          error: 'Kritiske hull',
        },
      },
      {
        key: 'console',
        label: 'Konsoll',
        title: 'Feil og varsler',
        description: 'Om nettleseren melder fra om feil som kan skjule større problemer i sporing, komponenter eller skript.',
        values: {
          pass: 'Ingen tydelige faresignaler',
          warn: 'Bør gjennomgås',
          error: 'Må tas tak i',
        },
      },
      {
        key: 'standards',
        label: 'Standarder',
        title: 'Moderne implementasjon',
        description: 'Om løsningen holder et nivå som tåler videre vekst, kampanjer og redesign uten unødvendig friksjon.',
        values: {
          pass: 'Trygt grunnlag',
          warn: 'Kan strammes opp',
          error: 'For mye teknisk gjeld',
        },
      },
    ],
  },
  seo: {
    label: 'SEO',
    metricKicker: 'Kontrollpunkter',
    metricTitle: 'Hva som gjør siden lettere å forstå for søk.',
    metricDescription: 'Her løfter rapporten frem det som vanligvis avgjør om siden er tydelig nok for både brukere og søkemotorer.',
    guideTitle: 'Slik leser du SEO.',
    guidePoints: [
      'SEO-delen viser først om siden er tydelig nok strukturert til å bli forstått og indeksert riktig.',
      'Titler, beskrivelser og mobil tydelighet er ofte det som gir raskest forbedring i dette laget.',
      'Dette handler ikke bare om rangering, men om å gjøre innholdet tydelig og troverdig fra første visning.',
    ],
    metricTemplates: [
      {
        key: 'meta',
        label: 'Metadata',
        title: 'Titler og beskrivelser',
        description: 'Om siden sender tydelige signaler om hva den handler om i søkeresultater og delinger.',
        values: {
          pass: 'Tydelig signal',
          warn: 'Bør spisses',
          error: 'Mangler retning',
        },
      },
      {
        key: 'crawl',
        label: 'Indeksering',
        title: 'Forståelig for søk',
        description: 'Om søkemotorer får nok struktur og klarhet til å tolke siden riktig.',
        values: {
          pass: 'God struktur',
          warn: 'Noe er uklart',
          error: 'Høy risiko',
        },
      },
      {
        key: 'mobile',
        label: 'Mobil',
        title: 'Mobil tydelighet',
        description: 'Om innhold og struktur holder seg tydelige på mobil, der mye av trafikken møter deg først.',
        values: {
          pass: 'Sterkt mobilgrunnlag',
          warn: 'Bør strammes opp',
          error: 'Svekket førsteinntrykk',
        },
      },
    ],
  },
};

const CATEGORY_FALLBACK_FIXES = {
  performance: DEFAULT_FIXES,
  accessibility: [
    {
      title: 'Rydd opp i kontrast og fokus',
      description: 'Sørg for nok kontrast, tydelig fokusstil og at viktige knapper faktisk kan brukes uten mus.',
      icon: Shield,
      categoryKey: 'accessibility',
    },
    {
      title: 'Gjør etiketter og navn tydelige',
      description: 'Pass på at skjemaer, knapper og lenker har samme mening visuelt og for hjelpemidler.',
      icon: Search,
      categoryKey: 'accessibility',
    },
    {
      title: 'Test hovedflytene med tastatur',
      description: 'Gå gjennom meny, skjema og CTA-er uten mus før du lanserer nye sider eller kampanjer.',
      icon: Smartphone,
      categoryKey: 'accessibility',
    },
  ],
  bestPractices: [
    {
      title: 'Rydd opp i konsollfeil og varsler',
      description: 'Tekniske feil i nettleseren skjuler ofte følgeproblemer og bør bort før du finjusterer videre.',
      icon: Monitor,
      categoryKey: 'bestPractices',
    },
    {
      title: 'Stram opp tredjepartsskript',
      description: 'Fjern eller utsett kode som skaper unødvendig risiko, støy eller ustabilitet i første last.',
      icon: Gauge,
      categoryKey: 'bestPractices',
    },
    {
      title: 'Oppdater tekniske standarder',
      description: 'Bruk moderne mønstre og rydd bort utdaterte løsninger som svekker tillit og vedlikeholdbarhet.',
      icon: Zap,
      categoryKey: 'bestPractices',
    },
  ],
  seo: [
    {
      title: 'Spiss titler og beskrivelser',
      description: 'Gjør det tydeligere hva siden handler om i søk, delinger og landingsøyeblikket.',
      icon: Search,
      categoryKey: 'seo',
    },
    {
      title: 'Forbedre innholdsstrukturen',
      description: 'Sørg for at overskrifter, hierarki og lenker peker tydelig mot det viktigste innholdet.',
      icon: Monitor,
      categoryKey: 'seo',
    },
    {
      title: 'Prioriter mobil tydelighet',
      description: 'SEO taper fort verdi når innholdet blir tregt eller utydelig på mobil der brukeren møter deg først.',
      icon: Smartphone,
      categoryKey: 'seo',
    },
  ],
};

const normalizeDisplayValue = (value) => String(value || '').replace(/\u00a0/g, ' ').trim();

const formatNumber = (value, options = {}) => new Intl.NumberFormat('nb-NO', options).format(value);

const formatDuration = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '';
  }

  if (numeric >= 1000) {
    return `${formatNumber(numeric / 1000, { maximumFractionDigits: numeric >= 10000 ? 0 : 1 })} s`;
  }

  return `${formatNumber(numeric, { maximumFractionDigits: 0 })} ms`;
};

const formatBytes = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '';
  }

  if (numeric >= 1024 * 1024) {
    return `${formatNumber(numeric / (1024 * 1024), { maximumFractionDigits: 1 })} MiB`;
  }

  return `${formatNumber(numeric / 1024, { maximumFractionDigits: 0 })} KiB`;
};

const stripMarkdownLinks = (value) =>
  String(value || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const summarizeAuditDescription = (audit) => {
  const description = stripMarkdownLinks(audit?.description || '');
  if (!description) {
    return 'Se detaljene i Lighthouse for eksakte elementer og ressurser som er berørt.';
  }

  const [firstSentence] = description.split(/(?<=[.!?])\s+/);
  return firstSentence || description;
};

const getCollectionValues = (value) => {
  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.values(value);
};

const getArray = (value) => (Array.isArray(value) ? value : []);

const getTotalMetricSavings = (audit) =>
  getCollectionValues(audit?.metricSavings).reduce((sum, value) => sum + (Number(value) || 0), 0);

const getOverallSavingsMs = (audit) => Number(audit?.details?.overallSavingsMs || 0);

const getOverallSavingsBytes = (audit) => Number(audit?.details?.overallSavingsBytes || 0);

const getForcedReflowDuration = (audit) =>
  getArray(audit?.details?.items).reduce((total, section) => {
    const items = getArray(section?.items);
    return total + items.reduce((sum, item) => sum + (Number(item?.reflowTime) || 0), 0);
  }, 0);

const getLongestNetworkChainDuration = (audit) => {
  const sections = getArray(audit?.details?.items);
  for (const section of sections) {
    const duration = Number(section?.value?.longestChain?.duration || 0);
    if (duration > 0) {
      return duration;
    }
  }

  return 0;
};

const getDominantLcpBreakdown = (audit) => {
  const sections = getArray(audit?.details?.items);
  const table = sections.find((section) => Array.isArray(section?.items));
  const items = getArray(table?.items);

  return items.reduce((dominant, item) => {
    const duration = Number(item?.duration || 0);
    if (!dominant || duration > dominant.duration) {
      return {
        label: String(item?.label || '').trim(),
        duration,
      };
    }

    return dominant;
  }, null);
};

const getAuditImpactScore = (audit, meta) => {
  const score = typeof audit?.score === 'number' ? audit.score : 1;
  const severityScore = Math.round((1 - Math.max(0, Math.min(1, score))) * 120);
  const weightScore = Math.round((Number(meta?.weight) || 0) * 100);
  const savingsScore = Math.round(getOverallSavingsMs(audit) / 25) + Math.round(getTotalMetricSavings(audit) / 25);
  const bytesScore = Math.round(getOverallSavingsBytes(audit) / 18000);
  const insightScore = Math.round(getForcedReflowDuration(audit) / 25) + Math.round(getLongestNetworkChainDuration(audit) / 25);

  return (meta?.basePriority || 100) + weightScore + severityScore + savingsScore + bytesScore + insightScore;
};

const getAuditMetaMap = (categories) => {
  const metaMap = new Map();

  Object.entries(CATEGORY_CONFIG).forEach(([categoryKey, config]) => {
    const refs = Array.isArray(categories?.[categoryKey]?.auditRefs) ? categories[categoryKey].auditRefs : [];

    refs.forEach((ref) => {
      const nextMeta = {
        categoryKey,
        categoryLabel: config.label,
        icon: config.icon,
        basePriority: config.basePriority,
        weight: Number(ref?.weight) || 0,
      };
      const currentMeta = metaMap.get(ref.id);

      if (!currentMeta || nextMeta.weight > currentMeta.weight || nextMeta.basePriority > currentMeta.basePriority) {
        metaMap.set(ref.id, nextMeta);
      }
    });
  });

  return metaMap;
};

const shouldUseAuditAsFix = (auditId, audit) => {
  const displayMode = String(audit?.scoreDisplayMode || '').trim();
  const score = typeof audit?.score === 'number' ? audit.score : null;
  const msSavings = getOverallSavingsMs(audit) + getTotalMetricSavings(audit);
  const byteSavings = getOverallSavingsBytes(audit);
  const reflowDuration = getForcedReflowDuration(audit);
  const chainDuration = getLongestNetworkChainDuration(audit);
  const dominantLcpPart = getDominantLcpBreakdown(audit);

  if (!displayMode || displayMode === 'notApplicable' || displayMode === 'manual' || displayMode === 'error') {
    return false;
  }

  if (score !== null && score < 0.9 && displayMode !== 'informative') {
    return true;
  }

  switch (auditId) {
    case 'unused-javascript':
    case 'unused-css-rules':
    case 'modern-image-formats':
    case 'uses-optimized-images':
    case 'uses-responsive-images':
    case 'offscreen-images':
    case 'uses-webp-images':
    case 'render-blocking-resources':
    case 'server-response-time':
      return msSavings >= 250 || byteSavings >= 32 * 1024;
    case 'forced-reflow-insight':
      return reflowDuration >= 120;
    case 'network-dependency-tree-insight':
      return chainDuration >= 1500;
    case 'lcp-breakdown-insight':
      return Number(dominantLcpPart?.duration || 0) >= 800;
    default:
      return false;
  }
};

const buildFallbackFix = (auditId, audit, meta) => {
  const Icon = meta?.icon || Gauge;
  const displayValue = normalizeDisplayValue(audit?.displayValue);
  const prefix = meta?.categoryLabel ? `${meta.categoryLabel} peker på` : 'Lighthouse peker på';
  const description = displayValue
    ? `${prefix} "${audit.title}" (${displayValue}). ${summarizeAuditDescription(audit)}`
    : `${prefix} "${audit.title}". ${summarizeAuditDescription(audit)}`;

  return {
    group: auditId,
    icon: Icon,
    categoryKey: normalizeCategoryKey(meta?.categoryKey),
    title: audit?.title || 'Se nærmere på audit-funnet',
    description,
  };
};

const buildMappedFix = (auditId, audit, meta) => {
  const displayValue = normalizeDisplayValue(audit?.displayValue);
  const bytesSaved = formatBytes(getOverallSavingsBytes(audit));
  const msSaved = formatDuration(getOverallSavingsMs(audit) + getTotalMetricSavings(audit));

  switch (auditId) {
    case 'largest-contentful-paint':
      return {
        group: 'largest-contentful-paint',
        icon: Zap,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Få ned Largest Contentful Paint',
        description: `LCP er nå ${displayValue || 'for treg'}. Prioriter innholdet over bretten og fjern tunge ressurser før hero-seksjonen vises.`,
      };
    case 'first-contentful-paint':
      return {
        group: 'first-contentful-paint',
        icon: Zap,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Vis første innhold raskere',
        description: `Første innhold dukker opp etter ${displayValue || 'for lang tid'}. Kutt tidlige avhengigheter og få tekst eller grafikk raskere inn i viewporten.`,
      };
    case 'speed-index':
      return {
        group: 'speed-index',
        icon: Gauge,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Fyll det synlige skjermbildet raskere',
        description: `Speed Index er ${displayValue || 'høy'}. Reduser det som forsinker innholdet brukeren faktisk ser først.`,
      };
    case 'total-blocking-time':
    case 'interactive':
    case 'bootup-time':
    case 'mainthread-work-breakdown':
      return {
        group: 'main-thread',
        icon: Gauge,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Kutt blokkering på hovedtråden',
        description: `Hovedtråden er opptatt${displayValue ? ` i ${displayValue}` : ''}. Del opp tung JavaScript og flytt ikke-kritisk kode ut av første last.`,
      };
    case 'render-blocking-resources':
      return {
        group: 'render-blocking',
        icon: Gauge,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Fjern render-blokkerende ressurser',
        description: `Google anslår at du kan spare ${displayValue || msSaved || 'merkbar tid'} ved å utsette CSS og JS som blokkerer første tegning.`,
      };
    case 'unused-javascript':
      return {
        group: 'unused-javascript',
        icon: Gauge,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Reduser ubrukt JavaScript',
        description: `Det ligger igjen ${displayValue || bytesSaved || 'unødvendig mye JavaScript'} i første last. Kutt biblioteker og moduler som ikke trengs med en gang.`,
      };
    case 'unused-css-rules':
      return {
        group: 'unused-css',
        icon: Monitor,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Reduser ubrukt CSS',
        description: `Styles som ikke brukes med en gang tar fortsatt plass${displayValue ? ` (${displayValue})` : ''}. Del opp eller fjern CSS som ikke trengs i første skjermbilde.`,
      };
    case 'modern-image-formats':
    case 'uses-optimized-images':
    case 'uses-responsive-images':
    case 'offscreen-images':
    case 'uses-webp-images':
      return {
        group: 'images',
        icon: Monitor,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Optimaliser bildene',
        description: `Bildene kan fortsatt strammes inn${displayValue ? ` (${displayValue})` : bytesSaved ? ` med rundt ${bytesSaved} mulig besparelse` : ''}. Bruk riktige formater, størrelser og lazy loading.`,
      };
    case 'cumulative-layout-shift':
      return {
        group: 'layout-shift',
        icon: Shield,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Stabiliser layouten',
        description: `CLS er ${displayValue || 'for høy'}. Reserver plass til bilder, embeds og moduler så innholdet ikke hopper under lasting.`,
      };
    case 'server-response-time':
      return {
        group: 'server-response-time',
        icon: Search,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Kort ned server-responstiden',
        description: `${displayValue || 'Første svar fra serveren kommer for sent'}. Se på caching, hosting og backend-kall før resten av optimaliseringen.`,
      };
    case 'network-dependency-tree-insight': {
      const chainDuration = formatDuration(getLongestNetworkChainDuration(audit));
      return {
        group: 'network-chain',
        icon: Search,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Bryt opp kritiske request-kjeder',
        description: `Kritiske ressurser ligger i en kjede på ${chainDuration || 'for lang tid'}. Utsett fonter, tredjepartsskript og andre ikke-kritiske kall.`,
      };
    }
    case 'forced-reflow-insight': {
      const reflowDuration = formatDuration(getForcedReflowDuration(audit));
      return {
        group: 'forced-reflow',
        icon: Gauge,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Fjern tvungen reflow',
        description: `JavaScript utløser minst ${reflowDuration || 'merkbar'} layoutberegning. Unngå å lese layout rett etter DOM-endringer og flytt tung målelogikk ut av kritisk sti.`,
      };
    }
    case 'lcp-breakdown-insight': {
      const dominantPart = getDominantLcpBreakdown(audit);
      return {
        group: 'lcp-breakdown',
        icon: Zap,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: dominantPart?.label ? `Prioriter ${dominantPart.label.toLowerCase()} i LCP-kjeden` : 'Se hva som drar ut LCP',
        description: dominantPart
          ? `${dominantPart.label} bruker ${formatDuration(dominantPart.duration)} i LCP-kjeden. Begynn der i stedet for å gjøre bred, generell tuning.`
          : summarizeAuditDescription(audit),
      };
    }
    case 'errors-in-console':
      return {
        group: 'errors-in-console',
        icon: Shield,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Rydd opp i nettleserfeil',
        description: 'Runtime-feil i konsollen skjuler ofte følgeproblemer og kan slå ut på både ytelse og stabilitet. Fjern dem før du finjusterer videre.',
      };
    case 'label-content-name-mismatch':
      return {
        group: 'a11y-labels',
        icon: Shield,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Sørg for at synlige etiketter matcher',
        description: 'Synlig tekst og tilgjengelige navn peker ikke på det samme. Da kan skjermlesere lese noe annet enn brukeren faktisk ser.',
      };
    case 'td-has-header':
      return {
        group: 'a11y-table',
        icon: Shield,
        categoryKey: normalizeCategoryKey(meta?.categoryKey),
        title: 'Gjør tabeller forståelige for hjelpemidler',
        description: 'Store tabeller mangler kobling mellom celler og overskrifter. Legg inn riktige th-elementer og scope/headers der det trengs.',
      };
    default:
      return buildFallbackFix(auditId, audit, meta);
  }
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

const buildTopFixes = (audits, categories) => {
  const auditMetaMap = getAuditMetaMap(categories);
  const candidates = Object.entries(audits)
    .flatMap(([auditId, audit]) => {
      if (!shouldUseAuditAsFix(auditId, audit)) {
        return [];
      }

      const meta = auditMetaMap.get(auditId) || CATEGORY_CONFIG.performance;

      try {
        return [{
          ...buildMappedFix(auditId, audit, meta),
          impactScore: getAuditImpactScore(audit, meta),
        }];
      } catch (error) {
        console.error('[speed-test] Failed to map Lighthouse audit', auditId, error);
        return [{
          ...buildFallbackFix(auditId, audit, meta),
          impactScore: Number(meta?.basePriority) || 100,
        }];
      }
    })
    .sort((left, right) => right.impactScore - left.impactScore);

  const uniqueFixes = [];
  const seenGroups = new Set();

  candidates.forEach((candidate) => {
    if (seenGroups.has(candidate.group)) {
      return;
    }

    seenGroups.add(candidate.group);
    uniqueFixes.push({
      title: candidate.title,
      description: candidate.description,
      icon: candidate.icon,
      categoryKey: candidate.categoryKey,
    });
  });

  return uniqueFixes.concat(DEFAULT_FIXES).slice(0, 3);
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

  return enrichReport({
    analyzedUrl: getHostLabel(requestedUrl),
    requestedUrl,
    strategy,
    fetchedAt: new Date().toISOString(),
    summary: getSummaryText(scores.performance, strategy),
    scores,
    metrics: buildMetricList(audits),
    topFixes: buildTopFixes(audits, categories),
  });
};

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

const ProofCard = ({ item, index }) => {
  const Icon = item.icon;

  return (
    <Motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      viewport={{ once: true, amount: 0.35 }}
      className="st-proof-card"
    >
      <div className="st-proof-icon">
        <Icon size={18} />
      </div>
      <div className="st-proof-body">
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </div>
    </Motion.article>
  );
};

const StepCard = ({ item, index }) => {
  const Icon = item.icon;

  return (
    <Motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      viewport={{ once: true, amount: 0.35 }}
      className="st-step-card"
    >
      <div className="st-step-top">
        <span className="st-step-number">{item.step}</span>
        <span className="st-step-icon">
          <Icon size={18} />
        </span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </Motion.article>
  );
};

const FaqItem = ({ item }) => (
  <article className="st-faq-item">
    <h4>{item.question}</h4>
    <p>{item.answer}</p>
  </article>
);

const PreviewScoreCard = ({ label, score }) => {
  const tone = getScoreTone(score);

  return (
    <article className="st-preview-score-card">
      <p className="st-preview-score-label">{label}</p>
      <div className="st-preview-score-value-wrap">
        <span className="st-preview-score-value" style={{ color: tone.accent }}>{score}</span>
        <span className="st-preview-score-total">/100</span>
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
  const tones = [
    {
      chip: 'Høy impact',
      chipColor: '#ba1a1a',
      badgeBackground: 'rgba(186, 26, 26, 0.08)',
      badgeColor: '#ba1a1a',
    },
    {
      chip: 'Medium impact',
      chipColor: '#944a00',
      badgeBackground: 'rgba(148, 74, 0, 0.12)',
      badgeColor: '#944a00',
    },
    {
      chip: 'Lav impact',
      chipColor: '#0d7a43',
      badgeBackground: 'rgba(13, 122, 67, 0.12)',
      badgeColor: '#0d7a43',
    },
  ];
  const tone = tones[index] || tones[tones.length - 1];

  return (
    <article className="st-plan-item">
      <div className="st-plan-badge" style={{ backgroundColor: tone.badgeBackground, color: tone.badgeColor }}>
        {index + 1}
      </div>
      <div className="st-plan-copy">
        <h4>{fix.title}</h4>
        <p>{fix.description}</p>
      </div>
      <span className="st-plan-impact" style={{ color: tone.chipColor }}>{tone.chip}</span>
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
  const [sendingReport, setSendingReport] = useState(false);
  const [reportEmailFeedback, setReportEmailFeedback] = useState(null);
  const [reportEmail, setReportEmail] = useState('');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setReportEmail(window.localStorage.getItem('speed_test_report_email') || '');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-active', isMobileMenuOpen);

    return () => {
      document.body.classList.remove('mobile-menu-active');
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    setReportEmailFeedback(null);

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

      let nextReport;

      try {
        nextReport = buildReport(data.lighthouseResult, normalizedUrl, strategy);
      } catch (reportError) {
        console.error('[speed-test] Failed to build report from Lighthouse data', reportError);
        const nextError = new Error('Kunne ikke bygge rapporten fra Lighthouse-data.');
        nextError.code = 'report_build_failed';
        nextError.details = reportError?.message || '';
        throw nextError;
      }

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
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSendReportEmail = async () => {
    if (!results) {
      setReportEmailFeedback({
        type: 'error',
        message: 'Kjør testen først, så kan rapporten sendes på e-post.',
      });
      return;
    }

    const normalizedEmail = reportEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setReportEmailFeedback({
        type: 'error',
        message: 'Legg inn en e-postadresse før du sender rapporten.',
      });
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setReportEmailFeedback({
        type: 'error',
        message: 'E-postadressen ser ikke gyldig ut. Sjekk den og prøv igjen.',
      });
      return;
    }

    setSendingReport(true);
    setReportEmailFeedback(null);

    try {
      const response = await fetch('/api/speed-test/report-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report: activeReport,
          recipientEmail: normalizedEmail,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        const nextError = new Error(payload?.error || 'Kunne ikke sende rapporten.');
        nextError.code = payload?.code || 'report_email_failed';
        throw nextError;
      }

      setReportEmailFeedback({
        type: 'success',
        message: `Rapporten ble sendt til ${normalizedEmail}.`,
      });
      window.localStorage.setItem('speed_test_report_email', normalizedEmail);
    } catch (requestError) {
      console.error(requestError);
      setReportEmailFeedback({
        type: 'error',
        message: getReportEmailErrorMessage(requestError),
      });
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="st-page">
      <div className="st-bg-orb st-bg-orb--warm" />
      <div className="st-bg-orb st-bg-orb--cool" />
      <div className="st-bg-wash" />

      <div className="st-app">
        <header className={headerScrolled ? 'header scrolled' : 'header'}>
          <div className="container nav-container">
            <a href="/" className="logo" aria-label="tk-design">
              <span className="logo-icon">
                <img src="/img/logo/d.webp" alt="tk-design logo" />
              </span>
              <span className="logo-text">tk-design</span>
            </a>

            <nav className="nav-desktop" aria-label="Hovednavigasjon">
              <ul>
                {SITE_NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lang-switch-desktop" aria-label="Velg språk">
              <a href="/en" className="lang-btn" lang="en">EN</a>
              <a href="/speed-test" className="lang-btn active" lang="no" aria-current="page">NO</a>
            </div>

            <button
              className="menu-trigger"
              aria-label="Åpne meny"
              aria-expanded={isMobileMenuOpen}
              aria-controls="speed-test-mobile-menu"
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        <div
          id="speed-test-mobile-menu"
          className={`mobile-menu-overlay${isMobileMenuOpen ? ' active' : ''}`}
          aria-hidden={!isMobileMenuOpen}
          onClick={closeMobileMenu}
        >
          <nav className="mobile-nav" aria-label="Mobilnavigasjon" onClick={(event) => event.stopPropagation()}>
            <button className="menu-close" type="button" aria-label="Lukk meny" onClick={closeMobileMenu}>
              <X size={28} />
            </button>

            <ul>
              {SITE_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={closeMobileMenu}>{item.label}</a>
                </li>
              ))}
            </ul>

            <div className="mobile-menu-footer">
              <div className="mobile-contact-info">
                <a href="mailto:thomas@tk-design.no" onClick={closeMobileMenu}>thomas@tk-design.no</a>
                <a href="tel:+4793094615" onClick={closeMobileMenu}>930 94 615</a>
              </div>
              <div className="mobile-social-links">
                <a
                  href="https://www.facebook.com/profile.php?id=61574614704737&locale=nb_NO"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://www.instagram.com/tkdesign777"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
              </div>
            </div>
          </nav>
        </div>

        <main className="st-main">
          <section id="analysis" className="st-hero-section">
            <div className="st-shell st-hero">
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="st-hero-copy"
              >
                <span className="st-kicker">PRESTASJONSANALYSE</span>
                <h1 className="st-title">Se hvorfor nettsiden taper fart før kunden gjør det.</h1>

                <Motion.form
                  id="hero-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.45 }}
                  onSubmit={testSite}
                  className="st-form"
                >
                  <div className="st-form-grid">
                    <label className="st-field st-field--url" htmlFor="speed-url">
                      <span className="st-input">
                        <input
                          id="speed-url"
                          type="text"
                          value={url}
                          onChange={(event) => setUrl(event.target.value)}
                          autoCapitalize="none"
                          autoComplete="url"
                          autoCorrect="off"
                          inputMode="url"
                          placeholder="Skriv inn din URL (f.eks. eksempel.no)"
                          spellCheck={false}
                        />
                      </span>
                    </label>

                    <button type="submit" disabled={loading} className="st-submit">
                      {loading ? (
                        <>
                          <span className="st-spinner" />
                          Kjører test
                        </>
                      ) : (
                        <>
                          <Gauge size={18} />
                          Kjør Test
                        </>
                      )}
                    </button>
                  </div>

                  <div className="st-hero-meta">
                    <p>Gratis analyse av Core Web Vitals på 30 sekunder.</p>
                    <div className="st-hero-strategy">
                      <button
                        type="button"
                        className={strategy === 'mobile' ? 'is-active' : ''}
                        onClick={() => setStrategy('mobile')}
                      >
                        Mobil
                      </button>
                      <button
                        type="button"
                        className={strategy === 'desktop' ? 'is-active' : ''}
                        onClick={() => setStrategy('desktop')}
                      >
                        Desktop
                      </button>
                    </div>
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
                  <div className="st-stage-head">
                    <div>
                      <h3>Analyse-oversikt</h3>
                      <p>NÅTIDSRAPPORT</p>
                    </div>
                    <Gauge size={28} />
                  </div>

                  <div className="st-preview-grid">
                    {SCORE_DEFINITIONS.map(({ key, label }) => (
                      <PreviewScoreCard key={key} label={label} score={activeReport.scores[key]} />
                    ))}
                  </div>
                </div>
              </Motion.aside>
            </div>
          </section>

          {results && (
            <section id="resultat" className="st-report-section">
              <div className="st-shell st-report-layout">
                <Motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="st-report-copy"
                >
                  <span className="st-kicker">SCOREOVERSIKT</span>
                  <h2>Først får du hele bildet fra testen.</h2>
                  <p>
                    {results.summary}
                    {' '}
                    Her ser du totalscorene for
                    {' '}
                    <strong>{results.analyzedUrl}</strong>
                    {' '}
                    på
                    {' '}
                    {getStrategyLabel(results.strategy).toLowerCase()}
                    {' '}
                    før du går videre til målinger og tiltak.
                  </p>
                  <div className="st-report-meta">
                    <span>{results.analyzedUrl}</span>
                    <span>{getStrategyLabel(results.strategy)}</span>
                  </div>
                </Motion.div>

                <Motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="st-stage st-stage--report"
                >
                  <div className="st-stage-card">
                    <div className="st-stage-head">
                      <div>
                        <h3>Analyse-oversikt</h3>
                        <p>KJØRT TEST</p>
                      </div>
                      <Gauge size={28} />
                    </div>

                    <div className="st-preview-grid">
                      {SCORE_DEFINITIONS.map(({ key, label }) => (
                        <PreviewScoreCard key={key} label={label} score={results.scores[key]} />
                      ))}
                    </div>
                  </div>
                </Motion.div>
              </div>
            </section>
          )}

          <section className="st-value-section">
            <div className="st-shell">
              <div className="st-section-intro st-section-intro--split">
                <div>
                  <span className="st-kicker">VERDISKAPNING</span>
                  <h2>Ikke bare tall, men tiltak.</h2>
                </div>
                <p>
                  Vi oversetter komplekse tekniske funn til konkrete forretningsmuligheter,
                  og viser nøyaktig hva som hindrer et bedre førsteinntrykk.
                </p>
              </div>

              <div className="st-feature-grid">
                {PAGE_HIGHLIGHTS.map((item, index) => (
                  <HighlightCard key={item.title} item={item} index={index} />
                ))}
              </div>
            </div>
          </section>

          <section id="metrics" className="st-metrics-section">
            <div className="st-shell">
              <div className="st-section-intro st-section-intro--center">
                <span className="st-kicker">CORE WEB VITALS</span>
                <h2>Målingene som styrer førsteinntrykket.</h2>
              </div>

              <div className="st-metric-grid">
                {activeReport.metrics.slice(0, 5).map((metric) => (
                  <MetricCard key={metric.key} metric={metric} />
                ))}
              </div>
            </div>
          </section>

          <section id="methodology" className="st-action-section">
            <div className="st-shell st-action-layout">
              <div className="st-action-copy">
                <span className="st-kicker">HANDLINGSPLAN</span>
                <h2>Dette ville jeg gjort først for ytelse.</h2>
                <p>En prioritert liste over tiltakene som vanligvis gir størst utslag først.</p>
              </div>

              <div className="st-plan-list">
                {activeReport.topFixes.map((fix, index) => (
                  <FixItem key={fix.title} fix={fix} index={index} />
                ))}
              </div>
            </div>
          </section>

          <section id="faq" className="st-faq-section">
            <div className="st-shell st-faq-shell">
              <div className="st-section-intro st-section-intro--center">
                <span className="st-kicker">VANLIGE SPØRSMÅL</span>
                <h2>Det viktigste du lurer på før du tester.</h2>
              </div>

              <div className="st-faq-grid">
                {FAQ_ITEMS.map((item) => (
                  <FaqItem key={item.question} item={item} />
                ))}
              </div>
            </div>
          </section>

          <section className="st-newsletter-section">
            <div className="st-shell">
              <div className="st-newsletter-card">
                <div className="st-newsletter-copy">
                  <h2>Få din personlige handlingsplan på e-post.</h2>
                  <p>
                    Vi sender deg en konkret rapport med de viktigste tiltakene og neste steg for siden din.
                  </p>
                </div>

                <div className="st-newsletter-form">
                  <label className="st-cta-field" htmlFor="report-email">
                    <span className="st-cta-input">
                      <Mail size={18} />
                      <input
                        id="report-email"
                        type="email"
                        value={reportEmail}
                        onChange={(event) => {
                          setReportEmail(event.target.value);
                          if (reportEmailFeedback) {
                            setReportEmailFeedback(null);
                          }
                        }}
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        inputMode="email"
                        placeholder="Din e-postadresse"
                        spellCheck={false}
                      />
                    </span>
                  </label>
                  <button
                    type="button"
                    className="st-button st-button--newsletter"
                    onClick={handleSendReportEmail}
                    disabled={!results || sendingReport}
                  >
                    {sendingReport
                      ? 'Sender rapport...'
                      : results
                        ? 'Send meg rapporten'
                        : 'Kjør testen først'}
                  </button>
                  <p className="st-newsletter-note">
                    Ved å sende inn godtar du våre vilkår og personvernerklæring.
                  </p>
                  {reportEmailFeedback && (
                    <Motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      aria-live="polite"
                      className={`st-feedback st-feedback--${reportEmailFeedback.type}`}
                    >
                      {reportEmailFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      <p>{reportEmailFeedback.message}</p>
                    </Motion.div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer pt_120 pb_120" style={{ borderTop: '1px solid var(--clr-border)' }}>
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
                {FOOTER_SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.label}
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
                <a href="/accessibility" style={{ color: 'var(--clr-base)' }}>Accessibility Statement</a>
                <a href="/privacy" style={{ color: 'var(--clr-base)' }}>Privacy Policy</a>
                <a href="/admin/" className="admin-secret" style={{ color: '#777', fontSize: '0.8em' }}>Admin</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
