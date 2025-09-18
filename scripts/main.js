// ===== VARIABLES GLOBALES =====
let currentTestimonial = 0;
const testimonials = [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeHeroAnimations();
    initializeCategoryButtons();
    initializeScrollAnimations();
   // initializeTestimonials();//
    initializeContactForms();
    initializeLazyLoading();
    initializeScrollToTop();

   
    setTimeout(function() {
        console.log('⏰ Inicializando testimonios tras delay...');
        initializeTestimonialsComplete();
    }, 1500); // Aumentar delay a 1.5 segundos
    
    // Tu carrusel de unidades existente
    setTimeout(function() {
        console.log('⏰ Inicializando carrusel tras delay...');
        initializeCarousel();
    }, 1000);
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
})// ===== JAVASCRIPT ACTUALIZADO PARA MARCAS ESTÁTICAS =====
// Reemplaza o modifica el JavaScript existente

document.addEventListener('DOMContentLoaded', function() {
    // ===== INICIALIZACIÓN DE MARCAS ESTÁTICAS =====
    initializeBrandsStatic();
});

function initializeBrandsStatic() {
    console.log('🏢 Inicializando marcas estáticas...');
    
    // Ya NO duplicamos el contenido porque es estático
    // const brandsTrack = document.querySelector('.brands-track');
    // if (brandsTrack) {
    //     const originalContent = brandsTrack.innerHTML;
    //     brandsTrack.innerHTML = originalContent + originalContent;
    // }
    
    // Agregar animación de entrada
    const brandsSection = document.querySelector('.brands');
    if (brandsSection) {
        // Observer para la animación de entrada
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    console.log('🎯 Animando entrada de marcas');
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(brandsSection);
    }
    
    // Tracking de clicks en marcas
    const brandLogos = document.querySelectorAll('.brand-logo');
    brandLogos.forEach((logo, index) => {
        // Agregar eventos de click
        logo.addEventListener('click', function() {
            const brandName = this.alt;
            console.log(`🚛 Brand clicked: ${brandName}`);
            
            // Google Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    event_category: 'Brand Logo',
                    event_label: brandName,
                    transport_type: 'beacon'
                });
            }
            
            // Ejemplo de acción al hacer click (puedes modificar)
            // window.open(`https://ejemplo.com/marca/${brandName.toLowerCase()}`, '_blank');
        });
        
        // Mejorar accesibilidad
        logo.setAttribute('tabindex', '0');
        logo.setAttribute('role', 'button');
        logo.setAttribute('aria-label', `Ver información de ${logo.alt}`);
        
        // Navegación con teclado
        logo.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Animación escalonada de entrada
        logo.style.animationDelay = `${index * 0.1}s`;
    });
    
    // ===== ELIMINADO: Funcionalidad de pausa =====
    // Ya no necesitamos pausar/reanudar porque no hay animación
    
    console.log('✅ Marcas estáticas inicializadas correctamente');
}

// ===== FUNCIÓN PARA DESTACAR UNA MARCA ESPECÍFICA (OPCIONAL) =====
function highlightBrand(brandName) {
    const brandLogos = document.querySelectorAll('.brand-logo');
    
    brandLogos.forEach(logo => {
        if (logo.alt.toLowerCase().includes(brandName.toLowerCase())) {
            // Destacar la marca
            logo.style.transform = 'scale(1.2)';
            logo.style.opacity = '1';
            logo.style.filter = 'grayscale(0%) brightness(1)';
            logo.style.boxShadow = '0 8px 25px rgba(61, 95, 172, 0.3)';
            logo.style.zIndex = '10';
            
            // Quitar el destacado después de 3 segundos
            setTimeout(() => {
                logo.style.transform = '';
                logo.style.opacity = '';
                logo.style.filter = '';
                logo.style.boxShadow = '';
                logo.style.zIndex = '';
            }, 3000);
            
            console.log(`🎯 Destacando marca: ${brandName}`);
        }
    });
}

