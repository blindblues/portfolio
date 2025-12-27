// Animazioni scroll basate sulla percentuale di scroll totale
document.addEventListener('DOMContentLoaded', () => {
    let lastScrollY = window.scrollY;
    let scrollDirection = 'down';
    let lastScrollPercentage = 0;

    // Calcola la percentuale di scroll totale del sito
    function getScrollPercentage() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const currentScroll = window.scrollY;
        return Math.min(100, Math.max(0, (currentScroll / documentHeight) * 100));
    }

    // Calcola la percentuale di scroll relativa a una sezione specifica
    function getSectionScrollPercentage(section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const windowHeight = window.innerHeight;
        const currentScroll = window.scrollY;
        
        // Calcola quando la sezione inizia a essere visibile (top entra in viewport)
        const sectionStart = sectionTop - windowHeight;
        // Calcola quando la sezione è completamente passata (bottom esce dalla viewport)
        const sectionEnd = sectionTop + sectionHeight;
        const scrollRange = sectionEnd - sectionStart;
        
        // Calcola la percentuale di scroll all'interno della sezione
        let sectionProgress = (currentScroll - sectionStart) / scrollRange;
        sectionProgress = Math.min(1, Math.max(0, sectionProgress));
        
        console.log(`Section ${section.id}: top=${sectionTop}, height=${sectionHeight}, scroll=${currentScroll}, start=${sectionStart}, end=${sectionEnd}, progress=${sectionProgress * 100}%`);
        
        return sectionProgress * 100;
    }

    // Aggiorna la direzione dello scroll
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        lastScrollY = currentScrollY;
        
        // Calcola la percentuale di scroll attuale
        const currentScrollPercentage = getScrollPercentage();
        
        // Applica animazioni basate sulla percentuale per le sezioni dalla about in poi
        const sections = document.querySelectorAll('#about, #portfolio, #contact');
        sections.forEach(section => {
            const sectionProgress = getSectionScrollPercentage(section);
            applyScrollBasedAnimations(section, sectionProgress, scrollDirection);
        });
        
        lastScrollPercentage = currentScrollPercentage;
    });

    // Applica animazioni basate sulla percentuale di scroll
    function applyScrollBasedAnimations(section, progress, direction) {
        const animatedElements = section.querySelectorAll('[data-scroll]');
        
        console.log(`Applying animations to ${section.id}: progress=${progress}%, direction=${direction}, elements=${animatedElements.length}`);
        
        animatedElements.forEach(element => {
            const animationType = element.dataset.scrollCall;
            
            // Calcola i valori di animazione basati sulla percentuale
            let opacity, transformX, transformY, scale;
            
            if (direction === 'down') {
                // Animazione quando si scorre verso il basso
                if (progress <= 20) {
                    // Fade in nei primi 20% del progresso
                    opacity = progress / 20;
                } else {
                    opacity = 1;
                }
                
                switch(animationType) {
                    case 'fadeInUp':
                        if (progress <= 30) {
                            transformY = (1 - progress / 30) * 50; // Sposta su nei primi 30%
                        } else {
                            transformY = 0;
                        }
                        transformX = 0;
                        break;
                    case 'fadeInLeft':
                        if (progress <= 30) {
                            transformX = (1 - progress / 30) * -50; // Sposta da sinistra nei primi 30%
                        } else {
                            transformX = 0;
                        }
                        transformY = 0;
                        break;
                    case 'fadeInRight':
                        if (progress <= 30) {
                            transformX = (1 - progress / 30) * 50; // Sposta da destra nei primi 30%
                        } else {
                            transformX = 0;
                        }
                        transformY = 0;
                        break;
                    default:
                        if (progress <= 30) {
                            transformX = 0;
                            transformY = (1 - progress / 30) * 30;
                        } else {
                            transformX = 0;
                            transformY = 0;
                        }
                }
                
                // Effetti aggiuntivi basati sul progresso
                if (progress > 50 && element.classList.contains('section-title')) {
                    // Aggiungi underline animation per i titoli dopo 50% di progresso
                    const underlineProgress = (progress - 50) / 50; // 0 a 1 nel secondo 50%
                    element.style.setProperty('--underline-width', `${underlineProgress * 100}px`);
                }
                
            } else {
                // Animazione quando si scorre verso l'alto (reverse)
                if (progress >= 80) {
                    // Fade out negli ultimi 20% del progresso
                    opacity = (100 - progress) / 20;
                } else {
                    opacity = 1;
                }
                
                switch(animationType) {
                    case 'fadeInUp':
                        if (progress >= 70) {
                            // Quando si va su e si è alla fine della sezione, torna verso il basso
                            transformY = ((progress - 70) / 30) * 50; // Sposta giù nell'ultimo 30%
                        } else {
                            transformY = 0;
                        }
                        transformX = 0;
                        break;
                    case 'fadeInLeft':
                        if (progress >= 70) {
                            // Quando si va su e si è alla fine della sezione, torna a sinistra
                            transformX = -((progress - 70) / 30) * 50; // Sposta a sinistra nell'ultimo 30%
                        } else {
                            transformX = 0;
                        }
                        transformY = 0;
                        break;
                    case 'fadeInRight':
                        if (progress >= 70) {
                            // Quando si va su e si è alla fine della sezione, torna a destra
                            transformX = ((progress - 70) / 30) * 50; // Sposta a destra nell'ultimo 30%
                        } else {
                            transformX = 0;
                        }
                        transformY = 0;
                        break;
                    default:
                        if (progress >= 70) {
                            transformX = 0;
                            transformY = ((progress - 70) / 30) * 30;
                        } else {
                            transformX = 0;
                            transformY = 0;
                        }
                }
                
                // Rimuovi underline animation per i titoli
                if (progress < 50 && element.classList.contains('section-title')) {
                    element.style.setProperty('--underline-width', '0px');
                }
            }
            
            scale = 1; // Mantieni scale costante per ora
            
            console.log(`Element ${element.tagName}.${element.className}: opacity=${opacity}, transform=${transformX},${transformY}`);
            
            // Applica le trasformazioni solo agli elementi con data-scroll
            element.style.opacity = opacity;
            element.style.transform = `translateX(${transformX}px) translateY(${transformY}px) scale(${scale})`;
            
            // Aggiungi classe per stato CSS aggiuntivo
            if (opacity > 0.1) {
                element.classList.add('scroll-active');
            } else {
                element.classList.remove('scroll-active');
            }
        });
        
        // Gestisci separatamente le animazioni dei paragrafi nei .section-text
        const sectionTextElements = section.querySelectorAll('.section-text');
        sectionTextElements.forEach(sectionText => {
            const paragraphs = sectionText.querySelectorAll('p');
            
            if (direction === 'down') {
                // Quando si scorre verso il basso
                if (progress > 10) {
                    // Aggiungi classe in-view dopo 10% di progresso
                    sectionText.classList.add('in-view');
                    sectionText.classList.remove('out-view');
                } else {
                    sectionText.classList.remove('in-view');
                    sectionText.classList.add('out-view');
                }
            } else {
                // Quando si scorre verso l'alto
                if (progress < 90) {
                    sectionText.classList.add('in-view');
                    sectionText.classList.remove('out-view');
                } else {
                    sectionText.classList.remove('in-view');
                    sectionText.classList.add('out-view');
                }
            }
        });
    }

    // Sistema fallback per elementi prima della about (mantiene il vecchio sistema)
    const observerOptions = {
        threshold: [0, 0.1, 0.5, 1]
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const element = entry.target;
            const section = element.closest('section');
            
            // Applica solo alle sezioni prima della about
            if (section && (section.id === 'hero' || !section.id)) {
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    element.classList.remove('out-view');
                    element.classList.add('in-view');
                } else if (entry.intersectionRatio < 0.1) {
                    if (scrollDirection === 'up') {
                        element.classList.remove('in-view');
                        element.classList.add('out-view');
                    } else {
                        element.classList.remove('in-view');
                        element.classList.remove('out-view');
                    }
                }
            }
        });
    }, observerOptions);

    // Osserva solo gli elementi nelle sezioni prima della about
    document.querySelectorAll('#hero [data-scroll], [data-scroll]:not([data-scroll-section] [data-scroll])').forEach(el => {
        observer.observe(el);
    });

    // Inizializza le animazioni per le sezioni dalla about in poi
    const aboutSections = document.querySelectorAll('#about, #portfolio, #contact');
    aboutSections.forEach(section => {
        const initialProgress = getSectionScrollPercentage(section);
        // All'inizio, se il progress è 0 (sezione non ancora raggiunta), 
        // gli elementi dovrebbero essere invisibili ma pronti ad animare
        // Se il progress > 0, applica l'animazione normale
        applyScrollBasedAnimations(section, initialProgress, 'down');
    });

    console.log('Animazioni scroll basate sulla percentuale abilitate per sezioni dalla about in poi');
});
