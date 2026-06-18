import type { Region, Warehouse, ActiveAlert, OpsLogEntry, BudgetCategory, StaffMember } from '../types';

export const REGIONS: Region[] = [
  { id: 'NCR', name: 'NCR', fullName: 'National Capital Region', signal: 0 },
  { id: 'CAR', name: 'CAR', fullName: 'Cordillera Administrative Region', signal: 1 },
  { id: 'I', name: 'Region I', fullName: 'Ilocos Region', signal: 0 },
  { id: 'II', name: 'Region II', fullName: 'Cagayan Valley', signal: 3 },
  { id: 'III', name: 'Region III', fullName: 'Central Luzon', signal: 2 },
  { id: 'IVA', name: 'CALABARZON', fullName: 'Region IV-A CALABARZON', signal: 2 },
  { id: 'IVB', name: 'MIMAROPA', fullName: 'Region IV-B MIMAROPA', signal: 1 },
  { id: 'V', name: 'Bicol', fullName: 'Bicol Region', signal: 4 },
  { id: 'VI', name: 'W. Visayas', fullName: 'Western Visayas', signal: 2 },
  { id: 'VII', name: 'C. Visayas', fullName: 'Central Visayas', signal: 1 },
  { id: 'VIII', name: 'E. Visayas', fullName: 'Eastern Visayas', signal: 3 },
  { id: 'IX', name: 'Zamboanga', fullName: 'Zamboanga Peninsula', signal: 0 },
  { id: 'X', name: 'N. Mindanao', fullName: 'Northern Mindanao', signal: 0 },
  { id: 'XI', name: 'Davao', fullName: 'Davao Region', signal: 0 },
  { id: 'XII', name: 'SOCCSKSARGEN', fullName: 'SOCCSKSARGEN', signal: 0 },
  { id: 'XIII', name: 'Caraga', fullName: 'Caraga', signal: 1 },
  { id: 'BARMM', name: 'BARMM', fullName: 'Bangsamoro Autonomous Region', signal: 0 },
];

export const WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-001',
    name: 'Leyte Distribution Center',
    location: { lat: 11.2543, lng: 125.0037 },
    province: 'Leyte',
    region: 'Eastern Visayas',
    regionId: 'VIII',
    islandGroup: 'Visayas',
    inventory: {
      water: { qty: 12400, unit: 'liters', threshold: 5000 },
      food: { qty: 3800, unit: 'packs', threshold: 2000 },
      medical: { qty: 420, unit: 'kits', threshold: 150 },
      shelter: { qty: 680, unit: 'kits', threshold: 200 },
      rescue: { qty: 28, unit: 'units', threshold: 10 },
    },
  },
  {
    id: 'wh-002',
    name: 'Albay Relief Hub',
    location: { lat: 13.1553, lng: 123.735 },
    province: 'Albay',
    region: 'Bicol Region',
    regionId: 'V',
    islandGroup: 'Luzon',
    inventory: {
      water: { qty: 9200, unit: 'liters', threshold: 5000 },
      food: { qty: 2100, unit: 'packs', threshold: 2000 },
      medical: { qty: 310, unit: 'kits', threshold: 150 },
      shelter: { qty: 890, unit: 'kits', threshold: 200 },
      rescue: { qty: 45, unit: 'units', threshold: 10 },
    },
  },
  {
    id: 'wh-003',
    name: 'Cagayan Logistics Base',
    location: { lat: 18.3548, lng: 121.7767 },
    province: 'Cagayan',
    region: 'Cagayan Valley',
    regionId: 'II',
    islandGroup: 'Luzon',
    inventory: {
      water: { qty: 7600, unit: 'liters', threshold: 5000 },
      food: { qty: 4200, unit: 'packs', threshold: 2000 },
      medical: { qty: 180, unit: 'kits', threshold: 150 },
      shelter: { qty: 340, unit: 'kits', threshold: 200 },
      rescue: { qty: 19, unit: 'units', threshold: 10 },
    },
  },
  {
    id: 'wh-004',
    name: 'Iloilo Response Center',
    location: { lat: 10.7202, lng: 122.5621 },
    province: 'Iloilo',
    region: 'Western Visayas',
    regionId: 'VI',
    islandGroup: 'Visayas',
    inventory: {
      water: { qty: 15800, unit: 'liters', threshold: 5000 },
      food: { qty: 5600, unit: 'packs', threshold: 2000 },
      medical: { qty: 560, unit: 'kits', threshold: 150 },
      shelter: { qty: 1100, unit: 'kits', threshold: 200 },
      rescue: { qty: 62, unit: 'units', threshold: 10 },
    },
  },
  {
    id: 'wh-005',
    name: 'Davao Southern Hub',
    location: { lat: 7.1907, lng: 125.4553 },
    province: 'Davao del Sur',
    region: 'Davao Region',
    regionId: 'XI',
    islandGroup: 'Mindanao',
    inventory: {
      water: { qty: 22000, unit: 'liters', threshold: 5000 },
      food: { qty: 7800, unit: 'packs', threshold: 2000 },
      medical: { qty: 720, unit: 'kits', threshold: 150 },
      shelter: { qty: 1450, unit: 'kits', threshold: 200 },
      rescue: { qty: 84, unit: 'units', threshold: 10 },
    },
  },
  {
    id: 'wh-006',
    name: 'NCR Operations Center',
    location: { lat: 14.5995, lng: 120.9842 },
    province: 'Metro Manila',
    region: 'National Capital Region',
    regionId: 'NCR',
    islandGroup: 'Luzon',
    inventory: {
      water: { qty: 31000, unit: 'liters', threshold: 5000 },
      food: { qty: 9400, unit: 'packs', threshold: 2000 },
      medical: { qty: 940, unit: 'kits', threshold: 150 },
      shelter: { qty: 2200, unit: 'kits', threshold: 200 },
      rescue: { qty: 110, unit: 'units', threshold: 10 },
    },
  },
];

