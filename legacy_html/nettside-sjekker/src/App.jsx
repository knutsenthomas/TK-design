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
    title: 'Tydelig nok til å brukes med en gang',
    text: 'Du slipper å tolke hele Lighthouse-rapporten selv. Vi trekker frem det som faktisk bør tas først.',
    icon: Gauge,
  },
  {
    title: 'Bedre underlag før redesign eller kampanjer',
    text: 'Bruk sjekken når du skal oppgradere nettstedet, lansere noe nytt eller rydde opp i gamle flaskehalser.',
    icon: Monitor,
  },
  {
    title: 'Lett å sende videre til utvikler eller byrå',
    text: 'Rapporten kan brukes som beslutningsgrunnlag i møte med design, kode, SEO og innholdsarbeid.',
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
    title: 'Samme datagrunnlag som Google',
    text: 'Testen bygger på PageSpeed Insights, men presenterer funnene i et enklere språk.',
    icon: Search,
  },
  {
    title: 'Bygget for prioritering',
    text: 'Rapporten rangerer hva som vanligvis gir størst effekt først, i stedet for å drukne deg i rådata.',
    icon: Zap,
  },
  {
    title: 'Nyttig både før og etter lansering',
    text: 'Bruk sjekken på forsiden, landingssider eller kampanjer for å se hvor førsteinntrykket ryker.',
    icon: Monitor,
  },
];

