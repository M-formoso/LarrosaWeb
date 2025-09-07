// ===== CORRECCIÓN Y MEJORA DEL FORMULARIO DE VEHÍCULOS =====
// admin/dashboard-enhanced.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Inicializando panel de administración mejorado...');
    
    // Verificar autenticación
    if (!requireAdmin()) return;
    
    // Inicializar componentes
    initializeAdminPanel();
    loadDashboardData();
    setupEventListeners();
    initializeImageUpload();
    setupFormValidation();
    
    console.log('✅ Panel de administración inicializado');
});

// Configurar event listeners
function setupEventListeners() {
    // Navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            showSection(section);
        });
    });
    
    // CRÍTICO: Formulario de vehículos
    const addVehicleForm = document.getElementById('add-vehicle-form');
    if (addVehicleForm) {
        addVehicleForm.addEventListener('submit', handleVehicleFormSubmit);
        console.log('✅ Formulario de vehículos conectado');
    }
    
    // Dropdown de usuario
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function() {
            dropdownMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.user-menu-dropdown')) {
                dropdownMenu.classList.remove('active');
            }
        });
    }
    
    // Logout
    const logoutLinks = document.querySelectorAll('[data-action="logout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    });
}

// Manejar envío del formulario de vehículos
async function handleVehicleFormSubmit(event) {
    event.preventDefault();
    console.log('📝 Enviando formulario de vehículo...');
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validar formulario
    if (!validateVehicleForm(form)) {
        showMessage('Por favor completa todos los campos requeridos correctamente', 'error');
        return;
    }
    
    // Mostrar estado de carga
    setFormLoading(true, submitBtn);
    
    try {
        // Recopilar datos del formulario
        const formData = new FormData(form);
        const vehicleData = collectVehicleData(formData);
        
        console.log('📋 Datos del vehículo:', vehicleData);
        
        // Recopilar imágenes
        const imageFiles = Array.from(form.querySelector('#images').files);
        
        // Crear FormData para envío con imágenes
        const submissionData = new FormData();
        submissionData.append('vehicle_data', JSON.stringify(vehicleData));
        
        // Agregar imágenes
        imageFiles.forEach((file, index) => {
            submissionData.append('images', file);
        });
        
        console.log('📤 Enviando datos al servidor...');
        
        // Enviar al backend
        const response = await makeAuthenticatedRequest('/vehicles/', {
            method: 'POST',
            body: submissionData,
            headers: {} // No establecer Content-Type para FormData
        });
        
        console.log('✅ Vehículo creado exitosamente:', response);
        
        // Mostrar mensaje de éxito
        showMessage('¡Vehículo creado exitosamente!', 'success');
        
        // Limpiar formulario
        form.reset();
        clearImagePreview();
        
        // Actualizar dashboard
        await loadDashboardData();
        
        // Redirigir a la sección de vehículos
        setTimeout(() => {
            showSection('vehicles');
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error creando vehículo:', error);
        showMessage(`Error al crear vehículo: ${error.message}`, 'error');
    } finally {
        setFormLoading(false, submitBtn, originalText);
    }
}

// Recopilar datos del vehículo desde el formulario
function collectVehicleData(formData) {
    return {
        brand: formData.get('brand'),
        model: formData.get('model'),
        full_name: `${formData.get('brand')} ${formData.get('model')}`,
        type: formData.get('type'),
        type_name: getTypeName(formData.get('type')),
        year: parseInt(formData.get('year')),
        kilometers: parseInt(formData.get('kilometers')),
        power: parseInt(formData.get('power')) || null,
        traccion: formData.get('traccion') || null,
        transmission: formData.get('transmission') || null,
        color: formData.get('color') || null,
        status: formData.get('status'),
        price: parseFloat(formData.get('price')) || null,
        is_featured: formData.get('is_featured') === 'on',
        location: 'Villa María, Córdoba',
        description: formData.get('description') || null,
        observations: formData.get('observations') || null,
        date_registered: new Date().toLocaleDateString('es-AR'),
        is_active: true
    };
}

// Obtener nombre del tipo
function getTypeName(type) {
    const types = {
        'camion-tractor': 'Camión Tractor',
        'camion-chasis': 'Camión Chasis',
        'remolques': 'Remolques',
        'utilitarios': 'Utilitarios',
        'varios': 'Varios'
    };
    return types[type] || type;
}

// Validar formulario de vehículo
function validateVehicleForm(form) {
    const requiredFields = ['brand', 'model', 'year', 'kilometers', 'type', 'status'];
    let isValid = true;
    
    // Limpiar errores previos
    clearFormErrors(form);
    
    // Validar campos requeridos
    requiredFields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field || !field.value.trim()) {
            showFieldError(field, 'Este campo es requerido');
            isValid = false;
        }
    });
    
    // Validaciones específicas
    const year = parseInt(form.querySelector('[name="year"]').value);
    if (year < 1990 || year > new Date().getFullYear() + 1) {
        showFieldError(form.querySelector('[name="year"]'), 'Año inválido');
        isValid = false;
    }
    
    const kilometers = parseInt(form.querySelector('[name="kilometers"]').value);
    if (kilometers < 0) {
        showFieldError(form.querySelector('[name="kilometers"]'), 'Los kilómetros no pueden ser negativos');
        isValid = false;
    }
    
    const power = form.querySelector('[name="power"]').value;
    if (power && parseInt(power) < 0) {
        showFieldError(form.querySelector('[name="power"]'), 'La potencia no puede ser negativa');
        isValid = false;
    }
    
    return isValid;
}

