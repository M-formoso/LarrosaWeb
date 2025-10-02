// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeHeroAnimations();
    initializeCategoryButtons();
    initializeScrollAnimations();
    initializeContactForms();
    initializeLazyLoading();
    initializeScrollToTop();
    initializeBrandsStatic();
    
    // Carrusel de unidades con delay
    setTimeout(function() {
        console.log('⏰ Inicializando carrusel de unidades...');
        if (typeof initializeCarousel === 'function') {
            initializeCarousel();
        }
    }, 1000);
    
    // Navegación activa
    setTimeout(() => {
        initializeActiveNavigation();
    }, 100);
    
    // Actualizar navegación cuando se navega con el botón atrás/adelante
    window.addEventListener('popstate', function() {
        setTimeout(() => {
            initializeActiveNavigation();
        }, 50);
    });
});

// ===== NAVEGACIÓN =====
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

// ===== MARCAS ESTÁTICAS =====
function initializeBrandsStatic() {
    console.log('🏢 Inicializando marcas estáticas...');
    
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
    
    console.log('✅ Marcas estáticas inicializadas correctamente');
}

// ===== CARRUSEL DE UNIDADES =====
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

// ===== TESTIMONIOS - SISTEMA COMPLETAMENTE AISLADO =====
window.TestimonialsSystem = (function() {
    'use strict';
    
    // Variables privadas para evitar conflictos
    let slideIndex = 0;
    let totalTestimonials = 0;
    let isReady = false;
    let autoTimer = null;
    
    // Configuración
    const config = {
        slideWidth: 350, // 320px card + 30px gap
        animationDuration: 500,
        autoPlayInterval: 4000
    };
    
    // Función principal de inicialización
    function init() {
        console.log('🎭 Inicializando sistema de testimonios...');
        
        try {
            // Buscar elementos
            const elements = getElements();
            if (!elements.isValid) {
                console.error('❌ Elementos HTML no encontrados');
                return false;
            }
            
            // Configurar
            setup(elements);
            
            // Contar testimonios
            totalTestimonials = elements.track.querySelectorAll('.testimonial-card-new').length;
            console.log(`📊 ${totalTestimonials} testimonios encontrados`);
            
            if (totalTestimonials === 0) {
                console.error('❌ No hay testimonios');
                return false;
            }
            
            // Configurar eventos
            setupEvents(elements);
            
            // Estado inicial
            slideIndex = 0;
            isReady = true;
            
            // Mostrar primer slide
            updateView();
            
            // Iniciar autoplay
            startAutoPlay();
            
            console.log('✅ Testimonios listos');
            return true;
            
        } catch (error) {
            console.error('❌ Error inicializando testimonios:', error);
            return false;
        }
    }
    
    // Obtener elementos del DOM
    function getElements() {
        const track = document.getElementById('testimonialsTrack');
        const prevBtn = document.getElementById('testimonialsPrevBtn');
        const nextBtn = document.getElementById('testimonialsNextBtn');
        
        console.log('🔍 Buscando elementos:', {
            track: !!track,
            prevBtn: !!prevBtn,
            nextBtn: !!nextBtn
        });
        
        return {
            track: track,
            prevBtn: prevBtn,
            nextBtn: nextBtn,
            isValid: track && prevBtn && nextBtn
        };
    }
    
    // Configurar estilos básicos
    function setup(elements) {
        // Configurar track
        elements.track.style.display = 'flex';
        elements.track.style.gap = '30px';
        elements.track.style.transition = `transform ${config.animationDuration}ms ease`;
        elements.track.style.transform = 'translateX(0px)';
        
        console.log('✅ Estilos configurados');
    }
    
    // Configurar eventos
    function setupEvents(elements) {
        // Limpiar eventos anteriores
        elements.prevBtn.onclick = null;
        elements.nextBtn.onclick = null;
        
        // Eventos nuevos
        elements.prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⬅️ Anterior');
            previous();
        });
        
        elements.nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('➡️ Siguiente');
            next();
        });
        
        console.log('✅ Eventos configurados');
    }
    
    // Ir al anterior
    function previous() {
        if (!isReady) return;
        
        console.log(`Slide actual: ${slideIndex}`);
        
        if (slideIndex > 0) {
            slideIndex--;
        } else {
            // Ir al último
            slideIndex = Math.max(0, totalTestimonials - 2);
        }
        
        console.log(`Nuevo slide: ${slideIndex}`);
        updateView();
        restartAutoPlay();
    }
    
    // Ir al siguiente
    function next() {
        if (!isReady) return;
        
        console.log(`Slide actual: ${slideIndex}`);
        
        const maxSlide = Math.max(0, totalTestimonials - 2);
        
        if (slideIndex < maxSlide) {
            slideIndex++;
        } else {
            // Volver al inicio
            slideIndex = 0;
        }
        
        console.log(`Nuevo slide: ${slideIndex}`);
        updateView();
        restartAutoPlay();
    }
    
    // Actualizar vista
    function updateView() {
        const track = document.getElementById('testimonialsTrack');
        if (!track) return;
        
        const offset = slideIndex * config.slideWidth;
        track.style.transform = `translateX(-${offset}px)`;
        
        console.log(`🎯 Desplazando ${offset}px`);
        
        // Actualizar botones (siempre habilitados)
        const prevBtn = document.getElementById('testimonialsPrevBtn');
        const nextBtn = document.getElementById('testimonialsNextBtn');
        
        if (prevBtn) {
            prevBtn.style.opacity = '1';
            prevBtn.disabled = false;
        }
        
        if (nextBtn) {
            nextBtn.style.opacity = '1';
            nextBtn.disabled = false;
        }
    }
    
    // AutoPlay
    function startAutoPlay() {
        if (autoTimer) clearInterval(autoTimer);
        
        autoTimer = setInterval(function() {
            if (isReady) next();
        }, config.autoPlayInterval);
        
        console.log('▶️ AutoPlay iniciado');
    }
    
    function stopAutoPlay() {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
            console.log('⏸️ AutoPlay detenido');
        }
    }
    
    function restartAutoPlay() {
        stopAutoPlay();
        setTimeout(startAutoPlay, 1000);
    }
    
    // Funciones de utilidad
    function debug() {
        console.log('🔍 DEBUG TESTIMONIOS:');
        console.log('- Listo:', isReady);
        console.log('- Slide actual:', slideIndex);
        console.log('- Total:', totalTestimonials);
        console.log('- AutoPlay:', !!autoTimer);
        
        const track = document.getElementById('testimonialsTrack');
        if (track) {
            console.log('- Transform:', track.style.transform);
        }
    }
    
    function reset() {
        console.log('🔄 Reset');
        stopAutoPlay();
        slideIndex = 0;
        updateView();
        startAutoPlay();
    }
    
    function repair() {
        console.log('🔧 Reparando...');
        
        // Corregir ID si está mal
        const wrongBtn = document.getElementById('testimonialsePrevBtn');
        if (wrongBtn) {
            wrongBtn.id = 'testimonialsPrevBtn';
            console.log('✅ ID corregido');
        }
        
        // Reinicializar
        isReady = false;
        stopAutoPlay();
        setTimeout(init, 500);
    }
    
    // API pública
    return {
        init: init,
        next: next,
        previous: previous,
        debug: debug,
        reset: reset,
        repair: repair
    };
})();

