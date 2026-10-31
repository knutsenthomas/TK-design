const { test } = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp, deleteApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, deleteDoc, terminate } = require('firebase/firestore');
const { getStorage, connectStorageEmulator, ref, uploadBytes, getBytes, deleteObject } = require('firebase/storage');

test('real Firebase emulators enforce private reads, admin writes and upload limits', {
    skip: !process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_STORAGE_EMULATOR_HOST
}, async () => {
    const [dbHost, dbPort] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
    const [storageHost, storagePort] = process.env.FIREBASE_STORAGE_EMULATOR_HOST.split(':');
    assert.equal(dbHost, '127.0.0.1');
    assert.equal(storageHost, '127.0.0.1');
    const clients = [];
    function client(name, claims) {
        const app = initializeApp({ projectId: 'demo-tk-security', storageBucket: 'demo-tk-security.appspot.com', apiKey: 'demo-key' }, name);
        const db = getFirestore(app);
        connectFirestoreEmulator(db, dbHost, Number(dbPort), claims ? { mockUserToken: claims } : undefined);
        const storage = getStorage(app);
        connectStorageEmulator(storage, storageHost, Number(storagePort), claims ? { mockUserToken: claims } : undefined);
        const value = { app, db, storage }; clients.push(value); return value;
    }
    const admin = client('admin', { sub: 'operator', admin: true });
    const owner = client('owner', { sub: 'verified-owner', email: 'thomas@tk-design.no', email_verified: true, firebase: { sign_in_provider: 'google.com' } });
    const unverified = client('unverified', { sub: 'unverified', email: 'thomas@tk-design.no', email_verified: false });
    const ordinary = client('ordinary', { sub: 'visitor' });
    const stringClaim = client('string-claim', { sub: 'impostor', admin: 'true' });
    const anonymous = client('anonymous');
    const denied = promise => assert.rejects(promise, error => /permission-denied|unauthorized/.test(error.code));
    try {
        for (const collection of ['contactMessages', 'siteAdminData', 'adminProfiles', 'graphicDocs', 'posts']) {
            await setDoc(doc(admin.db, collection, 'seed'), { value: 'local-test' });
        }
        for (const user of [anonymous, ordinary, stringClaim, unverified]) {
            for (const collection of ['contactMessages', 'siteAdminData', 'adminProfiles']) {
                await denied(getDoc(doc(user.db, collection, 'seed')));
            }
            for (const collection of ['graphicDocs', 'posts']) {
                assert.equal((await getDoc(doc(user.db, collection, 'seed'))).exists(), true);
                await denied(setDoc(doc(user.db, collection, 'seed'), { value: 'forged' }));
                await denied(deleteDoc(doc(user.db, collection, 'seed')));
            }
        }
        await setDoc(doc(ordinary.db, 'adminProfiles', 'visitor'), { full_name: 'Own profile', admin: true });
        assert.equal((await getDoc(doc(ordinary.db, 'adminProfiles', 'visitor'))).exists(), true);
        await denied(getDoc(doc(ordinary.db, 'contactMessages', 'seed')));
        await denied(setDoc(doc(ordinary.db, 'adminProfiles', 'another'), { admin: true }));
        assert.equal((await getDoc(doc(owner.db, 'contactMessages', 'seed'))).exists(), true);
        await setDoc(doc(owner.db, 'posts', 'owner'), { value: 'verified owner works' });
        await deleteDoc(doc(admin.db, 'posts', 'seed'));

        const image = new Uint8Array([137, 80, 78, 71]);
        await uploadBytes(ref(admin.storage, 'uploads/test.pdf'), image, { contentType: 'application/pdf' });
        await uploadBytes(ref(admin.storage, 'avatars/test.png'), image, { contentType: 'image/png' });
        assert.ok((await getBytes(ref(anonymous.storage, 'uploads/test.pdf'))).byteLength);
        for (const user of [anonymous, ordinary, stringClaim, unverified]) {
            await denied(uploadBytes(ref(user.storage, 'uploads/forged.png'), image, { contentType: 'image/png' }));
            await denied(deleteObject(ref(user.storage, 'avatars/test.png')));
        }
        await denied(uploadBytes(ref(admin.storage, 'avatars/not-an-image.pdf'), image, { contentType: 'application/pdf' }));
        await denied(uploadBytes(ref(admin.storage, 'images/oversize.png'), new Uint8Array(10 * 1024 * 1024), { contentType: 'image/png' }));
        await denied(uploadBytes(ref(admin.storage, 'uploads/not-allowed.html'), image, { contentType: 'text/html' }));
        await denied(uploadBytes(ref(admin.storage, 'private/unexpected.png'), image, { contentType: 'image/png' }));
        await deleteObject(ref(admin.storage, 'avatars/test.png'));
        await deleteObject(ref(admin.storage, 'uploads/test.pdf'));
    } finally {
        await Promise.all(clients.map(async c => { await terminate(c.db); await deleteApp(c.app); }));
    }
});
