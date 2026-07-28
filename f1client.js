import WebSocket from 'ws';
import zlib from 'zlib';
import { parseDriverList, parseTrackStatus, parseSessionInfo, parseHeartbeat, parseTimingData, parseTimingAppData } from './parsers.js';


function decompressPositionZ(base64String) {
  const buffer = Buffer.from(base64String, 'base64');
  const decompressed = zlib.inflateRawSync(buffer);
  return JSON.parse(decompressed.toString());
}

export async function connectToF1Feed(callbacks, retryDelay = 1000) {
  try {
    const negotiateResponse = await fetch('https://livetiming.formula1.com/signalrcore/negotiate?negotiateVersion=1', {
      method: 'POST'
    });
    const negotiateData = await negotiateResponse.json();

    const setCookie = negotiateResponse.headers.get('set-cookie');
    const cookieMatch = setCookie.match(/AWSALBCORS=[^;]+/);
    const albCookie = cookieMatch ? cookieMatch[0] : null;

    const url = `wss://livetiming.formula1.com/signalrcore?id=${negotiateData.connectionToken}`;
    const ws = new WebSocket(url, { headers: { Cookie: albCookie } });

    const subscribeMessage = {
      type: 1,
      target: 'Subscribe',
      arguments: [['Heartbeat', 'SessionInfo', 'TrackStatus', 'DriverList', 'TimingData', 'Position.z','CarData.z','TimingAppData']],
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

      const result = parsed.result;
      if (!result) return;

      if (result.DriverList) callbacks.onDriverList(parseDriverList(result.DriverList));
      if (result.TrackStatus) callbacks.onTrackStatus(parseTrackStatus(result.TrackStatus));
      if (result.SessionInfo) callbacks.onSessionInfo(parseSessionInfo(result.SessionInfo));
      if (result.Heartbeat) callbacks.onHeartbeat(parseHeartbeat(result.Heartbeat));
      if (result.TimingData) callbacks.onTimingData(parseTimingData(result.TimingData));
        if (result.TimingAppData) callbacks.onTimingAppData(parseTimingAppData(result.TimingAppData));
        


      if (result['Position.z']) {
        const positionData = decompressPositionZ(result['Position.z']);
        console.log('RAW Position data:', JSON.stringify(positionData, null, 2));
      }

    if (result['CarData.z']) {
    const carData = decompressPositionZ(result['CarData.z']);
    console.log('RAW CarData:', JSON.stringify(carData, null, 2));
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