const API = 'api.php';
let categories = [];
let currentCategoryId = null;

// Load Categories
async function loadCategories() {
    try {
        const res = await fetch(`${API}?action=get-categories`);
        const data = await res.json();
        
        // Check if data is array
        if (!Array.isArray(data)) {
            console.error('Invalid response:', data);
            alert('Error loading categories. Check console.');
            return;
        }
        
        categories = data;
        
        const parents = categories.filter(c => !c.parent_id);
        const html = parents.map(parent => {
            const children = categories.filter(c => c.parent_id == parent.id);
            return `
                <div class="cat-parent">
                    <div class="cat-item">
                        <button onclick="selectCategory(${parent.id})" class="cat-btn">${parent.name}</button>
                        <div class="cat-actions">
                            <button onclick="addSubcategory(${parent.id})" title="Add Sub">➕</button>
                            <button onclick="editCategory(${parent.id}, '${parent.name.replace(/'/g, "\\'")}')">✏️</button>
                            <button onclick="deleteCategory(${parent.id})">🗑️</button>
                        </div>
                    </div>
                    ${children.map(child => `
                        <div class="cat-item sub">
                            <button onclick="selectCategory(${child.id})" class="cat-btn">${child.name}</button>
                            <div class="cat-actions">
                                <button onclick="editCategory(${child.id}, '${child.name.replace(/'/g, "\\'")}')">✏️</button>
                                <button onclick="deleteCategory(${child.id})">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');
        
        document.getElementById('categoryList').innerHTML = html || '<p style="text-align:center;color:#999;padding:2rem;">No categories yet. Add one!</p>';
    } catch(error) {
        console.error('Load error:', error);
        alert('Error: ' + error.message);
    }
}

// Select Category
async function selectCategory(id) {
    try {
        currentCategoryId = id;
        const category = categories.find(c => c.id == id);
        
        const res = await fetch(`${API}?action=get-movies&category_id=${id}`);
        const movies = await res.json();
        
        document.getElementById('contentArea').innerHTML = `
            <div class="movie-section">
                <h2>${category.name} <span style="color:#999;font-size:1.2rem;">(${movies.length} videos)</span></h2>
                
                <div class="movie-form">
                    <h3 id="movieFormTitle">📽️ Add Video to ${category.name}</h3>
                    <form id="movieForm" enctype="multipart/form-data">
                        <input type="hidden" id="movieId">
                        <input type="hidden" id="oldImg">
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Video Title *</label>
                                <input type="text" id="movieTitle" placeholder="Enter video title" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Category</label>
                                <input type="text" value="${category.name}" class="form-control readonly" readonly>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Video Image/Poster</label>
                            <input type="file" id="movieImage" accept="image/*" class="form-control">
                            <small style="color:#666;">Upload movie poster or thumbnail (JPG, PNG)</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Video Link/ID *</label>
                            <input type="text" id="movieLink" placeholder="Example: vuqevy71anqx or full URL" class="form-control" required>
                            <small style="color:#666;">Enter video ID from VOE.sx or Doodstream</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Short Link (For Earning) 💰</label>
                            <input type="text" id="shortLink" placeholder="https://shrinkme.io/xyz123" class="form-control">
                            <small style="color:#28a745;">Add short link from ShrinkMe, LinkVertise, etc. to earn money</small>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" id="submitBtn" class="btn-submit">🚀 Publish Video</button>
                            <button type="button" onclick="resetMovieForm()" id="cancelMovieBtn" class="btn-cancel" style="display:none;">✕ Cancel</button>
                        </div>
                    </form>
                </div>
                
                <h3 style="margin:2rem 0 1rem;">📺 Videos in ${category.name}</h3>
                <table class="movies-table">
                    <thead>
                        <tr>
                            <th>Video Details</th>
                            <th style="text-align:right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${movies.length ? movies.map(m => `
                            <tr class="movie-row">
                                <td>
                                    <div class="movie-info">
                                        ${m.img ? `<img src="${m.img}" class="movie-thumb" alt="${m.title}">` : `<div class="movie-thumb" style="background:#ddd;display:flex;align-items:center;justify-content:center;color:#999;font-weight:bold;">${m.title.substring(0,2)}</div>`}
                                        <div class="movie-details">
                                            <h4>${m.title}</h4>
                                            <p><strong>Video Link:</strong> ${m.link}</p>
                                            ${m.short_link ? `<p class="short-link"><strong>💰 Short Link:</strong> ${m.short_link}</p>` : '<p style="color:#999;">No earning link</p>'}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button onclick="editMovie(${m.id})" class="btn-edit">✏️ Edit</button>
                                        <button onclick="deleteMovie(${m.id})" class="btn-delete">🗑️ Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="2" style="text-align:center;padding:3rem;color:#999;">No videos yet. Add your first video!</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
        
        document.getElementById('movieForm').onsubmit = handleMovieSubmit;
    } catch(error) {
        console.error('Select error:', error);
        alert('Error loading category: ' + error.message);
    }
}

// Save Category
async function saveCategory() {
    const name = document.getElementById('catName').value.trim();
    const editId = document.getElementById('editCatId').value;
    const parentId = document.getElementById('parentCatId').value;
    
    if (!name) {
        alert('⚠️ Please enter category name');
        return;
    }
    
    try {
        const data = {name};
        if (parentId) data.parent_id = parseInt(parentId);
        
        if (editId) {
            await fetch(`${API}?action=update-category&id=${editId}`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            alert('✅ Category updated!');
        } else {
            await fetch(`${API}?action=add-category`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            alert('✅ Category added!');
        }
        
        resetCatForm();
        loadCategories();
    } catch(error) {
        console.error('Save error:', error);
        alert('Error: ' + error.message);
    }
}

function addSubcategory(parentId) {
    document.getElementById('parentCatId').value = parentId;
    document.getElementById('catFormTitle').textContent = '➕ Add Subcategory';
    document.getElementById('catName').focus();
}

function editCategory(id, name) {
    document.getElementById('editCatId').value = id;
    document.getElementById('catName').value = name;
    document.getElementById('catFormTitle').textContent = '✏️ Edit Category';
    document.getElementById('catCancelBtn').style.display = 'inline-block';
}

function resetCatForm() {
    document.getElementById('catName').value = '';
    document.getElementById('editCatId').value = '';
    document.getElementById('parentCatId').value = '';
    document.getElementById('catFormTitle').textContent = '📂 Add Category';
    document.getElementById('catCancelBtn').style.display = 'none';
}

async function deleteCategory(id) {
    if (!confirm('⚠️ Delete this category and all its videos?')) return;
    
    try {
        await fetch(`${API}?action=delete-category&id=${id}`, {method: 'POST'});
        alert('✅ Deleted!');
        loadCategories();
        document.getElementById('contentArea').innerHTML = '<div class="empty-state"><div class="empty-icon">📂</div><p>Select a category from sidebar</p></div>';
    } catch(error) {
        alert('Error: ' + error.message);
    }
}

// Handle Movie Submit
async function handleMovieSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    const movieId = document.getElementById('movieId').value;
    
    formData.append('title', document.getElementById('movieTitle').value);
    formData.append('category_id', currentCategoryId);
    formData.append('link', document.getElementById('movieLink').value);
    formData.append('short_link', document.getElementById('shortLink').value);
    
    const img = document.getElementById('movieImage').files[0];
    if (img) {
        formData.append('image', img);
    }
    
    if (movieId) {
        formData.append('old_img', document.getElementById('oldImg').value);
    }
    
    try {
        const action = movieId ? `update-movie&id=${movieId}` : 'add-movie';
        const res = await fetch(`${API}?action=${action}`, {
            method: 'POST', 
            body: formData
        });
        const result = await res.json();
        
        if (result.success || result.error === undefined) {
            alert(movieId ? '✅ Video updated successfully!' : '✅ Video published successfully!');
            resetMovieForm();
            selectCategory(currentCategoryId);
        } else {
            alert('Error: ' + (result.error || 'Unknown error'));
        }
    } catch(error) {
        console.error('Submit error:', error);
        alert('Error saving video: ' + error.message);
    }
}

async function editMovie(id) {
    try {
        const res = await fetch(`${API}?action=get-movie&id=${id}`);
        const movie = await res.json();
        
        document.getElementById('movieId').value = movie.id;
        document.getElementById('movieTitle').value = movie.title;
        document.getElementById('movieLink').value = movie.link;
        document.getElementById('shortLink').value = movie.short_link || '';
        document.getElementById('oldImg').value = movie.img || '';
        document.getElementById('movieFormTitle').textContent = `✏️ Edit: ${movie.title}`;
        document.getElementById('submitBtn').textContent = '🔄 Update Video';
        document.getElementById('cancelMovieBtn').style.display = 'inline-block';
        
        document.getElementById('movieForm').scrollIntoView({behavior: 'smooth'});
    } catch(error) {
        alert('Error: ' + error.message);
    }
}

function resetMovieForm() {
    document.getElementById('movieForm').reset();
    document.getElementById('movieId').value = '';
    document.getElementById('oldImg').value = '';
    document.getElementById('movieFormTitle').textContent = '📽️ Add Video';
    document.getElementById('submitBtn').textContent = '🚀 Publish Video';
    document.getElementById('cancelMovieBtn').style.display = 'none';
}

async function deleteMovie(id) {
    if (!confirm('⚠️ Delete this video?')) return;
    
    try {
        await fetch(`${API}?action=delete-movie&id=${id}`, {method: 'POST'});
        alert('✅ Video deleted!');
        selectCategory(currentCategoryId);
    } catch(error) {
        alert('Error: ' + error.message);
    }
}

// Initialize
loadCategories();
