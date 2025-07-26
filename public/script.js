// DOM Elements
const addItemForm = document.getElementById('addItemForm');
const itemsContainer = document.getElementById('itemsContainer');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// State
let allItems = [];

// API Base URL
const API_BASE = window.location.origin;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    addItemForm.addEventListener('submit', handleAddItem);
    searchInput.addEventListener('input', filterItems);
    categoryFilter.addEventListener('change', filterItems);
}

// Load items from the server
async function loadItems() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}/api/items`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch items');
        }
        
        allItems = await response.json();
        displayItems(allItems);
    } catch (error) {
        console.error('Error loading items:', error);
        showError('Failed to load items. Please try again.');
    }
}

// Handle adding new item
async function handleAddItem(e) {
    e.preventDefault();
    
    const formData = new FormData(addItemForm);
    const itemData = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value,
        owner: document.getElementById('owner').value.trim(),
        wantedItems: document.getElementById('wantedItems').value.trim()
    };
    
    // Validation
    if (!itemData.title || !itemData.description || !itemData.owner) {
        alert('Please fill in all required fields (Title, Description, and Your Name)');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add item');
        }
        
        const newItem = await response.json();
        allItems.push(newItem);
        
        // Reset form
        addItemForm.reset();
        
        // Refresh display
        filterItems();
        
        // Show success message
        showSuccessMessage('Item added successfully!');
        
    } catch (error) {
        console.error('Error adding item:', error);
        alert('Failed to add item. Please try again.');
    }
}

// Delete item
async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/items/${itemId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete item');
        }
        
        // Remove from local array
        allItems = allItems.filter(item => item.id !== itemId);
        
        // Refresh display
        filterItems();
        
        showSuccessMessage('Item deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
    }
}

// Filter and search items
function filterItems() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    let filteredItems = allItems.filter(item => {
        const matchesSearch = !searchTerm || 
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.owner.toLowerCase().includes(searchTerm) ||
            item.wantedItems.toLowerCase().includes(searchTerm);
            
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    displayItems(filteredItems);
}

// Display items in the grid
function displayItems(items) {
    if (items.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No items found</h3>
                <p>Be the first to add an item for trading!</p>
            </div>
        `;
        return;
    }
    
    itemsContainer.innerHTML = items.map(item => `
        <div class="item-card" data-id="${item.id}">
            <button class="delete-btn" onclick="deleteItem(${item.id})" title="Delete Item">✕</button>
            <div class="item-category">${item.category}</div>
            <h3>${escapeHtml(item.title)}</h3>
            <div class="item-owner">Owner: ${escapeHtml(item.owner)}</div>
            <div class="item-description">${escapeHtml(item.description)}</div>
            ${item.wantedItems ? `<div class="item-wanted">Wants: ${escapeHtml(item.wantedItems)}</div>` : ''}
            <button onclick="contactOwner('${escapeHtml(item.owner)}', '${escapeHtml(item.title)}')" style="background: #28a745; margin-top: 10px;">
                Contact Owner
            </button>
        </div>
    `).join('');
}

// Contact owner (simple alert for demo)
function contactOwner(owner, itemTitle) {
    alert(`Contact ${owner} about "${itemTitle}"\n\nIn a real application, this would open a messaging system or show contact information.`);
}

// Show loading state
function showLoading() {
    itemsContainer.innerHTML = '<div class="loading">Loading items...</div>';
}

// Show error message
function showError(message) {
    itemsContainer.innerHTML = `
        <div class="empty-state">
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: bold;
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}