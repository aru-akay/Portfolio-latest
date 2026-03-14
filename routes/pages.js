'use strict';

const express = require('express');
const path = require('path');
const router = express.Router();

// ─── Home / Portfolio ──────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ─── Health Check (for Docker / Kubernetes / Nginx probes) ────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Readiness Probe ───────────────────────────────────────────────────────────
router.get('/ready', (req, res) => {
  res.status(200).json({ ready: true });
});

// ─── Contact Form Submission (API) ────────────────────────────────────────────
router.post('/api/contact', express.json(), (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Log contact request (replace with email/DB integration as needed)
  console.log(`[CONTACT] From: ${name} <${email}> — ${new Date().toISOString()}`);
  console.log(`[CONTACT] Message: ${message}`);

  res.status(200).json({ success: true, message: 'Message received! I will get back to you soon.' });
});

module.exports = router;
