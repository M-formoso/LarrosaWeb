// ===== CONTACTO JAVASCRIPT MEJORADO ===== 

// Global Variables
let formSubmitted = false;
let validationRules = {};

// Configuration
const CONFIG = {
    emailJS: {
        serviceId: 'service_larrosa',
        templateId: 'template_contacto',
        publicKey: 'your-public-key-here'
    },
    whatsapp: {
        number: '543534567890',
        baseUrl: 'https://wa.me/'
    },
    phone: '+543534567890',
    email: 'info@larrosacamiones.com',
    maps: {
        coordinates: {
            lat: -32.4167,
            lng: -63.2467
        },
        googleMapsUrl: 'https://www.google.com/maps/dir//Chiclana,+Larrabure,+X5900+Villa+Mar%C3%ADa,+C%C3%B3rdoba/@-32.3973954,-63.3400838,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x95cc432ebb1b66e3:0xc0a2c534d30d7099!2m2!1d-63.2576825!2d-32.3974222?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚛 Iniciando página de contacto...');
    
    initializeContactForm();
    initializeAnimations();
    initializeFAQ();
    initializeValidation();
    initializeModalHandlers();
    initializeQuickContacts();
    initializeMapClickHandler();
    
    console.log('✅ Contacto inicializado correctamente');
});

// ===== FORM MANAGEMENT ===== 
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
    
    // Dynamic form behavior
    setupDynamicFormBehavior();
    
    // Prevent multiple submissions
    form.addEventListener('submit', function(e) {
        if (formSubmitted) {
            e.preventDefault();
            return false;
        }
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (formSubmitted) return;
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate all fields
    if (!validateForm(form)) {
        showFormMessage('Por favor corrige los errores en el formulario', 'error');
        return;
    }
    
    // Set loading state
    setFormLoading(true);
    formSubmitted = true;
    
    try {
        // Prepare data
        const contactData = {
            nombre: formData.get('nombre'),
            empresa: formData.get('empresa') || 'No especificada',
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            provincia: formData.get('provincia') || 'No especificada',
            consultaTipo: formData.get('consulta-tipo'),
            mensaje: formData.get('mensaje'),
            newsletter: formData.get('newsletter') === 'on',
            timestamp: new Date().toISOString(),
            source: 'Formulario web contacto'
        };
        
        // Simulate API call (replace with real API)
        const result = await submitContactForm(contactData);
        
        if (result.success) {
            showFormMessage('¡Mensaje enviado correctamente! Te responderemos a la brevedad.', 'success');
            form.reset();
            setFormSuccess(true);
            
            // Track conversion
            trackFormSubmission(contactData);
            
            // Optional: Redirect to thank you page
            setTimeout(() => {
                // window.location.href = 'gracias.html';
            }, 3000);
            
        } else {
            throw new Error(result.error || 'Error al enviar el formulario');
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showFormMessage('Error al enviar el mensaje. Por favor intenta nuevamente o contactanos por WhatsApp.', 'error');
        setFormError(true);
    } finally {
        setFormLoading(false);
        setTimeout(() => {
            formSubmitted = false;
        }, 5000);
    }
}

async function submitContactForm(data) {
    // Simulate API call - replace with your actual endpoint
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate random success/failure for demo
            const success = Math.random() > 0.1; // 90% success rate
            
            if (success) {
                resolve({ success: true, id: Date.now() });
            } else {
                resolve({ success: false, error: 'Error de servidor' });
            }
        }, 2000);
    });
}

// ===== FORM VALIDATION ===== 
function initializeValidation() {
    validationRules = {
        nombre: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            message: 'Ingresa un nombre válido (solo letras y espacios)'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Ingresa un email válido'
        },
        telefono: {
            required: true,
            pattern: /^[\d\s\-\+\(\)]+$/,
            minLength: 8,
            message: 'Ingresa un teléfono válido'
        },
        'consulta-tipo': {
            required: true,
            message: 'Selecciona el tipo de consulta'
        },
        mensaje: {
            required: true,
            minLength: 10,
            maxLength: 1000,
            message: 'El mensaje debe tener entre 10 y 1000 caracteres'
        },
        privacy: {
            required: true,
            message: 'Debes aceptar la política de privacidad'
        }
    };
}

