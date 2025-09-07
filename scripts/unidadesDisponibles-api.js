// ===== UNIDADES DISPONIBLES CON API =====
// scripts/unidadesDisponibles-api.js

// Variables globales
let vehiclesData = [];
let filteredVehicles = [];
let currentFilters = {};
let currentPage = 1;
let vehiclesPerPage = 24;
let isLoading = false;
let currentSort = 'relevance';
let totalVehiclesCount = 0;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚛 Iniciando Unidades Disponibles con API...');
    
    // Inicializar componentes
    initializeFilters();
    initializeCategories();
    initializeSorting();
    initializeRangeSliders();
    initializeMobileFeatures();
    
    // Cargar datos desde API
    loadVehiclesFromAPI();
    
    // Verificar filtros desde URL
    checkURLFilters();
    
    console.log('✅ Unidades Disponibles inicializado correctamente');
});

// Cargar vehículos desde la API
async function loadVehiclesFromAPI() {
    try {
        console.log('🔄 Cargando vehículos desde API...');
        showLoading(true);
        
        // Obtener vehículos desde la API
        const response = await apiClient.getVehicles({
            skip: 0,
            limit: 1000, // Cargar todos para filtrado local
            ...currentFilters
        });
        
        if (response && response.vehicles) {
            vehiclesData = response.vehicles;
            totalVehiclesCount = response.total || response.vehicles.length;
            
            console.log(`✅ ${vehiclesData.length} vehículos cargados desde API`);
            
            // Aplicar filtros iniciales
            applyFilters();
            
        } else {
            throw new Error('Respuesta inválida de la API');
        }
        
    } catch (error) {
        console.error('❌ Error cargando vehículos desde API:', error);
        
        // Mostrar error al usuario
        showErrorState(
            document.getElementById('vehicles-grid'),
            'Error al cargar vehículos. Verifica tu conexión e intenta nuevamente.'
        );
        
        // Intentar cargar datos de fallback si están disponibles
        loadFallbackData();
        
    } finally {
        showLoading(false);
    }
}

// Cargar datos de fallback en caso de error
function loadFallbackData() {
    console.log('📦 Cargando datos de fallback...');
    
    // Mostrar mensaje de modo offline
    showNotification(
        'Modo offline: Mostrando datos limitados',
        'warning',
        5000
    );
    
    // Aquí podrías cargar algunos datos estáticos si los tienes
    vehiclesData = [];
    applyFilters();
}

// Verificar filtros desde URL
function checkURLFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Verificar si hay filtro de categoría
    const category = urlParams.get('category');
    if (category && category !== 'all') {
        console.log(`🏷️ Filtro de categoría desde URL: ${category}`);
        
        // Activar categoría correspondiente
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.category === category) {
                item.classList.add('active');
            }
        });
        
        // Aplicar filtro
        currentFilters.type = [category];
    }
    
    // Verificar otros filtros desde URL
    const search = urlParams.get('search');
    if (search) {
        currentFilters.search = search;
        const searchInput = document.getElementById('filter-search');
        if (searchInput) {
            searchInput.value = search;
        }
    }
}

