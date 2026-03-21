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
    title: 'Samme datagrunnlag som Google',
    text: 'Vi bygger på Lighthouse-data fra PageSpeed Insights, men kutter bort støyen og viser hva som betyr mest først.',
    icon: Gauge,
  },
  {
    title: 'Bygget for prioritering',
    text: 'Rapporten oversetter tekniske funn til en konkret rekkefølge du kan bruke i møte med design, kode og innhold.',
    icon: Monitor,
  },
  {
    title: 'Lett å sende videre',
    text: 'Bruk rapporten som beslutningsgrunnlag når du skal brief utvikler, byrå eller et internt team.',
    icon: Shield,
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
    question: 'Hva tester hjemmesidesjekken egentlig?',
    answer:
      'Vi henter offentlig Lighthouse-data fra Google PageSpeed Insights og viser de viktigste funnene for ytelse, tilgjengelighet, beste praksis og SEO.',
  },
  {
    question: 'Lagrer dere URL-en eller resultatene?',
    answer:
      'Nei. Testen bruker kun offentlig tilgjengelige data og er laget for å hente inn resultatet når du ber om det. Den er ikke laget som et lagringssystem.',
  },
  {
    question: 'Er dette det samme som Google PageSpeed Insights?',
    answer:
      'Datagrunnlaget kommer fra Google, men siden pakker funnene om til en tydeligere rapport med mer prioriterte anbefalinger og mindre støy.',
  },
  {
    question: 'Hvorfor bør jeg teste både mobil og desktop?',
    answer:
      'Mange nettsteder ser greie ut på desktop, men taper fart, stabilitet og tydelighet på mobil. Derfor er det nyttig å se begge visningene hver for seg.',
  },
  {
    question: 'Kan TK-design hjelpe med å fikse funnene?',
    answer:
      'Ja. Hvis rapporten viser problemer, kan vi gå gjennom dem sammen og oversette funnene til konkrete tiltak for design, kode, innhold og SEO.',
  },
];

