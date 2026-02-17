import React, { useState, useEffect, useRef, useLayoutEffect, Suspense } from 'react';
import { X } from 'lucide-react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, useTexture, AdaptiveDpr, Preload } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

const BASE_PATH = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, "");

function MiniModel({ scrollProgress }: { scrollProgress: number }) {
    const { scene, animations } = useGLTF(`${BASE_PATH}/3d/Blowed2.glb`);
    // Use useMemo to clone the scene so this instance is independent from the intro
    const clonedScene = React.useMemo(() => scene.clone(), [scene]);
    const { actions } = useAnimations(animations, clonedScene);
    const { scene: canvasScene } = useThree();
    const envTexture = useTexture(`${BASE_PATH}/3d/environment.webp`);

    useEffect(() => {
        if (envTexture) {
            envTexture.mapping = THREE.EquirectangularReflectionMapping;
            canvasScene.environment = envTexture;
        }
    }, [envTexture, canvasScene]);

    useEffect(() => {
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = false;
                child.receiveShadow = false;
                if (child.material) {
                    const mat = child.material as THREE.MeshStandardMaterial;
                    if ('envMapIntensity' in mat) mat.envMapIntensity = 2;
                    if ('roughness' in mat) mat.roughness = Math.max(mat.roughness, 0.1);
                    if ('emissive' in mat) {
                        mat.emissive = new THREE.Color('#0033ff');
                        mat.emissiveIntensity = 1.5;
                    }
                }
            }
        });

        if (animations.length > 0) {
            const firstAction = actions[Object.keys(actions)[0]];
            if (firstAction) {
                firstAction.reset().fadeIn(0.5).play();
            }
        }
    }, [actions, animations, clonedScene]);

    const modelRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (modelRef.current) {
            // Calculate target scale based on scrollProgress (0 to 1)
            // Now shrinks from 1.4 to 1.1 (instead of 0.8) to stay more visible
            const target = 1.4 - (scrollProgress * 0.3);
            // Secondary lerp for extra smoothness
            const s = THREE.MathUtils.lerp(modelRef.current.scale.x, target, 0.1);
            modelRef.current.scale.set(s, s, s);
        }
    });

    return <primitive ref={modelRef} object={clonedScene} position={[0, -1, 0]} />;
}


// --- MAIN PORTFOLIO CONTENT ---

const graphicDesignImages = [
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-[500px]', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-80', src: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-[400px]', src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-80', src: 'https://images.unsplash.com/photo-1620912189865-1e8a33da4c5e?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1561070791-26c117379a6d?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-[450px]', src: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1550684847-75bdda21cc95?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1576153192621-7a3be10b356e?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-80', src: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800' },
];

const logoDesignImages = [
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1626785774573-4b799314386f?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-80', src: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-[450px]', src: 'https://images.unsplash.com/photo-1614850523018-8f69b5f543fe?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1629197520635-16bf90ba1022?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1560155823-1eb5a1010921?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-80', src: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1516641396056-0ce60a85d49f?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-80', src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800' },
];

