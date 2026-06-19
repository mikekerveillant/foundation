import { AlertTriangle, BarChart3, Users, Package } from 'lucide-react';
import type { Module } from '../../types';
import { useIsMobile } from '../../hooks/useBreakpoint';

const NAV = [
  { id: 'disaster' as Module, icon: AlertTriangle, label: 'Disaster Relief', sub: 'Command' },
  { id: 'budget' as Module, icon: BarChart3, label: 'Budget', sub: 'FY 2024' },
  { id: 'staffing' as Module, icon: Users, label: 'Staffing', sub: 'Roster' },
  { id: 'inventory' as Module, icon: Package, label: 'Inventory', sub: 'Warehouses' },
];

interface Props {
  active: Module;
  onChange: (m: Module) => void;
}

export default function Sidebar({ active, onChange }: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <nav style={{ display: 'flex', flexDirection: 'row', height: '100%', background: 'var(--bg-surface)', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
        {NAV.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                flex: 1,
                height: '100%',
                background: 'transparent',
                border: 'none',
                borderTop: isActive ? '2px solid var(--amber)' : '2px solid transparent',
                cursor: 'pointer',
                padding: '0 4px',
              }}
            >
              <Icon size={20} color={isActive ? 'var(--amber)' : 'var(--text-secondary)'} strokeWidth={1.5} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        padding: '0',
      }}
    >
      {/* Logo / Brand */}
      <div style={{
        padding: '18px 20px 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '0.02em',
          lineHeight: 1.1,
        }}>
          Control Center
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
          marginTop: 3,
        }}>
          OPS // PHILIPPINES
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '12px 0' }}>
        {NAV.map(({ id, icon: Icon, label, sub }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '11px 20px',
                background: isActive ? 'var(--bg-elevated)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '2px solid var(--amber)' : '2px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.12s',
                marginBottom: 2,
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Icon
                size={16}
                color={isActive ? 'var(--amber)' : 'var(--text-secondary)'}
                strokeWidth={1.5}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  letterSpacing: '0.01em',
                  lineHeight: 1.2,
                }}>
                  {label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: isActive ? 'var(--text-muted)' : '#394A5A',
                  letterSpacing: '0.08em',
                  marginTop: 1,
                }}>
                  {sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          v1.0 · DEMO
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2E3A4A', marginTop: 2, letterSpacing: '0.04em' }}>
          PAGASA REGION: ACTIVE
        </div>
      </div>
    </nav>
  );
}
