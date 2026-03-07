const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const filesToConvert = [
    'img/project/Kudos Regnskap.png',
    'img/project/pro6.png',
    'img/logo/d.png',
    'img/project/pro2.png',
    'img/project/project-need.png',
    'img/project/pro5.png'
];

async function convertImages() {
    for (const file of filesToConvert) {
        const fullPath = path.join(__dirname, file);
        if (fs.existsSync(fullPath)) {
            const outputPath = fullPath.replace(/\.png$/, '.webp');
            console.log(`Converting ${fullPath} to ${outputPath}...`);
            await sharp(fullPath)
                .webp({ quality: 80 })
                .toFile(outputPath);
            console.log(`Done: ${outputPath}`);
        } else {
            console.log(`File not found: ${fullPath}`);
        }
    }
}

convertImages().catch(console.error);
