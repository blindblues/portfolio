import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, useTexture, Float, AdaptiveDpr, Preload } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const BASE_PATH = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, "");

function SceneSetup() {
    const { scene, camera } = useThree();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Restore original environment map for all devices as requested
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
        // Initial camera close-up
        camera.position.set(0, 0, 1.5);

        gsap.to(camera.position, {
            z: isMobile ? 50 : 80,
            duration: isMobile ? 2.5 : 4.5,
            ease: "power2.out",
            delay: 0.1,
            onUpdate: () => {
                camera.updateProjectionMatrix();
            }
        });
    }, [camera, isMobile]);

    return null;
}

function Model({ url }: { url: string }) {
    const { scene, animations } = useGLTF(`${BASE_PATH}${url}`);
    const { actions } = useAnimations(animations, scene);

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Essential mobile optimizations keeping things lightweight
                child.castShadow = false;
                child.receiveShadow = false;

                if (child.material) {
                    if (isMobile) {
                        child.material.envMapIntensity = 0.6; // Slightly lowered to help mobile shaders
                        child.material.roughness = Math.max(child.material.roughness, 0.15);
                    } else {
                        child.material.envMapIntensity = 1;
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
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    return (
        <div style={{ width: '100vw', height: '100vh', background: 'black', position: 'fixed', top: 0, left: 0, touchAction: 'none' }}>
            <Suspense fallback={null}>
                <Canvas
                    flat
                    dpr={isMobile ? 1 : [1, 2]}
                    camera={{ position: [0, 0, 1.5], fov: 45 }}
                    gl={{
                        antialias: !isMobile,
                        powerPreference: "high-performance",
                        stencil: false,
                        depth: true
                    }}
                >
                    <AdaptiveDpr pixelated />
                    <SceneSetup />

                    <ambientLight intensity={0.5} />

                    <Float
                        speed={isMobile ? 1 : 1.5}
                        rotationIntensity={0.3}
                        floatIntensity={0.3}
                    >
                        <Model url="/3d/Blowed.glb" />
                    </Float>

                    <OrbitControls
                        enablePan={false}
                        enableZoom={true}
                        makeDefault
                    />
                    <Preload all />
                </Canvas>
            </Suspense>
        </div>
    );
}
