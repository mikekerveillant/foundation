import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import RiskBoard from './components/layout/RiskBoard';
import DisasterRelief from './components/disaster/DisasterRelief';
import Budget from './components/budget/Budget';
import Staffing from './components/staffing/Staffing';
import Inventory from './components/inventory/Inventory';
import { useGDACS } from './hooks/useGDACS';
import { REGIONS, WAREHOUSES, BUDGET_CATEGORIES, STAFF_MEMBERS, INITIAL_OPS_LOG } from './data/mockData';
import type { Module, OpsLogEntry, Region } from './types';

export default function App() {
  const [activeModule, setActiveModule] = useState<Module>('disaster');
  const [opsLog, setOpsLog] = useState<OpsLogEntry[]>(INITIAL_OPS_LOG);
  const { alert, dataSource, loading } = useGDACS();

  const regions: Region[] = REGIONS.map(r => {
    if (alert && alert.affectedRegionIds.includes(r.id)) {
      return { ...r, signal: Math.max(r.signal, alert.signalNumber) as Region['signal'] };
    }
    return r;
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
            alert={alert}
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
