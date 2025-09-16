// ===== SOLUCIÓN JAVASCRIPT - SIN CSS =====
// Archivo: scripts/unidades-fix.js

// ===== 1. API CLIENT MEJORADO =====
class APIClientFixed {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/v1';
    }

    async getVehicles(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.baseURL}/vehicles${queryString ? `?${queryString}` : ''}`;
            
            console.log(`🌐 Fetching: ${url}`);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log(`✅ API Response:`, data);
            return data;
            
        } catch (error) {
            console.error(`❌ API Error:`, error);
            throw error;
        }
    }

    // ===== FUNCIÓN CRÍTICA PARA IMÁGENES =====
    getImageUrl(imageData) {
        console.log('🖼️ Procesando imagen:', imageData);
        
        if (!imageData) {
            return '../assets/imagenes/placeholder-vehicle.jpg';
        }
        
        if (typeof imageData === 'string') {
            if (imageData.startsWith('http')) {
                return imageData;
            }
            if (imageData.startsWith('/static') || imageData.startsWith('static')) {
                return `http://localhost:8000/${imageData.replace(/^\//, '')}`;
            }
            return imageData;
        }
        
        if (typeof imageData === 'object' && imageData !== null) {
            const imagePath = imageData.file_path || imageData.filename || imageData.url || imageData.path;
            if (imagePath) {
                return this.getImageUrl(imagePath);
            }
        }
        
        return '../assets/imagenes/placeholder-vehicle.jpg';
    }
}

// ===== 2. SISTEMA PRINCIPAL UNIDADES DISPONIBLES =====
class UnidadesDisponiblesSystem {
    constructor() {
        this.apiClient = new APIClientFixed();
        this.vehiclesData = [];
        this.filteredVehicles = [];
        this.currentFilters = { category: 'all' };
        this.isLoading = false;
    }

    async init() {
        console.log('🚛 Iniciando sistema de unidades...');
        
        try {
            // Test conexión
            const connected = await this.testConnection();
            
            if (connected) {
                await this.loadVehicles();
            } else {
                this.showConnectionError();
            }
            
            this.setupEventListeners();
            this.checkURLFilters();
            
        } catch (error) {
            console.error('❌ Error inicializando:', error);
            this.showError('Error de inicialización');
        }
    }

    async testConnection() {
        try {
            const response = await fetch('http://localhost:8000/health');
            return response.ok;
        } catch {
            return false;
        }
    }

