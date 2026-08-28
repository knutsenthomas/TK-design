/**
 * Oppfølgingssekvens for verktøybrukere (Nettside-sjekkeren) fra august
 * 
 * Steg 1: Personlig e-post med konkret observasjon fra analysen
 * Steg 2: Oppfølgings-e-post med TK-design Supportavtale som løsning
 */

require("../legacy_html/node_modules/dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");

// August verktøybrukere (leads som har testet nettsiden sin)
const AUGUST_LEADS = [
    {
        id: "lead-aug-01",
        name: "Morten",
        company: "Bygg & Montasje AS",
        email: "morten@bygg-montasje.no",
        domain: "bygg-montasje.no",
        testedAt: "2026-08-14",
        findings: {
            mobileScore: 42,
            lcp: "4.8 s",
            mainIssue: "Store ukomprimerte JPEG-bilder i hero-seksjonen og 1.2s render-blokkerende JavaScript",
            quickWin: "Konvertering av hero-bilder til WebP/AVIF og utsatt lasting (defer) av skript"
        }
    },
    {
        id: "lead-aug-02",
        name: "Camilla",
        company: "Nordic Helse & Velvære",
        email: "camilla@nordichelse.no",
        domain: "nordichelse.no",
        testedAt: "2026-08-19",
        findings: {
            mobileScore: 54,
            lcp: "3.6 s",
            mainIssue: "Layout shifts (CLS på 0.28) fordi bilder og booking-widget mangler faste dimensjoner",
            quickWin: "Faste container-høyder og asynkron innlasting av booking-skript"
        }
    },
    {
        id: "lead-aug-03",
        name: "Eirik",
        company: "Sørlandets Revisjon & Rådgivning",
        email: "eirik@sorlandrevisjon.no",
        domain: "sorlandrevisjon.no",
        testedAt: "2026-08-24",
        findings: {
            mobileScore: 49,
            lcp: "4.1 s",
            mainIssue: "Manglende JSON-LD Schema.org strukturert data og blokkerende fonter/CSS",
            quickWin: "Preload av nøkkelfonter og implementering av LocalBusiness & Service schema"
        }
    }
];

function generateEmail1(lead) {
    const subject = `Konkret observasjon fra analysen av ${lead.domain}`;
    const plainText = `Hei ${lead.name || "der"},

Jeg så du kjørte ${lead.domain} gjennom nettside-sjekkeren vår i august.

Jeg tok en rask manuell titt på rapporten din, og det er spesielt én ting som peker seg ut:
👉 ${lead.findings.mainIssue} (Mobilscore: ${lead.findings.mobileScore}/100, LCP: ${lead.findings.lcp}).

I praksis betyr dette at 30–50 % av mobilbesøkende opplever treghet og faller av før de i det hele tatt rekker å lese om tjenestene deres – i tillegg til at Google rangerer tregere sider lavere i søkeresultatene.

Den gode nyheten er at dette er enkle tekniske grep å utbedre (${lead.findings.quickWin}).

Har dere lagt en plan for å få rettet opp dette, eller vil du at jeg skal ta en rask 10-minutters kikk sammen med deg?

Svar bare direkte på denne e-posten, så finner vi et tidspunkt som passer.

Vennlig hilsen,
Thomas Knutsen
TK-design | Tlf: 930 94 615
https://tk-design.no`;

    const html = `
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #102033; line-height: 1.6; margin: 0; padding: 24px; background: #f8fafc; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .finding-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 15px; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="card">
        <p>Hei ${lead.name || "der"},</p>
        <p>Jeg så du kjørte <strong>${lead.domain}</strong> gjennom nettside-sjekkeren vår i august.</p>
        <p>Jeg tok en rask manuell titt på rapporten din, og det er spesielt én ting som peker seg ut:</p>
        
        <div class="finding-box">
            <strong>Konkret funn:</strong> ${lead.findings.mainIssue}<br>
            <span style="font-size: 13px; color: #166534;">(Mobilscore: ${lead.findings.mobileScore}/100 &bull; LCP: ${lead.findings.lcp})</span>
        </div>

        <p>I praksis betyr dette at 30–50 % av mobilbesøkende opplever treghet og faller av før de rekker å vurdere dere – og Google gir tregere nettsider dårligere synlighet.</p>
        <p>Den gode nyheten er at dette lar seg løse raskt med riktige tekniske grep (bl.a. ${lead.findings.quickWin}).</p>
        
        <p>Har dere lagt en plan for å få rettet opp dette, eller vil du at jeg skal ta en rask 10-minutters kikk sammen med deg?</p>
        <p><strong>Svar bare direkte på denne e-posten</strong>, så finner vi et tidspunkt som passer.</p>

        <div class="footer">
            <strong>Thomas Knutsen</strong><br>
            TK-design &bull; Tlf: 930 94 615<br>
            <a href="https://tk-design.no" style="color: #ff6a1b; text-decoration: none;">tk-design.no</a>
        </div>
    </div>
</body>
</html>`;

    return { subject, plainText, html };
}

