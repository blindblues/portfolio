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
    
    // Crea i raggi solari subacquei
    createSunRays();
    
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
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vDepth;
        
        void main() {
            vUv = uv;
            vPosition = position;
            vDepth = position.y; // Profondità per sfumatura
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const sunRayFragmentShader = `
        uniform float uTime;
        uniform vec3 uSunColor;
        uniform float uIntensity;
        uniform vec2 uResolution;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vDepth;
        
        // Noise function per movimento organico
        float noise(vec2 p) {
            return sin(p.x * 10.0) * sin(p.y * 10.0);
        }
        
        // Funzione per creare pattern di raggi solari
        float sunRayPattern(vec2 uv, float time) {
            float rays = 0.0;
            
            // Crea più raggi con posizioni e movimenti diversi
            for(int i = 0; i < 8; i++) {
                // Posizione radiale del raggio
                float angle = float(i) * 0.785398; // 45 gradi in radianti
                vec2 rayDir = vec2(cos(angle), sin(angle));
                
                // Sposta il raggio in modo organico
                vec2 offset = vec2(
                    sin(time * 0.3 + float(i)) * 0.1,
                    cos(time * 0.2 + float(i) * 1.5) * 0.05
                );
                
                // Calcola la distanza dal centro del raggio
                vec2 rayPos = uv - 0.5 - offset;
                float rayDistance = abs(dot(rayPos, rayDir));
                
                // Intensità del raggio con sfumatura morbida
                float rayIntensity = 1.0 / (1.0 + rayDistance * 15.0);
                
                // Modula con noise per effetto realistico
                rayIntensity *= (0.8 + 0.8 * noise(uv * 2.0 + time * 0.1));
                
                // Aggiungi solo se nella giusta posizione verticale (raggi dall'alto)
                if(uv.y < 0.7) {
                    rays += rayIntensity * (0.7 - uv.y); // Più intensi in alto
                }
            }
            
            return rays;
        }
        
        void main() {
            // Pattern dei raggi solari animati
            float rays = sunRayPattern(vUv, uTime);
            
            // Colore del sole caldo e realistico
            vec3 sunColor = uSunColor;
            
            // Effetto di profondità - i raggi si indeboliscono scendendo
            float depthFade = 1.0 - vDepth * 0.5;
            depthFade = clamp(depthFade, 0.3, 1.0);
            
            // Intensità finale con sfumatura
            float finalIntensity = rays * uIntensity * depthFade;
            
            // Effetto di blur/sfocatura simulato con gradiente
            vec2 center = vec2(0.7, 0.5);
            float distToCenter = distance(vUv, center);
            float blur = 1.0 - smoothstep(0.0, 0.8, distToCenter);
            
            // Colore finale con effetto sfocato
            vec3 finalColor = sunColor * finalIntensity * blur;
            
            // Alpha trasparente con sfumatura
            float alpha = finalIntensity * 0.1; // Aumentato da 0.08 a 0.12
            
            gl_FragColor = vec4(finalColor, alpha);
        }
    `;
    
    // Crea geometria per i raggi solari (grande piano che copre lo schermo)
    const rayGeometry = new THREE.PlaneGeometry(4, 4);
    
    // Materiale shader per i raggi solari
    const sunRayMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uSunColor: { value: new THREE.Color(0x6699cc) }, // Blu subacqueo
            uIntensity: { value: 0.6 }, // Aumentato da 0.4 a 0.6
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        },
        vertexShader: sunRayVertexShader,
        fragmentShader: sunRayFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending, // Blending additivo per effetto luminoso
        depthWrite: false,
        side: THREE.DoubleSide
    });
    
    // Crea più layer di raggi per profondità
    for(let i = 0; i < 3; i++) {
        const rayMesh = new THREE.Mesh(rayGeometry, sunRayMaterial.clone());
        
        // Posiziona i layer a diverse profondità
        rayMesh.position.z = -0.5 - i * 0.3;
        
        // Scala e rotazione leggermente diverse per ogni layer
        const scale = 1.0 + i * 0.2;
        rayMesh.scale.set(scale, scale, 1);
        
        // Rotazione leggera per movimento organico
        rayMesh.rotation.z = (i - 1) * 0.05;
        
        // Aggiungi dati per animazione
        rayMesh.userData = {
            type: 'sunray',
            layer: i,
            baseIntensity: 0.6 - i * 0.15, // Aumentato da 0.4 a 0.6
            moveSpeed: 0.3 + i * 0.1
        };
        
        overlayScene.add(rayMesh);
    }
    
    // Crea raggi secondari più sottili per dettaglio
    createSecondarySunRays();
    
    console.log('Underwater sun rays created with volumetric effect');
}

// Crea raggi solari secondari per maggiore realismo
function createSecondarySunRays() {
    const rayGeometry = new THREE.PlaneGeometry(2, 3);
    
    // Shader più semplice per raggi secondari
    const secondaryVertexShader = `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const secondaryFragmentShader = `
        uniform float uTime;
        uniform vec3 uSunColor;
        
        varying vec2 vUv;
        
        void main() {
            // Raggi più sottili e mobili
            vec2 center = vec2(0.5, 0.2);
            float dist = distance(vUv, center);
            
            // Movimento ondulato
            float wave = sin(vUv.x * 20.0 + uTime * 2.0) * 0.02;
            float intensity = 1.0 / (1.0 + (dist + wave) * 25.0);
            
            // Solo nella parte superiore
            intensity *= smoothstep(0.7, 0.0, vUv.y);
            
            vec3 color = uSunColor * intensity * 0.12; // Aumentato da 0.08 a 0.12
            float alpha = intensity * 0.06; // Aumentato da 0.04 a 0.06
            
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
        
        // Animate sun rays
        if (child.userData && child.userData.type === 'sunray' && child.material && child.material.uniforms) {
            // Aggiorna il tempo uniform per animazione shader
            if (child.material.uniforms.uTime) {
                child.material.uniforms.uTime.value = overlayTime * child.userData.moveSpeed;
            }
            
            // Aggiorna l'intensità con pulsazione delicata
            if (child.material.uniforms.uIntensity) {
                const pulse = Math.sin(overlayTime * 0.5 + child.userData.layer) * 0.2 + 1.0;
                child.material.uniforms.uIntensity.value = child.userData.baseIntensity * pulse;
            }
            
            // Movimento leggero dei raggi per effetto organico
            child.position.x = Math.sin(overlayTime * 0.1 + child.userData.layer) * 0.05;
        }
        
        // Animate secondary sun rays
        if (child.userData && child.userData.type === 'secondary-sunray' && child.material && child.material.uniforms) {
            // Aggiorna tempo per raggi secondari
            if (child.material.uniforms.uTime) {
                child.material.uniforms.uTime.value = overlayTime * child.userData.speed;
            }
            
            // Movimento ondulato
            child.position.x += Math.sin(overlayTime * 2.0 + child.userData.speed) * 0.001;
            child.rotation.z += Math.cos(overlayTime * 1.5) * 0.0001;
        }
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
