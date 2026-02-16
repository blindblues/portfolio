import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, useTexture, Float, AdaptiveDpr, Preload } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const BASE_PATH = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, "");

function SceneSetup() {
    const { scene, camera } = useThree();
    // Using WebP for environment map (much lighter than PNG)
    const texture = useTexture(`${BASE_PATH}/3d/environment.webp`);

    useEffect(() => {
        if (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;
            scene.environment = texture;
            scene.background = new THREE.Color('#000000');
        }
    }, [texture, scene]);

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // Initial position
        camera.position.set(0, 0, 1.5);

        // Zoom out animation - tuned for performance
        gsap.to(camera.position, {
            z: isMobile ? 60 : 80,
            duration: isMobile ? 3.5 : 4.5,
            ease: "power2.inOut",
            delay: 0.1,
            onUpdate: () => {
                camera.updateProjectionMatrix();
            }
        });
    }, [camera]);

    return null;
}

function Model({ url }: { url: string }) {
    const { scene, animations } = useGLTF(`${BASE_PATH}${url}`);
    const { actions } = useAnimations(animations, scene);

    useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Performance: Shadows are expensive on mobile
                child.castShadow = false;
                child.receiveShadow = false;

                if (child.material) {
                    if ('envMapIntensity' in child.material) {
                        child.material.envMapIntensity = 1;
                    }
                    if ('roughness' in child.material) {
                        child.material.roughness = Math.max(child.material.roughness, 0.12);
                    }
                }
            }
        });

        if (animations.length > 0) {
            const action = actions[Object.keys(actions)[0]];
            if (action) {
                action.reset().fadeIn(0.5).play();
            }
        }
    }, [actions, animations, scene]);

    return <primitive object={scene} scale={2} position={[0, -1, 0]} />;
}

export default function Scene3D() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: 'black', position: 'fixed', top: 0, left: 0, touchAction: 'none' }}>
            <Suspense fallback={null}>
                <Canvas
                    flat // Slightly faster rendering
                    dpr={[1, 2]} // Performance: limit pixel ratio for high-density screens
                    camera={{ position: [0, 0, 1.5], fov: 45 }}
                    gl={{
                        antialias: true,
                        powerPreference: "high-performance",
                        stencil: false,
                        depth: true
                    }}
                >
                    <AdaptiveDpr pixelated /> {/* Performance: Lowers resolution during heavy interaction */}
                    <SceneSetup />

                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />

                    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.4}>
                        <Model url="/3d/Blowed.glb" />
                    </Float>

                    <OrbitControls
                        enablePan={false}
                        enableZoom={true}
                        makeDefault
                        rotateSpeed={0.7}
                    />
                    <Preload all />
                </Canvas>
            </Suspense>
        </div>
    );
}
