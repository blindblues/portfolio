import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, useTexture, Float, AdaptiveDpr, Preload } from '@react-three/drei';
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
            scene.background = new THREE.Color('#000000');
        }
    }, [texture, scene]);

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        camera.position.set(0, 0, 1.5);

        gsap.to(camera.position, {
            z: isMobile ? 60 : 80,
            duration: 4.5,
            ease: "power2.inOut",
            delay: 0.2
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

/**
 * A small component to signal that Suspense has finished loading its children
 */
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
        <div style={{ width: '100vw', height: '100vh', background: 'black', position: 'fixed', top: 0, left: 0, touchAction: 'none' }}>
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
                    camera={{ position: [0, 0, 1.5], fov: 45 }}
                    gl={{
                        antialias: true,
                        powerPreference: "high-performance",
                        alpha: false,
                        stencil: false,
                        depth: true,
                    }}
                >
                    <AdaptiveDpr pixelated />
                    <SceneSetup />

                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />

                    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.4}>
                        <Model url="/3d/Blowed2.glb" />
                    </Float>

                    <LoadedTrigger onLoaded={() => setIsLoaded(true)} />

                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        enableRotate={false}
                        makeDefault
                    />
                    <Preload all />
                </Canvas>
            </Suspense>
        </div>
    );
}
