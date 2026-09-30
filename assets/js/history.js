/* Lightweight script for history.html — background particles + scroll
   reveals only, no three.js hero/showroom (this page doesn't have those). */

(function initBackgroundParticles() {
    const canvas = document.getElementById('bg-particles');
    const ctx = canvas.getContext('2d');
    let width, height, particles;

    function resize() {
        width = canvas.width = document.documentElement.clientWidth;
        height = canvas.height = document.body.scrollHeight;
    }

    function createParticles() {
        const count = Math.min(90, Math.round((width * document.documentElement.clientHeight) / 24000));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2
        }));
    }

    function step() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.strokeStyle = `rgba(124, 92, 255, ${0.14 * (1 - dist / 130)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
            ctx.fillStyle = 'rgba(244, 242, 235, 0.35)';
            ctx.beginPath();
            ctx.arc(particles[i].x, particles[i].y, 1.3, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(step);
    }

    window.addEventListener('resize', () => { resize(); createParticles(); });
    resize();
    createParticles();
    step();
})();

/* Simple IntersectionObserver-based reveal — no GSAP dependency needed here */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
