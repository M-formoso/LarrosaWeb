// ===== SISTEMA UNIFICADO LARROSA CAMIONES =====
// Archivo único que reemplaza todos los scripts conflictivos
// Versión: 1.0 - Limpio y optimizado

// ===== CONFIGURACIÓN GLOBAL =====
const LARROSA_CONFIG = {
    API_URL: 'http://localhost:8000/api/v1',
    STATIC_URL: 'http://localhost:8000',
    TIMEOUT: 10000,
    PLACEHOLDER_IMAGE: '../assets/imagenes/placeholder-vehicle.jpg'
};

// ===== 1. API CLIENT (ÚNICO Y DEFINITIVO) =====
class LarrosaAPIClient {
    constructor() {
        this.baseURL = LARROSA_CONFIG.API_URL;
        this.staticURL = LARROSA_CONFIG.STATIC_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            signal: AbortSignal.timeout(LARROSA_CONFIG.TIMEOUT),
            ...options
        };

        try {
            console.log(`🌐 API: ${config.method || 'GET'} ${url}`);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`❌ API Error:`, error);
            if (error.name === 'AbortError') throw new Error('Timeout');
            if (error.message.includes('Failed to fetch')) throw new Error('Sin conexión al backend');
            throw error;
        }
    }

    async getVehicles(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await this.request(`/vehicles${query ? `?${query}` : ''}`);
    }

    async getVehicle(id) {
        return await this.request(`/vehicles/${id}`);
    }

    // ===== MANEJO DE IMÁGENES (ÚNICO MÉTODO) =====
    getImageUrl(imageData) {
        if (!imageData) return LARROSA_CONFIG.PLACEHOLDER_IMAGE;

        // Si es string
        if (typeof imageData === 'string') {
            if (imageData.startsWith('http')) return imageData;
            if (imageData.startsWith('static/') || imageData.startsWith('/static/')) {
                return `${this.staticURL}/${imageData.replace(/^\//, '')}`;
            }
            return imageData;
        }

        // Si es objeto
        if (typeof imageData === 'object' && imageData !== null) {
            const path = imageData.file_path || imageData.filename || imageData.url || imageData.path;
            if (path) return this.getImageUrl(path);
        }

        return LARROSA_CONFIG.PLACEHOLDER_IMAGE;
    }

    handleImageError(imgElement) {
        if (imgElement && imgElement.src !== LARROSA_CONFIG.PLACEHOLDER_IMAGE) {
            imgElement.src = LARROSA_CONFIG.PLACEHOLDER_IMAGE;
            imgElement.alt = 'Imagen no disponible';
        }
    }
}

// ===== 2. UNIDADES DISPONIBLES =====
class UnidadesDisponibles {
    constructor() {
        this.api = new LarrosaAPIClient();
        this.vehicles = [];
        this.filtered = [];
        this.filters = { category: 'all', search: '' };
        this.currentSort = 'relevance';
    }

    async init() {
        console.log('🚛 Iniciando Unidades Disponibles...');
        
        if (await this.testConnection()) {
            await this.loadVehicles();
            this.setupUI();
            this.checkURLFilters();
        } else {
            this.showConnectionError();
        }
    }