// Mostrar error en campo
function showFieldError(field, message) {
    if (!field) return;
    
    field.classList.add('error');
    
    // Remover error previo
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Crear mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 0.85rem;
        margin-top: 5px;
        animation: fadeInUp 0.3s ease;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

// Limpiar errores del formulario
function clearFormErrors(form) {
    form.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
    });
    
    form.querySelectorAll('.field-error').forEach(error => {
        error.remove();
    });
}

// Configurar estado de carga del formulario
function setFormLoading(loading, submitBtn, originalText = null) {
    const form = document.getElementById('add-vehicle-form');
    
    if (loading) {
        // Deshabilitar formulario
        form.querySelectorAll('input, select, textarea, button').forEach(el => {
            el.disabled = true;
        });
        
        // Cambiar botón
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        }
        
        // Mostrar overlay
        showLoadingOverlay('Creando vehículo...');
        
    } else {
        // Habilitar formulario
        form.querySelectorAll('input, select, textarea, button').forEach(el => {
            el.disabled = false;
        });
        
        // Restaurar botón
        if (submitBtn && originalText) {
            submitBtn.innerHTML = originalText;
        }
        
        // Ocultar overlay
        hideLoadingOverlay();
    }
}

// Inicializar subida de imágenes
function initializeImageUpload() {
    const fileInput = document.getElementById('images');
    const uploadArea = document.getElementById('file-upload-area');
    const selectedImagesContainer = document.getElementById('selected-images');
    
    if (!fileInput || !uploadArea) return;
    
    // Click en área de subida
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            fileInput.files = createFileList(imageFiles);
            displaySelectedImages(imageFiles);
        }
    });
    
    // Cambio en input de archivos
    fileInput.addEventListener('change', function() {
        const files = Array.from(this.files);
        displaySelectedImages(files);
    });
}

// Crear FileList desde array de archivos
function createFileList(files) {
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    return dt.files;
}

