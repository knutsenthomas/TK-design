import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const app = initializeApp(window.__TK_FIREBASE_CONFIG__, "graphic-admin-app");
const db = getFirestore(app);

const graphicUploadForm = document.getElementById('graphicUploadForm');
const graphicPortfolioGrid = document.getElementById('graphicPortfolioGrid');
const graphicUploadProgress = document.getElementById('graphicUploadProgress');

async function uploadFileViaAdminApi(file, folder = 'grafisk') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = await window.firebaseAuth?.currentUser?.getIdToken();
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/admin/storage/upload', {
        method: 'POST',
        headers: headers,
        body: formData
    });

    const payload = await response.json();
    if (!response.ok) {
        throw new Error(payload?.details || payload?.error || `Server upload failed (${response.status})`);
    }

    return payload.publicUrl || payload.url;
}

async function loadGraphicDocuments() {
    if (!graphicPortfolioGrid) return;
    graphicPortfolioGrid.innerHTML = '<p>Laster inn...</p>';
    
    try {
        const q = query(collection(db, "graphicDocs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        let html = '';
        querySnapshot.forEach((documentSnap) => {
            const data = documentSnap.data();
            const id = documentSnap.id;
            html += `
                <div class="card" style="position: relative; display: flex; flex-direction: column;">
                    <img src="${data.imageUrl}" alt="${data.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                    <div style="padding: 16px 0 0 0;">
                        <h4 style="margin: 0 0 8px 0;">${data.title}</h4>
                        <p style="color: #666; font-size: 0.9rem; margin: 0 0 16px 0;">${data.description}</p>
                    </div>
                    <button class="delete-graphic-btn" data-id="${id}" style="margin-top: auto; background: var(--danger, #ef4444); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer;">Slett</button>
                </div>
            `;
        });
        
        if (html === '') {
            graphicPortfolioGrid.innerHTML = '<p>Ingen dokumenter funnet i databasen.</p>';
        } else {
            graphicPortfolioGrid.innerHTML = html;
            
            // Bind delete buttons
            document.querySelectorAll('.delete-graphic-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm('Er du sikker på at du vil slette dette dokumentet?')) {
                        const id = e.target.getAttribute('data-id');
                        try {
                            e.target.innerText = 'Sletter...';
                            e.target.disabled = true;
                            await deleteDoc(doc(db, "graphicDocs", id));
                            loadGraphicDocuments();
                        } catch (err) {
                            console.error('Feil ved sletting:', err);
                            alert('Kunne ikke slette dokumentet. ' + err.message);
                            e.target.innerText = 'Slett';
                            e.target.disabled = false;
                        }
                    }
                });
            });
        }
    } catch (err) {
        console.error("Feil ved lasting av grafisk portefølje:", err);
        graphicPortfolioGrid.innerHTML = '<p style="color: red;">Feil: Kunne ikke hente data fra Firebase. Sjekk konsollen.</p>';
    }
}

if (graphicUploadForm) {
    graphicUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('graphicTitle').value;
        const description = document.getElementById('graphicDesc').value;
        const fileInput = document.getElementById('graphicFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Velg et bilde!');
            return;
        }
        
        const submitBtn = graphicUploadForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Laster opp...';
        graphicUploadProgress.innerText = 'Laster opp bilde til server...';
        
        try {
            // Last opp bilde
            const imageUrl = await uploadFileViaAdminApi(file, 'grafisk');
            
            graphicUploadProgress.innerText = 'Lagrer i database...';
            
            // Lagre i Firestore
            await addDoc(collection(db, "graphicDocs"), {
                title: title,
                description: description,
                imageUrl: imageUrl,
                createdAt: serverTimestamp()
            });
            
            graphicUploadProgress.innerText = 'Vellykket!';
            graphicUploadProgress.style.color = 'green';
            graphicUploadForm.reset();
            
            // Oppdater listen
            loadGraphicDocuments();
            
            setTimeout(() => {
                graphicUploadProgress.innerText = '';
                graphicUploadProgress.style.color = '#666';
            }, 3000);
            
        } catch (err) {
            console.error('Upload failed:', err);
            graphicUploadProgress.innerText = 'Feil: ' + err.message;
            graphicUploadProgress.style.color = 'red';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Last opp & publiser';
        }
    });
}

// Vent litt slik at admin panel tab system initialiseres først
setTimeout(() => {
    loadGraphicDocuments();
}, 1000);
