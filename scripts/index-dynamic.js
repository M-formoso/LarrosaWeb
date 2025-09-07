class DynamicIndex {
    constructor() {
        this.apiClient = new APIClient();
        this.init();
    }

    async init() {
        console.log('🏠 Inicializando página de inicio dinámica...');
        
        try {
            // Verificar conexión primero
            const connected = await this.testConnection();
            
            if (connected) {
                await this.loadRealData();
            } else {
                this.loadStaticFallback();
            }
        } catch (error) {
            console.error('❌ Error en inicialización:', error);
            this.loadStaticFallback();
        }
    }

    async testConnection() {
        try {
            await this.apiClient.getVehicleStats();
            this.showConnectionStatus(true);
            return true;
        } catch (error) {
            console.warn('⚠️ Backend no disponible:', error.message);
            this.showConnectionStatus(false);
            return false;
        }
    }

    async loadRealData() {
        try {
            console.log('📊 Cargando datos reales...');
            
            // Cargar datos en paralelo
            const [featuredVehicles, stats] = await Promise.all([
                this.apiClient.getFeaturedVehicles(8),
                this.apiClient.getVehicleStats()
            ]);

            console.log(`✅ ${featuredVehicles.length} vehículos destacados cargados`);
            
            // Actualizar página
            this.updateFeaturedVehicles(featuredVehicles);
            this.updateStats(stats);
            
            // Cargar contadores de categorías
            await this.updateCategoryCounters();
            
        } catch (error) {
            console.error('❌ Error cargando datos reales:', error);
            this.loadStaticFallback();
        }
    }

    updateFeaturedVehicles(vehicles) {
        const container = document.getElementById('unitsTrack');
        if (!container) {
            console.log('ℹ️ Container de vehículos destacados no encontrado');
            return;
        }

        if (!vehicles || vehicles.length === 0) {
            console.log('⚠️ No hay vehículos destacados disponibles');
            this.showEmptyState(container, 'No hay vehículos destacados');
            return;
        }

        // Limpiar contenedor
        container.innerHTML = '';
        
        // Crear tarjetas
        vehicles.forEach(vehicle => {
            const card = this.createFeaturedCard(vehicle);
            container.appendChild(card);
        });
        
        // Agregar event listeners
        this.addCardListeners();
        
        // Reinicializar carrusel si existe
        if (window.initializeCarousel && typeof window.initializeCarousel === 'function') {
            setTimeout(() => {
                window.carouselInitialized = false;
                window.initializeCarousel();
            }, 100);
        }
        
        console.log(`✅ ${vehicles.length} vehículos destacados renderizados`);
    }

    createFeaturedCard(vehicle) {
        const card = document.createElement('div');
        card.className = 'unit-card';
        card.dataset.vehicleId = vehicle.id;
        card.dataset.vehicleData = JSON.stringify(vehicle);
        
        // CORREGIDO: Manejo seguro de imágenes
        let imageUrl = '../assets/imagenes/placeholder-vehicle.jpg';
        
        if (vehicle.images && vehicle.images.length > 0) {
            imageUrl = this.apiClient.getImageUrl(vehicle.images[0]);
        }
        
        card.innerHTML = `
            <div class="unit-image">
                <img src="${imageUrl}" 
                     alt="${vehicle.full_name || vehicle.fullName || 'Vehículo'}"
                     onerror="apiClient.handleImageError(this)">
            </div>
            <div class="unit-info">
                <h3 class="unit-title">${vehicle.full_name || vehicle.fullName || 'Vehículo'}</h3>
                <div class="unit-details">
                    <span class="unit-year">${vehicle.year || 'N/A'}</span> - 
                    ${vehicle.traccion || '6x2'} - 
                    ${this.formatNumber(vehicle.kilometers || 0)} Km
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

    updateStats(stats) {
        if (!stats) return;
        
        console.log('📊 Actualizando estadísticas:', stats);
        
        // Actualizar elementos de estadísticas
        const statElements = {
            total: document.querySelectorAll('[data-stat="total-vehicles"]'),
            available: document.querySelectorAll('[data-stat="available-vehicles"]'),
            featured: document.querySelectorAll('[data-stat="featured-vehicles"]')
        };
        
        statElements.total.forEach(el => {
            this.animateCounter(el, stats.total || 0);
        });
        
        statElements.available.forEach(el => {
            this.animateCounter(el, stats.available || 0);
        });
        
        statElements.featured.forEach(el => {
            this.animateCounter(el, stats.featured || 0);
        });
    }

    async updateCategoryCounters() {
        try {
            console.log('🏷️ Actualizando contadores de categorías...');
            
            // Obtener todos los vehículos para contar por categoría
            const response = await this.apiClient.getVehicles({ limit: 1000 });
            const vehicles = response.vehicles || [];
            
            if (vehicles.length === 0) {
                console.log('⚠️ No hay vehículos para contar');
                return;
            }
            
            // Contar por categorías
            const categoryCounts = {
                'all': vehicles.length,
                'camion-tractor': vehicles.filter(v => v.type === 'camion-tractor').length,
                'camion-chasis': vehicles.filter(v => v.type === 'camion-chasis').length,
                'remolques': vehicles.filter(v => v.type === 'remolques').length,
                'utilitarios': vehicles.filter(v => v.type === 'utilitarios').length,
                'varios': vehicles.filter(v => v.type === 'varios').length
            };
            
            // Actualizar botones de categoría
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
            
            console.log('✅ Contadores actualizados:', categoryCounts);
            
        } catch (error) {
            console.error('❌ Error actualizando contadores:', error);
        }
    }

    loadStaticFallback() {
        console.log('📦 Cargando datos estáticos como fallback...');
        
        this.showNotification(
            'Modo offline: Mostrando contenido estático',
            'warning',
            5000
        );
        
        // Mantener el contenido estático que ya existe en el HTML
        // No hacer nada para preservar el contenido existente
    }

    // Utilidades
    formatNumber(num) {
        if (!num) return '0';
        return new Intl.NumberFormat('es-AR').format(num);
    }

    animateCounter(element, targetValue, duration = 2000) {
        if (!element) return;
        
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

    addCardListeners() {
        const cards = document.querySelectorAll('.unit-card:not([data-listeners-added])');
        
        cards.forEach(card => {
            card.setAttribute('data-listeners-added', 'true');
            
            card.addEventListener('click', function() {
                const vehicleData = JSON.parse(this.dataset.vehicleData);
                sessionStorage.setItem('currentVehicle', JSON.stringify(vehicleData));
                window.location.href = `sections/detalleVehiculo.html?id=${vehicleData.id}`;
            });
        });
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

    showEmptyState(container, message) {
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

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `dynamic-notification notification-${type}`;
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

// ===== CORRECCIÓN PARA MAIN.JS - Evitar variables duplicadas =====
// Agregar al inicio de main.js para evitar el error de variable duplicada
if (typeof currentTestimonial === 'undefined') {
    let currentTestimonial = 0;
}

// ===== INICIALIZACIÓN =====
let apiClient;
let dynamicIndex;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando sistema completo...');
    
    // Inicializar API client
    apiClient = new APIClient();
    
    // Inicializar página dinámica
    dynamicIndex = new DynamicIndex();
    
    // Hacer disponibles globalmente
    window.apiClient = apiClient;
    window.dynamicIndex = dynamicIndex;
    window.viewVehicleDetail = viewVehicleDetail;
    
    console.log('✅ Sistema inicializado correctamente');
});

console.log('🔌 Sistema de integración frontend cargado');