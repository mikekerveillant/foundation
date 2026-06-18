export type SignalNumber = 0 | 1 | 2 | 3 | 4 | 5;
export type AlertLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type Module = 'disaster' | 'budget' | 'staffing' | 'inventory';

export interface Region {
  id: string;
  name: string;
  fullName: string;
  signal: SignalNumber;
}

export interface InventoryCategory {
  qty: number;
  unit: string;
  threshold: number;
}

export interface InventorySnapshot {
  water: InventoryCategory;
  food: InventoryCategory;
  medical: InventoryCategory;
  shelter: InventoryCategory;
  rescue: InventoryCategory;
}

export interface Warehouse {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  province: string;
  region: string;
  regionId: string;
  inventory: InventorySnapshot;
  islandGroup: 'Luzon' | 'Visayas' | 'Mindanao';
}

export interface TyphoonTrackPoint {
  lat: number;
  lng: number;
  time: string;
  intensity: string;
}

export interface ActiveAlert {
  id: string;
  name: string;
  type: 'typhoon' | 'tropical_storm' | 'tropical_depression' | 'earthquake' | 'flood';
  signalNumber: SignalNumber;
  affectedRegionIds: string[];
  affectedProvinces: string[];
  coordinates: { lat: number; lng: number };
  track: TyphoonTrackPoint[];
  intensity: string;
  lastUpdated: string;
  source: 'live' | 'mock';
  gdacsAlertLevel?: 'Green' | 'Orange' | 'Red';
}

export interface OpsLogEntry {
  id: string;
  timestamp: string;
  type: 'signal_raised' | 'deployment_recommended' | 'shipment_dispatched' | 'signal_lowered' | 'staff_deployed' | 'warehouse_update' | 'system';
  message: string;
  level: AlertLevel;
  warehouseId?: string;
  regionId?: string;
}

export interface BudgetMonthly {
  month: string;
  budget: number;
  spent: number;
  cumBudget: number;
  cumSpent: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  color: string;
  annualBudget: number;
  spent: number;
  monthly: BudgetMonthly[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  region: string;
  regionId: string;
  province: string;
  available: boolean;
  currentAssignment?: string;
  skills: string[];
  nearestWarehouseId?: string;
}

export interface DeploymentState {
  warehouseId: string;
  targetRegion: string;
  status: 'pending' | 'deploying' | 'delivered';
  items: { category: string; qty: number; unit: string }[];
  dispatchedAt?: string;
}