// Auto-inicialización con reintentos para testimonios
function startTestimonialsSystem() {
    console.log('🎯 Iniciando sistema de testimonios...');
    
    let attempts = 0;
    const maxAttempts = 5;
    
    function tryInit() {
        attempts++;
        console.log(`Intento ${attempts}/${maxAttempts}`);
        
        if (window.TestimonialsSystem.init()) {
            console.log('✅ Sistema de testimonios funcionando');
        } else if (attempts < maxAttempts) {
            console.log(`⚠️ Reintentando en 1 segundo...`);
            setTimeout(tryInit, 1000);
        } else {
            console.error('❌ No se pudo inicializar después de varios intentos');
            console.log('💡 Usa TestimonialsSystem.repair() para intentar reparar');
        }
    }
    
    tryInit();
}

// Inicialización automática de testimonios
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(startTestimonialsSystem, 2500);
    });
} else {
    setTimeout(startTestimonialsSystem, 2500);
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

// ===== RESPONSIVE UTILITIES =====
function handleResize() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    
    // Ajustes específicos para diferentes tamaños de pantalla
    if (document.body) {
        if (isMobile) {
            document.body.classList.add('mobile');
            document.body.classList.remove('tablet', 'desktop');
        } else if (isTablet) {
            document.body.classList.add('tablet');
            document.body.classList.remove('mobile', 'desktop');
        } else {
            document.body.classList.add('desktop');
            document.body.classList.remove('mobile', 'tablet');
        }
    }
}