const NAV_ITEMS = [
  { href: '/', label: { no: 'Hjem', en: 'Home' } },
  { href: '/?section=about', label: { no: 'Om oss', en: 'About us' } },
  { href: '/?section=services', label: { no: 'Tjenester', en: 'Services' } },
  { href: '/?section=projects', label: { no: 'Prosjekter', en: 'Projects' } },
  { href: '/?section=testimonial', label: { no: 'Hvorfor oss', en: 'Why us' } },
  { href: '/blog', label: { no: 'Aktuelt', en: 'News' } },
  { href: '/contact', label: { no: 'Kontakt', en: 'Contact' } },
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

const getCookie = (name) => {
  if (typeof document === 'undefined') {
    return '';
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : '';
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

const getDefaultCategoryKey = (report) => {
  if (!report?.scores) {
    return 'performance';
  }

  if (!report.fetchedAt) {
    return 'performance';
  }

  return Object.entries(report.scores).reduce(
    (lowest, entry) => (entry[1] < lowest[1] ? entry : lowest),
    ['performance', report.scores.performance ?? 0],
  )[0];
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
}) => {
  const resolvedLanguage = language === 'en' ? 'en' : 'no';

  return (
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
                <a href={item.href}>{item.label[resolvedLanguage]}</a>
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
                {item.label[resolvedLanguage]}
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
};

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

const FaqItem = ({ item, defaultOpen = false }) => (
  <details className="st-faq-item" open={defaultOpen}>
    <summary>
      <span>{item.question}</span>
      <span className="st-faq-toggle" aria-hidden="true">+</span>
    </summary>
    <p>{item.answer}</p>
  </details>
);

const AuthorityBadge = ({ item }) => {
  const Icon = item.icon;

  return (
    <div className="st-authority-item">
      <span className="st-authority-mark">
        <Icon size={18} />
      </span>
      <div className="st-authority-copy">
        <strong>{item.title}</strong>
        <span>{item.text}</span>
      </div>
    </div>
  );
};

const ScoreCard = ({ label, score, dark = false, active = false, onClick }) => {
  const tone = getScoreTone(score);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const Element = onClick ? 'button' : 'article';

  return (
    <Element
      {...(onClick ? { type: 'button', onClick } : {})}
      className={`st-score-card${dark ? ' is-dark' : ''}${active ? ' is-active' : ''}${onClick ? ' is-clickable' : ''}`}
    >
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
    </Element>
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
  const [sendingReport, setSendingReport] = useState(false);
  const [reportEmailFeedback, setReportEmailFeedback] = useState(null);
  const [reportEmail, setReportEmail] = useState('');
  const [language, setLanguage] = useState('no');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('performance');

  useEffect(() => {
    const storedLang = getCookie('site_lang') || window.localStorage.getItem('site_lang') || 'no';
    setLanguage(storedLang === 'en' ? 'en' : 'no');
    setReportEmail(window.localStorage.getItem('speed_test_report_email') || '');
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

  useEffect(() => {
    setSelectedCategoryKey(getDefaultCategoryKey(results ?? PREVIEW_REPORT));
  }, [results]);

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

  const activeReport = enrichReport(results ?? PREVIEW_REPORT);
  const activeCategoryView = activeReport.categoryViews[selectedCategoryKey] ?? activeReport.categoryViews.performance;

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
                Drevet av Google PageSpeed Insights
              </div>

              <p className="st-script">Gratis hjemmesidesjekk</p>
              <h1 className="st-title">Se hvorfor nettsiden taper fart før kunden gjør det.</h1>
              <p className="st-lead">
                Lim inn en URL og få en tydelig rapport som viser hva som bremser opplevelsen,
                hvilke tall som faktisk betyr noe og hva som bør tas først.
              </p>

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
                  <p>Ingen innlogging, ingen kredittkort, bare offentlig Lighthouse-data fra Google.</p>
                  <a href="#resultat">
                    Se eksempelrapporten
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

                <h2>
                  {results ? (
                    <>
                      Rapport klar for
                      {' '}
                      <span className="st-inline-domain st-inline-domain--stage">
                        {activeReport.analyzedUrl}
                      </span>
                    </>
                  ) : (
                    'Dette får du tilbake etter testen'
                  )}
                </h2>
                <p>
                  {results
                    ? activeReport.summary
                    : 'En forenklet forhåndsvisning av scorekortene og prioriteringen du får tilbake etter testen.'}
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

          <section className="st-shell st-authority">
            <p className="st-authority-label">Samme fundament som Google bruker når Lighthouse-data hentes ut</p>
            <div className="st-authority-row">
              {AUTHORITY_ITEMS.map((item) => (
                <AuthorityBadge key={item.title} item={item} />
              ))}
            </div>
          </section>

          <section id="fordeler" className="st-shell st-section st-value">
            <div className="st-section-head st-section-head--compact st-section-head--split">
              <div>
                <span className="st-chip st-chip--light">Hvorfor velge denne sjekken</span>
                <h2>Ikke bare tall, men tiltak.</h2>
              </div>
              <p>
                Vi oversetter tekniske Lighthouse-data til en konkret handlingsplan som viser hva som faktisk
                bremser siden, hva som påvirker kundene dine og hva du bør prioritere først.
              </p>
            </div>

            <div className="st-proof-grid">
              {PROOF_ITEMS.map((item, index) => (
                <ProofCard key={item.title} item={item} index={index} />
              ))}
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
                    ? (
                      <>
                        Dette er det neste du bør fikse på
                        {' '}
                        <span className="st-inline-domain">{activeReport.analyzedUrl}</span>
                      </>
                    )
                    : 'Slik er rapporten bygget når testen er ferdig.'}
                </h2>
                <p>
                  {results
                    ? activeReport.summary
                    : 'Klikk på et scorekort i eksempelet under for å se hvordan rapporten bytter mellom målinger, tolkning og handlingsplan.'}
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
                        <p className="st-panel-kicker">
                          {results ? (
                            <>
                              Analysert domene:
                              {' '}
                              <span className="st-inline-domain st-inline-domain--kicker">
                                {activeReport.analyzedUrl}
                              </span>
                            </>
                          ) : (
                            'Scoreoversikt'
                          )}
                        </p>
                        <h3>{results ? 'Her ser du hvor friksjonen ligger akkurat nå' : 'Først får du et raskt overblikk over kvaliteten.'}</h3>
                        <p>
                          Fire scorekort gir deg et tydelig bilde av ytelse, tilgjengelighet, beste praksis og SEO.
                          Klikk på et kort for å se hvilke kontrollpunkter og tiltak som følger med.
                        </p>
                      </div>
                      <div className="st-priority-box">
                        <span>Aktivt fokus</span>
                        <strong>{activeCategoryView.label}</strong>
                      </div>
                    </div>

                    <div className="st-score-grid">
                      {SCORE_DEFINITIONS.map(({ key, label }) => (
                        <ScoreCard
                          key={key}
                          label={label}
                          score={activeReport.scores[key]}
                          active={selectedCategoryKey === key}
                          onClick={() => setSelectedCategoryKey(key)}
                        />
                      ))}
                    </div>
                  </article>

                  <article className="st-panel st-panel--dark">
                    <p className="st-panel-kicker st-panel-kicker--dark">Tolkning</p>
                    <h3>{activeCategoryView.guideTitle}</h3>
                    <ul className="st-reading-list">
                      {activeCategoryView.guidePoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <a href={results ? '/contact' : '#prosess'} className="st-ghost-link">
                      {results ? 'Vil du ha hjelp til å fikse dette?' : 'Se hvordan prosessen fungerer'}
                      <ArrowRight size={16} />
                    </a>
                  </article>
                </div>

                <div className="st-results-grid st-results-grid--secondary">
                  <article className="st-panel st-panel--light">
                    <div className="st-panel-head st-panel-head--stack">
                      <div>
                        <p className="st-panel-kicker">{activeCategoryView.metricKicker}</p>
                        <h3>{activeCategoryView.metricTitle}</h3>
                        <p>{activeCategoryView.metricDescription}</p>
                      </div>
                    </div>

                    <div className="st-metric-grid">
                      {activeCategoryView.metrics.map((metric) => (
                        <MetricCard key={metric.key} metric={metric} />
                      ))}
                    </div>
                  </article>

                  <article className="st-panel st-panel--dark">
                    <p className="st-panel-kicker st-panel-kicker--dark">Handlingsplan</p>
                    <h3>{`Dette ville jeg gjort først for ${activeCategoryView.label.toLowerCase()}.`}</h3>
                    <div className="st-plan-list">
                      {activeCategoryView.fixes.map((fix, index) => (
                        <FixItem key={`${activeCategoryView.label}-${fix.title}`} fix={fix} index={index} />
                      ))}
                    </div>
                  </article>
                </div>
              </Motion.div>
            </AnimatePresence>
          </section>

          <section id="prosess" className="st-shell st-section">
            <div className="st-section-head st-section-head--compact st-section-head--split">
              <div>
                <span className="st-chip st-chip--light">Fra URL til ferdig plan</span>
                <h2>Tre enkle steg fra test til prioritering.</h2>
              </div>
              <p>Først kjører du testen. Deretter pakker vi dataene om til scorekort, fokusområder og en konkret rekkefølge du kan jobbe videre med.</p>
            </div>

            <div className="st-process-grid">
              <div className="st-step-grid">
                {PROCESS_STEPS.map((item, index) => (
                  <StepCard key={item.step} item={item} index={index} />
                ))}
              </div>

              <div className="st-check-card">
                <p className="st-panel-kicker">Det vi ser etter</p>
                <h3>Dette er spørsmålene rapporten hjelper deg å svare på.</h3>
                <ul className="st-check-list">
                  {CHECKLIST_ITEMS.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={18} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="st-shell st-section st-faq">
            <div className="st-section-head st-section-head--compact">
              <span className="st-chip st-chip--light">Vanlige spørsmål</span>
              <div>
                <h2>Det viktigste du lurer på før du tester.</h2>
                <p>Her er de vanligste spørsmålene om datagrunnlaget, personvern og hva du faktisk kan bruke rapporten til etterpå.</p>
              </div>
            </div>

            <div className="st-faq-grid">
              {FAQ_ITEMS.map((item, index) => (
                <FaqItem key={item.question} item={item} defaultOpen={index === 0} />
              ))}
            </div>
          </section>

          <section className="st-shell st-section st-final-cta">
            <div className="st-panel st-panel--dark st-final-cta-card">
              <div className="st-final-cta-copy">
                <span className="st-chip st-chip--dark">Neste steg</span>
                <h2>Få din personlige handlingsplan på e-post.</h2>
                <p>
                  Send rapporten til deg selv eller en kollega, eller book en gjennomgang hvis du vil ha hjelp
                  til å prioritere tiltakene videre.
                </p>
                <div className="st-final-cta-notes">
                  <span>Ingen kredittkort kreves</span>
                  <span>Lav terskel først</span>
                  <span>Book gjennomgang når du er klar</span>
                </div>
              </div>

              <div className="st-final-cta-form">
                <label className="st-cta-field" htmlFor="report-email">
                  <span className="st-label">Få din personlige handlingsplan på e-post</span>
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
                      placeholder="navn@firma.no"
                      spellCheck={false}
                    />
                  </span>
                </label>

                <div className="st-cta-actions">
                  <button
                    type="button"
                    className="st-button st-button--primary"
                    onClick={handleSendReportEmail}
                    disabled={!results || sendingReport}
                  >
                    {sendingReport
                      ? 'Sender handlingsplan...'
                      : results
                        ? 'Få handlingsplanen på e-post'
                        : 'Kjør testen først'}
                    <Mail size={18} />
                  </button>
                  <a href="/contact" className="st-button st-button--secondary">
                    Book en gjennomgang
                    <ExternalLink size={18} />
                  </a>
                </div>

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
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
