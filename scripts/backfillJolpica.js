import { saveResults } from '../db.js';

const YEAR = 2026;

async function fetchJson(url) {
  const res = await fetch(url);
  return res.json();
}

async function backfillFromJolpica() {
  console.log('Fetching OpenF1 meetings/sessions...');
  const sessions = await fetchJson(`https://api.openf1.org/v1/sessions?year=${YEAR}`);

  const grouped = {};
  sessions.forEach((s) => {
    if (!grouped[s.meeting_key]) grouped[s.meeting_key] = { meetingKey: s.meeting_key, sessions: [] };
    grouped[s.meeting_key].sessions.push(s);
  });

  const meetings = Object.values(grouped).filter((m) =>
    m.sessions.some((s) => s.session_type === 'Race')
  );

  console.log('Fetching Jolpica season schedule...');
  const scheduleData = await fetchJson(`https://api.jolpi.ca/ergast/f1/${YEAR}.json?limit=100`);
  const scheduleRaces = scheduleData?.MRData?.RaceTable?.Races || [];

  console.log(`Jolpica schedule has ${scheduleRaces.length} rounds.`);

  for (const meeting of meetings) {
    const raceSession = meeting.sessions.find((s) => s.session_type === 'Race');
    const qualiSession = meeting.sessions.find((s) => s.session_type === 'Qualifying');
    if (!raceSession) continue;

    const raceDate = raceSession.date_start.slice(0, 10);
    const scheduleMatch = scheduleRaces.find((r) => r.date === raceDate);

    if (!scheduleMatch) {
      console.log(`${meeting.sessions[0].location} (${raceDate}) — no matching round in Jolpica schedule`);
      continue;
    }

    const round = scheduleMatch.round;

    // Fetch this specific round's race results individually
    const raceResultData = await fetchJson(`https://api.jolpi.ca/ergast/f1/${YEAR}/${round}/results/`);
    const raceResult = raceResultData?.MRData?.RaceTable?.Races?.[0];

    if (raceResult) {
      const timingShape = raceResult.Results.map((r) => ({
        number: parseInt(r.number),
        position: parseInt(r.position),
        gapToLeader: r.Time?.time || (r.status !== 'Finished' ? r.status : ''),
        bestLapTime: r.FastestLap?.Time?.time || null,
        pitStops: null,
        retired: r.status === 'Finished' || r.status.startsWith('+') ? 0 : 1
      }));
      saveResults(raceSession.session_key, timingShape);
      console.log(`Round ${round} (${raceResult.raceName}) — Race: saved ${timingShape.length} results`);
    } else {
      console.log(`Round ${round} — Race: no results yet`);
    }

    // Fetch qualifying for this round individually too
    if (qualiSession) {
      const qualiResultData = await fetchJson(`https://api.jolpi.ca/ergast/f1/${YEAR}/${round}/qualifying/`);
      const qualiResult = qualiResultData?.MRData?.RaceTable?.Races?.[0];

      if (qualiResult) {
        const timingShape = qualiResult.QualifyingResults.map((r) => ({
          number: parseInt(r.number),
          position: parseInt(r.position),
          gapToLeader: '',
          bestLapTime: r.Q3?.time || r.Q2?.time || r.Q1?.time || null,
          pitStops: null,
          retired: 0
        }));
        saveResults(qualiSession.session_key, timingShape);
        console.log(`Round ${round} (${qualiResult.raceName}) — Qualifying: saved ${timingShape.length} results`);
      } else {
        console.log(`Round ${round} — Qualifying: no results yet`);
      }
    }

    // Be polite to Jolpica's rate limits
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log('Jolpica backfill complete.');
}

backfillFromJolpica();