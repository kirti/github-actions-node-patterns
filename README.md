# github-actions-node-patterns

> 8 production-ready GitHub Actions workflows for Node.js — CI, caching, matrix builds, PR automation, security audits, and automated releases. Copy-paste ready.

[![CI](https://img.shields.io/github/actions/workflow/status/kirti/github-actions-node-patterns/nodejs-ci.yml?label=CI&style=flat-square)](https://github.com/kirti/github-actions-node-patterns/actions)
[![Node](https://img.shields.io/badge/node-18%20%7C%2020%20%7C%2022-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-00d4aa?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/live-demo-6366f1?style=flat-square)](https://kirti.github.io/github-actions-node-patterns/)

---

## Live Demo

👉 **[kirti.github.io/github-actions-node-patterns](https://kirti.github.io/github-actions-node-patterns/)**
<img width="1559" height="937" alt="preview2" src="https://github.com/user-attachments/assets/f09f8564-c3df-4069-9552-b603740d6304" />
<img width="1362" height="1029" alt="preview" src="https://github.com/user-attachments/assets/def286bd-86e2-4989-96af-4c540c6cf600" />

Interactive dashboard showing all 8 workflows, pipeline flow diagram, and copy-paste code snippets.

![CI/CD Dashboard](https://kirti.github.io/github-actions-node-patterns/preview.png)

---

## What's Inside

| # | Workflow File | What it does | Triggers |
|---|--------------|-------------|---------|
| 1 | `nodejs-ci.yml` | Core CI — test + build on every push | push, PR |
| 2 | `cache-ci.yml` | CI with npm caching — 80% faster builds | push, PR |
| 3 | `matrix-ci.yml` | Tests Node 18, 20, 22 in parallel | push, PR |
| 4 | `deploy.yml` | Auto-deploy to GitHub Pages on merge | push to master |
| 5 | `pr-automation.yml` | Auto-label PRs + post size stats | PR open/update |
| 6 | `pr-checks.yml` | Lint + test + build + PR comment | PR open/update |
| 7 | `npm-audit-security.yml` | CVE scanning + auto-open issue | push + weekly |
| 8 | `release-automation.yml` | Version bump + changelog + GitHub Release | push to main |

---

## Workflow Details

### 1. Node.js CI — `nodejs-ci.yml`

The baseline every Node.js project needs. Runs on every push and pull request.

**What it does:**
- Checks out code
- Sets up Node.js 22 (latest LTS)
- Runs `npm ci` for clean install
- Runs tests with `--passWithNoTests`
- Builds the project

**When to use:** Every project. This is non-negotiable.

```yaml
on:
  push:
    branches: [ master, main ]
  pull_request:
    branches: [ master, main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm test -- --passWithNoTests --watchAll=false
      - run: npm run build
```

---

### 2. CI with Caching — `cache-ci.yml`

Adds npm dependency caching to cut pipeline time by up to 80% on warm runs.

**What it does:**
- Everything from nodejs-ci.yml
- Caches `~/.npm` keyed to `package-lock.json` hash
- Uploads coverage report as artifact (7-day retention)
- Warm runs skip `npm install` entirely

**The key insight:** Cache key uses `hashFiles('**/package-lock.json')` — not `package.json`. Lock file changes mean real dependency changes.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'              # Built-in caching

- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Performance gain:** Cold run ~4 min → warm run ~45 sec on a typical Node.js project.

---

### 3. Matrix CI — `matrix-ci.yml`

Tests your code against Node 18, 20, and 22 simultaneously — in parallel.

**What it does:**
- Spins up 3 runners at the same time
- Each runs the full test suite on a different Node version
- Catches version-specific incompatibilities before they reach production

**Why this matters:** You write code on Node 22. Your users might run Node 18. This catches the gap before they do.

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

**Pro tip:** Add `fail-fast: false` to see all failures, not just the first.

---

### 4. Deploy to GitHub Pages — `deploy.yml`

Builds the React app and deploys to GitHub Pages automatically on every push to master.

**What it does:**
- Triggers on push to master only (not PRs)
- Builds with `CI: false` to treat warnings as warnings, not errors
- Configures GitHub Pages environment
- Deploys build output — zero manual steps

**Critical settings:**
```yaml
permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false   # Finish current deploy before starting new one
```

**One-time setup:** Go to repo Settings → Pages → Source → **GitHub Actions**

---

### 5. PR Automation — `pr-automation.yml`

Three jobs run automatically on every pull request: auto-labelling, size classification, and stats comment.

**Job 1 — Auto-label by file type:**
| Files changed | Label added |
|--------------|-------------|
| `.github/workflows/` | `workflows` |
| `src/` | `source-code` |
| `*.test.*` | `tests` |
| `*.md` | `documentation` |
| `package.json` | `dependencies` |
| `*.css` / `*.scss` | `styles` |

**Job 2 — Size label:**
| Lines changed | Label |
|--------------|-------|
| < 50 | `size/XS` |
| 50–199 | `size/S` |
| 200–499 | `size/M` |
| 500–999 | `size/L` |
| 1000+ | `size/XL` |

**Job 3 — Stats comment:** Posts a comment with additions, deletions, files changed, file types breakdown, and review recommendation. Updates the comment on subsequent pushes instead of creating duplicates.

**Required permission:**
```yaml
permissions:
  pull-requests: write
```

---

### 6. PR Checks — `pr-checks.yml`

Runs the full quality check suite on every PR and posts a pass/fail comment.

**What it does:**
- Runs ESLint (continues on error if no lint script)
- Runs tests with coverage
- Builds with strict mode (`CI: true`)
- Checks and logs build size
- Uploads coverage artifact
- Posts ✅ or ❌ comment on the PR with a link to the run

**Key pattern — `if: always()`:**
```yaml
comment:
  needs: test
  if: always()    # Post the comment even if tests fail
```

Without `if: always()`, the comment job skips when tests fail — you'd never get the failure notification.

---

### 7. Security Audit — `npm-audit-security.yml` ⭐ NEW

Scans all dependencies for CVEs on every push AND every Monday morning. Auto-opens a GitHub issue if critical vulnerabilities are found.

**What it does:**
- Runs `npm audit --audit-level=critical`
- Saves full audit results as artifact (30-day retention)
- Fails pipeline on critical CVEs
- Auto-creates a GitHub issue with remediation steps on scheduled runs
- Updates existing issue instead of duplicating
- Posts a summary table to the workflow run

**Why the schedule matters:**
```yaml
schedule:
  - cron: '0 9 * * 1'   # Every Monday 9am UTC
```
Dependencies you haven't touched can get newly discovered CVEs. Waiting for a push means you won't know until you next change something. Weekly scanning catches it proactively.

**Remediation when it fails:**
```bash
npm audit fix                 # fix non-breaking changes
npm audit fix --force         # fix including major version bumps
npm audit                     # see full report
```

---

### 8. Release Automation — `release-automation.yml` ⭐ NEW

On merge to main: reads commit messages, bumps semver automatically, generates a changelog, and creates a GitHub Release. Zero manual release steps.

**What it does:**
- Only triggers on `feat:`, `fix:`, or `release:` commits (skips chores)
- Auto-detects release type from commit message
- Bumps version in `package.json`
- Generates categorised changelog from git history
- Commits the version bump with `[skip ci]`
- Creates GitHub Release with release notes

**Semver detection:**
| Commit message | Version bump |
|---------------|-------------|
| `fix: resolve cache bug` | patch `1.0.1` |
| `feat: add dark mode` | minor `1.1.0` |
| `BREAKING CHANGE: new API` | major `2.0.0` |

**Manual trigger:**
```yaml
workflow_dispatch:
  inputs:
    release_type:
      type: choice
      options: [patch, minor, major]
```

Go to Actions → Release Automation → Run workflow → choose type.

---

## Quick Start — Use in Your Project

```bash
# Clone the repo
git clone https://github.com/kirti/github-actions-node-patterns

# Copy whichever workflows you need
cp .github/workflows/nodejs-ci.yml        your-repo/.github/workflows/
cp .github/workflows/cache-ci.yml         your-repo/.github/workflows/
cp .github/workflows/npm-audit-security.yml your-repo/.github/workflows/
cp .github/workflows/pr-automation.yml    your-repo/.github/workflows/

# Push — workflows trigger automatically
git add . && git commit -m "ci: add github actions" && git push
```

---

## Full Pipeline — What Happens on Every Push

```
Push to feature branch
  ├── nodejs-ci.yml          → fast feedback (pass/fail in ~45s)
  ├── cache-ci.yml           → tests + coverage report
  └── matrix-ci.yml         → Node 18, 20, 22 in parallel

Open pull request
  ├── pr-automation.yml      → auto-labels + size badge + stats comment
  ├── pr-checks.yml          → lint + test + build + ✅/❌ comment
  └── npm-audit-security.yml → CVE scan

Merge to master
  └── deploy.yml             → build + deploy to GitHub Pages (~2 min)

Push to main (conventional commit)
  └── release-automation.yml → version bump + changelog + GitHub Release

Every Monday 9am
  └── npm-audit-security.yml → scheduled CVE scan + auto-issue if found
```

---

## Setup Checklist

- [ ] Enable GitHub Pages: Settings → Pages → Source → **GitHub Actions**
- [ ] Create labels in your repo: `workflows`, `source-code`, `tests`, `documentation`, `dependencies`, `styles`, `size/XS`, `size/S`, `size/M`, `size/L`, `size/XL`, `security`, `automated`
- [ ] For npm publish: add `NPM_TOKEN` secret in Settings → Secrets → Actions
- [ ] Update branch names if your default is `main` not `master`

---

## Related

- [skillforge-ai](https://www.npmjs.com/package/skillforge-ai) — AI skill files that generated this project's demo site
- [zero-code-apps](https://kirti.github.io/zero-code-apps) — Live demo platform built with skillforge-ai

---

*Built by [Kirti Kaushal](https://www.linkedin.com/in/kirti3/) —  Full Stack Engineer * AI/ML * Agent AI 
*[LinkedIn](https://www.linkedin.com/in/kirti3/) · [Medium](https://kirtikau.medium.com) · [npm](https://www.npmjs.com/package/skillforge-ai)*
