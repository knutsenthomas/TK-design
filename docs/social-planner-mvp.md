# Social Planner MVP Spec (v1)

Dato: 2026-03-12  
Prosjekt: TK-design Social Planner  
Mål: MVP for planlegging, publisering og analyse av SoMe-innhold.

## 1. Produktmål

Bygge en SaaS-applikasjon for små og mellomstore bedrifter som gjør at de kan:

1. Koble SoMe-kontoer til én workspace.
2. Lage innlegg én gang og tilpasse per plattform.
3. Planlegge publisering i kalender.
4. Hente bilder fra Unsplash og eget mediebibliotek.
5. Få AI-støtte for tekst og hashtags.
6. Se KPI-er for publiserte innlegg i et enkelt dashboard.

## 2. MVP Scope

## Inkludert i MVP (P0)

1. Workspace, medlemmer og roller (`owner`, `admin`, `editor`, `viewer`).
2. OAuth-kobling mot:
   - Facebook Pages
   - Instagram Business (via Meta)
   - LinkedIn
3. Composer med:
   - master-tekst
   - plattformvarianter
   - preview per plattform
4. Kalender (uke + måned).
5. Scheduler med kø, retry og publiseringslogg.
6. Mediebibliotek (upload + Unsplash-søk).
7. AI-handlinger:
   - generer tekst
   - skriv om
   - forkort
   - utvid
   - foreslå hashtags
8. Analytics dashboard med grunn-KPI:
   - publiserte innlegg
   - likes
   - kommentarer
   - delinger
   - rekkevidde
   - klikk (der tilgjengelig)

## Utenfor MVP (P1/P2)

1. TikTok og X full produksjonsstøtte (holdes bak feature flag til tilgang/audit er på plass).
2. Avansert approval workflows.
3. A/B-testing av captions.
4. White-label / custom domain.
5. Komplett enterprise billing og usage overage.

## 3. Arkitektur (målbilde)

1. Frontend: `Next.js + TypeScript + Tailwind + FullCalendar`.
2. API: `NestJS (Fastify)` med modulær struktur.
3. Worker: `BullMQ` for planlagt publisering og retries.
4. Database: `PostgreSQL`.
5. Cache/kø: `Redis`.
6. Filer: `S3`/`R2` + CDN.
7. Auth: `Auth0` (eller Clerk/Supabase Auth).
8. Observability: `Sentry + OpenTelemetry`.

## 4. Datamodell v1 (overordnet)

## Tabeller

### `users`

1. `id` (uuid, pk)
2. `email` (unique)
3. `name`
4. `avatar_url`
5. `created_at`, `updated_at`

### `workspaces`

1. `id` (uuid, pk)
2. `name`
3. `timezone` (default `Europe/Oslo`)
4. `plan` (`free`, `pro`, `business`)
5. `created_by` (fk users.id)
6. `created_at`, `updated_at`

### `workspace_members`

1. `id` (uuid, pk)
2. `workspace_id` (fk)
3. `user_id` (fk)
4. `role` (`owner`, `admin`, `editor`, `viewer`)
5. `created_at`
6. Unique: (`workspace_id`, `user_id`)

### `social_accounts`

1. `id` (uuid, pk)
2. `workspace_id` (fk)
3. `platform` (`facebook`, `instagram`, `linkedin`, `x`, `tiktok`)
4. `external_account_id`
5. `display_name`
6. `status` (`active`, `expired`, `revoked`, `error`)
7. `created_at`, `updated_at`

### `social_account_tokens`

1. `id` (uuid, pk)
2. `social_account_id` (fk)
3. `access_token_encrypted`
4. `refresh_token_encrypted`
5. `expires_at`
6. `scopes` (jsonb)
7. `created_at`, `updated_at`

### `media_assets`

1. `id` (uuid, pk)
2. `workspace_id` (fk)
3. `source` (`upload`, `unsplash`)
4. `storage_key`
5. `public_url`
6. `mime_type`
7. `width`, `height`, `size_bytes`
8. `unsplash_photo_id` (nullable)
9. `attribution` (jsonb)
10. `created_by`, `created_at`

### `posts`

1. `id` (uuid, pk)
2. `workspace_id` (fk)
3. `title`
4. `master_text`
5. `status` (`draft`, `scheduled`, `published`, `failed`, `partially_published`)
6. `created_by`
7. `created_at`, `updated_at`

### `post_variants`

1. `id` (uuid, pk)
2. `post_id` (fk)
3. `platform`
4. `caption`
5. `hashtags` (text[])
6. `first_comment` (nullable)
7. `link_url` (nullable)
8. `created_at`, `updated_at`
9. Unique: (`post_id`, `platform`)

### `post_media_links`

1. `id` (uuid, pk)
2. `post_id` (fk)
3. `media_asset_id` (fk)
4. `sort_order`
5. `created_at`

### `schedule_items`

