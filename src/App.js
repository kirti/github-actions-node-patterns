import './App.css';

const workflows = [
  {
    name: "Node.js CI",
    file: "nodejs-ci.yml",
    desc: "Core CI pipeline — checkout, setup Node 22, install, test, and build on every push and PR. The baseline every Node.js project needs.",
    tags: ["push", "pull_request", "node-22", "build"],
  },
  {
    name: "CI with Caching",
    file: "cache-ci.yml",
    desc: "Adds npm dependency caching to CI. Cache key hashed from package-lock.json — warm runs skip install entirely, cutting pipeline time by up to 80%.",
    tags: ["npm-cache", "coverage", "artifacts"],
  },
  {
    name: "Matrix CI",
    file: "matrix-ci.yml",
    desc: "Runs tests in parallel across Node 18, 20, and 22 simultaneously. Catch version-specific bugs before they hit production.",
    tags: ["matrix", "node-18", "node-20", "node-22", "parallel"],
  },
  {
    name: "Deploy to GitHub Pages",
    file: "deploy.yml",
    desc: "Builds the React app and deploys to GitHub Pages on every merge to master. Concurrency control prevents overlapping deployments.",
    tags: ["deploy", "github-pages", "concurrency", "permissions"],
  },
  {
    name: "PR Automation",
    file: "pr-automation.yml",
    desc: "Auto-labels PRs by file type (workflows, source, docs, deps), adds size labels (XS→XL), and posts a stats comment with change breakdown.",
    tags: ["auto-label", "size-label", "pr-comment", "github-script"],
  },
  {
    name: "PR Checks",
    file: "pr-checks.yml",
    desc: "Runs lint, tests with coverage, and build on every PR. Posts a pass/fail comment with a link to detailed results. Fails fast on warnings.",
    tags: ["lint", "coverage", "build-size", "pr-comment"],
  },
  {
    name: "Security Audit",
    file: "npm-audit-security.yml",
    desc: "Scans dependencies for CVEs on every push and weekly schedule. Fails on critical vulnerabilities. Auto-opens an issue with remediation steps.",
    tags: ["npm-audit", "cve", "security", "scheduled", "NEW"],
    isNew: true,
  },
  {
    name: "Release Automation",
    file: "release-automation.yml",
    desc: "On merge to main: bumps version, generates changelog from commit messages, creates GitHub Release, and publishes to npm. Zero manual steps.",
    tags: ["semver", "changelog", "github-release", "npm-publish", "NEW"],
    isNew: true,
  },
];

const pipelineSteps = [
  { icon: "⬆️", name: "Push / PR", time: "trigger" },
  { icon: "🔍", name: "Checkout", time: "~2s" },
  { icon: "⚙️", name: "Setup Node", time: "~8s" },
  { icon: "📦", name: "npm ci", time: "~20s*" },
  { icon: "🧪", name: "Test", time: "~15s" },
  { icon: "🏗️", name: "Build", time: "~30s" },
  { icon: "🚀", name: "Deploy", time: "~10s" },
];

