import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import RiskBoard from './components/layout/RiskBoard';
import DisasterRelief from './components/disaster/DisasterRelief';
import Budget from './components/budget/Budget';
import Staffing from './components/staffing/Staffing';
import Inventory from './components/inventory/Inventory';
import { useJTWC } from './hooks/useJTWC';
import { useUSGSEarthquake } from './hooks/useUSGSEarthquake';
import { useVolcanos } from './hooks/useVolcanos';
import { REGIONS, WAREHOUSES, BUDGET_CATEGORIES, STAFF_MEMBERS, INITIAL_OPS_LOG } from './data/mockData';
import type { Module, OpsLogEntry, Region, ActiveAlert } from './types';

function alertToSignal(alert: ActiveAlert): number {
  if (alert.type === 'typhoon' || alert.type === 'tropical_storm' || alert.type === 'tropical_depression') {
    return alert.signalNumber;
  }
  if (alert.type === 'earthquake') {
    const mag = alert.magnitude ?? 0;
    if (mag >= 7.0) return 4;
    if (mag >= 6.0) return 3;
    if (mag >= 5.0) return 2;
    return 1;
  }
  if (alert.type === 'volcanic') {
    return Math.min(5, alert.volcanoAlertLevel ?? 0) as Region['signal'];
  }
  return 1;
}

export default function App() {
  const [activeModule, setActiveModule] = useState<Module>('disaster');
  const [opsLog, setOpsLog] = useState<OpsLogEntry[]>(INITIAL_OPS_LOG);
  const { alert: jtwcAlert, dataSource, loading } = useJTWC();
  const { alert: usgsEarthquake } = useUSGSEarthquake();
  const { volcanos } = useVolcanos();

  // All active alerts: live JTWC typhoon + live USGS earthquake (M≥5.5) + live GVP volcanos
  const alerts: ActiveAlert[] = [jtwcAlert, usgsEarthquake, ...volcanos];

  // Risk Board: take the max signal each region gets from any active alert
  const regions: Region[] = REGIONS.map(r => {
    let maxSignal = r.signal;
    for (const a of alerts) {
      if (a.affectedRegionIds.includes(r.id)) {
        maxSignal = Math.max(maxSignal, alertToSignal(a)) as Region['signal'];
      }
    }
    return { ...r, signal: maxSignal as Region['signal'] };
  });

  function addLog(entry: OpsLogEntry) {
    setOpsLog(prev => [entry, ...prev]);
  }

  return (
    <div className="app-layout">
      <div className="sidebar">
        <Sidebar active={activeModule} onChange={setActiveModule} />
      </div>

      <div className="riskboard">
        <RiskBoard regions={regions} dataSource={dataSource} loading={loading} />
      </div>

      <div className="main-content">
        {activeModule === 'disaster' && (
          <DisasterRelief
            warehouses={WAREHOUSES}
            alerts={alerts}
            regions={regions}
            dataSource={dataSource}
            loading={loading}
            opsLog={opsLog}
            onAddLog={addLog}
          />
        )}
        {activeModule === 'budget' && (
          <Budget categories={BUDGET_CATEGORIES} />
        )}
        {activeModule === 'staffing' && (
          <Staffing staff={STAFF_MEMBERS} warehouses={WAREHOUSES} />
        )}
        {activeModule === 'inventory' && (
          <Inventory warehouses={WAREHOUSES} />
        )}
      </div>
    </div>
  );
}