// Aplicar filtros
function applyFilters() {
    console.log('🔍 Aplicando filtros:', currentFilters);
    showLoading(true);
    
    setTimeout(() => {
        filteredVehicles = vehiclesData.filter(vehicle => {
            // Filtro de búsqueda
            if (currentFilters.search) {
                const searchTerm = currentFilters.search.toLowerCase();
                const searchableText = `${vehicle.brand} ${vehicle.model} ${vehicle.full_name || vehicle.fullName} ${vehicle.type_name || vehicle.typeName}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            // Filtro de categoría activa
            const activeCategory = document.querySelector('.category-item.active');
            if (activeCategory && activeCategory.dataset.category !== 'all') {
                const selectedCategory = activeCategory.dataset.category;
                if (vehicle.type !== selectedCategory) {
                    return false;
                }
            }
            
            // Filtros de tipo (checkboxes)
            if (currentFilters.tipo && currentFilters.tipo.length > 0) {
                if (!currentFilters.tipo.includes(vehicle.type)) {
                    return false;
                }
            }
            
            // Filtros de tracción
            if (currentFilters.traccion && currentFilters.traccion.length > 0) {
                if (!currentFilters.traccion.includes(vehicle.traccion)) {
                    return false;
                }
            }
            
            // Filtros de marca
            if (currentFilters.marca && currentFilters.marca.length > 0) {
                const vehicleBrand = vehicle.brand.toLowerCase();
                if (!currentFilters.marca.some(brand => vehicleBrand.includes(brand))) {
                    return false;
                }
            }
            
            // Filtros de transmisión
            if (currentFilters.transmision && currentFilters.transmision.length > 0) {
                const transmissionMap = { 'manual': 'Manual', 'automatica': 'Automática' };
                const hasMatchingTransmission = currentFilters.transmision.some(filter => 
                    transmissionMap[filter] === vehicle.transmission
                );
                if (!hasMatchingTransmission) {
                    return false;
                }
            }
            
            // Filtros de año
            if (currentFilters.year) {
                if (currentFilters.year.min && vehicle.year < currentFilters.year.min) {
                    return false;
                }
                if (currentFilters.year.max && vehicle.year > currentFilters.year.max) {
                    return false;
                }
            }
            
            // Filtros de kilómetros
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
        
        console.log(`✅ Filtros aplicados: ${filteredVehicles.length} vehículos encontrados`);
        
    }, 300);
}

// Aplicar ordenamiento
function applySorting() {
    filteredVehicles.sort((a, b) => {
        switch (currentSort) {
            case 'price-asc':
                return (a.price || 0) - (b.price || 0);
            case 'price-desc':
                return (b.price || 0) - (a.price || 0);
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
                // Ordenar por featured primero, luego por fecha
                if (a.is_featured && !b.is_featured) return -1;
                if (!a.is_featured && b.is_featured) return 1;
                return new Date(b.created_at || b.date_added || 0) - new Date(a.created_at || a.date_added || 0);
        }
    });
}

// Actualizar visualización de resultados
function updateResultsDisplay() {
    const vehiclesGrid = document.getElementById('vehicles-grid');
    const totalVehiclesElement = document.getElementById('total-vehicles');
    
    if (!vehiclesGrid) return;
    
    const totalCount = filteredVehicles.length;
    const showingCount = Math.min(currentPage * vehiclesPerPage, totalCount);
    
    // Actualizar contador
    if (totalVehiclesElement) {
        totalVehiclesElement.textContent = totalCount;
    }
    
    // Mostrar vehículos o estado vacío
    if (totalCount === 0) {
        showEmptyState(vehiclesGrid, 'No se encontraron vehículos con los filtros seleccionados');
        hideLoadMoreButton();
    } else {
        renderVehicles();
        updateLoadMoreButton();
    }
}

// Renderizar vehículos
function renderVehicles() {
    const vehiclesGrid = document.getElementById('vehicles-grid');
    if (!vehiclesGrid) return;
    
    const startIndex = 0;
    const endIndex = currentPage * vehiclesPerPage;
    const vehiclesToShow = filteredVehicles.slice(startIndex, endIndex);
    
    // Limpiar grid
    vehiclesGrid.innerHTML = '';
    
    // Crear tarjetas de vehículos
    vehiclesToShow.forEach((vehicle, index) => {
        const vehicleCard = createVehicleCardElement(vehicle);
        vehicleCard.style.animationDelay = `${index * 0.05}s`;
        vehiclesGrid.appendChild(vehicleCard);
    });
    
    // Agregar event listeners
    addVehicleCardListeners();
    
    // Animar entrada
    setTimeout(() => {
        const cards = vehiclesGrid.querySelectorAll('.vehicle-card');
        cards.forEach(card => {
            card.classList.add('fade-in', 'visible');
        });
    }, 100);
}

// Crear elemento de tarjeta de vehículo
function createVehicleCardElement(vehicle) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.dataset.vehicleId = vehicle.id;
    card.dataset.vehicleData = JSON.stringify(vehicle);
    
    const imageUrl = apiClient.getImageUrl(vehicle.images?.[0] || '');
    const statusClass = vehicle.status?.toLowerCase() === 'disponible' ? 'available' : 'reserved';
    
    card.innerHTML = `
        <div class="vehicle-image">
            <img src="${imageUrl}" 
                 alt="${vehicle.full_name || vehicle.fullName}" 
                 loading="lazy"
                 onerror="apiClient.handleImageError(this)">
            <div class="vehicle-status ${statusClass}">
                ${vehicle.status || 'Disponible'}
            </div>
        </div>
        <div class="vehicle-content">
            <h3 class="vehicle-title">${vehicle.full_name || vehicle.fullName}</h3>
            <p class="vehicle-subtitle">${vehicle.description || vehicle.type_name || vehicle.typeName || ''}</p>
            <div class="vehicle-specs">
                <div class="vehicle-spec">
                    <span class="icon-calendar">📅</span>
                    <span class="vehicle-spec-value">${vehicle.year}</span>
                </div>
                <div class="vehicle-spec">
                    <span class="icon-road">🛣️</span>
                    <span class="vehicle-spec-value">${formatNumber(vehicle.kilometers)} km</span>
                </div>
                <div class="vehicle-spec">
                    <span class="icon-gear">⚙️</span>
                    <span class="vehicle-spec-value">${vehicle.transmission || 'Manual'}</span>
                </div>
                <div class="vehicle-spec">
                    <span class="icon-power">🔋</span>
                    <span class="vehicle-spec-value">${vehicle.power || 0} HP</span>
                </div>
            </div>
        </div>
        <div class="vehicle-footer">
            <div class="vehicle-location">
                <span>🇦🇷</span>
                <span>${vehicle.location || 'Villa María, Córdoba'}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Inicializar filtros
function initializeFilters() {
    const elements = {
        filterSearch: document.getElementById('filter-search'),
        clearSearchBtn: document.querySelector('.clear-search-btn'),
        clearAllBtn: document.querySelector('.clear-all-btn'),
        saveSearchBtn: document.querySelector('.save-search-btn'),
        filterCheckboxes: document.querySelectorAll('input[type="checkbox"]'),
        rangeInputs: document.querySelectorAll('.range-input')
    };
    
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

// Manejar búsqueda
function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    currentFilters.search = searchTerm;
    
    const clearSearchBtn = document.querySelector('.clear-search-btn');
    if (clearSearchBtn) {
        clearSearchBtn.style.opacity = searchTerm ? '1' : '0';
    }
    
    applyFilters();
}

// Limpiar búsqueda
function clearSearch() {
    const filterSearch = document.getElementById('filter-search');
    if (filterSearch) {
        filterSearch.value = '';
        delete currentFilters.search;
        applyFilters();
    }
}

// Manejar cambio de filtros
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

// Manejar filtros de rango
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

// Limpiar todos los filtros
function clearAllFilters() {
    currentFilters = {};
    
    // Limpiar input de búsqueda
    const filterSearch = document.getElementById('filter-search');
    if (filterSearch) {
        filterSearch.value = '';
    }
    
    // Limpiar checkboxes
    const filterCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Limpiar inputs de rango
    const rangeInputs = document.querySelectorAll('.range-input');
    rangeInputs.forEach(input => {
        input.value = '';
    });
    
    // Reset sliders
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        if (slider.id === 'year-slider') {
            slider.value = 2015;
        } else if (slider.id === 'km-slider') {
            slider.value = 500000;
        }
    });
    
    // Reset a categoría "all"
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('[data-category="all"]')?.classList.add('active');
    
    applyFilters();
}

// Guardar búsqueda
function saveSearch() {
    const searchData = {
        filters: currentFilters,
        timestamp: new Date().toISOString(),
        resultsCount: filteredVehicles.length
    };
    
    localStorage.setItem('savedVehicleSearch', JSON.stringify(searchData));
    showNotification('Búsqueda guardada correctamente', 'success');
}

// Inicializar categorías
function initializeCategories() {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            categoryItems.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            applyFilters();
            
            // Actualizar URL
            const category = this.dataset.category;
            if (category !== 'all') {
                const url = new URL(window.location);
                url.searchParams.set('category', category);
                window.history.pushState({}, '', url);
            } else {
                const url = new URL(window.location);
                url.searchParams.delete('category');
                window.history.pushState({}, '', url);
            }
        });
    });
}

