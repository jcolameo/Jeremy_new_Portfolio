gsap.registerPlugin(ScrollTrigger);

/* ============ HERO THREE.JS SCENE — a 3D skills Venn diagram ============
   Four flat, translucent discs (Design / Development / Motion / Tech) sit in
   3D space and overlap where those skills actually meet — literally "no
   either/or". They gather in tight when the cursor is near centre and drift
   apart when idle, the same interaction-reacts-to-you idea as before, just a
   different shape. My name sits in the middle, right where all four overlap. */
(function initHero() {
    const container = document.getElementById('hero-canvas');
    const scene = new THREE.Scene();

    // document.documentElement.clientWidth/clientHeight is the size that
    // stays correct in this environment (see the --vw/--vh setup in
    // index.html) — window.innerWidth/innerHeight can drift on some mobile
    // builds, which would otherwise feed a wrong aspect ratio straight into
    // the camera and renderer.
    function viewportSize() {
        return { w: document.documentElement.clientWidth, h: document.documentElement.clientHeight };
    }

    let vp = viewportSize();
    function isMobileWidth(w) { return w <= 700; }
    let isMobile = isMobileWidth(vp.w);

    // A narrow phone aspect leaves little horizontal room at fov 50 — widen
    // it on mobile so the focused (enlarged) circle has space to breathe.
    const camera = new THREE.PerspectiveCamera(isMobile ? 64 : 50, vp.w / vp.h, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(vp.w, vp.h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // On desktop everything just scales down a bit on narrower windows. On
    // mobile this is the *baseline* size before the per-circle focus/recede
    // scaling (below) takes over.
    function sceneScale(width) {
        if (width <= 700) return 0.72;
        return 1;
    }

    const vennGroup = new THREE.Group();
    vennGroup.scale.setScalar(sceneScale(vp.w));
    scene.add(vennGroup);

    // The canvas covers the whole fixed viewport (nav included), so the
    // diagram is otherwise centred on the full page height and its top
    // circle ends up peeking out right behind — and blurred by — the fixed
    // nav bar. Nudge the group down just enough to clear it on desktop.
    const navEl = document.querySelector('.nav');
    function vennVerticalOffset(vpH) {
        if (isMobile || !navEl) return 0;
        const safePx = navEl.offsetHeight + 24;
        const halfHeightWorld = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const topWorldNeeded = halfHeightWorld * (1 - (2 * safePx) / vpH);
        const topWorldCurrent = (SPREAD + CIRCLE_RADIUS) * vennGroup.scale.y;
        return Math.min(0, topWorldNeeded - topWorldCurrent);
    }

    // Renders a label onto a canvas and wraps it as a camera-facing sprite —
    // lets text live inside the 3D scene (moving with the circles that own
    // it) without needing an extruded-font geometry loader.
    function makeTextSprite(text, { color = '#f4f2eb', fontPx = 56, weight = 700, spacing = 3, opacity = 0.9, worldHeight = 0.42 } = {}) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const upper = text.toUpperCase();
        const fontSpec = `${weight} ${fontPx}px "Space Grotesk", sans-serif`;
        ctx.font = fontSpec;
        const rawWidth = ctx.measureText(upper).width + upper.length * spacing;
        const padX = 16, padY = 16;
        const cssW = Math.ceil(rawWidth + padX * 2);
        const cssH = Math.ceil(fontPx * 1.5 + padY * 2);

        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        ctx.scale(dpr, dpr);
        ctx.font = fontSpec;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.shadowColor = 'rgba(11, 11, 16, 0.9)';
        ctx.shadowBlur = 14;

        let x = padX;
        for (const ch of upper) {
            ctx.fillText(ch, x, cssH / 2);
            x += ctx.measureText(ch).width + spacing;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(worldHeight * (cssW / cssH), worldHeight, 1);
        sprite.renderOrder = 999;
        return sprite;
    }

    const CIRCLE_RADIUS = 2.0;
    const SPREAD = 1.3;
    const circleDefs = [
        { name: 'Design', color: 0xff6a3d, base: [0, SPREAD, 0.15] },
        { name: 'Development', color: 0x7c5cff, base: [-SPREAD, 0, 0.05] },
        { name: 'Motion', color: 0xff4d8f, base: [SPREAD, 0, -0.05] },
        { name: 'Tech', color: 0xffc94d, base: [0, -SPREAD, -0.15] }
    ];

    vennGroup.position.y = vennVerticalOffset(vp.h);

    const circleGeo = new THREE.CircleGeometry(CIRCLE_RADIUS, 64);
    const ringCurve = new THREE.EllipseCurve(0, 0, CIRCLE_RADIUS, CIRCLE_RADIUS, 0, Math.PI * 2, false, 0);
    const ringPoints = ringCurve.getPoints(72).map(p => new THREE.Vector3(p.x, p.y, 0));
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);

    const circles = circleDefs.map((def) => {
        const holder = new THREE.Group();
        holder.position.set(def.base[0], def.base[1], def.base[2]);

        const mat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.24, side: THREE.DoubleSide });
        const disc = new THREE.Mesh(circleGeo, mat);
        holder.add(disc);

        const ring = new THREE.LineLoop(ringGeo, new THREE.LineBasicMaterial({ color: def.color, transparent: true, opacity: 0.7 }));
        holder.add(ring);

        // Category label lives inside this circle, offset toward its outer
        // edge (away from the shared centre) — it's a child, so it gathers/
        // spreads/tilts together with the disc it belongs to automatically.
        const dir = new THREE.Vector3(def.base[0], def.base[1], 0).normalize();
        const label = makeTextSprite(def.name, { color: '#f4f2eb', fontPx: 52, weight: 700, opacity: 0.95, worldHeight: 0.36 });
        label.position.set(dir.x * CIRCLE_RADIUS * 0.5, dir.y * CIRCLE_RADIUS * 0.5, 0.4);
        label.visible = !isMobile; // mobile shows the real HTML focus label instead
        holder.add(label);

        holder.userData.base = new THREE.Vector3(def.base[0], def.base[1], def.base[2]);
        holder.userData.phase = Math.random() * Math.PI * 2;
        holder.userData.label = label;
        holder.userData.offset = 1;
        holder.userData.focusScale = 1;
        vennGroup.add(holder);
        return holder;
    });

    // Skill labels sit where two adjacent circles overlap — not owned by a
    // single circle, so they're tracked separately at the midpoint of their
    // two parent circles' base positions and scaled by the same "gather".
    const skillDefs = [
        { name: 'Frontend', from: 0, to: 1 },  // Design ∩ Development
        { name: 'Editing', from: 0, to: 2 },   // Design ∩ Motion
        { name: 'Backend', from: 1, to: 3 },   // Development ∩ Tech
        { name: 'Camera', from: 2, to: 3 }     // Motion ∩ Tech
    ];
    const skills = skillDefs.map((def) => {
        const a = circleDefs[def.from].base, b = circleDefs[def.to].base;
        const base = new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.45);
        const sprite = makeTextSprite(def.name, { color: '#f4f2eb', fontPx: 38, weight: 600, opacity: 0.75, worldHeight: 0.24 });
        sprite.userData.base = base;
        sprite.position.copy(base);
        sprite.visible = !isMobile; // mobile shows these as HTML tags under the focused circle instead
        vennGroup.add(sprite);
        return sprite;
    });

    // Small dark hub so the centred name stays legible over the 4-way overlap
    const hub = new THREE.Mesh(
        new THREE.CircleGeometry(1.5, 48),
        new THREE.MeshBasicMaterial({ color: 0x0b0b10, transparent: true, opacity: 0.55 })
    );
    hub.position.z = 0.3;
    vennGroup.add(hub);

    // Soft dust/bokeh particles
    const particleCount = 70;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const r = 3.8 + Math.random() * 2.4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi) * 0.4;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xf4f2eb, size: 0.035, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Circles gather in toward the cursor (more overlap) and drift apart when
    // idle — the same cursor-reacts-to-you idea the aperture had. Desktop only.
    let pointerActive = false;
    let mouseNX = 0, mouseNY = 0;
    let gather = 0.3;
    let targetRotX = 0, targetRotY = 0;

    window.addEventListener('pointermove', (e) => {
        pointerActive = true;
        mouseNX = (e.clientX / vp.w) * 2 - 1;
        mouseNY = (e.clientY / vp.h) * 2 - 1;
        targetRotY = mouseNX * 0.16;
        targetRotX = mouseNY * 0.1;
    });
    window.addEventListener('pointerleave', () => { pointerActive = false; });

    // Mobile: no cursor, so instead one circle at a time is "focused" — pulled
    // toward centre and enlarged, with a real HTML label (crisp, always
    // legible, unlike shrinking a canvas-texture sprite down to nothing).
    // The other three stay put as smaller, dimmer context so the overlap
    // itself is still visible throughout, just not the point of the moment.
    // Bookended by an "all four together" step at both the start and the end —
    // the overview, then the breakdown, then the overview again.
    const FOCUS_SEQUENCE = ['all', 0, 1, 2, 3, 'all'];
    const TOTAL_STEPS = FOCUS_SEQUENCE.length;

    // A category can carry one extra "pure" specialty of its own, alongside
    // the two shared-overlap skills — Design is the one name in this set
    // vague enough to need it spelled out.
    const extraSkill = { 0: 'UI/UX' };

    const focusSkillEl = document.getElementById('mobile-focus-skill');
    const focusSubEl = document.getElementById('mobile-focus-subskills');
    let focusIndex = 0;

    function relatedSkills(i) {
        const extras = extraSkill[i] ? [extraSkill[i]] : [];
        return extras.concat(skillDefs.filter(s => s.from === i || s.to === i).map(s => s.name));
    }

    function renderFocusLabel(step) {
        const target = FOCUS_SEQUENCE[step];
        if (target === 'all') {
            focusSkillEl.textContent = '';
            focusSubEl.innerHTML = '';
            return;
        }
        const def = circleDefs[target];
        focusSkillEl.textContent = def.name;
        focusSkillEl.style.color = '#' + def.color.toString(16).padStart(6, '0');
        focusSubEl.innerHTML = relatedSkills(target).map(name => `<span>${name}</span>`).join('');
    }
    renderFocusLabel(focusIndex);

    function updateFocusFromScroll() {
        const heroEl = document.querySelector('.hero');
        const rect = heroEl.getBoundingClientRect();
        const scrollable = rect.height - vp.h;
        const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
        const idx = Math.min(TOTAL_STEPS - 1, Math.floor(progress * TOTAL_STEPS));
        if (idx !== focusIndex) {
            focusIndex = idx;
            renderFocusLabel(focusIndex);
        }
    }
    window.addEventListener('scroll', () => { if (isMobile) updateFocusFromScroll(); }, { passive: true });

    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.001;

        if (isMobile) {
            const focusTarget = FOCUS_SEQUENCE[focusIndex];
            const showingAll = focusTarget === 'all';
            circles.forEach((holder, i) => {
                const base = holder.userData.base;
                const active = i === focusTarget;
                const bob = Math.sin(time * 0.6 + holder.userData.phase) * 0.03;
                let targetOffset, targetScale;
                if (showingAll) {
                    targetOffset = 1;
                    targetScale = 1;
                } else {
                    targetOffset = active ? 0.32 : 1.28;
                    targetScale = active ? 1.35 : 0.6;
                }
                holder.userData.offset += (targetOffset - holder.userData.offset) * 0.07;
                holder.userData.focusScale += (targetScale - holder.userData.focusScale) * 0.07;
                holder.position.set(base.x * holder.userData.offset, base.y * holder.userData.offset + bob, base.z);
                holder.scale.setScalar(holder.userData.focusScale);
            });
            vennGroup.rotation.x += (0 - vennGroup.rotation.x) * 0.05;
            vennGroup.rotation.y += (0 - vennGroup.rotation.y) * 0.05;
            vennGroup.rotation.z = Math.sin(time * 0.15) * 0.03;
        } else {
            let targetGather;
            if (pointerActive) {
                const dist = Math.min(1, Math.hypot(mouseNX, mouseNY));
                targetGather = 1 - dist; // cursor near centre = gathered in, far = spread out
            } else {
                targetGather = 0.4 + Math.sin(time * 0.5) * 0.15;
            }
            gather += (targetGather - gather) * 0.05;

            // 1.18 = spread apart (idle/far), 0.82 = gathered in (cursor near centre)
            const spreadScale = 1.18 - gather * 0.36;
            circles.forEach((holder) => {
                const base = holder.userData.base;
                const bob = Math.sin(time * 0.6 + holder.userData.phase) * 0.04;
                holder.position.set(base.x * spreadScale, base.y * spreadScale + bob, base.z);
                holder.scale.setScalar(1);
            });
            skills.forEach((sprite) => {
                const base = sprite.userData.base;
                sprite.position.set(base.x * spreadScale, base.y * spreadScale, base.z);
            });

            vennGroup.rotation.x += (targetRotX - vennGroup.rotation.x) * 0.04;
            vennGroup.rotation.y += (targetRotY - vennGroup.rotation.y) * 0.04;
            vennGroup.rotation.z = Math.sin(time * 0.15) * 0.04;
        }

        particles.rotation.y -= 0.0004;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        vp = viewportSize();
        const wasMobile = isMobile;
        isMobile = isMobileWidth(vp.w);
        camera.fov = isMobile ? 64 : 50;
        camera.aspect = vp.w / vp.h;
        camera.updateProjectionMatrix();
        renderer.setSize(vp.w, vp.h);
        vennGroup.scale.setScalar(sceneScale(vp.w));
        vennGroup.position.y = vennVerticalOffset(vp.h);

        if (isMobile !== wasMobile) {
            circles.forEach((holder) => { holder.userData.label.visible = !isMobile; });
            skills.forEach((sprite) => { sprite.visible = !isMobile; });
            if (isMobile) updateFocusFromScroll();
        }
    });

    // Only visible while the hero is on screen
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            container.classList.toggle('visible', entry.isIntersecting);
        });
    }, { threshold: 0.15 });
    heroObserver.observe(document.querySelector('.hero'));
})();