function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    const rules = validationRules[fieldName];
    
    if (!rules) return true;
    
    // Clear previous errors
    clearFieldError(field);
    
    // Required field validation
    if (rules.required && !value) {
        if (field.type === 'checkbox' && !field.checked) {
            showFieldError(field, rules.message || 'Este campo es obligatorio');
            return false;
        } else if (field.type !== 'checkbox' && !value) {
            showFieldError(field, rules.message || 'Este campo es obligatorio');
            return false;
        }
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return true;
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
        showFieldError(field, rules.message);
        return false;
    }
    
    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
        showFieldError(field, `Mínimo ${rules.minLength} caracteres`);
        return false;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
        showFieldError(field, `Máximo ${rules.maxLength} caracteres`);
        return false;
    }
    
    // Show success state
    showFieldSuccess(field);
    return true;
}

function validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Remove existing error
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Add error class
    field.classList.add('error');
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 0.85rem;
        margin-top: 5px;
        animation: fadeInUp 0.3s ease;
    `;
    
    formGroup.appendChild(errorDiv);
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    field.classList.remove('error', 'success');
    
    const errorDiv = formGroup.querySelector('.field-error');
    if (errorDiv) errorDiv.remove();
}

function showFieldSuccess(field) {
    field.classList.remove('error');
    field.classList.add('success');
}

// ===== FORM STATES ===== 
function setFormLoading(loading) {
    const form = document.getElementById('contact-form');
    const submitBtn = form.querySelector('.submit-btn');
    
    if (loading) {
        form.classList.add('form-loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Enviando...</span>';
    } else {
        form.classList.remove('form-loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Enviar consulta</span>';
    }
}

function setFormSuccess(success) {
    const form = document.getElementById('contact-form');
    const submitBtn = form.querySelector('.submit-btn');
    
    if (success) {
        form.classList.add('form-success');
        submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>¡Enviado!</span>';
        
        setTimeout(() => {
            form.classList.remove('form-success');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Enviar consulta</span>';
        }, 3000);
    }
}

function setFormError(error) {
    const form = document.getElementById('contact-form');
    const submitBtn = form.querySelector('.submit-btn');
    
    if (error) {
        form.classList.add('form-error');
        submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Error al enviar</span>';
        
        setTimeout(() => {
            form.classList.remove('form-error');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Enviar consulta</span>';
        }, 3000);
    }
}

function showFormMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) existingMessage.remove();
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
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
    const form = document.getElementById('contact-form');
    form.parentNode.insertBefore(messageDiv, form.nextSibling);
    
    // Auto-remove after delay
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }
    }, type === 'success' ? 5000 : 7000);
}

// ===== DYNAMIC FORM BEHAVIOR ===== 
function setupDynamicFormBehavior() {
    const consultaTipo = document.getElementById('consulta-tipo');
    const mensaje = document.getElementById('mensaje');
    
    if (consultaTipo && mensaje) {
        consultaTipo.addEventListener('change', function() {
            const tipo = this.value;
            const placeholders = {
                'compra-camion': 'Describí qué tipo de camión necesitás: marca preferida, año, kilómetros, etc. También mencioná tu presupuesto aproximado y si tenés vehículo para dar en parte de pago...',
                'venta-camion': 'Describí el camión que querés vender: marca, modelo, año, kilómetros, estado general, documentación, etc...',
                'randon': 'Contanos qué producto Randon te interesa: tipo de semirremolque, capacidad, especificaciones técnicas...',
                'financiacion': 'Describí tu consulta sobre financiación: monto aproximado, plazo deseado, si tenés vehículo para dar en parte de pago...',
                'servicio': 'Describí el servicio técnico que necesitás: tipo de reparación, marca del vehículo, problema específico...',
                'repuestos': 'Especificá qué repuestos necesitás: marca, modelo del vehículo, año, descripción del repuesto...',
                'otros': 'Describí tu consulta en detalle...'
            };
            
            if (placeholders[tipo]) {
                mensaje.placeholder = placeholders[tipo];
                mensaje.focus();
            }
        });
    }
    
    // Auto-format phone number
    const telefono = document.getElementById('telefono');
    if (telefono) {
        telefono.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = `${value.slice(0, 3)}-${value.slice(3)}`;
                } else if (value.length <= 10) {
                    value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
                } else {
                    value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
                }
            }
            this.value = value;
        });
    }
}

// ===== FAQ FUNCTIONALITY ===== 
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => toggleFaq(question));
        }
    });
}

function toggleFaq(button) {
    const faqItem = button.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const icon = button.querySelector('i');
    
    // Close other FAQs
    document.querySelectorAll('.faq-question.active').forEach(activeBtn => {
        if (activeBtn !== button) {
            const activeItem = activeBtn.closest('.faq-item');
            const activeAnswer = activeItem.querySelector('.faq-answer');
            
            activeBtn.classList.remove('active');
            activeAnswer.classList.remove('active');
        }
    });
    
    // Toggle current FAQ
    const isActive = button.classList.contains('active');
    
    if (isActive) {
        button.classList.remove('active');
        answer.classList.remove('active');
    } else {
        button.classList.add('active');
        answer.classList.add('active');
        
        // Scroll into view if needed
        setTimeout(() => {
            const rect = faqItem.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) {
                faqItem.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }
        }, 400);
    }
}

// ===== MODAL HANDLERS ===== 
function initializeModalHandlers() {
    // Close modals on outside click
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Close modals on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });
}

function openMapModal() {
    const modal = document.getElementById('map-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Track event
        trackEvent('Modal', 'Open', 'Map');
    }
}

function closeMapModal() {
    const modal = document.getElementById('map-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function openPrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Track event
        trackEvent('Modal', 'Open', 'Privacy');
    }
}

function closePrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// ===== QUICK CONTACTS ===== 
function initializeQuickContacts() {
    const quickContacts = document.querySelectorAll('.quick-contact-item');
    
    quickContacts.forEach(contact => {
        contact.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                // Let the default behavior handle the link
                trackQuickContact(this);
            }
        });
    });
}

function trackQuickContact(element) {
    const icon = element.querySelector('.quick-icon i');
    let type = 'unknown';
    
    if (icon.classList.contains('fa-phone')) {
        type = 'phone';
    } else if (icon.classList.contains('fa-whatsapp')) {
        type = 'whatsapp';
    } else if (icon.classList.contains('fa-envelope')) {
        type = 'email';
    } else if (icon.classList.contains('fa-map-marker-alt')) {
        type = 'location';
    }
    
    trackEvent('Quick Contact', 'Click', type);
}

// ===== ANIMATIONS ===== 
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Trigger specific animations
                if (entry.target.classList.contains('quick-contact-item')) {
                    animateQuickContact(entry.target);
                } else if (entry.target.classList.contains('faq-item')) {
                    animateFaqItem(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll(`
        .quick-contact-item,
        .contact-form-container,
        .contact-info-container,
        .faq-item,
        .map-card
    `);
    
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
    
    // Hero stats animation
    animateHeroStats();
}

function animateQuickContact(element) {
    const index = Array.from(element.parentNode.children).indexOf(element);
    element.style.animationDelay = `${index * 0.1}s`;
    element.style.animation = 'fadeInUp 0.6s ease forwards';
}

function animateFaqItem(element) {
    const index = Array.from(element.parentNode.children).indexOf(element);
    element.style.animationDelay = `${index * 0.1}s`;
    element.style.animation = 'fadeInUp 0.6s ease forwards';
}

function animateHeroStats() {
    const statNumbers = document.querySelectorAll('.hero-stats .stat-number');
    
    statNumbers.forEach((stat, index) => {
        const finalText = stat.textContent;
        const hasNumber = /\d/.test(finalText);
        
        if (hasNumber) {
            const number = parseInt(finalText.replace(/\D/g, ''));
            const suffix = finalText.replace(/[\d]/g, '');
            
            animateNumber(stat, 0, number, 2000, suffix);
        }
    });
}

function animateNumber(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = end + suffix;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// ===== TRACKING AND ANALYTICS ===== 
function trackFormSubmission(data) {
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
            event_category: 'Contact',
            event_label: data.consultaTipo,
            custom_parameter_1: 'contact_form',
            user_properties: {
                contact_method: 'form'
            }
        });
    }
    
    // Custom tracking
    trackEvent('Form', 'Submit', data.consultaTipo);
    
    console.log('📊 Form submission tracked:', data.consultaTipo);
}

function trackEvent(category, action, label) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            custom_parameter_1: 'contacto_page'
        });
    }
    
    // Custom analytics
    console.log(`📊 Event: ${category} - ${action} - ${label}`);
    
    // Send to custom analytics if available
    if (window.customAnalytics) {
        window.customAnalytics.track(category, action, label);
    }
}

// ===== UTILITY FUNCTIONS ===== 
function formatPhoneNumber(phone) {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11) {
        return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
}

function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}

function generateContactId() {
    return 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showNotification(message, type = 'info', duration = 5000) {
    // Create notification element
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
        z-index: 10001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
        font-weight: 600;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// ===== WHATSAPP INTEGRATION ===== 
function openWhatsAppContact(tipo = '') {
    const messages = {
        'compra-camion': 'Hola! Me interesa comprar un camión. ¿Podrían asesorarme con las opciones disponibles?',
        'venta-camion': 'Hola! Tengo un camión para vender. ¿Podrían darme información sobre el proceso?',
        'randon': 'Hola! Me interesan los productos Randon. ¿Podrían brindarme más información?',
        'financiacion': 'Hola! Necesito información sobre opciones de financiación para camiones.',
        'servicio': 'Hola! Necesito servicio técnico para mi camión. ¿Podrían ayudarme?',
        'repuestos': 'Hola! Estoy buscando repuestos para mi camión. ¿Tienen disponibilidad?',
        'default': 'Hola! Me gustaría recibir más información sobre Larrosa Camiones.'
    };
    
    const message = messages[tipo] || messages.default;
    const whatsappUrl = `${CONFIG.whatsapp.baseUrl}${CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    trackEvent('Contact', 'WhatsApp', tipo || 'general');
}

