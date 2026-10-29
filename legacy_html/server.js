const serverContext = Object.defineProperties(
  {},
  {
    ANALYTICS_DATE_RANGE_ALIASES: { get: () => ANALYTICS_DATE_RANGE_ALIASES },
    FIREBASE_WEB_CONFIG_CACHE_MS: { get: () => FIREBASE_WEB_CONFIG_CACHE_MS },
    GEMINI_DEFAULT_MODEL_CANDIDATES: {
      get: () => GEMINI_DEFAULT_MODEL_CANDIDATES,
    },
    GEMINI_MODEL_LIST_CACHE_TTL_MS: {
      get: () => GEMINI_MODEL_LIST_CACHE_TTL_MS,
    },
    PUBLIC_HOSTNAME_REGEX: { get: () => PUBLIC_HOSTNAME_REGEX },
    SEO_GLOBAL_DEFAULTS: { get: () => SEO_GLOBAL_DEFAULTS },
    SEO_PAGE_DEFAULTS: { get: () => SEO_PAGE_DEFAULTS },
    SERVICE_DETAILS_CONTENT: { get: () => SERVICE_DETAILS_CONTENT },
    SERVICE_ROUTE_KEYS: { get: () => SERVICE_ROUTE_KEYS },
    SOCIAL_ENTRY_STATUSES: { get: () => SOCIAL_ENTRY_STATUSES },
    SOCIAL_PLANNER_ASSISTANT_ALLOWED_ACTIONS: {
      get: () => SOCIAL_PLANNER_ASSISTANT_ALLOWED_ACTIONS,
    },
    SOCIAL_PLANNER_ASSISTANT_ALLOWED_TONES: {
      get: () => SOCIAL_PLANNER_ASSISTANT_ALLOWED_TONES,
    },
    SOCIAL_PLANNER_PERIOD_PRESETS: { get: () => SOCIAL_PLANNER_PERIOD_PRESETS },
    SOCIAL_PLATFORMS: { get: () => SOCIAL_PLATFORMS },
    UNSPLASH_QUERY_SYNONYMS: { get: () => UNSPLASH_QUERY_SYNONYMS },
    __dirname: { get: () => __dirname },
    buildAdminStorageObjectName: { get: () => buildAdminStorageObjectName },
    buildFallbackCommentId: { get: () => buildFallbackCommentId },
    buildFirebaseStorageDownloadUrl: {
      get: () => buildFirebaseStorageDownloadUrl,
    },
    buildPostHashtags: { get: () => buildPostHashtags },
    buildRelativePostUrl: { get: () => buildRelativePostUrl },
    buildSingleSpeedTestReportEmailHtml: {
      get: () => buildSingleSpeedTestReportEmailHtml,
    },
    buildSingleSpeedTestReportEmailText: {
      get: () => buildSingleSpeedTestReportEmailText,
    },
    buildSocialPlannerCaption: { get: () => buildSocialPlannerCaption },
    buildSocialPlannerCaptionMap: { get: () => buildSocialPlannerCaptionMap },
    buildSocialPlannerEntryPayload: {
      get: () => buildSocialPlannerEntryPayload,
    },
    buildSocialPlannerPublishTargetMap: {
      get: () => buildSocialPlannerPublishTargetMap,
    },
    buildSocialPlannerTargetAccountPayload: {
      get: () => buildSocialPlannerTargetAccountPayload,
    },
    buildSpeedTestReportEmailMarkup: {
      get: () => buildSpeedTestReportEmailMarkup,
    },
    clampSpeedTestScore: { get: () => clampSpeedTestScore },
    createDefaultSocialPlannerData: {
      get: () => createDefaultSocialPlannerData,
    },
    createGoogleAccessJwt: { get: () => createGoogleAccessJwt },
    createSocialPlannerId: { get: () => createSocialPlannerId },
    crypto: { get: () => crypto },
    decorateBlogPostWithResolvedLink: {
      get: () => decorateBlogPostWithResolvedLink,
    },
    escapeHtml: { get: () => escapeHtml },
    escapeRegExp: { get: () => escapeRegExp },
    extractFirstImageSrcFromHtml: { get: () => extractFirstImageSrcFromHtml },
    extractSocialPlannerMetricsPatch: {
      get: () => extractSocialPlannerMetricsPatch,
    },
    extractSocialWebhookDeliveryMeta: {
      get: () => extractSocialWebhookDeliveryMeta,
    },
    findSocialPlannerPublicationIndex: {
      get: () => findSocialPlannerPublicationIndex,
    },
    firebaseAccessTokenCache: { get: () => firebaseAccessTokenCache },
    firebaseWebConfigCache: { get: () => firebaseWebConfigCache },
    firstDefinedValue: { get: () => firstDefinedValue },
    firstNonEmptyString: { get: () => firstNonEmptyString },
    formatSpeedTestTimestamp: { get: () => formatSpeedTestTimestamp },
    fs: { get: () => fs },
    geminiModelListCache: { get: () => geminiModelListCache },
    genAI: { get: () => genAI },
    getAdminCustomStyleFilePath: { get: () => getAdminCustomStyleFilePath },
    getBlogPostTitleForUrl: { get: () => getBlogPostTitleForUrl },
    getCleanPostSlug: { get: () => getCleanPostSlug },
    getCommentsFilePath: { get: () => getCommentsFilePath },
    getCustomStyleHref: { get: () => getCustomStyleHref },
    getFallbackBlogImage: { get: () => getFallbackBlogImage },
    getFetch: { get: () => getFetch },
    getFirebaseAccessToken: { get: () => getFirebaseAccessToken },
    getFirebaseAuthHelperHost: { get: () => getFirebaseAuthHelperHost },
    getFirebaseConfig: { get: () => getFirebaseConfig },
    getFirebaseSiteDataCollection: { get: () => getFirebaseSiteDataCollection },
    getFirebaseWebConfig: { get: () => getFirebaseWebConfig },
    getFirestoreDocumentUrl: { get: () => getFirestoreDocumentUrl },
    getGeminiGenerateContentModels: {
      get: () => getGeminiGenerateContentModels,
    },
    getGeminiModelCandidates: { get: () => getGeminiModelCandidates },
    getLegacyContentFilePath: { get: () => getLegacyContentFilePath },
    getOrCreateFirebaseWebAppConfig: {
      get: () => getOrCreateFirebaseWebAppConfig,
    },
    getPostsFilePath: { get: () => getPostsFilePath },
    getSeoFilePath: { get: () => getSeoFilePath },
    getSiteBaseUrl: { get: () => getSiteBaseUrl },
    getSocialPlannerFilePath: { get: () => getSocialPlannerFilePath },
    getSocialPlannerState: { get: () => getSocialPlannerState },
    getSpeedTestEmailOpening: { get: () => getSpeedTestEmailOpening },
    getSpeedTestEmailScoreMeta: { get: () => getSpeedTestEmailScoreMeta },
    getTranslationsFilePath: { get: () => getTranslationsFilePath },
    hasFirebaseServerCredentials: { get: () => hasFirebaseServerCredentials },
    inferMimeTypeFromFileName: { get: () => inferMimeTypeFromFileName },
    isGeminiModelNotFoundError: { get: () => isGeminiModelNotFoundError },
    isLegacyBlogPostLink: { get: () => isLegacyBlogPostLink },
    isVercelRuntime: { get: () => isVercelRuntime },
    isWebhookPayloadExplicitFailure: {
      get: () => isWebhookPayloadExplicitFailure,
    },
    listGeminiGenerateContentModels: {
      get: () => listGeminiGenerateContentModels,
    },
    mergeSocialPlannerMetrics: { get: () => mergeSocialPlannerMetrics },
    normalizeAdminStorageFolder: { get: () => normalizeAdminStorageFolder },
    normalizeBlogSlugPart: { get: () => normalizeBlogSlugPart },
    normalizeCommentEntry: { get: () => normalizeCommentEntry },
    normalizeCommentsData: { get: () => normalizeCommentsData },
    normalizeGeminiModelName: { get: () => normalizeGeminiModelName },
    normalizeHashtagToken: { get: () => normalizeHashtagToken },
    normalizeIsoDateTime: { get: () => normalizeIsoDateTime },
    normalizeOutlineList: { get: () => normalizeOutlineList },
    normalizePlannerHashtags: { get: () => normalizePlannerHashtags },
    normalizePlannerPlatform: { get: () => normalizePlannerPlatform },
    normalizePlannerShortText: { get: () => normalizePlannerShortText },
    normalizePlannerStatus: { get: () => normalizePlannerStatus },
    normalizePlannerText: { get: () => normalizePlannerText },
    normalizePlannerUrl: { get: () => normalizePlannerUrl },
    normalizePlannerVariants: { get: () => normalizePlannerVariants },
    normalizeSeoData: { get: () => normalizeSeoData },
    normalizeSingleSpeedTestReport: {
      get: () => normalizeSingleSpeedTestReport,
    },
    normalizeSocialPlannerAccount: { get: () => normalizeSocialPlannerAccount },
    normalizeSocialPlannerAssistantAction: {
      get: () => normalizeSocialPlannerAssistantAction,
    },
    normalizeSocialPlannerAssistantPlatforms: {
      get: () => normalizeSocialPlannerAssistantPlatforms,
    },
    normalizeSocialPlannerAssistantTone: {
      get: () => normalizeSocialPlannerAssistantTone,
    },
    normalizeSocialPlannerData: { get: () => normalizeSocialPlannerData },
    normalizeSocialPlannerEntry: { get: () => normalizeSocialPlannerEntry },
    normalizeSocialPlannerMetrics: { get: () => normalizeSocialPlannerMetrics },
    normalizeSocialPlannerPublication: {
      get: () => normalizeSocialPlannerPublication,
    },
    normalizeSocialPlannerPublications: {
      get: () => normalizeSocialPlannerPublications,
    },
    normalizeSocialPlannerTemplate: {
      get: () => normalizeSocialPlannerTemplate,
    },
    normalizeSocialPlannerWorkspace: {
      get: () => normalizeSocialPlannerWorkspace,
    },
    normalizeStoredBlogPostLink: { get: () => normalizeStoredBlogPostLink },
    normalizeUnsplashQuery: { get: () => normalizeUnsplashQuery },
    parseBooleanFlag: { get: () => parseBooleanFlag },
    parseFirestoreDocToBlogPost: { get: () => parseFirestoreDocToBlogPost },
    parseNonNegativeIntegerOrNull: { get: () => parseNonNegativeIntegerOrNull },
    parsePostDateTimestamp: { get: () => parsePostDateTimestamp },
    parseTranslationsSource: { get: () => parseTranslationsSource },
    parseWebhookResponsePayload: { get: () => parseWebhookResponsePayload },
    path: { get: () => path },
    persistSiteData: { get: () => persistSiteData },
    postPayloadToSocialWebhook: { get: () => postPayloadToSocialWebhook },
    readBlogPosts: { get: () => readBlogPosts },
    readDashboardContent: { get: () => readDashboardContent },
    readFirestoreDocument: { get: () => readFirestoreDocument },
    readFirestorePostsCollection: { get: () => readFirestorePostsCollection },
    readFirestoreStringField: { get: () => readFirestoreStringField },
    readHtmlTemplate: { get: () => readHtmlTemplate },
    readSeoData: { get: () => readSeoData },
    readSiteDataWithFallback: { get: () => readSiteDataWithFallback },
    readSiteJsonDocument: { get: () => readSiteJsonDocument },
    readSiteTextDocument: { get: () => readSiteTextDocument },
    readSocialPlannerData: { get: () => readSocialPlannerData },
    renderServiceContent: { get: () => renderServiceContent },
    resolveAbsoluteAssetUrl: { get: () => resolveAbsoluteAssetUrl },
    resolveAbsolutePostUrl: { get: () => resolveAbsolutePostUrl },
    resolveSocialExcerpt: { get: () => resolveSocialExcerpt },
    resolveSocialImage: { get: () => resolveSocialImage },
    resolveSocialPlannerMetricsSyncUrl: {
      get: () => resolveSocialPlannerMetricsSyncUrl,
    },
    resolveSocialPlannerPublishMediaUrl: {
      get: () => resolveSocialPlannerPublishMediaUrl,
    },
    resolveSocialPlannerWorkspace: { get: () => resolveSocialPlannerWorkspace },
    resolveSocialPlannerWorkspaceId: {
      get: () => resolveSocialPlannerWorkspaceId,
    },
    resolveWebhookHost: { get: () => resolveWebhookHost },
    safeCompareSecrets: { get: () => safeCompareSecrets },
    sanitizeStoragePathSegment: { get: () => sanitizeStoragePathSegment },
    saveSocialPlannerState: { get: () => saveSocialPlannerState },
    serializeDashboardContent: { get: () => serializeDashboardContent },
    serializeInlineJson: { get: () => serializeInlineJson },
    siteDataCache: { get: () => siteDataCache },
    stripGeminiCodeFence: { get: () => stripGeminiCodeFence },
    stripHtmlToText: { get: () => stripHtmlToText },
    sumSocialPlannerPublicationMetrics: {
      get: () => sumSocialPlannerPublicationMetrics,
    },
    summarizeEntryEngagement: { get: () => summarizeEntryEngagement },
    summarizeSocialPlannerDelivery: {
      get: () => summarizeSocialPlannerDelivery,
    },
    summarizeWebhookResponseBody: { get: () => summarizeWebhookResponseBody },
    templateCache: { get: () => templateCache },
    toBase64Url: { get: () => toBase64Url },
    toFirestoreFields: { get: () => toFirestoreFields },
    toFirestoreValue: { get: () => toFirestoreValue },
    transliterateUnsplashQuery: { get: () => transliterateUnsplashQuery },
    truncateForSocial: { get: () => truncateForSocial },
    upsertFirestoreDocument: { get: () => upsertFirestoreDocument },
    upsertHeadMetaTag: { get: () => upsertHeadMetaTag },
    upsertSocialPlannerEntryPublication: {
      get: () => upsertSocialPlannerEntryPublication,
    },
    waitForFirebaseOperation: { get: () => waitForFirebaseOperation },
    writeSiteJsonDocument: { get: () => writeSiteJsonDocument },
    writeSiteTextDocument: { get: () => writeSiteTextDocument },
    writeSocialPlannerData: { get: () => writeSocialPlannerData },
  },
);
const serverFeatures = Object.assign(
  {},
  require("./server/site-data")(serverContext),
  require("./server/performance-reports")(serverContext),
  require("./server/seo-and-pages")(serverContext),
  require("./server/firebase-storage")(serverContext),
  require("./server/social-publishing")(serverContext),
  require("./server/content-generation")(serverContext),
);

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const functions = require("firebase-functions");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");

