// ===== LARROSA CAMIONES - EMPRESA JAVASCRIPT =====

// ===== VARIABLES GLOBALES =====
let currentGalleryImage = 0;
const galleryImages = [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initializeScrollAnimations();
    initializeTimeline();
    initializeGallery();
    initializeCounters();
    initializeParallax();
    initializeSmoothScroll();
    initializeIntersectionObserver();
    initializeHoverEffects();
});

// ===== ANIMACIONES AL SCROLL =====
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Animaciones específicas según el tipo de elemento
                if (entry.target.classList.contains('timeline-item')) {
                    animateTimelineItem(entry.target);
                } else if (entry.target.classList.contains('valor-card')) {
                    animateValueCard(entry.target);
                } else if (entry.target.classList.contains('marca-card')) {
                    animateBrandCard(entry.target);
                } else if (entry.target.classList.contains('stat-item')) {
                    animateStatCounter(entry.target);
                } else if (entry.target.classList.contains('benefit-item')) {
                    animateBenefitItem(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observar elementos animables
    const elementsToAnimate = document.querySelectorAll(`
        .timeline-item,
        .valor-card,
        .marca-card,
        .stat-item,
        .benefit-item,
        .instalaciones-features .feature-item
    `);
    
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// ===== FUNCIONES DE ANIMACIÓN =====
function animateTimelineItem(item) {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-30px)';
    item.style.transition = 'all 0.8s ease';
    
    setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
    }, Math.random() * 200);
}

function animateValueCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px) scale(0.95)';
    card.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
    }, Math.random() * 300);
}

function animateBrandCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, Math.random() * 150);
}

function animateBenefitItem(item) {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'all 0.6s ease';
    
    setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
    }, Math.random() * 200);
}

// ===== TIMELINE INTERACTIVO =====
function initializeTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach((item, index) => {
        // Efecto hover en timeline items
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px)';
            this.style.background = 'rgba(61, 95, 172, 0.05)';
            this.style.borderRadius = '10px';
            this.style.padding = '1rem';
            this.style.transition = 'all 0.3s ease';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.background = '';
            this.style.borderRadius = '';
            this.style.padding = '';
        });

        // Click para destacar timeline item
        item.addEventListener('click', function() {
            // Remover clase activa de otros items
            timelineItems.forEach(el => el.classList.remove('timeline-active'));
            
            // Agregar clase activa al item clickeado
            this.classList.add('timeline-active');
            
            // Scroll suave al item si es necesario
            this.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        });
    });
}

// ===== GALERÍA DE INSTALACIONES =====
function initializeGallery() {
    const mainImage = document.querySelector('.gallery-main-image');
    const thumbnails = document.querySelectorAll('.gallery-thumbnails img');
    
    if (!mainImage || thumbnails.length === 0) return;

    // Inicializar array de imágenes
    galleryImages.push(mainImage.src);
    thumbnails.forEach(thumb => {
        galleryImages.push(thumb.src);
    });

    // Event listeners para thumbnails
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            changeGalleryImage(this.src);
            
            // Actualizar thumbnail activo
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });

        // Precargar imágenes
        const img = new Image();
        img.src = thumb.src;
    });

    // Navegación con teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            navigateGallery(-1);
        } else if (e.key === 'ArrowRight') {
            navigateGallery(1);
        }
    });
}

function changeGalleryImage(newSrc) {
    const mainImage = document.querySelector('.gallery-main-image');
    if (!mainImage) return;

    // Efecto de transición
    mainImage.style.opacity = '0.5';
    mainImage.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        mainImage.src = newSrc;
        mainImage.style.opacity = '1';
        mainImage.style.transform = 'scale(1)';
    }, 200);
    
    // Actualizar índice actual
    currentGalleryImage = galleryImages.findIndex(src => src === newSrc);
}

function navigateGallery(direction) {
    currentGalleryImage += direction;
    
    if (currentGalleryImage >= galleryImages.length) {
        currentGalleryImage = 0;
    } else if (currentGalleryImage < 0) {
        currentGalleryImage = galleryImages.length - 1;
    }
    
    changeGalleryImage(galleryImages[currentGalleryImage]);
}

