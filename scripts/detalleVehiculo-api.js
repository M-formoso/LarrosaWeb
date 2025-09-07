// ===== DETALLE VEHÍCULO CON API =====
// scripts/detalleVehiculo-api.js

// Variables globales
let currentVehicle = null;
let currentImageIndex = 0;
let vehicleImages = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚛 Iniciando Detalle Vehículo con API...');
    
    // Cargar datos del vehículo
    loadVehicleData();
    
    // Inicializar componentes
    initializeImageGallery();
    initializeContactButtons();
    initializeMapFunctionality();
    initializeScrollAnimations();
    
    // Cargar vehículos relacionados
    loadRelatedVehicles();
    
    console.log('✅ Detalle Vehículo inicializado correctamente');
});

// Cargar datos del vehículo
async function loadVehicleData() {
    try {
        console.log('📦 Cargando datos del vehículo...');
        
        // Intentar obtener datos desde diferentes fuentes
        let vehicleData = null;
        
        // 1. Desde sessionStorage (si viene de otra página)
        const storedVehicle = sessionStorage.getItem('currentVehicle');
        if (storedVehicle) {
            try {
                vehicleData = JSON.parse(storedVehicle);
                console.log('✅ Datos cargados desde sessionStorage');
            } catch (error) {
                console.warn('⚠️ Error parseando datos de sessionStorage:', error);
            }
        }
        
        // 2. Desde URL params
        if (!vehicleData) {
            const urlParams = new URLSearchParams(window.location.search);
            const vehicleId = urlParams.get('id');
            
            if (vehicleId) {
                try {
                    console.log(`🔍 Buscando vehículo ID: ${vehicleId} en API...`);
                    vehicleData = await apiClient.getVehicle(vehicleId);
                    console.log('✅ Datos cargados desde API');
                } catch (error) {
                    console.warn('⚠️ Error cargando desde API:', error);
                }
            }
        }
        
        // 3. Fallback con datos de ejemplo
        if (!vehicleData) {
            console.log('📦 Usando datos de fallback...');
            vehicleData = generateFallbackVehicleData();
        }
        
        // Asignar datos y poblar la página
        currentVehicle = vehicleData;
        populateVehicleData(currentVehicle);
        
    } catch (error) {
        console.error('❌ Error cargando datos del vehículo:', error);
        showErrorState();
    }
}

// Poblar datos del vehículo en la página
function populateVehicleData(vehicle) {
    if (!vehicle) {
        console.error('❌ No hay datos de vehículo para mostrar');
        showErrorState();
        return;
    }
    
    console.log('🔧 Poblando datos del vehículo:', vehicle);
    
    try {
        // Actualizar título de la página
        const pageTitle = `${vehicle.full_name || vehicle.fullName} - Larrosa Camiones`;
        document.title = pageTitle;
        document.getElementById('vehicle-title').textContent = pageTitle;
        
        // Actualizar nombre del vehículo
        const vehicleName = document.getElementById('vehicle-name');
        if (vehicleName) {
            vehicleName.textContent = vehicle.full_name || vehicle.fullName;
        }
        
        // Actualizar especificaciones
        updateSpecification('spec-marca', vehicle.brand);
        updateSpecification('spec-modelo', vehicle.model);
        updateSpecification('spec-año', vehicle.year);
        updateSpecification('spec-color', vehicle.color || 'No especificado');
        updateSpecification('spec-km', formatNumber(vehicle.kilometers));
        updateSpecification('spec-fecha', formatVehicleDate(vehicle.date_registered || vehicle.dateRegistered));
        updateSpecification('spec-tipo', vehicle.type_name || vehicle.typeName);
        updateSpecification('spec-traccion', vehicle.traccion || 'No especificado');
        updateSpecification('spec-transmision', vehicle.transmission || 'No especificado');
        updateSpecification('spec-potencia', vehicle.power ? `${vehicle.power} HP` : 'No especificado');
        updateSpecification('spec-observaciones', vehicle.observations || '-');
        
        // Actualizar estado del vehículo
        updateVehicleStatus(vehicle.status || 'Disponible');
        
        // Actualizar ubicación
        updateVehicleLocation(vehicle.location || 'Villa María, Córdoba');
        
        // Actualizar imágenes
        updateVehicleImages(vehicle.images || []);
        
        console.log('✅ Datos del vehículo poblados correctamente');
        
    } catch (error) {
        console.error('❌ Error poblando datos:', error);
        showErrorState();
    }
}

// Actualizar especificación individual
function updateSpecification(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value || 'No especificado';
    }
}

