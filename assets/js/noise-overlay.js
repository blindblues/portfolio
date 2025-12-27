import * as THREE from 'three';

// Variabili globali per il noise overlay
let noiseScene, noiseCamera, noiseRenderer;
let noiseMaterial;
let isInitialized = false;

// Shader per rumore e contrasto
const noiseVertexShader = `
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

const noiseFragmentShader = `
    uniform float uTime;
    uniform float uNoiseIntensity;
    uniform float uContrast;
    uniform vec2 uResolution;
    
    varying vec2 vUv;
    
    // Funzione noise pseudo-random
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    // Noise function più fluida
    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        
        vec2 u = f * f * (3.0 - 2.0 * f);
        
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    // Fractal noise per più dettaglio
    float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 0.0;
        
        for (int i = 0; i < 4; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
        }
        
        return value;
    }
    
    void main() {
        vec2 uv = vUv;
        
        // Crea noise non uniforme con diverse scale in diverse zone
        vec2 noiseCoord1 = uv * 2.0 + uTime * 0.01; // Scala base lenta
        vec2 noiseCoord2 = uv * 5.0 + uTime * 0.015; // Scala media
        vec2 noiseCoord3 = uv * 8.0 + uTime * 0.02; // Scala fine
        
        float noiseValue1 = fbm(noiseCoord1);
        float noiseValue2 = fbm(noiseCoord2);
        float noiseValue3 = fbm(noiseCoord3);
        
        // Variazione spaziale dell'intensità basata sulla posizione
        float spatialVariation = sin(uv.x * 3.14159) * cos(uv.y * 3.14159) * 0.5 + 0.5;
        
        // Combina i tipi di noise con pesi variabili spazialmente
        float combinedNoise = noiseValue1 * (0.3 + spatialVariation * 0.3) + 
                            noiseValue2 * (0.3 + (1.0 - spatialVariation) * 0.2) + 
                            noiseValue3 * 0.2;
        
        // Aggiungi rumore fine per effetto "grain" con variazione spaziale
        float fineGrain = random(uv * 150.0 + uTime * 0.2);
        float fineGrain2 = random(uv * 80.0 + uTime * 0.15);
        
        // Combina i grain con variazione spaziale
        float combinedGrain = mix(fineGrain, fineGrain2, spatialVariation);
        combinedNoise = combinedNoise * 0.7 + combinedGrain * 0.3;
        
        // Applica contrasto con variazione spaziale
        float spatialContrast = 1.5 + spatialVariation * 1.0;
        float contrasted = (combinedNoise - 0.5) * uContrast * spatialContrast + 0.5;
        contrasted = clamp(contrasted, 0.0, 1.0);
        
        // Intensità del noise con variazione spaziale
        float spatialIntensity = 0.8 + spatialVariation * 0.8;
        float finalNoise = contrasted * uNoiseIntensity * spatialIntensity;
        
        // Crea effetto di disturbo con variazioni temporali e spaziali
        float glitch1 = sin(uTime * 1.5 + uv.x * 2.0) * 0.5 + 0.5;
        float glitch2 = cos(uTime * 1.2 + uv.y * 1.5) * 0.5 + 0.5;
        float spatialGlitch = mix(glitch1, glitch2, uv.x);
        finalNoise *= (0.7 + spatialGlitch * 0.5);
        
        // Colore del noise con leggera variazione tonale spaziale
        vec3 baseColor = vec3(finalNoise);
        vec3 colorShift = vec3(
            sin(uv.x * 2.0 + uTime * 0.1) * 0.05,
            cos(uv.y * 2.0 + uTime * 0.1) * 0.05,
            sin((uv.x + uv.y) * 1.5 + uTime * 0.1) * 0.05
        );
        vec3 noiseColor = baseColor + colorShift;
        
        // Alpha trasparente per sovrapposizione con variazione spaziale
        float alpha = finalNoise * (0.6 + spatialVariation * 0.3);
        
        gl_FragColor = vec4(noiseColor, alpha);
    }
`;

function initNoiseOverlay() {
    if (isInitialized) return;
    
    // Crea la scena per il noise
    noiseScene = new THREE.Scene();
    
    // Camera ortografica per coprire tutto lo schermo
    noiseCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Renderer dedicato per il noise
    const canvas = document.getElementById('noise-canvas');
    if (!canvas) {
        console.error('Canvas noise-canvas non trovato');
        return;
    }
    
    noiseRenderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: false,
        alpha: true 
    });
    noiseRenderer.setSize(window.innerWidth, window.innerHeight);
    noiseRenderer.setPixelRatio(1); // Non serve pixel ratio alto per il noise
    
    // Crea il materiale con shader
    noiseMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uNoiseIntensity: { value: 2.0 }, // Aumentato per compensare overlay
            uContrast: { value: 2.0 }, // Contrasto bilanciato
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        },
        vertexShader: noiseVertexShader,
        fragmentShader: noiseFragmentShader,
        transparent: true, // Riabilitato trasparenza per effetto overlay
        depthTest: false,
        depthWrite: false
    });
    
    // Crea un piano che copre tutto lo schermo
    const geometry = new THREE.PlaneGeometry(2, 2);
    const noiseMesh = new THREE.Mesh(geometry, noiseMaterial);
    noiseScene.add(noiseMesh);
    
    isInitialized = true;
    console.log('Noise overlay inizializzato');
}

function animateNoiseOverlay() {
    if (!isInitialized) return;
    
    requestAnimationFrame(animateNoiseOverlay);
    
    // Aggiorna il tempo per l'animazione
    if (noiseMaterial && noiseMaterial.uniforms.uTime) {
        noiseMaterial.uniforms.uTime.value = performance.now() * 0.001;
    }
    
    // Render del noise overlay
    noiseRenderer.render(noiseScene, noiseCamera);
}

function handleNoiseResize() {
    if (!noiseRenderer || !noiseCamera) return;
    
    noiseRenderer.setSize(window.innerWidth, window.innerHeight);
    
    // Aggiorna camera ortografica
    const aspect = window.innerWidth / window.innerHeight;
    noiseCamera.left = -aspect;
    noiseCamera.right = aspect;
    noiseCamera.updateProjectionMatrix();
    
    // Aggiungi uniform resolution se presente
    if (noiseMaterial && noiseMaterial.uniforms.uResolution) {
        noiseMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }
}

// Funzioni pubbliche per controllo
window.setNoiseIntensity = function(intensity) {
    if (noiseMaterial && noiseMaterial.uniforms.uNoiseIntensity) {
        noiseMaterial.uniforms.uNoiseIntensity.value = Math.max(0, Math.min(1, intensity));
    }
};

window.setNoiseContrast = function(contrast) {
    if (noiseMaterial && noiseMaterial.uniforms.uContrast) {
        noiseMaterial.uniforms.uContrast.value = Math.max(0.5, Math.min(3, contrast));
    }
};

window.toggleNoise = function(enabled) {
    if (noiseRenderer) {
        noiseRenderer.domElement.style.display = enabled ? 'block' : 'none';
    }
};

// Inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initNoiseOverlay();
        animateNoiseOverlay();
    }, 100); // Piccolo ritardo per assicurarsi che il canvas sia disponibile
});

// Gestione resize
window.addEventListener('resize', handleNoiseResize);

// Esporta funzioni per debugging
window.noiseOverlay = {
    init: initNoiseOverlay,
    setIntensity: window.setNoiseIntensity,
    setContrast: window.setNoiseContrast,
    toggle: window.toggleNoise
};
