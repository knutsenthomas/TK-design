import { db, collection, getDocs, query, orderBy } from './firebase-init.js';

const graphicGrid = document.getElementById('graphic-docs-grid');

async function loadGraphicDocuments() {
    if (!graphicGrid) return;
    
    try {
        const q = query(collection(db, "graphic_docs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            graphicGrid.innerHTML = '<p>Ingen grafiske dokumenter tilgjengelig enda.</p>';
            return;
        }

        graphicGrid.innerHTML = '';
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // Lag kort for hvert dokument
            const article = document.createElement('article');
            article.className = 'card';

            const isImage = data.type && data.type.startsWith('image/');
            const preview = isImage 
                ? `<img src="${data.url}" alt="${data.title}" class="card-img" style="object-fit: cover; background: #fff; border-bottom: 1px solid #eee;">`
                : `<div class="card-img" style="display:flex; align-items:center; justify-content:center; background:#f0f4f8; color:#3b82f6; font-weight:bold; font-size:1.5rem;">📄 PDF Dokument</div>`;

            article.innerHTML = `
                ${preview}
                <div class="card-content">
                    <h3 class="card-title">${data.title}</h3>
                    <div class="tags" style="margin-top: 12px; margin-bottom: 24px;">
                        <span class="tag">Grafisk</span>
                        <span class="tag">${isImage ? 'Bilde' : 'Dokument'}</span>
                    </div>
                    <a href="${data.url}" target="_blank" rel="noopener noreferrer" class="btn" style="width: 100%; text-align: center; display: block;">Åpne dokument</a>
                </div>
            `;
            
            graphicGrid.appendChild(article);
        });

    } catch (error) {
        console.error("Feil ved henting av grafiske dokumenter:", error);
        graphicGrid.innerHTML = '<p>Kunne ikke laste dokumenter. Prøv igjen senere.</p>';
    }
}

// Initialiser når DOM er klar
document.addEventListener('DOMContentLoaded', loadGraphicDocuments);
