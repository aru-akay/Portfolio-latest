'use strict';

/* ── THEME TOGGLE ────────────────────────────────────────────── */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ── MOBILE NAV ──────────────────────────────────────────────── */
const burger = document.getElementById('burger');
const navMobile = document.getElementById('navMobile');
burger.addEventListener('click', () => navMobile.classList.toggle('open'));
navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMobile.classList.remove('open')));

/* ── NAV SCROLL HIGHLIGHT ────────────────────────────────────── */
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => {
  navEl.style.background = window.scrollY > 40
    ? ''
    : '';
}, { passive: true });

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

const colorMap = { cmd: '#00ff88', out: '#8fa8c0', ok: '#00cfff', cursor: '#00ff88' };

lines.forEach(({ text, type, delay }) => {
  setTimeout(() => {
    const div = document.createElement('div');
    div.classList.add('t-line');
    if (type === 'cursor') {
      div.innerHTML = `<span style="color:${colorMap[type]}">${text} </span><span class="t-cursor"></span>`;
    } else if (type === 'cmd') {
      div.innerHTML = `<span style="color:${colorMap[type]}">${text}</span>`;
    } else {
      div.innerHTML = `<span style="color:${colorMap[type]}">${text}</span>`;
    }
    terminalBody.appendChild(div);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }, delay);
});

/* ── SCROLL REVEAL ───────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.section, .skill-card, .project-card, .about-card, .stat');
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => observer.observe(el));

/* ── SKILL BAR ANIMATION ─────────────────────────────────────── */
const skillFills = document.querySelectorAll('.sk-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
skillFills.forEach(f => barObserver.observe(f));

/* ── CONTACT FORM ─────────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
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
    } else {
      throw new Error(data.error || 'Something went wrong.');
    }
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
