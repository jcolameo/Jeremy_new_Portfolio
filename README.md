# Jeremy Colameo — Portfolio

Personal freelance landing page. Static HTML/CSS/JS with a Three.js hero scene
and GSAP scroll reveals — no build step.

## Structure

```
jeremy-portfolio/
├── index.html
└── assets/
    ├── js/main.js            Three.js hero, particle background, scroll reveals, lightbox
    ├── css/style.css         All styling
    └── images/
        ├── photography/      8 real photos pulled from @jeremy.creats.things
        └── projects/         Arcware, McWindisch thumbnails
```

## Run locally

```bash
python3 -m http.server 8731
```

Then open `http://localhost:8731`.

## Content notes

- **Photography**: real images downloaded from the public Instagram grid
  (@jeremy.creats.things). Re-check/replace if the account changes.
- **DueDate, Nachbarschaftstool, Legionärspfad**: linked out to the Figma
  files directly (they sit behind Figma's login wall, so previews are
  generated CSS mockups, not real screenshots) — swap in real exported
  images if you want more accurate previews.
- **Arcware**: thumbnail reused from the `arcware/prototype` project;
  links out to arcware.io.
- Contact email on the page: jeremy.colameo@gmail.com.
