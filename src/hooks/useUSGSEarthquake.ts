import { useState, useEffect } from 'react';
import type { ActiveAlert, SignalNumber } from '../types';
import { MOCK_EARTHQUAKE } from '../data/mockData';

// Philippines bounding box
const PH_BOUNDS = { minLat: 4, maxLat: 21, minLng: 116, maxLng: 128 };

// Rough bounding boxes for region assignment (lat/lng ranges)
const REGION_BOXES: { id: string; minLat: number; maxLat: number; minLng: number; maxLng: number }[] = [
  { id: 'NCR',   minLat: 14.4, maxLat: 14.8,  minLng: 120.9, maxLng: 121.2 },
  { id: 'CAR',   minLat: 16.0, maxLat: 18.5,  minLng: 120.0, maxLng: 122.0 },
  { id: 'I',     minLat: 15.5, maxLat: 18.5,  minLng: 119.5, maxLng: 121.0 },
  { id: 'II',    minLat: 16.5, maxLat: 19.0,  minLng: 121.5, maxLng: 123.0 },
  { id: 'III',   minLat: 14.8, maxLat: 16.5,  minLng: 119.5, maxLng: 122.0 },
  { id: 'IVA',   minLat: 13.5, maxLat: 15.0,  minLng: 120.0, maxLng: 122.5 },
  { id: 'IVB',   minLat:  8.0, maxLat: 13.0,  minLng: 117.0, maxLng: 122.0 },
  { id: 'V',     minLat: 12.0, maxLat: 14.5,  minLng: 122.0, maxLng: 124.5 },
  { id: 'VI',    minLat: 10.0, maxLat: 12.0,  minLng: 121.0, maxLng: 123.5 },
  { id: 'VII',   minLat:  9.0, maxLat: 11.0,  minLng: 122.5, maxLng: 125.0 },
  { id: 'VIII',  minLat: 10.0, maxLat: 12.5,  minLng: 124.0, maxLng: 126.5 },
  { id: 'IX',    minLat:  7.0, maxLat:  9.5,  minLng: 121.0, maxLng: 124.0 },
  { id: 'X',     minLat:  7.5, maxLat:  9.0,  minLng: 123.5, maxLng: 125.5 },
  { id: 'XI',    minLat:  5.5, maxLat:  8.0,  minLng: 125.0, maxLng: 127.0 },
  { id: 'XII',   minLat:  6.0, maxLat:  8.5,  minLng: 124.0, maxLng: 125.5 },
  { id: 'XIII',  minLat:  7.5, maxLat: 10.0,  minLng: 125.0, maxLng: 126.5 },
  { id: 'BARMM', minLat:  5.0, maxLat:  8.5,  minLng: 119.0, maxLng: 124.0 },
];

function regionIdsForPoint(lat: number, lng: number): string[] {
  return REGION_BOXES.filter(r =>
    lat >= r.minLat && lat <= r.maxLat && lng >= r.minLng && lng <= r.maxLng
  ).map(r => r.id);
}

// Approximate PHIVOLCS intensity from magnitude
function magToPhivolcs(mag: number): string {
  if (mag >= 7.5) return 'X';
  if (mag >= 7.0) return 'IX';
  if (mag >= 6.5) return 'VIII';
  if (mag >= 6.2) return 'VII';
  if (mag >= 5.9) return 'VI';
  if (mag >= 5.5) return 'V';
  return 'IV';
}

function magToSignal(mag: number): SignalNumber {
  if (mag >= 7.0) return 4;
  if (mag >= 6.5) return 3;
  if (mag >= 6.0) return 2;
  if (mag >= 5.5) return 1;
  return 0;
}

// Extract a short location label from USGS "place" string
// e.g. "63 km ESE of Bobon, Philippines" → "Bobon"
function parsePlaceLabel(place: string): string {
  const ofIdx = place.indexOf(' of ');
  if (ofIdx !== -1) {
    return place.slice(ofIdx + 4).replace(/, Philippines.*/, '').trim();
  }
  return place.replace(/, Philippines.*/, '').trim();
}

interface USGSFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;      // epoch ms
    updated: number;   // epoch ms
    tsunami: number;
    sig: number;
  };
  geometry: {
    coordinates: [number, number, number]; // [lng, lat, depth_km]
  };
}

interface USGSResponse {
  features: USGSFeature[];
}

function usgsFeatureToAlert(f: USGSFeature): ActiveAlert {
  const [lng, lat, depth] = f.geometry.coordinates;
  const { mag, place, time, updated, tsunami } = f.properties;
  const location = parsePlaceLabel(place);
  const regionIds = regionIdsForPoint(lat, lng);
  const phivolcs = magToPhivolcs(mag);

  const tsunamiNote = tsunami ? ' · Tsunami watch issued' : '';
  const intensityLabel = `PHIVOLCS Intensity ${phivolcs} · ${mag >= 6.5 ? 'Destructive' : 'Strong'}${tsunamiNote}`;

  return {
    id: f.id,
    name: `M${mag.toFixed(1)} Earthquake — ${location}`,
    type: 'earthquake',
    signalNumber: magToSignal(mag),
    affectedRegionIds: regionIds,
    affectedProvinces: [location],
    coordinates: { lat, lng },
    track: [],
    intensity: intensityLabel,
    occurredAt: new Date(time).toISOString(),
    lastUpdated: new Date(updated).toISOString(),
    source: 'live',
    magnitude: mag,
    depth: Math.round(depth),
    phivolcsIntensity: phivolcs,
  };
}

export function useUSGSEarthquake() {
  const [alert, setAlert] = useState<ActiveAlert>(MOCK_EARTHQUAKE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // 30-day window, M≥5.5, Philippines bounding box, most recent first
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const url = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query');
    url.searchParams.set('format', 'geojson');
    url.searchParams.set('starttime', thirtyDaysAgo);
    url.searchParams.set('minlatitude', String(PH_BOUNDS.minLat));
    url.searchParams.set('maxlatitude', String(PH_BOUNDS.maxLat));
    url.searchParams.set('minlongitude', String(PH_BOUNDS.minLng));
    url.searchParams.set('maxlongitude', String(PH_BOUNDS.maxLng));
    url.searchParams.set('minmagnitude', '5.5');
    url.searchParams.set('orderby', 'time');
    url.searchParams.set('limit', '1');

    fetch(url.toString(), { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<USGSResponse>;
      })
      .then(data => {
        clearTimeout(timeout);
        const top = data.features?.[0];
        if (top) {
          setAlert(usgsFeatureToAlert(top));
        }
        // No M≥5.5 in last 30 days — keep mock (quiet period)
      })
      .catch(() => {
        clearTimeout(timeout);
        // Network error or timeout — keep mock
      })
      .finally(() => setLoading(false));

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  return { alert, loading };
}
