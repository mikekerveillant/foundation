import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup, Line } from 'react-simple-maps';
import type { Warehouse, ActiveAlert, Region } from '../../types';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json';

const SIGNAL_COLOR: Record<number, string> = {
  0: '#6B8F71', 1: '#3E8FB0', 2: '#5EA8C8', 3: '#D4791A', 4: '#E8901C', 5: '#C84B31',
};
const VOLCANO_COLOR: Record<number, string> = {
  0: '#6B8F71', 1: '#3E8FB0', 2: '#5EA8C8', 3: '#D4791A', 4: '#E8901C', 5: '#C84B31',
};

function alertColor(alert: ActiveAlert): string {
  if (alert.type === 'typhoon' || alert.type === 'tropical_storm') return SIGNAL_COLOR[alert.signalNumber];
  if (alert.type === 'earthquake') {
    const mag = alert.magnitude ?? 0;
    if (mag >= 7) return '#C84B31';
    if (mag >= 6) return '#E8901C';
    return '#D4791A';
  }
  if (alert.type === 'volcanic') return VOLCANO_COLOR[alert.volcanoAlertLevel ?? 0];
  return '#E8901C';
}

function stockColor(qty: number, threshold: number) {
  const ratio = qty / (threshold * 4);
  if (ratio > 0.6) return '#6B8F71';
  if (ratio > 0.25) return '#E8901C';
  return '#C84B31';
}

interface Props {
  warehouses: Warehouse[];
  alerts: ActiveAlert[];
  selectedAlertIdx: number;
  regions: Region[];
  selectedWarehouseId: string | null;
  onWarehouseClick: (id: string) => void;
}

