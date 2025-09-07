// ===== UNIDADES DISPONIBLES CON API - VERSIÓN CORREGIDA =====
// scripts/unidadesDisponibles-api.js

// ===== VERIFICAR QUE NO HAY CONFLICTOS =====
if (window.unidadesAPILoaded) {
    console.log('⚠️ unidadesDisponibles-api.js ya está cargado');
    return;
}
window.unidadesAPILoaded = true;

// Variables globales - PREFIJO PARA EVITAR CONFLICTOS
let apiVehiclesData = [];
let apiFilteredVehicles = [];
let apiCurrentFilters = {};
let apiCurrentPage = 1;
let apiVehiclesPerPage = 24;
let apiIsLoading = false;
let apiCurrentSort = 'relevance';
let apiTotalVehiclesCount = 0;

// API Client - Verificar que existe
if (!window.apiClient) {
    console.error('❌ APIClient no está disponible. Asegúrate de cargar api.js primero.');
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚛 Iniciando Unidades Disponibles con API (CORREGIDO)...');
    
    // Verificar elementos DOM
    if (!document.getElementById('vehicles-grid')) {
        console.error('❌ No se encontró #vehicles-grid');
        return;
    }
    
    // Inicializar componentes
    initializeAPIFilters();
    initializeAPICategories();
    initializeAPISorting();
    initializeAPIRangeSliders();
    initializeAPIMobileFeatures();
    
    // Cargar datos desde API
    loadVehiclesFromAPI();
    
    // Verificar filtros desde URL
    checkAPIURLFilters();
    
    console.log('✅ Unidades Disponibles API inicializado correctamente');
});

// Cargar vehículos desde la API
async function loadVehiclesFromAPI() {
    try {
        console.log('🔄 Cargando vehículos desde API...');
        showAPILoading(true);
        
        // Verificar que apiClient existe
        if (!window.apiClient) {
            throw new Error('APIClient no disponible');
        }
        
        // Obtener vehículos desde la API
        const response = await apiClient.getVehicles({
            skip: 0,
            limit: 1000, // Cargar todos para filtrado local
            ...apiCurrentFilters
        });
        
        if (response && response.vehicles) {
            apiVehiclesData = response.vehicles;
            apiTotalVehiclesCount = response.total || response.vehicles.length;
            
            console.log(`✅ ${apiVehiclesData.length} vehículos cargados desde API`);
            
            // Aplicar filtros iniciales
            applyAPIFilters();
            
        } else {
            throw new Error('Respuesta inválida de la API');
        }
        
    } catch (error) {
        console.error('❌ Error cargando vehículos desde API:', error);
        
        // Mostrar error al usuario
        showAPIErrorState(
            document.getElementById('vehicles-grid'),
            'Error al cargar vehículos. Verifica tu conexión e intenta nuevamente.'
        );
        
        // Intentar cargar datos de fallback si están disponibles
        loadAPIFallbackData();
        
    } finally {
        showAPILoading(false);
    }
}

// Verificar filtros desde URL
function checkAPIURLFilters() {
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
        apiCurrentFilters.type = [category];
    }
    
    // Verificar otros filtros desde URL
    const search = urlParams.get('search');
    if (search) {
        apiCurrentFilters.search = search;
        const searchInput = document.getElementById('filter-search');
        if (searchInput) {
            searchInput.value = search;
        }
    }
}