    async testConnection() {
        try {
            const response = await fetch(`${LARROSA_CONFIG.STATIC_URL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }

    async loadVehicles() {
        try {
            this.showLoading(true);
            const data = await this.api.getVehicles({ limit: 100 });
            
            // Normalizar datos
            this.vehicles = (data.vehicles || data || []).map(v => this.normalizeVehicle(v));
            this.filtered = [...this.vehicles];
            
            console.log(`✅ ${this.vehicles.length} vehículos cargados`);
            
            this.updateCategoryCounters();
            this.renderVehicles();
        } catch (error) {
            console.error('❌ Error:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    normalizeVehicle(v) {
        return {
            id: v.id,
            brand: v.brand || 'Marca desconocida',
            model: v.model || 'Modelo desconocido',
            full_name: v.full_name || v.fullName || `${v.brand || ''} ${v.model || ''}`.trim(),
            year: v.year || new Date().getFullYear(),
            kilometers: v.kilometers || v.km || 0,
            power: v.power || v.hp || 0,
            type: v.type || v.vehicle_type || 'varios',
            type_name: v.type_name || v.typeName || this.getTypeName(v.type || 'varios'),
            status: v.status || 'Disponible',
            location: v.location || 'Villa María, Córdoba',
            transmission: v.transmission || 'Manual',
            traccion: v.traccion || v.traction || '4x2',
            description: v.description || 'Vehículo comercial',
            images: Array.isArray(v.images) ? v.images : (v.images ? [v.images] : []),
            is_featured: v.is_featured || false
        };
    }

    getTypeName(type) {
        const types = {
            'camion-tractor': 'Camión Tractor',
            'camion-chasis': 'Camión Chasis',
            'remolques': 'Remolques',
            'utilitarios': 'Utilitarios',
            'varios': 'Varios'
        };
        return types[type] || 'Varios';
    }

    renderVehicles() {
        const grid = document.getElementById('vehicles-grid');
        if (!grid) return;

        if (this.filtered.length === 0) {
            this.showEmpty();
            return;
        }

        grid.innerHTML = '';
        grid.className = 'vehicles-grid';

        this.filtered.forEach((vehicle, i) => {
            const card = this.createCard(vehicle);
            card.style.animationDelay = `${i * 0.05}s`;
            grid.appendChild(card);
        });

        // Actualizar contador
        const counter = document.getElementById('total-vehicles');
        if (counter) counter.textContent = this.filtered.length;
    }

    createCard(v) {
        const card = document.createElement('div');
        card.className = 'vehicle-card fade-in';
        card.dataset.vehicleId = v.id;
        
        const imageUrl = v.images[0] ? this.api.getImageUrl(v.images[0]) : LARROSA_CONFIG.PLACEHOLDER_IMAGE;
        const statusClass = v.status.toLowerCase().includes('disponible') ? 'available' : 'reserved';

        card.innerHTML = `
            <div class="vehicle-image">
                <img src="${imageUrl}" alt="${v.full_name}" loading="lazy"
                     onerror="this.src='${LARROSA_CONFIG.PLACEHOLDER_IMAGE}'">
                <div class="vehicle-status ${statusClass}">${v.status}</div>
                ${v.is_featured ? '<div class="vehicle-featured">⭐ Destacado</div>' : ''}
            </div>
            <div class="vehicle-content">
                <h3 class="vehicle-title">${v.full_name}</h3>
                <p class="vehicle-subtitle">${v.description}</p>
                <div class="vehicle-specs">
                    <div class="vehicle-spec">
                        <span class="vehicle-spec-icon">📅</span>
                        <span class="vehicle-spec-value">${v.year}</span>
                    </div>
                    <div class="vehicle-spec">
                        <span class="vehicle-spec-icon">🛣️</span>
                        <span class="vehicle-spec-value">${this.formatNumber(v.kilometers)} km</span>
                    </div>
                    <div class="vehicle-spec">
                        <span class="vehicle-spec-icon">⚙️</span>
                        <span class="vehicle-spec-value">${v.transmission}</span>
                    </div>
                    <div class="vehicle-spec">
                        <span class="vehicle-spec-icon">🔋</span>
                        <span class="vehicle-spec-value">${v.power} HP</span>
                    </div>
                </div>
            </div>
            <div class="vehicle-footer">
                <div class="vehicle-location">
                    <span>🇦🇷</span>
                    <span>${v.location}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => this.goToDetail(v));
        return card;
    }

    goToDetail(vehicle) {
        sessionStorage.setItem('currentVehicle', JSON.stringify(vehicle));
        window.location.href = `detalleVehiculo.html?id=${vehicle.id}`;
    }

    setupUI() {
        // Categorías
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
                item.classList.add('active');
                this.filterByCategory(item.dataset.category);
            });
        });

        // Búsqueda
        const searchInput = document.getElementById('filter-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.applyFilters();
            }, 300));
        }

        // Ordenamiento
        this.setupSorting();
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
                this.currentSort = option.dataset.sort;
                this.applySort();
                sortMenu.style.display = 'none';
                
                sortOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }

    filterByCategory(category) {
        this.filters.category = category;
        this.applyFilters();
    }

    applyFilters() {
        this.filtered = this.vehicles.filter(v => {
            // Categoría
            if (this.filters.category && this.filters.category !== 'all') {
                if (v.type !== this.filters.category) return false;
            }

            // Búsqueda
            if (this.filters.search) {
                const text = `${v.brand} ${v.model} ${v.full_name}`.toLowerCase();
                if (!text.includes(this.filters.search)) return false;
            }

            return true;
        });

        this.applySort();
        this.renderVehicles();
    }

    applySort() {
        this.filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'year-desc': return b.year - a.year;
                case 'year-asc': return a.year - b.year;
                case 'km-asc': return a.kilometers - b.kilometers;
                case 'km-desc': return b.kilometers - a.kilometers;
                default: // relevance
                    if (a.is_featured && !b.is_featured) return -1;
                    if (!a.is_featured && b.is_featured) return 1;
                    return 0;
            }
        });
    }

    checkURLFilters() {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category') || params.get('filter');
        
        if (category && category !== 'all') {
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.category === category) {
                    item.classList.add('active');
                }
            });
            
            this.filters.category = category;
            this.applyFilters();
        }
    }

    updateCategoryCounters() {
        const counts = { all: this.vehicles.length };
        this.vehicles.forEach(v => {
            counts[v.type] = (counts[v.type] || 0) + 1;
        });

        document.querySelectorAll('.category-item').forEach(item => {
            const count = item.querySelector('.category-count');
            if (count) {
                const category = item.dataset.category;
                count.textContent = `(${counts[category] || 0})`;
            }
        });
    }

    // Estados UI
    showLoading(show) {
        const grid = document.getElementById('vehicles-grid');
        if (!grid) return;

        if (show) {
            grid.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <h3>Cargando vehículos...</h3>
                </div>
            `;
        }
    }

    showEmpty() {
        const grid = document.getElementById('vehicles-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-truck"></i>
                    <h3>Sin vehículos</h3>
                    <p>No se encontraron vehículos con los filtros seleccionados</p>
                </div>
            `;
        }
    }

    showError(message) {
        const grid = document.getElementById('vehicles-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button onclick="window.larrosa.unidades.loadVehicles()" class="btn-retry">
                        Reintentar
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
                    <i class="fas fa-wifi-slash"></i>
                    <h3>Sin conexión</h3>
                    <p>No se puede conectar al backend</p>
                    <button onclick="window.larrosa.unidades.init()" class="btn-retry">
                        Probar conexión
                    </button>
                </div>
            `;
        }
    }

    // Utilidades
    formatNumber(num) {
        return new Intl.NumberFormat('es-AR').format(num || 0);
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
}

// ===== 3. DETALLE VEHÍCULO =====
class DetalleVehiculo {
    constructor() {
        this.api = new LarrosaAPIClient();
        this.vehicle = null;
        this.currentImageIndex = 0;
        this.images = [];
    }

    init() {
        console.log('🚗 Iniciando Detalle Vehículo...');
        this.loadVehicleData();
        this.setupContactButtons();
    }

    loadVehicleData() {
        try {
            // Obtener desde sessionStorage
            const stored = sessionStorage.getItem('currentVehicle');
            if (stored) {
                this.vehicle = JSON.parse(stored);
                this.populateData();
                return;
            }

            // Fallback
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            
            if (id) {
                this.loadFromAPI(id);
            } else {
                this.showError('No se encontró información del vehículo');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            this.showError('Error cargando datos');
        }
    }

    async loadFromAPI(id) {
        try {
            this.vehicle = await this.api.getVehicle(id);
            this.populateData();
        } catch (error) {
            this.showError('Error cargando desde API');
        }
    }

    populateData() {
        if (!this.vehicle) return;

        // Título
        document.title = `${this.vehicle.full_name} - Larrosa Camiones`;
        const nameEl = document.getElementById('vehicle-name');
        if (nameEl) nameEl.textContent = this.vehicle.full_name;

        // Especificaciones
        this.updateSpec('spec-marca', this.vehicle.brand);
        this.updateSpec('spec-modelo', this.vehicle.model);
        this.updateSpec('spec-año', this.vehicle.year);
        this.updateSpec('spec-color', this.vehicle.color || 'No especificado');
        this.updateSpec('spec-km', this.formatNumber(this.vehicle.kilometers));
        this.updateSpec('spec-tipo', this.vehicle.type_name);
        this.updateSpec('spec-traccion', this.vehicle.traccion);
        this.updateSpec('spec-transmision', this.vehicle.transmission);
        this.updateSpec('spec-potencia', `${this.vehicle.power} HP`);

        // Imágenes
        this.images = this.vehicle.images || [];
        if (this.images.length > 0) {
            this.updateMainImage(0);
            this.createThumbnails();
        }
    }

    updateSpec(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value || 'No especificado';
    }

    updateMainImage(index) {
        const mainImg = document.getElementById('main-image');
        if (!mainImg || !this.images[index]) return;

        const url = this.api.getImageUrl(this.images[index]);
        mainImg.src = url;
        mainImg.onerror = () => this.api.handleImageError(mainImg);
        
        this.currentImageIndex = index;
        this.updateActiveThumbnail();
    }

    createThumbnails() {
        const container = document.querySelector('.thumbnails-container');
        if (!container) return;

        container.innerHTML = '';
        this.images.forEach((img, i) => {
            const thumb = document.createElement('div');
            thumb.className = `thumbnail ${i === 0 ? 'active' : ''}`;
            thumb.onclick = () => this.updateMainImage(i);
            
            const thumbImg = document.createElement('img');
            thumbImg.src = this.api.getImageUrl(img);
            thumbImg.alt = `Vista ${i + 1}`;
            thumbImg.onerror = () => this.api.handleImageError(thumbImg);
            
            thumb.appendChild(thumbImg);
            container.appendChild(thumb);
        });
    }

    updateActiveThumbnail() {
        document.querySelectorAll('.thumbnail').forEach((t, i) => {
            t.classList.toggle('active', i === this.currentImageIndex);
        });
    }

    setupContactButtons() {
        const whatsapp = document.querySelector('.whatsapp-btn');
        const phone = document.querySelector('.phone-btn');
        const email = document.querySelector('.email-btn');

        if (whatsapp) whatsapp.addEventListener('click', () => this.openWhatsApp());
        if (phone) phone.addEventListener('click', () => this.makeCall());
        if (email) email.addEventListener('click', () => this.sendEmail());
    }

    openWhatsApp() {
        if (!this.vehicle) return;
        const msg = `Hola! Me interesa el ${this.vehicle.full_name} (${this.vehicle.year})`;
        window.open(`https://wa.me/5493534567890?text=${encodeURIComponent(msg)}`, '_blank');
    }

    makeCall() {
        window.location.href = 'tel:+5493534567890';
    }

    sendEmail() {
        if (!this.vehicle) return;
        const subject = `Consulta sobre ${this.vehicle.full_name}`;
        window.location.href = `mailto:info@larrosacamiones.com?subject=${encodeURIComponent(subject)}`;
    }

    showError(message) {
        const main = document.querySelector('.vehicle-detail-main');
        if (main) {
            main.innerHTML = `
                <div class="error-state">
                    <h2>Error</h2>
                    <p>${message}</p>
                    <a href="unidadesDisponibles.html">Volver a unidades</a>
                </div>
            `;
        }
    }

    formatNumber(num) {
        return new Intl.NumberFormat('es-AR').format(num || 0);
    }
}

