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

### Integration boundary: one PR cannot update every branch

This configuration change targets **main**, without importing develop's unfinished design. Until it is merged and synchronized by the integrator, automatic CI is **not globally disabled**. GitHub evaluates push workflows from the pushed ref and PR workflows from the PR merge ref; changing default main alone does not rewrite other branches. [GitHub event semantics](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows) and [manual default-branch requirement](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow) apply.

Audit on 2026-10-30: main `9ad1c12210df96c7b6b2c873de96948f41957ba3`, develop `9ad380ee1f7b0d828db03afb489a494968502668`; both contain PR/push verification and push/workflow_run publication. Open #3 promotes develop to main; #18 targets develop from `feature/site-v3-design-explorations` (`197802b754c082f0abd4a7a46171aa897d213751`); stacked #19 targets that branch from `feature/site-v3-orbital-intelligence` (`d264d9df69c6e3da6fd0e75e2901056dfe03ca6a`). #19 additionally contains an unrestricted V3 `pull_request` trigger. Do not update these PRs just to test event behavior.

The integrator must carry this **same reviewed configuration** into develop and coordinate updates of #3/#18/#19, preserving each branch's design and resolving #19's added workflow in favor of the manual version. A local `git merge-tree` rehearsal found content/add-add conflicts in the legacy workflows and README: do not blindly merge whole branches to synchronize configuration. On an authorized target checkout, copy only the reviewed files with `git restore --source=<reviewed-commit> -- .github/workflows/pages.yml .github/workflows/publish-pages.yml .github/workflows/site-v3-experiments.yml tests/workflows.test.mjs`, inspect the diff and rerun local checks before an approved commit. Reconcile this README section without replacing branch-specific content. No extra migration PR is created here. Do not merge #3 as a shortcut: that would promote the unfinished site. Updating foreign branches or bypassing protection is not authorized by this PR.

Other existing branches retain legacy YAML too: `feature/align-preview-docs`, `feature/develop-preview-sync`, `feature/localagent-site-living-interface`, `feature/pages-develop-preview`, `feature/site-premium-hero-refinement`, `feature/visual-refinement-v2-1`, `feature/visual-rework-v2`, `feature/website-polish-v1-1`, `fix/scene-double-stripes`. Their old PR triggers can run if reused; any reused branch must receive the reviewed configuration before further PR activity. The archive branch contains no workflow. No branch is silently rewritten or deleted here.

Before declaring completion, re-audit every live branch and PR merge tree: only `workflow_dispatch` may remain under `on`, and no automated `workflow_run` consumer may remain. Run `node --test tests/workflows.test.mjs` on synchronized copies, plus parse the YAML with an Actions-aware validator. At the audit, API returned `Branch not protected` for main/develop and no repository rulesets; therefore no enforced required status check was found. Recheck at integration time; preserve any newly introduced protection and stop for an owner decision if it requires an automatically produced check. Pages already uses Actions with HTTPS and the `github-pages` environment permits main; those settings are unchanged. The GitHub-managed historical `pages-build-deployment` entry is not a repository YAML; do not change Pages back to branch/Jekyll publishing, which could restore automatic builds.

## Privacy and security

- This repo is public. Never push private LocalAgent application code, SQLite databases, logs, local paths, weights, passwords, tokens, or user data.
- The site has no cloud LLM or telemetry requirements.
- The private Windows project remains in `michazaval/LocalAgent`.
- Everything depicted as an interaction is a **simulation** until real functionality is independently verified and released.
