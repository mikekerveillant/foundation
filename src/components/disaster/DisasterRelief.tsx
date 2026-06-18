import { useState } from 'react';
import { Wifi, WifiOff, AlertOctagon } from 'lucide-react';
import PhilippinesMap from './PhilippinesMap';
import OperationsLog from './OperationsLog';
import WarehousePanel from './WarehousePanel';
import type { Warehouse, ActiveAlert, OpsLogEntry, Region, DeploymentState } from '../../types';

const SIGNAL_COLOR: Record<number, string> = {
  0: '#6B8F71', 1: '#3E8FB0', 2: '#5EA8C8', 3: '#D4791A', 4: '#E8901C', 5: '#C84B31',
};

const SIGNAL_DESC: Record<number, string> = {
  0: 'No Signal',
  1: 'Signal No. 1 — 30–60 km/h in 36h',
  2: 'Signal No. 2 — 60–100 km/h in 24h',
  3: 'Signal No. 3 — 100–185 km/h in 18h',
  4: 'Signal No. 4 — 185–220 km/h in 12h',
  5: 'Signal No. 5 — >220 km/h, <12h',
};

interface Props {
  warehouses: Warehouse[];
  alert: ActiveAlert | null;
  regions: Region[];
  dataSource: 'live' | 'mock';
  loading: boolean;
  opsLog: OpsLogEntry[];
  onAddLog: (e: OpsLogEntry) => void;
}

export default function DisasterRelief({ warehouses, alert, regions, dataSource, loading, opsLog, onAddLog }: Props) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [deployments, setDeployments] = useState<DeploymentState[]>([]);

  function handleDeploy(warehouseId: string, targetRegion: string) {
    const wh = warehouses.find(w => w.id === warehouseId);
    if (!wh) return;
    const dep: DeploymentState = {
      warehouseId,
      targetRegion,
      status: 'deploying',
      dispatchedAt: new Date().toISOString(),
      items: [
        { category: 'food', qty: 500, unit: 'packs' },
        { category: 'water', qty: 2000, unit: 'liters' },
        { category: 'shelter', qty: 100, unit: 'kits' },
      ],
    };
    setDeployments(prev => [...prev.filter(d => d.warehouseId !== warehouseId), dep]);
    onAddLog({
      id: `log-dep-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'shipment_dispatched',
      message: `Deployment dispatched from ${wh.name} → ${alert?.affectedProvinces[0] || targetRegion}. 500 food packs, 2,000L water, 100 shelter kits.`,
      level: 'high',
      warehouseId,
      regionId: targetRegion,
    });
  }

  const signalColor = alert ? SIGNAL_COLOR[alert.signalNumber] : '#6B8F71';

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left: Map + Alert Header */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Alert banner */}
        {alert && (
          <div style={{
            background: `linear-gradient(90deg, ${signalColor}18, transparent)`,
            borderBottom: `1px solid ${signalColor}35`,
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <AlertOctagon size={18} color={signalColor} strokeWidth={1.5} />
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.02em',
                }}>
                  {alert.name.toUpperCase()}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
                  TCWS {SIGNAL_DESC[alert.signalNumber]} · {alert.intensity}
                </div>
              </div>
            </div>

            {/* Signal badge large */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '6px 14px',
              background: `${signalColor}18`,
              border: `1px solid ${signalColor}40`,
              borderRadius: 6,
              flexShrink: 0,
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: signalColor, letterSpacing: '0.1em' }}>TCWS</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: signalColor, lineHeight: 1 }}>
                {alert.signalNumber}
              </div>
            </div>

            {/* Data source */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}>
              {loading ? null : dataSource === 'live'
                ? <><Wifi size={12} color="var(--sage)" /> GDACS LIVE</>
                : <><WifiOff size={12} color="var(--text-muted)" /> SAMPLE DATA</>
              }
            </div>

            {/* Affected areas */}
            <div style={{ flexShrink: 0, display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 200 }}>
              {alert.affectedProvinces.slice(0, 5).map(p => (
                <span key={p} style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: signalColor,
                  background: `${signalColor}12`,
                  border: `1px solid ${signalColor}30`,
                  padding: '1px 6px',
                  borderRadius: 3,
                  letterSpacing: '0.04em',
                }}>
                  {p.toUpperCase()}
                </span>
              ))}
              {alert.affectedProvinces.length > 5 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
                  +{alert.affectedProvinces.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Map */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <PhilippinesMap
            warehouses={warehouses}
            alert={alert}
            regions={regions}
            selectedWarehouseId={selectedWarehouseId}
            onWarehouseClick={setSelectedWarehouseId}
          />
        </div>
      </div>

      {/* Right panel: split vertically */}
      <div style={{
        width: 320,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        height: '100%',
      }}>
        {/* Top: Warehouse panel — 3/5 of height */}
        <div style={{ flex: 3, minHeight: 0, borderBottom: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <WarehousePanel
            warehouses={warehouses}
            alert={alert}
            selectedId={selectedWarehouseId}
            onSelect={setSelectedWarehouseId}
            deployments={deployments}
            onDeploy={handleDeploy}
            onAddLog={onAddLog}
          />
        </div>

        {/* Bottom: Ops log — 2/5 of height */}
        <div style={{ flex: 2, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <OperationsLog entries={opsLog} />
        </div>
      </div>
    </div>
  );
}