// Aplicar filtros
function applyAPIFilters() {
    console.log('🔍 Aplicando filtros:', apiCurrentFilters);
    showAPILoading(true);
    
    setTimeout(() => {
        apiFilteredVehicles = apiVehiclesData.filter(vehicle => {
            // Filtro de búsqueda
            if (apiCurrentFilters.search) {
                const searchTerm = apiCurrentFilters.search.toLowerCase();
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
            
            // Otros filtros...
            if (apiCurrentFilters.tipo && apiCurrentFilters.tipo.length > 0) {
                if (!apiCurrentFilters.tipo.includes(vehicle.type)) {
                    return false;
                }
            }
            
            return true;
        });
        
        applyAPISorting();
        apiCurrentPage = 1;
        updateAPIResultsDisplay();
        showAPILoading(false);
        
        console.log(`✅ Filtros aplicados: ${apiFilteredVehicles.length} vehículos encontrados`);
        
    }, 300);
}

// Aplicar ordenamiento
function applyAPISorting() {
    apiFilteredVehicles.sort((a, b) => {
        switch (apiCurrentSort) {
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
function updateAPIResultsDisplay() {
    const vehiclesGrid = document.getElementById('vehicles-grid');
    const totalVehiclesElement = document.getElementById('total-vehicles');
    
    if (!vehiclesGrid) {
        console.error('❌ No se encontró #vehicles-grid');
        return;
    }
    
    const totalCount = apiFilteredVehicles.length;
    const showingCount = Math.min(apiCurrentPage * apiVehiclesPerPage, totalCount);
    
    // Actualizar contador
    if (totalVehiclesElement) {
        totalVehiclesElement.textContent = totalCount;
    }
    
    // Mostrar vehículos o estado vacío
    if (totalCount === 0) {
        showAPIEmptyState(vehiclesGrid, 'No se encontraron vehículos con los filtros seleccionados');
    } else {
        renderAPIVehicles();
    }
}

// Renderizar vehículos
function renderAPIVehicles() {
    const vehiclesGrid = document.getElementById('vehicles-grid');
    if (!vehiclesGrid) return;
    
    const startIndex = 0;
    const endIndex = apiCurrentPage * apiVehiclesPerPage;
    const vehiclesToShow = apiFilteredVehicles.slice(startIndex, endIndex);
    
    // Limpiar grid
    vehiclesGrid.innerHTML = '';
    
    // Crear tarjetas de vehículos
    vehiclesToShow.forEach((vehicle, index) => {
        const vehicleCard = createAPIVehicleCardElement(vehicle);
        if (vehicleCard) {
            vehicleCard.style.animationDelay = `${index * 0.05}s`;
            vehiclesGrid.appendChild(vehicleCard);
        }
    });
    
    // Agregar event listeners
    addAPIVehicleCardListeners();
    
    console.log(`🎨 ${vehiclesToShow.length} vehículos renderizados`);
}

// Crear elemento de tarjeta de vehículo - ARREGLADO
function createAPIVehicleCardElement(vehicle) {
    if (!vehicle) return null;
    
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.dataset.vehicleId = vehicle.id;
    card.dataset.vehicleData = JSON.stringify(vehicle);
    
    // Usar apiClient si está disponible, sino placeholder
    let imageUrl = '../assets/imagenes/placeholder-vehicle.jpg';
    if (window.apiClient && vehicle.images && vehicle.images[0]) {
        imageUrl = apiClient.getImageUrl(vehicle.images[0]);
    }
    
    const statusClass = vehicle.status?.toLowerCase() === 'disponible' ? 'available' : 'reserved';
    
    // ARREGLAR ICONOS - usar texto en lugar de imágenes faltantes
    card.innerHTML = `
        <div class="vehicle-image">
            <img src="${imageUrl}" 
                 alt="${vehicle.full_name || vehicle.fullName}" 
                 loading="lazy"
                 onerror="this.src='../assets/imagenes/placeholder-vehicle.jpg'">
            <div class="vehicle-status ${statusClass}">
                ${vehicle.status || 'Disponible'}
            </div>
        </div>
        <div class="vehicle-content">
            <h3 class="vehicle-title">${vehicle.full_name || vehicle.fullName}</h3>
            <p class="vehicle-subtitle">${vehicle.description || vehicle.type_name || vehicle.typeName || ''}</p>
            <div class="vehicle-specs">
                <div class="vehicle-spec">
                    <span class="vehicle-spec-icon">📅</span>
                    <span class="vehicle-spec-value">${vehicle.year}</span>
                </div>
                <div class="vehicle-spec">
                    <span class="vehicle-spec-icon">🛣️</span>
                    <span class="vehicle-spec-value">${formatAPINumber(vehicle.kilometers)} km</span>
                </div>
                <div class="vehicle-spec">
                    <span class="vehicle-spec-icon">⚙️</span>
                    <span class="vehicle-spec-value">${vehicle.transmission || 'Manual'}</span>
                </div>
                <div class="vehicle-spec">
                    <span class="vehicle-spec-icon">🔋</span>
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
function initializeAPIFilters() {
    console.log('🔧 Inicializando filtros API...');
    // Implementación básica - expandir según necesites
}

function initializeAPICategories() {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            categoryItems.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            applyAPIFilters();
        });
    });
}

function initializeAPISorting() {
    // Implementación básica del sorting
    console.log('🔧 Inicializando sorting API...');
}

function initializeAPIRangeSliders() {
    // Implementación básica de sliders
    console.log('🔧 Inicializando sliders API...');
}

function initializeAPIMobileFeatures() {
    // Implementación básica móvil
    console.log('🔧 Inicializando features móviles API...');
}

// Funciones de estado de carga
function showAPILoading(show) {
    const loadingState = document.getElementById('loading-state');
    const vehiclesGrid = document.getElementById('vehicles-grid');
    
    if (loadingState) {
        loadingState.style.display = show ? 'flex' : 'none';
    }
    
    if (vehiclesGrid) {
        vehiclesGrid.style.opacity = show ? '0.5' : '1';
    }
    
    apiIsLoading = show;
}

function showAPIEmptyState(container, message) {
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-truck"></i>
                </div>
                <h3>Sin vehículos</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

function showAPIErrorState(container, message) {
    if (container) {
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error al cargar vehículos</h3>
                <p>${message}</p>
                <button onclick="loadVehiclesFromAPI()" class="btn-retry">
                    <i class="fas fa-redo"></i>
                    Reintentar
                </button>
            </div>
        `;
    }
}

function loadAPIFallbackData() {
    console.log('📦 Cargando datos de fallback...');
    apiVehiclesData = [];
    applyAPIFilters();
}

function addAPIVehicleCardListeners() {
    const cards = document.querySelectorAll('.vehicle-card:not([data-api-listeners-added])');
    
    cards.forEach(card => {
        card.setAttribute('data-api-listeners-added', 'true');
        
        card.addEventListener('click', function() {
            const vehicleData = JSON.parse(this.dataset.vehicleData);
            sessionStorage.setItem('currentVehicle', JSON.stringify(vehicleData));
            window.location.href = `detalleVehiculo.html?id=${vehicleData.id}`;
        });
    });
}

// Utilidades
function formatAPINumber(num) {
    if (!num) return '0';
    return new Intl.NumberFormat('es-AR').format(num);
}

// Debug
function debugAPIFilters() {
    console.log('=== DEBUG API FILTROS ===');
    console.log('Filtros actuales:', apiCurrentFilters);
    console.log('Vehículos totales:', apiVehiclesData.length);
    console.log('Vehículos filtrados:', apiFilteredVehicles.length);
}

// Exportar funciones globales para debug
window.debugAPIFilters = debugAPIFilters;
window.loadVehiclesFromAPI = loadVehiclesFromAPI;
window.applyAPIFilters = applyAPIFilters;

console.log('🚛 Unidades Disponibles API cargado correctamente - SIN CONFLICTOS');