// Ejecutar al cargar y redimensionar
window.addEventListener('resize', debounce(handleResize, 250));
window.addEventListener('load', handleResize);

// ===== FUNCIONES DE DEBUG =====
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
window.debugNavigation = debugNavigation;
window.forceNext = forceNext;
window.forcePrev = forcePrev;
window.resetCarousel = resetCarousel;

// ===== EXPORTAR FUNCIONES GLOBALES DE MARCAS =====
window.BrandsStatic = {
    highlight: function(brandName) {
        const brandLogos = document.querySelectorAll('.brand-logo');
        
        brandLogos.forEach(logo => {
            if (logo.alt.toLowerCase().includes(brandName.toLowerCase())) {
                logo.style.transform = 'scale(1.2)';
                logo.style.opacity = '1';
                logo.style.filter = 'grayscale(0%) brightness(1)';
                logo.style.boxShadow = '0 8px 25px rgba(61, 95, 172, 0.3)';
                logo.style.zIndex = '10';
                
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
    },
    filter: function(brandNames = []) {
        const brandLogos = document.querySelectorAll('.brand-logo');
        
        if (brandNames.length === 0) {
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
    },
    reinitialize: initializeBrandsStatic
};

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', function() {
    console.log('🚛 Larrosa Camiones - Sitio web cargado correctamente');
    console.log('⚡ Tiempo de carga:', performance.now().toFixed(2) + 'ms');
    
    // Verificar que el carrusel de unidades esté funcionando
    if (!carouselInitialized) {
        setTimeout(initializeCarousel, 500);
    }
});

console.log('🎭 Sistema de testimonios cargado');
console.log('💡 Usa TestimonialsSystem.debug() para verificar estado');
console.log('🎠 Usa debugCarousel() para verificar carrusel de unidades');
console.log('🧭 Usa debugNavigation() para verificar navegación');
// ===== JAVASCRIPT PARA MODALES DE COTIZACIÓN =====
// Agregar este código a scripts/main.js

// ===== FUNCIONES GLOBALES PARA ABRIR MODALES =====

// Abrir modal de video
function openVideoModal() {
    console.log('📹 Abriendo modal de video...');
    
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('modalVideo');
    
    if (modal && iframe) {
        // URL del video de YouTube (reemplazar con tu video real)
        const videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&showinfo=0';
        
        iframe.src = videoUrl;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Analytics tracking (opcional)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'video_modal_opened', {
                event_category: 'engagement',
                event_label: 'cotizacion_video'
            });
        }
    }
}

// Cerrar modal de video
function closeVideoModal() {
    console.log('📹 Cerrando modal de video...');
    
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('modalVideo');
    
    if (modal && iframe) {
        modal.classList.remove('active');
        iframe.src = '';
        document.body.style.overflow = '';
    }
}

// Abrir modal RANDON
function openRandonModal() {
    console.log('🚛 Abriendo modal RANDON...');
    
    const modal = document.getElementById('randonModal');
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Analytics tracking (opcional)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'randon_modal_opened', {
                event_category: 'engagement',
                event_label: 'randon_info'
            });
        }
    }
}