// GA4 Client initialization
let analyticsClient = null;
let analyticsInitError = null;
try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    let jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim();
    // Strip accidental outer quotes if they exist (common when copying/pasting)
    if (jsonStr.startsWith("'") && jsonStr.endsWith("'"))
      jsonStr = jsonStr.slice(1, -1).trim();
    if (jsonStr.startsWith('"') && jsonStr.endsWith('"'))
      jsonStr = jsonStr.slice(1, -1).trim();

    const credentials = JSON.parse(jsonStr);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }
    analyticsClient = new BetaAnalyticsDataClient({ credentials });
    console.log("[Analytics] GA4 Client initialisert med service account.");
  } else {
    analyticsInitError = "Missing GOOGLE_SERVICE_ACCOUNT_JSON";
  }
} catch (err) {
  analyticsInitError = err.message;
  console.error("[Analytics] Kunne ikke initialisere GA4 client:", err.message);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;
const firebaseAccessTokenCache = new Map();
const firebaseWebConfigCache = {
  value: null,
  fetchedAt: 0,
  inflight: null,
};
const FIREBASE_WEB_CONFIG_CACHE_MS = 10 * 60 * 1000;
const SERVICE_DETAILS_CONTENT = require("./js/service-content");
const SERVICE_ROUTE_KEYS = {
  "/nettside-for-regnskapsbyra": "regnskap",
  "/webdesign": "web_dev",
  "/seo": "seo",
  "/support-og-vedlikehold": "support",
  "/sosiale-medier": "digital_marketing",
};
const PAGE_ROUTE_MAP = {
  "/": "index.html",
  "/blog": "blog.html",
  "/project-details": "project-details.html",
  "/blog-details": "blog-details.html",
  "/contact": "contact.html",
  "/service-details": "service-details.html",
  "/nettside-for-regnskapsbyra": "service-details.html",
  "/webdesign": "service-details.html",
  "/seo": "service-details.html",
  "/support-og-vedlikehold": "service-details.html",
  "/sosiale-medier": "service-details.html",
  "/privacy": "privacy.html",
  "/accessibility": "accessibility.html",
  "/speed-test": "speed-test/index.html",
  "/nettside-sjekker": "speed-test/index.html",
  "/portefolje": "portefolje.html",
  "/visittkort/": "visittkort/index.html",
};
const LEGACY_REDIRECT_MAP = {
  "/visittkort": "/visittkort/",
  "/index.html": "/",
  "/blog.html": "/blog",
  "/project-details.html": "/project-details",
  "/blog-details.html": "/blog-details",
  "/contact.html": "/contact",
  "/service-details.html": "/webdesign",
  "/privacy.html": "/privacy",
  "/accessibility.html": "/accessibility",
  "/visittkort.html": "/visittkort/",
  // 301 Redirects for Legacy URLs reported in Google Search Console
  "/en": "/",
  "/tjenester": "/webdesign",
  "/om-oss": "/",
  "/nyheter": "/blog",
  "/en/nyheter": "/blog",
  "/personvernserklæring": "/privacy",
  "/personvernerklaering": "/privacy",
};
const SEO_GLOBAL_DEFAULTS = {
  siteTitle: "TK-design",
  separator: "|",
  defaultKeywords:
    "design, portfolio, webutvikling, grafisk design, webdesign, seo",
  googleAnalyticsId: "",
  blogCommentsEnabled: true,
};
const SEO_PAGE_DEFAULTS = {
  "index.html": {
    title: "Nettsider og webdesign i Moss og Østfold",
    description:
      "Skreddersydd webdesign, søkemotoroptimalisering (SEO) og løpende drift for små og mellomstore bedrifter i Norge. Raske, konverterende nettsider.",
    keywords:
      "webdesign små bedrifter, seo for bedrifter, ny nettside, tk-design, webdesigner norge",
  },
  "blog.html": {
    title: "Blogg & Råd om Webdesign og SEO",
    description:
      "Les guider, SEO-tips og råd om hvordan du får mer trafikk og flere kunder med en profesjonell nettside.",
    keywords: "blogg, seo tips, webdesign råd, google rangering, nettside tips",
  },
  "contact.html": {
    title: "Kontakt webdesigner & SEO-spesialist",
    description:
      "Ta kontakt med Thomas Knutsen i TK-design for uforpliktende pristilbud på ny nettside, SEO-optimalisering eller supportavtale.",
    keywords:
      "kontakt webdesigner, bestille nettside, seo konsultasjon, tk-design kontakt",
  },
  "portefolje.html": {
    title: "Portefølje – Prosjekter og webdesign",
    description:
      "Se utvalgte kundeprosjekter, webdesign og grafisk arbeid levert av TK-design.",
    keywords:
      "portefølje webdesign, nettside eksempler, kundereferanser tk-design",
  },
  "service-details.html": {
    title: "Tjenester innen Webdesign, SEO og Drift",
    description:
      "Skreddersydd webdesign, søkemotoroptimalisering (SEO), SoMe-innholdsstrategi og løpende drift/support for bedrifter.",
    keywords:
      "webdesign tjenester, seo søkemotoroptimalisering, nettside support, some strategi",
  },
  "/nettside-for-regnskapsbyra": {
    title: "Nettsider for regnskapsbyråer",
    description:
      "TK-design lager mobilvennlige nettsider for regnskapsbyråer. Se Kudos Regnskap og Mandal Regnskapskontor, og be om et uforpliktende tilbud.",
    keywords: "nettside regnskapsbyrå, webdesign regnskapskontor",
  },
  "/webdesign": {
    title: "Skreddersydd Webdesign for Bedrifter",
    description:
      "Unike, lynraske og mobilvennlige nettsider skreddersydd for din bedrift. Profesjonelt uttrykk som bygger tillit og skaffer kunder.",
    keywords:
      "webdesign, ny nettside, skreddersydd nettside, mobilvennlig nettside",
  },
  "/seo": {
    title: "SEO & Søkemotoroptimalisering for Bedrifter",
    description:
      "SEO for små og mellomstore bedrifter: innhold, søkeordsanalyse og teknisk gjennomgang. TK-design hjelper deg å forbedre synligheten i søk.",
    keywords:
      "seo, søkemotoroptimalisering, rangere høyere på google, økt organisk trafikk",
  },
  "/support-og-vedlikehold": {
    title: "Support, Drift & Vedlikehold av Nettside",
    description:
      "Unngå krasj, treghet og sikkerhetshull. Fleksible supportavtaler med ukentlig vedlikehold, overvåking og lynrask hjelp.",
    keywords:
      "vedlikehold nettside, supportavtale nettside, drift av nettside, sikkerhetsoppdateringer",
  },
  "/sosiale-medier": {
    title: "SoMe Innholdsstrategi & Synlighet",
    description:
      "Bygg merkevare og tiltrekk kunder i sosiale medier med en gjennomtenkt innholdsstrategi.",
    keywords:
      "some strategi, sosiale medier for bedrifter, innholdsstrategi, merkevarebygging",
  },
  "project-details.html": {
    title: "Prosjekter",
    description:
      "Utvalgte prosjekter fra TK-design med fokus på design, ytelse og synlighet.",
    keywords: "prosjekter, webdesign case, tk-design",
  },
  "privacy.html": {
    title: "Personvern",
    description:
      "Personvernerklæring for TK-design og hvordan data behandles på nettsiden.",
    keywords: "personvern, personvernerklæring, tk-design",
  },
  "accessibility.html": {
    title: "Tilgjengelighet",
    description:
      "Tilgjengelighetserklæring for TK-design med informasjon om universell utforming.",
    keywords:
      "tilgjengelighet, universell utforming, tilgjengelighetserklæring",
  },
  "speed-test/index.html": {
    title: "Nettside-sjekker",
    description:
      "Test hvor rask nettsiden din er med Lighthouse-data og få en konkret handlingsplan fra TK-design.",
    keywords:
      "pagespeed test, lighthouse, nettside hastighet, ytelse, tk-design",
  },
  "nettside-sjekker-dist/index.html": {
    title: "Nettside test",
    description:
      "Test hastigheten og kvaliteten på nettsiden din. Få en gratis SEO- og ytelsessjekk drevet av Google PageSpeed Insights.",
    keywords:
      "nettside test, pagespeed, lighthouse, nettside hastighet, seo sjekk, tk-design",
  },
  "visittkort/index.html": {
    title: "Thomas Knutsen | Digitalt Visittkort | TK-design",
    description:
      "Digitalt visittkort for Thomas Knutsen – Daglig leder og fullstack-utvikler i TK-design. Skreddersydd webdesign, SEO og lynrask ytelse.",
    keywords:
      "Thomas Knutsen, TK-design, digitalt visittkort, fullstack-utvikler, webutvikler",
  },
};
const PUBLIC_HOSTNAME_REGEX =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

// Use one public hostname; preserve write requests and local/preview hosts.
app.use((req, res, next) => {
  const host = String(req.get("host") || "")
    .toLowerCase()
    .split(":")[0];
  if (
    host === "tk-design.no" &&
    ["GET", "HEAD"].includes(req.method) &&
    !req.path.startsWith("/api/")
  ) {
    return res.redirect(301, "https://www.tk-design.no" + req.originalUrl);
  }
  next();
});

// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// Static files moved to end to allow server-side injection
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Enable CORS for Live Server
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// --- Security & Rate Limiting Middlewares ---
const rateLimitStores = new Map();

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 10;
  const message =
    options.message || "For mange forespørsler. Vennligst prøv igjen senere.";

  return (req, res, next) => {
    const rawIp =
      req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
    const ip = String(rawIp).split(",")[0].trim() || "unknown";
    const key = `${req.path}_${ip}`;
    const now = Date.now();

    let record = rateLimitStores.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
    } else {
      record.count += 1;
    }

    rateLimitStores.set(key, record);

    if (rateLimitStores.size > 2000) {
      for (const [k, v] of rateLimitStores.entries()) {
        if (now > v.resetTime) rateLimitStores.delete(k);
      }
    }

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        code: "rate_limit_exceeded",
        error: message,
      });
    }

    next();
  };
}

const contactFormLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Du har sendt for mange meldinger på kort tid. Prøv igjen om 15 minutter.",
});
const emailReportLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Du har sendt for mange rapporter på kort tid. Prøv igjen om 15 minutter.",
});
const pagespeedLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "For mange analyser på kort tid. Prøv igjen om et minutt.",
});
const commentsLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Du har publisert for mange kommentarer på kort tid.",
});