const webDesignImages = [
    { h: 'h-[400px]', src: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-80', src: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-[500px]', src: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-80', src: 'https://images.unsplash.com/photo-1508921340878-ba53e1f016ec?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-[450px]', src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&q=80&w=800' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&q=80&w=800' },
];

export default function PortfolioContent() {
    const [activeTab, setActiveTab] = useState('GRAPHIC DESIGN');
    const categories = ['GRAPHIC DESIGN', 'LOGO DESIGN', 'WEB DESIGN'];

    const getImagesForTab = () => {
        switch (activeTab) {
            case 'GRAPHIC DESIGN': return graphicDesignImages;
            case 'LOGO DESIGN': return logoDesignImages;
            case 'WEB DESIGN': return webDesignImages;
            default: return graphicDesignImages;
        }
    };

    const currentImages = getImagesForTab();

    const [isVisible, setIsVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<typeof graphicDesignImages[0] | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const modalContainerRef = useRef<HTMLDivElement>(null);
    const lightRef = useRef<HTMLDivElement>(null);
    const touchStartPos = useRef({ x: 0, y: 0 });
    const isTouchRef = useRef(false);
    const isInitialLoad = useRef(true);
    const tabsRef = useRef<HTMLElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 1000);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
            setWindowWidth(window.innerWidth);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsScrolled(scrollY > 50);

            // Ensure exact 0 when at top
            if (scrollY === 0) {
                setScrollProgress(0);
                return;
            }

            // Progress from 0 to 1 over 300px with smooth precision
            const progress = Math.min(Math.max(scrollY / 300, 0), 1);
            setScrollProgress(progress);
        };
        // Add passive listener for better scroll performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);



    const headerRef = useRef<HTMLElement>(null);

    // Animation for Header
    useLayoutEffect(() => {
        if (!isVisible || !headerRef.current) return;
        gsap.fromTo(headerRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0 }
        );
    }, [isVisible]);

    // Animation for Tabs
    useLayoutEffect(() => {
        if (!isVisible || !tabsRef.current) return;
        gsap.fromTo(tabsRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0 }
        );
    }, [isVisible]);

    // Entrance Animation for Grid
    useLayoutEffect(() => {
        if (!isVisible) return;
        const ctx = gsap.context(() => {
            const items = gsap.utils.toArray('.grid-item');
            gsap.fromTo(items,
                { y: 50, opacity: 0 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    delay: 0,
                    overwrite: true
                }
            );
            isInitialLoad.current = false;
        }, containerRef);
        return () => ctx.revert();
    }, [isVisible, activeTab]);

    useEffect(() => {
        const handleStart = () => setIsVisible(true);
        window.addEventListener('modelMoveUpStart', handleStart);
        const timer = setTimeout(() => { if (!isVisible) handleStart(); }, 6000);
        return () => {
            window.removeEventListener('modelMoveUpStart', handleStart);
            clearTimeout(timer);
        };
    }, [isVisible]);

    // 3D Tilt Logic for Modal
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!modalContainerRef.current || isTouchRef.current) return;
        const xPct = (e.clientX / window.innerWidth) - 0.5;
        const yPct = (e.clientY / window.innerHeight) - 0.5;

        gsap.to(modalContainerRef.current, {
            rotationY: xPct * 15,
            rotationX: -yPct * 15,
            scale: 1.05,
            duration: 0.5,
            ease: "power2.out",
            transformPerspective: 1000,
            transformOrigin: "center"
        });

        if (lightRef.current) {
            const rect = modalContainerRef.current.getBoundingClientRect();
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;
            lightRef.current.style.background = `radial-gradient(circle 400px at ${localX}px ${localY}px, rgba(255,255,255,0.4), transparent 100%)`;
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        isTouchRef.current = true;
        const touch = e.touches[0];
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!modalContainerRef.current) return;
        const touch = e.touches[0];
        const deltaX = (touch.clientX - touchStartPos.current.x) / window.innerWidth;
        const deltaY = (touch.clientY - touchStartPos.current.y) / window.innerHeight;

        gsap.to(modalContainerRef.current, {
            rotationY: deltaX * 45,
            rotationX: -deltaY * 45,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
            transformPerspective: 1000,
            transformOrigin: "center"
        });

        if (lightRef.current) {
            const rect = modalContainerRef.current.getBoundingClientRect();
            const localX = touch.clientX - rect.left;
            const localY = touch.clientY - rect.top;
            lightRef.current.style.background = `radial-gradient(circle 400px at ${localX}px ${localY}px, rgba(255,255,255,0.4), transparent 100%)`;
        }
    };

    const handleMouseLeave = () => {
        if (!modalContainerRef.current) return;
        gsap.to(modalContainerRef.current, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.5, ease: "power2.out" });
        if (lightRef.current) lightRef.current.style.background = 'transparent';
    };

    if (!isVisible) return null;

    return (
        <div ref={containerRef} className="portfolio-content-wrapper w-full bg-black text-white font-sans selection:bg-blue-500/30">
            {/* 1 & 2. FIXED TOP SECTION (Header + Tabs) */}
            <div
                className="fixed top-0 left-0 w-full z-50 pointer-events-none transition-transform duration-300 ease-out"
                style={{ transform: `translateY(-${scrollProgress * 0.8}vh)` }}
            >
                <header
                    ref={headerRef}
                    className="w-full relative flex items-center justify-center transition-all duration-300 ease-out"
                    style={{
                        height: `${30 - (scrollProgress * 15)}vh`
                    }}
                >
                    <div className="w-[50vw] h-[50vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Suspense fallback={null}>
                            <Canvas
                                flat
                                dpr={[1, 1.5]}
                                camera={{ position: [0, 0, 60], fov: 45 }}
                                gl={{
                                    antialias: false,
                                    powerPreference: "high-performance",
                                    alpha: true,
                                }}
                            >
                                <AdaptiveDpr pixelated />

                                <ambientLight intensity={0.2} color="#001144" />
                                <pointLight position={[10, 15, 10]} intensity={200} color="#0066ff" />
                                <pointLight position={[-10, -15, -10]} intensity={100} color="#0033ff" />
                                <spotLight position={[0, 40, 0]} intensity={500} color="#0099ff" distance={100} angle={0.5} />

                                <MiniModel scrollProgress={scrollProgress} />

                                <EffectComposer>
                                    <Bloom
                                        luminanceThreshold={0.2}
                                        mipmapBlur
                                        intensity={1.2}
                                        radius={0.4}
                                    />
                                </EffectComposer>

                                <Preload all />
                            </Canvas>
                        </Suspense>
                    </div>
                </header>

                <nav
                    ref={tabsRef}
                    className="w-full flex justify-center items-center transition-all duration-300 ease-out pb-2"
                    style={{
                        paddingTop: `${1.5 - (scrollProgress * 1)}rem`,
                        marginTop: `0rem`
                    }}
                >
                    <div className={`flex items-center transition-all duration-500 ease-in-out pointer-events-auto rounded-full ${isScrolled
                        ? 'bg-black/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.9)] gap-6 md:gap-10 px-4 py-2'
                        : 'bg-transparent border-transparent shadow-none gap-8 md:gap-14 px-6 py-3'
                        }`}>
                        {categories.map((cat) => (
                            <p
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`cursor-pointer whitespace-nowrap text-[9px] md:text-xs font-black tracking-[0.2em] transition-all duration-300 ${activeTab === cat
                                    ? 'text-white opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                                    : 'text-white/40 hover:text-white/70'
                                    }`}
                            >
                                {cat}
                            </p>
                        ))}
                    </div>
                </nav>
            </div>

            {/* SPACER FOR FIXED HEADER */}
            <div className="h-[32vh]" />

            {/* 3. GRIGLIA IMMAGINI */}
            <section className="w-full px-4 py-12 pb-32">
                <div className="flex flex-row gap-4 mx-auto max-w-[1920px]">
                    {[...Array(windowWidth < 768 ? 2 : 4)].map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className="flex-1 flex flex-col gap-4"
                        >
                            {currentImages
                                .filter((_, i) => i % (windowWidth < 768 ? 2 : 4) === colIndex)
                                .map((img, i) => (
                                    <div
                                        key={`${activeTab}-${colIndex}-${i}`}
                                        className="grid-item relative group overflow-hidden rounded-2xl bg-zinc-900"
                                    >
                                        <img
                                            src={img.src}
                                            alt="Portfolio Work"
                                            className="w-full h-auto object-cover cursor-pointer"
                                            onClick={() => setSelectedImage(img)}
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* MODAL OVERLAY */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-fade-in touch-none"
                    onClick={() => setSelectedImage(null)}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => handleMouseLeave()}
                >
                    <div
                        ref={modalContainerRef}
                        className="relative rounded-lg overflow-hidden shadow-2xl inline-block transform-style-preserve-3d"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            ref={lightRef}
                            className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay transition-opacity duration-200"
                        />
                        <img
                            src={selectedImage.src}
                            alt="Selected Work"
                            className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain block pointer-events-none relative z-10"
                        />
                    </div>

                </div>
            )}
        </div>
    );
}
