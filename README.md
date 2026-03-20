# 🚀 Anand — Cloud & DevOps Portfolio

> Production-grade DevOps stack on AWS EC2 — Node.js app with full CI/CD, monitoring, alerting, and SSL.

[![Site](https://img.shields.io/badge/Live-anandevops.xyz-green)](https://www.anandevops.xyz)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-akay077%2Fportfolio-blue)](https://hub.docker.com/r/akay077/portfolio)

---

## 🏗️ Architecture

```
User → Nginx (SSL/HTTPS) → Portfolio App (Docker :3000)

CI/CD:
GitHub Push → Jenkins → Docker Build → Smoke Test → Docker Hub Push → EC2 Deploy

Monitoring:
Node Exporter ──┐
cAdvisor        ├──→ Prometheus → Grafana (Dashboards)
                │         ↓
                └── Alertmanager → Telegram Bot → 📱 Telegram
```

---

## 🐳 Docker Containers

| Container | Image | Port | Purpose |
|---|---|---|---|
| portfolio-app | akay077/portfolio:latest | 3000 | Main web app |
| jenkins | jenkins/jenkins:lts | 8080 | CI/CD pipeline |
| prometheus | prom/prometheus:latest | 9090 | Metrics collection |
| grafana | grafana/grafana:latest | 3001 | Dashboards |
| node-exporter | prom/node-exporter:latest | 9100 | EC2 server metrics |
| cadvisor | gcr.io/cadvisor/cadvisor | 8081 | Container metrics |
| alertmanager | prom/alertmanager:latest | 9093 | Alert routing |
| telegram-bot | custom | 8082 | Telegram notifications |

---

## ⚡ CI/CD Pipeline (Jenkins)

**Trigger:** GitHub push via webhook

**Stages:**
1. **Checkout** — Pull latest code from GitHub
2. **Build** — `docker build` with build number tag
3. **Smoke Test** — Start container, curl `/health`, verify 200 OK
4. **Push** — Push image to Docker Hub (`akay077/portfolio:N`)
5. **Deploy** — Stop old container, run new container
6. **Rollback** — Auto rollback to previous image if deploy fails
7. **Cleanup** — Remove dangling images

**Notifications:** Telegram message on success ✅ or failure ❌

---

## 📊 Monitoring

### Dashboards (Grafana)
- **Dashboard 1860** — Node Exporter Full (EC2 metrics)
- **Dashboard 15798** — Docker Container Monitoring

### Alerts
| Alert | Condition | Severity |
|---|---|---|
| InstanceDown | Target unreachable for 1min | Critical |
| PortfolioAppDown | Container absent for 30s | Critical |
| JenkinsDown | Container absent for 1min | Warning |
| HighCPUUsage | CPU > 80% for 2min | Warning |
| CriticalCPUUsage | CPU > 95% for 1min | Critical |
| HighMemoryUsage | RAM > 85% for 2min | Warning |
| CriticalMemoryUsage | RAM > 95% for 1min | Critical |
| LowDiskSpace | Disk > 80% for 5min | Warning |
| CriticalDiskSpace | Disk > 90% for 2min | Critical |

---

## 🔧 Setup Guide

### 1. Clone & Deploy App
```bash
git clone https://github.com/aru-akay/Portfolio-latest.git
cd Portfolio-latest
docker build -t akay077/portfolio:latest .
docker run -d --name portfolio-app --restart unless-stopped -p 3000:3000 akay077/portfolio:latest
```

### 2. Start Monitoring Stack
```bash
cd monitoring
docker compose -f docker-compose.monitoring.yml up -d
docker ps  # verify all containers running
```

### 3. Setup Nginx + SSL
```bash
sudo cp nginx/nginx.conf /etc/nginx/sites-available/anandevops
sudo ln -s /etc/nginx/sites-available/anandevops /etc/nginx/sites-enabled/
sudo nginx -t
sudo certbot --nginx -d anandevops.xyz -d www.anandevops.xyz
sudo systemctl reload nginx
```

### 4. Add Swap (t2.small only)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 5. Setup GitHub Webhook
```
GitHub repo → Settings → Webhooks → Add webhook
Payload URL: http://13.205.29.112:8080/github-webhook/
Content type: application/json
Events: Just the push event
```

---

## 🔐 Security

- Only ports 22, 80, 443, 3000, 3001, 8080 open in AWS Security Group
- Prometheus (9090), Node Exporter (9100), cAdvisor (8081), Alertmanager (9093) bound to localhost only
- Grafana protected by username/password
- Nginx enforces HTTPS with HSTS header
- Non-root user inside Docker containers
- Rate limiting on both Nginx and Express

---

## 🧪 Failure Testing

```bash
# Test 1: Stop app container → should auto restart (restart: unless-stopped)
docker stop portfolio-app
sleep 5
docker ps  # should show portfolio-app restarting

# Test 2: Simulate high CPU → triggers alert in ~2 minutes
docker run --rm -it --cpus=1 progrium/stress --cpu 2 --timeout 300s

# Test 3: Verify Prometheus alert fires
curl http://localhost:9090/api/v1/alerts
```

---

## 📁 Project Structure

```
Portfolio-latest/
├── server.js                    ← Express backend
├── routes/pages.js              ← Route handlers
├── public/
│   ├── index.html               ← Portfolio SPA
│   ├── css/style.css            ← 6 themes
│   └── js/main.js               ← Theme switcher + modals
├── Dockerfile                   ← Multi-stage build
├── Jenkinsfile                  ← CI/CD pipeline
├── nginx/
│   └── nginx.conf               ← Reverse proxy + SSL
└── monitoring/
    ├── prometheus.yml           ← Scrape config
    ├── alert.rules.yml          ← Alert definitions
    ├── alertmanager.yml         ← Alert routing
    ├── docker-compose.monitoring.yml
    └── telegram-bot/
        ├── server.js            ← Webhook receiver
        └── Dockerfile
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | App listening port |
| `NODE_ENV` | `development` | Node environment |
