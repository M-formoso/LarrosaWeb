// scripts/api.js - VERSIÓN CORREGIDA PARA MANEJO DE IMÁGENES

class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/v1';
        this.staticURL = 'http://localhost:8000'; // URL base para archivos estáticos
        this.timeout = 10000;
        this.retries = 3;
        this.imageCache = new Map(); // Cache para URLs de imágenes
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

    // MÉTODO CORREGIDO PARA MANEJO DE IMÁGENES
    // ===== REEMPLAZAR EL MÉTODO getImageUrl EN scripts/api.js =====

// MÉTODO CORREGIDO PARA MANEJO DE IMÁGENES
getImageUrl(imageData) {
    console.log('🖼️ Processing image data:', imageData);
    
    // Si imageData es null o undefined
    if (!imageData) {
        console.log('⚠️ No image data provided, using placeholder');
        return '../assets/imagenes/placeholder-vehicle.jpg';
    }
    
    // Si es un string
    if (typeof imageData === 'string') {
        let finalUrl;
        
        // Si es una URL completa con http/https
        if (imageData.startsWith('http')) {
            finalUrl = imageData;
            console.log('✅ Full HTTP URL found:', finalUrl);
            return finalUrl;
        } 
        
        // Si es una ruta que comienza con 'static/' (SIN BARRA INICIAL)
        if (imageData.startsWith('static/')) {
            // CONSTRUIR URL CORRECTA
            finalUrl = `http://localhost:8000/${imageData}`;
            console.log('✅ Static path converted:', finalUrl);
            return finalUrl;
        }
        
        // Si comienza con '/static/' (CON BARRA INICIAL)
        if (imageData.startsWith('/static/')) {
            finalUrl = `http://localhost:8000${imageData}`;
            console.log('✅ Absolute static path converted:', finalUrl);
            return finalUrl;
        }
        
        // Si parece ser un nombre de archivo directo
        if (imageData.includes('.')) {
            // Asumir que está en la carpeta de vehículos
            finalUrl = `http://localhost:8000/static/uploads/vehicles/${imageData}`;
            console.log('✅ Filename converted to full path:', finalUrl);
            return finalUrl;
        }
        
        // Fallback: tratar como ruta relativa
        console.log('⚠️ Using as relative path:', imageData);
        return imageData;
    } 
    
    // Si es un objeto de imagen del backend
    if (typeof imageData === 'object' && imageData !== null) {
        console.log('📦 Image object detected:', imageData);
        
        // Buscar diferentes propiedades posibles
        const imagePath = imageData.file_path || 
                         imageData.filename || 
                         imageData.url || 
                         imageData.path ||
                         imageData.image_url ||
                         imageData.src;
        
        if (imagePath) {
            console.log('🔍 Found path in object:', imagePath);
            return this.getImageUrl(imagePath); // Recursión con el string encontrado
        } else {
            console.warn('⚠️ No valid path found in image object:', Object.keys(imageData));
        }
    }
    
    // Fallback final
    console.warn('⚠️ Could not determine image URL for:', imageData);
    return '../assets/imagenes/placeholder-vehicle.jpg';
}
// AGREGAR TAMBIÉN ESTE MÉTODO PARA DEBUG
debugImageInfo(imageData) {
    console.log('🔍 DEBUG IMAGE INFO:');
    console.log('Input data:', imageData);
    console.log('Type:', typeof imageData);
    console.log('Is Array:', Array.isArray(imageData));
    
    if (typeof imageData === 'object' && imageData !== null) {
        console.log('Object keys:', Object.keys(imageData));
        console.log('Object values:', Object.values(imageData));
    }
    
    const processedUrl = this.getImageUrl(imageData);
    console.log('Processed URL:', processedUrl);
    
    // Verificar si la URL es accesible
    this.verifyImageAccessibility(processedUrl);
    
    return processedUrl;
}

