import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Wifi, WifiOff, AlertOctagon, Waves, Flame, Clock } from 'lucide-react';
import PhilippinesMap from './PhilippinesMap';
import OperationsLog from './OperationsLog';
import WarehousePanel from './WarehousePanel';
import TyphoonTimeline from './TyphoonTimeline';
import { useIsMobile } from '../../hooks/useBreakpoint';
import type { Warehouse, ActiveAlert, OpsLogEntry, Region, DeploymentState } from '../../types';

// ── colour helpers ────────────────────────────────────────────────────────────

const SIGNAL_COLOR: Record<number, string> = {
  0: '#6B8F71', 1: '#3E8FB0', 2: '#5EA8C8', 3: '#D4791A', 4: '#E8901C', 5: '#C84B31',
};
const SIGNAL_DESC: Record<number, string> = {
  0: 'No Signal', 1: 'Signal No. 1 — 30–60 km/h in 36h', 2: 'Signal No. 2 — 60–100 km/h in 24h',
  3: 'Signal No. 3 — 100–185 km/h in 18h', 4: 'Signal No. 4 — 185–220 km/h in 12h',
  5: 'Signal No. 5 — >220 km/h, <12h',
};
const VOLCANO_LEVEL_COLOR: Record<number, string> = {
  0: '#6B8F71', 1: '#3E8FB0', 2: '#5EA8C8', 3: '#D4791A', 4: '#E8901C', 5: '#C84B31',
};
const VOLCANO_LEVEL_DESC: Record<number, string> = {
  0: 'Normal — background activity', 1: 'Low-level unrest', 2: 'Moderate unrest',
  3: 'High-level unrest — eruption possible in weeks', 4: 'Hazardous eruption imminent',
  5: 'Hazardous eruption in progress',
};
const PHIVOLCS_INTENSITY_COLOR: Record<string, string> = {
  'I': '#6B8F71', 'II': '#3E8FB0', 'III': '#5EA8C8', 'IV': '#5EA8C8',
  'V': '#D4791A', 'VI': '#D4791A', 'VII': '#E8901C', 'VIII': '#C84B31',
  'IX': '#C84B31', 'X': '#9B1C1C',
};

function disasterColor(alert: ActiveAlert): string {
  if (alert.type === 'typhoon' || alert.type === 'tropical_storm' || alert.type === 'tropical_depression') return SIGNAL_COLOR[alert.signalNumber];
  if (alert.type === 'earthquake') return PHIVOLCS_INTENSITY_COLOR[alert.phivolcsIntensity ?? 'V'] ?? '#E8901C';
  if (alert.type === 'volcanic') return VOLCANO_LEVEL_COLOR[alert.volcanoAlertLevel ?? 0];
  return '#E8901C';
}

function disasterIcon(alert: ActiveAlert, size = 18) {
  const color = disasterColor(alert);
  if (alert.type === 'earthquake') return <Waves size={size} color={color} strokeWidth={1.5} />;
  if (alert.type === 'volcanic') return <Flame size={size} color={color} strokeWidth={1.5} />;
  return <AlertOctagon size={size} color={color} strokeWidth={1.5} />;
}

function disasterTypeLabel(type: ActiveAlert['type']): string {
  if (type === 'typhoon') return 'Typhoon';
  if (type === 'tropical_storm') return 'Tropical Storm';
  if (type === 'tropical_depression') return 'Tropical Depression';
  if (type === 'earthquake') return 'Earthquake';
  if (type === 'volcanic') return 'Volcanic';
  return 'Alert';
}

// ── alert banner ──────────────────────────────────────────────────────────────

