# 📊 Monitoring Stack — Prometheus + Grafana + Node Exporter + cAdvisor

## Architecture

```
AWS EC2 Server
     │
     ├── Docker Containers
     │   ├── portfolio-app    :3000
     │   ├── jenkins          :8080
     │   ├── prometheus       :9090  (localhost only)
     │   ├── grafana          :3001  (public)
     │   ├── node-exporter    :9100  (localhost only)
     │   └── cadvisor         :8081  (localhost only)
     │
     └── Monitoring Flow
         Node Exporter → Prometheus (scrape every 15s)
         cAdvisor      → Prometheus (scrape every 15s)
         Prometheus    → Grafana    (data source)
```

---

## Step 1 — Open Port 3001 in AWS Security Group

Go to: AWS Console → EC2 → Security Groups → your instance's security group
→ Inbound Rules → Add Rule:
- Type: Custom TCP
- Port: 3001
- Source: My IP (or 0.0.0.0/0 for public access)
- Description: Grafana Dashboard

---

## Step 2 — Copy Monitoring Files to EC2

From your local machine or directly on EC2:
```bash
# Pull latest code (monitoring folder is already committed)
cd ~/Portfolio-latest
git pull origin main
```

---

## Step 3 — Start Monitoring Stack

```bash
cd ~/Portfolio-latest/monitoring

docker compose -f docker-compose.monitoring.yml up -d
```

---

## Step 4 — Verify All Containers Are Running

```bash
docker ps
```

You should see these containers running:
```
prometheus      Up    0.0.0.0:9090
grafana         Up    0.0.0.0:3001
node-exporter   Up    127.0.0.1:9100
cadvisor        Up    127.0.0.1:8081
```

---

## Step 5 — Check Prometheus Targets

Open in browser:
```
http://your-ec2-ip:9090/targets
```

All 3 targets should show as UP:
- node-exporter → UP ✅
- cadvisor       → UP ✅
- prometheus     → UP ✅

---

## Step 6 — Open Grafana

Open in browser:
```
http://your-ec2-ip:3001
```

Login credentials:
- Username: `admin`
- Password: `anand@devops2025`

⚠️ Change the password after first login!

---

## Step 7 — Add Prometheus as Data Source in Grafana

1. Go to: **Connections → Data Sources → Add data source**
2. Select: **Prometheus**
3. URL: `http://prometheus:9090`
4. Click: **Save & Test**
5. Should show: ✅ Data source is working

---

## Step 8 — Import Dashboards

### Server Monitoring Dashboard (Node Exporter)
1. Go to: **Dashboards → Import**
2. Enter ID: `1860`
3. Select Prometheus as data source
4. Click: **Import**

### Docker Container Monitoring Dashboard (cAdvisor)
1. Go to: **Dashboards → Import**
2. Enter ID: `14282`
3. Select Prometheus as data source
4. Click: **Import**

---

## Step 9 — What You Will See

### Server Dashboard (ID: 1860)
- CPU usage %
- Memory usage %
- Disk space utilization
- Network traffic in/out
- System load average
- Server uptime

### Container Dashboard (ID: 14282)
- Container CPU usage
- Container memory usage
- Container network traffic
- Container restart count
- All containers: portfolio-app, jenkins, prometheus, grafana

---

## Useful Commands

```bash
# View monitoring logs
docker compose -f docker-compose.monitoring.yml logs -f

# Stop monitoring stack
docker compose -f docker-compose.monitoring.yml down

# Restart monitoring stack
docker compose -f docker-compose.monitoring.yml restart

# Check individual container logs
docker logs prometheus
docker logs grafana
docker logs node-exporter
docker logs cadvisor
```

---

## Security Notes

- Prometheus (9090) — bound to 127.0.0.1 only (not internet-accessible)
- Node Exporter (9100) — bound to 127.0.0.1 only
- cAdvisor (8081) — bound to 127.0.0.1 only
- Grafana (3001) — public, protected by username + password

Later: Route Grafana through Nginx with SSL for production-grade security.