let adminInstance = null;
function getAdminInstance() {
  if (!adminInstance) {
    const admin = require("firebase-admin");
    const { projectId, clientEmail, privateKey } = getFirebaseConfig();
    if (admin.apps.length > 0) {
      adminInstance = admin.apps[0];
    } else {
      adminInstance = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
  }
  return adminInstance;
}

const adminSecurity = require("./js/admin-security");
const adminGuard = adminSecurity.createAdminGuard({
  getAdminInstance,
  hasFirebaseServerCredentials,
});
async function verifyAdminToken(req, res, next) {
  return adminGuard(req, res, next);
}

// One shared boundary protects every method, including future sibling routes.
app.use(
  [
    "/api/debug-env",
    "/api/analytics",
    "/api/messages",
    "/api/unsplash/search",
    "/api/social-planner",
    "/api/social/autopost",
  ],
  verifyAdminToken,
);
app.use((req, res, next) => {
  if (adminSecurity.privatePlannerFile(req.path))
    return res.status(403).send("Denne filen er ikke offentlig.");
  next();
});

function getFetch() {
  return serverFeatures.getFetch.apply(this, arguments);
}

function getPagespeedApiKey() {
  return serverFeatures.getPagespeedApiKey.apply(this, arguments);
}

function normalizePagespeedUrl() {
  return serverFeatures.normalizePagespeedUrl.apply(this, arguments);
}

function mapPagespeedUpstreamError() {
  return serverFeatures.mapPagespeedUpstreamError.apply(this, arguments);
}

function escapeHtml() {
  return serverFeatures.escapeHtml.apply(this, arguments);
}

function escapeRegExp() {
  return serverFeatures.escapeRegExp.apply(this, arguments);
}

function upsertHeadMetaTag() {
  return serverFeatures.upsertHeadMetaTag.apply(this, arguments);
}

function serializeInlineJson() {
  return serverFeatures.serializeInlineJson.apply(this, arguments);
}

function getCustomStyleHref() {
  return serverFeatures.getCustomStyleHref.apply(this, arguments);
}

function toBase64Url() {
  return serverFeatures.toBase64Url.apply(this, arguments);
}

function getFirebaseConfig() {
  return serverFeatures.getFirebaseConfig.apply(this, arguments);
}

// Diagnostic API (Safe for production, only shows presence of keys)
app.get("/api/debug-env", (req, res) => {
  res.json({
    firebase: {
      projectId: !!process.env.TK_FIREBASE_PROJECT_ID,
      clientEmail: !!process.env.TK_FIREBASE_CLIENT_EMAIL,
      privateKey: !!process.env.TK_FIREBASE_PRIVATE_KEY,
      privateKeyValid: (process.env.TK_FIREBASE_PRIVATE_KEY || "").includes(
        "BEGIN PRIVATE KEY",
      ),
    },
    analytics: {
      propertyId: !!process.env.GA_PROPERTY_ID,
      serviceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      clientInitialized: !!analyticsClient,
      initError: analyticsInitError,
    },
    resend: !!process.env.RESEND_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    unsplash: !!String(process.env.UNSPLASH_ACCESS_KEY || "").trim(),
    social: {
      webhook: !!String(process.env.SOCIAL_WEBHOOK_URL || "").trim(),
      webhookSecret: !!String(process.env.SOCIAL_WEBHOOK_SECRET || "").trim(),
      metricsSyncToken: !!String(
        process.env.SOCIAL_METRICS_SYNC_TOKEN || "",
      ).trim(),
    },
  });
});

app.post("/api/pagespeed", pagespeedLimiter, async (req, res) => {
  const strategy = req.body?.strategy === "desktop" ? "desktop" : "mobile";
  let normalizedUrl = "";

  try {
    normalizedUrl = normalizePagespeedUrl(req.body?.url || "");
  } catch (error) {
    return res.status(400).json({
      success: false,
      code: error.code || "invalid_url",
      error: "Lim inn en gyldig URL, for eksempel tk-design.no.",
      details: error.message,
    });
  }

  const apiKey = getPagespeedApiKey();
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      code: "missing_api_key",
      error: "Speed-testen mangler Google PageSpeed API-nøkkel på serveren.",
    });
  }

  try {
    const fetch = await getFetch();
    const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      normalizedUrl,
    )}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo&key=${apiKey}`;
    const response = await fetch(apiEndpoint, {
      headers: {
        Accept: "application/json",
      },
    });
    const rawBody = await response.text();
    let data = null;

    try {
      data = rawBody ? JSON.parse(rawBody) : null;
    } catch (error) {
      data = null;
    }

    if (!response.ok || data?.error) {
      const details = String(
        data?.error?.message ||
          rawBody ||
          `PageSpeed request failed with ${response.status}`,
      );
      const mappedError = mapPagespeedUpstreamError(details, response.status);
      return res.status(mappedError.httpStatus).json({
        success: false,
        code: mappedError.code,
        error: mappedError.error,
        details,
      });
    }

    if (
      !data?.lighthouseResult?.categories ||
      !data?.lighthouseResult?.audits
    ) {
      return res.status(502).json({
        success: false,
        code: "invalid_response",
        error: "Google returnerte et ugyldig Lighthouse-svar.",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[PageSpeed] Request failed:", error);
    return res.status(500).json({
      success: false,
      code: "pagespeed_request_failed",
      error: "Kunne ikke analysere nettstedet akkurat nå.",
      details: error.message,
    });
  }
});

function getFirebaseWebConfig() {
  return serverFeatures.getFirebaseWebConfig.apply(this, arguments);
}

function getFirebaseAuthHelperHost() {
  return serverFeatures.getFirebaseAuthHelperHost.apply(this, arguments);
}

function hasUsableFirebaseWebConfig() {
  return serverFeatures.hasUsableFirebaseWebConfig.apply(this, arguments);
}

function createGoogleAccessJwt() {
  return serverFeatures.createGoogleAccessJwt.apply(this, arguments);
}

function getFirebaseAccessToken() {
  return serverFeatures.getFirebaseAccessToken.apply(this, arguments);
}

function toFirestoreValue() {
  return serverFeatures.toFirestoreValue.apply(this, arguments);
}

function toFirestoreFields() {
  return serverFeatures.toFirestoreFields.apply(this, arguments);
}

function saveContactMessage() {
  return serverFeatures.saveContactMessage.apply(this, arguments);
}

function isVercelRuntime() {
  return serverFeatures.isVercelRuntime.apply(this, arguments);
}

function hasFirebaseServerCredentials() {
  return serverFeatures.hasFirebaseServerCredentials.apply(this, arguments);
}

function getFirebaseSiteDataCollection() {
  return serverFeatures.getFirebaseSiteDataCollection.apply(this, arguments);
}

function getFirestoreDocumentUrl() {
  return serverFeatures.getFirestoreDocumentUrl.apply(this, arguments);
}

function readFirestoreDocument() {
  return serverFeatures.readFirestoreDocument.apply(this, arguments);
}

function upsertFirestoreDocument() {
  return serverFeatures.upsertFirestoreDocument.apply(this, arguments);
}

function readFirestoreStringField() {
  return serverFeatures.readFirestoreStringField.apply(this, arguments);
}

function readSiteJsonDocument() {
  return serverFeatures.readSiteJsonDocument.apply(this, arguments);
}

function writeSiteJsonDocument() {
  return serverFeatures.writeSiteJsonDocument.apply(this, arguments);
}

function readSiteTextDocument() {
  return serverFeatures.readSiteTextDocument.apply(this, arguments);
}

function writeSiteTextDocument() {
  return serverFeatures.writeSiteTextDocument.apply(this, arguments);
}

const siteDataCache = new Map();
const templateCache = new Map();

function readHtmlTemplate() {
  return serverFeatures.readHtmlTemplate.apply(this, arguments);
}

function getFallbackBlogImage() {
  return serverFeatures.getFallbackBlogImage.apply(this, arguments);
}

function parseFirestoreDocToBlogPost() {
  return serverFeatures.parseFirestoreDocToBlogPost.apply(this, arguments);
}

function readFirestorePostsCollection() {
  return serverFeatures.readFirestorePostsCollection.apply(this, arguments);
}

function getCleanPostSlug() {
  return serverFeatures.getCleanPostSlug.apply(this, arguments);
}

function readSiteDataWithFallback() {
  return serverFeatures.readSiteDataWithFallback.apply(this, arguments);
}

function persistSiteData() {
  return serverFeatures.persistSiteData.apply(this, arguments);
}

function readStyleCssWithFallback() {
  return serverFeatures.readStyleCssWithFallback.apply(this, arguments);
}

function persistStyleCss() {
  return serverFeatures.persistStyleCss.apply(this, arguments);
}

function waitForFirebaseOperation() {
  return serverFeatures.waitForFirebaseOperation.apply(this, arguments);
}

function getOrCreateFirebaseWebAppConfig() {
  return serverFeatures.getOrCreateFirebaseWebAppConfig.apply(this, arguments);
}

function getCachedFirebaseWebAppConfig() {
  return serverFeatures.getCachedFirebaseWebAppConfig.apply(this, arguments);
}

function sendContactNotification() {
  return serverFeatures.sendContactNotification.apply(this, arguments);
}

function clampSpeedTestScore() {
  return serverFeatures.clampSpeedTestScore.apply(this, arguments);
}

function normalizeSingleSpeedTestReport() {
  return serverFeatures.normalizeSingleSpeedTestReport.apply(this, arguments);
}

function normalizeSpeedTestReportPayload() {
  return serverFeatures.normalizeSpeedTestReportPayload.apply(this, arguments);
}

function normalizeSpeedTestRecipientEmail() {
  return serverFeatures.normalizeSpeedTestRecipientEmail.apply(this, arguments);
}

function formatSpeedTestTimestamp() {
  return serverFeatures.formatSpeedTestTimestamp.apply(this, arguments);
}

function getSpeedTestEmailScoreMeta() {
  return serverFeatures.getSpeedTestEmailScoreMeta.apply(this, arguments);
}

function getSpeedTestEmailOpening() {
  return serverFeatures.getSpeedTestEmailOpening.apply(this, arguments);
}

function buildSingleSpeedTestReportEmailHtml() {
  return serverFeatures.buildSingleSpeedTestReportEmailHtml.apply(
    this,
    arguments,
  );
}

function buildSingleSpeedTestReportEmailText() {
  return serverFeatures.buildSingleSpeedTestReportEmailText.apply(
    this,
    arguments,
  );
}

function buildSpeedTestReportEmailMarkup() {
  return serverFeatures.buildSpeedTestReportEmailMarkup.apply(this, arguments);
}

function sendSpeedTestReportNotification() {
  return serverFeatures.sendSpeedTestReportNotification.apply(this, arguments);
}

function logContactPipelineConfig() {
  return serverFeatures.logContactPipelineConfig.apply(this, arguments);
}

function getTranslationsFilePath() {
  return serverFeatures.getTranslationsFilePath.apply(this, arguments);
}

function getLegacyContentFilePath() {
  return serverFeatures.getLegacyContentFilePath.apply(this, arguments);
}

function getPostsFilePath() {
  return serverFeatures.getPostsFilePath.apply(this, arguments);
}

function getCommentsFilePath() {
  return serverFeatures.getCommentsFilePath.apply(this, arguments);
}

function getSocialPlannerFilePath() {
  return serverFeatures.getSocialPlannerFilePath.apply(this, arguments);
}

function getSeoFilePath() {
  return serverFeatures.getSeoFilePath.apply(this, arguments);
}

function getAdminCustomStyleFilePath() {
  return serverFeatures.getAdminCustomStyleFilePath.apply(this, arguments);
}

function parseTranslationsSource() {
  return serverFeatures.parseTranslationsSource.apply(this, arguments);
}

function readDashboardContent() {
  return serverFeatures.readDashboardContent.apply(this, arguments);
}

function serializeDashboardContent() {
  return serverFeatures.serializeDashboardContent.apply(this, arguments);
}

function writeDashboardContent() {
  return serverFeatures.writeDashboardContent.apply(this, arguments);
}

function readBlogPosts() {
  return serverFeatures.readBlogPosts.apply(this, arguments);
}

function writeBlogPosts() {
  return serverFeatures.writeBlogPosts.apply(this, arguments);
}

function buildFallbackCommentId() {
  return serverFeatures.buildFallbackCommentId.apply(this, arguments);
}

function normalizeCommentEntry() {
  return serverFeatures.normalizeCommentEntry.apply(this, arguments);
}

function normalizeCommentsData() {
  return serverFeatures.normalizeCommentsData.apply(this, arguments);
}

function readBlogComments() {
  return serverFeatures.readBlogComments.apply(this, arguments);
}

function writeBlogComments() {
  return serverFeatures.writeBlogComments.apply(this, arguments);
}

const SOCIAL_PLATFORMS = Object.freeze([
  "facebook",
  "instagram",
  "linkedin",
  "x",
  "tiktok",
]);
const SOCIAL_ENTRY_STATUSES = new Set([
  "draft",
  "scheduled",
  "publishing",
  "published",
  "partially_published",
  "failed",
  "cancelled",
]);
const SOCIAL_PLANNER_PERIOD_PRESETS = Object.freeze({
  "1d": 1,
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "365d": 365,
});

function normalizeIsoDateTime() {
  return serverFeatures.normalizeIsoDateTime.apply(this, arguments);
}

function normalizePlannerText() {
  return serverFeatures.normalizePlannerText.apply(this, arguments);
}

function normalizePlannerShortText() {
  return serverFeatures.normalizePlannerShortText.apply(this, arguments);
}

function normalizePlannerUrl() {
  return serverFeatures.normalizePlannerUrl.apply(this, arguments);
}

function normalizePlannerPlatform() {
  return serverFeatures.normalizePlannerPlatform.apply(this, arguments);
}

function normalizePlannerStatus() {
  return serverFeatures.normalizePlannerStatus.apply(this, arguments);
}

function createSocialPlannerId() {
  return serverFeatures.createSocialPlannerId.apply(this, arguments);
}

function normalizePlannerHashtags() {
  return serverFeatures.normalizePlannerHashtags.apply(this, arguments);
}

function normalizePlannerVariants() {
  return serverFeatures.normalizePlannerVariants.apply(this, arguments);
}

function createDefaultSocialPlannerData() {
  return serverFeatures.createDefaultSocialPlannerData.apply(this, arguments);
}

function normalizeSocialPlannerWorkspace() {
  return serverFeatures.normalizeSocialPlannerWorkspace.apply(this, arguments);
}

function normalizeSocialPlannerAccount() {
  return serverFeatures.normalizeSocialPlannerAccount.apply(this, arguments);
}

function normalizeSocialPlannerTemplate() {
  return serverFeatures.normalizeSocialPlannerTemplate.apply(this, arguments);
}

function normalizeSocialPlannerMetrics() {
  return serverFeatures.normalizeSocialPlannerMetrics.apply(this, arguments);
}

function extractSocialPlannerMetricsPatch() {
  return serverFeatures.extractSocialPlannerMetricsPatch.apply(this, arguments);
}

function mergeSocialPlannerMetrics() {
  return serverFeatures.mergeSocialPlannerMetrics.apply(this, arguments);
}

function normalizeSocialPlannerPublication() {
  return serverFeatures.normalizeSocialPlannerPublication.apply(
    this,
    arguments,
  );
}

function normalizeSocialPlannerPublications() {
  return serverFeatures.normalizeSocialPlannerPublications.apply(
    this,
    arguments,
  );
}

function sumSocialPlannerPublicationMetrics() {
  return serverFeatures.sumSocialPlannerPublicationMetrics.apply(
    this,
    arguments,
  );
}

function findSocialPlannerPublicationIndex() {
  return serverFeatures.findSocialPlannerPublicationIndex.apply(
    this,
    arguments,
  );
}

function upsertSocialPlannerEntryPublication() {
  return serverFeatures.upsertSocialPlannerEntryPublication.apply(
    this,
    arguments,
  );
}

function normalizeSocialPlannerEntry() {
  return serverFeatures.normalizeSocialPlannerEntry.apply(this, arguments);
}

function normalizeSocialPlannerData() {
  return serverFeatures.normalizeSocialPlannerData.apply(this, arguments);
}

function readSocialPlannerData() {
  return serverFeatures.readSocialPlannerData.apply(this, arguments);
}

function writeSocialPlannerData() {
  return serverFeatures.writeSocialPlannerData.apply(this, arguments);
}

function summarizeEntryEngagement() {
  return serverFeatures.summarizeEntryEngagement.apply(this, arguments);
}

function resolveSocialPlannerDateRange() {
  return serverFeatures.resolveSocialPlannerDateRange.apply(this, arguments);
}

function computeSocialPlannerAnalytics() {
  return serverFeatures.computeSocialPlannerAnalytics.apply(this, arguments);
}

function buildSocialPlannerCaption() {
  return serverFeatures.buildSocialPlannerCaption.apply(this, arguments);
}

function buildSocialPlannerCaptionMap() {
  return serverFeatures.buildSocialPlannerCaptionMap.apply(this, arguments);
}

function buildSocialPlannerPublishTargetMap() {
  return serverFeatures.buildSocialPlannerPublishTargetMap.apply(
    this,
    arguments,
  );
}

function buildSocialPlannerTargetAccountPayload() {
  return serverFeatures.buildSocialPlannerTargetAccountPayload.apply(
    this,
    arguments,
  );
}

function normalizeSeoData() {
  return serverFeatures.normalizeSeoData.apply(this, arguments);
}

function readSeoData() {
  return serverFeatures.readSeoData.apply(this, arguments);
}

function writeSeoData() {
  return serverFeatures.writeSeoData.apply(this, arguments);
}

function readCustomStyleCss() {
  return serverFeatures.readCustomStyleCss.apply(this, arguments);
}

function writeCustomStyleCss() {
  return serverFeatures.writeCustomStyleCss.apply(this, arguments);
}

// API: Get Content
app.get("/api/content", async (req, res) => {
  try {
    const content = readDashboardContent();
    res.json(content);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error reading content");
  }
});

// API: Save Content
app.post("/api/content", verifyAdminToken, async (req, res) => {
  try {
    const result = await persistSiteData(
      "content",
      req.body,
      writeDashboardContent,
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        error: "Error saving content",
        details: error.message,
      });
  }
});

// API: Save Style (CSS Variables & Fonts)
app.post("/api/style", verifyAdminToken, async (req, res) => {
  const {
    cssVariables,
    fontUrl,
    fontUrls,
    fontFamily,
    fontBodyFamily,
    fontHeadingFamily,
  } = req.body;

  let cssContent = "";
  const rootVariables = {};
  const refreshVariables = {};

  // 1. Add Font imports (deduplicated)
  const incomingFontUrls = Array.isArray(fontUrls)
    ? fontUrls
    : [fontUrl].filter(Boolean);
  const uniqueFontUrls = [
    ...new Set(
      incomingFontUrls.map((item) => String(item || "").trim()).filter(Boolean),
    ),
  ];
  uniqueFontUrls.forEach((url) => {
    cssContent += `@import url('${url}');\n`;
  });

  if (fontFamily) {
    rootVariables["--font-primary"] = fontFamily;
  }
  if (fontBodyFamily) {
    rootVariables["--font-body"] = fontBodyFamily;
  }
  if (fontHeadingFamily) {
    rootVariables["--font-heading"] = fontHeadingFamily;
  }

  for (const [key, value] of Object.entries(cssVariables || {})) {
    const normalizedKey = String(key || "").trim();
    const normalizedValue = String(value || "").trim();
    if (!normalizedKey || !normalizedValue) continue;

    if (normalizedKey.startsWith("--refresh-")) {
      refreshVariables[normalizedKey] = normalizedValue;
    } else {
      rootVariables[normalizedKey] = normalizedValue;
    }
  }

  // 2. Root variables
  cssContent += `:root {\n`;
  for (const [key, value] of Object.entries(rootVariables)) {
    cssContent += `    ${key}: ${value};\n`;
  }
  cssContent += `}\n`;

  // 3. Refresh variables used by the live site
  cssContent += `body.homepage-refresh {\n`;
  for (const [key, value] of Object.entries(refreshVariables)) {
    cssContent += `    ${key}: ${value};\n`;
  }
  if (fontBodyFamily) {
    cssContent += `    font-family: var(--font-body, ${fontBodyFamily});\n`;
  }
  cssContent += `}\n`;

  if (fontHeadingFamily) {
    cssContent += `body.homepage-refresh h1,\n`;
    cssContent += `body.homepage-refresh h2,\n`;
    cssContent += `body.homepage-refresh h3,\n`;
    cssContent += `body.homepage-refresh h4,\n`;
    cssContent += `body.homepage-refresh h5,\n`;
    cssContent += `body.homepage-refresh h6 {\n`;
    cssContent += `    font-family: var(--font-heading, ${fontHeadingFamily});\n`;
    cssContent += `}\n`;
  }

  try {
    const result = await persistStyleCss(cssContent, writeCustomStyleCss);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        error: "Error saving style",
        details: error.message,
      });
  }
});

const ANALYTICS_DATE_RANGE_PRESETS = Object.freeze({
  "1d": {
    startDate: "1daysAgo",
    endDate: "today",
    shortLabel: "1d",
    metricSuffix: "siste døgn",
  },
  "7d": {
    startDate: "7daysAgo",
    endDate: "today",
    shortLabel: "7d",
    metricSuffix: "siste 7 dager",
  },
  "14d": {
    startDate: "14daysAgo",
    endDate: "today",
    shortLabel: "14d",
    metricSuffix: "siste 14 dager",
  },
  "30d": {
    startDate: "30daysAgo",
    endDate: "today",
    shortLabel: "30d",
    metricSuffix: "siste 30 dager",
  },
  "365d": {
    startDate: "365daysAgo",
    endDate: "today",
    shortLabel: "1 år",
    metricSuffix: "siste 1 år",
  },
});

const ANALYTICS_DATE_RANGE_ALIASES = Object.freeze({
  1: "1d",
  "1d": "1d",
  "24h": "1d",
  day: "1d",
  7: "7d",
  "7d": "7d",
  14: "14d",
  "14d": "14d",
  30: "30d",
  "30d": "30d",
  365: "365d",
  "1y": "365d",
  "365d": "365d",
  year: "365d",
  custom: "custom",
});

function normalizeAnalyticsPeriod() {
  return serverFeatures.normalizeAnalyticsPeriod.apply(this, arguments);
}

function isValidIsoDateString() {
  return serverFeatures.isValidIsoDateString.apply(this, arguments);
}

// API: Get Blog Posts
// --- Messages API ---
app.get("/api/analytics", async (req, res) => {
  const propertyId = process.env.GA_PROPERTY_ID;
  const period = normalizeAnalyticsPeriod(req.query.period);
  const startDate = String(req.query.startDate || "").trim();
  const endDate = String(req.query.endDate || "").trim();

  let selectedRange;
  let rangeMeta;

  if (period === "custom") {
    if (!isValidIsoDateString(startDate) || !isValidIsoDateString(endDate)) {
      return res.status(400).json({
        status: "error",
        error: "Ugyldig datoformat. Bruk YYYY-MM-DD.",
      });
    }
    if (startDate > endDate) {
      return res.status(400).json({
        status: "error",
        error: "Startdato kan ikke vare senere enn sluttdato.",
      });
    }
    selectedRange = { startDate, endDate };
    rangeMeta = {
      period,
      startDate,
      endDate,
      shortLabel: `${startDate} - ${endDate}`,
      metricSuffix: "i valgt periode",
    };
  } else {
    const preset =
      ANALYTICS_DATE_RANGE_PRESETS[period] ||
      ANALYTICS_DATE_RANGE_PRESETS["7d"];
    selectedRange = { startDate: preset.startDate, endDate: preset.endDate };
    rangeMeta = {
      period,
      startDate: preset.startDate,
      endDate: preset.endDate,
      shortLabel: preset.shortLabel,
      metricSuffix: preset.metricSuffix,
    };
  }

  if (!analyticsClient || !propertyId) {
    return res.json({
      status: "unconfigured",
      message: "Google Analytics er ikke konfigurert ennå.",
      data: {
        active7DayUsers: "—",
        activeUsersInRange: "—",
        screenPageViews: "—",
        activeUsers: "—",
        topPages: [],
        trafficSources: [],
      },
      range: rangeMeta,
    });
  }

  try {
    const dateRanges = [selectedRange];

    // Run all GA4 reports in parallel for faster response
    const [[summaryResponse], [pagesResponse], [sourcesResponse]] =
      await Promise.all([
        analyticsClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges,
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        }),
        analyticsClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges,
          dimensions: [{ name: "pageTitle" }],
          metrics: [{ name: "screenPageViews" }],
          limit: 8,
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        }),
        analyticsClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges,
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }],
          limit: 8,
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        }),
      ]);

    // Get Real-time users (separate, can fail gracefully)
    let activeUsersNow = "0";
    try {
      const [realtimeResponse] = await analyticsClient.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [{ name: "activeUsers" }],
      });
      activeUsersNow =
        realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || "0";
    } catch (rtErr) {
      console.warn("[Analytics] Kunne ikke hente sanntidsdata:", rtErr.message);
    }

    const topPages = (pagesResponse.rows || []).map((row) => ({
      title: row.dimensionValues[0].value,
      views: row.metricValues[0].value,
    }));

    const trafficSources = (sourcesResponse.rows || []).map((row) => ({
      source: row.dimensionValues[0].value,
      sessions: row.metricValues[0].value,
    }));

    const summaryMetrics = summaryResponse.rows?.[0]?.metricValues || [];

    res.json({
      status: "success",
      data: {
        active7DayUsers: summaryMetrics[0]?.value || "0",
        activeUsersInRange: summaryMetrics[0]?.value || "0",
        screenPageViews: summaryMetrics[1]?.value || "0",
        activeUsers: activeUsersNow,
        topPages,
        trafficSources,
      },
      range: rangeMeta,
    });
  } catch (err) {
    console.error("[Analytics] API feil:", err.message);
    res.status(500).json({ error: "Kunne ikke hente statistikk fra Google" });
  }
});

app.get("/api/messages", async (req, res) => {
  try {
    const { projectId, databaseId, collection } = getFirebaseConfig();
    const accessToken = await getFirebaseAccessToken();
    const fetch = await getFetch();

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents:runQuery`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: collection }],
            orderBy: [
              {
                field: { fieldPath: "created_at" },
                direction: "DESCENDING",
              },
            ],
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Firebase error: ${error}`);
    }

    const data = await response.json();
    const messages = (data || [])
      .map((doc) => {
        const fields = doc.document?.fields || {};
        return {
          id: (doc.document?.name || "").split("/").pop(),
          name: fields.name?.stringValue || "Ukjent",
          email: fields.email?.stringValue || "",
          phone: fields.phone?.stringValue || "",
          company: fields.company?.stringValue || "",
          subject: fields.subject?.stringValue || "",
          message: fields.message?.stringValue || "",
          timestamp:
            fields.created_at?.stringValue ||
            fields.timestamp?.stringValue ||
            fields.timestamp?.timestampValue ||
            "",
          archived:
            fields.status?.stringValue === "archived" ||
            fields.archived?.booleanValue ||
            false,
        };
      })
      .filter((m) => m.id);

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Kunne ikke hente meldinger" });
  }
});

app.patch("/api/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { projectId, databaseId, collection } = getFirebaseConfig();
    const accessToken = await getFirebaseAccessToken();
    const fetch = await getFetch();

    // Firestore PATCH requires updateMask
    const updateMask = Object.keys(updateData)
      .map((k) => `updateMask.fieldPaths=${k}`)
      .join("&");

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${collection}/${encodeURIComponent(id)}?${updateMask}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fields: toFirestoreFields(updateData),
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Firebase update failed: ${response.status} ${errorText}`,
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating message:", error);
    res
      .status(500)
      .json({
        error: "Kunne ikke oppdatere meldingen.",
        details: error.message,
      });
  }
});

