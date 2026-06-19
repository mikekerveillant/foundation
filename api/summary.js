// Daily summary API — aggregates live disaster data + static inventory/staffing
// Called by the morning briefing cloud agent.

const JTWC_RSS  = 'https://www.metoc.navy.mil/jtwc/rss/jtwc.rss';
const JTWC_BASE = 'https://www.metoc.navy.mil/jtwc/products/';
const USGS_URL  = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
const GVP_URL   = 'https://volcano.si.edu/gvp_currenteruptions.cfm';

// ── Warehouses (mirrors mockData.ts) ────────────────────────────────────────
const WAREHOUSES = [
  {
    id: 'wh-001', name: 'Leyte Distribution Center',
    province: 'Leyte', region: 'Eastern Visayas', regionId: 'VIII',
    islandGroup: 'Visayas',
    inventory: {
      water:   { qty: 12400, unit: 'liters',  threshold: 5000 },
      food:    { qty: 3800,  unit: 'packs',   threshold: 2000 },
      medical: { qty: 420,   unit: 'kits',    threshold: 150 },
      shelter: { qty: 680,   unit: 'kits',    threshold: 200 },
      rescue:  { qty: 28,    unit: 'units',   threshold: 10 },
    },
  },
  {
    id: 'wh-002', name: 'Albay Relief Hub',
    province: 'Albay', region: 'Bicol Region', regionId: 'V',
    islandGroup: 'Luzon',
    inventory: {
      water:   { qty: 9200, unit: 'liters',  threshold: 5000 },
      food:    { qty: 2100, unit: 'packs',   threshold: 2000 },
      medical: { qty: 310,  unit: 'kits',    threshold: 150 },
      shelter: { qty: 890,  unit: 'kits',    threshold: 200 },
      rescue:  { qty: 45,   unit: 'units',   threshold: 10 },
    },
  },
  {
    id: 'wh-003', name: 'Cagayan Logistics Base',
    province: 'Cagayan', region: 'Cagayan Valley', regionId: 'II',
    islandGroup: 'Luzon',
    inventory: {
      water:   { qty: 18600, unit: 'liters', threshold: 5000 },
      food:    { qty: 4200,  unit: 'packs',  threshold: 2000 },
      medical: { qty: 580,   unit: 'kits',   threshold: 150 },
      shelter: { qty: 1100,  unit: 'kits',   threshold: 200 },
      rescue:  { qty: 62,    unit: 'units',  threshold: 10 },
    },
  },
  {
    id: 'wh-004', name: 'Iloilo Response Center',
    province: 'Iloilo', region: 'Western Visayas', regionId: 'VI',
    islandGroup: 'Visayas',
    inventory: {
      water:   { qty: 7800,  unit: 'liters', threshold: 5000 },
      food:    { qty: 1200,  unit: 'packs',  threshold: 2000 },
      medical: { qty: 220,   unit: 'kits',   threshold: 150 },
      shelter: { qty: 450,   unit: 'kits',   threshold: 200 },
      rescue:  { qty: 19,    unit: 'units',  threshold: 10 },
    },
  },
  {
    id: 'wh-005', name: 'Davao Southern Hub',
    province: 'Davao del Sur', region: 'Davao Region', regionId: 'XI',
    islandGroup: 'Mindanao',
    inventory: {
      water:   { qty: 24000, unit: 'liters', threshold: 5000 },
      food:    { qty: 7600,  unit: 'packs',  threshold: 2000 },
      medical: { qty: 710,   unit: 'kits',   threshold: 150 },
      shelter: { qty: 1450,  unit: 'kits',   threshold: 200 },
      rescue:  { qty: 84,    unit: 'units',  threshold: 10 },
    },
  },
  {
    id: 'wh-006', name: 'NCR Operations Center',
    province: 'Metro Manila', region: 'National Capital Region', regionId: 'NCR',
    islandGroup: 'Luzon',
    inventory: {
      water:   { qty: 31000, unit: 'liters', threshold: 5000 },
      food:    { qty: 9400,  unit: 'packs',  threshold: 2000 },
      medical: { qty: 940,   unit: 'kits',   threshold: 150 },
      shelter: { qty: 2200,  unit: 'kits',   threshold: 200 },
      rescue:  { qty: 110,   unit: 'units',  threshold: 10 },
    },
  },
];

