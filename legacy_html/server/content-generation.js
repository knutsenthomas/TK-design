// content generation. Dependencies are resolved when an operation runs.
module.exports = function createFeature(context) {
  return {
    normalizeAiAttachmentMimeType(...args) {
      const { inferMimeTypeFromFileName } = context;
      return function normalizeAiAttachmentMimeType(file = {}) {
        const rawMime = String(file.mimetype || "")
          .trim()
          .toLowerCase();
        if (rawMime && rawMime !== "application/octet-stream") {
          return rawMime;
        }

        return inferMimeTypeFromFileName(file.originalname);
      }.apply(this, args);
    },

    isSupportedAiAttachmentMimeType(...args) {
      return function isSupportedAiAttachmentMimeType(mimeType = "") {
        if (!mimeType) return false;
        if (mimeType.startsWith("image/")) return true;
        if (mimeType === "application/pdf") return true;
        if (mimeType === "text/plain" || mimeType === "text/markdown")
          return true;
        return false;
      }.apply(this, args);
    },

    normalizeGeminiModelName(...args) {
      return function normalizeGeminiModelName(modelName = "") {
        return String(modelName || "")
          .trim()
          .replace(/^models\//i, "");
      }.apply(this, args);
    },

    isGeminiModelNotFoundError(...args) {
      return function isGeminiModelNotFoundError(error) {
        const message = String(error?.message || error || "");
        return /\b404\b|is not found for API version|not supported for generateContent|models?\/[a-z0-9._:-]+\s+is not found/i.test(
          message,
        );
      }.apply(this, args);
    },

    getGeminiModelCandidates(...args) {
      const { normalizeGeminiModelName, GEMINI_DEFAULT_MODEL_CANDIDATES } =
        context;
      return function getGeminiModelCandidates(
        preferredModel = "",
        discoveredModels = [],
      ) {
        const envFallbackModels = String(
          process.env.GEMINI_FALLBACK_MODELS || "",
        )
          .split(",")
          .map((model) => normalizeGeminiModelName(model))
          .filter(Boolean);

        const mergedCandidates = [
          normalizeGeminiModelName(preferredModel),
          ...(Array.isArray(discoveredModels) ? discoveredModels : []).map(
            (model) => normalizeGeminiModelName(model),
          ),
          ...envFallbackModels,
          ...GEMINI_DEFAULT_MODEL_CANDIDATES,
        ];

        const seen = new Set();
        const uniqueCandidates = [];

        mergedCandidates.forEach((model) => {
          const normalized = normalizeGeminiModelName(model);
          if (!normalized || seen.has(normalized)) {
            return;
          }
          seen.add(normalized);
          uniqueCandidates.push(normalized);
        });

        return uniqueCandidates.slice(0, 20);
      }.apply(this, args);
    },

    listGeminiGenerateContentModels(...args) {
      const { getFetch, normalizeGeminiModelName } = context;
      return async function listGeminiGenerateContentModels(apiKey = "") {
        const key = String(apiKey || "").trim();
        if (!key) return [];

        try {
          const fetch = await getFetch();
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            const body = await response.text().catch(() => "");
            console.warn(
              `[Gemini] Could not list models (${response.status}): ${body.slice(0, 300)}`,
            );
            return [];
          }

          const payload = await response.json().catch(() => ({}));
          const availableModels = Array.isArray(payload?.models)
            ? payload.models
            : [];

          return availableModels
            .filter((model) => {
              const methods = Array.isArray(model?.supportedGenerationMethods)
                ? model.supportedGenerationMethods
                : [];
              return methods.includes("generateContent");
            })
            .map((model) => normalizeGeminiModelName(model?.name))
            .filter((modelName) => /^gemini/i.test(modelName));
        } catch (error) {
          console.warn(
            "[Gemini] Failed to fetch model list:",
            error?.message || error,
          );
          return [];
        }
      }.apply(this, args);
    },

    getGeminiGenerateContentModels(...args) {
      const {
        geminiModelListCache,
        listGeminiGenerateContentModels,
        GEMINI_MODEL_LIST_CACHE_TTL_MS,
      } = context;
      return async function getGeminiGenerateContentModels(apiKey = "") {
        const now = Date.now();
        if (
          geminiModelListCache.expiresAt > now &&
          geminiModelListCache.models.length > 0
        ) {
          return geminiModelListCache.models;
        }

        const discoveredModels = await listGeminiGenerateContentModels(apiKey);
        if (discoveredModels.length > 0) {
          geminiModelListCache.models = discoveredModels;
          geminiModelListCache.expiresAt = now + GEMINI_MODEL_LIST_CACHE_TTL_MS;
          return discoveredModels;
        }

        return geminiModelListCache.models;
      }.apply(this, args);
    },

    stripGeminiCodeFence(...args) {
      return function stripGeminiCodeFence(text = "") {
        return String(text || "")
          .replace(/^```(?:json|html|markdown)?\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();
      }.apply(this, args);
    },

    parseGeminiJsonPayload(...args) {
      const { stripGeminiCodeFence } = context;
      return function parseGeminiJsonPayload(text = "") {
        const cleaned = stripGeminiCodeFence(text);
        const candidates = [cleaned];
        const objectMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          candidates.push(objectMatch[0]);
        }

        for (const candidate of candidates) {
          if (!candidate) continue;
          try {
            const parsed = JSON.parse(candidate);
            if (parsed && typeof parsed === "object") {
              return parsed;
            }
          } catch (error) {
            // Try next parsing candidate.
          }
        }

        return null;
      }.apply(this, args);
    },

    runGeminiGenerateContent(...args) {
      const {
        normalizeGeminiModelName,
        getGeminiGenerateContentModels,
        getGeminiModelCandidates,
        genAI,
        stripGeminiCodeFence,
        isGeminiModelNotFoundError,
      } = context;
      return async function runGeminiGenerateContent(parts = []) {
        const geminiApiKey = String(process.env.GEMINI_API_KEY || "").trim();
        if (!geminiApiKey) {
          const keyError = new Error(
            "Set GEMINI_API_KEY in server environment variables.",
          );
          keyError.code = "gemini_api_key_missing";
          throw keyError;
        }

        const preferredModel = normalizeGeminiModelName(
          process.env.GEMINI_MODEL || "gemini-2.0-flash",
        );
        const discoveredModels =
          await getGeminiGenerateContentModels(geminiApiKey);
        const modelCandidates = getGeminiModelCandidates(
          preferredModel,
          discoveredModels,
        );

        if (modelCandidates.length === 0) {
          const noModelError = new Error(
            "No Gemini model candidates available.",
          );
          noModelError.code = "gemini_model_unavailable";
          throw noModelError;
        }

        let selectedModel = "";
        let text = "";
        let lastModelErrorMessage = "";

        for (const candidate of modelCandidates) {
          try {
            const model = genAI.getGenerativeModel({ model: candidate });
            const result = await model.generateContent({
              contents: [{ role: "user", parts }],
            });
            const response = await result.response;
            const candidateText = stripGeminiCodeFence(response.text() || "");

            if (!candidateText) {
              throw new Error("Gemini returned empty content.");
            }

            selectedModel = candidate;
            text = candidateText;
            break;
          } catch (candidateError) {
            if (isGeminiModelNotFoundError(candidateError)) {
              lastModelErrorMessage = String(candidateError?.message || "");
              console.warn(
                `[Gemini] Model ${candidate} unavailable. Trying next candidate...`,
              );
              continue;
            }

            throw candidateError;
          }
        }

        if (!selectedModel || !text) {
          const unavailableError = new Error(
            `Ingen støttet Gemini-modell tilgjengelig for generateContent. Prøvde: ${modelCandidates.join(", ")}.${lastModelErrorMessage ? ` Siste feil: ${lastModelErrorMessage}` : ""}`,
          );
          unavailableError.code = "gemini_model_unavailable";
          throw unavailableError;
        }

        return {
          model: selectedModel,
          text,
        };
      }.apply(this, args);
    },
  };
};
