import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const graphicDesignImages = [
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1620912189865-1e8a33da4c5e?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-[500px]', src: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-80', src: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-[400px]', src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=800&auto=format&fit=crop' },
];

const logoDesignImages = [
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1626785774573-4b799314386f?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-80', src: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-[450px]', src: 'https://images.unsplash.com/photo-1614850523018-8f69b5f543fe?q=80&w=800&auto=format&fit=crop' },
];

const webDesignImages = [
    { h: 'h-[400px]', src: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-72', src: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-96', src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-64', src: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-80', src: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=800&auto=format&fit=crop' },
    { h: 'h-[500px]', src: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=800&auto=format&fit=crop' },
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

    // Animation for Static UI (Tabs) - Runs once when visible
    useLayoutEffect(() => {
        if (!isVisible || !tabsRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(tabsRef.current,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.5,
                    ease: "power3.out",
                    delay: 1.5,
                    overwrite: true
                }
            );
        });

        return () => ctx.revert();
    }, [isVisible]);

    // Animation for Grid Content - Runs on visibility and tab change
    useLayoutEffect(() => {
        if (!isVisible) return;

        const ctx = gsap.context(() => {
            const items = gsap.utils.toArray('.grid-item');

            // Determine animation params based on whether it's the initial load or a tab switch
            const delay = isInitialLoad.current ? 1.5 : 0;
            const duration = isInitialLoad.current ? 1.5 : 0.6;
            const yStart = isInitialLoad.current ? 300 : 50;
            const stagger = isInitialLoad.current ? 0 : 0.05;

            gsap.fromTo(items,
                { y: yStart, opacity: 0 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: stagger,
                    duration: duration,
                    ease: "power3.out",
                    delay: delay,
                    overwrite: true
                }
            );

            isInitialLoad.current = false;

        }, containerRef);

        return () => ctx.revert();
    }, [isVisible, activeTab]); // Re-run on tab change

    useEffect(() => {
        const handleStart = () => {
            // This handles the INITIAL large animation
            // We might want to set a flag 'hasInitialLoaded' to true
            setIsVisible(true);
        };

        window.addEventListener('modelMoveUpStart', handleStart);

        // Fallback or dev mode safety
        const timer = setTimeout(() => {
            if (!isVisible) handleStart();
        }, 6000);

        return () => {
            window.removeEventListener('modelMoveUpStart', handleStart);
            clearTimeout(timer);
        };
    }, []);

    // 3D Tilt Logic for Modal
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!modalContainerRef.current || isTouchRef.current) return;

        // Calculate tilt based on window position (full screen interactive)
        const xPct = (e.clientX / window.innerWidth) - 0.5;
        const yPct = (e.clientY / window.innerHeight) - 0.5;

        gsap.to(modalContainerRef.current, {
            rotationY: xPct * 15,  // Reduced rotation
            rotationX: -yPct * 15,
            scale: 1.05, // Only scale on non-touch
            duration: 0.5,
            ease: "power2.out",
            transformPerspective: 1000,
            transformOrigin: "center"
        });

        // Lighting effect
        if (lightRef.current) {
            const rect = modalContainerRef.current.getBoundingClientRect();
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;

            // Using direct style update for performance
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
        // Calculate movement delta relative to start, scaled for sensitivity
        const deltaX = (touch.clientX - touchStartPos.current.x) / window.innerWidth;
        const deltaY = (touch.clientY - touchStartPos.current.y) / window.innerHeight;

        gsap.to(modalContainerRef.current, {
            rotationY: deltaX * 15, // Reduced rotation strength further
            rotationX: -deltaY * 15,
            scale: 1, // Explicitly 1 for touch
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

        gsap.to(modalContainerRef.current, {
            rotationY: 0,
            rotationX: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out"
        });

        if (lightRef.current) {
            lightRef.current.style.background = 'transparent';
        }
    };

    const handleTouchEnd = () => {
        handleMouseLeave();
    };

    if (!isVisible) return null;

    return (
        <div ref={containerRef} className="portfolio-content-wrapper w-full overflow-hidden text-white font-sans selection:bg-blue-500/30">
            {/* HERO INDICATORS - FIXED */}
            <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
                <div className="flex flex-col gap-1 animate-fade-in opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                    <span className="text-[10px] font-tech uppercase tracking-widest opacity-50 text-white">Emanuele Greco</span>
                    <span className="text-[10px] font-tech uppercase tracking-widest opacity-50 text-white">Portfolio 2026</span>
                </div>
                <div className="flex flex-col gap-1 text-right animate-fade-in opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                    <span className="text-[10px] font-tech uppercase tracking-widest opacity-50 text-white">System Status</span>
                    <span className="text-[10px] font-tech uppercase tracking-widest text-emerald-500 animate-pulse">Operational</span>
                </div>
            </div>

            {/* MASONRY GRID (PINTEREST STYLE) */}
            <section className="min-h-screen w-full bg-black relative z-10 px-4 pb-20 pt-34 md:pt-42">
                {/* CATEGORY TABS */}
                <nav ref={tabsRef} className="relative w-full z-40 flex justify-center items-center mb-4 pointer-events-auto mix-blend-difference opacity-0">
                    <div className="flex gap-8 md:gap-12">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`text-xs md:text-sm font-bold tracking-widest transition-all duration-300 ${activeTab === cat
                                    ? 'text-white opacity-100 scale-110'
                                    : 'text-white/40 hover:text-white/80 hover:scale-105'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="columns-2 md:columns-4 gap-4 space-y-4 mx-auto max-w-[1920px]">
                    {currentImages.map((img, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedImage(img)}
                            className="grid-item break-inside-avoid relative group overflow-hidden rounded-[2rem] opacity-0 cursor-pointer"
                        >
                            <div className={`${img.h} w-full bg-zinc-900 relative rounded-[2rem] overflow-hidden`}>
                                <img
                                    src={img.src}
                                    alt={`${activeTab} ${i + 1}`}
                                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* MODAL OVERLAY */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-fade-in perspective-[1000px] touch-none"
                    style={{ touchAction: 'none' }}
                    onClick={() => setSelectedImage(null)}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        ref={modalContainerRef}
                        className="relative rounded-lg overflow-hidden shadow-2xl inline-block transform-style-preserve-3d"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Light Overlay */}
                        <div
                            ref={lightRef}
                            className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay transition-opacity duration-200"
                            style={{ background: 'transparent' }}
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
