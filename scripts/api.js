class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/v1';
        this.timeout = 10000;
        this.retries = 3;
    }

    // Método principal para hacer peticiones
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
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
                }
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
            
            if (error.message && error.message.includes('Failed to fetch')) {
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

    // CORREGIDO: Manejo de URLs de imágenes
    getImageUrl(imageData) {
        // Si imageData es null o undefined
        if (!imageData) {
            return '../assets/imagenes/placeholder-vehicle.jpg';
        }
        
        // Si es un string simple (ruta)
        if (typeof imageData === 'string') {
            // Si es una URL completa
            if (imageData.startsWith('http')) {
                return imageData;
            }
            
            // Si es una ruta del backend
            if (imageData.startsWith('/static') || imageData.startsWith('static')) {
                return `${this.baseURL.replace('/api/v1', '')}/${imageData.replace(/^\//, '')}`;
            }
            
            // Si es una ruta local
            return imageData;
        }
        
        // Si es un objeto de imagen del backend
        if (typeof imageData === 'object') {
            // Buscar diferentes propiedades posibles
            const imagePath = imageData.file_path || imageData.filename || imageData.url || imageData.path;
            
            if (imagePath) {
                return this.getImageUrl(imagePath); // Recursión con el string
            }
        }
        
        // Fallback si nada funciona
        console.warn('⚠️ No se pudo determinar la URL de la imagen:', imageData);
        return '../assets/imagenes/placeholder-vehicle.jpg';
    }

    // Método para manejar errores de carga de imágenes
    handleImageError(imgElement) {
        if (imgElement && imgElement.src !== '../assets/imagenes/placeholder-vehicle.jpg') {
            imgElement.src = '../assets/imagenes/placeholder-vehicle.jpg';
            imgElement.alt = 'Imagen no disponible';
            console.log('🖼️ Imagen de fallback cargada');
        }
    }
}