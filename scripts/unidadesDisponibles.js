// UNIDADES DISPONIBLES - JavaScript Functionality

// Global Variables
let vehiclesData = [];
let filteredVehicles = [];
let currentFilters = {};
let compareList = [];
let currentPage = 1;
let vehiclesPerPage = 24;
let isLoading = false;
let currentSort = 'relevance';

// Configuration
const CONFIG = {
    apiDelay: 1000, // Simulated API delay
    maxCompareItems: 3,
    whatsappNumber: '5493512345678',
    phoneNumber: '+5493512345678'
};

// DOM Elements
const elements = {
    // Categories
    categoryItems: document.querySelectorAll('.category-item'),
    
    // Filters
    filterSearch: document.getElementById('filter-search'),
    clearSearchBtn: document.querySelector('.clear-search-btn'),
    clearAllBtn: document.querySelector('.clear-all-btn'),
    saveSearchBtn: document.querySelector('.save-search-btn'),
    collapseButtons: document.querySelectorAll('.collapse-btn'),
    filterCheckboxes: document.querySelectorAll('input[type="checkbox"]'),
    filterRadios: document.querySelectorAll('input[type="radio"]'),
    rangeInputs: document.querySelectorAll('.range-input'),
    
    // Results
    vehiclesGrid: document.getElementById('vehicles-grid'),
    loadingState: document.getElementById('loading-state'),
    loadMoreBtn: document.getElementById('load-more-btn'),
    
    // Sort and Controls
    sortBtn: document.querySelector('.sort-btn'),
    sortMenu: document.querySelector('.sort-menu'),
    sortOptions: document.querySelectorAll('.sort-option'),
    
    // Compare
    compareBar: document.getElementById('compare-bar'),
    compareItems: document.getElementById('compare-items'),
    compareCount: document.getElementById('compare-count'),
    openCompareBtn: document.getElementById('open-compare'),
    clearCompareBtn: document.getElementById('clear-compare'),
    compareModal: document.getElementById('compare-modal-overlay'),
    
    // Modals
    vehicleModal: document.getElementById('vehicle-detail-modal')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚛 Iniciando Unidades Disponibles...');
    
    initializeFilters();
    initializeCategories();
    initializeSorting();
    initializeCompare();
    initializeModals();
    initializeMobileFeatures();
    
    // Load initial data
    loadVehiclesData();
    
    console.log('✅ Unidades Disponibles inicializado correctamente');
});

// === DATA MANAGEMENT ===
function loadVehiclesData() {
    showLoading(true);
    
    // Simulate API call with sample data
    setTimeout(() => {
        vehiclesData = generateSampleVehicles();
        applyFilters();
        showLoading(false);
        
        console.log(`📊 Cargados ${vehiclesData.length} vehículos`);
    }, CONFIG.apiDelay);
}

function generateSampleVehicles() {
    const brands = ['Scania', 'Volvo', 'Mercedes-Benz', 'Iveco', 'DAF', 'Volkswagen'];
    const models = {
        'Scania': ['R 450', 'R 500', 'S 500', 'G 450'],
        'Volvo': ['FH 460', 'FH 500', 'FM 410', 'FMX 450'],
        'Mercedes-Benz': ['Actros 1845', 'Actros 2046', 'Arocs 3245', 'Atego 1725'],
        'Iveco': ['Stralis 460', 'Stralis 480', 'Trakker 410', 'Daily 70C'],
        'DAF': ['XF 480', 'CF 440', 'LF 280', 'XG 530'],
        'Volkswagen': ['Constellation 24.280', 'Delivery 11.180', 'Worker 15.180']
    };
    
    const types = ['Cabeza tractora', 'Camiones', 'Furgoneta liviana', 'Semirremolque'];
    const transmissions = ['Manual', 'Automática'];
    const euroStandards = ['Euro 4', 'Euro 5', 'Euro 6'];
    const axleConfigs = ['4x2', '6x2', '6x4'];
    const bodyTypes = ['Caja Abierta', 'Caja Cerrada', 'Tolva', 'Cisterna'];
    
    const vehicles = [];
    
    for (let i = 1; i <= 583; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const modelList = models[brand];
        const model = modelList[Math.floor(Math.random() * modelList.length)];
        const year = 2015 + Math.floor(Math.random() * 10);
        const km = Math.floor(Math.random() * 800000) + 100000;
        const hp = 350 + Math.floor(Math.random() * 200);
        
        vehicles.push({
            id: `vehicle-${i}`,
            brand: brand,
            model: model,
            fullName: `${brand} ${model}`,
            type: types[Math.floor(Math.random() * types.length)],
            year: year,
            kilometers: km,
            power: hp,
            transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
            euroStandard: euroStandards[Math.floor(Math.random() * euroStandards.length)],
            axleConfig: axleConfigs[Math.floor(Math.random() * axleConfigs.length)],
            bodyType: bodyTypes[Math.floor(Math.random() * bodyTypes.length)],
            condition: Math.random() > 0.1 ? 'Usado' : 'Nuevo',
            status: Math.random() > 0.15 ? 'Disponible' : 'Reservado',
            price: Math.floor(Math.random() * 50000) + 25000,
            location: 'Villa María, Córdoba',
            country: 'AR',
            images: [
                `../assets/images/vehicles/${brand.toLowerCase()}-${i}-1.jpg`,
                `../assets/images/vehicles/${brand.toLowerCase()}-${i}-2.jpg`,
                `../assets/images/vehicles/${brand.toLowerCase()}-${i}-3.jpg`
            ],
            description: `${brand} ${model} en excelente estado. Mantenimiento al día, documentación en regla. Ideal para trabajo pesado y larga distancia.`,
            features: [
                'Motor en excelente estado',
                'Caja de cambios revisada',
                'Neumáticos en buen estado',
                'Interior conservado',
                'Documentación al día'
            ],
            dateAdded: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
        });
    }
    
    return vehicles;
}

