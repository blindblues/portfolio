import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789@#$%&*()<>[]{}";

export default function TerminalOverlay() {
    const [text, setText] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const finalString = "emanuele greco portfolio";
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleStart = () => setIsVisible(true);
        window.addEventListener('modelAnimationComplete', handleStart);
        const timer = setTimeout(() => setIsVisible(true), 6000);

        return () => {
            window.removeEventListener('modelAnimationComplete', handleStart);
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let iteration = 0;
        let interval: any = null;

        const startTyping = () => {
            interval = setInterval(() => {
                setText(finalString.slice(0, Math.floor(iteration)));

                if (iteration >= finalString.length) {
                    clearInterval(interval);
                    gsap.to(containerRef.current, {
                        textShadow: "0 0 15px rgba(255, 255, 255, 0.5)",
                        duration: 1.5,
                        repeat: -1,
                        yoyo: true
                    });
                }

                iteration += 1;
            }, 80); // Adjust speed of typing here
        };

        gsap.fromTo(containerRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: "power2.out", onComplete: startTyping }
        );

        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none p-4">
            <h1
                ref={containerRef}
                className="text-2xl md:text-5xl font-black tracking-[0.1em] text-white flex items-center text-center flex-wrap justify-center leading-tight"
                style={{ fontFamily: "'Doto', sans-serif" }}
            >
                {text}
                <span className="inline-block w-4 h-8 md:w-8 md:h-12 bg-white ml-2 animate-pulse align-middle" />
            </h1>
        </div>
    );
}
