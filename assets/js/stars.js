class StarField {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createStars();
        this.setupEventListeners();
        this.animate();
        
        // Add canvas to page
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '2';
        // Assicura che le stelle siano dietro tutto il contenuto
        document.body.insertBefore(this.canvas, document.body.firstChild);
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createStars() {
        const starCount = Math.floor((this.canvas.width * this.canvas.height) / 3000);
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                baseX: Math.random() * this.canvas.width,
                baseY: Math.random() * this.canvas.height,
                size: Math.random() * 0.7 + 0.1,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                parallaxFactor: Math.random() * 0.5 + 0.1,
                moveSpeed: Math.random() * 0.5 + 0.2,
                moveRadius: Math.random() * 10 + 5,
                moveAngle: Math.random() * Math.PI * 2
            });
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.stars = [];
            this.createStars();
        });
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const time = Date.now() * 0.001;
        
        this.stars.forEach(star => {
            // Simple circular movement
            star.moveAngle += star.moveSpeed * 0.01;
            const floatX = Math.cos(star.moveAngle) * star.moveRadius;
            const floatY = Math.sin(star.moveAngle) * star.moveRadius;
            
            // Calculate parallax offset based on mouse position
            const parallaxX = this.mouseX * star.parallaxFactor * 8;
            const parallaxY = this.mouseY * star.parallaxFactor * 8;
            
            // Calculate final position - base position + circular movement + parallax
            const x = star.baseX + floatX + parallaxX;
            const y = star.baseY + floatY + parallaxY;
            
            // Calculate enhanced twinkling effect
            const twinkle = Math.sin(time * star.twinkleSpeed) * 0.4 + 0.6;
            const brightness = star.brightness * twinkle;
            
            // Draw star
            this.ctx.beginPath();
            this.ctx.arc(x, y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            this.ctx.fill();
            
            // Add enhanced glow effect for brighter stars
            if (star.size > 0.5) {
                // Outer glow
                this.ctx.beginPath();
                this.ctx.arc(x, y, star.size * 3, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.05})`;
                this.ctx.fill();
                
                // Middle glow
                this.ctx.beginPath();
                this.ctx.arc(x, y, star.size * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.15})`;
                this.ctx.fill();
            } else if (star.size > 0.3) {
                // Small glow for medium stars
                this.ctx.beginPath();
                this.ctx.arc(x, y, star.size * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.1})`;
                this.ctx.fill();
            }
            
            // Add sparkle effect for brightest stars
            if (brightness > 0.8 && star.size > 0.4) {
                const sparkleSize = star.size * 0.5;
                this.ctx.beginPath();
                this.ctx.arc(x - sparkleSize, y - sparkleSize, sparkleSize * 0.3, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(x + sparkleSize, y + sparkleSize, sparkleSize * 0.3, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
                this.ctx.fill();
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize starfield when page loads
window.addEventListener('DOMContentLoaded', () => {
    new StarField();
});
