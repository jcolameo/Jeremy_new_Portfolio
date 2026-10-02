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

    /* ---- Contact & links: one source (assets/data/contact.json) ----
       Contact section texts are rendered into #contact-tag / #contact-heading /
       #contact-text. Every email / LinkedIn / Instagram reference in the HTML is
       a bare element marked data-contact-link="email|linkedin|instagram"; its href
       is set here, and an optional data-contact-text fills its visible text.
       A link whose value is missing or invalid is removed instead of left
       pointing nowhere (no href="null"). */
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const INSTAGRAM_HANDLE_PATTERN = /^[A-Za-z0-9._]+$/;

    function contactEmail(data) {
        const value = String(data.email == null ? '' : data.email).trim();
        return EMAIL_PATTERN.test(value) ? value : '';
    }

    function contactInstagramHandle(data) {
        const value = String(data.instagram_handle == null ? '' : data.instagram_handle)
            .trim().replace(/^@/, '');
        return INSTAGRAM_HANDLE_PATTERN.test(value) ? value : '';
    }

    function applyContactLinks(data) {
        const email = contactEmail(data);
        const handle = contactInstagramHandle(data);
        const targets = {
            email: email ? `mailto:${email}` : '',
            linkedin: httpUrl(data.linkedin_url),
            instagram: handle ? `https://www.instagram.com/${handle}/` : ''
        };
        const texts = {
            'email-label': String(data.email_button_label == null ? '' : data.email_button_label).trim() || 'Email me',
            'instagram-handle': handle ? `@${handle}` : ''
        };

        document.querySelectorAll('[data-contact-link]').forEach((el) => {
            const href = targets[el.dataset.contactLink];
            if (!href) { el.remove(); return; }
            el.setAttribute('href', href);
            const textKey = el.dataset.contactText;
            if (textKey && texts[textKey]) el.textContent = texts[textKey];
        });
    }

    function renderContact(data) {
        const tag = document.getElementById('contact-tag');
        const heading = document.getElementById('contact-heading');
        const text = document.getElementById('contact-text');
        if (tag) tag.textContent = data.section_tag == null ? '' : data.section_tag;
        if (text) text.textContent = data.text == null ? '' : data.text;
        if (heading) {
            heading.textContent = data.heading_lead == null ? '' : data.heading_lead;
            const accent = String(data.heading_accent == null ? '' : data.heading_accent).trim();
            if (accent) {
                const span = document.createElement('span');
                span.className = 'text-outline';
                span.textContent = accent;
                heading.appendChild(document.createTextNode(' '));
                heading.appendChild(span);
            }
        }
        applyContactLinks(data);

        // The section grows after load: let ScrollTrigger re-measure, and put a
        // deep link (/#contact) back on its anchor unless the visitor has scrolled.
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        restoreHashPosition();
    }

    function loadContact() {
        fetch('assets/data/contact.json')
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(renderContact)
            .catch((err) => {
                console.error('Contact failed to load from assets/data/contact.json:', err);
                applyContactLinks({});
                const section = document.getElementById('contact');
                if (section) section.style.display = 'none';
            });
    }

    /* ---- Services: cards, tool strip and the "N Services offered" fact ----
       assets/data/services.json holds the section tag/heading, the service
       cards and the tool line. The number in the About facts ("N Services
       offered") is NOT stored anywhere: it is the number of service cards.
       Icons are chosen by key; the SVG markup lives here (same shapes as before). */
    const SERVICE_ICONS = {
        bolt: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/>',
        code: '<path d="m8 6-6 6 6 6"/><path d="m16 6 6 6-6 6"/>',
        terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3"/><path d="M13 15h4"/>',
        camera: '<path d="M4 8h3l2-2h6l2 2h3v11H4Z"/><circle cx="12" cy="13" r="3.4"/>'
    };

    function cleanText(value) {
        return String(value == null ? '' : value).trim();
    }

    function cleanTextList(value) {
        return (Array.isArray(value) ? value : []).map(cleanText).filter(Boolean);
    }

    function serviceCardHtml(service) {
        const icon = Object.prototype.hasOwnProperty.call(SERVICE_ICONS, service.icon)
            ? `<div class="service-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">${SERVICE_ICONS[service.icon]}</svg>
                </div>`
            : '';
        const title = cleanText(service.title);
        const note = cleanText(service.note);
        const points = cleanTextList(service.points);

        return `<div class="service-card reveal">
                ${icon}
                ${title ? `<h3>${escapeHtml(title)}</h3>` : ''}
                ${note ? `<p class="service-note">${escapeHtml(note)}</p>` : ''}
                ${points.length ? `<ul class="service-list">${points.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>` : ''}
            </div>`;
    }

    function renderServices(data) {
        const section = document.getElementById('services');
        const tag = document.getElementById('services-tag');
        const heading = document.getElementById('services-heading');
        const grid = document.getElementById('services-grid');
        const toolStrip = document.getElementById('services-tools');
        const countEl = document.getElementById('services-count');
        const countFact = countEl && countEl.closest('.fact');

        const services = (Array.isArray(data.services) ? data.services : [])
            .filter((service) => service && typeof service === 'object');
        const tools = cleanTextList(data.tools);

        if (tag) tag.textContent = cleanText(data.section_tag);
        if (heading) heading.textContent = cleanText(data.heading);

        if (grid) {
            grid.innerHTML = services.map(serviceCardHtml).join('');
            if (window.registerReveals) window.registerReveals(grid.querySelectorAll('.reveal'));
        }
        if (toolStrip) {
            if (tools.length) toolStrip.textContent = tools.join(' · ');
            else toolStrip.remove();
        }

        // "N Services offered": always the real number of cards, never a stored value.
        if (countEl) {
            if (services.length) countEl.textContent = String(services.length);
            else if (countFact) countFact.remove();
        }
        if (!services.length && section) section.style.display = 'none';

        // The section grows after load: re-measure ScrollTrigger and restore a deep link.
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        restoreHashPosition();
    }

    function loadServices() {
        fetch('assets/data/services.json')
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(renderServices)
            .catch((err) => {
                console.error('Services failed to load from assets/data/services.json:', err);
                const section = document.getElementById('services');
                if (section) section.style.display = 'none';
                const countEl = document.getElementById('services-count');
                const countFact = countEl && countEl.closest('.fact');
                if (countFact) countFact.remove();
            });
    }

    /* ---- About: tag, heading, portrait, paragraphs, hobbies and facts ----
       assets/data/about.json fills the static About markup. The first facts tile
       ("N Services offered") is a static container: its NUMBER is written by
       renderServices() from services.length and is never stored here, only its
       LABEL (services_label) comes from about.json. Both loaders touch separate
       elements of that tile, so they can finish in any order. The three
       editorial facts are appended after it. */
    function renderAbout(data) {
        const tag = document.getElementById('about-tag');
        const heading = document.getElementById('about-heading');
        const portrait = document.getElementById('about-portrait');
        const copy = document.getElementById('about-copy');
        const hobbiesEl = document.getElementById('about-hobbies');
        const facts = document.getElementById('about-facts');
        const countLabel = document.getElementById('services-count-label');

        if (tag) tag.textContent = cleanText(data.section_tag);
        if (heading) heading.textContent = cleanText(data.heading);

        if (portrait) {
            const image = data.portrait && typeof data.portrait === 'object' ? data.portrait : {};
            const src = cleanText(image.image);
            portrait.innerHTML = src
                ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(cleanText(image.alt))}">`
                : '';
        }

        // Paragraphs go in front of the hobby tags, no extra wrapper.
        const paragraphs = cleanTextList(data.paragraphs);
        if (copy && paragraphs.length) {
            copy.insertAdjacentHTML('afterbegin',
                paragraphs.map((text) => `<p class="about-text reveal">${escapeHtml(text)}</p>`).join(''));
            if (window.registerReveals) window.registerReveals(copy.querySelectorAll('.about-text.reveal'));
        }

        const hobbies = cleanTextList(data.hobbies);
        if (hobbiesEl) {
            if (hobbies.length) hobbiesEl.innerHTML = hobbies.map((hobby) => `<span>${escapeHtml(hobby)}</span>`).join('');
            else hobbiesEl.remove();
        }

        // The services tile: label from here, number from renderServices().
        const label = cleanText(data.services_label);
        if (countLabel) {
            if (label) countLabel.textContent = label;
            else countLabel.closest('.fact').remove();
        }
        if (facts) {
            const items = (Array.isArray(data.facts) ? data.facts : [])
                .filter((fact) => fact && typeof fact === 'object')
                .map((fact) => ({ value: cleanText(fact.value), label: cleanText(fact.label) }))
                .filter((fact) => fact.value || fact.label);
            facts.insertAdjacentHTML('beforeend', items.map((fact) => `<div class="fact">
                    <span class="fact-num">${escapeHtml(fact.value)}</span>
                    <span class="fact-label">${escapeHtml(fact.label)}</span>
                </div>`).join(''));
        }

        // The section grows after load: re-measure ScrollTrigger and restore a deep link.
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        restoreHashPosition();
    }

    function loadAbout() {
        fetch('assets/data/about.json')
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(renderAbout)
            .catch((err) => {
                console.error('About failed to load from assets/data/about.json:', err);
                const section = document.getElementById('about');
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
    loadContact();
    loadServices();
    loadAbout();
})();
