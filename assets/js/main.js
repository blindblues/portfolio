import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Variabili globali
let scene, camera, renderer, model, mouseX = 0, mouseY = 0;
let isInteracting = false;
let lastFrameTime = 0;
let frameCount = 0;
let fps = 60;
let lastRenderTime = 0;
const TARGET_FPS = 60; // Limita a 60 FPS per performance
const FRAME_INTERVAL = 1000 / TARGET_FPS;
let shaderMaterials = []; // Array per tenere traccia degli shader materials
let isTransitioning = false; // Flag per animazione di transizione
let transitionStartTime = 0;
const TRANSITION_DURATION = 6000; // 3 secondi per movimento lento del logo

// Variabili per gestione touch
let touchStartTime = 0;
let touchStartX = 0;
let touchStartY = 0;
let hasMoved = false;
const TAP_THRESHOLD = 10; // Pixel massimi per considerare un tap
const TAP_TIME_THRESHOLD = 200; // Millisecondi massimi per considerare un tap

// Variabili per animazione idle
let idleTimer = 0;
let idleTargetRotationX = 0;
let idleTargetRotationY = 0;
let idleTargetRotationZ = 0;
let idleCurrentRotationX = 0;
let idleCurrentRotationY = 0;
let idleCurrentRotationZ = 0;
let lastInteractionTime = 0;
const IDLE_DELAY = 3000; // 3 secondi prima che inizi l'animazione idle
const IDLE_ROTATION_SPEED = 0.008; // Velocità più rapida della rotazione idle
let nextIdleChange = 0;
const IDLE_CHANGE_INTERVAL = 3000; // Cambia direzione ogni 3 secondi (più frequente)
let returnToCenterTime = 0;
const RETURN_TO_CENTER_INTERVAL = 6000; // Torna al centro ogni 6 secondi (più frequente)

// Inizializzazione
function init() {
    // Scena premium con background scuro stellato
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020812); // Blu scuro quasi nero
    
    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    // Renderer
    const canvas = document.getElementById('canvas3d');
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Configurazione renderer per depth buffer corretto
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.bias = -0.0001;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.sortObjects = false; // Disabilita sorting per performance
    renderer.autoClear = true;
    renderer.autoClearColor = true;
    renderer.autoClearDepth = true;
    renderer.autoClearStencil = true;
    
    // Background trasparente per mostrare lo sfondo del sito
    scene.background = null;
    scene.environment = null;
    
    // Illuminazione premium futuristica
    // Luce ambientale aumentata per caustiche visibili
    const ambientLight = new THREE.AmbientLight(0x112244, 0.08); // Aumentato da 0.02 a 0.08
    scene.add(ambientLight);
    
    // Luce principale morbida laterale per volume e curvatura
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(5, 3, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);
    
    // Rim light blu intensa per bordi neon
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.5);
    rimLight.position.set(-8, 2, -6);
    rimLight.castShadow = false; // Nessuna ombra per effetto puro
    scene.add(rimLight);
    
    // Carica modello 3D
    loadModel();
    
    // Event listener per il mouse e touch
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });
    document.addEventListener('touchcancel', onTouchCancel, { passive: false });
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);
    
    // Event listener per i click sui link di navigazione
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigationClick);
    });
    
    // Applica il font Parisienne alle prime lettere - DISABILITATO per mantenere le classi dei font
    // applyParisienneFirstLetter();
    
    // Ottimizzazione: riduci FPS quando non in uso
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isInteracting = false;
        } else {
            isInteracting = true;
        }
    });
    
    // Avvia animazione
    animate();
}

