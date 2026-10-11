# TK-design → privat Markedsagent

Den eksisterende private Sites-appen brukes på `https://markedsagent.tk-design.no/`.
Ingen ny side, nytt domene eller Metricool-forbindelse kreves.

## Aktivering

1. Generer en ny tilfeldig hemmelighet med minst 32 tegn. Den skal kun ligge i runtime-konfigurasjonen.
2. Sett samme `MARKETING_AGENT_SECRET` som hemmelig miljøvariabel i TK-designs Vercel-produksjon og i Sites-prosjektet `appgprj_6acbea5a72a08191a6970fd62ff67bfd`. Ikke legg den i kode, logger eller nettleseren.
3. Bekreft TK-designs serverinnstillinger for de kontoene som skal brukes:
   - Facebook: `FB_PAGE_ID`, en ny `FB_PAGE_ACCESS_TOKEN`.
   - Instagram: `INSTAGRAM_ACCOUNT_ID`, `FB_PAGE_ACCESS_TOKEN` med Instagram-publiseringstilgang.
   - LinkedIn: `LINKEDIN_ORGANIZATION_ID`, `LINKEDIN_ACCESS_TOKEN` med tillatelse til å publisere på bedriftssiden.
   - Firebase-servertilgang må fungere. Publisering stopper dersom Firestore-loggen ikke kan sikres.
4. Tilbakekall den tidligere Facebook-nøkkelen som var innebygd i offentlig kildekode. Den er fjernet fra gjeldende kode, men kan fortsatt finnes i Git-historikken.
5. Deploy runtime-innstillingene på begge sider, og bruk «Hent tilkoblingsstatus» under Innhold.

Konfigurasjon er ikke det samme som testet kontotilgang. Ingen levende publisering ble gjort under utvikling.
Meta bruker Graph API v25.0, med overstyring `META_GRAPH_API_VERSION`.
LinkedIn bruker Posts API, versjon 202609 med overstyring `LINKEDIN_API_VERSION`.
LinkedIn støtter tekst/lenke i denne versjonen; bildepublisering gjelder Facebook og Instagram.

## Godkjenning og logging

- Lagre innleggets publiserbare tekst separat fra interne notater.
- Sett status til Godkjent. Dette sender ingenting.
- Se forhåndsvisningen, velg kanalene og trykk Publiser nå.
- Serveren bruker kun TK-designs forhåndskonfigurerte kontoer; brukeren kan ikke sende et vilkårlig kontomål.
- En atomisk Sites-post låser utkastet til ett publiseringsforsøk. Firestore oppretter en unik kjørings-ID atomisk på backend.
- Samme kjørings-ID sendes aldri på nytt automatisk. Ved timeout/crash beholdes ukjent eller pågående status.
- Kun HTTP-suksess med en bekreftet ekstern innleggs-ID blir Publisert. Suksess og usikkerhet logges per kanal.
- Oppdater publiseringsstatus leser tilbake uten å sende nye innlegg.
- Ingen periodisk publisering er aktivert av denne endringen.

## Verifisering

`node --check legacy_html/server.js`

`node --check legacy_html/js/marketing-agent.js`

`node --test legacy_html/tests/marketing-agent.test.js`

Testene dekker autentisering, input, atomiske duplikatkrav, per-kanal-resultat, manglende lagring, provider-ID-kontroller og at simulering ikke blir publiseringssuksess. Ingen ekte kontonøkler brukes i testene.

Vercel-forbindelsen avviste tilgangen til TK-designs team under utviklingen. Runtime-innstillinger, gammel nøkkels tilbakekalling og levende kontotilgang må derfor bekreftes før publisering aktiveres.
