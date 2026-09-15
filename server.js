import express from 'express';
import { connectToF1Feed } from './f1client.js';
import { saveSessionInfo, saveDrivers, saveResults, db } from './db.js'; 
import { getCachedOpenF1, setCachedOpenF1 } from './db.js';

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


  onPosition: (positions) => broadcast('position', positions),


  onTimingAppData: (data) => broadcast('timingAppData', data)
});



const openf1Cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchOpenF1Cached(path) {
  const cached = openf1Cache.get(path);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`https://api.openf1.org/v1${path}`);
    const data = await response.json();

    if (!Array.isArray(data)) {
      // OpenF1 is restricted/erroring — fall back to last known good data
      const fallback = getCachedOpenF1(path);
      if (fallback) return fallback;
      return data; // no fallback available, return the error as-is
    }

    openf1Cache.set(path, { data, timestamp: Date.now() });
    setCachedOpenF1(path, data); // persist for future fallback
    return data;
  } catch (err) {
    const fallback = getCachedOpenF1(path);
    if (fallback) return fallback;
    throw err;
  }
}

app.get('/api/openf1/sessions', async (req, res) => {
  const year = req.query.year || '2026';
  const data = await fetchOpenF1Cached(`/sessions?year=${year}`);
  res.json(data);
});

app.get('/api/openf1/sessions/:meetingKey', async (req, res) => {
  const data = await fetchOpenF1Cached(`/sessions?meeting_key=${req.params.meetingKey}`);
  res.json(data);
});




app.listen(3000, () => console.log('Server running on http://localhost:3000'));