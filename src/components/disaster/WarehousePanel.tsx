import { Package, Droplets, Utensils, Heart, Home, Anchor, ChevronRight, Send } from 'lucide-react';
import type { Warehouse, ActiveAlert, OpsLogEntry, DeploymentState } from '../../types';

const CATEGORY_ICONS = {
  water: Droplets,
  food: Utensils,
  medical: Heart,
  shelter: Home,
  rescue: Anchor,
};

const CATEGORY_LABELS: Record<string, string> = {
  water: 'Water',
  food: 'Food Packs',
  medical: 'Medical Kits',
  shelter: 'Shelter Kits',
  rescue: 'Rescue Units',
};

function stockColor(qty: number, threshold: number) {
  const ratio = qty / (threshold * 4);
  if (ratio > 0.6) return 'var(--sage)';
  if (ratio > 0.25) return 'var(--amber)';
  return 'var(--red)';
}

function fmt(n: number) {
  return n.toLocaleString('en-PH');
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function transitEstimate(wh: Warehouse, targetLat: number, targetLng: number): string {
  const km = haversineKm(wh.location, { lat: targetLat, lng: targetLng });
  if (wh.islandGroup !== 'Luzon' && targetLat > 15) return `${Math.round(km)} km · ferry+road ~${Math.round(km / 35 + 12)}h`;
  if (km > 300) return `${Math.round(km)} km · air+road ~${Math.round(km / 80 + 3)}h`;
  return `${Math.round(km)} km · road ~${Math.round(km / 50)}h`;
}

interface Props {
  warehouses: Warehouse[];
  alert: ActiveAlert | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  deployments: DeploymentState[];
  onDeploy: (warehouseId: string, targetRegion: string) => void;
  onAddLog: (entry: OpsLogEntry) => void;
}

export default function WarehousePanel({ warehouses, alert, selectedId, onSelect, deployments, onDeploy }: Props) {
  const relevant = alert
    ? [...warehouses].sort((a, b) => {
        const da = haversineKm(a.location, alert.coordinates);
        const db = haversineKm(b.location, alert.coordinates);
        return da - db;
      })
    : warehouses;

  const selected = warehouses.find(w => w.id === selectedId) ?? relevant[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{
        padding: '12px 16px 10px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div className="section-header">Warehouses</div>
        {alert && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            sorted by proximity to {alert.name.split(' ').slice(0, 2).join(' ')}
          </div>
        )}
      </div>

      {/* Warehouse list — scrollable, max 3 items visible */}
      <div style={{ flexShrink: 0, borderBottom: '1px solid var(--border)', overflowY: 'auto', maxHeight: 174 }}>
        {relevant.map((wh, idx) => {
          const isSelected = wh.id === (selected?.id);
          const dist = alert ? haversineKm(wh.location, alert.coordinates) : 0;
          const isDeploying = deployments.some(d => d.warehouseId === wh.id && d.status === 'deploying');

          return (
            <button
              key={wh.id}
              onClick={() => onSelect(wh.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '7px 14px',
                background: isSelected ? 'var(--bg-elevated)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Package size={12} color={isSelected ? 'var(--amber)' : 'var(--text-muted)'} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  letterSpacing: '0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {wh.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>
                  {wh.province}{alert ? ` · ${Math.round(dist)} km` : ` · ${wh.islandGroup}`}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                {isDeploying && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    color: 'var(--amber)',
                    background: 'var(--amber-dim)',
                    padding: '1px 5px',
                    borderRadius: 3,
                    border: '1px solid var(--amber-border)',
                    letterSpacing: '0.04em',
                  }}>
                    DEPLOYING
                  </span>
                )}
                {idx === 0 && alert && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--sage)' }}>★</span>
                )}
                <ChevronRight size={11} color={isSelected ? 'var(--amber)' : 'var(--text-muted)'} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected warehouse detail — scrollable, takes remaining space */}
      {selected && (
        <div className="scroll-y" style={{ flex: 1, minHeight: 0, padding: '10px 14px' }}>
          {/* Name + transit */}
          <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '0.01em',
              lineHeight: 1.2,
            }}>
              {selected.name}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.04em', marginTop: 2 }}>
              {selected.location.lat.toFixed(3)}°N {selected.location.lng.toFixed(3)}°E · {selected.province}
            </div>
            {alert && (
              <div style={{
                marginTop: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--blue)',
                background: 'var(--blue-dim)',
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid var(--blue-border)',
              }}>
                {transitEstimate(selected, alert.coordinates.lat, alert.coordinates.lng)}
              </div>
            )}
          </div>

          {/* Inventory rows — compact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
            {(Object.entries(selected.inventory) as [keyof typeof CATEGORY_ICONS, { qty: number; unit: string; threshold: number }][]).map(([cat, val]) => {
              const Icon = CATEGORY_ICONS[cat];
              const color = stockColor(val.qty, val.threshold);
              const pct = Math.min(1, val.qty / (val.threshold * 4));

              return (
                <div key={cat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <Icon size={10} color={color} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', flex: 1 }}>
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color, whiteSpace: 'nowrap' }}>
                      {fmt(val.qty)} <span style={{ color: 'var(--text-muted)' }}>{val.unit}</span>
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct * 100}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deploy action */}
          {alert && (
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => onDeploy(selected.id, alert.affectedRegionIds[0] || 'V')}
              disabled={deployments.some(d => d.warehouseId === selected.id && d.status === 'deploying')}
            >
              <Send size={12} strokeWidth={1.5} />
              {deployments.some(d => d.warehouseId === selected.id) ? 'Deploying…' : `Deploy → ${alert.affectedProvinces[0] || 'Affected Area'}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
