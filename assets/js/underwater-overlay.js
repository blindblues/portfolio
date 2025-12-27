import * as THREE from 'three';

// Variabili globali per l'overlay
let overlayScene, overlayCamera, overlayRenderer;
let waterMesh, causticsTexture, bubbleSystem, sunRaysMesh;
let overlayTime = 0;

// Inizializza l'overlay submarino
function initUnderwaterOverlay() {
    console.log('Initializing underwater overlay...');
    
    // Scena per l'overlay
    overlayScene = new THREE.Scene();
    
    // Camera ortografica per l'overlay
    const aspect = window.innerWidth / window.innerHeight;
    overlayCamera = new THREE.OrthographicCamera(
        -1 * aspect, 1 * aspect,
        1, -1,
        0.1, 1000
    );
    overlayCamera.position.z = 1;
    
    // Renderer per l'overlay
    const canvas = document.getElementById('underwater-canvas');
    if (!canvas) {
        console.error('Underwater canvas not found!');
        return;
    }
    
    overlayRenderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: false, // Disabilitato per performance
        alpha: true,
        powerPreference: 'low-power' // Priorità bassa per non interferire
    });
    overlayRenderer.setSize(window.innerWidth, window.innerHeight);
    overlayRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    overlayRenderer.setClearColor(0x000000, 0); // Trasparente
    
    console.log('Underwater renderer created');
    
    // Crea il piano d'acqua
    createWaterPlane();
    
    // Crea il sistema di caustics
    createCausticsEffect();
    
    // Crea il sistema di bolle
    createBubbleSystem();
    
    // Skip sun rays creation
    
    // Avvia l'animazione dell'overlay
    animateOverlay();
    
    console.log('Underwater overlay initialized successfully');
}

// Skip water plane to avoid square artifact - we'll use better visual effects instead
function createWaterPlane() {
    console.log('Skipping water plane - using better visual effects');
    
    // Create beautiful underwater particle effects instead
    createUnderwaterParticles();
}

// Crea effetti particellari per atmosfera submarina
function createUnderwaterParticles() {
    console.log('Creating underwater particle effects...');
    
    // Create floating particles for depth effect
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 3; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 3; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2; // z
        
        sizes[i] = Math.random() * 0.02 + 0.005;
        speeds[i] = Math.random() * 0.1 + 0.05;
        
        // Blue-green color palette for underwater feel
        colors[i * 3] = 0.2 + Math.random() * 0.3; // R
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.3; // G
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.3; // B
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    
    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData = { type: 'underwater-particles' };
    overlayScene.add(particleSystem);
    
    console.log('Underwater particle effects created');
}

// Crea texture caustics per riflessi di luce
function createCausticsEffect() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Crea pattern caustics
    function updateCaustics() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 512, 512);
        
        // Disegna pattern caustics animati
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 30 + 10;
            const opacity = Math.random() * 0.3 + 0.1;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
    }
    
    updateCaustics();
    causticsTexture = new THREE.CanvasTexture(canvas);
    
    // Aggiorna i caustics periodicamente
    setInterval(updateCaustics, 2000);
}

// Crea sistema di bolle usando sprites semplici
function createBubbleSystem() {
    const bubbleCount = 80; // Increased from 30 to cover full width
    
    for (let i = 0; i < bubbleCount; i++) {
        // Create canvas for each bubble
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Draw bubble
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 12);
        gradient.addColorStop(0, 'rgba(200, 230, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI * 2);
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.6
        });
        
        const sprite = new THREE.Sprite(material);
        
        // Random starting position across entire width
        sprite.position.x = (Math.random() - 0.5) * 4; // Expanded from 2 to 4 for full width
        sprite.position.y = -1 - Math.random() * 0.5;
        sprite.position.z = (Math.random() - 0.5) * 0.5;
        
        // Random size and speed - much smaller
        const scale = 0.005 + Math.random() * 0.01; // Much smaller (was 0.02 + 0.03)
        sprite.scale.set(scale, scale, 1);
        
        // Store animation data
        sprite.userData = {
            speed: 0.02 + Math.random() * 0.03, // Much slower (was 0.2 + 0.3)
            wobbleSpeed: 0.5 + Math.random() * 0.5, // Slower wobble (was 2 + 2)
            wobbleAmount: 0.02 + Math.random() * 0.02, // Smaller wobble
            initialX: sprite.position.x
        };
        
        overlayScene.add(sprite);
    }
    
    console.log('Bubble system created with sprites covering full width');
}

