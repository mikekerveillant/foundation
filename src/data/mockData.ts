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

export const MOCK_EARTHQUAKE: ActiveAlert = {
  id: 'alert-002',
  name: 'M6.7 Earthquake — Eastern Samar',
  type: 'earthquake',
  signalNumber: 0,
  affectedRegionIds: ['VIII', 'XIII'],
  affectedProvinces: ['Eastern Samar', 'Leyte', 'Northern Samar', 'Biliran'],
  coordinates: { lat: 11.85, lng: 125.72 },
  track: [],
  intensity: 'PHIVOLCS Intensity VII — Destructive',
  lastUpdated: '2024-10-24T01:22:00',
  occurredAt: '2024-10-24T01:15:00',
  source: 'mock',
  magnitude: 6.7,
  depth: 12,
  phivolcsIntensity: 'VII',
};

export const MOCK_VOLCANO: ActiveAlert = {
  id: 'alert-003',
  name: 'Mayon Volcano — Alert Level 3',
  type: 'volcanic',
  signalNumber: 0,
  affectedRegionIds: ['V'],
  affectedProvinces: ['Albay', 'Camarines Sur'],
  coordinates: { lat: 13.2575, lng: 123.6855 },
  track: [],
  intensity: 'Explosive / Effusive · eruption ongoing since 2026 Jan 6',
  lastUpdated: '2024-10-24T00:00:00',
  source: 'mock',
  volcanoName: 'Mayon Volcano',
  volcanoAlertLevel: 3,
  dangerZoneKm: 6,
};

export const MOCK_KANLAON: ActiveAlert = {
  id: 'alert-004',
  name: 'Kanlaon Volcano — Alert Level 3',
  type: 'volcanic',
  signalNumber: 0,
  affectedRegionIds: ['VI'],
  affectedProvinces: ['Negros Occidental', 'Negros Oriental'],
  coordinates: { lat: 10.4120, lng: 123.1320 },
  track: [],
  intensity: 'Explosive / Effusive · eruption ongoing since 2024 Oct 19',
  lastUpdated: '2024-10-24T00:00:00',
  source: 'mock',
  volcanoName: 'Kanlaon Volcano',
  volcanoAlertLevel: 3,
  dangerZoneKm: 4,
};

export const MOCK_TAAL: ActiveAlert = {
  id: 'alert-005',
  name: 'Taal Volcano — Alert Level 3',
  type: 'volcanic',
  signalNumber: 0,
  affectedRegionIds: ['IVA'],
  affectedProvinces: ['Batangas', 'Cavite'],
  coordinates: { lat: 14.0023, lng: 120.9900 },
  track: [],
  intensity: 'Explosive / Effusive · eruption ongoing since 2024 Apr 12',
  lastUpdated: '2024-10-24T00:00:00',
  source: 'mock',
  volcanoName: 'Taal Volcano',
  volcanoAlertLevel: 3,
  dangerZoneKm: 14,
};

export const ALL_MOCK_ALERTS: ActiveAlert[] = [MOCK_ALERT, MOCK_EARTHQUAKE, MOCK_VOLCANO];

export const INITIAL_OPS_LOG: OpsLogEntry[] = [
  {
    id: 'log-000a',
    timestamp: '2024-10-24T01:15:00',
    type: 'signal_raised',
    message: 'PHIVOLCS: M6.7 earthquake recorded off Eastern Samar coast. Depth 12 km. Intensity VII in Leyte/Samar. Tsunami watch issued.',
    level: 'critical',
    regionId: 'VIII',
  },
  {
    id: 'log-000b',
    timestamp: '2024-10-24T01:00:00',
    type: 'signal_raised',
    message: 'PHIVOLCS raises Mayon Volcano Alert Level to 3. Lava effusion and increased seismic activity. 6 km Permanent Danger Zone enforced.',
    level: 'critical',
    regionId: 'V',
  },
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

// Monthly spend multipliers (relative to equal monthly budget share).
// Shape reflects Philippine disaster calendar: quiet Jan–May, ramp Jun–Aug,
// surge Sep–Oct (typhoon season peak + Typhoon Kristine + earthquake response).
const makeMonthly = (annualBudget: number, multipliers: number[]): import('../types').BudgetMonthly[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyBudget = annualBudget / 12;
  let cumBudget = 0;
  let cumSpent = 0;
  return months.map((month, i) => {
    const b = monthlyBudget;
    const s = i < 10 ? Math.round(monthlyBudget * multipliers[i]) : 0;
    cumBudget += b;
    cumSpent += s;
    return { month, budget: Math.round(b), spent: s, cumBudget: Math.round(cumBudget), cumSpent: Math.round(cumSpent) };
  });
};

// Disaster Relief: spikes in Aug (Habagat floods), big surge Oct (Typhoon Kristine + M6.7 quake)
const disasterMultipliers = [0.45, 0.38, 0.42, 0.55, 0.68, 0.80, 0.95, 1.40, 1.15, 3.38, 0, 0];
// Community Programs: modest ramp, elevated Oct for post-disaster support
const programsMultipliers = [0.70, 0.65, 0.72, 0.75, 0.78, 0.82, 0.85, 1.05, 0.92, 1.34, 0, 0];
// Staffing & HR: mostly stable salaries, overtime spikes in Aug/Oct
const staffingMultipliers = [0.82, 0.80, 0.82, 0.84, 0.85, 0.88, 0.90, 0.95, 0.92, 1.06, 0, 0];
// Operations & Logistics: follows disaster curve closely (fuel, transport, warehousing)
const operationsMultipliers = [0.55, 0.50, 0.58, 0.65, 0.72, 0.85, 0.95, 1.35, 1.15, 2.49, 0, 0];

const disasterMonthly = makeMonthly(17_500_000, disasterMultipliers);
const programsMonthly = makeMonthly(12_500_000, programsMultipliers);
const staffingMonthly = makeMonthly(12_500_000, staffingMultipliers);
const operationsMonthly = makeMonthly(7_500_000, operationsMultipliers);

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: 'disaster',
    name: 'Disaster Relief',
    color: '#E8901C',
    annualBudget: 17_500_000,
    spent: disasterMonthly.reduce((a, m) => a + m.spent, 0),
    monthly: disasterMonthly,
  },
  {
    id: 'programs',
    name: 'Community Programs',
    color: '#3E8FB0',
    annualBudget: 12_500_000,
    spent: programsMonthly.reduce((a, m) => a + m.spent, 0),
    monthly: programsMonthly,
  },
  {
    id: 'staffing',
    name: 'Staffing & HR',
    color: '#6B8F71',
    annualBudget: 12_500_000,
    spent: staffingMonthly.reduce((a, m) => a + m.spent, 0),
    monthly: staffingMonthly,
  },
  {
    id: 'operations',
    name: 'Operations & Logistics',
    color: '#8A9BB0',
    annualBudget: 7_500_000,
    spent: operationsMonthly.reduce((a, m) => a + m.spent, 0),
    monthly: operationsMonthly,
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