// ===== FUNCIÓN PARA FILTRAR MARCAS (OPCIONAL) =====
function filterBrands(brandNames = []) {
    const brandLogos = document.querySelectorAll('.brand-logo');
    
    if (brandNames.length === 0) {
        // Mostrar todas las marcas
        brandLogos.forEach(logo => {
            logo.style.display = 'block';
            logo.style.opacity = '0.7';
        });
        console.log('🔄 Mostrando todas las marcas');
        return;
    }
    
    brandLogos.forEach(logo => {
        const brandName = logo.alt.toLowerCase();
        const shouldShow = brandNames.some(name => 
            brandName.includes(name.toLowerCase())
        );
        
        if (shouldShow) {
            logo.style.display = 'block';
            logo.style.opacity = '1';
            logo.style.filter = 'grayscale(0%) brightness(1)';
        } else {
            logo.style.display = 'none';
        }
    });
    
    console.log(`🎯 Filtrando marcas: ${brandNames.join(', ')}`);
}

// ===== FUNCIÓN PARA REORGANIZAR MARCAS (OPCIONAL) =====
function reorderBrands(newOrder = []) {
    const brandsTrack = document.querySelector('.brands-track');
    if (!brandsTrack) return;
    
    const brandLogos = Array.from(document.querySelectorAll('.brand-logo'));
    
    if (newOrder.length === 0) {
        console.log('ℹ️ No se especificó nuevo orden de marcas');
        return;
    }
    
    // Crear nuevo orden basado en los nombres proporcionados
    const reorderedLogos = [];
    
    newOrder.forEach(brandName => {
        const logo = brandLogos.find(logo => 
            logo.alt.toLowerCase().includes(brandName.toLowerCase())
        );
        if (logo) {
            reorderedLogos.push(logo);
        }
    });
    
    // Agregar las marcas restantes que no estaban en la lista
    brandLogos.forEach(logo => {
        if (!reorderedLogos.includes(logo)) {
            reorderedLogos.push(logo);
        }
    });
    
    // Limpiar el contenedor y agregar en el nuevo orden
    brandsTrack.innerHTML = '';
    reorderedLogos.forEach(logo => {
        brandsTrack.appendChild(logo);
    });
    
    console.log('🔄 Marcas reorganizadas:', newOrder);
}

// ===== EXPORTAR FUNCIONES GLOBALES =====
window.BrandsStatic = {
    highlight: highlightBrand,
    filter: filterBrands,
    reorder: reorderBrands,
    reinitialize: initializeBrandsStatic
};

// ===== EJEMPLOS DE USO =====
/*
// Destacar una marca específica
// BrandsStatic.highlight('Scania');

// Filtrar solo ciertas marcas
// BrandsStatic.filter(['Scania', 'Volvo', 'Mercedes']);

// Mostrar todas las marcas nuevamente
// BrandsStatic.filter([]);

// Reorganizar marcas en un orden específico
// BrandsStatic.reorder(['Randon', 'Scania', 'Volvo', 'Mercedes', 'Iveco']);

// Reinicializar si es necesario
// BrandsStatic.reinitialize();
*/

// ===== REEMPLAZAR LA SECCIÓN DEL CARRUSEL EN TU scripts/main.js CON ESTE CÓDIGO =====

// Variables globales del carrusel
let carouselCurrentSlide = 0;
let carouselTotalSlides = 0;
let carouselCardsPerView = 4;
let carouselInitialized = false;

// Inicializar carrusel - versión simplificada y robusta
function initializeCarousel() {
    console.log('🎠 Iniciando carrusel...');
    
    // Buscar elementos
    const track = document.getElementById('unitsTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carousel = document.getElementById('unitsCarousel');
    
    // Verificar que existen los elementos
    if (!track || !prevBtn || !nextBtn || !carousel) {
        console.log('❌ Elementos del carrusel no encontrados');
        console.log('Track:', !!track, 'PrevBtn:', !!prevBtn, 'NextBtn:', !!nextBtn, 'Carousel:', !!carousel);
        return;
    }
    
    // Evitar inicialización múltiple
    if (carouselInitialized) {
        console.log('⚠️ Carrusel ya inicializado');
        return;
    }
    
    const cards = track.querySelectorAll('.unit-card');
    carouselTotalSlides = cards.length;
    
    console.log(`📊 Total de cards encontradas: ${carouselTotalSlides}`);
    
    if (carouselTotalSlides === 0) {
        console.log('❌ No se encontraron cards');
        return;
    }
    
    // Calcular cards por vista
    updateCardsPerView();
    
    // Configurar event listeners
    prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('⬅️ Click en botón anterior');
        moveToPrevious();
    });
    
    nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('➡️ Click en botón siguiente');
        moveToNext();
    });
    
    // Crear indicadores
    createCarouselIndicators();
    
    // Actualizar estado inicial
    updateCarouselDisplay();
    
    // Marcar como inicializado
    carouselInitialized = true;
    
    console.log('✅ Carrusel inicializado correctamente');
    console.log(`📱 Cards por vista: ${carouselCardsPerView}`);
    
    // Redimensionar ventana
    window.addEventListener('resize', function() {
        updateCardsPerView();
        updateCarouselDisplay();
        createCarouselIndicators();
    });
}