// Crea raggi solari subacquei realistici con effetto volumetrico
function createSunRays() {
    console.log('Creating realistic underwater sun rays...');
    
    // Shader personalizzato per raggi solari volumetrici
    const sunRayVertexShader = `
        precision highp float;
        precision highp int;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vDepth;
        
        void main() {
            vUv = uv;
            vPosition = position;
            vDepth = position.z;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const sunRayFragmentShader = `
        precision highp float;
        precision highp int;
        
        uniform float uTime;
        uniform vec3 uSunColor;
        uniform float uIntensity;
        uniform vec2 uResolution;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vDepth;
        
        // Funzione noise per movimento organico
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
            vec2 uv = vUv;
            
            // Movimento organico dei raggi
            float movement = noise(uv * 2.0 + uTime * 0.1) * 0.3;
            uv.x += movement;
            
            // Forma del raggio principale con fade centrale
            float rayShape = 1.0 - abs(uv.x - 0.5) * 2.0;
            rayShape = pow(rayShape, 2.0);
            
            // Intensità basata sulla profondità
            float depthFade = 1.0 - vDepth * 0.3;
            
            // Pulsazione molto lenta
            float pulse = sin(uTime * 0.2 + uv.y * 3.0) * 0.2 + 0.8;
            
            // Combina tutti gli effetti
            float intensity = rayShape * depthFade * pulse * uIntensity;
            
            // Colore finale con trasparenza
            vec3 finalColor = uSunColor * intensity;
            float alpha = intensity * 0.4; // Trasparenza per effetto etereo
            
            gl_FragColor = vec4(finalColor, alpha);
        }
    `;

    // Crea geometria per i raggi solari
    const rayGeometry = new THREE.PlaneGeometry(0.3, 2);
    
    // Materiale principale per raggi solari
    const sunRayMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uSunColor: { value: new THREE.Color(0x88ccff) },
            uIntensity: { value: 0.8 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        },
        vertexShader: sunRayVertexShader,
        fragmentShader: sunRayFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // Crea raggi principali
    for(let i = 0; i < 3; i++) {
        const ray = new THREE.Mesh(rayGeometry, sunRayMaterial.clone());
        
        ray.position.x = (i - 1) * 0.4;
        ray.position.y = 0.3;
        ray.position.z = -0.5;
        
        ray.scale.set(0.8, 1.2, 1);
        ray.rotation.z = (i - 1) * 0.1;
        
        ray.userData = {
            type: 'sunray',
            moveSpeed: 0.3 + Math.random() * 0.2,
            baseIntensity: 0.6 + Math.random() * 0.4,
            layer: i
        };
        
        overlayScene.add(ray);
    }

    const secondaryVertexShader = `
        precision highp float;
        precision highp int;
        
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const secondaryFragmentShader = `
        precision highp float;
        precision highp int;
        
        uniform float uTime;
        uniform vec3 uSunColor;
        
        varying vec2 vUv;
        
        void main() {
            // Semplice gradiente orizzontale per raggi secondari
            float gradient = 1.0 - abs(vUv.x - 0.5) * 2.0;
            gradient = pow(gradient, 1.5);
            
            // Movimento molto sottile
            float movement = sin(uTime * 0.1 + vUv.y * 2.0) * 0.1;
            gradient += movement;
            
            gradient = clamp(gradient, 0.0, 1.0);
            
            vec3 color = uSunColor * gradient * 0.3;
            float alpha = gradient * 0.2;
            
            gl_FragColor = vec4(color, alpha);
        }
    `;
    const secondaryMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uSunColor: { value: new THREE.Color(0x4488bb) } // Blu più tenue
        },
        vertexShader: secondaryVertexShader,
        fragmentShader: secondaryFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // Crea alcuni raggi secondari
    for(let i = 0; i < 5; i++) {
        const ray = new THREE.Mesh(rayGeometry, secondaryMaterial.clone());
        
        // Posizioni casuali nella parte superiore
        ray.position.x = (Math.random() - 0.5) * 3;
        ray.position.y = 0.5 + Math.random() * 0.3;
        ray.position.z = -0.2 - Math.random() * 0.5;
        
        // Scala variabile
        const scale = 0.3 + Math.random() * 0.4;
        ray.scale.set(scale, scale * 1.5, 1);
        
        // Rotazione casuale
        ray.rotation.z = Math.random() * Math.PI * 0.2;
        
        ray.userData = {
            type: 'secondary-sunray',
            speed: 0.5 + Math.random() * 0.5
        };
        
        overlayScene.add(ray);
    }
    
    console.log('Secondary sun rays created for added realism');
}

