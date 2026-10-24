# LocalAgent — official product website

This public repository contains **only the static LocalAgent website**, not the LocalAgent Windows application.

LocalAgent is a Windows AI assistant **in active development**. This website's interactive examples are visual simulations, not live AI operations. No stable Windows download is advertised until a verified release is approved.

## Development

Open `index.html` locally in a browser. No build tooling is required to use the static page.

To validate and prepare an explicit allow-listed deploy bundle with Node.js 20+:

```bash
npm run check
npm run build
```

This creates `dist/` from these files only: `index.html`, `404.html`, `robots.txt`, `assets/main.js`, `assets/styles.css`, `assets/cinematic.css`, and `assets/favicon.svg`.

## GitHub Pages — stable and develop preview

This repository uses two development branches:

- **Stable**: [https://michazaval.github.io/localagent-site/](https://michazaval.github.io/localagent-site/) contains **main** only.
- **Preview**: [https://michazaval.github.io/localagent-site/preview/](https://michazaval.github.io/localagent-site/preview/) contains the latest successfully verified **develop**.

Workflow: `feature/* → develop → owner QA → main`. Website feature PRs can be merged into `develop` without mandatory third-party review. Promoting `develop` to `main` requires the owner's explicit approval.

On a successful `develop` push check, a privileged **default-branch** workflow rebuilds both folders and publishes one GitHub Pages artifact: allow-listed `main/dist/*` at the root and allow-listed `develop/dist/*` at `preview/`. A `main` push also rebuilds the combined site. Consequently, a `develop` update cannot change the stable site's files. The deployment job alone has `pages: write` and `id-token: write` permissions; previews only run from verified first-party pushes, not pull request events.

Source is **GitHub Actions** in Settings → Pages. The `github-pages` environment may remain limited to `main`, because deployment is initiated by the workflow on the default branch. No additional GitHub tokens or third-party hosting are required.

The UniTeam version is preserved in `archive/uniteam-site-before-localagent`. Pages URLs do not redirect automatically when a repository is renamed.

## Privacy and security

- This repo is public. Never push private LocalAgent application code, SQLite databases, logs, local paths, weights, passwords, tokens, or user data.
- The site has no cloud LLM or telemetry requirements.
- The private Windows project remains in `michazaval/LocalAgent`.
- Everything depicted as an interaction is a **simulation** until real functionality is independently verified and released.
