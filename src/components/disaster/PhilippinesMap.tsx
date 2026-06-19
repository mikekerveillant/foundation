import { format, parseISO } from 'date-fns';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup, Line } from 'react-simple-maps';
import type { Warehouse, ActiveAlert, Region } from '../../types';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json';

// ── constants ─────────────────────────────────────────────────────────────────

const SIGNAL_COLOR: Record<number, string> = {
  0: '#6B8F71', 1: '#3E8FB0', 2: '#5EA8C8', 3: '#D4791A', 4: '#E8901C', 5: '#C84B31',
};

// Approximate centroid [lng, lat] + visual radius + hazard labels per disaster type
const REGION_DATA: Record<string, {
  center: [number, number];
  r: number;
  hazards: Partial<Record<'typhoon' | 'earthquake' | 'volcanic', string>>;
}> = {
  NCR:  { center: [121.007, 14.575], r: 18, hazards: { typhoon: 'FLOODING', earthquake: 'LIQUEFACTION', volcanic: 'ASH FALL' } },
  CAR:  { center: [121.000, 17.200], r: 28, hazards: { typhoon: 'LANDSLIDE', earthquake: 'GROUND SHAKING', volcanic: 'ASH FALL' } },
  I:    { center: [120.390, 16.100], r: 30, hazards: { typhoon: 'FLOODING', earthquake: 'GROUND SHAKING' } },
  II:   { center: [121.900, 17.200], r: 38, hazards: { typhoon: 'FLOODING · LANDSLIDE', earthquake: 'GROUND SHAKING' } },
  III:  { center: [120.800, 15.300], r: 32, hazards: { typhoon: 'FLOODING · STORM SURGE', earthquake: 'GROUND SHAKING' } },
  IVA:  { center: [121.200, 14.050], r: 28, hazards: { typhoon: 'FLOODING', earthquake: 'GROUND SHAKING' } },
  IVB:  { center: [122.000, 12.500], r: 32, hazards: { typhoon: 'FLOODING', earthquake: 'GROUND SHAKING' } },
  V:    { center: [123.500, 13.400], r: 38, hazards: { typhoon: 'STORM SURGE', earthquake: 'GROUND SHAKING', volcanic: 'DANGER ZONE · ASH FALL' } },
  VI:   { center: [122.650, 11.050], r: 34, hazards: { typhoon: 'STORM SURGE · FLOODING', earthquake: 'GROUND SHAKING' } },
  VII:  { center: [123.950, 10.250], r: 28, hazards: { typhoon: 'FLOODING', earthquake: 'GROUND SHAKING' } },
  VIII: { center: [125.000, 11.500], r: 38, hazards: { typhoon: 'STORM SURGE', earthquake: 'INTENSE SHAKING', volcanic: 'ASH FALL' } },
  IX:   { center: [123.200, 7.900],  r: 30, hazards: { typhoon: 'FLOODING', earthquake: 'GROUND SHAKING' } },
  X:    { center: [124.850, 8.500],  r: 32, hazards: { typhoon: 'FLOODING', earthquake: 'GROUND SHAKING' } },
  XI:   { center: [125.700, 7.200],  r: 30, hazards: { typhoon: 'FLOODING', earthquake: 'GROUND SHAKING' } },
  XII:  { center: [124.500, 6.400],  r: 32, hazards: { typhoon: 'FLOODING', earthquake: 'GROUND SHAKING' } },
  XIII: { center: [125.700, 9.000],  r: 32, hazards: { typhoon: 'FLOODING', earthquake: 'GROUND SHAKING · TSUNAMI', volcanic: 'ASH FALL' } },
  BARMM:{ center: [124.200, 7.200], r: 35, hazards: { typhoon: 'FLOODING', earthquake: 'GROUND SHAKING' } },
};

function signalToRiskColor(signal: number): string {
  return SIGNAL_COLOR[signal] ?? '#E8901C';
}
function signalToFillOpacity(signal: number): number {
  return [0, 0.10, 0.14, 0.18, 0.23, 0.30][signal] ?? 0.18;
}
function signalToStrokeOpacity(signal: number): number {
  return [0, 0.25, 0.35, 0.45, 0.55, 0.70][signal] ?? 0.40;
}

function alertColor(alert: ActiveAlert): string {
  if (alert.type === 'typhoon' || alert.type === 'tropical_storm' || alert.type === 'tropical_depression') return SIGNAL_COLOR[alert.signalNumber];
  if (alert.type === 'earthquake') {
    const m = alert.magnitude ?? 0;
    return m >= 7 ? '#C84B31' : m >= 6 ? '#E8901C' : '#D4791A';
  }
  if (alert.type === 'volcanic') return SIGNAL_COLOR[alert.volcanoAlertLevel ?? 0];
  return '#E8901C';
}

