const API = 'api.php';
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

let allCategories = [];

// Load Menu
async function loadMenu() {
    const res = await fetch(`${API}?action=get-categories`);
    allCategories = await res.json();
    
    const parents = allCategories.filter(c => !c.parent_id);
    const html = parents.map(p => {
        const children = allCategories.filter(c => c.parent_id == p.id);
        if (children.length) {
            return `
                <div class="dropdown">
                    <a href="#">${p.name} ▾</a>
                    <div class="dropdown-menu">
                        ${children.map(c => `<a href="category.html?slug=${c.slug}">${c.name}</a>`).join('')}
                    </div>
                </div>
            `;
        }
        return `<a href="category.html?slug=${p.slug}">${p.name}</a>`;
    }).join('');
    
    document.getElementById('mainMenu').innerHTML = `<a href="index.html">Home</a>${html}`;
}

// Load Category Movies
async function loadCategoryMovies() {
    if (!slug) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const catRes = await fetch(`${API}?action=get-category-by-slug&slug=${slug}`);
        const category = await catRes.json();
        
        if (!category || category.error) {
            document.getElementById('categoryTitle').textContent = 'Category Not Found';
            document.getElementById('moviesGrid').innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:3rem;color:#666;">Category not found</p>';
            return;
        }
        
        const res = await fetch(`${API}?action=get-movies-by-slug&slug=${slug}`);
        const movies = await res.json();
        
        document.getElementById('categoryTitle').textContent = `${category.name} (${movies.length})`;
        
        const grid = document.getElementById('moviesGrid');
        grid.innerHTML = movies.length ? movies.map(m => `
            <div class="movie-card" onclick='playMovie(${JSON.stringify(m).replace(/'/g, "&#39;")})'>
                <div class="movie-poster">
                    ${m.img ? `<img src="${m.img}" alt="${m.title}" loading="lazy">` : ''}
                    <div class="movie-overlay">
                        <div class="play-btn"><i class="fas fa-play"></i></div>
                    </div>
                </div>
                <div class="movie-info">
                    <h4 class="movie-title">${m.title}</h4>
                    <p class="movie-category">${m.cat_name || category.name}</p>
                </div>
            </div>
        `).join('') : '<p style="grid-column:1/-1;text-align:center;padding:3rem;color:#666;">No content in this category</p>';
    } catch(error) {
        console.error('Load error:', error);
    }
}

// Play Movie - Embed on same page
function playMovie(movie) {
    document.getElementById('videoTitle').textContent = movie.title;
    
    const adContainer = document.getElementById('adContainer');
    if (movie.short_link) {
        adContainer.innerHTML = `
            <p style="font-weight:600;margin-bottom:0.5rem;">⏳ Please wait, preparing video...</p>
            <a href="${movie.short_link}" target="_blank" onclick="setTimeout(() => document.getElementById('adContainer').style.display='none', 2000)">
                🔗 Click Here to Continue
            </a>
            <p style="font-size:0.85rem;color:#666;margin-top:0.5rem;">This helps us keep the service free</p>
        `;
        setTimeout(() => {
            window.open(movie.short_link, '_blank');
            adContainer.style.display = 'none';
        }, 3000);
    } else {
        adContainer.style.display = 'none';
    }
    
    let embedUrl = getEmbedUrl(movie.link);
    
    if (embedUrl) {
        document.getElementById('videoPlayer').src = embedUrl;
        document.getElementById('videoModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        alert('❌ Invalid video link format');
    }
}

// Get Embed URL
function getEmbedUrl(link) {
    link = link.trim();
    
    if (link.includes('voe')) {
        const match = link.match(/([a-z0-9]{12})/i);
        if (match) return `https://voe.sx/e/${match[1]}`;
    }
    
    if (link.includes('dood')) {
        const match = link.match(/([a-z0-9]+)$/i);
        if (match) return `https://dood.ws/e/${match[1]}`;
    }
    
    if (/^[a-z0-9]{12}$/i.test(link)) {
        return `https://voe.sx/e/${link}`;
    }
    
    if (/^[a-z0-9]+$/i.test(link)) {
        return `https://dood.ws/e/${link}`;
    }
    
    if (link.startsWith('http') && (link.includes('/e/') || link.includes('/embed/'))) {
        return link;
    }
    
    return null;
}

function closeModal() {
    document.getElementById('videoModal').classList.remove('active');
    document.getElementById('videoPlayer').src = '';
    document.getElementById('adContainer').style.display = 'block';
    document.body.style.overflow = 'auto';
}

// Search
document.getElementById('searchInput').addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.movie-card');
    cards.forEach(card => {
        const title = card.querySelector('.movie-title').textContent.toLowerCase();
        card.style.display = title.includes(search) ? 'block' : 'none';
    });
});

// Close modal
document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target.id === 'videoModal') closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Load
Promise.all([loadMenu(), loadCategoryMovies()]);