app.delete("/api/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId, databaseId, collection } = getFirebaseConfig();
    const accessToken = await getFirebaseAccessToken();
    const fetch = await getFetch();

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${collection}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Firebase delete failed: ${response.status} ${errorText}`,
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    res
      .status(500)
      .json({ error: "Kunne ikke slette meldingen.", details: error.message });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const posts = decorateBlogPostsWithResolvedLinks(
      await readSiteDataWithFallback("posts", readBlogPosts),
    );
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error reading posts");
  }
});

// API: Save Blog Posts
app.post("/api/posts", verifyAdminToken, async (req, res) => {
  const newPosts = decorateBlogPostsWithResolvedLinks(req.body);

  try {
    const result = await persistSiteData("posts", newPosts, writeBlogPosts);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        error: "Error saving posts",
        details: error.message,
      });
  }
});

app.post("/api/debug-log", verifyAdminToken, async (req, res) => {
  try {
    const result = await persistSiteData(
      "debug_diagnostics",
      req.body,
      () => {},
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Error saving debug-log:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Error saving debug-log",
        details: error.message,
      });
  }
});

app.get("/api/comments", async (req, res) => {
  const requestedPostId = Number(req.query.postId);

  try {
    const commentsData = normalizeCommentsData(
      await readSiteDataWithFallback("comments", readBlogComments),
    );

    if (Number.isFinite(requestedPostId) && requestedPostId > 0) {
      return res.json(commentsData[String(requestedPostId)] || []);
    }

    return res.json(commentsData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error reading comments" });
  }
});

app.get("/api/comments/settings", async (req, res) => {
  try {
    const seoConfig = normalizeSeoData(
      await readSiteDataWithFallback("seo", readSeoData),
    );
    return res.json({
      blogCommentsEnabled: seoConfig.global.blogCommentsEnabled !== false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error reading comment settings" });
  }
});

app.post("/api/comments", commentsLimiter, async (req, res) => {
  const postId = Number(req.body?.postId);
  const name = String(req.body?.name || "")
    .replace(/\s+/g, " ")
    .trim();
  const message = String(req.body?.message || "").trim();

  if (!Number.isFinite(postId) || postId <= 0) {
    return res.status(400).json({ error: "Ugyldig innlegg." });
  }

  if (!name || name.length < 2) {
    return res.status(400).json({ error: "Navn må være minst 2 tegn." });
  }

  if (!message || message.length < 3) {
    return res.status(400).json({ error: "Kommentar må være minst 3 tegn." });
  }

  if (name.length > 80 || message.length > 2000) {
    return res.status(400).json({ error: "Kommentaren er for lang." });
  }

  try {
    const seoConfig = normalizeSeoData(
      await readSiteDataWithFallback("seo", readSeoData),
    );
    if (seoConfig.global.blogCommentsEnabled === false) {
      return res
        .status(403)
        .json({ error: "Kommentarer er deaktivert globalt." });
    }

    const posts = await readSiteDataWithFallback("posts", readBlogPosts);
    const post = Array.isArray(posts)
      ? posts.find((item) => Number(item?.id) === postId)
      : null;

    if (!post) {
      return res.status(404).json({ error: "Innlegget finnes ikke." });
    }

    if (post.allowComments === false) {
      return res
        .status(403)
        .json({ error: "Kommentarer er deaktivert for dette innlegget." });
    }

    const commentsData = normalizeCommentsData(
      await readSiteDataWithFallback("comments", readBlogComments),
    );
    const postKey = String(postId);
    const createdAt = new Date().toISOString();
    const comment = normalizeCommentEntry(
      {
        id: `c_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
        postId,
        name,
        message,
        createdAt,
      },
      postId,
    );

    if (!comment) {
      return res.status(400).json({ error: "Kunne ikke opprette kommentar." });
    }

    if (!Array.isArray(commentsData[postKey])) {
      commentsData[postKey] = [];
    }

    commentsData[postKey].push(comment);
    commentsData[postKey] = commentsData[postKey].slice(-500);

    const result = await persistSiteData(
      "comments",
      commentsData,
      writeBlogComments,
    );
    return res.status(201).json({
      success: true,
      comment,
      comments: commentsData[postKey],
      ...result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Error saving comment", details: error.message });
  }
});

// --- SEO FEATURES ---

// API: Get SEO Data
app.get("/api/seo", async (req, res) => {
  try {
    const seoConfig = normalizeSeoData(
      await readSiteDataWithFallback("seo", readSeoData),
    );
    res.json(seoConfig);
  } catch (error) {
    console.error(error);
    res.json(normalizeSeoData({}));
  }
});

// API: Save SEO Data
app.post("/api/seo", verifyAdminToken, async (req, res) => {
  const seoData = normalizeSeoData(req.body);

  try {
    const result = await persistSiteData("seo", seoData, writeSeoData);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        error: "Error saving SEO data",
        details: error.message,
      });
  }
});

// Sitemap Generation
app.get("/sitemap.xml", async (req, res) => {
  try {
    const seoConfig = normalizeSeoData(
      await readSiteDataWithFallback("seo", readSeoData),
    );
    const posts = await readSiteDataWithFallback("posts", readBlogPosts);
    const baseUrl = "https://www.tk-design.no";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    // Clean static canonical pages list
    const canonicalPages = [
      { path: "", priority: "1.0", changefreq: "weekly" },
      {
        path: "/nettside-for-regnskapsbyra",
        priority: "0.8",
        changefreq: "monthly",
      },
      { path: "/webdesign", priority: "0.9", changefreq: "weekly" },
      { path: "/seo", priority: "0.9", changefreq: "weekly" },
      {
        path: "/support-og-vedlikehold",
        priority: "0.8",
        changefreq: "weekly",
      },
      { path: "/sosiale-medier", priority: "0.8", changefreq: "weekly" },
      { path: "/portefolje", priority: "0.9", changefreq: "weekly" },
      { path: "/blog", priority: "0.9", changefreq: "weekly" },
      { path: "/ki-forordninger", priority: "0.7", changefreq: "monthly" },
      { path: "/contact", priority: "0.8", changefreq: "monthly" },
      { path: "/privacy", priority: "0.3", changefreq: "yearly" },
      { path: "/accessibility", priority: "0.3", changefreq: "yearly" },
    ];

    for (const page of canonicalPages) {
      xml += `
    <url>
        <loc>${baseUrl}${page.path}</loc>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
        <xhtml:link rel="alternate" hreflang="no" href="${baseUrl}${page.path || "/"}"/>
        <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${page.path || "/"}"/>
    </url>`;
    }

    // Dynamic blog posts with canonical permalinks
    (posts || [])
      .filter((p) => p && p.status !== "draft")
      .forEach((post) => {
        const postPath = normalizeStoredBlogPostLink(
          post.link,
          post.id,
          getBlogPostTitleForUrl(post),
        );
        xml += `
    <url>
        <loc>${baseUrl}${postPath}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`;
      });

    xml += `\n</urlset>`;
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error reading SEO config");
  }
});

function renderServiceContent() {
  return serverFeatures.renderServiceContent.apply(this, arguments);
}

function renderPageWithSeo() {
  return serverFeatures.renderPageWithSeo.apply(this, arguments);
}

// Server-Side Meta Injection + clean URL redirects
app.get("/blog/:postSlug", async (req, res) => {
  try {
    const posts = await readSiteDataWithFallback("posts", readBlogPosts);
    const matchedPost = findBlogPostByRouteSegment(posts, req.params.postSlug);
    if (!matchedPost) {
      return res.status(404).send("Page not found");
    }

    return renderPageWithSeo(req, res, "blog-details.html", matchedPost);
  } catch (error) {
    console.error("Error serving pretty blog URL:", error);
    return res.status(500).send("Page not found");
  }
});

// Catch-all 301 redirects for legacy blog URLs (e.g. /post/..., /nyheter/...) reported in Search Console
app.get(["/post/*", "/nyheter/*"], (req, res) => {
  return res.redirect(301, "/blog");
});

app.get(
  [...Object.keys(PAGE_ROUTE_MAP), ...Object.keys(LEGACY_REDIRECT_MAP)],
  async (req, res) => {
    const redirectTarget = LEGACY_REDIRECT_MAP[req.path];
    if (redirectTarget) {
      const qs = Object.keys(req.query).length
        ? `?${new URLSearchParams(req.query).toString()}`
        : "";
      return res.redirect(301, `${redirectTarget}${qs}`);
    }

    const reqFile = PAGE_ROUTE_MAP[req.path];
    if (!reqFile) {
      return res.status(404).send("Page not found");
    }

    if (req.path === "/service-details") {
      const serviceId = (req.query.id || "").toLowerCase();
      if (serviceId === "seo") {
        return res.redirect(301, "/seo");
      } else if (serviceId === "support" || serviceId === "vedlikehold") {
        return res.redirect(301, "/support-og-vedlikehold");
      } else if (serviceId === "some") {
        return res.redirect(301, "/sosiale-medier");
      } else {
        return res.redirect(301, "/webdesign");
      }
    }

    if (reqFile === "blog-details.html" && req.query.id) {
      try {
        const posts = await readSiteDataWithFallback("posts", readBlogPosts);
        const matchedPost = posts.find(
          (post) => Number(post.id) === Number(req.query.id),
        );
        if (matchedPost) {
          return res.redirect(
            301,
            normalizeStoredBlogPostLink(
              matchedPost.link,
              matchedPost.id,
              getBlogPostTitleForUrl(matchedPost),
            ),
          );
        }
      } catch (error) {
        console.error("Error redirecting legacy blog URL:", error);
      }
    }

    return renderPageWithSeo(req, res, reqFile);
  },
);

app.get("/translations.js", (req, res) => {
  try {
    const content = readDashboardContent();
    res.type("application/javascript");
    res.send(serializeDashboardContent(content));
  } catch (error) {
    console.error("Error serving translations.js:", error);
    res
      .status(500)
      .type("application/javascript")
      .send("const translations = {};");
  }
});

app.get("/data/posts.json", async (req, res) => {
  try {
    const posts = decorateBlogPostsWithResolvedLinks(
      await readSiteDataWithFallback("posts", readBlogPosts),
    );
    res.json(posts);
  } catch (error) {
    console.error("Error serving posts.json:", error);
    res.status(500).json([]);
  }
});

app.get("/data/seo.json", async (req, res) => {
  try {
    const seoConfig = normalizeSeoData(
      await readSiteDataWithFallback("seo", readSeoData),
    );
    res.json(seoConfig);
  } catch (error) {
    console.error("Error serving seo.json:", error);
    res.status(500).json(normalizeSeoData({}));
  }
});

app.get(["/admin/custom-style.css", "/custom-style.css"], async (req, res) => {
  try {
    const cssText = await readStyleCssWithFallback(readCustomStyleCss);
    res.type("text/css").send(cssText || "");
  } catch (error) {
    console.error("Error serving custom-style.css:", error);
    res.type("text/css").send("");
  }
});

const AI_ATTACHMENT_LIMITS = {
  fileSize: 12 * 1024 * 1024,
  files: 6,
};
const ADMIN_STORAGE_UPLOAD_LIMITS = {
  fileSize: 20 * 1024 * 1024,
};

const aiAttachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: AI_ATTACHMENT_LIMITS,
});
const adminStorageUpload = multer({
  storage: multer.memoryStorage(),
  limits: ADMIN_STORAGE_UPLOAD_LIMITS,
});

const aiAttachmentMiddleware = (req, res, next) => {
  aiAttachmentUpload.array("contextFiles", AI_ATTACHMENT_LIMITS.files)(
    req,
    res,
    (error) => {
      if (!error) {
        return next();
      }

      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "Attachment too large",
          details: `Each attachment must be <= ${Math.round(AI_ATTACHMENT_LIMITS.fileSize / (1024 * 1024))} MB.`,
        });
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          error: "Too many attachments",
          details: `You can attach up to ${AI_ATTACHMENT_LIMITS.files} files.`,
        });
      }

      return res.status(400).json({
        error: "Invalid multipart request",
        details: error.message,
      });
    },
  );
};

const adminStorageUploadMiddleware = (req, res, next) => {
  adminStorageUpload.single("file")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        details: `Max filstørrelse er ${Math.round(ADMIN_STORAGE_UPLOAD_LIMITS.fileSize / (1024 * 1024))} MB.`,
      });
    }

    return res.status(400).json({
      error: "Invalid upload request",
      details: error.message,
    });
  });
};

function inferMimeTypeFromFileName() {
  return serverFeatures.inferMimeTypeFromFileName.apply(this, arguments);
}

function normalizeAiAttachmentMimeType() {
  return serverFeatures.normalizeAiAttachmentMimeType.apply(this, arguments);
}

function isSupportedAiAttachmentMimeType() {
  return serverFeatures.isSupportedAiAttachmentMimeType.apply(this, arguments);
}

function sanitizeStoragePathSegment() {
  return serverFeatures.sanitizeStoragePathSegment.apply(this, arguments);
}

function normalizeAdminStorageFolder() {
  return serverFeatures.normalizeAdminStorageFolder.apply(this, arguments);
}

function buildAdminStorageObjectName() {
  return serverFeatures.buildAdminStorageObjectName.apply(this, arguments);
}

function buildFirebaseStorageDownloadUrl() {
  return serverFeatures.buildFirebaseStorageDownloadUrl.apply(this, arguments);
}

function uploadBufferToFirebaseStorage() {
  return serverFeatures.uploadBufferToFirebaseStorage.apply(this, arguments);
}

const GEMINI_DEFAULT_MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-1.5-flash",
];

const GEMINI_MODEL_LIST_CACHE_TTL_MS = 30 * 60 * 1000;
const geminiModelListCache = {
  expiresAt: 0,
  models: [],
};

function normalizeGeminiModelName() {
  return serverFeatures.normalizeGeminiModelName.apply(this, arguments);
}

function isGeminiModelNotFoundError() {
  return serverFeatures.isGeminiModelNotFoundError.apply(this, arguments);
}

function getGeminiModelCandidates() {
  return serverFeatures.getGeminiModelCandidates.apply(this, arguments);
}

function listGeminiGenerateContentModels() {
  return serverFeatures.listGeminiGenerateContentModels.apply(this, arguments);
}

function getGeminiGenerateContentModels() {
  return serverFeatures.getGeminiGenerateContentModels.apply(this, arguments);
}

function stripGeminiCodeFence() {
  return serverFeatures.stripGeminiCodeFence.apply(this, arguments);
}

function parseGeminiJsonPayload() {
  return serverFeatures.parseGeminiJsonPayload.apply(this, arguments);
}

function normalizeKeywordString() {
  return serverFeatures.normalizeKeywordString.apply(this, arguments);
}

function normalizeOutlineList() {
  return serverFeatures.normalizeOutlineList.apply(this, arguments);
}

function extractOutlineFallback() {
  return serverFeatures.extractOutlineFallback.apply(this, arguments);
}

function stripHtmlToText() {
  return serverFeatures.stripHtmlToText.apply(this, arguments);
}

function truncateText() {
  return serverFeatures.truncateText.apply(this, arguments);
}

function runGeminiGenerateContent() {
  return serverFeatures.runGeminiGenerateContent.apply(this, arguments);
}

// API: Generate Blog Content with Gemini AI
app.post(
  "/api/generate-content",
  verifyAdminToken,
  aiAttachmentMiddleware,
  async (req, res) => {
    try {
      const topic = String(req.body.topic || req.body.prompt || "").trim();
      const tone = String(req.body.tone || "professional").trim();
      const length = String(req.body.length || "medium").trim();
      const existingDraft = String(req.body.existingDraft || "").trim();
      const attachments = Array.isArray(req.files) ? req.files : [];

      if (!topic && !existingDraft && attachments.length === 0) {
        return res
          .status(400)
          .json({ error: "Prompt, draft or attachment is required" });
      }

      if (!String(process.env.GEMINI_API_KEY || "").trim()) {
        return res.status(500).json({
          error: "Gemini API key is missing",
          details: "Set GEMINI_API_KEY in server environment variables.",
        });
      }

      const invalidAttachment = attachments.find((file) => {
        const mimeType = normalizeAiAttachmentMimeType(file);
        return !isSupportedAiAttachmentMimeType(mimeType);
      });

      if (invalidAttachment) {
        return res.status(400).json({
          error: "Unsupported attachment type",
          details: `${invalidAttachment.originalname} is not supported. Use image, PDF, TXT or MD.`,
        });
      }

      const lengthMap = {
        short: "kort (ca. 2-3 avsnitt)",
        medium: "middels (ca. 4-6 avsnitt)",
        long: "lang (ca. 8-10 avsnitt)",
      };

      const promptSections = [
        "Du er en erfaren norsk innholdsforfatter.",
        `Tema/brief: ${topic || "Bruk vedleggene som grunnlag og foreslå en tydelig vinkling."}`,
        `Tone: ${tone || "professional"}`,
        `Lengde: ${lengthMap[length] || lengthMap.medium}`,
        "Skriv kun gyldig HTML uten markdown-kodeblokker.",
        "Bruk semantiske tagger som <h2>, <h3>, <p>, <ul>, <li>, og eventuelt <blockquote>.",
        "Inkluder en tydelig ingress, nyttige mellomtitler og en konkret avslutning.",
        "Språk: Norsk bokmål.",
      ];

      if (existingDraft) {
        promptSections.push(
          "Ta hensyn til eksisterende utkast, behold nyttige poeng, og forbedre struktur/språk.",
        );
      }

      if (attachments.length > 0) {
        promptSections.push(
          `Bruk vedlagte filer som kontekst. Antall vedlegg: ${attachments.length}.`,
        );
      }

      const parts = [{ text: promptSections.join("\n\n") }];

      if (existingDraft) {
        parts.push({
          text: `Eksisterende utkast:\n${existingDraft}`,
        });
      }

      attachments.forEach((file) => {
        const mimeType = normalizeAiAttachmentMimeType(file);

        if (mimeType.startsWith("text/")) {
          const textContent = file.buffer.toString("utf8");
          const truncatedText =
            textContent.length > 60000
              ? `${textContent.slice(0, 60000)}\n\n[Truncated due to size]`
              : textContent;

          parts.push({
            text: `Vedlagt fil (${file.originalname}):\n${truncatedText}`,
          });
          return;
        }

        parts.push({
          text: `Vedlagt fil: ${file.originalname}`,
        });
        parts.push({
          inlineData: {
            mimeType,
            data: file.buffer.toString("base64"),
          },
        });
      });

      const aiResult = await runGeminiGenerateContent(parts);
      const text = stripGeminiCodeFence(aiResult.text);

      res.json({
        content: text,
        model: aiResult.model,
        attachmentCount: attachments.length,
      });
    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorCode = String(error?.code || "");
      const errorMessage = String(error?.message || "");
      const refererBlocked =
        /API_KEY_HTTP_REFERRER_BLOCKED|Requests from referer <empty> are blocked/i.test(
          errorMessage,
        );

      if (errorCode === "gemini_api_key_missing") {
        return res.status(500).json({
          error: "Gemini API key is missing",
          code: "gemini_api_key_missing",
          details: "Set GEMINI_API_KEY in server environment variables.",
        });
      }

      if (errorCode === "gemini_model_unavailable") {
        return res.status(500).json({
          error: "No supported Gemini model available",
          code: "gemini_model_unavailable",
          details:
            errorMessage ||
            "Server could not find a Gemini model that supports generateContent.",
        });
      }

      if (refererBlocked) {
        return res.status(500).json({
          error: "Gemini key blocked by HTTP referrer restrictions",
          code: "gemini_api_key_http_referrer_blocked",
          details:
            "Gemini-kallet går fra server (uten referer). Bruk en servernøkkel uten HTTP-referrer-restriksjon, men med API-restriksjon til Generative Language API.",
        });
      }

      res
        .status(500)
        .json({
          error: "Failed to generate content",
          details: errorMessage || "Unknown Gemini error",
        });
    }
  },
);

