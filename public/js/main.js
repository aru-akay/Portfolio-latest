'use strict';

/* ── MERMAID INIT ────────────────────────────────────────────── */
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: { primaryColor: '#00ff88', primaryTextColor: '#e8f0f7', lineColor: '#00cfff', edgeLabelBackground: '#0e1318' },
  flowchart: { curve: 'basis' },
});

/* ── THEME SYSTEM ────────────────────────────────────────────── */
const html = document.documentElement;
const dots = document.querySelectorAll('.theme-dot');
const mermaidThemes = {
  dark:    { theme: 'dark',    vars: { primaryColor:'#00ff88', primaryTextColor:'#e8f0f7', lineColor:'#00cfff', edgeLabelBackground:'#0e1318' } },
  light:   { theme: 'default', vars: { primaryColor:'#00a855', primaryTextColor:'#0d1b2a', lineColor:'#0077cc', edgeLabelBackground:'#f0f4f8' } },
  hacker:  { theme: 'dark',    vars: { primaryColor:'#00ff00', primaryTextColor:'#00ff00', lineColor:'#00cc00', edgeLabelBackground:'#000000' } },
  ocean:   { theme: 'dark',    vars: { primaryColor:'#00cfff', primaryTextColor:'#c8e8ff', lineColor:'#7b61ff', edgeLabelBackground:'#041425' } },
  sunset:  { theme: 'dark',    vars: { primaryColor:'#ff6b35', primaryTextColor:'#ffe8d6', lineColor:'#ff3cac', edgeLabelBackground:'#1a0a1f' } },
  minimal: { theme: 'neutral', vars: { primaryColor:'#333333', primaryTextColor:'#111111', lineColor:'#666666', edgeLabelBackground:'#ffffff' } },
};

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  dots.forEach(d => d.classList.toggle('active', d.dataset.theme === theme));
  const m = mermaidThemes[theme] || mermaidThemes.dark;
  mermaid.initialize({ startOnLoad: false, theme: m.theme, themeVariables: m.vars, flowchart: { curve: 'basis' } });
}

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);
dots.forEach(dot => dot.addEventListener('click', () => applyTheme(dot.dataset.theme)));

/* ── MOBILE NAV ──────────────────────────────────────────────── */
const burger = document.getElementById('burger');
const navMobile = document.getElementById('navMobile');
burger.addEventListener('click', () => navMobile.classList.toggle('open'));
navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMobile.classList.remove('open')));

/* ── TERMINAL TYPEWRITER ─────────────────────────────────────── */
const terminalBody = document.getElementById('terminalBody');
const lines = [
  { text: '$ docker build -t anand/portfolio:latest .', type: 'cmd', delay: 400 },
  { text: 'Step 1/6 : FROM node:20-alpine', type: 'out', delay: 900 },
  { text: 'Successfully built a3f91c2d  ✓', type: 'ok', delay: 1600 },
  { text: '$ docker run -d -p 3000:3000 anand/portfolio:latest', type: 'cmd', delay: 2200 },
  { text: 'Container started: 7f3b91e2d4a1', type: 'ok', delay: 2900 },
  { text: '$ curl http://localhost:3000/health', type: 'cmd', delay: 3500 },
  { text: '{"status":"ok","uptime":"12s"}', type: 'ok', delay: 4100 },
  { text: '$ sudo systemctl reload nginx', type: 'cmd', delay: 4700 },
  { text: 'nginx: configuration OK  ✓', type: 'ok', delay: 5200 },
  { text: '$', type: 'cursor', delay: 5600 },
];
const colorMap = { cmd:'#00ff88', out:'#8fa8c0', ok:'#00cfff', cursor:'#00ff88' };
lines.forEach(({ text, type, delay }) => {
  setTimeout(() => {
    const div = document.createElement('div');
    div.classList.add('t-line');
    if (type === 'cursor') div.innerHTML = `<span style="color:${colorMap[type]}">${text} </span><span class="t-cursor"></span>`;
    else div.innerHTML = `<span style="color:${colorMap[type]}">${text}</span>`;
    terminalBody.appendChild(div);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }, delay);
});

