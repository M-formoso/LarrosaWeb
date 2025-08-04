// ===== VARIABLES GLOBALES =====
let currentTestimonial = 0;
const testimonials = [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeHeroAnimations();
    initializeCategoryButtons();
    initializeScrollAnimations();
    initializeTestimonials();
    initializeContactForms();
    initializeLazyLoading();
    initializeScrollToTop();
});

// ===== NAVEGACIÓN =====
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
        });
    }

    // Cerrar menú al hacer click en un link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Navbar transparente/sólido al hacer scroll
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
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
    });

    // Highlighting del link activo según la sección
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const sectionHeight = section.offsetHeight;
            if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// ===== ANIMACIONES DEL HERO =====
function initializeHeroAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const categoryButtons = document.querySelectorAll('.category-btn');

    // Animación de aparición del título
    if (heroTitle) {
        setTimeout(() => {
            heroTitle.style.opacity = '0';
            heroTitle.style.transform = 'translateY(30px)';
            heroTitle.style.transition = 'all 0.8s ease';
            
            setTimeout(() => {
                heroTitle.style.opacity = '1';
                heroTitle.style.transform = 'translateY(0)';
            }, 200);
        }, 100);
    }

    // Animación del subtítulo
    if (heroSubtitle) {
        setTimeout(() => {
            heroSubtitle.style.opacity = '0';
            heroSubtitle.style.transform = 'translateY(20px)';
            heroSubtitle.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                heroSubtitle.style.opacity = '1';
                heroSubtitle.style.transform = 'translateY(0)';
            }, 400);
        }, 100);
    }

    // Animación escalonada de los botones
    categoryButtons.forEach((button, index) => {
        setTimeout(() => {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px)';
            button.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 600 + (index * 100));
        }, 100);
    });
}

// ===== BOTONES DE CATEGORÍAS =====
function initializeCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Efecto visual de click
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Redirigir a la página de unidades con filtro
            window.location.href = `sections/unidadesDisponibles.html?filter=${category}`;
        });

        // Efecto hover mejorado
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// ===== ANIMACIONES AL HACER SCROLL =====
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Animaciones específicas para diferentes elementos
                if (entry.target.classList.contains('unit-card')) {
                    animateUnitCard(entry.target);
                } else if (entry.target.classList.contains('value-card')) {
                    animateValueCard(entry.target);
                } else if (entry.target.classList.contains('section-title')) {
                    animateSectionTitle(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observar elementos
    const elementsToAnimate = document.querySelectorAll('.unit-card, .value-card, .testimonial-card, .section-title');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// ===== FUNCIONES DE ANIMACIÓN =====
function animateUnitCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, Math.random() * 200);
}

function animateValueCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9) translateY(20px)';
    card.style.transition = 'all 0.7s ease';
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1) translateY(0)';
    }, Math.random() * 300);
}

function animateSectionTitle(title) {
    title.style.opacity = '0';
    title.style.transform = 'translateY(40px)';
    title.style.transition = 'all 0.8s ease';
    
    setTimeout(() => {
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
    }, 100);
}

// ===== TESTIMONIOS DINÁMICOS =====
function initializeTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    if (testimonialCards.length > 0) {
        // Efecto hover en testimonios
        testimonialCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
                this.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.15)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
        });

        // Auto-scroll suave de testimonios en móvil
        if (window.innerWidth <= 768 && testimonialCards.length > 1) {
            let currentIndex = 0;
            setInterval(() => {
                testimonialCards[currentIndex].style.opacity = '0.7';
                currentIndex = (currentIndex + 1) % testimonialCards.length;
                testimonialCards[currentIndex].style.opacity = '1';
                testimonialCards[currentIndex].scrollIntoView({ 
                    behavior: 'smooth', 
                    inline: 'center' 
                });
            }, 5000);
        }
    }
}

// ===== FORMULARIOS DE CONTACTO =====
function initializeContactForms() {
    const buttons = document.querySelectorAll('.btn-view-unit, .btn-financing, .btn-randon');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Efecto de ripple
            createRippleEffect(this, e);
            
            // Acciones específicas según el botón
            if (this.classList.contains('btn-view-unit')) {
                handleUnitView(this);
            } else if (this.classList.contains('btn-financing')) {
                handleFinancing();
            } else if (this.classList.contains('btn-randon')) {
                handleRandonRedirect();
            }
        });
    });
}

// ===== EFECTOS VISUALES =====
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
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// CSS para la animación ripple
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ===== MANEJO DE ACCIONES =====
function handleUnitView(button) {
    const unitCard = button.closest('.unit-card');
    const unitTitle = unitCard.querySelector('.unit-title').textContent;
    
    // Simular carga
    button.innerHTML = 'Cargando...';
    button.disabled = true;
    
    setTimeout(() => {
        // Redirigir a página de detalle de unidad
        window.location.href = `sections/unidadesDisponibles.html?unit=${encodeURIComponent(unitTitle)}`;
    }, 1000);
}

function handleFinancing() {
    // Mostrar modal de financiamiento o redirigir
    showNotification('Redirigiendo a cotización de vehículos...', 'info');
    setTimeout(() => {
        window.location.href = 'sections/contacto.html?service=financing';
    }, 1500);
}

function handleRandonRedirect() {
    showNotification('Redirigiendo a información de RANDON...', 'info');
    setTimeout(() => {
        window.location.href = 'sections/LarrosaCamiones.html#randon';
    }, 1500);
}

// ===== LAZY LOADING =====
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ===== SCROLL TO TOP =====
function initializeScrollToTop() {
    // Crear botón de scroll to top
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.className = 'scroll-to-top';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-blue);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(scrollButton);
    
    // Mostrar/ocultar botón según scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollButton.style.opacity = '1';
            scrollButton.style.transform = 'translateY(0)';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.transform = 'translateY(20px)';
        }
    });
    
    // Funcionalidad del botón
    scrollButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== NOTIFICACIONES =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'info' ? '#3D5FAC' : '#28a745'};
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
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animar salida
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== UTILIDADES =====
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

// Optimizar eventos de scroll
const optimizedScrollHandler = debounce(() => {
    // Código de scroll optimizado aquí
}, 16); // ~60fps

// ===== RESPONSIVE UTILITIES =====
function handleResize() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    
    // Ajustes específicos para diferentes tamaños de pantalla
    if (isMobile) {
        // Lógica específica para móvil
        document.body.classList.add('mobile');
        document.body.classList.remove('tablet', 'desktop');
    } else if (isTablet) {
        // Lógica específica para tablet
        document.body.classList.add('tablet');
        document.body.classList.remove('mobile', 'desktop');
    } else {
        // Lógica específica para desktop
        document.body.classList.add('desktop');
        document.body.classList.remove('mobile', 'tablet');
    }
}

// Ejecutar al cargar y redimensionar
window.addEventListener('resize', debounce(handleResize, 250));
handleResize(); // Ejecutar inmediatamente

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', function() {
    console.log('🚛 Larrosa Camiones - Sitio web cargado correctamente');
    console.log('⚡ Tiempo de carga:', performance.now().toFixed(2) + 'ms');
});