import React, { Suspense, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, useTexture, Float, AdaptiveDpr, Preload } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const BASE_PATH = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, "");

function SceneSetup() {
    const { scene, camera, gl } = useThree();
    const texture = useTexture(`${BASE_PATH}/3d/environment.png`);

    useEffect(() => {
        if (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            // Optimization: lower resolution for environment reflection on mobile if possible
            // but here we just ensure basic settings
            texture.needsUpdate = true;

            scene.environment = texture;
            scene.background = new THREE.Color('#000000');
        }
    }, [texture, scene]);

    useEffect(() => {
        // Detect mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // Camera Intro Animation
        camera.position.set(0, 0, 1.5);

        gsap.to(camera.position, {
            z: isMobile ? 60 : 80, // Slightly less distance on mobile to maintain detail
            duration: isMobile ? 3.5 : 4.5, // Faster on mobile for better perceived performance
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
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = false; // Disable shadows for mobile performance
                child.receiveShadow = false;

                if (child.material) {
                    // Keep your preferred look but ensure it's not too heavy
                    if ('envMapIntensity' in child.material) {
                        child.material.envMapIntensity = 1;
                    }
                    if ('roughness' in child.material) {
                        child.material.roughness = Math.max(child.material.roughness, 0.12);
                    }

                    // Optimization: Disable expensive metalness/shininess if needed, 
                    // but we'll try keeping it first.
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
                    dpr={[1, 2]} // Performance: Limit pixel ratio
                    camera={{ position: [0, 0, 1.5], fov: 45 }}
                    gl={{
                        antialias: true,
                        powerPreference: "high-performance",
                        alpha: false,
                        stencil: false,
                        depth: true
                    }}
                >
                    <AdaptiveDpr pixelated /> {/* Performance: Lowers resolution during movement */}
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
