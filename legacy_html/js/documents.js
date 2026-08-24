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

        const article = document.createElement('article');
        article.className = 'project-card graphic-card';
        article.setAttribute('data-aos', 'fade-up');

        let mediaBoxHtml = '';
        let buttonText = 'Åpne fullversjon';
        let buttonIcon = 'fa-arrow-up-right-from-square';

        if (isPdf) {
            buttonText = 'Åpne PDF';
            buttonIcon = 'fa-file-pdf';
            if (thumbnailUrl) {
                mediaBoxHtml = `
                    <div class="graphic-img-box" style="position: relative; width: 100%; height: 240px; background: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden; border-bottom: 1px solid rgba(18, 55, 92, 0.06); padding: 16px; box-sizing: border-box;">
                        <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                            <img src="${thumbnailUrl}" class="project-main-img" alt="${title}" loading="lazy" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; border-radius: 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.12); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
                        </a>
                        <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" class="project-arrow-btn" aria-label="Åpne ${title} PDF i ny fane">
                            <i class="fas fa-file-pdf"></i>
                        </a>
                    </div>
                `;
            } else {
                mediaBoxHtml = `
                    <div class="graphic-img-box pdf-preview-box" data-pdf-url="${imageUrl}" style="position: relative; width: 100%; height: 240px; background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; border-bottom: 1px solid rgba(239, 68, 68, 0.12); padding: 16px; box-sizing: border-box;">
                        <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none;">
                            <i class="fas fa-file-pdf" style="font-size: 56px; color: #e11d48; margin-bottom: 12px; filter: drop-shadow(0 4px 10px rgba(225, 29, 72, 0.2));"></i>
                            <span style="font-size: 0.8rem; font-weight: 800; color: #9f1239; text-transform: uppercase; letter-spacing: 0.6px;">PDF-DOKUMENT</span>
                        </a>
                        <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" class="project-arrow-btn" aria-label="Åpne ${title} PDF i ny fane">
                            <i class="fas fa-file-pdf"></i>
                        </a>
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
                        <div onclick="this.closest('.project-card').querySelector('.project-view-link, a').href = '${url}';"
                             style="width: 52px; height: 52px; background: #fee2e2; border-radius: 8px; cursor: pointer; border: 2px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
                             title="PDF-side ${idx + 1}">
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

        article.innerHTML = `
            ${mediaBoxHtml}
            ${galleryHtml}
            <div class="graphic-card-body" style="padding: 24px; display: flex; flex-direction: column; flex: 1;">
                <div class="project-tags-row" style="margin-bottom: 12px;">
                    <span class="project-category">${category}</span>
                </div>
                <h3 class="project-title" style="margin-bottom: 10px; font-size: 1.25rem;">
                    <a href="${imageUrl}" target="_blank" rel="noopener noreferrer">${title}</a>
                </h3>
                <p class="project-summary-text" style="margin-bottom: 20px; flex: 1; font-size: 0.95rem; line-height: 1.55; color: #64748b;">
                    ${description}
                </p>
                <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" class="primary-cta" style="width: 100%; text-align: center; justify-content: center; padding: 10px 16px; font-size: 0.9rem; border-radius: 10px;">
                    <i class="fas ${buttonIcon}" style="margin-right: 6px;"></i> ${buttonText}
                </a>
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

            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            const link = document.createElement('a');
            link.href = pdfUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = 'flex';
            link.style.alignItems = 'center';
            link.style.justifyContent = 'center';
            link.style.width = '100%';
            link.style.height = '100%';
            link.appendChild(canvas);

            container.innerHTML = '';
            container.appendChild(link);

            const arrowBtn = document.createElement('a');
            arrowBtn.href = pdfUrl;
            arrowBtn.target = '_blank';
            arrowBtn.rel = 'noopener noreferrer';
            arrowBtn.className = 'project-arrow-btn';
            arrowBtn.setAttribute('aria-label', 'Åpne PDF i ny fane');
            arrowBtn.innerHTML = '<i class="fas fa-file-pdf"></i>';
            container.appendChild(arrowBtn);
        } catch (e) {
            console.warn('Kunne ikke generere PDF-forhåndsvisning:', e);
        }
    }

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