1. `id` (uuid, pk)
2. `post_id` (fk)
3. `workspace_id` (fk)
4. `social_account_id` (fk)
5. `scheduled_for` (timestamptz)
6. `status` (`queued`, `processing`, `published`, `failed`, `cancelled`)
7. `created_at`, `updated_at`

### `publish_jobs`

1. `id` (uuid, pk)
2. `schedule_item_id` (fk)
3. `job_key` (unique, idempotency)
4. `attempt`
5. `last_error` (text)
6. `provider_response` (jsonb)
7. `created_at`, `updated_at`

### `published_posts`

1. `id` (uuid, pk)
2. `schedule_item_id` (fk)
3. `platform`
4. `external_post_id`
5. `permalink`
6. `published_at`
7. `created_at`

### `analytics_snapshots`

1. `id` (uuid, pk)
2. `workspace_id` (fk)
3. `published_post_id` (fk)
4. `platform`
5. `metric_date` (date)
6. `metrics` (jsonb)
7. `created_at`
8. Index: (`workspace_id`, `metric_date`)

### `templates`

1. `id` (uuid, pk)
2. `workspace_id` (nullable, null = global template)
3. `category` (`sale`, `holiday`, `inspiration`, `announcement`)
4. `name`
5. `body`
6. `variables` (jsonb)
7. `created_at`, `updated_at`

### `ai_generations`

1. `id` (uuid, pk)
2. `workspace_id` (fk)
3. `user_id` (fk)
4. `action` (`generate`, `rewrite`, `shorten`, `expand`, `hashtags`)
5. `input_text`
6. `output_text`
7. `model`
8. `token_usage` (jsonb)
9. `created_at`

### `webhook_events`

1. `id` (uuid, pk)
2. `platform`
3. `event_id` (nullable)
4. `signature_valid` (bool)
5. `payload` (jsonb)
6. `processed_at` (nullable)
7. `created_at`

## 5. API-kontrakter v1 (intern backend)

## Auth og workspace

1. `POST /v1/workspaces`
2. `GET /v1/workspaces`
3. `POST /v1/workspaces/:id/invites`
4. `PATCH /v1/workspaces/:id/members/:memberId`
5. `DELETE /v1/workspaces/:id/members/:memberId`

## Social accounts (OAuth + management)

1. `GET /v1/social/:platform/oauth/start`
2. `GET /v1/social/:platform/oauth/callback`
3. `GET /v1/social/accounts?workspaceId=...`
4. `DELETE /v1/social/accounts/:id`
5. `POST /v1/social/accounts/:id/refresh-token`

## Composer/posts

1. `POST /v1/posts`
2. `GET /v1/posts?workspaceId=...&status=...`
3. `GET /v1/posts/:id`
4. `PATCH /v1/posts/:id`
5. `DELETE /v1/posts/:id`
6. `PUT /v1/posts/:id/variants/:platform`
7. `PUT /v1/posts/:id/media`

## Kalender og scheduling

1. `POST /v1/schedules`
2. `GET /v1/schedules?workspaceId=...&from=...&to=...`
3. `PATCH /v1/schedules/:id`
4. `DELETE /v1/schedules/:id`
5. `POST /v1/schedules/:id/publish-now`

## Media og Unsplash

1. `POST /v1/media/upload` (multipart)
2. `GET /v1/media?workspaceId=...`
3. `DELETE /v1/media/:id`
4. `GET /v1/unsplash/search?query=...&page=...`
5. `POST /v1/media/import-unsplash`

## AI

1. `POST /v1/ai/generate`
2. `POST /v1/ai/rewrite`
3. `POST /v1/ai/shorten`
4. `POST /v1/ai/expand`
5. `POST /v1/ai/hashtags`

## Templates

1. `GET /v1/templates?workspaceId=...&category=...`
2. `POST /v1/templates`
3. `PATCH /v1/templates/:id`
4. `DELETE /v1/templates/:id`

## Analytics

1. `GET /v1/analytics/overview?workspaceId=...&from=...&to=...`
2. `GET /v1/analytics/posts?workspaceId=...&from=...&to=...`
3. `GET /v1/analytics/best-times?workspaceId=...&from=...&to=...`

## Webhooks

1. `POST /v1/webhooks/meta`
2. `POST /v1/webhooks/linkedin`
3. `POST /v1/webhooks/x`
4. `POST /v1/webhooks/tiktok`

## 6. Epics og user stories

## Epic A: Auth og multitenancy

1. Som bruker kan jeg opprette konto og workspace.
2. Som owner kan jeg invitere teammedlemmer.
3. Som owner/admin kan jeg styre roller.
4. Akseptanse:
   - Kun medlemmer ser workspace-data.
   - RBAC håndheves på alle endpoints.

## Epic B: Konto-tilkobling (OAuth)