function stockColor(qty: number, threshold: number) {
  const r = qty / (threshold * 4);
  return r > 0.6 ? '#6B8F71' : r > 0.25 ? '#E8901C' : '#C84B31';
}

// Derive a 0-5 "signal equivalent" from any alert type for unified risk zone sizing
function alertRegionSignal(alert: ActiveAlert, regionId: string, regions: Region[]): number {
  if (alert.type === 'typhoon' || alert.type === 'tropical_storm' || alert.type === 'tropical_depression') {
    return regions.find(r => r.id === regionId)?.signal ?? alert.signalNumber;
  }
  if (alert.type === 'earthquake') {
    const m = alert.magnitude ?? 0;
    return m >= 7 ? 4 : m >= 6 ? 3 : 2;
  }
  if (alert.type === 'volcanic') {
    const lv = alert.volcanoAlertLevel ?? 0;
    return lv;
  }
  return 2;
}

// ── component ─────────────────────────────────────────────────────────────────

interface Props {
  warehouses: Warehouse[];
  alerts: ActiveAlert[];
  selectedAlertIdx: number;
  regions: Region[];
  selectedWarehouseId: string | null;
  onWarehouseClick: (id: string) => void;
}

export default function PhilippinesMap({ warehouses, alerts, selectedAlertIdx, regions, selectedWarehouseId, onWarehouseClick }: Props) {
  const selectedAlert = alerts[selectedAlertIdx];
  const aColor = alertColor(selectedAlert);

  // Determine hazard key for label lookup
  const hazardKey: 'typhoon' | 'earthquake' | 'volcanic' | null =
    selectedAlert.type === 'typhoon' || selectedAlert.type === 'tropical_storm' || selectedAlert.type === 'tropical_depression' ? 'typhoon'
    : selectedAlert.type === 'earthquake' ? 'earthquake'
    : selectedAlert.type === 'volcanic' ? 'volcanic'
    : null;

  return (
    <div style={{ width: '100%', height: '100%', background: '#0E1419', position: 'relative', overflow: 'hidden' }}>
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(rgba(35,43,54,0.45) 1px,transparent 1px),linear-gradient(90deg,rgba(35,43,54,0.45) 1px,transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      {/* Pulse animation for high-risk halos */}
      <style>{`
        @keyframes riskPulse {
          0%   { opacity: 1; transform: scale(1); }
          60%  { opacity: 0; transform: scale(1.18); }
          100% { opacity: 0; transform: scale(1.18); }
        }
        @media (prefers-reduced-motion: reduce) {
          .risk-pulse-ring { animation: none !important; }
        }
      `}</style>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 2200, center: [122, 12] }}
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
      >
        <ZoomableGroup center={[122, 12]} zoom={1} minZoom={0.8} maxZoom={4}>

          {/* ── Base map ──────────────────────────────────────────────────── */}
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: import('react-simple-maps').Geography[] }) =>
              geographies
                .filter(geo => {
                  const id = (geo.id as string) || (geo.properties?.['ADM0_A3'] as string);
                  return id === '608' || (geo.properties?.name as string) === 'Philippines';
                })
                .map(geo => (
                  <Geography key={geo.rsmKey} geography={geo}
                    fill="#1E2B3A" stroke="#2E3D4E" strokeWidth={0.5}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: '#243242' }, pressed: { outline: 'none' } }}
                  />
                ))
            }
          </Geographies>

          {/* ── Risk zone halos (render UNDER event markers) ─────────────── */}
          {hazardKey && selectedAlert.affectedRegionIds.map(rid => {
            const rd = REGION_DATA[rid];
            if (!rd) return null;
            const sig = alertRegionSignal(selectedAlert, rid, regions);
            if (sig === 0) return null;
            const color = signalToRiskColor(sig);
            const fillOp = signalToFillOpacity(sig);
            const strokeOp = signalToStrokeOpacity(sig);
            const radius = rd.r * (0.85 + sig * 0.06);
            const label = rd.hazards[hazardKey] ?? '';
            const isPulsing = sig >= 3;

            return (
              <Marker key={`halo-${rid}`} coordinates={rd.center}>
                {/* Pulse ring for high-risk */}
                {isPulsing && (
                  <circle
                    className="risk-pulse-ring"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    style={{
                      opacity: 0.6,
                      animation: 'riskPulse 2.8s ease-out infinite',
                      transformOrigin: '0 0',
                    }}
                  />
                )}
                {/* Filled halo */}
                <circle
                  r={radius}
                  fill={color}
                  fillOpacity={fillOp}
                  stroke={color}
                  strokeOpacity={strokeOp}
                  strokeWidth={0.8}
                  strokeDasharray={sig <= 2 ? '4 3' : undefined}
                />
                {/* Hazard label */}
                {label && (
                  <>
                    <text
                      textAnchor="middle"
                      y={-4}
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 6.5,
                        fill: color,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        opacity: 0.95,
                        pointerEvents: 'none',
                      }}
                    >
                      {label.split(' · ')[0]}
                    </text>
                    {label.includes(' · ') && (
                      <text
                        textAnchor="middle"
                        y={5}
                        style={{
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: 6.5,
                          fill: color,
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          opacity: 0.95,
                          pointerEvents: 'none',
                        }}
                      >
                        {label.split(' · ')[1]}
                      </text>
                    )}
                  </>
                )}
              </Marker>
            );
          })}

          {/* ── Earthquake intensity rings (separate from region halos) ───── */}
          {selectedAlert.type === 'earthquake' && (() => {
            const color = alertColor(selectedAlert);
            const { coordinates } = selectedAlert;
            return (
              <Marker coordinates={[coordinates.lng, coordinates.lat]}>
                {/* Zone III  — Intensity V  ~150 km radius */}
                <circle r={55} fill={`${color}06`} stroke={`${color}20`} strokeWidth={0.8} strokeDasharray="5 3" />
                {/* Zone II   — Intensity VI ~100 km radius */}
                <circle r={36} fill={`${color}10`} stroke={`${color}30`} strokeWidth={0.8} strokeDasharray="3 2" />
                {/* Zone I    — Intensity VII ~50 km radius */}
                <circle r={18} fill={`${color}18`} stroke={`${color}50`} strokeWidth={1} />
              </Marker>
            );
          })()}

          {/* ── Volcanic extended ash-fall zones (all active volcanoes) ─────── */}
          {alerts.map((alert, idx) => {
            if (alert.type !== 'volcanic') return null;
            const isSel = idx === selectedAlertIdx;
            const color = alertColor(alert);
            const { coordinates, dangerZoneKm } = alert;
            const dzR = (dangerZoneKm ?? 6) * 0.5;
            const op = isSel ? 1 : 0.45;
            return (
              <Marker key={`${alert.id}-zones`} coordinates={[coordinates.lng, coordinates.lat]}>
                {/* Extended ash-fall zone */}
                <circle r={dzR * 5}   fill={`${color}07`} stroke={`${color}18`} strokeWidth={0.8} strokeDasharray="5 3" opacity={op} />
                {/* Caution zone */}
                <circle r={dzR * 2.3} fill={`${color}12`} stroke={`${color}28`} strokeWidth={0.8} opacity={op} />
                {/* PDZ permanent danger zone */}
                <circle r={dzR}       fill={`${color}22`} stroke={`${color}60`} strokeWidth={1}   strokeDasharray="2 1" opacity={op} />
              </Marker>
            );
          })}

          {/* ── Typhoon track lines ────────────────────────────────────────── */}
          {alerts.map(alert => {
            if ((alert.type !== 'typhoon' && alert.type !== 'tropical_storm' && alert.type !== 'tropical_depression') || alert.track.length < 2) return null;
            const isSelected = alerts.indexOf(alert) === selectedAlertIdx;
            const color = alertColor(alert);
            return alert.track.slice(0, -1).map((pt, i) => {
              const next = alert.track[i + 1];
              const isPast = i < alert.track.length - 2;
              return (
                <Line key={`${alert.id}-track-${i}`}
                  from={[pt.lng, pt.lat]} to={[next.lng, next.lat]}
                  stroke={isPast ? `${color}40` : color}
                  strokeWidth={isPast ? 1.5 : (isSelected ? 2.5 : 1.5)}
                  strokeDasharray={isPast ? '0' : '4 3'}
                  strokeLinecap="round"
                />
              );
            });
          })}

          {/* Typhoon track dots + labels */}
          {alerts.map(alert => {
            if (alert.type !== 'typhoon' && alert.type !== 'tropical_storm' && alert.type !== 'tropical_depression') return null;
            const isSelected = alerts.indexOf(alert) === selectedAlertIdx;
            const color = alertColor(alert);
            return alert.track.map((pt, i) => {
              const isLast = i === alert.track.length - 1;
              const dt = parseISO(pt.time);
              const dateLabel = format(dt, 'MMM d');
              const timeLabel = format(dt, 'HH:mm') + 'Z';
              const windLabel = pt.windKt ? `${pt.windKt}kt · ${Math.round(pt.windKt * 1.852)}km/h` : pt.intensity;
              return (
                <Marker key={`${alert.id}-dot-${i}`} coordinates={[pt.lng, pt.lat]}>
                  {isSelected && (
                    <>
                      <rect x={-22} y={-22} width={44} height={10} rx={2} fill="rgba(14,20,25,0.82)" />
                      <text textAnchor="middle" y={-14}
                        style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 6.5, fill: color, fontWeight: 700, letterSpacing: '0.04em', pointerEvents: 'none' }}>
                        {windLabel}
                      </text>
                    </>
                  )}
                  <circle r={isLast ? 5 : 3}
                    fill={isLast ? color : `${color}70`}
                    stroke={isLast ? '#11161D' : `${color}40`}
                    strokeWidth={isLast ? 1.5 : 1}
                  />
                  {isSelected && (
                    <>
                      <rect x={-18} y={8} width={36} height={16} rx={2} fill="rgba(14,20,25,0.82)" />
                      <text textAnchor="middle" y={16}
                        style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 6.5, fill: 'var(--text-secondary)', letterSpacing: '0.04em', pointerEvents: 'none' }}>
                        {dateLabel}
                      </text>
                      <text textAnchor="middle" y={23}
                        style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 6, fill: 'var(--text-muted)', letterSpacing: '0.04em', pointerEvents: 'none' }}>
                        {timeLabel}
                      </text>
                    </>
                  )}
                </Marker>
              );
            });
          })}

          {/* Typhoon eye */}
          {alerts.map((alert, idx) => {
            if (alert.type !== 'typhoon' && alert.type !== 'tropical_storm' && alert.type !== 'tropical_depression') return null;
            const color = alertColor(alert);
            const isSel = idx === selectedAlertIdx;
            return (
              <Marker key={`${alert.id}-eye`} coordinates={[alert.coordinates.lng, alert.coordinates.lat]}>
                <circle r={isSel ? 20 : 14} fill={`${color}08`} stroke={`${color}35`} strokeWidth={1} />
                <circle r={isSel ? 12 : 8}  fill={`${color}12`} stroke={`${color}50`} strokeWidth={1} />
                <circle r={isSel ? 5 : 3.5} fill={color} stroke="#11161D" strokeWidth={1.5} />
                {isSel && (
                  <text textAnchor="middle" y={-16}
                    style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fill: color, fontWeight: 500, letterSpacing: '0.04em' }}>
                    {alert.name.split(' ').slice(0, 2).join(' ').toUpperCase()}
                  </text>
                )}
              </Marker>
            );
          })}

          {/* Earthquake epicentre */}
          {alerts.map((alert, idx) => {
            if (alert.type !== 'earthquake') return null;
            const color = alertColor(alert);
            const isSel = idx === selectedAlertIdx;
            return (
              <Marker key={`${alert.id}-eq`} coordinates={[alert.coordinates.lng, alert.coordinates.lat]}>
                <circle r={isSel ? 28 : 20} fill="none" stroke={`${color}20`} strokeWidth={1} />
                <circle r={isSel ? 18 : 13} fill="none" stroke={`${color}35`} strokeWidth={1} />
                <circle r={isSel ? 10 : 7}  fill="none" stroke={`${color}55`} strokeWidth={1} />
                <line x1={0} y1={-(isSel ? 7 : 5)} x2={0} y2={isSel ? 7 : 5} stroke={color} strokeWidth={isSel ? 2 : 1.5} />
                <line x1={-(isSel ? 7 : 5)} y1={0} x2={isSel ? 7 : 5} y2={0} stroke={color} strokeWidth={isSel ? 2 : 1.5} />
                <circle r={isSel ? 3 : 2} fill={color} />
                {isSel && (
                  <text textAnchor="middle" y={-20}
                    style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fill: color, fontWeight: 500, letterSpacing: '0.04em' }}>
                    M{alert.magnitude?.toFixed(1)} · {alert.depth} KM DEPTH
                  </text>
                )}
              </Marker>
            );
          })}

          {/* Volcano marker */}
          {alerts.map((alert, idx) => {
            if (alert.type !== 'volcanic') return null;
            const color = alertColor(alert);
            const isSel = idx === selectedAlertIdx;
            const sz = isSel ? 1 : 0.7;
            return (
              <Marker key={`${alert.id}-vol`} coordinates={[alert.coordinates.lng, alert.coordinates.lat]}>
                <polygon
                  points={`0,${-14 * sz} ${-10 * sz},${7 * sz} ${10 * sz},${7 * sz}`}
                  fill={`${color}30`} stroke={color}
                  strokeWidth={isSel ? 1.5 : 1} strokeLinejoin="round"
                />
                {isSel && [[-3, -18], [0, -21], [3, -18]].map(([ox, oy], i) => (
                  <circle key={i} cx={ox} cy={oy} r={2} fill={color} opacity={0.8} />
                ))}
                <circle r={isSel ? 3 : 2} fill={color} />
                {isSel && (
                  <text textAnchor="middle" y={18}
                    style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fill: color, fontWeight: 500, letterSpacing: '0.04em' }}>
                    {alert.volcanoName?.split(' ')[0].toUpperCase()} L{alert.volcanoAlertLevel}
                  </text>
                )}
              </Marker>
            );
          })}

          {/* Warehouse markers */}
          {warehouses.map(wh => {
            const isSel = selectedWarehouseId === wh.id;
            const wColor = stockColor(wh.inventory.water.qty, wh.inventory.water.threshold);
            return (
              <Marker key={wh.id} coordinates={[wh.location.lng, wh.location.lat]} onClick={() => onWarehouseClick(wh.id)}>
                <g style={{ cursor: 'pointer' }}>
                  {isSel && <circle r={12} fill="none" stroke="#E8901C" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.8} />}
                  <rect x={-8} y={-8} width={16} height={16} rx={2}
                    fill={isSel ? '#1E2732' : '#161C24'}
                    stroke={isSel ? '#E8901C' : wColor}
                    strokeWidth={isSel ? 1.5 : 1}
                  />
                  <rect x={-4} y={-4} width={8} height={8} rx={1} fill={wColor} opacity={0.8} />
                  <text textAnchor="middle" y={20}
                    style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fill: isSel ? '#EDEEF0' : '#8A9BB0', fontWeight: 600, letterSpacing: '0.04em', pointerEvents: 'none' }}>
                    {wh.name.split(' ')[0].toUpperCase()}
                  </text>
                </g>
              </Marker>
            );
          })}

        </ZoomableGroup>
      </ComposableMap>

      {/* ── Legend ──────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        background: 'rgba(22,28,36,0.92)', border: '1px solid #232B36', borderRadius: 6,
        padding: '8px 12px', zIndex: 10, backdropFilter: 'blur(4px)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 7 }}>LEGEND</div>
        {[
          { shape: 'circle-fill', color: aColor, label: `Risk zone (${hazardKey ?? 'hazard'})`, opacity: 0.4 },
          { shape: 'circle', color: '#E8901C', label: 'Typhoon / TC' },
          { shape: 'cross', color: '#C84B31', label: 'Earthquake epicentre' },
          { shape: 'triangle', color: '#D4791A', label: 'Volcanic activity' },
          { shape: 'square', color: '#6B8F71', label: 'Warehouse — good stock' },
          { shape: 'square', color: '#E8901C', label: 'Warehouse — monitor' },
        ].map(({ shape, color, label, opacity }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <svg width={12} height={12} style={{ flexShrink: 0 }}>
              {shape === 'circle-fill' && <circle cx={6} cy={6} r={5} fill={color} fillOpacity={opacity ?? 0.8} stroke={color} strokeOpacity={0.7} strokeWidth={1} />}
              {shape === 'circle' && <circle cx={6} cy={6} r={4} fill={color} opacity={0.8} />}
              {shape === 'cross' && <><line x1={6} y1={1} x2={6} y2={11} stroke={color} strokeWidth={2} /><line x1={1} y1={6} x2={11} y2={6} stroke={color} strokeWidth={2} /></>}
              {shape === 'triangle' && <polygon points="6,1 11,11 1,11" fill={`${color}30`} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />}
              {shape === 'square' && <rect x={2} y={2} width={8} height={8} rx={1} fill={color} opacity={0.8} />}
            </svg>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Active event count */}
      {alerts.length > 1 && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(22,28,36,0.92)', border: '1px solid var(--amber-border)',
          borderRadius: 4, padding: '4px 10px', zIndex: 10,
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.06em',
        }}>
          {alerts.length} ACTIVE EVENTS
        </div>
      )}
    </div>
  );
}
