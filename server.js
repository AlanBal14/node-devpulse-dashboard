import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;
const DB_FILE = './victorias.json';

// Cargar historial
let historial = { js: 0, cpp: 0 };
if (fs.existsSync(DB_FILE)) {
  try { historial = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')); } catch(e) {}
}

const guardarHistorial = () => fs.writeFileSync(DB_FILE, JSON.stringify(historial));

// Estado del juego (50 = empate, 0 = Gana JS, 100 = Gana C++)
let score = 50;
let gameOver = false;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Guerra de Clicks | JS vs C++</title>
      <script src="/socket.io/socket.io.js"></script>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #1a1a24; color: white; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; touch-action: manipulation; }
        h1 { margin-bottom: 5px; text-align: center; }
        p { color: #aaa; margin-top: 0; margin-bottom: 20px; text-align: center; }
        
        .score-board { font-size: 1.5rem; font-weight: bold; margin-bottom: 20px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 10px; }
        
        /* Barra de Progreso */
        .bar-container { width: 90%; max-width: 600px; height: 50px; background: #2b5b84; border-radius: 25px; overflow: hidden; position: relative; border: 3px solid #444; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
        .bar-js { height: 100%; background: #f7df1e; width: 50%; transition: width 0.1s ease-out; position: absolute; left: 0; top: 0; box-shadow: 5px 0 15px rgba(247, 223, 30, 0.5); }
        .center-line { width: 4px; height: 100%; background: white; position: absolute; left: 50%; transform: translateX(-50%); z-index: 10; }
        
        /* Botones de Combate */
        .battle-area { display: flex; width: 100%; max-width: 600px; gap: 20px; margin-top: 40px; padding: 0 20px; box-sizing: border-box; }
        .btn { flex: 1; height: 120px; font-size: 1.5rem; font-weight: bold; border: none; border-radius: 15px; cursor: pointer; color: #111; transition: transform 0.05s; user-select: none; }
        .btn:active { transform: scale(0.95); }
        .btn-js { background: #f7df1e; }
        .btn-cpp { background: #2b5b84; color: white; }
        
        /* Animación de Victoria */
        .winner-modal { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.9); flex-direction: column; justify-content: center; align-items: center; z-index: 100; text-align: center;}
        .winner-modal h2 { font-size: 4rem; margin: 0; animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .btn-reset { margin-top: 30px; padding: 15px 30px; font-size: 1.2rem; background: #ff4757; color: white; border: none; border-radius: 10px; cursor: pointer; }
        @keyframes pop { 0% { transform: scale(0); } 100% { transform: scale(1); } }
      </style>
    </head>
    <body>

      <h1>🔥 Batalla Multijugador</h1>
      <p>¡Tapea tu botón lo más rápido que puedas!</p>

      <div class="score-board">
        👑 JS: <span id="wins-js">0</span> | 👑 C++: <span id="wins-cpp">0</span>
      </div>

      <div class="bar-container">
        <div class="center-line"></div>
        <div class="bar-js" id="bar"></div>
      </div>

      <div class="battle-area">
        <button class="btn btn-js" id="btn-js" onclick="clickJS()">🚀 Team JS</button>
        <button class="btn btn-cpp" id="btn-cpp" onclick="clickCPP()">⚙️ Team C++</button>
      </div>

      <div class="winner-modal" id="modal">
        <h2 id="winner-text">¡GANADOR!</h2>
        <button class="btn-reset" onclick="resetGame()">Reiniciar Partida</button>
      </div>

      <script>
        const socket = io();
        const bar = document.getElementById('bar');
        const modal = document.getElementById('modal');
        const winnerText = document.getElementById('winner-text');
        
        // Efecto de sonido corto usando Web Audio API
        const actx = new (window.AudioContext || window.webkitAudioContext)();
        function playPop() {
          if(actx.state === 'suspended') actx.resume();
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.connect(gain);
          gain.connect(actx.destination);
          osc.frequency.setValueAtTime(600 + Math.random()*200, actx.currentTime);
          gain.gain.setValueAtTime(0.1, actx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.1);
          osc.start();
          osc.stop(actx.currentTime + 0.1);
        }

        function clickJS() { socket.emit('ataque', 'js'); playPop(); }
        function clickCPP() { socket.emit('ataque', 'cpp'); playPop(); }
        function resetGame() { socket.emit('reset'); }

        socket.on('update_score', (data) => {
          // Invertimos la barra visualmente para que JS empuje desde la izquierda
          bar.style.width = (100 - data.score) + '%';
          document.getElementById('wins-js').innerText = data.historial.js;
          document.getElementById('wins-cpp').innerText = data.historial.cpp;

          if (data.score <= 0 || data.score >= 100) {
            modal.style.display = 'flex';
            winnerText.innerText = data.score <= 0 ? "¡TEAM JS GANA! 🚀" : "¡TEAM C++ GANA! ⚙️";
            winnerText.style.color = data.score <= 0 ? "#f7df1e" : "#2b5b84";
          } else {
            modal.style.display = 'none';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Lógica de Sockets para el Tira y Afloja
io.on('connection', (socket) => {
  // Enviar estado actual al nuevo jugador
  socket.emit('update_score', { score, historial });

  socket.on('ataque', (equipo) => {
    if (gameOver) return;
    
    // JS jala hacia el 0, C++ jala hacia el 100
    if (equipo === 'js') score -= 2;
    if (equipo === 'cpp') score += 2;

    // Verificar si alguien ganó (llegó a los extremos)
    if (score <= 0) {
      score = 0;
      gameOver = true;
      historial.js++;
      guardarHistorial();
    } else if (score >= 100) {
      score = 100;
      gameOver = true;
      historial.cpp++;
      guardarHistorial();
    }

    // Actualizar a todos los conectados
    io.emit('update_score', { score, historial });
  });

  socket.on('reset', () => {
    score = 50;
    gameOver = false;
    io.emit('update_score', { score, historial });
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Guerra Multijugador lista en http://localhost:${PORT}`);
});