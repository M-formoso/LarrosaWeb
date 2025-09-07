// ===== CONFIGURACIÓN DE API PARA FRONTEND =====
// scripts/api.js

// Configuración de la API
const API_CONFIG = {
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 10000,
    retries: 3
};

// Clase para manejar las peticiones HTTP
class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.timeout = API_CONFIG.timeout;
    }

    // Método genérico para hacer peticiones
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: AbortSignal.timeout(this.timeout),
            ...options
        };

        try {
            console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ API Response:`, data);
            return data;

        } catch (error) {
            console.error(`❌ API Error:`, error);
            
            if (error.name === 'AbortError') {
                throw new Error('La solicitud tardó demasiado tiempo');
            }
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Error de conexión. Verifique que el backend esté funcionando.');
            }
            
            throw error;
        }
    }

    // Métodos específicos para vehículos
    async getVehicles(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/vehicles${queryString ? `?${queryString}` : ''}`;
        return await this.request(endpoint);
    }

    async getVehicle(id) {
        return await this.request(`/vehicles/${id}`);
    }

    async getVehicleStats() {
        return await this.request('/vehicles/stats');
    }

    async getFeaturedVehicles(limit = 4) {
        return await this.request(`/vehicles/featured?limit=${limit}`);
    }

    async searchVehicles(searchTerm, filters = {}) {
        const params = {
            search: searchTerm,
            ...filters
        };
        return await this.getVehicles(params);
    }

    // Método para obtener imagen estática
    getImageUrl(imagePath) {
        if (!imagePath) return '../assets/imagenes/placeholder-vehicle.jpg';
        
        // Si es una URL completa, devolverla tal como está
        if (imagePath.startsWith('http')) return imagePath;
        
        // Si es una ruta del backend, construir la URL completa
        if (imagePath.startsWith('/static') || imagePath.startsWith('static')) {
            return `${this.baseURL.replace('/api/v1', '')}/${imagePath.replace(/^\//, '')}`;
        }
        
        // Si es una ruta local, devolverla tal como está
        return imagePath;
    }

    // Método para manejar errores de carga de imágenes
    handleImageError(imgElement) {
        imgElement.src = '../assets/imagenes/placeholder-vehicle.jpg';
        imgElement.alt = 'Imagen no disponible';
    }
}

// Instancia global del cliente API
const apiClient = new APIClient();

// Función helper para formatear números
function formatNumber(num) {
    if (!num) return '0';
    return new Intl.NumberFormat('es-AR').format(num);
}

// Función helper para formatear fecha
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR');
    } catch {
        return dateString;
    }
}

// Función para mostrar estados de carga
function showLoadingState(container, show = true) {
    if (!container) return;
    
    if (show) {
        container.innerHTML = `
            <div class="loading-vehicles">
                <div class="loading-spinner"></div>
                <p>Cargando vehículos...</p>
            </div>
        `;
    }
}

// Función para mostrar estado de error
function showErrorState(container, message = 'Error al cargar los datos') {
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Error de carga</h3>
            <p>${message}</p>
            <button class="retry-btn" onclick="location.reload()">
                <i class="fas fa-redo"></i>
                Reintentar
            </button>
        </div>
    `;
}

// Función para mostrar estado vacío
function showEmptyState(container, message = 'No se encontraron vehículos') {
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="fas fa-truck"></i>
            </div>
            <h3>Sin resultados</h3>
            <p>${message}</p>
            <a href="contacto.html" class="contact-btn">
                <i class="fas fa-phone"></i>
                Contactar para más opciones
            </a>
        </div>
    `;
}

// Función para crear HTML de tarjeta de vehículo
function createVehicleCardHTML(vehicle) {
    const imageUrl = apiClient.getImageUrl(vehicle.images?.[0] || '');
    const statusClass = vehicle.status?.toLowerCase() === 'disponible' ? 'available' : 'reserved';
    
    return `
        <div class="vehicle-card" data-vehicle-id="${vehicle.id}" data-vehicle-data='${JSON.stringify(vehicle)}'>
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
                <p class="vehicle-subtitle">${vehicle.description || vehicle.type_name || ''}</p>
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
        </div>
    `;
}

// Función para agregar event listeners a las tarjetas
function addVehicleCardListeners() {
    const vehicleCards = document.querySelectorAll('.vehicle-card:not([data-listeners-added])');
    
    vehicleCards.forEach(card => {
        card.setAttribute('data-listeners-added', 'true');
        
        card.addEventListener('click', function() {
            const vehicleData = JSON.parse(this.dataset.vehicleData);
            
            // Guardar datos en sessionStorage para la página de detalle
            sessionStorage.setItem('currentVehicle', JSON.stringify(vehicleData));
            
            // Redirigir a página de detalle
            window.location.href = `detalleVehiculo.html?id=${vehicleData.id}`;
        });
        
        // Añadir efectos hover
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

// Función para manejar errores globalmente
function handleGlobalError(error, context = '') {
    console.error(`❌ Error${context ? ` en ${context}` : ''}:`, error);
    
    // Mostrar notificación de error al usuario
    showNotification(
        `Error${context ? ` en ${context}` : ''}: ${error.message}`,
        'error'
    );
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info', duration = 5000) {
    // Remover notificaciones existentes
    const existingNotifications = document.querySelectorAll('.api-notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `api-notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#3D5FAC'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
        font-weight: 600;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animar salida
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// Exportar para uso global
window.apiClient = apiClient;
window.createVehicleCardHTML = createVehicleCardHTML;
window.addVehicleCardListeners = addVehicleCardListeners;
window.showLoadingState = showLoadingState;
window.showErrorState = showErrorState;
window.showEmptyState = showEmptyState;
window.handleGlobalError = handleGlobalError;
window.showNotification = showNotification;
window.formatNumber = formatNumber;
window.formatDate = formatDate;

console.log('🔌 API Client cargado correctamente');