export const MOCK_ALERT: ActiveAlert = {
  id: 'alert-001',
  name: 'Typhoon Kristine (Trami)',
  type: 'typhoon',
  signalNumber: 4,
  affectedRegionIds: ['II', 'III', 'IVA', 'V', 'VI', 'VIII', 'CAR'],
  affectedProvinces: ['Albay', 'Camarines Sur', 'Camarines Norte', 'Catanduanes', 'Cagayan', 'Isabela', 'Leyte', 'Samar', 'Iloilo', 'Quezon'],
  coordinates: { lat: 14.2, lng: 124.8 },
  track: [
    { lat: 10.5, lng: 130.2, time: '2024-10-23T06:00:00', intensity: 'CAT 4' },
    { lat: 11.8, lng: 128.5, time: '2024-10-23T12:00:00', intensity: 'CAT 4' },
    { lat: 13.0, lng: 126.8, time: '2024-10-23T18:00:00', intensity: 'CAT 4' },
    { lat: 14.2, lng: 124.8, time: '2024-10-24T00:00:00', intensity: 'CAT 4' },
    { lat: 15.4, lng: 122.9, time: '2024-10-24T06:00:00', intensity: 'CAT 3' },
    { lat: 16.8, lng: 121.2, time: '2024-10-24T12:00:00', intensity: 'CAT 2' },
    { lat: 18.2, lng: 120.1, time: '2024-10-24T18:00:00', intensity: 'CAT 1' },
  ],
  intensity: '195 km/h sustained winds',
  lastUpdated: '2024-10-24T00:30:00',
  source: 'mock',
};

