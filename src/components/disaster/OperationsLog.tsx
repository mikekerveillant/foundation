import { format } from 'date-fns';
import { AlertTriangle, Navigation, Truck, TrendingDown, Users, Package, Radio } from 'lucide-react';
import type { OpsLogEntry } from '../../types';

const TYPE_ICON: Record<OpsLogEntry['type'], typeof AlertTriangle> = {
  signal_raised: AlertTriangle,
  deployment_recommended: Navigation,
  shipment_dispatched: Truck,
  signal_lowered: TrendingDown,
  staff_deployed: Users,
  warehouse_update: Package,
  system: Radio,
};

const LEVEL_COLOR: Record<OpsLogEntry['level'], string> = {
  none: 'var(--text-muted)',
  low: 'var(--sage)',
  medium: 'var(--blue)',
  high: '#D4791A',
  critical: 'var(--amber)',
};

function ts(iso: string) {
  try {
    return format(new Date(iso), 'MMM d, HH:mm');
  } catch {
    return iso;
  }
}

interface Props {
  entries: OpsLogEntry[];
  onNewEntry?: (entry: OpsLogEntry) => void;
}

export default function OperationsLog({ entries }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px 10px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span className="section-header">Operations Log</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          {entries.length} entries
        </span>
      </div>

      <div className="scroll-y" style={{ flex: 1, padding: '8px 0' }}>
        {entries.map((entry, idx) => {
          const Icon = TYPE_ICON[entry.type] || Radio;
          const color = LEVEL_COLOR[entry.level];
          const isFirst = idx === 0;

          return (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 16px',
                borderLeft: isFirst ? `2px solid ${color}` : '2px solid transparent',
                background: isFirst ? `${color}08` : 'transparent',
                marginBottom: 1,
              }}
            >
              {/* Timeline dot + line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, gap: 0 }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: 4,
                  background: `${color}15`,
                  border: `1px solid ${color}35`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={12} color={color} strokeWidth={1.5} />
                </div>
                {idx < entries.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: 'var(--border)', minHeight: 12, marginTop: 4 }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0, paddingBottom: 8 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                  marginBottom: 4,
                }}>
                  {ts(entry.timestamp)}
                </div>
                <div style={{
                  fontSize: 12,
                  color: isFirst ? 'var(--text-primary)' : 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}>
                  {entry.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
