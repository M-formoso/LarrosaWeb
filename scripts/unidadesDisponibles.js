// UNIDADES DISPONIBLES - JavaScript Actualizado

// Global Variables
let vehiclesData = [];
let filteredVehicles = [];
let currentFilters = {};
let currentPage = 1;
let vehiclesPerPage = 24;
let isLoading = false;
let currentSort = 'relevance';

// Configuration
const CONFIG = {
    apiDelay: 1000,
    whatsappNumber: '5493512345678',
    phoneNumber: '+5493512345678'
};

// DOM Elements
const elements = {
    categoryItems: document.querySelectorAll('.category-item'),
    filterSearch: document.getElementById('filter-search'),
    clearSearchBtn: document.querySelector('.clear-search-btn'),
    clearAllBtn: document.querySelector('.clear-all-btn'),
    saveSearchBtn: document.querySelector('.save-search-btn'),
    filterCheckboxes: document.querySelectorAll('input[type="checkbox"]'),
    rangeInputs: document.querySelectorAll('.range-input'),
    sliders: document.querySelectorAll('.slider'),
    vehiclesGrid: document.getElementById('vehicles-grid'),
    loadingState: document.getElementById('loading-state'),
    loadMoreBtn: document.getElementById('load-more-btn'),
    sortBtn: document.querySelector('.sort-btn'),
    sortMenu: document.querySelector('.sort-menu'),
    sortOptions: document.querySelectorAll('.sort-option'),
    totalVehicles: document.getElementById('total-vehicles')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚛 Iniciando Unidades Disponibles...');
    
    initializeFilters();
    initializeCategories();
    initializeSorting();
    initializeRangeSliders();
    initializeMobileFeatures();
    
    // Load initial data
    loadVehiclesData();
    
    console.log('✅ Unidades Disponibles inicializado correctamente');
});

// === DATA MANAGEMENT ===
function loadVehiclesData() {
    showLoading(true);
    
    setTimeout(() => {
        vehiclesData = generateSampleVehicles();
        applyFilters();
        showLoading(false);
        
        console.log(`📊 Cargados ${vehiclesData.length} vehículos`);
    }, CONFIG.apiDelay);
}

function generateSampleVehicles() {
    const brands = ['Scania', 'Volvo', 'Mercedes', 'Iveco', 'Volkswagen', 'Renault', 'Ford'];
    const types = ['camion-tractor', 'camion-chasis', 'remolques', 'utilitarios', 'varios'];
    const typeNames = {
        'camion-tractor': 'Camión Tractor',
        'camion-chasis': 'Camión Chasis', 
        'remolques': 'Remolques',
        'utilitarios': 'Utilitarios',
        'varios': 'Varios'
    };
    const tracciones = ['4x2', '6x2'];
    const transmissions = ['Manual', 'Automática'];
    
    const vehicles = [];
    
    for (let i = 1; i <= 583; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const year = 2015 + Math.floor(Math.random() * 10);
        const km = Math.floor(Math.random() * 800000) + 100000;
        const hp = 250 + Math.floor(Math.random() * 300);
        const traccion = tracciones[Math.floor(Math.random() * tracciones.length)];
        const transmission = transmissions[Math.floor(Math.random() * transmissions.length)];
        
        vehicles.push({
            id: `vehicle-${i}`,
            brand: brand,
            model: `Modelo ${Math.floor(Math.random() * 500) + 100}`,
            fullName: `${brand} ${typeNames[type]} ${Math.floor(Math.random() * 500) + 100}`,
            type: type,
            typeName: typeNames[type],
            year: year,
            kilometers: km,
            power: hp,
            traccion: traccion,
            transmission: transmission,
            status: Math.random() > 0.15 ? 'Disponible' : 'Reservado',
            price: Math.floor(Math.random() * 50000) + 25000,
            location: 'Villa María, Córdoba',
            images: [
                `../assets/imagenes/vehicle-${i}-1.jpg`,
                `../assets/imagenes/vehicle-${i}-2.jpg`,
                `../assets/imagenes/vehicle-${i}-3.jpg`
            ],
            description: `${brand} ${typeNames[type]} en excelente estado. Mantenimiento al día, documentación en regla.`,
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
    
    // Filter checkboxes
    elements.filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleFilterChange);
    });
    
    // Range inputs
    elements.rangeInputs.forEach(input => {
        input.addEventListener('blur', handleRangeFilter);
        input.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                handleRangeFilter(e);
            }
        });
    });
}

function initializeRangeSliders() {
    elements.sliders.forEach(slider => {
        slider.addEventListener('input', handleSliderChange);
    });
}

function handleSliderChange(event) {
    const slider = event.target;
    const value = slider.value;
    const sliderId = slider.id;
    
    if (sliderId === 'year-slider') {
        updateRangeInputs('year', value);
    } else if (sliderId === 'km-slider') {
        updateRangeInputs('km', value);
    }
    
    // Apply filters with debounce
    debounce(applyFilters, 300)();
}

