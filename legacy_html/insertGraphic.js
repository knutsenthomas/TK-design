const admin = require('firebase-admin');
const fs = require('fs');
require('dotenv').config();

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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

async function insertToFirestore() {
    for (const item of filesToUpload) {
        try {
            const publicUrl = `/img/grafisk/${item.filename}`;
            await db.collection('graphicDocs').add({
                title: item.title,
                description: item.desc,
                imageUrl: publicUrl,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Saved to Firestore: ${item.title}`);
        } catch (err) {
            console.error(`Failed to save ${item.filename}:`, err);
        }
    }
    console.log("Done!");
    process.exit(0);
}

insertToFirestore();