// Cerrar modal RANDON
function closeRandonModal() {
    console.log('🚛 Cerrando modal RANDON...');
    
    const modal = document.getElementById('randonModal');
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Abrir modal USADO (formulario)
function openUsadoModal() {
    console.log('🚗 Abriendo modal de cotización...');
    
    const modal = document.getElementById('usadoModal');
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus en el primer campo después de la animación
        setTimeout(() => {
            const firstInput = modal.querySelector('input[name="marca"]');
            if (firstInput) firstInput.focus();
        }, 400);
        
        // Analytics tracking (opcional)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cotizacion_modal_opened', {
                event_category: 'lead_generation',
                event_label: 'usado_form'
            });
        }
    }
}

// Cerrar modal USADO
function closeUsadoModal() {
    console.log('🚗 Cerrando modal de cotización...');
    
    const modal = document.getElementById('usadoModal');
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Abrir modal MERCADOLIBRE
function openMeliModal() {
    console.log('🛒 Abriendo modal MercadoLibre...');
    
    const modal = document.getElementById('meliModal');
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Analytics tracking (opcional)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'meli_modal_opened', {
                event_category: 'engagement',
                event_label: 'mercadolibre_info'
            });
        }
    }
}

// Cerrar modal MERCADOLIBRE
function closeMeliModal() {
    console.log('🛒 Cerrando modal MercadoLibre...');
    
    const modal = document.getElementById('meliModal');
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== FUNCIONES DE REDIRECCIÓN =====

// Redirección a RANDON (desde botón dentro del modal)
function redirectToRandon() {
    console.log('🚛 Redirigiendo a sección RANDON...');
    
    // Cerrar modal primero
    closeRandonModal();
    
    // Pequeño delay y redirección
    setTimeout(() => {
        window.location.href = 'sections/LarrosaCamiones.html#randon';
    }, 300);
    
    // Analytics tracking (opcional)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'randon_redirect', {
            event_category: 'navigation',
            event_label: 'randon_section'
        });
    }
}

// Redirección a MercadoLibre (desde botón dentro del modal)
function redirectToMercadoLibre() {
    console.log('🛒 Redirigiendo a MercadoLibre...');
    
    // Cerrar modal primero
    closeMeliModal();
    
    // Pequeño delay y redirección
    setTimeout(() => {
        // Reemplazar con tu URL real de MercadoLibre
        window.open('https://listado.mercadolibre.com.ar/larrosa-camiones', '_blank');
    }, 300);
    
    // Analytics tracking (opcional)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'mercadolibre_redirect', {
            event_category: 'external_link',
            event_label: 'mercadolibre_store'
        });
    }
}

// ===== MANEJO DEL FORMULARIO =====
function handleUsadoForm(event) {
    event.preventDefault();
    
    console.log('📝 Procesando formulario de cotización...');
    
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const data = {
        marca: formData.get('marca'),
        modelo: formData.get('modelo'),
        año: formData.get('año'),
        kilometros: formData.get('kilometros'),
        nombre: formData.get('nombre'),
        telefono: formData.get('telefono'),
        email: formData.get('email'),
        observaciones: formData.get('observaciones') || ''
    };
    
    // Validar datos básicos
    if (!data.marca || !data.modelo || !data.año || !data.nombre || !data.telefono || !data.email) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }
    
    // Deshabilitar botón y mostrar carga
    const submitBtn = event.target.querySelector('.btn-modal-action');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'ENVIANDO...';
    submitBtn.disabled = true;
    
    // Simular envío (reemplazar con tu lógica real)
    setTimeout(() => {
        // Aquí harías la petición real a tu backend
        console.log('Datos a enviar:', data);
        
        // Mostrar mensaje de éxito
        alert(`¡Gracias ${data.nombre}! Hemos recibido tu solicitud de cotización para el ${data.marca} ${data.modelo}. Te contactaremos pronto.`);
        
        // Cerrar modal
        closeUsadoModal();
        
        // Resetear formulario
        event.target.reset();
        
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Analytics tracking (opcional)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cotizacion_submitted', {
                event_category: 'lead_generation',
                event_label: 'usado_form_completed',
                custom_parameters: {
                    vehicle_brand: data.marca,
                    vehicle_model: data.modelo,
                    vehicle_year: data.año
                }
            });
        }
        
    }, 2000); // Simular delay de red
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Inicializando sistema de modales...');
    
    // Event listeners para cerrar modales
    setupModalEventListeners();
    
    // Event listener para el formulario
    setupFormEventListener();
    
    console.log('✅ Sistema de modales inicializado');
});

