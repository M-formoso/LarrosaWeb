// ===== ADMIN DASHBOARD - GESTIÓN DE VEHÍCULOS COMPLETA =====
// scripts/admin/dashboard-vehicles.js

class VehicleManager {
    constructor() {
        this.apiUrl = 'http://localhost:8000/api/v1';
        this.init();
    }

    init() {
        this.setupForm();
        this.setupImageUpload();
        this.loadVehiclesList();
        this.setupEventListeners();
    }

    // ===== CONFIGURACIÓN DEL FORMULARIO =====
    setupForm() {
        const form = document.getElementById('add-vehicle-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    // ===== MANEJO DE ENVÍO DEL FORMULARIO =====
    async handleSubmit(event) {
        event.preventDefault();
        console.log('📝 Enviando formulario de vehículo...');

        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Validar formulario
        if (!this.validateForm(form)) {
            this.showMessage('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        // Mostrar estado de carga
        this.setFormLoading(true, submitBtn);

        try {
            // Obtener datos del formulario
            const formData = this.collectFormData(form);
            
            // Obtener imágenes
            const images = this.getSelectedImages();
            
            console.log('📋 Datos del vehículo:', formData);
            console.log('🖼️ Imágenes:', images.length);

            // Crear vehículo
            const vehicle = await this.createVehicle(formData, images);
            
            console.log('✅ Vehículo creado:', vehicle);
            
            // Mostrar éxito
            this.showMessage('¡Vehículo creado exitosamente!', 'success');
            
            // Limpiar formulario
            this.resetForm(form);
            
            // Recargar lista
            await this.loadVehiclesList();
            
            // Cambiar a sección de vehículos
            setTimeout(() => {
                this.showSection('vehicles');
            }, 2000);

        } catch (error) {
            console.error('❌ Error creando vehículo:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.setFormLoading(false, submitBtn, originalText);
        }
    }

    // ===== RECOPILAR DATOS DEL FORMULARIO =====
    collectFormData(form) {
        const formData = new FormData(form);
        
        return {
            brand: formData.get('brand'),
            model: formData.get('model'),
            full_name: `${formData.get('brand')} ${formData.get('model')}`,
            type: formData.get('type'),
            type_name: this.getTypeName(formData.get('type')),
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

    // ===== CREAR VEHÍCULO CON IMÁGENES =====
    async createVehicle(vehicleData, images) {
        const token = this.getAuthToken();
        
        // Crear FormData para envío con imágenes
        const formData = new FormData();
        formData.append('vehicle_data', JSON.stringify(vehicleData));
        
        // Agregar imágenes
        images.forEach((file, index) => {
            formData.append('images', file, file.name);
        });

        const response = await fetch(`${this.apiUrl}/vehicles/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP ${response.status}`);
        }

        return await response.json();
    }

    // ===== GESTIÓN DE IMÁGENES =====
    setupImageUpload() {
        const fileInput = document.getElementById('images');
        const uploadArea = document.getElementById('file-upload-area');
        const selectedImagesContainer = document.getElementById('selected-images');

        if (!fileInput || !uploadArea) return;

        // Click en área de subida
        uploadArea.addEventListener('click', () => fileInput.click());

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length > 0) {
                this.handleImageSelection(imageFiles);
            }
        });

        // Cambio en input
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleImageSelection(files);
        });
    }

    handleImageSelection(files) {
        const container = document.getElementById('selected-images');
        if (!container) return;

        container.innerHTML = '';
        this.selectedImages = files;

        files.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const imageDiv = document.createElement('div');
                    imageDiv.className = 'selected-image';
                    imageDiv.innerHTML = `
                        <img src="${e.target.result}" alt="Imagen ${index + 1}">
                        <div class="image-info">
                            <span class="image-name">${file.name}</span>
                            <span class="image-size">${this.formatFileSize(file.size)}</span>
                        </div>
                        <button type="button" class="remove-image" onclick="vehicleManager.removeImage(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    container.appendChild(imageDiv);
                };
                
                reader.readAsDataURL(file);
            }
        });

        if (files.length > 0) {
            const counter = document.createElement('div');
            counter.className = 'images-counter';
            counter.textContent = `${files.length} imagen${files.length !== 1 ? 'es' : ''} seleccionada${files.length !== 1 ? 's' : ''}`;
            container.appendChild(counter);
        }
    }

    removeImage(index) {
        if (this.selectedImages) {
            this.selectedImages.splice(index, 1);
            this.handleImageSelection(this.selectedImages);
        }
    }

    getSelectedImages() {
        return this.selectedImages || [];
    }

    // ===== CARGAR LISTA DE VEHÍCULOS =====
    async loadVehiclesList() {
        try {
            const token = this.getAuthToken();
            const response = await fetch(`${this.apiUrl}/vehicles/admin/all?limit=50`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.renderVehiclesList(data.vehicles || []);
            
        } catch (error) {
            console.error('❌ Error cargando vehículos:', error);
            this.showMessage('Error cargando lista de vehículos', 'error');
        }
    }

    renderVehiclesList(vehicles) {
        const tbody = document.getElementById('vehicles-table-body');
        if (!tbody) return;

        if (vehicles.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <p>No hay vehículos registrados</p>
                        <button onclick="vehicleManager.showSection('add-vehicle')" class="btn-primary">
                            <i class="fas fa-plus"></i> Agregar primer vehículo
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = vehicles.map(vehicle => `
            <tr>
                <td>${vehicle.id}</td>
                <td>
                    <div class="vehicle-cell">
                        <strong>${vehicle.full_name || vehicle.fullName}</strong>
                        <small>${vehicle.brand} ${vehicle.model}</small>
                    </div>
                </td>
                <td>${vehicle.year}</td>
                <td>${this.formatNumber(vehicle.kilometers)} km</td>
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
                        <button class="btn-action edit" onclick="vehicleManager.editVehicle(${vehicle.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action toggle-featured" onclick="vehicleManager.toggleFeatured(${vehicle.id})" title="Destacar/Quitar">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="btn-action delete" onclick="vehicleManager.deleteVehicle(${vehicle.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ===== OPERACIONES CON VEHÍCULOS =====
    async toggleFeatured(vehicleId) {
        try {
            const token = this.getAuthToken();
            const response = await fetch(`${this.apiUrl}/vehicles/${vehicleId}/toggle-featured`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            this.showMessage(result.message || 'Estado actualizado', 'success');
            await this.loadVehiclesList();
            
        } catch (error) {
            console.error('❌ Error:', error);
            this.showMessage('Error al cambiar estado destacado', 'error');
        }
    }

    async deleteVehicle(vehicleId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
            return;
        }

        try {
            const token = this.getAuthToken();
            const response = await fetch(`${this.apiUrl}/vehicles/${vehicleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            this.showMessage('Vehículo eliminado correctamente', 'success');
            await this.loadVehiclesList();
            
        } catch (error) {
            console.error('❌ Error:', error);
            this.showMessage('Error al eliminar vehículo', 'error');
        }
    }

    editVehicle(vehicleId) {
        this.showMessage('Funcionalidad de edición en desarrollo', 'info');
    }

    // ===== UTILIDADES =====
    validateForm(form) {
        const requiredFields = ['brand', 'model', 'year', 'kilometers', 'type', 'status'];
        
        for (const fieldName of requiredFields) {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field || !field.value.trim()) {
                this.showFieldError(field, 'Este campo es requerido');
                return false;
            }
        }

        // Validaciones específicas
        const year = parseInt(form.querySelector('[name="year"]').value);
        if (year < 1990 || year > new Date().getFullYear() + 1) {
            this.showFieldError(form.querySelector('[name="year"]'), 'Año inválido');
            return false;
        }

        return true;
    }

    showFieldError(field, message) {
        if (!field) return;
        
        field.classList.add('error');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.85rem;
            margin-top: 5px;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }

    resetForm(form) {
        form.reset();
        this.selectedImages = [];
        
        const selectedImagesContainer = document.getElementById('selected-images');
        if (selectedImagesContainer) {
            selectedImagesContainer.innerHTML = '';
        }
        
        // Limpiar errores
        form.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        
        form.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });
    }

    setFormLoading(loading, submitBtn, originalText = null) {
        const form = document.getElementById('add-vehicle-form');
        
        if (loading) {
            form.querySelectorAll('input, select, textarea, button').forEach(el => {
                el.disabled = true;
            });
            
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            }
        } else {
            form.querySelectorAll('input, select, textarea, button').forEach(el => {
                el.disabled = false;
            });
            
            if (submitBtn && originalText) {
                submitBtn.innerHTML = originalText;
            }
        }
    }

    getTypeName(type) {
        const types = {
            'camion-tractor': 'Camión Tractor',
            'camion-chasis': 'Camión Chasis',
            'remolques': 'Remolques',
            'utilitarios': 'Utilitarios',
            'varios': 'Varios'
        };
        return types[type] || type;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatNumber(num) {
        return new Intl.NumberFormat('es-AR').format(num);
    }

    getAuthToken() {
        return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    }

    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        console.log(`🔄 Cambiando a sección: ${sectionName}`);
        
        // Ocultar todas las secciones
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remover active de links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Mostrar sección seleccionada
        const section = document.getElementById(sectionName + '-section');
        if (section) {
            section.classList.add('active');
        }
        
        // Activar link
        const navLink = document.querySelector(`[href="#${sectionName}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
        
        // Cargar datos específicos de la sección
        if (sectionName === 'vehicles') {
            this.loadVehiclesList();
        } else if (sectionName === 'add-vehicle') {
            this.resetForm(document.getElementById('add-vehicle-form'));
        }
    }

    showMessage(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
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
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// ===== INICIALIZACIÓN =====
let vehicleManager;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚛 Inicializando Vehicle Manager...');
    vehicleManager = new VehicleManager();
    
    // Hacer disponible globalmente
    window.vehicleManager = vehicleManager;
    
    console.log('✅ Vehicle Manager inicializado');
});

// ===== FUNCIONES GLOBALES PARA HTML =====
function showSection(sectionName) {
    if (vehicleManager) {
        vehicleManager.showSection(sectionName);
    }
}

function resetForm() {
    if (vehicleManager) {
        const form = document.getElementById('add-vehicle-form');
        vehicleManager.resetForm(form);
    }
}