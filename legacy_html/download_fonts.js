const fs = require('fs');
const path = require('path');
const https = require('https');

const FONT_DIR = path.join(__dirname, 'assets', 'fonts');
if (!fs.existsSync(FONT_DIR)) {
    fs.mkdirSync(FONT_DIR, { recursive: true });
}

const url = 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap';

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
};

function downloadFile(fileUrl, destPath) {
    return new Promise((resolve, reject) => {
        https.get(fileUrl, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download: ${res.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
        }).on('error', reject);
    });
}

https.get(url, options, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', async () => {
        // Parse the CSS file returned by Google Fonts
        const fontFaceRegex = /\/\* ([^*]+) \*\/\s*@font-face\s*{([^}]+)}/g;
        let match;
        const fontFaces = [];

        while ((match = fontFaceRegex.exec(data)) !== null) {
            const subset = match[1].trim();
            const body = match[2];

            // Only download latin subset to keep page load minimal and clean
            if (subset !== 'latin') continue;

            const familyMatch = body.match(/font-family:\s*['"]?([^'";]+)['"]?/);
            const styleMatch = body.match(/font-style:\s*([^;]+)/);
            const weightMatch = body.match(/font-weight:\s*([^;]+)/);
            const urlMatch = body.match(/src:\s*url\(([^)]+)\)/);
            const unicodeMatch = body.match(/unicode-range:\s*([^;]+)/);

            if (familyMatch && weightMatch && urlMatch) {
                const family = familyMatch[1].trim();
                const style = styleMatch ? styleMatch[1].trim() : 'normal';
                const weight = weightMatch[1].trim();
                const fontUrl = urlMatch[1].trim();
                const unicode = unicodeMatch ? unicodeMatch[1].trim() : '';

                fontFaces.push({ family, style, weight, fontUrl, unicode });
            }
        }

        console.log(`Found ${fontFaces.length} latin font faces to download.`);

        let cssContent = '/* Local font definitions */\n\n';

        for (const face of fontFaces) {
            const safeFamily = face.family.replace(/\s+/g, '-').toLowerCase();
            const filename = `${safeFamily}-${face.weight}.woff2`;
            const destPath = path.join(FONT_DIR, filename);

            console.log(`Downloading ${face.family} (weight ${face.weight})...`);
            try {
                await downloadFile(face.fontUrl, destPath);
                console.log(`Successfully saved ${filename}`);

                cssContent += `@font-face {\n`;
                cssContent += `  font-family: '${face.family}';\n`;
                cssContent += `  font-style: ${face.style};\n`;
                cssContent += `  font-weight: ${face.weight};\n`;
                cssContent += `  font-display: fallback;\n`;
                cssContent += `  src: url('/assets/fonts/${filename}') format('woff2');\n`;
                if (face.unicode) {
                    cssContent += `  unicode-range: ${face.unicode};\n`;
                }
                cssContent += `}\n\n`;
            } catch (err) {
                console.error(`Failed to download ${filename}:`, err);
            }
        }

        fs.writeFileSync(path.join(__dirname, 'assets', 'fonts', 'fonts.css'), cssContent);
        console.log('Successfully wrote fonts.css');
    });
}).on('error', (err) => {
    console.error('Failed to fetch Google Fonts CSS:', err);
});
