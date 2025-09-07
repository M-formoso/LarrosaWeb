// ===== INDEX DINÁMICO - CARGAR DATOS DESDE API =====
// scripts/index-dynamic.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Inicializando página de inicio con datos dinámicos...');
    
    // Cargar vehículos destacados
    loadFeaturedVehicles();
    
    // Cargar estadísticas
    loadVehicleStats();
    
    // Actualizar contadores de categorías
    updateCategoryCounters();
});

// Cargar vehículos destacados
async function loadFeaturedVehicles() {
    const featuredContainer = document.getElementById('unitsTrack');
    if (!featuredContainer) {
        console.log('ℹ️ Container de vehículos destacados no encontrado');
        return;
    }

    try {
        console.log('⭐ Cargando vehículos destacados...');
        
        // Mostrar estado de carga
        showLoadingState(featuredContainer);
        
        // Obtener vehículos destacados desde la API
        const featuredVehicles = await apiClient.getFeaturedVehicles(8); // Cargar 8 para el carrusel
        
        if (!featuredVehicles || featuredVehicles.length === 0) {
            console.log('⚠️ No hay vehículos destacados disponibles');
            showEmptyState(featuredContainer, 'No hay vehículos destacados disponibles');
            return;
        }

        console.log(`✅ ${featuredVehicles.length} vehículos destacados cargados`);
        
        // Limpiar contenedor
        featuredContainer.innerHTML = '';
        
        // Crear tarjetas de vehículos destacados
        featuredVehicles.forEach(vehicle => {
            const unitCard = createFeaturedVehicleCard(vehicle);
            featuredContainer.appendChild(unitCard);
        });
        
        // Agregar event listeners
        addVehicleCardListeners();
        
        // Reinicializar carrusel si existe
        if (window.initializeCarousel) {
            setTimeout(() => {
                window.carouselInitialized = false; // Reset para permitir reinicialización
                window.initializeCarousel();
            }, 100);
        }
        
    } catch (error) {
        console.error('❌ Error cargando vehículos destacados:', error);
        showErrorState(featuredContainer, 'Error al cargar vehículos destacados');
        handleGlobalError(error, 'vehículos destacados');
    }
}

