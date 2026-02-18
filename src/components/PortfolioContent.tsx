import React, { useState, useEffect, useRef, useLayoutEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, useTexture, AdaptiveDpr, Preload, Center } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

const BASE_PATH = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, "");

const MiniModel = React.memo(function MiniModel({ scrollRef, isMobile }: { scrollRef: React.MutableRefObject<number>, isMobile: boolean }) {
    const { scene, animations } = useGLTF(`${BASE_PATH}/3d/Blowed2.glb`);
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
            // Read mostly current scroll value from ref without re-render
            const progress = scrollRef.current;
            const target = 1.4 - (progress * 0.3);
            const s = THREE.MathUtils.lerp(modelRef.current.scale.x, target, 0.1);
            modelRef.current.scale.set(s, s, s);

            // Move model up slightly when scrolling - Ripristinato come 67ea5ea
            const targetY = -1.8 + (progress * 0.8);
            modelRef.current.position.y = THREE.MathUtils.lerp(modelRef.current.position.y, targetY, 0.1);
        }
    });

    return (
        <primitive
            ref={modelRef}
            object={clonedScene}
            position={[0, -1.8, 0]}
            scale={[1.4, 1.4, 1.4]}
        />
    );
});


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

    const [isVisible, setIsVisible] = useState(true);
    const [selectedImage, setSelectedImage] = useState<typeof graphicDesignImages[0] | null>(null);

    // Reset scroll to top when category changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [activeTab]);
    const containerRef = useRef<HTMLDivElement>(null);
    const modalOverlayRef = useRef<HTMLDivElement>(null);
    const modalContainerRef = useRef<HTMLDivElement>(null);
    const lightRef = useRef<HTMLDivElement>(null);
    const touchStartPos = useRef({ x: 0, y: 0 });
    const isTouchRef = useRef(false);
    const isInitialLoad = useRef(true);
    const headerRef = useRef<HTMLElement>(null);
    const tabsRef = useRef<HTMLElement>(null);
    const blurCircleRef = useRef<HTMLDivElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Breathing animation for the blurred circle
    useLayoutEffect(() => {
        if (!blurCircleRef.current) return;

        // Restore centering from commit 67ea5ea
        gsap.set(blurCircleRef.current, { xPercent: -50, yPercent: -50 });

        gsap.to(blurCircleRef.current, {
            scale: 1.15,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }, []);
    const scrollRef = useRef(0);

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

            // Progress from 0 to 1 over 150px with smooth precision (faster transition)
            const progress = Math.min(Math.max(scrollY / 150, 0), 1);
            setScrollProgress(progress);
            scrollRef.current = progress;
        };
        // Add passive listener for better scroll performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);



    // 3D Tilt Logic for Modal (Desktop)
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!modalContainerRef.current) return;
        // If touch was detected recently, ignore mouse move to prevent conflict
        if (isTouchRef.current) return;

        const xPct = (e.clientX / window.innerWidth) - 0.5;
        const yPct = (e.clientY / window.innerHeight) - 0.5;

        gsap.to(modalContainerRef.current, {
            rotationY: xPct * 15,
            rotationX: -yPct * 15,
            scale: 1.05,
            duration: 0.5,
            ease: "power2.out",
            transformPerspective: 1000,
            transformOrigin: "center",
            force3D: true
        });

        if (lightRef.current) {
            const rect = modalContainerRef.current.getBoundingClientRect();
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;
            lightRef.current.style.background = `radial-gradient(circle 400px at ${localX}px ${localY}px, rgba(255,255,255,0.4), transparent 100%)`;
        }
    };

    const handleMouseLeave = () => {
        if (!modalContainerRef.current) return;
        gsap.to(modalContainerRef.current, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.5, ease: "power2.out" });
        if (lightRef.current) lightRef.current.style.background = 'transparent';

        // Reset touch flag after a delay to allow mouse back
        setTimeout(() => { isTouchRef.current = false; }, 500);
    };

    // Fix for Android touch rotation: Use native listeners to allow e.preventDefault()
    useEffect(() => {
        const overlay = modalOverlayRef.current;
        if (!overlay || !selectedImage) return;

        const handleStart = (e: TouchEvent) => {
            isTouchRef.current = true;
            const touch = e.touches[0];
            touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        };

        const handleMove = (e: TouchEvent) => {
            if (!modalContainerRef.current) return;
            // Crucial for Android: prevent scroll to keep touch events alive
            if (e.cancelable) e.preventDefault();

            const touch = e.touches[0];
            const deltaX = ((touch.clientX - touchStartPos.current.x) / window.innerWidth) * 3;
            const deltaY = ((touch.clientY - touchStartPos.current.y) / window.innerHeight) * 3;

            gsap.to(modalContainerRef.current, {
                rotationY: deltaX * 10,
                rotationX: -deltaY * 10,
                scale: 1, // No scaling on mobile
                duration: 0.1,
                ease: "power1.out",
                transformPerspective: 1000,
                transformOrigin: "center",
                overwrite: "auto",
                force3D: true
            });

            if (lightRef.current) {
                const rect = modalContainerRef.current.getBoundingClientRect();
                const localX = touch.clientX - rect.left;
                const localY = touch.clientY - rect.top;
                lightRef.current.style.background = `radial-gradient(circle 400px at ${localX}px ${localY}px, rgba(255,255,255,0.4), transparent 100%)`;
            }
        };

        const handleEnd = () => {
            handleMouseLeave();
        };

        overlay.addEventListener('touchstart', handleStart, { passive: true });
        overlay.addEventListener('touchmove', handleMove, { passive: false });
        overlay.addEventListener('touchend', handleEnd, { passive: true });

        return () => {
            overlay.removeEventListener('touchstart', handleStart);
            overlay.removeEventListener('touchmove', handleMove);
            overlay.removeEventListener('touchend', handleEnd);
        };
    }, [selectedImage]);

    if (!isVisible) return null;

    return (
        <div ref={containerRef} className="portfolio-content-wrapper w-full bg-black text-white selection:bg-blue-500/30" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
            {/* 1 & 2. FIXED TOP SECTION (Header + Tabs) */}
            <div
                className="fixed top-0 left-0 w-full z-50 pointer-events-none transition-transform duration-300 ease-out"
                style={{ transform: `translateY(-${scrollProgress * 0.8}vh)`, pointerEvents: 'none' }}
            >
                <header
                    ref={headerRef}
                    className="w-full relative flex items-center justify-center transition-all duration-300 ease-out pointer-events-none"
                    style={{
                        height: `${(windowWidth < 768 ? 18 : 30) - (scrollProgress * (windowWidth < 768 ? 3 : 15))}vh`,
                        pointerEvents: 'none'
                    }}
                >
                    <div
                        className="w-full h-[50vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none [&_canvas]:!pointer-events-none"
                        style={{ pointerEvents: 'none' }}
                    >
                        {/* Blurred Circle Background - Position from commit 67ea5ea */}
                        <div
                            ref={blurCircleRef}
                            className="absolute pointer-events-none rounded-full"
                            style={{
                                top: `${53 - (scrollProgress * 1.5)}%`,
                                left: '50%',
                                width: windowWidth < 768 ? '45vh' : '55vh',
                                height: windowWidth < 768 ? '45vh' : '55vh',
                                background: 'transparent',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                maskImage: 'radial-gradient(circle, black 0%, transparent 65%)',
                                WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 65%)',
                                zIndex: 0
                            }}
                        />

                        {/* 3D Model Canvas Wrapper */}
                        <Suspense fallback={null}>
                            <Canvas
                                className="!pointer-events-none"
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

                                <MiniModel scrollRef={scrollRef} isMobile={windowWidth < 768} />

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

            </div>

            <nav
                ref={tabsRef}
                className="fixed left-0 w-full z-[60] flex justify-center items-center pointer-events-none"
                style={{
                    // Match original position: header height + 1.5rem padding, adjusted by scrollProgress
                    top: `calc(${(windowWidth < 768 ? 18 : 30)}vh + 1.5rem - ${(scrollProgress * (windowWidth < 768 ? 4 : 15.8))}vh)`,
                    // Move to bottom: on mobile we stop a bit higher (e.g. 82vh total instead of 90vh) to avoid browser bars
                    transform: `translateY(${scrollProgress * (windowWidth < 768 ? 64 : 78)}vh)`
                }}
            >
                <div
                    className={`flex items-center transition-all duration-500 ease-in-out pointer-events-auto rounded-full ${isScrolled
                        ? 'bg-black/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.9)] gap-6 md:gap-10 px-4 py-2'
                        : 'bg-transparent border-transparent shadow-none gap-8 md:gap-14 px-6 py-3'
                        }`}
                >
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

            {/* SPACER FOR FIXED HEADER */}
            <div className={`transition-[height] duration-300 ${windowWidth < 768 ? 'h-[20vh]' : 'h-[32vh]'}`} />

            {/* 3. GRIGLIA IMMAGINI */}
            <section className="w-full px-4 py-12 pb-40 md:pb-32">
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
                    ref={modalOverlayRef}
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-fade-in touch-none"
                    onClick={() => setSelectedImage(null)}
                    onMouseMove={handleMouseMove}
                >
                    <div
                        ref={modalContainerRef}
                        className="relative rounded-lg overflow-hidden shadow-2xl inline-block touch-none will-change-transform"
                        style={{ transformStyle: 'preserve-3d' }}
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
