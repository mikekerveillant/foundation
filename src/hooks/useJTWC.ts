import { useState, useEffect } from 'react';
import type { ActiveAlert, TyphoonTrackPoint, SignalNumber } from '../types';
import { MOCK_ALERT } from '../data/mockData';

const JTWC_RSS = 'https://www.metoc.navy.mil/jtwc/rss/jtwc.rss';
const JTWC_BASE = 'https://www.metoc.navy.mil/jtwc/products/';

// Philippines bounding box for proximity check
const PH = { minLat: 4, maxLat: 22, minLng: 114, maxLng: 128 };

function parseCoord(s: string): number {
  const dir = s[s.length - 1];
  const val = parseInt(s.slice(0, -1), 10) / 10;
  return dir === 'S' || dir === 'W' ? -val : val;
}

function ktsToIntensity(kts: number): string {
  if (kts >= 137) return 'CAT 5';
  if (kts >= 113) return 'CAT 4';
  if (kts >= 96)  return 'CAT 3';
  if (kts >= 83)  return 'CAT 2';
  if (kts >= 64)  return 'CAT 1';
  if (kts >= 34)  return 'TS';
  return 'TD';
}

function ktsToKmh(kts: number): number {
  return Math.round(kts * 1.852);
}

// PAGASA TCWS from 1-min sustained winds in km/h
function kmhToSignal(kmh: number): SignalNumber {
  if (kmh > 220) return 5;
  if (kmh > 185) return 4;
  if (kmh > 100) return 3;
  if (kmh >  60) return 2;
  if (kmh >  30) return 1;
  return 0;
}

// Parse issue date/time from .tcw header line "2026061906 07W ..."
function parseIssueTime(tcw: string): Date {
  const m = tcw.match(/^(\d{4})(\d{2})(\d{2})(\d{2})\s+\w+W/m);
  if (!m) return new Date();
  return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:00:00Z`);
}

// Parse track points from .tcw JMV 3.0 format
function parseTCW(tcw: string): {
  track: TyphoonTrackPoint[];
  name: string;
  peakKt: number;
  issueTime: Date;
} | null {
  const issueTime = parseIssueTime(tcw);

  // Storm name from header line e.g. "2026061906 07W SEVEN      003  01 ..."
  const headerM = tcw.match(/^\d{10}\s+\w+W\s+(\w+)/m);
  const name = headerM?.[1] ?? '';

  const track: TyphoonTrackPoint[] = [];
  let peakKt = 0;

  for (const line of tcw.split('\n')) {
    // T000 133N 1418E 030   or   T012 139N 1394E 040 R034 ...
    const m = line.trim().match(/^T(\d{3})\s+(\d+[NS])\s+(\d+[EW])\s+(\d+)/);
    if (!m) continue;

    const hoursOffset = parseInt(m[1], 10);
    const lat = parseCoord(m[2]);
    const lng = parseCoord(m[3]);
    const kts = parseInt(m[4], 10);

    if (kts > peakKt) peakKt = kts;

    track.push({
      lat,
      lng,
      time: new Date(issueTime.getTime() + hoursOffset * 3600_000).toISOString(),
      intensity: ktsToIntensity(kts),
    });
  }

  return track.length > 0 ? { track, name, peakKt, issueTime } : null;
}

// Extract storm ID (e.g. "wp0726") from JTWC RSS XML text
function extractWPStormIds(rssText: string): string[] {
  const ids: string[] = [];
  const re = /products\/(wp\d{4})web\.txt/g;
  let m;
  while ((m = re.exec(rssText)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  return ids;
}

// Rough distance from a point to nearest Philippine landmass (degrees, not km)
function nearPH(lat: number, lng: number): boolean {
  return lat >= PH.minLat && lat <= PH.maxLat && lng >= PH.minLng && lng <= PH.maxLng;
}

export function useJTWC() {
  const [alert, setAlert] = useState<ActiveAlert>(MOCK_ALERT);
  const [dataSource, setDataSource] = useState<'live' | 'mock'>('mock');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    async function fetch_() {
      const rssRes = await fetch(JTWC_RSS, { signal: controller.signal });
      if (!rssRes.ok) throw new Error(`RSS ${rssRes.status}`);
      const rssText = await rssRes.text();

      const stormIds = extractWPStormIds(rssText);
      if (stormIds.length === 0) return; // No active WP storms — stay on mock

      // Use the first active WP storm
      const stormId = stormIds[0];
      const tcwRes = await fetch(`${JTWC_BASE}${stormId}.tcw`, { signal: controller.signal });
      if (!tcwRes.ok) throw new Error(`TCW ${tcwRes.status}`);
      const tcwText = await tcwRes.text();

      const parsed = parseTCW(tcwText);
      if (!parsed) return;

      const { track, name, peakKt, issueTime } = parsed;
      const currentPt = track[0];

      // Determine type from current (T000) winds
      const currentKt = parseInt(
        tcwText.match(/^T000\s+\d+[NS]\s+\d+[EW]\s+(\d+)/m)?.[1] ?? '0', 10
      );
      const type: ActiveAlert['type'] =
        currentKt >= 64 ? 'typhoon'
        : currentKt >= 34 ? 'tropical_storm'
        : 'tropical_depression';

      // Signal based on peak forecast winds (what PAGASA will eventually issue)
      const signal = kmhToSignal(ktsToKmh(peakKt));

      // Check if any track point approaches Philippine area
      const phTrackPts = track.filter(pt => nearPH(pt.lat, pt.lng));

      // Only override affected regions if the storm is entering PH area
      const affectedRegionIds = phTrackPts.length > 0 ? MOCK_ALERT.affectedRegionIds : [];
      const affectedProvinces = phTrackPts.length > 0 ? MOCK_ALERT.affectedProvinces : [];

      const typeLabel = type === 'typhoon' ? 'Typhoon' : type === 'tropical_storm' ? 'Tropical Storm' : 'Tropical Depression';
      const stormName = name ? `${typeLabel} ${name}` : typeLabel;

      setAlert({
        ...MOCK_ALERT,
        id: stormId,
        name: stormName,
        type,
        signalNumber: signal,
        coordinates: { lat: currentPt.lat, lng: currentPt.lng },
        track,
        intensity: `${ktsToKmh(peakKt)} km/h peak forecast · ${ktsToKmh(currentKt)} km/h current`,
        lastUpdated: issueTime.toISOString(),
        source: 'live',
        affectedRegionIds,
        affectedProvinces,
      });
      setDataSource('live');
    }

    fetch_()
      .catch(() => { /* keep mock */ })
      .finally(() => { clearTimeout(timeout); setLoading(false); });

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  return { alert, dataSource, loading };
}
