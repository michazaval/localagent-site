# Premium hero refinement

Base: `develop` at `9a2dd0b`. Static HTML/CSS/Canvas, no new dependencies.

## Design

Keep LocalAgent's dark green chamber and light sculpture as the signature. Use a quieter system-font heading, a readable product description and two named destinations: the concept preview and the product idea. Preserve development status and simulation disclosures.

Desktop uses two independent grid columns; tablet/mobile stack the copy and scene in document flow. The mode explanation and controls sit below the Canvas rather than over it. Hero layout rules now live together in `atelier.css`; obsolete hero overrides were removed from the other four stylesheets. Shared rules for other sections remain. Canvas is centered inside its own smaller drawing area, retaining the existing state blending, visibility gates, bounded resolution, frame pacing and pause handling.

The motion control's accessible name now includes its visible label (WCAG 2.5.3).

## Before / after

Screenshots include the header and entire hero. Decorative motion was manually paused for reproducible comparison; no image assets or remote fonts were added.

| View | Before | After |
|---|---|---|
| Desktop 1440 | [Before](before-1440.png) | [After](after-1440.png) |
| Mobile 390 | [Before](before-390.png) | [After](after-390.png) |

## Verification performed

- `npm run check`: all 15 existing tests pass, plus static validation.
- `npm run build`: passes; existing explicit publication allow-list is unchanged. This documentation is not copied into `dist`.
- `node --check assets/polish.js`; `git diff --check`.
- Real Chrome via Playwright: 1440, 1920, 768, 360, 390, 430 CSS pixels; both EN/RU; each of IDLE/THINK/LISTEN/ACT (48 combinations). No browser/resource errors, horizontal document overflow, copy/scene overlap, or explanation/control overlap. State buttons meet 44px minimum targets.
- Keyboard Tab, Space and Enter switch the native buttons correctly. Focus-visible styles inspected with Chrome DevTools.
- Actual Canvas pixel snapshots stay identical across a 200ms interval under manual pause and under emulated reduced motion; reduced motion disables the resume control. This checks pixels, not just CSS classes.
- Chrome DevTools: no console errors/warnings; all 11 requested resources return 200. No external service required.
- Lighthouse desktop and mobile after: accessibility 96, best practices 100, SEO 100, agentic browsing 100. Mobile baseline also accessibility 96. Remaining automated findings are contrast issues in the unchanged approach, experience, architecture and roadmap sections. The initial desktop audit also identified the motion-label issue fixed here.
- Self-review: CTA destinations remain local anchors; language strings exist in both locales; no product claims, backend behavior, release controls, workflow settings, or build inclusion rules changed. Layout and mode interactions remain usable without animation. Original fallback remains available without Canvas.

Browser regression procedure: serve the repository with a local HTTP server, open it with Playwright CLI, then run `run-code --filename=docs/hero-refinement/browser-check.js`. The file is a Playwright CLI callback, not a Node test or an installed runtime dependency.

## Limits

Chrome viewport emulation is not physical iOS/Android testing. No screen-reader session or quantitative FPS/CPU benchmark was performed. No claim of complete WCAG conformance is made. Existing off-hero contrast findings were retained to respect scope. Optional Claude-specific companion skills were not installed; UX accessibility rules and Lighthouse were used for a11y verification. GSAP principles were reviewed as reference; GSAP was not added.