// === FILTER MANAGEMENT ===
function initializeFilters() {
    // Search input
    if (elements.filterSearch) {
        elements.filterSearch.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Clear search
    if (elements.clearSearchBtn) {
        elements.clearSearchBtn.addEventListener('click', clearSearch);
    }
    
    // Clear all filters
    if (elements.clearAllBtn) {
        elements.clearAllBtn.addEventListener('click', clearAllFilters);
    }
    
    // Save search
    if (elements.saveSearchBtn) {
        elements.saveSearchBtn.addEventListener('click', saveSearch);
    }
    
    // Collapsible filter groups
    elements.collapseButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterGroup = this.closest('.filter-group');
            filterGroup.classList.toggle('collapsed');
        });
    });
    
    // Filter checkboxes
    elements.filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleFilterChange);
    });
    
    // Filter radios
    elements.filterRadios.forEach(radio => {
        radio.addEventListener('change', handleFilterChange);
    });
    
    // Range inputs
    elements.rangeInputs.forEach(input => {
        input.addEventListener('blur', handleRangeFilter);
    });
}

function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    currentFilters.search = searchTerm;
    
    // Show/hide clear button
    if (elements.clearSearchBtn) {
        elements.clearSearchBtn.style.opacity = searchTerm ? '1' : '0';
    }
    
    applyFilters();
    trackEvent('Filter', 'Search', searchTerm);
}

function clearSearch() {
    if (elements.filterSearch) {
        elements.filterSearch.value = '';
        delete currentFilters.search;
        applyFilters();
    }
}

function handleFilterChange(event) {
    const input = event.target;
    const filterName = input.name;
    const filterValue = input.value;
    
    if (input.type === 'checkbox') {
        if (!currentFilters[filterName]) {
            currentFilters[filterName] = [];
        }
        
        if (input.checked) {
            if (!currentFilters[filterName].includes(filterValue)) {
                currentFilters[filterName].push(filterValue);
            }
        } else {
            currentFilters[filterName] = currentFilters[filterName].filter(val => val !== filterValue);
            if (currentFilters[filterName].length === 0) {
                delete currentFilters[filterName];
            }
        }
    } else if (input.type === 'radio') {
        currentFilters[filterName] = filterValue;
    }
    
    applyFilters();
    trackEvent('Filter', 'Change', `${filterName}:${filterValue}`);
}

function handleRangeFilter(event) {
    const input = event.target;
    const value = input.value.trim();
    const isMinInput = input.placeholder.toLowerCase().includes('de');
    const rangeType = input.closest('.filter-subgroup').querySelector('.filter-subtitle').textContent.toLowerCase();
    
    if (!value) return;
    
    let filterKey = '';
    if (rangeType.includes('año')) filterKey = 'year';
    else if (rangeType.includes('kilometraje')) filterKey = 'kilometers';
    else if (rangeType.includes('potencia')) filterKey = 'power';
    
    if (!currentFilters[filterKey]) {
        currentFilters[filterKey] = {};
    }
    
    if (isMinInput) {
        currentFilters[filterKey].min = parseInt(value);
    } else {
        currentFilters[filterKey].max = parseInt(value);
    }
    
    applyFilters();
}

