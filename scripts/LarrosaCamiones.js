// ===== LARROSA CAMIONES - JAVASCRIPT COMPLETO =====

// ===== VARIABLES GLOBALES =====
let currentStep = 1;
const totalSteps = 2;
let formData = {};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚛 Iniciando página Larrosa Camiones actualizada...');
    
    initializeScrollAnimations();
    initializeForm();
    initializeSmoothScroll();
    initializeIntersectionObserver();
    initializeNavigation();
    initializeCTAButtons();
    initializePerformanceMonitoring();
    initializeAccessibility();
    initializeBannerCarousel();
    
    console.log('✅ Larrosa Camiones inicializado correctamente');
});

// ===== NAVEGACIÓN MEJORADA =====
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');

    // Toggle menú hamburguesa
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevenir scroll del body cuando el menú está abierto
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
            
            // Accesibilidad
            const isExpanded = navMenu.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isExpanded);
            hamburger.setAttribute('aria-label', isExpanded ? 'Cerrar menú' : 'Abrir menú');
        });
    }

    // Cerrar menú al hacer click en un link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            document.body.style.overflow = '';
            hamburger?.setAttribute('aria-expanded', 'false');
        });
    });

    // Cerrar menú al presionar Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            document.body.style.overflow = '';
            hamburger?.setAttribute('aria-expanded', 'false');
            hamburger?.focus();
        }
    });

    // Navbar scroll effects
    let lastScrollTop = 0;
    let ticking = false;

    function updateNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Ocultar/mostrar navbar al hacer scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });
}

// ===== FORMULARIO FINANCIERO =====
function initializeForm() {
    const form = document.getElementById('financial-form');
    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);
    
    // Validación en tiempo real
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
        
        // Formateo automático para campos específicos
        if (input.type === 'tel') {
            input.addEventListener('input', formatPhoneNumber);
        }
    });

    // Inicializar pasos
    updateStepDisplay();
    
    // Autoguardado
    setupAutoSave();
}

function setupAutoSave() {
    const form = document.getElementById('financial-form');
    if (!form) return;

    // Cargar datos guardados
    loadSavedData();

    // Guardar datos automáticamente
    form.addEventListener('input', debounce(autoSaveData, 1000));
}

function loadSavedData() {
    try {
        const savedData = sessionStorage.getItem('larrosa_form_data');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const field = document.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = data[key];
                }
            });
            console.log('📂 Datos del formulario restaurados');
        }
    } catch (error) {
        console.warn('Error al cargar datos guardados:', error);
    }
}

function autoSaveData() {
    try {
        const form = document.getElementById('financial-form');
        if (!form) return;

        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        sessionStorage.setItem('larrosa_form_data', JSON.stringify(data));
        console.log('💾 Datos autoguardados');
    } catch (error) {
        console.warn('Error al autoguardar:', error);
    }
}

function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    // Formato argentino: +54 XXX XXX-XXXX
    if (value.length >= 10) {
        value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+54 $2 $3-$4');
    } else if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})/, '$1 $2');
    }
    
    event.target.value = value;
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const currentFormData = new FormData(form);
    
    // Validar campos del paso actual
    if (!validateCurrentStep()) {
        showFormMessage('Por favor completa todos los campos requeridos', 'error');
        focusFirstError();
        return;
    }
    
    // Guardar datos del paso actual
    saveStepData(currentFormData);
    
    if (currentStep < totalSteps) {
        // Tracking del paso
        trackFormStep(currentStep);
        
        // Avanzar al siguiente paso
        nextStep();
    } else {
        // Enviar formulario completo
        await submitForm();
    }
}

