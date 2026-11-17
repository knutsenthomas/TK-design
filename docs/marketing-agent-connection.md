# Markedsagenten (avviklet)

Den private Markedsagenten i ChatGPT Sites (`https://markedsagent.tk-design.no/`, prosjekt `appgprj_6acbea5a72a08191a6970fd62ff67bfd`) ble slettet 17. november 2026. Markedsarbeidet ligger nå i TK-design Hub:

- Kundeemner, bloggutkast og SoMe-utkast: `https://hub.tk-design.no/marketing` og `https://hub.tk-design.no/social-content`.
- Claude lagrer dit via Hub-koblingen (`/api/insights/mcp`, scope `marketing`). Ingenting publiseres eller sendes uten at Thomas godkjenner i hubben.

## Hva som står igjen på tk-design.no

Alle ruter som krevde `MARKETING_AGENT_SECRET` er fjernet (publisering til Facebook/Instagram/LinkedIn via agenten, bloggpublisering og -planlegging, bildesøk og bildelagring, Google-rapporter og den direkte Hub-overføringen). Hemmeligheten brukes ikke lenger og kan slettes fra Vercel.

To ting er beholdt fordi allerede publisert eller godkjent innhold kan være avhengig av dem:

- `GET /api/marketing-agent/generated-images/:id` – offentlige bilder (Firestore `marketingAgentImages`) som publiserte innlegg og blogginnlegg kan peke til. Kun lesing, kun ugjennomsiktige ID-er.
- `GET /api/cron/marketing-blog` – publiserer bloggartikler som allerede er godkjent og planlagt (Firestore `marketingBlogSchedules`). Krever `CRON_SECRET`. Kan fjernes sammen med cron-oppføringen i `vercel.json` når det ikke ligger flere planlagte artikler.

Sosiale medier publiseres fortsatt via Social Planner i adminpanelet (`server/social-publishing.js`), som ikke er berørt.

## Gjenstående sikkerhetspunkt

Den tidligere Facebook-nøkkelen som en gang lå i offentlig kildekode, bør være tilbakekalt i Meta. Den finnes fortsatt i Git-historikken.

## Verifisering

`node --test legacy_html/tests/*.test.js`