// Animazione dell'overlay ottimizzata
function animateOverlay() {
    requestAnimationFrame(animateOverlay);
    
    overlayTime += 0.016; // ~60 FPS
    
    // Anima tutti gli effetti visivi migliorati
    overlayScene.children.forEach(child => {
        // Animate underwater particles
        if (child.userData && child.userData.type === 'underwater-particles') {
            const positions = child.geometry.attributes.position.array;
            const speeds = child.geometry.attributes.speed.array;
            
            for (let i = 0; i < positions.length / 3; i++) {
                // Gentle floating motion
                positions[i * 3] += Math.sin(overlayTime * speeds[i] + i) * 0.001;
                positions[i * 3 + 1] += Math.cos(overlayTime * speeds[i] * 0.7 + i) * 0.0015;
                
                // Wrap around boundaries
                if (positions[i * 3] > 1.5) positions[i * 3] = -1.5;
                if (positions[i * 3] < -1.5) positions[i * 3] = 1.5;
                if (positions[i * 3 + 1] > 1.5) positions[i * 3 + 1] = -1.5;
                if (positions[i * 3 + 1] < -1.5) positions[i * 3 + 1] = 1.5;
            }
            
            child.geometry.attributes.position.needsUpdate = true;
        }
        
        // Animate bubbles (sprites)
        if (child.userData && child.userData.speed !== undefined && child.isSprite) {
            // Move bubble upward
            child.position.y += child.userData.speed * 0.016;
            
            // Add wobble effect
            child.position.x = child.userData.initialX + Math.sin(overlayTime * child.userData.wobbleSpeed) * child.userData.wobbleAmount;
            
            // Reset bubble when it goes off screen
            if (child.position.y > 1.2) {
                child.position.y = -1.2;
                child.position.x = (Math.random() - 0.5) * 4; // Reset across full width
                child.userData.initialX = child.position.x;
            }
        }
        
        // Skip sun rays animation - removed
    });
    
    // Renderizza l'overlay solo se necessario
    if (overlayRenderer && overlayScene && overlayCamera) {
        overlayRenderer.clear(); // Pulisci il buffer prima di renderizzare
        overlayRenderer.render(overlayScene, overlayCamera);
    }
}

// Resize handler
function onOverlayResize() {
    const aspect = window.innerWidth / window.innerHeight;
    overlayCamera.left = -1 * aspect;
    overlayCamera.right = 1 * aspect;
    overlayCamera.updateProjectionMatrix();
    overlayRenderer.setSize(window.innerWidth, window.innerHeight);
}

// Inizializza quando il DOM è caricato
document.addEventListener('DOMContentLoaded', () => {
    initUnderwaterOverlay();
    window.addEventListener('resize', onOverlayResize);
});

export { initUnderwaterOverlay, onOverlayResize };