// Inicializar ordenamiento
function initializeSorting() {
    const sortBtn = document.querySelector('.sort-btn');
    const sortMenu = document.querySelector('.sort-menu');
    const sortOptions = document.querySelectorAll('.sort-option');
    
    if (sortBtn && sortMenu) {
        sortBtn.addEventListener('click', function() {
            const isVisible = sortMenu.style.opacity === '1';
            sortMenu.style.opacity = isVisible ? '0' : '1';
            sortMenu.style.visibility = isVisible ? 'hidden' : 'visible';
        });
    }
    
    sortOptions.forEach(option => {
        option.addEventListener('click', function() {
            sortOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            currentSort = this.dataset.sort;
            
            if (sortBtn) {
                sortBtn.querySelector('span').textContent = this.textContent;
            }
            
            if (sortMenu) {
                sortMenu.style.opacity = '0';
                sortMenu.style.visibility = 'hidden';
            }
            
            applySorting();
            updateResultsDisplay();
        });
    });
    
    // Cerrar menú al hacer click fuera
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.sort-dropdown')) {
            if (sortMenu) {
                sortMenu.style.opacity = '0';
                sortMenu.style.visibility = 'hidden';
            }
        }
    });
}

// Inicializar sliders de rango
function initializeRangeSliders() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
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