// Mostrar imágenes seleccionadas
function displaySelectedImages(files) {
    const container = document.getElementById('selected-images');
    if (!container) return;
    
    container.innerHTML = '';
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'selected-image';
                imageDiv.innerHTML = `
                    <img src="${e.target.result}" alt="Imagen ${index + 1}">
                    <div class="image-info">
                        <span class="image-name">${file.name}</span>
                        <span class="image-size">${formatFileSize(file.size)}</span>
                    </div>
                    <button type="button" class="remove-image" onclick="removeSelectedImage(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                container.appendChild(imageDiv);
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Mostrar contador
    if (files.length > 0) {
        const counter = document.createElement('div');
        counter.className = 'images-counter';
        counter.textContent = `${files.length} imagen${files.length !== 1 ? 'es' : ''} seleccionada${files.length !== 1 ? 's' : ''}`;
        container.appendChild(counter);
    }
}

// Remover imagen seleccionada
function removeSelectedImage(index) {
    const fileInput = document.getElementById('images');
    const files = Array.from(fileInput.files);
    
    files.splice(index, 1);
    fileInput.files = createFileList(files);
    displaySelectedImages(files);
}

// Limpiar preview de imágenes
function clearImagePreview() {
    const container = document.getElementById('selected-images');
    if (container) {
        container.innerHTML = '';
    }
    
    const fileInput = document.getElementById('images');
    if (fileInput) {
        fileInput.value = '';
    }
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Configurar validación de formulario
function setupFormValidation() {
    const form = document.getElementById('add-vehicle-form');
    if (!form) return;
    
    // Validación en tiempo real
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            this.classList.remove('error');
            const errorMsg = this.parentNode.querySelector('.field-error');
            if (errorMsg) errorMsg.remove();
        });
    });
    
    // Formateo automático de campos numéricos
    const numericFields = form.querySelectorAll('input[type="number"]');
    numericFields.forEach(field => {
        field.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });
    
    // Generar nombre completo automáticamente
    const brandField = form.querySelector('[name="brand"]');
    const modelField = form.querySelector('[name="model"]');
    const fullNamePreview = document.createElement('div');
    fullNamePreview.className = 'full-name-preview';
    fullNamePreview.style.cssText = `
        font-size: 0.9rem;
        color: #666;
        margin-top: 5px;
        font-style: italic;
    `;
    
    if (brandField && modelField) {
        modelField.parentNode.appendChild(fullNamePreview);
        
        function updateFullNamePreview() {
            const brand = brandField.value.trim();
            const model = modelField.value.trim();
            
            if (brand || model) {
                fullNamePreview.textContent = `Nombre completo: ${brand} ${model}`.trim();
            } else {
                fullNamePreview.textContent = '';
            }
        }
        
        brandField.addEventListener('input', updateFullNamePreview);
        modelField.addEventListener('input', updateFullNamePreview);
    }
}

// Validar campo individual
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    
    // Limpiar errores previos
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Validaciones específicas por campo
    switch (fieldName) {
        case 'brand':
        case 'model':
            if (!value) {
                showFieldError(field, 'Este campo es requerido');
                return false;
            }
            break;
            
        case 'year':
            const year = parseInt(value);
            const currentYear = new Date().getFullYear();
            if (!value || year < 1990 || year > currentYear + 1) {
                showFieldError(field, `Año debe estar entre 1990 y ${currentYear + 1}`);
                return false;
            }
            break;
            
        case 'kilometers':
            const km = parseInt(value);
            if (!value || km < 0) {
                showFieldError(field, 'Los kilómetros no pueden ser negativos');
                return false;
            }
            break;
            
        case 'power':
            if (value && parseInt(value) < 0) {
                showFieldError(field, 'La potencia no puede ser negativa');
                return false;
            }
            break;
            
        case 'price':
            if (value && parseFloat(value) < 0) {
                showFieldError(field, 'El precio no puede ser negativo');
                return false;
            }
            break;
    }
    
    return true;
}

// Cargar datos del dashboard
async function loadDashboardData() {
    try {
        showLoadingOverlay('Cargando datos del dashboard...');
        
        // Cargar estadísticas
        const stats = await makeAuthenticatedRequest('/vehicles/stats');
        updateStatsCards(stats);
        
        // Cargar vehículos recientes
        const recentVehicles = await makeAuthenticatedRequest('/vehicles/?limit=5');
        updateRecentVehicles(recentVehicles.vehicles || recentVehicles);
        
        hideLoadingOverlay();
        console.log('✅ Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showMessage('Error cargando datos del dashboard: ' + error.message, 'error');
        hideLoadingOverlay();
    }
}

// Actualizar tarjetas de estadísticas
function updateStatsCards(stats) {
    const elements = {
        totalVehicles: document.getElementById('total-vehicles-stat'),
        availableVehicles: document.getElementById('available-vehicles-stat'),
        reservedVehicles: document.getElementById('reserved-vehicles-stat'),
        featuredVehicles: document.getElementById('featured-vehicles-stat'),
        vehiclesCount: document.getElementById('vehicles-count')
    };
    
    // Actualizar con animación
    if (elements.totalVehicles) {
        animateNumber(elements.totalVehicles, 0, stats.total || 0);
    }
    if (elements.availableVehicles) {
        animateNumber(elements.availableVehicles, 0, stats.available || 0);
    }
    if (elements.reservedVehicles) {
        animateNumber(elements.reservedVehicles, 0, stats.reserved || 0);
    }
    if (elements.featuredVehicles) {
        animateNumber(elements.featuredVehicles, 0, stats.featured || 0);
    }
    if (elements.vehiclesCount) {
        elements.vehiclesCount.textContent = stats.total || 0;
    }
}

// Animar números
function animateNumber(element, start, end, duration = 1000) {
    if (!element) return;
    
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = end;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Actualizar vehículos recientes
function updateRecentVehicles(vehicles) {
    const container = document.getElementById('recent-vehicles');
    if (!container) return;
    
    if (!vehicles || vehicles.length === 0) {
        container.innerHTML = '<p class="no-data">No hay vehículos recientes</p>';
        return;
    }
    
    container.innerHTML = vehicles.map(vehicle => `
        <div class="recent-vehicle-item">
            <div class="vehicle-info">
                <h4>${vehicle.full_name || vehicle.fullName || `${vehicle.brand} ${vehicle.model}`}</h4>
                <p>${vehicle.year} • ${vehicle.kilometers?.toLocaleString()} km</p>
            </div>
            <span class="vehicle-status ${(vehicle.status || 'disponible').toLowerCase()}">
                ${vehicle.status || 'Disponible'}
            </span>
        </div>
    `).join('');
}

// Navegación entre secciones
function showSection(sectionName) {
    console.log(`🔄 Cambiando a sección: ${sectionName}`);
    
    // Ocultar todas las secciones
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover active de links de navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const section = document.getElementById(sectionName + '-section');
    if (section) {
        section.classList.add('active');
    }
    
    // Activar link de navegación
    const navLink = document.querySelector(`[href="#${sectionName}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Cargar datos específicos de la sección
    loadSectionData(sectionName);
}

// Cargar datos específicos de sección
async function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'vehicles':
            await loadVehiclesList();
            break;
        case 'add-vehicle':
            resetVehicleForm();
            break;
        case 'analytics':
            await loadAnalyticsData();
            break;
    }
}