function setupModalEventListeners() {
    // Cerrar modales al hacer click fuera
    window.addEventListener('click', function(event) {
        const modals = [
            'videoModal',
            'randonModal', 
            'usadoModal',
            'meliModal'
        ];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (event.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                
                // Limpiar video si es el modal de video
                if (modalId === 'videoModal') {
                    const iframe = document.getElementById('modalVideo');
                    if (iframe) iframe.src = '';
                }
            }
        });
    });
    
    // Cerrar modales con tecla ESC
    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal-overlay.active');
            activeModals.forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                
                // Limpiar video si es necesario
                const iframe = modal.querySelector('iframe');
                if (iframe) iframe.src = '';
            });
        }
    });
}

function setupFormEventListener() {
    const form = document.getElementById('usadoForm');
    if (form) {
        form.addEventListener('submit', handleUsadoForm);
        
        // Validación en tiempo real
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
}

// ===== FUNCIONES DE VALIDACIÓN =====
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remover errores previos
    clearFieldError(field);
    
    // Validaciones específicas
    if (field.required && !value) {
        showFieldError(field, 'Este campo es obligatorio');
        return false;
    }
    
    if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Ingresa un email válido');
            return false;
        }
    }
    
    if (fieldName === 'telefono' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Ingresa un teléfono válido');
            return false;
        }
    }
    
    if (fieldName === 'año' && value) {
        const currentYear = new Date().getFullYear();
        const year = parseInt(value);
        if (year < 1990 || year > currentYear + 1) {
            showFieldError(field, `Año debe estar entre 1990 y ${currentYear + 1}`);
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    field.style.borderColor = '#dc3545';
    field.style.backgroundColor = '#ffeaa7';
    
    // Crear mensaje de error si no existe
    let errorMsg = field.parentNode.querySelector('.field-error');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'field-error';
        errorMsg.style.cssText = `
            color: #dc3545;
            font-size: 0.85rem;
            margin-top: 5px;
            display: block;
        `;
        field.parentNode.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
}

function clearFieldError(field) {
    field.style.borderColor = '#e5e7eb';
    field.style.backgroundColor = '#f8f9fa';
    
    const errorMsg = field.parentNode.querySelector('.field-error');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// ===== FUNCIONES PARA DEBUG =====
window.debugModals = function() {
    console.log('🔍 DEBUG MODALES:');
    
    const modals = ['videoModal', 'randonModal', 'usadoModal', 'meliModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        console.log(`${modalId}:`, {
            exists: !!modal,
            active: modal?.classList.contains('active'),
            display: modal?.style.display
        });
    });
};

console.log('🎯 Sistema de modales de cotización cargado');
console.log('💡 Usa debugModals() para verificar estado');
// ===== JAVASCRIPT MODIFICADO - SOLO "COMPRAMOS TU USADO" CLICKEABLE =====

// ===== FUNCIONES GLOBALES PARA MODALES - SOLO USADO ACTIVO =====

// ===== SOLO MANTENER FUNCIONES PARA "COMPRAMOS TU USADO" =====

// Abrir modal USADO (formulario) - ÚNICA FUNCIÓN ACTIVA
function openUsadoModal() {
    console.log('🚗 Abriendo modal de cotización...');
    
    const modal = document.getElementById('usadoModal');
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus en el primer campo después de la animación
        setTimeout(() => {
            const firstInput = modal.querySelector('input[name="marca"]');
            if (firstInput) firstInput.focus();
        }, 400);
        
        // Analytics tracking (opcional)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cotizacion_modal_opened', {
                event_category: 'lead_generation',
                event_label: 'usado_form'
            });
        }
    }
}