// Calcular cuántas cards mostrar según pantalla
function updateCardsPerView() {
    const width = window.innerWidth;
    
    if (width <= 480) {
        carouselCardsPerView = 1;
    } else if (width <= 768) {
        carouselCardsPerView = 2;
    } else if (width <= 1024) {
        carouselCardsPerView = 3;
    } else {
        carouselCardsPerView = 4;
    }
    
    console.log(`📏 Ancho: ${width}px, Cards por vista: ${carouselCardsPerView}`);
}

// Mover a slide anterior
function moveToPrevious() {
    if (carouselCurrentSlide > 0) {
        carouselCurrentSlide--;
        updateCarouselDisplay();
        console.log(`⬅️ Moviendo a slide: ${carouselCurrentSlide}`);
    } else {
        console.log('⚠️ Ya está en el primer slide');
    }
}

// Mover a slide siguiente
function moveToNext() {
    const maxSlide = Math.max(0, carouselTotalSlides - carouselCardsPerView);
    
    if (carouselCurrentSlide < maxSlide) {
        carouselCurrentSlide++;
        updateCarouselDisplay();
        console.log(`➡️ Moviendo a slide: ${carouselCurrentSlide}`);
    } else {
        console.log('⚠️ Ya está en el último slide');
    }
}

// Actualizar la visualización del carrusel
function updateCarouselDisplay() {
    const track = document.getElementById('unitsTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!track) return;
    
    // Calcular desplazamiento
    const cardWidth = 270; // Ancho fijo de cada card
    const gap = 40; // Gap en pixels
    const moveDistance = (cardWidth + gap) * carouselCurrentSlide;
    
    // Aplicar transformación
    track.style.transform = `translateX(-${moveDistance}px)`;
    track.style.transition = 'transform 0.5s ease';
    
    console.log(`🎯 Desplazamiento: -${moveDistance}px`);
    
    // Actualizar botones
    if (prevBtn) {
        prevBtn.disabled = carouselCurrentSlide === 0;
        prevBtn.style.opacity = carouselCurrentSlide === 0 ? '0.4' : '1';
    }
    
    if (nextBtn) {
        const maxSlide = Math.max(0, carouselTotalSlides - carouselCardsPerView);
        nextBtn.disabled = carouselCurrentSlide >= maxSlide;
        nextBtn.style.opacity = carouselCurrentSlide >= maxSlide ? '0.4' : '1';
    }
    
    // Actualizar indicadores
    updateCarouselIndicators();
}

// Crear indicadores
function createCarouselIndicators() {
    const indicatorsContainer = document.getElementById('carouselIndicators');
    if (!indicatorsContainer) return;
    
    indicatorsContainer.innerHTML = '';
    
    const maxSlide = Math.max(0, carouselTotalSlides - carouselCardsPerView);
    const totalPages = maxSlide + 1;
    
    for (let i = 0; i <= maxSlide; i++) {
        const indicator = document.createElement('button');
        indicator.className = 'carousel-indicator';
        indicator.addEventListener('click', function() {
            carouselCurrentSlide = i;
            updateCarouselDisplay();
        });
        indicatorsContainer.appendChild(indicator);
    }
    
    console.log(`📍 Creados ${totalPages} indicadores`);
}

// Actualizar indicadores activos
function updateCarouselIndicators() {
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    indicators.forEach((indicator, index) => {
        if (index === carouselCurrentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// ===== ACTUALIZAR TU FUNCIÓN initializeScrollAnimations() =====
// Modifica tu función existente para incluir esto:

// Función para inicializar todo cuando la página carga
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando...');
    
    // Tus funciones existentes
    initializeNavigation();
    initializeHeroAnimations();
    initializeCategoryButtons();
    initializeScrollAnimations();
    initializeTestimonials();
    initializeContactForms();
    initializeLazyLoading();
    initializeScrollToTop();
    
    // NUEVO: Inicializar carrusel con delay para asegurar que el DOM esté listo
    setTimeout(function() {
        console.log('⏰ Inicializando carrusel tras delay...');
        initializeCarousel();
    }, 1000);
});

// También inicializar cuando la ventana termine de cargar completamente
window.addEventListener('load', function() {
    console.log('🏁 Window loaded, verificando carrusel...');
    if (!carouselInitialized) {
        setTimeout(initializeCarousel, 500);
    }
});

// ===== FUNCIONES DE DEBUG =====
// Funciones útiles para verificar el estado (usar en consola del navegador)

function debugCarousel() {
    console.log('🔍 DEBUG CARRUSEL:');
    console.log('Inicializado:', carouselInitialized);
    console.log('Slide actual:', carouselCurrentSlide);
    console.log('Total slides:', carouselTotalSlides);
    console.log('Cards por vista:', carouselCardsPerView);
    
    const track = document.getElementById('unitsTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    console.log('Elementos encontrados:');
    console.log('- Track:', !!track);
    console.log('- Botón Prev:', !!prevBtn);
    console.log('- Botón Next:', !!nextBtn);
    
    if (track) {
        console.log('- Transform actual:', track.style.transform);
        console.log('- Cards en track:', track.querySelectorAll('.unit-card').length);
    }
}

// Funciones de control manual (usar en consola)
function forceNext() {
    console.log('🔧 Forzando siguiente...');
    moveToNext();
}

function forcePrev() {
    console.log('🔧 Forzando anterior...');
    moveToPrevious();
}

function resetCarousel() {
    console.log('🔄 Reseteando carrusel...');
    carouselCurrentSlide = 0;
    updateCarouselDisplay();
}

// Hacer funciones disponibles globalmente para debugging
window.debugCarousel = debugCarousel;
window.forceNext = forceNext;
window.forcePrev = forcePrev;
window.resetCarousel = resetCarousel;

// ===== AGREGAR ESTE CÓDIGO AL FINAL DE scripts/main.js ===== 

// ===== NAVEGACIÓN ACTIVA MEJORADA =====
function initializeActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = getCurrentPageName();
    
    console.log('🧭 Página actual detectada:', currentPage);
    
    // Remover todas las clases active
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Agregar clase active según la página actual
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkPage = getPageFromHref(href);
        
        console.log('🔗 Comparando:', linkPage, 'vs', currentPage);
        
        if (linkPage === currentPage) {
            link.classList.add('active');
            console.log('✅ Marcando como activo:', href);
        }
    });
}

// Detectar el nombre de la página actual
function getCurrentPageName() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop();
    
    // Mapear archivos a nombres de página
    const pageMap = {
        'index.html': 'inicio',
        '': 'inicio', // Para cuando está en la raíz
        'unidadesDisponibles.html': 'unidades',
        'LarrosaCamiones.html': 'empresa', 
        'contacto.html': 'contacto'
    };
    
    return pageMap[fileName] || 'inicio';
}

