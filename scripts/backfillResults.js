import { saveResults, saveDrivers } from '../db.js';

async function backfillSeason(year) {
  console.log(`Fetching all sessions for ${year}...`);
  const sessionsRes = await fetch(`https://api.openf1.org/v1/sessions?year=${year}`);
  const sessions = await sessionsRes.json();

  console.log(`Found ${sessions.length} sessions. Backfilling results...`);

  for (const session of sessions) {
    const sessionKey = session.session_key;

    try {
      const resultRes = await fetch(`https://api.openf1.org/v1/session_result?session_key=${sessionKey}`);
      const results = await resultRes.json();

      if (!Array.isArray(results) || results.length === 0) {
        console.log(`  ${session.session_name} (${session.location}) — no results yet, skipping`);
        continue;
      }

      
      const timingShape = results.map((r) => ({
        number: r.driver_number,
        position: r.position,
        gapToLeader: r.gap_to_leader ? String(r.gap_to_leader) : '',
        bestLapTime: r.duration ? String(r.duration) : null,
        pitStops: null, 
        retired: r.dnf === true ? 1 : 0
      }));

      saveResults(sessionKey, timingShape);
      console.log(`  ${session.session_name} (${session.location}) — saved ${timingShape.length} results`);
    } catch (err) {
      console.error(`  Failed for session ${sessionKey}:`, err.message);
    }

    
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log('Backfill complete.');
}

backfillSeason(2026);