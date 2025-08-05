// DETALLE VEHÍCULO - JavaScript

// Global Variables
let currentVehicle = null;
let currentImageIndex = 0;
let vehicleImages = [];

// Configuration
const CONFIG = {
    whatsappNumber: '5493512345678',
    phoneNumber: '+5493512345678',
    email: 'info@larrosacamiones.com'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚛 Iniciando Detalle Vehículo...');
    
    loadVehicleData();
    initializeImageGallery();
    initializeContactButtons();
    initializeMapFunctionality();
    loadRelatedVehicles();
    
    console.log('✅ Detalle Vehículo inicializado correctamente');
});

// === DATA MANAGEMENT ===
function loadVehicleData() {
    // Get vehicle data from sessionStorage or URL params
    const storedVehicle = sessionStorage.getItem('currentVehicle');
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get('id');
    
    if (storedVehicle) {
        currentVehicle = JSON.parse(storedVehicle);
        populateVehicleData(currentVehicle);
    } else if (vehicleId) {
        // If no stored data, generate sample data based on ID
        currentVehicle = generateSampleVehicleData(vehicleId);
        populateVehicleData(currentVehicle);
    } else {
        // Fallback to default data
        currentVehicle = getDefaultVehicleData();
        populateVehicleData(currentVehicle);
    }
}

function generateSampleVehicleData(vehicleId) {
    return {
        id: vehicleId,
        brand: 'Iveco',
        model: 'Stralis 360 AT',
        fullName: 'Iveco Stralis 360',
        type: 'camion-tractor',
        typeName: 'Tractor',
        year: 2017,
        kilometers: 770000,
        power: 360,
        traccion: '6x2',
        transmission: 'Automática',
        color: 'Blanco',
        status: 'Entrega inmediata',
        location: 'Villa María, Córdoba',
        dateRegistered: '15/07/2025',
        observations: '-',
        images: [
            '../assets/imagenes/iveco-stralis-main.jpg',
            '../assets/imagenes/iveco-stralis-side.jpg',
            '../assets/imagenes/iveco-stralis-back.jpg',
            '../assets/imagenes/iveco-stralis-interior.jpg'
        ],
        description: 'Iveco Stralis 360 en excelente estado. Mantenimiento al día, documentación en regla. Ideal para trabajo pesado y larga distancia.'
    };
}

function getDefaultVehicleData() {
    return generateSampleVehicleData('default');
}

function populateVehicleData(vehicle) {
    // Update page title and meta
    document.title = `${vehicle.fullName} - Larrosa Camiones`;
    document.getElementById('vehicle-title').textContent = `${vehicle.fullName} - Larrosa Camiones`;
    
    // Update breadcrumb
    const breadcrumbVehicle = document.getElementById('breadcrumb-vehicle');
    if (breadcrumbVehicle) {
        breadcrumbVehicle.textContent = vehicle.fullName;
    }
    
    // Update vehicle header
    const vehicleName = document.getElementById('vehicle-name');
    if (vehicleName) {
        vehicleName.textContent = vehicle.fullName;
    }
    
    // Update specifications
    updateSpecification('spec-marca', vehicle.brand);
    updateSpecification('spec-modelo', vehicle.model);
    updateSpecification('spec-año', vehicle.year);
    updateSpecification('spec-color', vehicle.color);
    updateSpecification('spec-km', formatNumber(vehicle.kilometers));
    updateSpecification('spec-fecha', vehicle.dateRegistered);
    updateSpecification('spec-tipo', vehicle.typeName);
    updateSpecification('spec-traccion', vehicle.traccion);
    updateSpecification('spec-transmision', vehicle.transmission);
    updateSpecification('spec-potencia', `${vehicle.power} Hp`);
    updateSpecification('spec-observaciones', vehicle.observations);
    
    // Update images
    vehicleImages = vehicle.images || [];
    if (vehicleImages.length > 0) {
        updateMainImage(vehicleImages[0]);
        updateThumbnails();
    }
}

function updateSpecification(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// === IMAGE GALLERY MANAGEMENT ===
function initializeImageGallery() {
    // Image gallery is initialized when vehicle data is loaded
    currentImageIndex = 0;
}

function updateMainImage(imageSrc) {
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.src = imageSrc;
        mainImage.alt = currentVehicle ? currentVehicle.fullName : 'Vehículo';
    }
}