function validateCurrentStep() {
    const currentInputs = document.querySelectorAll('.financial-form input[required], .financial-form select[required]');
    let isValid = true;
    
    currentInputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Clear previous errors
    clearFieldError(field);
    
    // Required field validation
    if (field.required && !value) {
        showFieldError(field, 'Este campo es obligatorio');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Ingresa un email válido');
            return false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.length < 8) {
            showFieldError(field, 'Ingresa un teléfono válido');
            return false;
        }
    }
    
    // Company name validation
    if (fieldName === 'company-name' && value) {
        if (value.length < 2) {
            showFieldError(field, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }
    }
    
    // Country validation
    if (fieldName === 'country' && !value) {
        showFieldError(field, 'Selecciona un país');
        return false;
    }
    
    // Address validation
    if (fieldName === 'address' && value && value.length < 5) {
        showFieldError(field, 'Ingresa una dirección válida');
        return false;
    }
    
    showFieldSuccess(field);
    return true;
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Remove existing error
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Add error class
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.id = `error-${field.name}`;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 0.85rem;
        margin-top: 5px;
        animation: fadeInUp 0.3s ease;
    `;
    
    field.setAttribute('aria-describedby', errorDiv.id);
    formGroup.appendChild(errorDiv);
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    field.classList.remove('error', 'success');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    
    const errorDiv = formGroup.querySelector('.field-error');
    if (errorDiv) errorDiv.remove();
}

function showFieldSuccess(field) {
    field.classList.remove('error');
    field.classList.add('success');
    field.removeAttribute('aria-invalid');
}

function focusFirstError() {
    const firstError = document.querySelector('.form-group input.error, .form-group select.error');
    if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function saveStepData(currentFormData) {
    for (let [key, value] of currentFormData.entries()) {
        formData[key] = value;
    }
    console.log('📋 Datos guardados del paso', currentStep, formData);
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        updateStepDisplay();
        updateFormFields();
        scrollToForm();
        announceStepChange();
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
        updateFormFields();
        scrollToForm();
        announceStepChange();
    }
}

function announceStepChange() {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    announcement.textContent = `Paso ${currentStep} de ${totalSteps}`;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
}

function updateStepDisplay() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Actualizar progress bar si existe
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const progress = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

function updateFormFields() {
    const form = document.getElementById('financial-form');
    if (!form) return;

    if (currentStep === 1) {
        // Paso 1: Información de la empresa
        form.innerHTML = `
            <div class="form-group">
                <label for="company-name">
                    Nombre de la compañía *
                    <span class="required-indicator" aria-label="Campo obligatorio"></span>
                </label>
                <input type="text" 
                       id="company-name" 
                       name="company-name" 
                       required 
                       aria-describedby="company-name-hint"
                       autocomplete="organization">
                <small id="company-name-hint" class="field-hint">
                    Ingresa el nombre legal de tu empresa
                </small>
            </div>

            <div class="form-group">
                <label for="address">
                    Dirección *
                    <span class="required-indicator" aria-label="Campo obligatorio"></span>
                </label>
                <input type="text" 
                       id="address" 
                       name="address" 
                       required 
                       aria-describedby="address-hint"
                       autocomplete="street-address">
                <small id="address-hint" class="field-hint">
                    Dirección completa de tu empresa
                </small>
            </div>

            <div class="form-group">
                <label for="country">
                    País *
                    <span class="required-indicator" aria-label="Campo obligatorio"></span>
                    <i class="fas fa-info-circle" title="Selecciona el país donde opera tu empresa"></i>
                </label>
                <select id="country" 
                        name="country" 
                        required 
                        aria-describedby="country-hint"
                        autocomplete="country">
                    <option value="">Seleccionar país</option>
                    <option value="argentina">Argentina</option>
                    <option value="chile">Chile</option>
                    <option value="uruguay">Uruguay</option>
                    <option value="paraguay">Paraguay</option>
                    <option value="bolivia">Bolivia</option>
                    <option value="brasil">Brasil</option>
                </select>
                <small id="country-hint" class="field-hint">
                    País principal de operaciones
                </small>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn-next">
                    Siguiente
                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </button>
            </div>
        `;
    } else if (currentStep === 2) {
        // Paso 2: Información de contacto
        form.innerHTML = `
            <div class="form-group">
                <label for="contact-name">
                    Nombre de contacto *
                    <span class="required-indicator" aria-label="Campo obligatorio"></span>
                </label>
                <input type="text" 
                       id="contact-name" 
                       name="contact-name" 
                       required 
                       aria-describedby="contact-name-hint"
                       autocomplete="name">
                <small id="contact-name-hint" class="field-hint">
                    Nombre de la persona de contacto
                </small>
            </div>

            <div class="form-group">
                <label for="email">
                    Email *
                    <span class="required-indicator" aria-label="Campo obligatorio"></span>
                </label>
                <input type="email" 
                       id="email" 
                       name="email" 
                       required 
                       aria-describedby="email-hint"
                       autocomplete="email">
                <small id="email-hint" class="field-hint">
                    Dirección de correo electrónico
                </small>
            </div>

            <div class="form-group">
                <label for="phone">
                    Teléfono *
                    <span class="required-indicator" aria-label="Campo obligatorio"></span>
                </label>
                <input type="tel" 
                       id="phone" 
                       name="phone" 
                       required 
                       aria-describedby="phone-hint"
                       autocomplete="tel"
                       placeholder="+54 XXX XXX-XXXX">
                <small id="phone-hint" class="field-hint">
                    Número de teléfono con código de área
                </small>
            </div>

            <div class="form-group">
                <label for="message">Mensaje (opcional)</label>
                <textarea id="message" 
                          name="message" 
                          rows="4" 
                          aria-describedby="message-hint"
                          placeholder="Cuéntanos sobre tus necesidades de financiación..."></textarea>
                <small id="message-hint" class="field-hint">
                    Información adicional sobre tus necesidades
                </small>
            </div>

            <div class="form-actions">
                <button type="button" class="btn-prev" onclick="previousStep()">
                    <i class="fas fa-arrow-left" aria-hidden="true"></i>
                    Anterior
                </button>
                <button type="submit" class="btn-submit">
                    Enviar Solicitud
                    <i class="fas fa-paper-plane" aria-hidden="true"></i>
                </button>
            </div>
        `;
    }

    // Restaurar datos guardados
    Object.keys(formData).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            field.value = formData[key];
        }
    });

    // Re-inicializar validación para los nuevos campos
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
        
        if (input.type === 'tel') {
            input.addEventListener('input', formatPhoneNumber);
        }
    });

    // Re-inicializar autoguardado
    form.addEventListener('input', debounce(autoSaveData, 1000));
}

function scrollToForm() {
    const formSection = document.querySelector('.form-section');
    if (formSection) {
        formSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
}

async function submitForm() {
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn?.textContent || 'Enviar Solicitud';
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }

    try {
        // Preparar datos completos
        const completeData = {
            ...formData,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language
        };

        // Simular envío (reemplazar con endpoint real)
        const response = await simulateFormSubmission(completeData);
        
        if (response.success) {
            showFormMessage('¡Solicitud enviada correctamente! Te contactaremos pronto.', 'success');
            trackFormSubmission();
            
            // Limpiar datos guardados
            sessionStorage.removeItem('larrosa_form_data');
            
            // Reset form after success
            setTimeout(() => {
                resetForm();
            }, 3000);
        } else {
            throw new Error(response.message || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error al enviar formulario:', error);
        showFormMessage('Error al enviar la solicitud. Por favor intenta nuevamente.', 'error');
        trackFormError(error.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

async function simulateFormSubmission(data) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular éxito/error aleatório (90% éxito)
    if (Math.random() > 0.1) {
        console.log('📤 Datos que se enviarían:', data);
        return { success: true, id: generateId() };
    } else {
        throw new Error('Error de red simulado');
    }
}

function generateId() {
    return 'LR' + Date.now().toString(36).toUpperCase();
}

function showFormMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) existingMessage.remove();
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.setAttribute('role', type === 'error' ? 'alert' : 'status');
    messageDiv.setAttribute('aria-live', 'polite');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        padding: 15px 20px;
        margin: 20px 0;
        border-radius: 8px;
        font-weight: 600;
        text-align: center;
        animation: fadeInUp 0.3s ease;
        ${type === 'success' ? `
            background: rgba(40, 167, 69, 0.1);
            color: #28a745;
            border: 1px solid rgba(40, 167, 69, 0.3);
        ` : `
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
            border: 1px solid rgba(220, 53, 69, 0.3);
        `}
    `;
    
    // Insert after form
    const form = document.getElementById('financial-form');
    form.parentNode.insertBefore(messageDiv, form.nextSibling);
    
    // Focus para accesibilidad
    messageDiv.focus();
    
    // Auto-remove after delay
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }
    }, type === 'success' ? 5000 : 7000);
}