// Extraer página desde el href del link
function getPageFromHref(href) {
    if (!href) return 'inicio';
    
    // Mapear hrefs a nombres de página
    if (href.includes('#inicio') || href === 'index.html' || href === '/') {
        return 'inicio';
    } else if (href.includes('unidadesDisponibles.html')) {
        return 'unidades';
    } else if (href.includes('LarrosaCamiones.html')) {
        return 'empresa';
    } else if (href.includes('contacto.html')) {
        return 'contacto';
    }
    
    return 'inicio';
}

// Actualizar navegación cuando cambia la página
function updateNavigationOnScroll() {
    // Solo en la página de inicio (con secciones)
    if (getCurrentPageName() !== 'inicio') return;
    
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = 'inicio';
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionHeight = section.offsetHeight;
        
        if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href && href.includes(`#${current}`)) {
            link.classList.add('active');
        }
    });
}

// ===== ACTUALIZAR TU FUNCIÓN initializeNavigation() EXISTENTE =====
// Reemplaza tu función initializeNavigation() con esta versión mejorada:

function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');

    // Inicializar navegación activa al cargar
    initializeActiveNavigation();

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
        
        // Actualizar navegación activa solo en inicio
        updateNavigationOnScroll();
    });
}

// ===== AGREGAR AL FINAL DE TU DOMContentLoaded ===== 
// En tu evento DOMContentLoaded existente, agrega esto:

document.addEventListener('DOMContentLoaded', function() {
    // ... tus funciones existentes ...
    
    // NUEVO: Reinicializar navegación activa después de un pequeño delay
    setTimeout(() => {
        initializeActiveNavigation();
    }, 100);
    
    // NUEVO: Actualizar navegación cuando se navega con el botón atrás/adelante
    window.addEventListener('popstate', function() {
        setTimeout(() => {
            initializeActiveNavigation();
        }, 50);
    });
});

// ===== DEBUGGING (OPCIONAL - REMOVER EN PRODUCCIÓN) =====
// Función para debug - puedes llamarla en la consola del navegador
function debugNavigation() {
    console.log('🔍 DEBUG NAVEGACIÓN:');
    console.log('Página actual:', getCurrentPageName());
    console.log('URL actual:', window.location.pathname);
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link, index) => {
        console.log(`Link ${index}:`, {
            href: link.getAttribute('href'),
            texto: link.textContent.trim(),
            activo: link.classList.contains('active')
        });
    });
}

// Hacer función disponible globalmente para debugging
window.debugNavigation = debugNavigation;
// ===== JAVASCRIPT CORREGIDO PARA TESTIMONIOS - REEMPLAZAR EN scripts/main.js =====

// Variables globales para testimonios
let testimonialsCurrentSlide = 0;
let testimonialsTotalSlides = 0;
let testimonialsCardsPerView = 1; // Cambiar a 1 para mostrar una tarjeta a la vez
let testimonialsInitialized = false;
let testimonialsAutoPlayInterval = null;

// Inicializar carrusel de testimonios
function initializeTestimonialsCarousel() {
    console.log('🎭 Iniciando carrusel de testimonios...');
    
    // Buscar elementos con IDs correctos
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('testimonialsePrevBtn'); // Nota: hay una 'e' extra en el ID
    const nextBtn = document.getElementById('testimonialsNextBtn');
    const carousel = document.getElementById('testimonialsCarousel');
    
    // Verificar que existen los elementos
    if (!track || !prevBtn || !nextBtn || !carousel) {
        console.log('❌ Elementos del carrusel de testimonios no encontrados');
        console.log('Track:', !!track, 'PrevBtn:', !!prevBtn, 'NextBtn:', !!nextBtn, 'Carousel:', !!carousel);
        return;
    }
    
    // Evitar inicialización múltiple
    if (testimonialsInitialized) {
        console.log('⚠️ Carrusel de testimonios ya inicializado');
        return;
    }
    
    const cards = track.querySelectorAll('.testimonial-card-new');
    testimonialsTotalSlides = cards.length;
    
    console.log(`📊 Total de testimonios encontrados: ${testimonialsTotalSlides}`);
    
    if (testimonialsTotalSlides === 0) {
        console.log('❌ No se encontraron testimonios');
        return;
    }
    
    // Calcular cards por vista según tamaño de pantalla
    updateTestimonialsCardsPerView();
    
    // Configurar event listeners
    prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('⬅️ Click en botón anterior testimonios');
        moveTestimonialsToPrevious();
    });
    
    nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('➡️ Click en botón siguiente testimonios');
        moveTestimonialsToNext();
    });
    
    // Actualizar estado inicial
    updateTestimonialsDisplay();
    
    // Marcar como inicializado
    testimonialsInitialized = true;
    
    console.log('✅ Carrusel de testimonios inicializado correctamente');
    console.log(`📱 Cards por vista: ${testimonialsCardsPerView}`);
    
    // Redimensionar ventana
    window.addEventListener('resize', function() {
        updateTestimonialsCardsPerView();
        updateTestimonialsDisplay();
    });
    
    // Iniciar auto-play
    startTestimonialsAutoPlay();
}

// Calcular cuántas cards mostrar según pantalla
function updateTestimonialsCardsPerView() {
    const width = window.innerWidth;
    
    if (width <= 768) {
        testimonialsCardsPerView = 1; // 1 tarjeta en móvil
    } else if (width <= 1024) {
        testimonialsCardsPerView = 1; // 1 tarjeta en tablet
    } else {
        testimonialsCardsPerView = 2; // 2 tarjetas en desktop
    }
    
    console.log(`📏 Ancho: ${width}px, Cards por vista: ${testimonialsCardsPerView}`);
}