// API: Generate blog SEO (NO) and translation (EN)
app.post("/api/blog/ai-enrich", verifyAdminToken, async (req, res) => {
  try {
    const title = String(req.body?.title || "").trim();
    const content = String(req.body?.content || "").trim();
    const excerpt = String(req.body?.excerpt || "").trim();
    const category = String(req.body?.category || "").trim();
    const seoTitle = String(req.body?.seoTitle || "").trim();
    const seoDesc = String(req.body?.seoDesc || "").trim();
    const seoKeywords = normalizeKeywordString(req.body?.seoKeywords || "");

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    if (!String(process.env.GEMINI_API_KEY || "").trim()) {
      return res.status(500).json({
        error: "Gemini API key is missing",
        details: "Set GEMINI_API_KEY in server environment variables.",
      });
    }

    const plainNoContent = stripHtmlToText(content);
    const fallbackNoExcerpt = excerpt || truncateText(plainNoContent, 220);
    const prompt = [
      "Du er en senior SEO-spesialist og en profesjonell oversetter (norsk -> engelsk).",
      "Du skal analysere et norsk blogginnlegg og returnere SEO-data og full engelsk versjon.",
      "Svar KUN med gyldig JSON. Ingen markdown, ingen forklaringer.",
      "JSON-formatet må være:",
      "{",
      '  "seo": {',
      '    "title": "Norsk SEO-tittel (maks 65 tegn)",',
      '    "description": "Norsk metabeskrivelse (maks 160 tegn)",',
      '    "keywords": ["nøkkelord1", "nøkkelord2", "nøkkelord3"]',
      "  },",
      '  "summary": {',
      '    "no": "Norsk sammendrag for hero (1-2 setninger)",',
      '    "en": "English hero summary (1-2 sentences)"',
      "  },",
      '  "outline": {',
      '    "no": ["Norsk punkt 1", "Norsk punkt 2", "Norsk punkt 3"],',
      '    "en": ["English point 1", "English point 2", "English point 3"]',
      "  },",
      '  "translation": {',
      '    "title": "Engelsk tittel",',
      '    "excerpt": "Engelsk utdrag (1-2 setninger)",',
      '    "category": "Engelsk kategori",',
      '    "contentHtml": "Full engelsk HTML med samme struktur som input",',
      '    "seoTitle": "English SEO title (max 65 chars)",',
      '    "seoDescription": "English meta description (max 160 chars)",',
      '    "seoKeywords": ["keyword1", "keyword2", "keyword3"]',
      "  }",
      "}",
      "Krav:",
      "- contentHtml må være gyldig HTML uten kodeblokker.",
      "- Behold semantisk struktur (<h2>, <h3>, <p>, <ul>, <li>, <blockquote>) fra originalen.",
      "- Ikke legg til fakta som ikke finnes i innholdet.",
      "- SEO-tittel og beskrivelse skal være konkrete og klikkvennlige.",
      "- summary.no og summary.en skal være korte og konkrete.",
      "- outline.no og outline.en skal ha 3-5 korte punkter.",
      "",
      `Norsk tittel: ${title}`,
      `Norsk kategori: ${category || "Generelt"}`,
      `Norsk utdrag: ${fallbackNoExcerpt || "(mangler)"}`,
      `Eksisterende SEO-tittel: ${seoTitle || "(mangler)"}`,
      `Eksisterende SEO-beskrivelse: ${seoDesc || "(mangler)"}`,
      `Eksisterende SEO-nøkkelord: ${seoKeywords || "(mangler)"}`,
      "",
      "Norsk HTML-innhold:",
      content,
    ].join("\n");

    const aiResult = await runGeminiGenerateContent([{ text: prompt }]);
    const parsed = parseGeminiJsonPayload(aiResult.text);

    if (!parsed) {
      throw new Error(
        "Gemini returned invalid JSON payload for blog SEO/translation.",
      );
    }

    const parsedSeo = parsed.seo || {};
    const parsedSummary = parsed.summary || {};
    const parsedOutline = parsed.outline || {};
    const parsedTranslation = parsed.translation || parsed.english || {};

    const normalizedSeoTitle = String(
      parsedSeo.title || parsedSeo.seoTitle || "",
    ).trim();
    const normalizedSeoDesc = String(
      parsedSeo.description || parsedSeo.seoDescription || "",
    ).trim();
    const normalizedSeoKeywords = normalizeKeywordString(
      parsedSeo.keywords || parsedSeo.seoKeywords || "",
    );
    const normalizedSummaryNo = String(
      parsedSummary.no || parsed.summaryNo || "",
    ).trim();
    const normalizedSummaryEn = String(
      parsedSummary.en || parsed.summaryEn || "",
    ).trim();
    const normalizedOutlineNo = normalizeOutlineList(
      parsedOutline.no || parsed.outlineNo || [],
    );
    const normalizedOutlineEn = normalizeOutlineList(
      parsedOutline.en || parsed.outlineEn || [],
    );

    const translatedTitle = String(parsedTranslation.title || "").trim();
    const translatedExcerptRaw = String(parsedTranslation.excerpt || "").trim();
    const translatedCategory = String(parsedTranslation.category || "").trim();
    const translatedContentHtml = stripGeminiCodeFence(
      parsedTranslation.contentHtml ||
        parsedTranslation.content ||
        parsedTranslation.html ||
        "",
    );
    const translatedSeoTitle = String(parsedTranslation.seoTitle || "").trim();
    const translatedSeoDesc = String(
      parsedTranslation.seoDescription || parsedTranslation.seoDesc || "",
    ).trim();
    const translatedSeoKeywords = normalizeKeywordString(
      parsedTranslation.seoKeywords || parsedTranslation.keywords || "",
    );
    const translatedSummary = String(parsedTranslation.summary || "").trim();
    const translatedOutline = normalizeOutlineList(
      parsedTranslation.outline || [],
    );

    if (!translatedContentHtml) {
      throw new Error("Gemini returned empty English content.");
    }

    const translatedPlainText = stripHtmlToText(translatedContentHtml);
    const translatedExcerpt =
      translatedExcerptRaw || truncateText(translatedPlainText, 220);
    const fallbackOutlineNo = extractOutlineFallback(plainNoContent, 3);
    const fallbackOutlineEn = extractOutlineFallback(translatedPlainText, 3);

    res.json({
      seo: {
        title: normalizedSeoTitle || seoTitle || title,
        description:
          normalizedSeoDesc || seoDesc || truncateText(plainNoContent, 160),
        keywords: normalizedSeoKeywords || seoKeywords,
      },
      summary: {
        no: normalizedSummaryNo || fallbackNoExcerpt,
        en: normalizedSummaryEn || translatedSummary || translatedExcerpt,
      },
      outline: {
        no: normalizedOutlineNo.length
          ? normalizedOutlineNo
          : fallbackOutlineNo,
        en: normalizedOutlineEn.length
          ? normalizedOutlineEn
          : translatedOutline.length
            ? translatedOutline
            : fallbackOutlineEn,
      },
      translation: {
        title: translatedTitle || title,
        excerpt: translatedExcerpt,
        category: translatedCategory || category || "General",
        content: translatedContentHtml,
        seoTitle: translatedSeoTitle || translatedTitle || title,
        seoDesc: translatedSeoDesc || truncateText(translatedPlainText, 160),
        seoKeywords: translatedSeoKeywords,
      },
      model: aiResult.model,
    });
  } catch (error) {
    console.error("Gemini Blog Enrichment Error:", error);
    const errorCode = String(error?.code || "");
    const errorMessage = String(error?.message || "");
    const refererBlocked =
      /API_KEY_HTTP_REFERRER_BLOCKED|Requests from referer <empty> are blocked/i.test(
        errorMessage,
      );

    if (errorCode === "gemini_api_key_missing") {
      return res.status(500).json({
        error: "Gemini API key is missing",
        code: "gemini_api_key_missing",
        details: "Set GEMINI_API_KEY in server environment variables.",
      });
    }

    if (errorCode === "gemini_model_unavailable") {
      return res.status(500).json({
        error: "No supported Gemini model available",
        code: "gemini_model_unavailable",
        details:
          errorMessage ||
          "Server could not find a Gemini model that supports generateContent.",
      });
    }

    if (refererBlocked) {
      return res.status(500).json({
        error: "Gemini key blocked by HTTP referrer restrictions",
        code: "gemini_api_key_http_referrer_blocked",
        details:
          "Gemini-kallet går fra server (uten referer). Bruk en servernøkkel uten HTTP-referrer-restriksjon, men med API-restriksjon til Generative Language API.",
      });
    }

    res.status(500).json({
      error: "Failed to enrich post with AI",
      details: errorMessage || "Unknown Gemini error",
    });
  }
});

const UNSPLASH_QUERY_SYNONYMS = {
  bilde: "image",
  bilder: "images",
  foto: "photo",
  fotografi: "photography",
  nettside: "website",
  hjemmeside: "website",
  webside: "website",
  webdesign: "web design",
  design: "design",
  markedsforing: "marketing",
  markedsføring: "marketing",
  sosiale: "social",
  medier: "media",
  kontor: "office",
  bedrift: "business",
  butikk: "store",
  kunde: "customer",
  team: "team",
  reise: "travel",
  natur: "nature",
  mat: "food",
  teknologi: "technology",
  kunstig: "artificial",
  intelligens: "intelligence",
};

function normalizeUnsplashQuery() {
  return serverFeatures.normalizeUnsplashQuery.apply(this, arguments);
}

function transliterateUnsplashQuery() {
  return serverFeatures.transliterateUnsplashQuery.apply(this, arguments);
}

function buildUnsplashQueryVariants() {
  return serverFeatures.buildUnsplashQueryVariants.apply(this, arguments);
}

function fetchUnsplashSearchPage() {
  return serverFeatures.fetchUnsplashSearchPage.apply(this, arguments);
}

// API: Search Unsplash Images
app.get("/api/unsplash/search", async (req, res) => {
  console.log(
    `[Unsplash] Mottok søkeforespørsel: "${req.query.query}" (Page: ${req.query.page})`,
  );
  try {
    const query = normalizeUnsplashQuery(req.query.query || "");
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedPerPage = Number.parseInt(req.query.per_page, 10);
    const page =
      Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const perPage =
      Number.isFinite(requestedPerPage) && requestedPerPage > 0
        ? Math.min(requestedPerPage, 30)
        : 24;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const fetch = (await import("node-fetch")).default;
    const accessKey = String(process.env.UNSPLASH_ACCESS_KEY || "").trim();

    if (!accessKey) {
      console.error("[Unsplash] UNSPLASH_ACCESS_KEY mangler.");
      return res.status(500).json({
        error: "Unsplash is not configured on server",
        code: "unsplash_not_configured",
        details: "Set UNSPLASH_ACCESS_KEY in server environment variables.",
      });
    }

    const queryVariants = buildUnsplashQueryVariants(query);
    const collected = [];
    const seenIds = new Set();
    const tokenCount = query.split(/\s+/).filter(Boolean).length;
    let selectedTotal = 0;
    let fallbackUsed = false;
    let effectiveQuery = queryVariants[0] || query;

    for (let index = 0; index < queryVariants.length; index += 1) {
      const candidateQuery = queryVariants[index];
      const remaining = perPage - collected.length;
      if (remaining <= 0) break;

      const data = await fetchUnsplashSearchPage({
        fetchImpl: fetch,
        accessKey,
        query: candidateQuery,
        page,
        perPage: remaining,
      });

      const results = Array.isArray(data?.results) ? data.results : [];
      if (index === 0) {
        selectedTotal = Number(data?.total) || 0;
        effectiveQuery = candidateQuery;
      }

      results.forEach((img) => {
        if (!img?.id || seenIds.has(img.id)) return;
        seenIds.add(img.id);
        collected.push(img);
      });

      if (index === 0) {
        const shouldTryFallback =
          results.length === 0 ||
          (tokenCount > 1 && results.length < Math.min(8, perPage));
        if (!shouldTryFallback) {
          break;
        }
        fallbackUsed = true;
        continue;
      }

      if (collected.length >= perPage) {
        break;
      }
    }

    // Format response to include only necessary data
    const images = collected.map((img) => ({
      id: img.id,
      full: img.urls.full || img.urls.regular,
      url: img.urls.regular,
      small: img.urls.small,
      thumb: img.urls.thumb,
      alt: img.alt_description || img.description || "",
      description: img.description || img.alt_description,
      photographer: img.user.name,
      photographerUrl: img.user.links.html,
      downloadUrl: img.links.download_location,
    }));

    res.json({
      images,
      total: Math.max(selectedTotal, images.length),
      page,
      perPage,
      searchQuery: effectiveQuery,
      fallbackUsed,
    });
  } catch (error) {
    console.error("Unsplash API Error:", error);
    res
      .status(500)
      .json({ error: "Failed to search images", details: error.message });
  }
});

app.post(
  "/api/admin/storage/upload",
  verifyAdminToken,
  adminStorageUploadMiddleware,
  async (req, res) => {
    try {
      if (!hasFirebaseServerCredentials()) {
        return res.status(503).json({
          error: "Firebase server credentials missing",
          details:
            "Set TK_FIREBASE_PROJECT_ID, TK_FIREBASE_CLIENT_EMAIL og TK_FIREBASE_PRIVATE_KEY i .env.",
        });
      }

      const file = req.file;
      if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
        return res.status(400).json({
          error: "Ingen fil valgt",
        });
      }

      const mimeType = String(
        file.mimetype || inferMimeTypeFromFileName(file.originalname),
      )
        .trim()
        .toLowerCase();
      const isImage = mimeType.startsWith("image/");
      const isPdf =
        mimeType === "application/pdf" ||
        file.originalname.toLowerCase().endsWith(".pdf");
      if (!isImage && !isPdf) {
        return res.status(400).json({
          error: "Ugyldig filtype",
          details:
            "Kun bildefiler (JPG, PNG, WebP, SVG) og PDF-dokumenter er tillatt.",
        });
      }

      const folder = normalizeAdminStorageFolder(req.body?.folder || "media");
      const result = await uploadBufferToFirebaseStorage({
        folder,
        originalName: file.originalname || "file",
        mimeType,
        buffer: file.buffer,
      });

      return res.json(result);
    } catch (error) {
      console.error("Admin storage upload failed:", error);
      return res.status(500).json({
        error: "Upload failed",
        details: error.message,
      });
    }
  },
);

app.get(
  "/api/proxy-pdf",
  require("./js/pdf-proxy").createPdfProxy({
    getBucket: () => getFirebaseWebConfig().storageBucket,
  }),
);

function getSiteBaseUrl() {
  return serverFeatures.getSiteBaseUrl.apply(this, arguments);
}

function normalizeBlogSlugPart() {
  return serverFeatures.normalizeBlogSlugPart.apply(this, arguments);
}

function getBlogPostTitleForUrl() {
  return serverFeatures.getBlogPostTitleForUrl.apply(this, arguments);
}

function buildRelativePostUrl() {
  return serverFeatures.buildRelativePostUrl.apply(this, arguments);
}

function isLegacyBlogPostLink() {
  return serverFeatures.isLegacyBlogPostLink.apply(this, arguments);
}

function normalizeStoredBlogPostLink() {
  return serverFeatures.normalizeStoredBlogPostLink.apply(this, arguments);
}

function decorateBlogPostWithResolvedLink() {
  return serverFeatures.decorateBlogPostWithResolvedLink.apply(this, arguments);
}

function parsePostDateTimestamp() {
  return serverFeatures.parsePostDateTimestamp.apply(this, arguments);
}

function decorateBlogPostsWithResolvedLinks() {
  return serverFeatures.decorateBlogPostsWithResolvedLinks.apply(
    this,
    arguments,
  );
}

function findBlogPostByRouteSegment() {
  return serverFeatures.findBlogPostByRouteSegment.apply(this, arguments);
}

function resolveAbsolutePostUrl() {
  return serverFeatures.resolveAbsolutePostUrl.apply(this, arguments);
}

function resolveAbsoluteAssetUrl() {
  return serverFeatures.resolveAbsoluteAssetUrl.apply(this, arguments);
}

function extractFirstImageSrcFromHtml() {
  return serverFeatures.extractFirstImageSrcFromHtml.apply(this, arguments);
}

function resolveSocialImage() {
  return serverFeatures.resolveSocialImage.apply(this, arguments);
}

function normalizeHashtagToken() {
  return serverFeatures.normalizeHashtagToken.apply(this, arguments);
}

function buildPostHashtags() {
  return serverFeatures.buildPostHashtags.apply(this, arguments);
}

function truncateForSocial() {
  return serverFeatures.truncateForSocial.apply(this, arguments);
}

function firstNonEmptyString() {
  return serverFeatures.firstNonEmptyString.apply(this, arguments);
}

function firstDefinedValue() {
  return serverFeatures.firstDefinedValue.apply(this, arguments);
}

function parseNonNegativeIntegerOrNull() {
  return serverFeatures.parseNonNegativeIntegerOrNull.apply(this, arguments);
}

function resolveSocialExcerpt() {
  return serverFeatures.resolveSocialExcerpt.apply(this, arguments);
}

