import { auth, db, storage, googleProvider, signInWithPopup, signOut, onAuthStateChanged, collection, addDoc, getDocs, query, orderBy, serverTimestamp, ref, uploadBytesResumable, getDownloadURL, deleteDoc, doc, deleteObject } from './firebase-init.js';

// DOM Elements
const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const userInfo = document.getElementById('user-info');
const userEmailEl = document.getElementById('user-email');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');

const uploadForm = document.getElementById('uploadForm');
const docTitleInput = document.getElementById('docTitle');
const docFileInput = document.getElementById('docFile');
const submitBtn = document.getElementById('submitBtn');
const uploadProgress = document.getElementById('uploadProgress');
const documentsContainer = document.getElementById('documentsContainer');

// Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        loginSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        userInfo.classList.remove('hidden');
        userEmailEl.textContent = user.email;
        loadDocuments();
    } else {
        // User is signed out
        loginSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
        userInfo.classList.add('hidden');
        userEmailEl.textContent = '';
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    try {
        loginError.textContent = '';
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Login error:", error);
        loginError.textContent = 'Kunne ikke logge inn: ' + error.message;
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// Upload Document
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = docTitleInput.value.trim();
    const file = docFileInput.files[0];
    
    if (!title || !file) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Laster opp...';
    
    try {
        // 1. Laste opp fil til Storage
        const filePath = `graphic_docs/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, filePath);
        
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                uploadProgress.textContent = `Laster opp: ${Math.round(progress)}%`;
            }, 
            (error) => {
                console.error("Upload failed", error);
                uploadProgress.textContent = 'Feil ved opplasting: ' + error.message;
                resetForm();
            }, 
            async () => {
                // Suksess
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                // 2. Lagre metadata i Firestore
                await addDoc(collection(db, "graphic_docs"), {
                    title: title,
                    url: downloadURL,
                    path: filePath,
                    type: file.type,
                    createdAt: serverTimestamp()
                });
                
                uploadProgress.textContent = 'Dokument lastet opp med suksess!';
                uploadProgress.style.color = 'green';
                resetForm();
                loadDocuments();
            }
        );
    } catch (error) {
        console.error("Error saving document:", error);
        uploadProgress.textContent = 'En feil oppstod.';
        resetForm();
    }
});

function resetForm() {
    uploadForm.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Last opp fil';
    setTimeout(() => { uploadProgress.textContent = ''; uploadProgress.style.color = '#666'; }, 3000);
}

// Load Documents
async function loadDocuments() {
    documentsContainer.innerHTML = 'Laster...';
    try {
        const q = query(collection(db, "graphic_docs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            documentsContainer.innerHTML = '<p style="color: #666;">Ingen dokumenter funnet.</p>';
            return;
        }

        documentsContainer.innerHTML = '';
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            const docEl = document.createElement('div');
            docEl.className = 'doc-item';
            
            // Sjekk om det er et bilde
            const isImage = data.type && data.type.startsWith('image/');
            const preview = isImage 
                ? `<img src="${data.url}" class="doc-img" alt="${data.title}">`
                : `<div class="doc-img">PDF/DOC</div>`;

            const dateStr = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleDateString('no-NO') : 'Ukjent dato';

            docEl.innerHTML = `
                ${preview}
                <div class="doc-info">
                    <h4 style="margin: 0 0 4px 0;"><a href="${data.url}" target="_blank" style="color: inherit; text-decoration: none;">${data.title}</a></h4>
                    <span style="font-size: 12px; color: #888;">Lagt til: ${dateStr}</span>
                </div>
                <button class="delete-btn" data-id="${id}" data-path="${data.path}">Slett</button>
            `;
            
            documentsContainer.appendChild(docEl);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm('Er du sikker på at du vil slette dette dokumentet?')) {
                    const id = e.target.getAttribute('data-id');
                    const path = e.target.getAttribute('data-path');
                    await deleteDocument(id, path);
                }
            });
        });

    } catch (error) {
        console.error("Feil ved lasting av dokumenter:", error);
        documentsContainer.innerHTML = '<p style="color: red;">Kunne ikke laste dokumenter. Sjekk Firestore-rettigheter.</p>';
    }
}

async function deleteDocument(id, path) {
    try {
        // Slett fra Firestore
        await deleteDoc(doc(db, "graphic_docs", id));
        // Slett fra Storage
        if (path) {
            const fileRef = ref(storage, path);
            await deleteObject(fileRef).catch(e => console.log('Storage fil kanskje allerede slettet:', e));
        }
        loadDocuments();
    } catch(error) {
        alert('Kunne ikke slette: ' + error.message);
    }
}