// Obtener el slide máximo
function getTestimonialsMaxSlide() {
    return Math.max(0, testimonialsTotalSlides - testimonialsCardsPerView);
}

// Mover a slide anterior
function moveTestimonialsToPrevious() {
    if (testimonialsCurrentSlide > 0) {
        testimonialsCurrentSlide--;
        updateTestimonialsDisplay();
        console.log(`⬅️ Moviendo a testimonio: ${testimonialsCurrentSlide}`);
    } else {
        console.log('⚠️ Ya está en el primer testimonio');
    }
    
    // Reiniciar auto-play
    restartTestimonialsAutoPlay();
}

// Mover a slide siguiente
function moveTestimonialsToNext() {
    const maxSlide = getTestimonialsMaxSlide();
    
    if (testimonialsCurrentSlide < maxSlide) {
        testimonialsCurrentSlide++;
        updateTestimonialsDisplay();
        console.log(`➡️ Moviendo a testimonio: ${testimonialsCurrentSlide}`);
    } else {
        // Volver al inicio cuando llega al final
        testimonialsCurrentSlide = 0;
        updateTestimonialsDisplay();
        console.log('🔄 Volviendo al primer testimonio');
    }
    
    // Reiniciar auto-play
    restartTestimonialsAutoPlay();
}

// Actualizar la visualización del carrusel
function updateTestimonialsDisplay() {
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('testimonialsePrevBtn');
    const nextBtn = document.getElementById('testimonialsNextBtn');
    
    if (!track) return;
    
    // Calcular desplazamiento
    const cardWidth = 320; // Ancho de cada tarjeta
    const gap = 30; // Gap entre tarjetas
    const moveDistance = (cardWidth + gap) * testimonialsCurrentSlide;
    
    // Aplicar transformación
    track.style.transform = `translateX(-${moveDistance}px)`;
    track.style.transition = 'transform 0.5s ease';
    
    console.log(`🎯 Desplazamiento testimonios: -${moveDistance}px, Slide: ${testimonialsCurrentSlide}`);
    
    // Actualizar botones
    if (prevBtn) {
        prevBtn.disabled = testimonialsCurrentSlide === 0;
        prevBtn.style.opacity = testimonialsCurrentSlide === 0 ? '0.4' : '1';
    }
    
    if (nextBtn) {
        const maxSlide = getTestimonialsMaxSlide();
        nextBtn.disabled = false; // Nunca deshabilitar porque vuelve al inicio
        nextBtn.style.opacity = '1';
    }
}

// Auto-play mejorado
function startTestimonialsAutoPlay() {
    if (testimonialsAutoPlayInterval) {
        clearInterval(testimonialsAutoPlayInterval);
    }
    
    testimonialsAutoPlayInterval = setInterval(function() {
        if (testimonialsInitialized) {
            moveTestimonialsToNext();
        }
    }, 4000); // 4 segundos
    
    console.log('▶️ Auto-play de testimonios iniciado');
}

function stopTestimonialsAutoPlay() {
    if (testimonialsAutoPlayInterval) {
        clearInterval(testimonialsAutoPlayInterval);
        testimonialsAutoPlayInterval = null;
        console.log('⏸️ Auto-play de testimonios pausado');
    }
}

function restartTestimonialsAutoPlay() {
    stopTestimonialsAutoPlay();
    setTimeout(startTestimonialsAutoPlay, 1000); // Reiniciar después de 1 segundo
}

// Función para ir a un testimonio específico
function goToTestimonial(index) {
    const maxSlide = getTestimonialsMaxSlide();
    
    if (index >= 0 && index <= maxSlide) {
        testimonialsCurrentSlide = index;
        updateTestimonialsDisplay();
        console.log(`🎯 Yendo al testimonio: ${index}`);
        restartTestimonialsAutoPlay();
    }
}

// ===== TOUCH/SWIPE SUPPORT PARA MÓVILES =====
function initializeTestimonialsTouch() {
    const carousel = document.getElementById('testimonialsCarousel');
    if (!carousel) return;
    
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    // Touch start
    carousel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopTestimonialsAutoPlay();
    });
    
    // Touch move
    carousel.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
    });
    
    // Touch end
    carousel.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        isDragging = false;
        
        const diffX = startX - currentX;
        const threshold = 50; // Mínimo de pixels para considerar swipe
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                // Swipe izquierda - siguiente
                moveTestimonialsToNext();
            } else {
                // Swipe derecha - anterior
                moveTestimonialsToPrevious();
            }
        } else {
            // Si no hay swipe, reiniciar auto-play
            setTimeout(startTestimonialsAutoPlay, 2000);
        }
    });
    
    console.log('👆 Touch/swipe activado para testimonios');
}

