import express from 'express';
import { connectToF1Feed } from './f1client.js';
import { saveSessionInfo, saveDrivers, saveResults, db } from './db.js'; 
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.static('public'));

const clients = [];
const lastKnown = {};
let currentSessionKey = null;

app.get('/api/live', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  Object.entries(lastKnown).forEach(([type, payload]) => {
    res.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
  });

  clients.push(res);

  req.on('close', () => {
    const index = clients.indexOf(res);
    if (index !== -1) clients.splice(index, 1);
  });
});


app.get('/api/sessions', (req, res) => {
  const sessions = db.prepare('SELECT * FROM sessions ORDER BY start_date DESC').all();
  res.json(sessions);
});

app.get('/api/sessions/:sessionKey/results', (req, res) => {
  const results = db.prepare(`
    SELECT results.*, drivers.full_name, drivers.team_name, drivers.team_colour
    FROM results
    JOIN drivers ON results.driver_number = drivers.driver_number
    WHERE results.session_key = ?
    ORDER BY results.position
  `).all(req.params.sessionKey);
  res.json(results);
});

function broadcast(eventType, payload) {
  lastKnown[eventType] = payload;
  const message = `data: ${JSON.stringify({ type: eventType, payload })}\n\n`;
  clients.forEach((res) => res.write(message));
}

connectToF1Feed({
  onDriverList: (drivers) => {
    broadcast('drivers', drivers);
    saveDrivers(drivers);
  },
  onTrackStatus: (status) => broadcast('trackStatus', status),
  onSessionInfo: (info) => {
    broadcast('sessionInfo', info);
    currentSessionKey = info.sessionKey;
    saveSessionInfo(info);
  },
  onHeartbeat: (hb) => broadcast('heartbeat', hb),
  onTimingData: (timing) => {
    broadcast('timingData', timing);
    if (currentSessionKey) saveResults(currentSessionKey, timing);
  },
  onTimingAppData: (data) => broadcast('timingAppData', data)
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));