/* ============ CONTENT DATA LAYER ============
   Loads Work/Clients/Photography from assets/data/*.json and renders them
   into the exact same HTML structure the page used to hard-code — same
   classes, same markup shape, so style.css and the reveal/showroom behavior
   in main.js need no changes. This is a data/rendering concern only; the
   Three.js hero scene, GSAP setup and all animations live untouched in
   main.js.

   Photography order matters: style.css has nth-child sizing rules for the
   grid (item 1 and 6 span differently), so the array order in
   photography.json IS the visual layout order — keep it as-is when editing. */
(function initContent() {
    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function workMediaHtml(project) {
        const tags = `<span class="work-media-tag">${escapeHtml(project.category)}</span>` +
            (project.badge ? `<span class="work-media-tag work-media-tag-soon">${escapeHtml(project.badge)}</span>` : '');

        if (project.media.type === 'mock') {
            return `<div class="work-media work-media-mock" data-mock="${escapeHtml(project.media.mock)}">${tags}</div>`;
        }
        return `<div class="work-media"><img src="${escapeHtml(project.media.src)}" alt="${escapeHtml(project.media.alt)}">${tags}</div>`;
    }

    function workCardHtml(project) {
        const media = workMediaHtml(project);
        const body = `<div class="work-body">
                <h3>${escapeHtml(project.title)}</h3>
                <p>${escapeHtml(project.description)}</p>
                ${project.disabled
                ? `<span class="work-link work-link-disabled">${escapeHtml(project.linkLabel)}</span>`
                : `<span class="work-link">${escapeHtml(project.linkLabel)}</span>`}
            </div>`;

        if (project.disabled) {
            return `<div class="work-card work-card-disabled reveal">${media}${body}</div>`;
        }
        return `<a class="work-card reveal" href="${escapeHtml(project.link)}" target="_blank" rel="noopener">${media}${body}</a>`;
    }

    function clientChipHtml(client) {
        return `<a class="client-chip" href="${escapeHtml(client.link)}" target="_blank" rel="noopener">
                <span class="client-chip-logo"><img src="${escapeHtml(client.logo)}" alt="${escapeHtml(client.name)} logo"></span>
                <span>${escapeHtml(client.name)}</span>
            </a>`;
    }

    function photoItemHtml(photo) {
        return `<button class="photo-item" data-full="${escapeHtml(photo.src)}"><img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt)}"></button>`;
    }

    /* ---- Background: Education + Experience, rendered as ONE timeline ----
       assets/data/background.json keeps them as two editable lists; here they are
       merged and sorted by start_year (stable, so equal years keep list order,
       education first). The period text is built from start_year / end_year /
       ongoing, e.g. "2019 – 2023", "2025", "2026 – present". */
    function toYear(value) {
        const n = typeof value === 'number' ? value : parseInt(value, 10);
        return Number.isFinite(n) && n > 0 ? n : null;
    }

    function timelinePeriod(entry) {
        const start = toYear(entry.start_year);
        const end = toYear(entry.end_year);
        if (!start) return '';
        if (end && end !== start) return `${start} – ${end}`;
        if (!end && entry.ongoing) return `${start} – present`;
        return String(start);
    }

    function httpUrl(url) {
        const value = String(url == null ? '' : url).trim();
        return /^https?:\/\//i.test(value) ? value : '';
    }

    function timelineItemHtml(entry) {
        const org = [entry.organization, entry.location]
            .map((part) => String(part == null ? '' : part).trim())
            .filter(Boolean)
            .join(', ');
        const link = httpUrl(entry.link);
        const orgHtml = link
            ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(org)}</a>`
            : escapeHtml(org);

        return `<div class="timeline-item reveal">
                <span class="timeline-date">${escapeHtml(timelinePeriod(entry))}</span>
                <div class="timeline-body">
                    <h3>${escapeHtml(entry.title == null ? '' : entry.title)}${entry.ongoing ? ' <span class="badge">Ongoing</span>' : ''}</h3>
                    ${org ? `<p class="timeline-org">${orgHtml}</p>` : ''}
                    <p>${escapeHtml(entry.description == null ? '' : entry.description)}</p>
                </div>
            </div>`;
    }

    function renderBackground(data) {
        const tag = document.getElementById('background-tag');
        const heading = document.getElementById('background-heading');
        const timeline = document.getElementById('timeline');
        if (tag) tag.textContent = data.section_tag == null ? '' : data.section_tag;
        if (heading) heading.textContent = data.heading == null ? '' : data.heading;
        if (!timeline) return;

        const entries = [].concat(data.education || [], data.experience || [])
            .filter((entry) => entry && typeof entry === 'object');
        entries.sort((a, b) => {
            const ya = toYear(a.start_year) || Infinity;
            const yb = toYear(b.start_year) || Infinity;
            return ya === yb ? 0 : (ya < yb ? -1 : 1);
        });
        timeline.innerHTML = entries.map(timelineItemHtml).join('');

        // The timeline grows the page after load: register its reveals and let
        // ScrollTrigger re-measure every trigger below it.
        if (window.registerReveals) window.registerReveals(timeline.querySelectorAll('.reveal'));
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }

    // Deep links (/#work, /#contact, …) were positioned before the timeline existed;
    // put the page back on its anchor once, unless the visitor already scrolled.
    let visitorScrolled = false;
    ['wheel', 'touchmove', 'keydown'].forEach((type) => {
        window.addEventListener(type, () => { visitorScrolled = true; }, { once: true, passive: true });
    });

    function restoreHashPosition() {
        if (visitorScrolled || location.hash.length < 2) return;
        let target = null;
        try { target = document.querySelector(location.hash); } catch (e) { return; }
        if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
    }

    function loadBackground() {
        fetch('assets/data/background.json')
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data) => {
                renderBackground(data);
                restoreHashPosition();
            })
            .catch((err) => {
                console.error('Background failed to load from assets/data/background.json:', err);
                const section = document.getElementById('experience');
                if (section) section.style.display = 'none';
            });
    }

    Promise.all([
        fetch('assets/data/work.json').then(r => r.json()),
        fetch('assets/data/clients.json').then(r => r.json()),
        fetch('assets/data/photography.json').then(r => r.json())
    ]).then(([workData, clientsData, photoData]) => {
        const workGrid = document.getElementById('work-grid');
        if (workGrid) {
            workGrid.innerHTML = workData.projects.map(workCardHtml).join('');
            if (window.registerReveals) window.registerReveals(workGrid.querySelectorAll('.reveal'));
        }

        const clientsRow = document.getElementById('clients-row');
        if (clientsRow) {
            clientsRow.innerHTML = clientsData.clients.map(clientChipHtml).join('');
        }

        const photoGrid = document.getElementById('photo-grid');
        if (photoGrid) {
            photoGrid.innerHTML = photoData.photos.map(photoItemHtml).join('');
        }

        if (window.initPhotoShowroom) window.initPhotoShowroom(photoData.photos);
    }).catch((err) => {
        console.error('Content failed to load from assets/data/:', err);
    });

    loadBackground();
})();
