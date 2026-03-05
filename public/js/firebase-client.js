(async function () {
    function createClientError(message) {
        return new Error(message);
    }

    function createStubClient(reason) {
        const error = createClientError(reason);

        return {
            auth: {
                async signInWithPassword() {
                    return { data: { user: null, session: null }, error };
                },
                async signInWithOAuth() {
                    return { data: { user: null, session: null }, error };
                },
                async getSession() {
                    return { data: { session: null }, error };
                },
                async signOut() {
                    return { error };
                },
                async updateUser() {
                    return { data: null, error };
                }
            },
            storage: {
                from() {
                    return {
                        async upload() {
                            return { data: null, error };
                        },
                        async getPublicUrl() {
                            return { data: { publicUrl: '' }, error };
                        }
                    };
                }
            }
        };
    }

    function getSafeDisplayName(user, profileData) {
        if (profileData && profileData.full_name) {
            return profileData.full_name;
        }

        if (user && user.displayName) {
            return user.displayName;
        }

        if (user && user.email) {
            return user.email.split('@')[0];
        }

        return 'Admin';
    }

    function mapFirebaseUser(user, profileData) {
        if (!user) {
            return null;
        }

        const safeProfile = profileData || {};
        const displayName = getSafeDisplayName(user, safeProfile);

        return {
            id: user.uid,
            email: user.email || '',
            user_metadata: {
                full_name: displayName,
                avatar_url: safeProfile.avatar_url || user.photoURL || '',
                phone: safeProfile.phone || '',
                address: safeProfile.address || '',
                dob: safeProfile.dob || '',
                bio: safeProfile.bio || ''
            }
        };
    }

    const configReady = window.__TK_FIREBASE_CONFIG_READY__;

    if (configReady && typeof configReady.then === 'function') {
        try {
            await configReady;
        } catch (error) {
            console.error('Firebase config promise failed:', error);
        }
    }

    const config = window.__TK_FIREBASE_CONFIG__ || {};
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'];
    const missingKeys = requiredKeys.filter((key) => !config[key]);

    if (!window.firebase) {
        console.error('Firebase SDK was not loaded before firebase-client.js.');
        window.adminAuthClient = createStubClient('Firebase SDK er ikke lastet inn.');
        return;
    }

    if (missingKeys.length > 0) {
        console.error(`Firebase config mangler: ${missingKeys.join(', ')}`);
        window.adminAuthClient = createStubClient(
            window.__TK_FIREBASE_CONFIG_ERROR__ || 'Firebase-konfigurasjonen er ikke ferdig satt opp.'
        );
        return;
    }

    const app = window.firebase.apps && window.firebase.apps.length
        ? window.firebase.app()
        : window.firebase.initializeApp(config);
    const auth = window.firebase.auth();
    const db = window.firebase.firestore();
    const storage = window.firebase.storage();
    const AUTH_INIT_TIMEOUT_MS = 3000;
    const PROFILE_LOAD_TIMEOUT_MS = 1500;

    window.firebaseApp = app;
    window.firebaseAuth = auth;
    window.firebaseDb = db;
    window.firebaseStorage = storage;

    const authReady = new Promise((resolve) => {
        let unsubscribe = function () { };

        unsubscribe = auth.onAuthStateChanged(
            () => {
                unsubscribe();
                resolve();
            },
            () => {
                resolve();
            }
        );
    });

    const persistenceReady = auth
        .setPersistence(window.firebase.auth.Auth.Persistence.LOCAL)
        .catch((error) => {
            console.error('Could not set Firebase auth persistence:', error);
            return null;
        });

    function withTimeout(promise, timeoutMs, errorMessage) {
        return Promise.race([
            promise,
            new Promise((_, reject) => {
                window.setTimeout(() => {
                    reject(createClientError(errorMessage));
                }, timeoutMs);
            })
        ]);
    }

    async function waitForAuthReady() {
        try {
            await withTimeout(
                authReady,
                AUTH_INIT_TIMEOUT_MS,
                'Firebase auth initialization timed out'
            );
        } catch (error) {
            console.warn(error.message);
        }
    }

    async function getProfileData(uid) {
        if (!uid) {
            return {};
        }

        try {
            const snapshot = await withTimeout(
                db.collection('adminProfiles').doc(uid).get(),
                PROFILE_LOAD_TIMEOUT_MS,
                'Firebase profile lookup timed out'
            );
            return snapshot.exists ? (snapshot.data() || {}) : {};
        } catch (error) {
            console.error('Could not load Firebase profile:', error);
            return {};
        }
    }

    async function getMappedCurrentUser() {
        await persistenceReady;
        await waitForAuthReady();

        if (!auth.currentUser) {
            return null;
        }

        const profileData = await getProfileData(auth.currentUser.uid);
        return mapFirebaseUser(auth.currentUser, profileData);
    }

    async function updateProfileDocument(user, data) {
        const displayName = (data.full_name || user.displayName || user.email || 'Admin').trim();
        const avatarUrl = data.avatar_url || user.photoURL || '';
        const profileDoc = {
            full_name: displayName,
            avatar_url: avatarUrl,
            phone: data.phone || '',
            address: data.address || '',
            dob: data.dob || '',
            bio: data.bio || '',
            email: user.email || '',
            updated_at: window.firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('adminProfiles').doc(user.uid).set(profileDoc, { merge: true });
        return profileDoc;
    }

    window.adminAuthClient = {
        auth: {
            async signInWithPassword({ email, password }) {
                try {
                    await persistenceReady;
                    await auth.signInWithEmailAndPassword(email, password);
                    const mappedUser = await getMappedCurrentUser();
                    return {
                        data: {
                            user: mappedUser,
                            session: mappedUser ? { user: mappedUser } : null
                        },
                        error: null
                    };
                } catch (error) {
                    return {
                        data: { user: null, session: null },
                        error
                    };
                }
            },

            async signInWithOAuth({ provider, options = {} }) {
                try {
                    if (provider !== 'google') {
                        throw createClientError('Bare Google-innlogging er støttet.');
                    }

                    await persistenceReady;
                    const googleProvider = new window.firebase.auth.GoogleAuthProvider();
                    await auth.signInWithPopup(googleProvider);
                    const mappedUser = await getMappedCurrentUser();

                    if (options.redirectTo) {
                        window.location.href = options.redirectTo;
                    }

                    return {
                        data: {
                            user: mappedUser,
                            session: mappedUser ? { user: mappedUser } : null
                        },
                        error: null
                    };
                } catch (error) {
                    return {
                        data: { user: null, session: null },
                        error
                    };
                }
            },

            async getSession() {
                try {
                    const mappedUser = await getMappedCurrentUser();
                    return {
                        data: {
                            session: mappedUser ? { user: mappedUser } : null
                        },
                        error: null
                    };
                } catch (error) {
                    return {
                        data: { session: null },
                        error
                    };
                }
            },

            async signOut() {
                try {
                    await persistenceReady;
                    await auth.signOut();
                    return { error: null };
                } catch (error) {
                    return { error };
                }
            },

            async updateUser({ data }) {
                try {
                    await authReady;

                    const user = auth.currentUser;
                    if (!user) {
                        throw createClientError('Ingen innlogget bruker funnet.');
                    }

                    const displayName = (data.full_name || user.displayName || '').trim();
                    const photoUrl = data.avatar_url || user.photoURL || null;

                    await user.updateProfile({
                        displayName: displayName || null,
                        photoURL: photoUrl
                    });

                    await updateProfileDocument(user, data);
                    const mappedUser = await getMappedCurrentUser();

                    return {
                        data: { user: mappedUser },
                        error: null
                    };
                } catch (error) {
                    return {
                        data: null,
                        error
                    };
                }
            }
        },

        storage: {
            from(folderName) {
                return {
                    async upload(filePath, file) {
                        try {
                            const fullPath = folderName ? `${folderName}/${filePath}` : filePath;
                            const ref = storage.ref(fullPath);
                            const snapshot = await ref.put(file);
                            const publicUrl = await snapshot.ref.getDownloadURL();

                            return {
                                data: {
                                    path: fullPath,
                                    fullPath,
                                    publicUrl
                                },
                                error: null
                            };
                        } catch (error) {
                            return {
                                data: null,
                                error
                            };
                        }
                    },

                    async getPublicUrl(filePath) {
                        try {
                            const fullPath = folderName ? `${folderName}/${filePath}` : filePath;
                            const publicUrl = await storage.ref(fullPath).getDownloadURL();

                            return {
                                data: { publicUrl },
                                error: null
                            };
                        } catch (error) {
                            return {
                                data: { publicUrl: '' },
                                error
                            };
                        }
                    }
                };
            }
        }
    };
})();