// Cerrar modal USADO
function closeUsadoModal() {
    console.log('🚗 Cerrando modal de cotización...');
    
    const modal = document.getElementById('usadoModal');
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== FUNCIONES DESHABILITADAS PARA RANDON Y MELI =====

// Estas funciones ahora solo muestran mensaje informativo o no hacen nada
function openRandonModal() {
    console.log('ℹ️ RANDON modal deshabilitado - solo visual');
    // No hacer nada o mostrar mensaje
    return false;
}

function closeRandonModal() {
    // Función vacía - no hace nada
    return false;
}

function openMeliModal() {
    console.log('ℹ️ MELI modal deshabilitado - solo visual');
    // No hacer nada o mostrar mensaje
    return false;
}

function closeMeliModal() {
    // Función vacía - no hace nada
    return false;
}

function openVideoModal() {
    console.log('ℹ️ Video modal deshabilitado - solo visual');
    // No hacer nada o mostrar mensaje
    return false;
}

function closeVideoModal() {
    // Función vacía - no hace nada
    return false;
}

// ===== FUNCIONES DE REDIRECCIÓN DESHABILITADAS =====
function redirectToRandon() {
    console.log('ℹ️ Redirección RANDON deshabilitada');
    return false;
}

function redirectToMercadoLibre() {
    console.log('ℹ️ Redirección MercadoLibre deshabilitada');
    return false;
}

// ===== MANEJO DEL FORMULARIO - SIN CAMBIOS =====
function handleUsadoForm(event) {
    event.preventDefault();
    
    console.log('📝 Procesando formulario de cotización...');
    
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const data = {
        marca: formData.get('marca'),
        modelo: formData.get('modelo'),
        año: formData.get('año'),
        kilometros: formData.get('kilometros'),
        nombre: formData.get('nombre'),
        telefono: formData.get('telefono'),
        email: formData.get('email'),
        observaciones: formData.get('observaciones') || ''
    };
    
    // Validar datos básicos
    if (!data.marca || !data.modelo || !data.año || !data.nombre || !data.telefono || !data.email) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }
    
    // Deshabilitar botón y mostrar carga
    const submitBtn = event.target.querySelector('.btn-modal-action');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'ENVIANDO...';
    submitBtn.disabled = true;
    
    // Simular envío (reemplazar con tu lógica real)
    setTimeout(() => {
        // Aquí harías la petición real a tu backend
        console.log('Datos a enviar:', data);
        
        // Mostrar mensaje de éxito
        alert(`¡Gracias ${data.nombre}! Hemos recibido tu solicitud de cotización para el ${data.marca} ${data.modelo}. Te contactaremos pronto.`);
        
        // Cerrar modal
        closeUsadoModal();
        
        // Resetear formulario
        event.target.reset();
        
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Analytics tracking (opcional)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cotizacion_submitted', {
                event_category: 'lead_generation',
                event_label: 'usado_form_completed',
                custom_parameters: {
                    vehicle_brand: data.marca,
                    vehicle_model: data.modelo,
                    vehicle_year: data.año
                }
            });
        }
        
    }, 2000); // Simular delay de red
}