// ===== CONTADORES ANIMADOS =====
function animateStatCounter(statItem) {
    const numberElement = statItem.querySelector('.stat-number');
    if (!numberElement) return;

    const target = parseInt(numberElement.textContent.replace(/\D/g, ''));
    const suffix = numberElement.textContent.replace(/[\d\s]/g, '');
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const interval = duration / 50;

    numberElement.textContent = '0' + suffix;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        numberElement.textContent = Math.floor(current) + suffix;
    }, interval);
}

function initializeCounters() {
    // Los contadores se inicializan cuando entran en viewport
    // mediante la función animateStatCounter llamada desde el observer
}

// ===== EFECTO PARALLAX =====
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('.historia-image img, .instalaciones-gallery img');
    
    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        parallaxElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                element.style.transform = `translate3d(0, ${rate * 0.1}px, 0)`;
            }
        });
    }, 16));
}

// ===== SMOOTH SCROLL =====
function initializeSmoothScroll() {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 100;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
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
                // Actualizar navegación activa
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').includes(id)) {
                        link.classList.add('active');
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

// ===== EFECTOS HOVER MEJORADOS =====
function initializeHoverEffects() {
    // Efecto hover para cards de valores
    const valueCards = document.querySelectorAll('.valor-card');
    valueCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });

    // Efecto hover para cards de marcas
    const brandCards = document.querySelectorAll('.marca-card');
    brandCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('featured')) {
                this.style.borderColor = 'var(--primary-blue)';
            }
        });

        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('featured')) {
                this.style.borderColor = 'transparent';
            }
        });
    });

    // Efecto para botones CTA
    const ctaButtons = document.querySelectorAll('.cta-button, .cta-button-outline');
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// ===== LAZY LOADING PARA IMÁGENES =====
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
                
                // Efecto fade in
                img.style.opacity = '0';
                img.onload = () => {
                    img.style.transition = 'opacity 0.5s ease';
                    img.style.opacity = '1';
                };
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ===== BÚSQUEDA Y FILTRADO DE MARCAS =====
function initializeBrandFilter() {
    const brandCards = document.querySelectorAll('.marca-card');
    const searchInput = document.querySelector('#brand-search');
    
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        brandCards.forEach(card => {
            const brandName = card.querySelector('h4').textContent.toLowerCase();
            const isVisible = brandName.includes(searchTerm);
            
            card.style.display = isVisible ? 'block' : 'none';
            
            if (isVisible) {
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            }
        });
    });
}

// ===== MODAL DE INFORMACIÓN =====
function showInfoModal(title, content) {
    // Crear modal dinámicamente
    const modal = document.createElement('div');
    modal.className = 'info-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="close" onclick="closeInfoModal()">&times;</span>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Animar entrada
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeInfoModal() {
    const modal = document.querySelector('.info-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// ===== COMPARTIR EN REDES SOCIALES =====
function shareOnSocial(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Larrosa Camiones - 40 años comercializando camiones');
    
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        whatsapp: `https://wa.me/?text=${title} ${url}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

// ===== UTILIDADES =====
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
    }
}

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

// ===== EASTER EGG =====
let clickCount = 0;
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('larrosa-card')) {
        clickCount++;
        if (clickCount === 5) {
            showInfoModal(
                '¡Felicitaciones!', 
                '<p>Has descubierto el easter egg de Larrosa Camiones. 🚛</p><p>¡40 años no se cumplen todos los días!</p>'
            );
            clickCount = 0;
        }
    }
});

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', function() {
    console.log('🏢 Página Larrosa Camiones cargada correctamente');
    console.log('⚡ Tiempo de carga:', performance.now().toFixed(2) + 'ms');
    
    // Reportar métricas de rendimiento
    if ('performance' in window && 'getEntriesByType' in performance) {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('📊 Métricas de rendimiento:', {
            'Tiempo de respuesta del servidor': perfData.responseEnd - perfData.requestStart + 'ms',
            'Tiempo de carga del DOM': perfData.domContentLoadedEventEnd - perfData.requestStart + 'ms',
            'Tiempo total': perfData.loadEventEnd - perfData.requestStart + 'ms'
        });
    }
});

// ===== MANEJO DE ERRORES =====
window.addEventListener('error', function(e) {
    console.error('Error en la página:', e.error);
});

// ===== ACCESIBILIDAD =====
document.addEventListener('keydown', function(e) {
    // Navegación con tab mejorada
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// ===== COMPATIBILIDAD CON NAVEGADORES ANTIGUOS =====
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}