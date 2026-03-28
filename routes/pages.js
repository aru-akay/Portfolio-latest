'use strict';

const express = require('express');
const path    = require('path');
const http    = require('http');
const router  = express.Router();

// ─── Home ─────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Readiness Probe ──────────────────────────────────────────────────────────
router.get('/ready', (req, res) => {
  res.status(200).json({ ready: true });
});

// ─── Live Metrics from Prometheus ─────────────────────────────────────────────
function queryPrometheus(query) {
  return new Promise((resolve) => {
    const url = `http://prometheus.anandevops.xyz/api/v1/query?query=${encodeURIComponent(query)}`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const value = json?.data?.result?.[0]?.value?.[1];
          resolve(value ? parseFloat(parseFloat(value).toFixed(1)) : null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

router.get('/api/metrics', async (req, res) => {
  try {
    const [cpu, ram, disk, containers] = await Promise.all([
      queryPrometheus('100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[2m])) * 100)'),
      queryPrometheus('(1 - (avg(node_memory_MemAvailable_bytes) / avg(node_memory_MemTotal_bytes))) * 100'),
queryPrometheus('(1 - (avg(node_filesystem_avail_bytes{mountpoint="/"}) / avg(node_filesystem_size_bytes{mountpoint="/"}))) * 100'),
      queryPrometheus('count(container_last_seen{image!=""})'),
    ]);
    res.json({
      cpu:        cpu        ?? 0,
      ram:        ram        ?? 0,
      disk:       disk       ?? 0,
      containers: containers ?? 0,
      uptime:     Math.floor(process.uptime()),
      timestamp:  new Date().toISOString(),
    });
  } catch {
    res.json({ cpu: 0, ram: 0, disk: 0, containers: 0, uptime: 0, timestamp: new Date().toISOString() });
  }
});

// ─── Contact Form ─────────────────────────────────────────────────────────────
router.post('/api/contact', express.json(), (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  console.log(`[CONTACT] From: ${name} <${email}> — ${new Date().toISOString()}`);
  console.log(`[CONTACT] Message: ${message}`);
  res.status(200).json({ success: true, message: 'Message received! I will get back to you soon.' });
});

module.exports = router;