// Verificar accesibilidad de imagen
async verifyImageAccessibility(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`🔗 Image accessibility: ${response.status} ${response.statusText} for ${url}`);
        return response.ok;
    } catch (error) {
        console.log(`❌ Image not accessible: ${url} - ${error.message}`);
        return false;
    }
}

    // Verificar qué URL de imagen funciona (async)
    async verifyImageUrl(originalData, possiblePaths) {
        for (const url of possiblePaths) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`✅ Working image URL found: ${url}`);
                    // Actualizar cache con la URL que funciona
                    this.imageCache.set(originalData, url);
                    break;
                }
            } catch (error) {
                // Continuar con la siguiente URL
                continue;
            }
        }
    }

    // Método para manejar errores de carga de imágenes
    handleImageError(imgElement, fallbackSrc = null) {
        if (!imgElement) return;
        
        const currentSrc = imgElement.src;
        const placeholder = fallbackSrc || '../assets/imagenes/placeholder-vehicle.jpg';
        
        // Evitar bucle infinito
        if (currentSrc !== placeholder) {
            console.log('🖼️ Image failed to load, using fallback:', currentSrc);
            imgElement.src = placeholder;
            imgElement.alt = 'Imagen no disponible';
            
            // Marcar como error para evitar reintentos
            imgElement.dataset.imageError = 'true';
        }
    }

    // Método para precargar imágenes
    async preloadImage(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log('✅ Image preloaded:', imageUrl);
                resolve(imageUrl);
            };
            img.onerror = () => {
                console.log('❌ Failed to preload:', imageUrl);
                reject(new Error(`Failed to load image: ${imageUrl}`));
            };
            img.src = imageUrl;
        });
    }

    // Método para obtener múltiples URLs de imágenes
    getImageUrls(imagesArray) {
        if (!Array.isArray(imagesArray)) {
            return [this.getImageUrl(imagesArray)];
        }
        
        return imagesArray.map(img => this.getImageUrl(img));
    }

    // Método para debug de imágenes
    debugImageInfo(imageData) {
        console.log('🔍 DEBUG IMAGE INFO:');
        console.log('Input data:', imageData);
        console.log('Type:', typeof imageData);
        console.log('Is Array:', Array.isArray(imageData));
        
        if (typeof imageData === 'object' && imageData !== null) {
            console.log('Object keys:', Object.keys(imageData));
            console.log('Object values:', Object.values(imageData));
        }
        
        const processedUrl = this.getImageUrl(imageData);
        console.log('Processed URL:', processedUrl);
        
        // Verificar si la URL es accesible
        this.verifyImageAccessibility(processedUrl);
        
        return processedUrl;
    }

    // Verificar accesibilidad de imagen
    async verifyImageAccessibility(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            console.log(`🔗 Image accessibility: ${response.status} ${response.statusText} for ${url}`);
        } catch (error) {
            console.log(`❌ Image not accessible: ${url} - ${error.message}`);
        }
    }

    // Limpiar cache de imágenes
    clearImageCache() {
        this.imageCache.clear();
        console.log('🗑️ Image cache cleared');
    }

    // Obtener información del cache
    getCacheInfo() {
        return {
            size: this.imageCache.size,
            entries: Array.from(this.imageCache.entries())
        };
    }
}

// ===== FUNCIONES GLOBALES PARA DEBUG =====

    // Función para debug desde la consola