    async loadVehicles() {
        try {
            this.showLoading(true);
            console.log('📦 Cargando vehículos...');
            
            const response = await this.apiClient.getVehicles({ limit: 100 });
            
            // Manejar diferentes formatos de respuesta del backend
            let vehicles = [];
            
            if (response?.vehicles && Array.isArray(response.vehicles)) {
                vehicles = response.vehicles;
            } else if (Array.isArray(response)) {
                vehicles = response;
            } else if (response?.data && Array.isArray(response.data)) {
                vehicles = response.data;
            } else {
                throw new Error('Formato de respuesta inválido');
            }
            
            if (vehicles.length === 0) {
                this.showEmptyState('No hay vehículos en la base de datos');
                return;
            }
            
            // Normalizar datos
            this.vehiclesData = vehicles.map(v => this.normalizeVehicle(v));
            this.filteredVehicles = [...this.vehiclesData];
            
            console.log(`✅ ${this.vehiclesData.length} vehículos cargados`);
            
            this.updateUI();
            
        } catch (error) {
            console.error('❌ Error cargando vehículos:', error);
            this.showError(`Error: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    // ===== NORMALIZAR DATOS DEL BACKEND =====
    normalizeVehicle(vehicle) {
        return {
            id: vehicle.id || `temp_${Date.now()}`,
            brand: vehicle.brand || 'Sin marca',
            model: vehicle.model || 'Sin modelo',
            full_name: vehicle.full_name || vehicle.fullName || `${vehicle.brand || 'Vehículo'} ${vehicle.model || ''}`.trim(),
            year: vehicle.year || new Date().getFullYear(),
            kilometers: vehicle.kilometers || vehicle.km || 0,
            power: vehicle.power || vehicle.hp || 0,
            type: vehicle.type || vehicle.vehicle_type || 'varios',
            type_name: vehicle.type_name || vehicle.typeName || this.getTypeName(vehicle.type || 'varios'),
            status: vehicle.status || 'Disponible',
            location: vehicle.location || 'Villa María, Córdoba',
            transmission: vehicle.transmission || 'Manual',
            traccion: vehicle.traccion || vehicle.traction || '4x2',
            color: vehicle.color || 'No especificado',
            description: vehicle.description || 'Vehículo comercial',
            observations: vehicle.observations || null,
            images: this.processImages(vehicle.images || vehicle.image || []),
            is_featured: vehicle.is_featured || false,
            date_registered: vehicle.date_registered || vehicle.dateRegistered || new Date().toLocaleDateString('es-AR'),
            price: vehicle.price || null,
            is_active: vehicle.is_active !== false
        };
    }

    processImages(images) {
        if (!images) return [];
        if (typeof images === 'string') return [images];
        if (Array.isArray(images)) return images;
        if (typeof images === 'object') {
            const imageArray = images.images || images.urls || images.files || [];
            return Array.isArray(imageArray) ? imageArray : [];
        }
        return [];
    }

    getTypeName(type) {
        const typeNames = {
            'camion-tractor': 'Camión Tractor',
            'camion-chasis': 'Camión Chasis',
            'remolques': 'Remolques',
            'utilitarios': 'Utilitarios',
            'varios': 'Varios'
        };
        return typeNames[type] || 'Varios';
    }

    updateUI() {
        this.updateVehicleCount(this.vehiclesData.length);
        this.updateCategoryCounters();
        this.renderVehicles();
    }

    // ===== RENDERIZAR VEHÍCULOS =====
    renderVehicles() {
        const grid = document.getElementById('vehicles-grid');
        if (!grid) {
            console.error('❌ Grid no encontrado');
            return;
        }

        if (this.filteredVehicles.length === 0) {
            this.showEmptyState('No se encontraron vehículos');
            return;
        }

        grid.innerHTML = '';
        
        this.filteredVehicles.forEach((vehicle, index) => {
            const card = this.createVehicleCard(vehicle);
            if (card) {
                card.style.animationDelay = `${index * 0.05}s`;
                grid.appendChild(card);
            }
        });

        console.log(`✅ ${this.filteredVehicles.length} tarjetas renderizadas`);
    }

    // ===== CREAR TARJETA DE VEHÍCULO =====
    createVehicleCard(vehicle) {
        const card = document.createElement('div');
        card.className = 'vehicle-card fade-in';
        card.dataset.vehicleId = vehicle.id;
        card.dataset.vehicleData = JSON.stringify(vehicle);
        
        // Obtener URL de imagen
        const imageUrl = vehicle.images && vehicle.images.length > 0 
            ? this.apiClient.getImageUrl(vehicle.images[0])
            : '../assets/imagenes/placeholder-vehicle.jpg';
        
        console.log(`🖼️ Imagen para ${vehicle.full_name}:`, imageUrl);
        
        const statusClass = vehicle.status?.toLowerCase() === 'disponible' ? 'available' : 'reserved';
        
        card.innerHTML = `
            <div class="vehicle-image">
                <img src="${imageUrl}" 
                     alt="${vehicle.full_name}" 
                     loading="lazy"
                     onerror="console.error('Error cargando:', this.src); this.src='../assets/imagenes/placeholder-vehicle.jpg';">
                <div class="vehicle-status ${statusClass}">
                    ${vehicle.status}
                </div>
                ${vehicle.is_featured ? '<div class="vehicle-featured">⭐ Destacado</div>' : ''}
            </div>
            <div class="vehicle-content">
                <h3 class="vehicle-title">${vehicle.full_name}</h3>
                <p class="vehicle-subtitle">${vehicle.description}</p>
                <div class="vehicle-specs">
                    <div class="vehicle-spec">
                        <span class="vehicle-spec-icon">📅</span>
                        <span class="vehicle-spec-value">${vehicle.year}</span>
                    </div>
                    <div class="vehicle-spec">
                        <span class="vehicle-spec-icon">🛣️</span>
                        <span class="vehicle-spec-value">${this.formatNumber(vehicle.kilometers)} km</span>
                    </div>
                    <div class="vehicle-spec">
                        <span class="vehicle-spec-icon">⚙️</span>
                        <span class="vehicle-spec-value">${vehicle.transmission}</span>
                    </div>
                    <div class="vehicle-spec">
                        <span class="vehicle-spec-icon">🔋</span>
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

        // ===== EVENT LISTENER CRÍTICO PARA NAVEGACIÓN =====
        card.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`🔗 Click en: ${vehicle.full_name}`);
            this.navigateToDetail(vehicle);
        });