function resetForm() {
    currentStep = 1;
    formData = {};
    updateStepDisplay();
    updateFormFields();
    
    // Scroll al inicio del formulario
    scrollToForm();
    
    console.log('🔄 Formulario reiniciado');
}

// ===== ANIMACIONES AL SCROLL =====
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Animaciones específicas con delay escalonado
                if (entry.target.classList.contains('solution-content')) {
                    animateSolutionContent(entry.target);
                } else if (entry.target.classList.contains('solution-image')) {
                    animateSolutionImage(entry.target);
                } else if (entry.target.classList.contains('form-header')) {
                    animateFormHeader(entry.target);
                } else if (entry.target.classList.contains('valor-card')) {
                    animateValueCard(entry.target);
                } else if (entry.target.classList.contains('timeline-item')) {
                    animateTimelineItem(entry.target);
                }
                
                // Desconectar observer para elementos que ya se animaron
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar elementos animables
    const elementsToAnimate = document.querySelectorAll(`
        .solution-content,
        .solution-image,
        .form-header,
        .form-steps,
        .financial-form,
        .valor-card,
        .timeline-item,
        .cta-button
    `);
    
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

function animateSolutionContent(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateX(-30px)';
    element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
    }, 100);
}

function animateSolutionImage(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateX(30px) scale(0.95)';
    element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0) scale(1)';
    }, 200);
}

