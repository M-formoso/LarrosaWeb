
(function() {
    'use strict';
    
    console.log('🎠 Cargando carrusel simple...');
    
    // Variables globales simples
    let slideIndex = 0;
    let maxSlides = 0;
    let slidesToShow = 4;
    let slideWidth = 310; // 270px card + 40px gap
    
    function initSimpleCarousel() {
        console.log('🚀 Iniciando carrusel...');
        
        // Elementos
        const track = document.getElementById('unitsTrack');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (!track || !prevBtn || !nextBtn) {
            console.log('❌ Elementos no encontrados');
            return;
        }
        
        // Contar tarjetas
        const cards = track.querySelectorAll('.unit-card');
        const totalCards = cards.length;
        
        console.log(`📊 Total cards: ${totalCards}`);
        
        if (totalCards <= slidesToShow) {
            console.log('ℹ️ No hay suficientes cards para carrusel');
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }
        
        // Calcular slides máximos
        maxSlides = totalCards - slidesToShow;
        
        console.log(`📏 Max slides: ${maxSlides}`);
        
        // Eventos de botones
        prevBtn.onclick = function() {
            console.log('⬅️ Previous clicked');
            if (slideIndex > 0) {
                slideIndex--;
                updateCarousel();
            }
        };
        
        nextBtn.onclick = function() {
            console.log('➡️ Next clicked');
            if (slideIndex < maxSlides) {
                slideIndex++;
                updateCarousel();
            }
        };
        
        // Actualizar estado inicial
        updateCarousel();
        
        console.log('✅ Carrusel iniciado correctamente');
    }
    
    function updateCarousel() {
        const track = document.getElementById('unitsTrack');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (!track) return;
        
        // Calcular desplazamiento simple
        const translateX = slideIndex * slideWidth;
        
        // Aplicar transformación
        track.style.transform = `translateX(-${translateX}px)`;
        
        console.log(`🎯 Slide ${slideIndex}, translateX: -${translateX}px`);
        
        // Actualizar botones
        if (prevBtn) {
            prevBtn.disabled = slideIndex <= 0;
            prevBtn.style.opacity = slideIndex <= 0 ? '0.4' : '1';
        }
        
        if (nextBtn) {
            nextBtn.disabled = slideIndex >= maxSlides;
            nextBtn.style.opacity = slideIndex >= maxSlides ? '0.4' : '1';
        }
        
        // Actualizar indicadores
        updateIndicators();
    }
    
    function updateIndicators() {
        const indicators = document.querySelectorAll('.carousel-indicator');
        
        indicators.forEach((indicator, index) => {
            if (index === slideIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Crear indicadores simples
    function createIndicators() {
        const container = document.getElementById('carouselIndicators');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 0; i <= maxSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-indicator';
            dot.onclick = function() {
                slideIndex = i;
                updateCarousel();
            };
            container.appendChild(dot);
        }
        
        console.log(`📍 Creados ${maxSlides + 1} indicadores`);
    }
    
    // Función debug simple
    window.debugCarousel = function() {
        console.log('🔍 Estado:');
        console.log('- Slide actual:', slideIndex);
        console.log('- Max slides:', maxSlides);
        console.log('- Slides to show:', slidesToShow);
        console.log('- Slide width:', slideWidth);
    };
    
    // Funciones de control
    window.goNext = function() {
        if (slideIndex < maxSlides) {
            slideIndex++;
            updateCarousel();
        }
    };
    
    window.goPrev = function() {
        if (slideIndex > 0) {
            slideIndex--;
            updateCarousel();
        }
    };
    
    // Inicializar cuando esté listo
    function start() {
        setTimeout(function() {
            initSimpleCarousel();
            createIndicators();
        }, 500);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
    
})();