'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. THREE.JS GLOBE
═══════════════════════════════════════════════════════════════ */
(function initGlobe() {
  const canvas = document.getElementById('globe');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = canvas.parentElement.offsetWidth  || 420;
  const H = canvas.parentElement.offsetHeight || 420;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(W, H);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
  camera.position.z = 2.8;

  // Sphere wireframe
  const geo  = new THREE.SphereGeometry(1, 28, 28);
  const wire = new THREE.WireframeGeometry(geo);
  const mat  = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.18 });
  const mesh = new THREE.LineSegments(wire, mat);
  scene.add(mesh);

  // Tech labels as sprites
  const techs = [
    'Docker','Jenkins','AWS EC2','Nginx','Linux',
    'Prometheus','Grafana','Kubernetes','Terraform','Bash',
    'Node.js','Git','GitHub','SSL/TLS','cAdvisor',
    'Alertmanager','CI/CD','DevOps','SSH','Ubuntu',
  ];

  function makeSprite(text) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.font = 'bold 22px JetBrains Mono, monospace';
    ctx.fillStyle = '#0a0a0a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.6, 0.15, 1);
    return sprite;
  }

  techs.forEach((t, i) => {
    const phi   = Math.acos(-1 + (2 * i) / techs.length);
    const theta = Math.sqrt(techs.length * Math.PI) * phi;
    const sprite = makeSprite(t);
    sprite.position.setFromSphericalCoords(1.18, phi, theta);
    scene.add(sprite);
  });

  // Ambient + point light
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const pl = new THREE.PointLight(0xe63946, 1, 10);
  pl.position.set(2, 2, 2);
  scene.add(pl);

  // Mouse interaction
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let isDragging = false, prevMouse = { x: 0, y: 0 };
  let autoSpeed = 0.003;

  canvas.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; autoSpeed = 0; });
  window.addEventListener('mouseup',   () => { isDragging = false; autoSpeed = 0.003; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) {
      const rect = canvas.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width  - 0.5) * 0.3;
      targetY = ((e.clientY - rect.top)  / rect.height - 0.5) * 0.3;
    } else {
      mesh.rotation.y += (e.clientX - prevMouse.x) * 0.008;
      mesh.rotation.x += (e.clientY - prevMouse.y) * 0.008;
      prevMouse = { x: e.clientX, y: e.clientY };
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.y += autoSpeed;
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;
    scene.children.forEach(c => {
      if (c instanceof THREE.Sprite) {
        c.material.opacity = 0.85;
      }
    });
    camera.position.x += (currentX - camera.position.x) * 0.05;
    camera.position.y += (-currentY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.parentElement.offsetWidth;
    const h = canvas.parentElement.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();


/* ═══════════════════════════════════════════════════════════════
   2. TERMINAL TYPEWRITER
═══════════════════════════════════════════════════════════════ */
(function initTerminal() {
  const body = document.getElementById('termBody');
  if (!body) return;

  const lines = [
    { t: '$ docker ps --format "{{.Names}}"', c: 'p', d: 500 },
    { t: 'portfolio-app', c: 'ok', d: 1000 },
    { t: 'jenkins', c: 'ok', d: 1100 },
    { t: 'prometheus', c: 'ok', d: 1200 },
    { t: 'grafana', c: 'ok', d: 1300 },
    { t: '$ curl localhost:3000/health', c: 'p', d: 2000 },
    { t: '{"status":"ok","uptime":"5h"}', c: 'ok', d: 2600 },
    { t: '$ free -h | grep Mem', c: 'p', d: 3200 },
    { t: 'Mem: 1.9Gi  used: 1.2Gi  swap: 2.0Gi', c: 'ok', d: 3800 },
    { t: '$ sudo nginx -t', c: 'p', d: 4400 },
    { t: 'nginx: configuration file OK ✓', c: 'ok', d: 5000 },
    { t: '$', c: 'cursor', d: 5500 },
  ];

  const colors = { p: '#00ff88', ok: '#a3e4ff', err: '#ff5f57', cursor: '#00ff88' };

  lines.forEach(({ t, c, d }) => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.classList.add('tl');
      if (c === 'p')      div.innerHTML = `<span class="p">$ </span><span style="color:#e0e0e0">${t.slice(2)}</span>`;
      else if (c === 'cursor') div.innerHTML = `<span class="p">$ </span><span class="tcursor"></span>`;
      else                div.innerHTML = `<span style="color:${colors[c]}">${t}</span>`;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }, d);
  });
})();


