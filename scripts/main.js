// LARROSA CAMIONES - Main JavaScript File

// Variables globales
let currentHeroSlide = 0;
const heroSlides = [];
let heroSlideInterval;
let isFormSubmitting = false;

// Configuración
const CONFIG = {
    heroSlideSpeed: 5000, // 5 segundos
    animationDuration: 600,
    whatsappNumber: '5493512345678',
    baseURL: window.location.origin
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Inicializar aplicación
function initializeApp() {
    console.log('🚛 Iniciando Larrosa Camiones...');
    
    initializeNavigation();
    initializeHeroSlider();
    initializeScrollAnimations();
    initializeMarcasCarousel();
    initializeSmoothScrolling();
    initializeFormValidation();
    initializeContactButtons();
    initializeLazyLoading();
    
    console.log('✅ Larrosa Camiones inicializado correctamente');
}

// === NAVEGACIÓN ===
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu móvil
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevenir scroll del body cuando el menú está abierto
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        });
    }

    // Cerrar menu al hacer click en link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Navbar sticky behavior mejorado
    let lastScrollY = window.scrollY;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', throttle(() => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = '#ffffff';
            header.style.backdropFilter = 'none';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
        
        // Auto-hide en scroll down, show en scroll up
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    }, 16));

    // Active nav link based on scroll position
    window.addEventListener('scroll', throttle(updateActiveNavLink, 100));
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id') || section.className.split('-')[0];
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && (href.includes(current) || (current === '' && href.includes('index')))) {
            link.classList.add('active');
        }
    });
}

// === HERO SLIDER ===
function initializeHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');
    
    if (slides.length === 0) return;
    
    // Guardar slides en array global
    heroSlides.length = 0;
    slides.forEach((slide, index) => {
        heroSlides.push({
            element: slide,
            index: index
        });
    });
    
    // Inicializar primer slide
    showHeroSlide(0);
    
    // Auto-play
    startHeroSlideshow();
    
    // Controles
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            changeHeroSlide(-1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            changeHeroSlide(1);
        });
    }
    
    // Indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentHeroSlide(index + 1);
        });
    });
    
    // Pausar en hover
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.addEventListener('mouseenter', pauseHeroSlideshow);
        heroSection.addEventListener('mouseleave', startHeroSlideshow);
    }
    
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            changeHeroSlide(-1);
        } else if (e.key === 'ArrowRight') {
            changeHeroSlide(1);
        }
    });
}

function showHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    // Validar índice
    if (index >= slides.length) currentHeroSlide = 0;
    if (index < 0) currentHeroSlide = slides.length - 1;
    
    // Ocultar todas las slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Remover active de todos los indicadores
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });
    
    // Mostrar slide actual
    if (slides[currentHeroSlide]) {
        slides[currentHeroSlide].classList.add('active');
    }
    
    // Activar indicador correspondiente
    if (indicators[currentHeroSlide]) {
        indicators[currentHeroSlide].classList.add('active');
    }
}

function changeHeroSlide(direction) {
    pauseHeroSlideshow();
    currentHeroSlide += direction;
    
    if (currentHeroSlide >= heroSlides.length) {
        currentHeroSlide = 0;
    } else if (currentHeroSlide < 0) {
        currentHeroSlide = heroSlides.length - 1;
    }
    
    showHeroSlide(currentHeroSlide);
    startHeroSlideshow();
}

function currentHeroSlide(index) {
    pauseHeroSlideshow();
    currentHeroSlide = index - 1;
    showHeroSlide(currentHeroSlide);
    startHeroSlideshow();
}

function startHeroSlideshow() {
    pauseHeroSlideshow();
    heroSlideInterval = setInterval(() => {
        changeHeroSlide(1);
    }, CONFIG.heroSlideSpeed);
}

function pauseHeroSlideshow() {
    if (heroSlideInterval) {
        clearInterval(heroSlideInterval);
    }
}

// === ANIMACIONES AL SCROLL ===
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Agregar delay escalonado para elementos del mismo contenedor
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, observerOptions);

    // Elementos a animar
    const animatedElements = document.querySelectorAll(`
        .unidad-card,
        .valor-card,
        .testimonio-card,
        .marca-item,
        .hero-category-btn
    `);

    animatedElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
    
    // Animaciones especiales para secciones completas
    const sections = document.querySelectorAll('.section-header, .por-que-section .valores-grid');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// === CAROUSEL DE MARCAS ===
function initializeMarcasCarousel() {
    const marcasContainer = document.querySelector('.marcas-container');
    
    if (marcasContainer) {
        // Obtener todas las marcas originales
        const originalMarcas = Array.from(marcasContainer.children);
        
        // Clonar las marcas para crear efecto infinito
        originalMarcas.forEach(marca => {
            const clone = marca.cloneNode(true);
            marcasContainer.appendChild(clone);
        });
        
        // Pausar animación en hover
        marcasContainer.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });

        marcasContainer.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }
}

// === SMOOTH SCROLLING ===
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Analytics tracking
                trackEvent('Navigation', 'Anchor Click', targetId);
            }
        });
    });
}

// === VALIDACIÓN DE FORMULARIOS ===
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            validateAndSubmitForm(this);
        });
        
        // Validación en tiempo real
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    });
}

function validateAndSubmitForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    // Limpiar errores previos
    clearFormErrors(form);
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (isValid) {
        submitForm(form);
    } else {
        showNotification('Por favor, corrige los errores en el formulario', 'error');
    }
}

function validateField(field) {
    const value = field.value.trim();
    
    // Campo requerido vacío
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo es requerido');
        return false;
    }
    
    // Validaciones específicas por tipo
    if (value) {
        switch (field.type) {
            case 'email':
                if (!isValidEmail(value)) {
                    showFieldError(field, 'Ingresa un email válido');
                    return false;
                }
                break;
            case 'tel':
                if (!isValidPhone(value)) {
                    showFieldError(field, 'Ingresa un teléfono válido');
                    return false;
                }
                break;
        }
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remover mensaje anterior
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Agregar nuevo mensaje
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.field-error');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function clearFormErrors(form) {
    const errorFields = form.querySelectorAll('.error');
    const errorMessages = form.querySelectorAll('.field-error');
    
    errorFields.forEach(field => field.classList.remove('error'));
    errorMessages.forEach(message => message.remove());
}

function submitForm(form) {
    if (isFormSubmitting) return;
    
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    isFormSubmitting = true;
    
    // Mostrar loading
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitButton.disabled = true;
    
    // Recopilar datos del formulario
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Simular envío (aquí iría la lógica real)
    setTimeout(() => {
        // Simular respuesta exitosa
        showNotification('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
        form.reset();
        clearFormErrors(form);
        
        // Restaurar botón
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        isFormSubmitting = false;
        
        // Analytics
        trackEvent('Form', 'Submit Success', form.id || 'contact');
        
    }, 2000);
}

// === BOTONES DE CONTACTO ===
function initializeContactButtons() {
    // Consultar precio
    window.consultarPrecio = function(unidadId) {
        const mensaje = `Hola! Me interesa consultar el precio de la unidad: ${unidadId}. ¿Podrían brindarme más información?`;
        const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
        
        window.open(whatsappUrl, '_blank');
        
        // Analytics
        trackEvent('Contact', 'Consultar Precio', unidadId);
    };
    
    // WhatsApp genérico
    const whatsappBtns = document.querySelectorAll('.whatsapp-btn, a[href*="wa.me"]');
    whatsappBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Analytics
            trackEvent('Contact', 'WhatsApp Click', this.textContent.trim());
        });
    });
    
    // Botón teléfono
    const phoneBtns = document.querySelectorAll('a[href^="tel:"]');
    phoneBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            trackEvent('Contact', 'Phone Call', this.href);
        });
    });
}

// === LAZY LOADING ===
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Crear imagen temporal para precarga
                const tempImg = new Image();
                tempImg.onload = function() {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    img.classList.remove('lazy');
                };
                tempImg.onerror = function() {
                    img.src = 'assets/images/placeholder.jpg';
                    img.alt = 'Imagen no disponible';
                };
                tempImg.src = img.dataset.src;
                
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });
    
    images.forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
    });
}

// === NOTIFICACIONES ===
function showNotification(message, type = 'info') {
    // Remover notificaciones previas
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification.querySelector('.notification-close'));
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
}

// === VALIDADORES AUXILIARES ===
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Acepta diferentes formatos de teléfono argentino
    const phoneRegex = /^(\+54|0054|54)?[\s\-]?(?:\(?(?:11|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\)?[\s\-]?)?(?:\d{4}[\s\-]?\d{4}|\d{3}[\s\-]?\d{3}|\d{6,8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// === UTILIDADES ===
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
}

// === ANALYTICS Y TRACKING ===
function trackEvent(category, action, label) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            custom_parameter_1: 'Larrosa_Camiones'
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'CustomEvent', {
            event_category: category,
            event_action: action,
            event_label: label
        });
    }
    
    // Log para desarrollo
    console.log(`📊 Event: ${category} - ${action} - ${label}`);
}

// === FUNCIONES GLOBALES PARA HTML ===
window.changeHeroSlide = changeHeroSlide;
window.currentHeroSlide = currentHeroSlide;
window.consultarPrecio = consultarPrecio;
window.closeNotification = closeNotification;

// === MANEJO DE ERRORES ===
window.addEventListener('error', function(e) {
    console.error('❌ Error en Larrosa Camiones:', e.error);
    trackEvent('Error', 'JavaScript Error', e.error?.message || 'Unknown error');
});

// === PERFORMANCE ===
// Optimizar scroll events
const optimizedScroll = throttle(updateActiveNavLink, 100);

// === ACCESIBILIDAD ===
// Skip links para accesibilidad
function addSkipLinks() {
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
        z-index: 1000;
        transition: top 0.3s;
        border-radius: 4px;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// === INICIALIZACIÓN FINAL ===
// Agregar skip links
addSkipLinks();

// Service Worker (si se implementa PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('✅ ServiceWorker registrado correctamente');
            })
            .catch(function(err) {
                console.log('❌ ServiceWorker falló al registrarse');
            });
    });
}

// Detectar modo offline/online
window.addEventListener('online', function() {
    showNotification('Conexión restaurada', 'success');
});

window.addEventListener('offline', function() {
    showNotification('Sin conexión a internet', 'warning');
});

// === EXPORTAR PARA TESTING ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateField,
        isValidEmail,
        isValidPhone,
        trackEvent
    };
}