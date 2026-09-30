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
})();