function applyFilters() {
    showLoading(true);
    
    setTimeout(() => {
        filteredVehicles = vehiclesData.filter(vehicle => {
            // Search filter
            if (currentFilters.search) {
                const searchTerm = currentFilters.search.toLowerCase();
                const searchableText = `${vehicle.brand} ${vehicle.model} ${vehicle.type}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            // Category filter (from active category)
            const activeCategory = document.querySelector('.category-item.active');
            if (activeCategory && activeCategory.dataset.category !== 'all') {
                const categoryType = activeCategory.dataset.category;
                if (vehicle.type.toLowerCase().replace(/\s+/g, '-') !== categoryType) {
                    return false;
                }
            }
            
            // Condition filter
            if (currentFilters.condicion && currentFilters.condicion.length > 0) {
                if (!currentFilters.condicion.includes(vehicle.condition.toLowerCase())) {
                    return false;
                }
            }
            
            // Vehicle type filter
            if (currentFilters['tipo-vehiculo']) {
                const typeFilter = currentFilters['tipo-vehiculo'].replace(/-/g, ' ');
                if (vehicle.type.toLowerCase() !== typeFilter.toLowerCase()) {
                    return false;
                }
            }
            
            // Brand filter
            if (currentFilters.marca && currentFilters.marca.length > 0) {
                if (!currentFilters.marca.includes(vehicle.brand.toLowerCase().replace('-', ''))) {
                    return false;
                }
            }
            
            // Transmission filter
            if (currentFilters.transmision && currentFilters.transmision.length > 0) {
                const transmissionMap = { 'manual': 'Manual', 'automatica': 'Automática' };
                const vehicleTransmission = vehicle.transmission;
                const hasMatchingTransmission = currentFilters.transmision.some(filter => 
                    transmissionMap[filter] === vehicleTransmission
                );
                if (!hasMatchingTransmission) {
                    return false;
                }
            }
            
            // Year range filter
            if (currentFilters.year) {
                if (currentFilters.year.min && vehicle.year < currentFilters.year.min) {
                    return false;
                }
                if (currentFilters.year.max && vehicle.year > currentFilters.year.max) {
                    return false;
                }
            }
            
            // Kilometers range filter
            if (currentFilters.kilometers) {
                if (currentFilters.kilometers.min && vehicle.kilometers < currentFilters.kilometers.min) {
                    return false;
                }
                if (currentFilters.kilometers.max && vehicle.kilometers > currentFilters.kilometers.max) {
                    return false;
                }
            }
            
            // Power range filter
            if (currentFilters.power) {
                if (currentFilters.power.min && vehicle.power < currentFilters.power.min) {
                    return false;
                }
                if (currentFilters.power.max && vehicle.power > currentFilters.power.max) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Apply sorting
        applySorting();
        
        // Reset pagination
        currentPage = 1;
        
        // Update UI
        updateResultsDisplay();
        showLoading(false);
        
    }, 300);
}

function clearAllFilters() {
    currentFilters = {};
    
    // Clear search input
    if (elements.filterSearch) {
        elements.filterSearch.value = '';
    }
    
    // Clear all checkboxes and radios
    elements.filterCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    elements.filterRadios.forEach(radio => {
        radio.checked = false;
    });
    
    // Clear range inputs
    elements.rangeInputs.forEach(input => {
        input.value = '';
    });
    
    // Reset to "all" category
    elements.categoryItems.forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('[data-category="all"]')?.classList.add('active');
    
    applyFilters();
    trackEvent('Filter', 'Clear All');
}

function saveSearch() {
    const searchData = {
        filters: currentFilters,
        timestamp: new Date().toISOString(),
        resultsCount: filteredVehicles.length
    };
    
    // Store in localStorage
    try {
        const savedSearches = JSON.parse(localStorage.getItem('larrosa_saved_searches') || '[]');
        savedSearches.unshift(searchData);
        
        // Keep only last 5 searches
        if (savedSearches.length > 5) {
            savedSearches.splice(5);
        }
        
        localStorage.setItem('larrosa_saved_searches', JSON.stringify(savedSearches));
        showNotification('Búsqueda guardada correctamente', 'success');
        
    } catch (error) {
        console.error('Error saving search:', error);
        showNotification('Error al guardar la búsqueda', 'error');
    }
    
    trackEvent('Filter', 'Save Search');
}

// === CATEGORY MANAGEMENT ===
function initializeCategories() {
    elements.categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active from all categories
            elements.categoryItems.forEach(cat => cat.classList.remove('active'));
            
            // Add active to clicked category
            this.classList.add('active');
            
            // Apply filters
            applyFilters();
            
            trackEvent('Category', 'Select', this.dataset.category);
        });
    });
}

// === SORTING MANAGEMENT ===
function initializeSorting() {
    // Sort button toggle
    if (elements.sortBtn) {
        elements.sortBtn.addEventListener('click', function() {
            if (elements.sortMenu) {
                elements.sortMenu.style.opacity = elements.sortMenu.style.opacity === '1' ? '0' : '1';
                elements.sortMenu.style.visibility = elements.sortMenu.style.visibility === 'visible' ? 'hidden' : 'visible';
            }
        });
    }
    
    // Sort options
    elements.sortOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active from all options
            elements.sortOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active to clicked option
            this.classList.add('active');
            
            // Update current sort
            currentSort = this.dataset.sort;
            
            // Update button text
            if (elements.sortBtn) {
                elements.sortBtn.querySelector('span').textContent = this.textContent;
            }
            
            // Hide menu
            if (elements.sortMenu) {
                elements.sortMenu.style.opacity = '0';
                elements.sortMenu.style.visibility = 'hidden';
            }
            
            // Apply sorting
            applySorting();
            updateResultsDisplay();
            
            trackEvent('Sort', 'Change', currentSort);
        });
    });
    
    // Close sort menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.sort-dropdown')) {
            if (elements.sortMenu) {
                elements.sortMenu.style.opacity = '0';
                elements.sortMenu.style.visibility = 'hidden';
            }
        }
    });
}

function applySorting() {
    filteredVehicles.sort((a, b) => {
        switch (currentSort) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'year-desc':
                return b.year - a.year;
            case 'year-asc':
                return a.year - b.year;
            case 'km-asc':
                return a.kilometers - b.kilometers;
            case 'km-desc':
                return b.kilometers - a.kilometers;
            case 'relevance':
            default:
                // Sort by date added (newest first), then by relevance score
                return b.dateAdded - a.dateAdded;
        }
    });
}

// === DISPLAY MANAGEMENT ===
function updateResultsDisplay() {
    if (!elements.vehiclesGrid) return;
    
    // Update results count
    const totalCount = filteredVehicles.length;
    const showingCount = Math.min(currentPage * vehiclesPerPage, totalCount);
    
    const totalCountElement = document.getElementById('total-count');
    const showingCountElement = document.getElementById('showing-count');
    
    if (totalCountElement) totalCountElement.textContent = totalCount;
    if (showingCountElement) showingCountElement.textContent = showingCount;
    
    // Update tab with vehicle count
    const vehicleCountTab = document.querySelector('.tab-btn:last-child span');
    if (vehicleCountTab) {
        vehicleCountTab.innerHTML = `<strong>${totalCount} vehículos encontrado</strong>`;
    }
    
    // Show/hide no results
    const noResults = document.getElementById('no-results');
    if (totalCount === 0) {
        elements.vehiclesGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        if (elements.loadMoreBtn) elements.loadMoreBtn.style.display = 'none';
    } else {
        elements.vehiclesGrid.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';
        
        // Render vehicles
        renderVehicles();
        
        // Update load more button
        updateLoadMoreButton();
    }
}

function renderVehicles() {
    const startIndex = 0;
    const endIndex = currentPage * vehiclesPerPage;
    const vehiclesToShow = filteredVehicles.slice(startIndex, endIndex);
    
    elements.vehiclesGrid.innerHTML = '';
    
    vehiclesToShow.forEach(vehicle => {
        const vehicleCard = createVehicleCard(vehicle);
        elements.vehiclesGrid.appendChild(vehicleCard);
    });
    
    // Add scroll animation
    setTimeout(() => {
        const cards = elements.vehiclesGrid.querySelectorAll('.vehicle-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
            card.classList.add('fade-in', 'visible');
        });
    }, 100);
}

function createVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.dataset.vehicleId = vehicle.id;
    
    const statusClass = vehicle.status.toLowerCase() === 'disponible' ? 'available' : 'reserved';
    const flagIcon = vehicle.country === 'AR' ? '🇦🇷' : '🌍';
    
    card.innerHTML = `
        <div class="vehicle-image">
            <img src="${vehicle.images[0]}" alt="${vehicle.fullName}" loading="lazy"
                 onerror="this.src='../assets/images/placeholder-vehicle.jpg'">
            <button class="vehicle-favorite ${compareList.includes(vehicle.id) ? 'active' : ''}" 
                    onclick="toggleFavorite('${vehicle.id}')" title="Agregar a favoritos">
                <i class="fas fa-heart"></i>
            </button>
            <div class="vehicle-status ${statusClass}">${vehicle.status}</div>
        </div>
        <div class="vehicle-content">
            <h3 class="vehicle-title">${vehicle.fullName}</h3>
            <p class="vehicle-subtitle">${vehicle.description.substring(0, 80)}...</p>
            <div class="vehicle-specs">
                <div class="vehicle-spec">
                    <i class="fas fa-calendar"></i>
                    <span class="vehicle-spec-value">${vehicle.year}</span>
                </div>
                <div class="vehicle-spec">
                    <i class="fas fa-road"></i>
                    <span class="vehicle-spec-value">${formatNumber(vehicle.kilometers)} km</span>
                </div>
                <div class="vehicle-spec">
                    <i class="fas fa-cog"></i>
                    <span class="vehicle-spec-value">${vehicle.transmission}</span>
                </div>
                <div class="vehicle-spec">
                    <i class="fas fa-tachometer-alt"></i>
                    <span class="vehicle-spec-value">${vehicle.power} HP</span>
                </div>
            </div>
        </div>
        <div class="vehicle-footer">
            <div class="vehicle-location">
                <span>${flagIcon}</span>
                <span>${vehicle.location}</span>
            </div>
            <div class="vehicle-actions">
                <label class="compare-checkbox">
                    <input type="checkbox" ${compareList.includes(vehicle.id) ? 'checked' : ''} 
                           onchange="toggleCompare('${vehicle.id}')">
                    <span>Comparar</span>
                </label>
            </div>
        </div>
    `;
    
    // Add click event to open modal
    card.addEventListener('click', function(event) {
        // Don't open modal if clicking on favorite, compare, or other interactive elements
        if (event.target.closest('.vehicle-favorite, .compare-checkbox, .vehicle-actions')) {
            return;
        }
        
        openVehicleModal(vehicle.id);
    });
    
    return card;
}

function updateLoadMoreButton() {
    if (!elements.loadMoreBtn) return;
    
    const totalCount = filteredVehicles.length;
    const showingCount = currentPage * vehiclesPerPage;
    
    if (showingCount >= totalCount) {
        elements.loadMoreBtn.style.display = 'none';
    } else {
        elements.loadMoreBtn.style.display = 'inline-flex';
        const remainingCount = totalCount - showingCount;
        elements.loadMoreBtn.querySelector('span').textContent = 
            `Cargar más vehículos (${remainingCount} restantes)`;
    }
}

// === LOADING STATES ===
function showLoading(show) {
    if (elements.loadingState) {
        elements.loadingState.style.display = show ? 'flex' : 'none';
    }
    
    if (elements.vehiclesGrid) {
        elements.vehiclesGrid.style.opacity = show ? '0.5' : '1';
    }
    
    isLoading = show;
}

// === COMPARE FUNCTIONALITY ===
function initializeCompare() {
    // Load more button
    if (elements.loadMoreBtn) {
        elements.loadMoreBtn.addEventListener('click', loadMoreVehicles);
    }
    
    // Compare modal buttons
    if (elements.openCompareBtn) {
        elements.openCompareBtn.addEventListener('click', openCompareModal);
    }
    
    if (elements.clearCompareBtn) {
        elements.clearCompareBtn.addEventListener('click', clearCompareList);
    }
}

function toggleCompare(vehicleId) {
    const vehicle = vehiclesData.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const index = compareList.indexOf(vehicleId);
    
    if (index > -1) {
        // Remove from compare
        compareList.splice(index, 1);
    } else {
        // Add to compare (max 3 items)
        if (compareList.length >= CONFIG.maxCompareItems) {
            showNotification(`Máximo ${CONFIG.maxCompareItems} vehículos para comparar`, 'warning');
            return;
        }
        compareList.push(vehicleId);
    }
    
    updateCompareUI();
    trackEvent('Compare', index > -1 ? 'Remove' : 'Add', vehicle.fullName);
}

function updateCompareUI() {
    const compareCount = compareList.length;
    
    // Update compare count
    if (elements.compareCount) {
        elements.compareCount.textContent = compareCount;
    }
    
    // Update compare button state
    if (elements.openCompareBtn) {
        elements.openCompareBtn.disabled = compareCount < 2;
    }
    
    // Show/hide compare bar
    if (elements.compareBar) {
        if (compareCount > 0) {
            elements.compareBar.style.display = 'block';
            elements.compareBar.classList.add('active');
        } else {
            elements.compareBar.classList.remove('active');
            setTimeout(() => {
                if (compareList.length === 0) {
                    elements.compareBar.style.display = 'none';
                }
            }, 300);
        }
    }
    
    // Update compare items display
    updateCompareItems();
    
    // Update vehicle cards
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    vehicleCards.forEach(card => {
        const vehicleId = card.dataset.vehicleId;
        const checkbox = card.querySelector('.compare-checkbox input');
        const favorite = card.querySelector('.vehicle-favorite');
        
        if (checkbox) {
            checkbox.checked = compareList.includes(vehicleId);
        }
        
        if (favorite) {
            favorite.classList.toggle('active', compareList.includes(vehicleId));
        }
    });
}

function updateCompareItems() {
    if (!elements.compareItems) return;
    
    elements.compareItems.innerHTML = '';
    
    compareList.forEach(vehicleId => {
        const vehicle = vehiclesData.find(v => v.id === vehicleId);
        if (!vehicle) return;
        
        const compareItem = document.createElement('div');
        compareItem.className = 'compare-item';
        compareItem.innerHTML = `
            <img src="${vehicle.images[0]}" alt="${vehicle.fullName}"
                 onerror="this.src='../assets/images/placeholder-vehicle.jpg'">
            <span>${vehicle.brand} ${vehicle.model}</span>
            <button class="remove-compare" onclick="toggleCompare('${vehicleId}')" title="Quitar de comparación">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        elements.compareItems.appendChild(compareItem);
    });
}

function clearCompareList() {
    compareList = [];
    updateCompareUI();
    trackEvent('Compare', 'Clear All');
}

function loadMoreVehicles() {
    if (isLoading) return;
    
    showLoading(true);
    currentPage++;
    
    setTimeout(() => {
        updateResultsDisplay();
        showLoading(false);
        trackEvent('Pagination', 'Load More', currentPage);
    }, 500);
}

// === MODAL MANAGEMENT ===
function initializeModals() {
    // Close modals when clicking overlay
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-overlay')) {
            closeAllModals();
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });
}

function openVehicleModal(vehicleId) {
    const vehicle = vehiclesData.find(v => v.id === vehicleId);
    if (!vehicle || !elements.vehicleModal) return;
    
    // Update modal content
    const modalContent = elements.vehicleModal.querySelector('.modal-body');
    modalContent.innerHTML = createVehicleDetailContent(vehicle);
    
    // Update modal title
    const modalTitle = elements.vehicleModal.querySelector('#modal-vehicle-title');
    if (modalTitle) {
        modalTitle.textContent = vehicle.fullName;
    }
    
    // Show modal
    elements.vehicleModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize image gallery
    initializeImageGallery(vehicle);
    
    trackEvent('Vehicle', 'View Detail', vehicle.fullName);
}

function createVehicleDetailContent(vehicle) {
    const priceFormatted = formatCurrency(vehicle.price);
    const kmFormatted = formatNumber(vehicle.kilometers);
    
    return `
        <div class="vehicle-detail-header">
            <div class="vehicle-detail-images">
                <img src="${vehicle.images[0]}" alt="${vehicle.fullName}" class="vehicle-main-image" id="main-image"
                     onerror="this.src='../assets/images/placeholder-vehicle.jpg'">
                <div class="vehicle-thumbnails">
                    ${vehicle.images.map((img, index) => `
                        <img src="${img}" alt="${vehicle.fullName} ${index + 1}" 
                             class="vehicle-thumbnail ${index === 0 ? 'active' : ''}"
                             onclick="changeMainImage('${img}', this)"
                             onerror="this.src='../assets/images/placeholder-vehicle.jpg'">
                    `).join('')}
                </div>
            </div>
            <div class="vehicle-detail-info">
                <h3>${vehicle.fullName}</h3>
                <div class="vehicle-price">${priceFormatted}</div>
                <p class="price-note">*Precio sujeto a financiación disponible</p>
                
                <div class="vehicle-detail-specs">
                    <div class="vehicle-detail-spec">
                        <span class="spec-label">Año:</span>
                        <span class="spec-value">${vehicle.year}</span>
                    </div>
                    <div class="vehicle-detail-spec">
                        <span class="spec-label">Kilometraje:</span>
                        <span class="spec-value">${kmFormatted} km</span>
                    </div>
                    <div class="vehicle-detail-spec">
                        <span class="spec-label">Potencia:</span>
                        <span class="spec-value">${vehicle.power} HP</span>
                    </div>
                    <div class="vehicle-detail-spec">
                        <span class="spec-label">Transmisión:</span>
                        <span class="spec-value">${vehicle.transmission}</span>
                    </div>
                    <div class="vehicle-detail-spec">
                        <span class="spec-label">Norma Euro:</span>
                        <span class="spec-value">${vehicle.euroStandard}</span>
                    </div>
                    <div class="vehicle-detail-spec">
                        <span class="spec-label">Configuración:</span>
                        <span class="spec-value">${vehicle.axleConfig}</span>
                    </div>
                    <div class="vehicle-detail-spec">
                        <span class="spec-label">Carrocería:</span>
                        <span class="spec-value">${vehicle.bodyType}</span>
                    </div>
                    <div class="vehicle-detail-spec">
                        <span class="spec-label">Estado:</span>
                        <span class="spec-value">${vehicle.status}</span>
                    </div>
                </div>
                
                <div class="vehicle-actions-detail">
                    <a href="https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hola! Me interesa el ${vehicle.fullName} (${vehicle.year}). ¿Podrían brindarme más información?`)}" 
                       class="contact-whatsapp" target="_blank">
                        <i class="fab fa-whatsapp"></i>
                        WhatsApp
                    </a>
                    <a href="tel:${CONFIG.phoneNumber}" class="contact-phone">
                        <i class="fas fa-phone"></i>
                        Llamar
                    </a>
                    <button class="cta-button-outline" onclick="toggleCompare('${vehicle.id}')">
                        <i class="fas fa-balance-scale"></i>
                        ${compareList.includes(vehicle.id) ? 'Quitar de' : 'Agregar a'} comparación
                    </button>
                </div>
            </div>
        </div>
        
        <div class="vehicle-description">
            <h4>Descripción</h4>
            <p>${vehicle.description}</p>
            
            <h4>Características destacadas</h4>
            <ul>
                ${vehicle.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        </div>
    `;
}

function initializeImageGallery(vehicle) {
    const thumbnails = document.querySelectorAll('.vehicle-thumbnail');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function changeMainImage(imageSrc, thumbnail) {
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.vehicle-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbnail.classList.add('active');
}

function openCompareModal() {
    if (compareList.length < 2) return;
    
    const compareModal = elements.compareModal;
    if (!compareModal) return;
    
    // Generate comparison table
    const compareTable = generateCompareTable();
    const tableContainer = compareModal.querySelector('.compare-table-container');
    if (tableContainer) {
        tableContainer.innerHTML = compareTable;
    }
    
    // Show modal
    compareModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    trackEvent('Compare', 'Open Modal', compareList.length);
}

function generateCompareTable() {
    const compareVehicles = compareList.map(id => vehiclesData.find(v => v.id === id)).filter(Boolean);
    
    if (compareVehicles.length === 0) return '<p>No hay vehículos para comparar</p>';
    
    const specs = [
        { key: 'brand', label: 'Marca' },
        { key: 'model', label: 'Modelo' },
        { key: 'year', label: 'Año', highlight: true },
        { key: 'kilometers', label: 'Kilometraje', format: 'number', highlight: true, inverse: true },
        { key: 'power', label: 'Potencia (HP)', highlight: true },
        { key: 'transmission', label: 'Transmisión' },
        { key: 'euroStandard', label: 'Norma Euro' },
        { key: 'axleConfig', label: 'Configuración' },
        { key: 'bodyType', label: 'Carrocería' },
        { key: 'price', label: 'Precio', format: 'currency', highlight: true, inverse: true }
    ];
    
    let tableHTML = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th>Especificación</th>
                    ${compareVehicles.map(vehicle => `
                        <th>
                            <div class="compare-vehicle-header">
                                <img src="${vehicle.images[0]}" alt="${vehicle.fullName}" class="compare-vehicle-image"
                                     onerror="this.src='../assets/images/placeholder-vehicle.jpg'">
                                <div class="compare-vehicle-title">${vehicle.fullName}</div>
                                <button class="compare-remove" onclick="toggleCompare('${vehicle.id}')">
                                    Quitar
                                </button>
                            </div>
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    specs.forEach(spec => {
        const values = compareVehicles.map(vehicle => {
            let value = vehicle[spec.key];
            if (spec.format === 'number') {
                value = formatNumber(value);
            } else if (spec.format === 'currency') {
                value = formatCurrency(value);
            }
            return { value, rawValue: vehicle[spec.key] };
        });
        
        // Highlight best/worst values
        if (spec.highlight && values.length > 1) {
            const rawValues = values.map(v => v.rawValue);
            const bestValue = spec.inverse ? Math.min(...rawValues) : Math.max(...rawValues);
            const worstValue = spec.inverse ? Math.max(...rawValues) : Math.min(...rawValues);
            
            values.forEach(v => {
                if (v.rawValue === bestValue && bestValue !== worstValue) {
                    v.class = 'spec-highlight-best';
                } else if (v.rawValue === worstValue && bestValue !== worstValue) {
                    v.class = 'spec-highlight-worst';
                }
            });
        }
        
        tableHTML += `
            <tr>
                <td><strong>${spec.label}</strong></td>
                ${values.map(v => `
                    <td class="${v.class || ''}">${v.value}</td>
                `).join('')}
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    return tableHTML;
}

function closeVehicleModal() {
    if (elements.vehicleModal) {
        elements.vehicleModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function closeCompareModal() {
    if (elements.compareModal) {
        elements.compareModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function closeAllModals() {
    closeVehicleModal();
    closeCompareModal();
}

// === MOBILE FEATURES ===
function initializeMobileFeatures() {
    // Add mobile filter toggle button
    addMobileFilterToggle();
    
    // Handle mobile sidebar
    initializeMobileSidebar();
    
    // Handle touch events for image gallery
    initializeTouchGestures();
}

function addMobileFilterToggle() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const toggleButton = document.createElement('button');
    toggleButton.className = 'mobile-filter-toggle';
    toggleButton.innerHTML = `
        <i class="fas fa-filter"></i>
        <span>Filtros</span>
    `;
    
    toggleButton.addEventListener('click', toggleMobileFilters);
    
    // Insert at the beginning of main content
    mainContent.insertBefore(toggleButton, mainContent.firstChild);
}

function toggleMobileFilters() {
    const sidebar = document.querySelector('.sidebar-filters');
    const overlay = getOrCreateFilterOverlay();
    const toggleBtn = document.querySelector('.mobile-filter-toggle');
    
    if (sidebar && overlay && toggleBtn) {
        const isActive = sidebar.classList.contains('active');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        toggleBtn.classList.toggle('active');
        
        if (!isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
}

function getOrCreateFilterOverlay() {
    let overlay = document.querySelector('.filter-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'filter-overlay';
        overlay.addEventListener('click', toggleMobileFilters);
        document.body.appendChild(overlay);
    }
    
    return overlay;
}

function initializeMobileSidebar() {
    // Close sidebar when filter is applied on mobile
    if (window.innerWidth <= 768) {
        const applyFilterAndClose = () => {
            setTimeout(toggleMobileFilters, 300);
        };
        
        elements.filterCheckboxes.forEach(checkbox => {
            const originalHandler = checkbox.onchange;
            checkbox.addEventListener('change', applyFilterAndClose);
        });
        
        elements.filterRadios.forEach(radio => {
            const originalHandler = radio.onchange;
            radio.addEventListener('change', applyFilterAndClose);
        });
    }
}

function initializeTouchGestures() {
    // Add swipe functionality for image gallery in modal
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Only handle horizontal swipes on image gallery
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            const mainImage = document.getElementById('main-image');
            if (mainImage && document.querySelector('.vehicle-modal.active')) {
                const thumbnails = document.querySelectorAll('.vehicle-thumbnail');
                const activeThumbnail = document.querySelector('.vehicle-thumbnail.active');
                
                if (activeThumbnail && thumbnails.length > 1) {
                    const currentIndex = Array.from(thumbnails).indexOf(activeThumbnail);
                    let nextIndex;
                    
                    if (diffX > 0 && currentIndex < thumbnails.length - 1) {
                        // Swipe left - next image
                        nextIndex = currentIndex + 1;
                    } else if (diffX < 0 && currentIndex > 0) {
                        // Swipe right - previous image
                        nextIndex = currentIndex - 1;
                    }
                    
                    if (nextIndex !== undefined) {
                        thumbnails[nextIndex].click();
                    }
                }
            }
        }
        
        startX = 0;
        startY = 0;
    });
}

// === CONTACT FUNCTIONS ===
function contactForCompared() {
    if (compareList.length === 0) return;
    
    const vehicles = compareList.map(id => {
        const vehicle = vehiclesData.find(v => v.id === id);
        return vehicle ? `${vehicle.fullName} (${vehicle.year})` : '';
    }).filter(Boolean);
    
    const message = `Hola! Me interesan los siguientes vehículos:\n${vehicles.map(v => `• ${v}`).join('\n')}\n\n¿Podrían brindarme más información y disponibilidad?`;
    
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    trackEvent('Contact', 'Compare WhatsApp', vehicles.length);
}

function toggleFavorite(vehicleId) {
    // This is just for UI feedback, actual favorites would be stored in backend
    const favoriteBtn = document.querySelector(`[data-vehicle-id="${vehicleId}"] .vehicle-favorite`);
    if (favoriteBtn) {
        favoriteBtn.classList.toggle('active');
        const isActive = favoriteBtn.classList.contains('active');
        
        showNotification(
            isActive ? 'Agregado a favoritos' : 'Removido de favoritos',
            'success'
        );
        
        trackEvent('Favorite', isActive ? 'Add' : 'Remove', vehicleId);
    }
}

// === UTILITY FUNCTIONS ===
function formatNumber(num) {
    return new Intl.NumberFormat('es-AR').format(num);
}

function formatCurrency(amount) {
    // For Argentina, we'll show it as USD (common for vehicle prices)
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// === NOTIFICATIONS ===
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-close after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification.querySelector('.notification-close'));
        }
    }, 4000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
}

// === ANALYTICS ===
function trackEvent(category, action, label) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            custom_parameter_1: 'Unidades_Disponibles'
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'CustomEvent', {
            event_category: category,
            event_action: action,
            event_label: label
        });
    }
    
    // Console log for development
    console.log(`📊 Event: ${category} - ${action} - ${label}`);
}

// === GLOBAL FUNCTIONS FOR HTML ===
window.toggleCompare = toggleCompare;
window.toggleFavorite = toggleFavorite;
window.changeMainImage = changeMainImage;
window.closeVehicleModal = closeVehicleModal;
window.closeCompareModal = closeCompareModal;
window.contactForCompared = contactForCompared;
window.closeNotification = closeNotification;

// === ERROR HANDLING ===
window.addEventListener('error', function(e) {
    console.error('❌ Error en Unidades Disponibles:', e.error);
    trackEvent('Error', 'JavaScript Error', e.error?.message || 'Unknown error');
});

// === PERFORMANCE MONITORING ===
window.addEventListener('load', function() {
    // Monitor page load performance
    const loadTime = performance.now();
    console.log(`⚡ Página cargada en ${Math.round(loadTime)}ms`);
    trackEvent('Performance', 'Page Load', Math.round(loadTime));
});

// === RESPONSIVE HANDLING ===
window.addEventListener('resize', debounce(function() {
    // Handle window resize events
    const isMobile = window.innerWidth <= 768;
    
    // Close mobile sidebar if switching to desktop
    if (!isMobile) {
        const sidebar = document.querySelector('.sidebar-filters');
        const overlay = document.querySelector('.filter-overlay');
        const toggleBtn = document.querySelector('.mobile-filter-toggle');
        
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (toggleBtn) toggleBtn.classList.remove('active');
        
        document.body.style.overflow = 'auto';
    }
}, 250));

// === KEYBOARD SHORTCUTS ===
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + F to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        if (elements.filterSearch) {
            elements.filterSearch.focus();
        }
    }
    
    // Escape to clear search
    if (event.key === 'Escape' && elements.filterSearch === document.activeElement) {
        clearSearch();
        elements.filterSearch.blur();
    }
});

// === LAZY LOADING ENHANCEMENT ===
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        // Observe lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// === OFFLINE HANDLING ===
window.addEventListener('online', function() {
    showNotification('Conexión restaurada. Actualizando datos...', 'success');
    if (vehiclesData.length === 0) {
        loadVehiclesData();
    }
});

window.addEventListener('offline', function() {
    showNotification('Sin conexión a internet. Mostrando datos almacenados.', 'warning');
});

console.log('🚛 Unidades Disponibles JavaScript cargado correctamente');