// Caricamento modello 3D
async function loadModel() {
    const loader = new OBJLoader();
    
    try {
        // Carica il file OBJ locale
        const object = await loader.loadAsync('assets/models/ExtrudedLogo.obj');
        console.log('Modello OBJ caricato con successo'); // Debug
        
        // Shader personalizzato semplificato per mobile
        let vertexShader, fragmentShader;
        
        if (window.innerWidth <= 768) {
            // Versione semplificata per mobile
            vertexShader = `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;
            
            fragmentShader = `
                uniform vec3 uColor;
                uniform vec3 uGlowColor;
                uniform float uTime;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 normal = normalize(vNormal);
                    
                    // Lighting base semplificato
                    float NdotL = max(dot(normal, vec3(1.0, 1.0, 1.0)), 0.0);
                    vec3 diffuse = uColor * NdotL * 0.8;
                    vec3 ambient = uColor * 0.3;
                    
                    // Glow semplice sui bordi
                    float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
                    vec3 glow = uGlowColor * pow(fresnel, 2.0) * 0.5;
                    
                    // Pulsazione semplice
                    float pulse = sin(uTime * 0.3) * 0.1 + 0.9;
                    
                    vec3 finalColor = (diffuse + ambient + glow) * pulse;
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `;
        } else {
            // Versione completa per desktop
            vertexShader = `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec3 vViewPosition;
                varying vec2 vUv;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    vUv = uv;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = -mvPosition.xyz;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `;
            
            fragmentShader = `
                uniform vec3 uColor;
                uniform vec3 uGlowColor;
                uniform float uTime;
                uniform float uIntensity;
                uniform vec3 uLightDirection;
                uniform vec3 uAmbientColor;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec3 vViewPosition;
                varying vec2 vUv;
                
                // Funzione per caustiche lente e fluide
                float causticPattern(vec2 uv, float time) {
                    vec2 p = uv * 3.0;
                    float pattern = 0.0;
                    
                    // Movimento lento e ondulato delle caustiche
                    for(float i = 0.0; i < 3.0; i++) {
                        vec2 q = p + i * vec2(0.5, 0.3);
                        float wave1 = sin(q.x * 0.8 + time * 0.3) * cos(q.y * 0.6 + time * 0.2);
                        float wave2 = sin(q.x * 1.2 - time * 0.25) * cos(q.y * 0.9 + time * 0.35);
                        pattern += (wave1 + wave2) * 0.1 / (i + 1.0);
                    }
                    
                    return pattern * 0.4 + 0.5;
                }
                
                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(vViewPosition);
                    vec3 lightDir = normalize(uLightDirection);
                    
                    // Fresnel effect delicato
                    float fresnel = 1.0 - dot(normal, viewDir);
                    fresnel = pow(fresnel, 2.0);
                    
                    // Lighting base
                    float NdotL = max(dot(normal, lightDir), 0.0);
                    vec3 diffuse = uColor * NdotL * 0.6;
                    vec3 ambient = uAmbientColor * 0.4;
                    
                    // Specular highlight morbido
                    vec3 reflectDir = reflect(-lightDir, normal);
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                    vec3 specular = vec3(1.0, 0.95, 0.9) * spec * 0.4;
                    
                    // Caustiche lente basate su UV e posizione
                    vec2 uv = vUv + vPosition.xy * 0.05;
                    float caustic = causticPattern(uv, uTime * 0.2);
                    
                    // Pulsazione molto lenta e sottile
                    float pulse = sin(uTime * 0.5) * 0.15 + 0.85;
                    float intensity = uIntensity * pulse;
                    
                    // Effetto caustico principale con movimento lento
                    vec3 causticColor = mix(uGlowColor, vec3(1.0, 0.98, 0.95), caustic * 0.3);
                    vec3 causticEffect = causticColor * (fresnel * 0.3 + caustic * 0.6) * intensity * 1.5;
                    
                    // Glow delicato sui bordi
                    vec3 glow = uGlowColor * fresnel * intensity * 0.8;
                    
                    // Combina tutto con emphasis sulle caustiche lente
                    vec3 finalColor = ambient + diffuse + specular + causticEffect + glow;
                    
                    // Alpha trasparente solo sui bordi molto estremi
                    float alpha = 1.0;
                    if (fresnel > 0.85) {
                        alpha = mix(1.0, 0.8, (fresnel - 0.85) / 0.15);
                    }
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `;
        }

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: window.innerWidth > 768 ? new THREE.Color(0xffffff) : new THREE.Color(0x004466) }, // Bianco su desktop, blu su mobile
                uGlowColor: { value: new THREE.Color(0xffffff) }, // Glow bianco come le scritte
                uTime: { value: 0 },
                uIntensity: { value: 2.0 }, // Più intensità
                uLightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
                uAmbientColor: { value: window.innerWidth > 768 ? new THREE.Color(0x888888) : new THREE.Color(0x112244) } // Ambient grigio su desktop, scuro su mobile
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Applica lo shader a tutti i mesh del modello
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = shaderMaterial;
                child.castShadow = false;
                shaderMaterials.push(shaderMaterial); // Aggiungi all'array
            }
        });
        
        model = object;
        
        // Scala del modello ridotta per mobile
        let modelScale = 0.05; // Default desktop scale
        if (window.innerWidth <= 768) {
            modelScale = 0.03; // Ridotto per tablet
        }
        if (window.innerWidth <= 480) {
            modelScale = 0.02; // Ancora più ridotto per small mobile
        }
        
        model.scale.set(modelScale, modelScale, modelScale);
        
        // Calcola bounding box per centrare il modello
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        // Posiziona il modello 3D nella stessa posizione del circle-border
        const circleBorder = document.querySelector('.circle-border');
        if (circleBorder) {
            const rect = circleBorder.getBoundingClientRect();
            console.log('Circle border position:', rect.left, rect.top, rect.width, rect.height); // Debug
            
            // Calcola la posizione relativa del circle-border rispetto al centro della pagina
            const pageCenterX = window.innerWidth / 2;
            const pageCenterY = window.innerHeight / 2;
            const circleCenterX = rect.left + rect.width / 2;
            const circleCenterY = rect.top + rect.height / 2;
            
            // Calcola l'offset dal centro della pagina
            const offsetX = circleCenterX - pageCenterX;
            const offsetY = circleCenterY - pageCenterY;
            
            console.log('Offset:', offsetX, offsetY); // Debug
            
            // Applica l'offset direttamente al modello (con un fattore di scala)
            const scaleFactor = 0.002; // Fattore di scala molto piccolo
            model.position.x = offsetX * scaleFactor;
            model.position.y = (-offsetY * scaleFactor) - 0.1; // Spostato più in basso di 0.3 unità
            
            console.log('Posizione finale modello:', model.position.x, model.position.y); // Debug
        } else {
            // Fallback: posizione originale
            model.position.y += 1;
        }
        
        scene.add(model);
        console.log('Modello aggiunto alla scena'); // Debug
        
    } catch (error) {
        console.error('Errore nel caricamento del modello:', error);
        
        // Fallback: crea un modello geometrico semplice
        function createFallbackModel() {
            const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
            
            // Scala del modello fallback ridotta per mobile
            let fallbackScale = 1; // Default desktop scale
            if (window.innerWidth <= 768) {
                fallbackScale = 0.6; // Ridotto per tablet
            }
            if (window.innerWidth <= 480) {
                fallbackScale = 0.4; // Ancora più ridotto per small mobile
            }
            
            // Shader personalizzato semplificato per mobile fallback
            let vertexShader, fragmentShader;
            
            if (window.innerWidth <= 768) {
                // Versione semplificata per mobile
                vertexShader = `
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `;
                
                fragmentShader = `
                    uniform vec3 uColor;
                    uniform vec3 uGlowColor;
                    uniform float uTime;
                    
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    
                    void main() {
                        vec3 normal = normalize(vNormal);
                        
                        // Lighting base semplificato
                        float NdotL = max(dot(normal, vec3(1.0, 1.0, 1.0)), 0.0);
                        vec3 diffuse = uColor * NdotL * 0.8;
                        vec3 ambient = uColor * 0.3;
                        
                        // Glow semplice sui bordi
                        float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
                        vec3 glow = uGlowColor * pow(fresnel, 2.0) * 0.5;
                        
                        // Pulsazione semplice
                        float pulse = sin(uTime * 0.3) * 0.1 + 0.9;
                        
                        vec3 finalColor = (diffuse + ambient + glow) * pulse;
                        gl_FragColor = vec4(finalColor, 1.0);
                    }
                `;
            } else {
                // Versione completa per desktop
                vertexShader = `
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    varying vec3 vViewPosition;
                    varying vec2 vUv;
                    
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        vPosition = position;
                        vUv = uv;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        vViewPosition = -mvPosition.xyz;
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `;
                
                fragmentShader = `
                    uniform vec3 uColor;
                    uniform vec3 uGlowColor;
                    uniform float uTime;
                    uniform float uIntensity;
                    uniform vec3 uLightDirection;
                    uniform vec3 uAmbientColor;
                    
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    varying vec3 vViewPosition;
                    varying vec2 vUv;
                    
                    // Funzione per caustiche lente e fluide
                    float causticPattern(vec2 uv, float time) {
                        vec2 p = uv * 2.5;
                        float pattern = 0.0;
                        
                        for(float i = 0.0; i < 2.0; i++) {
                            vec2 q = p + i * vec2(0.4, 0.3);
                            float wave1 = sin(q.x * 0.7 + time * 0.25) * cos(q.y * 0.5 + time * 0.2);
                            float wave2 = sin(q.x * 1.0 - time * 0.3) * cos(q.y * 0.8 + time * 0.25);
                            pattern += (wave1 + wave2) * 0.12 / (i + 1.0);
                        }
                        
                        return pattern * 0.35 + 0.5;
                    }
                    
                    void main() {
                        vec3 normal = normalize(vNormal);
                        vec3 viewDir = normalize(vViewPosition);
                        vec3 lightDir = normalize(uLightDirection);
                        
                        // Fresnel effect delicato
                        float fresnel = 1.0 - dot(normal, viewDir);
                        fresnel = pow(fresnel, 1.8);
                        
                        // Lighting base
                        float NdotL = max(dot(normal, lightDir), 0.0);
                        vec3 diffuse = uColor * NdotL * 0.5;
                        vec3 ambient = uAmbientColor * 0.3;
                        
                        // Specular highlight morbido
                        vec3 reflectDir = reflect(-lightDir, normal);
                        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 28.0);
                        vec3 specular = vec3(0.9, 0.95, 1.0) * spec * 0.3;
                        
                        // Caustiche lente
                        vec2 uv = vUv + vPosition.xy * 0.03;
                        float caustic = causticPattern(uv, uTime * 0.15);
                        
                        // Pulsazione lenta
                        float pulse = sin(uTime * 0.4) * 0.1 + 0.9;
                        float intensity = uIntensity * pulse;
                        
                        // Effetto caustico
                        vec3 causticColor = mix(uGlowColor, vec3(1.0, 0.98, 0.95), caustic * 0.4);
                        vec3 causticEffect = causticColor * (fresnel * 0.2 + caustic * 0.5) * intensity * 1.2;
                        
                        // Glow delicato
                        vec3 glow = uGlowColor * fresnel * intensity * 0.6;
                        
                        // Combina tutto
                        vec3 finalColor = ambient + diffuse + specular + causticEffect + glow;
                        
                        // Alpha trasparente solo sui bordi
                        float alpha = 1.0;
                        if (fresnel > 0.8) {
                            alpha = mix(1.0, 0.7, (fresnel - 0.8) / 0.2);
                        }
                        
                        gl_FragColor = vec4(finalColor, alpha);
                    }
                `;
            }
            
            const shaderMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uColor: { value: window.innerWidth > 768 ? new THREE.Color(0xffffff) : new THREE.Color(0x004466) }, // Bianco su desktop, blu su mobile
                    uGlowColor: { value: new THREE.Color(0xffffff) }, // Glow bianco come le scritte
                    uTime: { value: 0 },
                    uIntensity: { value: 2.0 }, // Più intensità
                    uLightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
                    uAmbientColor: { value: window.innerWidth > 768 ? new THREE.Color(0x888888) : new THREE.Color(0x002244) } // Ambient grigio su desktop, scuro su mobile
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            model = new THREE.Mesh(geometry, shaderMaterial);
            model.scale.set(fallbackScale, fallbackScale, fallbackScale);
            model.castShadow = false;
            model.receiveShadow = false;
            
            // Posiziona il modello fallback nella stessa posizione del circle-border
            const circleBorder = document.querySelector('.circle-border');
            if (circleBorder) {
                const rect = circleBorder.getBoundingClientRect();
                // Converti le coordinate schermo del circle-border a coordinate Three.js normalizzate (-1 a 1)
                const x = ((rect.left + rect.width / 2) / window.innerWidth) * 2 - 1;
                const y = ((rect.top + rect.height / 2) / window.innerHeight) * 2 - 1;
                
                // Calcola la posizione 3D usando la distanza Z del modello (davanti alla camera)
                const distance = 5; // Distanza Z della camera
                const posX = x * distance * camera.aspect;
                const posY = y * distance;
                
                // Posiziona il modello alla stessa posizione X,Y del circle-border
                model.position.x = posX;
                model.position.y = posY;
                model.position.z = 0; // Mantieni il modello sul piano Z=0
            }
            
            shaderMaterials.push(shaderMaterial); // Aggiungi all'array
            scene.add(model);
            console.log('Modello fallback creato con shader personalizzato'); // Debug
        }
        createFallbackModel();
    }
}

// Crea cerchio luminoso trasparente dietro il logo
function createGlowCircle() {
    const geometry = new THREE.RingGeometry(2.5, 3.0, 64);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, // Bianco come le scritte
        transparent: true,
        opacity: 0.15, // Molto trasparente per effetto glow delicato
        side: THREE.DoubleSide
    });
    const glowCircle = new THREE.Mesh(geometry, material);
    glowCircle.position.set(0, 0, -2); // Dietro il logo
    scene.add(glowCircle);
    
    // Aggiungi un secondo cerchio più grande per glow più diffuso
    const geometry2 = new THREE.RingGeometry(3.2, 3.8, 64);
    const material2 = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, // Bianco come le scritte
        transparent: true,
        opacity: 0.08, // Ancora più trasparente
        side: THREE.DoubleSide
    });
    const glowCircle2 = new THREE.Mesh(geometry2, material2);
    glowCircle2.position.set(0, 0, -2.5);
    scene.add(glowCircle2);
}

// Gestione movimento mouse
function onMouseMove(event) {
    isInteracting = true;
    lastInteractionTime = performance.now(); // Registra il tempo dell'ultima interazione
    
    // Check if we're in the hero section
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        
        // Only respond to mouse movement when hero section is visible
        if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
            // Calcola la posizione del circle-border all'interno della sezione hero-bottom
            const circleBorder = document.querySelector('.circle-border');
            const heroBottom = document.querySelector('.hero-bottom');
            if (circleBorder && heroBottom) {
                // Ottieni le coordinate della sezione hero-bottom
                const heroBottomRect = heroBottom.getBoundingClientRect();
                // Ottieni le coordinate del circle-border
                const circleBorderRect = circleBorder.getBoundingClientRect();
                
                // Calcola il centro del circle-border relativo alla finestra
                const centerX = circleBorderRect.left + circleBorderRect.width / 2;
                const centerY = circleBorderRect.top + circleBorderRect.height / 2;
                
                // Calcola il delta rispetto alla posizione del circle-border
                mouseX = ((event.clientX - centerX) / window.innerWidth) * 2;
                mouseY = -((event.clientY - centerY) / window.innerHeight) * 2;
                
                // Limita i valori per evitare movimenti eccessivi
                mouseX = Math.max(-2, Math.min(2, mouseX));
                mouseY = Math.max(-2, Math.min(2, mouseY));
                
                // Restore full intensity when interacting
                if (shaderMaterials.length > 0) {
                    shaderMaterials.forEach(material => {
                        if (material.uniforms.uIntensity) {
                            material.uniforms.uIntensity.value = 2.0;
                        }
                    });
                }
            } else {
                // Fallback: usa il centro della finestra
                mouseX = (event.clientX / window.innerWidth) * 2 - 1;
                mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            }
        }
    }
}

// Gestione eventi touch
function onTouchStart(event) {
    
    // Registra il tempo e la posizione iniziale del touch
    touchStartTime = performance.now();
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    hasMoved = false;
    
    isInteracting = true;
    lastInteractionTime = performance.now();
    
    // Gestisci il primo tocco
    const touch = event.touches[0];
    updateTouchPosition(touch);
}

function onTouchMove(event) {
    
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        
        // Se il movimento supera la soglia, consideralo un movimento e non un tap
        if (deltaX > TAP_THRESHOLD || deltaY > TAP_THRESHOLD) {
            hasMoved = true;
            event.preventDefault(); // Previene scrolling solo se è un movimento
        }
        
        lastInteractionTime = performance.now();
        updateTouchPosition(touch);
    }
}

function onTouchEnd(event) {
    
    const touchEndTime = performance.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Previene il comportamento di default solo se è stato un movimento
    if (hasMoved) {
        event.preventDefault();
    }
    
    isInteracting = false;
    
    // Resetta gradualmente alla posizione centrale solo se è stato un movimento
    if (hasMoved) {
        const resetAnimation = () => {
            mouseX += (0 - mouseX) * 0.1;
            mouseY += (0 - mouseY) * 0.1;
            
            if (Math.abs(mouseX) > 0.01 || Math.abs(mouseY) > 0.01) {
                requestAnimationFrame(resetAnimation);
            } else {
                mouseX = 0;
                mouseY = 0;
            }
        };
        resetAnimation();
    }
    
    // Resetta le variabili del touch
    hasMoved = false;
}

// Funzione helper per aggiornare la posizione del touch
function updateTouchPosition(touch) {
    // Calcola la posizione del circle-border all'interno della sezione hero-bottom
    const circleBorder = document.querySelector('.circle-border');
    const heroBottom = document.querySelector('.hero-bottom');
    if (circleBorder && heroBottom) {
        // Ottieni le coordinate della sezione hero-bottom
        const heroBottomRect = heroBottom.getBoundingClientRect();
        // Ottieni le coordinate del circle-border
        const circleBorderRect = circleBorder.getBoundingClientRect();
        
        // Calcola il centro del circle-border relativo alla finestra
        const centerX = circleBorderRect.left + circleBorderRect.width / 2;
        const centerY = circleBorderRect.top + circleBorderRect.height / 2;
        
        // Calcola il delta rispetto alla posizione del circle-border
        mouseX = ((touch.clientX - centerX) / window.innerWidth) * 2;
        mouseY = -((touch.clientY - centerY) / window.innerHeight) * 2;
        
        // Limita i valori per evitare movimenti eccessivi
        mouseX = Math.max(-2, Math.min(2, mouseX));
        mouseY = Math.max(-2, Math.min(2, mouseY));
    } else {
        // Fallback: usa il centro della finestra
        mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
}

// Gestione mouse enter
function onMouseEnter(event) {
    isInteracting = true;
    lastInteractionTime = performance.now();
}

// Gestione mouse leave (quando il cursore esce dalla finestra)
function onMouseLeave(event) {
    isInteracting = false;
    // Inizia il countdown per l'animazione idle
    lastInteractionTime = performance.now();
    
    // Anima gradualmente il ritorno al centro invece di resettare immediatamente
    const resetAnimation = () => {
        mouseX += (0 - mouseX) * 0.08; // Animazione più lenta e fluida
        mouseY += (0 - mouseY) * 0.08;
        
        if (Math.abs(mouseX) > 0.005 || Math.abs(mouseY) > 0.005) {
            requestAnimationFrame(resetAnimation);
        } else {
            mouseX = 0;
            mouseY = 0;
        }
    };
    resetAnimation();
}

// Gestione touch cancel (quando il touch viene interrotto)
function onTouchCancel(event) {
    isInteracting = false;
    // Resetta le posizioni del touch al centro
    mouseX = 0;
    mouseY = 0;
    // Resetta le variabili del touch
    hasMoved = false;
    // Inizia il countdown per l'animazione idle
    lastInteractionTime = performance.now();
}

// Gestione click sulla navigazione
function handleNavigationClick(event) {
    event.preventDefault();
    
    // Salva la destinazione
    const targetHref = event.target.getAttribute('href');
    
    // Esegui immediatamente la navigazione senza animazioni
    // Check if it's an anchor link (same page navigation)
    if (targetHref.startsWith('#')) {
        // Smooth scroll to the section
        const targetElement = document.querySelector(targetHref);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        } else {
            // If section doesn't exist, redirect to appropriate page
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/')) + '/';
            window.location.href = basePath + targetHref.substring(1) + '.html';
        }
    } else {
        // Full page navigation
        window.location.href = targetHref;
    }
}

// Funzione per avviare l'animazione di spegnimento del modello 3D
function startModelPowerOff() {
    const blackColor = new THREE.Color(0x000000); // Nero opaco
    const powerOffDuration = 2000; // 5 secondi per spegnimento ancora più graduale
    const startTime = performance.now();
    
    // Salva i valori iniziali di tutti i materiali
    const initialStates = [];
    shaderMaterials.forEach(material => {
        if (material && material.uniforms) {
            initialStates.push({
                material: material,
                initialColor: material.uniforms.uColor ? material.uniforms.uColor.value.clone() : new THREE.Color(0x004466),
                initialGlowColor: material.uniforms.uGlowColor ? material.uniforms.uGlowColor.value.clone() : new THREE.Color(0xffffff),
                initialIntensity: material.uniforms.uIntensity ? material.uniforms.uIntensity.value : 2.0,
                initialAmbientColor: material.uniforms.uAmbientColor ? material.uniforms.uAmbientColor.value.clone() : new THREE.Color(0x112244)
            });
        }
    });
    
    function animateModelPowerOff() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / powerOffDuration, 1);
        
        // Curva di easing molto lenta all'inizio (quartic ease-in per inizio estremamente graduale)
        const easedProgress = progress < 4 
            ? 8 * progress * progress * progress * progress  // Quartic ease-in per inizio estremamente lento
            : 1 - Math.pow(-2 * progress + 2, 4) / 2; // Quartic ease-out
        
        // Applica una curva ancora più graduale per l'effetto "spegnimento"
        const smoothProgress = Math.pow(easedProgress, 0.85); // Potenza molto inferiore per rendere l'inizio estremamente lento
        
        // Spegni gradualmente tutti gli effetti luminosi
        initialStates.forEach(state => {
            if (state.material && state.material.uniforms) {
                state.material.uniforms.uColor.value = state.initialColor.lerp(blackColor, smoothProgress);
                state.material.uniforms.uGlowColor.value = state.initialGlowColor.lerp(blackColor, smoothProgress);
                state.material.uniforms.uIntensity.value = state.initialIntensity * (1 - smoothProgress); // Riduci intensità a 0
                state.material.uniforms.uAmbientColor.value = state.initialAmbientColor.lerp(blackColor, smoothProgress);
            }
        });
        
        if (elapsed < powerOffDuration) {
            requestAnimationFrame(animateModelPowerOff);
        } else {
            // Assicurati che tutto sia completamente spento alla fine
            initialStates.forEach(state => {
                if (state.material && state.material.uniforms) {
                    state.material.uniforms.uColor.value = blackColor;
                    state.material.uniforms.uGlowColor.value = blackColor;
                    state.material.uniforms.uIntensity.value = 0;
                    state.material.uniforms.uAmbientColor.value = blackColor;
                }
            });
            console.log('Modello 3D completamente spento'); // Debug
        }
    }
    
    animateModelPowerOff();
}

// Funzione per avviare l'espansione del cerchio nero sfuocato
function startVoidExpansion() {
    const voidCircle = document.getElementById('voidCircle');
    if (voidCircle) {
        console.log('Inizio espansione del cerchio nero'); // Debug
        voidCircle.classList.add('expanding');
    }
}

// Animazione ottimizzata senza frame skipping
function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();
    
    // Rimuovi il limitatore FPS per evitare stutter - lascia che il browser gestisca
    // if (currentTime - lastRenderTime < FRAME_INTERVAL) {
    //     return;
    // }
    // lastRenderTime = currentTime;
    
    if (model) {
        // Comportamento normale sempre - nessuna transizione
        // Limita il movimento del modello alla viewport su mobile
        let moveScaleX = 0.5;
        let moveScaleY = 0.4;
        let rotationScale = 0.3;
        
        if (window.innerWidth <= 768) {
            moveScaleX = 0.2;  // Ridotto movimento su mobile
            moveScaleY = 0.15;
            rotationScale = 0.15;
        }
        
        // Rotazione più reattiva al mouse + idle
        let totalRotationY = mouseX * rotationScale;
        let totalRotationX = -mouseY * rotationScale * 1.2; // Inverto rotazione X basata su mouseY
        let totalRotationZ = 0;
        
        // Aggiungi rotazioni idle se attive
        if (currentTime - lastInteractionTime > IDLE_DELAY && !isInteracting) {
            totalRotationY += idleCurrentRotationY;
            totalRotationX += idleCurrentRotationX;
            totalRotationZ += idleCurrentRotationZ;
        }
        
        model.rotation.y = totalRotationY;
        model.rotation.x = totalRotationX;
        model.rotation.z = totalRotationZ;
        
        // Movimento base limitato
        let baseX = mouseX * moveScaleX;
        let baseY = mouseY * moveScaleY;
        
        // Animazione idle quando non c'è interazione
        const timeSinceLastInteraction = currentTime - lastInteractionTime;
        if (timeSinceLastInteraction > IDLE_DELAY && !isInteracting) {
            // Inizia o continua l'animazione idle
            
            // Cambia direzione periodicamente
            if (currentTime > nextIdleChange) {
                idleTargetRotationX = (Math.random() - 0.5) * 0.8; // Rotazione casuale ridotta
                idleTargetRotationY = (Math.random() - 0.5) * 0.8;
                idleTargetRotationZ = (Math.random() - 0.5) * 0.8; // Rotazione Z ridotta
                nextIdleChange = currentTime + IDLE_CHANGE_INTERVAL;
            }
            
            // Torna al centro periodicamente
            if (currentTime > returnToCenterTime) {
                idleTargetRotationX = 0;
                idleTargetRotationY = 0;
                idleTargetRotationZ = 0; // Resetta anche Z
                returnToCenterTime = currentTime + RETURN_TO_CENTER_INTERVAL;
            }
            
            // Movimento fluido verso il target
            idleCurrentRotationX += (idleTargetRotationX - idleCurrentRotationX) * IDLE_ROTATION_SPEED;
            idleCurrentRotationY += (idleTargetRotationY - idleCurrentRotationY) * IDLE_ROTATION_SPEED;
            idleCurrentRotationZ += (idleTargetRotationZ - idleCurrentRotationZ) * IDLE_ROTATION_SPEED; // Aggiungi movimento Z
        } else {
            // Resetta l'animazione idle quando c'è interazione
            idleCurrentRotationX = 0;
            idleCurrentRotationY = 0;
            idleCurrentRotationZ = 0; // Resetta anche Z
            nextIdleChange = currentTime + IDLE_CHANGE_INTERVAL;
            returnToCenterTime = currentTime + RETURN_TO_CENTER_INTERVAL;
        }
        
        // Model position independent from circle border - only mouse driven
        model.position.y = -0.3 + baseY; // Lower default position + mouse movement
        model.position.x = baseX; // Center position + mouse movement
    }
    
    // Aggiorna il tempo negli shader materials in modo consistente
    const shaderTime = currentTime * 0.001; // Usa currentTime invece di Date.now()
    shaderMaterials.forEach(material => {
        if (material && material.uniforms && material.uniforms.uTime) {
            material.uniforms.uTime.value = shaderTime;
        }
    });
    
    renderer.render(scene, camera);
}

// Gestione resize finestra
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Aggiorna la scala del modello quando cambia la dimensione della finestra
    if (model) {
        updateModelScale();
        updateModelColor();
    }
}

// Funzione per aggiornare la scala del modello in base alla dimensione corrente
function updateModelScale() {
    if (!model) return;
    
    let modelScale = 0.05; // Default desktop scale
    if (window.innerWidth <= 768) {
        modelScale = 0.03; // Ridotto per tablet
    }
    if (window.innerWidth <= 480) {
        modelScale = 0.02; // Ancora più ridotto per small mobile
    }
    
    model.scale.set(modelScale, modelScale, modelScale);
    console.log('Model scale updated:', modelScale);
}

// Gestione scrolling
function onScroll() {
    // Don't reset mouse position - let model continue following cursor
    // mouseX = 0;
    // mouseY = 0;
    
    // Let model scroll with its section while maintaining cursor interaction
    if (model && !isInteracting) {
        // Model position is handled by the animate function - it will naturally follow the circle border
        // which scrolls with the hero section since canvas is absolute positioned
        
        // Reduce intensity when scrolled away from hero section
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            const heroRect = heroSection.getBoundingClientRect();
            // Check if hero section is still in viewport
            if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
                // Hero section is visible, restore full intensity
                if (shaderMaterials.length > 0) {
                    shaderMaterials.forEach(material => {
                        if (material.uniforms.uIntensity) {
                            material.uniforms.uIntensity.value = 2.0;
                        }
                    });
                }
            } else {
                // Hero section is not visible, reduce model intensity
                if (shaderMaterials.length > 0) {
                    shaderMaterials.forEach(material => {
                        if (material.uniforms.uIntensity) {
                            material.uniforms.uIntensity.value = 0.5; // Reduce intensity when scrolled away
                        }
                    });
                }
            }
        }
    }
}

// Funzione per aggiornare il colore del modello in base alla dimensione corrente
function updateModelColor() {
    if (!shaderMaterials.length) return;
    
    shaderMaterials.forEach(material => {
        if (material && material.uniforms) {
            // Usa sempre bianco per il modello principale su desktop
            if (window.innerWidth > 768) {
                material.uniforms.uColor.value = new THREE.Color(0xffffff); // Bianco
                material.uniforms.uAmbientColor.value = new THREE.Color(0x888888); // Ambient grigio chiaro
            } else {
                material.uniforms.uColor.value = new THREE.Color(0x004466); // Blu per mobile
                material.uniforms.uAmbientColor.value = new THREE.Color(0x112244); // Ambient scuro
            }
        }
    });
    console.log('Model color updated for screen width:', window.innerWidth);
}

// Funzione per applicare il font Parisienne alle prime lettere - DISABILITATA per mantenere le classi dei font
// function applyParisienneFirstLetter() {
//     // Applica ai link di navigazione
//     document.querySelectorAll('.nav-link').forEach(link => {
//         const text = link.textContent;
//         if (text && text.length > 0 && !link.querySelector('.first-letter')) {
//             const firstLetter = text.charAt(0);
//             const restOfText = text.slice(1).toLowerCase();
//             link.innerHTML = `<span class="first-letter">${firstLetter}</span>${restOfText}`;
//         }
//     });
//     
//     // Applica ai titoli h1 e h2
//     document.querySelectorAll('h1, h2').forEach(heading => {
//         const text = heading.textContent;
//         if (text && text.length > 0 && !heading.querySelector('.first-letter')) {
//             const firstLetter = text.charAt(0);
//             const restOfText = text.slice(1).toLowerCase();
//             heading.innerHTML = `<span class="first-letter">${firstLetter}</span>${restOfText}`;
//         }
//     });
// }

// Avvia tutto quando la pagina è caricata
window.addEventListener('DOMContentLoaded', init);