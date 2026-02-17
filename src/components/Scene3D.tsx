import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, useTexture, Float, AdaptiveDpr, Preload } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

const BASE_PATH = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, "");

function SceneSetup() {
    const { scene, camera } = useThree();
    const texture = useTexture(`${BASE_PATH}/3d/environment.webp`);

    useEffect(() => {
        if (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;
            scene.environment = texture;
        }
    }, [texture, scene]);

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // Ensure initial position is consistent
        camera.position.set(0, 0, 2);
        camera.lookAt(0, 0, 0);

        const tl = gsap.timeline({ delay: 0.2 });

        // 1. Camera zoom out
        tl.to(camera.position, {
            z: isMobile ? 60 : 80,
            duration: 4.5,
            ease: "power2.inOut",
        });

        // 2. Model moves up and scales down after camera animation
        // We target the scene in the Model component using a custom event or shared state
        // But since we want it polished, let's use a timeline that can be coordinated.
    }, [camera]);

    return null;
}

function Model({ url, isLoaded }: { url: string, isLoaded: boolean }) {
    const { scene, animations } = useGLTF(`${BASE_PATH}${url}`);
    const { actions } = useAnimations(animations, scene);
    const modelRef = useRef<THREE.Group>(null!);

    useEffect(() => {
        // Reset scene rotation and position to a known state
        scene.rotation.set(0, 0, 0);
        scene.position.set(0, -1, 0);
        scene.scale.set(2, 2, 2);

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = false;
                child.receiveShadow = false;
                if (child.material) {
                    // Inject blue glow into the material
                    if ('envMapIntensity' in child.material) child.material.envMapIntensity = 2;
                    if ('roughness' in child.material) child.material.roughness = Math.max(child.material.roughness, 0.1);
                    if ('emissive' in child.material) {
                        child.material.emissive = new THREE.Color('#0033ff');
                        child.material.emissiveIntensity = 1.5;
                    }
                }
            }
        });

        if (animations.length > 0) {
            const action = actions[Object.keys(actions)[0]];
            if (action) action.reset().play();
        }
    }, [actions, animations, scene]);

    // Removed secondary animation logic as requested.


    return <primitive object={scene} />;
}

function LoadedTrigger({ onLoaded }: { onLoaded: () => void }) {
    useEffect(() => {
        onLoaded();
    }, [onLoaded]);
    return null;
}

export default function Scene3D() {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isLoaded && overlayRef.current) {
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 1.2,
                ease: "power2.out",
                delay: 0.1,
                onComplete: () => {
                    if (overlayRef.current) {
                        overlayRef.current.style.display = 'none';
                    }
                }
            });
        }
    }, [isLoaded]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
            pointerEvents: 'auto',
            cursor: 'pointer'
        }}>
            <div
                ref={overlayRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'black',
                    zIndex: 100,
                    pointerEvents: 'none'
                }}
            />
            <Suspense fallback={null}>
                <Canvas
                    flat
                    dpr={[1, 1.5]}
                    camera={{ position: [0, 0, 2], fov: 45 }}
                    gl={{
                        antialias: false, // Performance better with postprocessing
                        powerPreference: "high-performance",
                        alpha: true,
                        stencil: false,
                        depth: true,
                    }}
                >
                    <AdaptiveDpr pixelated />
                    <SceneSetup />

                    <ambientLight intensity={0.2} color="#001144" />
                    <pointLight position={[10, 15, 10]} intensity={200} color="#0066ff" />
                    <pointLight position={[-10, -15, -10]} intensity={100} color="#0033ff" />
                    <spotLight position={[0, 40, 0]} intensity={500} color="#0099ff" distance={100} angle={0.5} />

                    <Float speed={2} rotationIntensity={0} floatIntensity={0.5} rotation={[0, 0, 0]}>
                        <Model url="/3d/Blowed2.glb" isLoaded={isLoaded} />
                    </Float>

                    <EffectComposer>
                        <Bloom
                            luminanceThreshold={0.2}
                            mipmapBlur
                            intensity={1.2}
                            radius={0.4}
                        />
                    </EffectComposer>

                    <LoadedTrigger onLoaded={() => setIsLoaded(true)} />

                    <Preload all />
                </Canvas>
            </Suspense>
        </div>
    );
}
