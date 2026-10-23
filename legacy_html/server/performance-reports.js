// performance reports. Dependencies are resolved when an operation runs.
module.exports = function createFeature(context) {
  return {
    getPagespeedApiKey(...args) {
      return function getPagespeedApiKey() {
        return String(
          process.env.PAGESPEED_API_KEY ||
            process.env.GOOGLE_PAGESPEED_API_KEY ||
            process.env.PAGESPEEDONLINE_API_KEY ||
            process.env.VITE_PAGESPEED_API_KEY ||
            "",
        ).trim();
      }.apply(this, args);
    },

    normalizePagespeedUrl(...args) {
      const { PUBLIC_HOSTNAME_REGEX } = context;
      return function normalizePagespeedUrl(raw = "") {
        const trimmed = String(raw || "").trim();

        if (!trimmed) {
          const error = new Error("URL mangler.");
          error.code = "missing_url";
          throw error;
        }

        const withProtocol = /^https?:\/\//i.test(trimmed)
          ? trimmed
          : `https://${trimmed}`;
        let parsedUrl;

        try {
          parsedUrl = new URL(withProtocol);
        } catch (error) {
          const nextError = new Error("URL-en er ugyldig.");
          nextError.code = "invalid_url";
          throw nextError;
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          const error = new Error("Kun http og https er støttet.");
          error.code = "invalid_url";
          throw error;
        }

        const hostname = String(parsedUrl.hostname || "").replace(/\.$/, "");
        if (!PUBLIC_HOSTNAME_REGEX.test(hostname)) {
          const error = new Error("URL-en må være et offentlig domene.");
          error.code = "invalid_url";
          throw error;
        }

        parsedUrl.hash = "";
        return parsedUrl.toString();
      }.apply(this, args);
    },

    mapPagespeedUpstreamError(...args) {
      return function mapPagespeedUpstreamError(message = "", statusCode = 0) {
        const normalizedMessage = String(message || "");

        if (
          statusCode === 429 ||
          /quota exceeded|resource_exhausted|rate_limit_exceeded/i.test(
            normalizedMessage,
          )
        ) {
          return {
            httpStatus: 503,
            code: "quota_exceeded",
            error: "Google PageSpeed-kvoten er brukt opp akkurat nå.",
          };
        }

        if (
          /API_KEY_INVALID|API key not valid|key not valid/i.test(
            normalizedMessage,
          )
        ) {
          return {
            httpStatus: 503,
            code: "invalid_api_key",
            error: "Google PageSpeed API-nøkkelen er ugyldig.",
          };
        }

        if (
          /SERVICE_DISABLED|API has not been used|is not enabled|PERMISSION_DENIED/i.test(
            normalizedMessage,
          )
        ) {
          return {
            httpStatus: 503,
            code: "api_not_configured",
            error: "Google PageSpeed API er ikke aktivert for denne nøkkelen.",
          };
        }

        if (
          /INVALID_ARGUMENT|Unable to resolve host|Requested URL is not available|DNS|ERR_NAME_NOT_RESOLVED|could not resolve/i.test(
            normalizedMessage,
          )
        ) {
          return {
            httpStatus: 400,
            code: "invalid_url",
            error:
              "URL-en kunne ikke analyseres. Sjekk at domenet finnes og er offentlig tilgjengelig.",
          };
        }

        return {
          httpStatus: 502,
          code: "pagespeed_request_failed",
          error: "Kunne ikke hente Lighthouse-data fra Google akkurat nå.",
        };
      }.apply(this, args);
    },

    clampSpeedTestScore(...args) {
      return function clampSpeedTestScore(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
          return 0;
        }

        return Math.max(0, Math.min(100, Math.round(numeric)));
      }.apply(this, args);
    },

    normalizeSingleSpeedTestReport(...args) {
      const { clampSpeedTestScore } = context;
      return function normalizeSingleSpeedTestReport(payload) {
        if (!payload || typeof payload !== "object") {
          return null;
        }

        const analyzedUrl = String(payload.analyzedUrl || "").trim();
        const requestedUrl =
          String(payload.requestedUrl || "").trim() ||
          (analyzedUrl ? `https://${analyzedUrl}` : "");
        const summary = String(payload.summary || "").trim();
        const strategy = payload.strategy === "desktop" ? "desktop" : "mobile";
        const fetchedAtRaw = String(payload.fetchedAt || "").trim();
        let fetchedAt = null;

        if (fetchedAtRaw) {
          const parsedDate = new Date(fetchedAtRaw);
          if (!Number.isNaN(parsedDate.getTime())) {
            fetchedAt = parsedDate.toISOString();
          }
        }

        if (!analyzedUrl || !requestedUrl) {
          return null;
        }

        const scores = {
          performance: clampSpeedTestScore(payload.scores?.performance),
          accessibility: clampSpeedTestScore(payload.scores?.accessibility),
          bestPractices: clampSpeedTestScore(payload.scores?.bestPractices),
          seo: clampSpeedTestScore(payload.scores?.seo),
        };

        const metrics = Array.isArray(payload.metrics)
          ? payload.metrics
              .slice(0, 8)
              .map((metric) => {
                const label = String(metric?.label || "").trim();
                const title = String(metric?.title || "").trim();
                const value = String(metric?.value || "").trim();
                const description = String(metric?.description || "").trim();

                if (!label || !title || !value) {
                  return null;
                }

                return {
                  label: label.slice(0, 60),
                  title: title.slice(0, 120),
                  value: value.slice(0, 80),
                  description: description.slice(0, 240),
                };
              })
              .filter(Boolean)
          : [];

        const topFixes = Array.isArray(payload.topFixes)
          ? payload.topFixes
              .slice(0, 5)
              .map((fix) => {
                const title = String(fix?.title || "").trim();
                const description = String(fix?.description || "").trim();

                if (!title || !description) {
                  return null;
                }

                return {
                  title: title.slice(0, 120),
                  description: description.slice(0, 280),
                };
              })
              .filter(Boolean)
          : [];

        return {
          analyzedUrl: analyzedUrl.slice(0, 255),
          requestedUrl: requestedUrl.slice(0, 2048),
          strategy,
          fetchedAt,
          summary: summary.slice(0, 1200),
          scores,
          metrics,
          topFixes,
        };
      }.apply(this, args);
    },

    normalizeSpeedTestReportPayload(...args) {
      const { normalizeSingleSpeedTestReport } = context;
      return function normalizeSpeedTestReportPayload(payload = {}) {
        if (!payload || typeof payload !== "object") {
          return null;
        }

        // Check if we have both strategies
        if (payload.mobile || payload.desktop) {
          const mobile = normalizeSingleSpeedTestReport(payload.mobile);
          const desktop = normalizeSingleSpeedTestReport(payload.desktop);

          if (!mobile && !desktop) {
            return null;
          }

          return { mobile, desktop };
        }

        return normalizeSingleSpeedTestReport(payload);
      }.apply(this, args);
    },

    normalizeSpeedTestRecipientEmail(...args) {
      return function normalizeSpeedTestRecipientEmail(rawValue) {
        const normalizedEmail = String(rawValue || "")
          .trim()
          .toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!normalizedEmail) {
          return {
            valid: false,
            code: "missing_recipient_email",
            error: "Legg inn en e-postadresse før rapporten kan sendes.",
          };
        }

        if (!emailPattern.test(normalizedEmail)) {
          return {
            valid: false,
            code: "invalid_recipient_email",
            error: "E-postadressen er ikke gyldig.",
          };
        }

        return {
          valid: true,
          value: normalizedEmail,
        };
      }.apply(this, args);
    },

    formatSpeedTestTimestamp(...args) {
      return function formatSpeedTestTimestamp(timestamp) {
        if (!timestamp) {
          return "Ikke oppgitt";
        }

        try {
          return new Intl.DateTimeFormat("nb-NO", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Europe/Oslo",
          }).format(new Date(timestamp));
        } catch (error) {
          return timestamp;
        }
      }.apply(this, args);
    },

    getSpeedTestEmailScoreMeta(...args) {
      const { clampSpeedTestScore } = context;
      return function getSpeedTestEmailScoreMeta(score) {
        const numericScore = clampSpeedTestScore(score);

        if (numericScore >= 90) {
          return {
            label: "Sterk",
            accent: "#19b46b",
            soft: "#eefaf3",
            border: "#cdeedb",
          };
        }

        if (numericScore >= 50) {
          return {
            label: "Kan forbedres",
            accent: "#e38800",
            soft: "#fff7eb",
            border: "#f2dfbf",
          };
        }

        return {
          label: "Krever tiltak",
          accent: "#d04b2c",
          soft: "#fff1ee",
          border: "#f0d0c8",
        };
      }.apply(this, args);
    },

    getSpeedTestEmailOpening(...args) {
      const { clampSpeedTestScore } = context;
      return function getSpeedTestEmailOpening(reportPayload) {
        const performanceScore = clampSpeedTestScore(
          reportPayload?.scores?.performance,
        );
        const deviceLabel =
          reportPayload?.strategy === "desktop" ? "desktop" : "mobil";

        if (performanceScore >= 90) {
          return `Nettsiden leverer et sterkt førsteinntrykk på ${deviceLabel}. Rapporten under viser hva som allerede fungerer, og hva som fortsatt kan finjusteres.`;
        }

        if (performanceScore >= 50) {
          return `Nettsiden har et brukbart utgangspunkt på ${deviceLabel}, men det er fortsatt noen tydelige flaskehalser som bremser opplevelsen.`;
        }

        return `Rapporten viser at ${deviceLabel}-opplevelsen mister fart tidlig. Her er det ekstra viktig å prioritere førsteinntrykk, stabilitet og lastetid riktig.`;
      }.apply(this, args);
    },

    buildSingleSpeedTestReportEmailHtml(...args) {
      const {
        formatSpeedTestTimestamp,
        getSpeedTestEmailOpening,
        getSpeedTestEmailScoreMeta,
        escapeHtml,
      } = context;
      return function buildSingleSpeedTestReportEmailHtml(
        reportPayload,
        scoreDefinitions,
      ) {
        const deviceLabel =
          reportPayload.strategy === "desktop" ? "Desktop" : "Mobil";
        const fetchedLabel = formatSpeedTestTimestamp(reportPayload.fetchedAt);
        const summary =
          reportPayload.summary ||
          "Rapporten ble sendt fra speed-testen på tk-design.no.";
        const openingText = getSpeedTestEmailOpening(reportPayload);
        const primaryFix = reportPayload.topFixes[0] || null;

        const scoreRowsHtml = scoreDefinitions
          .map(({ key, label, description }) => {
            const meta = getSpeedTestEmailScoreMeta(reportPayload.scores[key]);
            return `
            <div class="score-card" style="border-color:${meta.border}; background:${meta.soft};">
                <span class="score-label">${escapeHtml(label)}</span>
                <strong class="score-value" style="color:${meta.accent};">${escapeHtml(reportPayload.scores[key])}</strong>
                <span class="score-badge" style="background:${meta.soft}; color:${meta.accent}; border-color:${meta.border};">${escapeHtml(meta.label)}</span>
                <p class="score-description">${escapeHtml(description)}</p>
            </div>
        `;
          })
          .join("");

        const metricRowsHtml =
          reportPayload.metrics.length > 0
            ? reportPayload.metrics
                .map(
                  (metric) => `
            <div class="metric-row">
                <div class="metric-head">
                    <span class="metric-label">${escapeHtml(metric.label)}</span>
                    <strong class="metric-value">${escapeHtml(metric.value)}</strong>
                </div>
                <p class="metric-title">${escapeHtml(metric.title)}</p>
                <p class="metric-description">${escapeHtml(metric.description)}</p>
            </div>
        `,
                )
                .join("")
            : '<p class="empty-copy">Ingen nøkkelmålinger fulgte med rapporten.</p>';

        const fixRowsHtml =
          reportPayload.topFixes.length > 0
            ? reportPayload.topFixes
                .map(
                  (fix, index) => `
            <div class="fix-row">
                <span class="fix-index">Prioritet ${index + 1}</span>
                <strong>${escapeHtml(fix.title)}</strong>
                <p>${escapeHtml(fix.description)}</p>
            </div>
        `,
                )
                .join("")
            : '<p class="empty-copy">Ingen konkrete tiltak fulgte med rapporten.</p>';

        return `
        <div class="report-block">
            <div class="device-header" style="margin-top: 32px; padding: 12px 18px; background: #f0f4f8; border-radius: 12px; border-left: 4px solid #102033;">
                <strong style="font-size: 18px; color: #102033;">${deviceLabel}-analyse</strong>
            </div>
            
            <div class="summary-box" style="margin-top: 18px; padding: 16px 18px; border: 1px solid #e5e9ef; border-radius: 18px; background: #fbfcfd;">
                <strong style="display: block; font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280;">Oppsummert (${deviceLabel})</strong>
                <p style="margin-top: 8px; color: #102033; font-size: 15px; line-height: 1.6;">${escapeHtml(summary)}</p>
            </div>

            <div class="section" style="margin-top: 28px;">
                <h2 style="margin: 0 0 12px; font-size: 20px; color: #102033;">Scoreoversikt (${deviceLabel})</h2>
                <div class="score-grid" style="display: grid; gap: 12px; grid-template-columns: repeat(4, minmax(0, 1fr));">
                    ${scoreRowsHtml}
                </div>
            </div>

            <div class="section" style="margin-top: 28px;">
                <h2 style="margin: 0 0 12px; font-size: 20px; color: #102033;">Nøkkelmålinger</h2>
                <div class="stack" style="display: grid; gap: 12px;">
                    ${metricRowsHtml}
                </div>
            </div>

            <div class="section" style="margin-top: 28px; margin-bottom: 32px;">
                <h2 style="margin: 0 0 12px; font-size: 20px; color: #102033;">Anbefalte tiltak</h2>
                <div class="stack" style="display: grid; gap: 12px;">
                    ${fixRowsHtml}
                </div>
            </div>
        </div>
    `;
      }.apply(this, args);
    },

    buildSingleSpeedTestReportEmailText(...args) {
      const { formatSpeedTestTimestamp, getSpeedTestEmailScoreMeta } = context;
      return function buildSingleSpeedTestReportEmailText(
        reportPayload,
        scoreDefinitions,
      ) {
        const deviceLabel =
          reportPayload.strategy === "desktop" ? "Desktop" : "Mobil";
        const fetchedLabel = formatSpeedTestTimestamp(reportPayload.fetchedAt);
        const summary =
          reportPayload.summary ||
          "Rapporten ble sendt fra speed-testen på tk-design.no.";

        return [
          `--- ${deviceLabel.toUpperCase()} RAPPORT ---`,
          `Kjørt: ${fetchedLabel}`,
          "",
          `Oppsummering: ${summary}`,
          "",
          "Scores:",
          ...scoreDefinitions.map(({ key, label }) => {
            const meta = getSpeedTestEmailScoreMeta(reportPayload.scores[key]);
            return `- ${label}: ${reportPayload.scores[key]} (${meta.label})`;
          }),
          "",
          "Nøkkelmålinger:",
          ...(reportPayload.metrics.length > 0
            ? reportPayload.metrics.map(
                (metric) =>
                  `- ${metric.label} ${metric.value}: ${metric.title}. ${metric.description}`,
              )
            : ["- Ingen nøkkelmålinger fulgte med rapporten."]),
          "",
          "Anbefalte tiltak:",
          ...(reportPayload.topFixes.length > 0
            ? reportPayload.topFixes.map(
                (fix, index) =>
                  `- Prioritet ${index + 1}: ${fix.title}. ${fix.description}`,
              )
            : ["- Ingen konkrete tiltak fulgte med rapporten."]),
          "",
        ].join("\n");
      }.apply(this, args);
    },

    buildSpeedTestReportEmailMarkup(...args) {
      const {
        getSiteBaseUrl,
        buildSingleSpeedTestReportEmailHtml,
        buildSingleSpeedTestReportEmailText,
        escapeHtml,
      } = context;
      return function buildSpeedTestReportEmailMarkup(reportPayload, req) {
        const siteBaseUrl = getSiteBaseUrl(req) || "https://tk-design.no";
        const reportPageUrl = `${siteBaseUrl.replace(/\/+$/, "")}/speed-test`;
        const contactPageUrl = `${siteBaseUrl.replace(/\/+$/, "")}/contact`;
        const scoreDefinitions = [
          {
            key: "performance",
            label: "Ytelse",
            description: "Hvor raskt brukeren faktisk ser og kan bruke siden.",
          },
          {
            key: "accessibility",
            label: "Tilgjengelighet",
            description: "Hvor lett siden er å forstå og bruke.",
          },
          {
            key: "bestPractices",
            label: "Beste praksis",
            description: "Teknisk kvalitet og trygghet.",
          },
          {
            key: "seo",
            label: "SEO",
            description: "Synlighet og tydelighet for søk.",
          },
        ];

        const isDual = !!(reportPayload.mobile && reportPayload.desktop);
        const mainReport = isDual ? reportPayload.mobile : reportPayload;
        const analyzedUrl = mainReport.analyzedUrl;
        const requestedUrl = mainReport.requestedUrl;

        let subject = `Speed-test rapport: ${analyzedUrl}`;
        if (isDual) {
          subject += " (Mobil + Desktop)";
        } else {
          subject += ` (${mainReport.strategy === "desktop" ? "Desktop" : "Mobil"})`;
        }

        let reportsHtml = "";
        let reportsText = "";

        if (isDual) {
          reportsHtml =
            buildSingleSpeedTestReportEmailHtml(
              reportPayload.mobile,
              scoreDefinitions,
            ) +
            '<hr style="border: 0; border-top: 1px solid #e5e9ef; margin: 40px 0;">' +
            buildSingleSpeedTestReportEmailHtml(
              reportPayload.desktop,
              scoreDefinitions,
            );
          reportsText =
            buildSingleSpeedTestReportEmailText(
              reportPayload.mobile,
              scoreDefinitions,
            ) +
            "\n\n" +
            buildSingleSpeedTestReportEmailText(
              reportPayload.desktop,
              scoreDefinitions,
            );
        } else {
          reportsHtml = buildSingleSpeedTestReportEmailHtml(
            reportPayload,
            scoreDefinitions,
          );
          reportsText = buildSingleSpeedTestReportEmailText(
            reportPayload,
            scoreDefinitions,
          );
        }

        const html = `
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; background: #f4f6f8; color: #102033; font-family: Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; padding: 32px 16px; background: #f4f6f8; }
        .card { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e9ef; border-radius: 24px; overflow: hidden; box-shadow: 0 22px 60px rgba(16, 32, 51, 0.10); }
        .header { padding: 36px 36px 20px; background: linear-gradient(135deg, #102033 0%, #173651 100%); color: #ffffff; }
        .header h1 { margin: 16px 0 0; font-size: 34px; line-height: 1.02; }
        .header h1 a { color: #9dd9e8 !important; text-decoration: underline; }
        .content { padding: 32px 36px 36px; }
        .score-grid { display: grid; gap: 12px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .score-card { padding: 16px; border: 1px solid #e5e9ef; border-radius: 18px; text-align: left; }
        .score-label { display: block; color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
        .score-value { display: block; margin-top: 10px; font-size: 32px; line-height: 1; }
        .score-badge { display: inline-block; margin-top: 10px; padding: 6px 10px; border: 1px solid #e5e9ef; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .score-description { margin-top: 12px !important; color: #5b6676; font-size: 13px !important; line-height: 1.6 !important; }
        .metric-row, .fix-row { padding: 16px 18px; border: 1px solid #e5e9ef; border-radius: 18px; background: #fbfcfd; }
        .metric-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .metric-label, .fix-index { color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
        .metric-value { color: #102033; font-size: 18px; }
        .metric-title, .fix-row strong { display: block; margin-top: 10px; color: #102033; font-size: 18px; }
        .metric-description, .fix-row p { margin-top: 8px; color: #5b6676; font-size: 14px; }
        .button { display: inline-block; margin-right: 10px; margin-bottom: 10px; padding: 15px 26px; border-radius: 999px; background: #102033; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; }
        .button-secondary { background: #f7f3ee; color: #102033 !important; border: 1px solid #d9e0e7; }
        @media (max-width: 640px) {
            .score-grid { grid-template-columns: 1fr 1fr; }
            .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                <span style="display: inline-block; padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;">Speed-test rapport</span>
                <h1><a href="${escapeHtml(requestedUrl)}">${escapeHtml(analyzedUrl)}</a></h1>
                <p style="margin: 14px 0 0; color: rgba(255,255,255,0.76); font-size: 16px; line-height: 1.6;">Her er resultatene fra analysen av din nettside.</p>
            </div>
            <div class="content">
                ${reportsHtml}
                <div class="cta-panel" style="margin-top: 36px; padding: 28px 24px; border: 2px solid #102033; border-radius: 22px; background: #ffffff; text-align: left;">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; background: rgba(255, 106, 27, 0.12); color: #ff6a1b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px;">Løs funnene permanent</span>
                    <h2 style="margin: 0; font-size: 22px; color: #102033; font-weight: 800;">Vil du at vi fikser disse funnene for deg?</h2>
                    <p style="margin: 10px 0 18px; color: #4b5563; font-size: 15px; line-height: 1.6;">Med en fast <strong>TK-design Supportavtale (fra kr 1 000,-/mnd)</strong> utbedrer vi bildekomprimering, fjerner render-blokkerende kode, forbedrer lastetid og mobilvennlighet og overvåker siden din kontinuerlig – helt uten bindingstid.</p>
                    <div style="margin-bottom: 18px;">
                        <a class="button" style="background: #ff6a1b; color: #ffffff !important; border: none; font-size: 15px; font-weight: 700; padding: 14px 26px; border-radius: 999px; text-decoration: none; display: inline-block; margin-right: 10px;" href="${escapeHtml(siteBaseUrl.replace(/\/+$/, ""))}/contact?service=support">Sikre min supportavtale (kr 1 000/mnd) &rarr;</a>
                        <a class="button button-secondary" style="font-size: 14px; font-weight: 600; padding: 14px 22px; border-radius: 999px; text-decoration: none; display: inline-block;" href="${escapeHtml(siteBaseUrl.replace(/\/+$/, ""))}/support-og-vedlikehold">Les om supportavtalen</a>
                    </div>
                    <div style="font-size: 13px; color: #6b7280; line-height: 1.5;">
                        &check; Ingen bindingstid &nbsp;&bull;&nbsp; &check; Lynrask feilretting &nbsp;&bull;&nbsp; &check; Ukentlige sikkerhetsoppdateringer
                    </div>
                </div>
                <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e9ef; color: #7b8794; font-size: 12px; text-align: center;">
                    Automatisk sendt fra speed-testen på tk-design.no.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;

        return { subject, html, text: reportsText };
      }.apply(this, args);
    },

    sendSpeedTestReportNotification(...args) {
      const { getFetch, buildSpeedTestReportEmailMarkup } = context;
      return async function sendSpeedTestReportNotification(
        reportPayload,
        recipientEmail,
        req,
      ) {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
          return {
            sent: false,
            reason: "RESEND_API_KEY mangler i .env",
          };
        }

        const toEmail = String(recipientEmail || "")
          .trim()
          .toLowerCase();
        const internalCopyEmail = String(process.env.CONTACT_TO_EMAIL || "")
          .trim()
          .toLowerCase();
        const fromEmail =
          process.env.RESEND_FROM_EMAIL || "TK-design <onboarding@resend.dev>";
        const fetch = await getFetch();
        const emailContent = buildSpeedTestReportEmailMarkup(
          reportPayload,
          req,
        );
        const bccList =
          internalCopyEmail && internalCopyEmail !== toEmail
            ? [internalCopyEmail]
            : undefined;

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [toEmail],
            ...(bccList ? { bcc: bccList } : {}),
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            reply_to: internalCopyEmail || undefined,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Resend request failed: ${response.status} ${errorText}`,
          );
        }

        return { sent: true };
      }.apply(this, args);
    },
  };
};
