// firebase storage. Dependencies are resolved when an operation runs.
module.exports = function createFeature(context) {
  return {
    getFirebaseConfig(...args) {
      return function getFirebaseConfig() {
        const privateKey = (process.env.TK_FIREBASE_PRIVATE_KEY || "")
          .replace(/\\n/g, "\n")
          .replace(/^"|"$/g, "");
        const projectId =
          process.env.TK_FIREBASE_PROJECT_ID || "tk-design-f43f6";

        return {
          projectId,
          clientEmail: process.env.TK_FIREBASE_CLIENT_EMAIL || "",
          privateKey,
          databaseId: process.env.TK_FIREBASE_DATABASE_ID || "(default)",
          collection:
            process.env.TK_FIREBASE_CONTACT_COLLECTION || "contactMessages",
        };
      }.apply(this, args);
    },

    getFirebaseWebConfig(...args) {
      return function getFirebaseWebConfig() {
        const projectId =
          process.env.TK_FIREBASE_PROJECT_ID || "tk-design-f43f6";
        const defaultWebConfig = {
          apiKey: "AIzaSyDLYgqo2E1UiHoydEB6-WfFc119HES2U5c",
          messagingSenderId: "729667300921",
          appId: "1:729667300921:web:5061be8d41f10707a727e8",
        };

        return {
          apiKey:
            process.env.TK_FIREBASE_WEB_API_KEY || defaultWebConfig.apiKey,
          authDomain:
            process.env.TK_FIREBASE_AUTH_DOMAIN ||
            `${projectId}.firebaseapp.com`,
          projectId,
          storageBucket:
            process.env.TK_FIREBASE_STORAGE_BUCKET ||
            `${projectId}.firebasestorage.app`,
          messagingSenderId:
            process.env.TK_FIREBASE_MESSAGING_SENDER_ID ||
            defaultWebConfig.messagingSenderId,
          appId: process.env.TK_FIREBASE_APP_ID || defaultWebConfig.appId,
        };
      }.apply(this, args);
    },

    getFirebaseAuthHelperHost(...args) {
      return function getFirebaseAuthHelperHost() {
        const projectId =
          process.env.TK_FIREBASE_PROJECT_ID || "tk-design-f43f6";
        return `${projectId}.firebaseapp.com`;
      }.apply(this, args);
    },

    hasUsableFirebaseWebConfig(...args) {
      return function hasUsableFirebaseWebConfig(config) {
        return !!(
          config &&
          config.apiKey &&
          config.authDomain &&
          config.projectId &&
          config.storageBucket &&
          config.appId
        );
      }.apply(this, args);
    },

    getFirebaseAccessToken(...args) {
      const {
        firebaseAccessTokenCache,
        getFirebaseConfig,
        getFetch,
        createGoogleAccessJwt,
      } = context;
      return async function getFirebaseAccessToken(
        scope = "https://www.googleapis.com/auth/datastore",
      ) {
        const now = Date.now();
        const cachedToken = firebaseAccessTokenCache.get(scope);

        if (
          cachedToken &&
          cachedToken.token &&
          cachedToken.expiresAt - 60_000 > now
        ) {
          return cachedToken.token;
        }

        const { clientEmail, privateKey } = getFirebaseConfig();
        if (!clientEmail || !privateKey) {
          throw new Error(
            "Firebase mangler TK_FIREBASE_CLIENT_EMAIL eller TK_FIREBASE_PRIVATE_KEY i .env",
          );
        }

        const fetch = await getFetch();
        const signedJwt = createGoogleAccessJwt(clientEmail, privateKey, scope);
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: signedJwt.token,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Firebase token request failed: ${response.status} ${errorText}`,
          );
        }

        const data = await response.json();
        firebaseAccessTokenCache.set(scope, {
          token: data.access_token,
          expiresAt: now + (data.expires_in || 3600) * 1000,
        });

        return data.access_token;
      }.apply(this, args);
    },

    toFirestoreValue(...args) {
      const { toFirestoreFields } = context;
      return function toFirestoreValue(value) {
        if (value === null || value === undefined) {
          return { nullValue: null };
        }

        if (value instanceof Date) {
          return { timestampValue: value.toISOString() };
        }

        if (Array.isArray(value)) {
          return {
            arrayValue: {
              values: value.map(toFirestoreValue),
            },
          };
        }

        switch (typeof value) {
          case "string":
            return { stringValue: value };
          case "boolean":
            return { booleanValue: value };
          case "number":
            if (Number.isInteger(value)) {
              return { integerValue: String(value) };
            }
            return { doubleValue: value };
          case "object":
            return {
              mapValue: {
                fields: toFirestoreFields(value),
              },
            };
          default:
            return { stringValue: String(value) };
        }
      }.apply(this, args);
    },

    toFirestoreFields(...args) {
      const { toFirestoreValue } = context;
      return function toFirestoreFields(objectValue) {
        return Object.entries(objectValue).reduce((fields, [key, value]) => {
          if (value !== undefined) {
            fields[key] = toFirestoreValue(value);
          }
          return fields;
        }, {});
      }.apply(this, args);
    },

    saveContactMessage(...args) {
      const {
        getFirebaseConfig,
        getFirebaseAccessToken,
        getFetch,
        crypto,
        toFirestoreFields,
      } = context;
      return async function saveContactMessage(messagePayload) {
        console.log(
          "Saving message to Firestore...",
          JSON.stringify(messagePayload, null, 2),
        );
        const { projectId, databaseId, collection } = getFirebaseConfig();
        if (!projectId) {
          throw new Error("Firebase mangler TK_FIREBASE_PROJECT_ID i .env");
        }

        const accessToken = await getFirebaseAccessToken();
        const fetch = await getFetch();
        const documentId = crypto.randomUUID();
        const payload = {
          ...messagePayload,
          created_at: new Date().toISOString(),
        };
        const response = await fetch(
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${collection}?documentId=${documentId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              fields: toFirestoreFields(payload),
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Firebase write failed: ${response.status} ${errorText}`,
          );
        }

        const data = await response.json();
        const savedId =
          data && data.name ? data.name.split("/").pop() : documentId;

        return {
          id: savedId,
          name: data && data.name ? data.name : null,
        };
      }.apply(this, args);
    },

    hasFirebaseServerCredentials(...args) {
      const { getFirebaseConfig } = context;
      return function hasFirebaseServerCredentials() {
        const { projectId, clientEmail, privateKey } = getFirebaseConfig();
        return !!(projectId && clientEmail && privateKey);
      }.apply(this, args);
    },

    getFirebaseSiteDataCollection(...args) {
      return function getFirebaseSiteDataCollection() {
        return process.env.TK_FIREBASE_SITE_DATA_COLLECTION || "siteAdminData";
      }.apply(this, args);
    },

    getFirestoreDocumentUrl(...args) {
      const { getFirebaseConfig } = context;
      return function getFirestoreDocumentUrl(collection, documentId) {
        const { projectId, databaseId } = getFirebaseConfig();
        return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${encodeURIComponent(collection)}/${encodeURIComponent(documentId)}`;
      }.apply(this, args);
    },

    readFirestoreDocument(...args) {
      const {
        hasFirebaseServerCredentials,
        getFirebaseAccessToken,
        getFetch,
        getFirestoreDocumentUrl,
      } = context;
      return async function readFirestoreDocument(collection, documentId) {
        if (!hasFirebaseServerCredentials()) {
          return null;
        }

        const accessToken = await getFirebaseAccessToken();
        const fetch = await getFetch();
        const response = await fetch(
          getFirestoreDocumentUrl(collection, documentId),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (response.status === 404) {
          return null;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Firebase read failed: ${response.status} ${errorText}`,
          );
        }

        return response.json();
      }.apply(this, args);
    },

    upsertFirestoreDocument(...args) {
      const {
        hasFirebaseServerCredentials,
        getFirebaseAccessToken,
        getFetch,
        getFirestoreDocumentUrl,
        toFirestoreFields,
      } = context;
      return async function upsertFirestoreDocument(
        collection,
        documentId,
        fields,
      ) {
        if (!hasFirebaseServerCredentials()) {
          throw new Error("Firebase server credentials are not configured.");
        }

        const accessToken = await getFirebaseAccessToken();
        const fetch = await getFetch();
        const response = await fetch(
          getFirestoreDocumentUrl(collection, documentId),
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              fields: toFirestoreFields({
                ...fields,
                updated_at: new Date().toISOString(),
              }),
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Firebase write failed: ${response.status} ${errorText}`,
          );
        }

        return response.json();
      }.apply(this, args);
    },

    readFirestoreStringField(...args) {
      return function readFirestoreStringField(document, fieldName) {
        return document?.fields?.[fieldName]?.stringValue || "";
      }.apply(this, args);
    },

    parseFirestoreDocToBlogPost(...args) {
      const { getFallbackBlogImage } = context;
      return function parseFirestoreDocToBlogPost(doc) {
        if (!doc || !doc.fields) return null;
        const fields = doc.fields;
        const getVal = (field) => {
          if (!field) return "";
          if ("stringValue" in field) return field.stringValue;
          if ("timestampValue" in field) return field.timestampValue;
          if ("integerValue" in field) return Number(field.integerValue);
          if ("booleanValue" in field) return field.booleanValue;
          return "";
        };

        const docId = doc.name ? doc.name.split("/").pop() : "";
        const title = getVal(fields.title) || "Uten tittel";
        const content = getVal(fields.content) || "";
        const slug = getVal(fields.slug) || docId;
        const author = getVal(fields.author) || "TK-design";
        const publishedAt =
          getVal(fields.publishedAt) ||
          getVal(fields.createdAt) ||
          doc.createTime ||
          "";

        let image = getVal(fields.image) || getVal(fields.imageUrl);
        if (!image || image.includes("b-1.png")) {
          image = getFallbackBlogImage(slug || docId);
        } else if (!image.startsWith("http") && !image.startsWith("/")) {
          image = "/" + image;
        }

        const summary = getVal(fields.summary) || getVal(fields.excerpt) || "";
        const category = getVal(fields.category) || "Webdesign";

        let dateStr = "";
        if (publishedAt) {
          try {
            const d = new Date(publishedAt);
            if (!isNaN(d.getTime())) {
              dateStr = d.toLocaleDateString("no-NO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            }
          } catch (e) {}
        }

        return {
          id: docId,
          title,
          content,
          slug,
          link: `/blog/${slug}`,
          author,
          publishedAt,
          date: dateStr,
          image,
          summary,
          category,
          status: getVal(fields.status) || "published",
        };
      }.apply(this, args);
    },

    readFirestorePostsCollection(...args) {
      const {
        getFetch,
        hasFirebaseServerCredentials,
        getFirebaseAccessToken,
        parseFirestoreDocToBlogPost,
      } = context;
      return async function readFirestorePostsCollection() {
        try {
          const url = `https://firestore.googleapis.com/v1/projects/tk-design-f43f6/databases/(default)/documents/posts`;
          const fetch = await getFetch();
          let headers = {};
          if (hasFirebaseServerCredentials()) {
            try {
              const accessToken = await getFirebaseAccessToken();
              if (accessToken) {
                headers["Authorization"] = `Bearer ${accessToken}`;
              }
            } catch (err) {}
          }
          const response = await fetch(url, { headers });
          if (!response.ok) return [];
          const data = await response.json();
          if (data && Array.isArray(data.documents)) {
            return data.documents
              .map(parseFirestoreDocToBlogPost)
              .filter(Boolean);
          }
        } catch (e) {
          console.error(
            "Feil ved lesing av Firestore posts samling:",
            e.message,
          );
        }
        return [];
      }.apply(this, args);
    },

    waitForFirebaseOperation(...args) {
      const { getFetch } = context;
      return async function waitForFirebaseOperation(
        operationName,
        accessToken,
      ) {
        const fetch = await getFetch();
        const normalizedOperationName = String(operationName || "").replace(
          /^\/+/,
          "",
        );
        const maxAttempts = 12;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const response = await fetch(
            `https://firebase.googleapis.com/v1beta1/${normalizedOperationName}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Firebase operation failed: ${response.status} ${errorText}`,
            );
          }

          const operation = await response.json();
          if (operation.done) {
            if (operation.error) {
              throw new Error(
                operation.error.message || "Firebase operation failed.",
              );
            }
            return operation;
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        throw new Error(
          "Firebase operation timed out while waiting for web app provisioning.",
        );
      }.apply(this, args);
    },

    getOrCreateFirebaseWebAppConfig(...args) {
      const {
        getFirebaseWebConfig,
        getFirebaseAccessToken,
        getFetch,
        waitForFirebaseOperation,
      } = context;
      return async function getOrCreateFirebaseWebAppConfig() {
        const envConfig = getFirebaseWebConfig();
        if (
          envConfig.apiKey &&
          envConfig.messagingSenderId &&
          envConfig.appId
        ) {
          return envConfig;
        }

        if (!envConfig.projectId) {
          throw new Error(
            "Firebase mangler prosjekt-ID for å hente web app-konfig.",
          );
        }

        const accessToken = await getFirebaseAccessToken(
          "https://www.googleapis.com/auth/cloud-platform",
        );
        const fetch = await getFetch();
        const authHeaders = {
          Authorization: `Bearer ${accessToken}`,
        };
        const listUrl = `https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(envConfig.projectId)}/webApps`;
        let webApps = [];

        const listResponse = await fetch(listUrl, {
          headers: authHeaders,
        });

        if (!listResponse.ok) {
          const errorText = await listResponse.text();
          throw new Error(
            `Could not list Firebase web apps: ${listResponse.status} ${errorText}`,
          );
        }

        const listData = await listResponse.json();
        webApps = Array.isArray(listData.apps) ? listData.apps : [];

        if (webApps.length === 0) {
          const createResponse = await fetch(listUrl, {
            method: "POST",
            headers: {
              ...authHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              displayName: "tk-design Admin",
            }),
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(
              `Could not create Firebase web app: ${createResponse.status} ${errorText}`,
            );
          }

          const operation = await createResponse.json();
          if (operation && operation.name) {
            await waitForFirebaseOperation(operation.name, accessToken);
          }

          const refreshedListResponse = await fetch(listUrl, {
            headers: authHeaders,
          });

          if (!refreshedListResponse.ok) {
            const errorText = await refreshedListResponse.text();
            throw new Error(
              `Could not refresh Firebase web apps: ${refreshedListResponse.status} ${errorText}`,
            );
          }

          const refreshedListData = await refreshedListResponse.json();
          webApps = Array.isArray(refreshedListData.apps)
            ? refreshedListData.apps
            : [];
        }

        const firstWebApp = webApps[0];
        if (!firstWebApp || !firstWebApp.appId) {
          throw new Error("Fant ingen Firebase Web App i prosjektet.");
        }

        const configResponse = await fetch(
          `https://firebase.googleapis.com/v1beta1/projects/-/webApps/${encodeURIComponent(firstWebApp.appId)}/config`,
          {
            headers: authHeaders,
          },
        );

        if (!configResponse.ok) {
          const errorText = await configResponse.text();
          throw new Error(
            `Could not fetch Firebase web config: ${configResponse.status} ${errorText}`,
          );
        }

        const remoteConfig = await configResponse.json();

        return {
          apiKey: envConfig.apiKey || remoteConfig.apiKey || "",
          authDomain:
            envConfig.authDomain ||
            remoteConfig.authDomain ||
            `${envConfig.projectId}.firebaseapp.com`,
          projectId: envConfig.projectId || remoteConfig.projectId || "",
          storageBucket:
            envConfig.storageBucket ||
            remoteConfig.storageBucket ||
            `${envConfig.projectId}.firebasestorage.app`,
          messagingSenderId:
            envConfig.messagingSenderId || remoteConfig.messagingSenderId || "",
          appId: envConfig.appId || remoteConfig.appId || "",
        };
      }.apply(this, args);
    },

    getCachedFirebaseWebAppConfig(...args) {
      const {
        firebaseWebConfigCache,
        FIREBASE_WEB_CONFIG_CACHE_MS,
        getOrCreateFirebaseWebAppConfig,
      } = context;
      return async function getCachedFirebaseWebAppConfig() {
        const now = Date.now();
        if (
          firebaseWebConfigCache.value &&
          now - firebaseWebConfigCache.fetchedAt < FIREBASE_WEB_CONFIG_CACHE_MS
        ) {
          return firebaseWebConfigCache.value;
        }

        if (firebaseWebConfigCache.inflight) {
          return firebaseWebConfigCache.inflight;
        }

        firebaseWebConfigCache.inflight = getOrCreateFirebaseWebAppConfig()
          .then((config) => {
            firebaseWebConfigCache.value = config;
            firebaseWebConfigCache.fetchedAt = Date.now();
            return config;
          })
          .finally(() => {
            firebaseWebConfigCache.inflight = null;
          });

        return firebaseWebConfigCache.inflight;
      }.apply(this, args);
    },

    buildFirebaseStorageDownloadUrl(...args) {
      return function buildFirebaseStorageDownloadUrl(
        bucketName,
        objectName,
        token,
      ) {
        return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(objectName)}?alt=media&token=${encodeURIComponent(token)}`;
      }.apply(this, args);
    },

    uploadBufferToFirebaseStorage(...args) {
      const {
        inferMimeTypeFromFileName,
        getFirebaseWebConfig,
        buildAdminStorageObjectName,
        crypto,
        getFirebaseAccessToken,
        getFetch,
        buildFirebaseStorageDownloadUrl,
      } = context;
      return async function uploadBufferToFirebaseStorage({
        folder = "media",
        originalName = "file",
        mimeType = "",
        buffer,
      }) {
        const resolvedMimeType =
          String(mimeType || "").trim() ||
          inferMimeTypeFromFileName(originalName);
        const storageBucket = String(
          getFirebaseWebConfig().storageBucket || "",
        ).trim();

        if (!storageBucket) {
          throw new Error("Firebase Storage bucket mangler i konfigurasjonen.");
        }

        if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
          throw new Error("Filen var tom.");
        }

        const objectName = buildAdminStorageObjectName(folder, originalName);
        const downloadToken = crypto.randomUUID();
        const metadata = {
          name: objectName,
          contentType: resolvedMimeType,
          cacheControl: "public,max-age=31536000",
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        };
        const boundary = `tk-design-upload-${crypto.randomUUID()}`;
        const body = Buffer.concat([
          Buffer.from(
            `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
            "utf8",
          ),
          Buffer.from(
            `--${boundary}\r\nContent-Type: ${resolvedMimeType}\r\nContent-Transfer-Encoding: binary\r\n\r\n`,
            "utf8",
          ),
          buffer,
          Buffer.from(`\r\n--${boundary}--`, "utf8"),
        ]);

        const accessToken = await getFirebaseAccessToken(
          "https://www.googleapis.com/auth/cloud-platform",
        );
        const fetch = await getFetch();
        const response = await fetch(
          `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(storageBucket)}/o?uploadType=multipart`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": `multipart/related; boundary=${boundary}`,
            },
            body,
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Firebase Storage upload failed: ${response.status} ${errorText}`,
          );
        }

        const payload = await response.json();

        return {
          bucket: storageBucket,
          path: objectName,
          fullPath: payload?.name || objectName,
          publicUrl: buildFirebaseStorageDownloadUrl(
            storageBucket,
            payload?.name || objectName,
            downloadToken,
          ),
        };
      }.apply(this, args);
    },

    proxyFirebaseAuthHelper(...args) {
      const { getFetch, getFirebaseAuthHelperHost } = context;
      return async function proxyFirebaseAuthHelper(req, res) {
        const fetch = await getFetch();
        const helperHost = getFirebaseAuthHelperHost();
        const targetUrl = `https://${helperHost}${req.originalUrl}`;
        const upstreamResponse = await fetch(targetUrl, {
          method: "GET",
          headers: {
            Accept: req.get("accept") || "*/*",
            "Accept-Language": req.get("accept-language") || "en-US,en;q=0.9",
            "User-Agent": req.get("user-agent") || "tk-design-auth-proxy",
          },
        });

        res.status(upstreamResponse.status);

        const hopByHopHeaders = new Set([
          "connection",
          "transfer-encoding",
          "content-length",
          "content-encoding",
          "keep-alive",
          "proxy-authenticate",
          "proxy-authorization",
          "te",
          "trailer",
          "upgrade",
        ]);

        upstreamResponse.headers.forEach((value, key) => {
          if (!hopByHopHeaders.has(String(key).toLowerCase())) {
            res.setHeader(key, value);
          }
        });

        const bodyBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
        res.send(bodyBuffer);
      }.apply(this, args);
    },
  };
};
