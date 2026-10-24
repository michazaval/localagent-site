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

## Publishing with GitHub Pages

1. Rename the repository from `uniteam-site` to `localagent-site` in **Settings → General → Repository name** (owner action).
2. In **Settings → Pages**, set the source to **GitHub Actions**.
3. Review and merge the website PR into `main` **after the rename**, so GitHub Actions validates and deploys the static bundle.
4. The anticipated URL is `https://michazaval.github.io/localagent-site/` once Pages reports a successful deployment.

Pull requests only validate; they do **not** deploy. Deployment requires `main` on `michazaval/localagent-site`. `github-pages` environment should allow deployments from `main` only.

The original UniTeam site is retained in `archive/uniteam-site-before-localagent`. Renaming a repository does **not** redirect GitHub Pages project-site URLs; the former `/uniteam-site/` link may stop working.

## Privacy and security

- This repo is public. Never push private LocalAgent application code, SQLite databases, logs, local paths, weights, passwords, tokens, or user data.
- The site has no cloud LLM or telemetry requirements.
- The private Windows project remains in `michazaval/LocalAgent`.
- Everything depicted as an interaction is a **simulation** until real functionality is independently verified and released.
