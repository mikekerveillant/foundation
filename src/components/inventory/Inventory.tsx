import { Package, Droplets, Utensils, Heart, Home, Anchor, AlertTriangle } from 'lucide-react';
import type { Warehouse } from '../../types';

const CAT_ICONS = {
  water: Droplets,
  food: Utensils,
  medical: Heart,
  shelter: Home,
  rescue: Anchor,
};

const CAT_LABELS: Record<string, string> = {
  water: 'Water',
  food: 'Food Packs',
  medical: 'Medical Kits',
  shelter: 'Shelter Kits',
  rescue: 'Rescue Units',
};

const CAT_UNITS: Record<string, string> = {
  water: 'L', food: 'packs', medical: 'kits', shelter: 'kits', rescue: 'units',
};

function fmt(n: number) { return n.toLocaleString('en-PH'); }

function stockStatus(qty: number, threshold: number): { label: string; color: string; pct: number } {
  const pct = qty / (threshold * 4);
  if (pct > 0.6) return { label: 'GOOD', color: 'var(--sage)', pct };
  if (pct > 0.25) return { label: 'MONITOR', color: 'var(--amber)', pct };
  return { label: 'LOW', color: 'var(--red)', pct };
}

interface Props {
  warehouses: Warehouse[];
}

export default function Inventory({ warehouses }: Props) {
  const lowStockItems = warehouses.flatMap(wh =>
    (Object.entries(wh.inventory) as [keyof typeof CAT_ICONS, { qty: number; unit: string; threshold: number }][])
      .filter(([, v]) => v.qty < v.threshold * 1.2)
      .map(([cat, v]) => ({ wh, cat, ...v }))
  );

  const totals = Object.keys(CAT_LABELS).reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = warehouses.reduce((s, wh) => s + (wh.inventory[cat as keyof typeof CAT_ICONS]?.qty ?? 0), 0);
    return acc;
  }, {});

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '24px 28px', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            Inventory
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '0.06em' }}>
            {warehouses.length} WAREHOUSES · PHILIPPINES NETWORK
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Warehouses', value: warehouses.length, color: 'var(--text-secondary)' },
            { label: 'Low Stock', value: lowStockItems.length, color: lowStockItems.length > 0 ? 'var(--amber)' : 'var(--sage)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 500, color, lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStockItems.length > 0 && (
        <div style={{
          background: 'var(--amber-dim)',
          border: '1px solid var(--amber-border)',
          borderRadius: 8,
          padding: '14px 20px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <AlertTriangle size={16} color="var(--amber)" strokeWidth={1.5} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--amber)', letterSpacing: '0.02em' }}>
              {lowStockItems.length} Low Stock Alert{lowStockItems.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {lowStockItems.map(({ wh, cat, qty, threshold }) => (
              <span key={`${wh.id}-${cat}`} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--amber)',
                background: 'rgba(232,144,28,0.1)',
                border: '1px solid var(--amber-border)',
                padding: '3px 8px',
                borderRadius: 3,
                letterSpacing: '0.04em',
              }}>
                {wh.name.split(' ')[0]} / {CAT_LABELS[cat]} — {fmt(qty)} {CAT_UNITS[cat]} (min {fmt(threshold)})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Network totals */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.04em', marginBottom: 16 }}>
          NETWORK TOTALS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 16 }}>
          {(Object.entries(CAT_LABELS) as [keyof typeof CAT_ICONS, string][]).map(([cat, label]) => {
            const Icon = CAT_ICONS[cat];
            const total = totals[cat] ?? 0;
            return (
              <div key={cat} style={{ textAlign: 'center' }}>
                <Icon size={20} color="var(--text-muted)" strokeWidth={1.5} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {fmt(total)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.06em' }}>
                  {CAT_UNITS[cat]}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-warehouse detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(440px, 100%), 1fr))', gap: 16 }}>
        {warehouses.map(wh => {
          const hasLow = (Object.values(wh.inventory) as { qty: number; threshold: number }[]).some(v => v.qty < v.threshold * 1.2);

          return (
            <div
              key={wh.id}
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${hasLow ? 'var(--amber-border)' : 'var(--border)'}`,
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {/* Warehouse header */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <Package size={14} color={hasLow ? 'var(--amber)' : 'var(--sage)'} strokeWidth={1.5} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
                    {wh.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    {wh.province} · {wh.islandGroup} · {wh.region}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.04em', textAlign: 'right' }}>
                  {wh.location.lat.toFixed(3)}°N<br />{wh.location.lng.toFixed(3)}°E
                </div>
              </div>

              {/* Inventory rows */}
              <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(Object.entries(wh.inventory) as [keyof typeof CAT_ICONS, { qty: number; unit: string; threshold: number }][]).map(([cat, val]) => {
                  const Icon = CAT_ICONS[cat];
                  const { label, color, pct } = stockStatus(val.qty, val.threshold);

                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <Icon size={12} color={color} strokeWidth={1.5} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', flex: 1 }}>
                          {CAT_LABELS[cat]}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9,
                          color,
                          background: color === 'var(--sage)' ? 'var(--sage-dim)' : color === 'var(--amber)' ? 'var(--amber-dim)' : 'var(--red-dim)',
                          border: `1px solid ${color === 'var(--sage)' ? 'var(--sage-border)' : color === 'var(--amber)' ? 'var(--amber-border)' : 'var(--red-border)'}`,
                          padding: '1px 6px',
                          borderRadius: 3,
                          letterSpacing: '0.06em',
                        }}>
                          {label}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', minWidth: 80, textAlign: 'right' }}>
                          {fmt(val.qty)} {CAT_UNITS[cat]}
                        </span>
                      </div>
                      <div className="progress-bar" style={{ height: 4 }}>
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(pct * 100, 100)}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
