// Grafisk Portefølje Loader
(function () {
    const staticGraphics = [
        {
            title: 'tk-design Logo & Ikonografi',
            description: 'Offisiell logo, fargepalett og profilidentitet for TK-design.',
            imageUrl: '/img/logo/d.png',
            category: 'Logo & Profil'
        },
        {
            title: 'Din nye digitale partner',
            description: 'Visuell profilering og markedsmateriell for digital synlighet.',
            imageUrl: '/img/grafisk/media_1786269598603.jpg',
            category: 'Markedsføring'
        },
        {
            title: 'Trenger du nettside?',
            description: 'Kampanjebanner og grafisk annonsering for sosiale medier.',
            imageUrl: '/img/grafisk/media_1786269614933.png',
            category: 'Banner & SoMe'
        },
        {
            title: 'CONNECT17 COURAGE',
            description: 'Plakat, typografi og arrangementsprofilering for Connect 17.',
            imageUrl: '/img/grafisk/media_1786270633681.jpg',
            category: 'Plakat & Trykk'
        }
    ];

    function parseFirestoreGraphicDoc(doc) {
        if (!doc || !doc.fields) return null;
        const f = doc.fields;
        const getString = (field) => field?.stringValue || '';
        const getBoolean = (field) => field?.booleanValue ?? false;
        const getArray = (field) => {
            if (!field?.arrayValue?.values) return [];
            return field.arrayValue.values.map((v) => v.stringValue).filter(Boolean);
        };

        const imgUrl = getString(f.imageUrl) || '';
        const thumbUrl = getString(f.thumbnailUrl) || '';
        const isPdf = getBoolean(f.isPdf) || imgUrl.toLowerCase().includes('.pdf');

        return {
            id: doc.name ? doc.name.split('/').pop() : '',
            title: getString(f.title) || 'Uten tittel',
            description: getString(f.description) || '',
            imageUrl: imgUrl,
            thumbnailUrl: thumbUrl,
            imageUrls: getArray(f.imageUrls),
            category: getString(f.category) || (isPdf ? 'Flyer / PDF' : 'Logo & Profil'),
            isPdf: isPdf
        };
    }

    function renderCard(item) {
        const title = item.title || 'Grafisk arbeid';
        const description = item.description || '';
        const imageUrl = item.imageUrl || '/img/logo/d.png';
        const thumbnailUrl = item.thumbnailUrl || '';
        const imageUrls = item.imageUrls || [];
        const isPdf = item.isPdf || (imageUrl && imageUrl.toLowerCase().includes('.pdf'));
        const category = item.category || (isPdf ? 'Flyer / PDF' : 'Grafisk Design');
        const safeTitle = (item.title || 'Grafisk arbeid').replace(/'/g, "\\'");

        const article = document.createElement('article');
        article.className = 'project-card graphic-card';
        article.setAttribute('data-aos', 'fade-up');

        let mediaBoxHtml = '';
        let buttonText = 'Åpne fullversjon';
        let buttonIcon = 'fa-arrow-up-right-from-square';

        if (isPdf) {
            buttonText = 'Vis dokument';
            buttonIcon = 'fa-eye';
            if (thumbnailUrl) {
                mediaBoxHtml = `
                    <div class="graphic-img-box" onclick="window.openPdfModal('${imageUrl}', '${safeTitle}')" style="position: relative; width: 100%; height: 240px; background: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden; border-bottom: 1px solid rgba(18, 55, 92, 0.06); padding: 16px; box-sizing: border-box; cursor: pointer;">
                        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                            <img src="${thumbnailUrl}" class="project-main-img" alt="${title}" loading="lazy" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; border-radius: 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.12); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
                        </div>
                        <button type="button" onclick="event.stopPropagation(); window.openPdfModal('${imageUrl}', '${safeTitle}')" class="project-arrow-btn" aria-label="Vis ${title} dokument" style="border: none; cursor: pointer;">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                `;
            } else {
                mediaBoxHtml = `
                    <div class="graphic-img-box pdf-preview-box" data-pdf-url="${imageUrl}" onclick="window.openPdfModal('${imageUrl}', '${safeTitle}')" style="position: relative; width: 100%; height: 240px; background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; border-bottom: 1px solid rgba(239, 68, 68, 0.12); padding: 16px; box-sizing: border-box; cursor: pointer;">
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <i class="fas fa-file-pdf" style="font-size: 56px; color: #e11d48; margin-bottom: 12px; filter: drop-shadow(0 4px 10px rgba(225, 29, 72, 0.2));"></i>
                            <span style="font-size: 0.8rem; font-weight: 800; color: #9f1239; text-transform: uppercase; letter-spacing: 0.6px;">PDF-DOKUMENT</span>
                        </div>
                        <button type="button" onclick="event.stopPropagation(); window.openPdfModal('${imageUrl}', '${safeTitle}')" class="project-arrow-btn" aria-label="Vis ${title} dokument" style="border: none; cursor: pointer;">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                `;
            }
        } else {
            mediaBoxHtml = `
                <div class="graphic-img-box" style="position: relative; width: 100%; height: 240px; background: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden; border-bottom: 1px solid rgba(18, 55, 92, 0.06); padding: 20px; box-sizing: border-box;">
                    <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                        <img src="${imageUrl}" class="project-main-img" alt="${title}" loading="lazy" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
                    </a>
                    <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" class="project-arrow-btn" aria-label="Vis ${title} i full størrelse">
                        <i class="fas fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            `;
        }

        let galleryHtml = '';
        if (imageUrls && imageUrls.length > 1) {
            const thumbs = imageUrls.map((url, idx) => {
                const isThumbPdf = url.toLowerCase().includes('.pdf');
                if (isThumbPdf) {
                    return `
                        <div onclick="window.openPdfModal('${url}', '${safeTitle}')"
                             style="width: 52px; height: 52px; background: #fee2e2; border-radius: 8px; cursor: pointer; border: 2px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
                             title="Vis dokument">
                             <i class="fas fa-file-pdf" style="color: #ef4444; font-size: 20px;"></i>
                        </div>
                    `;
                }
                return `
                    <img src="${url}" 
                         class="thumb-img" 
                         onclick="this.closest('.project-card').querySelector('.project-main-img').src = '${url}'; this.closest('.project-card').querySelector('a').href = '${url}';"
                         style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid rgba(18, 55, 92, 0.1); flex-shrink: 0; transition: transform 0.2s ease;"
                         alt="${title} bilde ${idx + 1}">
                `;
            }).join('');

            galleryHtml = `
                <div style="display: flex; gap: 8px; padding: 12px 24px 0; overflow-x: auto;">
                    ${thumbs}
                </div>
            `;
        }

        const actionButtonHtml = isPdf 
            ? `<button type="button" class="primary-cta" onclick="window.openPdfModal('${imageUrl}', '${safeTitle}')" style="width: 100%; text-align: center; justify-content: center; padding: 11px 16px; font-size: 0.9rem; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                 <i class="fas fa-eye"></i> ${buttonText}
               </button>`
            : `<a href="${imageUrl}" target="_blank" rel="noopener noreferrer" class="primary-cta" style="width: 100%; text-align: center; justify-content: center; padding: 11px 16px; font-size: 0.9rem; border-radius: 10px; display: flex; align-items: center; gap: 6px;">
                 <i class="fas fa-arrow-up-right-from-square"></i> ${buttonText}
               </a>`;

        const titleClickHtml = isPdf
            ? `<h3 class="project-title" style="margin-bottom: 10px; font-size: 1.25rem; cursor: pointer;" onclick="window.openPdfModal('${imageUrl}', '${safeTitle}')"><span>${title}</span></h3>`
            : `<h3 class="project-title" style="margin-bottom: 10px; font-size: 1.25rem;"><a href="${imageUrl}" target="_blank" rel="noopener noreferrer">${title}</a></h3>`;

        article.innerHTML = `
            ${mediaBoxHtml}
            ${galleryHtml}
            <div class="graphic-card-body" style="padding: 24px; display: flex; flex-direction: column; flex: 1;">
                <div class="project-tags-row" style="margin-bottom: 12px;">
                    <span class="project-category">${category}</span>
                </div>
                ${titleClickHtml}
                <p class="project-summary-text" style="margin-bottom: 20px; flex: 1; font-size: 0.95rem; line-height: 1.55; color: #64748b;">
                    ${description}
                </p>
                ${actionButtonHtml}
            </div>
        `;

        return article;
    }

    let pdfjsLoadingPromise = null;
    function loadPdfJs() {
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
    }

    async function renderPdfThumbnail(container, pdfUrl) {
        if (!container || !pdfUrl) return;
        try {
            const pdfjs = await loadPdfJs();
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
            const targetWidth = container.clientWidth || 360;
            const targetHeight = container.clientHeight || 240;
            const scale = Math.min(targetWidth / unscaledViewport.width, targetHeight / unscaledViewport.height) * (window.devicePixelRatio || 1.5);
            const viewport = page.getViewport({ scale: Math.max(scale, 0.8) });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '100%';
            canvas.style.width = 'auto';
            canvas.style.height = 'auto';
            canvas.style.objectFit = 'contain';
            canvas.style.display = 'block';
            canvas.style.borderRadius = '6px';
            canvas.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.12)';
            canvas.style.pointerEvents = 'none';

            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            container.innerHTML = '';
            container.appendChild(canvas);

            const arrowBtn = document.createElement('button');
            arrowBtn.type = 'button';
            arrowBtn.className = 'project-arrow-btn';
            arrowBtn.setAttribute('aria-label', 'Vis dokument');
            arrowBtn.style.border = 'none';
            arrowBtn.style.cursor = 'pointer';
            arrowBtn.innerHTML = '<i class="fas fa-eye"></i>';
            container.appendChild(arrowBtn);
        } catch (e) {
            console.warn('Kunne ikke generere PDF-forhåndsvisning:', e);
        }
    }

    // Modal Viewer Implementation
    let currentPdfDoc = null;
    let currentPdfScale = 1.25;

    function createPdfModalIfNotExists() {
        if (document.getElementById('tk-pdf-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'tk-pdf-modal';
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
            transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        modal.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: rgba(30, 41, 59, 0.95); border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: white; gap: 16px; flex-shrink: 0; z-index: 2;">
                <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                    <span style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.5px;">📄 PDF</span>
                    <h4 id="tk-pdf-modal-title" style="margin: 0; font-size: 1.05rem; font-weight: 600; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Dokumentvisning</h4>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 2px 6px; gap: 6px;">
                        <button id="tk-pdf-zoom-out" style="background: none; border: none; color: white; padding: 6px 10px; cursor: pointer; font-size: 1.1rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; min-width: 36px; min-height: 36px;" title="Zoom ut">−</button>
                        <span id="tk-pdf-zoom-label" style="font-size: 0.85rem; font-weight: 600; min-width: 44px; text-align: center;">100%</span>
                        <button id="tk-pdf-zoom-in" style="background: none; border: none; color: white; padding: 6px 10px; cursor: pointer; font-size: 1.1rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; min-width: 36px; min-height: 36px;" title="Zoom inn">+</button>
                    </div>
                    
                    <button id="tk-pdf-modal-close" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 6px; min-height: 40px; transition: transform 0.15s ease;" title="Lukk visning">
                        <i class="fas fa-times"></i> Lukk
                    </button>
                </div>
            </div>

            <div id="tk-pdf-pages-container" style="flex: 1; overflow-y: auto; overflow-x: auto; padding: 32px 16px; display: flex; flex-direction: column; align-items: center; gap: 24px; user-select: none; -webkit-user-select: none;" oncontextmenu="return false;">
                <div id="tk-pdf-modal-loading" style="color: white; font-size: 1.1rem; font-weight: 500; display: flex; flex-direction: column; align-items: center; gap: 12px; margin: auto;">
                    <div style="width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.2); border-top-color: #ef4444; border-radius: 50%; animation: tkSpin 0.8s linear infinite;"></div>
                    Laster dokument...
                </div>
            </div>
        `;

        if (!document.getElementById('tk-pdf-style')) {
            const style = document.createElement('style');
            style.id = 'tk-pdf-style';
            style.textContent = `
                @keyframes tkSpin { to { transform: rotate(360deg); } }
                #tk-pdf-modal button:hover { opacity: 0.9; transform: scale(1.03); }
                #tk-pdf-modal button:active { transform: scale(0.97); }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        document.getElementById('tk-pdf-modal-close').addEventListener('click', closePdfModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.id === 'tk-pdf-pages-container') {
                closePdfModal();
            }
        });

        document.getElementById('tk-pdf-zoom-in').addEventListener('click', () => {
            if (currentPdfScale < 2.5) {
                currentPdfScale += 0.2;
                renderAllPdfPages();
            }
        });

        document.getElementById('tk-pdf-zoom-out').addEventListener('click', () => {
            if (currentPdfScale > 0.6) {
                currentPdfScale -= 0.2;
                renderAllPdfPages();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.opacity === '1') {
                closePdfModal();
            }
        });
    }

    function closePdfModal() {
        const modal = document.getElementById('tk-pdf-modal');
        if (!modal) return;
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        document.body.style.overflow = '';
    }

    async function openPdfModal(pdfUrl, title) {
        createPdfModalIfNotExists();
        const modal = document.getElementById('tk-pdf-modal');
        const titleEl = document.getElementById('tk-pdf-modal-title');
        const container = document.getElementById('tk-pdf-pages-container');

        titleEl.innerText = title || 'Dokumentvisning';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden';

        container.innerHTML = `
            <div id="tk-pdf-modal-loading" style="color: white; font-size: 1.1rem; font-weight: 500; display: flex; flex-direction: column; align-items: center; gap: 12px; margin: auto;">
                <div style="width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.2); border-top-color: #ef4444; border-radius: 50%; animation: tkSpin 0.8s linear infinite;"></div>
                Laster dokument...
            </div>
        `;

        currentPdfScale = window.innerWidth < 768 ? 0.9 : 1.25;

        try {
            const pdfjs = await loadPdfJs();
            const proxyUrl = pdfUrl.startsWith('http') && !pdfUrl.includes('/api/proxy-pdf')
                ? `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`
                : pdfUrl;

            const loadingTask = pdfjs.getDocument({
                url: proxyUrl,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true
            });
            currentPdfDoc = await loadingTask.promise;
            await renderAllPdfPages();
        } catch (err) {
            console.error('Feil ved åpning av PDF:', err);
            container.innerHTML = `
                <div style="color: white; text-align: center; margin: auto;">
                    <p style="font-size: 1.1rem; color: #f87171;">Kunne ikke laste dokumentet for forhåndsvisning.</p>
                    <button onclick="window.closePdfModal()" style="margin-top: 12px; background: #334155; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Lukk</button>
                </div>
            `;
        }
    }

    async function renderAllPdfPages() {
        if (!currentPdfDoc) return;
        const container = document.getElementById('tk-pdf-pages-container');
        const zoomLabel = document.getElementById('tk-pdf-zoom-label');
        if (zoomLabel) zoomLabel.innerText = Math.round(currentPdfScale * 100 / 1.25) + '%';

        container.innerHTML = '';
        const numPages = currentPdfDoc.numPages;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await currentPdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: currentPdfScale * (window.devicePixelRatio || 1) });

            const pageWrapper = document.createElement('div');
            pageWrapper.style.cssText = `
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 24px;
            `;

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = (viewport.width / (window.devicePixelRatio || 1)) + 'px';
            canvas.style.height = (viewport.height / (window.devicePixelRatio || 1)) + 'px';
            canvas.style.maxWidth = '100%';
            canvas.style.borderRadius = '8px';
            canvas.style.boxShadow = '0 12px 36px rgba(0,0,0,0.45)';
            canvas.style.background = 'white';
            canvas.style.pointerEvents = 'none';

            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            pageWrapper.appendChild(canvas);

            if (numPages > 1) {
                const pageBadge = document.createElement('span');
                pageBadge.style.cssText = `
                    margin-top: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.7);
                    background: rgba(0,0,0,0.4);
                    padding: 2px 10px;
                    border-radius: 12px;
                `;
                pageBadge.innerText = `Side ${pageNum} av ${numPages}`;
                pageWrapper.appendChild(pageBadge);
            }

            container.appendChild(pageWrapper);
        }
    }

    window.openPdfModal = openPdfModal;
    window.closePdfModal = closePdfModal;

    async function loadGraphicDocuments() {
        const graphicGrid = document.getElementById('graphic-docs-grid');
        if (!graphicGrid) return;

        graphicGrid.innerHTML = '';
        const fragment = document.createDocumentFragment();

        let remoteItems = [];
        try {
            const res = await fetch('https://firestore.googleapis.com/v1/projects/tk-design-f43f6/databases/(default)/documents/graphicDocs');
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.documents)) {
                    remoteItems = data.documents.map(parseFirestoreGraphicDoc).filter(Boolean);
                }
            }
        } catch (e) {
            console.warn('Kunne ikke hente eksterne grafiske dokumenter, bruker lokale elementer:', e);
        }

        const allItems = [...remoteItems, ...staticGraphics];
        allItems.forEach((item) => {
            fragment.appendChild(renderCard(item));
        });

        graphicGrid.appendChild(fragment);

        // Render live PDF thumbnails for all PDF cards
        const pdfContainers = graphicGrid.querySelectorAll('.pdf-preview-box[data-pdf-url]');
        pdfContainers.forEach((container) => {
            const url = container.getAttribute('data-pdf-url');
            if (url) renderPdfThumbnail(container, url);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadGraphicDocuments);
    } else {
        loadGraphicDocuments();
    }
})();