        return card;
    }

    // ===== NAVEGACIÓN AL DETALLE - CRÍTICO =====
    navigateToDetail(vehicle) {
        console.log(`🚗 Navegando al detalle de: ${vehicle.full_name}`);
        
        try {
            // Guardar datos completos en sessionStorage
            sessionStorage.setItem('currentVehicle', JSON.stringify(vehicle));
            console.log('💾 Datos guardados en sessionStorage');
            
            // Navegar a detalle
            const detailUrl = `detalleVehiculo.html?id=${vehicle.id}`;
            console.log(`🔗 Navegando a: ${detailUrl}`);
            window.location.href = detailUrl;
            
        } catch (error) {
            console.error('❌ Error navegando:', error);
            alert('Error al navegar al detalle');
        }
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Categorías
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                categoryItems.forEach(cat => cat.classList.remove('active'));
                item.classList.add('active');
                
                const category = item.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Buscador
        const searchInput = document.getElementById('filter-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            }, 300));
        }

        // Botón limpiar
        const clearBtn = document.querySelector('.clear-all-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllFilters());
        }
    }

    checkURLFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        const category = urlParams.get('category') || urlParams.get('filter');
        if (category && category !== 'all') {
            console.log(`🏷️ Filtro desde URL: ${category}`);
            
            // Activar categoría
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.category === category) {
                    item.classList.add('active');
                }
            });
            
            this.currentFilters.category = category;
            this.applyFilters();
        }
    }

    filterByCategory(category) {
        console.log(`🏷️ Filtrando por: ${category}`);
        this.currentFilters.category = category;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredVehicles = this.vehiclesData.filter(vehicle => {
            // Filtro por categoría
            if (this.currentFilters.category && this.currentFilters.category !== 'all') {
                if (vehicle.type !== this.currentFilters.category) {
                    return false;
                }
            }
            
            // Filtro por búsqueda
            if (this.currentFilters.search) {
                const searchText = `${vehicle.brand} ${vehicle.model} ${vehicle.full_name}`.toLowerCase();
                if (!searchText.includes(this.currentFilters.search)) {
                    return false;
                }
            }
            
            return true;
        });
        
        console.log(`📊 ${this.filteredVehicles.length} vehículos filtrados`);
        
        this.updateVehicleCount(this.filteredVehicles.length);
        this.renderVehicles();
    }

    clearAllFilters() {
        this.currentFilters = { category: 'all' };
        
        const searchInput = document.getElementById('filter-search');
        if (searchInput) searchInput.value = '';
        
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector('[data-category="all"]')?.classList.add('active');
        
        this.applyFilters();
    }

    // ===== UTILIDADES =====
    formatNumber(num) {
        return new Intl.NumberFormat('es-AR').format(num || 0);
    }

    updateVehicleCount(count) {
        const totalElement = document.getElementById('total-vehicles');
        if (totalElement) {
            totalElement.textContent = count;
        }
    }

    updateCategoryCounters() {
        const categoryCounts = { 'all': this.vehiclesData.length };
        
        this.vehiclesData.forEach(vehicle => {
            const type = vehicle.type || 'varios';
            categoryCounts[type] = (categoryCounts[type] || 0) + 1;
        });
        
        document.querySelectorAll('.category-item').forEach(item => {
            const category = item.dataset.category;
            const countElement = item.querySelector('.category-count');
            
            if (countElement && categoryCounts[category] !== undefined) {
                countElement.textContent = `(${categoryCounts[category]})`;
            }
        });
    }

    // ===== ESTADOS DE UI =====
    showLoading(show) {
        const grid = document.getElementById('vehicles-grid');
        if (show && grid) {
            grid.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <h3>🔄 Cargando vehículos</h3>
                    <p>Conectando con la base de datos...</p>
                </div>
            `;
        }
        this.isLoading = show;
    }

    showEmptyState(message) {
        const grid = document.getElementById('vehicles-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🚛</div>
                    <h3>Sin vehículos</h3>
                    <p>${message}</p>
                    <button onclick="window.unidadesSystem.loadVehicles()" class="btn-retry">
                        🔄 Recargar
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
                    <div class="error-icon">⚠️</div>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button onclick="window.unidadesSystem.loadVehicles()" class="btn-retry">
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
                    <div class="error-icon">🔌</div>
                    <h3>Sin conexión</h3>
                    <p>No se puede conectar con el backend.</p>
                    <ul>
                        <li>Verificar: <code>docker-compose up -d</code></li>
                        <li>URL: <code>http://localhost:8000</code></li>
                    </ul>
                    <button onclick="window.unidadesSystem.init()" class="btn-retry">
                        🔄 Probar conexión
                    </button>
                </div>
            `;
        }
    }

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

