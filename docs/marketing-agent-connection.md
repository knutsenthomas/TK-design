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

## Google-rapporter i Markedsagent

Den private agenten leser `GET /api/marketing-agent/google` med den samme serverhemmeligheten. Endepunktet gjenbruker `GOOGLE_SERVICE_ACCOUNT_JSON` og `GA_PROPERTY_ID` fra TK-designs Vercel-oppsett. Det oppretter kortvarige Google-token i minnet med kun `analytics.readonly` og `webmasters.readonly`, uten Gmail eller brukerimpersonering. Ingen ekstra npm-avhengigheter.

Gi den eksisterende tjenestekontoen rollen Leser i riktig GA4-egenskap og begrenset lesetilgang i Search Console. Aktiver Google Analytics Data API og Google Search Console API i Google Cloud-prosjektet. Agenten finner bare eksisterende Search Console-egenskaper for `tk-design.no`; ingen nye egenskaper opprettes. Ved flere egenskaper velges domeneegenskapen først. Valgfri `GSC_SITE_URL` kan velge `sc-domain:tk-design.no`, `https://www.tk-design.no/` eller `https://tk-design.no/`. Ingen andre domener godtas.

Analytics filtreres til bare `tk-design.no` og `www.tk-design.no`. Begge kildene bruker 28 dager; Analytics til og med i går, Search Console til og med tre dager tilbake og kun ferdigbehandlede data. Kildene kan feile uavhengig. Søkeord og sider viser høyst åtte rader, og søkeordlisten er ikke et komplett uttrekk. Bare bekreftet Google-svar gir status Aktiv.

Verifisering: `node --test legacy_html/tests/marketing-agent.test.js legacy_html/tests/marketing-google.test.js`. Tester bruker genererte engangsnøkler og fiktive svar, ikke produksjonsdata.

## E-postgrense

Markedsagenten kan forberede utkast og åpne dem via `mailto:` i brukerens e-postprogram. Mottakeren velges fra kunder med lagret e-postadresse; Ikke kontakt, Avsluttet og eksisterende Kudos/Mandal-kunder utelates. Dette sender ingen e-post og gir ingen innbokstilgang. TK-designs eksisterende Gmail-kobling i ChatGPT er separat. Direkte Sites/Gmail-integrasjon ble ikke aktivert fordi Sites-plugin-eligibility ikke var tilgjengelig i verktøyene; ingen ukjente connector-ID-er ble deklarert.

## Automatisk overføring til TK-design-hub

Hubben er `https://hub.tk-design.no/admin`, repository `knutsenthomas/HUB-TK-design`, Firebase-prosjekt `hub-tk-design`. Koblingen bruker det eksisterende arbeidsområdet `workspaces/tk-design`, med separate `clients`- og `marketingAgentReceipts`-samlinger. Det eldre kontoarkivet `users/thomas@tk-design.no/data/hub_state` brukes ikke. Koblingen gjenbruker TK-designs eksisterende servercredential med eksplisitt målprosjekt. Nettleseren mottar ingen servernøkkel. Google/Gmail-innloggingen i hubben flyttes ikke.

`GET /api/marketing-agent/hub` kontrollerer tilgang og returnerer en begrenset kundeliste og arbeidsområdets revisjon. `POST` med `leads` overfører opp til 100 kandidater. Begge krever samme `MARKETING_AGENT_SECRET`. Målprosjekt og arbeidsområde er faste på serveren. Arbeidsområdet og revisjonen må allerede eksistere; koblingen oppretter ikke en alternativ kundedatabase.

Kandidater legges automatisk inn som Lead med kilde/notater, tomt ubekreftet kontaktpersonfelt og ingen kjøpsinteressepåstand. Ikke kontakt, Avsluttet, Vunnet, Kudos Regnskap og Mandal Regnskapskontor utelates. Navn, e-post, nettadresse og stabile kilde-ID-er kontrolleres mot eksisterende kunder. Eksisterende kunder oppdateres ikke av en ny kandidat.

Firestore-transaksjonen leser arbeidsområdets revisjon, kundene og kvitteringene før den skriver. Den skriver bare nye kundedokumenter og nye kvitteringer. Ved nye kunder økes arbeidsområdets revisjon atomisk, slik at en gammel nettleservisning ikke kan overskrive importen. Eksisterende kundedokumenter, prosjekter, notater og innstillinger skrives ikke. Kundene og kvitteringene leses tilbake før overføring meldes som bekreftet. Varige kvitteringer gjør gjentatt synkronisering idempotent. Kundegrensen på 400 i hubbens lagringsmodell respekteres.

Markedsagenten synkroniserer etter lagret kundejakt og lagring av kunder. Feil hindrer ikke lokal lagring; siste kundesnapshot og ventende status beholdes. Neste lagring/kundejakt prøver på nytt. Status og manuell ny kontroll finnes i Agent-fanen. Hub-kunder inngår også i kundejaktens eksklusjonsliste. Ingen e-post eller innlegg sendes av overføringen.

Hub-frontenden bruker den gjenopprettede, revisjonskontrollerte lagringen fra `codex/portal-foundation-sales`. Begge sidene har menylenker til hverandre; hubbens innboks åpnes i sin egen innloggede visning.

Verifisering: `node --test legacy_html/tests/marketing-hub.test.js legacy_html/tests/marketing-agent.test.js legacy_html/tests/marketing-google.test.js`. IAM-tilgang og produksjonsoverføring må bekreftes separat med den publiserte koblingen.