// Actualizar estado del vehículo
function updateVehicleStatus(status) {
    const statusElements = document.querySelectorAll('.vehicle-status-badge');
    statusElements.forEach(element => {
        element.innerHTML = `
            <i class="fas fa-bolt"></i>
            <span>${status}</span>
        `;
        
        // Agregar clase CSS según el estado
        element.className = 'vehicle-status-badge';
        if (status.toLowerCase() === 'disponible') {
            element.classList.add('available');
        } else if (status.toLowerCase() === 'reservado') {
            element.classList.add('reserved');
        }
    });
}

// Actualizar ubicación del vehículo
function updateVehicleLocation(location) {
    const locationElements = document.querySelectorAll('.vehicle-location');
    locationElements.forEach(element => {
        element.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <span>${location}</span>
        `;
    });
}

// Actualizar imágenes del vehículo
function updateVehicleImages(images) {
    vehicleImages = images.map(img => apiClient.getImageUrl(img)) || [];
    
    if (vehicleImages.length === 0) {
        // Si no hay imágenes, usar placeholder
        vehicleImages = ['../assets/imagenes/placeholder-vehicle.jpg'];
    }
    
    // Actualizar imagen principal
    updateMainImage(vehicleImages[0]);
    
    // Actualizar thumbnails
    updateThumbnails();
    
    console.log(`🖼️ ${vehicleImages.length} imágenes cargadas`);
}

// Formatear fecha del vehículo
function formatVehicleDate(dateString) {
    if (!dateString) return 'No especificada';
    
    try {
        // Si ya está en formato DD/MM/YYYY, devolverlo tal como está
        if (dateString.includes('/')) {
            return dateString;
        }
        
        // Si es una fecha ISO, convertirla
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR');
    } catch (error) {
        return dateString;
    }
}

// Generar datos de fallback
function generateFallbackVehicleData() {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get('id') || 'fallback-1';
    
    return {
        id: vehicleId,
        brand: 'Iveco',
        model: 'Stralis 360 AT',
        full_name: 'Iveco Stralis 360',
        fullName: 'Iveco Stralis 360',
        type: 'camion-tractor',
        type_name: 'Tractor',
        typeName: 'Tractor',
        year: 2017,
        kilometers: 770000,
        power: 360,
        traccion: '6x2',
        transmission: 'Automática',
        color: 'Blanco',
        status: 'Disponible',
        location: 'Villa María, Córdoba',
        date_registered: '15/07/2025',
        dateRegistered: '15/07/2025',
        observations: '-',
        images: [
            '../assets/imagenes/IMG_2278.HEIC',
            '../assets/imagenes/iveco-stralis-side.jpg',
            '../assets/imagenes/iveco-stralis-back.jpg'
        ],
        description: 'Iveco Stralis 360 en excelente estado. Mantenimiento al día, documentación en regla. Ideal para trabajo pesado y larga distancia.'
    };
}

// Gestión de galería de imágenes
function initializeImageGallery() {
    currentImageIndex = 0;
    
    // Navegación con teclado
    document.addEventListener('keydown', function(event) {
        if (vehicleImages.length === 0) return;
        
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                previousImage();
                break;
            case 'ArrowRight':
                event.preventDefault();
                nextImage();
                break;
        }
    });
}

function updateMainImage(imageSrc) {
    const mainImage = document.getElementById('main-image');
    if (!mainImage) return;
    
    // Efecto de carga
    mainImage.style.opacity = '0.5';
    
    // Precargar imagen
    const newImage = new Image();
    newImage.onload = function() {
        mainImage.src = imageSrc;
        mainImage.style.opacity = '1';
        mainImage.alt = currentVehicle ? currentVehicle.full_name || currentVehicle.fullName : 'Vehículo';
    };
    newImage.onerror = function() {
        apiClient.handleImageError(mainImage);
        mainImage.style.opacity = '1';
    };
    newImage.src = imageSrc;
}

function updateThumbnails() {
    const thumbnailsContainer = document.querySelector('.thumbnails-container');
    if (!thumbnailsContainer || vehicleImages.length === 0) return;
    
    thumbnailsContainer.innerHTML = '';
    
    vehicleImages.forEach((imageSrc, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.onclick = () => selectImage(index);
        thumbnail.setAttribute('tabindex', '0');
        thumbnail.setAttribute('role', 'button');
        thumbnail.setAttribute('aria-label', `Vista ${index + 1}`);
        
        // Soporte de teclado
        thumbnail.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectImage(index);
            }
        });
        
        thumbnail.innerHTML = `
            <img src="${imageSrc}" 
                 alt="Vista ${index + 1}"
                 onerror="apiClient.handleImageError(this)">
        `;
        
        thumbnailsContainer.appendChild(thumbnail);
    });
}

function selectImage(index) {
    if (index < 0 || index >= vehicleImages.length) return;
    
    currentImageIndex = index;
    updateMainImage(vehicleImages[index]);
    
    // Actualizar thumbnail activo
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    console.log(`🖼️ Imagen seleccionada: ${index + 1}/${vehicleImages.length}`);
}

function nextImage() {
    const nextIndex = (currentImageIndex + 1) % vehicleImages.length;
    selectImage(nextIndex);
}

function previousImage() {
    const prevIndex = currentImageIndex === 0 ? vehicleImages.length - 1 : currentImageIndex - 1;
    selectImage(prevIndex);
}

// Funcionalidad de contacto
function initializeContactButtons() {
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    const phoneBtn = document.querySelector('.phone-btn');
    const emailBtn = document.querySelector('.email-btn');
    const shareBtn = document.querySelector('.share-btn');
    const priceBtn = document.querySelector('.price-btn');
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', openWhatsApp);
    }
    
    if (phoneBtn) {
        phoneBtn.addEventListener('click', makePhoneCall);
    }
    
    if (emailBtn) {
        emailBtn.addEventListener('click', sendEmail);
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', shareVehicle);
    }
    
    if (priceBtn) {
        priceBtn.addEventListener('click', consultPrice);
    }
}

function openWhatsApp() {
    if (!currentVehicle) return;
    
    const message = `Hola! Me interesa el ${currentVehicle.full_name || currentVehicle.fullName} (${currentVehicle.year}). ¿Podrían brindarme más información sobre disponibilidad y precio?`;
    const whatsappUrl = `https://wa.me/543534567890?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    console.log('📱 Abriendo WhatsApp');
    showNotification('Redirigiendo a WhatsApp...', 'success');
}

function makePhoneCall() {
    window.location.href = 'tel:+543534567890';
    console.log('📞 Iniciando llamada');
}

function sendEmail() {
    if (!currentVehicle) return;
    
    const subject = `Consulta sobre ${currentVehicle.full_name || currentVehicle.fullName}`;
    const body = `Hola,\n\nMe interesa obtener más información sobre el ${currentVehicle.full_name || currentVehicle.fullName} (${currentVehicle.year}) que tienen disponible.\n\nPor favor, contactenme para coordinar una visita o recibir más detalles.\n\nGracias.`;
    
    const emailUrl = `mailto:info@larrosacamiones.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
    
    console.log('📧 Abriendo email');
}

function consultPrice() {
    if (!currentVehicle) return;
    
    // Redirigir al formulario de contacto con información del vehículo
    const params = new URLSearchParams({
        vehicle: currentVehicle.full_name || currentVehicle.fullName,
        year: currentVehicle.year,
        id: currentVehicle.id
    });
    
    window.location.href = `contacto.html?${params.toString()}`;
    console.log('💰 Consultando precio');
}

function shareVehicle() {
    if (navigator.share && currentVehicle) {
        navigator.share({
            title: currentVehicle.full_name || currentVehicle.fullName,
            text: `Mirá este ${currentVehicle.full_name || currentVehicle.fullName} en Larrosa Camiones`,
            url: window.location.href
        }).then(() => {
            console.log('📤 Compartido exitosamente');
            showNotification('Compartido exitosamente', 'success');
        }).catch(console.error);
    } else {
        // Fallback: copiar URL al portapapeles
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('Enlace copiado al portapapeles', 'success');
            console.log('📋 URL copiada al portapapeles');
        }).catch(() => {
            showNotification('Error al copiar enlace', 'error');
        });
    }
}

// Funcionalidad del mapa
function initializeMapFunctionality() {
    const mapTabs = document.querySelectorAll('.map-tab');
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    const mapControlBtns = document.querySelectorAll('.map-control-btn');
    
    // Tabs del mapa
    mapTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            mapTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const mapType = this.textContent.toLowerCase();
            console.log(`🗺️ Cambiando mapa a: ${mapType}`);
        });
    });
    
    // Pantalla completa
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleMapFullscreen);
    }
    
    // Controles del mapa
    mapControlBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-plus')) {
                console.log('🔍 Zoom in');
            } else if (icon.classList.contains('fa-minus')) {
                console.log('🔍 Zoom out');
            } else if (icon.classList.contains('fa-crosshairs')) {
                console.log('🎯 Centrar mapa');
            } else if (icon.classList.contains('fa-expand-arrows-alt')) {
                toggleMapFullscreen();
            }
        });
    });
}

function toggleMapFullscreen() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;
    
    if (mapContainer.classList.contains('fullscreen')) {
        mapContainer.classList.remove('fullscreen');
        document.body.style.overflow = 'auto';
        console.log('🗺️ Saliendo de pantalla completa');
    } else {
        mapContainer.classList.add('fullscreen');
        document.body.style.overflow = 'hidden';
        console.log('🗺️ Entrando en pantalla completa');
    }
}

// Cargar vehículos relacionados
async function loadRelatedVehicles() {
    const relatedGrid = document.getElementById('related-vehicles');
    if (!relatedGrid || !currentVehicle) return;
    
    try {
        console.log('🔍 Cargando vehículos relacionados...');
        
        // Mostrar estado de carga
        relatedGrid.innerHTML = '<div class="loading">Cargando vehículos relacionados...</div>';
        
        // Buscar vehículos del mismo tipo o marca
        const filters = {
            limit: 4,
            type: currentVehicle.type
        };
        
        // Excluir el vehículo actual
        const relatedVehicles = await apiClient.getVehicles(filters);
        
        if (relatedVehicles?.vehicles) {
            const filteredRelated = relatedVehicles.vehicles
                .filter(v => v.id !== currentVehicle.id)
                .slice(0, 4);
            
            if (filteredRelated.length > 0) {
                renderRelatedVehicles(filteredRelated);
                console.log(`✅ ${filteredRelated.length} vehículos relacionados cargados`);
            } else {
                relatedGrid.innerHTML = '<p>No hay vehículos relacionados disponibles.</p>';
            }
        } else {
            throw new Error('No se pudieron cargar vehículos relacionados');
        }
        
    } catch (error) {
        console.error('❌ Error cargando vehículos relacionados:', error);
        relatedGrid.innerHTML = '<p>Error cargando vehículos relacionados.</p>';
    }
}

function renderRelatedVehicles(vehicles) {
    const relatedGrid = document.getElementById('related-vehicles');
    if (!relatedGrid) return;
    
    relatedGrid.innerHTML = '';
    
    vehicles.forEach((vehicle, index) => {
        const vehicleCard = createRelatedVehicleCard(vehicle);
        vehicleCard.style.animationDelay = `${index * 0.1}s`;
        relatedGrid.appendChild(vehicleCard);
    });
    
    // Agregar event listeners
    addVehicleCardListeners();
}

function createRelatedVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.className = 'vehicle-card fade-in';
    card.dataset.vehicleId = vehicle.id;
    card.dataset.vehicleData = JSON.stringify(vehicle);
    
    const imageUrl = apiClient.getImageUrl(vehicle.images?.[0] || '');
    
    card.innerHTML = `
        <div class="vehicle-image">
            <img src="${imageUrl}" 
                 alt="${vehicle.full_name || vehicle.fullName}" 
                 loading="lazy"
                 onerror="apiClient.handleImageError(this)">
            <div class="vehicle-status available">${vehicle.status || 'Disponible'}</div>
        </div>
        <div class="vehicle-content">
            <h3 class="vehicle-title">${vehicle.full_name || vehicle.fullName}</h3>
            <div class="vehicle-specs">
                <div class="vehicle-spec">
                    <i class="fas fa-calendar"></i>
                    <span class="vehicle-spec-value">${vehicle.year}</span>
                </div>
                <div class="vehicle-spec">
                    <i class="fas fa-road"></i>
                    <span class="vehicle-spec-value">${formatNumber(vehicle.kilometers)} km</span>
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

// Animaciones al scroll
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                if (entry.target.classList.contains('vehicle-card')) {
                    entry.target.style.animationPlayState = 'running';
                }
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.specs-section, .company-section, .related-vehicles-grid .vehicle-card');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// Mostrar estado de error
function showErrorState() {
    const mainContent = document.querySelector('.vehicle-detail-main');
    if (mainContent) {
        const errorHTML = `
            <div class="error-state">
                <div class="container">
                    <div class="error-content">
                        <div class="error-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h2>Error al cargar el vehículo</h2>
                        <p>No se pudo cargar la información del vehículo solicitado.</p>
                        <div class="error-actions">
                            <button onclick="location.reload()" class="btn-retry">
                                <i class="fas fa-redo"></i>
                                Reintentar
                            </button>
                            <a href="unidadesDisponibles.html" class="btn-back">
                                <i class="fas fa-arrow-left"></i>
                                Volver a unidades
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        mainContent.innerHTML = errorHTML;
    }
}

// Funciones globales para HTML
window.selectImage = selectImage;
window.nextImage = nextImage;
window.previousImage = previousImage;
window.openWhatsApp = openWhatsApp;
window.makePhoneCall = makePhoneCall;
window.sendEmail = sendEmail;
window.consultPrice = consultPrice;
window.shareVehicle = shareVehicle;

// Manejo de errores
window.addEventListener('error', function(e) {
    console.error('❌ Error en Detalle Vehículo:', e.error);
});

// Monitoreo de performance
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`⚡ Página de detalle cargada en ${Math.round(loadTime)}ms`);
});

console.log('🚛 Detalle Vehículo API cargado correctamente');