const REPORT_POINTS = [
  'Vi trekker frem det som påvirker førsteinntrykket og brukbarheten mest.',
  'Du ser hva som handler om fart, hva som handler om stabilitet og hva som påvirker tillit.',
  'Handlingsplanen er sortert for å gjøre neste steg tydelig, ikke bare teknisk korrekt.',
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Lim inn nettadressen',
    text: 'Start med forsiden eller siden som betyr mest for konvertering akkurat nå.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Velg mobil eller desktop',
    text: 'Kjør mobil først når du vil se den mest krevende opplevelsen, eller desktop når større flater er viktigst.',
    icon: Smartphone,
  },
  {
    step: '03',
    title: 'Prioriter riktig med en gang',
    text: 'Få scorekort, nøkkelmålinger og tre konkrete anbefalinger å ta tak i først.',
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
    question: 'Er dette det samme som Google PageSpeed Insights?',
    answer:
      'Datagrunnlaget kommer fra Google, men siden pakker funnene om til en tydeligere rapport med mer prioriterte anbefalinger og mindre støy.',
  },
  {
    question: 'Lagrer dere URL-en eller resultatene?',
    answer:
      'Nei. Testen bruker kun offentlig tilgjengelige data og er laget for å hente inn resultatet når du ber om det. Den er ikke laget som et lagringssystem.',
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
        title: 'Få ned Largest Contentful Paint',
        description: `LCP er nå ${displayValue || 'for treg'}. Prioriter innholdet over bretten og fjern tunge ressurser før hero-seksjonen vises.`,
      };
    case 'first-contentful-paint':
      return {
        group: 'first-contentful-paint',
        icon: Zap,
        title: 'Vis første innhold raskere',
        description: `Første innhold dukker opp etter ${displayValue || 'for lang tid'}. Kutt tidlige avhengigheter og få tekst eller grafikk raskere inn i viewporten.`,
      };
    case 'speed-index':
      return {
        group: 'speed-index',
        icon: Gauge,
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
        title: 'Kutt blokkering på hovedtråden',
        description: `Hovedtråden er opptatt${displayValue ? ` i ${displayValue}` : ''}. Del opp tung JavaScript og flytt ikke-kritisk kode ut av første last.`,
      };
    case 'render-blocking-resources':
      return {
        group: 'render-blocking',
        icon: Gauge,
        title: 'Fjern render-blokkerende ressurser',
        description: `Google anslår at du kan spare ${displayValue || msSaved || 'merkbar tid'} ved å utsette CSS og JS som blokkerer første tegning.`,
      };
    case 'unused-javascript':
      return {
        group: 'unused-javascript',
        icon: Gauge,
        title: 'Reduser ubrukt JavaScript',
        description: `Det ligger igjen ${displayValue || bytesSaved || 'unødvendig mye JavaScript'} i første last. Kutt biblioteker og moduler som ikke trengs med en gang.`,
      };
    case 'unused-css-rules':
      return {
        group: 'unused-css',
        icon: Monitor,
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
        title: 'Optimaliser bildene',
        description: `Bildene kan fortsatt strammes inn${displayValue ? ` (${displayValue})` : bytesSaved ? ` med rundt ${bytesSaved} mulig besparelse` : ''}. Bruk riktige formater, størrelser og lazy loading.`,
      };
    case 'cumulative-layout-shift':
      return {
        group: 'layout-shift',
        icon: Shield,
        title: 'Stabiliser layouten',
        description: `CLS er ${displayValue || 'for høy'}. Reserver plass til bilder, embeds og moduler så innholdet ikke hopper under lasting.`,
      };
    case 'server-response-time':
      return {
        group: 'server-response-time',
        icon: Search,
        title: 'Kort ned server-responstiden',
        description: `${displayValue || 'Første svar fra serveren kommer for sent'}. Se på caching, hosting og backend-kall før resten av optimaliseringen.`,
      };
    case 'network-dependency-tree-insight': {
      const chainDuration = formatDuration(getLongestNetworkChainDuration(audit));
      return {
        group: 'network-chain',
        icon: Search,
        title: 'Bryt opp kritiske request-kjeder',
        description: `Kritiske ressurser ligger i en kjede på ${chainDuration || 'for lang tid'}. Utsett fonter, tredjepartsskript og andre ikke-kritiske kall.`,
      };
    }
    case 'forced-reflow-insight': {
      const reflowDuration = formatDuration(getForcedReflowDuration(audit));
      return {
        group: 'forced-reflow',
        icon: Gauge,
        title: 'Fjern tvungen reflow',
        description: `JavaScript utløser minst ${reflowDuration || 'merkbar'} layoutberegning. Unngå å lese layout rett etter DOM-endringer og flytt tung målelogikk ut av kritisk sti.`,
      };
    }
    case 'lcp-breakdown-insight': {
      const dominantPart = getDominantLcpBreakdown(audit);
      return {
        group: 'lcp-breakdown',
        icon: Zap,
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
        title: 'Rydd opp i nettleserfeil',
        description: 'Runtime-feil i konsollen skjuler ofte følgeproblemer og kan slå ut på både ytelse og stabilitet. Fjern dem før du finjusterer videre.',
      };
    case 'label-content-name-mismatch':
      return {
        group: 'a11y-labels',
        icon: Shield,
        title: 'Sørg for at synlige etiketter matcher',
        description: 'Synlig tekst og tilgjengelige navn peker ikke på det samme. Da kan skjermlesere lese noe annet enn brukeren faktisk ser.',
      };
    case 'td-has-header':
      return {
        group: 'a11y-table',
        icon: Shield,
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

  return {
    analyzedUrl: getHostLabel(requestedUrl),
    requestedUrl,
    strategy,
    fetchedAt: new Date().toISOString(),
    summary: getSummaryText(scores.performance, strategy),
    scores,
    metrics: buildMetricList(audits),
    topFixes: buildTopFixes(audits, categories),
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
  const [sendingReport, setSendingReport] = useState(false);
  const [reportEmailFeedback, setReportEmailFeedback] = useState(null);
  const [reportEmail, setReportEmail] = useState('');
  const [language, setLanguage] = useState('no');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                    Se hvordan rapporten ser ut
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

          <section className="st-shell st-proof-band">
            <div className="st-proof-copy">
              <span className="st-chip st-chip--light">Hvorfor denne sjekken</span>
              <h2>En enklere vei inn i det Google faktisk måler.</h2>
              <p>
                Du får samme type Lighthouse-data som i PageSpeed Insights, men presentert som en tydeligere,
                mer brukbar rapport som er lettere å handle på.
              </p>
            </div>

            <div className="st-proof-grid">
              {PROOF_ITEMS.map((item, index) => (
                <ProofCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </section>

          <section id="fordeler" className="st-shell st-section">
            <div className="st-section-head st-section-head--compact">
              <span className="st-chip st-chip--light">Slik fungerer det</span>
              <div>
                <h2>Fra nettadresse til prioriteringsliste uten å grave i rådata.</h2>
                <p>Først kjører du testen. Deretter pakker vi dataene om til en rapport som er lettere å bruke i faktisk arbeid.</p>
              </div>
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
                    <label className="st-cta-field" htmlFor="report-email">
                      <span className="st-label">Send rapport til</span>
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
                          ? 'Sender rapport...'
                          : results
                            ? 'Send rapporten på e-post'
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
                  </article>
                </div>
              </Motion.div>
            </AnimatePresence>
          </section>

          <section className="st-shell st-section st-faq">
            <div className="st-section-head st-section-head--compact">
              <span className="st-chip st-chip--light">Vanlige spørsmål</span>
              <div>
                <h2>Det viktigste du lurer på før du tester.</h2>
                <p>Her er de vanligste spørsmålene om datagrunnlaget, hva som faktisk testes og hva du kan bruke rapporten til.</p>
              </div>
            </div>

            <div className="st-faq-grid">
              {FAQ_ITEMS.map((item, index) => (
                <FaqItem key={item.question} item={item} defaultOpen={index === 0} />
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
