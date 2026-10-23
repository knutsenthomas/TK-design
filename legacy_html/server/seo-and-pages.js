// seo and pages. Dependencies are resolved when an operation runs.
module.exports = function createFeature(context) {
  return {
    escapeHtml(...args) {
      return function escapeHtml(value = "") {
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }.apply(this, args);
    },

    upsertHeadMetaTag(...args) {
      const { escapeHtml, escapeRegExp } = context;
      return function upsertHeadMetaTag(
        html = "",
        attrName = "name",
        attrValue = "",
        content = "",
      ) {
        const safeAttrName = String(attrName || "").trim();
        const safeAttrValue = String(attrValue || "").trim();
        if (!safeAttrName || !safeAttrValue) return String(html || "");

        const safeContent = escapeHtml(content || "");
        const tag = `<meta ${safeAttrName}="${safeAttrValue}" content="${safeContent}">`;
        const input = String(html || "");
        const regex = new RegExp(
          `<meta\\b(?=[^>]*\\b${escapeRegExp(safeAttrName)}=["']${escapeRegExp(safeAttrValue)}["'])[^>]*\\/?>`,
          "i",
        );

        if (regex.test(input)) {
          return input.replace(regex, tag);
        }

        if (input.includes("</head>")) {
          return input.replace("</head>", `${tag}\n</head>`);
        }

        return `${input}\n${tag}`;
      }.apply(this, args);
    },

    serializeInlineJson(...args) {
      return function serializeInlineJson(value) {
        return JSON.stringify(value).replace(/</g, "\\u003c");
      }.apply(this, args);
    },

    readHtmlTemplate(...args) {
      const { templateCache, fs } = context;
      return function readHtmlTemplate(filePath) {
        if (templateCache.has(filePath)) {
          return Promise.resolve(templateCache.get(filePath));
        }
        return new Promise((resolve, reject) => {
          fs.readFile(filePath, "utf8", (err, content) => {
            if (err) return reject(err);
            templateCache.set(filePath, content);
            resolve(content);
          });
        });
      }.apply(this, args);
    },

    getFallbackBlogImage(...args) {
      return function getFallbackBlogImage(idOrSlug) {
        const images = [
          "/img/blog/bblog1.png",
          "/img/blog/bblog2.png",
          "/img/blog/bblog3.png",
          "/img/blog/bblog4.png",
        ];
        let str = String(idOrSlug || "1");
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        return images[Math.abs(hash) % images.length];
      }.apply(this, args);
    },

    getCleanPostSlug(...args) {
      const { normalizeBlogSlugPart } = context;
      return function getCleanPostSlug(p) {
        if (!p) return "";
        if (typeof p.slug === "string" && p.slug.trim()) {
          const s = p.slug.trim().toLowerCase();
          if (s && !s.includes("blog-details")) return s;
        }
        if (typeof p.link === "string" && p.link.startsWith("/blog/")) {
          const s = p.link
            .replace(/^\/blog\//, "")
            .replace(/\?.*$/, "")
            .trim()
            .toLowerCase();
          if (s && !s.includes("blog-details")) return s;
        }
        if (typeof p.title === "string" && p.title.trim()) {
          return normalizeBlogSlugPart(p.title);
        }
        return "";
      }.apply(this, args);
    },

    getSeoFilePath(...args) {
      const { path, __dirname } = context;
      return function getSeoFilePath() {
        return path.join(__dirname, "data/seo.json");
      }.apply(this, args);
    },

    readBlogPosts(...args) {
      const { fs, getPostsFilePath } = context;
      return function readBlogPosts() {
        return JSON.parse(fs.readFileSync(getPostsFilePath(), "utf8"));
      }.apply(this, args);
    },

    writeBlogPosts(...args) {
      const { fs, getPostsFilePath } = context;
      return function writeBlogPosts(posts) {
        fs.writeFileSync(
          getPostsFilePath(),
          JSON.stringify(posts, null, 4),
          "utf8",
        );
      }.apply(this, args);
    },

    normalizeSeoData(...args) {
      const { SEO_PAGE_DEFAULTS, SEO_GLOBAL_DEFAULTS } = context;
      return function normalizeSeoData(seoData) {
        const parsedSeoData =
          seoData && typeof seoData === "object" && !Array.isArray(seoData)
            ? seoData
            : {};
        const parsedGlobal =
          parsedSeoData.global &&
          typeof parsedSeoData.global === "object" &&
          !Array.isArray(parsedSeoData.global)
            ? parsedSeoData.global
            : {};
        const parsedPages =
          parsedSeoData.pages &&
          typeof parsedSeoData.pages === "object" &&
          !Array.isArray(parsedSeoData.pages)
            ? parsedSeoData.pages
            : {};
        const blogCommentsEnabledRaw = parsedGlobal.blogCommentsEnabled;
        const blogCommentsEnabled = !(
          blogCommentsEnabledRaw === false ||
          String(blogCommentsEnabledRaw).toLowerCase() === "false"
        );
        const normalizedPages = {};

        for (const [pageFile, defaults] of Object.entries(SEO_PAGE_DEFAULTS)) {
          const pageCandidate = parsedPages[pageFile];
          const pageConfig =
            pageCandidate &&
            typeof pageCandidate === "object" &&
            !Array.isArray(pageCandidate)
              ? pageCandidate
              : {};

          normalizedPages[pageFile] = {
            title: String(pageConfig.title ?? defaults.title ?? "").trim(),
            description: String(
              pageConfig.description ?? defaults.description ?? "",
            ).trim(),
            keywords: String(
              pageConfig.keywords ?? defaults.keywords ?? "",
            ).trim(),
          };
        }

        // Upgrade only generic legacy homepage titles; preserve custom admin titles.
        if (
          /^(Hjem|Home|Profesjonell Webdesign & SEO i Norge|Webdesign og SEO for små bedrifter)$/i.test(
            normalizedPages["index.html"].title,
          )
        ) {
          normalizedPages["index.html"].title =
            SEO_PAGE_DEFAULTS["index.html"].title;
          normalizedPages["index.html"].description =
            "TK-design lager nettsider for små og mellomstore bedrifter i Moss, Østfold og resten av Norge. Webdesign, SEO og personlig oppfølging.";
        }

        return {
          global: {
            ...SEO_GLOBAL_DEFAULTS,
            ...parsedGlobal,
            blogCommentsEnabled,
          },
          pages: normalizedPages,
        };
      }.apply(this, args);
    },

    readSeoData(...args) {
      const { fs, getSeoFilePath, normalizeSeoData } = context;
      return function readSeoData() {
        if (!fs.existsSync(getSeoFilePath())) {
          return normalizeSeoData({});
        }

        return normalizeSeoData(
          JSON.parse(fs.readFileSync(getSeoFilePath(), "utf8")),
        );
      }.apply(this, args);
    },

    writeSeoData(...args) {
      const { fs, getSeoFilePath, normalizeSeoData } = context;
      return function writeSeoData(seoData) {
        fs.writeFileSync(
          getSeoFilePath(),
          JSON.stringify(normalizeSeoData(seoData), null, 4),
          "utf8",
        );
      }.apply(this, args);
    },

    renderPageWithSeo(...args) {
      const {
        normalizeSeoData,
        readSiteDataWithFallback,
        readSeoData,
        getSiteBaseUrl,
        readBlogPosts,
        stripHtmlToText,
        resolveAbsolutePostUrl,
        getBlogPostTitleForUrl,
        resolveSocialImage,
        resolveAbsoluteAssetUrl,
        path,
        __dirname,
        readHtmlTemplate,
        readDashboardContent,
        renderServiceContent,
        parsePostDateTimestamp,
        normalizeStoredBlogPostLink,
        escapeHtml,
        upsertHeadMetaTag,
        getCustomStyleHref,
        serializeInlineJson,
      } = context;
      return async function renderPageWithSeo(
        req,
        res,
        reqFile,
        matchedBlogPost = null,
      ) {
        let lang = "no";
        const cookies = req.headers.cookie || "";
        const langMatch = cookies.match(/site_lang=(en|no)/);
        if (langMatch) lang = langMatch[1];

        let seoData = { global: {}, pages: {} };
        try {
          seoData = normalizeSeoData(
            await readSiteDataWithFallback("seo", readSeoData),
          );
        } catch (e) {}

        const globalSeo = seoData.global || {};
        let title = "";
        let description = "";
        let keywords = "";
        let ogUrl = "";
        let ogImage = "";
        let ogType = "website";

        const siteBaseUrl = getSiteBaseUrl(req);
        try {
          const requestUrl = String(
            req.originalUrl || req.url || req.path || "/",
          ).trim();
          ogUrl = siteBaseUrl
            ? new URL(requestUrl || "/", siteBaseUrl).toString()
            : "";
        } catch (error) {
          ogUrl = "";
        }

        // Specialized Logic for Blog Details
        if (reqFile === "blog-details.html") {
          try {
            const posts = matchedBlogPost
              ? []
              : await readSiteDataWithFallback("posts", readBlogPosts);
            const post =
              matchedBlogPost || posts.find((p) => p.id == req.query.id);
            if (post) {
              const isEn = lang === "en";
              const postTitle = isEn ? post.titleEn || post.title : post.title;
              const postContent = isEn
                ? post.contentEn || post.content
                : post.content;
              const postSeoTitle = isEn
                ? post.seoTitleEn || post.seoTitle
                : post.seoTitle;
              const postSeoDesc = isEn
                ? post.seoDescEn || post.seoDesc
                : post.seoDesc;
              const postSeoKeywords = isEn
                ? post.seoKeywordsEn || post.seoKeywords
                : post.seoKeywords;

              title = postSeoTitle || postTitle;
              description =
                postSeoDesc ||
                (postContent
                  ? stripHtmlToText(postContent).substring(0, 160)
                  : "");
              keywords = postSeoKeywords || globalSeo.defaultKeywords || "";
              ogType = "article";

              const resolvedPostUrl = resolveAbsolutePostUrl(
                post.link,
                req,
                post.id,
                getBlogPostTitleForUrl(post),
              );
              if (resolvedPostUrl) {
                ogUrl = resolvedPostUrl;
              }

              const socialImage = resolveSocialImage(post, req);
              if (socialImage.absolute) {
                ogImage = socialImage.absolute;
              }
            }
          } catch (e) {
            console.error("Error fetching post for SEO:", e);
          }
        }

        // Default Page Logic if not blog details or post not found
        if (!title) {
          const pageSeo =
            seoData.pages[req.path] || seoData.pages[reqFile] || {};
          title = pageSeo.title || "";
          description = pageSeo.description || "";
          keywords = pageSeo.keywords || globalSeo.defaultKeywords || "";
        }

        // Construct Final Title
        const siteTitleRaw = (globalSeo.siteTitle || "").trim();
        const siteTitle =
          siteTitleRaw === "TK Design Studio" ? "TK-design" : siteTitleRaw;
        const finalTitle = title
          ? `${title} ${globalSeo.separator || "|"} ${siteTitle}`
          : siteTitle;
        if (!ogImage) {
          const configuredLogo = String(globalSeo.logoImage || "").trim();
          ogImage = resolveAbsoluteAssetUrl(
            configuredLogo || "img/logo/d.png",
            req,
          );
        }

        try {
          const filePath = path.join(__dirname, reqFile);
          const html = await readHtmlTemplate(filePath);

          let translatedHtml = html;
          try {
            const translations = readDashboardContent();
            const langData = translations[lang];

            if (langData) {
              translatedHtml = html.replace(
                /<([^>]+data-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\s*([a-zA-Z0-9]+)\s*>/g,
                (match, openingTag, key, oldContent, tagName) => {
                  const keys = key.split(".");
                  let text = langData;
                  for (const k of keys) {
                    text = text ? text[k] : null;
                  }

                  if (text && typeof text === "string") {
                    return `<${openingTag}>${text}</${tagName}>`;
                  }
                  return match;
                },
              );
            }
          } catch (e) {
            console.error("Error during server-side translation:", e);
          }

          translatedHtml = translatedHtml.replace(
            /<html\b[^>]*>/i,
            '<html lang="' + lang + '" prefix="og: https://ogp.me/ns#">',
          );
          if (reqFile === "service-details.html")
            translatedHtml = renderServiceContent(
              translatedHtml,
              req.path,
              lang,
            );

          // SSR Pre-rendering for blog.html listing so search engines see all blog posts on initial HTML load
          if (reqFile === "blog.html") {
            try {
              const posts = await readSiteDataWithFallback(
                "posts",
                readBlogPosts,
              );
              const sortedPosts = (posts || [])
                .slice()
                .sort(
                  (a, b) =>
                    parsePostDateTimestamp(b) - parsePostDateTimestamp(a),
                );
              const publishedPosts = sortedPosts.filter(
                (p) => p && p.status !== "draft",
              );
              if (publishedPosts.length > 0) {
                const latest = publishedPosts[0];
                const latestTitle =
                  lang === "en" && latest.titleEn
                    ? latest.titleEn
                    : latest.title || "";
                const latestSummary =
                  lang === "en" && latest.summaryEn
                    ? latest.summaryEn
                    : latest.summary || latest.lead || "";
                const latestUrl = normalizeStoredBlogPostLink(
                  latest.link,
                  latest.id,
                  getBlogPostTitleForUrl(latest),
                );

                translatedHtml = translatedHtml
                  .replace(
                    '<h2 id="blogFeaturedTitle">Laster innlegg...</h2>',
                    `<h2 id="blogFeaturedTitle">${escapeHtml(latestTitle)}</h2>`,
                  )
                  .replace(
                    /<p id="blogFeaturedSummary"[^>]*>Laster innlegg...<\/p>/,
                    `<p id="blogFeaturedSummary">${escapeHtml(latestSummary)}</p>`,
                  )
                  .replace(
                    'href="/blog" class="blog-list-spotlight" id="blogFeaturedCardLink"',
                    `href="${latestUrl}" class="blog-list-spotlight" id="blogFeaturedCardLink"`,
                  )
                  .replace(
                    '<strong class="blog-list-overview-value" id="blogTotalPosts">0</strong>',
                    `<strong class="blog-list-overview-value" id="blogTotalPosts">${publishedPosts.length}</strong>`,
                  );

                const gridHtml = publishedPosts
                  .map((p) => {
                    const pTitle =
                      lang === "en" && p.titleEn ? p.titleEn : p.title || "";
                    const pSummary =
                      lang === "en" && p.summaryEn
                        ? p.summaryEn
                        : p.summary || p.lead || "";
                    const pUrl = normalizeStoredBlogPostLink(
                      p.link,
                      p.id,
                      getBlogPostTitleForUrl(p),
                    );
                    const pImg = p.image || p.imageUrl || "img/blog/b-1.png";
                    const pCat = p.category || "Webdesign";
                    const pDate = p.date || "";
                    return `
                        <article class="blog-list-card">
                            <a href="${pUrl}" class="blog-list-card-media">
                                <img src="${pImg}" alt="${escapeHtml(pTitle)}">
                            </a>
                            <div class="blog-list-card-content">
                                <div class="blog-list-card-meta">
                                    <span class="blog-list-card-category">${escapeHtml(pCat)}</span>
                                    <span class="blog-list-card-date">${escapeHtml(pDate)}</span>
                                </div>
                                <h3 class="blog-list-card-title"><a href="${pUrl}">${escapeHtml(pTitle)}</a></h3>
                                <p class="blog-list-card-summary">${escapeHtml(pSummary)}</p>
                                <a href="${pUrl}" class="blog-list-card-link">Les mer <i class="fas fa-arrow-right"></i></a>
                            </div>
                        </article>`;
                  })
                  .join("\n");

                translatedHtml = translatedHtml.replace(
                  /<div class="blog-list-grid" id="blogListGrid">[\s\S]*?<\/div>/,
                  `<div class="blog-list-grid" id="blogListGrid">${gridHtml}</div>`,
                );
              }
            } catch (err) {
              console.error("Error pre-rendering blog.html SSR:", err);
            }
          }

          let injectedHtml = translatedHtml.replace(
            /<title>[\s\S]*?<\/title>/i,
            `<title>${escapeHtml(finalTitle)}</title>`,
          );

          injectedHtml = upsertHeadMetaTag(
            injectedHtml,
            "name",
            "description",
            description,
          );
          injectedHtml = upsertHeadMetaTag(
            injectedHtml,
            "name",
            "keywords",
            keywords,
          );
          injectedHtml = upsertHeadMetaTag(
            injectedHtml,
            "property",
            "og:title",
            finalTitle,
          );
          injectedHtml = upsertHeadMetaTag(
            injectedHtml,
            "property",
            "og:description",
            description,
          );
          injectedHtml = upsertHeadMetaTag(
            injectedHtml,
            "property",
            "og:type",
            ogType,
          );
          injectedHtml = upsertHeadMetaTag(
            injectedHtml,
            "name",
            "twitter:title",
            finalTitle,
          );
          injectedHtml = upsertHeadMetaTag(
            injectedHtml,
            "name",
            "twitter:description",
            description,
          );
          injectedHtml = upsertHeadMetaTag(
            injectedHtml,
            "name",
            "twitter:card",
            ogImage ? "summary_large_image" : "summary",
          );
          if (ogUrl) {
            injectedHtml = upsertHeadMetaTag(
              injectedHtml,
              "property",
              "og:url",
              ogUrl,
            );
          }
          if (ogImage) {
            injectedHtml = upsertHeadMetaTag(
              injectedHtml,
              "property",
              "og:image",
              ogImage,
            );
            injectedHtml = upsertHeadMetaTag(
              injectedHtml,
              "name",
              "twitter:image",
              ogImage,
            );
          }

          // Auto-inject / Upsert Canonical URL to prevent duplicate content indexing
          const canonicalTarget =
            ogUrl || `https://tk-design.no${req.path === "/" ? "/" : req.path}`;
          if (/<link\s+[^>]*rel=["']canonical["'][^>]*>/i.test(injectedHtml)) {
            injectedHtml = injectedHtml.replace(
              /<link\s+[^>]*rel=["']canonical["'][^>]*>/i,
              `<link rel="canonical" href="${canonicalTarget}">`,
            );
          } else {
            injectedHtml = injectedHtml.replace(
              "</head>",
              `    <link rel="canonical" href="${canonicalTarget}">\n</head>`,
            );
          }

          if (!/custom-style\.css/i.test(injectedHtml)) {
            const customStyleLink = `<link rel="stylesheet" href="${getCustomStyleHref()}">`;
            injectedHtml = injectedHtml.replace(
              "</head>",
              `${customStyleLink}\n</head>`,
            );
          }

          const brandingConfig = {
            logoText: String(globalSeo.logoText || "").trim(),
            logoImage: String(globalSeo.logoImage || "").trim(),
          };

          if (
            (brandingConfig.logoText || brandingConfig.logoImage) &&
            !injectedHtml.includes("window.__TK_BRANDING__")
          ) {
            const brandingScript = `<script>window.__TK_BRANDING__ = ${serializeInlineJson(brandingConfig)};</script>`;
            injectedHtml = injectedHtml.replace(
              "</head>",
              `${brandingScript}\n</head>`,
            );
          }

          // Configure the first-party consent loader; never inject an eager Google tag.
          if (/^G-[A-Z0-9]+$/.test(globalSeo.googleAnalyticsId || "")) {
            injectedHtml = injectedHtml.replace(
              /data-ga="G-[A-Z0-9]+"/g,
              `data-ga="${globalSeo.googleAnalyticsId}"`,
            );
          }

          res.send(injectedHtml);
        } catch (err) {
          console.error("Error serving template:", err);
          res.status(404).send("Page not found");
        }
      }.apply(this, args);
    },

    stripHtmlToText(...args) {
      return function stripHtmlToText(html = "") {
        return String(html || "")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }.apply(this, args);
    },

    normalizeBlogSlugPart(...args) {
      return function normalizeBlogSlugPart(value = "") {
        return String(value || "")
          .toLowerCase()
          .replace(/æ/g, "ae")
          .replace(/ø/g, "o")
          .replace(/å/g, "a")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .replace(/-{2,}/g, "-");
      }.apply(this, args);
    },

    getBlogPostTitleForUrl(...args) {
      return function getBlogPostTitleForUrl(post = {}) {
        return String(post.title || post.titleEn || "").trim();
      }.apply(this, args);
    },

    isLegacyBlogPostLink(...args) {
      return function isLegacyBlogPostLink(linkValue = "") {
        return /(^|\/)blog-details(?:\.html)?(?:\?|$)/i.test(
          String(linkValue || "").trim(),
        );
      }.apply(this, args);
    },

    normalizeStoredBlogPostLink(...args) {
      const { isLegacyBlogPostLink, buildRelativePostUrl } = context;
      return function normalizeStoredBlogPostLink(
        linkValue,
        postId,
        postTitle = "",
      ) {
        const rawLink = String(linkValue || "").trim();
        if (!rawLink || isLegacyBlogPostLink(rawLink)) {
          return buildRelativePostUrl(postId, postTitle);
        }

        if (/^https?:\/\//i.test(rawLink)) {
          return rawLink;
        }

        return rawLink.startsWith("/") ? rawLink : `/${rawLink}`;
      }.apply(this, args);
    },

    decorateBlogPostWithResolvedLink(...args) {
      const { normalizeStoredBlogPostLink, getBlogPostTitleForUrl } = context;
      return function decorateBlogPostWithResolvedLink(post = {}) {
        return {
          ...post,
          link: normalizeStoredBlogPostLink(
            post.link,
            post.id,
            getBlogPostTitleForUrl(post),
          ),
        };
      }.apply(this, args);
    },

    decorateBlogPostsWithResolvedLinks(...args) {
      const { decorateBlogPostWithResolvedLink, parsePostDateTimestamp } =
        context;
      return function decorateBlogPostsWithResolvedLinks(posts = []) {
        if (!Array.isArray(posts)) return posts;
        const decorated = posts.map((post) =>
          decorateBlogPostWithResolvedLink(post),
        );
        return decorated.sort(
          (a, b) => parsePostDateTimestamp(b) - parsePostDateTimestamp(a),
        );
      }.apply(this, args);
    },

    findBlogPostByRouteSegment(...args) {
      const { normalizeBlogSlugPart, getBlogPostTitleForUrl } = context;
      return function findBlogPostByRouteSegment(
        posts = [],
        routeSegment = "",
      ) {
        let decodedSegment = String(routeSegment || "").trim();
        try {
          decodedSegment = decodeURIComponent(decodedSegment);
        } catch (error) {
          decodedSegment = String(routeSegment || "").trim();
        }

        // Direct match by slug or id
        const directMatch = posts.find(
          (p) =>
            p && (p.slug === decodedSegment || String(p.id) === decodedSegment),
        );
        if (directMatch) {
          return directMatch;
        }

        const idMatch = decodedSegment.match(/-(\d+)$/);
        if (idMatch) {
          const matchedById = posts.find(
            (post) => Number(post.id) === Number(idMatch[1]),
          );
          if (matchedById) {
            return matchedById;
          }
        }

        const normalizedSegment = normalizeBlogSlugPart(
          decodedSegment.replace(/-\d+$/, ""),
        );
        if (!normalizedSegment) {
          return null;
        }

        return (
          posts.find((post) => {
            if (!post) return false;
            if (
              post.slug &&
              normalizeBlogSlugPart(post.slug) === normalizedSegment
            )
              return true;
            return (
              normalizeBlogSlugPart(getBlogPostTitleForUrl(post)) ===
              normalizedSegment
            );
          }) || null
        );
      }.apply(this, args);
    },

    extractFirstImageSrcFromHtml(...args) {
      return function extractFirstImageSrcFromHtml(htmlValue = "") {
        const html = String(htmlValue || "");
        if (!html) return "";
        const quotedMatch = html.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
        if (quotedMatch?.[1]) {
          return String(quotedMatch[1]).trim();
        }
        const unquotedMatch = html.match(/<img[^>]+src\s*=\s*([^\s>]+)/i);
        return unquotedMatch?.[1] ? String(unquotedMatch[1]).trim() : "";
      }.apply(this, args);
    },
  };
};