function animateFormHeader(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(40px)';
    element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 100);
}

function animateValueCard(card) {
    const cards = document.querySelectorAll('.valor-card');
    const index = Array.from(cards).indexOf(card);
    const delay = index * 150;
    
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9) translateY(20px)';
    card.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1) translateY(0)';
    }, delay);
}

function animateTimelineItem(item) {
    const items = document.querySelectorAll('.timeline-item');
    const index = Array.from(items).indexOf(item);
    const delay = index * 200;
    
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
    }, delay);
}

// ===== SMOOTH SCROLL =====
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 100;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Gestionar foco para accesibilidad
                setTimeout(() => {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        });
    });
}

// ===== INTERSECTION OBSERVER PARA SECCIONES =====
function initializeIntersectionObserver() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').includes(id)) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'page');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-100px 0px -100px 0px'
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// ===== CTA BUTTON INTERACTIONS =====
function initializeCTAButtons() {
    const ctaButtons = document.querySelectorAll('.cta-button, .btn-next, .btn-submit, .btn-prev');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Efecto de ripple
            createRippleEffect(this, e);
        });
        
        // Mejorar accesibilidad
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                createRippleEffect(this, e);
                this.click();
            }
        });
    });
}

function createRippleEffect(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.remove();
        }
    }, 600);
}

// ===== TRACKING Y ANALYTICS =====
function trackFormStep(step) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_step_completed', {
            event_category: 'Financial Form',
            event_label: `Step ${step}`,
            step_number: step,
            form_type: 'financial_request'
        });
    }
    
    // Evento personalizado para tracking interno
    const customEvent = new CustomEvent('formStepCompleted', {
        detail: { step, timestamp: Date.now() }
    });
    document.dispatchEvent(customEvent);
    
    console.log(`📊 Form step ${step} tracked`);
}

function trackFormSubmission() {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
            event_category: 'Financial Form',
            event_label: 'Complete',
            conversion: true,
            form_type: 'financial_request',
            value: 1
        });
    }
    
    // Facebook Pixel (si está disponible)
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_category: 'Financial Form',
            content_name: 'Solicitud Financiera'
        });
    }
    
    // Evento personalizado
    const customEvent = new CustomEvent('formSubmitted', {
        detail: { timestamp: Date.now(), formData }
    });
    document.dispatchEvent(customEvent);
    
    console.log('📊 Form submission tracked');
}

function trackFormError(errorMessage) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_error', {
            event_category: 'Financial Form',
            event_label: errorMessage,
            error_type: 'submission_error'
        });
    }
    
    console.log('📊 Form error tracked:', errorMessage);
}

