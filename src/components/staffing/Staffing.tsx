import { User, MapPin, CheckCircle, Clock, Briefcase } from 'lucide-react';
import type { StaffMember, Warehouse } from '../../types';

const ROLE_COLORS: Record<string, string> = {
  'Field Coordinator': 'var(--blue)',
  'Logistics Officer': 'var(--amber)',
  'Medical Coordinator': 'var(--red)',
  'Medical Staff': 'var(--red)',
  'Program Officer': 'var(--sage)',
  'Finance Officer': '#8A9BB0',
};

interface Props {
  staff: StaffMember[];
  warehouses: Warehouse[];
}

export default function Staffing({ staff, warehouses }: Props) {
  const available = staff.filter(s => s.available);
  const deployed = staff.filter(s => !s.available);
  const byRegion = staff.reduce<Record<string, StaffMember[]>>((acc, s) => {
    (acc[s.region] = acc[s.region] || []).push(s);
    return acc;
  }, {});

  function nearestWarehouse(s: StaffMember) {
    if (!s.nearestWarehouseId) return null;
    return warehouses.find(w => w.id === s.nearestWarehouseId);
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '24px 28px', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            Staff Roster
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '0.06em' }}>
            FIELD STAFF · PHILIPPINES OPERATIONS
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Total Staff', value: staff.length, color: 'var(--text-secondary)' },
            { label: 'Available', value: available.length, color: 'var(--sage)' },
            { label: 'Deployed', value: deployed.length, color: 'var(--amber)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 500, color, lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Available for deployment callout */}
      <div style={{
        background: 'rgba(107,143,113,0.08)',
        border: '1px solid rgba(107,143,113,0.25)',
        borderRadius: 8,
        padding: '14px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <CheckCircle size={18} color="var(--sage)" strokeWidth={1.5} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--sage)', letterSpacing: '0.02em' }}>
            {available.length} staff available for immediate deployment
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
            {available.filter(s => s.nearestWarehouseId).length} are within proximity of a foundation warehouse
          </div>
        </div>
      </div>

      {/* By region */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(byRegion).map(([region, members]) => (
          <div key={region} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--bg-elevated)',
            }}>
              <MapPin size={13} color="var(--text-muted)" strokeWidth={1.5} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em', flex: 1 }}>
                {region}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                {members.filter(m => m.available).length} / {members.length} available
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: 'var(--border)' }}>
              {members.map(member => {
                const wh = nearestWarehouse(member);
                const roleColor = ROLE_COLORS[member.role] || 'var(--text-muted)';

                return (
                  <div
                    key={member.id}
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '14px 20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        background: member.available ? 'var(--sage-dim)' : 'var(--amber-dim)',
                        border: `1px solid ${member.available ? 'var(--sage-border)' : 'var(--amber-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <User size={14} color={member.available ? 'var(--sage)' : 'var(--amber)'} strokeWidth={1.5} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {member.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Briefcase size={10} color={roleColor} strokeWidth={1.5} />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: roleColor }}>{member.role}</span>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 8px',
                        borderRadius: 3,
                        background: member.available ? 'var(--sage-dim)' : 'var(--amber-dim)',
                        border: `1px solid ${member.available ? 'var(--sage-border)' : 'var(--amber-border)'}`,
                        flexShrink: 0,
                      }}>
                        {member.available
                          ? <CheckCircle size={9} color="var(--sage)" strokeWidth={2} />
                          : <Clock size={9} color="var(--amber)" strokeWidth={2} />
                        }
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: member.available ? 'var(--sage)' : 'var(--amber)', letterSpacing: '0.06em' }}>
                          {member.available ? 'AVAIL' : 'DEPLOYED'}
                        </span>
                      </div>
                    </div>

                    {member.currentAssignment && (
                      <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', background: 'var(--amber-dim)', padding: '3px 8px', borderRadius: 3, display: 'inline-block' }}>
                        ↗ {member.currentAssignment}
                      </div>
                    )}

                    {wh && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                        <div style={{ width: 6, height: 6, background: 'var(--sage)', borderRadius: 1 }} />
                        Near {wh.name}
                      </div>
                    )}

                    <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {member.skills.map(skill => (
                        <span key={skill} style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9,
                          color: 'var(--text-muted)',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-light)',
                          padding: '1px 6px',
                          borderRadius: 3,
                          letterSpacing: '0.04em',
                        }}>
                          {skill.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
