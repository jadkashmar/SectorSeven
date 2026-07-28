import { connectToF1Feed } from './f1client.js';

connectToF1Feed({
  onDriverList: (drivers) => console.log('Drivers:', drivers),
  onTrackStatus: (status) => console.log('Track Status:', status),
  onSessionInfo: (info) => console.log('Session Info:', info),
  onHeartbeat: (hb) => console.log('Heartbeat:', hb),
  onTimingData: (timing) => console.log('Timing Data:', timing)
});