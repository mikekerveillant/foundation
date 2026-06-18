import { useState, useEffect } from 'react';
import type { ActiveAlert } from '../types';
import { MOCK_ALERT } from '../data/mockData';

interface GDACSFeature {
  type: string;
  geometry: { type: string; coordinates: [number, number] };
  properties: {
    eventid: number;
    eventtype: string;
    eventname: string;
    alertlevel: 'Green' | 'Orange' | 'Red';
    country: string;
    fromdate: string;
    todate: string;
    severity?: { severitytext: string };
    url: { details: string };
  };
}

interface GDACSResponse {
  features: GDACSFeature[];
}

function gdacsAlertToSignal(alertLevel: 'Green' | 'Orange' | 'Red', eventtype: string): import('../types').SignalNumber {
  if (eventtype === 'TC') {
    if (alertLevel === 'Red') return 4;
    if (alertLevel === 'Orange') return 3;
    return 1;
  }
  return 0;
}

function parseGDACSResponse(data: GDACSResponse): ActiveAlert | null {
  const tc = data.features?.find(f => f.properties.eventtype === 'TC' && f.properties.country === 'Philippines');
  const eq = data.features?.find(f => f.properties.eventtype === 'EQ' && f.properties.country === 'Philippines');
  const event = tc || eq;
  if (!event) return null;

  const [lng, lat] = event.geometry.coordinates;
  const p = event.properties;

  return {
    id: String(p.eventid),
    name: p.eventname || (p.eventtype === 'TC' ? 'Tropical Cyclone' : 'Earthquake'),
    type: p.eventtype === 'TC' ? 'typhoon' : 'earthquake',
    signalNumber: gdacsAlertToSignal(p.alertlevel, p.eventtype),
    affectedRegionIds: [],
    affectedProvinces: [],
    coordinates: { lat, lng },
    track: [],
    intensity: p.severity?.severitytext || p.alertlevel,
    lastUpdated: p.todate || p.fromdate,
    source: 'live',
    gdacsAlertLevel: p.alertlevel,
  };
}

export function useGDACS() {
  const [alert, setAlert] = useState<ActiveAlert>(MOCK_ALERT);
  const [dataSource, setDataSource] = useState<'live' | 'mock'>('mock');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetch(
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?country=Philippines&limit=10',
      { signal: controller.signal, headers: { Accept: 'application/json' } }
    )
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<GDACSResponse>;
      })
      .then(data => {
        clearTimeout(timeout);
        // Only use GDACS live data if there's an active tropical cyclone
        const tc = data.features?.find((f: GDACSFeature) => f.properties.eventtype === 'TC' && f.properties.country === 'Philippines');
        if (tc) {
          const parsed = parseGDACSResponse(data);
          if (parsed) {
            setAlert({ ...MOCK_ALERT, ...parsed, affectedRegionIds: MOCK_ALERT.affectedRegionIds, affectedProvinces: MOCK_ALERT.affectedProvinces, track: MOCK_ALERT.track, source: 'live' });
            setDataSource('live');
            return;
          }
        }
        // No active TC — GDACS is reachable but no typhoon; keep mock typhoon scenario
        setDataSource('mock');
      })
      .catch(() => {
        clearTimeout(timeout);
        setDataSource('mock');
      })
      .finally(() => setLoading(false));

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  return { alert, dataSource, loading };
}
