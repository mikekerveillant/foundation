// Serverless function: fetches Smithsonian GVP current eruptions page,
// parses the HTML table, and returns Philippine volcanoes as JSON.
// Runs server-side to sidestep the GVP site's missing CORS headers.

const GVP_URL = 'https://volcano.si.edu/gvp_currenteruptions.cfm';

// Known Philippine volcano metadata (coordinates, PHIVOLCS PDZ, affected regions)
const VOLCANO_META = {
  'Mayon': {
    lat: 13.2575, lng: 123.6855,
    regionIds: ['V'],
    provinces: ['Albay', 'Camarines Sur'],
    dangerZoneKm: 6,
    volcanoName: 'Mayon Volcano',
  },
  'Kanlaon': {
    lat: 10.4120, lng: 123.1320,
    regionIds: ['VI'],
    provinces: ['Negros Occidental', 'Negros Oriental'],
    dangerZoneKm: 4,
    volcanoName: 'Kanlaon Volcano',
  },
  'Taal': {
    lat: 14.0023, lng: 120.9900,
    regionIds: ['IVA'],
    provinces: ['Batangas', 'Cavite'],
    dangerZoneKm: 14,
    volcanoName: 'Taal Volcano',
  },
  'Bulusan': {
    lat: 12.7696, lng: 124.0536,
    regionIds: ['V'],
    provinces: ['Sorsogon'],
    dangerZoneKm: 4,
    volcanoName: 'Bulusan Volcano',
  },
  'Pinatubo': {
    lat: 15.1429, lng: 120.3496,
    regionIds: ['III'],
    provinces: ['Zambales', 'Pampanga', 'Tarlac'],
    dangerZoneKm: 10,
    volcanoName: 'Mount Pinatubo',
  },
};

// Derive a rough PHIVOLCS alert level from GVP eruption type string
function eruTypeToAlertLevel(eruType) {
  const t = eruType.toLowerCase();
  if (t.includes('explosive') && t.includes('effusive')) return 3;
  if (t.includes('explosive')) return 3;
  if (t.includes('effusive')) return 2;
  if (t.includes('minor') || t.includes('phreatic')) return 2;
  return 2;
}

// Parse "2026 Jan 6" or "2024 Oct 19" into ISO date string
function gvpDateToISO(s) {
  const clean = s.replace(/\(.*?\)/, '').trim();
  const d = new Date(clean);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// Strip HTML tags
function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').trim();
}

function parseGVPHtml(html) {
  const results = [];
  // Match all <tr>...</tr> blocks
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowRe.exec(html)) !== null) {
    const row = rowMatch[1];
    if (!row.includes('Philippines')) continue;

    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = [];
    let cellMatch;
    while ((cellMatch = cellRe.exec(row)) !== null) {
      cells.push(stripTags(cellMatch[1]));
    }
    if (cells.length < 5) continue;

    const [name, , startDate, lastActivity, eruType] = cells;
    const meta = VOLCANO_META[name];
    if (!meta) continue;

    const alertLevel = eruTypeToAlertLevel(eruType);
    const lastISO = gvpDateToISO(lastActivity);
    const startISO = gvpDateToISO(startDate);

    results.push({
      id: `gvp-${name.toLowerCase()}`,
      name: `${meta.volcanoName} — Alert Level ${alertLevel}`,
      type: 'volcanic',
      signalNumber: 0,
      affectedRegionIds: meta.regionIds,
      affectedProvinces: meta.provinces,
      coordinates: { lat: meta.lat, lng: meta.lng },
      track: [],
      intensity: `${eruType} · eruption ongoing since ${startDate}`,
      lastUpdated: lastISO,
      source: 'live',
      volcanoName: meta.volcanoName,
      volcanoAlertLevel: alertLevel,
      dangerZoneKm: meta.dangerZoneKm,
    });
  }
  return results;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    const response = await fetch(GVP_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FoundationOps/1.0)' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `GVP returned ${response.status}` });
    }

    const html = await response.text();
    const volcanos = parseGVPHtml(html);

    if (volcanos.length === 0) {
      return res.status(404).json({ error: 'No Philippine volcanos found in GVP data' });
    }

    res.status(200).json({ volcanos, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
}
