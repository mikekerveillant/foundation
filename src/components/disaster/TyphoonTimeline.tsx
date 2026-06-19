import { format, parseISO } from 'date-fns';
import type { TyphoonTrackPoint } from '../../types';

const CAT_COLOR: Record<string, string> = {
  'CAT 5': '#9B1C1C',
  'CAT 4': '#E8901C',
  'CAT 3': '#D4791A',
  'CAT 2': '#3E8FB0',
  'CAT 1': '#6B8F71',
  'TS':    '#5EA8C8',
  'TD':    '#4A7A9B',
};

function catColor(intensity: string): string {
  return CAT_COLOR[intensity] ?? '#888';
}

interface Props {
  track: TyphoonTrackPoint[];
  lastUpdated: string;
}

export default function TyphoonTimeline({ track, lastUpdated }: Props) {
  if (!track.length) return null;

  const updated = new Date(lastUpdated);

  // last track point whose time <= lastUpdated is "current"
  let currentIdx = 0;
  for (let i = 0; i < track.length; i++) {
    if (new Date(track[i].time) <= updated) currentIdx = i;
  }

  return (
    <div style={{
      flexShrink: 0,
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      padding: '8px 16px 10px',
      overflowX: 'auto',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text-muted)',
        letterSpacing: '0.12em',
        marginBottom: 6,
      }}>
        FORECAST TRACK
      </div>

      {/* scroll container */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: 'max-content' }}>
        {track.map((pt, i) => {
          const isCurrent = i === currentIdx;
          const isForecast = i > currentIdx;
          const color = catColor(pt.intensity);
          const dt = parseISO(pt.time);
          const dayLabel = format(dt, 'MMM d');
          const timeLabel = format(dt, 'HH:mm');

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {/* node + labels */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 64 }}>
                {/* intensity badge */}
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  fontWeight: 700,
                  color,
                  background: `${color}18`,
                  border: `1px solid ${color}40`,
                  borderRadius: 3,
                  padding: '1px 5px',
                  letterSpacing: '0.06em',
                  marginBottom: 5,
                  opacity: isForecast ? 0.7 : 1,
                }}>
                  {pt.intensity}
                </div>

                {/* node circle */}
                <div style={{
                  width: isCurrent ? 12 : 8,
                  height: isCurrent ? 12 : 8,
                  borderRadius: '50%',
                  background: isCurrent ? color : isForecast ? 'var(--bg-deep)' : color,
                  border: `2px solid ${color}`,
                  boxShadow: isCurrent ? `0 0 0 3px ${color}30` : 'none',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 1,
                }} />

                {/* NOW label */}
                {isCurrent && (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 7,
                    fontWeight: 700,
                    color,
                    letterSpacing: '0.1em',
                    marginTop: 4,
                  }}>NOW</div>
                )}

                {/* date / time */}
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                  marginTop: isCurrent ? 2 : 6,
                  textAlign: 'center',
                  lineHeight: 1.4,
                  opacity: isForecast ? 0.7 : 1,
                }}>
                  <div>{dayLabel}</div>
                  <div>{timeLabel}</div>
                </div>
              </div>

              {/* connector line between nodes */}
              {i < track.length - 1 && (
                <div style={{
                  width: 32,
                  height: 2,
                  marginBottom: isCurrent || i + 1 === currentIdx ? 22 : 0,
                  background: isForecast
                    ? `repeating-linear-gradient(90deg, ${catColor(track[i + 1].intensity)}60 0px, ${catColor(track[i + 1].intensity)}60 4px, transparent 4px, transparent 8px)`
                    : catColor(track[i + 1].intensity),
                  opacity: isForecast ? 0.6 : 0.85,
                  flexShrink: 0,
                  alignSelf: 'center',
                  marginTop: -12,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