/* ── SCROLL REVEAL ───────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.section, .skill-card, .project-card, .about-card, .stat');
revealEls.forEach(el => el.classList.add('reveal'));
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => observer.observe(el));

/* ── SKILL BAR ANIMATION ─────────────────────────────────────── */
const skillFills = document.querySelectorAll('.sk-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('animated'); barObserver.unobserve(entry.target); } });
}, { threshold: 0.5 });
skillFills.forEach(f => barObserver.observe(f));

/* ── POPUP DATA ──────────────────────────────────────────────── */
const popupData = {

  'skill-cicd': {
    icon: '⚡',
    title: 'CI/CD Pipelines',
    subtitle: 'Continuous Integration & Continuous Deployment',
    body: `
      <h4>What is CI/CD?</h4>
      <p>CI/CD automates the process of building, testing, and deploying code. Every time you push to GitHub, the pipeline runs automatically — no manual steps needed.</p>
      <h4>Tools I Use</h4>
      <div class="modal-tags"><span class="modal-tag">Jenkins</span><span class="modal-tag">GitHub Actions</span><span class="modal-tag">Webhooks</span><span class="modal-tag">Bash Scripts</span></div>
      <h4>What I Can Do</h4>
      <ul>
        <li>Set up Jenkins from scratch on a Linux server</li>
        <li>Write Jenkinsfiles with multi-stage declarative pipelines</li>
        <li>Configure GitHub webhooks to auto-trigger builds on push</li>
        <li>Build, test, and deploy Docker containers automatically</li>
        <li>Add health checks and smoke tests before going live</li>
        <li>Set up build notifications and failure alerts</li>
      </ul>
      <h4>CI/CD Flow Diagram</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// deployment pipeline flow</p>
        <div class="mermaid">
flowchart LR
  A[Developer\nPushes Code] --> B[GitHub\nRepository]
  B --> C{Webhook\nTrigger}
  C --> D[Jenkins\nPipeline]
  D --> E[Checkout\nCode]
  E --> F[Build\nDocker Image]
  F --> G[Smoke\nTest]
  G --> H{Tests\nPass?}
  H -->|Yes| I[Deploy\nContainer]
  H -->|No| J[Notify\nFailure]
  I --> K[App Live\non EC2]
        </div>
      </div>
    `,
  },

  'skill-docker': {
    icon: '🐳',
    title: 'Docker & Containerization',
    subtitle: 'Packaging apps into portable, isolated containers',
    body: `
      <h4>What is Docker?</h4>
      <p>Docker packages your application and all its dependencies into a container — a lightweight, isolated unit that runs the same way on any machine. No more "it works on my machine" problems.</p>
      <h4>Tools I Use</h4>
      <div class="modal-tags"><span class="modal-tag">Docker</span><span class="modal-tag">Docker Compose</span><span class="modal-tag">Dockerfile</span><span class="modal-tag">Docker Hub</span></div>
      <h4>What I Can Do</h4>
      <ul>
        <li>Write optimized multi-stage Dockerfiles</li>
        <li>Build and tag Docker images for production</li>
        <li>Run containers with resource limits and restart policies</li>
        <li>Configure Docker Compose for multi-container apps</li>
        <li>Manage volumes, networks, and environment variables</li>
        <li>Inspect, debug, and exec into running containers</li>
      </ul>
      <h4>Docker Architecture</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// how docker works</p>
        <div class="mermaid">
flowchart TD
  A[Source Code\n+ Dockerfile] --> B[docker build]
  B --> C[Docker Image\nLayered FS]
  C --> D[docker run]
  D --> E[Container\nIsolated Process]
  E --> F[Port Mapping\n3000 → 3000]
  F --> G[App Accessible\nfrom Browser]
  C --> H[Docker Hub\nRegistry]
  H --> I[Pull on\nAny Server]
        </div>
      </div>
    `,
  },

  'skill-aws': {
    icon: '☁️',
    title: 'Cloud — AWS',
    subtitle: 'Amazon Web Services — EC2, Security Groups, IAM',
    body: `
      <h4>My AWS Experience</h4>
      <p>I use AWS EC2 to host and run production applications. I manage server provisioning, network security, SSH access, and cloud infrastructure from scratch.</p>
      <h4>Services I Work With</h4>
      <div class="modal-tags"><span class="modal-tag">EC2</span><span class="modal-tag">Security Groups</span><span class="modal-tag">Key Pairs</span><span class="modal-tag">Elastic IP</span><span class="modal-tag">IAM</span><span class="modal-tag">VPC</span></div>
      <h4>What I Can Do</h4>
      <ul>
        <li>Launch and configure EC2 instances (Ubuntu Linux)</li>
        <li>Set up Security Groups with proper inbound/outbound rules</li>
        <li>SSH into servers and manage them via terminal</li>
        <li>Configure Elastic IPs for consistent public addresses</li>
        <li>Install and manage software stacks (Docker, Jenkins, Nginx)</li>
        <li>Monitor server performance and logs</li>
      </ul>
      <h4>AWS Infrastructure Diagram</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// aws ec2 setup</p>
        <div class="mermaid">
flowchart TD
  A[AWS Cloud] --> B[VPC\nVirtual Network]
  B --> C[EC2 Instance\nUbuntu 22.04]
  C --> D[Security Group]
  D --> E[Port 22\nSSH Access]
  D --> F[Port 80\nHTTP]
  D --> G[Port 443\nHTTPS]
  D --> H[Port 8080\nJenkins]
  C --> I[Docker Engine]
  I --> J[portfolio-app\nContainer]
  I --> K[jenkins\nContainer]
        </div>
      </div>
    `,
  },

  'skill-nginx': {
    icon: '🌐',
    title: 'Nginx & Web Server',
    subtitle: 'Reverse proxy, HTTPS, SSL termination with Certbot',
    body: `
      <h4>What is Nginx?</h4>
      <p>Nginx is a high-performance web server and reverse proxy. I use it to sit in front of my Node.js apps — handling SSL, routing traffic, and serving static files efficiently.</p>
      <h4>Tools I Use</h4>
      <div class="modal-tags"><span class="modal-tag">Nginx</span><span class="modal-tag">Certbot</span><span class="modal-tag">Let's Encrypt</span><span class="modal-tag">SSL/TLS</span></div>
      <h4>What I Can Do</h4>
      <ul>
        <li>Configure Nginx as a reverse proxy for Node.js apps</li>
        <li>Set up free SSL certificates with Certbot + Let's Encrypt</li>
        <li>Force HTTPS redirects from HTTP</li>
        <li>Configure security headers (HSTS, XSS, CSP)</li>
        <li>Enable Gzip compression for faster load times</li>
        <li>Set up rate limiting and custom error pages</li>
      </ul>
      <h4>Nginx Reverse Proxy Flow</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// request flow through nginx</p>
        <div class="mermaid">
flowchart LR
  A[Browser\nRequest] --> B{Port 80\nHTTP?}
  B -->|Yes| C[Redirect\nto HTTPS]
  C --> A
  B -->|No| D[Port 443\nHTTPS]
  D --> E[Nginx\nSSL Termination]
  E --> F[Certbot\nSSL Cert]
  E --> G[Proxy Pass\nlocalhost:3000]
  G --> H[Node.js App\nDocker Container]
  H --> I[Response\nback to user]
        </div>
      </div>
    `,
  },

  'skill-linux': {
    icon: '🐧',
    title: 'Linux & Ubuntu Server',
    subtitle: 'Server administration, Bash scripting, CLI tools',
    body: `
      <h4>My Linux Experience</h4>
      <p>Linux is my daily driver for all DevOps work. I manage Ubuntu servers via SSH, write Bash scripts to automate tasks, and troubleshoot production issues directly in the terminal.</p>
      <h4>Tools & Commands I Use</h4>
      <div class="modal-tags"><span class="modal-tag">Ubuntu 22.04</span><span class="modal-tag">Bash</span><span class="modal-tag">SSH</span><span class="modal-tag">systemctl</span><span class="modal-tag">cron</span><span class="modal-tag">grep/awk/sed</span></div>
      <h4>What I Can Do</h4>
      <ul>
        <li>SSH into remote servers and navigate the filesystem</li>
        <li>Write Bash scripts to automate deployments and backups</li>
        <li>Manage services with systemctl (start, stop, enable)</li>
        <li>Monitor system resources with top, htop, df, free</li>
        <li>Configure firewall rules with ufw</li>
        <li>Debug issues using logs, ps, netstat, and curl</li>
        <li>Set up cron jobs for scheduled automation</li>
      </ul>
      <h4>Typical Workflow on Linux Server</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// linux server management flow</p>
        <div class="mermaid">
flowchart TD
  A[Local Machine] -->|SSH| B[Ubuntu EC2 Server]
  B --> C[Check Running\nServices]
  B --> D[View Docker\nContainers]
  B --> E[Check Nginx\nStatus]
  B --> F[View App\nLogs]
  C --> G[systemctl status]
  D --> H[docker ps]
  E --> I[nginx -t]
  F --> J[docker logs -f]
        </div>
      </div>
    `,
  },

  'skill-dev': {
    icon: '💻',
    title: 'Web Development',
    subtitle: 'Node.js backend, HTML/CSS/JS frontend, Git workflows',
    body: `
      <h4>My Development Background</h4>
      <p>I build full-stack web applications using Node.js for the backend and vanilla HTML, CSS, and JavaScript for the frontend. I use Git and GitHub for version control and collaboration.</p>
      <h4>Tools I Use</h4>
      <div class="modal-tags"><span class="modal-tag">Node.js</span><span class="modal-tag">Express.js</span><span class="modal-tag">HTML5</span><span class="modal-tag">CSS3</span><span class="modal-tag">JavaScript</span><span class="modal-tag">Git</span><span class="modal-tag">GitHub</span></div>
      <h4>What I Can Do</h4>
      <ul>
        <li>Build REST APIs with Node.js and Express</li>
        <li>Create responsive frontends with HTML, CSS, and JavaScript</li>
        <li>Manage packages with npm and handle dependencies</li>
        <li>Use Git for version control — branching, merging, PRs</li>
        <li>Write clean, maintainable code with proper structure</li>
        <li>Deploy Node.js apps inside Docker containers</li>
      </ul>
      <h4>Full Stack Architecture</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// how the portfolio app is built</p>
        <div class="mermaid">
flowchart TD
  A[Browser] --> B[HTML + CSS + JS\nFrontend]
  B --> C[Express.js\nRouter]
  C --> D[GET /\nServe index.html]
  C --> E[GET /health\nJSON response]
  C --> F[POST /api/contact\nHandle form]
  D --> G[Static Files\nfrom public/]
  F --> H[Log to\nconsole]
        </div>
      </div>
    `,
  },

  'proj-jenkins': {
    icon: '🔧',
    title: 'Jenkins CI/CD Pipeline',
    subtitle: 'Automated build, test & deploy pipeline on AWS EC2',
    body: `
      <h4>Project Overview</h4>
      <p>Built a complete end-to-end CI/CD pipeline using Jenkins running in a Docker container on AWS EC2. Every push to GitHub automatically triggers a new build, runs smoke tests, and deploys the updated app with zero manual steps.</p>
      <h4>Tech Stack</h4>
      <div class="modal-tags"><span class="modal-tag">Jenkins</span><span class="modal-tag">Docker</span><span class="modal-tag">AWS EC2</span><span class="modal-tag">Nginx</span><span class="modal-tag">Bash</span><span class="modal-tag">GitHub</span><span class="modal-tag">Node.js</span></div>
      <h4>What It Does</h4>
      <ul>
        <li>Listens for GitHub pushes via webhook or manual trigger</li>
        <li>Checks out latest code from repository</li>
        <li>Builds a new Docker image tagged with build number</li>
        <li>Runs a smoke test — starts container, checks /health endpoint</li>
        <li>Stops old container and starts new one automatically</li>
        <li>Cleans up old images to save disk space</li>
      </ul>
      <h4>Deployment Flow</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// how code goes from github to live</p>
        <div class="mermaid">
flowchart LR
  A[git push\nto GitHub] --> B[Jenkins\nDetects Change]
  B --> C[Stage 1\nCheckout]
  C --> D[Stage 2\nDocker Build]
  D --> E[Stage 3\nSmoke Test]
  E --> F{Health\nCheck 200?}
  F -->|Pass| G[Stage 4\nDeploy]
  F -->|Fail| H[Pipeline\nFails]
  G --> I[Old Container\nStopped]
  I --> J[New Container\nRunning]
  J --> K[Stage 5\nCleanup]
        </div>
      </div>
      <h4>Architecture Diagram</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// how all components connect on ec2</p>
        <div class="mermaid">
flowchart TD
  A[AWS EC2\nUbuntu Server] --> B[Docker Engine]
  B --> C[jenkins\ncontainer :8080]
  B --> D[portfolio-app\ncontainer :3000]
  A --> E[Nginx\nReverse Proxy]
  E --> D
  C -->|Builds & Deploys| D
  F[GitHub Repo] -->|Webhook| C
        </div>
      </div>
    `,
  },

  'proj-portfolio': {
    icon: '🗂️',
    title: 'Portfolio App',
    subtitle: 'This very site — Node.js + Docker + Jenkins + AWS EC2',
    body: `
      <h4>Project Overview</h4>
      <p>This portfolio website is itself a fully deployed DevOps project. Built with Node.js and Express, containerized with Docker, automatically deployed via Jenkins, and served through Nginx on AWS EC2.</p>
      <h4>Tech Stack</h4>
      <div class="modal-tags"><span class="modal-tag">Node.js</span><span class="modal-tag">Express.js</span><span class="modal-tag">Docker</span><span class="modal-tag">Nginx</span><span class="modal-tag">AWS EC2</span><span class="modal-tag">Jenkins</span><span class="modal-tag">HTML/CSS/JS</span></div>
      <h4>Key Features</h4>
      <ul>
        <li>Multi-theme switcher with 6 color schemes</li>
        <li>Interactive skill & project popups with Mermaid diagrams</li>
        <li>Animated terminal widget showing real commands</li>
        <li>Contact form with server-side handling</li>
        <li>Health check endpoint for Docker & monitoring probes</li>
        <li>Security headers via Helmet.js and rate limiting</li>
      </ul>
      <h4>Deployment Flow</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// from code to live site</p>
        <div class="mermaid">
flowchart LR
  A[VS Code\nEdit Code] --> B[git push\nGitHub]
  B --> C[Jenkins\nBuild Triggered]
  C --> D[docker build\nNew Image]
  D --> E[Smoke Test\n/health check]
  E --> F[docker run\nNew Container]
  F --> G[Nginx\nProxy]
  G --> H[Live Site\non EC2]
        </div>
      </div>
      <h4>App Architecture</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// internal app structure</p>
        <div class="mermaid">
flowchart TD
  A[Browser Request] --> B[Nginx :443]
  B --> C[Express App :3000]
  C --> D[routes/pages.js]
  D --> E[GET / → index.html]
  D --> F[GET /health → JSON]
  D --> G[POST /api/contact]
  E --> H[public/\nHTML CSS JS]
        </div>
      </div>
    `,
  },

  'proj-travel': {
    icon: '✈️',
    title: 'Travel Bucket List App',
    subtitle: 'Personalised travel diary with multi-user auth & Docker deployment',
    body: `
      <h4>Project Overview</h4>
      <p>A personalised travel diary web application built as a gift — featuring a bucket list, photo memories section, and a secure multi-user authentication system where each user's data is completely isolated from others.</p>
      <h4>Tech Stack</h4>
      <div class="modal-tags"><span class="modal-tag">Node.js</span><span class="modal-tag">Express.js</span><span class="modal-tag">HTML/CSS/JS</span><span class="modal-tag">Docker</span><span class="modal-tag">Linux</span><span class="modal-tag">LocalStorage</span></div>
      <h4>Key Features</h4>
      <ul>
        <li>Multi-user login system with per-user data isolation</li>
        <li>Travel bucket list — add, check off, and manage destinations</li>
        <li>Photo memories section to upload and store travel photos</li>
        <li>Responsive design that works on mobile and desktop</li>
        <li>Containerized with Docker for easy deployment</li>
        <li>Runs on Linux server with persistent data storage</li>
      </ul>
      <h4>App Architecture</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// how the travel app is structured</p>
        <div class="mermaid">
flowchart TD
  A[User Opens App] --> B{Logged In?}
  B -->|No| C[Login Page]
  C --> D[Authenticate\nUser]
  D --> E[Load User\nData]
  B -->|Yes| E
  E --> F[Dashboard]
  F --> G[Bucket List\nSection]
  F --> H[Photo Memories\nSection]
  G --> I[Add / Check\nDestinations]
  H --> J[Upload &\nView Photos]
        </div>
      </div>
      <h4>Deployment Flow</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// how it was deployed</p>
        <div class="mermaid">
flowchart LR
  A[Source Code] --> B[Dockerfile]
  B --> C[docker build]
  C --> D[Docker Image]
  D --> E[docker run\n-p 3000:3000]
  E --> F[App Running\non Linux Server]
        </div>
      </div>
    `,
  },

  'proj-docker': {
    icon: '📦',
    title: 'Dockerized App Deployment',
    subtitle: 'Full Docker workflow on AWS EC2 with Nginx & SSL',
    body: `
      <h4>Project Overview</h4>
      <p>A comprehensive Docker-based deployment project on AWS EC2 — covering the full workflow from writing Dockerfiles to running multi-container setups with Docker Compose, exposing services through Nginx with HTTPS via Certbot.</p>
      <h4>Tech Stack</h4>
      <div class="modal-tags"><span class="modal-tag">Docker</span><span class="modal-tag">Docker Compose</span><span class="modal-tag">AWS EC2</span><span class="modal-tag">Nginx</span><span class="modal-tag">Certbot</span><span class="modal-tag">Let's Encrypt</span><span class="modal-tag">Ubuntu</span></div>
      <h4>What Was Built</h4>
      <ul>
        <li>Multi-stage Dockerfile for optimized production images</li>
        <li>Docker Compose setup for running multiple services together</li>
        <li>Docker networking — connecting containers on a bridge network</li>
        <li>Volume management for persistent data across restarts</li>
        <li>Nginx reverse proxy sitting in front of app containers</li>
        <li>Free SSL certificate via Certbot + Let's Encrypt auto-renewal</li>
      </ul>
      <h4>Deployment Architecture</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// full docker deployment on aws ec2</p>
        <div class="mermaid">
flowchart TD
  A[Internet\nUser Request] --> B[Domain\nDNS]
  B --> C[AWS EC2\nPublic IP]
  C --> D[Nginx\nPort 80/443]
  D --> E[SSL Cert\nCertbot]
  D --> F[Proxy to\nPort 3000]
  F --> G[Docker Network\nBridge]
  G --> H[App Container\nportfolio-app]
  G --> I[Jenkins Container\njenkins]
  H --> J[Volume\nPersistent Data]
        </div>
      </div>
      <h4>Docker Compose Flow</h4>
      <div class="diagram-wrap">
        <p class="diagram-label">// docker compose multi-container setup</p>
        <div class="mermaid">
flowchart LR
  A[docker-compose.yml] --> B[Service: app]
  A --> C[Service: nginx]
  B --> D[Build from\nDockerfile]
  D --> E[Container\nportfolio-app]
  C --> F[nginx:alpine\nImage]
  F --> G[Container\nportfolio-nginx]
  E --> H[portfolio-net\nBridge Network]
  G --> H
        </div>
      </div>
    `,
  },
};

