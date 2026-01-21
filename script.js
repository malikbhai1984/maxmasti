const API = 'api.php';
let allMovies = [];
let allCategories = [];

// Load Menu (cached)
async function loadMenu() {
    if (allCategories.length === 0) {
        const res = await fetch(`${API}?action=get-categories`);
        allCategories = await res.json();
    }
    
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

// Load Movies (cached and fast)
async function loadMovies() {
    if (allMovies.length === 0) {
        const res = await fetch(`${API}?action=get-movies`);
        allMovies = await res.json();
    }
    
    renderMovies(allMovies);
}

function renderMovies(movies) {
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
                <p class="movie-category">${m.cat_name || 'Movie'}</p>
            </div>
        </div>
    `).join('') : '<p style="grid-column:1/-1;text-align:center;color:#666;padding:3rem;">No movies available</p>';
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

// Get Embed URL - Always embed on our site
function getEmbedUrl(link) {
    link = link.trim();
    
    // VOE.sx - Force embed
    if (link.includes('voe')) {
        const match = link.match(/([a-z0-9]{12})/i);
        if (match) return `https://voe.sx/e/${match[1]}`;
    }
    
    // Doodstream - Force embed
    if (link.includes('dood')) {
        const match = link.match(/([a-z0-9]+)$/i);
        if (match) return `https://dood.ws/e/${match[1]}`;
    }
    
    // Direct ID - assume VOE for 12 chars
    if (/^[a-z0-9]{12}$/i.test(link)) {
        return `https://voe.sx/e/${link}`;
    }
    
    // Direct ID - assume Dood for others
    if (/^[a-z0-9]+$/i.test(link)) {
        return `https://dood.ws/e/${link}`;
    }
    
    // Already embed URL
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

// Search - Fast local search
document.getElementById('searchInput').addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase();
    if (!search) {
        renderMovies(allMovies);
        return;
    }
    
    const filtered = allMovies.filter(m => 
        m.title.toLowerCase().includes(search) ||
        (m.cat_name && m.cat_name.toLowerCase().includes(search))
    );
    renderMovies(filtered);
});

// Close modal
document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target.id === 'videoModal') closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Load everything
Promise.all([loadMenu(), loadMovies()]);