function AlertBanner({ alert, loading }: { alert: ActiveAlert; dataSource: 'live' | 'mock'; loading: boolean }) {
  const color = disasterColor(alert);

  const badge = alert.type === 'typhoon' || alert.type === 'tropical_storm' || alert.type === 'tropical_depression' ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px 12px', background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 6, flexShrink: 0 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, letterSpacing: '0.1em' }}>TCWS</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{alert.signalNumber}</div>
    </div>
  ) : alert.type === 'earthquake' ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px 12px', background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 6, flexShrink: 0 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, letterSpacing: '0.1em' }}>MAG</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{alert.magnitude?.toFixed(1)}</div>
    </div>
  ) : alert.type === 'volcanic' ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px 12px', background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 6, flexShrink: 0 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, letterSpacing: '0.1em' }}>LEVEL</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{alert.volcanoAlertLevel}</div>
    </div>
  ) : null;

  const subtitle = alert.type === 'typhoon' || alert.type === 'tropical_storm' || alert.type === 'tropical_depression'
    ? `TCWS ${SIGNAL_DESC[alert.signalNumber]} · ${alert.intensity}`
    : alert.type === 'earthquake'
    ? `PHIVOLCS Intensity ${alert.phivolcsIntensity} · Depth ${alert.depth} km · ${alert.intensity}`
    : alert.type === 'volcanic'
    ? `${VOLCANO_LEVEL_DESC[alert.volcanoAlertLevel ?? 0]} · ${alert.dangerZoneKm} km PDZ · PHIVOLCS`
    : alert.intensity;

  return (
    <div style={{
      background: `linear-gradient(90deg, ${color}15, transparent)`,
      borderBottom: `1px solid ${color}30`,
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexShrink: 0,
    }}>
      {disasterIcon(alert)}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em', lineHeight: 1.2 }}>
          {alert.name.toUpperCase()}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
          {subtitle}
        </div>
      </div>

      {badge}

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>
        {!loading && (alert.source === 'live'
          ? <><Wifi size={10} color="var(--sage)" /> GDACS</>
          : <><WifiOff size={10} color="var(--text-muted)" /> SAMPLE</>
        )}
      </div>

      <div style={{ flexShrink: 0, display: 'flex', gap: 3, flexWrap: 'wrap', maxWidth: 180 }}>
        {alert.affectedProvinces.slice(0, 4).map(p => (
          <span key={p} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color, background: `${color}10`, border: `1px solid ${color}28`, padding: '1px 5px', borderRadius: 3, letterSpacing: '0.04em' }}>
            {p.toUpperCase()}
          </span>
        ))}
        {alert.affectedProvinces.length > 4 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>
            +{alert.affectedProvinces.length - 4}
          </span>
        )}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface Props {
  warehouses: Warehouse[];
  alerts: ActiveAlert[];
  regions: Region[];
  dataSource: 'live' | 'mock';
  loading: boolean;
  opsLog: OpsLogEntry[];
  onAddLog: (e: OpsLogEntry) => void;
}

