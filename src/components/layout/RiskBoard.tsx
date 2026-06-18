import type { Region } from '../../types';

const SIGNAL_COLOR: Record<number, string> = {
  0: 'var(--sage)',
  1: 'var(--blue)',
  2: '#5EA8C8',
  3: '#D4791A',
  4: 'var(--amber)',
  5: 'var(--red)',
};

const SIGNAL_BG: Record<number, string> = {
  0: 'rgba(107,143,113,0.08)',
  1: 'rgba(62,143,176,0.08)',
  2: 'rgba(94,168,200,0.08)',
  3: 'rgba(212,121,26,0.1)',
  4: 'rgba(232,144,28,0.12)',
  5: 'rgba(200,75,49,0.12)',
};

const SIGNAL_BORDER: Record<number, string> = {
  0: 'rgba(107,143,113,0.12)',
  1: 'rgba(62,143,176,0.12)',
  2: 'rgba(94,168,200,0.12)',
  3: 'rgba(212,121,26,0.2)',
  4: 'rgba(232,144,28,0.28)',
  5: 'rgba(200,75,49,0.35)',
};

interface Props {
  regions: Region[];
  dataSource: 'live' | 'mock';
  loading: boolean;
}

export default function RiskBoard({ regions, dataSource, loading }: Props) {
  const hasAlert = regions.some(r => r.signal >= 3);

  return (
    <div
      style={{
        height: 'var(--riskboard-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '0 16px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Left label */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        paddingRight: 14,
        borderRight: '1px solid var(--border)',
        marginRight: 14,
        flexShrink: 0,
        minWidth: 80,
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: hasAlert ? 'var(--amber)' : 'var(--text-muted)',
        }}>
          Risk Board
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
        }}>
          {!loading && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: dataSource === 'live' ? 'var(--sage)' : 'var(--text-muted)',
                flexShrink: 0,
              }}
            />
          )}
          {loading ? 'LOADING…' : dataSource === 'live' ? 'LIVE · GDACS' : 'SAMPLE DATA'}
        </div>
      </div>

      {/* Region tiles */}
      <div style={{
        display: 'flex',
        gap: 6,
        overflow: 'hidden',
        flex: 1,
      }}>
        {regions.map(region => {
          const color = SIGNAL_COLOR[region.signal];
          const bg = SIGNAL_BG[region.signal];
          const border = SIGNAL_BORDER[region.signal];
          const isActive = region.signal >= 2;

          return (
            <div
              key={region.id}
              title={`${region.fullName} — TCWS Signal ${region.signal}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                padding: '6px 10px',
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 4,
                minWidth: 60,
                flexShrink: 0,
                position: 'relative',
                cursor: 'default',
              }}
            >
              {isActive && region.signal >= 3 && (
                <div style={{
                  position: 'absolute',
                  inset: -1,
                  borderRadius: 4,
                  border: `1px solid ${color}`,
                  animation: 'pulseOutline 2.5s ease-out infinite',
                  pointerEvents: 'none',
                }} />
              )}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                fontWeight: 600,
                color: isActive ? color : 'var(--text-secondary)',
                letterSpacing: '0.02em',
                textAlign: 'center',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}>
                {region.name}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 500,
                color: color,
                lineHeight: 1,
              }}>
                {region.signal === 0 ? '—' : `S${region.signal}`}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulseOutline {
          0% { opacity: 0.8; transform: scale(1); }
          70% { opacity: 0; transform: scale(1.06); }
          100% { opacity: 0; transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
