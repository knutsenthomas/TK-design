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

    window.loadGraphicDocuments = async function() {
        if (!graphicPortfolioGrid) return;
        
        if (!window.firebaseDb) {
            setTimeout(window.loadGraphicDocuments, 500);
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
                const badge = (data.imageUrls && data.imageUrls.length > 1) 
                    ? \`<div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">📁 \${data.imageUrls.length} bilder</div>\` 
                    : '';
                html += \`
                    <div class="card" style="position: relative; display: flex; flex-direction: column;">
                        <img src="\${data.imageUrl}" alt="\${data.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                        \${badge}
                        <div style="padding: 16px 0 0 0;">
                            <h4 style="margin: 0 0 8px 0;">\${data.title}</h4>
                            <p style="color: #666; font-size: 0.9rem; margin: 0 0 16px 0;">\${data.description}</p>
                        </div>
                        <button class="delete-graphic-btn" data-id="\${id}" style="margin-top: auto; background: var(--danger, #ef4444); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer;">Slett</button>
                    </div>
                \`;
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
                                window.loadGraphicDocuments();
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

    // The submit listener has been moved to an inline script in index.html to guarantee it runs

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.loadGraphicDocuments);
    } else {
        window.loadGraphicDocuments();
    }
})();