function generateEmail2(lead) {
    const subject = `Slik holder du ${lead.domain} lynrask og feilfri fremover (uten hodebry)`;
    const plainText = `Hei igjen ${lead.name || "der"},

Følger bare opp e-posten fra her om dagen angående nettsiden din (${lead.domain}).

De fleste bedriftseiere jeg snakker med ønsker verken å bruke tid på kodefeilsøking, bildekomprimering eller å overvåke at Google Core Web Vitals holder seg grønne måned etter måned.

Derfor har vi opprettet TK-design Supportavtale:

⚡ Umiddelbar utbedring: Vi fikser feilene fra testen med en gang (${lead.findings.quickWin}).
🛡️ Kontinuerlig overvåking: Ukentlige sikkerhetsoppdateringer, backup og oppetidssjekk.
📈 100/100 Core Web Vitals: Vi passer på at siden din alltid er lynrask på mobil og desktop.
📞 Direkte hjelp: Fast kontaktperson uten trege ticketsystemer.
🤝 Fastpris fra kr 1 000,- / mnd (eks. mva) – helt uten bindingstid.

Du kan sikre avtalen din her:
👉 https://tk-design.no/contact?service=support

Eller svar direkte på denne e-posten om du lurer på noe, så hjelper jeg deg i gang.

Beste hilsen,
Thomas Knutsen
TK-design | Tlf: 930 94 615
https://tk-design.no/support-og-vedlikehold`;

    const html = `
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #102033; line-height: 1.6; margin: 0; padding: 24px; background: #f8fafc; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .offer-box { background: linear-gradient(135deg, #102033 0%, #173651 100%); color: #ffffff; padding: 24px; border-radius: 14px; margin: 24px 0; }
        .offer-box h3 { margin: 0 0 12px 0; color: #ffffff; font-size: 20px; }
        .offer-box ul { padding-left: 20px; margin: 0 0 18px 0; }
        .offer-box li { margin-bottom: 8px; color: #e2e8f0; }
        .cta-btn { display: inline-block; background: #ff6a1b; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 999px; text-decoration: none; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="card">
        <p>Hei igjen ${lead.name || "der"},</p>
        <p>Følger bare opp meldingen fra her om dagen angående <strong>${lead.domain}</strong>.</p>
        <p>De færreste bedrifter har tid til å sitte med kodefeilsøking, bildekomprimering og Core Web Vitals-justeringer i en travel hverdag.</p>
        
        <div class="offer-box">
            <h3>TK-design Support- og Driftsavtale</h3>
            <ul>
                <li><strong>Lynrask feilretting:</strong> Vi utbedrer funnene fra testen med en gang (${lead.findings.quickWin}).</li>
                <li><strong>Trygg overvåking:</strong> Ukentlige sikkerhetsoppdateringer, automatiske backuper og oppetidssjekk.</li>
                <li><strong>100/100 Ytelse & SEO:</strong> Vi sikrer at siden holder seg på topp i Google.</li>
                <li><strong>Fastpris:</strong> Fra kr 1 000,- / mnd (eks. mva) &bull; <em>Ingen bindingstid</em></li>
            </ul>
            <a href="https://tk-design.no/contact?service=support" class="cta-btn">Sikre din supportavtale nå &rarr;</a>
        </div>

        <p>Eller svar direkte på denne e-posten, så ordner vi oppsettet for deg.</p>

        <div class="footer">
            <strong>Thomas Knutsen</strong><br>
            TK-design &bull; Tlf: 930 94 615<br>
            <a href="https://tk-design.no/support-og-vedlikehold" style="color: #ff6a1b; text-decoration: none;">Les mer om supportavtalen her</a>
        </div>
    </div>
</body>
</html>`;

    return { subject, plainText, html };
}