export default function App() {
  return (
    <div className="app">
      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">GitHub Actions · Node.js Patterns</div>
        <h1>CI/CD that <span>actually works</span><br />in production</h1>
        <p className="mono">
          8 battle-tested GitHub Actions workflows for Node.js —
          CI, caching, matrix builds, PR automation, security audits,
          and automated releases. Copy-paste ready.
        </p>
        <div className="badge-row">
          <span className="badge badge-green">✓ 8 Workflows</span>
          <span className="badge badge-blue">Node 18 · 20 · 22</span>
          <span className="badge badge-teal">GitHub Pages</span>
          <span className="badge badge-amber">Security Scanning</span>
          <span className="badge badge-purple">Auto Release</span>
        </div>
        <p className="mono" style={{fontSize:'11px', color:'var(--text2)'}}>
          * with npm caching enabled · ~45s total pipeline
        </p>
      </section>

      {/* Metrics */}
      <div className="section">
        <div className="section-label">By the numbers</div>
        <div className="metrics">
          <div className="metric"><div className="metric-val">8</div><div className="metric-label">workflow files</div></div>
          <div className="metric"><div className="metric-val"><span>80</span>%</div><div className="metric-label">faster with caching</div></div>
          <div className="metric"><div className="metric-val">3</div><div className="metric-label">Node versions tested</div></div>
          <div className="metric"><div className="metric-val"><span>0</span></div><div className="metric-label">manual deploys needed</div></div>
        </div>
      </div>

      {/* Pipeline viz */}
      <div className="section">
        <div className="section-label">Full pipeline — push to deploy</div>
        <div className="pipeline">
          <div className="pipeline-title mono">// what happens on every push to master</div>
          <div className="pipeline-flow">
            {pipelineSteps.map((step, i) => (
              <div key={i} className="pipeline-step">
                <div className="step-box">
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-name">{step.name}</div>
                  <div className="step-time">{step.time}</div>
                </div>
                {i < pipelineSteps.length - 1 && <span className="arrow">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All workflows */}
      <div className="section">
        <div className="section-label">All workflows</div>
        <div className="workflow-grid">
          {workflows.map((wf, i) => (
            <div key={i} className={`wf-card ${wf.isNew ? 'wf-card-new' : ''}`}>
              <div className="wf-card-head">
                <div>
                  <div className="wf-name">{wf.name}</div>
                  <div className="wf-file mono">.github/workflows/{wf.file}</div>
                </div>
                <div className="status-dot" style={wf.isNew ? {background:'var(--accent3)', boxShadow:'0 0 6px var(--accent3)'} : {}}></div>
              </div>
              <div className="wf-desc">{wf.desc}</div>
              <div className="wf-tags">
                {wf.tags.map((tag, j) => (
                  <span key={j} className={`wf-tag ${tag === 'NEW' ? 'badge badge-amber' : ''}`}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New workflows highlight */}
      <div className="section">
        <div className="section-label">New additions</div>

        <div className="new-wf">
          <div className="new-wf-head">
            <span className="new-badge">NEW</span>
            <span className="new-wf-title">Security Audit Workflow</span>
          </div>
          <div className="new-wf-desc">
            Automatically scans all dependencies for known CVEs on every push and on a weekly schedule.
            Fails the pipeline on critical vulnerabilities and auto-creates a GitHub issue with remediation steps.
            Directly inspired by real dependency governance work on enterprise Node.js repositories.
          </div>
          <div className="code-block"><span className="cm"># .github/workflows/npm-audit-security.yml</span>
<span className="kw">name</span>: <span className="str">Security Audit</span>
<span className="kw">on</span>:
  <span className="kw">push</span>:
    <span className="kw">branches</span>: <span className="str">[ main, master ]</span>
  <span className="kw">schedule</span>:
    - <span className="kw">cron</span>: <span className="str">'0 9 * * 1'</span>  <span className="cm"># Every Monday 9am</span>

<span className="kw">jobs</span>:
  <span className="kw">audit</span>:
    <span className="kw">runs-on</span>: <span className="str">ubuntu-latest</span>
    <span className="kw">steps</span>:
      - <span className="kw">uses</span>: <span className="str">actions/checkout@v4</span>
      - <span className="kw">run</span>: <span className="val">npm audit --audit-level=critical</span>
      - <span className="kw">name</span>: <span className="str">Auto-create issue on failure</span>
        <span className="kw">if</span>: <span className="val">failure()</span>
        <span className="kw">uses</span>: <span className="str">actions/github-script@v7</span></div>
        </div>

        <div className="new-wf" style={{marginTop:'10px'}}>
          <div className="new-wf-head">
            <span className="new-badge">NEW</span>
            <span className="new-wf-title">Release Automation Workflow</span>
          </div>
          <div className="new-wf-desc">
            On merge to main: reads conventional commits, bumps semver automatically,
            generates a changelog, creates a GitHub Release with release notes,
            and optionally publishes to npm. Zero manual release steps ever again.
          </div>
          <div className="code-block"><span className="cm"># .github/workflows/release-automation.yml</span>
<span className="kw">name</span>: <span className="str">Release Automation</span>
<span className="kw">on</span>:
  <span className="kw">push</span>:
    <span className="kw">branches</span>: <span className="str">[ main ]</span>

<span className="kw">jobs</span>:
  <span className="kw">release</span>:
    <span className="kw">runs-on</span>: <span className="str">ubuntu-latest</span>
    <span className="kw">steps</span>:
      - <span className="kw">uses</span>: <span className="str">actions/checkout@v4</span>
      - <span className="kw">name</span>: <span className="str">Bump version + changelog</span>
        <span className="kw">run</span>: <span className="val">npx standard-version</span>
      - <span className="kw">name</span>: <span className="str">Create GitHub Release</span>
        <span className="kw">uses</span>: <span className="str">actions/create-release@v1</span>
      - <span className="kw">name</span>: <span className="str">Publish to npm</span>
        <span className="kw">run</span>: <span className="val">npm publish</span></div>
        </div>
      </div>

      {/* Quick start */}
      <div className="section">
        <div className="section-label">Use in your project</div>
        <div className="pipeline">
          <div className="pipeline-title mono">// copy any workflow to your repo</div>
          <div className="code-block"><span className="cm"># Clone the repo</span>
<span className="val">git clone https://github.com/kirti/github-actions-practice</span>

<span className="cm"># Copy whichever workflow you need</span>
<span className="val">cp .github/workflows/nodejs-ci.yml your-repo/.github/workflows/</span>
<span className="val">cp .github/workflows/npm-audit-security.yml your-repo/.github/workflows/</span>
<span className="val">cp .github/workflows/pr-automation.yml your-repo/.github/workflows/</span>

<span className="cm"># Push — workflows trigger automatically</span>
<span className="val">git add . && git commit -m "ci: add github actions" && git push</span></div>
        </div>
      </div>

      <footer className="footer">
        <div>Built by <a href="https://www.linkedin.com/in/kirti3/" target="_blank" rel="noreferrer">Kirti Kaushal</a> · Senior AI/ML + Full Stack Engineer</div>
        <div style={{marginTop:'4px'}}>
          <a href="https://github.com/kirti/github-actions-practice" target="_blank" rel="noreferrer">GitHub</a>
          {' · '}
          <a href="https://kirtikau.medium.com" target="_blank" rel="noreferrer">Medium</a>
          {' · '}
          <a href="https://www.linkedin.com/in/kirti3/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}