// Cargar lista de vehículos
async function loadVehiclesList() {
    try {
        const vehiclesTableBody = document.getElementById('vehicles-table-body');
        if (!vehiclesTableBody) return;
        
        showLoadingOverlay('Cargando vehículos...');
        
        const response = await makeAuthenticatedRequest('/vehicles/admin/all?limit=50');
        const vehicles = response.vehicles || [];
        
        if (vehicles.length === 0) {
            vehiclesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <p>No hay vehículos registrados</p>
                    </td>
                </tr>
            `;
        } else {
            vehiclesTableBody.innerHTML = vehicles.map(vehicle => `
                <tr>
                    <td>${vehicle.id}</td>
                    <td>
                        <div class="vehicle-cell">
                            <strong>${vehicle.full_name || vehicle.fullName}</strong>
                            <small>${vehicle.brand} ${vehicle.model}</small>
                        </div>
                    </td>
                    <td>${vehicle.year}</td>
                    <td>${vehicle.kilometers?.toLocaleString()} km</td>
                    <td>
                        <span class="status-badge ${(vehicle.status || 'disponible').toLowerCase()}">
                            ${vehicle.status || 'Disponible'}
                        </span>
                    </td>
                    <td>
                        <span class="featured-badge ${vehicle.is_featured ? 'featured' : ''}">
                            ${vehicle.is_featured ? '⭐ Sí' : 'No'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action edit" onclick="editVehicle(${vehicle.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action toggle-featured" onclick="toggleFeatured(${vehicle.id})" title="Destacar/Quitar">
                                <i class="fas fa-star"></i>
                            </button>
                            <button class="btn-action delete" onclick="deleteVehicle(${vehicle.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('❌ Error loading vehicles list:', error);
        showMessage('Error cargando lista de vehículos', 'error');
        hideLoadingOverlay();
    }
}

// Resetear formulario de vehículo
function resetVehicleForm() {
    const form = document.getElementById('add-vehicle-form');
    if (form) {
        form.reset();
        clearFormErrors(form);
        clearImagePreview();
        
        const fullNamePreview = form.querySelector('.full-name-preview');
        if (fullNamePreview) {
            fullNamePreview.textContent = '';
        }
    }
}

// Cargar datos de analytics
async function loadAnalyticsData() {
    try {
        const analyticsSection = document.getElementById('analytics-section');
        if (!analyticsSection) return;
        
        // Implementar carga de analytics aquí
        console.log('📊 Cargando datos de analytics...');
        
    } catch (error) {
        console.error('❌ Error loading analytics:', error);
    }
}

// Funciones de gestión de vehículos
async function editVehicle(vehicleId) {
    console.log(`✏️ Editando vehículo ID: ${vehicleId}`);
    showMessage('Funcionalidad de edición en desarrollo', 'info');
}

async function toggleFeatured(vehicleId) {
    try {
        console.log(`⭐ Cambiando estado destacado del vehículo ID: ${vehicleId}`);
        
        const response = await makeAuthenticatedRequest(`/vehicles/${vehicleId}/toggle-featured`, {
            method: 'PATCH'
        });
        
        showMessage(response.message || 'Estado actualizado correctamente', 'success');
        await loadVehiclesList();
        await loadDashboardData();
        
    } catch (error) {
        console.error('❌ Error toggling featured:', error);
        showMessage('Error al cambiar estado destacado', 'error');
    }
}

async function deleteVehicle(vehicleId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
        return;
    }
    
    try {
        console.log(`🗑️ Eliminando vehículo ID: ${vehicleId}`);
        
        await makeAuthenticatedRequest(`/vehicles/${vehicleId}`, {
            method: 'DELETE'
        });
        
        showMessage('Vehículo eliminado correctamente', 'success');
        await loadVehiclesList();
        await loadDashboardData();
        
    } catch (error) {
        console.error('❌ Error deleting vehicle:', error);
        showMessage('Error al eliminar vehículo', 'error');
    }
}

// Manejar logout
function handleLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        authManager.logout();
    }
}

// Función de prueba para crear vehículo
async function createTestVehicle() {
    console.log('🧪 Creando vehículo de prueba...');
    
    try {
        const response = await makeAuthenticatedRequest('/vehicles/test-create', {
            method: 'POST'
        });
        
        showMessage('¡Vehículo de prueba creado exitosamente!', 'success');
        await loadDashboardData();
        
        console.log('✅ Vehículo de prueba creado:', response);
        
    } catch (error) {
        console.error('❌ Error creating test vehicle:', error);
        showMessage(`Error: ${error.message}`, 'error');
    }
}

// Exportar funciones para uso global
window.showSection = showSection;
window.resetForm = resetVehicleForm;
window.createTestVehicle = createTestVehicle;
window.editVehicle = editVehicle;
window.toggleFeatured = toggleFeatured;
window.deleteVehicle = deleteVehicle;
window.removeSelectedImage = removeSelectedImage;

console.log('🔧 Panel de administración mejorado cargado correctamente');
// ===== CORRECCIÓN COMPLETA - RECOLECCIÓN DE DATOS DEL FORMULARIO =====
// Este código debe reemplazar la función collectFormData y relacionadas

// Función corregida para recopilar datos del formulario
function collectVehicleFormData(form) {
    console.log('📋 Recopilando datos del formulario...');
    
    // Obtener todos los elementos del formulario
    const formElements = {
        brand: form.querySelector('[name="brand"]'),
        model: form.querySelector('[name="model"]'),
        year: form.querySelector('[name="year"]'),
        kilometers: form.querySelector('[name="kilometers"]'),
        type: form.querySelector('[name="type"]'),
        power: form.querySelector('[name="power"]'),
        traccion: form.querySelector('[name="traccion"]'),
        transmission: form.querySelector('[name="transmission"]'),
        color: form.querySelector('[name="color"]'),
        status: form.querySelector('[name="status"]'),
        price: form.querySelector('[name="price"]'),
        is_featured: form.querySelector('[name="is_featured"]'),
        description: form.querySelector('[name="description"]'),
        observations: form.querySelector('[name="observations"]')
    };

    // Debug: verificar que encontramos todos los elementos
    console.log('🔍 Elementos del formulario encontrados:');
    Object.entries(formElements).forEach(([key, element]) => {
        console.log(`${key}: ${element ? '✅' : '❌'} - Valor: ${element ? element.value : 'NO ENCONTRADO'}`);
    });

    // Validar elementos críticos
    const requiredElements = ['brand', 'model', 'year', 'kilometers', 'type', 'status'];
    const missingElements = requiredElements.filter(key => !formElements[key]);
    
    if (missingElements.length > 0) {
        throw new Error(`Elementos del formulario no encontrados: ${missingElements.join(', ')}`);
    }

    // Recopilar valores
    const vehicleData = {
        brand: formElements.brand.value.trim(),
        model: formElements.model.value.trim(),
        full_name: `${formElements.brand.value.trim()} ${formElements.model.value.trim()}`,
        type: formElements.type.value,
        type_name: getVehicleTypeName(formElements.type.value),
        year: parseInt(formElements.year.value),
        kilometers: parseInt(formElements.kilometers.value),
        power: formElements.power.value ? parseInt(formElements.power.value) : null,
        traccion: formElements.traccion.value || null,
        transmission: formElements.transmission.value || null,
        color: formElements.color.value || null,
        status: formElements.status.value,
        price: formElements.price.value ? parseFloat(formElements.price.value) : null,
        is_featured: formElements.is_featured.checked,
        location: 'Villa María, Córdoba',
        description: formElements.description.value || null,
        observations: formElements.observations.value || null,
        date_registered: new Date().toLocaleDateString('es-AR'),
        is_active: true
    };

    // Debug: mostrar datos recopilados
    console.log('📦 Datos recopilados:', vehicleData);

    // Validar datos críticos
    if (!vehicleData.brand || !vehicleData.model || !vehicleData.type || !vehicleData.status) {
        console.error('❌ Datos faltantes:', {
            brand: vehicleData.brand,
            model: vehicleData.model,
            type: vehicleData.type,
            status: vehicleData.status
        });
        throw new Error('Faltan datos obligatorios del formulario');
    }

    return vehicleData;
}

// Función helper para nombres de tipos
function getVehicleTypeName(type) {
    const typeNames = {
        'camion-tractor': 'Camión Tractor',
        'camion-chasis': 'Camión Chasis',
        'remolques': 'Remolques',
        'utilitarios': 'Utilitarios',
        'varios': 'Varios'
    };
    return typeNames[type] || type;
}

// Función corregida para manejar el envío del formulario
async function handleVehicleFormSubmitFixed(event) {
    event.preventDefault();
    console.log('📝 Iniciando envío de formulario (CORREGIDO)...');
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        // Validar que tenemos el formulario correcto
        if (!form || form.id !== 'add-vehicle-form') {
            throw new Error('Formulario no válido');
        }

        // Mostrar estado de carga
        setFormLoadingState(true, submitBtn);
        
        // Recopilar datos usando la función corregida
        const vehicleData = collectVehicleFormData(form);
        
        // Obtener imágenes
        const imageFiles = getFormImages();
        
        console.log('📤 Enviando al servidor...');
        console.log('🚛 Datos del vehículo:', vehicleData);
        console.log('📸 Imágenes:', imageFiles.length);
        
        // Crear FormData para el envío
        const formData = new FormData();
        formData.append('vehicle_data', JSON.stringify(vehicleData));
        
        // Agregar imágenes
        imageFiles.forEach((file, index) => {
            formData.append('images', file, file.name);
            console.log(`📷 Imagen ${index + 1}: ${file.name} (${file.size} bytes)`);
        });
        
        // Obtener token de autenticación
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
        }
        
        // Enviar al backend
        const response = await fetch('http://localhost:8000/api/v1/vehicles/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // NO agregar Content-Type para FormData
            },
            body: formData
        });
        
        console.log(`📡 Respuesta del servidor: ${response.status}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Error del servidor:', errorData);
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Vehículo creado exitosamente:', result);
        
        // Mostrar mensaje de éxito
        showSuccessMessage('¡Vehículo creado exitosamente!');
        
        // Limpiar formulario
        resetVehicleForm(form);
        
        // Recargar datos del dashboard
        if (typeof loadDashboardData === 'function') {
            await loadDashboardData();
        }
        
        // Cambiar a sección de vehículos después de 2 segundos
        setTimeout(() => {
            if (typeof showSection === 'function') {
                showSection('vehicles');
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error en envío del formulario:', error);
        showErrorMessage(`Error: ${error.message}`);
    } finally {
        setFormLoadingState(false, submitBtn, originalText);
    }
}

// Función para obtener imágenes del formulario
function getFormImages() {
    const fileInput = document.getElementById('images');
    if (!fileInput || !fileInput.files) {
        console.log('📷 No se encontraron imágenes');
        return [];
    }
    
    const files = Array.from(fileInput.files);
    console.log(`📷 Encontradas ${files.length} imágenes`);
    return files;
}

// Función para obtener token de autenticación
function getAuthToken() {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    console.log(`🔑 Token encontrado: ${token ? 'SÍ' : 'NO'}`);
    return token;
}

// Función para controlar el estado de carga del formulario
function setFormLoadingState(loading, submitBtn, originalText = null) {
    const form = document.getElementById('add-vehicle-form');
    
    if (loading) {
        // Deshabilitar todos los elementos del formulario
        if (form) {
            form.querySelectorAll('input, select, textarea, button').forEach(el => {
                el.disabled = true;
            });
        }
        
        // Cambiar texto del botón
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        }
        
        // Mostrar overlay si existe
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
        
    } else {
        // Habilitar elementos del formulario
        if (form) {
            form.querySelectorAll('input, select, textarea, button').forEach(el => {
                el.disabled = false;
            });
        }
        
        // Restaurar texto del botón
        if (submitBtn && originalText) {
            submitBtn.innerHTML = originalText;
        }
        
        // Ocultar overlay
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

// Función para resetear el formulario
function resetVehicleForm(form) {
    if (!form) return;
    
    // Reset del formulario
    form.reset();
    
    // Limpiar contenedor de imágenes
    const imagesContainer = document.getElementById('selected-images');
    if (imagesContainer) {
        imagesContainer.innerHTML = '';
    }
    
    // Limpiar errores de validación
    form.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
    
    form.querySelectorAll('.field-error').forEach(el => {
        el.remove();
    });
    
    console.log('🔄 Formulario limpiado');
}

// Funciones para mostrar mensajes
function showSuccessMessage(message) {
    showNotificationMessage(message, 'success');
}

function showErrorMessage(message) {
    showNotificationMessage(message, 'error');
}

function showNotificationMessage(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Remover notificaciones existentes
    document.querySelectorAll('.admin-notification').forEach(n => n.remove());
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `admin-notification notification-${type}`;
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
    }, 5000);
}

// CONFIGURACIÓN AUTOMÁTICA AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Configurando manejo corregido del formulario...');
    
    // Buscar el formulario
    const vehicleForm = document.getElementById('add-vehicle-form');
    
    if (vehicleForm) {
        // Remover event listeners existentes
        const newForm = vehicleForm.cloneNode(true);
        vehicleForm.parentNode.replaceChild(newForm, vehicleForm);
        
        // Agregar el event listener corregido
        newForm.addEventListener('submit', handleVehicleFormSubmitFixed);
        
        console.log('✅ Formulario configurado con manejo corregido');
        
        // Verificar que todos los campos existen
        const requiredFields = ['brand', 'model', 'year', 'kilometers', 'type', 'status'];
        const missingFields = requiredFields.filter(field => !newForm.querySelector(`[name="${field}"]`));
        
        if (missingFields.length > 0) {
            console.error('❌ Campos faltantes en el formulario:', missingFields);
        } else {
            console.log('✅ Todos los campos requeridos están presentes');
        }
    } else {
        console.error('❌ No se encontró el formulario add-vehicle-form');
    }
});

// Función de debug para verificar el formulario
function debugVehicleForm() {
    console.log('🔍 DEBUG - Estado del formulario de vehículos');
    
    const form = document.getElementById('add-vehicle-form');
    if (!form) {
        console.error('❌ Formulario no encontrado');
        return;
    }
    
    console.log('✅ Formulario encontrado');
    
    const fields = ['brand', 'model', 'year', 'kilometers', 'type', 'status', 'power', 'traccion', 'transmission', 'color', 'price', 'description', 'observations'];
    
    console.log('📋 Estado de los campos:');
    fields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            console.log(`  ${fieldName}: "${field.value}" (${field.tagName})`);
        } else {
            console.error(`  ${fieldName}: ❌ NO ENCONTRADO`);
        }
    });
    
    const isFeatureField = form.querySelector('[name="is_featured"]');
    if (isFeatureField) {
        console.log(`  is_featured: ${isFeatureField.checked} (checkbox)`);
    }
    
    const imagesField = form.querySelector('#images');
    if (imagesField) {
        console.log(`  images: ${imagesField.files.length} archivos seleccionados`);
    }
}

// Hacer la función de debug disponible globalmente
window.debugVehicleForm = debugVehicleForm;

console.log('🔧 Corrección de formulario cargada. Usa debugVehicleForm() para verificar el estado.');