const http = require('http');
const https = require('https');

const BOT_TOKEN = '8786417723:AAH9zfU9RXr3JzTkgSl9_r14Qldw7T1zZV8';
const CHAT_ID   = '1082509918';
const PORT      = 8080;

// ── Send message to Telegram ──────────────────────────────────────
function sendTelegram(message) {
  const body = JSON.stringify({
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'HTML',
  });

  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const req = https.request(options, (res) => {
    console.log(`[Telegram] Status: ${res.statusCode}`);
  });
  req.on('error', (e) => console.error(`[Telegram] Error: ${e.message}`));
  req.write(body);
  req.end();
}

// ── Format alert message ──────────────────────────────────────────
function formatAlert(alert) {
  const status    = alert.status === 'firing' ? '🔴 FIRING' : '✅ RESOLVED';
  const severity  = alert.labels.severity || 'unknown';
  const alertname = alert.labels.alertname || 'Unknown Alert';
  const summary   = alert.annotations.summary || alertname;
  const desc      = alert.annotations.description || '';
  const instance  = alert.labels.instance || alert.labels.service || 'EC2';

  const severityEmoji = severity === 'critical' ? '🚨' : '⚠️';

  return `${status} ${severityEmoji}

<b>${summary}</b>

📋 <b>Alert:</b> ${alertname}
🖥️ <b>Instance:</b> ${instance}
⚡ <b>Severity:</b> ${severity.toUpperCase()}
${desc ? `📝 <b>Details:</b> ${desc}` : ''}

🕐 <b>Time:</b> ${new Date().toISOString()}
🌐 <b>Server:</b> anandevops.xyz`;
}

// ── HTTP Server ───────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/alert') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        console.log(`[Alert] Received ${payload.alerts?.length || 0} alerts`);

        if (payload.alerts && payload.alerts.length > 0) {
          payload.alerts.forEach(alert => {
            const message = formatAlert(alert);
            sendTelegram(message);
            console.log(`[Alert] Sent: ${alert.labels.alertname}`);
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (err) {
        console.error(`[Error] ${err.message}`);
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'telegram-bot' }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 Telegram Alert Bot running on port ${PORT}`);
  // Send startup notification
  sendTelegram(`✅ <b>Alert Bot Started</b>\n\n🚀 Alertmanager → Telegram bot is online\n🌐 Monitoring: anandevops.xyz`);
});
