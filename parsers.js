
export function parseDriverList(driverListObject) {
  return Object.entries(driverListObject)
    .filter(([key, value]) => key !== '_kf')
    .map(([number, driver]) => {
      return {
        number: parseInt(number),
        name: driver.FullName,
        team: driver.TeamName,
        color: '#' + driver.TeamColour
      };
    });
}

export function parseTrackStatus(trackStatusObject) {
  return {
    status: trackStatusObject.Status,
    message: trackStatusObject.Message
  };
}

export function parseSessionInfo(sessionInfoObject) {
  return {
    sessionKey: sessionInfoObject.Key,
    meetingName: sessionInfoObject.Meeting.Name,
    officialName: sessionInfoObject.Meeting.OfficialName,
    location: sessionInfoObject.Meeting.Location,
    country: sessionInfoObject.Meeting.Country.Name,
    circuit: sessionInfoObject.Meeting.Circuit.ShortName,
    sessionType: sessionInfoObject.Type,
    sessionName: sessionInfoObject.Name,
    status: sessionInfoObject.SessionStatus,
    startDate: sessionInfoObject.StartDate,
    endDate: sessionInfoObject.EndDate
  };
}

export function parseHeartbeat(heartbeatObject) {
  return {
    utc: heartbeatObject.Utc
  };
}


export function parseTimingData(timingDataObject) {
  return Object.entries(timingDataObject.Lines)
    .map(([number, driver]) => {
      return {
        number: parseInt(number),
        position: parseInt(driver.Position),
        gapToLeader: driver.GapToLeader,
        intervalAhead: driver.IntervalToPositionAhead?.Value,
        catching: driver.IntervalToPositionAhead?.Catching,
        lastLapTime: driver.LastLapTime?.Value,
        bestLapTime: driver.BestLapTime?.Value,
        pitStops: driver.NumberOfPitStops,
        inPit: driver.InPit,
        pitOut: driver.PitOut,
        stopped: driver.Stopped,
        retired: driver.Retired,
      
        sectors: driver.Sectors?.map((s) => s.Value) ?? [],
        
        speeds: {
          i1: driver.Speeds?.I1?.Value,
          i2: driver.Speeds?.I2?.Value,
          finishLine: driver.Speeds?.FL?.Value,
          speedTrap: driver.Speeds?.ST?.Value
        }
      };
    })
    .sort((a, b) => a.position - b.position);
}


export function parseTimingAppData(timingAppDataObject) {
  return Object.entries(timingAppDataObject.Lines)
    .map(([number, driver]) => {
      const stints = driver.Stints || [];
      const currentStint = stints[stints.length - 1]; // most recent stint

      return {
        number: parseInt(number),
        gridPosition: parseInt(driver.GridPos),
        currentCompound: currentStint?.Compound,
        currentStintLaps: currentStint?.TotalLaps,
        isNewTyre: currentStint?.New === 'true',
        totalStints: stints.length,
        stintHistory: stints.map((s) => s.Compound) // e.g. ["MEDIUM", "HARD", "SOFT"]
      };
    });
}


export function parsePosition(positionData) {
  // Expected shape (unverified until live data confirms it):
  // { Position: [ { Timestamp, Entries: { "1": { X, Y, Z, Status }, ... } } ] }
  const latest = positionData?.Position?.[positionData.Position.length - 1];
  if (!latest?.Entries) return [];

  return Object.entries(latest.Entries).map(([number, entry]) => ({
    number: parseInt(number),
    x: entry.X,
    y: entry.Y,
    z: entry.Z,
    status: entry.Status
  }));
}