window.debugImages = function(vehicleData = null) {
    console.log('=== DEBUG IMÁGENES ===');
    
    if (!window.apiClient) {
        console.log('❌ APIClient no disponible');
        return;
    }
    
    const apiClient = window.apiClient;
    
    // Info del cache
    const cacheInfo = apiClient.getCacheInfo();
    console.log('📋 Cache info:', cacheInfo);
    
    // Si se proporciona data de vehículo, analizarla
    if (vehicleData) {
        console.log('🚗 Analyzing vehicle data:', vehicleData);
        console.log('📷 Images data:', vehicleData.images);
        
        if (vehicleData.images && vehicleData.images.length > 0) {
            vehicleData.images.forEach((img, index) => {
                console.log(`   Image ${index + 1}:`, apiClient.debugImageInfo(img));
            });
        }
    }
    
    // Verificar URLs del backend
    const testUrls = [
        'http://localhost:8000/health',
        'http://localhost:8000/debug/files',
        'http://localhost:8000/static/',
        'http://localhost:8000/images/',
        'http://localhost:8000/api/v1/vehicles/stats'
    ];
    
    console.log('🔗 Testing backend URLs...');
    testUrls.forEach(async (url) => {
        try {
            const response = await fetch(url);
            console.log(`   ${url}: ${response.status} ${response.statusText}`);
        } catch (error) {
            console.log(`   ${url}: ❌ ${error.message}`);
        }
    });
};

// Función para limpiar problemas de imágenes
window.fixImages = function() {
    console.log('🔧 Fixing image display issues...');
    
    if (window.apiClient) {
        window.apiClient.clearImageCache();
    }
    
    // Recargar todas las imágenes fallidas
    document.querySelectorAll('img[data-image-error="true"]').forEach(img => {
        const originalSrc = img.dataset.originalSrc || img.src;
        console.log('🔄 Retrying image:', originalSrc);
        img.removeAttribute('data-image-error');
        img.src = originalSrc;
    });
    
    // Forzar recarga de imágenes de vehículos
    document.querySelectorAll('.vehicle-image img').forEach(img => {
        if (img.src.includes('placeholder')) {
            const card = img.closest('.vehicle-card');
            if (card && card.dataset.vehicleData) {
                try {
                    const vehicleData = JSON.parse(card.dataset.vehicleData);
                    if (vehicleData.images && vehicleData.images.length > 0) {
                        const newSrc = window.apiClient.getImageUrl(vehicleData.images[0]);
                        console.log('🔄 Updating image src:', newSrc);
                        img.src = newSrc;
                    }
                } catch (error) {
                    console.log('❌ Error parsing vehicle data:', error);
                }
            }
        }
    });
};

// Función para verificar configuración del backend
window.checkBackendSetup = async function() {
    console.log('🔍 Checking backend setup...');
    
    try {
        // 1. Health check
        const health = await fetch('http://localhost:8000/health');
        const healthData = await health.json();
        console.log('💚 Health check:', healthData);
        
        // 2. Debug files endpoint
        const files = await fetch('http://localhost:8000/debug/files');
        const filesData = await files.json();
        console.log('📁 Files debug:', filesData);
        
        // 3. Verificar directorio static
        const staticTest = await fetch('http://localhost:8000/static/');
        console.log('📂 Static directory test:', staticTest.status);
        
        // 4. Obtener vehículos con imágenes
        const vehicles = await fetch('http://localhost:8000/api/v1/vehicles?limit=1');
        const vehiclesData = await vehicles.json();
        console.log('🚗 Sample vehicle data:', vehiclesData);
        
        if (vehiclesData.vehicles && vehiclesData.vehicles[0] && vehiclesData.vehicles[0].images) {
            const firstImage = vehiclesData.vehicles[0].images[0];
            console.log('🖼️ First image data:', firstImage);
            
            // Probar diferentes URLs para la imagen
            const testImageUrls = [
                `http://localhost:8000/${firstImage.file_path}`,
                `http://localhost:8000/static/uploads/vehicles/${firstImage.filename}`,
                `http://localhost:8000/images/${firstImage.filename}`,
                `http://localhost:8000/media/${firstImage.filename}`
            ];
            
            console.log('🔗 Testing image URLs:');
            for (const url of testImageUrls) {
                try {
                    const response = await fetch(url, { method: 'HEAD' });
                    console.log(`   ${url}: ${response.status} ${response.statusText}`);
                } catch (error) {
                    console.log(`   ${url}: ❌ ${error.message}`);
                }
            }
        }
        
    } catch (error) {
        console.log('❌ Backend setup check failed:', error);
    }
};