// Cargar más vehículos
function loadMoreVehicles() {
    if (isLoading) return;
    
    showLoading(true);
    currentPage++;
    
    setTimeout(() => {
        updateResultsDisplay();
        showLoading(false);
    }, 500);
}

// Actualizar botón cargar más
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;
    
    const totalCount = filteredVehicles.length;
    const showingCount = currentPage * vehiclesPerPage;
    
    if (showingCount >= totalCount) {
        hideLoadMoreButton();
    } else {
        loadMoreBtn.style.display = 'inline-flex';
        const remainingCount = totalCount - showingCount;
        loadMoreBtn.querySelector('span').textContent = 
            `Cargar más vehículos (${remainingCount} restantes)`;
    }
}

function hideLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
}

// Funciones de estado de carga
function showLoading(show) {
    const loadingState = document.getElementById('loading-state');
    const vehiclesGrid = document.getElementById('vehicles-grid');
    
    if (loadingState) {
        loadingState.style.display = show ? 'flex' : 'none';
    }
    
    if (vehiclesGrid) {
        vehiclesGrid.style.opacity = show ? '0.5' : '1';
    }
    
    isLoading = show;
}

// Inicializar características móviles
function initializeMobileFeatures() {
    addMobileFilterToggle();
    
    if (window.innerWidth <= 768) {
        initializeMobileSidebar();
    }
}

function addMobileFilterToggle() {
    const existingToggle = document.querySelector('.mobile-filter-toggle');
    if (existingToggle || window.innerWidth > 768) return;
    
    const mainContent = document.querySelector('.main-content-full');
    if (!mainContent) return;
    
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
    const sidebar = document.querySelector('.sidebar-filters-full');
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
    
    const filterCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilterAndClose);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreVehicles);
    }
});

// Función utilitaria debounce
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

// Manejo responsive
window.addEventListener('resize', debounce(function() {
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) {
        const sidebar = document.querySelector('.sidebar-filters-full');
        const overlay = document.querySelector('.filter-overlay');
        const toggleBtn = document.querySelector('.mobile-filter-toggle');
        
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (toggleBtn) toggleBtn.classList.remove('active');
        
        document.body.style.overflow = 'auto';
    }
}, 250));

// Función de debug
function debugFilters() {
    console.log('=== DEBUG FILTROS ===');
    console.log('Filtros actuales:', currentFilters);
    console.log('Vehículos totales:', vehiclesData.length);
    console.log('Vehículos filtrados:', filteredVehicles.length);
    
    const activeCategory = document.querySelector('.category-item.active');
    console.log('Categoría activa:', activeCategory ? activeCategory.dataset.category : 'ninguna');
}

// Exportar funciones globales
window.debugFilters = debugFilters;
window.loadVehiclesFromAPI = loadVehiclesFromAPI;
window.applyFilters = applyFilters;

console.log('🚛 Unidades Disponibles API cargado correctamente');