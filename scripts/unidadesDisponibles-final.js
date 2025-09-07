// ===== UNIDADES DISPONIBLES - INTEGRACIÓN API COMPLETA =====
// Archivo: scripts/unidadesDisponibles-final.js

// ===== CONFIGURACIÓN GLOBAL =====
const API_CONFIG = {
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 10000,
    retries: 3
};

// ===== VARIABLES GLOBALES =====
let vehiclesData = [];
let filteredVehicles = [];
let currentFilters = {
    category: 'all',
    search: '',
    type: [],
    brand: [],
    yearMin: null,
    yearMax: null,
    kmMin: null,
    kmMax: null
};
let isLoading = false;
let currentPage = 1;
let vehiclesPerPage = 24;

// ===== CLASE PRINCIPAL =====
class UnidadesAPI {
    constructor() {
        this.init();
    }

    async init() {
        console.log('🚛 Iniciando Unidades Disponibles con API...');
        
        // Verificar conexión
        const connected = await this.testConnection();
        
        if (connected) {
            console.log('✅ Conectado a la API');
            await this.loadVehicles();
        } else {
            console.warn('⚠️ API no disponible, mostrando mensaje de error');
            this.showConnectionError();
        }
        
        // Inicializar componentes
        this.setupCategories();
        this.setupFilters();
        this.setupUI();
    }