function resolveWebhookHost() {
  return serverFeatures.resolveWebhookHost.apply(this, arguments);
}

function summarizeWebhookResponseBody() {
  return serverFeatures.summarizeWebhookResponseBody.apply(this, arguments);
}

function parseWebhookResponsePayload() {
  return serverFeatures.parseWebhookResponsePayload.apply(this, arguments);
}

function isWebhookPayloadExplicitFailure() {
  return serverFeatures.isWebhookPayloadExplicitFailure.apply(this, arguments);
}

function extractSocialWebhookDeliveryMeta() {
  return serverFeatures.extractSocialWebhookDeliveryMeta.apply(this, arguments);
}

function postPayloadToSocialWebhook() {
  return serverFeatures.postPayloadToSocialWebhook.apply(this, arguments);
}

// --- Direct Social Media API Integration (Meta Graph API & LinkedIn API) ---
function publishToFacebookPageApi() {
  return serverFeatures.publishToFacebookPageApi.apply(this, arguments);
}

function publishToInstagramApi() {
  return serverFeatures.publishToInstagramApi.apply(this, arguments);
}

function publishToLinkedInCompanyApi() {
  return serverFeatures.publishToLinkedInCompanyApi.apply(this, arguments);
}

function getSocialPlannerState() {
  return serverFeatures.getSocialPlannerState.apply(this, arguments);
}

function saveSocialPlannerState() {
  return serverFeatures.saveSocialPlannerState.apply(this, arguments);
}

function resolveSocialPlannerWorkspace() {
  return serverFeatures.resolveSocialPlannerWorkspace.apply(this, arguments);
}

function normalizeSocialPlannerWorkspaceId() {
  return serverFeatures.normalizeSocialPlannerWorkspaceId.apply(
    this,
    arguments,
  );
}

function resolveSocialPlannerWorkspaceId() {
  return serverFeatures.resolveSocialPlannerWorkspaceId.apply(this, arguments);
}

function getSocialPlannerWorkspaceIds() {
  return serverFeatures.getSocialPlannerWorkspaceIds.apply(this, arguments);
}

function getSocialPlannerAccountIds() {
  return serverFeatures.getSocialPlannerAccountIds.apply(this, arguments);
}

function withSocialPlannerMeta() {
  return serverFeatures.withSocialPlannerMeta.apply(this, arguments);
}

function resolveSocialPlannerPublishMediaUrl() {
  return serverFeatures.resolveSocialPlannerPublishMediaUrl.apply(
    this,
    arguments,
  );
}

function resolveSocialPlannerMetricsSyncUrl() {
  return serverFeatures.resolveSocialPlannerMetricsSyncUrl.apply(
    this,
    arguments,
  );
}

function buildSocialPlannerEntryPayload() {
  return serverFeatures.buildSocialPlannerEntryPayload.apply(this, arguments);
}

function summarizeSocialPlannerDelivery() {
  return serverFeatures.summarizeSocialPlannerDelivery.apply(this, arguments);
}

function publishSocialPlannerEntryById() {
  return serverFeatures.publishSocialPlannerEntryById.apply(this, arguments);
}

let socialPlannerSchedulerInFlight = false;
let socialPlannerSchedulerInterval = null;

function resolveSocialPlannerSchedulerIntervalMs() {
  return serverFeatures.resolveSocialPlannerSchedulerIntervalMs.apply(
    this,
    arguments,
  );
}

function resolveSocialPlannerPublishingStaleMs() {
  return serverFeatures.resolveSocialPlannerPublishingStaleMs.apply(
    this,
    arguments,
  );
}

function createSocialPlannerSchedulerRequestContext() {
  return serverFeatures.createSocialPlannerSchedulerRequestContext.apply(
    this,
    arguments,
  );
}

async function runSocialPlannerSchedulerTick(req, options = {}) {
  if (socialPlannerSchedulerInFlight) {
    return {
      ok: false,
      skipped: true,
      reason: "scheduler_in_flight",
      dueEntries: 0,
      processed: 0,
      published: 0,
      failed: 0,
      errors: [],
    };
  }

  socialPlannerSchedulerInFlight = true;
  let dueEntries = [];
  let processed = 0;
  let published = 0;
  let failed = 0;
  const errors = [];

  try {
    const state = await getSocialPlannerState();
    const now = Date.now();
    const maxEntriesRaw = Number.parseInt(options?.maxEntries, 10);
    const maxEntries = Number.isFinite(maxEntriesRaw)
      ? Math.max(1, Math.min(maxEntriesRaw, 50))
      : 10;
    const publishingStaleMs = resolveSocialPlannerPublishingStaleMs();

    dueEntries = (Array.isArray(state.entries) ? state.entries : [])
      .filter((entry) => {
        const status = String(entry?.status || "")
          .trim()
          .toLowerCase();
        if (status === "scheduled") {
          const scheduledAt = new Date(entry?.scheduledFor || "").getTime();
          return Number.isFinite(scheduledAt) && scheduledAt <= now;
        }

        if (status === "publishing") {
          const updatedAt = new Date(
            entry?.updatedAt || entry?.createdAt || "",
          ).getTime();
          return (
            Number.isFinite(updatedAt) && now - updatedAt >= publishingStaleMs
          );
        }

        return false;
      })
      .sort((a, b) => {
        const aStatus = String(a?.status || "")
          .trim()
          .toLowerCase();
        const bStatus = String(b?.status || "")
          .trim()
          .toLowerCase();
        const aTime =
          aStatus === "publishing"
            ? new Date(a?.updatedAt || a?.createdAt || "").getTime()
            : new Date(a?.scheduledFor || "").getTime();
        const bTime =
          bStatus === "publishing"
            ? new Date(b?.updatedAt || b?.createdAt || "").getTime()
            : new Date(b?.scheduledFor || "").getTime();
        return aTime - bTime;
      })
      .slice(0, maxEntries);

    for (const entry of dueEntries) {
      try {
        const publishResult = await publishSocialPlannerEntryById(
          entry.id,
          req,
          { keepScheduledOnFail: false },
        );
        processed += 1;
        if (publishResult.ok) {
          published += 1;
        } else {
          failed += 1;
        }
      } catch (error) {
        processed += 1;
        failed += 1;
        errors.push({
          entryId: entry.id,
          error: String(error?.message || error),
        });
        console.error("[Social Planner] Scheduler publish error:", error);
      }
    }

    return {
      ok: true,
      skipped: false,
      dueEntries: dueEntries.length,
      processed,
      published,
      failed,
      errors,
    };
  } catch (error) {
    errors.push({
      error: String(error?.message || error),
    });
    console.error("[Social Planner] Scheduler tick failed:", error);
    return {
      ok: false,
      skipped: false,
      dueEntries: dueEntries.length,
      processed,
      published,
      failed,
      errors,
    };
  } finally {
    socialPlannerSchedulerInFlight = false;
  }
}

function startSocialPlannerSchedulerLoop() {
  if (socialPlannerSchedulerInterval) {
    return {
      started: false,
      enabled: true,
      intervalMs: resolveSocialPlannerSchedulerIntervalMs(),
    };
  }

  const schedulerEnabled =
    String(process.env.SOCIAL_PLANNER_SCHEDULER_ENABLED || "true")
      .trim()
      .toLowerCase() !== "false";
  if (!schedulerEnabled) {
    return {
      started: false,
      enabled: false,
      intervalMs: 0,
    };
  }

  const intervalMs = resolveSocialPlannerSchedulerIntervalMs();
  const requestContext = createSocialPlannerSchedulerRequestContext();
  socialPlannerSchedulerInterval = setInterval(() => {
    runSocialPlannerSchedulerTick(requestContext, { maxEntries: 10 }).catch(
      (error) => {
        console.error("[Social Planner] Scheduler interval failed:", error);
      },
    );
  }, intervalMs);

  if (typeof socialPlannerSchedulerInterval.unref === "function") {
    socialPlannerSchedulerInterval.unref();
  }

  runSocialPlannerSchedulerTick(requestContext, { maxEntries: 10 }).catch(
    (error) => {
      console.error("[Social Planner] Scheduler warmup failed:", error);
    },
  );

  return {
    started: true,
    enabled: true,
    intervalMs,
  };
}

function parseBooleanFlag() {
  return serverFeatures.parseBooleanFlag.apply(this, arguments);
}

function safeCompareSecrets() {
  return serverFeatures.safeCompareSecrets.apply(this, arguments);
}

function isAuthorizedSocialPlannerMetricsSyncRequest() {
  return serverFeatures.isAuthorizedSocialPlannerMetricsSyncRequest.apply(
    this,
    arguments,
  );
}

function normalizeSocialPlannerMetricsSyncUpdate() {
  return serverFeatures.normalizeSocialPlannerMetricsSyncUpdate.apply(
    this,
    arguments,
  );
}

function findSocialPlannerEntryIndexForMetricsSync() {
  return serverFeatures.findSocialPlannerEntryIndexForMetricsSync.apply(
    this,
    arguments,
  );
}

function buildSocialPlannerWorkspaceScopedState() {
  return serverFeatures.buildSocialPlannerWorkspaceScopedState.apply(
    this,
    arguments,
  );
}

const SOCIAL_PLANNER_ASSISTANT_ALLOWED_ACTIONS = new Set([
  "write",
  "improve",
  "variants",
  "shorten",
  "expand",
  "hashtags",
]);
const SOCIAL_PLANNER_ASSISTANT_ALLOWED_TONES = new Set([
  "professional",
  "friendly",
  "inspirational",
  "sales",
  "playful",
  "informative",
]);

function normalizeSocialPlannerAssistantAction() {
  return serverFeatures.normalizeSocialPlannerAssistantAction.apply(
    this,
    arguments,
  );
}

function normalizeSocialPlannerAssistantTone() {
  return serverFeatures.normalizeSocialPlannerAssistantTone.apply(
    this,
    arguments,
  );
}

function normalizeSocialPlannerAssistantPlatforms() {
  return serverFeatures.normalizeSocialPlannerAssistantPlatforms.apply(
    this,
    arguments,
  );
}

function buildSocialPlannerAssistantPrompt() {
  return serverFeatures.buildSocialPlannerAssistantPrompt.apply(
    this,
    arguments,
  );
}

function normalizeSocialPlannerAssistantSuggestion() {
  return serverFeatures.normalizeSocialPlannerAssistantSuggestion.apply(
    this,
    arguments,
  );
}

app.post(
  "/api/social-planner/assistant",
  verifyAdminToken,
  async (req, res) => {
    try {
      const action = normalizeSocialPlannerAssistantAction(req.body?.action);
      const tone = normalizeSocialPlannerAssistantTone(req.body?.tone);
      const prompt = normalizePlannerText(req.body?.prompt || "", 1200);
      const masterText = normalizePlannerText(req.body?.masterText || "", 6000);
      const variants = normalizePlannerVariants(req.body?.variants || {});
      const linkUrl = normalizePlannerUrl(req.body?.linkUrl || "");
      const hashtags = normalizePlannerHashtags(req.body?.hashtags || []);
      const selectedPlatforms = normalizeSocialPlannerAssistantPlatforms(
        req.body?.selectedPlatforms,
      );
      const hasVariantContext = Object.values(variants).some((value) =>
        String(value || "").trim(),
      );

      if (
        !prompt &&
        !masterText &&
        !hasVariantContext &&
        !linkUrl &&
        hashtags.length === 0
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Skriv en instruks eller legg inn litt eksisterende tekst først.",
        });
      }

      const aiResult = await runGeminiGenerateContent([
        {
          text: buildSocialPlannerAssistantPrompt({
            action,
            tone,
            prompt,
            masterText,
            variants,
            linkUrl,
            hashtags,
            selectedPlatforms,
          }),
        },
      ]);

      const parsed = parseGeminiJsonPayload(aiResult.text);
      const suggestion = normalizeSocialPlannerAssistantSuggestion(
        parsed,
        aiResult.text,
      );

      if (action === "hashtags" && suggestion.hashtags.length === 0) {
        const hashtagFromText = normalizePlannerHashtags(
          String(suggestion.masterText || "").match(/#[a-z0-9_]+/gi) || [],
        );
        suggestion.hashtags = hashtagFromText;
      }

      return res.json({
        success: true,
        suggestion,
        model: aiResult.model,
      });
    } catch (error) {
      console.error("[Social Planner] Assistant request failed:", error);
      const errorCode = String(error?.code || "");
      const errorMessage = String(error?.message || "");
      const apiKeyInvalid = /API_KEY_INVALID|API key not valid/i.test(
        errorMessage,
      );
      const refererBlocked =
        /API_KEY_HTTP_REFERRER_BLOCKED|Requests from referer <empty> are blocked/i.test(
          errorMessage,
        );

      if (errorCode === "gemini_api_key_missing") {
        return res.status(500).json({
          success: false,
          error: "Gemini API key is missing",
          code: "gemini_api_key_missing",
          details: "Set GEMINI_API_KEY in server environment variables.",
        });
      }

      if (errorCode === "gemini_model_unavailable") {
        return res.status(500).json({
          success: false,
          error: "No supported Gemini model available",
          code: "gemini_model_unavailable",
          details:
            errorMessage ||
            "Server could not find a Gemini model that supports generateContent.",
        });
      }

      if (apiKeyInvalid) {
        return res.status(500).json({
          success: false,
          error: "Gemini API key is invalid",
          code: "gemini_api_key_invalid",
          details:
            "Oppdater GEMINI_API_KEY i server-miljøet. Nåværende nøkkel avvises av Google.",
        });
      }

      if (refererBlocked) {
        return res.status(500).json({
          success: false,
          error: "Gemini key blocked by HTTP referrer restrictions",
          code: "gemini_api_key_http_referrer_blocked",
          details:
            "Gemini-kallet går fra server (uten referer). Bruk en servernøkkel uten HTTP-referrer-restriksjon, men med API-restriksjon til Generative Language API.",
        });
      }

      return res.status(500).json({
        success: false,
        error: "AI-assistenten feilet.",
        details: errorMessage || "Unknown Gemini error",
      });
    }
  },
);

app.get("/api/social-planner", async (req, res) => {
  try {
    const state = await getSocialPlannerState();
    const requestedWorkspaceId = String(req.query.workspaceId || "").trim();
    const scope = String(req.query.scope || "all")
      .trim()
      .toLowerCase();
    const shouldRunScheduler = parseBooleanFlag(req.query.runScheduler, false);

    let scheduler = null;
    if (shouldRunScheduler) {
      scheduler = await runSocialPlannerSchedulerTick(req, {
        maxEntries: req.query.maxEntries,
      });
    }

    const workspaceId = resolveSocialPlannerWorkspaceId(
      state,
      requestedWorkspaceId,
    );
    const responseState =
      scope === "workspace"
        ? buildSocialPlannerWorkspaceScopedState(state, workspaceId)
        : state;

    res.json({
      success: true,
      state: withSocialPlannerMeta(responseState, workspaceId),
      scheduler,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to read state:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke hente social planner data.",
      details: error.message,
    });
  }
});

app.put("/api/social-planner", async (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return res.status(400).json({
      success: false,
      error: "Ugyldig payload.",
    });
  }

  try {
    const currentState = await getSocialPlannerState();
    const merged = normalizeSocialPlannerData({
      ...currentState,
      ...incoming,
      settings: {
        ...(currentState.settings || {}),
        ...(incoming.settings || {}),
      },
    });
    const saveResult = await saveSocialPlannerState(merged);
    res.json({
      success: true,
      state: withSocialPlannerMeta(
        merged,
        merged?.settings?.activeWorkspaceId || "default",
      ),
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to save state:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke lagre social planner data.",
      details: error.message,
    });
  }
});

app.patch("/api/social-planner/settings", async (req, res) => {
  try {
    const state = await getSocialPlannerState();
    const activeWorkspaceId = resolveSocialPlannerWorkspaceId(
      state,
      req.body?.activeWorkspaceId,
    );
    state.settings = {
      ...(state.settings || {}),
      activeWorkspaceId,
    };
    const saveResult = await saveSocialPlannerState(state);
    res.json({
      success: true,
      settings: state.settings,
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to update settings:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke oppdatere innstillinger.",
      details: error.message,
    });
  }
});