// ===== PERFORMANCE MONITORING =====
function initializePerformanceMonitoring() {
    // Monitor loading performance
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
            
            console.log('🚀 Performance metrics:', {
                loadTime: `${loadTime}ms`,
                domContentLoaded: `${domContentLoaded}ms`,
                totalTime: `${perfData.loadEventEnd}ms`
            });
            
            // Enviar métricas a analytics si es necesario
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_performance', {
                    event_category: 'Performance',
                    custom_parameter_1: loadTime,
                    custom_parameter_2: domContentLoaded
                });
            }
        }, 0);
    });

    // Monitor form performance
    const formStartTime = performance.now();
    document.addEventListener('formSubmitted', function() {
        const formCompletionTime = performance.now() - formStartTime;
        console.log(`📝 Form completion time: ${formCompletionTime.toFixed(2)}ms`);
    });

    // Monitor scroll performance
    let scrollStartTime = null;
    let scrollTimeout = null;

    window.addEventListener('scroll', function() {
        if (!scrollStartTime) {
            scrollStartTime = performance.now();
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollDuration = performance.now() - scrollStartTime;
            if (scrollDuration > 100) {
                console.log(`📜 Scroll performance warning: ${scrollDuration.toFixed(2)}ms`);
            }
            scrollStartTime = null;
        }, 150);
    }, { passive: true });

    // Monitor memory usage (si está disponible)
    if ('memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
                console.warn('⚠️ High memory usage detected:', {
                    used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                    total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`
                });
            }
        }, 30000); // Check every 30 seconds
    }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
function initializeAccessibility() {
    // Skip to main content link
    addSkipLink();
    
    // Keyboard navigation enhancements
    setupKeyboardNavigation();
    
    // Screen reader announcements
    setupScreenReaderAnnouncements();
    
    // High contrast mode detection
    detectHighContrastMode();
    
    // Reduced motion preferences
    detectReducedMotion();
}

function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Saltar al contenido principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-blue);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 0 0 4px 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '0';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

function setupKeyboardNavigation() {
    // Tab trap for modal dialogs (si se implementan)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const focusableElements = document.querySelectorAll(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            );
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
    
    // Arrow key navigation for form steps
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.setAttribute('tabindex', '0');
        step.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' && index > 0) {
                steps[index - 1].focus();
            } else if (e.key === 'ArrowRight' && index < steps.length - 1) {
                steps[index + 1].focus();
            }
        });
    });
}

function setupScreenReaderAnnouncements() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    document.body.appendChild(liveRegion);
    
    // Function to announce messages
    window.announceToScreenReader = function(message) {
        liveRegion.textContent = message;
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    };
}

function detectHighContrastMode() {
    // Detect Windows High Contrast mode
    const highContrastMedia = window.matchMedia('(prefers-contrast: high)');
    
    function handleHighContrast(e) {
        if (e.matches) {
            document.documentElement.classList.add('high-contrast');
            console.log('🎯 High contrast mode detected');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }
    
    handleHighContrast(highContrastMedia);
    highContrastMedia.addListener(handleHighContrast);
}

function detectReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function handleReducedMotion(e) {
        if (e.matches) {
            document.documentElement.classList.add('reduced-motion');
            console.log('🎭 Reduced motion preference detected');
            
            // Disable animations
            const style = document.createElement('style');
            style.textContent = `
                .reduced-motion *,
                .reduced-motion *::before,
                .reduced-motion *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }
    }
    
    handleReducedMotion(prefersReducedMotion);
    prefersReducedMotion.addListener(handleReducedMotion);
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('🚨 JavaScript Error:', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        error: e.error
    });
    
    // Track error in analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.message,
            fatal: false
        });
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled Promise Rejection:', e.reason);
    
    // Track error in analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: `Unhandled Promise: ${e.reason}`,
            fatal: false
        });
    }
});

