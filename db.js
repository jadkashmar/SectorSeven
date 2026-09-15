import Database from 'better-sqlite3';

export const db = new Database('f1data.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_key INTEGER UNIQUE,
    meeting_name TEXT,
    circuit TEXT,
    country TEXT,
    session_type TEXT,
    session_name TEXT,
    status TEXT,
    start_date TEXT,
    end_date TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_number INTEGER UNIQUE,
    full_name TEXT,
    team_name TEXT,
    team_colour TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_key INTEGER,
    driver_number INTEGER,
    position INTEGER,
    gap_to_leader TEXT,
    best_lap_time TEXT,
    pit_stops INTEGER,
    retired INTEGER,
    UNIQUE(session_key, driver_number)
  )
`);

export function saveSessionInfo(sessionInfo) {
  const stmt = db.prepare(`
    INSERT INTO sessions (session_key, meeting_name, circuit, country, session_type, session_name, status, start_date, end_date)
    VALUES (@sessionKey, @meetingName, @circuit, @country, @sessionType, @sessionName, @status, @startDate, @endDate)
    ON CONFLICT(session_key) DO UPDATE SET status = @status
  `);
  stmt.run({
    sessionKey: sessionInfo.sessionKey ?? 0, 
    meetingName: sessionInfo.meetingName,
    circuit: sessionInfo.circuit,
    country: sessionInfo.country,
    sessionType: sessionInfo.sessionType,
    sessionName: sessionInfo.sessionName,
    status: sessionInfo.status,
    startDate: sessionInfo.startDate,
    endDate: sessionInfo.endDate
  });
}

export function saveDrivers(drivers) {
  const stmt = db.prepare(`
    INSERT INTO drivers (driver_number, full_name, team_name, team_colour)
    VALUES (@number, @name, @team, @color)
    ON CONFLICT(driver_number) DO UPDATE SET full_name = @name, team_name = @team, team_colour = @color
  `);
  drivers.forEach((driver) => stmt.run(driver));
}

export function saveResults(sessionKey, timingData) {
  const stmt = db.prepare(`
    INSERT INTO results (session_key, driver_number, position, gap_to_leader, best_lap_time, pit_stops, retired)
    VALUES (@sessionKey, @number, @position, @gapToLeader, @bestLapTime, @pitStops, @retired)
    ON CONFLICT(session_key, driver_number) DO UPDATE SET
      position = @position,
      gap_to_leader = @gapToLeader,
      best_lap_time = @bestLapTime,
      pit_stops = @pitStops,
      retired = @retired
  `);
  timingData.forEach((row) => {
    stmt.run({
      sessionKey,
      number: row.number,
      position: row.position,
      gapToLeader: row.gapToLeader,
      bestLapTime: row.bestLapTime,
      pitStops: row.pitStops,
      retired: row.retired ? 1 : 0
    });
  });
}

db.exec(`
  CREATE TABLE IF NOT EXISTS openf1_cache (
    cache_key TEXT PRIMARY KEY,
    data TEXT,
    updated_at TEXT
  )
`);

export function getCachedOpenF1(key) {
  const row = db.prepare('SELECT data FROM openf1_cache WHERE cache_key = ?').get(key);
  return row ? JSON.parse(row.data) : null;
}

export function setCachedOpenF1(key, data) {
  db.prepare(`
    INSERT INTO openf1_cache (cache_key, data, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(cache_key) DO UPDATE SET data = ?, updated_at = ?
  `).run(key, JSON.stringify(data), new Date().toISOString(), JSON.stringify(data), new Date().toISOString());
}