// ===== FUNCIONES GLOBALES =====
window.selectImage = (index) => {
    if (window.larrosa?.detalle) {
        window.larrosa.detalle.updateMainImage(index);
    }
};

window.nextImage = () => {
    if (window.larrosa?.detalle) {
        const next = (window.larrosa.detalle.currentImageIndex + 1) % window.larrosa.detalle.images.length;
        window.larrosa.detalle.updateMainImage(next);
    }
};

window.previousImage = () => {
    if (window.larrosa?.detalle) {
        const prev = window.larrosa.detalle.currentImageIndex === 0 
            ? window.larrosa.detalle.images.length - 1 
            : window.larrosa.detalle.currentImageIndex - 1;
        window.larrosa.detalle.updateMainImage(prev);
    }
};

window.toggleFilterGroup = (titleElement) => {
    const group = titleElement.closest('.filter-group');
    const content = group.querySelector('.filter-content');
    const icon = titleElement.querySelector('.collapse-icon');
    
    group.classList.toggle('expanded');
    
    if (group.classList.contains('expanded')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        content.style.maxHeight = '0';
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
};

// ===== INICIALIZACIÓN AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();
    
    window.larrosa = window.larrosa || {};
    
    if (page === 'unidadesDisponibles.html') {
        window.larrosa.unidades = new UnidadesDisponibles();
        window.larrosa.unidades.init();
    }
    
    if (page === 'detalleVehiculo.html') {
        window.larrosa.detalle = new DetalleVehiculo();
        window.larrosa.detalle.init();
    }
});

console.log('✅ Sistema Unificado Larrosa Camiones cargado');