    // ===== TEST DE CONEXIÓN =====
    async testConnection() {
        try {
            const response = await fetch(`${API_CONFIG.baseURL.replace('/api/v1', '')}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('🔗 Backend status:', data.status);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error de conexión:', error.message);
            return false;
        }
    }

    // ===== CARGAR VEHÍCULOS =====
    async loadVehicles() {
        try {
            this.showLoading(true);
            console.log('📦 Cargando vehículos desde API...');
            
            const response = await fetch(`${API_CONFIG.baseURL}/vehicles?limit=1000`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📊 Datos recibidos:', data);

            if (data.vehicles && Array.isArray(data.vehicles)) {
                vehiclesData = data.vehicles;
                filteredVehicles = [...vehiclesData];
                
                console.log(`✅ ${vehiclesData.length} vehículos cargados`);
                
                // Actualizar UI
                this.updateVehicleCount(vehiclesData.length);
                this.updateCategoryCounters();
                this.renderVehicles();
                
            } else {
                console.warn('⚠️ Estructura de datos inesperada:', data);
                this.showEmptyState('Estructura de datos inesperada');
            }

        } catch (error) {
            console.error('❌ Error cargando vehículos:', error);
            this.showError(`Error cargando vehículos: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    // ===== RENDERIZAR VEHÍCULOS =====
    renderVehicles() {
        const grid = document.getElementById('vehicles-grid');
        if (!grid) {
            console.error('❌ Grid de vehículos no encontrado');
            return;
        }

        console.log(`🎨 Renderizando ${filteredVehicles.length} vehículos...`);

        if (filteredVehicles.length === 0) {
            this.showEmptyState('No se encontraron vehículos con los filtros seleccionados');
            return;
        }

        // Limpiar grid
        grid.innerHTML = '';

        // Paginación
        const startIndex = 0;
        const endIndex = currentPage * vehiclesPerPage;
        const vehiclesToShow = filteredVehicles.slice(startIndex, endIndex);

        // Crear cards
        vehiclesToShow.forEach((vehicle, index) => {
            const card = this.createVehicleCard(vehicle);
            if (card) {
                card.style.animationDelay = `${index * 0.05}s`;
                card.classList.add('fade-in');
                grid.appendChild(card);
            }
        });

        console.log(`✅ ${vehiclesToShow.length} tarjetas renderizadas`);
    }

    // ===== CREAR TARJETA DE VEHÍCULO =====
    createVehicleCard(vehicle) {
        if (!vehicle) {
            console.warn('⚠️ Vehículo inválido:', vehicle);
            return null;
        }

        const card = document.createElement('div');
        card.className = 'vehicle-card';
        card.dataset.vehicleId = vehicle.id;
        card.dataset.vehicleData = JSON.stringify(vehicle);

        // Imagen del vehículo
        const imageUrl = this.getVehicleImageUrl(vehicle);
        
        // Estado del vehículo
        const statusClass = this.getStatusClass(vehicle.status);

        card.innerHTML = `
            <div class="vehicle-image">
                <img src="${imageUrl}" 
                     alt="${vehicle.full_name || vehicle.fullName || 'Vehículo'}" 
                     loading="lazy"
                     onerror="this.src='../assets/imagenes/placeholder-vehicle.jpg'">
                <div class="vehicle-status ${statusClass}">
                    ${vehicle.status || 'Disponible'}
                </div>
                ${vehicle.is_featured ? '<div class="vehicle-featured">⭐ Destacado</div>' : ''}
            </div>
            <div class="vehicle-content">
                <h3 class="vehicle-title">${vehicle.full_name || vehicle.fullName || 'Vehículo sin nombre'}</h3>
                <p class="vehicle-subtitle">${vehicle.description || vehicle.type_name || vehicle.typeName || 'Vehículo comercial'}</p>
                <div class="vehicle-specs">
                    <div class="vehicle-spec">
                        <span class="vehicle-spec-icon">📅</span>
                        <span class="vehicle-spec-value">${vehicle.year || 'N/A'}</span>
                    </div>
                    <div class="vehicle-spec">
                        <span class="vehicle-spec-icon">🛣️</span>
                        <span class="vehicle-spec-value">${this.formatNumber(vehicle.kilometers || 0)} km</span>
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

        // Event listener para click
        card.addEventListener('click', () => {
            this.goToVehicleDetail(vehicle);
        });

        return card;
    }

    // ===== CONFIGURAR CATEGORÍAS =====
    setupCategories() {
        const categoryItems = document.querySelectorAll('.category-item');
        
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remover active de todas
                categoryItems.forEach(cat => cat.classList.remove('active'));
                // Activar actual
                item.classList.add('active');
                
                // Aplicar filtro
                const category = item.dataset.category;
                this.filterByCategory(category);
            });
        });
    }

    // ===== CONFIGURAR FILTROS =====
    setupFilters() {
        // Buscador
        const searchInput = document.getElementById('filter-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            }, 300));
        }

        // Botón limpiar
        const clearBtn = document.querySelector('.clear-all-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    // ===== CONFIGURAR UI =====
    setupUI() {
        // Configurar botones móviles, sorting, etc.
        this.setupMobileToggle();
        this.setupSorting();
    }

    setupMobileToggle() {
        const toggleBtn = document.querySelector('.mobile-filter-toggle');
        const sidebar = document.querySelector('.sidebar-filters-full');
        const overlay = document.getElementById('filter-overlay');

        if (toggleBtn && sidebar && overlay) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
                document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
            });

            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
    }

    setupSorting() {
        const sortBtn = document.querySelector('.sort-btn');
        const sortMenu = document.querySelector('.sort-menu');
        const sortOptions = document.querySelectorAll('.sort-option');

        if (sortBtn && sortMenu) {
            sortBtn.addEventListener('click', () => {
                sortMenu.style.display = sortMenu.style.display === 'block' ? 'none' : 'block';
            });
        }

        sortOptions.forEach(option => {
            option.addEventListener('click', () => {
                const sortType = option.dataset.sort;
                this.sortVehicles(sortType);
                sortMenu.style.display = 'none';
            });
        });
    }

    // ===== FILTROS =====
    filterByCategory(category) {
        console.log(`🏷️ Filtrando por categoría: ${category}`);
        
        currentFilters.category = category;
        this.applyFilters();
    }

    applyFilters() {
        console.log('🔍 Aplicando filtros:', currentFilters);
        
        filteredVehicles = vehiclesData.filter(vehicle => {
            // Filtro por categoría
            if (currentFilters.category && currentFilters.category !== 'all') {
                if (vehicle.type !== currentFilters.category) {
                    return false;
                }
            }
            
            // Filtro por búsqueda
            if (currentFilters.search) {
                const searchText = `${vehicle.brand} ${vehicle.model} ${vehicle.full_name || vehicle.fullName}`.toLowerCase();
                if (!searchText.includes(currentFilters.search)) {
                    return false;
                }
            }
            
            return true;
        });
        
        console.log(`📊 ${filteredVehicles.length} vehículos después del filtro`);
        
        currentPage = 1;
        this.updateVehicleCount(filteredVehicles.length);
        this.renderVehicles();
    }

    clearAllFilters() {
        currentFilters = {
            category: 'all',
            search: '',
            type: [],
            brand: [],
            yearMin: null,
            yearMax: null,
            kmMin: null,
            kmMax: null
        };
        
        // Limpiar UI
        const searchInput = document.getElementById('filter-search');
        if (searchInput) searchInput.value = '';
        
        // Activar categoría "all"
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector('[data-category="all"]')?.classList.add('active');
        
        // Aplicar filtros
        this.applyFilters();
    }

    sortVehicles(sortType) {
        console.log(`📊 Ordenando por: ${sortType}`);
        
        filteredVehicles.sort((a, b) => {
            switch (sortType) {
                case 'year-desc':
                    return (b.year || 0) - (a.year || 0);
                case 'year-asc':
                    return (a.year || 0) - (b.year || 0);
                case 'km-asc':
                    return (a.kilometers || 0) - (b.kilometers || 0);
                case 'km-desc':
                    return (b.kilometers || 0) - (a.kilometers || 0);
                case 'relevance':
                default:
                    // Destacados primero, luego por fecha de creación
                    if (a.is_featured && !b.is_featured) return -1;
                    if (!a.is_featured && b.is_featured) return 1;
                    return new Date(b.created_at || b.date_added || 0) - new Date(a.created_at || a.date_added || 0);
            }
        });
        
        this.renderVehicles();
    }

    // ===== UTILIDADES =====
    getVehicleImageUrl(vehicle) {
        // Verificar si tiene imágenes
        if (vehicle.images && vehicle.images.length > 0) {
            const imagePath = vehicle.images[0];
            
            // Si es URL completa
            if (imagePath.startsWith('http')) {
                return imagePath;
            }
            
            // Si es ruta del backend
            if (imagePath.startsWith('/static') || imagePath.startsWith('static')) {
                return `http://localhost:8000/${imagePath.replace(/^\//, '')}`;
            }
            
            // Si es ruta relativa
            return imagePath;
        }
        
        // Imagen por defecto
        return '../assets/imagenes/placeholder-vehicle.jpg';
    }

    getStatusClass(status) {
        if (!status) return 'available';
        
        const statusLower = status.toLowerCase();
        if (statusLower.includes('disponible')) return 'available';
        if (statusLower.includes('reservado')) return 'reserved';
        if (statusLower.includes('vendido')) return 'sold';
        return 'available';
    }

    formatNumber(num) {
        if (!num) return '0';
        return new Intl.NumberFormat('es-AR').format(num);
    }

    updateVehicleCount(count) {
        const totalElement = document.getElementById('total-vehicles');
        if (totalElement) {
            totalElement.textContent = count;
        }
    }

    updateCategoryCounters() {
        // Contar vehículos por categoría
        const categoryCounts = {
            'all': vehiclesData.length
        };
        
        vehiclesData.forEach(vehicle => {
            const type = vehicle.type;
            if (type) {
                categoryCounts[type] = (categoryCounts[type] || 0) + 1;
            }
        });
        
        // Actualizar contadores en la UI
        document.querySelectorAll('.category-item').forEach(item => {
            const category = item.dataset.category;
            const countElement = item.querySelector('.category-count');
            
            if (countElement && categoryCounts[category] !== undefined) {
                countElement.textContent = `(${categoryCounts[category]})`;
            }
        });
        
        console.log('📊 Contadores actualizados:', categoryCounts);
    }

    goToVehicleDetail(vehicle) {
        console.log(`🔗 Navegando al detalle del vehículo: ${vehicle.full_name}`);
        
        // Guardar datos del vehículo en sessionStorage
        sessionStorage.setItem('currentVehicle', JSON.stringify(vehicle));
        
        // Redirigir a página de detalle
        window.location.href = `detalleVehiculo.html?id=${vehicle.id}`;
    }

    // ===== ESTADOS DE UI =====
    showLoading(show) {
        const grid = document.getElementById('vehicles-grid');
        if (!grid) return;
        
        if (show) {
            grid.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <h3>🔄 Cargando vehículos</h3>
                    <p>Conectando con la base de datos...</p>
                </div>
            `;
        }
        
        isLoading = show;
    }

    showEmptyState(message = 'No hay vehículos disponibles') {
        const grid = document.getElementById('vehicles-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-truck"></i>
                    </div>
                    <h3>🚛 Sin vehículos</h3>
                    <p>${message}</p>
                    <button onclick="unidadesAPI.loadVehicles()" class="btn-retry">
                        🔄 Actualizar
                    </button>
                </div>
            `;
        }
    }

    showError(message) {
        const grid = document.getElementById('vehicles-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>❌ Error al cargar vehículos</h3>
                    <p>${message}</p>
                    <div class="error-details">
                        <p><strong>Pasos para solucionar:</strong></p>
                        <ol>
                            <li>Verificar que el backend esté corriendo en <code>localhost:8000</code></li>
                            <li>Comprobar la conexión a la base de datos</li>
                            <li>Revisar la consola del navegador para más detalles</li>
                        </ol>
                    </div>
                    <button onclick="unidadesAPI.loadVehicles()" class="btn-retry">
                        🔄 Reintentar
                    </button>
                </div>
            `;
        }
    }

    showConnectionError() {
        const grid = document.getElementById('vehicles-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="connection-error">
                    <div class="error-icon">
                        <i class="fas fa-wifi-slash"></i>
                    </div>
                    <h3>🔌 Sin conexión a la API</h3>
                    <p>No se puede conectar con el servidor backend.</p>
                    <div class="error-details">
                        <p><strong>Verificar:</strong></p>
                        <ul>
                            <li>Backend corriendo en <code>http://localhost:8000</code></li>
                            <li>CORS configurado correctamente</li>
                            <li>Base de datos PostgreSQL activa</li>
                        </ul>
                    </div>
                    <div class="error-actions">
                        <button onclick="unidadesAPI.testConnection().then(connected => connected && unidadesAPI.loadVehicles())" class="btn-retry">
                            🔄 Probar conexión
                        </button>
                        <button onclick="unidadesAPI.loadVehicles()" class="btn-retry secondary">
                            🔄 Reintentar carga
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // ===== UTILIDAD DEBOUNCE =====
    debounce(func, wait) {
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
}

// ===== INICIALIZACIÓN =====
let unidadesAPI;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Unidades Disponibles API...');
    
    // Verificar que no existan instancias previas
    if (window.unidadesAPI) {
        console.log('♻️ Reinicializando sistema...');
    }
    
    // Crear nueva instancia
    unidadesAPI = new UnidadesAPI();
    
    // Hacer disponible globalmente
    window.unidadesAPI = unidadesAPI;
    
    console.log('✅ Sistema Unidades Disponibles inicializado');
});

// ===== FUNCIÓN PARA COLAPSAR FILTROS =====
function toggleFilterGroup(titleElement) {
    const filterGroup = titleElement.closest('.filter-group');
    const icon = titleElement.querySelector('.collapse-icon');
    
    filterGroup.classList.toggle('collapsed');
    
    if (filterGroup.classList.contains('collapsed')) {
        icon.style.transform = 'rotate(0deg)';
    } else {
        icon.style.transform = 'rotate(180deg)';
    }
}

// ===== CSS ADICIONAL =====
const additionalCSS = `
    .loading-state, .empty-state, .error-state, .connection-error {
        grid-column: 1 / -1;
        padding: 60px 20px;
        text-align: center;
        color: #666;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3D5FAC;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .btn-retry {
        background: #3D5FAC;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        margin: 10px 5px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .btn-retry:hover {
        background: #2a4490;
        transform: translateY(-2px);
    }
    
    .btn-retry.secondary {
        background: #6c757d;
    }
    
    .error-details {
        margin: 20px 0;
        text-align: left;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
    }
    
    .error-details code {
        background: #f8f9fa;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
    }
    
    .vehicle-featured {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255, 193, 7, 0.9);
        color: #000;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .vehicle-spec-icon {
        margin-right: 6px;
        font-size: 14px;
    }
`;

// Agregar CSS al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

console.log('🚛 Unidades Disponibles API - Sistema completo cargado');