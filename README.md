# Anand — DevOps & Cloud Engineer Portfolio

> Node.js portfolio app, production-ready with Docker + Nginx + Jenkins CI/CD.

---

## 📁 Project Structure

```
portfolio-app/
├── Dockerfile          # Multi-stage production Docker build
├── Jenkinsfile         # Full CI/CD pipeline (build → scan → test → push → deploy)
├── docker-compose.yml  # Local dev & optional prod compose
├── nginx.conf          # Nginx reverse proxy config (HTTPS + security headers)
├── package.json
├── server.js           # Express entry point
├── routes/
│   └── pages.js        # Route handlers + /health + /api/contact
└── public/
    ├── index.html      # Single-page portfolio
    ├── css/style.css
    └── js/main.js
```

---

## 🚀 Local Development

```bash
npm install
npm run dev       # nodemon hot reload on :3000
```

---

## 🐳 Docker

```bash
# Build
docker build -t anand/portfolio:latest .

# Run
docker run -d \
  --name portfolio-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  anand/portfolio:latest

# Health check
curl http://localhost:3000/health
```

---

## 🔧 Nginx Setup (on your server)

```bash
# Copy config
sudo cp nginx.conf /etc/nginx/sites-available/portfolio

# Update domain name in nginx.conf → replace yourdomain.com

# Enable site
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# SSL with Certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test & reload
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🔁 Jenkins CI/CD

### Prerequisites
- Jenkins with Docker installed on agent
- Jenkins Credentials:
  - `dockerhub-credentials` — Docker Hub username/password

### Pipeline Stages
| Stage | Description |
|-------|-------------|
| Checkout | Pull source from GitHub |
| Lint | Validate Node.js app starts |
| Build | `docker build` with build labels |
| Security Scan | Trivy image scan (HIGH/CRITICAL) |
| Smoke Test | Start container, curl `/health` |
| Push | Push to Docker Hub (main/master only) |
| Deploy | Pull & run on server, reload Nginx |
| Cleanup | Prune dangling images |

### Setup
1. Create a Jenkins Pipeline job
2. Point SCM to your GitHub repo
3. Set `Jenkinsfile` as pipeline definition
4. Add `dockerhub-credentials` in Jenkins → Credentials
5. Push to `main` to trigger the full pipeline

---

## 🌍 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Portfolio homepage |
| GET | `/health` | Health check (Docker/K8s probe) |
| GET | `/ready` | Readiness probe |
| POST | `/api/contact` | Contact form submission |

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | App listening port |
| `NODE_ENV` | `development` | Node environment |