// ===== 3. SISTEMA DETALLE VEHÍCULO =====
class DetalleVehiculoSystem {
    constructor() {
        this.currentVehicle = null;
        this.apiClient = new APIClientFixed();
    }

    init() {
        console.log('🚗 Iniciando detalle de vehículo...');
        this.loadVehicleData();
        this.setupContactButtons();
    }

    loadVehicleData() {
        try {
            // Obtener datos desde sessionStorage
            const storedVehicle = sessionStorage.getItem('currentVehicle');
            if (storedVehicle) {
                this.currentVehicle = JSON.parse(storedVehicle);
                console.log('✅ Datos cargados desde sessionStorage:', this.currentVehicle);
                this.populateVehicleData(this.currentVehicle);
                return;
            }

            // Fallback si no hay datos
            console.warn('⚠️ No hay datos en sessionStorage');
            this.currentVehicle = this.getFallbackData();
            this.populateVehicleData(this.currentVehicle);

        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            this.showErrorState();
        }
    }

    populateVehicleData(vehicle) {
        console.log('🔧 Poblando datos:', vehicle);

        // Actualizar título
        document.title = `${vehicle.full_name} - Larrosa Camiones`;
        
        const vehicleName = document.getElementById('vehicle-name');
        if (vehicleName) {
            vehicleName.textContent = vehicle.full_name;
        }

        // Actualizar especificaciones
        this.updateSpec('spec-marca', vehicle.brand);
        this.updateSpec('spec-modelo', vehicle.model);
        this.updateSpec('spec-año', vehicle.year);
        this.updateSpec('spec-color', vehicle.color);
        this.updateSpec('spec-km', this.formatNumber(vehicle.kilometers));
        this.updateSpec('spec-fecha', vehicle.date_registered);
        this.updateSpec('spec-tipo', vehicle.type_name);
        this.updateSpec('spec-traccion', vehicle.traccion);
        this.updateSpec('spec-transmision', vehicle.transmission);
        this.updateSpec('spec-potencia', `${vehicle.power} HP`);
        this.updateSpec('spec-observaciones', vehicle.observations || '-');

        // Actualizar imagen principal
        if (vehicle.images && vehicle.images.length > 0) {
            const imageUrl = this.apiClient.getImageUrl(vehicle.images[0]);
            this.updateMainImage(imageUrl);
        }
    }