function updateThumbnails() {
    const thumbnailsContainer = document.querySelector('.thumbnails-container');
    if (!thumbnailsContainer || vehicleImages.length === 0) return;
    
    thumbnailsContainer.innerHTML = '';
    
    vehicleImages.forEach((imageSrc, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.onclick = () => selectImage(index);
        
        thumbnail.innerHTML = `
            <img src="${imageSrc}" alt="Vista ${index + 1}" 
                 onerror="this.src='../assets/imagenes/placeholder-vehicle.jpg'">
        `;
        
        thumbnailsContainer.appendChild(thumbnail);
    });
}

function selectImage(index) {
    if (index < 0 || index >= vehicleImages.length) return;
    
    currentImageIndex = index;
    updateMainImage(vehicleImages[index]);
    
    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function nextImage() {
    const nextIndex = (currentImageIndex + 1) % vehicleImages.length;
    selectImage(nextIndex);
}

function previousImage() {
    const prevIndex = currentImageIndex === 0 ? vehicleImages.length - 1 : currentImageIndex - 1;
    selectImage(prevIndex);
}

// === CONTACT FUNCTIONALITY ===
function initializeContactButtons() {
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    const phoneBtn = document.querySelector('.phone-btn');
    const emailBtn = document.querySelector('.email-btn');
    const shareBtn = document.querySelector('.share-btn');
    
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
}

function openWhatsApp() {
    if (!currentVehicle) return;
    
    const message = `Hola! Me interesa el ${currentVehicle.fullName} (${currentVehicle.year}). ¿Podrían brindarme más información sobre disponibilidad y precio?`;
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    trackEvent('Contact', 'WhatsApp', currentVehicle.fullName);
}

function makePhoneCall() {
    window.location.href = `tel:${CONFIG.phoneNumber}`;
    trackEvent('Contact', 'Phone', currentVehicle ? currentVehicle.fullName : 'Unknown');
}

function sendEmail() {
    if (!currentVehicle) return;
    
    const subject = `Consulta sobre ${currentVehicle.fullName}`;
    const body = `Hola,\n\nMe interesa obtener más información sobre el ${currentVehicle.fullName} (${currentVehicle.year}) que tienen disponible.\n\nPor favor, contactenme para coordinar una visita o recibir más detalles.\n\nGracias.`;
    
    const emailUrl = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
    
    trackEvent('Contact', 'Email', currentVehicle.fullName);
}

function shareVehicle() {
    if (navigator.share && currentVehicle) {
        navigator.share({
            title: currentVehicle.fullName,
            text: `Mirá este ${currentVehicle.fullName} en Larrosa Camiones`,
            url: window.location.href
        }).then(() => {
            trackEvent('Share', 'Native', currentVehicle.fullName);
        }).catch(console.error);
    } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('Enlace copiado al portapapeles', 'success');
            trackEvent('Share', 'Clipboard', currentVehicle ? currentVehicle.fullName : 'Unknown');
        }).catch(() => {
            showNotification('Error al copiar enlace', 'error');
        });
    }
}

// === MAP FUNCTIONALITY ===
function initializeMapFunctionality() {
    const mapTabs = document.querySelectorAll('.map-tab');
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    const mapControlBtns = document.querySelectorAll('.map-control-btn');
    
    // Map tabs functionality
    mapTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            mapTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Here you would implement map type switching
            const mapType = this.textContent.toLowerCase();
            switchMapType(mapType);
        });
    });
    
    // Fullscreen functionality
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleMapFullscreen);
    }
    
    // Map control buttons
    mapControlBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-plus')) {
                zoomIn();
            } else if (icon.classList.contains('fa-minus')) {
                zoomOut();
            } else if (icon.classList.contains('fa-crosshairs')) {
                centerMap();
            } else if (icon.classList.contains('fa-expand-arrows-alt')) {
                toggleMapFullscreen();
            }
        });
    });
}

function switchMapType(type) {
    console.log(`Switching map to: ${type}`);
    // Implementation would depend on the map service being used
}

function toggleMapFullscreen() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;
    
    if (mapContainer.classList.contains('fullscreen')) {
        mapContainer.classList.remove('fullscreen');
        document.body.style.overflow = 'auto';
    } else {
        mapContainer.classList.add('fullscreen');
        document.body.style.overflow = 'hidden';
    }
}

