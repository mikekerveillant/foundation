import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { BudgetCategory } from '../../types';

function php(n: number) {
  return `₱${(n / 1_000_000).toFixed(2)}M`;
}
function phpFull(n: number) {
  return `₱${n.toLocaleString('en-PH')}`;
}

function paceColor(spent: number, budget: number, monthsPassed: number) {
  const expectedPct = monthsPassed / 12;
  const actualPct = spent / budget;
  if (actualPct > expectedPct + 0.08) return 'var(--amber)';
  if (actualPct < expectedPct - 0.12) return 'var(--blue)';
  return 'var(--sage)';
}

const MONTHS_PASSED = 10;

interface Props {
  categories: BudgetCategory[];
}

export default function Budget({ categories }: Props) {
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const totalBudget = categories.reduce((a, c) => a + c.annualBudget, 0);
  const totalSpent = categories.reduce((a, c) => a + c.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const activeCats = selectedCat === 'all' ? categories : categories.filter(c => c.id === selectedCat);

  // Build cumulative burn chart data (12 months)
  const burnData = Array.from({ length: 12 }, (_, i) => {
    const month = activeCats[0]?.monthly[i]?.month ?? `M${i + 1}`;
    const cumBudget = activeCats.reduce((a, c) => a + (c.monthly[i]?.cumBudget ?? 0), 0);
    const cumSpent = activeCats.reduce((a, c) => a + (c.monthly[i]?.cumSpent ?? 0), 0);
    return { month, cumBudget, cumSpent };
  });

  // Monthly bar data
  const monthlyData = Array.from({ length: 10 }, (_, i) => {
    const month = activeCats[0]?.monthly[i]?.month ?? `M${i + 1}`;
    const budget = activeCats.reduce((a, c) => a + (c.monthly[i]?.budget ?? 0), 0);
    const spent = activeCats.reduce((a, c) => a + (c.monthly[i]?.spent ?? 0), 0);
    return { month, budget, spent };
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-light)',
        borderRadius: 6,
        padding: '10px 14px',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 3 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: p.color }}>{p.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)' }}>{phpFull(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '24px 28px', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em', lineHeight: 1 }}>
            FY 2024 Budget
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '0.06em' }}>
            PHILIPPINE PESO · JAN – DEC 2024 · AS OF OCT 2024
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Annual Budget', value: php(totalBudget), color: 'var(--text-secondary)' },
            { label: 'Spent (YTD)', value: php(totalSpent), color: 'var(--amber)' },
            { label: 'Remaining', value: php(totalRemaining), color: 'var(--sage)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[{ id: 'all', name: 'All Categories', color: 'var(--text-secondary)' }, ...categories].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 14px',
              borderRadius: 20,
              border: `1px solid ${selectedCat === cat.id ? (cat.id !== 'all' ? (cat as BudgetCategory).color : 'var(--border-light)') : 'var(--border)'}`,
              background: selectedCat === cat.id ? 'var(--bg-elevated)' : 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 500,
              color: selectedCat === cat.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all 0.12s',
            }}
          >
            {'color' in cat && cat.id !== 'all' && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: (cat as BudgetCategory).color, flexShrink: 0 }} />
            )}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Burn-up chart */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 20px 12px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.04em', marginBottom: 16 }}>
            CUMULATIVE BURN
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={burnData}>
              <defs>
                <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--amber)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₱${(v / 1e6).toFixed(0)}M`} tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cumBudget" name="Budget" stroke="var(--blue)" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#budgetGrad)" dot={false} />
              <Area type="monotone" dataKey="cumSpent" name="Spent" stroke="var(--amber)" strokeWidth={2} fill="url(#spentGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly spending */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 20px 12px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.04em', marginBottom: 16 }}>
            MONTHLY SPEND VS. BUDGET
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={2}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₱${(v / 1e6).toFixed(1)}M`} tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="budget" name="Budget" fill="rgba(62,143,176,0.2)" stroke="var(--blue)" strokeWidth={1} radius={[2, 2, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="var(--amber)" opacity={0.8} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.04em', marginBottom: 16 }}>
          CATEGORY BREAKDOWN
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {categories.map((cat, idx) => {
            const pct = cat.spent / cat.annualBudget;
            const color = paceColor(cat.spent, cat.annualBudget, MONTHS_PASSED);
            const statusLabel = color === 'var(--amber)' ? 'OVER-PACING' : color === 'var(--blue)' ? 'UNDER-PACING' : 'ON TRACK';

            return (
              <div
                key={cat.id}
                style={{
                  padding: '14px 0',
                  borderBottom: idx < categories.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', flex: 1, letterSpacing: '0.01em' }}>
                    {cat.name}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color,
                    background: `${color === 'var(--amber)' ? 'var(--amber-dim)' : color === 'var(--blue)' ? 'var(--blue-dim)' : 'var(--sage-dim)'}`,
                    border: `1px solid ${color === 'var(--amber)' ? 'var(--amber-border)' : color === 'var(--blue)' ? 'var(--blue-border)' : 'var(--sage-border)'}`,
                    padding: '2px 7px',
                    borderRadius: 3,
                    letterSpacing: '0.08em',
                  }}>
                    {statusLabel}
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', textAlign: 'right', minWidth: 80 }}>
                    {phpFull(cat.spent)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', minWidth: 70, textAlign: 'right' }}>
                    / {phpFull(cat.annualBudget)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color, minWidth: 44, textAlign: 'right' }}>
                    {(pct * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(pct * 100, 100)}%`, background: color }}
                  />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 5 }}>
                  {phpFull(cat.annualBudget - cat.spent)} remaining · expected {Math.round(MONTHS_PASSED / 12 * 100)}% through year
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
