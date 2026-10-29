# B · Immersive Signal — living green space

Owner direction update, 30 October 2026: green immersive particle/volume space is the priority. This is a **selection-prototype refinement under #12**, stacked on PR #19. It does not authorize the production stages #13–17.

## Open and compare

Current owner-machine URL: **http://127.0.0.1:8774/experiments/site-v3/concept-b-immersive/** (bounded local preview). It has been opened in Codex. No remote publication or change to the public `/preview/` site was performed.

For a fresh checkout:

```sh
python experiments/site-v3/preview.py --concept immersive --open --minutes 60
```

The runner defaults to loopback port 8770; add `--port 8774` if needed. Windows users can double-click [start-preview.cmd](start-preview.cmd). The server expires automatically and supports Ctrl+C. The [comparison gallery](../) marks this B as priority; clean A stays available, C now has green materials/lighting, and the previous [B](../concept-b/) / [orbital B+](../concept-bplus/) remain separate studies.

## Direction, not just decoration

One full-viewport spatial scene accompanies four native-scroll chapters. It moves to support the copy rather than covering it with an unrelated animation:

1. **Signal:** an original folded, filled particle volume, with sparse near/far ambient points. It introduces an independent Windows assistant in development.
2. **Possible path:** the volume opens into a directed stream; an illustrative request and its steps emerge from the scene.
3. **Boundary:** the same point population gathers onto a perspective boundary; a reversible permission simulation makes user control concrete.
4. **Horizon:** the structure releases into a quiet horizon as the copy describes development status without a download/release promise.

The transformation interpolates particle positions, camera-side composition and field energy. Headings, explanatory text and cards use scroll-linked transform/opacity, without clipping content or removing it from the accessibility tree. No scroll locks, wheel interception, duplicated hidden chapters, mandatory loading screen or artificial progress wait.

## Visual language

Black-green `#030d08`, deep forest `#06180f`, sage secondary copy `#b1cbb6`, light text `#edf7e9`, controlled mint `#b5ed9f`. System sans with Cyrillic support; no downloaded fonts. Bright geometry is composed opposite the main copy, while opaque-enough content panels protect reading. Mobile moves the first volume above the introduction and uses a lighter point count.

The supplied issue describes the desired craft of a reference montage. This work interprets that description with original math, layout, copy and SVG points; no Pinterest imagery, shader, brand or UI was copied. No claim of pixel-level fidelity to the unavailable original recording is made.

## Technical choices / safeguards

- Native WebGL2, original volumetric point shader and deterministic geometry. High: 18,000 points, 60Hz target and capped 2.15MP/DPR2 buffer. Balanced: 6,500 points, 30Hz target and capped 0.95MP/DPR1.25. Lite: static original SVG plus complete HTML content.
- Reuses the tested B+ render lifecycle, GPU queries, profile selection, pause, reduced-motion, visibility and context recovery. Existing B+ geometry is retained. No third rendering framework, new package, external runtime service, analytics or cloud model is required.
- Time/phase and scroll interpolation use delta time. GPU buffers are static; shape changes happen in the vertex shader. Particle depth affects perspective, fog and apparent size. It is a spatial point volume, not a fullscreen 2D noise texture.
- IDLE / THINK / LISTEN / ACT remain interactive simulations. THINK folds depth, LISTEN applies radial waves, ACT directs flow; the scene stays green rather than assigning the artistic identity to color changes.
- Pause and reduced motion freeze the particle simulation and scroll transformation. Their content reveals become fully visible. Without JS the SVG, all chapter copy and native links remain, while script-only controls are hidden. No-WebGL uses the same content with a static illustration.
- Desktop chapter links occupy a reserved side rail. On tablet/mobile they sit at the start of the story instead of floating over the mode buttons or copy. Controls remain native, named and keyboard reachable.

## Evidence and verification

[Raw browser / frame / GPU results](evidence/verification.json). The Playwright CLI callback [qa.js](qa.js) is run from the repository root against port 8774. It captures each chapter on desktop/mobile, checks 6 widths × 2 locales × 4 chapters, modes, profiles, keyboard/touch, pause/reduced-motion scroll freeze, permission simulation and no-WebGL/no-JS content. The isolated PR-only CI smoke additionally verifies real WebGL, constrained-device opt-in, profiles and scroll progress. Production `dist` excludes experiments.

| Evidence | Link |
|---|---|
| Desktop hero / scenario / boundary / horizon | [0](evidence/1440-chapter-0.png) / [1](evidence/1440-chapter-1.png) / [2](evidence/1440-chapter-2.png) / [3](evidence/1440-chapter-3.png) |
| Mobile chapters | [0](evidence/390-chapter-0.png) / [1](evidence/390-chapter-1.png) / [2](evidence/390-chapter-2.png) / [3](evidence/390-chapter-3.png) |
| 1920 / 430 / RU | [1920](evidence/1920-hero.png) / [430](evidence/430-hero.png) / [RU](evidence/390-ru.png) |
| Green cinematic C | [C](evidence/c-green.png) |
| Recorded scroll + interactions | [MP4](evidence/motion.mp4) |

Chrome DevTools mobile Lighthouse: accessibility 100 / best practices 100 in the performed run. No console warnings/errors or failed resources were reported during its network inspection. Noindex is deliberate. These are automated checks, not screen-reader or full WCAG certification.

Frame/GPU sampling is a short high-end Windows/RTX 3090 Ti run, with 3.5-second waits per chapter/profile and bounded rolling metrics, **not independent per-chapter or sustained thermal benchmarks**. Sampling windows can include the preceding transition. GPU queries measure submitted scene work, not browser compositor or display latency. See JSON for exact samples rather than extrapolating earlier B+ numbers to this larger scene.

## Known limits and review gate

No physical phones, screen-reader session, Safari/Firefox or long-duration battery/thermal run. Mobile deliberately reduces spatial scale and density; selecting High manually can cost more on weak devices. Static fallback does not reproduce the spatial transformations. The novel form and choreography still require the owner's visual decision.

Early verification caught mobile navigation overlay and offscreen card drift; both were corrected before the final pass. A remains the clean alternative; C's earlier copper captures are historical, while this revision uses green materials and surroundings.

No production index/assets/build/deployment files or main branch are changed. No merge, release, or production implementation stages have been started. Review this exact revision before advancing the queue.
