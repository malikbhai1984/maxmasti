<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin CRUD - MaxMasti</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-black text-white p-6 font-sans">
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Categories Panel -->
        <div class="bg-gray-900 p-5 rounded-2xl border border-gray-800">
            <h2 class="text-2xl font-bold mb-4 border-b border-gray-800 pb-2">📂 Categories</h2>
            <div class="flex gap-2 mb-4">
                <input id="catName" class="w-full bg-black p-2 rounded border border-gray-700 outline-none" placeholder="New Category">
                <button onclick="addCategory()" class="bg-yellow-600 px-4 py-2 rounded font-bold hover:bg-yellow-500 text-sm">ADD</button>
            </div>
            <div id="catList" class="space-y-2 text-sm max-h-96 overflow-y-auto"></div>
        </div>

        <!-- Movies Panel -->
        <div class="lg:col-span-2 bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 id="formTitle" class="text-2xl font-bold mb-4 border-b border-gray-800 pb-2">➕ Add New Movie</h2>
            <form id="movieForm" enctype="multipart/form-data" class="space-y-4">
                <input type="hidden" name="id" id="movieId">
                <input type="hidden" name="old_img" id="oldImg">
                <div class="grid grid-cols-2 gap-4">
                    <input type="text" name="title" id="mTitle" placeholder="Movie Title *" class="bg-black p-3 rounded border border-gray-700 outline-none w-full" required>
                    <select name="cat" id="mCat" class="bg-black p-3 rounded border border-gray-700 outline-none w-full" required>
                        <option value="">Select Category</option>
                    </select>
                </div>
                <input type="file" name="image" accept="image/*" class="w-full bg-black p-3 border border-gray-700 rounded">
                <input type="text" name="link" id="mLink" placeholder="Video ID: vuqevy71anqx" class="w-full bg-black p-3 rounded border border-gray-700 outline-none" required>
                <div class="flex gap-2">
                    <button type="submit" id="submitBtn" class="bg-yellow-500 text-black font-black p-3 rounded w-full hover:bg-yellow-400">🚀 PUBLISH</button>
                    <button type="button" id="cancelBtn" onclick="resetForm()" class="hidden bg-red-600 px-6 py-3 rounded font-bold hover:bg-red-500">CANCEL</button>
                </div>
            </form>

            <div class="mt-10 overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-gray-800">
                        <tr><th class="p-3">Title</th><th class="p-3 text-right">Actions</th></tr>
                    </thead>
                    <tbody id="movieList"></tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        const API_BASE = 'api.php';

        async function loadData() {
            try {
                // Load categories
                const catsRes = await fetch(`${API_BASE}?action=cats`);
                const cats = await catsRes.json();
                
                document.getElementById('catList').innerHTML = cats.map(c => `
                    <div class="flex justify-between p-2 bg-black rounded border border-gray-800 hover:bg-gray-800">
                        <span class="font-medium">${c.name}</span>
                        <button onclick="deleteItem('del-cat', ${c.id})" class="text-red-500 font-bold text-xs hover:text-red-400">DEL</button>
                    </div>
                `).join('') || '<div class="p-4 text-gray-500 text-center">No categories</div>';

                // Update category dropdown
                const catSelect = document.getElementById('mCat');
                catSelect.innerHTML = '<option value="">Select Category</option>' + 
                    cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

                // Load movies
                const moviesRes = await fetch(`${API_BASE}?action=movies`);
                const movies = await moviesRes.json();
                
                document.getElementById('movieList').innerHTML = movies.map(m => `
                    <tr class="border-b border-gray-800 hover:bg-black/50">
                        <td class="p-3 font-bold">${m.title}
                            <span class="block text-[10px] text-yellow-600">${m.cat}</span>
                            <span class="block text-xs text-gray-400">${m.link}</span>
                        </td>
                        <td class="p-3 text-right space-x-2">
                            <button onclick="editMovie(${m.id})" class="text-blue-400 font-bold underline hover:text-blue-300">EDIT</button>
                            <button onclick="deleteItem('del-post', ${m.id})" class="text-red-500 font-bold underline hover:text-red-400">DEL</button>
                        </td>
                    </tr>
                `).join('') || '<tr><td colspan="2" class="p-8 text-center text-gray-500">No movies</td></tr>';
            } catch(e) {
                console.error('Load error:', e);
            }
        }

        async function addCategory() {
            const name = document.getElementById('catName').value.trim();
            if (!name) return alert('Category name required');
            
            try {
                await fetch(`${API_BASE}?action=add-cat`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({name})
                });
                document.getElementById('catName').value = '';
                loadData();
            } catch(e) {
                alert('Category add failed');
            }
        }

        document.getElementById('movieForm').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const id = document.getElementById('movieId').value;
            const action = id ? 'update-post' : 'add-post';
            
            try {
                const res = await fetch(`${API_BASE}?action=${action}${id ? '&id=' + id : ''}`, {
                    method: 'POST',
                    body: formData
                });
                if (res.ok) {
                    alert(id ? 'Updated!' : 'Movie added!');
                    resetForm();
                    loadData();
                }
            } catch(e) {
                alert('Upload failed');
            }
        };

        async function editMovie(id) {
            try {
                const res = await fetch(`${API_BASE}?action=get-video&id=${id}`);
                const movie = await res.json();
                
                document.getElementById('movieId').value = movie.id;
                document.getElementById('mTitle').value = movie.title;
                document.getElementById('mCat').value = movie.cat;
                document.getElementById('mLink').value = movie.link;
                document.getElementById('oldImg').value = movie.img || '';
                document.getElementById('submitBtn').innerText = "UPDATE";
                document.getElementById('formTitle').innerText = `Edit: ${movie.title}`;
                document.getElementById('cancelBtn').classList.remove('hidden');
            } catch(e) {
                console.error('Edit error:', e);
            }
        }

        function resetForm() {
            document.getElementById('movieForm').reset();
            document.getElementById('movieId').value = '';
            document.getElementById('oldImg').value = '';
            document.getElementById('submitBtn').innerText = "🚀 PUBLISH";
            document.getElementById('formTitle').innerText = "➕ Add New Movie";
            document.getElementById('cancelBtn').classList.add('hidden');
        }

        async function deleteItem(action, id) {
            if (confirm(`Delete ${action.includes('cat') ? 'category' : 'movie'}?`)) {
                await fetch(`${API_BASE}?action=${action}&id=${id}`, { method: 'POST' });
                loadData();
            }
        }

        // Auto refresh every 5s
        loadData();
        setInterval(loadData, 5000);
    </script>
</body>
</html>
