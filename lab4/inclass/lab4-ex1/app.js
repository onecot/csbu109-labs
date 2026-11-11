const API_URL = 'http://localhost:5001/api/v1/products';

// Cached copy of the latest list, used by the Edit row
let productsCache = [];

// Visible error banner (not only the Console)
function showError(message) {
    const box = document.getElementById('errorBox');
    box.textContent = message;
    box.style.display = 'block';
}

function clearError() {
    document.getElementById('errorBox').style.display = 'none';
}

// 1. Load the product list from the backend
async function fetchProducts() {
    try {
        const category = document.getElementById('categoryFilter').value;
        const url = category ? `${API_URL}?category=${encodeURIComponent(category)}` : API_URL;
        const response = await fetch(url);
        const result = await response.json();

        clearError();
        productsCache = result.data;

        // Rebuild the dropdown with every distinct category, keep selection
        const filter = document.getElementById('categoryFilter');
        filter.innerHTML = '<option value="">All</option>' +
            result.categories.map(c =>
                `<option value="${c}"${c === category ? ' selected' : ''}>${c}</option>`
            ).join('');

        const tbody = document.querySelector('#productTable tbody');
        tbody.innerHTML = '';

        result.data.forEach(p => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', p.id);
            tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${new Intl.NumberFormat('en-US').format(p.price)} VND</td>
        <td>${p.category}</td>
        <td>
          <button class="btn-edit" onclick="editProduct(${p.id})">Edit</button>
          <button class="btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        showError('Error fetching products: ' + error.message);
    }
}

// 2. Add a new product
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const productData = {
        name: document.getElementById('name').value,
        price: document.getElementById('price').value,
        category: document.getElementById('category').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            clearError();
            document.getElementById('productForm').reset();
            fetchProducts(); // Reload the table
        } else {
            const error = await response.json();
            showError('Error adding product: ' + (error.message || response.status));
        }
    } catch (error) {
        showError('Error adding product: ' + error.message);
    }
});

// 3. Turn a row into inputs with Save / Cancel
function editProduct(id) {
    const p = productsCache.find(x => x.id === id);
    if (!p) return;

    const tr = document.querySelector(`#productTable tbody tr[data-id="${id}"]`);
    tr.innerHTML = `
    <td>${p.id}</td>
    <td><input type="text" id="edit-name-${id}" value="${p.name}"></td>
    <td><input type="number" id="edit-price-${id}" value="${p.price}"></td>
    <td><input type="text" id="edit-category-${id}" value="${p.category}"></td>
    <td>
      <button class="btn-save" onclick="saveProduct(${id})">Save</button>
      <button class="btn-cancel" onclick="fetchProducts()">Cancel</button>
    </td>
  `;
}

// 4. Save sends the PUT request
async function saveProduct(id) {
    const productData = {
        name: document.getElementById(`edit-name-${id}`).value,
        price: document.getElementById(`edit-price-${id}`).value,
        category: document.getElementById(`edit-category-${id}`).value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            clearError();
            fetchProducts(); // Reload the table
        } else {
            const error = await response.json();
            showError('Error updating product: ' + (error.message || response.status));
        }
    } catch (error) {
        showError('Error updating product: ' + error.message);
    }
}

// 5. Delete a product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            clearError();
            fetchProducts();
        } else {
            const error = await response.json();
            showError('Error deleting product: ' + (error.message || response.status));
        }
    } catch (error) {
        showError('Error deleting product: ' + error.message);
    }
}

// Changing the filter re-fetches the list
document.getElementById('categoryFilter').addEventListener('change', fetchProducts);

fetchProducts();