// ── Staff (mirrors mockData.ts) ──────────────────────────────────────────────
const STAFF = [
  { id: 's-001', name: 'Maria Santos',     role: 'Field Coordinator',  regionId: 'V',   province: 'Albay',          available: false, assignment: 'Typhoon Kristine Response' },
  { id: 's-002', name: 'Juan dela Cruz',   role: 'Logistics Officer',  regionId: 'VIII',province: 'Leyte',          available: false, assignment: 'Typhoon Kristine Response' },
  { id: 's-003', name: 'Ana Reyes',        role: 'Medical Coordinator',regionId: 'NCR', province: 'Quezon City',    available: true  },
  { id: 's-004', name: 'Pedro Bautista',   role: 'Field Coordinator',  regionId: 'VI',  province: 'Iloilo',         available: true  },
  { id: 's-005', name: 'Luisa Mendoza',    role: 'Program Officer',    regionId: 'NCR', province: 'Makati',         available: true  },
  { id: 's-006', name: 'Carlo Villanueva', role: 'Logistics Officer',  regionId: 'II',  province: 'Cagayan',        available: false, assignment: 'Typhoon Kristine Response' },
  { id: 's-007', name: 'Rosa Fernandez',   role: 'Field Coordinator',  regionId: 'XI',  province: 'Davao del Sur',  available: true  },
  { id: 's-008', name: 'Mark Alonzo',      role: 'Medical Staff',      regionId: 'V',   province: 'Camarines Sur',  available: false, assignment: 'Typhoon Kristine Response' },
  { id: 's-009', name: 'Elena Torres',     role: 'Finance Officer',    regionId: 'NCR', province: 'Pasig',          available: true  },
  { id: 's-010', name: 'Jose Ramos',       role: 'Logistics Officer',  regionId: 'VI',  province: 'Iloilo',         available: true  },
  { id: 's-011', name: 'Carmen Lim',       role: 'Field Coordinator',  regionId: 'VIII',province: 'Leyte',          available: false, assignment: 'Typhoon Kristine Response' },
  { id: 's-012', name: 'Ramon Castillo',   role: 'Program Officer',    regionId: 'XIII',province: 'Agusan del Norte',available: true  },
  { id: 's-013', name: 'Nena Aquino',      role: 'Medical Coordinator',regionId: 'II',  province: 'Isabela',        available: false, assignment: 'Typhoon Kristine Response' },
  { id: 's-014', name: 'Dino Reyes',       role: 'Logistics Officer',  regionId: 'XI',  province: 'Davao City',     available: true  },
  { id: 's-015', name: 'Grace Gomez',      role: 'Field Coordinator',  regionId: 'NCR', province: 'Manila',         available: true  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function stripTags(s) { return s.replace(/<[^>]+>/g, '').trim(); }

function parseCoord(s) {
  const dir = s[s.length - 1];
  const val = parseInt(s.slice(0, -1), 10) / 10;
  return dir === 'S' || dir === 'W' ? -val : val;
}
function ktsToKmh(kts) { return Math.round(kts * 1.852); }
function ktsToCategory(kts) {
  if (kts >= 137) return 'CAT 5 Typhoon';
  if (kts >= 113) return 'CAT 4 Typhoon';
  if (kts >= 96)  return 'CAT 3 Typhoon';
  if (kts >= 83)  return 'CAT 2 Typhoon';
  if (kts >= 64)  return 'CAT 1 Typhoon';
  if (kts >= 34)  return 'Tropical Storm';
  return 'Tropical Depression';
}

// ── Fetch typhoon (JTWC) ─────────────────────────────────────────────────────
async function fetchTyphoons() {
  const rss = await fetch(JTWC_RSS, { signal: AbortSignal.timeout(8000) });
  const text = await rss.text();

  const ids = [];
  const re = /products\/(wp\d{4})web\.txt/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  if (!ids.length) return [];

  const storms = await Promise.all(ids.map(async id => {
    const tcw = await fetch(`${JTWC_BASE}${id}.tcw`, { signal: AbortSignal.timeout(8000) });
    const raw = await tcw.text();

    const headerM = raw.match(/^(\d{4})(\d{2})(\d{2})(\d{2})\s+\w+W\s+(\w+)/m);
    const issueTime = headerM
      ? new Date(`${headerM[1]}-${headerM[2]}-${headerM[3]}T${headerM[4]}:00:00Z`)
      : new Date();
    const name = headerM?.[5] ?? id.toUpperCase();

    const track = [];
    for (const line of raw.split('\n')) {
      const lm = line.trim().match(/^T(\d{3})\s+(\d+[NS])\s+(\d+[EW])\s+(\d+)/);
      if (!lm) continue;
      track.push({
        hoursAhead: parseInt(lm[1], 10),
        lat: parseCoord(lm[2]),
        lng: parseCoord(lm[3]),
        windKt: parseInt(lm[4], 10),
        validAt: new Date(issueTime.getTime() + parseInt(lm[1], 10) * 3600_000).toISOString(),
      });
    }

    const current = track[0] ?? {};
    const peak = Math.max(...track.map(t => t.windKt));

    return {
      id,
      name,
      issuedAt: issueTime.toISOString(),
      currentPosition: { lat: current.lat, lng: current.lng },
      currentWindKt: current.windKt,
      currentWindKmh: ktsToKmh(current.windKt),
      category: ktsToCategory(current.windKt),
      peakForecastKt: peak,
      peakForecastKmh: ktsToKmh(peak),
      peakCategory: ktsToCategory(peak),
      track,
    };
  }));
  return storms;
}

// ── Fetch earthquakes (USGS) ─────────────────────────────────────────────────
async function fetchEarthquakes() {
  const since = new Date(Date.now() - 7 * 24 * 3600_000).toISOString().split('T')[0];
  const url = `${USGS_URL}?format=geojson&starttime=${since}&minlatitude=4&maxlatitude=21&minlongitude=116&maxlongitude=128&minmagnitude=5.5&orderby=time&limit=5`;
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const data = await r.json();
  return (data.features ?? []).map(f => ({
    id: f.id,
    place: f.properties.place,
    magnitude: f.properties.mag,
    depthKm: Math.round(f.geometry.coordinates[2]),
    occurredAt: new Date(f.properties.time).toISOString(),
    tsunami: !!f.properties.tsunami,
    coordinates: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] },
  }));
}

