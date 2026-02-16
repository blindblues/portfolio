import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, useTexture, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

function SceneSetup() {
    const { scene, camera } = useThree();
    const texture = useTexture(`${BASE_PATH}/3d/environment.png`);

    useEffect(() => {
        if (texture) {
            // Force Equirectangular mapping for lighting
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;

            scene.environment = texture;
            scene.background = new THREE.Color('#000000');
        }
    }, [texture, scene]);

    useEffect(() => {
        // Camera Intro Animation
        // Start very close
        camera.position.set(0, 0, 1.5);

        // Zoom out smoothly - making the object much smaller
        gsap.to(camera.position, {
            z: 80, // Increased distance for a deeper zoom out
            duration: 4.5, // Slightly longer duration for the longer trip
            ease: "power2.inOut",
            delay: 0.2
        });
    }, [texture, scene, camera]);

    return null;
}

function Model({ url }: { url: string }) {
    const { scene, animations } = useGLTF(`${BASE_PATH}${url}`);
    const { actions } = useAnimations(animations, scene);

    useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;

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
        <div style={{ width: '100vw', height: '100vh', background: 'black', position: 'fixed', top: 0, left: 0 }}>
            {/* Removed the loading text fallback */}
            <Suspense fallback={null}>
                <Canvas shadows camera={{ position: [0, 0, 1.5], fov: 45 }}>
                    <SceneSetup />

                    <ambientLight intensity={0.4} />
                    <pointLight position={[10, 10, 10]} intensity={0.8} />

                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <Model url="/3d/Blowed.glb" />
                    </Float>

                    <OrbitControls
                        enablePan={false}
                        enableZoom={true}
                        makeDefault
                    />
                </Canvas>
            </Suspense>
        </div>
    );
}