/* ============ BACKGROUND PARTICLE NETWORK ============ */
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

/* ============ SCROLL REVEALS ============ */
gsap.utils.toArray('.reveal').forEach((el, i) => {
    gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: el,
            start: 'top 88%'
        },
        delay: (i % 4) * 0.05
    });
});

/* ============ MOBILE NAV ============ */
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
navToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    navToggle.classList.toggle('active');
});
mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ============ PHOTO SHOWROOM — a three.js coverflow carousel ============
   Photos as textured 3D cards fanned out in depth; the active one faces the
   camera dead-on, the rest recede and turn away. Prev/next buttons, clicking
   a side card, arrow keys and Escape all drive it. */
(function initShowroom() {
    const overlay = document.getElementById('showroom');
    const canvasContainer = document.getElementById('showroom-canvas');
    const counterEl = document.getElementById('showroom-counter');
    const closeBtn = document.getElementById('showroom-close');
    const prevBtn = document.getElementById('showroom-prev');
    const nextBtn = document.getElementById('showroom-next');

    const photoButtons = Array.from(document.querySelectorAll('.photo-item'));
    const photoUrls = photoButtons.map(btn => btn.dataset.full);
    if (!photoButtons.length) return;

    const CARD_W = 2.1, CARD_H = 2.6;
    const ACCENT_A = 0x7c5cff, ACCENT_B = 0xff6a3d;

    let scene, camera, renderer;
    const cards = [];
    let currentIndex = 0;
    let rafId = null;
    let built = false;

    function buildScene() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 7);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        canvasContainer.appendChild(renderer.domElement);
        renderer.domElement.addEventListener('click', onCanvasClick);

        const loader = new THREE.TextureLoader();
        photoUrls.forEach((url, i) => {
            const group = new THREE.Group();

            const frameColor = i % 2 === 0 ? ACCENT_A : ACCENT_B;
            const frameMat = new THREE.MeshBasicMaterial({ color: frameColor, transparent: true });
            const frame = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W + 0.14, CARD_H + 0.14), frameMat);
            frame.position.z = -0.04;
            group.add(frame);

            const tex = loader.load(url);
            const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
            const photo = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H), mat);
            group.add(photo);

            group.userData.index = i;
            scene.add(group);
            cards.push(group);
        });

        layout(false);
    }

    function layout(animate) {
        cards.forEach((group) => {
            const i = group.userData.index;
            const offset = i - currentIndex;
            const abs = Math.abs(offset);
            const targetX = offset * 1.65;
            const targetZ = -abs * 1.35;
            const targetRotY = THREE.MathUtils.degToRad(offset * -36);
            const targetScale = abs === 0 ? 1 : Math.max(0.6, 0.86 - abs * 0.12);
            const targetOpacity = abs > 3 ? 0 : (abs === 0 ? 1 : 0.4);
            group.renderOrder = 100 - abs;

            if (animate) {
                gsap.to(group.position, { x: targetX, z: targetZ, duration: 0.6, ease: 'power3.out' });
                gsap.to(group.rotation, { y: targetRotY, duration: 0.6, ease: 'power3.out' });
                gsap.to(group.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 0.6, ease: 'power3.out' });
                group.children.forEach(child => gsap.to(child.material, { opacity: targetOpacity, duration: 0.6, ease: 'power3.out' }));
            } else {
                group.position.set(targetX, 0, targetZ);
                group.rotation.y = targetRotY;
                group.scale.set(targetScale, targetScale, targetScale);
                group.children.forEach(child => { child.material.opacity = targetOpacity; });
            }
        });
        counterEl.textContent = `${currentIndex + 1} / ${cards.length}`;
    }

    function goTo(index) {
        currentIndex = ((index % cards.length) + cards.length) % cards.length;
        layout(true);
    }
    const next = () => goTo(currentIndex + 1);
    const prev = () => goTo(currentIndex - 1);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function onCanvasClick(e) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const meshes = cards.flatMap(g => g.children);
        const hit = raycaster.intersectObjects(meshes, false)[0];
        if (hit) goTo(hit.object.parent.userData.index);
    }

    function onResize() {
        if (!renderer) return;
        const w = canvasContainer.clientWidth, h = canvasContainer.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    function animate() {
        rafId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    function open(index) {
        if (!built) { buildScene(); built = true; }
        currentIndex = index;
        layout(false);
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        onResize();
        cancelAnimationFrame(rafId);
        animate();
    }

    function close() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        cancelAnimationFrame(rafId);
    }

    photoButtons.forEach((btn, i) => btn.addEventListener('click', () => open(i)));
    closeBtn.addEventListener('click', close);
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    window.addEventListener('resize', () => { if (overlay.classList.contains('open')) onResize(); });
    window.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
    });
})();
