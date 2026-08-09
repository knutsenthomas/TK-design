import { db, collection, getDocs, query, orderBy } from './firebase-init.js';

const graphicGrid = document.getElementById('graphic-docs-grid');

async function loadGraphicDocuments() {
    if (!graphicGrid) return;
    
    try {
        const q = query(collection(db, "graphicDocs"), orderBy("createdAt", "desc"));
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

            const preview = `<img src="${data.imageUrl}" alt="${data.title}" class="card-img" style="object-fit: cover; background: #fff; border-bottom: 1px solid #eee;" onerror="this.src='/img/placeholder.png'">`;

            article.innerHTML = `
                ${preview}
                <div class="card-content">
                    <h3 class="card-title">${data.title || 'Uten tittel'}</h3>
                    <p class="card-desc" style="font-size: 14px; margin-bottom: 16px;">${data.description || ''}</p>
                    <div class="tags" style="margin-top: auto; margin-bottom: 24px;">
                        <span class="tag">Grafisk Design</span>
                    </div>
                    <a href="${data.imageUrl}" target="_blank" rel="noopener noreferrer" class="btn" style="width: 100%; text-align: center; display: block;">Åpne bilde</a>
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
