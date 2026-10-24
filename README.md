# LocalAgent — official product website

This public repository contains **only** the LocalAgent product website, not the private Windows application. It is an in-development project: demo task flows are illustrated simulations, not live agent actions or an available Windows release.

## Development

Open `index.html` locally. The page works offline without a cloud service, external libraries or an AI backend. Node.js 20+ is only needed for the build checks:

```bash
npm run check
npm run build
```

The explicit `dist/` allow-list includes `index.html`, `404.html`, `robots.txt` and six local assets (`styles.css`, `cinematic.css`, `polish.css`, `main.js`, `polish.js`, `favicon.svg`). No other repository content is published.

## GitHub Pages (two URLs)

The old UniTeam version is retained in `archive/uniteam-site-before-localagent`. Pages is configured to use GitHub Actions, and the project has two URLs:

- **Stable `main`**: https://michazaval.github.io/localagent-site/
- **Preview `develop`**: https://michazaval.github.io/localagent-site/preview/

Workflow: `feature/* → develop → owner QA → main`. A feature PR may merge into `develop` after checks without mandatory independent review. Only an explicit owner-approved release updates `main`.

A successful first-party `develop` CI push triggers a publishing workflow on the default branch. The workflow verifies and builds `main` into the website root and the passing `develop` SHA into `preview/`, then uploads a single allow-listed static artifact. The stable site is never replaced by develop's content. The Pages deploy job runs on `main` and alone has Pages and OIDC write permissions. No extra secrets or hosting services are needed.


## Product and security boundaries

- The desktop LocalAgent code remains private in `michazaval/LocalAgent` and is **not** included in this site.
- All four animated AI states and three task scenarios are **visual simulations**.
- No analytics, tracking, cloud-LLM calls or remote imagery are required at runtime.
- Do not add secret keys, runtime logs, personal memory, model files, or absolute local paths to this public repository.
- The website supports RU/EN, narrow mobile screens, system reduced motion and a manual decorative-motion toggle.
- URLs beneath `/localagent-site/` use the project base path; `404.html` links safely back to the project root.

## QA

Run `npm run build` (static and Node tests) and smoke-check Chromium and Firefox at 320, 390, 768, 1024 and 1440 px. Test language toggle, mobile menu, demo scenarios, animation pause, keyboard focus and links. Browser acceptance remains separate from static tests.
