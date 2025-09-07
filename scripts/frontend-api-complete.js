// ===== FRONTEND - INTEGRACIÓN COMPLETA CON API =====
// scripts/frontend-api-complete.js

class FrontendAPI {
    constructor() {
        this.apiUrl = 'http://localhost:8000/api/v1';
        this.retryAttempts = 3;
        this.cache = new Map();
        this.init();
    }

    async init() {
        console.log('🔌 Inicializando Frontend API...');
        
        // Verificar conexión con backend
        const connected = await this.testConnection();
        
        if (connected) {
            console.log('✅ Conectado al backend');
            // Cargar datos reales
            await this.loadRealData();
        } else {
            console.log('❌ Sin conexión - usando datos de fallback');
            this.loadFallbackData();
        }
    }

    // ===== CONEXIÓN Y VERIFICACIÓN =====
    async testConnection() {
        try {
            const response = await fetch(`${this.apiUrl.replace('/api/v1', '')}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                const data = await response.json();
                this.showConnectionStatus(true);
                return true;
            }
            return false;
        } catch (error) {
            console.warn('⚠️ Backend no disponible:', error.message);
            this.showConnectionStatus(false);
            return false;
        }
    }

    showConnectionStatus(connected) {
        const indicator = document.createElement('div');
        indicator.className = 'connection-status';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
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
            ${connected ? 'API Conectada' : 'Modo Offline'}
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

    // ===== CARGAR DATOS REALES =====
    async loadRealData() {
        try {
            // Cargar en paralelo
            const [vehicles, stats, featured] = await Promise.all([
                this.getVehicles({ limit: 100 }),
                this.getVehicleStats(),
                this.getFeaturedVehicles(8)
            ]);

            console.log(`📊 Datos cargados: ${vehicles.vehicles.length} vehículos, ${featured.length} destacados`);

            // Actualizar página principal
            this.updateHomePage(featured, stats);
            
            // Actualizar página de unidades disponibles
            this.updateUnitsPage(vehicles.vehicles);
            
            // Actualizar contadores de categorías
            this.updateCategoryCounters(vehicles.vehicles);

        } catch (error) {
            console.error('❌ Error cargando datos reales:', error);
            this.loadFallbackData();
        }
    }

    // ===== MÉTODOS DE API =====
    async getVehicles(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.apiUrl}/vehicles${queryString ? `?${queryString}` : ''}`;
        
        return await this.makeRequest(url);
    }

    async getVehicleStats() {
        return await this.makeRequest(`${this.apiUrl}/vehicles/stats`);
    }

    async getFeaturedVehicles(limit = 4) {
        return await this.makeRequest(`${this.apiUrl}/vehicles/featured?limit=${limit}`);
    }

    async makeRequest(url, options = {}) {
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        
        // Verificar cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutos
                return cached.data;
            }
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Guardar en cache
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;

        } catch (error) {
            console.error(`❌ API Request failed: ${url}`, error);
            throw error;
        }
    }

    // ===== ACTUALIZAR PÁGINA PRINCIPAL =====
    updateHomePage(featuredVehicles, stats) {
        // Actualizar vehículos destacados en el carrusel
        const featuredContainer = document.getElementById('unitsTrack');
        if (featuredContainer && featuredVehicles.length > 0) {
            featuredContainer.innerHTML = '';
            
            featuredVehicles.forEach(vehicle => {
                const card = this.createFeaturedCard(vehicle);
                featuredContainer.appendChild(card);
            });

            // Reinicializar carrusel
            if (window.initializeCarousel) {
                setTimeout(() => {
                    window.carouselInitialized = false;
                    window.initializeCarousel();
                }, 100);
            }
        }

        // Actualizar estadísticas
        this.updateStatsDisplay(stats);
    }