1. Som bruker kan jeg koble Facebook, Instagram og LinkedIn.
2. Som bruker kan jeg se token-status og reconnect.
3. Akseptanse:
   - Tokens lagres kryptert.
   - Utløpte tokens refresher automatisk.

## Epic C: Composer og templates

1. Som bruker kan jeg skrive master-innhold.
2. Som bruker kan jeg lage plattformspesifikke varianter.
3. Som bruker kan jeg velge mal og fylle variabler.
4. Akseptanse:
   - Variant lagres per plattform.
   - Preview viser endelig tekst/media per kanal.

## Epic D: Mediebibliotek

1. Som bruker kan jeg laste opp bilde/video.
2. Som bruker kan jeg søke i Unsplash og importere bilde.
3. Akseptanse:
   - Filvalidering (mime, størrelse).
   - Unsplash-attribution lagres.

## Epic E: Kalender og scheduler

1. Som bruker kan jeg se innlegg i uke/måned.
2. Som bruker kan jeg schedule ett innlegg til flere kontoer.
3. Som bruker kan jeg flytte schedule med drag/drop.
4. Akseptanse:
   - Jobber går til kø.
   - Feil gir retry med backoff.
   - Idempotency hindrer duplikatpublisering.

## Epic F: Publiseringspipeline

1. Som bruker kan jeg publisere nå eller på tidspunkt.
2. Som bruker kan jeg se publiseringslogg og feil per kanal.
3. Akseptanse:
   - `published_posts` lagrer ekstern post-ID.
   - Delvis feil gir status `partially_published`.

## Epic G: Analytics

1. Som bruker ser jeg KPI-kort per datoperiode.
2. Som bruker ser jeg toppinnlegg og beste dag/tid.
3. Akseptanse:
   - Metrics oppdateres via polling/webhook ingestion.
   - Dashboard støtter 7, 14, 30 dager + custom.

## Epic H: AI-assistent

1. Som bruker kan jeg generere forslag fra prompt.
2. Som bruker kan jeg omskrive/forkorte/forlenge eksisterende tekst.
3. Som bruker kan jeg få hashtag-forslag.
4. Akseptanse:
   - AI-svar logges i `ai_generations`.
   - Bruker kan godta eller forkaste forslag.

## 7. Faseplan (8 faser)

1. Fase 1 (uke 1-2): Auth, workspace, RBAC, grunnstruktur i DB.
2. Fase 2 (uke 3-4): OAuth Meta + LinkedIn, social accounts-side.
3. Fase 3 (uke 5-6): Composer, variants, templates, media upload.
4. Fase 4 (uke 7-8): Unsplash-integrasjon og kalendervisning.
5. Fase 5 (uke 9-10): Scheduler, queue workers, publish-now/scheduled.
6. Fase 6 (uke 11): Analytics ingestion + dashboard v1.
7. Fase 7 (uke 12): AI-funksjoner og observability.
8. Fase 8 (hardening): sikkerhetstest, load-test, beta-lansering.

## 8. Sikkerhetskrav (obligatorisk)

1. Token-kryptering med KMS envelope encryption.
2. OAuth med `state`, PKCE og streng redirect allowlist.
3. Webhook-signaturvalidering før prosessering.
4. Rate-limit per tenant og per endpoint.
5. Audit log for admin/publish/security events.
6. Secrets kun i secrets manager, aldri i repo.
7. Input-validering med Zod/DTO + output escaping.
8. Idempotency keys for alle publish-jobber.

## 9. Skalerbarhetskrav (MVP+)

1. Alle tunge publish-oppgaver kjøres async i worker.
2. API skal være stateless bak load balancer.
3. Redis brukes for queue, locks og kortvarig cache.
4. Database indekseres for tidsserie-queries.
5. Batch-henting av metrics per plattform for kostnadskontroll.

## 10. Definition of Done (DoD)

1. Feature har testdekning for kritiske paths.
2. API-kontrakt dokumentert.
3. Audit log og feilhåndtering på plass.
4. Sentry-fangst for exceptions.
5. Access control testet for alle roller.
6. Feature bak flag hvis plattformtilgang er usikker.

## 11. Første sprint (konkrete tickets)

1. Opprett NestJS app med moduler: `auth`, `workspaces`, `social`, `posts`, `media`.
2. Legg opp PostgreSQL schema med Prisma for tabellene over.
3. Implementer workspace CRUD + medlemsroller.
4. Implementer `GET/POST /v1/social/...oauth/...` skeleton.
5. Sett opp BullMQ + Redis og `publishQueue`.
6. Lag Next.js sider:
   - `/dashboard`
   - `/calendar`
   - `/composer`
   - `/analytics`
   - `/settings/connections`
7. Implementer media upload til S3/R2.
8. Implementer Unsplash søk-endpoint med API-key fra secret.
9. Legg til CI:
   - lint
   - typecheck
   - unit tests
10. Legg til Sentry og health endpoint `/health`.