/* ═══════════════════════════════════════════════════════════════
   3. SKILL TREE
═══════════════════════════════════════════════════════════════ */
(function initSkillTree() {
  const svg = document.getElementById('skillTree');
  if (!svg) return;

  const W = 900, H = 560;

  const tree = {
    name: 'DevOps', x: 450, y: 50, type: 'root',
    desc: 'Full DevOps Stack',
    children: [
      {
        name: 'Cloud', x: 150, y: 180, type: 'cat', desc: 'Cloud Infrastructure',
        children: [
          { name: 'AWS EC2', x: 60,  y: 320, desc: 'Virtual servers on AWS' },
          { name: 'Security Groups', x: 160, y: 320, desc: 'Firewall rules & access control' },
          { name: 'Elastic IP', x: 80,  y: 430, desc: 'Static public IP address' },
        ]
      },
      {
        name: 'Containers', x: 340, y: 180, type: 'cat', desc: 'Containerization',
        children: [
          { name: 'Docker', x: 260, y: 320, desc: 'Container runtime' },
          { name: 'Compose', x: 360, y: 320, desc: 'Multi-container apps' },
          { name: 'Dockerfile', x: 290, y: 430, desc: 'Image build instructions' },
        ]
      },
      {
        name: 'CI/CD', x: 560, y: 180, type: 'cat', desc: 'Continuous Integration & Delivery',
        children: [
          { name: 'Jenkins', x: 480, y: 320, desc: 'Automation server' },
          { name: 'GitHub', x: 570, y: 320, desc: 'Version control & webhooks' },
          { name: 'Docker Hub', x: 520, y: 430, desc: 'Image registry' },
        ]
      },
      {
        name: 'Monitoring', x: 760, y: 180, type: 'cat', desc: 'Observability Stack',
        children: [
          { name: 'Prometheus', x: 680, y: 320, desc: 'Metrics collection' },
          { name: 'Grafana', x: 780, y: 320, desc: 'Dashboards & visualization' },
          { name: 'Alertmanager', x: 860, y: 320, desc: 'Alert routing' },
          { name: 'cAdvisor', x: 730, y: 430, desc: 'Container metrics' },
          { name: 'Telegram', x: 840, y: 430, desc: 'Alert notifications' },
        ]
      },
    ]
  };

  // Draw branches
  function drawBranch(x1, y1, x2, y2) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const mx = (x1 + x2) / 2;
    path.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
    path.classList.add('skill-branch');
    svg.appendChild(path);
  }

  // Draw node
  function drawNode(node, type = '') {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('skill-node');
    if (type) g.classList.add(type);

    const r = type === 'root' ? 36 : type === 'cat' ? 28 : 22;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', r);
    g.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y + 4);
    text.setAttribute('text-anchor', 'middle');
    text.textContent = node.name;
    g.appendChild(text);

    // Tooltip
    const tooltip = document.getElementById('skillTooltip');
    g.addEventListener('mouseenter', (e) => {
      tooltip.textContent = node.desc || node.name;
      tooltip.style.opacity = '1';
      tooltip.style.left = (e.offsetX + 12) + 'px';
      tooltip.style.top  = (e.offsetY - 10) + 'px';
    });
    g.addEventListener('mousemove', (e) => {
      tooltip.style.left = (e.offsetX + 12) + 'px';
      tooltip.style.top  = (e.offsetY - 10) + 'px';
    });
    g.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });

    svg.appendChild(g);
  }

  // Render tree
  drawNode(tree, 'root');
  tree.children.forEach(cat => {
    drawBranch(tree.x, tree.y + 36, cat.x, cat.y - 28);
    drawNode(cat, 'cat');
    cat.children.forEach(leaf => {
      drawBranch(cat.x, cat.y + 28, leaf.x, leaf.y - 22);
      drawNode(leaf, 'leaf');
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════
   4. LIVE METRICS
═══════════════════════════════════════════════════════════════ */
(function initMetrics() {
  const els = {
    cpu:  { val: document.getElementById('mv-cpu'),  fill: document.getElementById('mf-cpu'),  card: document.getElementById('mc-cpu')  },
    ram:  { val: document.getElementById('mv-ram'),  fill: document.getElementById('mf-ram'),  card: document.getElementById('mc-ram')  },
    disk: { val: document.getElementById('mv-disk'), fill: document.getElementById('mf-disk'), card: document.getElementById('mc-disk') },
    cont: { val: document.getElementById('mv-cont'), fill: document.getElementById('mf-cont'), card: document.getElementById('mc-cont') },
  };
  const footer = document.getElementById('metricsFooter');

  function animateNum(el, target, suffix = '%') {
    const start  = parseFloat(el.textContent) || 0;
    const dur    = 800;
    const begin  = performance.now();
    function step(now) {
      const p = Math.min((now - begin) / dur, 1);
      el.textContent = (start + (target - start) * p).toFixed(suffix === '%' ? 1 : 0) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function getColor(val) {
    if (val > 85) return '#e63946';
    if (val > 60) return '#f4a261';
    return '#2d9e5c';
  }

  async function fetchMetrics() {
    try {
      const res  = await fetch('/api/metrics');
      const data = await res.json();

      animateNum(els.cpu.val,  data.cpu,  '%');
      animateNum(els.ram.val,  data.ram,  '%');
      animateNum(els.disk.val, data.disk, '%');
      animateNum(els.cont.val, data.containers, '');

      els.cpu.fill.style.width  = data.cpu  + '%';
      els.ram.fill.style.width  = data.ram  + '%';
      els.disk.fill.style.width = data.disk + '%';

      els.cpu.fill.style.background  = getColor(data.cpu);
      els.ram.fill.style.background  = getColor(data.ram);
      els.disk.fill.style.background = getColor(data.disk);

      const t = new Date(data.timestamp).toLocaleTimeString();
      footer.textContent = `Last updated: ${t} · Uptime: ${Math.floor(data.uptime / 3600)}h ${Math.floor((data.uptime % 3600) / 60)}m · Source: Prometheus`;
    } catch {
      footer.textContent = 'Unable to connect to metrics server';
    }
  }

  fetchMetrics();
  setInterval(fetchMetrics, 10000);
})();


/* ═══════════════════════════════════════════════════════════════
   5. MOBILE NAV
═══════════════════════════════════════════════════════════════ */
const burger   = document.getElementById('burger');
const navMob   = document.getElementById('navMobile');
burger.addEventListener('click', () => navMob.classList.toggle('open'));
navMob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMob.classList.remove('open')));


/* ═══════════════════════════════════════════════════════════════
   6. SCROLL REVEAL
═══════════════════════════════════════════════════════════════ */
const revEls = document.querySelectorAll('.proj-card, .metric-card, .tl-item, .stat-item, .about-content, .contact-grid');
revEls.forEach(el => el.classList.add('reveal'));
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
}, { threshold: 0.1 });
revEls.forEach(el => revObs.observe(el));


/* ═══════════════════════════════════════════════════════════════
   7. CONTACT FORM
═══════════════════════════════════════════════════════════════ */
const form   = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const btn    = document.getElementById('submitBtn');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  if (!name || !email || !message) {
    status.textContent = '⚠ Please fill in all fields.';
    status.className = 'form-status err';
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Sending...';
  status.textContent = '';
  try {
    const res  = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });
    const data = await res.json();
    if (res.ok) {
      status.textContent = '✓ ' + data.message;
      status.className = 'form-status ok';
      form.reset();
    } else throw new Error(data.error);
  } catch (err) {
    status.textContent = '✗ ' + err.message;
    status.className = 'form-status err';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Message';
  }
});


/* ═══════════════════════════════════════════════════════════════
   8. SMOOTH SCROLL
═══════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) {
      e.preventDefault();
      const off = document.getElementById('nav').offsetHeight;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
    }
  });
});