// ===== INICIALIZACIÓN CON EVENTOS SELECTIVOS =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Inicializando sistema de modales selectivo...');
    
    // ===== SOLO CONFIGURAR EVENTOS PARA "COMPRAMOS TU USADO" =====
    
    // Event listener SOLO para el botón "Compramos tu usado"
    const usadoButton = document.querySelector('.usado-modal');
    if (usadoButton) {
        usadoButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openUsadoModal();
        });
        
        // Agregar cursor pointer para indicar que es clickeable
        usadoButton.style.cursor = 'pointer';
        
        console.log('✅ Botón "Compramos tu usado" configurado como clickeable');
    }
    
    // ===== DESHABILITAR EVENTOS PARA RANDON Y MELI =====
    
    // Remover cursor pointer y eventos de RANDON
    const randonButton = document.querySelector('.randon-modal');
    if (randonButton) {
        randonButton.style.cursor = 'default'; // Cursor normal
        randonButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // No hacer nada
        });
        
        console.log('🚫 Botón RANDON deshabilitado - solo visual');
    }
    
    // Remover cursor pointer y eventos de MELI
    const meliButton = document.querySelector('.meli-modal');
    if (meliButton) {
        meliButton.style.cursor = 'default'; // Cursor normal
        meliButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // No hacer nada
        });
        
        console.log('🚫 Botón MELI deshabilitado - solo visual');
    }
    
    // Deshabilitar click en video también
    const videoContainer = document.querySelector('.cotizacion-video-container');
    if (videoContainer) {
        videoContainer.style.cursor = 'default'; // Cursor normal
        videoContainer.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // No hacer nada
        });
        
        console.log('🚫 Video deshabilitado - solo visual');
    }
    
    // ===== CONFIGURAR EVENTOS PARA CERRAR MODALES =====
    setupModalEventListeners();
    
    // ===== CONFIGURAR FORMULARIO =====
    setupFormEventListener();
    
    console.log('✅ Sistema de modales selectivo inicializado');
    console.log('✅ Solo "Compramos tu usado" es clickeable');
});