// ===== PAUSAR AUTO-PLAY EN HOVER =====
function initializeTestimonialsHover() {
    const container = document.querySelector('.testimonials-carousel-container');
    if (!container) return;
    
    container.addEventListener('mouseenter', function() {
        stopTestimonialsAutoPlay();
        console.log('🖱️ Mouse sobre testimonios - auto-play pausado');
    });
    
    container.addEventListener('mouseleave', function() {
        setTimeout(startTestimonialsAutoPlay, 1000);
        console.log('🖱️ Mouse fuera de testimonios - auto-play reanudado');
    });
}

// ===== OBSERVADOR DE INTERSECCIÓN PARA ANIMACIONES =====
function initializeTestimonialsAnimations() {
    const testimonialsSection = document.querySelector('.testimonials-new');
    
    if (testimonialsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    console.log('🎬 Animando entrada de testimonios');
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(testimonialsSection);
    }
}

// ===== ACCESIBILIDAD MEJORADA =====
function initializeTestimonialsAccessibility() {
    const buttons = document.querySelectorAll('.testimonials-btn');
    
    buttons.forEach(button => {
        // Agregar atributos ARIA
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        
        if (button.classList.contains('testimonials-btn-prev')) {
            button.setAttribute('aria-label', 'Testimonio anterior');
        } else {
            button.setAttribute('aria-label', 'Testimonio siguiente');
        }
        
        // Soporte para navegación con teclado
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
    
    // Anunciar cambios a lectores de pantalla
    const track = document.getElementById('testimonialsTrack');
    if (track) {
        track.setAttribute('role', 'region');
        track.setAttribute('aria-label', 'Testimonios de clientes');
        track.setAttribute('aria-live', 'polite');
    }
    
    console.log('♿ Accesibilidad configurada para testimonios');
}

// ===== FUNCIÓN PRINCIPAL DE INICIALIZACIÓN =====
function initializeTestimonialsComplete() {
    console.log('🚀 Inicialización completa de testimonios...');
    
    // Inicializar carrusel básico
    initializeTestimonialsCarousel();
    
    // Inicializar funciones adicionales después de un pequeño delay
    setTimeout(() => {
        initializeTestimonialsAnimations();
        initializeTestimonialsTouch();
        initializeTestimonialsHover();
        initializeTestimonialsAccessibility();
    }, 500);
    
    console.log('✅ Testimonios completamente inicializados');
}

// ===== FUNCIONES DE DEBUG =====
function debugTestimonials() {
    console.log('🔍 DEBUG TESTIMONIOS:');
    console.log('Inicializado:', testimonialsInitialized);
    console.log('Slide actual:', testimonialsCurrentSlide);
    console.log('Total slides:', testimonialsTotalSlides);
    console.log('Cards por vista:', testimonialsCardsPerView);
    console.log('Auto-play activo:', !!testimonialsAutoPlayInterval);
    
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('testimonialsePrevBtn');
    const nextBtn = document.getElementById('testimonialsNextBtn');
    
    console.log('Elementos encontrados:');
    console.log('- Track:', !!track);
    console.log('- Botón Prev:', !!prevBtn);
    console.log('- Botón Next:', !!nextBtn);
    
    if (track) {
        console.log('- Transform actual:', track.style.transform);
        console.log('- Cards en track:', track.querySelectorAll('.testimonial-card-new').length);
    }
}

function resetTestimonials() {
    console.log('🔄 Reseteando carrusel de testimonios...');
    testimonialsCurrentSlide = 0;
    updateTestimonialsDisplay();
    restartTestimonialsAutoPlay();
}

// Hacer funciones disponibles globalmente
window.debugTestimonials = debugTestimonials;
window.resetTestimonials = resetTestimonials;
window.goToTestimonial = goToTestimonial;
window.TestimonialsCarousel = {
    init: initializeTestimonialsComplete,
    goTo: goToTestimonial,
    next: moveTestimonialsToNext,
    prev: moveTestimonialsToPrevious,
    reset: resetTestimonials,
    debug: debugTestimonials
};