/* ── MODAL SYSTEM ────────────────────────────────────────────── */
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const modalIcon    = document.getElementById('modalIcon');
const modalTitle   = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const modalBody    = document.getElementById('modalBody');

async function openModal(id) {
  const data = popupData[id];
  if (!data) return;

  modalIcon.textContent = data.icon;
  modalTitle.textContent = data.title;
  modalSubtitle.textContent = data.subtitle;
  modalBody.innerHTML = data.body;

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Render mermaid diagrams inside modal
  const diagrams = modalBody.querySelectorAll('.mermaid');
  for (const el of diagrams) {
    const id = 'mermaid-' + Math.random().toString(36).slice(2);
    try {
      const { svg } = await mermaid.render(id, el.textContent.trim());
      el.innerHTML = svg;
    } catch (e) {
      el.innerHTML = '<p style="color:var(--text-muted);font-size:.8rem">Diagram unavailable</p>';
    }
  }
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Attach click to all clickable cards
document.querySelectorAll('.clickable[data-id]').forEach(card => {
  card.addEventListener('click', () => openModal(card.dataset.id));
});

/* ── CONTACT FORM ─────────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
const formStatus  = document.getElementById('formStatus');
const submitBtn   = document.getElementById('submitBtn');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  if (!name || !email || !message) {
    formStatus.textContent = '⚠ Please fill in all fields.';
    formStatus.className = 'form-status error';
    return;
  }
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  formStatus.textContent = '';
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });
    const data = await res.json();
    if (res.ok) {
      formStatus.textContent = '✓ ' + data.message;
      formStatus.className = 'form-status success';
      contactForm.reset();
    } else throw new Error(data.error || 'Something went wrong.');
  } catch (err) {
    formStatus.textContent = '✗ ' + err.message;
    formStatus.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});

/* ── SMOOTH ANCHOR NAV ───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = document.getElementById('nav').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
