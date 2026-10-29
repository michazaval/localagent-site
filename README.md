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
- **Preview**: [https://michazaval.github.io/localagent-site/preview/](https://michazaval.github.io/localagent-site/preview/) contains the last owner-published **develop** checkpoint.

Workflow: `feature/* → develop → owner QA → main`. Website feature PRs can be merged into `develop` without mandatory third-party review. Promoting `develop` to `main` requires the owner's explicit approval.

All three workflows in this configuration subscribe **only to `workflow_dispatch`**. Ordinary commits, pushes, PRs, merges, tags and workflow completions do not select a workflow. Local checks and independent review precede a rare QA-approved checkpoint; no hosted run is implied by opening a PR. This follows the owner's [checkpoint policy](https://github.com/michazaval/LocalAgent/issues/149) and [development strategy](https://github.com/michazaval/LocalAgent/blob/develop/docs/DEVELOPMENT_CHECKPOINT_STRATEGY.md). The approved operator controls manual runs organizationally; an approval text field does not authenticate QA or prevent another repository writer from dispatching.

After this configuration reaches default `main`, use **Actions → workflow → Run workflow**, with workflow branch **main**:

| Manual workflow | Inputs and work performed |
| --- | --- |
| `pages.yml` / Verify website | `source_sha`: exact 40-character source commit; `checkpoint`: QA approval reference/purpose. Runs the existing validation, unit tests and allow-listed build. No upload or deployment. |
| `site-v3-experiments.yml` / Verify only | Same inputs, selecting a V3 commit containing `experiments/site-v3/concept-bplus/smoke.mjs`. Retains unit/syntax, production isolation and bounded WebGL smoke. Installs browser tools only for this explicit request. No publication. |
| `publish-pages.yml` / Publish stable and develop preview | `main_sha` and `preview_sha`: owner-approved current HEADs of `main` and `develop`; `checkpoint`: publication approval reference/purpose. Fails before building if either checked-out branch differs. Validates and builds each snapshot once, then publishes both URLs together. |

Use lowercase full SHAs, not branch names or tags. Dispatch against another control branch is refused by the new jobs. Source checks can select experimental commits without merging them. Publication always checks out **main into Stable** and **develop into Preview**; it cannot select a V3 branch instead. QA must separately approve any future experimental content entering develop/main. If a branch advances before checkout, obtain approval for its new SHA rather than silently publishing it.

Publication uploads one combined GitHub Pages artifact (one-day retention): allow-listed `main/dist/*` at the root and allow-listed `develop/dist/*` at `preview/`. Pages replaces the complete tree, so both snapshots are needed even when only one has changed. Do not run a separate verification workflow solely to repeat publication's existing `npm run build` checks. There are no intermediate uploads or cross-workflow triggers. The dependent deployment job alone has `pages: write` and `id-token: write`; build jobs keep read-only access and no persisted checkout credentials. Existing published content stays online between manual publications.

Source is **GitHub Actions** in Settings → Pages. The `github-pages` environment may remain limited to `main`, because deployment is initiated by the workflow on the default branch. No additional GitHub tokens or third-party hosting are required.

The UniTeam version is preserved in `archive/uniteam-site-before-localagent`. Pages URLs do not redirect automatically when a repository is renamed.

Note: active PR #19 has its experiment workflow synced to manual-only; historical feature branches may still contain old workflow definitions. Do not revive/merge old trigger YAML when reusing those branches; compare against the current `main` manual policy first.

## Privacy and security

- This repo is public. Never push private LocalAgent application code, SQLite databases, logs, local paths, weights, passwords, tokens, or user data.
- The site has no cloud LLM or telemetry requirements.
- The private Windows project remains in `michazaval/LocalAgent`.
- Everything depicted as an interaction is a **simulation** until real functionality is independently verified and released.
