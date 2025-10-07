// ===== UNIDADES DISPONIBLES - INTEGRACIÓN API FINAL =====
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
let currentSort = 'relevance';

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
        this.checkURLFilters();
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
                this.showConnectionStatus(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error de conexión:', error.message);
            this.showConnectionStatus(false);
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

    // ===== VERIFICAR FILTROS DESDE URL =====
    checkURLFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Verificar si hay filtro de categoría
        const category = urlParams.get('category') || urlParams.get('filter');
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
            currentFilters.category = category;
            this.applyFilters();
        }
        
        // Verificar otros filtros desde URL
        const search = urlParams.get('search');
        if (search) {
            currentFilters.search = search;
            const searchInput = document.getElementById('filter-search');
            if (searchInput) {
                searchInput.value = search;
            }
            this.applyFilters();
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

        // Filtros de tipo
        const typeCheckboxes = document.querySelectorAll('input[name="tipo"]');
        typeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.handleCheckboxFilter('tipo', checkbox);
            });
        });

        // Filtros de marca
        const brandCheckboxes = document.querySelectorAll('input[name="marca"]');
        brandCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.handleCheckboxFilter('marca', checkbox);
            });
        });

        // Filtros de rango
        const rangeInputs = document.querySelectorAll('.range-input');
        rangeInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.handleRangeFilter();
            });
        });
    }

    // ===== CONFIGURAR UI =====
    setupUI() {
        this.setupMobileToggle();
        this.setupSorting();
        this.setupCollapsibleFilters();
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
                
                // Actualizar UI del botón
                sortOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                sortBtn.querySelector('span').textContent = option.textContent;
            });
        });

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sort-dropdown')) {
                sortMenu.style.display = 'none';
            }
        });
    }

    setupCollapsibleFilters() {
        // Los filtros colapsables ya están configurados con toggleFilterGroup
        console.log('🔧 Filtros colapsables configurados');
    }

    // ===== MANEJO DE FILTROS =====
    filterByCategory(category) {
        console.log(`🏷️ Filtrando por categoría: ${category}`);
        currentFilters.category = category;
        this.applyFilters();
    }

    handleCheckboxFilter(filterName, checkbox) {
        if (!currentFilters[filterName]) {
            currentFilters[filterName] = [];
        }

        if (checkbox.checked) {
            if (!currentFilters[filterName].includes(checkbox.value)) {
                currentFilters[filterName].push(checkbox.value);
            }
        } else {
            currentFilters[filterName] = currentFilters[filterName].filter(val => val !== checkbox.value);
        }

        this.applyFilters();
    }

    handleRangeFilter() {
        const yearMin = document.getElementById('year-min')?.value;
        const yearMax = document.getElementById('year-max')?.value;
        const kmMin = document.getElementById('km-min')?.value;
        const kmMax = document.getElementById('km-max')?.value;

        currentFilters.yearMin = yearMin ? parseInt(yearMin) : null;
        currentFilters.yearMax = yearMax ? parseInt(yearMax) : null;
        currentFilters.kmMin = kmMin ? parseInt(kmMin) : null;
        currentFilters.kmMax = kmMax ? parseInt(kmMax) : null;

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

            // Filtro por tipo
            if (currentFilters.tipo && currentFilters.tipo.length > 0) {
                if (!currentFilters.tipo.includes(vehicle.type)) {
                    return false;
                }
            }

            // Filtro por marca
            if (currentFilters.marca && currentFilters.marca.length > 0) {
                if (!currentFilters.marca.some(marca => vehicle.brand.toLowerCase().includes(marca))) {
                    return false;
                }
            }

            // Filtro por año
            if (currentFilters.yearMin && vehicle.year < currentFilters.yearMin) {
                return false;
            }
            if (currentFilters.yearMax && vehicle.year > currentFilters.yearMax) {
                return false;
            }

            // Filtro por kilómetros
            if (currentFilters.kmMin && vehicle.kilometers < currentFilters.kmMin) {
                return false;
            }
            if (currentFilters.kmMax && vehicle.kilometers > currentFilters.kmMax) {
                return false;
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
        
        // Limpiar checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Limpiar rangos
        document.querySelectorAll('.range-input').forEach(input => {
            input.value = '';
        });
        
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
        currentSort = sortType;
        
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

    showConnectionStatus(connected) {
        const indicator = document.createElement('div');
        indicator.className = 'connection-status';
        indicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            z-index: 10000;
            transition: all 0.3s ease;
            ${connected ? `
                background: rgba(40, 167, 69, 0.9);
                color: white;
            ` : `
                background: rgba(220, 53, 69, 0.9);
                color: white;
            `}
        `;
        
        indicator.innerHTML = `
            <i class="fas fa-${connected ? 'wifi' : 'wifi-slash'}"></i>
            ${connected ? 'API Conectada' : 'Sin Conexión'}
        `;
        
        document.body.appendChild(indicator);
        
        if (connected) {
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.style.opacity = '0';
                    setTimeout(() => indicator.remove(), 300);
                }
            }, 3000);
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
      // Mejorar búsqueda con efectos visuales
      initializeSearchEffects();
    
      // Asegurar que filtros empiecen compactados
      initializeCollapsedFilters();
  });
  
  // === EFECTOS VISUALES PARA BÚSQUEDA ===
  function initializeSearchEffects() {
      const searchInput = document.getElementById('filter-search');
      const searchWrapper = document.querySelector('.search-input-wrapper');
      const clearIcon = document.getElementById('clear-search');
      
      if (!searchInput || !searchWrapper || !clearIcon) {
          console.warn('⚠️ Elementos de búsqueda no encontrados');
          return;
      }
      
      // Mostrar/ocultar icono de limpiar con clase
      searchInput.addEventListener('input', function() {
          if (this.value.length > 0) {
              searchWrapper.classList.add('has-content');
              clearIcon.style.display = 'block';
          } else {
              searchWrapper.classList.remove('has-content');
              clearIcon.style.display = 'none';
          }
      });
      
      // Limpiar búsqueda con animación
      clearIcon.addEventListener('click', function() {
          searchInput.value = '';
          searchWrapper.classList.remove('has-content');
          clearIcon.style.display = 'none';
          searchInput.focus();
          
          // Actualizar filtros
          currentFilters.search = '';
          if (window.unidadesAPI && typeof window.unidadesAPI.applyFilters === 'function') {
              window.unidadesAPI.applyFilters();
          } else {
              applyFilters();
          }
          
          // Animación de limpieza
          searchWrapper.classList.add('clearing');
          setTimeout(() => searchWrapper.classList.remove('clearing'), 300);
      });
      
      // Efectos de focus/blur
      searchInput.addEventListener('focus', function() {
          searchWrapper.classList.add('focused');
      });
      
      searchInput.addEventListener('blur', function() {
          searchWrapper.classList.remove('focused');
      });
      
      // Simulador de búsqueda activa
      let searchTimeout;
      searchInput.addEventListener('input', function() {
          clearTimeout(searchTimeout);
          
          // Mostrar estado de búsqueda
          searchWrapper.classList.add('searching');
          searchWrapper.classList.remove('has-results', 'no-results');
          
          searchTimeout = setTimeout(() => {
              searchWrapper.classList.remove('searching');
              
              // Simular resultados (adaptar según tu lógica)
              const hasResults = filteredVehicles && filteredVehicles.length > 0;
              const hasSearchTerm = searchInput.value.length > 0;
              
              if (hasSearchTerm) {
                  if (hasResults) {
                      searchWrapper.classList.add('has-results');
                  } else {
                      searchWrapper.classList.add('no-results');
                  }
              }
          }, 500);
      });
  }
  
  // === INICIALIZAR FILTROS COMPACTADOS ===
  function initializeCollapsedFilters() {
      const filterGroups = document.querySelectorAll('.filter-group');
      
      console.log(`🔧 Inicializando ${filterGroups.length} grupos de filtros...`);
      
      filterGroups.forEach((group, index) => {
          // Remover clase expanded si existe
          group.classList.remove('expanded');
          
          // Asegurar que el contenido esté oculto
          const content = group.querySelector('.filter-content');
          if (content) {
              content.style.maxHeight = '0';
              content.style.overflow = 'hidden';
          }
          
          // Asegurar que el icono esté en posición inicial
          const icon = group.querySelector('.collapse-icon');
          if (icon) {
              icon.style.transform = 'rotate(0deg)';
          }
          
          // Agregar event listener al título
          const titleButton = group.querySelector('.filter-title');
          if (titleButton && !titleButton.hasAttribute('data-toggle-added')) {
              titleButton.setAttribute('data-toggle-added', 'true');
              titleButton.addEventListener('click', function() {
                  toggleFilterGroup(this);
              });
          }
      });
      
      console.log('✅ Filtros inicializados en modo compactado');
  }
  
  // === FUNCIÓN MEJORADA DE TOGGLE PARA FILTROS ===
  function toggleFilterGroup(titleElement) {
      const filterGroup = titleElement.closest('.filter-group');
      const content = filterGroup.querySelector('.filter-content');
      const icon = titleElement.querySelector('.collapse-icon');
      
      if (!filterGroup || !content || !icon) {
          console.warn('⚠️ Elementos de filtro no encontrados');
          return;
      }
      
      // Toggle clase expanded
      const isExpanded = filterGroup.classList.contains('expanded');
      
      if (isExpanded) {
          // Colapsar
          filterGroup.classList.remove('expanded');
          content.style.maxHeight = '0';
          icon.style.transform = 'rotate(0deg)';
      } else {
          // Expandir
          filterGroup.classList.add('expanded');
          content.style.maxHeight = content.scrollHeight + 'px';
          icon.style.transform = 'rotate(180deg)';
      }
      
      // Agregar transición suave
      content.style.transition = 'max-height 0.3s ease-out';
  }
  
  // === FUNCIONES GLOBALES AUXILIARES ===
  window.expandAllFilters = function() {
      const filterGroups = document.querySelectorAll('.filter-group');
      filterGroups.forEach(group => {
          if (!group.classList.contains('expanded')) {
              const titleButton = group.querySelector('.filter-title');
              if (titleButton) {
                  toggleFilterGroup(titleButton);
              }
          }
      });
      console.log('📂 Todos los filtros expandidos');
  };
  
  window.collapseAllFilters = function() {
      const filterGroups = document.querySelectorAll('.filter-group');
      filterGroups.forEach(group => {
          if (group.classList.contains('expanded')) {
              const titleButton = group.querySelector('.filter-title');
              if (titleButton) {
                  toggleFilterGroup(titleButton);
              }
          }
      });
      console.log('📁 Todos los filtros colapsados');
  };
  
  // Hacer toggleFilterGroup disponible globalmente
  window.toggleFilterGroup = toggleFilterGroup;
  
  console.log('✨ Mejoras de UI aplicadas: búsqueda visual y filtros compactados');


// Hacer función disponible globalmente
window.toggleFilterGroup = toggleFilterGroup;

console.log('🚛 Unidades Disponibles API - Sistema completo cargado');