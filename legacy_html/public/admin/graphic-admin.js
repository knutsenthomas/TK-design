(function() {
    const graphicUploadForm = document.getElementById('graphicUploadForm');
    const graphicPortfolioGrid = document.getElementById('graphicPortfolioGrid');
    const graphicUploadProgress = document.getElementById('graphicUploadProgress');

    async function uploadFileViaAdminApi(file, folder = 'grafisk') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        let token = null;
        if (window.firebaseAuth && window.firebaseAuth.currentUser) {
            token = await window.firebaseAuth.currentUser.getIdToken();
        }
        
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
        
        if (!window.firebaseDb) {
            setTimeout(loadGraphicDocuments, 500);
            return;
        }

        graphicPortfolioGrid.innerHTML = '<p>Laster inn...</p>';
        
        try {
            const snapshot = await window.firebaseDb.collection("graphicDocs")
                .orderBy("createdAt", "desc")
                .get();
            
            let html = '';
            snapshot.forEach((documentSnap) => {
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
                                await window.firebaseDb.collection("graphicDocs").doc(id).delete();
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
            
            if (!window.firebaseDb) {
                alert('Firebase er ikke klar enda. Prøv igjen om et øyeblikk.');
                return;
            }
            
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
                // 1. Last opp bilde via admin API
                const imageUrl = await uploadFileViaAdminApi(file, 'grafisk');
                
                graphicUploadProgress.innerText = 'Lagrer i databasen...';
                
                // 2. Lagre dokument i Firestore (V10 Compat)
                await window.firebaseDb.collection("graphicDocs").add({
                    title,
                    description,
                    imageUrl,
                    createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
                });
                
                graphicUploadProgress.innerText = 'Vellykket!';
                graphicUploadProgress.style.color = 'green';
                
                // Reset form
                graphicUploadForm.reset();
                setTimeout(() => {
                    graphicUploadProgress.innerText = '';
                    graphicUploadProgress.style.color = '#666';
                }, 3000);
                
                // Refresh grid
                loadGraphicDocuments();
                
            } catch (err) {
                console.error("Feil ved opplasting:", err);
                graphicUploadProgress.innerText = 'Feil: ' + err.message;
                graphicUploadProgress.style.color = 'red';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Last opp & publiser';
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadGraphicDocuments);
    } else {
        loadGraphicDocuments();
    }
})();