app.post(
  "/api/social-planner/workspaces",
  verifyAdminToken,
  async (req, res) => {
    try {
      const state = await getSocialPlannerState();
      state.settings = { ...(state.settings || {}) };
      state.workspaces = Array.isArray(state.workspaces)
        ? state.workspaces
        : [];
      const nowIso = new Date().toISOString();
      const workspaceIds = getSocialPlannerWorkspaceIds(state);
      const name = normalizePlannerShortText(req.body?.name || "", 100);
      const timezone =
        normalizePlannerShortText(req.body?.timezone || "Europe/Oslo", 60) ||
        "Europe/Oslo";
      const requestedId = normalizeSocialPlannerWorkspaceId(req.body?.id, "");
      const fallbackId = createSocialPlannerId("ws");
      const baseId =
        requestedId || normalizeSocialPlannerWorkspaceId(name, fallbackId);
      let uniqueId = baseId;
      let suffix = 1;

      while (workspaceIds.has(uniqueId)) {
        const suffixPart = `-${suffix}`;
        const trimmedBaseId = baseId.slice(
          0,
          Math.max(1, 60 - suffixPart.length),
        );
        uniqueId = `${trimmedBaseId}${suffixPart}`;
        suffix += 1;
      }

      const workspace = normalizeSocialPlannerWorkspace(
        {
          id: uniqueId,
          name: name || `Workspace ${state.workspaces.length + 1}`,
          timezone,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        uniqueId,
      );

      state.workspaces.push(workspace);
      if (
        !state.settings.activeWorkspaceId ||
        parseBooleanFlag(req.body?.setActive, true)
      ) {
        state.settings.activeWorkspaceId = workspace.id;
      }

      const saveResult = await saveSocialPlannerState(state);
      res.status(201).json({
        success: true,
        workspace,
        state: withSocialPlannerMeta(state, state.settings.activeWorkspaceId),
        ...saveResult,
      });
    } catch (error) {
      console.error("[Social Planner] Failed to create workspace:", error);
      res.status(500).json({
        success: false,
        error: "Kunne ikke opprette workspace.",
        details: error.message,
      });
    }
  },
);

app.patch("/api/social-planner/workspaces/:workspaceId", async (req, res) => {
  const workspaceId = String(req.params.workspaceId || "").trim();
  if (!workspaceId) {
    return res.status(400).json({
      success: false,
      error: "Workspace id mangler.",
    });
  }

  try {
    const state = await getSocialPlannerState();
    state.settings = { ...(state.settings || {}) };
    state.workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
    const index = state.workspaces.findIndex(
      (workspace) => workspace.id === workspaceId,
    );

    if (index < 0) {
      return res.status(404).json({
        success: false,
        error: "Workspace finnes ikke.",
      });
    }

    const current = state.workspaces[index];
    const nextWorkspace = normalizeSocialPlannerWorkspace(
      {
        ...current,
        name: req.body?.name ?? current.name,
        timezone: req.body?.timezone ?? current.timezone,
        updatedAt: new Date().toISOString(),
      },
      current.id,
    );

    state.workspaces[index] = nextWorkspace;
    if (parseBooleanFlag(req.body?.setActive, false)) {
      state.settings.activeWorkspaceId = nextWorkspace.id;
    }

    const saveResult = await saveSocialPlannerState(state);
    res.json({
      success: true,
      workspace: nextWorkspace,
      state: withSocialPlannerMeta(state, state.settings.activeWorkspaceId),
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to update workspace:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke oppdatere workspace.",
      details: error.message,
    });
  }
});

app.delete("/api/social-planner/workspaces/:workspaceId", async (req, res) => {
  const workspaceId = String(req.params.workspaceId || "").trim();
  if (!workspaceId) {
    return res.status(400).json({
      success: false,
      error: "Workspace id mangler.",
    });
  }

  try {
    const state = await getSocialPlannerState();
    state.settings = { ...(state.settings || {}) };
    state.workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
    state.socialAccounts = Array.isArray(state.socialAccounts)
      ? state.socialAccounts
      : [];
    state.templates = Array.isArray(state.templates) ? state.templates : [];
    state.entries = Array.isArray(state.entries) ? state.entries : [];

    const workspaceIndex = state.workspaces.findIndex(
      (workspace) => workspace.id === workspaceId,
    );
    if (workspaceIndex < 0) {
      return res.status(404).json({
        success: false,
        error: "Workspace finnes ikke.",
      });
    }

    const [removedWorkspace] = state.workspaces.splice(workspaceIndex, 1);
    const removedAccountsCount = state.socialAccounts.filter(
      (account) => account.workspaceId === workspaceId,
    ).length;
    const removedTemplatesCount = state.templates.filter(
      (template) => template.workspaceId === workspaceId,
    ).length;
    const removedEntriesCount = state.entries.filter(
      (entry) => entry.workspaceId === workspaceId,
    ).length;
    state.socialAccounts = state.socialAccounts.filter(
      (account) => account.workspaceId !== workspaceId,
    );
    state.templates = state.templates.filter(
      (template) => template.workspaceId !== workspaceId,
    );
    state.entries = state.entries.filter(
      (entry) => entry.workspaceId !== workspaceId,
    );

    if (state.workspaces.length === 0) {
      state.workspaces = createDefaultSocialPlannerData().workspaces;
    }

    if (
      !state.workspaces.some(
        (workspace) => workspace.id === state.settings.activeWorkspaceId,
      )
    ) {
      state.settings.activeWorkspaceId = state.workspaces[0].id;
    }

    const saveResult = await saveSocialPlannerState(state);
    res.json({
      success: true,
      removedWorkspaceId: removedWorkspace.id,
      removedAccountsCount,
      removedTemplatesCount,
      removedEntriesCount,
      state: withSocialPlannerMeta(state, state.settings.activeWorkspaceId),
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to delete workspace:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke slette workspace.",
      details: error.message,
    });
  }
});

app.post("/api/social-planner/accounts", verifyAdminToken, async (req, res) => {
  try {
    const state = await getSocialPlannerState();
    state.socialAccounts = Array.isArray(state.socialAccounts)
      ? state.socialAccounts
      : [];
    const workspaceId = resolveSocialPlannerWorkspaceId(
      state,
      req.body?.workspaceId,
    );
    const workspaceIds = getSocialPlannerWorkspaceIds(state);
    const nowIso = new Date().toISOString();
    let account = normalizeSocialPlannerAccount(
      {
        id: req.body?.id || createSocialPlannerId("acct"),
        workspaceId,
        platform: req.body?.platform,
        displayName: req.body?.displayName,
        externalAccountId: req.body?.externalAccountId,
        status: req.body?.status || "active",
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      workspaceIds,
    );

    if (!account.displayName) {
      return res.status(400).json({
        success: false,
        error: "displayName er påkrevd.",
      });
    }

    const accountIds = getSocialPlannerAccountIds(state);
    if (accountIds.has(account.id)) {
      account = normalizeSocialPlannerAccount(
        {
          ...account,
          id: createSocialPlannerId("acct"),
        },
        workspaceIds,
      );
    }

    state.socialAccounts.push(account);
    const saveResult = await saveSocialPlannerState(state);
    res.status(201).json({
      success: true,
      account,
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to create account:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke opprette konto.",
      details: error.message,
    });
  }
});

app.patch("/api/social-planner/accounts/:accountId", async (req, res) => {
  const accountId = String(req.params.accountId || "").trim();
  if (!accountId) {
    return res.status(400).json({
      success: false,
      error: "Account id mangler.",
    });
  }

  try {
    const state = await getSocialPlannerState();
    state.socialAccounts = Array.isArray(state.socialAccounts)
      ? state.socialAccounts
      : [];
    const index = state.socialAccounts.findIndex(
      (account) => account.id === accountId,
    );
    if (index < 0) {
      return res.status(404).json({
        success: false,
        error: "Konto finnes ikke.",
      });
    }

    const current = state.socialAccounts[index];
    const workspaceId = resolveSocialPlannerWorkspaceId(
      state,
      req.body?.workspaceId || current.workspaceId,
    );
    const workspaceIds = getSocialPlannerWorkspaceIds(state);
    const nextAccount = normalizeSocialPlannerAccount(
      {
        ...current,
        ...req.body,
        id: current.id,
        workspaceId,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
      },
      workspaceIds,
    );

    if (!nextAccount.displayName) {
      return res.status(400).json({
        success: false,
        error: "displayName er påkrevd.",
      });
    }

    state.socialAccounts[index] = nextAccount;
    const saveResult = await saveSocialPlannerState(state);
    res.json({
      success: true,
      account: nextAccount,
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to update account:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke oppdatere konto.",
      details: error.message,
    });
  }
});

app.delete("/api/social-planner/accounts/:accountId", async (req, res) => {
  const accountId = String(req.params.accountId || "").trim();
  if (!accountId) {
    return res.status(400).json({
      success: false,
      error: "Account id mangler.",
    });
  }

  try {
    const state = await getSocialPlannerState();
    state.socialAccounts = Array.isArray(state.socialAccounts)
      ? state.socialAccounts
      : [];
    state.entries = Array.isArray(state.entries) ? state.entries : [];
    const index = state.socialAccounts.findIndex(
      (account) => account.id === accountId,
    );
    if (index < 0) {
      return res.status(404).json({
        success: false,
        error: "Konto finnes ikke.",
      });
    }

    const [removedAccount] = state.socialAccounts.splice(index, 1);
    const workspaceIds = getSocialPlannerWorkspaceIds(state);
    const accountIds = getSocialPlannerAccountIds(state);
    let updatedEntries = 0;

    state.entries = state.entries.map((entry) => {
      if (
        !Array.isArray(entry.targetAccountIds) ||
        !entry.targetAccountIds.includes(accountId)
      ) {
        return entry;
      }

      updatedEntries += 1;
      return normalizeSocialPlannerEntry(
        {
          ...entry,
          targetAccountIds: entry.targetAccountIds.filter(
            (id) => id !== accountId,
          ),
          updatedAt: new Date().toISOString(),
        },
        workspaceIds,
        accountIds,
      );
    });

    const saveResult = await saveSocialPlannerState(state);
    res.json({
      success: true,
      removedAccountId: removedAccount.id,
      updatedEntries,
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to delete account:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke slette konto.",
      details: error.message,
    });
  }
});

app.post(
  "/api/social-planner/templates",
  verifyAdminToken,
  async (req, res) => {
    try {
      const state = await getSocialPlannerState();
      state.templates = Array.isArray(state.templates) ? state.templates : [];
      const workspaceId = resolveSocialPlannerWorkspaceId(
        state,
        req.body?.workspaceId,
      );
      const workspaceIds = getSocialPlannerWorkspaceIds(state);
      const nowIso = new Date().toISOString();
      const template = normalizeSocialPlannerTemplate(
        {
          id: req.body?.id || createSocialPlannerId("tpl"),
          workspaceId,
          category: req.body?.category,
          name: req.body?.name,
          body: req.body?.body,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
        workspaceIds,
      );

      state.templates.push(template);
      const saveResult = await saveSocialPlannerState(state);
      res.status(201).json({
        success: true,
        template,
        ...saveResult,
      });
    } catch (error) {
      console.error("[Social Planner] Failed to create template:", error);
      res.status(500).json({
        success: false,
        error: "Kunne ikke opprette mal.",
        details: error.message,
      });
    }
  },
);

app.patch("/api/social-planner/templates/:templateId", async (req, res) => {
  const templateId = String(req.params.templateId || "").trim();
  if (!templateId) {
    return res.status(400).json({
      success: false,
      error: "Template id mangler.",
    });
  }

  try {
    const state = await getSocialPlannerState();
    state.templates = Array.isArray(state.templates) ? state.templates : [];
    const index = state.templates.findIndex(
      (template) => template.id === templateId,
    );
    if (index < 0) {
      return res.status(404).json({
        success: false,
        error: "Mal finnes ikke.",
      });
    }

    const current = state.templates[index];
    const workspaceId = resolveSocialPlannerWorkspaceId(
      state,
      req.body?.workspaceId || current.workspaceId,
    );
    const workspaceIds = getSocialPlannerWorkspaceIds(state);
    const nextTemplate = normalizeSocialPlannerTemplate(
      {
        ...current,
        ...req.body,
        id: current.id,
        workspaceId,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
      },
      workspaceIds,
    );

    state.templates[index] = nextTemplate;
    const saveResult = await saveSocialPlannerState(state);
    res.json({
      success: true,
      template: nextTemplate,
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to update template:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke oppdatere mal.",
      details: error.message,
    });
  }
});

app.delete("/api/social-planner/templates/:templateId", async (req, res) => {
  const templateId = String(req.params.templateId || "").trim();
  if (!templateId) {
    return res.status(400).json({
      success: false,
      error: "Template id mangler.",
    });
  }

  try {
    const state = await getSocialPlannerState();
    state.templates = Array.isArray(state.templates) ? state.templates : [];
    const index = state.templates.findIndex(
      (template) => template.id === templateId,
    );
    if (index < 0) {
      return res.status(404).json({
        success: false,
        error: "Mal finnes ikke.",
      });
    }

    const [removedTemplate] = state.templates.splice(index, 1);
    const saveResult = await saveSocialPlannerState(state);
    res.json({
      success: true,
      removedTemplateId: removedTemplate.id,
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to delete template:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke slette mal.",
      details: error.message,
    });
  }
});

app.post("/api/social-planner/entries", verifyAdminToken, async (req, res) => {
  try {
    const state = await getSocialPlannerState();
    state.entries = Array.isArray(state.entries) ? state.entries : [];
    const workspaceIds = getSocialPlannerWorkspaceIds(state);
    const accountIds = getSocialPlannerAccountIds(state);
    const workspaceId = resolveSocialPlannerWorkspaceId(
      state,
      req.body?.workspaceId,
    );
    const nowIso = new Date().toISOString();
    const desiredStatus = normalizePlannerStatus(
      req.body?.status || (req.body?.scheduledFor ? "scheduled" : "draft"),
    );
    const entry = normalizeSocialPlannerEntry(
      {
        ...req.body,
        id: req.body?.id || createSocialPlannerId("entry"),
        workspaceId,
        status: desiredStatus,
        createdAt: nowIso,
        updatedAt: nowIso,
        publishedAt:
          desiredStatus === "published"
            ? req.body?.publishedAt || nowIso
            : req.body?.publishedAt || "",
      },
      workspaceIds,
      accountIds,
    );

    if (entry.status === "scheduled" && !entry.scheduledFor) {
      return res.status(400).json({
        success: false,
        error: "scheduledFor er påkrevd når status er scheduled.",
      });
    }

    state.entries.push(entry);
    const saveResult = await saveSocialPlannerState(state);
    const publishNow = parseBooleanFlag(req.body?.publishNow, false);

    if (publishNow) {
      const publishResult = await publishSocialPlannerEntryById(entry.id, req, {
        keepScheduledOnFail: false,
        stateOverride: state,
      });
      return res
        .status(
          Number.isFinite(publishResult.httpStatus)
            ? publishResult.httpStatus
            : 500,
        )
        .json({
          success: !!publishResult.ok,
          entry: publishResult.entry || entry,
          delivery: publishResult.delivery || [],
          code: publishResult.ok ? "published" : "publish_failed",
          error: publishResult.error || "",
          details: publishResult.details || publishResult.error || "",
          ...saveResult,
        });
    }

    res.status(201).json({
      success: true,
      entry,
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to create entry:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke opprette innlegg.",
      details: error.message,
    });
  }
});

app.patch("/api/social-planner/entries/:entryId", async (req, res) => {
  const entryId = String(req.params.entryId || "").trim();
  if (!entryId) {
    return res.status(400).json({
      success: false,
      error: "Entry id mangler.",
    });
  }

  try {
    const state = await getSocialPlannerState();
    state.entries = Array.isArray(state.entries) ? state.entries : [];
    const index = state.entries.findIndex((entry) => entry.id === entryId);
    if (index < 0) {
      return res.status(404).json({
        success: false,
        error: "Innlegg finnes ikke.",
      });
    }

    const current = state.entries[index];
    const workspaceIds = getSocialPlannerWorkspaceIds(state);
    const accountIds = getSocialPlannerAccountIds(state);
    const workspaceId = resolveSocialPlannerWorkspaceId(
      state,
      req.body?.workspaceId || current.workspaceId,
    );
    const desiredStatus = req.body?.status
      ? normalizePlannerStatus(req.body.status)
      : current.status;
    const nextEntry = normalizeSocialPlannerEntry(
      {
        ...current,
        ...req.body,
        id: current.id,
        workspaceId,
        status: desiredStatus,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
        publishedAt:
          desiredStatus === "published"
            ? req.body?.publishedAt ||
              current.publishedAt ||
              new Date().toISOString()
            : (req.body?.publishedAt ?? current.publishedAt),
      },
      workspaceIds,
      accountIds,
    );

    if (nextEntry.status === "scheduled" && !nextEntry.scheduledFor) {
      return res.status(400).json({
        success: false,
        error: "scheduledFor er påkrevd når status er scheduled.",
      });
    }

    state.entries[index] = nextEntry;
    const saveResult = await saveSocialPlannerState(state);
    const publishNow = parseBooleanFlag(req.body?.publishNow, false);

    if (publishNow) {
      const publishResult = await publishSocialPlannerEntryById(entryId, req, {
        keepScheduledOnFail: parseBooleanFlag(
          req.body?.keepScheduledOnFail,
          false,
        ),
        stateOverride: state,
      });
      return res
        .status(
          Number.isFinite(publishResult.httpStatus)
            ? publishResult.httpStatus
            : 500,
        )
        .json({
          success: !!publishResult.ok,
          entry: publishResult.entry || nextEntry,
          delivery: publishResult.delivery || [],
          code: publishResult.ok ? "published" : "publish_failed",
          error: publishResult.error || "",
          details: publishResult.details || publishResult.error || "",
          ...saveResult,
        });
    }

    res.json({
      success: true,
      entry: nextEntry,
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to update entry:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke oppdatere innlegg.",
      details: error.message,
    });
  }
});

app.delete("/api/social-planner/entries/:entryId", async (req, res) => {
  const entryId = String(req.params.entryId || "").trim();
  if (!entryId) {
    return res.status(400).json({
      success: false,
      error: "Entry id mangler.",
    });
  }

  try {
    const state = await getSocialPlannerState();
    state.entries = Array.isArray(state.entries) ? state.entries : [];
    const index = state.entries.findIndex((entry) => entry.id === entryId);
    if (index < 0) {
      return res.status(404).json({
        success: false,
        error: "Innlegg finnes ikke.",
      });
    }

    const [removedEntry] = state.entries.splice(index, 1);
    const saveResult = await saveSocialPlannerState(state);
    res.json({
      success: true,
      removedEntryId: removedEntry.id,
      ...saveResult,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to delete entry:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke slette innlegg.",
      details: error.message,
    });
  }
});

require("./js/marketing-agent").installMarketingAgentRoutes(app, {
  getAdminInstance,
  hasFirebaseServerCredentials,
  publishers: {
    facebook: (input) =>
      publishToFacebookPageApi({
        message:
          input.imageUrl && input.link && !input.text.includes(input.link)
            ? input.text + "\n\n" + input.link
            : input.text,
        link: input.link,
        imageUrl: input.imageUrl,
      }),
    instagram: (input) =>
      publishToInstagramApi({ caption: input.text, imageUrl: input.imageUrl }),
    linkedin: (input) =>
      publishToLinkedInCompanyApi({
        text: input.text,
        title: input.title,
        url: input.link,
      }),
  },
});

app.post("/api/social/publish-direct", verifyAdminToken, async (req, res) => {
  try {
    const {
      title,
      text,
      link,
      imageUrl,
      targets = ["facebook", "instagram", "linkedin"],
    } = req.body || {};
    const results = {};
    const fullText =
      text || `${title || ""}\n\n${link || ""}\n\n#webdesign #seo #tkdesign`;

    if (targets.includes("facebook")) {
      results.facebook = await publishToFacebookPageApi({
        message: fullText,
        link,
        imageUrl,
      });
    }

    if (targets.includes("instagram")) {
      results.instagram = await publishToInstagramApi({
        caption: fullText,
        imageUrl,
      });
    }

    if (targets.includes("linkedin")) {
      results.linkedin = await publishToLinkedInCompanyApi({
        text: fullText,
        title,
        url: link,
      });
    }

    const anySuccess = Object.values(results).some((r) => r.ok);
    const errorDetails = Object.entries(results)
      .filter(([_, res]) => !res.ok)
      .map(([platform, res]) => `${platform.toUpperCase()}: ${res.error}`)
      .join(" | ");

    res.json({
      success: anySuccess,
      results,
      message: anySuccess
        ? "Publisert til sosiale medier via API!"
        : errorDetails ||
          "Ingen kontoer publisert via API. Sjekk at miljøvariabler er lagt inn i Vercel og at du har trykket Redeploy.",
    });
  } catch (error) {
    console.error("[Social API] Publish direct error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post(
  "/api/social-planner/entries/:entryId/publish",
  verifyAdminToken,
  async (req, res) => {
    try {
      const publishResult = await publishSocialPlannerEntryById(
        req.params.entryId,
        req,
        {
          keepScheduledOnFail: parseBooleanFlag(
            req.body?.keepScheduledOnFail,
            false,
          ),
        },
      );
      const statusCode = Number.isFinite(publishResult.httpStatus)
        ? publishResult.httpStatus
        : 500;
      res.status(statusCode).json({
        success: !!publishResult.ok,
        entry: publishResult.entry || null,
        delivery: publishResult.delivery || [],
        code: publishResult.ok ? "published" : "publish_failed",
        error: publishResult.error || "",
        details: publishResult.details || publishResult.error || "",
      });
    } catch (error) {
      console.error("[Social Planner] Failed to publish entry:", error);
      res.status(500).json({
        success: false,
        error: "Kunne ikke publisere innlegg.",
        details: error.message,
      });
    }
  },
);

app.post(
  "/api/social-planner/scheduler/run",
  verifyAdminToken,
  async (req, res) => {
    try {
      const schedulerResult = await runSocialPlannerSchedulerTick(req, {
        maxEntries: req.body?.maxEntries ?? req.query.maxEntries,
      });
      const success = schedulerResult.ok || schedulerResult.skipped;
      res.status(success ? 200 : 500).json({
        success,
        scheduler: schedulerResult,
      });
    } catch (error) {
      console.error("[Social Planner] Scheduler run endpoint failed:", error);
      res.status(500).json({
        success: false,
        error: "Kunne ikke kjøre scheduler.",
        details: error.message,
      });
    }
  },
);

app.get("/api/social-planner/analytics", async (req, res) => {
  try {
    const state = await getSocialPlannerState();
    const workspaceScope = String(req.query.scope || "workspace")
      .trim()
      .toLowerCase();
    const workspaceId = resolveSocialPlannerWorkspaceId(
      state,
      req.query.workspaceId,
    );
    const scopedEntries =
      workspaceScope === "all"
        ? Array.isArray(state.entries)
          ? state.entries
          : []
        : (Array.isArray(state.entries) ? state.entries : []).filter(
            (entry) => entry.workspaceId === workspaceId,
          );
    const range = resolveSocialPlannerDateRange(req.query);
    const analytics = computeSocialPlannerAnalytics(
      {
        ...state,
        entries: scopedEntries,
      },
      range,
    );

    res.json({
      success: true,
      scope: workspaceScope === "all" ? "all" : "workspace",
      workspaceId: workspaceScope === "all" ? null : workspaceId,
      analytics,
    });
  } catch (error) {
    console.error("[Social Planner] Failed to compute analytics:", error);
    res.status(500).json({
      success: false,
      error: "Kunne ikke hente analytics.",
      details: error.message,
    });
  }
});

app.post(
  "/api/social-planner/metrics/sync",
  verifyAdminToken,
  async (req, res) => {
    try {
      const auth = isAuthorizedSocialPlannerMetricsSyncRequest(req);
      if (!auth.ok) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized metrics sync request.",
        });
      }

      const body =
        req.body && typeof req.body === "object" && !Array.isArray(req.body)
          ? req.body
          : {};
      const rawUpdates = Array.isArray(body.updates) ? body.updates : [body];
      const updates = rawUpdates
        .map((item) => normalizeSocialPlannerMetricsSyncUpdate(item))
        .filter((item) => item && typeof item === "object");

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Ingen gyldige updates sendt inn.",
        });
      }

      const state = await getSocialPlannerState();
      state.entries = Array.isArray(state.entries) ? state.entries : [];
      const workspaceIds = getSocialPlannerWorkspaceIds(state);
      const accountIds = getSocialPlannerAccountIds(state);
      const updatedEntries = [];
      const notFound = [];
      const skipped = [];

      for (const update of updates) {
        const hasLookupValue = Boolean(
          update.entryId || update.externalPostId || update.accountId,
        );
        if (!hasLookupValue) {
          skipped.push({
            reason: "missing_identifiers",
            update,
          });
          continue;
        }

        const targetIndex = findSocialPlannerEntryIndexForMetricsSync(
          state.entries,
          update,
        );
        if (targetIndex < 0) {
          notFound.push({
            entryId: update.entryId || "",
            externalPostId: update.externalPostId || "",
            accountId: update.accountId || "",
            platform: update.platform || "",
          });
          continue;
        }

        const entry = state.entries[targetIndex];
        const hasMetricsPatch =
          Object.keys(update.metricsPatch || {}).length > 0;
        const hasPublicationData = Boolean(
          update.accountId ||
            update.platform ||
            update.externalPostId ||
            update.externalMediaId ||
            update.externalUrl,
        );

        if (hasPublicationData) {
          upsertSocialPlannerEntryPublication(entry, update);
        } else if (hasMetricsPatch) {
          entry.metrics = mergeSocialPlannerMetrics(
            entry.metrics || {},
            update.metricsPatch,
          );
        }

        if (
          update.publishedAt &&
          (!entry.publishedAt || entry.publishedAt < update.publishedAt)
        ) {
          entry.publishedAt = update.publishedAt;
        }
        entry.updatedAt = new Date().toISOString();
        if (hasMetricsPatch) {
          entry.lastError = "";
        }

        state.entries[targetIndex] = normalizeSocialPlannerEntry(
          entry,
          workspaceIds,
          accountIds,
        );
        updatedEntries.push({
          id: state.entries[targetIndex].id,
          title: state.entries[targetIndex].title,
          metrics: state.entries[targetIndex].metrics,
        });
      }

      if (updatedEntries.length > 0) {
        await saveSocialPlannerState(state);
      }

      res.json({
        success: true,
        secured: auth.secured,
        processed: updates.length,
        updated: updatedEntries.length,
        updatedEntries,
        notFound,
        skipped,
      });
    } catch (error) {
      console.error("[Social Planner] Metrics sync failed:", error);
      res.status(500).json({
        success: false,
        error: "Kunne ikke synkronisere metrics.",
        details: error.message,
      });
    }
  },
);