    createFeaturedCard(vehicle) {
        const card = document.createElement('div');
        card.className = 'unit-card';
        card.dataset.vehicleId = vehicle.id;
        card.dataset.vehicleData = JSON.stringify(vehicle);
        
        const imageUrl = this.getImageUrl(vehicle.images?.[0]);
        
        card.innerHTML = `
            <div class="unit-image">
                <img src="${imageUrl}" 
                     alt="${vehicle.full_name || vehicle.fullName}"
                     onerror="this.src='../assets/imagenes/placeholder-vehicle.jpg'">
            </div>
            <div class="unit-info">
                <h3 class="unit-title">${vehicle.full_name || vehicle.fullName}</h3>
                <div class="unit-details">
                    <span class="unit-year">${vehicle.year}</span> - 
                    ${vehicle.traccion || '6x2'} - 
                    ${this.formatNumber(vehicle.kilometers)} Km
                </div>
                <div class="unit-footer">
                    <button class="btn-view-unit" onclick="viewVehicleDetail('${vehicle.id}')">
                        VER UNIDAD
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    // ===== ACTUALIZAR PÁGINA DE UNIDADES =====
    updateUnitsPage(vehicles) {
        const vehiclesGrid = document.getElementById('vehicles-grid');
        if (!vehiclesGrid) return;

        // Limpiar contenido estático
        vehiclesGrid.innerHTML = '';

        // Renderizar vehículos reales
        vehicles.forEach(vehicle => {
            const card = this.createVehicleCard(vehicle);
            vehiclesGrid.appendChild(card);
        });

        // Agregar event listeners
        this.addVehicleCardListeners();
    }

    createVehicleCard(vehicle) {
        const card = document.createElement('div');
        card.className = 'vehicle-card';
        card.dataset.vehicleId = vehicle.id;
        card.dataset.vehicleData = JSON.stringify(vehicle);
        
        const imageUrl = this.getImageUrl(vehicle.images?.[0]);
        const statusClass = vehicle.status?.toLowerCase() === 'disponible' ? 'available' : 'reserved';
        
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
                <p class="vehicle-subtitle">${vehicle.description || vehicle.type_name || ''}</p>
                <div class="vehicle-specs">
                    <div class="vehicle-spec">
                        <span class="icon-calendar">📅</span>
                        <span class="vehicle-spec-value">${vehicle.year}</span>
                    </div>
                    <div class="vehicle-spec">
                        <span class="icon-road">🛣️</span>
                        <span class="vehicle-spec-value">${this.formatNumber(vehicle.kilometers)} km</span>
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

    // ===== ACTUALIZAR CONTADORES DE CATEGORÍAS =====
    updateCategoryCounters(vehicles) {
        const categoryCounts = {
            'all': vehicles.length,
            'camion-tractor': vehicles.filter(v => v.type === 'camion-tractor').length,
            'camion-chasis': vehicles.filter(v => v.type === 'camion-chasis').length,
            'remolques': vehicles.filter(v => v.type === 'remolques').length,
            'utilitarios': vehicles.filter(v => v.type === 'utilitarios').length,
            'varios': vehicles.filter(v => v.type === 'varios').length
        };

        // Actualizar contadores en página principal
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            const category = button.dataset.category;
            if (categoryCounts[category] !== undefined) {
                let badge = button.querySelector('.category-count');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'category-count';
                    button.appendChild(badge);
                }
                badge.textContent = `(${categoryCounts[category]})`;
            }
        });

        // Actualizar contadores en página de unidades
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            const category = item.dataset.category;
            const countElement = item.querySelector('.category-count');
            if (countElement && categoryCounts[category] !== undefined) {
                countElement.textContent = `(${categoryCounts[category]})`;
            }
        });

        // Actualizar total de vehículos
        const totalElements = document.querySelectorAll('#total-vehicles');
        totalElements.forEach(el => {
            el.textContent = vehicles.length;
        });
    }

    // ===== DATOS DE FALLBACK =====
    loadFallbackData() {
        console.log('📦 Cargando datos de fallback...');
        
        // Mostrar notificación
        this.showNotification(
            'Modo offline: Datos limitados disponibles',
            'warning',
            5000
        );

        // Datos estáticos mínimos
        const fallbackVehicles = [
            {
                id: 'fallback-1',
                full_name: 'VOLKSWAGEN 17-280',
                brand: 'Volkswagen',
                model: '17-280',
                year: 2017,
                kilometers: 660000,
                type: 'camion-tractor',
                traccion: '6x2',
                transmission: 'Manual',
                power: 280,
                status: 'Disponible',
                images: ['assets/imagenes/camiones productos/IMG_2273.HEIC']
            }
        ];

        // Actualizar con datos de fallback
        this.updateHomePage(fallbackVehicles, {
            total: 1,
            available: 1,
            featured: 1
        });
    }

    // ===== UTILIDADES =====
    getImageUrl(imagePath) {
        if (!imagePath) return '../assets/imagenes/placeholder-vehicle.jpg';
        
        if (imagePath.startsWith('http')) return imagePath;
        
        if (imagePath.startsWith('/static') || imagePath.startsWith('static')) {
            return `${this.apiUrl.replace('/api/v1', '')}/${imagePath.replace(/^\//, '')}`;
        }
        
        return imagePath;
    }

    formatNumber(num) {
        if (!num) return '0';
        return new Intl.NumberFormat('es-AR').format(num);
    }

    updateStatsDisplay(stats) {
        const elements = {
            totalVehicles: document.querySelectorAll('[data-stat="total-vehicles"]'),
            availableVehicles: document.querySelectorAll('[data-stat="available-vehicles"]'),
            featuredVehicles: document.querySelectorAll('[data-stat="featured-vehicles"]')
        };
        
        elements.totalVehicles.forEach(el => {
            this.animateCounter(el, stats.total || 0);
        });
        
        elements.availableVehicles.forEach(el => {
            this.animateCounter(el, stats.available || 0);
        });
        
        elements.featuredVehicles.forEach(el => {
            this.animateCounter(el, stats.featured || 0);
        });
    }

    animateCounter(element, targetValue, duration = 2000) {
        const startValue = 0;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    addVehicleCardListeners() {
        const vehicleCards = document.querySelectorAll('.vehicle-card:not([data-listeners-added])');
        
        vehicleCards.forEach(card => {
            card.setAttribute('data-listeners-added', 'true');
            
            card.addEventListener('click', function() {
                const vehicleData = JSON.parse(this.dataset.vehicleData);
                
                // Guardar datos para página de detalle
                sessionStorage.setItem('currentVehicle', JSON.stringify(vehicleData));
                
                // Redirigir
                window.location.href = `detalleVehiculo.html?id=${vehicleData.id}`;
            });
        });
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `api-notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#3D5FAC'};
            color: ${type === 'warning' ? '#000' : '#fff'};
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 350px;
            font-weight: 600;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

// ===== FUNCIÓN GLOBAL PARA VER DETALLE =====
function viewVehicleDetail(vehicleId) {
    const vehicleCard = document.querySelector(`[data-vehicle-id="${vehicleId}"]`);
    if (vehicleCard) {
        const vehicleData = JSON.parse(vehicleCard.dataset.vehicleData);
        sessionStorage.setItem('currentVehicle', JSON.stringify(vehicleData));
    }
    
    window.location.href = `sections/detalleVehiculo.html?id=${vehicleId}`;
}

// ===== INICIALIZACIÓN =====
let frontendAPI;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando Frontend API...');
    frontendAPI = new FrontendAPI();
    
    // Hacer disponible globalmente
    window.frontendAPI = frontendAPI;
    window.viewVehicleDetail = viewVehicleDetail;
});

console.log('🔌 Frontend API Integration cargado');