function zoomIn() {
    console.log('Zooming in...');
    // Implementation would depend on the map service
}

function zoomOut() {
    console.log('Zooming out...');
    // Implementation would depend on the map service
}

function centerMap() {
    console.log('Centering map...');
    // Implementation would depend on the map service
}

// === RELATED VEHICLES ===
function loadRelatedVehicles() {
    const relatedGrid = document.getElementById('related-vehicles');
    if (!relatedGrid || !currentVehicle) return;
    
    // Generate sample related vehicles
    const relatedVehicles = generateRelatedVehicles();
    
    relatedGrid.innerHTML = '';
    
    relatedVehicles.forEach(vehicle => {
        const vehicleCard = createRelatedVehicleCard(vehicle);
        relatedGrid.appendChild(vehicleCard);
    });
}

function generateRelatedVehicles() {
    const brands = ['Scania', 'Volvo', 'Mercedes', 'Iveco'];
    const vehicles = [];
    
    for (let i = 1; i <= 4; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const year = 2015 + Math.floor(Math.random() * 8);
        const km = Math.floor(Math.random() * 600000) + 200000;
        
        vehicles.push({
            id: `related-${i}`,
            brand: brand,
            model: `Modelo ${Math.floor(Math.random() * 500) + 100}`,
            fullName: `${brand} ${currentVehicle.typeName} ${Math.floor(Math.random() * 500) + 100}`,
            year: year,
            kilometers: km,
            type: currentVehicle.type,
            typeName: currentVehicle.typeName,
            status: 'Disponible',
            image: `../assets/imagenes/related-${i}.jpg`
        });
    }
    
    return vehicles;
}

function createRelatedVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.dataset.vehicleId = vehicle.id;
    
    card.innerHTML = `
        <div class="vehicle-image">
            <img src="${vehicle.image}" alt="${vehicle.fullName}" loading="lazy"
                 onerror="this.src='../assets/imagenes/placeholder-vehicle.jpg'">
            <div class="vehicle-status available">${vehicle.status}</div>
        </div>
        <div class="vehicle-content">
            <h3 class="vehicle-title">${vehicle.fullName}</h3>
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
                <span>Villa María, Córdoba</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', function() {
        // Store the new vehicle data and redirect
        sessionStorage.setItem('currentVehicle', JSON.stringify(vehicle));
        window.location.href = `detalleVehiculo.html?id=${vehicle.id}`;
    });
    
    return card;
}

// === KEYBOARD NAVIGATION ===
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
        case 'Escape':
            const fullscreenMap = document.querySelector('.map-container.fullscreen');
            if (fullscreenMap) {
                toggleMapFullscreen();
            }
            break;
    }
});

// === SCROLL ANIMATIONS ===
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.specs-section, .company-section, .related-vehicles-grid .vehicle-card');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// === UTILITY FUNCTIONS ===
function formatNumber(num) {
    return new Intl.NumberFormat('es-AR').format(num);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#3D5FAC'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function trackEvent(category, action, label) {
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            custom_parameter_1: 'Detalle_Vehiculo'
        });
    }
    
    console.log(`📊 Event: ${category} - ${action} - ${label}`);
}

// === GLOBAL FUNCTIONS FOR HTML ===
window.selectImage = selectImage;
window.nextImage = nextImage;
window.previousImage = previousImage;

// === RESPONSIVE HANDLING ===
window.addEventListener('resize', function() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Adjust image gallery for mobile
        const thumbnailsContainer = document.querySelector('.thumbnails-container');
        if (thumbnailsContainer) {
            thumbnailsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
    } else {
        const thumbnailsContainer = document.querySelector('.thumbnails-container');
        if (thumbnailsContainer) {
            thumbnailsContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
        }
    }
});

// === INITIALIZATION ===
// Initialize scroll animations after DOM load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeScrollAnimations, 500);
});

// === ERROR HANDLING ===
window.addEventListener('error', function(e) {
    console.error('❌ Error en Detalle Vehículo:', e.error);
    trackEvent('Error', 'JavaScript Error', e.error?.message || 'Unknown error');
});

// === PERFORMANCE MONITORING ===
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`⚡ Página de detalle cargada en ${Math.round(loadTime)}ms`);
    trackEvent('Performance', 'Page Load', Math.round(loadTime));
});

console.log('🚛 Detalle Vehículo JavaScript cargado correctamente');