function buildSocialAutopostPayload() {
  return serverFeatures.buildSocialAutopostPayload.apply(this, arguments);
}

app.post("/api/social/autopost", async (req, res) => {
  try {
    const incomingPost =
      req.body?.post && typeof req.body.post === "object"
        ? req.body.post
        : req.body;
    const title = String(incomingPost?.title || "").trim();
    if (!title) {
      return res.status(400).json({ error: "Post title is required" });
    }

    const payload = buildSocialAutopostPayload(incomingPost, req);
    const webhookResult = await postPayloadToSocialWebhook(payload, {
      userAgent: "tk-design-social-autopost",
    });

    if (!webhookResult.sent) {
      const statusCode = Number.isFinite(webhookResult.httpStatus)
        ? webhookResult.httpStatus
        : 500;
      return res.status(statusCode).json({
        sent: false,
        error: webhookResult.error || "Social webhook failed",
        code: webhookResult.code || "social_webhook_error",
        details: webhookResult.details || "",
      });
    }

    return res.status(200).json({ sent: true, code: "ok" });
  } catch (error) {
    console.error("Social auto-post error:", error);
    return res.status(500).json({
      sent: false,
      error: "Failed to trigger social auto-post",
      details: error.message,
    });
  }
});

// API: Speed Test Report Email
app.post(
  "/api/speed-test/report-email",
  emailReportLimiter,
  async (req, res) => {
    try {
      const reportPayload = normalizeSpeedTestReportPayload(req.body?.report);
      const recipientEmailResult = normalizeSpeedTestRecipientEmail(
        req.body?.recipientEmail,
      );

      if (!reportPayload) {
        return res.status(400).json({
          success: false,
          code: "invalid_report_payload",
          error: "Rapporten mangler data. Kjør testen på nytt og prøv igjen.",
        });
      }

      if (!recipientEmailResult.valid) {
        return res.status(400).json({
          success: false,
          code: recipientEmailResult.code,
          error: recipientEmailResult.error,
        });
      }

      const notificationResult = await sendSpeedTestReportNotification(
        reportPayload,
        recipientEmailResult.value,
        req,
      );

      if (!notificationResult.sent) {
        return res.status(503).json({
          success: false,
          code: "missing_email_config",
          error: "E-postutsending er ikke konfigurert på serveren ennå.",
          details: notificationResult.reason || "",
        });
      }

      return res.status(200).json({
        success: true,
        sent: true,
      });
    } catch (error) {
      console.error("Speed test report email error:", error);
      return res.status(500).json({
        success: false,
        code: "report_email_failed",
        error: "Kunne ikke sende rapporten på e-post akkurat nå.",
        details: error.message,
      });
    }
  },
);

// API: Contact Form
app.post("/api/contact", contactFormLimiter, async (req, res) => {
  console.log("--- CONTACT FORM SUBMISSION START ---");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  try {
    const {
      name = "",
      email = "",
      phone = "",
      company = "",
      subject = "",
      message = "",
      consent = false,
      website = "",
      sourcePage = "contact.html",
    } = req.body || {};

    // Honeypot field
    if (String(website).trim()) {
      return res.status(200).json({
        success: true,
        ignored: true,
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();
    const cleanCompany = String(company).trim();
    const cleanSubject = String(subject).trim();
    const cleanMessage = String(message).trim();
    const cleanSourcePage = String(sourcePage).trim() || "contact.html";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({
        success: false,
        error: "Navn, e-post og melding er påkrevd.",
      });
    }

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: "E-postadressen er ikke gyldig.",
      });
    }

    if (!consent) {
      return res.status(400).json({
        success: false,
        error: "Du må godkjenne at vi kan lagre henvendelsen din.",
      });
    }

    const payload = {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || null,
      company: cleanCompany || null,
      subject: cleanSubject || null,
      message: cleanMessage,
      consent: true,
      source_page: cleanSourcePage,
      status: "new",
      ip_address:
        (
          req.headers["x-forwarded-for"] ||
          (req.socket && req.socket.remoteAddress) ||
          ""
        )
          .toString()
          .split(",")[0]
          .trim() || null,
      user_agent: req.get("user-agent") || null,
    };

    let saved = false;
    let savedMessage = null;
    let saveWarning = null;
    let emailSent = false;
    let emailWarning = null;

    try {
      const notificationResult = await sendContactNotification(payload);
      emailSent = !!notificationResult.sent;
      if (!notificationResult.sent) {
        emailWarning =
          notificationResult.reason || "E-postvarsel ble ikke sendt.";
      }
    } catch (emailError) {
      console.error("Contact email notification error:", emailError);
      emailWarning = "E-postvarsel feilet.";
    }

    try {
      // Setting a timeout for the save operation so it doesn't hang indefinitely
      const savePromise = saveContactMessage(payload);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firebase save timeout")), 5000),
      );
      savedMessage = await Promise.race([savePromise, timeoutPromise]);
      saved = true;
    } catch (saveError) {
      console.error("Contact message save error:", saveError);
      saveWarning = "Meldingen kunne ikke lagres i dashboardet.";
    }

    if (!saved && !emailSent) {
      return res.status(500).json({
        success: false,
        error: "Kunne ikke levere kontaktskjemaet.",
        details:
          [saveWarning, emailWarning].filter(Boolean).join(" ") ||
          "Lagring og e-post feilet.",
      });
    }

    res.status(saved ? 201 : 202).json({
      success: true,
      saved,
      saveWarning,
      emailSent,
      emailWarning,
      id: savedMessage && savedMessage.id ? savedMessage.id : null,
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    console.error("Error details:", error.message);
    res.status(500).json({
      success: false,
      error: "Kunne ikke sende kontaktskjemaet.",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

app.get("/js/firebase-config.js", async (req, res) => {
  try {
    const config = await getCachedFirebaseWebAppConfig();
    res.type("application/javascript");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(
      `window.__TK_FIREBASE_CONFIG__ = ${JSON.stringify(config, null, 4)};\nwindow.__TK_FIREBASE_CONFIG_ERROR__ = null;`,
    );
  } catch (error) {
    const fallbackConfig = getFirebaseWebConfig();
    res.type("application/javascript");
    res.setHeader("Cache-Control", "no-store");
    res.send(
      `window.__TK_FIREBASE_CONFIG__ = ${JSON.stringify(fallbackConfig, null, 4)};\nwindow.__TK_FIREBASE_CONFIG_ERROR__ = ${JSON.stringify(hasUsableFirebaseWebConfig(fallbackConfig) ? null : error.message)};`,
    );
  }
});

function proxyFirebaseAuthHelper() {
  return serverFeatures.proxyFirebaseAuthHelper.apply(this, arguments);
}

app.get(/^\/__\/auth\/.*$/, async (req, res) => {
  try {
    await proxyFirebaseAuthHelper(req, res);
  } catch (error) {
    console.error("Firebase auth helper proxy error:", error);
    res.status(502).send("Firebase auth helper proxy failed.");
  }
});

app.get(/^\/__\/firebase\/.*$/, async (req, res) => {
  try {
    await proxyFirebaseAuthHelper(req, res);
  } catch (error) {
    console.error("Firebase firebase-helper proxy error:", error);
    res.status(502).send("Firebase helper proxy failed.");
  }
});

// Clean URLs – redirect .html → uten .html og server filene
// Forside: /index.html → /
app.get("/index.html", (req, res) => {
  const hash = req.query["#"] || "";
  res.redirect(301, "/" + (hash ? "#" + hash : ""));
});
const htmlPages = [
  "blog",
  "ki-forordninger",
  "blog-details",
  "contact",
  "project-details",
  "service-details",
  "privacy",
  "accessibility",
  "grafisk",
];

htmlPages.forEach((page) => {
  // Redirect /page.html → /page
  app.get(`/${page}.html`, (req, res) => {
    const qs = Object.keys(req.query).length
      ? "?" + new URLSearchParams(req.query).toString()
      : "";
    res.redirect(301, `/${page}${qs}`);
  });
  // Serve /page → file
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `${page}.html`));
  });
});

// Admin clean URL + single source of truth from public/admin
const adminPublicDir = path.join(__dirname, "public", "admin");
app.get("/admin/index.html", (req, res) => res.redirect(301, "/admin/"));
app.get("/admin/", (req, res) =>
  res.sendFile(path.join(adminPublicDir, "index.html")),
);
app.get("/admin", (req, res) => res.redirect(301, "/admin/"));
app.use("/admin", express.static(adminPublicDir));
app.get("/public/admin", (req, res) => res.redirect(301, "/admin/"));
app.get("/public/admin/", (req, res) => res.redirect(301, "/admin/"));
app.get("/public/admin/index.html", (req, res) => res.redirect(301, "/admin/"));
app.get("/public/admin/login.html", (req, res) =>
  res.redirect(301, "/admin/login.html"),
);

// SEO: Serve sitemap and robots.txt with correct content-type
app.get("/sitemap.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(path.join(__dirname, "sitemap.xml"));
});

app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(path.join(__dirname, "robots.txt"));
});

app.get("/llms.txt", (req, res) => {
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(path.join(__dirname, "llms.txt"));
});

// PWA: Serve manifest and service worker with correct headers
app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/manifest+json");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.sendFile(path.join(__dirname, "manifest.json"));
});

app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(__dirname, "sw.js"));
});

// Visittkort PKPass download
app.get(
  ["/visittkort/TK-design.pkpass", "/visittkort/visittkort.pkpass"],
  (req, res) => {
    res.setHeader("Content-Type", "application/vnd.apple.pkpass");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.join(__dirname, "visittkort", "TK-design.pkpass"));
  },
);

// Visittkort assets root fallback
app.get(
  ["/assets/thomas-knutsen.jpg", "/assets/logo.png", "/assets/logo.webp"],
  (req, res) => {
    const filename = path.basename(req.path);
    res.sendFile(path.join(__dirname, "visittkort", "assets", filename));
  },
);

// Visittkort static assets
app.use("/visittkort", express.static(path.join(__dirname, "visittkort")));

// Static Files (as fallback)
app.use(express.static(path.join(__dirname)));

if (require.main === module) {
  app.listen(PORT, () => {
    logContactPipelineConfig();
    const schedulerStartup = startSocialPlannerSchedulerLoop();
    console.log(`CMS Server running at http://localhost:${PORT}`);
    console.log(`Admin Panel available at http://localhost:${PORT}/admin`);
    if (schedulerStartup.enabled) {
      if (schedulerStartup.started) {
        console.log(
          `[Social Planner] Scheduler aktiv: ${schedulerStartup.intervalMs} ms intervall.`,
        );
      } else {
        console.log("[Social Planner] Scheduler var allerede aktiv.");
      }
    } else {
      console.log(
        "[Social Planner] Scheduler er deaktivert via SOCIAL_PLANNER_SCHEDULER_ENABLED=false.",
      );
    }
  });
}

module.exports = app;
module.exports.api = functions.https.onRequest(app);
