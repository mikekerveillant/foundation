import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup, Line } from 'react-simple-maps';
import type { Warehouse, ActiveAlert, Region } from '../../types';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json';

const SIGNAL_COLOR: Record<number, string> = {
  0: '#6B8F71',
  1: '#3E8FB0',
  2: '#5EA8C8',
  3: '#D4791A',
  4: '#E8901C',
  5: '#C84B31',
};

interface Props {
  warehouses: Warehouse[];
  alert: ActiveAlert | null;
  regions: Region[];
  selectedWarehouseId: string | null;
  onWarehouseClick: (id: string) => void;
}

export default function PhilippinesMap({ warehouses, alert, selectedWarehouseId, onWarehouseClick }: Props) {
  const alertColor = alert ? SIGNAL_COLOR[alert.signalNumber] : '#6B8F71';

  return (
    <div style={{ width: '100%', height: '100%', background: '#0E1419', position: 'relative', overflow: 'hidden' }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(35,43,54,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(35,43,54,0.5) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 0,
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

          {/* Typhoon track line */}
          {alert && alert.track.length >= 2 && (
            <>
              {alert.track.slice(0, -1).map((pt, i) => {
                const next = alert.track[i + 1];
                const isPast = i < alert.track.length - 2;
                return (
                  <Line
                    key={i}
                    from={[pt.lng, pt.lat]}
                    to={[next.lng, next.lat]}
                    stroke={isPast ? 'rgba(232,144,28,0.35)' : alertColor}
                    strokeWidth={isPast ? 1.5 : 2.5}
                    strokeDasharray={isPast ? '0' : '4 3'}
                    strokeLinecap="round"
                  />
                );
              })}
              {/* Track dots */}
              {alert.track.map((pt, i) => (
                <Marker key={`track-${i}`} coordinates={[pt.lng, pt.lat]}>
                  <circle
                    r={i === alert.track.length - 1 ? 5 : 3}
                    fill={i === alert.track.length - 1 ? alertColor : 'rgba(232,144,28,0.4)'}
                    stroke={i === alert.track.length - 1 ? '#11161D' : 'transparent'}
                    strokeWidth={1.5}
                  />
                </Marker>
              ))}
            </>
          )}

          {/* Storm eye / current position */}
          {alert && (
            <Marker coordinates={[alert.coordinates.lng, alert.coordinates.lat]}>
              <circle r={18} fill={`${alertColor}10`} stroke={`${alertColor}40`} strokeWidth={1} />
              <circle r={11} fill={`${alertColor}18`} stroke={`${alertColor}60`} strokeWidth={1} />
              <circle r={5} fill={alertColor} stroke="#11161D" strokeWidth={1.5} />
              <text
                textAnchor="middle"
                y={-14}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  fill: alertColor,
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                }}
              >
                {alert.name.split(' ').slice(0, 2).join(' ').toUpperCase()}
              </text>
            </Marker>
          )}

          {/* Warehouse markers */}
          {warehouses.map((wh) => {
            const isSelected = selectedWarehouseId === wh.id;
            const waterPct = wh.inventory.water.qty / (wh.inventory.water.threshold * 4);
            const stockColor = waterPct > 0.6 ? '#6B8F71' : waterPct > 0.3 ? '#E8901C' : '#C84B31';

            return (
              <Marker
                key={wh.id}
                coordinates={[wh.location.lng, wh.location.lat]}
                onClick={() => onWarehouseClick(wh.id)}
              >
                <g style={{ cursor: 'pointer' }}>
                  {isSelected && (
                    <circle r={12} fill="none" stroke="#E8901C" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.8} />
                  )}
                  <rect
                    x={-8} y={-8}
                    width={16} height={16}
                    rx={2}
                    fill={isSelected ? '#1E2732' : '#161C24'}
                    stroke={isSelected ? '#E8901C' : stockColor}
                    strokeWidth={isSelected ? 1.5 : 1}
                  />
                  <rect
                    x={-4} y={-4}
                    width={8} height={8}
                    rx={1}
                    fill={stockColor}
                    opacity={0.8}
                  />
                  <text
                    textAnchor="middle"
                    y={20}
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 9,
                      fill: isSelected ? '#EDEEF0' : '#8A9BB0',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                    }}
                  >
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
        position: 'absolute',
        bottom: 12,
        left: 12,
        background: 'rgba(22,28,36,0.92)',
        border: '1px solid #232B36',
        borderRadius: 6,
        padding: '10px 14px',
        zIndex: 10,
        backdropFilter: 'blur(4px)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>LEGEND</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            { color: '#6B8F71', label: 'Well stocked' },
            { color: '#E8901C', label: 'Monitor stock' },
            { color: '#C84B31', label: 'Low stock' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 8, height: 8, background: color, borderRadius: 1, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
          <div style={{ marginTop: 4, paddingTop: 6, borderTop: '1px solid #232B36', display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 20, height: 2, background: '#E8901C', opacity: 0.6 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>Typhoon track</span>
          </div>
        </div>
      </div>
    </div>
  );
}