    updateSpec(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value || 'No especificado';
        }
    }

    updateMainImage(imageSrc) {
        const mainImage = document.getElementById('main-image');
        if (mainImage) {
            mainImage.src = imageSrc;
            mainImage.onerror = function() {
                console.error('Error cargando imagen principal:', this.src);
                this.src = '../assets/imagenes/placeholder-vehicle.jpg';
            };
        }
    }

    setupContactButtons() {
        const whatsappBtn = document.querySelector('.whatsapp-btn');
        const phoneBtn = document.querySelector('.phone-btn');
        const emailBtn = document.querySelector('.email-btn');

        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => this.openWhatsApp());
        }
        if (phoneBtn) {
            phoneBtn.addEventListener('click', () => this.makePhoneCall());
        }
        if (emailBtn) {
            emailBtn.addEventListener('click', () => this.sendEmail());
        }
    }

    openWhatsApp() {
        if (!this.currentVehicle) return;
        
        const message = `Hola! Me interesa el ${this.currentVehicle.full_name} (${this.currentVehicle.year}). ¿Podrían brindarme más información?`;
        const whatsappUrl = `https://wa.me/5493534567890?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
    }

    makePhoneCall() {
        window.location.href = 'tel:+5493534567890';
    }

    sendEmail() {
        if (!this.currentVehicle) return;
        
        const subject = `Consulta sobre ${this.currentVehicle.full_name}`;
        const body = `Hola,\n\nMe interesa el ${this.currentVehicle.full_name} (${this.currentVehicle.year}).\n\nSaludos.`;
        
        window.location.href = `mailto:info@larrosacamiones.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    formatNumber(num) {
        return new Intl.NumberFormat('es-AR').format(num || 0);
    }

    getFallbackData() {
        return {
            id: 'fallback-1',
            brand: 'Iveco',
            model: 'Stralis 360',
            full_name: 'Iveco Stralis 360',
            year: 2017,
            kilometers: 770000,
            power: 360,
            traccion: '6x2',
            transmission: 'Automática',
            color: 'Blanco',
            type_name: 'Tractor',
            date_registered: '15/07/2025',
            observations: '-',
            images: ['../assets/imagenes/placeholder-vehicle.jpg']
        };
    }

    showErrorState() {
        const mainContent = document.querySelector('.vehicle-detail-main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-state">
                    <h2>Error al cargar el vehículo</h2>
                    <p>No se pudo cargar la información.</p>
                    <a href="unidadesDisponibles.html" class="btn-retry">Volver</a>
                </div>
            `;
        }
    }
}

// ===== 4. INICIALIZACIÓN AUTOMÁTICA =====
let unidadesSystem;
let detalleSystem;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando sistema corregido...');
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'unidadesDisponibles.html') {
        console.log('📋 Página: Unidades Disponibles');
        unidadesSystem = new UnidadesDisponiblesSystem();
        unidadesSystem.init();
        window.unidadesSystem = unidadesSystem;
    }
    
    if (currentPage === 'detalleVehiculo.html') {
        console.log('🚗 Página: Detalle Vehículo');
        detalleSystem = new DetalleVehiculoSystem();
        detalleSystem.init();
        window.detalleSystem = detalleSystem;
    }
    
    console.log('✅ Sistema inicializado');
});

// ===== 5. FUNCIONES GLOBALES PARA DEBUG =====
window.debugSystem = function() {
    console.log('=== DEBUG SISTEMA ===');
    if (window.unidadesSystem) {
        console.log('Vehículos:', window.unidadesSystem.vehiclesData.length);
        console.log('Filtrados:', window.unidadesSystem.filteredVehicles.length);
        console.log('Primer vehículo:', window.unidadesSystem.vehiclesData[0]);
    }
    if (window.detalleSystem) {
        console.log('Vehículo actual:', window.detalleSystem.currentVehicle);
    }
};

// ===== FUNCIÓN PARA COLAPSAR FILTROS (SI LA NECESITAS) =====
window.toggleFilterGroup = function(titleElement) {
    const filterGroup = titleElement.closest('.filter-group');
    const content = filterGroup.querySelector('.filter-content');
    const icon = titleElement.querySelector('i');
    
    if (content.style.display === 'none' || !content.style.display) {
        content.style.display = 'block';
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
};

console.log('🔧 Sistema de corrección cargado');
// ===== DEBUG Y FIX PARA IMÁGENES =====
// Agrega esto al final de tu archivo scripts/unidades-fix.js

// ===== FUNCIÓN DE DEBUG MEJORADA =====
window.debugImages = function() {
    console.log('=== DEBUG IMÁGENES ===');
    
    if (window.unidadesSystem && window.unidadesSystem.vehiclesData.length > 0) {
        const firstVehicle = window.unidadesSystem.vehiclesData[0];
        console.log('🚗 Primer vehículo completo:', firstVehicle);
        console.log('📸 Imágenes originales:', firstVehicle.images);
        
        if (firstVehicle.images && firstVehicle.images.length > 0) {
            const firstImage = firstVehicle.images[0];
            console.log('🖼️ Primera imagen raw:', firstImage);
            
            const processedUrl = window.unidadesSystem.apiClient.getImageUrl(firstImage);
            console.log('🔗 URL procesada:', processedUrl);
            
            // Test si la imagen existe
            const testImg = new Image();
            testImg.onload = function() {
                console.log('✅ Imagen carga correctamente:', processedUrl);
            };
            testImg.onerror = function() {
                console.error('❌ Error cargando imagen:', processedUrl);
                console.log('🔍 Probando alternativas...');
                
                // Probar diferentes URLs
                const alternatives = [
                    `http://localhost:8000/static/${firstImage}`,
                    `http://localhost:8000/${firstImage}`,
                    `http://localhost:8000/static/images/${firstImage}`,
                    `http://localhost:8000/images/${firstImage}`
                ];
                
                alternatives.forEach(alt => {
                    const testAlt = new Image();
                    testAlt.onload = () => console.log('✅ Alternativa funciona:', alt);
                    testAlt.onerror = () => console.log('❌ Alternativa falla:', alt);
                    testAlt.src = alt;
                });
            };
            testImg.src = processedUrl;
        }
        
        // Debug del JSON raw del backend
        console.log('📋 Debug: hacer fetch directo al backend...');
        fetch('http://localhost:8000/api/v1/vehicles?limit=1')
            .then(response => response.json())
            .then(data => {
                console.log('🔍 Respuesta RAW del backend:', data);
                
                if (data.vehicles && data.vehicles[0]) {
                    console.log('📸 Imágenes en respuesta raw:', data.vehicles[0].images);
                    console.log('🗂️ Estructura completa del primer vehículo:', data.vehicles[0]);
                }
            })
            .catch(error => console.error('❌ Error en fetch directo:', error));
    }
};