// ── Fetch volcanos (GVP) ─────────────────────────────────────────────────────
async function fetchVolcanos() {
  const VOLCANO_META = {
    Mayon:   { lat: 13.2575, lng: 123.6855, region: 'Bicol (V)',        dangerZoneKm: 6  },
    Kanlaon: { lat: 10.4120, lng: 123.1320, region: 'W. Visayas (VI)',  dangerZoneKm: 4  },
    Taal:    { lat: 14.0023, lng: 120.9900, region: 'CALABARZON (IVA)', dangerZoneKm: 14 },
    Bulusan: { lat: 12.7696, lng: 124.0536, region: 'Bicol (V)',        dangerZoneKm: 4  },
  };
  const r = await fetch(GVP_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FoundationOps/1.0)' }, signal: AbortSignal.timeout(8000) });
  const html = await r.text();
  const results = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rm;
  while ((rm = rowRe.exec(html)) !== null) {
    const row = rm[1];
    if (!row.includes('Philippines')) continue;
    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = []; let cm;
    while ((cm = cellRe.exec(row)) !== null) cells.push(stripTags(cm[1]));
    if (cells.length < 5) continue;
    const [name, , startDate, lastActivity, eruType] = cells;
    const meta = VOLCANO_META[name];
    if (!meta) continue;
    results.push({ name, region: meta.region, dangerZoneKm: meta.dangerZoneKm, eruptionSince: startDate, lastActivity: lastActivity.replace(/\(.*?\)/, '').trim(), eruType });
  }
  return results;
}

// ── Inventory analysis ────────────────────────────────────────────────────────
function analyzeInventory() {
  return WAREHOUSES.map(wh => {
    const low = Object.entries(wh.inventory)
      .filter(([, v]) => v.qty < v.threshold * 1.5)
      .map(([cat, v]) => ({
        category: cat,
        qty: v.qty,
        unit: v.unit,
        threshold: v.threshold,
        pct: Math.round(v.qty / v.threshold * 100),
      }));
    return { ...wh, inventory: wh.inventory, lowItems: low };
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

  const [typhoons, earthquakes, volcanos] = await Promise.allSettled([
    fetchTyphoons(),
    fetchEarthquakes(),
    fetchVolcanos(),
  ]);

  res.status(200).json({
    asOf: new Date().toISOString(),
    disasters: {
      typhoons:    typhoons.status    === 'fulfilled' ? typhoons.value    : [],
      earthquakes: earthquakes.status === 'fulfilled' ? earthquakes.value : [],
      volcanos:    volcanos.status    === 'fulfilled'  ? volcanos.value   : [],
    },
    warehouses: analyzeInventory(),
    staff: STAFF,
  });
}