function updateRangeInputs(type, value) {
    const minInput = document.getElementById(`${type}-min`);
    const maxInput = document.getElementById(`${type}-max`);
    
    if (type === 'year') {
        if (!minInput.value) minInput.value = 2015;
        if (!maxInput.value) maxInput.value = value;
    } else if (type === 'km') {
        if (!minInput.value) minInput.value = 0;
        if (!maxInput.value) maxInput.value = value;
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    currentFilters.search = searchTerm;
    
    if (elements.clearSearchBtn) {
        elements.clearSearchBtn.style.opacity = searchTerm ? '1' : '0';
    }
    
    applyFilters();
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
    }
    
    applyFilters();
}

function handleRangeFilter(event) {
    const input = event.target;
    const value = parseInt(input.value);
    const inputId = input.id;
    
    if (!value) return;
    
    if (inputId.includes('year')) {
        if (!currentFilters.year) currentFilters.year = {};
        if (inputId.includes('min')) {
            currentFilters.year.min = value;
        } else {
            currentFilters.year.max = value;
        }
    } else if (inputId.includes('km')) {
        if (!currentFilters.kilometers) currentFilters.kilometers = {};
        if (inputId.includes('min')) {
            currentFilters.kilometers.min = value;
        } else {
            currentFilters.kilometers.max = value;
        }
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
                const searchableText = `${vehicle.brand} ${vehicle.model} ${vehicle.typeName}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            // ✅ CORRECCIÓN AQUÍ - Category filter from nav
            const activeCategory = document.querySelector('.category-item.active');
            if (activeCategory && activeCategory.dataset.category !== 'all') {
                const selectedCategory = activeCategory.dataset.category;
                
                // Debug para verificar
                console.log('Categoría activa:', selectedCategory);
                console.log('Tipo de vehículo:', vehicle.type);
                
                if (vehicle.type !== selectedCategory) {
                    return false;
                }
            }
            
            // Resto de filtros...
            if (currentFilters.tipo && currentFilters.tipo.length > 0) {
                if (!currentFilters.tipo.includes(vehicle.type)) {
                    return false;
                }
            }
            
            if (currentFilters.traccion && currentFilters.traccion.length > 0) {
                if (!currentFilters.traccion.includes(vehicle.traccion)) {
                    return false;
                }
            }
            
            if (currentFilters.marca && currentFilters.marca.length > 0) {
                if (!currentFilters.marca.includes(vehicle.brand.toLowerCase())) {
                    return false;
                }
            }
            
            if (currentFilters.transmision && currentFilters.transmision.length > 0) {
                const transmissionMap = { 'manual': 'Manual', 'automatica': 'Automática' };
                const hasMatchingTransmission = currentFilters.transmision.some(filter => 
                    transmissionMap[filter] === vehicle.transmission
                );
                if (!hasMatchingTransmission) {
                    return false;
                }
            }
            
            if (currentFilters.year) {
                if (currentFilters.year.min && vehicle.year < currentFilters.year.min) {
                    return false;
                }
                if (currentFilters.year.max && vehicle.year > currentFilters.year.max) {
                    return false;
                }
            }
            
            if (currentFilters.kilometers) {
                if (currentFilters.kilometers.min && vehicle.kilometers < currentFilters.kilometers.min) {
                    return false;
                }
                if (currentFilters.kilometers.max && vehicle.kilometers > currentFilters.kilometers.max) {
                    return false;
                }
            }
            
            return true;
        });
        
        applySorting();
        currentPage = 1;
        updateResultsDisplay();
        showLoading(false);
        
        console.log('Vehículos filtrados:', filteredVehicles.length);
        
    }, 300);
}
function clearAllFilters() {
    currentFilters = {};
    
    // Clear search input
    if (elements.filterSearch) {
        elements.filterSearch.value = '';
    }
    
    // Clear all checkboxes
    elements.filterCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear range inputs
    elements.rangeInputs.forEach(input => {
        input.value = '';
    });
    
    // Reset sliders
    elements.sliders.forEach(slider => {
        if (slider.id === 'year-slider') {
            slider.value = 2015;
        } else if (slider.id === 'km-slider') {
            slider.value = 500000;
        }
    });
    
    // Reset to "all" category
    elements.categoryItems.forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('[data-category="all"]')?.classList.add('active');
    
    applyFilters();
}

function saveSearch() {
    const searchData = {
        filters: currentFilters,
        timestamp: new Date().toISOString(),
        resultsCount: filteredVehicles.length
    };
    
    showNotification('Búsqueda guardada correctamente', 'success');
}

// === CATEGORY MANAGEMENT ===
function initializeCategories() {
    elements.categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            elements.categoryItems.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            applyFilters();
        });
    });
}

// === SORTING MANAGEMENT ===
function initializeSorting() {
    if (elements.sortBtn) {
        elements.sortBtn.addEventListener('click', function() {
            if (elements.sortMenu) {
                const isVisible = elements.sortMenu.style.opacity === '1';
                elements.sortMenu.style.opacity = isVisible ? '0' : '1';
                elements.sortMenu.style.visibility = isVisible ? 'hidden' : 'visible';
            }
        });
    }
    
    elements.sortOptions.forEach(option => {
        option.addEventListener('click', function() {
            elements.sortOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            currentSort = this.dataset.sort;
            
            if (elements.sortBtn) {
                elements.sortBtn.querySelector('span').textContent = this.textContent;
            }
            
            if (elements.sortMenu) {
                elements.sortMenu.style.opacity = '0';
                elements.sortMenu.style.visibility = 'hidden';
            }
            
            applySorting();
            updateResultsDisplay();
        });
    });
    
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
                return b.dateAdded - a.dateAdded;
        }
    });
}

// === DISPLAY MANAGEMENT ===
function updateResultsDisplay() {
    if (!elements.vehiclesGrid) return;
    
    const totalCount = filteredVehicles.length;
    const showingCount = Math.min(currentPage * vehiclesPerPage, totalCount);
    
    if (elements.totalVehicles) {
        elements.totalVehicles.textContent = totalCount;
    }
    
    if (totalCount === 0) {
        elements.vehiclesGrid.innerHTML = '<div class="no-results"><h3>No se encontraron vehículos</h3><p>Intenta ajustar los filtros de búsqueda</p></div>';
        if (elements.loadMoreBtn) elements.loadMoreBtn.style.display = 'none';
    } else {
        renderVehicles();
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
    
    card.innerHTML = `
        <div class="vehicle-image">
            <img src="${vehicle.images[0]}" alt="${vehicle.fullName}" loading="lazy"
                 onerror="this.src='../assets/imagenes/placeholder-vehicle.jpg'">
            <div class="vehicle-status ${statusClass}">${vehicle.status}</div>
        </div>
        <div class="vehicle-content">
            <h3 class="vehicle-title">${vehicle.fullName}</h3>
            <p class="vehicle-subtitle">${vehicle.description}</p>
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
                <span>🇦🇷</span>
                <span>${vehicle.location}</span>
            </div>
        </div>
    `;
    
    // Add click event to redirect to detail page
    card.addEventListener('click', function() {
        redirectToDetailPage(vehicle);
    });
    
    return card;
}

function redirectToDetailPage(vehicle) {
    // Store vehicle data in sessionStorage for the detail page
    sessionStorage.setItem('currentVehicle', JSON.stringify(vehicle));
    
    // Redirect to detail page
    window.location.href = `detalleVehiculo.html?id=${vehicle.id}`;
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

function loadMoreVehicles() {
    if (isLoading) return;
    
    showLoading(true);
    currentPage++;
    
    setTimeout(() => {
        updateResultsDisplay();
        showLoading(false);
    }, 500);
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

// === MOBILE FEATURES ===
function initializeMobileFeatures() {
    addMobileFilterToggle();
    
    if (window.innerWidth <= 768) {
        initializeMobileSidebar();
    }
}

function addMobileFilterToggle() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent || window.innerWidth > 768) return;
    
    const toggleButton = document.createElement('button');
    toggleButton.className = 'mobile-filter-toggle';
    toggleButton.innerHTML = `
        <i class="fas fa-filter"></i>
        <span>Filtros</span>
    `;
    
    toggleButton.addEventListener('click', toggleMobileFilters);
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
        
        document.body.style.overflow = isActive ? 'auto' : 'hidden';
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
    const applyFilterAndClose = () => {
        setTimeout(toggleMobileFilters, 300);
    };
    
    elements.filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilterAndClose);
    });
}

// === EVENT LISTENERS ===
if (elements.loadMoreBtn) {
    elements.loadMoreBtn.addEventListener('click', loadMoreVehicles);
}

// === NOTIFICATIONS ===
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'info' ? '#3D5FAC' : '#28a745'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// === UTILITY FUNCTIONS ===
function formatNumber(num) {
    return new Intl.NumberFormat('es-AR').format(num);
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

// === RESPONSIVE HANDLING ===
window.addEventListener('resize', debounce(function() {
    const isMobile = window.innerWidth <= 768;
    
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

console.log('🚛 Unidades Disponibles JavaScript cargado correctamente');

function debugCategoryFilter() {
    console.log('=== DEBUG CATEGORY FILTER ===');
    const activeCategory = document.querySelector('.category-item.active');
    console.log('Categoría activa:', activeCategory ? activeCategory.dataset.category : 'ninguna');
    
    const uniqueTypes = [...new Set(vehiclesData.map(v => v.type))];
    console.log('Tipos únicos en datos:', uniqueTypes);
    
    console.log('Primeros 5 vehículos:', vehiclesData.slice(0, 5).map(v => ({
        type: v.type,
        typeName: v.typeName,
        brand: v.brand
    })));
}