// ===== API CLIENT CON MEJOR DEBUG =====
class APIClientDebug {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/v1';
    }

    getImageUrl(imageData) {
        console.log('🖼️ getImageUrl input:', imageData);
        
        if (!imageData) {
            console.log('⚠️ No image data, using placeholder');
            return '../assets/imagenes/placeholder-vehicle.jpg';
        }
        
        let finalUrl;
        
        if (typeof imageData === 'string') {
            if (imageData.startsWith('http')) {
                finalUrl = imageData;
                console.log('✅ Full HTTP URL found:', finalUrl);
            } else if (imageData.startsWith('/static') || imageData.startsWith('static')) {
                finalUrl = `http://localhost:8000/${imageData.replace(/^\//, '')}`;
                console.log('✅ Static path converted:', finalUrl);
            } else if (imageData.includes('.')) {
                // Parece ser un nombre de archivo
                finalUrl = `http://localhost:8000/static/images/${imageData}`;
                console.log('✅ Filename converted to static path:', finalUrl);
            } else {
                finalUrl = imageData;
                console.log('✅ Using relative path:', finalUrl);
            }
        } else if (typeof imageData === 'object' && imageData !== null) {
            console.log('📦 Image object detected:', imageData);
            
            const imagePath = imageData.file_path || 
                             imageData.filename || 
                             imageData.url || 
                             imageData.path ||
                             imageData.image_url ||
                             imageData.src;
            
            if (imagePath) {
                console.log('🔍 Found path in object:', imagePath);
                finalUrl = this.getImageUrl(imagePath); // Recursión
            } else {
                console.warn('⚠️ No valid path in image object');
                finalUrl = '../assets/imagenes/placeholder-vehicle.jpg';
            }
        } else {
            console.warn('⚠️ Unknown image data type:', typeof imageData);
            finalUrl = '../assets/imagenes/placeholder-vehicle.jpg';
        }
        
        console.log('🎯 Final URL:', finalUrl);
        return finalUrl;
    }
}

