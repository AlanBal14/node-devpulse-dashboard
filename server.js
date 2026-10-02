import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import os from 'os';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

// Estado global de votación en memoria
const VOTOS = {
  JavaScript: 0,
  Python: 0,
  "C++": 0,
  Java: 0
};

// 1. Vista Principal (Dashboard en Tiempo Real)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Node.js Realtime Dashboard 🚀</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="/socket.io/socket.io.js"></script>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
        h1 { color: #38bdf8; margin-bottom: 5px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; max-width: 900px; margin-top: 20px; }
        .card { background: #1e293b; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); text-align: center; }
        .btn-vote { background: #3b82f6; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; }
        .btn-vote:hover { background: #2563eb; transform: scale(1.05); }
        .badge { background: #22c55e; color: black; padding: 5px 12px; border-radius: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>🚀 DevPulse Live Dashboard</h1>
      <p>Servidor Node.js emitiendo métricas y eventos en tiempo real con <strong>Socket.io</strong></p>
      <div><span class="badge" id="usuarios-count">Conexiones activas: 0</span></div>

      <div class="grid">
        <!-- Panel 1: Encuesta Interactiva -->
        <div class="card">
          <h2>📊 Votación en Vivo</h2>
          <p>¿Cuál es tu lenguaje favorito?</p>
          <div>
            <button class="btn-vote" onclick="votar('JavaScript')">JavaScript</button>
            <button class="btn-vote" onclick="votar('Python')">Python</button>
            <button class="btn-vote" onclick="votar('C++')">C++</button>
            <button class="btn-vote" onclick="votar('Java')">Java</button>
          </div>
          <div style="margin-top: 15px;"><canvas id="chartVotos"></canvas></div>
        </div>

        <!-- Panel 2: Monitor del Sistema -->
        <div class="card">
          <h2>🖥️ Monitor de Servidor (Node.js)</h2>
          <p>Uso de Memoria RAM en Tiempo Real</p>
          <div style="margin-top: 35px;"><canvas id="chartRam"></canvas></div>
        </div>
      </div>

      <script>
        const socket = io();

        // Configuración de Gráfico de Votos
        const ctxVotos = document.getElementById('chartVotos').getContext('2d');
        const chartVotos = new Chart(ctxVotos, {
          type: 'bar',
          data: {
            labels: ['JavaScript', 'Python', 'C++', 'Java'],
            datasets: [{ label: 'Votos', data: [0,0,0,0], backgroundColor: '#38bdf8' }]
          },
          options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
        });

        // Configuración de Gráfico de Memoria
        const ctxRam = document.getElementById('chartRam').getContext('2d');
        const chartRam = new Chart(ctxRam, {
          type: 'line',
          data: {
            labels: [],
            datasets: [{ label: 'Uso RAM (MB)', data: [], borderColor: '#f43f5e', tension: 0.3, fill: true, backgroundColor: 'rgba(244, 63, 94, 0.1)' }]
          },
          options: { scales: { y: { beginAtZero: false } } }
        });

        // Eventos de Sockets
        socket.on('update-users', (count) => {
          document.getElementById('usuarios-count').innerText = "Conexiones activas: " + count;
        });

        socket.on('update-votes', (votos) => {
          chartVotos.data.datasets[0].data = Object.values(votos);
          chartVotos.update();
        });

        socket.on('system-metrics', (data) => {
          const now = new Date().toLocaleTimeString();
          if (chartRam.data.labels.length > 8) {
            chartRam.data.labels.shift();
            chartRam.data.datasets[0].data.shift();
          }
          chartRam.data.labels.push(now);
          chartRam.data.datasets[0].data.push(data.ramUsada);
          chartRam.update();
        });

        function votar(opcion) {
          socket.emit('send-vote', opcion);
        }
      </script>
    </body>
    </html>
  `);
});

// Eventos de WebSockets en el Servidor
let connectedUsers = 0;

io.on('connection', (socket) => {
  connectedUsers++;
  io.emit('update-users', connectedUsers);
  socket.emit('update-votes', VOTOS);

  // Recibir voto
  socket.on('send-vote', (opcion) => {
    if (VOTOS[opcion] !== undefined) {
      VOTOS[opcion]++;
      io.emit('update-votes', VOTOS);
    }
  });

  socket.on('disconnect', () => {
    connectedUsers = Math.max(0, connectedUsers - 1);
    io.emit('update-users', connectedUsers);
  });
});

// Emitir métricas de sistema cada 2 segundos
setInterval(() => {
  const ramLibreMB = (os.freemem() / 1024 / 1024).toFixed(0);
  const ramTotalMB = (os.totalmem() / 1024 / 1024).toFixed(0);
  const ramUsadaMB = (ramTotalMB - ramLibreMB).toFixed(0);

  io.emit('system-metrics', { ramUsada: ramUsadaMB });
}, 2000);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Realtime corriendo en http://localhost:${PORT}`);
});