// Crear tarjeta de vehículo destacado (formato específico del carrusel)
function createFeaturedVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.className = 'unit-card';
    card.dataset.vehicleId = vehicle.id;
    card.dataset.vehicleData = JSON.stringify(vehicle);
    
    const imageUrl = apiClient.getImageUrl(vehicle.images?.[0] || '');
    
    card.innerHTML = `
        <div class="unit-image">
            <img src="${imageUrl}" 
                 alt="${vehicle.full_name || vehicle.fullName}"
                 onerror="apiClient.handleImageError(this)">
        </div>
        <div class="unit-info">
            <h3 class="unit-title">${vehicle.full_name || vehicle.fullName}</h3>
            <div class="unit-details">
                <span class="unit-year">${vehicle.year}</span> - 
                ${vehicle.traccion || '6x2'} - 
                ${formatNumber(vehicle.kilometers)} Km
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

// Función para ver detalle de vehículo
function viewVehicleDetail(vehicleId) {
    // Buscar los datos del vehículo
    const vehicleCard = document.querySelector(`[data-vehicle-id="${vehicleId}"]`);
    if (vehicleCard) {
        const vehicleData = JSON.parse(vehicleCard.dataset.vehicleData);
        sessionStorage.setItem('currentVehicle', JSON.stringify(vehicleData));
    }
    
    // Redirigir a página de detalle
    window.location.href = `sections/detalleVehiculo.html?id=${vehicleId}`;
}

// Cargar estadísticas de vehículos
async function loadVehicleStats() {
    try {
        console.log('📊 Cargando estadísticas de vehículos...');
        
        const stats = await apiClient.getVehicleStats();
        
        // Actualizar contadores en la página
        updateStatsDisplay(stats);
        
        console.log('✅ Estadísticas cargadas:', stats);
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
        // Mantener valores por defecto en caso de error
    }
}

// Actualizar visualización de estadísticas
function updateStatsDisplay(stats) {
    // Actualizar contadores si existen elementos en la página
    const totalVehiclesElements = document.querySelectorAll('[data-stat="total-vehicles"]');
    const availableVehiclesElements = document.querySelectorAll('[data-stat="available-vehicles"]');
    const featuredVehiclesElements = document.querySelectorAll('[data-stat="featured-vehicles"]');
    
    totalVehiclesElements.forEach(el => {
        animateCounter(el, stats.total || 0);
    });
    
    availableVehiclesElements.forEach(el => {
        animateCounter(el, stats.available || 0);
    });
    
    featuredVehiclesElements.forEach(el => {
        animateCounter(el, stats.featured || 0);
    });
}

// Animar contadores
function animateCounter(element, targetValue, duration = 2000) {
    const startValue = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Función de easing suave
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
        
        element.textContent = formatNumber(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = formatNumber(targetValue);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Actualizar contadores de categorías
async function updateCategoryCounters() {
    try {
        console.log('🏷️ Actualizando contadores de categorías...');
        
        // Obtener todos los vehículos para contar por categoría
        const allVehicles = await apiClient.getVehicles({ limit: 1000 });
        
        if (!allVehicles?.vehicles) {
            console.log('⚠️ No se pudieron cargar datos para contadores');
            return;
        }
        
        const vehicles = allVehicles.vehicles;
        
        // Contar por categorías
        const categoryCounts = {
            'all': vehicles.length,
            'camion-tractor': vehicles.filter(v => v.type === 'camion-tractor').length,
            'camion-chasis': vehicles.filter(v => v.type === 'camion-chasis').length,
            'remolques': vehicles.filter(v => v.type === 'remolques').length,
            'utilitarios': vehicles.filter(v => v.type === 'utilitarios').length,
            'varios': vehicles.filter(v => v.type === 'varios').length
        };
        
        // Actualizar botones de categoría en el hero
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            const category = button.dataset.category;
            if (categoryCounts[category] !== undefined) {
                // Crear o actualizar badge de contador
                let badge = button.querySelector('.category-count');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'category-count';
                    button.appendChild(badge);
                }
                badge.textContent = `(${categoryCounts[category]})`;
            }
        });
        
        console.log('✅ Contadores de categorías actualizados:', categoryCounts);
        
    } catch (error) {
        console.error('❌ Error actualizando contadores:', error);
    }
}

// Función para manejar clicks en categorías (actualizada)
function handleCategoryClick(categoryType) {
    console.log(`🏷️ Categoría seleccionada: ${categoryType}`);
    
    // Redirigir a unidades disponibles con filtro
    const url = `sections/unidadesDisponibles.html${categoryType !== 'all' ? `?category=${categoryType}` : ''}`;
    window.location.href = url;
}

// Función de inicialización de conexión
async function initializeBackendConnection() {
    try {
        console.log('🔌 Verificando conexión con backend...');
        
        // Hacer una petición simple para verificar la conexión
        await apiClient.getVehicleStats();
        
        console.log('✅ Conexión con backend establecida');
        
        // Mostrar indicador de conexión (opcional)
        showConnectionStatus(true);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error conectando con backend:', error);
        
        // Mostrar indicador de desconexión
        showConnectionStatus(false);
        
        // Mostrar notificación de error
        showNotification(
            'Error de conexión con el servidor. Mostrando datos de ejemplo.',
            'warning',
            8000
        );
        
        return false;
    }
}

// Mostrar estado de conexión
function showConnectionStatus(connected) {
    // Remover indicadores existentes
    const existingIndicator = document.querySelector('.connection-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Crear nuevo indicador
    const indicator = document.createElement('div');
    indicator.className = 'connection-indicator';
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
        ${connected ? 'Conectado' : 'Sin conexión'}
    `;
    
    document.body.appendChild(indicator);
    
    // Auto-ocultar el indicador de éxito después de 3 segundos
    if (connected) {
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.opacity = '0';
                setTimeout(() => indicator.remove(), 300);
            }
        }, 3000);
    }
}

// Función para fallback con datos estáticos
function loadStaticFallback() {
    console.log('📦 Cargando datos estáticos como fallback...');
    
    // Aquí puedes mantener algunos datos estáticos como fallback
    const staticVehicles = [
        {
            id: 'static-1',
            full_name: 'VOLKSWAGEN 17-280',
            fullName: 'VOLKSWAGEN 17-280',
            year: 2017,
            kilometers: 660000,
            type: 'camion-tractor',
            traccion: '6x2',
            transmission: 'Manual',
            images: ['assets/imagenes/camiones productos/IMG_2273.HEIC'],
            status: 'Disponible'
        },
        // Más vehículos estáticos...
    ];
    
    // Cargar datos estáticos en el carrusel
    const featuredContainer = document.getElementById('unitsTrack');
    if (featuredContainer) {
        featuredContainer.innerHTML = '';
        staticVehicles.forEach(vehicle => {
            const card = createFeaturedVehicleCard(vehicle);
            featuredContainer.appendChild(card);
        });
        addVehicleCardListeners();
    }
}

// Exportar funciones globales
window.viewVehicleDetail = viewVehicleDetail;
window.handleCategoryClick = handleCategoryClick;
window.loadFeaturedVehicles = loadFeaturedVehicles;
window.updateCategoryCounters = updateCategoryCounters;

// Inicializar conexión al cargar
document.addEventListener('DOMContentLoaded', async function() {
    const connected = await initializeBackendConnection();
    
    if (!connected) {
        // Cargar datos estáticos como fallback
        loadStaticFallback();
    }
});

console.log('🏠 Script de índice dinámico cargado');