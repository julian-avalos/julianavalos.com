// Jikan API Base URL
const API_BASE_URL = 'https://api.jikan.moe/v4';

// Storage keys
const STORAGE_KEYS = {
    TO_BE_READ: 'animeTracker_toBeRead',
    READ: 'animeTracker_read'
};

// Initialize lists from localStorage
let toBeReadList = JSON.parse(localStorage.getItem(STORAGE_KEYS.TO_BE_READ)) || [];
let readList = JSON.parse(localStorage.getItem(STORAGE_KEYS.READ)) || [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const toBeReadListDiv = document.getElementById('toBeReadList');
const readListDiv = document.getElementById('readList');
const contentTypeRadios = document.querySelectorAll('input[name="contentType"]');

// Event Listeners
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    renderLists();
});

/**
 * Handle search functionality
 */
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query.length) {
        alert('Please enter a search term');
        return;
    }

    const contentType = document.querySelector('input[name="contentType"]:checked').value;
    searchResults.innerHTML = '<div class="loading">🔍 Searching...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/${contentType}?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch results');
        }
        
        const data = await response.json();
        displaySearchResults(data, contentType);
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `<div class="empty-message">❌ Error fetching results. Please try again.</div>`;
    }
}

/**
 * Display search results
 */
function displaySearchResults(data, contentType) {
    if (!data.data || data.data.length === 0) {
        searchResults.innerHTML = '<div class="empty-message">No results found. Try a different search.</div>';
        return;
    }

    searchResults.innerHTML = data.data.map((result) => {
        // Extract title from Jikan API response
        const title = result.title || result.name || 'Unknown Title';
        const episodes = result.episodes || 'N/A';
        const status = result.status || 'Unknown';
        
        // Create a unique ID based on mal_id from Jikan
        const itemId = `${contentType}-${result.mal_id}`;
        const isInToBeRead = toBeReadList.some(item => item.id === itemId);
        const isInRead = readList.some(item => item.id === itemId);

        // Extract image URL from Jikan API response
        const imageUrl = result.images?.jpg?.image_url || result.images?.image_url || '';
        
        return `
            <div class="result-item">
                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="result-item-image" onerror="this.style.display='none'">` : ''}
                <div class="result-item-title">${title}</div>
                <div class="result-item-info">
                    <strong>Status:</strong> ${status}<br>
                    ${contentType === 'anime' ? `<strong>Episodes:</strong> ${episodes}` : ''}
                </div>
                <div class="result-item-buttons">
                    <button class="add-btn" onclick="addToList('${itemId}', '${title}', '${contentType}', 'toBeRead')" ${isInToBeRead ? 'disabled' : ''}>
                        + To Be Read
                    </button>
                    <button class="read-btn" onclick="addToList('${itemId}', '${title}', '${contentType}', 'read')" ${isInRead ? 'disabled' : ''}>
                        + Read
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Add item to a list
 */
function addToList(itemId, title, contentType, listType) {
    const newItem = {
        id: itemId,
        title: title,
        type: contentType,
        dateAdded: new Date().toLocaleDateString()
    };

    if (listType === 'toBeRead') {
        // Remove from read list if present
        readList = readList.filter(item => item.id !== itemId);
        // Add to toBeReadList if not already present
        if (!toBeReadList.some(item => item.id === itemId)) {
            toBeReadList.push(newItem);
        }
    } else if (listType === 'read') {
        // Remove from toBeReadList if present
        toBeReadList = toBeReadList.filter(item => item.id !== itemId);
        // Add to readList if not already present
        if (!readList.some(item => item.id === itemId)) {
            readList.push(newItem);
        }
    }

    // Save to localStorage
    saveLists();
    
    // Refresh UI
    renderLists();
    handleSearch(); // Refresh search results to update button states
}

/**
 * Move item between lists
 */
function moveItem(itemId, fromList) {
    let item;
    
    if (fromList === 'toBeRead') {
        toBeReadList = toBeReadList.filter(i => {
            if (i.id === itemId) {
                item = i;
                return false;
            }
            return true;
        });
        if (item && !readList.some(i => i.id === itemId)) {
            readList.push(item);
        }
    } else if (fromList === 'read') {
        readList = readList.filter(i => {
            if (i.id === itemId) {
                item = i;
                return false;
            }
            return true;
        });
        if (item && !toBeReadList.some(i => i.id === itemId)) {
            toBeReadList.push(item);
        }
    }

    saveLists();
    renderLists();
}

/**
 * Remove item from list
 */
function removeItem(itemId, fromList) {
    if (fromList === 'toBeRead') {
        toBeReadList = toBeReadList.filter(item => item.id !== itemId);
    } else if (fromList === 'read') {
        readList = readList.filter(item => item.id !== itemId);
    }

    saveLists();
    renderLists();
}

/**
 * Save lists to localStorage
 */
function saveLists() {
    localStorage.setItem(STORAGE_KEYS.TO_BE_READ, JSON.stringify(toBeReadList));
    localStorage.setItem(STORAGE_KEYS.READ, JSON.stringify(readList));
}

/**
 * Render both lists
 */
function renderLists() {
    renderListItems(toBeReadList, toBeReadListDiv, 'toBeRead');
    renderListItems(readList, readListDiv, 'read');
}

/**
 * Render items for a specific list
 */
function renderListItems(items, containerDiv, listType) {
    if (items.length === 0) {
        containerDiv.innerHTML = '<div class="empty-message">No items yet. Search and add some! 🎬</div>';
        return;
    }

    containerDiv.innerHTML = items.map(item => {
        const moveButtonText = listType === 'toBeRead' ? 'Move to Read' : 'Move to To Be Read';
        const moveButtonOnclick = `moveItem('${item.id}', '${listType}')`;
        const removeButtonOnclick = `removeItem('${item.id}', '${listType}')`;

        return `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-title">${item.title}</div>
                    <div class="list-item-type">${item.type} • Added: ${item.dateAdded}</div>
                </div>
                <div class="list-item-buttons">
                    <button class="move-btn" onclick="${moveButtonOnclick}">
                        ${moveButtonText}
                    </button>
                    <button class="remove-btn" onclick="${removeButtonOnclick}">
                        Remove
                    </button>
                </div>
            </div>
        `;
    }).join('');
}
