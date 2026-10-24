# LocalAgent — official product website

This public repository contains **only** the LocalAgent product website, not the private Windows application. It is an in-development project: demo task flows are illustrated simulations, not live agent actions or an available Windows release.

## Development

Open `index.html` locally. The page works offline without a cloud service, external libraries or an AI backend. Node.js 20+ is only needed for the build checks:

```bash
npm run check
npm run build
```

The explicit `dist/` allow-list includes `index.html`, `404.html`, `robots.txt` and six local assets (`styles.css`, `cinematic.css`, `polish.css`, `main.js`, `polish.js`, `favicon.svg`). No other repository content is published.

## GitHub Pages

The repository was renamed to `michazaval/localagent-site` and the previous UniTeam version is preserved at `archive/uniteam-site-before-localagent`. GitHub Pages is configured to build using GitHub Actions. Development process: `feature/* → develop → main`. The site implementer merges verified feature PRs into `develop` without a mandatory separate review. The owner checks the update from `develop` (for example by running the site locally or viewing a PR preview artifact); **only after explicit owner approval** is `develop` merged into `main`. Pushes and pull requests targeting `develop` run CI but do **not** deploy. A push to `main` builds and publishes only `dist/` to `https://michazaval.github.io/localagent-site/`. GitHub Pages shows **`main` only**, not `develop`.

On pull requests and pushes to `develop`, only validation runs. For deployment, the workflow grants `pages: write` and `id-token: write` in the deployment job, not the PR build. Keep the `github-pages` environment restricted to `main`.

## Product and security boundaries

- The desktop LocalAgent code remains private in `michazaval/LocalAgent` and is **not** included in this site.
- All four animated AI states and three task scenarios are **visual simulations**.
- No analytics, tracking, cloud-LLM calls or remote imagery are required at runtime.
- Do not add secret keys, runtime logs, personal memory, model files, or absolute local paths to this public repository.
- The website supports RU/EN, narrow mobile screens, system reduced motion and a manual decorative-motion toggle.
- URLs beneath `/localagent-site/` use the project base path; `404.html` links safely back to the project root.

## QA

Run `npm run build` (static and Node tests) and smoke-check Chromium and Firefox at 320, 390, 768, 1024 and 1440 px. Test language toggle, mobile menu, demo scenarios, animation pause, keyboard focus and links. Browser acceptance remains separate from static tests.