export const INITIAL_OPS_LOG: OpsLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '2024-10-24T00:30:00',
    type: 'signal_raised',
    message: 'TCWS Signal No. 4 raised for Bicol Region. Typhoon Kristine intensifying, 195 km/h sustained.',
    level: 'critical',
    regionId: 'V',
  },
  {
    id: 'log-002',
    timestamp: '2024-10-23T22:15:00',
    type: 'deployment_recommended',
    message: 'System recommends pre-positioning from Albay Relief Hub to coastal Bicol provinces. Stock: sufficient.',
    level: 'high',
    warehouseId: 'wh-002',
    regionId: 'V',
  },
  {
    id: 'log-003',
    timestamp: '2024-10-23T20:00:00',
    type: 'signal_raised',
    message: 'TCWS Signal No. 3 raised for Eastern Visayas. Leyte/Samar provinces on high alert.',
    level: 'high',
    regionId: 'VIII',
  },
  {
    id: 'log-004',
    timestamp: '2024-10-23T18:45:00',
    type: 'staff_deployed',
    message: '8 field coordinators mobilized from NCR and Region VI to Bicol staging area.',
    level: 'high',
    regionId: 'V',
  },
  {
    id: 'log-005',
    timestamp: '2024-10-23T16:30:00',
    type: 'shipment_dispatched',
    message: 'Shipment dispatched from Iloilo Response Center → Leyte DC. 800 food packs, 200 shelter kits.',
    level: 'medium',
    warehouseId: 'wh-004',
    regionId: 'VIII',
  },
  {
    id: 'log-006',
    timestamp: '2024-10-23T14:00:00',
    type: 'warehouse_update',
    message: 'Albay Relief Hub stock verified: 9,200 L water, 2,100 food packs ready for deployment.',
    level: 'low',
    warehouseId: 'wh-002',
  },
  {
    id: 'log-007',
    timestamp: '2024-10-23T12:00:00',
    type: 'signal_raised',
    message: 'PAGASA issues TCWS Signal No. 1 for Cagayan, Isabela, Aurora. Typhoon track confirmed.',
    level: 'medium',
    regionId: 'II',
  },
  {
    id: 'log-008',
    timestamp: '2024-10-23T08:00:00',
    type: 'system',
    message: 'System: Typhoon Kristine entered PAR. GDACS alert level Orange. Monitoring activated.',
    level: 'medium',
  },
];

// Deterministic pseudo-random using a simple seed to keep budget data stable across renders
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const makeMonthly = (annualBudget: number, spentFraction: number, variance: number, seed = 1): import('../types').BudgetMonthly[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyBudget = annualBudget / 12;
  let cumBudget = 0;
  let cumSpent = 0;
  return months.map((month, i) => {
    const b = monthlyBudget;
    const s = i < 10 ? monthlyBudget * (spentFraction + (seededRand(seed + i) - 0.5) * variance) : 0;
    cumBudget += b;
    cumSpent += s;
    return { month, budget: Math.round(b), spent: Math.round(s), cumBudget: Math.round(cumBudget), cumSpent: Math.round(cumSpent) };
  });
};

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: 'disaster',
    name: 'Disaster Relief',
    color: '#E8901C',
    annualBudget: 17_500_000,
    spent: 14_820_000,
    monthly: makeMonthly(17_500_000, 1.05, 0.4, 7),
  },
  {
    id: 'programs',
    name: 'Community Programs',
    color: '#3E8FB0',
    annualBudget: 12_500_000,
    spent: 8_940_000,
    monthly: makeMonthly(12_500_000, 0.72, 0.3, 13),
  },
  {
    id: 'staffing',
    name: 'Staffing & HR',
    color: '#6B8F71',
    annualBudget: 12_500_000,
    spent: 9_210_000,
    monthly: makeMonthly(12_500_000, 0.82, 0.15, 19),
  },
  {
    id: 'operations',
    name: 'Operations & Logistics',
    color: '#8A9BB0',
    annualBudget: 7_500_000,
    spent: 6_120_000,
    monthly: makeMonthly(7_500_000, 0.91, 0.25, 31),
  },
];

