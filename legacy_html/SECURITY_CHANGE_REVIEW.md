# TK-design – sikkerhetsleveranse 31. oktober 2026

## Publiseringsgrunnlag

Den opprinnelige lokale arbeidskopien var eldre enn GitHub og produksjon. Leveransen er derfor integrert i en separat arbeidskopi på produksjonsrevisjon 8debcbc, som er direkte etterkommer av main e876376. Den opprinnelige arbeidskopiens upubliserte designendringer er ikke tatt med og er ikke fjernet.

Nyere oppstrøms kode har allerede administratorkontroll for henvendelser/publisering, kontroll av tilbakekalte token, verifisert administrator-e-post/custom claims, lukkede private Firestore-regler, miljøbaserte Facebook-nøkler og en sikret PDF-proxy. Dette beholdes, sammen med produksjonens nyere ratebegrensning og samtykke-/nettsideendringer. Den gamle lokale serverfilen erstatter ikke disse modulene.

## Denne leveransen

- Utvider den felles sperren til hele /api/social og /api/admin, inkludert fremtidige søsterruter.
- Erstatter generell filservering av servermappen med eksplisitt offentlig innhold. Serverkilde, serverhjelpere og private data kan ikke hentes som vanlige filer. Offentlige sider, innlegg/SEO, admininnlogging, skrifter og kjente gamle filaliaser beholdes.
- Storage-opplastinger krever administrator og eksplisitt sti. uploads godtar bilder/PDF opptil 20 MiB; avatars/images krever bilder under 10 MiB. Administrator kan slette. En bred reserveregel kan ikke lenger omgå kravene. Eksisterende offentlige medielesinger og serveropplastingenes tokenlenker bevares.
- Binder Storage-reglene i Firebase-konfigurasjonen og holder regelkopier identiske.
- Legger til lokale HTTP- og Firebase-emulatortester.

## Administrator og utestengingskontroll

Eksisterende godkjente e-poster i TK_ADMIN_EMAILS beholdes. De må ha email_verified og ikke anonym innlogging, eller ha en betrodd admin-claim. Ingen brukere gis nye rettigheter i denne leveransen. thomas@tk-design.no ble bekreftet som eksisterende, e-postverifisert og ikke deaktivert i riktig Firebase-prosjekt. Den tidligere planen om å kreve bare ny custom claim er derfor erstattet av kompatibel bruk av det eksisterende, betrodde oppsettet.

Facebook-tokenets tidligere kildeverdi er ikke brukt. Nyere kode har ingen slik reserveverdi; produksjon har miljøkonfigurasjon. Levende rotasjonsstatus er ikke bekreftet og skal ikke omtales som fullført.

## Kontroller

Fra legacy_html:

```sh
node --check server.js
node --check server/static-assets.js
node --require ./tests/offline-env.js --test tests/*.test.js tests/*.test.mjs
```

Regeltesten kjøres separat mot lokale emulatorer med prosjekt demo-tk-security og firebase.test.json, fra midlertidig arbeidsmappe. Bruk absolutt Node-sti for å unngå Firebase-CLI-ens pakkede kjøreprogram. Den kontrollerer administrator, godkjent verifisert e-post, uverifisert e-post, vanlig bruker, falsk claim og anonym tilgang. Ingen ekte publiserings- eller e-postkall gjøres i testene.

Publisering skal spores til eksakt Git-SHA, Vercel READY og riktige domenealiaser. Installerte Firebase-regler og offentlige/beskyttede nettadresser kontrolleres separat; lokal testsuksess alene er ikke en produksjonsbekreftelse.