// ===== EMAIL FUNCTIONALITY ===== 
function openEmailContact(subject = '', body = '') {
    const defaultSubject = 'Consulta desde web - Larrosa Camiones';
    const defaultBody = 'Hola,\n\nMe gustaría recibir más información sobre sus servicios.\n\nGracias.';
    
    const emailUrl = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject || defaultSubject)}&body=${encodeURIComponent(body || defaultBody)}`;
    window.location.href = emailUrl;
    
    trackEvent('Contact', 'Email', 'direct');
}

// ===== ACCESSIBILITY FEATURES ===== 
function initializeAccessibility() {
    // Keyboard navigation for FAQ
    document.addEventListener('keydown', function(event) {
        if (event.target.classList.contains('faq-question')) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleFaq(event.target);
            }
        }
    });
    
    // Focus management for modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('shown', function() {
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        });
    });
    
    // Announce form errors to screen readers
    function announceError(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// ===== ERROR HANDLING ===== 
function initializeErrorHandling() {
    window.addEventListener('error', function(event) {
        console.error('❌ Error en contacto:', event.error);
        trackEvent('Error', 'JavaScript Error', event.error?.message || 'Unknown error');
    });
    
    window.addEventListener('unhandledrejection', function(event) {
        console.error('❌ Promise rejection en contacto:', event.reason);
        trackEvent('Error', 'Promise Rejection', event.reason?.message || 'Unknown rejection');
    });
}

// ===== PERFORMANCE MONITORING ===== 
function initializePerformanceMonitoring() {
    // Page load time
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`⚡ Página de contacto cargada en ${Math.round(loadTime)}ms`);
        trackEvent('Performance', 'Page Load', Math.round(loadTime));
    });
    
    // Form interaction time
    let formFirstInteraction = null;
    const form = document.getElementById('contact-form');
    
    if (form) {
        form.addEventListener('focus', function() {
            if (!formFirstInteraction) {
                formFirstInteraction = performance.now();
            }
        }, true);
        
        form.addEventListener('submit', function() {
            if (formFirstInteraction) {
                const interactionTime = performance.now() - formFirstInteraction;
                trackEvent('Performance', 'Form Interaction Time', Math.round(interactionTime));
            }
        });
    }
}

// ===== RESPONSIVE FEATURES ===== 
function initializeResponsiveFeatures() {
    // Adjust form behavior on mobile
    function handleResize() {
        const isMobile = window.innerWidth <= 768;
        const form = document.getElementById('contact-form');
        
        if (isMobile) {
            // Mobile-specific optimizations
            document.body.classList.add('mobile-view');
            
            // Adjust modal sizes
            const modals = document.querySelectorAll('.modal-content');
            modals.forEach(modal => {
                modal.style.width = '95%';
                modal.style.margin = '10% auto';
            });
            
        } else {
            document.body.classList.remove('mobile-view');
            
            // Desktop modal sizes
            const modals = document.querySelectorAll('.modal-content');
            modals.forEach(modal => {
                modal.style.width = '';
                modal.style.margin = '';
            });
        }
    }
    
    // Initial call and resize listener
    handleResize();
    window.addEventListener('resize', debounce(handleResize, 250));
}

// ===== UTILITY FUNCTIONS ===== 
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
    // ===== MAP CLICK HANDLER ===== 
function initializeMapClickHandler() {
    // Encontrar todos los contenedores de mapas
    const mapContainers = document.querySelectorAll('.map-container');
    
    mapContainers.forEach(container => {
        // Crear una capa transparente sobre el iframe
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
            z-index: 10;
        `;
        
        // Hacer que el contenedor sea relativo si no lo es
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        
        // Agregar el overlay al contenedor
        container.appendChild(overlay);
        
        // Agregar evento de click al overlay
        overlay.addEventListener('click', function() {
            // Abrir Google Maps en una nueva pestaña
            window.open(CONFIG.maps.googleMapsUrl, '_blank');
            
            // Track del evento
            trackEvent('Map', 'Click', 'Direct to Google Maps');
            console.log('🗺️ Abriendo Google Maps desde mapa');
        });
        
        // Efecto hover
        overlay.addEventListener('mouseenter', function() {
            overlay.style.backgroundColor = 'rgba(61, 95, 172, 0.1)';
        });
        
        overlay.addEventListener('mouseleave', function() {
            overlay.style.backgroundColor = 'transparent';
        });
    });
}