// ===== CSS STYLES INJECTION =====
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    /* Ripple Animation */
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    /* Field Animations */
    .field-error {
        animation: fadeInUp 0.3s ease;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
    
    /* Field States */
    .form-group input.success,
    .form-group select.success {
        border-color: #28a745;
        box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
    }
    
    .form-group input.error,
    .form-group select.error {
        border-color: #dc3545;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }
    
    /* Button Styles */
    .btn-prev {
        background: #6c757d;
        color: var(--primary-white);
        padding: 15px 30px;
        border: none;
        border-radius: 0;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition-fast);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-right: 15px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-prev:hover {
        background: #5a6268;
        transform: translateY(-2px);
    }
    
    .btn-prev:focus {
        outline: 3px solid var(--primary-blue);
        outline-offset: 2px;
    }
    
    .btn-submit {
        background: var(--primary-blue);
        color: var(--primary-white);
        padding: 15px 30px;
        border: none;
        border-radius: 0;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition-fast);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-submit:hover {
        background: var(--secondary-dark-blue);
        transform: translateY(-2px);
    }
    
    .btn-submit:disabled {
        background: #6c757d;
        cursor: not-allowed;
        transform: none;
    }
    
    .btn-submit:focus {
        outline: 3px solid var(--primary-blue);
        outline-offset: 2px;
    }
    
    .btn-next {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    /* Field Hints */
    .field-hint {
        color: #6c757d;
        font-size: 0.85rem;
        margin-top: 4px;
        display: block;
    }
    
    .required-indicator::after {
        content: '*';
        color: #dc3545;
        margin-left: 2px;
    }
    
    /* Skip Link */
    .skip-link:focus {
        top: 0 !important;
    }
    
    /* Screen Reader Only */
    .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
    }
    
    /* High Contrast Mode */
    .high-contrast .form-group input,
    .high-contrast .form-group select {
        border-width: 2px;
    }
    
    .high-contrast .btn-next,
    .high-contrast .btn-submit,
    .high-contrast .btn-prev {
        border: 2px solid currentColor;
    }
    
    /* Focus Indicators */
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: 3px solid var(--primary-blue);
        outline-offset: 2px;
    }
    
    /* Loading State */
    .btn-submit .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    /* Form Message */
    .form-message {
        border-radius: 8px;
        font-weight: 600;
        text-align: center;
        animation: fadeInUp 0.3s ease;
    }
    
    .form-message:focus {
        outline: 2px solid currentColor;
        outline-offset: 2px;
    }
    
    /* Progress Bar (si se implementa) */
    .progress-bar {
        height: 4px;
        background: var(--primary-blue);
        transition: width 0.3s ease;
    }
    
    /* Responsive Adjustments */
    @media (max-width: 768px) {
        .form-actions {
            flex-direction: column;
            gap: 10px;
        }
        
        .btn-prev {
            margin-right: 0;
            margin-bottom: 10px;
        }
    }
`;

document.head.appendChild(additionalStyles);

// ===== INITIALIZATION COMPLETE =====
console.log('🎉 Larrosa Camiones JavaScript completamente inicializado');

// Exportar funciones globales para uso externo si es necesario
window.LarrosaCamiones = {
    resetForm,
    nextStep,
    previousStep,
    validateField,
    trackFormStep,
    trackFormSubmission
};
// ===== CARRUSEL MÁS LENTO - REEMPLAZA LA FUNCIÓN initializeBannerCarousel() EXISTENTE =====

function initializeBannerCarousel() {
    const carousel = document.querySelector('.banner-carousel');
    if (!carousel) return; // Si no existe el carrusel, salir
    
    const slides = document.querySelector('.banner-slides');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.banner-nav.prev');
    const nextBtn = document.querySelector('.banner-nav.next');
    
    let currentSlide = 0;
    const totalSlides = 2; // Solo contamos las 2 imágenes originales
    let isAnimationPaused = false;
    
    // Configuración de tiempos (en milisegundos)
    const ANIMATION_DURATION = 8000; // 8 segundos total
    const IMAGE_DISPLAY_TIME = 3000; // 3 segundos mostrando cada imagen
    const TRANSITION_TIME = 1000; // 1 segundo de transición
    
    // Función para cambiar slide manualmente con transición suave
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        
        // Actualizar indicadores
        updateIndicators();
        
        // Calcular el momento exacto en la animación donde debe estar cada imagen
        // Imagen 0: 0% a 37.5% (3s de display)
        // Imagen 1: 50% a 87.5% (3s de display)
        let targetTime;
        if (slideIndex === 0) {
            targetTime = 0; // Mostrar al inicio del ciclo
        } else {
            targetTime = ANIMATION_DURATION * 0.5; // Mostrar en el 50% del ciclo
        }
        
        // Reiniciar animación con el delay apropiado
        slides.style.animation = 'none';
        slides.offsetHeight; // Trigger reflow
        
        slides.style.animation = `bannerSlideSlowInfinite ${ANIMATION_DURATION}ms infinite ease-in-out`;
        slides.style.animationDelay = `-${targetTime}ms`;
        
        // Anunciar cambio para lectores de pantalla
        announceSlideChange(currentSlide);
    }
    
    // Función para actualizar indicadores
    function updateIndicators() {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
            indicator.setAttribute('aria-current', index === currentSlide ? 'true' : 'false');
        });
    }
    
    // Función para anunciar cambios a lectores de pantalla
    function announceSlideChange(slideIndex) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        announcement.textContent = `Imagen ${slideIndex + 1} de ${totalSlides}`;
        
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
    }
    
    // Event listeners para indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
        
        // Soporte para teclado en indicadores
        indicator.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToSlide(index);
            }
        });
    });
    
    // Event listeners para botones de navegación
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const newSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
            goToSlide(newSlide);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const newSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
            goToSlide(newSlide);
        });
    }
    
    // Seguimiento del slide actual para el carrusel con nuevos tiempos
    function trackCurrentSlide() {
        setInterval(() => {
            if (isAnimationPaused) return;
            
            // Obtener el tiempo transcurrido en el ciclo actual
            const currentTime = Date.now();
            const elapsed = currentTime % ANIMATION_DURATION;
            
            // Determinar qué slide debería estar visible basado en los nuevos tiempos
            let newCurrentSlide;
            
            // Imagen 1: 0ms a 3000ms (0% a 37.5%)
            // Transición: 3000ms a 4000ms (37.5% a 50%)
            // Imagen 2: 4000ms a 7000ms (50% a 87.5%)
            // Transición: 7000ms a 8000ms (87.5% a 100%)
            
            if (elapsed < 3000) {
                newCurrentSlide = 0; // Primera imagen
            } else if (elapsed < 4000) {
                // En transición, mantener el slide anterior para indicadores
                newCurrentSlide = 0;
            } else if (elapsed < 7000) {
                newCurrentSlide = 1; // Segunda imagen
            } else {
                // En transición, mantener el slide anterior para indicadores
                newCurrentSlide = 1;
            }
            
            // Actualizar indicadores si cambió el slide
            if (newCurrentSlide !== currentSlide) {
                currentSlide = newCurrentSlide;
                updateIndicators();
            }
        }, 100); // Verificar cada 100ms para precisión
    }
    
    // Iniciar seguimiento de slides
    trackCurrentSlide();
    
    // Pausa/reanuda animación en hover
    carousel.addEventListener('mouseenter', () => {
        slides.style.animationPlayState = 'paused';
        isAnimationPaused = true;
        
        // También pausar animación de indicadores
        const activeIndicator = document.querySelector('.indicator.active::after');
        if (activeIndicator) {
            activeIndicator.style.animationPlayState = 'paused';
        }
    });
    
    carousel.addEventListener('mouseleave', () => {
        slides.style.animationPlayState = 'running';
        isAnimationPaused = false;
        
        // Reanudar animación de indicadores
        const activeIndicator = document.querySelector('.indicator.active::after');
        if (activeIndicator) {
            activeIndicator.style.animationPlayState = 'running';
        }
    });
    
    // Soporte para navegación con teclado
    document.addEventListener('keydown', (e) => {
        // Solo funcionar si el carrusel está visible
        const carouselRect = carousel.getBoundingClientRect();
        const isVisible = carouselRect.top < window.innerHeight && carouselRect.bottom > 0;
        
        if (!isVisible) return;
        
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevBtn?.click();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextBtn?.click();
        }
    });
    
    // Soporte para touch/swipe en dispositivos móviles
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Solo procesar swipes horizontales (evitar conflicto con scroll vertical)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                nextBtn?.click(); // Swipe left = next
            } else {
                prevBtn?.click(); // Swipe right = prev
            }
        }
    }
    
    // Pausar animación cuando la página no está visible (Performance)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            slides.style.animationPlayState = 'paused';
            isAnimationPaused = true;
        } else {
            slides.style.animationPlayState = 'running';
            isAnimationPaused = false;
        }
    });
    
    // Intersection Observer para pausar cuando no está visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                slides.style.animationPlayState = 'running';
                isAnimationPaused = false;
            } else {
                slides.style.animationPlayState = 'paused';
                isAnimationPaused = true;
            }
        });
    }, {
        threshold: 0.1
    });
    
    observer.observe(carousel);
    
    // Función para ajustar velocidad dinámicamente (opcional)
    window.setBannerSpeed = function(newDuration) {
        ANIMATION_DURATION = newDuration;
        IMAGE_DISPLAY_TIME = newDuration * 0.375; // 37.5% del tiempo total
        TRANSITION_TIME = newDuration * 0.125; // 12.5% del tiempo total
        
        slides.style.animationDuration = `${newDuration}ms`;
        console.log(`🎠 Velocidad del carrusel actualizada: ${newDuration}ms`);
    };
    
    // Limpieza al descargar la página
    window.addEventListener('beforeunload', () => {
        observer.disconnect();
    });
    
    console.log('🎠 Banner carousel lento inicializado correctamente');
    console.log(`⏱️ Configuración: ${IMAGE_DISPLAY_TIME}ms display, ${TRANSITION_TIME}ms transition`);
}