// ===== PROCESAMIENTO DE IMÁGENES MEJORADO =====
function processImagesAdvanced(images) {
    console.log('🔧 processImagesAdvanced input:', images);
    
    if (!images) {
        console.log('⚠️ No images provided');
        return [];
    }
    
    let result = [];
    
    if (typeof images === 'string') {
        console.log('📷 Single string image');
        result = [images];
    } else if (Array.isArray(images)) {
        console.log(`📷 Array of ${images.length} images`);
        result = images;
    } else if (typeof images === 'object' && images !== null) {
        console.log('📦 Images object:', images);
        
        // Buscar arrays de imágenes
        const possibleArrays = [
            images.images,
            images.urls,
            images.files,
            images.photos,
            images.attachments
        ];
        
        for (const arr of possibleArrays) {
            if (Array.isArray(arr) && arr.length > 0) {
                console.log('✅ Found image array:', arr);
                result = arr;
                break;
            }
        }
        
        // Si no hay arrays, buscar propiedades individuales
        if (result.length === 0) {
            const possibleProps = [
                images.url,
                images.file_path,
                images.filename,
                images.src,
                images.image_url,
                images.path
            ];
            
            for (const prop of possibleProps) {
                if (prop) {
                    console.log('✅ Found single image property:', prop);
                    result = [prop];
                    break;
                }
            }
        }
    }
    
    console.log('🎯 Processed images result:', result);
    return result;
}

// ===== FUNCIÓN PARA REEMPLAZAR EL API CLIENT =====
window.fixImageHandling = function() {
    if (window.unidadesSystem) {
        console.log('🔧 Reemplazando API Client con versión debug...');
        window.unidadesSystem.apiClient = new APIClientDebug();
        
        // Re-procesar vehículos existentes
        if (window.unidadesSystem.vehiclesData.length > 0) {
            console.log('🔄 Re-procesando vehículos existentes...');
            window.unidadesSystem.vehiclesData = window.unidadesSystem.vehiclesData.map(vehicle => {
                vehicle.images = processImagesAdvanced(vehicle.images);
                return vehicle;
            });
            window.unidadesSystem.filteredVehicles = [...window.unidadesSystem.vehiclesData];
            window.unidadesSystem.renderVehicles();
        }
    }
};

// ===== FUNCIÓN PARA VERIFICAR BACKEND =====
window.checkBackendImages = async function() {
    console.log('🔍 Verificando estructura del backend...');
    
    try {
        // 1. Verificar endpoint principal
        const response = await fetch('http://localhost:8000/api/v1/vehicles?limit=1');
        const data = await response.json();
        console.log('📋 Response structure:', data);
        
        if (data.vehicles && data.vehicles[0]) {
            const vehicle = data.vehicles[0];
            console.log('🚗 First vehicle full data:', vehicle);
            console.log('📸 Images field specifically:', vehicle.images);
            
            // 2. Verificar si hay endpoint de imágenes
            const imageEndpoints = [
                'http://localhost:8000/static/',
                'http://localhost:8000/images/',
                'http://localhost:8000/media/',
                'http://localhost:8000/uploads/'
            ];
            
            for (const endpoint of imageEndpoints) {
                try {
                    const testResponse = await fetch(endpoint);
                    console.log(`📁 ${endpoint}: ${testResponse.status} ${testResponse.statusText}`);
                } catch (error) {
                    console.log(`📁 ${endpoint}: No disponible`);
                }
            }
        }
        
        // 3. Verificar endpoint de health para más info
        const healthResponse = await fetch('http://localhost:8000/health');
        const healthData = await healthResponse.json();
        console.log('💚 Health check:', healthData);
        
    } catch (error) {
        console.error('❌ Error verificando backend:', error);
    }
};

// ===== AUTO-EJECUCIÓN DEL DEBUG =====
document.addEventListener('DOMContentLoaded', function() {
    // Ejecutar debug después de un momento
    setTimeout(() => {
        console.log('🔍 Ejecutando debug automático de imágenes...');
        if (typeof debugImages === 'function') {
            debugImages();
        }
        if (typeof checkBackendImages === 'function') {
            checkBackendImages();
        }
    }, 3000);
});

console.log('🔧 Debug de imágenes cargado. Usar: debugImages(), checkBackendImages(), fixImageHandling()');