// ===== CONFIGURACIÓN DE EVENTOS PARA CERRAR MODALES =====
function setupModalEventListeners() {
    // Cerrar modales al hacer click fuera - SOLO PARA USADO
    window.addEventListener('click', function(event) {
        const usadoModal = document.getElementById('usadoModal');
        
        // Solo manejar el modal de USADO
        if (event.target === usadoModal) {
            usadoModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Cerrar modales con tecla ESC - SOLO PARA USADO
    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const usadoModal = document.getElementById('usadoModal');
            if (usadoModal && usadoModal.classList.contains('active')) {
                usadoModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// ===== CONFIGURACIÓN DEL FORMULARIO - SIN CAMBIOS =====
function setupFormEventListener() {
    const form = document.getElementById('usadoForm');
    if (form) {
        form.addEventListener('submit', handleUsadoForm);
        
        // Validación en tiempo real
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
        
        console.log('✅ Formulario configurado correctamente');
    }
}

// ===== FUNCIONES DE VALIDACIÓN - SIN CAMBIOS =====
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remover errores previos
    clearFieldError(field);
    
    // Validaciones específicas
    if (field.required && !value) {
        showFieldError(field, 'Este campo es obligatorio');
        return false;
    }
    
    if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Ingresa un email válido');
            return false;
        }
    }
    
    if (fieldName === 'telefono' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Ingresa un teléfono válido');
            return false;
        }
    }
    
    if (fieldName === 'año' && value) {
        const currentYear = new Date().getFullYear();
        const year = parseInt(value);
        if (year < 1990 || year > currentYear + 1) {
            showFieldError(field, `Año debe estar entre 1990 y ${currentYear + 1}`);
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    field.style.borderColor = '#dc3545';
    field.style.backgroundColor = '#ffeaa7';
    
    // Crear mensaje de error si no existe
    let errorMsg = field.parentNode.querySelector('.field-error');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'field-error';
        errorMsg.style.cssText = `
            color: #dc3545;
            font-size: 0.85rem;
            margin-top: 5px;
            display: block;
        `;
        field.parentNode.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
}

function clearFieldError(field) {
    field.style.borderColor = '#e5e7eb';
    field.style.backgroundColor = '#f8f9fa';
    
    const errorMsg = field.parentNode.querySelector('.field-error');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// ===== FUNCIONES PARA DEBUG =====
window.debugModals = function() {
    console.log('🔍 DEBUG MODALES SELECTIVOS:');
    console.log('✅ Activo: usadoModal');
    console.log('🚫 Deshabilitado: randonModal');
    console.log('🚫 Deshabilitado: meliModal');
    console.log('🚫 Deshabilitado: videoModal');
    
    const usadoModal = document.getElementById('usadoModal');
    console.log('usadoModal existe:', !!usadoModal);
    console.log('usadoModal activo:', usadoModal?.classList.contains('active'));
};

// ===== FUNCIÓN PARA REACTIVAR OTROS MODALES (SI ES NECESARIO) =====
window.reactivateAllModals = function() {
    console.log('🔄 Reactivando todos los modales...');
    
    // Reactivar eventos para todos los botones
    const randonButton = document.querySelector('.randon-modal');
    const meliButton = document.querySelector('.meli-modal');
    const videoContainer = document.querySelector('.cotizacion-video-container');
    
    if (randonButton) {
        randonButton.style.cursor = 'pointer';
        randonButton.onclick = function() { openRandonModal(); };
    }
    
    if (meliButton) {
        meliButton.style.cursor = 'pointer';
        meliButton.onclick = function() { openMeliModal(); };
    }
    
    if (videoContainer) {
        videoContainer.style.cursor = 'pointer';
        videoContainer.onclick = function() { openVideoModal(); };
    }
    
    console.log('✅ Todos los modales reactivados');
};

console.log('🎯 Sistema de modales selectivo cargado');
console.log('💡 Solo "Compramos tu usado" es clickeable');
console.log('💡 Usa debugModals() para verificar estado');
console.log('💡 Usa reactivateAllModals() para reactivar todos si es necesario');
// ===== MODAL "COMPRAMOS TU USADO" - FUNCIONES CORREGIDAS ===== 

// Abrir modal
function openUsadoModal() {
    console.log('🚗 Abriendo modal de cotización...');
    
    const modal = document.getElementById('usadoModal');
    
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus en el primer campo
        setTimeout(() => {
            const firstInput = modal.querySelector('input[name="marca"]');
            if (firstInput) firstInput.focus();
        }, 400);
    }
}

// Cerrar modal
function closeUsadoModal() {
    console.log('🚗 Cerrando modal de cotización...');
    
    const modal = document.getElementById('usadoModal');
    
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }
}

// Manejar envío del formulario
function handleUsadoForm(event) {
    event.preventDefault();
    
    console.log('📝 Procesando formulario de cotización...');
    
    const formData = new FormData(event.target);
    const data = {
        marca: formData.get('marca'),
        modelo: formData.get('modelo'),
        año: formData.get('año'),
        kilometros: formData.get('kilometros'),
        nombre: formData.get('nombre'),
        telefono: formData.get('telefono'),
        email: formData.get('email'),
        observaciones: formData.get('observaciones') || ''
    };
    
    // Validar datos básicos
    if (!data.marca || !data.modelo || !data.año || !data.nombre || !data.telefono || !data.email) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }
    
    const submitBtn = event.target.querySelector('.btn-modal-action');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'ENVIANDO...';
    submitBtn.disabled = true;
    
    // Simular envío
    setTimeout(() => {
        console.log('Datos a enviar:', data);
        
        alert(`¡Gracias ${data.nombre}! Hemos recibido tu solicitud de cotización para el ${data.marca} ${data.modelo}. Te contactaremos pronto.`);
        
        closeUsadoModal();
        event.target.reset();
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// ===== INICIALIZACIÓN DE CARDS ===== 

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Inicializando sección de cotización...');
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('usadoModal');
            if (modal && modal.classList.contains('active')) {
                closeUsadoModal();
            }
        }
    });
    
    // Cerrar modal al hacer click fuera
    const modal = document.getElementById('usadoModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeUsadoModal();
            }
        });
    }
    
    // Card RANDON - Click redirige
    const randonCard = document.querySelector('.randon-card');
    if (randonCard) {
        randonCard.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn-card-small')) {
                window.location.href = 'sections/LarrosaCamiones.html#randon';
            }
        });
    }
    
    // Card MERCADOLIBRE - Click redirige
    const meliCard = document.querySelector('.meli-card');
    if (meliCard) {
        meliCard.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn-card-small')) {
                window.open('https://listado.mercadolibre.com.ar/larrosa-camiones', '_blank');
            }
        });
    }
    
    console.log('✅ Sección de cotización inicializada');
});

console.log('🎯 Sistema de cotización cargado');