async function sendEmailViaResend(to, subject, html, text) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("RESEND_API_KEY mangler i .env");
    }
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Thomas Knutsen – TK-design <thomas@tk-design.no>";
    const replyTo = process.env.CONTACT_TO_EMAIL || "thomas@tk-design.no";

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject,
            html,
            text,
            reply_to: replyTo
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Resend API feilet: ${response.status} ${err}`);
    }

    return await response.json();
}

// Eksport til CSV (med ";" skilletegn og UTF-8 BOM ifølge regel 3)
function exportAugustLeadsToCsv() {
    const header = "\uFEFFID;Navn;Bedrift;E-post;Domene;Testdato;Mobilscore;LCP;Hovedavvik;Anbefalt_Tiltak\n";
    const rows = AUGUST_LEADS.map(l => 
        `"${l.id}";"${l.name}";"${l.company}";"${l.email}";"${l.domain}";"${l.testedAt}";"${l.findings.mobileScore}";"${l.findings.lcp}";"${l.findings.mainIssue}";"${l.findings.quickWin}"`
    ).join("\n");
    
    const filePath = path.resolve(__dirname, "../docs/august_leads_export.csv");
    fs.writeFileSync(filePath, header + rows, "utf-8");
    console.log(`[CSV] Leads eksportert til: ${filePath}`);
}

async function run() {
    const isSendMode = process.argv.includes("--send");
    const isStep2 = process.argv.includes("--step2");

    console.log("====================================================");
    console.log(`TK-design Oppfølgingssekvens for August-leads`);
    console.log(`Modus: ${isSendMode ? "🚀 LIVE UTSENDING" : "🔍 FORHÅNDSVISNING (Dry-run)"}`);
    console.log(`Steg: ${isStep2 ? "Steg 2 (Supportavtale som løsning)" : "Steg 1 (Personlig observasjon)"}`);
    console.log("====================================================\n");

    exportAugustLeadsToCsv();

    for (const lead of AUGUST_LEADS) {
        const emailData = isStep2 ? generateEmail2(lead) : generateEmail1(lead);
        console.log(`----------------------------------------------------`);
        console.log(`Mottaker: ${lead.name} (${lead.email}) [${lead.domain}]`);
        console.log(`Emne: ${emailData.subject}`);
        console.log(`Innhold utdrag:\n${emailData.plainText.slice(0, 250)}...\n`);

        if (isSendMode) {
            try {
                const res = await sendEmailViaResend(lead.email, emailData.subject, emailData.html, emailData.plainText);
                console.log(`✅ Sendt via Resend ID: ${res.id}`);
            } catch (err) {
                console.error(`❌ Feil ved sending til ${lead.email}:`, err.message);
            }
        }
    }

    console.log("\n====================================================");
    console.log(isSendMode ? "Ferdig utsendt!" : "Dry-run fullført. For å sende på ekte, kjør med flagget --send");
    console.log("====================================================");
}

if (require.main === module) {
    run().catch(console.error);
}

module.exports = { AUGUST_LEADS, generateEmail1, generateEmail2, exportAugustLeadsToCsv };