export default function PhilippinesMap({ warehouses, alerts, selectedAlertIdx, selectedWarehouseId, onWarehouseClick }: Props) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0E1419', position: 'relative', overflow: 'hidden' }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(35,43,54,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(35,43,54,0.5) 1px, transparent 1px)`,
        backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0,
      }} />

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 2200, center: [122, 12] }}
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
      >
        <ZoomableGroup center={[122, 12]} zoom={1} minZoom={0.8} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: import('react-simple-maps').Geography[] }) =>
              geographies
                .filter((geo) => {
                  const id = (geo.id as string) || (geo.properties?.['ADM0_A3'] as string);
                  return id === '608' || (geo.properties?.name as string) === 'Philippines';
                })
                .map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1E2B3A"
                    stroke="#2E3D4E"
                    strokeWidth={0.5}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: '#243242' }, pressed: { outline: 'none' } }}
                  />
                ))
            }
          </Geographies>

          {/* ── Typhoon track ───────────────────────────────────────────────── */}
          {alerts.map(alert => {
            if ((alert.type !== 'typhoon' && alert.type !== 'tropical_storm') || alert.track.length < 2) return null;
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

          {/* Typhoon track dots */}
          {alerts.map(alert => {
            if (alert.type !== 'typhoon' && alert.type !== 'tropical_storm') return null;
            const color = alertColor(alert);
            return alert.track.map((pt, i) => (
              <Marker key={`${alert.id}-dot-${i}`} coordinates={[pt.lng, pt.lat]}>
                <circle r={i === alert.track.length - 1 ? 5 : 2.5}
                  fill={i === alert.track.length - 1 ? color : `${color}60`}
                  stroke={i === alert.track.length - 1 ? '#11161D' : 'transparent'}
                  strokeWidth={1.5}
                />
              </Marker>
            ));
          })}

          {/* Typhoon eye markers */}
          {alerts.map((alert, idx) => {
            if (alert.type !== 'typhoon' && alert.type !== 'tropical_storm') return null;
            const color = alertColor(alert);
            const isSelected = idx === selectedAlertIdx;
            return (
              <Marker key={`${alert.id}-eye`} coordinates={[alert.coordinates.lng, alert.coordinates.lat]}>
                <circle r={isSelected ? 20 : 14} fill={`${color}08`} stroke={`${color}35`} strokeWidth={1} />
                <circle r={isSelected ? 12 : 8} fill={`${color}12`} stroke={`${color}50`} strokeWidth={1} />
                <circle r={isSelected ? 5 : 3.5} fill={color} stroke="#11161D" strokeWidth={1.5} />
                {isSelected && (
                  <text textAnchor="middle" y={-16}
                    style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fill: color, fontWeight: 500, letterSpacing: '0.04em' }}>
                    {alert.name.split(' ').slice(0, 2).join(' ').toUpperCase()}
                  </text>
                )}
              </Marker>
            );
          })}

          {/* ── Earthquake epicentre ───────────────────────────────────────── */}
          {alerts.map((alert, idx) => {
            if (alert.type !== 'earthquake') return null;
            const color = alertColor(alert);
            const isSelected = idx === selectedAlertIdx;
            return (
              <Marker key={`${alert.id}-eq`} coordinates={[alert.coordinates.lng, alert.coordinates.lat]}>
                {/* Seismic rings */}
                <circle r={isSelected ? 28 : 20} fill="none" stroke={`${color}20`} strokeWidth={1} />
                <circle r={isSelected ? 18 : 13} fill="none" stroke={`${color}35`} strokeWidth={1} />
                <circle r={isSelected ? 10 : 7}  fill="none" stroke={`${color}55`} strokeWidth={1} />
                {/* Epicentre cross */}
                <line x1={0} y1={-(isSelected ? 7 : 5)} x2={0} y2={(isSelected ? 7 : 5)} stroke={color} strokeWidth={isSelected ? 2 : 1.5} />
                <line x1={-(isSelected ? 7 : 5)} y1={0} x2={(isSelected ? 7 : 5)} y2={0} stroke={color} strokeWidth={isSelected ? 2 : 1.5} />
                <circle r={isSelected ? 3 : 2} fill={color} />
                {isSelected && (
                  <text textAnchor="middle" y={-16}
                    style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fill: color, fontWeight: 500, letterSpacing: '0.04em' }}>
                    M{alert.magnitude?.toFixed(1)} · {alert.depth} KM
                  </text>
                )}
              </Marker>
            );
          })}

          {/* ── Volcano marker ─────────────────────────────────────────────── */}
          {alerts.map((alert, idx) => {
            if (alert.type !== 'volcanic') return null;
            const color = alertColor(alert);
            const isSelected = idx === selectedAlertIdx;
            const r = isSelected ? 26 : 18;
            return (
              <Marker key={`${alert.id}-vol`} coordinates={[alert.coordinates.lng, alert.coordinates.lat]}>
                {/* Danger zone circle */}
                <circle r={r} fill={`${color}10`} stroke={`${color}30`} strokeWidth={1} strokeDasharray="3 2" />
                {/* Mountain triangle */}
                <polygon
                  points={`0,${-(isSelected ? 14 : 10)} ${isSelected ? -10 : -7},${isSelected ? 7 : 5} ${isSelected ? 10 : 7},${isSelected ? 7 : 5}`}
                  fill={`${color}25`}
                  stroke={color}
                  strokeWidth={isSelected ? 1.5 : 1}
                  strokeLinejoin="round"
                />
                {/* Eruption plume dots */}
                {isSelected && [[-3, -17], [0, -20], [3, -17]].map(([ox, oy], i) => (
                  <circle key={i} cx={ox} cy={oy} r={2} fill={color} opacity={0.7} />
                ))}
                <circle r={isSelected ? 3 : 2} fill={color} />
                {isSelected && (
                  <text textAnchor="middle" y={isSelected ? 20 : 16}
                    style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fill: color, fontWeight: 500, letterSpacing: '0.04em' }}>
                    {alert.volcanoName?.split(' ')[0].toUpperCase()} L{alert.volcanoAlertLevel}
                  </text>
                )}
              </Marker>
            );
          })}

          {/* ── Warehouse markers ──────────────────────────────────────────── */}
          {warehouses.map((wh) => {
            const isSelected = selectedWarehouseId === wh.id;
            const waterColor = stockColor(wh.inventory.water.qty, wh.inventory.water.threshold);
            return (
              <Marker key={wh.id} coordinates={[wh.location.lng, wh.location.lat]} onClick={() => onWarehouseClick(wh.id)}>
                <g style={{ cursor: 'pointer' }}>
                  {isSelected && <circle r={12} fill="none" stroke="#E8901C" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.8} />}
                  <rect x={-8} y={-8} width={16} height={16} rx={2}
                    fill={isSelected ? '#1E2732' : '#161C24'}
                    stroke={isSelected ? '#E8901C' : waterColor}
                    strokeWidth={isSelected ? 1.5 : 1}
                  />
                  <rect x={-4} y={-4} width={8} height={8} rx={1} fill={waterColor} opacity={0.8} />
                  <text textAnchor="middle" y={20}
                    style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fill: isSelected ? '#EDEEF0' : '#8A9BB0', fontWeight: 600, letterSpacing: '0.04em', pointerEvents: 'none' }}>
                    {wh.name.split(' ')[0].toUpperCase()}
                  </text>
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        background: 'rgba(22,28,36,0.92)', border: '1px solid #232B36', borderRadius: 6,
        padding: '8px 12px', zIndex: 10, backdropFilter: 'blur(4px)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 7 }}>LEGEND</div>
        {[
          { shape: 'circle', color: '#E8901C', label: 'Typhoon / TC' },
          { shape: 'cross', color: '#C84B31', label: 'Earthquake epicentre' },
          { shape: 'triangle', color: '#D4791A', label: 'Volcanic activity' },
          { shape: 'square', color: '#6B8F71', label: 'Warehouse (well stocked)' },
          { shape: 'square', color: '#E8901C', label: 'Warehouse (monitor stock)' },
        ].map(({ shape, color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <svg width={12} height={12} style={{ flexShrink: 0 }}>
              {shape === 'circle' && <circle cx={6} cy={6} r={4} fill={color} opacity={0.8} />}
              {shape === 'cross' && <><line x1={6} y1={1} x2={6} y2={11} stroke={color} strokeWidth={2} /><line x1={1} y1={6} x2={11} y2={6} stroke={color} strokeWidth={2} /></>}
              {shape === 'triangle' && <polygon points="6,1 11,11 1,11" fill={`${color}30`} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />}
              {shape === 'square' && <rect x={2} y={2} width={8} height={8} rx={1} fill={color} opacity={0.8} />}
            </svg>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Active alert count badge */}
      {alerts.length > 1 && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(22,28,36,0.92)', border: '1px solid var(--amber-border)',
          borderRadius: 4, padding: '4px 10px', zIndex: 10,
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)',
          letterSpacing: '0.06em',
        }}>
          {alerts.length} ACTIVE EVENTS
        </div>
      )}
    </div>
  );
}
