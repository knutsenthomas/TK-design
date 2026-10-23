// social publishing. Dependencies are resolved when an operation runs.
module.exports = function createFeature(context) {
  return {
    getSocialPlannerFilePath(...args) {
      const { path, __dirname } = context;
      return function getSocialPlannerFilePath() {
        return path.join(__dirname, "data/social_planner.json");
      }.apply(this, args);
    },

    normalizePlannerText(...args) {
      return function normalizePlannerText(value, maxLength = 5000) {
        return String(value || "")
          .replace(/\r\n/g, "\n")
          .replace(/\s+\n/g, "\n")
          .trim()
          .slice(0, maxLength);
      }.apply(this, args);
    },

    normalizePlannerShortText(...args) {
      return function normalizePlannerShortText(value, maxLength = 160) {
        return String(value || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, maxLength);
      }.apply(this, args);
    },

    normalizePlannerUrl(...args) {
      return function normalizePlannerUrl(value) {
        const raw = String(value || "").trim();
        if (!raw) return "";
        if (/^https?:\/\//i.test(raw)) return raw;
        if (raw.startsWith("//")) return `https:${raw}`;
        if (raw.startsWith("/")) return raw;
        return `https://${raw}`;
      }.apply(this, args);
    },

    normalizePlannerPlatform(...args) {
      const { SOCIAL_PLATFORMS } = context;
      return function normalizePlannerPlatform(value) {
        const normalized = String(value || "")
          .trim()
          .toLowerCase();
        return SOCIAL_PLATFORMS.includes(normalized) ? normalized : "facebook";
      }.apply(this, args);
    },

    normalizePlannerStatus(...args) {
      const { SOCIAL_ENTRY_STATUSES } = context;
      return function normalizePlannerStatus(value) {
        const normalized = String(value || "")
          .trim()
          .toLowerCase();
        return SOCIAL_ENTRY_STATUSES.has(normalized) ? normalized : "draft";
      }.apply(this, args);
    },

    createSocialPlannerId(...args) {
      const { crypto } = context;
      return function createSocialPlannerId(prefix = "sp") {
        return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      }.apply(this, args);
    },

    normalizePlannerHashtags(...args) {
      return function normalizePlannerHashtags(value) {
        const rawItems = Array.isArray(value)
          ? value
          : String(value || "")
              .split(/[\n, ]+/)
              .map((item) => item.trim())
              .filter(Boolean);
        const seen = new Set();
        const hashtags = [];

        rawItems.forEach((item) => {
          let cleaned = String(item || "")
            .trim()
            .toLowerCase();
          cleaned = cleaned.replace(/^#+/, "").replace(/[^a-z0-9_]+/g, "");
          if (!cleaned || seen.has(cleaned)) return;
          seen.add(cleaned);
          hashtags.push(`#${cleaned}`);
        });

        return hashtags.slice(0, 20);
      }.apply(this, args);
    },

    normalizePlannerVariants(...args) {
      const { SOCIAL_PLATFORMS, normalizePlannerText } = context;
      return function normalizePlannerVariants(value) {
        const source =
          value && typeof value === "object" && !Array.isArray(value)
            ? value
            : {};
        const normalized = {};

        SOCIAL_PLATFORMS.forEach((platform) => {
          normalized[platform] = normalizePlannerText(
            source[platform] || "",
            3000,
          );
        });

        return normalized;
      }.apply(this, args);
    },

    createDefaultSocialPlannerData(...args) {
      const { createSocialPlannerId } = context;
      return function createDefaultSocialPlannerData() {
        const nowIso = new Date().toISOString();
        return {
          version: 1,
          settings: {
            activeWorkspaceId: "default",
          },
          workspaces: [
            {
              id: "default",
              name: "TK-design",
              timezone: "Europe/Oslo",
              createdAt: nowIso,
              updatedAt: nowIso,
            },
          ],
          socialAccounts: [],
          templates: [
            {
              id: createSocialPlannerId("tpl"),
              workspaceId: "default",
              category: "salg",
              name: "Salgskampanje",
              body: "Nytt fra oss: {{title}}\n\n{{summary}}\n\nLes mer: {{url}}",
              createdAt: nowIso,
              updatedAt: nowIso,
            },
            {
              id: createSocialPlannerId("tpl"),
              workspaceId: "default",
              category: "inspirasjon",
              name: "Tips og innsikt",
              body: "{{hook}}\n\n{{summary}}\n\n#tips #inspirasjon",
              createdAt: nowIso,
              updatedAt: nowIso,
            },
          ],
          entries: [],
        };
      }.apply(this, args);
    },

    normalizeSocialPlannerWorkspace(...args) {
      const { normalizePlannerShortText, normalizeIsoDateTime } = context;
      return function normalizeSocialPlannerWorkspace(
        workspace,
        fallbackId = "default",
      ) {
        const nowIso = new Date().toISOString();
        const candidate =
          workspace &&
          typeof workspace === "object" &&
          !Array.isArray(workspace)
            ? workspace
            : {};
        const id =
          normalizePlannerShortText(candidate.id || fallbackId, 60) ||
          fallbackId;
        return {
          id,
          name:
            normalizePlannerShortText(candidate.name || "Workspace", 100) ||
            "Workspace",
          timezone:
            normalizePlannerShortText(
              candidate.timezone || "Europe/Oslo",
              60,
            ) || "Europe/Oslo",
          createdAt: normalizeIsoDateTime(candidate.createdAt, nowIso),
          updatedAt: normalizeIsoDateTime(candidate.updatedAt, nowIso),
        };
      }.apply(this, args);
    },

    normalizeSocialPlannerAccount(...args) {
      const {
        normalizePlannerShortText,
        createSocialPlannerId,
        normalizePlannerPlatform,
        normalizeIsoDateTime,
      } = context;
      return function normalizeSocialPlannerAccount(
        account,
        workspaceIds = new Set(["default"]),
      ) {
        const nowIso = new Date().toISOString();
        const candidate =
          account && typeof account === "object" && !Array.isArray(account)
            ? account
            : {};
        const workspaceId = workspaceIds.has(
          String(candidate.workspaceId || ""),
        )
          ? String(candidate.workspaceId)
          : "default";

        return {
          id: normalizePlannerShortText(
            candidate.id || createSocialPlannerId("acct"),
            80,
          ),
          workspaceId,
          platform: normalizePlannerPlatform(candidate.platform),
          displayName: normalizePlannerShortText(
            candidate.displayName || "",
            120,
          ),
          externalAccountId: normalizePlannerShortText(
            candidate.externalAccountId || "",
            180,
          ),
          status:
            normalizePlannerShortText(
              candidate.status || "active",
              30,
            ).toLowerCase() || "active",
          createdAt: normalizeIsoDateTime(candidate.createdAt, nowIso),
          updatedAt: normalizeIsoDateTime(candidate.updatedAt, nowIso),
        };
      }.apply(this, args);
    },

    normalizeSocialPlannerTemplate(...args) {
      const {
        normalizePlannerShortText,
        createSocialPlannerId,
        normalizePlannerText,
        normalizeIsoDateTime,
      } = context;
      return function normalizeSocialPlannerTemplate(
        template,
        workspaceIds = new Set(["default"]),
      ) {
        const nowIso = new Date().toISOString();
        const candidate =
          template && typeof template === "object" && !Array.isArray(template)
            ? template
            : {};
        const workspaceId = workspaceIds.has(
          String(candidate.workspaceId || ""),
        )
          ? String(candidate.workspaceId)
          : "default";
        const category =
          normalizePlannerShortText(
            candidate.category || "generelt",
            40,
          ).toLowerCase() || "generelt";

        return {
          id: normalizePlannerShortText(
            candidate.id || createSocialPlannerId("tpl"),
            80,
          ),
          workspaceId,
          category,
          name:
            normalizePlannerShortText(candidate.name || "Template", 120) ||
            "Template",
          body: normalizePlannerText(candidate.body || "", 5000),
          createdAt: normalizeIsoDateTime(candidate.createdAt, nowIso),
          updatedAt: normalizeIsoDateTime(candidate.updatedAt, nowIso),
        };
      }.apply(this, args);
    },

    normalizeSocialPlannerMetrics(...args) {
      return function normalizeSocialPlannerMetrics(metrics) {
        const source =
          metrics && typeof metrics === "object" && !Array.isArray(metrics)
            ? metrics
            : {};
        const toInt = (value) => {
          const parsed = Number.parseInt(value, 10);
          return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
        };

        return {
          likes: toInt(source.likes),
          comments: toInt(source.comments),
          shares: toInt(source.shares),
          reach: toInt(source.reach),
          clicks: toInt(source.clicks),
        };
      }.apply(this, args);
    },

    extractSocialPlannerMetricsPatch(...args) {
      const { parseNonNegativeIntegerOrNull } = context;
      return function extractSocialPlannerMetricsPatch(source = {}) {
        const candidate =
          source && typeof source === "object" && !Array.isArray(source)
            ? source
            : {};
        const patch = {};

        const likes = parseNonNegativeIntegerOrNull(candidate.likes);
        const comments = parseNonNegativeIntegerOrNull(candidate.comments);
        const shares = parseNonNegativeIntegerOrNull(candidate.shares);
        const reach = parseNonNegativeIntegerOrNull(candidate.reach);
        const clicks = parseNonNegativeIntegerOrNull(candidate.clicks);

        if (likes !== null) patch.likes = likes;
        if (comments !== null) patch.comments = comments;
        if (shares !== null) patch.shares = shares;
        if (reach !== null) patch.reach = reach;
        if (clicks !== null) patch.clicks = clicks;

        return patch;
      }.apply(this, args);
    },

    mergeSocialPlannerMetrics(...args) {
      const {
        normalizeSocialPlannerMetrics,
        extractSocialPlannerMetricsPatch,
      } = context;
      return function mergeSocialPlannerMetrics(
        baseMetrics = {},
        patchMetrics = {},
      ) {
        const base = normalizeSocialPlannerMetrics(baseMetrics);
        const patch = extractSocialPlannerMetricsPatch(patchMetrics);
        return {
          likes: patch.likes ?? base.likes,
          comments: patch.comments ?? base.comments,
          shares: patch.shares ?? base.shares,
          reach: patch.reach ?? base.reach,
          clicks: patch.clicks ?? base.clicks,
        };
      }.apply(this, args);
    },

    normalizeSocialPlannerPublication(...args) {
      const {
        normalizePlannerShortText,
        normalizePlannerPlatform,
        normalizePlannerUrl,
        normalizeIsoDateTime,
        normalizeSocialPlannerMetrics,
      } = context;
      return function normalizeSocialPlannerPublication(publication) {
        const nowIso = new Date().toISOString();
        const candidate =
          publication &&
          typeof publication === "object" &&
          !Array.isArray(publication)
            ? publication
            : {};
        return {
          accountId: normalizePlannerShortText(candidate.accountId || "", 80),
          platform: normalizePlannerPlatform(candidate.platform || ""),
          externalPostId: normalizePlannerShortText(
            candidate.externalPostId || "",
            240,
          ),
          externalMediaId: normalizePlannerShortText(
            candidate.externalMediaId || "",
            240,
          ),
          externalUrl: normalizePlannerUrl(candidate.externalUrl || ""),
          publishedAt: candidate.publishedAt
            ? normalizeIsoDateTime(candidate.publishedAt, nowIso)
            : "",
          metrics: normalizeSocialPlannerMetrics(candidate.metrics || {}),
          metricsUpdatedAt: candidate.metricsUpdatedAt
            ? normalizeIsoDateTime(candidate.metricsUpdatedAt, nowIso)
            : "",
          updatedAt: normalizeIsoDateTime(candidate.updatedAt, nowIso),
        };
      }.apply(this, args);
    },

    normalizeSocialPlannerPublications(...args) {
      const { normalizeSocialPlannerPublication } = context;
      return function normalizeSocialPlannerPublications(publications = []) {
        const list = Array.isArray(publications) ? publications : [];
        const normalized = [];
        const seen = new Set();

        list.forEach((item, index) => {
          const publication = normalizeSocialPlannerPublication(item);
          const stableKey = `${publication.accountId || "_"}|${publication.platform || "_"}|${publication.externalPostId || publication.externalMediaId || `idx_${index}`}`;
          if (seen.has(stableKey)) return;
          seen.add(stableKey);
          normalized.push(publication);
        });

        return normalized.slice(-100);
      }.apply(this, args);
    },

    sumSocialPlannerPublicationMetrics(...args) {
      const { normalizeSocialPlannerMetrics } = context;
      return function sumSocialPlannerPublicationMetrics(publications = []) {
        const list = Array.isArray(publications) ? publications : [];
        return list.reduce(
          (acc, publication) => {
            const metrics = normalizeSocialPlannerMetrics(
              publication?.metrics || {},
            );
            acc.likes += metrics.likes;
            acc.comments += metrics.comments;
            acc.shares += metrics.shares;
            acc.reach += metrics.reach;
            acc.clicks += metrics.clicks;
            return acc;
          },
          { likes: 0, comments: 0, shares: 0, reach: 0, clicks: 0 },
        );
      }.apply(this, args);
    },

    findSocialPlannerPublicationIndex(...args) {
      const { normalizePlannerShortText, normalizePlannerPlatform } = context;
      return function findSocialPlannerPublicationIndex(
        publications = [],
        update = {},
      ) {
        const list = Array.isArray(publications) ? publications : [];
        const accountId = normalizePlannerShortText(update.accountId || "", 80);
        const platform = normalizePlannerPlatform(update.platform || "");
        const externalPostId = normalizePlannerShortText(
          update.externalPostId || "",
          240,
        );
        const externalMediaId = normalizePlannerShortText(
          update.externalMediaId || "",
          240,
        );

        if (accountId && platform) {
          const exact = list.findIndex(
            (publication) =>
              publication.accountId === accountId &&
              publication.platform === platform,
          );
          if (exact >= 0) return exact;
        }
        if (accountId) {
          const byAccount = list.findIndex(
            (publication) => publication.accountId === accountId,
          );
          if (byAccount >= 0) return byAccount;
        }
        if (externalPostId && platform) {
          const byExternalAndPlatform = list.findIndex(
            (publication) =>
              publication.externalPostId === externalPostId &&
              publication.platform === platform,
          );
          if (byExternalAndPlatform >= 0) return byExternalAndPlatform;
        }
        if (externalPostId) {
          const byExternal = list.findIndex(
            (publication) => publication.externalPostId === externalPostId,
          );
          if (byExternal >= 0) return byExternal;
        }
        if (externalMediaId) {
          const byMedia = list.findIndex(
            (publication) => publication.externalMediaId === externalMediaId,
          );
          if (byMedia >= 0) return byMedia;
        }
        if (platform) {
          return list.findIndex(
            (publication) => publication.platform === platform,
          );
        }
        return -1;
      }.apply(this, args);
    },

    upsertSocialPlannerEntryPublication(...args) {
      const {
        normalizeSocialPlannerPublications,
        findSocialPlannerPublicationIndex,
        normalizeSocialPlannerPublication,
        extractSocialPlannerMetricsPatch,
        normalizePlannerShortText,
        normalizePlannerPlatform,
        normalizePlannerUrl,
        mergeSocialPlannerMetrics,
        normalizeSocialPlannerMetrics,
        normalizeIsoDateTime,
        sumSocialPlannerPublicationMetrics,
      } = context;
      return function upsertSocialPlannerEntryPublication(entry, update = {}) {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
          return;
        }

        const nowIso = new Date().toISOString();
        const publications = normalizeSocialPlannerPublications(
          entry.platformPublications || [],
        );
        const targetIndex = findSocialPlannerPublicationIndex(
          publications,
          update,
        );
        const current =
          targetIndex >= 0
            ? publications[targetIndex]
            : normalizeSocialPlannerPublication({
                accountId: update.accountId,
                platform: update.platform,
              });

        const metricsPatch = extractSocialPlannerMetricsPatch(
          update.metricsPatch || update.metrics || {},
        );
        const hasMetricsPatch = Object.keys(metricsPatch).length > 0;
        const next = normalizeSocialPlannerPublication({
          ...current,
          accountId: normalizePlannerShortText(
            update.accountId || current.accountId || "",
            80,
          ),
          platform: normalizePlannerPlatform(
            update.platform || current.platform || "",
          ),
          externalPostId: normalizePlannerShortText(
            update.externalPostId || current.externalPostId || "",
            240,
          ),
          externalMediaId: normalizePlannerShortText(
            update.externalMediaId || current.externalMediaId || "",
            240,
          ),
          externalUrl: normalizePlannerUrl(
            update.externalUrl || current.externalUrl || "",
          ),
          publishedAt: update.publishedAt || current.publishedAt || "",
          metrics: hasMetricsPatch
            ? mergeSocialPlannerMetrics(current.metrics || {}, metricsPatch)
            : normalizeSocialPlannerMetrics(current.metrics || {}),
          metricsUpdatedAt: hasMetricsPatch
            ? normalizeIsoDateTime(update.metricsUpdatedAt || nowIso, nowIso)
            : current.metricsUpdatedAt,
          updatedAt: nowIso,
        });

        if (targetIndex >= 0) {
          publications[targetIndex] = next;
        } else {
          publications.push(next);
        }

        entry.platformPublications =
          normalizeSocialPlannerPublications(publications);
        if (hasMetricsPatch) {
          entry.metrics = sumSocialPlannerPublicationMetrics(
            entry.platformPublications,
          );
        }
      }.apply(this, args);
    },

    normalizeSocialPlannerEntry(...args) {
      const {
        normalizePlannerShortText,
        normalizePlannerStatus,
        normalizePlannerText,
        createSocialPlannerId,
        normalizePlannerVariants,
        normalizePlannerHashtags,
        normalizePlannerUrl,
        normalizeIsoDateTime,
        normalizePlannerPlatform,
        normalizeSocialPlannerPublications,
        normalizeSocialPlannerMetrics,
      } = context;
      return function normalizeSocialPlannerEntry(
        entry,
        workspaceIds = new Set(["default"]),
        accountIds = new Set(),
      ) {
        const nowIso = new Date().toISOString();
        const candidate =
          entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry
            : {};
        const workspaceId = workspaceIds.has(
          String(candidate.workspaceId || ""),
        )
          ? String(candidate.workspaceId)
          : "default";
        const targetAccountIdsRaw = Array.isArray(candidate.targetAccountIds)
          ? candidate.targetAccountIds
          : [];
        const targetAccountIds = [];
        const seenAccountIds = new Set();
        targetAccountIdsRaw.forEach((value) => {
          const id = normalizePlannerShortText(value, 80);
          if (!id || seenAccountIds.has(id)) return;
          if (accountIds.size > 0 && !accountIds.has(id)) return;
          seenAccountIds.add(id);
          targetAccountIds.push(id);
        });

        const status = normalizePlannerStatus(candidate.status);
        const scheduledFor = normalizePlannerText(
          candidate.scheduledFor || "",
          40,
        );

        return {
          id: normalizePlannerShortText(
            candidate.id || createSocialPlannerId("entry"),
            80,
          ),
          workspaceId,
          title:
            normalizePlannerShortText(candidate.title || "Uten tittel", 180) ||
            "Uten tittel",
          masterText: normalizePlannerText(candidate.masterText || "", 6000),
          variants: normalizePlannerVariants(candidate.variants || {}),
          hashtags: normalizePlannerHashtags(candidate.hashtags || []),
          mediaUrl: normalizePlannerUrl(candidate.mediaUrl || ""),
          linkUrl: normalizePlannerUrl(candidate.linkUrl || ""),
          targetAccountIds,
          status,
          scheduledFor: scheduledFor
            ? normalizeIsoDateTime(scheduledFor, nowIso)
            : "",
          publishedAt: candidate.publishedAt
            ? normalizeIsoDateTime(candidate.publishedAt, nowIso)
            : "",
          createdAt: normalizeIsoDateTime(candidate.createdAt, nowIso),
          updatedAt: normalizeIsoDateTime(candidate.updatedAt, nowIso),
          lastError: normalizePlannerText(candidate.lastError || "", 1000),
          publishLog: Array.isArray(candidate.publishLog)
            ? candidate.publishLog.slice(-50).map((row) => ({
                at: normalizeIsoDateTime(row?.at || nowIso, nowIso),
                accountId: normalizePlannerShortText(row?.accountId || "", 80),
                platform: normalizePlannerPlatform(row?.platform || "facebook"),
                status: normalizePlannerShortText(row?.status || "unknown", 40),
                details: normalizePlannerText(row?.details || "", 500),
              }))
            : [],
          platformPublications: normalizeSocialPlannerPublications(
            candidate.platformPublications || [],
          ),
          metrics: normalizeSocialPlannerMetrics(candidate.metrics || {}),
        };
      }.apply(this, args);
    },

    normalizeSocialPlannerData(...args) {
      const {
        createDefaultSocialPlannerData,
        normalizeSocialPlannerWorkspace,
        normalizeSocialPlannerAccount,
        normalizeSocialPlannerTemplate,
        normalizeSocialPlannerEntry,
      } = context;
      return function normalizeSocialPlannerData(rawData) {
        const source =
          rawData && typeof rawData === "object" && !Array.isArray(rawData)
            ? rawData
            : createDefaultSocialPlannerData();
        const defaults = createDefaultSocialPlannerData();
        const rawWorkspaces = Array.isArray(source.workspaces)
          ? source.workspaces
          : defaults.workspaces;
        const workspaceMap = new Map();

        rawWorkspaces.forEach((workspace) => {
          const normalized = normalizeSocialPlannerWorkspace(workspace);
          if (!workspaceMap.has(normalized.id)) {
            workspaceMap.set(normalized.id, normalized);
          }
        });

        if (!workspaceMap.has("default")) {
          workspaceMap.set(
            "default",
            normalizeSocialPlannerWorkspace(defaults.workspaces[0], "default"),
          );
        }

        const workspaces = Array.from(workspaceMap.values());
        const workspaceIds = new Set(
          workspaces.map((workspace) => workspace.id),
        );

        const rawAccounts = Array.isArray(source.socialAccounts)
          ? source.socialAccounts
          : [];
        const accountMap = new Map();
        rawAccounts.forEach((account) => {
          const normalized = normalizeSocialPlannerAccount(
            account,
            workspaceIds,
          );
          if (normalized.displayName && !accountMap.has(normalized.id)) {
            accountMap.set(normalized.id, normalized);
          }
        });
        const socialAccounts = Array.from(accountMap.values());
        const accountIds = new Set(socialAccounts.map((account) => account.id));

        const rawTemplates = Array.isArray(source.templates)
          ? source.templates
          : defaults.templates;
        const templateMap = new Map();
        rawTemplates.forEach((template) => {
          const normalized = normalizeSocialPlannerTemplate(
            template,
            workspaceIds,
          );
          if (!templateMap.has(normalized.id)) {
            templateMap.set(normalized.id, normalized);
          }
        });
        const templates = Array.from(templateMap.values());

        const rawEntries = Array.isArray(source.entries) ? source.entries : [];
        const entryMap = new Map();
        rawEntries.forEach((entry) => {
          const normalized = normalizeSocialPlannerEntry(
            entry,
            workspaceIds,
            accountIds,
          );
          if (!entryMap.has(normalized.id)) {
            entryMap.set(normalized.id, normalized);
          }
        });

        const entries = Array.from(entryMap.values()).sort((a, b) => {
          const left = new Date(a.scheduledFor || a.createdAt).getTime();
          const right = new Date(b.scheduledFor || b.createdAt).getTime();
          return right - left;
        });

        const activeWorkspaceIdCandidate = String(
          source?.settings?.activeWorkspaceId || "default",
        );
        const activeWorkspaceId = workspaceIds.has(activeWorkspaceIdCandidate)
          ? activeWorkspaceIdCandidate
          : "default";

        return {
          version: 1,
          settings: { activeWorkspaceId },
          workspaces,
          socialAccounts,
          templates,
          entries,
        };
      }.apply(this, args);
    },

    readSocialPlannerData(...args) {
      const {
        getSocialPlannerFilePath,
        fs,
        createDefaultSocialPlannerData,
        normalizeSocialPlannerData,
      } = context;
      return function readSocialPlannerData() {
        const filePath = getSocialPlannerFilePath();
        if (!fs.existsSync(filePath)) {
          return createDefaultSocialPlannerData();
        }

        const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return normalizeSocialPlannerData(raw);
      }.apply(this, args);
    },

    writeSocialPlannerData(...args) {
      const { normalizeSocialPlannerData, fs, getSocialPlannerFilePath } =
        context;
      return function writeSocialPlannerData(data) {
        const normalized = normalizeSocialPlannerData(data);
        fs.writeFileSync(
          getSocialPlannerFilePath(),
          JSON.stringify(normalized, null, 4),
          "utf8",
        );
      }.apply(this, args);
    },

    resolveSocialPlannerDateRange(...args) {
      const { SOCIAL_PLANNER_PERIOD_PRESETS } = context;
      return function resolveSocialPlannerDateRange(query = {}) {
        const periodRaw = String(query.period || "")
          .trim()
          .toLowerCase();
        const presetDays =
          SOCIAL_PLANNER_PERIOD_PRESETS[periodRaw] ||
          SOCIAL_PLANNER_PERIOD_PRESETS["7d"];
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const start = new Date(end);
        start.setDate(start.getDate() - (presetDays - 1));
        start.setHours(0, 0, 0, 0);

        if (periodRaw === "custom") {
          const startRaw = String(query.startDate || "").trim();
          const endRaw = String(query.endDate || "").trim();
          const startCustom = new Date(`${startRaw}T00:00:00`);
          const endCustom = new Date(`${endRaw}T23:59:59`);

          if (
            Number.isFinite(startCustom.getTime()) &&
            Number.isFinite(endCustom.getTime()) &&
            startCustom <= endCustom
          ) {
            return {
              period: "custom",
              start: startCustom,
              end: endCustom,
            };
          }
        }

        return {
          period: periodRaw in SOCIAL_PLANNER_PERIOD_PRESETS ? periodRaw : "7d",
          start,
          end,
        };
      }.apply(this, args);
    },

    computeSocialPlannerAnalytics(...args) {
      const { normalizeSocialPlannerMetrics, summarizeEntryEngagement } =
        context;
      return function computeSocialPlannerAnalytics(data, range) {
        const entries = Array.isArray(data?.entries) ? data.entries : [];
        const publishedEntries = entries.filter((entry) => {
          if (!entry?.publishedAt) return false;
          const publishedAt = new Date(entry.publishedAt);
          if (!Number.isFinite(publishedAt.getTime())) return false;
          return publishedAt >= range.start && publishedAt <= range.end;
        });

        const totals = publishedEntries.reduce(
          (acc, entry) => {
            const metrics = normalizeSocialPlannerMetrics(entry.metrics || {});
            acc.likes += metrics.likes;
            acc.comments += metrics.comments;
            acc.shares += metrics.shares;
            acc.reach += metrics.reach;
            acc.clicks += metrics.clicks;
            return acc;
          },
          { likes: 0, comments: 0, shares: 0, reach: 0, clicks: 0 },
        );

        const dayBuckets = new Map();
        const hourBuckets = new Map();

        publishedEntries.forEach((entry) => {
          const publishedAt = new Date(entry.publishedAt);
          const dayName = publishedAt.toLocaleDateString("no-NO", {
            weekday: "long",
          });
          const hourKey = publishedAt.getHours();
          const engagement = summarizeEntryEngagement(entry);

          dayBuckets.set(dayName, (dayBuckets.get(dayName) || 0) + engagement);
          hourBuckets.set(
            hourKey,
            (hourBuckets.get(hourKey) || 0) + engagement,
          );
        });

        const bestDay =
          Array.from(dayBuckets.entries()).sort(
            (a, b) => b[1] - a[1],
          )[0]?.[0] || "Ingen data";
        const bestHour = Array.from(hourBuckets.entries()).sort(
          (a, b) => b[1] - a[1],
        )[0]?.[0];

        const topEntries = publishedEntries
          .map((entry) => ({
            id: entry.id,
            title: entry.title,
            status: entry.status,
            publishedAt: entry.publishedAt,
            engagement: summarizeEntryEngagement(entry),
            metrics: normalizeSocialPlannerMetrics(entry.metrics || {}),
          }))
          .sort((a, b) => b.engagement - a.engagement)
          .slice(0, 8);

        return {
          range: {
            period: range.period,
            startDate: range.start.toISOString().slice(0, 10),
            endDate: range.end.toISOString().slice(0, 10),
          },
          overview: {
            publishedPosts: publishedEntries.length,
            ...totals,
            bestDay,
            bestHour: Number.isFinite(bestHour)
              ? `${String(bestHour).padStart(2, "0")}:00`
              : "Ingen data",
          },
          topEntries,
        };
      }.apply(this, args);
    },

    buildSocialPlannerCaption(...args) {
      return function buildSocialPlannerCaption(
        entry = {},
        platform = "facebook",
      ) {
        const variant = String(entry?.variants?.[platform] || "").trim();
        const master = String(entry?.masterText || "").trim();
        const title = String(entry?.title || "").trim();
        const hashtags = Array.isArray(entry?.hashtags)
          ? entry.hashtags.join(" ")
          : "";
        const linkUrl = String(entry?.linkUrl || "").trim();

        return [variant || master || title, linkUrl, hashtags]
          .filter(Boolean)
          .join("\n\n")
          .trim();
      }.apply(this, args);
    },

    buildSocialPlannerCaptionMap(...args) {
      const {
        SOCIAL_PLATFORMS,
        normalizePlannerPlatform,
        buildSocialPlannerCaption,
      } = context;
      return function buildSocialPlannerCaptionMap(
        entry = {},
        platforms = SOCIAL_PLATFORMS,
      ) {
        const source =
          Array.isArray(platforms) && platforms.length > 0
            ? platforms
            : SOCIAL_PLATFORMS;
        const captions = {};
        const seen = new Set();

        source.forEach((platformValue) => {
          const platform = normalizePlannerPlatform(platformValue);
          if (seen.has(platform)) return;
          seen.add(platform);
          captions[platform] = buildSocialPlannerCaption(entry, platform);
        });

        return captions;
      }.apply(this, args);
    },

    buildSocialPlannerPublishTargetMap(...args) {
      const { normalizePlannerPlatform, SOCIAL_PLATFORMS } = context;
      return function buildSocialPlannerPublishTargetMap(platforms = []) {
        const selected = new Set();

        (Array.isArray(platforms) ? platforms : []).forEach((platformValue) => {
          selected.add(normalizePlannerPlatform(platformValue));
        });

        return SOCIAL_PLATFORMS.reduce((accumulator, platform) => {
          accumulator[platform] = selected.has(platform);
          return accumulator;
        }, {});
      }.apply(this, args);
    },

    buildSocialPlannerTargetAccountPayload(...args) {
      const { normalizePlannerPlatform } = context;
      return function buildSocialPlannerTargetAccountPayload(accounts = []) {
        return (Array.isArray(accounts) ? accounts : []).map((account) => ({
          id: String(account?.id || ""),
          platform: normalizePlannerPlatform(account?.platform || ""),
          displayName: String(account?.displayName || ""),
          externalAccountId: String(account?.externalAccountId || ""),
        }));
      }.apply(this, args);
    },

    resolveSocialImage(...args) {
      const { extractFirstImageSrcFromHtml, resolveAbsoluteAssetUrl } = context;
      return function resolveSocialImage(post = {}, req) {
        const featuredImageRaw = String(post.image || "").trim();
        const contentImageRaw = extractFirstImageSrcFromHtml(post.content);
        const selectedRaw = featuredImageRaw || contentImageRaw;
        const absolute = resolveAbsoluteAssetUrl(selectedRaw, req);

        return {
          featuredImageRaw,
          contentImageRaw,
          selectedRaw,
          absolute,
        };
      }.apply(this, args);
    },

    truncateForSocial(...args) {
      return function truncateForSocial(text = "", limit = 220) {
        const normalized = String(text || "")
          .replace(/\s+/g, " ")
          .trim();
        if (normalized.length <= limit) return normalized;
        return `${normalized.slice(0, Math.max(0, limit - 1)).trim()}…`;
      }.apply(this, args);
    },

    resolveSocialExcerpt(...args) {
      const { firstNonEmptyString, stripHtmlToText } = context;
      return function resolveSocialExcerpt(post = {}, language = "no") {
        const isEnglish = String(language || "").toLowerCase() === "en";
        const primaryHtml = isEnglish
          ? String(post.contentEn || "").trim()
          : String(post.content || "").trim();
        const fallbackHtml = isEnglish
          ? String(post.content || "").trim()
          : String(post.contentEn || "").trim();
        const contentExcerpt = firstNonEmptyString([
          stripHtmlToText(primaryHtml),
          stripHtmlToText(fallbackHtml),
        ]);

        if (isEnglish) {
          return firstNonEmptyString([
            post.excerptEn,
            post.excerpt,
            post.detailSummaryEn,
            post.detailSummary,
            contentExcerpt,
          ]);
        }

        return firstNonEmptyString([
          post.excerpt,
          post.detailSummary,
          post.excerptEn,
          post.detailSummaryEn,
          contentExcerpt,
        ]);
      }.apply(this, args);
    },

    extractSocialWebhookDeliveryMeta(...args) {
      const {
        extractSocialPlannerMetricsPatch,
        firstDefinedValue,
        normalizePlannerShortText,
        firstNonEmptyString,
        normalizePlannerUrl,
        normalizeIsoDateTime,
      } = context;
      return function extractSocialWebhookDeliveryMeta(payload = null) {
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
          return {
            externalPostId: "",
            externalMediaId: "",
            externalUrl: "",
            publishedAt: "",
            metricsPatch: {},
          };
        }

        const metricsSources = [
          payload.metrics,
          payload.insights,
          payload.analytics,
          payload.data?.metrics,
          payload.result?.metrics,
          payload.post?.metrics,
        ];

        let metricsPatch = {};
        metricsSources.forEach((source) => {
          const nextPatch = extractSocialPlannerMetricsPatch(source);
          if (Object.keys(nextPatch).length > 0) {
            metricsPatch = { ...metricsPatch, ...nextPatch };
          }
        });

        if (Object.keys(metricsPatch).length === 0) {
          metricsPatch = extractSocialPlannerMetricsPatch({
            likes: firstDefinedValue([
              payload.likes,
              payload.like_count,
              payload.data?.likes,
            ]),
            comments: firstDefinedValue([
              payload.comments,
              payload.comment_count,
              payload.data?.comments,
            ]),
            shares: firstDefinedValue([
              payload.shares,
              payload.share_count,
              payload.data?.shares,
            ]),
            reach: firstDefinedValue([
              payload.reach,
              payload.impressions,
              payload.data?.reach,
              payload.data?.impressions,
            ]),
            clicks: firstDefinedValue([
              payload.clicks,
              payload.click_count,
              payload.data?.clicks,
            ]),
          });
        }

        const externalPostId = normalizePlannerShortText(
          firstNonEmptyString([
            payload.externalPostId,
            payload.external_post_id,
            payload.postId,
            payload.post_id,
            payload.providerPostId,
            payload.provider_post_id,
            payload.post?.externalPostId,
            payload.post?.postId,
            payload.post?.id,
            payload.data?.postId,
            payload.data?.id,
            payload.result?.postId,
            payload.result?.id,
            payload.id,
            payload.urn,
          ]),
          240,
        );

        const externalMediaId = normalizePlannerShortText(
          firstNonEmptyString([
            payload.externalMediaId,
            payload.external_media_id,
            payload.mediaId,
            payload.media_id,
            payload.creationId,
            payload.creation_id,
            payload.data?.mediaId,
            payload.data?.creationId,
            payload.result?.mediaId,
            payload.result?.creationId,
          ]),
          240,
        );

        const externalUrl = normalizePlannerUrl(
          firstNonEmptyString([
            payload.externalUrl,
            payload.external_url,
            payload.permalink,
            payload.permalink_url,
            payload.postUrl,
            payload.post_url,
            payload.url,
            payload.data?.url,
            payload.data?.permalink,
            payload.result?.url,
          ]),
        );

        const publishedAtRaw = firstNonEmptyString([
          payload.publishedAt,
          payload.published_at,
          payload.timestamp,
          payload.post?.publishedAt,
          payload.data?.publishedAt,
          payload.result?.publishedAt,
        ]);
        const publishedAt = publishedAtRaw
          ? normalizeIsoDateTime(publishedAtRaw, new Date().toISOString())
          : "";

        return {
          externalPostId,
          externalMediaId,
          externalUrl,
          publishedAt,
          metricsPatch,
        };
      }.apply(this, args);
    },

    postPayloadToSocialWebhook(...args) {
      const {
        parseBooleanFlag,
        crypto,
        getFetch,
        resolveWebhookHost,
        summarizeWebhookResponseBody,
        parseWebhookResponsePayload,
        isWebhookPayloadExplicitFailure,
        extractSocialWebhookDeliveryMeta,
      } = context;
      return async function postPayloadToSocialWebhook(
        payload = {},
        options = {},
      ) {
        const allowSimulatedWithoutConfig = parseBooleanFlag(
          options.allowSimulatedWithoutConfig,
          false,
        );
        const allowSimulatedOnFailure = parseBooleanFlag(
          options.allowSimulatedOnFailure,
          false,
        );
        const webhookUrl = String(process.env.SOCIAL_WEBHOOK_URL || "").trim();
        if (!webhookUrl) {
          if (allowSimulatedWithoutConfig) {
            return {
              sent: false,
              simulated: true,
              code: "social_webhook_simulated",
              details:
                "Publisert lokalt uten webhook (SOCIAL_WEBHOOK_URL mangler).",
              httpStatus: 200,
            };
          }
          return {
            sent: false,
            code: "social_webhook_not_configured",
            details: "Set SOCIAL_WEBHOOK_URL to enable social auto-post.",
            httpStatus: 200,
          };
        }

        const body = JSON.stringify(payload || {});
        const webhookSecret = String(
          process.env.SOCIAL_WEBHOOK_SECRET || "",
        ).trim();
        const requestedTimeout = Number.parseInt(
          process.env.SOCIAL_WEBHOOK_TIMEOUT_MS,
          10,
        );
        const timeoutMs = Number.isFinite(requestedTimeout)
          ? Math.max(1000, Math.min(requestedTimeout, 20000))
          : 8000;

        const headers = {
          "Content-Type": "application/json",
          "User-Agent": String(
            options.userAgent || "tk-design-social-autopost",
          ),
        };

        if (webhookSecret) {
          const signature = crypto
            .createHmac("sha256", webhookSecret)
            .update(body)
            .digest("hex");
          headers["X-TK-Signature"] = signature;
        }

        try {
          const fetch = await getFetch();
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), timeoutMs);
          let response;

          try {
            response = await fetch(webhookUrl, {
              method: "POST",
              headers,
              body,
              signal: controller.signal,
            });
          } finally {
            clearTimeout(timeout);
          }

          if (!response.ok) {
            const responseBody = await response.text().catch(() => "");
            const webhookHost = resolveWebhookHost(webhookUrl);
            const hostHint = webhookHost ? ` (${webhookHost})` : "";

            if (allowSimulatedOnFailure) {
              return {
                sent: false,
                simulated: true,
                code: "social_webhook_simulated",
                details: `Publisert lokalt fordi webhook svarte med ${response.status}${hostHint}.`,
                httpStatus: 200,
              };
            }

            if (response.status === 404) {
              return {
                sent: false,
                error: "Social webhook failed",
                code: "social_webhook_not_found",
                details: `Webhook URL returned 404${hostHint}. The endpoint is likely deleted or inactive. Update SOCIAL_WEBHOOK_URL in server environment variables.`,
                httpStatus: 502,
              };
            }

            const providerMessage = summarizeWebhookResponseBody(responseBody);
            const providerHint = providerMessage
              ? ` Provider response: ${providerMessage}`
              : "";
            return {
              sent: false,
              error: "Social webhook failed",
              code: "social_webhook_http_error",
              details: `Webhook responded with ${response.status}${hostHint}.${providerHint}`,
              httpStatus: 502,
            };
          }

          const responseBody = await response.text().catch(() => "");
          const responseContentType =
            response.headers?.get?.("content-type") || "";
          const parsedPayload = parseWebhookResponsePayload(
            responseBody,
            responseContentType,
          );
          if (isWebhookPayloadExplicitFailure(parsedPayload)) {
            const providerMessage = summarizeWebhookResponseBody(
              parsedPayload?.details ||
                parsedPayload?.message ||
                parsedPayload?.error ||
                responseBody,
            );
            return {
              sent: false,
              error: "Social webhook reported failure",
              code: String(parsedPayload?.code || "social_webhook_rejected"),
              details:
                providerMessage || "Webhook svarte med feil i responsen.",
              httpStatus: 502,
            };
          }

          const acceptedHint = summarizeWebhookResponseBody(
            parsedPayload?.details || parsedPayload?.message || responseBody,
          );
          const deliveryMeta = extractSocialWebhookDeliveryMeta(parsedPayload);
          return {
            sent: !!(
              deliveryMeta.externalPostId || deliveryMeta.externalMediaId
            ),
            details:
              deliveryMeta.externalPostId || deliveryMeta.externalMediaId
                ? acceptedHint || "Publisering bekreftet av webhook."
                : "Webhook svarte uten bekreftet innleggs-ID. Kontroller kanalen før et nytt forsøk.",
            httpStatus: 200,
            ...deliveryMeta,
          };
        } catch (error) {
          if (error?.name === "AbortError") {
            if (allowSimulatedOnFailure) {
              return {
                sent: false,
                simulated: true,
                code: "social_webhook_simulated",
                details: "Publisert lokalt fordi webhook fikk timeout.",
                httpStatus: 200,
              };
            }
            return {
              sent: false,
              error: "Social webhook timed out",
              code: "social_webhook_timeout",
              details: "Webhook timed out while publishing.",
              httpStatus: 504,
            };
          }

          if (allowSimulatedOnFailure) {
            return {
              sent: false,
              simulated: true,
              code: "social_webhook_simulated",
              details: `Publisert lokalt fordi webhook feilet: ${error.message || "Ukjent feil"}.`,
              httpStatus: 200,
            };
          }

          return {
            sent: false,
            error: "Social webhook error",
            code: "social_webhook_fetch_failed",
            details: `Webhook request failed: ${error.message || "Ukjent nettverksfeil"}`,
            httpStatus: 502,
          };
        }
      }.apply(this, args);
    },

    publishToFacebookPageApi(...args) {
      const { getFetch } = context;
      return async function publishToFacebookPageApi({
        message,
        link,
        imageUrl,
      }) {
        const pageId = String(process.env.FB_PAGE_ID || "").trim();
        const token = String(process.env.FB_PAGE_ACCESS_TOKEN || "").trim();

        if (!pageId || !token) {
          return {
            ok: false,
            error:
              "FB_PAGE_ID eller FB_PAGE_ACCESS_TOKEN mangler i miljøvariabler.",
          };
        }

        try {
          const fetch = await getFetch();
          let url, body;

          if (imageUrl) {
            url = `https://graph.facebook.com/${/^v\d+\.\d+$/.test(process.env.META_GRAPH_API_VERSION || "") ? process.env.META_GRAPH_API_VERSION : "v25.0"}/${pageId}/photos`;
            body = new URLSearchParams({
              url: imageUrl,
              caption: message || "",
              access_token: token,
            });
          } else {
            url = `https://graph.facebook.com/${/^v\d+\.\d+$/.test(process.env.META_GRAPH_API_VERSION || "") ? process.env.META_GRAPH_API_VERSION : "v25.0"}/${pageId}/feed`;
            body = new URLSearchParams({
              message: message || "",
              link: link || "",
              access_token: token,
            });
          }

          const response = await fetch(url, { method: "POST", body });
          const data = await response.json();

          if (!response.ok || data.error || !(data.id || data.post_id)) {
            return {
              ok: false,
              error: data.error?.message || "Facebook Graph API feilet.",
            };
          }

          return {
            ok: true,
            id: data.id || data.post_id,
            url: `https://facebook.com/${data.id || data.post_id}`,
          };
        } catch (err) {
          return { ok: false, error: err.message };
        }
      }.apply(this, args);
    },

    publishToInstagramApi(...args) {
      const { getFetch } = context;
      return async function publishToInstagramApi({ caption, imageUrl }) {
        const igId = String(process.env.INSTAGRAM_ACCOUNT_ID || "").trim();
        const token = String(process.env.FB_PAGE_ACCESS_TOKEN || "").trim();

        if (!igId || !token) {
          return {
            ok: false,
            error:
              "INSTAGRAM_ACCOUNT_ID eller FB_PAGE_ACCESS_TOKEN mangler i miljøvariabler.",
          };
        }

        if (!imageUrl) {
          return {
            ok: false,
            error: "Instagram krever et gyldig bilde for publisering via API.",
          };
        }

        try {
          const fetch = await getFetch();

          // Step 1: Create Container
          const containerRes = await fetch(
            `https://graph.facebook.com/${/^v\d+\.\d+$/.test(process.env.META_GRAPH_API_VERSION || "") ? process.env.META_GRAPH_API_VERSION : "v25.0"}/${igId}/media`,
            {
              method: "POST",
              body: new URLSearchParams({
                image_url: imageUrl,
                caption: caption || "",
                access_token: token,
              }),
            },
          );
          const containerData = await containerRes.json();

          if (!containerRes.ok || containerData.error || !containerData.id) {
            return {
              ok: false,
              error:
                containerData.error?.message ||
                "Instagram Container API feilet.",
            };
          }

          const creationId = containerData.id;

          // Step 2: Publish Container
          const publishRes = await fetch(
            `https://graph.facebook.com/${/^v\d+\.\d+$/.test(process.env.META_GRAPH_API_VERSION || "") ? process.env.META_GRAPH_API_VERSION : "v25.0"}/${igId}/media_publish`,
            {
              method: "POST",
              body: new URLSearchParams({
                creation_id: creationId,
                access_token: token,
              }),
            },
          );
          const publishData = await publishRes.json();

          if (!publishRes.ok || publishData.error || !publishData.id) {
            return {
              ok: false,
              error:
                publishData.error?.message || "Instagram Publish API feilet.",
            };
          }

          return { ok: true, id: publishData.id };
        } catch (err) {
          return { ok: false, error: err.message };
        }
      }.apply(this, args);
    },

    publishToLinkedInCompanyApi(...args) {
      const { getFetch } = context;
      return async function publishToLinkedInCompanyApi({ text, title, url }) {
        const orgId = String(process.env.LINKEDIN_ORGANIZATION_ID || "").trim();
        const token = String(process.env.LINKEDIN_ACCESS_TOKEN || "").trim();

        if (!orgId || !token) {
          return {
            ok: false,
            error:
              "LINKEDIN_ORGANIZATION_ID eller LINKEDIN_ACCESS_TOKEN mangler i miljøvariabler.",
          };
        }

        try {
          const fetch = await getFetch();
          const payload = {
            author: `urn:li:organization:${orgId}`,
            commentary: text || "",
            visibility: "PUBLIC",
            distribution: {
              feedDistribution: "MAIN_FEED",
              targetEntities: [],
              thirdPartyDistributionChannels: [],
            },
            lifecycleState: "PUBLISHED",
            isReshareDisabledByAuthor: false,
            ...(url
              ? {
                  content: {
                    article: { source: url, title: title || "TK-design" },
                  },
                }
              : {}),
          };

          const response = await fetch("https://api.linkedin.com/rest/posts", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "X-Restli-Protocol-Version": "2.0.0",
              "LinkedIn-Version": /^\d{6}$/.test(
                process.env.LINKEDIN_API_VERSION || "",
              )
                ? process.env.LINKEDIN_API_VERSION
                : "202609",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            return {
              ok: false,
              error: `LinkedIn API feilet (${response.status}): ${errorText}`,
            };
          }

          const data = await response.json().catch(() => ({}));
          const id = data.id || response.headers?.get?.("x-restli-id");
          if (!id)
            return {
              ok: false,
              error: "LinkedIn bekreftet ikke en innleggs-ID.",
            };
          return { ok: true, id };
        } catch (err) {
          return { ok: false, error: err.message };
        }
      }.apply(this, args);
    },

    getSocialPlannerState(...args) {
      const {
        normalizeSocialPlannerData,
        readSiteDataWithFallback,
        readSocialPlannerData,
      } = context;
      return async function getSocialPlannerState() {
        return normalizeSocialPlannerData(
          await readSiteDataWithFallback(
            "socialPlanner",
            readSocialPlannerData,
          ),
        );
      }.apply(this, args);
    },

    saveSocialPlannerState(...args) {
      const {
        persistSiteData,
        normalizeSocialPlannerData,
        writeSocialPlannerData,
      } = context;
      return async function saveSocialPlannerState(state) {
        return persistSiteData(
          "socialPlanner",
          normalizeSocialPlannerData(state),
          writeSocialPlannerData,
        );
      }.apply(this, args);
    },

    resolveSocialPlannerWorkspace(...args) {
      return function resolveSocialPlannerWorkspace(state, workspaceId = "") {
        const workspaces = Array.isArray(state?.workspaces)
          ? state.workspaces
          : [];
        const targetId = String(
          workspaceId || state?.settings?.activeWorkspaceId || "default",
        );
        return (
          workspaces.find((workspace) => workspace.id === targetId) ||
          workspaces[0] || {
            id: "default",
            name: "TK-design",
            timezone: "Europe/Oslo",
          }
        );
      }.apply(this, args);
    },

    normalizeSocialPlannerWorkspaceId(...args) {
      const { normalizePlannerShortText } = context;
      return function normalizeSocialPlannerWorkspaceId(
        value,
        fallback = "default",
      ) {
        const normalized = normalizePlannerShortText(value || fallback, 60)
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
        return normalized || fallback;
      }.apply(this, args);
    },

    resolveSocialPlannerWorkspaceId(...args) {
      return function resolveSocialPlannerWorkspaceId(
        state,
        requestedWorkspaceId = "",
      ) {
        const workspaces = Array.isArray(state?.workspaces)
          ? state.workspaces
          : [];
        if (workspaces.length === 0) {
          return "default";
        }

        const targetId = String(
          requestedWorkspaceId ||
            state?.settings?.activeWorkspaceId ||
            workspaces[0].id ||
            "default",
        );
        return workspaces.some((workspace) => workspace.id === targetId)
          ? targetId
          : workspaces[0].id;
      }.apply(this, args);
    },

    getSocialPlannerWorkspaceIds(...args) {
      return function getSocialPlannerWorkspaceIds(state) {
        const workspaces = Array.isArray(state?.workspaces)
          ? state.workspaces
          : [];
        return new Set(workspaces.map((workspace) => workspace.id));
      }.apply(this, args);
    },

    getSocialPlannerAccountIds(...args) {
      return function getSocialPlannerAccountIds(state) {
        const accounts = Array.isArray(state?.socialAccounts)
          ? state.socialAccounts
          : [];
        return new Set(accounts.map((account) => account.id));
      }.apply(this, args);
    },

    withSocialPlannerMeta(...args) {
      const {
        resolveSocialPlannerWorkspaceId,
        resolveSocialPlannerWorkspace,
        SOCIAL_PLATFORMS,
        SOCIAL_ENTRY_STATUSES,
      } = context;
      return function withSocialPlannerMeta(state, workspaceId = "") {
        const activeWorkspaceId = resolveSocialPlannerWorkspaceId(
          state,
          workspaceId,
        );
        const activeWorkspace = resolveSocialPlannerWorkspace(
          state,
          activeWorkspaceId,
        );

        return {
          ...state,
          settings: {
            ...(state?.settings || {}),
            activeWorkspaceId,
          },
          activeWorkspace,
          supports: {
            platforms: SOCIAL_PLATFORMS.slice(),
            statuses: Array.from(SOCIAL_ENTRY_STATUSES),
          },
        };
      }.apply(this, args);
    },

    resolveSocialPlannerPublishMediaUrl(...args) {
      const { resolveAbsoluteAssetUrl, normalizePlannerUrl, parseBooleanFlag } =
        context;
      return function resolveSocialPlannerPublishMediaUrl(
        entry,
        req,
        options = {},
      ) {
        const safeReq = req || { get: () => "", protocol: "https" };
        const explicitMedia = resolveAbsoluteAssetUrl(
          options?.mediaUrl || "",
          safeReq,
        );
        if (explicitMedia) {
          return normalizePlannerUrl(explicitMedia);
        }

        const primaryMedia = resolveAbsoluteAssetUrl(
          entry?.mediaUrl || "",
          safeReq,
        );
        if (primaryMedia) {
          return normalizePlannerUrl(primaryMedia);
        }

        const useDefaultFallback = parseBooleanFlag(
          options?.useDefaultFallback,
          false,
        );
        if (!useDefaultFallback) {
          return "";
        }

        const fallbackFromOptions = String(
          options?.fallbackImageUrl || "",
        ).trim();
        const fallbackFromEnv = String(
          process.env.SOCIAL_PLANNER_DEFAULT_IMAGE_URL || "",
        ).trim();
        const fallbackCandidate = fallbackFromOptions || fallbackFromEnv;
        const fallbackMedia = resolveAbsoluteAssetUrl(
          fallbackCandidate,
          safeReq,
        );
        return normalizePlannerUrl(fallbackMedia);
      }.apply(this, args);
    },

    resolveSocialPlannerMetricsSyncUrl(...args) {
      const { getSiteBaseUrl } = context;
      return function resolveSocialPlannerMetricsSyncUrl(req) {
        const safeReq = req || { get: () => "", protocol: "https" };
        const siteBase =
          getSiteBaseUrl(safeReq) || String(process.env.SITE_URL || "").trim();
        if (!siteBase) return "";
        return `${String(siteBase).replace(/\/+$/, "")}/api/social-planner/metrics/sync`;
      }.apply(this, args);
    },

    buildSocialPlannerEntryPayload(...args) {
      const {
        getSiteBaseUrl,
        normalizePlannerPlatform,
        buildSocialPlannerCaption,
        resolveSocialPlannerPublishMediaUrl,
        normalizePlannerUrl,
        buildSocialPlannerTargetAccountPayload,
        buildSocialPlannerPublishTargetMap,
        buildSocialPlannerCaptionMap,
        SOCIAL_PLATFORMS,
        resolveSocialPlannerMetricsSyncUrl,
      } = context;
      return function buildSocialPlannerEntryPayload(
        entry,
        account,
        workspace,
        req,
        options = {},
      ) {
        const safeReq = req || { get: () => "", protocol: "https" };
        const siteBase =
          getSiteBaseUrl(safeReq) || String(process.env.SITE_URL || "").trim();
        const platform = normalizePlannerPlatform(
          account?.platform || "facebook",
        );
        const caption = buildSocialPlannerCaption(entry, platform);
        const mediaUrl = resolveSocialPlannerPublishMediaUrl(
          entry,
          safeReq,
          options,
        );
        const linkUrl = normalizePlannerUrl(entry?.linkUrl || "");
        const targetAccounts = buildSocialPlannerTargetAccountPayload(
          options?.targetAccounts || [],
        );
        const targetAccountIds = targetAccounts
          .map((row) => String(row.id || "").trim())
          .filter(Boolean);
        const selectedPlatforms =
          targetAccounts.length > 0
            ? Array.from(
                new Set(
                  targetAccounts.map((row) =>
                    normalizePlannerPlatform(row.platform || ""),
                  ),
                ),
              )
            : [platform];
        const publishTargets =
          buildSocialPlannerPublishTargetMap(selectedPlatforms);
        const captionMap = buildSocialPlannerCaptionMap(
          entry,
          SOCIAL_PLATFORMS,
        );
        const selectedCaptionMap = buildSocialPlannerCaptionMap(
          entry,
          selectedPlatforms,
        );
        const variants =
          entry?.variants &&
          typeof entry.variants === "object" &&
          !Array.isArray(entry.variants)
            ? { ...entry.variants }
            : {};
        const mediaAsset = mediaUrl
          ? {
              type: "image",
              url: mediaUrl,
              image: mediaUrl,
              imageUrl: mediaUrl,
              image_url: mediaUrl,
              mediaUrl: mediaUrl,
              media_url: mediaUrl,
            }
          : null;
        const mediaAssets = mediaAsset ? [mediaAsset] : [];

        return {
          event: "social.planner.publish",
          sentAt: new Date().toISOString(),
          source: "tk-design-social-planner",
          site: siteBase,
          platform,
          platforms: selectedPlatforms,
          publishTargets,
          targetAccountIds,
          targetAccounts,
          image: mediaUrl,
          image_url: mediaUrl,
          imageUrl: mediaUrl,
          media_url: mediaUrl,
          mediaUrl: mediaUrl,
          postImage: mediaUrl,
          attachmentUrl: mediaUrl,
          asset: mediaAsset,
          assets: mediaAssets,
          workspace: {
            id: String(workspace?.id || "default"),
            name: String(workspace?.name || "Workspace"),
          },
          account: {
            id: String(account?.id || ""),
            platform,
            displayName: String(account?.displayName || ""),
            externalAccountId: String(account?.externalAccountId || ""),
          },
          post: {
            id: String(entry?.id || ""),
            title: String(entry?.title || ""),
            caption,
            hashtags: Array.isArray(entry?.hashtags) ? entry.hashtags : [],
            mediaUrl,
            media_url: mediaUrl,
            image: mediaUrl,
            imageUrl: mediaUrl,
            image_url: mediaUrl,
            attachmentUrl: mediaUrl,
            asset: mediaAsset,
            assets: mediaAssets,
            url: linkUrl,
            linkUrl,
            variants,
            platforms: selectedPlatforms,
            targetAccountIds,
            scheduledFor: String(entry?.scheduledFor || ""),
            status: String(entry?.status || "draft"),
          },
          social: {
            hashtags: Array.isArray(entry?.hashtags) ? entry.hashtags : [],
            captions: {
              no: caption,
              en: caption,
            },
            captionsByPlatform: captionMap,
            selectedCaptionsByPlatform: selectedCaptionMap,
            publishTargets,
            image: mediaUrl,
            imageUrl: mediaUrl,
            image_url: mediaUrl,
            mediaUrl: mediaUrl,
            media_url: mediaUrl,
            asset: mediaAsset,
            assets: mediaAssets,
          },
          selection: {
            platforms: selectedPlatforms,
            publishTargets,
            targetAccountIds,
            targetAccounts,
          },
          sync: {
            metricsUrl: resolveSocialPlannerMetricsSyncUrl(safeReq),
            entryId: String(entry?.id || ""),
            accountId: String(account?.id || ""),
            platform,
            requiresToken: !!String(
              process.env.SOCIAL_METRICS_SYNC_TOKEN || "",
            ).trim(),
          },
        };
      }.apply(this, args);
    },

    summarizeSocialPlannerDelivery(...args) {
      const { normalizePlannerPlatform } = context;
      return function summarizeSocialPlannerDelivery(delivery = []) {
        const items = Array.isArray(delivery) ? delivery : [];
        if (items.length === 0) return "";

        const summary = items
          .map((row) => {
            const platform = normalizePlannerPlatform(
              row?.platform || "custom",
            );
            const details = String(row?.details || "").trim();
            if (details) {
              return `${platform}: ${details}`;
            }
            return `${platform}: ${row?.sent ? "ok" : "feil"}`;
          })
          .join(" | ");

        return summary.slice(0, 600);
      }.apply(this, args);
    },

    publishSocialPlannerEntryById(...args) {
      const {
        normalizeSocialPlannerData,
        getSocialPlannerState,
        resolveSocialPlannerWorkspace,
        parseBooleanFlag,
        normalizeSocialPlannerEntry,
        saveSocialPlannerState,
        normalizePlannerPlatform,
        resolveSocialPlannerPublishMediaUrl,
        resolveAbsoluteAssetUrl,
        buildSocialPlannerEntryPayload,
        postPayloadToSocialWebhook,
        upsertSocialPlannerEntryPublication,
        summarizeSocialPlannerDelivery,
      } = context;
      return async function publishSocialPlannerEntryById(
        entryId,
        req,
        options = {},
      ) {
        const entryIdNormalized = String(entryId || "").trim();
        if (!entryIdNormalized) {
          return { ok: false, httpStatus: 400, error: "Entry id is required." };
        }

        const state =
          options?.stateOverride &&
          typeof options.stateOverride === "object" &&
          !Array.isArray(options.stateOverride)
            ? normalizeSocialPlannerData(options.stateOverride)
            : await getSocialPlannerState();
        const entries = Array.isArray(state.entries) ? state.entries : [];
        const entryIndex = entries.findIndex(
          (row) => String(row.id) === entryIdNormalized,
        );

        if (entryIndex < 0) {
          return { ok: false, httpStatus: 404, error: "Entry not found." };
        }

        const entry = entries[entryIndex];
        const workspace = resolveSocialPlannerWorkspace(
          state,
          entry.workspaceId,
        );
        const accounts = Array.isArray(state.socialAccounts)
          ? state.socialAccounts
          : [];
        const targetAccounts = accounts.filter((account) =>
          entry.targetAccountIds.includes(account.id),
        );
        const publishLog = Array.isArray(entry.publishLog)
          ? entry.publishLog.slice(-50)
          : [];
        const allowLocalPublishFallback = parseBooleanFlag(
          process.env.SOCIAL_PLANNER_ALLOW_LOCAL_PUBLISH_FALLBACK,
          false,
        );

        if (targetAccounts.length === 0) {
          entry.status = "failed";
          entry.lastError = "Ingen aktive kontoer er valgt for publisering.";
          entry.updatedAt = new Date().toISOString();
          entries[entryIndex] = normalizeSocialPlannerEntry(
            entry,
            new Set(state.workspaces.map((w) => w.id)),
            new Set(accounts.map((a) => a.id)),
          );
          await saveSocialPlannerState(state);
          return {
            ok: false,
            httpStatus: 400,
            error: entry.lastError,
            details: entry.lastError,
            entry: entries[entryIndex],
          };
        }

        const requiresImage = targetAccounts.some(
          (account) =>
            normalizePlannerPlatform(account?.platform || "") === "instagram",
        );
        const explicitMediaUrl = resolveSocialPlannerPublishMediaUrl(
          entry,
          req,
          { useDefaultFallback: false },
        );
        const resolvedMediaUrl =
          explicitMediaUrl ||
          resolveSocialPlannerPublishMediaUrl(entry, req, {
            ...options,
            useDefaultFallback: requiresImage,
          });

        if (requiresImage && !resolvedMediaUrl) {
          const details =
            "Instagram krever bilde i Social Planner. Legg til bilde i innlegget (Unsplash eller Last opp) før publisering.";
          entry.status = options.keepScheduledOnFail ? "scheduled" : "failed";
          entry.lastError = details;
          entry.updatedAt = new Date().toISOString();
          entries[entryIndex] = normalizeSocialPlannerEntry(
            entry,
            new Set(state.workspaces.map((w) => w.id)),
            new Set(accounts.map((a) => a.id)),
          );
          await saveSocialPlannerState(state);
          return {
            ok: false,
            httpStatus: 400,
            error: details,
            details,
            entry: entries[entryIndex],
            delivery: [],
          };
        }

        entry.status = "publishing";
        entry.lastError = "";
        entry.updatedAt = new Date().toISOString();
        entries[entryIndex] = entry;
        await saveSocialPlannerState(state);

        let successCount = 0;
        let failedCount = 0;
        let latestError = "";
        const delivery = [];

        // Filter ut og håndter inaktive kontoer først
        const activeTargetAccounts = [];
        for (const account of targetAccounts) {
          const platform = normalizePlannerPlatform(account?.platform || "");
          if (String(account.status || "active").toLowerCase() !== "active") {
            failedCount += 1;
            const details = `Konto "${account.displayName}" er ikke aktiv.`;
            latestError = details;
            publishLog.push({
              at: new Date().toISOString(),
              accountId: account.id,
              platform,
              status: "failed",
              details,
            });
            delivery.push({
              accountId: account.id,
              platform,
              sent: false,
              details,
            });
          } else {
            activeTargetAccounts.push(account);
          }
        }

        // Hvis vi har aktive kontoer, send ÉN samlet webhook-forespørsel
        if (activeTargetAccounts.length > 0) {
          const primaryAccount = activeTargetAccounts[0];
          const selectedTargetAccounts = activeTargetAccounts.map(
            (account) => ({
              id: account.id,
              platform: normalizePlannerPlatform(account.platform || ""),
              displayName: account.displayName,
              externalAccountId: account.externalAccountId || "",
            }),
          );

          // Bruk alltid den absolutte media-URL-en for alle plattformer
          const mediaUrlForWebhook =
            explicitMediaUrl ||
            resolvedMediaUrl ||
            resolveAbsoluteAssetUrl(entry.mediaUrl, req);

          const payload = buildSocialPlannerEntryPayload(
            entry,
            primaryAccount,
            workspace,
            req,
            {
              mediaUrl: mediaUrlForWebhook,
              targetAccounts: selectedTargetAccounts,
            },
          );

          const webhookResult = await postPayloadToSocialWebhook(payload, {
            userAgent: "tk-design-social-planner",
            allowSimulatedWithoutConfig: allowLocalPublishFallback,
            allowSimulatedOnFailure: allowLocalPublishFallback,
          });

          // Oppdater status for hver enkelt konto basert på det felles resultatet
          for (const account of activeTargetAccounts) {
            const platform = normalizePlannerPlatform(account.platform || "");
            if (
              webhookResult.sent &&
              !webhookResult.simulated &&
              (webhookResult.externalPostId || webhookResult.externalMediaId)
            ) {
              successCount += 1;
              const successDetails = webhookResult.simulated
                ? webhookResult.details || "Publisert lokalt (simulert)."
                : webhookResult.details || "Publisert via webhook";

              publishLog.push({
                at: new Date().toISOString(),
                accountId: account.id,
                platform,
                status: "published",
                details: successDetails,
              });

              upsertSocialPlannerEntryPublication(entry, {
                accountId: account.id,
                platform,
                externalPostId: webhookResult.externalPostId,
                externalMediaId: webhookResult.externalMediaId,
                externalUrl: webhookResult.externalUrl,
                publishedAt:
                  webhookResult.publishedAt || new Date().toISOString(),
                metricsPatch: webhookResult.metricsPatch || {},
              });

              delivery.push({
                accountId: account.id,
                platform,
                sent: true,
                code: webhookResult.code || "ok",
                details: successDetails,
                externalPostId: webhookResult.externalPostId || "",
                externalMediaId: webhookResult.externalMediaId || "",
                externalUrl: webhookResult.externalUrl || "",
              });
            } else {
              failedCount += 1;
              latestError =
                webhookResult.details ||
                webhookResult.error ||
                "Publisering feilet.";
              publishLog.push({
                at: new Date().toISOString(),
                accountId: account.id,
                platform,
                status: "failed",
                details: latestError,
              });
              delivery.push({
                accountId: account.id,
                platform,
                sent: false,
                code: webhookResult.code || "error",
                details: latestError,
              });
            }
          }
        }

        if (successCount > 0 && failedCount === 0) {
          entry.status = "published";
          entry.publishedAt = new Date().toISOString();
          entry.lastError = "";
        } else if (successCount > 0 && failedCount > 0) {
          entry.status = "partially_published";
          entry.publishedAt = entry.publishedAt || new Date().toISOString();
          entry.lastError = latestError || "Delvis publiseringsfeil.";
        } else {
          entry.status = options.keepScheduledOnFail ? "scheduled" : "failed";
          entry.lastError = latestError || "Publisering feilet.";
        }

        entry.updatedAt = new Date().toISOString();
        entry.publishLog = publishLog.slice(-50);
        entries[entryIndex] = normalizeSocialPlannerEntry(
          entry,
          new Set(state.workspaces.map((w) => w.id)),
          new Set(accounts.map((a) => a.id)),
        );
        const saveResult = await saveSocialPlannerState(state);

        return {
          ok: successCount > 0,
          httpStatus: successCount > 0 ? 200 : 502,
          error: successCount > 0 ? "" : latestError || "Publisering feilet.",
          details:
            summarizeSocialPlannerDelivery(delivery) ||
            (successCount > 0
              ? "Publisering sendt."
              : latestError || "Publisering feilet."),
          entry: entries[entryIndex],
          delivery,
          saveResult,
        };
      }.apply(this, args);
    },

    resolveSocialPlannerSchedulerIntervalMs(...args) {
      return function resolveSocialPlannerSchedulerIntervalMs() {
        const configured = Number.parseInt(
          process.env.SOCIAL_PLANNER_SCHEDULER_INTERVAL_MS,
          10,
        );
        if (!Number.isFinite(configured)) {
          return 60_000;
        }

        return Math.max(15_000, Math.min(configured, 15 * 60_000));
      }.apply(this, args);
    },

    resolveSocialPlannerPublishingStaleMs(...args) {
      return function resolveSocialPlannerPublishingStaleMs() {
        const configured = Number.parseInt(
          process.env.SOCIAL_PLANNER_PUBLISHING_STALE_MS,
          10,
        );
        if (!Number.isFinite(configured)) {
          return 2 * 60_000;
        }

        return Math.max(30_000, Math.min(configured, 30 * 60_000));
      }.apply(this, args);
    },

    createSocialPlannerSchedulerRequestContext(...args) {
      return function createSocialPlannerSchedulerRequestContext() {
        const siteUrl = String(process.env.SITE_URL || "").trim();
        let protocol = "https";
        let host = "";

        try {
          const parsed = new URL(siteUrl);
          protocol =
            String(parsed.protocol || "https:").replace(":", "") || "https";
          host = parsed.host || "";
        } catch (error) {
          // Defaults are used when SITE_URL is not a valid URL.
        }

        return {
          protocol,
          get(headerName = "") {
            return String(headerName || "").toLowerCase() === "host"
              ? host
              : "";
          },
        };
      }.apply(this, args);
    },

    isAuthorizedSocialPlannerMetricsSyncRequest(...args) {
      const { firstNonEmptyString, safeCompareSecrets } = context;
      return function isAuthorizedSocialPlannerMetricsSyncRequest(req) {
        const expectedToken = String(
          process.env.SOCIAL_METRICS_SYNC_TOKEN || "",
        ).trim();
        if (!expectedToken) {
          return { ok: true, secured: false };
        }

        const providedToken = firstNonEmptyString([
          req.get("x-social-sync-token"),
          req.get("x-metrics-sync-token"),
          req.query?.token,
          req.body?.token,
        ]);

        return {
          ok: safeCompareSecrets(providedToken, expectedToken),
          secured: true,
        };
      }.apply(this, args);
    },

    normalizeSocialPlannerMetricsSyncUpdate(...args) {
      const {
        normalizePlannerShortText,
        firstNonEmptyString,
        normalizePlannerPlatform,
        normalizePlannerUrl,
        normalizeIsoDateTime,
        extractSocialPlannerMetricsPatch,
        firstDefinedValue,
      } = context;
      return function normalizeSocialPlannerMetricsSyncUpdate(rawUpdate = {}) {
        const source =
          rawUpdate &&
          typeof rawUpdate === "object" &&
          !Array.isArray(rawUpdate)
            ? rawUpdate
            : {};

        const entryId = normalizePlannerShortText(
          firstNonEmptyString([
            source.entryId,
            source.entry_id,
            source.postId,
            source.post_id,
            source.post?.entryId,
            source.post?.id,
            source.data?.entryId,
            source.data?.postId,
          ]),
          120,
        );

        const accountId = normalizePlannerShortText(
          firstNonEmptyString([
            source.accountId,
            source.account_id,
            source.account?.id,
            source.delivery?.accountId,
          ]),
          80,
        );

        const platform = normalizePlannerPlatform(
          firstNonEmptyString([
            source.platform,
            source.account?.platform,
            source.delivery?.platform,
            source.social?.platform,
          ]),
        );

        const externalPostId = normalizePlannerShortText(
          firstNonEmptyString([
            source.externalPostId,
            source.external_post_id,
            source.providerPostId,
            source.provider_post_id,
            source.remotePostId,
            source.remote_post_id,
            source.postExternalId,
            source.post_external_id,
            source.post?.externalPostId,
            source.post?.providerPostId,
            source.data?.externalPostId,
          ]),
          240,
        );

        const externalMediaId = normalizePlannerShortText(
          firstNonEmptyString([
            source.externalMediaId,
            source.external_media_id,
            source.mediaId,
            source.media_id,
            source.creationId,
            source.creation_id,
            source.data?.mediaId,
            source.data?.creationId,
          ]),
          240,
        );

        const externalUrl = normalizePlannerUrl(
          firstNonEmptyString([
            source.externalUrl,
            source.external_url,
            source.postUrl,
            source.post_url,
            source.permalink,
            source.url,
          ]),
        );

        const publishedAtRaw = firstNonEmptyString([
          source.publishedAt,
          source.published_at,
          source.timestamp,
          source.post?.publishedAt,
        ]);
        const nowIso = new Date().toISOString();
        const publishedAt = publishedAtRaw
          ? normalizeIsoDateTime(publishedAtRaw, nowIso)
          : "";

        const metricsPatch = extractSocialPlannerMetricsPatch({
          likes: firstDefinedValue([
            source.metrics?.likes,
            source.likes,
            source.data?.likes,
          ]),
          comments: firstDefinedValue([
            source.metrics?.comments,
            source.comments,
            source.data?.comments,
          ]),
          shares: firstDefinedValue([
            source.metrics?.shares,
            source.shares,
            source.data?.shares,
          ]),
          reach: firstDefinedValue([
            source.metrics?.reach,
            source.metrics?.impressions,
            source.reach,
            source.impressions,
            source.data?.reach,
            source.data?.impressions,
          ]),
          clicks: firstDefinedValue([
            source.metrics?.clicks,
            source.clicks,
            source.data?.clicks,
          ]),
        });

        return {
          entryId,
          accountId,
          platform,
          externalPostId,
          externalMediaId,
          externalUrl,
          publishedAt,
          metricsPatch,
          metricsUpdatedAt: nowIso,
        };
      }.apply(this, args);
    },

    findSocialPlannerEntryIndexForMetricsSync(...args) {
      const {
        normalizePlannerShortText,
        normalizePlannerPlatform,
        normalizeSocialPlannerPublications,
      } = context;
      return function findSocialPlannerEntryIndexForMetricsSync(
        entries = [],
        update = {},
      ) {
        const list = Array.isArray(entries) ? entries : [];
        const entryId = normalizePlannerShortText(update.entryId || "", 120);
        const accountId = normalizePlannerShortText(update.accountId || "", 80);
        const platform = normalizePlannerPlatform(update.platform || "");
        const externalPostId = normalizePlannerShortText(
          update.externalPostId || "",
          240,
        );

        if (entryId) {
          const byId = list.findIndex(
            (entry) => String(entry?.id || "") === entryId,
          );
          if (byId >= 0) return byId;
        }

        if (!externalPostId && !accountId) {
          return -1;
        }

        return list.findIndex((entry) => {
          const publications = normalizeSocialPlannerPublications(
            entry?.platformPublications || [],
          );
          return publications.some((publication) => {
            if (accountId && publication.accountId !== accountId) return false;
            if (platform && publication.platform !== platform) return false;
            if (externalPostId && publication.externalPostId !== externalPostId)
              return false;
            return true;
          });
        });
      }.apply(this, args);
    },

    buildSocialPlannerWorkspaceScopedState(...args) {
      const { resolveSocialPlannerWorkspaceId } = context;
      return function buildSocialPlannerWorkspaceScopedState(
        state,
        workspaceId = "",
      ) {
        const activeWorkspaceId = resolveSocialPlannerWorkspaceId(
          state,
          workspaceId,
        );
        return {
          ...state,
          socialAccounts: (Array.isArray(state?.socialAccounts)
            ? state.socialAccounts
            : []
          ).filter((account) => account.workspaceId === activeWorkspaceId),
          templates: (Array.isArray(state?.templates)
            ? state.templates
            : []
          ).filter((template) => template.workspaceId === activeWorkspaceId),
          entries: (Array.isArray(state?.entries) ? state.entries : []).filter(
            (entry) => entry.workspaceId === activeWorkspaceId,
          ),
        };
      }.apply(this, args);
    },

    normalizeSocialPlannerAssistantAction(...args) {
      const { SOCIAL_PLANNER_ASSISTANT_ALLOWED_ACTIONS } = context;
      return function normalizeSocialPlannerAssistantAction(value = "") {
        const normalized = String(value || "")
          .trim()
          .toLowerCase();
        return SOCIAL_PLANNER_ASSISTANT_ALLOWED_ACTIONS.has(normalized)
          ? normalized
          : "write";
      }.apply(this, args);
    },

    normalizeSocialPlannerAssistantTone(...args) {
      const {
        normalizePlannerShortText,
        SOCIAL_PLANNER_ASSISTANT_ALLOWED_TONES,
      } = context;
      return function normalizeSocialPlannerAssistantTone(value = "") {
        const normalized = normalizePlannerShortText(
          value || "professional",
          40,
        ).toLowerCase();
        return SOCIAL_PLANNER_ASSISTANT_ALLOWED_TONES.has(normalized)
          ? normalized
          : "professional";
      }.apply(this, args);
    },

    normalizeSocialPlannerAssistantPlatforms(...args) {
      const { normalizePlannerPlatform, SOCIAL_PLATFORMS } = context;
      return function normalizeSocialPlannerAssistantPlatforms(value = []) {
        const source = Array.isArray(value) ? value : [];
        const platforms = [];
        const seen = new Set();

        source.forEach((entry) => {
          const platform = normalizePlannerPlatform(entry);
          if (seen.has(platform)) return;
          seen.add(platform);
          platforms.push(platform);
        });

        return platforms.length > 0 ? platforms : SOCIAL_PLATFORMS.slice();
      }.apply(this, args);
    },

    buildSocialPlannerAssistantPrompt(...args) {
      const {
        normalizeSocialPlannerAssistantAction,
        normalizeSocialPlannerAssistantTone,
        normalizePlannerText,
        normalizePlannerVariants,
        normalizePlannerUrl,
        normalizePlannerHashtags,
        normalizeSocialPlannerAssistantPlatforms,
      } = context;
      return function buildSocialPlannerAssistantPrompt(payload = {}) {
        const action = normalizeSocialPlannerAssistantAction(payload.action);
        const tone = normalizeSocialPlannerAssistantTone(payload.tone);
        const prompt = normalizePlannerText(payload.prompt || "", 1200);
        const masterText = normalizePlannerText(payload.masterText || "", 6000);
        const variants = normalizePlannerVariants(payload.variants || {});
        const linkUrl = normalizePlannerUrl(payload.linkUrl || "");
        const hashtags = normalizePlannerHashtags(payload.hashtags || []);
        const selectedPlatforms = normalizeSocialPlannerAssistantPlatforms(
          payload.selectedPlatforms,
        );

        const actionDescriptions = {
          write:
            "Skriv et nytt forslag til innleggstekst basert på instruks og kontekst.",
          improve:
            "Forbedre eksisterende innleggstekst med tydelig hook, flyt og call-to-action.",
          variants:
            "Lag plattformspesifikke varianter til hver valgt plattform.",
          shorten: "Forkort teksten uten å miste hovedbudskapet.",
          expand: "Utvid teksten med mer verdi og konkretisering.",
          hashtags: "Foreslå relevante hashtags og eventuelt en bedre hook.",
        };

        const existingVariantSummary = selectedPlatforms
          .map(
            (platform) =>
              `${platform}: ${String(variants[platform] || "").trim() || "(tom)"}`,
          )
          .join("\n");

        return [
          "Du er en senior SoMe-copywriter for norske bedrifter.",
          `Oppgave: ${actionDescriptions[action] || actionDescriptions.write}`,
          `Tone: ${tone}`,
          `Målplattformer: ${selectedPlatforms.join(", ")}`,
          "Språk: Norsk bokmål.",
          "",
          "Returner KUN gyldig JSON med nøyaktig denne strukturen (ingen markdown, ingen kodeblokker):",
          "{",
          '  "masterText": "string",',
          '  "variants": {',
          '    "facebook": "string",',
          '    "instagram": "string",',
          '    "linkedin": "string",',
          '    "x": "string",',
          '    "tiktok": "string"',
          "  },",
          '  "hashtags": ["#tag1", "#tag2"],',
          '  "notes": "kort forklaring av hva som ble forbedret"',
          "}",
          "",
          "Regler:",
          "- Ingen påfunn eller udokumenterte fakta.",
          "- Kort, konkret og handlingsorientert stil.",
          "- Ikke legg inn URL i masterText hvis lenke er oppgitt separat.",
          "- La felt være tomme hvis de ikke er relevante for oppgaven.",
          "- Hashtags skal være relevante og uten duplikater (maks 12).",
          "",
          `Instruks fra bruker: ${prompt || "(ingen ekstra instruks)"}`,
          `Eksisterende mastertekst: ${masterText || "(tom)"}`,
          `Eksisterende varianter:\n${existingVariantSummary || "(ingen)"}`,
          `Lenke: ${linkUrl || "(ingen)"}`,
          `Eksisterende hashtags: ${hashtags.join(" ") || "(ingen)"}`,
        ].join("\n");
      }.apply(this, args);
    },

    normalizeSocialPlannerAssistantSuggestion(...args) {
      const {
        normalizePlannerVariants,
        normalizePlannerPlatform,
        normalizePlannerText,
        SOCIAL_PLATFORMS,
        normalizePlannerHashtags,
      } = context;
      return function normalizeSocialPlannerAssistantSuggestion(
        payload = {},
        fallbackText = "",
      ) {
        const source =
          payload && typeof payload === "object" && !Array.isArray(payload)
            ? payload
            : {};
        const normalizedVariants = normalizePlannerVariants({});

        const assignVariant = (platformValue = "", textValue = "") => {
          const platform = normalizePlannerPlatform(platformValue);
          const normalizedText = normalizePlannerText(textValue || "", 3000);
          if (!normalizedText) return;
          normalizedVariants[platform] = normalizedText;
        };

        const variantObject =
          source.variants &&
          typeof source.variants === "object" &&
          !Array.isArray(source.variants)
            ? source.variants
            : {};
        Object.entries(variantObject).forEach(([platform, value]) => {
          assignVariant(platform, value);
        });

        const platformVariantsObject =
          source.platformVariants &&
          typeof source.platformVariants === "object" &&
          !Array.isArray(source.platformVariants)
            ? source.platformVariants
            : {};
        Object.entries(platformVariantsObject).forEach(([platform, value]) => {
          assignVariant(platform, value);
        });

        if (Array.isArray(source.variants)) {
          source.variants.forEach((entry) => {
            if (!entry || typeof entry !== "object") return;
            assignVariant(
              entry.platform || entry.channel || entry.name,
              entry.text || entry.caption || entry.value,
            );
          });
        }

        SOCIAL_PLATFORMS.forEach((platform) => {
          if (source[platform]) {
            assignVariant(platform, source[platform]);
          }
        });

        const fallbackMasterText = normalizePlannerText(
          fallbackText || "",
          6000,
        );
        const masterText = normalizePlannerText(
          source.masterText ||
            source.text ||
            source.caption ||
            source.post ||
            fallbackMasterText,
          6000,
        );
        const hashtags = normalizePlannerHashtags(
          source.hashtags || source.tags || source.keywords || [],
        );
        const notes = normalizePlannerText(
          source.notes || source.explanation || source.summary || "",
          400,
        );

        return {
          masterText,
          variants: normalizedVariants,
          hashtags,
          notes,
        };
      }.apply(this, args);
    },

    buildSocialAutopostPayload(...args) {
      const {
        resolveAbsolutePostUrl,
        getBlogPostTitleForUrl,
        resolveSocialImage,
        resolveSocialExcerpt,
        buildPostHashtags,
        truncateForSocial,
        getSiteBaseUrl,
        resolveAbsoluteAssetUrl,
      } = context;
      return function buildSocialAutopostPayload(post = {}, req) {
        const postId = Number(post.id);
        const postUrl = resolveAbsolutePostUrl(
          post.link,
          req,
          postId,
          getBlogPostTitleForUrl(post),
        );
        const socialImage = resolveSocialImage(post, req);
        const titleNo = String(post.title || "").trim();
        const titleEn = String(post.titleEn || "").trim();
        const excerptNo = resolveSocialExcerpt(post, "no");
        const excerptEn = resolveSocialExcerpt(post, "en");
        const hashtags = buildPostHashtags(post);
        const shortUrl = postUrl || "/blog";

        const noCaption = [
          excerptNo ? truncateForSocial(excerptNo, 180) : "",
          shortUrl,
          hashtags.join(" "),
        ]
          .filter(Boolean)
          .join("\n\n");

        const enCaption = [
          excerptEn ? truncateForSocial(excerptEn, 180) : "",
          shortUrl,
          hashtags.join(" "),
        ]
          .filter(Boolean)
          .join("\n\n");

        return {
          event: "blog.published",
          sentAt: new Date().toISOString(),
          source: "tk-design-admin",
          site: getSiteBaseUrl(req),
          post: {
            id: Number.isFinite(postId) ? postId : null,
            title: titleNo,
            titleEn: titleEn || titleNo,
            excerpt: excerptNo,
            excerptEn: excerptEn || excerptNo,
            category: String(post.category || "").trim(),
            categories: Array.isArray(post.categories) ? post.categories : [],
            tags: Array.isArray(post.tags) ? post.tags : [],
            date: String(post.date || "").trim(),
            dateIso: String(post.dateIso || "").trim(),
            author: String(post.author || "").trim(),
            image: socialImage.absolute,
            imageRaw: socialImage.featuredImageRaw,
            imageFromContent: resolveAbsoluteAssetUrl(
              socialImage.contentImageRaw,
              req,
            ),
            url: shortUrl,
            link: String(post.link || "").trim(),
          },
          social: {
            hashtags,
            captions: {
              no: noCaption,
              en: enCaption,
            },
          },
        };
      }.apply(this, args);
    },
  };
};