export default function DisasterRelief({ warehouses, alerts, regions, dataSource, loading, opsLog, onAddLog }: Props) {
  const [selectedAlertIdx, setSelectedAlertIdx] = useState(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [deployments, setDeployments] = useState<DeploymentState[]>([]);
  const isMobile = useIsMobile();

  const alert = alerts[selectedAlertIdx] ?? alerts[0];

  function handleDeploy(warehouseId: string, targetRegion: string) {
    const wh = warehouses.find(w => w.id === warehouseId);
    if (!wh) return;
    const dep: DeploymentState = {
      warehouseId, targetRegion, status: 'deploying',
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
      message: `Deployment from ${wh.name} → ${alert?.affectedProvinces[0] || targetRegion}. 500 food packs, 2,000 L water, 100 shelter kits.`,
      level: 'high',
      warehouseId,
      regionId: targetRegion,
    });
  }

  // ── shared pieces ─────────────────────────────────────────────────────────
  const tabBar = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0, background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)', padding: '0 12px', flexShrink: 0,
      overflowX: 'auto',
      ...(isMobile ? { position: 'sticky', top: 0, zIndex: 10 } : {}),
    }}>
      {alerts.map((a, idx) => {
        const isActive = idx === selectedAlertIdx;
        const color = disasterColor(a);
        return (
          <button key={a.id} onClick={() => setSelectedAlertIdx(idx)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', border: 'none',
            borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
            background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1,
          }}>
            {disasterIcon(a, 13)}
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', letterSpacing: '0.02em' }}>
              {disasterTypeLabel(a.type)}
            </span>
            {(a.type === 'typhoon' || a.type === 'tropical_storm' || a.type === 'tropical_depression') && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, background: `${color}15`, border: `1px solid ${color}35`, padding: '1px 6px', borderRadius: 3 }}>S{a.signalNumber}</span>
            )}
            {a.type === 'earthquake' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, background: `${color}15`, border: `1px solid ${color}35`, padding: '1px 6px', borderRadius: 3 }}>M{a.magnitude?.toFixed(1)}</span>
            )}
            {a.type === 'volcanic' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, background: `${color}15`, border: `1px solid ${color}35`, padding: '1px 6px', borderRadius: 3 }}>L{a.volcanoAlertLevel}</span>
            )}
          </button>
        );
      })}
    </div>
  );

  const eqStrip = alert.type === 'earthquake' && alert.occurredAt ? (
    <div style={{ flexShrink: 0, background: 'var(--bg-surface)', borderBottom: `1px solid ${disasterColor(alert)}30`, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <Clock size={11} color={disasterColor(alert)} strokeWidth={1.5} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>TREMOR RECORDED</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-primary)', marginLeft: 8 }}>{format(parseISO(alert.occurredAt), 'MMM d, yyyy · HH:mm')} PHT</span>
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>EPICENTER</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)', marginLeft: 8 }}>{alert.coordinates.lat.toFixed(2)}°N {alert.coordinates.lng.toFixed(2)}°E</span>
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>DEPTH</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)', marginLeft: 8 }}>{alert.depth} km</span>
        </div>
      </div>
    </div>
  ) : null;

  const typhoonTimeline = (alert.type === 'typhoon' || alert.type === 'tropical_storm' || alert.type === 'tropical_depression') && alert.track.length > 0
    ? <TyphoonTimeline track={alert.track} lastUpdated={alert.lastUpdated} />
    : null;

  // ── MOBILE: flat scrolling column — no flex competition ───────────────────
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        {tabBar}
        <AlertBanner alert={alert} dataSource={dataSource} loading={loading} />
        {eqStrip}
        <div style={{ height: '60vw', minHeight: 220, maxHeight: 320, flexShrink: 0, overflow: 'hidden' }}>
          <PhilippinesMap
            warehouses={warehouses} alerts={alerts} selectedAlertIdx={selectedAlertIdx}
            regions={regions} selectedWarehouseId={selectedWarehouseId} onWarehouseClick={setSelectedWarehouseId}
          />
        </div>
        {typhoonTimeline}
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', height: 320, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <WarehousePanel
            warehouses={warehouses} alert={alert} selectedId={selectedWarehouseId}
            onSelect={setSelectedWarehouseId} deployments={deployments}
            onDeploy={handleDeploy} onAddLog={onAddLog}
          />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', height: 260, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <OperationsLog entries={opsLog} />
        </div>
      </div>
    );
  }

  // ── DESKTOP: original side-by-side layout ─────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {tabBar}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <AlertBanner alert={alert} dataSource={dataSource} loading={loading} />
          {eqStrip}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <PhilippinesMap
              warehouses={warehouses} alerts={alerts} selectedAlertIdx={selectedAlertIdx}
              regions={regions} selectedWarehouseId={selectedWarehouseId} onWarehouseClick={setSelectedWarehouseId}
            />
          </div>
          {typhoonTimeline}
        </div>
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)', overflow: 'hidden', height: '100%' }}>
          <div style={{ flex: 3, minHeight: 0, borderBottom: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <WarehousePanel
              warehouses={warehouses} alert={alert} selectedId={selectedWarehouseId}
              onSelect={setSelectedWarehouseId} deployments={deployments}
              onDeploy={handleDeploy} onAddLog={onAddLog}
            />
          </div>
          <div style={{ flex: 2, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <OperationsLog entries={opsLog} />
          </div>
        </div>
      </div>
    </div>
  );
}
