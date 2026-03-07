# API-nøkler Setup Guide

For å bruke AI-funksjonene i bloggeditoren trenger du API-nøkler fra Google Gemini og Unsplash.

## 1. Google Gemini API-nøkkel

1. Gå til [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Logg inn med Google-kontoen din
3. Klikk på "Get API Key" eller "Create API Key"
4. Kopier API-nøkkelen

## 2. Unsplash API-nøkkel

1. Gå til [Unsplash Developers](https://unsplash.com/developers)
2. Registrer deg / logg inn
3. Klikk på "New Application"
4. Godta vilkårene og gi appen et navn (f.eks. "TK Design Blog")
5. Kopier "Access Key" (ikke Secret Key)

## 3. Legg til nøklene i .env-filen

Åpne filen `.env` i rotmappen av prosjektet og erstatt plassholderne:

```
GEMINI_API_KEY=din_faktiske_gemini_api_nøkkel_her
UNSPLASH_ACCESS_KEY=din_faktiske_unsplash_access_key_her
```

## 4. Restart serveren

Stopp serveren (Ctrl+C) og start den på nytt:

```bash
node server.js
```

## Ferdig! 🎉

Nå kan du:
- ✨ Generere blogginnhold med AI ved å skrive inn et tema
- 🖼️ Søke etter profesjonelle bilder fra Unsplash
- 📤 Laste opp dine egne bilder til bloggen

Alle funksjonene finner du i venstre sidebar når du oppretter/redigerer et blogginnlegg.

## 5. Kontaktskjema (Firebase Firestore + e-postvarsel)

Kontaktsiden bruker en backend-route i `server.js` som:

- lagrer meldingen i en Firestore-collection i Firebase
- sender e-postvarsel til `thomas@tk-design.no` via Resend når Resend er satt opp

Legg til disse verdiene i `.env`:

```env
TK_FIREBASE_PROJECT_ID=tk-design-f43f6
TK_FIREBASE_CLIENT_EMAIL=din_service_account_client_email
TK_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
TK_FIREBASE_DATABASE_ID=(default)
TK_FIREBASE_CONTACT_COLLECTION=contactMessages

RESEND_API_KEY=din_resend_api_nokkel
RESEND_FROM_EMAIL=TK-design <onboarding@resend.dev>
CONTACT_TO_EMAIL=thomas@tk-design.no
```

Merk:

- `TK_FIREBASE_PROJECT_ID`, `TK_FIREBASE_CLIENT_EMAIL` og `TK_FIREBASE_PRIVATE_KEY` må komme fra en Firebase/Google Cloud service account med tilgang til Firestore.
- `TK_FIREBASE_DATABASE_ID` og `TK_FIREBASE_CONTACT_COLLECTION` er valgfrie. Hvis de ikke er satt, brukes `(default)` og `contactMessages`.
- `RESEND_API_KEY` må være satt for at e-postvarsel faktisk skal bli sendt.
- Du trenger ikke kjøre SQL for kontaktskjemaet når du bruker Firestore, men du må ha aktivert Firestore i Firebase-prosjektet ditt.
- Hvis nettsiden er deployet (for eksempel på Vercel), må variablene også settes i deploy-miljøet. Lokal `.env` alene påvirker ikke produksjon.

## 6. Admin-panel (Firebase Auth, Firestore og Storage)

Admin-login og profilhåndtering bruker nå Firebase-klienten i stedet for Supabase. For at `admin/login.html` og `admin/index.html` skal fungere, må serveren kunne eksponere den offentlige Firebase web-konfigurasjonen.

Legg også til disse verdiene i `.env`:

```env
TK_FIREBASE_WEB_API_KEY=din_firebase_web_api_key
TK_FIREBASE_AUTH_DOMAIN=tk-design-f43f6.firebaseapp.com
TK_FIREBASE_STORAGE_BUCKET=tk-design-f43f6.firebasestorage.app
TK_FIREBASE_MESSAGING_SENDER_ID=din_sender_id
TK_FIREBASE_APP_ID=din_app_id
```

Merk:

- `TK_FIREBASE_PROJECT_ID` fra steg 5 gjenbrukes også av admin-klienten.
- Google-innlogging må være aktivert i Firebase Authentication hvis du vil bruke "Sign in with Google".
- E-post/passord-innlogging må også være aktivert i Firebase Authentication hvis du vil bruke vanlig admin-login.
- Admin-profilfelt lagres i Firestore under `adminProfiles/{uid}`.
- Profilbilder lagres i Firebase Storage. Hvis du vil at opplastede avatarer skal kunne vises direkte, må Storage-reglene tillate lesing for de filene du bruker.

## 7. SoMe auto-post ved publisering (Make/Zapier/Buffer)

Når du trykker **Publiser** i bloggeditoren kan serveren nå sende et webhook-kall automatisk.

Legg til i `.env`:

```env
SOCIAL_WEBHOOK_URL=https://hook.eu1.make.com/xxxxxxxxxxxxxxxx
SOCIAL_WEBHOOK_SECRET=valgfri_hemmlig_nokkel
SOCIAL_WEBHOOK_TIMEOUT_MS=8000
SITE_URL=https://www.tk-design.no
```

Merk:

- `SOCIAL_WEBHOOK_URL` er webhook-endepunktet ditt (for eksempel fra Make eller Zapier).
- `SOCIAL_WEBHOOK_SECRET` er valgfri. Hvis satt, sender serveren en signatur i header `X-TK-Signature` (HMAC SHA-256).
- `SITE_URL` brukes for å bygge absolutte lenker i payloaden.
- Hvis webhook ikke er satt, publiseres innlegget fortsatt normalt uten SoMe-feil.