export const STAFF_MEMBERS: StaffMember[] = [
  { id: 's-001', name: 'Maria Santos', role: 'Field Coordinator', region: 'Bicol Region', regionId: 'V', province: 'Albay', available: false, currentAssignment: 'Typhoon Kristine Response', skills: ['Logistics', 'Community Liaison'], nearestWarehouseId: 'wh-002' },
  { id: 's-002', name: 'Juan dela Cruz', role: 'Logistics Officer', region: 'Eastern Visayas', regionId: 'VIII', province: 'Leyte', available: false, currentAssignment: 'Typhoon Kristine Response', skills: ['Logistics', 'Inventory'], nearestWarehouseId: 'wh-001' },
  { id: 's-003', name: 'Ana Reyes', role: 'Medical Coordinator', region: 'National Capital Region', regionId: 'NCR', province: 'Quezon City', available: true, skills: ['Medical', 'First Aid', 'WASH'], nearestWarehouseId: 'wh-006' },
  { id: 's-004', name: 'Pedro Bautista', role: 'Field Coordinator', region: 'Western Visayas', regionId: 'VI', province: 'Iloilo', available: true, skills: ['Logistics', 'Community Liaison'], nearestWarehouseId: 'wh-004' },
  { id: 's-005', name: 'Luisa Mendoza', role: 'Program Officer', region: 'National Capital Region', regionId: 'NCR', province: 'Makati', available: true, skills: ['Program Management', 'Reporting'], nearestWarehouseId: 'wh-006' },
  { id: 's-006', name: 'Carlo Villanueva', role: 'Logistics Officer', region: 'Cagayan Valley', regionId: 'II', province: 'Cagayan', available: false, currentAssignment: 'Typhoon Kristine Response', skills: ['Logistics', 'Transport'], nearestWarehouseId: 'wh-003' },
  { id: 's-007', name: 'Rosa Fernandez', role: 'Field Coordinator', region: 'Davao Region', regionId: 'XI', province: 'Davao del Sur', available: true, skills: ['Community Liaison', 'WASH'], nearestWarehouseId: 'wh-005' },
  { id: 's-008', name: 'Mark Alonzo', role: 'Medical Staff', region: 'Bicol Region', regionId: 'V', province: 'Camarines Sur', available: false, currentAssignment: 'Typhoon Kristine Response', skills: ['Medical', 'Trauma'], nearestWarehouseId: 'wh-002' },
  { id: 's-009', name: 'Elena Torres', role: 'Finance Officer', region: 'National Capital Region', regionId: 'NCR', province: 'Pasig', available: true, skills: ['Finance', 'Reporting'], nearestWarehouseId: 'wh-006' },
  { id: 's-010', name: 'Jose Ramos', role: 'Logistics Officer', region: 'Western Visayas', regionId: 'VI', province: 'Iloilo', available: true, skills: ['Logistics', 'Inventory', 'Transport'], nearestWarehouseId: 'wh-004' },
  { id: 's-011', name: 'Carmen Lim', role: 'Field Coordinator', region: 'Eastern Visayas', regionId: 'VIII', province: 'Leyte', available: false, currentAssignment: 'Typhoon Kristine Response', skills: ['Community Liaison', 'Evacuation'], nearestWarehouseId: 'wh-001' },
  { id: 's-012', name: 'Ramon Castillo', role: 'Program Officer', region: 'Caraga', regionId: 'XIII', province: 'Agusan del Norte', available: true, skills: ['Program Management', 'WASH'], nearestWarehouseId: 'wh-005' },
  { id: 's-013', name: 'Nena Aquino', role: 'Medical Coordinator', region: 'Cagayan Valley', regionId: 'II', province: 'Isabela', available: false, currentAssignment: 'Typhoon Kristine Response', skills: ['Medical', 'First Aid'], nearestWarehouseId: 'wh-003' },
  { id: 's-014', name: 'Dino Reyes', role: 'Logistics Officer', region: 'Davao Region', regionId: 'XI', province: 'Davao City', available: true, skills: ['Logistics', 'Air Freight'], nearestWarehouseId: 'wh-005' },
  { id: 's-015', name: 'Grace Gomez', role: 'Field Coordinator', region: 'National Capital Region', regionId: 'NCR', province: 'Manila', available: true, skills: ['Community Liaison', 'Shelter'], nearestWarehouseId: 'wh-006' },
];