// ===== GLOBAL EXPORTS ===== 
// (continúa el resto del código...)
}

// ===== GLOBAL EXPORTS ===== 
// Make functions available globally for HTML onclick handlers
window.toggleFaq = toggleFaq;
window.openMapModal = openMapModal;
window.closeMapModal = closeMapModal;
window.openPrivacyModal = openPrivacyModal;
window.closePrivacyModal = closePrivacyModal;
window.openWhatsAppContact = openWhatsAppContact;
window.openEmailContact = openEmailContact;

// ===== MAP CLICK HANDLER ===== 
function initializeMapClickHandler() {
    // Encontrar todos los contenedores de mapas
    const mapContainers = document.querySelectorAll('.map-container');
    
    mapContainers.forEach(container => {
        // Crear una capa transparente sobre el iframe
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
            z-index: 10;
        `;
        
        // Hacer que el contenedor sea relativo si no lo es
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        
        // Agregar el overlay al contenedor
        container.appendChild(overlay);
        
        // Agregar evento de click al overlay
        overlay.addEventListener('click', function() {
            // Abrir Google Maps en una nueva pestaña
            window.open(CONFIG.maps.googleMapsUrl, '_blank');
            
            // Track del evento
            trackEvent('Map', 'Click', 'Direct to Google Maps');
            console.log('🗺️ Abriendo Google Maps desde mapa');
        });
        
        // Efecto hover
        overlay.addEventListener('mouseenter', function() {
            overlay.style.backgroundColor = 'rgba(61, 95, 172, 0.1)';
        });
        
        overlay.addEventListener('mouseleave', function() {
            overlay.style.backgroundColor = 'transparent';
        });
    });
}

// ===== INITIALIZATION ===== 
// (resto del código...)