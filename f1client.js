import WebSocket from 'ws';
import zlib from 'zlib';
import {
  parseDriverList,
  parseTrackStatus,
  parseSessionInfo,
  parseHeartbeat,
  parseTimingData,
  parseTimingAppData,
  parsePosition
} from './parsers.js';

function decompressPositionZ(base64String) {
  const buffer = Buffer.from(base64String, 'base64');
  const decompressed = zlib.inflateRawSync(buffer);
  return JSON.parse(decompressed.toString());
}

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export async function connectToF1Feed(callbacks, retryDelay = 1000) {
  // Running state, merged from deltas over time — persists across reconnects within this call
  let timingState = { Lines: {} };
  let timingAppState = { Lines: {} };

  try {
    const negotiateResponse = await fetch('https://livetiming.formula1.com/signalrcore/negotiate?negotiateVersion=1', {
      method: 'POST'
    });
    const negotiateData = await negotiateResponse.json();

    const setCookie = negotiateResponse.headers.get('set-cookie');
    const cookieMatch = setCookie ? setCookie.match(/AWSALBCORS=[^;]+/) : null;
    const albCookie = cookieMatch ? cookieMatch[0] : null;

    const url = `wss://livetiming.formula1.com/signalrcore?id=${negotiateData.connectionToken}`;
    const ws = new WebSocket(url, { headers: { Cookie: albCookie } });

    const subscribeMessage = {
      type: 1,
      target: 'Subscribe',
      arguments: [['Heartbeat', 'SessionInfo', 'TrackStatus', 'DriverList', 'TimingData', 'Position.z', 'CarData.z', 'TimingAppData']],
      invocationId: '0'
    };

    ws.on('open', () => {
      console.log('F1 feed connected');
      retryDelay = 1000;
      ws.send(JSON.stringify({ protocol: 'json', version: 1 }) + '\x1e');
    });

    ws.on('message', (data) => {
      const message = data.toString();

      if (message === '{}\x1e') {
        ws.send(JSON.stringify(subscribeMessage) + '\x1e');
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(message.replace('\x1e', ''));
      } catch (err) {
        return;
      }

      // Handle live incremental push messages
      if (parsed.type === 1 && parsed.target === 'feed') {
        const [topic, feedData] = parsed.arguments;

        if (topic === 'TimingData') {
          deepMerge(timingState, feedData);
          callbacks.onTimingData(parseTimingData(timingState));
        }

        if (topic === 'TimingAppData') {
          deepMerge(timingAppState, feedData);
          callbacks.onTimingAppData(parseTimingAppData(timingAppState));
        }

        if (topic === 'Position.z') {
          const positionData = decompressPositionZ(feedData);
          callbacks.onPosition(parsePosition(positionData));
        }

        if (topic === 'CarData.z') {
          // No parser yet — gated behind F1TV auth, not expected to arrive
          const carData = decompressPositionZ(feedData);
          console.log('RAW live CarData push:', JSON.stringify(carData).slice(0, 300));
        }

        return;
      }

      // Handle snapshot/completion messages
      const result = parsed.result;
      if (!result) return;

      if (result.DriverList) callbacks.onDriverList(parseDriverList(result.DriverList));
      if (result.TrackStatus) callbacks.onTrackStatus(parseTrackStatus(result.TrackStatus));
      if (result.SessionInfo) callbacks.onSessionInfo(parseSessionInfo(result.SessionInfo));
      if (result.Heartbeat) callbacks.onHeartbeat(parseHeartbeat(result.Heartbeat));

      // Seed initial state from the snapshot, then let deltas merge on top
      if (result.TimingData) {
        deepMerge(timingState, result.TimingData);
        callbacks.onTimingData(parseTimingData(timingState));
      }
      if (result.TimingAppData) {
        deepMerge(timingAppState, result.TimingAppData);
        callbacks.onTimingAppData(parseTimingAppData(timingAppState));
      }

      if (result['Position.z']) {
        const positionData = decompressPositionZ(result['Position.z']);
        callbacks.onPosition(parsePosition(positionData));
      }
    });

    ws.on('error', (err) => console.error('F1 feed error:', err));

    ws.on('close', () => {
      console.log(`F1 feed connection closed. Reconnecting in ${retryDelay / 1000}s...`);
      setTimeout(() => {
        const nextDelay = Math.min(retryDelay * 2, 30000);
        connectToF1Feed(callbacks, nextDelay);
      }, retryDelay);
    });

    return ws;
  } catch (err) {
    console.error('Failed to connect to F1 feed:', err.message);
    setTimeout(() => {
      const nextDelay = Math.min(retryDelay * 2, 30000);
      connectToF1Feed(callbacks, nextDelay);
    }, retryDelay);
  }
}