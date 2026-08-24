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
                const url = data.imageUrl || (data.imageUrls && data.imageUrls[0]) || '';
                const isPdf = data.isPdf || (url && url.toLowerCase().includes('.pdf'));
                const count = (data.imageUrls && data.imageUrls.length) || 1;
                
                const badge = count > 1 
                    ? `<div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">📁 ${count} filer</div>` 
                    : (isPdf ? `<div style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">📄 PDF</div>` : '');
                
                const mediaPreview = isPdf 
                    ? `<div style="width: 100%; height: 180px; background: #fef2f2; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #fee2e2;">
                         <span style="font-size: 48px;">📄</span>
                         <span style="font-weight: 700; font-size: 0.8rem; color: #991b1b; margin-top: 6px;">PDF-DOKUMENT</span>
                       </div>`
                    : `<div style="width: 100%; height: 180px; background: #f8fafc; display: flex; align-items: center; justify-content: center; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; padding: 8px; box-sizing: border-box;">
                         <img src="${url}" alt="${data.title || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                       </div>`;

                html += `
                    <div class="card" style="position: relative; display: flex; flex-direction: column; padding: 14px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                        ${mediaPreview}
                        ${badge}
                        <div style="padding: 12px 0 0 0; flex: 1;">
                            <span style="display: inline-block; font-size: 0.75rem; font-weight: 700; color: #f97316; text-transform: uppercase; margin-bottom: 4px;">${data.category || (isPdf ? 'Flyer / PDF' : 'Grafisk')}</span>
                            <h4 style="margin: 0 0 6px 0; font-size: 1.05rem;">${data.title || 'Uten tittel'}</h4>
                            <p style="color: #666; font-size: 0.88rem; margin: 0 0 12px 0; line-height: 1.4;">${data.description || ''}</p>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: auto;">
                            <a href="${url}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #f1f5f9; color: #1e293b; padding: 8px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 600;">Åpne fil</a>
                            <button class="delete-graphic-btn" data-id="${id}" style="background: var(--danger, #ef4444); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Slett</button>
                        </div>
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
