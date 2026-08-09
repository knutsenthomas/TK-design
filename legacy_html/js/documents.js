import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const app = initializeApp(window.__TK_FIREBASE_CONFIG__, "graphic-public-app");
const db = getFirestore(app);

const graphicGrid = document.getElementById('graphic-docs-grid');

async function loadGraphicDocuments() {
    if (!graphicGrid) return;
    
    // Hardkodet fallback for filene du sendte
    const staticGraphics = [
        {
            title: 'tk-design Logo',
            description: 'Logo for tk-design',
            imageUrl: '/img/logo/d.png'
        },
        {
            title: 'Din nye digitale partner',
            description: 'Markedsføringsbilde med to personer og post-its',
            imageUrl: '/img/grafisk/media_1786269598603.jpg'
        },
        {
            title: 'Trenger du nettside?',
            description: 'Rødt banner for webdesign med illustrasjon',
            imageUrl: '/img/grafisk/media_1786269614933.png'
        },
        {
            title: 'CONNECT17 COURAGE',
            description: 'Connect 17 Courage plakat med løvehode og folk på fjell',
            imageUrl: '/img/grafisk/media_1786270633681.jpg'
        }
    ];

    try {
        const q = query(collection(db, "graphicDocs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        graphicGrid.innerHTML = '';
        
        // Render Firebase documents
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            renderCard(data.title, data.description, data.imageUrl, data.imageUrls);
        });

        // Render static documents
        staticGraphics.forEach(data => {
            renderCard(data.title, data.description, data.imageUrl, null);
        });

        if (graphicGrid.innerHTML === '') {
            graphicGrid.innerHTML = '<p style="text-align: center; width: 100%; color: #666;">Ingen grafiske arbeider funnet.</p>';
        }

    } catch (error) {
        console.error("Feil ved henting av grafiske dokumenter:", error);
        
        // Fallback: Still render the static ones if Firebase fails
        graphicGrid.innerHTML = '';
        staticGraphics.forEach(data => {
            renderCard(data.title, data.description, data.imageUrl);
        });
    }
}

function renderCard(title, description, imageUrl, imageUrls) {
    const article = document.createElement('article');
    article.className = 'card';
    article.style.borderRadius = '16px';
    article.style.overflow = 'hidden';
    article.style.background = '#fff';
    article.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
    article.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    
    // Generer miniatyrbilder hvis vi har et array av bilder
    let galleryHtml = '';
    const hasGallery = imageUrls && imageUrls.length > 1;
    
    if (hasGallery) {
        let thumbnailsHtml = imageUrls.map((url, idx) => \`
            <img src="\${url}" 
                 class="thumb-img" 
                 onclick="this.parentElement.previousElementSibling.src = '\${url}'; this.parentElement.nextElementSibling.querySelector('a').href = '\${url}';"
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid transparent; flex-shrink: 0; transition: transform 0.2s; hover: transform: scale(1.05);"
                 alt="\${title} bilde \${idx+1}">
        \`).join('');
        
        galleryHtml = \`
            <div style="display: flex; gap: 8px; padding: 16px 24px 0; overflow-x: auto; scrollbar-width: none;">
                \${thumbnailsHtml}
            </div>
        \`;
    }

    article.innerHTML = \`
        <img src="\${imageUrl}" alt="\${title}" style="width: 100%; height: 300px; object-fit: cover; display: block; border-bottom: 1px solid #eee; transition: all 0.3s ease;">
        \${galleryHtml}
        <div style="padding: 24px;">
            <h3 style="font-size: 1.25rem; margin-bottom: 8px; font-weight: 600; color: var(--clr-base);">\${title || 'Uten tittel'}</h3>
            <p style="color: var(--clr-common-text); font-size: 0.95rem; line-height: 1.5; margin-bottom: 16px;">\${description || ''}</p>
            <a href="\${imageUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; padding: 10px 16px; text-decoration: none; font-size: 0.95rem; font-weight: 500; border-radius: 8px; background-color: var(--clr-base); color: var(--clr-white); transition: background-color 0.2s ease;">Åpne bilde</a>
        </div>
    \`;
    
    graphicGrid.appendChild(article);
}

// Initialiser når DOM er klar
document.addEventListener('DOMContentLoaded', loadGraphicDocuments);
