const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'tk-design-f43f6.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const filesToUpload = [
    {
        filename: 'media_1786269259892.jpg',
        title: 'KT Design & Music Logo',
        desc: 'Sort KT-logo for KT Design & Music'
    },
    {
        filename: 'media_1786269598603.jpg',
        title: 'Din nye digitale partner',
        desc: 'Markedsføringsbilde med to personer og post-its'
    },
    {
        filename: 'media_1786269614933.png',
        title: 'Trenger du nettside?',
        desc: 'Rødt banner for webdesign med illustrasjon'
    },
    {
        filename: 'media_1786270633681.jpg',
        title: 'CONNECT17 COURAGE',
        desc: 'Connect 17 Courage plakat med løvehode og folk på fjell'
    }
];

const basePath = '/Users/thomasknutsen/.gemini/antigravity/brain/ecfa7c61-d245-4e12-b598-6990be3f9f6f/.user_uploaded';

async function uploadFiles() {
    for (const item of filesToUpload) {
        const filePath = path.join(basePath, item.filename);
        if (fs.existsSync(filePath)) {
            const destName = `graphic-docs/${Date.now()}_${item.filename}`;
            console.log(`Uploading ${item.filename} to ${destName}...`);
            try {
                await bucket.upload(filePath, {
                    destination: destName,
                    metadata: {
                        contentType: item.filename.endsWith('.png') ? 'image/png' : 'image/jpeg'
                    }
                });

                const file = bucket.file(destName);
                await file.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destName}`;

                console.log(`Uploaded! URL: ${publicUrl}`);
                
                await db.collection('graphicDocs').add({
                    title: item.title,
                    description: item.desc,
                    imageUrl: publicUrl,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`Saved to Firestore: ${item.title}`);
            } catch (err) {
                console.error(`Failed to upload ${item.filename}:`, err);
            }
        } else {
            console.log(`File not found: ${filePath}`);
        }
    }
    console.log("Done!");
    process.exit(0);
}

uploadFiles();
