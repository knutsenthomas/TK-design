// site data. Dependencies are resolved when an operation runs.
module.exports = function createFeature(context) {
  return {
    getFetch(...args) {
      return async function getFetch() {
        if (typeof globalThis.fetch === "function") {
          return globalThis.fetch.bind(globalThis);
        }

        try {
          const requiredFetch = require("node-fetch");
          if (typeof requiredFetch === "function") {
            return requiredFetch;
          }
          if (requiredFetch && typeof requiredFetch.default === "function") {
            return requiredFetch.default;
          }
        } catch (error) {
          // Fallback to dynamic import below.
        }

        const fetchModule = await import("node-fetch");
        return fetchModule.default;
      }.apply(this, args);
    },

    escapeRegExp(...args) {
      return function escapeRegExp(value = "") {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }.apply(this, args);
    },

    getCustomStyleHref(...args) {
      const { fs, getAdminCustomStyleFilePath } = context;
      return function getCustomStyleHref() {
        const basePath = "/custom-style.css";
        try {
          const stat = fs.statSync(getAdminCustomStyleFilePath());
          const version = Math.floor(stat.mtimeMs);
          return `${basePath}?v=${version}`;
        } catch (error) {
          return basePath;
        }
      }.apply(this, args);
    },

    toBase64Url(...args) {
      return function toBase64Url(input) {
        const base64 = Buffer.isBuffer(input)
          ? input.toString("base64")
          : Buffer.from(String(input)).toString("base64");

        return base64
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/g, "");
      }.apply(this, args);
    },

    createGoogleAccessJwt(...args) {
      const { toBase64Url, crypto } = context;
      return function createGoogleAccessJwt(clientEmail, privateKey, scope) {
        const issuedAt = Math.floor(Date.now() / 1000);
        const expiresAt = issuedAt + 3600;
        const header = {
          alg: "RS256",
          typ: "JWT",
        };
        const payload = {
          iss: clientEmail,
          sub: clientEmail,
          aud: "https://oauth2.googleapis.com/token",
          scope,
          iat: issuedAt,
          exp: expiresAt,
        };
        const unsignedToken = `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}`;
        const signature = crypto.sign(
          "RSA-SHA256",
          Buffer.from(unsignedToken),
          privateKey,
        );

        return {
          token: `${unsignedToken}.${toBase64Url(signature)}`,
          expiresAt,
        };
      }.apply(this, args);
    },

    isVercelRuntime(...args) {
      return function isVercelRuntime() {
        return Boolean(process.env.VERCEL);
      }.apply(this, args);
    },

    readSiteJsonDocument(...args) {
      const {
        readFirestoreDocument,
        getFirebaseSiteDataCollection,
        readFirestoreStringField,
      } = context;
      return async function readSiteJsonDocument(documentId) {
        const document = await readFirestoreDocument(
          getFirebaseSiteDataCollection(),
          documentId,
        );
        if (!document) {
          return null;
        }

        const rawJson = readFirestoreStringField(document, "json");
        if (!rawJson) {
          return null;
        }

        return JSON.parse(rawJson);
      }.apply(this, args);
    },

    writeSiteJsonDocument(...args) {
      const { upsertFirestoreDocument, getFirebaseSiteDataCollection } =
        context;
      return async function writeSiteJsonDocument(documentId, payload) {
        return upsertFirestoreDocument(
          getFirebaseSiteDataCollection(),
          documentId,
          {
            json: JSON.stringify(payload),
          },
        );
      }.apply(this, args);
    },

    readSiteTextDocument(...args) {
      const {
        readFirestoreDocument,
        getFirebaseSiteDataCollection,
        readFirestoreStringField,
      } = context;
      return async function readSiteTextDocument(
        documentId,
        fieldName = "cssText",
      ) {
        const document = await readFirestoreDocument(
          getFirebaseSiteDataCollection(),
          documentId,
        );
        if (!document) {
          return null;
        }

        return readFirestoreStringField(document, fieldName) || null;
      }.apply(this, args);
    },

    writeSiteTextDocument(...args) {
      const { upsertFirestoreDocument, getFirebaseSiteDataCollection } =
        context;
      return async function writeSiteTextDocument(
        documentId,
        text,
        fieldName = "cssText",
      ) {
        return upsertFirestoreDocument(
          getFirebaseSiteDataCollection(),
          documentId,
          {
            [fieldName]: text,
          },
        );
      }.apply(this, args);
    },

    readSiteDataWithFallback(...args) {
      const {
        readFirestorePostsCollection,
        hasFirebaseServerCredentials,
        readSiteJsonDocument,
        getCleanPostSlug,
        siteDataCache,
      } = context;
      return async function readSiteDataWithFallback(
        documentId,
        fallbackReader,
      ) {
        if (documentId === "posts") {
          const firestoreCollectionPosts = await readFirestorePostsCollection();
          let firestoreAdminPosts = null;
          if (hasFirebaseServerCredentials()) {
            try {
              firestoreAdminPosts = await readSiteJsonDocument("posts");
            } catch (e) {}
          }
          let fallbackPosts = [];
          try {
            fallbackPosts = await fallbackReader();
          } catch (err) {}

          const adminMap = new Map();
          (firestoreAdminPosts || []).forEach((p) => {
            if (!p) return;
            const id = String(p.id || "");
            const slug = getCleanPostSlug(p);
            if (id) adminMap.set(id, p);
            if (slug) adminMap.set(slug, p);
          });
          (fallbackPosts || []).forEach((p) => {
            if (!p) return;
            const id = String(p.id || "");
            const slug = getCleanPostSlug(p);
            const existing =
              (id && adminMap.get(id)) || (slug && adminMap.get(slug));
            if (!existing) {
              if (id) adminMap.set(id, p);
              if (slug) adminMap.set(slug, p);
            } else {
              const merged = {
                ...existing,
                ...p,
                content:
                  p.content &&
                  p.content.length > (existing.content || "").length
                    ? p.content
                    : existing.content || p.content,
                excerpt:
                  p.excerpt &&
                  p.excerpt.length > (existing.excerpt || "").length
                    ? p.excerpt
                    : existing.excerpt || p.excerpt,
                seoDesc:
                  p.seoDesc &&
                  p.seoDesc.length > (existing.seoDesc || "").length
                    ? p.seoDesc
                    : existing.seoDesc || p.seoDesc,
              };
              if (id) adminMap.set(id, merged);
              if (slug) adminMap.set(slug, merged);
            }
          });

          const allBasePosts = [...(fallbackPosts || [])];
          (firestoreAdminPosts || []).forEach((p) => {
            const pSlug = getCleanPostSlug(p);
            const pId = String(p.id || "");
            if (
              !allBasePosts.some(
                (lp) =>
                  (pId && String(lp.id) === pId) ||
                  (pSlug && getCleanPostSlug(lp) === pSlug),
              )
            ) {
              allBasePosts.push(p);
            }
          });

          const combined = firestoreCollectionPosts.map((sPost) => {
            const sSlug = getCleanPostSlug(sPost);
            const matchedAdmin =
              (sSlug && adminMap.get(sSlug)) ||
              (sPost.id && adminMap.get(String(sPost.id)));
            if (matchedAdmin) {
              return {
                ...matchedAdmin,
                ...sPost,
                content:
                  matchedAdmin.content &&
                  matchedAdmin.content.length > (sPost.content || "").length
                    ? matchedAdmin.content
                    : sPost.content || matchedAdmin.content,
                titleEn: sPost.titleEn || matchedAdmin.titleEn,
                contentEn: sPost.contentEn || matchedAdmin.contentEn,
                summaryEn:
                  sPost.summaryEn ||
                  matchedAdmin.summaryEn ||
                  matchedAdmin.excerptEn,
                excerptEn: sPost.excerptEn || matchedAdmin.excerptEn,
                categoryEn: sPost.categoryEn || matchedAdmin.categoryEn,
                seoTitleEn: sPost.seoTitleEn || matchedAdmin.seoTitleEn,
                seoDescEn: sPost.seoDescEn || matchedAdmin.seoDescEn,
                seoKeywordsEn:
                  sPost.seoKeywordsEn || matchedAdmin.seoKeywordsEn,
                detailSummaryEn:
                  sPost.detailSummaryEn || matchedAdmin.detailSummaryEn,
                detailOutlineEn:
                  sPost.detailOutlineEn || matchedAdmin.detailOutlineEn,
              };
            }
            return sPost;
          });

          const existingIds = new Set(
            combined.map((p) => String(p.id)).filter(Boolean),
          );
          const existingSlugs = new Set(
            combined.map(getCleanPostSlug).filter(Boolean),
          );

          for (const p of allBasePosts) {
            const pSlug = getCleanPostSlug(p);
            const pId = String(p.id || "");
            const hasId = pId && existingIds.has(pId);
            const hasSlug = pSlug && existingSlugs.has(pSlug);
            if (p && !hasId && !hasSlug) {
              const resolved =
                (pId && adminMap.get(pId)) ||
                (pSlug && adminMap.get(pSlug)) ||
                p;
              combined.push(resolved);
              if (pId) existingIds.add(pId);
              if (pSlug) existingSlugs.add(pSlug);
            }
          }
          return combined;
        }

        if (siteDataCache.has(documentId)) {
          return siteDataCache.get(documentId);
        }

        const fetchPromise = (async () => {
          if (hasFirebaseServerCredentials()) {
            try {
              const firebaseValue = await readSiteJsonDocument(documentId);
              if (firebaseValue !== null) {
                return firebaseValue;
              }
            } catch (error) {
              console.error(
                `Failed to read ${documentId} from Firebase:`,
                error.message,
              );
            }
          }
          return fallbackReader();
        })();

        siteDataCache.set(documentId, fetchPromise);

        fetchPromise.catch(() => {
          siteDataCache.delete(documentId);
        });

        return fetchPromise;
      }.apply(this, args);
    },

    persistSiteData(...args) {
      const {
        isVercelRuntime,
        hasFirebaseServerCredentials,
        writeSiteJsonDocument,
        siteDataCache,
      } = context;
      return async function persistSiteData(documentId, payload, localWriter) {
        let savedToFirebase = false;
        let savedToFile = false;
        let lastError = null;

        if (isVercelRuntime() && !hasFirebaseServerCredentials()) {
          throw new Error(
            "TK_FIREBASE_CLIENT_EMAIL og/eller TK_FIREBASE_PRIVATE_KEY mangler i Vercel-miljøet.",
          );
        }

        if (hasFirebaseServerCredentials()) {
          try {
            await writeSiteJsonDocument(documentId, payload);
            savedToFirebase = true;
          } catch (error) {
            console.error(
              `Failed to save ${documentId} to Firebase:`,
              error.message,
            );
            lastError = error;
          }
        }

        if (!isVercelRuntime()) {
          try {
            localWriter(payload);
            savedToFile = true;
          } catch (error) {
            console.error(
              `Failed to save ${documentId} to file:`,
              error.message,
            );
            lastError = error;
          }
        }

        if (!savedToFirebase && !savedToFile) {
          throw lastError || new Error(`Could not persist ${documentId}`);
        }

        // Update in-memory cache directly with new resolved payload
        siteDataCache.set(documentId, Promise.resolve(payload));

        return { savedToFirebase, savedToFile };
      }.apply(this, args);
    },

    readStyleCssWithFallback(...args) {
      const {
        siteDataCache,
        hasFirebaseServerCredentials,
        readSiteTextDocument,
      } = context;
      return async function readStyleCssWithFallback(fallbackReader) {
        const cacheKey = "style_css";
        if (siteDataCache.has(cacheKey)) {
          return siteDataCache.get(cacheKey);
        }

        const fetchPromise = (async () => {
          if (hasFirebaseServerCredentials()) {
            try {
              const cssText = await readSiteTextDocument("style");
              if (cssText !== null) {
                return cssText;
              }
            } catch (error) {
              console.error(
                "Failed to read style from Firebase:",
                error.message,
              );
            }
          }
          return fallbackReader();
        })();

        siteDataCache.set(cacheKey, fetchPromise);

        fetchPromise.catch(() => {
          siteDataCache.delete(cacheKey);
        });

        return fetchPromise;
      }.apply(this, args);
    },

    persistStyleCss(...args) {
      const {
        isVercelRuntime,
        hasFirebaseServerCredentials,
        writeSiteTextDocument,
        siteDataCache,
      } = context;
      return async function persistStyleCss(cssText, localWriter) {
        let savedToFirebase = false;
        let savedToFile = false;
        let lastError = null;

        if (isVercelRuntime() && !hasFirebaseServerCredentials()) {
          throw new Error(
            "TK_FIREBASE_CLIENT_EMAIL og/eller TK_FIREBASE_PRIVATE_KEY mangler i Vercel-miljøet.",
          );
        }

        if (hasFirebaseServerCredentials()) {
          try {
            await writeSiteTextDocument("style", cssText);
            savedToFirebase = true;
          } catch (error) {
            console.error("Failed to save style to Firebase:", error.message);
            lastError = error;
          }
        }

        if (!isVercelRuntime()) {
          try {
            localWriter(cssText);
            savedToFile = true;
          } catch (error) {
            console.error("Failed to save style file:", error.message);
            lastError = error;
          }
        }

        if (!savedToFirebase && !savedToFile) {
          throw lastError || new Error("Could not persist style");
        }

        // Update in-memory cache directly
        siteDataCache.set("style_css", Promise.resolve(cssText));

        return { savedToFirebase, savedToFile };
      }.apply(this, args);
    },

    sendContactNotification(...args) {
      const { getFetch, escapeHtml } = context;
      return async function sendContactNotification(messagePayload) {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
          return {
            sent: false,
            reason: "RESEND_API_KEY mangler i .env",
          };
        }

        const toEmail =
          String(
            process.env.CONTACT_TO_EMAIL || "thomas@tk-design.no",
          ).trim() || "thomas@tk-design.no";
        const fromEmail =
          process.env.RESEND_FROM_EMAIL || "TK-design <onboarding@resend.dev>";
        const fetch = await getFetch();
        const safeSubject = messagePayload.subject
          ? `: ${messagePayload.subject}`
          : "";

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
        .wrapper { width: 100%; background-color: #f4f7f9; padding: 40px 0; }
        .main { background-color: #ffffff; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 8px; border: 1px solid #e1e8ed; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .header { background-color: #ffffff; padding: 40px 40px 20px 40px; text-align: center; border-bottom: 2px solid #f0f4f8; }
        .content { padding: 40px; text-align: center; color: #102a43; }
        .footer { padding: 30px; text-align: center; color: #627d98; font-size: 11px; border-top: 1px solid #f0f4f8; }
        .logo-img { width: 60px; height: auto; display: block; margin: 0 auto; }
        h1 { color: #102a43; font-size: 24px; margin: 25px 0 0 0; font-weight: bold; }
        .intro-text { font-size: 16px; color: #627d98; margin-bottom: 30px; }
        
        .info-card { background: #ffffff; border: 1px solid #e1e8ed; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 30px; }
        .info-row { border-bottom: 1px solid #f0f4f8; padding: 12px 0; margin: 0; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size: 11px; text-transform: uppercase; color: #9fb3c8; font-weight: bold; margin-bottom: 4px; display: block; }
        .info-value { font-size: 15px; color: #102a43; font-weight: 500; margin: 0; }
        
        .message-section { text-align: left; margin-top: 30px; }
        .message-title { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #9fb3c8; margin-bottom: 10px; }
        .message-body { background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6a1b; color: #334e68; line-height: 1.6; font-style: italic; white-space: pre-wrap; }
        
        .btn-container { margin: 40px 0 20px 0; }
        .button { background-color: #ff6a1b; color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 14px rgba(255, 106, 27, 0.3); }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main">
            <div class="header">
                <img src="https://tk-design.no/img/logo/d.png" alt="TK-design" class="logo-img">
                <h1>TK-design kontaktskjema</h1>
            </div>
            <div class="content">
                <p class="intro-text">Du har mottatt en ny henvendelse via kontaktskjemaet på nettsiden.</p>
                
                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">Navn</span>
                        <p class="info-value">${escapeHtml(messagePayload.name)}</p>
                    </div>
                    <div class="info-row">
                        <span class="info-label">E-post</span>
                        <p class="info-value">${escapeHtml(messagePayload.email)}</p>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Telefon</span>
                        <p class="info-value">${escapeHtml(messagePayload.phone || "Ikke oppgitt")}</p>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Bedrift / Firma</span>
                        <p class="info-value">${escapeHtml(messagePayload.company || "Ikke oppgitt")}</p>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Emne</span>
                        <p class="info-value">${escapeHtml(messagePayload.subject || "Ikke oppgitt")}</p>
                    </div>
                </div>

                <div class="message-section">
                    <div class="message-title">Melding</div>
                    <div class="message-body">${escapeHtml(messagePayload.message)}</div>
                </div>

                <div class="btn-container">
                    <a href="https://tk-design.no/admin" class="button">Gå til Innboks</a>
                </div>
            </div>
            <div class="footer">
                Dette er en automatisert melding fra TK-design.<br>
                &copy; 2026 TK-design. Alle rettigheter reservert.
            </div>
        </div>
    </div>
</body>
</html>
    `;

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [toEmail],
            reply_to: messagePayload.email,
            subject: `Ny henvendelse fra ${messagePayload.name}${safeSubject}`,
            html,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Resend request failed: ${response.status} ${errorText}`,
          );
        }

        const resendBody = await response.json();
        console.log("[Resend API Success Detais]:", resendBody);

        return { sent: true };
      }.apply(this, args);
    },

    logContactPipelineConfig(...args) {
      return function logContactPipelineConfig() {
        const hasResendApiKey = Boolean(
          String(process.env.RESEND_API_KEY || "").trim(),
        );
        const targetEmail =
          String(
            process.env.CONTACT_TO_EMAIL || "thomas@tk-design.no",
          ).trim() || "thomas@tk-design.no";

        if (!hasResendApiKey) {
          console.warn(
            "[contact] RESEND_API_KEY mangler. Kontaktskjema lagres, men e-postvarsel blir ikke sendt.",
          );
        } else {
          console.log(
            `[contact] E-postvarsel aktivert. Mottaker: ${targetEmail}`,
          );
        }
      }.apply(this, args);
    },

    getTranslationsFilePath(...args) {
      const { path, __dirname } = context;
      return function getTranslationsFilePath() {
        return path.join(__dirname, "translations.js");
      }.apply(this, args);
    },

    getLegacyContentFilePath(...args) {
      const { path, __dirname } = context;
      return function getLegacyContentFilePath() {
        return path.join(__dirname, "data/content.json");
      }.apply(this, args);
    },

    getPostsFilePath(...args) {
      const { path, __dirname } = context;
      return function getPostsFilePath() {
        return path.join(__dirname, "data/posts.json");
      }.apply(this, args);
    },

    getCommentsFilePath(...args) {
      const { path, __dirname } = context;
      return function getCommentsFilePath() {
        return path.join(__dirname, "data/comments.json");
      }.apply(this, args);
    },

    getAdminCustomStyleFilePath(...args) {
      const { path, __dirname } = context;
      return function getAdminCustomStyleFilePath() {
        return path.join(__dirname, "public", "admin", "custom-style.css");
      }.apply(this, args);
    },

    parseTranslationsSource(...args) {
      return function parseTranslationsSource(source) {
        const match = source.match(
          /const\s+translations\s*=\s*([\s\S]*?)\s*;\s*$/,
        );
        if (!match) {
          throw new Error("Could not parse translations.js");
        }

        return Function(`"use strict"; return (${match[1]});`)();
      }.apply(this, args);
    },

    readDashboardContent(...args) {
      const {
        getTranslationsFilePath,
        fs,
        parseTranslationsSource,
        getLegacyContentFilePath,
      } = context;
      return function readDashboardContent() {
        const translationsPath = getTranslationsFilePath();
        if (fs.existsSync(translationsPath)) {
          const source = fs.readFileSync(translationsPath, "utf8");
          return parseTranslationsSource(source);
        }

        const legacyPath = getLegacyContentFilePath();
        const legacySource = fs.readFileSync(legacyPath, "utf8");
        return JSON.parse(legacySource);
      }.apply(this, args);
    },

    serializeDashboardContent(...args) {
      return function serializeDashboardContent(content) {
        return `const translations = ${JSON.stringify(content, null, 4)};\n`;
      }.apply(this, args);
    },

    writeDashboardContent(...args) {
      const {
        serializeDashboardContent,
        fs,
        getTranslationsFilePath,
        getLegacyContentFilePath,
      } = context;
      return function writeDashboardContent(content) {
        const serializedTranslations = serializeDashboardContent(content);
        fs.writeFileSync(
          getTranslationsFilePath(),
          serializedTranslations,
          "utf8",
        );
        fs.writeFileSync(
          getLegacyContentFilePath(),
          JSON.stringify(content, null, 4),
          "utf8",
        );
      }.apply(this, args);
    },

    buildFallbackCommentId(...args) {
      const { crypto } = context;
      return function buildFallbackCommentId(postId, name, message, createdAt) {
        const digest = crypto
          .createHash("sha1")
          .update(`${postId}|${name}|${message}|${createdAt}`)
          .digest("hex")
          .slice(0, 12);
        return `legacy_${digest}`;
      }.apply(this, args);
    },

    normalizeCommentEntry(...args) {
      const { buildFallbackCommentId } = context;
      return function normalizeCommentEntry(value, fallbackPostId = null) {
        const postId = Number(value?.postId ?? fallbackPostId);
        if (!Number.isFinite(postId) || postId <= 0) {
          return null;
        }

        const name = String(value?.name || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 80);
        const message = String(value?.message || "")
          .replace(/\r\n/g, "\n")
          .trim()
          .slice(0, 2000);
        if (!name || !message) {
          return null;
        }

        const rawCreatedAt = String(value?.createdAt || "").trim();
        const createdAt = Number.isFinite(new Date(rawCreatedAt).getTime())
          ? new Date(rawCreatedAt).toISOString()
          : new Date().toISOString();

        const id =
          String(value?.id || "").trim() ||
          buildFallbackCommentId(postId, name, message, createdAt);

        return {
          id,
          postId,
          name,
          message,
          createdAt,
        };
      }.apply(this, args);
    },

    normalizeCommentsData(...args) {
      const { normalizeCommentEntry } = context;
      return function normalizeCommentsData(rawComments) {
        const normalized = {};

        function assignComment(value, fallbackPostId = null) {
          const comment = normalizeCommentEntry(value, fallbackPostId);
          if (!comment) return;

          const postKey = String(comment.postId);
          if (!Array.isArray(normalized[postKey])) {
            normalized[postKey] = [];
          }
          normalized[postKey].push(comment);
        }

        if (Array.isArray(rawComments)) {
          rawComments.forEach((comment) => assignComment(comment));
        } else if (rawComments && typeof rawComments === "object") {
          for (const [postKey, comments] of Object.entries(rawComments)) {
            if (!Array.isArray(comments)) continue;
            comments.forEach((comment) => assignComment(comment, postKey));
          }
        }

        for (const [postKey, comments] of Object.entries(normalized)) {
          comments.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          );
          const deduplicated = [];
          const seenIds = new Set();
          comments.forEach((comment) => {
            if (seenIds.has(comment.id)) return;
            seenIds.add(comment.id);
            deduplicated.push(comment);
          });
          normalized[postKey] = deduplicated;
        }

        return normalized;
      }.apply(this, args);
    },

    readBlogComments(...args) {
      const { getCommentsFilePath, fs, normalizeCommentsData } = context;
      return function readBlogComments() {
        const commentsPath = getCommentsFilePath();
        if (!fs.existsSync(commentsPath)) {
          return {};
        }

        const rawData = JSON.parse(fs.readFileSync(commentsPath, "utf8"));
        return normalizeCommentsData(rawData);
      }.apply(this, args);
    },

    writeBlogComments(...args) {
      const { normalizeCommentsData, fs, getCommentsFilePath } = context;
      return function writeBlogComments(commentsData) {
        const normalizedComments = normalizeCommentsData(commentsData);
        fs.writeFileSync(
          getCommentsFilePath(),
          JSON.stringify(normalizedComments, null, 4),
          "utf8",
        );
      }.apply(this, args);
    },

    normalizeIsoDateTime(...args) {
      return function normalizeIsoDateTime(
        value,
        fallbackIso = new Date().toISOString(),
      ) {
        const candidate = String(value || "").trim();
        const parsed = new Date(candidate);
        if (!Number.isFinite(parsed.getTime())) {
          return String(fallbackIso || new Date().toISOString());
        }
        return parsed.toISOString();
      }.apply(this, args);
    },

    summarizeEntryEngagement(...args) {
      const { normalizeSocialPlannerMetrics } = context;
      return function summarizeEntryEngagement(entry) {
        const metrics = normalizeSocialPlannerMetrics(entry?.metrics || {});
        return (
          metrics.likes + metrics.comments + metrics.shares + metrics.clicks
        );
      }.apply(this, args);
    },

    readCustomStyleCss(...args) {
      const { fs, getAdminCustomStyleFilePath } = context;
      return function readCustomStyleCss() {
        if (!fs.existsSync(getAdminCustomStyleFilePath())) {
          return "";
        }

        return fs.readFileSync(getAdminCustomStyleFilePath(), "utf8");
      }.apply(this, args);
    },

    writeCustomStyleCss(...args) {
      const { fs, getAdminCustomStyleFilePath } = context;
      return function writeCustomStyleCss(cssText) {
        fs.writeFileSync(getAdminCustomStyleFilePath(), cssText, "utf8");
      }.apply(this, args);
    },

    normalizeAnalyticsPeriod(...args) {
      const { ANALYTICS_DATE_RANGE_ALIASES } = context;
      return function normalizeAnalyticsPeriod(period = "7d") {
        const raw = String(period || "")
          .trim()
          .toLowerCase();
        return ANALYTICS_DATE_RANGE_ALIASES[raw] || "7d";
      }.apply(this, args);
    },

    isValidIsoDateString(...args) {
      return function isValidIsoDateString(value = "") {
        const candidate = String(value || "").trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return false;
        const parsed = new Date(`${candidate}T12:00:00`);
        return (
          Number.isFinite(parsed.getTime()) &&
          parsed.toISOString().slice(0, 10) === candidate
        );
      }.apply(this, args);
    },

    renderServiceContent(...args) {
      const { SERVICE_ROUTE_KEYS, SERVICE_DETAILS_CONTENT, escapeHtml } =
        context;
      return function renderServiceContent(html, requestPath, lang) {
        const key = SERVICE_ROUTE_KEYS[requestPath] || "web_dev";
        const data =
          SERVICE_DETAILS_CONTENT[lang]?.[key] ||
          SERVICE_DETAILS_CONTENT.no[key];
        const values = {
          serviceBannerTitle: data.bannerTitle,
          serviceBannerSummary: data.summary,
          serviceDetailTag: data.tag,
          serviceDetailTitle: data.title,
          serviceDetailLead: data.lead,
          serviceDetailBody: data.body,
          serviceDeliverablesTitle: data.deliverablesTitle,
          servicePriceHighlight: data.priceTag,
          servicePrimaryCtaText: data.ctaText,
        };
        data.features.forEach((feature, index) => {
          values["serviceFeature" + (index + 1) + "Title"] = feature.title;
          values["serviceFeature" + (index + 1) + "Desc"] = feature.desc;
        });
        for (const [id, value] of Object.entries(values)) {
          const pattern = new RegExp(
            '(<([a-z][a-z0-9]*)\\b[^>]*\\bid="' +
              id +
              '"[^>]*>)[\\s\\S]*?(</\\2>)',
            "i",
          );
          html = html.replace(
            pattern,
            (_, open, tag, close) => open + escapeHtml(value || "") + close,
          );
        }
        let pillIndex = 0;
        html = html.replace(
          /(<div class="subpage-stat-pill">[\s\S]*?<span>)[\s\S]*?(<\/span>)/g,
          (_, open, close) =>
            open + escapeHtml(data.spotlightList[pillIndex++] || "") + close,
        );
        html = html.replace(/(<a\b[^>]*id="servicePrimaryCta"[^>]*>)/, (open) =>
          open.replace(
            /href="[^"]*"/,
            'href="' + escapeHtml(data.ctaLink) + '"',
          ),
        );
        const deliverables = data.deliverables
          .map(
            (item) =>
              '<div class="deliverable-item"><i class="fas fa-check-circle" aria-hidden="true"></i><div><strong>' +
              escapeHtml(item.title || item) +
              "</strong><p>" +
              escapeHtml(item.desc || "") +
              "</p></div></div>",
          )
          .join("");
        html = html.replace(
          /(<div class="deliverables-grid" id="serviceDeliverablesGrid">)[\s\S]*?(?=\s*<div style="margin-top: 24px; display: flex; justify-content: flex-end;)/,
          "$1" + deliverables + "</div>\n",
        );
        html = html.replace(
          '<section id="accountingCases" hidden>',
          '<section id="accountingCases"' +
            (key === "regnskap" ? "" : " hidden") +
            ">",
        );
        html = html.replace(
          /(<h2 id="accountingCasesTitle">)[\s\S]*?(<\/h2>)/,
          "$1" + escapeHtml(data.casesTitle || "") + "$2",
        );
        return html;
      }.apply(this, args);
    },

    inferMimeTypeFromFileName(...args) {
      const { path } = context;
      return function inferMimeTypeFromFileName(fileName = "") {
        const ext = path.extname(String(fileName || "").toLowerCase());
        if (ext === ".pdf") return "application/pdf";
        if (ext === ".png") return "image/png";
        if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
        if (ext === ".webp") return "image/webp";
        if (ext === ".gif") return "image/gif";
        if (ext === ".txt") return "text/plain";
        if (ext === ".md") return "text/markdown";
        return "application/octet-stream";
      }.apply(this, args);
    },

    sanitizeStoragePathSegment(...args) {
      return function sanitizeStoragePathSegment(segment = "") {
        return String(segment || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9._-]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      }.apply(this, args);
    },

    normalizeAdminStorageFolder(...args) {
      const { sanitizeStoragePathSegment } = context;
      return function normalizeAdminStorageFolder(folderName = "media") {
        const normalized = String(folderName || "")
          .split("/")
          .map((segment) => sanitizeStoragePathSegment(segment))
          .filter(Boolean)
          .join("/");

        return normalized || "media";
      }.apply(this, args);
    },

    buildAdminStorageObjectName(...args) {
      const {
        path,
        sanitizeStoragePathSegment,
        normalizeAdminStorageFolder,
        crypto,
      } = context;
      return function buildAdminStorageObjectName(
        folderName = "media",
        originalName = "file",
      ) {
        const extension = path
          .extname(String(originalName || "").toLowerCase())
          .replace(/^\./, "");
        const baseName = path.basename(
          String(originalName || "file"),
          extension ? `.${extension}` : "",
        );
        const safeBaseName = sanitizeStoragePathSegment(baseName) || "file";
        const safeExtension = sanitizeStoragePathSegment(extension);
        const suffix = safeExtension
          ? `${safeBaseName}.${safeExtension}`
          : safeBaseName;
        return `${normalizeAdminStorageFolder(folderName)}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${suffix}`;
      }.apply(this, args);
    },

    normalizeKeywordString(...args) {
      return function normalizeKeywordString(value = "") {
        if (Array.isArray(value)) {
          return value
            .map((item) => String(item || "").trim())
            .filter(Boolean)
            .join(", ");
        }

        return String(value || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .join(", ");
      }.apply(this, args);
    },

    normalizeOutlineList(...args) {
      return function normalizeOutlineList(value = [], maxItems = 6) {
        const source = Array.isArray(value)
          ? value
          : String(value || "").split("\n");
        return source
          .map((item) =>
            String(item || "")
              .replace(/^[\-*]\s*/, "")
              .replace(/\s+/g, " ")
              .trim(),
          )
          .filter(Boolean)
          .slice(0, maxItems);
      }.apply(this, args);
    },

    extractOutlineFallback(...args) {
      const { normalizeOutlineList } = context;
      return function extractOutlineFallback(text = "", maxItems = 3) {
        const normalizedText = String(text || "")
          .replace(/\s+/g, " ")
          .trim();
        if (!normalizedText) return [];
        const rawItems = normalizedText.split(/[.!?]\s+/);
        return normalizeOutlineList(rawItems, maxItems);
      }.apply(this, args);
    },

    truncateText(...args) {
      return function truncateText(text = "", maxLength = 160) {
        const normalized = String(text || "")
          .replace(/\s+/g, " ")
          .trim();
        if (!normalized) return "";
        if (normalized.length <= maxLength) return normalized;
        return `${normalized.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
      }.apply(this, args);
    },

    normalizeUnsplashQuery(...args) {
      return function normalizeUnsplashQuery(value = "") {
        return String(value || "")
          .replace(/\s+/g, " ")
          .trim();
      }.apply(this, args);
    },

    transliterateUnsplashQuery(...args) {
      const { normalizeUnsplashQuery } = context;
      return function transliterateUnsplashQuery(value = "") {
        const normalized = normalizeUnsplashQuery(value);
        return normalized.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
      }.apply(this, args);
    },

    buildUnsplashQueryVariants(...args) {
      const {
        normalizeUnsplashQuery,
        transliterateUnsplashQuery,
        UNSPLASH_QUERY_SYNONYMS,
      } = context;
      return function buildUnsplashQueryVariants(rawQuery = "") {
        const variants = [];
        const seen = new Set();
        const base = normalizeUnsplashQuery(rawQuery);

        const pushVariant = (candidate) => {
          const value = normalizeUnsplashQuery(candidate);
          const key = value.toLowerCase();
          if (!value || seen.has(key)) return;
          seen.add(key);
          variants.push(value);
        };

        pushVariant(base);

        const transliterated = transliterateUnsplashQuery(base);
        if (
          transliterated &&
          transliterated.toLowerCase() !== base.toLowerCase()
        ) {
          pushVariant(transliterated);
        }

        const tokens = base
          .split(/[\s,;|/]+/)
          .map((token) => token.trim())
          .filter((token) => token.length >= 2);

        if (tokens.length > 1) {
          pushVariant(tokens.slice(0, 3).join(" "));
        }

        const translatedTokens = tokens.map((token) => {
          const tokenKey = token.toLowerCase();
          return UNSPLASH_QUERY_SYNONYMS[tokenKey] || token;
        });

        if (translatedTokens.length) {
          pushVariant(translatedTokens.join(" "));
          if (translatedTokens.length > 1) {
            pushVariant(translatedTokens.slice(0, 3).join(" "));
          }
        }

        tokens.forEach((token) => pushVariant(token));
        translatedTokens.forEach((token) => pushVariant(token));

        return variants.slice(0, 6);
      }.apply(this, args);
    },

    fetchUnsplashSearchPage(...args) {
      return async function fetchUnsplashSearchPage({
        fetchImpl,
        accessKey,
        query,
        page,
        perPage,
      }) {
        const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
        const response = await fetchImpl(unsplashUrl, {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
            "Accept-Version": "v1",
            "User-Agent": "tk-design-studio",
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(
            `[Unsplash] API-feil (${response.status}) for query "${query}": ${errorBody}`,
          );
          throw new Error(
            `Unsplash API error: ${response.status} ${response.statusText}`,
          );
        }

        return response.json();
      }.apply(this, args);
    },

    getSiteBaseUrl(...args) {
      return function getSiteBaseUrl(req) {
        const publicHost = String(req.get("host") || "")
          .toLowerCase()
          .split(":")[0];
        if (["tk-design.no", "www.tk-design.no"].includes(publicHost))
          return "https://www.tk-design.no";
        const configured = String(process.env.SITE_URL || "")
          .trim()
          .replace(/\/+$/, "");
        if (configured) {
          return configured;
        }

        const forwardedHost = String(req.get("x-forwarded-host") || "")
          .split(",")[0]
          .trim();
        const directHost = String(req.get("host") || "").trim();
        const host = forwardedHost || directHost;

        if (!host) {
          return "";
        }

        const protocol = req.protocol || "https";
        return `${protocol}://${host}`;
      }.apply(this, args);
    },

    buildRelativePostUrl(...args) {
      const { normalizeBlogSlugPart } = context;
      return function buildRelativePostUrl(postId, title = "") {
        const numericId = Number(postId);
        const fallbackSlug =
          Number.isFinite(numericId) && numericId > 0
            ? `innlegg-${numericId}`
            : "innlegg";
        const slug = normalizeBlogSlugPart(title) || fallbackSlug;

        if (Number.isFinite(numericId) && numericId > 0) {
          return `/blog/${slug}-${numericId}`;
        }

        return `/blog/${slug}`;
      }.apply(this, args);
    },

    parsePostDateTimestamp(...args) {
      return function parsePostDateTimestamp(post) {
        if (!post) return 0;
        if (post.publishedAt) {
          const t = new Date(post.publishedAt).getTime();
          if (!isNaN(t) && t > 0) return t;
        }
        if (post.createdAt) {
          const t = new Date(post.createdAt).getTime();
          if (!isNaN(t) && t > 0) return t;
        }
        const dateStr = String(post.date || "").toLowerCase();
        if (!dateStr) return 0;

        const months = {
          jan: 0,
          januar: 0,
          feb: 1,
          februar: 1,
          mar: 2,
          mars: 2,
          apr: 3,
          april: 3,
          mai: 4,
          may: 4,
          jun: 5,
          juni: 5,
          jul: 6,
          juli: 6,
          aug: 7,
          august: 7,
          sep: 8,
          september: 8,
          okt: 9,
          oktober: 9,
          oct: 9,
          nov: 10,
          november: 10,
          des: 11,
          desember: 11,
          dec: 11,
        };

        const match = dateStr.match(/(\d{1,2})\.?\s+([a-zæøå]+)\.?\s+(\d{4})/i);
        if (match) {
          const day = parseInt(match[1], 10);
          const monthName = match[2].toLowerCase();
          const year = parseInt(match[3], 10);
          const month = months[monthName] ?? 0;
          return new Date(year, month, day).getTime();
        }

        const directDate = new Date(dateStr).getTime();
        return !isNaN(directDate) ? directDate : 0;
      }.apply(this, args);
    },

    resolveAbsolutePostUrl(...args) {
      const { getSiteBaseUrl, normalizeStoredBlogPostLink } = context;
      return function resolveAbsolutePostUrl(
        linkValue,
        req,
        fallbackPostId,
        fallbackTitle = "",
      ) {
        const siteBaseUrl = getSiteBaseUrl(req);
        const fallbackPath = normalizeStoredBlogPostLink(
          linkValue,
          fallbackPostId,
          fallbackTitle,
        );
        const candidate = fallbackPath || "/blog";

        try {
          if (/^https?:\/\//i.test(candidate)) {
            return candidate;
          }
          if (!siteBaseUrl) {
            return candidate.startsWith("/") ? candidate : `/${candidate}`;
          }
          return new URL(
            candidate.startsWith("/") ? candidate : `/${candidate}`,
            siteBaseUrl,
          ).toString();
        } catch (error) {
          return siteBaseUrl ? `${siteBaseUrl}${fallbackPath}` : fallbackPath;
        }
      }.apply(this, args);
    },

    resolveAbsoluteAssetUrl(...args) {
      const { getSiteBaseUrl } = context;
      return function resolveAbsoluteAssetUrl(assetValue, req) {
        const rawAsset = String(assetValue || "").trim();
        if (!rawAsset) return "";

        if (/^https?:\/\//i.test(rawAsset)) {
          return rawAsset;
        }

        if (/^\/\//.test(rawAsset)) {
          return `https:${rawAsset}`;
        }

        const siteBaseUrl = getSiteBaseUrl(req);
        const normalizedAsset = rawAsset.startsWith("/")
          ? rawAsset
          : `/${rawAsset}`;
        if (!siteBaseUrl) {
          return normalizedAsset;
        }

        try {
          return new URL(normalizedAsset, siteBaseUrl).toString();
        } catch (error) {
          return "";
        }
      }.apply(this, args);
    },

    normalizeHashtagToken(...args) {
      return function normalizeHashtagToken(value = "") {
        return String(value || "")
          .trim()
          .toLowerCase()
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, " ")
          .trim()
          .replace(/\s+/g, "");
      }.apply(this, args);
    },

    buildPostHashtags(...args) {
      const { normalizeHashtagToken } = context;
      return function buildPostHashtags(post = {}, maxTags = 6) {
        const sourceTags = Array.isArray(post.tags) ? post.tags : [];
        const sourceKeywords = String(post.seoKeywords || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
        const sourceCategories = Array.isArray(post.categories)
          ? post.categories
          : [post.category];

        const merged = [...sourceCategories, ...sourceTags, ...sourceKeywords];
        const uniqueTags = [];
        const seen = new Set();

        merged.forEach((entry) => {
          const token = normalizeHashtagToken(entry);
          if (!token || seen.has(token)) return;
          seen.add(token);
          uniqueTags.push(`#${token}`);
        });

        return uniqueTags.slice(0, maxTags);
      }.apply(this, args);
    },

    firstNonEmptyString(...args) {
      return function firstNonEmptyString(values = []) {
        for (const value of values) {
          const normalized = String(value || "").trim();
          if (normalized) {
            return normalized;
          }
        }
        return "";
      }.apply(this, args);
    },

    firstDefinedValue(...args) {
      return function firstDefinedValue(values = []) {
        for (const value of values) {
          if (value === 0 || value === "0") return value;
          if (value === false) return value;
          if (value === null || value === undefined) continue;
          if (typeof value === "string" && value.trim() === "") continue;
          return value;
        }
        return undefined;
      }.apply(this, args);
    },

    parseNonNegativeIntegerOrNull(...args) {
      return function parseNonNegativeIntegerOrNull(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === "string" && value.trim() === "") return null;
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
      }.apply(this, args);
    },

    resolveWebhookHost(...args) {
      return function resolveWebhookHost(webhookUrl = "") {
        try {
          return new URL(String(webhookUrl || "").trim()).host || "";
        } catch (error) {
          return "";
        }
      }.apply(this, args);
    },

    summarizeWebhookResponseBody(...args) {
      return function summarizeWebhookResponseBody(
        responseBody = "",
        limit = 180,
      ) {
        const normalized = String(responseBody || "")
          .replace(/\s+/g, " ")
          .trim();
        if (!normalized) return "";
        if (normalized.length <= limit) return normalized;
        return `${normalized.slice(0, Math.max(0, limit - 1)).trim()}…`;
      }.apply(this, args);
    },

    parseWebhookResponsePayload(...args) {
      return function parseWebhookResponsePayload(
        rawBody = "",
        contentType = "",
      ) {
        const body = String(rawBody || "").trim();
        if (!body) return null;
        const type = String(contentType || "").toLowerCase();
        const looksJson =
          type.includes("application/json") || /^[\[{]/.test(body);
        if (!looksJson) return null;
        try {
          return JSON.parse(body);
        } catch (error) {
          return null;
        }
      }.apply(this, args);
    },

    isWebhookPayloadExplicitFailure(...args) {
      return function isWebhookPayloadExplicitFailure(payload = null) {
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
          return false;
        }

        const hasFalseFlag = ["ok", "success", "sent", "published"].some(
          (key) => key in payload && payload[key] === false,
        );
        const hasErrorSignal = Boolean(
          payload.error ||
            (payload.details &&
              /error|failed|invalid|unauthorized|forbidden|denied/i.test(
                String(payload.details),
              )) ||
            (payload.message &&
              /error|failed|invalid|unauthorized|forbidden|denied/i.test(
                String(payload.message),
              )),
        );
        const hasErrorList =
          Array.isArray(payload.errors) && payload.errors.length > 0;

        return hasFalseFlag || hasErrorSignal || hasErrorList;
      }.apply(this, args);
    },

    parseBooleanFlag(...args) {
      return function parseBooleanFlag(value, fallback = false) {
        const normalized = String(value ?? "")
          .trim()
          .toLowerCase();
        if (!normalized) {
          return fallback;
        }
        if (["1", "true", "yes", "on"].includes(normalized)) {
          return true;
        }
        if (["0", "false", "no", "off"].includes(normalized)) {
          return false;
        }
        return fallback;
      }.apply(this, args);
    },

    safeCompareSecrets(...args) {
      const { crypto } = context;
      return function safeCompareSecrets(provided = "", expected = "") {
        const left = Buffer.from(String(provided || ""));
        const right = Buffer.from(String(expected || ""));
        if (left.length !== right.length || left.length === 0) return false;
        return crypto.timingSafeEqual(left, right);
      }.apply(this, args);
    },
  };
};
