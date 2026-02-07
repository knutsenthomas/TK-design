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
