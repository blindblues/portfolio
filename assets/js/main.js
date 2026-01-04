// Modello 3D Buddha
let scene, camera, renderer, buddha;
let scrollY = 0;
let maxScrollY = 0;

function initBuddha() {
    const container = document.getElementById('buddha-container');
    if (!container) return;

    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup - use full hero section dimensions
    const heroSection = document.querySelector('.hero');
    const width = heroSection.offsetWidth;
    const height = heroSection.offsetHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    
    // Canvas fills the entire container
    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    container.appendChild(canvas);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0x87CEEB, 1);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Load GLB model with GitHub Pages LFS workaround
    const loader = new THREE.GLTFLoader();
    
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #87CEEB; font-family: Poppins; font-size: 18px; z-index: 10;';
    loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Caricamento modello 3D...';
    container.appendChild(loadingDiv);
    
    // Set a timeout for loading
    const loadingTimeout = setTimeout(() => {
        if (!buddha) {
            console.log('Loading timeout - using fallback');
            loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Timeout caricamento, uso fallback...';
            createFallbackModel();
        }
    }, 5000); // 5 seconds timeout
    
    // Try multiple URLs for the GLB model (GitHub Pages LFS workaround)
    const glbUrls = [
        'https://raw.githubusercontent.com/blindblues/portfolio/master/assets/models/buddha/source/model.glb',
        'assets/models/buddha/source/model.glb'
    ];
    
    let urlIndex = 0;
    
    function tryLoadGLB() {
        const currentUrl = glbUrls[urlIndex];
        console.log(`Trying to load GLB from: ${currentUrl}`);
        
        loader.load(
            currentUrl,
            function (gltf) {
                clearTimeout(loadingTimeout);
                buddha = gltf.scene;
                
                // Remove loading indicator
                loadingDiv.remove();
                
                // Create a group to control the model
                const buddhaGroup = new THREE.Group();
                buddhaGroup.add(buddha);
                
                // Center and scale the model within the group
                const box = new THREE.Box3().setFromObject(buddha);
                const center = box.getCenter(new THREE.Vector3());
                buddha.position.sub(center);
                
                const size = box.getSize(new THREE.Vector3());
                const isMobile = window.innerWidth <= 768;
                const scale = isMobile ? 2 / size.x : 6 / size.x; 
                buddha.scale.multiplyScalar(scale);
                
                // Reset all rotations
                buddha.rotation.set(0, 0, 0);
                
                // Posiziona il modello al centro della viewport (metà altezza)
                buddha.position.y = isMobile ? -0.5 : -0.1; // Posizioni diverse per mobile e desktop
                
                // Add group to scene instead of direct model
                scene.add(buddhaGroup);
                
                // Replace buddha reference with the group
                buddha = buddhaGroup;
                
                console.log('GLB model loaded successfully from:', currentUrl);
            },
            function (xhr) {
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total * 100).toFixed(1);
                    loadingDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Caricamento modello 3D... ${percentComplete}%`;
                }
            },
            function (error) {
                console.error(`Error loading GLB from ${currentUrl}:`, error);
                
                // Try next URL or fallback
                urlIndex++;
                if (urlIndex < glbUrls.length) {
                    console.log('Trying next URL...');
                    tryLoadGLB();
                } else {
                    clearTimeout(loadingTimeout);
                    loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Errore caricamento GLB, uso fallback...';
                    createFallbackModel();
                }
            }
        );
    }
    
    // Start loading
    tryLoadGLB();
    
    function createFallbackModel() {
        setTimeout(() => {
            loadingDiv.remove();
            
            // Create a more interesting fallback geometry
            const fallbackGeometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
            const fallbackMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x87CEEB,
                specular: 0x222222,
                shininess: 100,
                wireframe: false
            });
            const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
            
            const fallbackGroup = new THREE.Group();
            fallbackGroup.add(fallbackMesh);
            scene.add(fallbackGroup);
            buddha = fallbackGroup;
            
            console.log('Fallback torus knot created');
        }, 1000);
    }

    // Mouse move listener for rotation
    document.addEventListener('mousemove', onMouseMove);
    
    // Scroll listener
    window.addEventListener('scroll', onScroll);
    
    // Animation loop
    animate();
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onScroll() {
    scrollY = window.pageYOffset;
    
    // Calculate max scroll height (document height - viewport height)
    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    maxScrollY = documentHeight - viewportHeight;
}

function animate() {
    requestAnimationFrame(animate);

    if (buddha) {
        // Floating effect based on scroll
        const floatY = Math.sin(Date.now() * 0.001) * 0.1 + scrollY * 0.0005;
        buddha.position.y = floatY + 1; // Raised by 1 unit
        
        // Rotation based on scroll percentage
        if (maxScrollY > 0) {
            const scrollPercentage = scrollY / maxScrollY;
            
            buddha.rotation.y = scrollPercentage * Math.PI * 4; // 3 rotazioni complete (1080 degrees) based on scroll percentage
            
            // Scale effect based on scroll - ingrandimento più evidente
            const scaleEffect = 1 + (scrollPercentage * 3); // Ingrandisce fino al 400%
            buddha.scale.set(scaleEffect, scaleEffect, scaleEffect);
            
            // Additional downward movement based on scroll - movimento verso il basso (inverso)
            const moveDown = scrollPercentage * 2000; // Muove verso il basso di 1000 unità
            buddha.position.y = floatY + 1 - moveDown; // Sottrai invece di aggiungere
            
            // Muovi anche la telecamera verso il basso per seguire il modello
            camera.position.y = -moveDown * 0.99; // La telecamera si abbassa del 99% del movimento del modello
            
            // Reset X and Z rotation to prevent orbiting
            buddha.rotation.x = 0;
            buddha.rotation.z = 0;
        }
    }

    renderer.render(scene, camera);
}

// Initialize Buddha when DOM is loaded
document.addEventListener('DOMContentLoaded', initBuddha);

// Handle window resize
window.addEventListener('resize', () => {
    if (camera && renderer) {
        const heroSection = document.querySelector('.hero');
        const width = heroSection.offsetWidth;
        const height = heroSection.offsetHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
});

// Menu mobile hamburger
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Chiudi menu mobile quando si clicca su un link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect - header con effetto blur quando si scorre
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const scrolled = window.pageYOffset;
    
    // Aggiungi effetto blur quando si scorre verso il basso
    if (scrolled > 50) {
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.WebkitBackdropFilter = 'blur(10px)'; // Supporto Safari
    } else {
        // Rimuovi effetto blur quando si è in cima
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'blur(0px)';
        navbar.style.boxShadow = 'none';
        navbar.style.WebkitBackdropFilter = 'blur(0px)'; // Supporto Safari
    }
    
    // Resetta lo stile del contenuto hero per non sfocarlo direttamente
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.filter = 'none';
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
    }
});

// Portfolio filter functionality
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Rimuovi active da tutti i bottoni
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Aggiungi active al bottone cliccato
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        
        portfolioItems.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = 'block';
                // Aggiungi animazione fade-in
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 100);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Smooth scrolling per link interni
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animazione fade-in al scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Aggiungi classe fade-in agli elementi da animare - DISABILITATO TEMPORANEAMENTE
document.addEventListener('DOMContentLoaded', () => {
    // Disabilitato per debug - rimuovi il commento per riattivare
    /*
    const elementsToAnimate = document.querySelectorAll('.about-text, .about-image, .portfolio-item, .contact-info, .contact-form');
    elementsToAnimate.forEach(element => {
        element.classList.add('fade-in');
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
    */
});

// Form di contatto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Prendi i dati dal form
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Validazione base
        if (!name || !email || !subject || !message) {
            showNotification('Per favore compila tutti i campi', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Per favore inserisci un\'email valida', 'error');
            return;
        }
        
        // Simula invio form (in un progetto reale qui ci sarebbe una chiamata API)
        showNotification('Messaggio inviato con successo! Ti risponderò presto.', 'success');
        contactForm.reset();
    });
}

// Sistema di notifiche
function showNotification(message, type = 'info') {
    // Rimuovi notifiche esistenti
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crea nuova notifica
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Stili notifica
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    `;
    
    // Colori base sul tipo
    switch(type) {
        case 'success':
            notification.style.background = '#4CAF50';
            break;
        case 'error':
            notification.style.background = '#f44336';
            break;
        default:
            notification.style.background = '#4A90E2';
    }
    
    document.body.appendChild(notification);
    
    // Animazione entrata
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Rimuovi dopo 5 secondi
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Animazione typing per hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Applica typing animation al caricamento
window.addEventListener('load', () => {
    const nameElement = document.querySelector('.name');
    if (nameElement) {
        const originalText = nameElement.textContent;
        typeWriter(nameElement, originalText, 150);
    }
});

// Portfolio item hover effect con mouse move
portfolioItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Active nav link based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Easter egg: Konami code
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    // Crea nuvole extra animate
    const heroSection = document.querySelector('.hero');
    for (let i = 0; i < 10; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud easter-egg-cloud';
        cloud.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 100px;
            width: ${Math.random() * 80 + 40}px;
            height: ${Math.random() * 30 + 20}px;
            top: ${Math.random() * 80}%;
            animation: float ${Math.random() * 10 + 15}s infinite;
            z-index: 1;
        `;
        heroSection.querySelector('.clouds').appendChild(cloud);
    }
    
    showNotification('🌈 Hai scoperto il codice segreto! Il cielo è più sereno oggi!', 'success');
}