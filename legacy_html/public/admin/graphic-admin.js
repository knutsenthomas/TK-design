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

    let pdfjsLoadingPromise = null;
    window.loadPdfJs = function() {
        if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
        if (pdfjsLoadingPromise) return pdfjsLoadingPromise;
        pdfjsLoadingPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    resolve(window.pdfjsLib);
                } else {
                    reject(new Error('PDF.js unavailable'));
                }
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return pdfjsLoadingPromise;
    };

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
                const thumb = data.thumbnailUrl || (isPdf ? '' : url);
                const count = (data.imageUrls && data.imageUrls.length) || 1;
                
                const badge = count > 1 
                    ? `<div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">📁 ${count} filer</div>` 
                    : (isPdf ? `<div style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">📄 PDF</div>` : '');
                
                let mediaPreview = '';
                if (thumb) {
                    mediaPreview = `<div style="width: 100%; height: 180px; background: #f8fafc; display: flex; align-items: center; justify-content: center; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; padding: 8px; box-sizing: border-box;">
                         <img src="${thumb}" alt="${data.title || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                       </div>`;
                } else if (isPdf) {
                    mediaPreview = `<div class="admin-pdf-preview-box" data-pdf-url="${url}" style="width: 100%; height: 180px; background: #fef2f2; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #fee2e2; overflow: hidden; padding: 10px; box-sizing: border-box;">
                         <span style="font-size: 40px;">📄</span>
                         <span style="font-weight: 700; font-size: 0.75rem; color: #991b1b; margin-top: 6px;">PDF-DOKUMENT</span>
                       </div>`;
                } else {
                    mediaPreview = `<div style="width: 100%; height: 180px; background: #f8fafc; display: flex; align-items: center; justify-content: center; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; padding: 8px; box-sizing: border-box;">
                         <img src="${url}" alt="${data.title || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                       </div>`;
                }

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
                            ${isPdf 
                                ? `<button type="button" onclick="window.openPdfModal('${url}', '${(data.title || 'Dokument').replace(/'/g, "\\'")}')" style="flex: 1; text-align: center; background: #f1f5f9; color: #1e293b; padding: 8px; border-radius: 6px; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 4px;"><i class="fas fa-eye"></i> Forhåndsvis</button>`
                                : `<a href="${url}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #f1f5f9; color: #1e293b; padding: 8px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 600;">Åpne fil</a>`
                            }
                            <button class="delete-graphic-btn" data-id="${id}" style="background: var(--danger, #ef4444); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Slett</button>
                        </div>
                    </div>
                `;
            });
            
            if (html === '') {
                graphicPortfolioGrid.innerHTML = '<p>Ingen dokumenter funnet i databasen.</p>';
            } else {
                graphicPortfolioGrid.innerHTML = html;
                
                // Render PDF thumbnails via proxy for existing PDFs
                const pdfBoxes = graphicPortfolioGrid.querySelectorAll('.admin-pdf-preview-box[data-pdf-url]');
                pdfBoxes.forEach(box => {
                    const pdfUrl = box.getAttribute('data-pdf-url');
                    if (pdfUrl) renderAdminPdfThumbnail(box, pdfUrl);
                });

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
    };

    async function renderAdminPdfThumbnail(container, pdfUrl) {
        if (!container || !pdfUrl) return;
        try {
            const pdfjs = await window.loadPdfJs();
            const proxyUrl = pdfUrl.startsWith('http') && !pdfUrl.includes('/api/proxy-pdf')
                ? `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`
                : pdfUrl;

            const loadingTask = pdfjs.getDocument({
                url: proxyUrl,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true
            });
            const pdfDoc = await loadingTask.promise;
            const page = await pdfDoc.getPage(1);

            const unscaledViewport = page.getViewport({ scale: 1.0 });
            const targetWidth = container.clientWidth || 250;
            const targetHeight = container.clientHeight || 180;
            const scale = Math.min(targetWidth / unscaledViewport.width, targetHeight / unscaledViewport.height) * (window.devicePixelRatio || 1.5);
            const viewport = page.getViewport({ scale: Math.max(scale, 0.7) });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '100%';
            canvas.style.width = 'auto';
            canvas.style.height = 'auto';
            canvas.style.objectFit = 'contain';
            canvas.style.display = 'block';
            canvas.style.borderRadius = '4px';
            canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            container.innerHTML = '';
            container.appendChild(canvas);
        } catch (e) {
            console.warn('Kunne ikke generere admin PDF-forhåndsvisning:', e);
        }
    }

    let currentAdminPdfDoc = null;
    let currentAdminPdfScale = 1.25;

    function createAdminPdfModalIfNotExists() {
        if (document.getElementById('tk-admin-pdf-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'tk-admin-pdf-modal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            display: flex;
            flex-direction: column;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
        `;

        modal.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: rgba(30, 41, 59, 0.95); border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: white; gap: 16px; flex-shrink: 0;">
                <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                    <span style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 800;">📄 PDF</span>
                    <h4 id="tk-admin-pdf-modal-title" style="margin: 0; font-size: 1.05rem; font-weight: 600; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Dokumentvisning</h4>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 2px 6px; gap: 6px;">
                        <button id="tk-admin-zoom-out" style="background: none; border: none; color: white; padding: 6px 10px; cursor: pointer; font-size: 1.1rem; border-radius: 4px;" title="Zoom ut">−</button>
                        <span id="tk-admin-zoom-label" style="font-size: 0.85rem; font-weight: 600; min-width: 44px; text-align: center;">100%</span>
                        <button id="tk-admin-zoom-in" style="background: none; border: none; color: white; padding: 6px 10px; cursor: pointer; font-size: 1.1rem; border-radius: 4px;" title="Zoom inn">+</button>
                    </div>
                    
                    <button id="tk-admin-pdf-close" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer;" title="Lukk">
                        <i class="fas fa-times"></i> Lukk
                    </button>
                </div>
            </div>

            <div id="tk-admin-pdf-pages" style="flex: 1; overflow-y: auto; overflow-x: auto; padding: 32px 16px; display: flex; flex-direction: column; align-items: center; gap: 24px; user-select: none;" oncontextmenu="return false;">
                <div id="tk-admin-pdf-loading" style="color: white; font-size: 1.1rem; margin: auto;">Laster dokument...</div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('tk-admin-pdf-close').addEventListener('click', closeAdminPdfModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.id === 'tk-admin-pdf-pages') closeAdminPdfModal();
        });

        document.getElementById('tk-admin-zoom-in').addEventListener('click', () => {
            if (currentAdminPdfScale < 2.5) {
                currentAdminPdfScale += 0.2;
                renderAllAdminPdfPages();
            }
        });

        document.getElementById('tk-admin-zoom-out').addEventListener('click', () => {
            if (currentAdminPdfScale > 0.6) {
                currentAdminPdfScale -= 0.2;
                renderAllAdminPdfPages();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeAdminPdfModal();
        });
    }

    function closeAdminPdfModal() {
        const modal = document.getElementById('tk-admin-pdf-modal');
        if (!modal) return;
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        document.body.style.overflow = '';
    }

    window.openPdfModal = async function(pdfUrl, title) {
        createAdminPdfModalIfNotExists();
        const modal = document.getElementById('tk-admin-pdf-modal');
        const titleEl = document.getElementById('tk-admin-pdf-modal-title');
        const container = document.getElementById('tk-admin-pdf-pages');

        titleEl.innerText = title || 'Dokumentvisning';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden';

        container.innerHTML = '<div style="color: white; font-size: 1.1rem; margin: auto;">Laster dokument...</div>';
        currentAdminPdfScale = 1.25;

        try {
            const pdfjs = await window.loadPdfJs();
            const proxyUrl = pdfUrl.startsWith('http') && !pdfUrl.includes('/api/proxy-pdf')
                ? `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`
                : pdfUrl;

            const loadingTask = pdfjs.getDocument({
                url: proxyUrl,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true
            });
            currentAdminPdfDoc = await loadingTask.promise;
            await renderAllAdminPdfPages();
        } catch (err) {
            console.error('Feil ved åpning av PDF:', err);
            container.innerHTML = '<div style="color: #f87171; margin: auto;">Kunne ikke åpne forhåndsvisning.</div>';
        }
    };

    async function renderAllAdminPdfPages() {
        if (!currentAdminPdfDoc) return;
        const container = document.getElementById('tk-admin-pdf-pages');
        const zoomLabel = document.getElementById('tk-admin-zoom-label');
        if (zoomLabel) zoomLabel.innerText = Math.round(currentAdminPdfScale * 100 / 1.25) + '%';

        container.innerHTML = '';
        const numPages = currentAdminPdfDoc.numPages;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await currentAdminPdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: currentAdminPdfScale * (window.devicePixelRatio || 1) });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = (viewport.width / (window.devicePixelRatio || 1)) + 'px';
            canvas.style.height = (viewport.height / (window.devicePixelRatio || 1)) + 'px';
            canvas.style.maxWidth = '100%';
            canvas.style.borderRadius = '6px';
            canvas.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
            canvas.style.background = 'white';
            canvas.style.pointerEvents = 'none';

            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            container.appendChild(canvas);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.loadGraphicDocuments);
    } else {
        window.loadGraphicDocuments();
    }
})();
