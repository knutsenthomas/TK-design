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
        const getArray = (field) => {
            if (!field?.arrayValue?.values) return [];
            return field.arrayValue.values.map((v) => v.stringValue).filter(Boolean);
        };

        return {
            id: doc.name ? doc.name.split('/').pop() : '',
            title: getString(f.title) || 'Uten tittel',
            description: getString(f.description) || '',
            imageUrl: getString(f.imageUrl) || '',
            imageUrls: getArray(f.imageUrls),
            category: getString(f.category) || 'Logo & Profil'
        };
    }

    function renderCard(item) {
        const title = item.title || 'Grafisk arbeid';
        const description = item.description || '';
        const imageUrl = item.imageUrl || '/img/logo/d.png';
        const category = item.category || 'Grafisk Design';
        const imageUrls = item.imageUrls || [];

        const article = document.createElement('article');
        article.className = 'project-card graphic-card';
        article.setAttribute('data-aos', 'fade-up');

        let galleryHtml = '';
        if (imageUrls && imageUrls.length > 1) {
            const thumbs = imageUrls.map((url, idx) => `
                <img src="${url}" 
                     class="thumb-img" 
                     onclick="this.closest('.project-card').querySelector('.project-main-img').src = '${url}'; this.closest('.project-card').querySelector('.project-view-link').href = '${url}';"
                     style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid rgba(18, 55, 92, 0.1); flex-shrink: 0; transition: transform 0.2s ease;"
                     alt="${title} bilde ${idx + 1}">
            `).join('');

            galleryHtml = `
                <div style="display: flex; gap: 8px; padding: 12px 24px 0; overflow-x: auto;">
                    ${thumbs}
                </div>
            `;
        }

        article.innerHTML = `
            <div class="graphic-img-box" style="position: relative; width: 100%; height: 240px; background: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden; border-bottom: 1px solid rgba(18, 55, 92, 0.06); padding: 20px; box-sizing: border-box;">
                <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                    <img src="${imageUrl}" class="project-main-img" alt="${title}" loading="lazy" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
                </a>
                <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" class="project-arrow-btn" aria-label="Vis ${title} i full størrelse">
                    <i class="fas fa-arrow-up-right-from-square"></i>
                </a>
            </div>
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
                    <i class="fas fa-arrow-up-right-from-square" style="margin-right: 6px;"></i> Åpne fullversjon
                </a>
            </div>
        `;

        return article;
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadGraphicDocuments);
    } else {
        loadGraphicDocuments();
    }
})();
