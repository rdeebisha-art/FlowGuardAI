// Simulation engine — generates realistic live city traffic data.
// All data is simulated in-memory; no backend required.

export type Congestion = 'Low' | 'Medium' | 'High' | 'Critical';
export type Severity = 'Minor' | 'Moderate' | 'Critical';

export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  density: number; // 0-100
  vehicles: number;
  avgSpeed: number; // km/h
  congestion: Congestion;
  roads: number;
  incidents: number;
}

export interface SignalIntersection {
  id: string;
  name: string;
  lat: number;
  lng: number;
  phase: 'NS' | 'EW';
  greenTimer: number;
  redTimer: number;
  waitingVehicles: number;
  aiRecommendedGreen: number;
  hasEmergency: boolean;
  pedestrian: boolean;
}

export interface EmergencyVehicle {
  id: string;
  type: 'Ambulance' | 'Fire Truck' | 'Police';
  location: string;
  lat: number;
  lng: number;
  destination: string;
  eta: number; // minutes
  speed: number;
  corridorActive: boolean;
}

export interface Incident {
  id: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  severity: Severity;
  time: string;
  status: 'Active' | 'Responding' | 'Cleared';
  detectedBy: 'Computer Vision' | 'Audio Sensor' | 'Citizen Report' | 'IoT Sensor';
}

export interface RoadDamage {
  id: string;
  type: 'Pothole' | 'Broken Road' | 'Waterlogging' | 'Obstacle' | 'Damaged Sign';
  location: string;
  lat: number;
  lng: number;
  severity: Severity;
  reportedAt: string;
  repairPriority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Reported' | 'Scheduled' | 'In Repair' | 'Completed';
}

export interface Violation {
  id: string;
  type: 'Red Light' | 'No Helmet' | 'Wrong Side' | 'Illegal Parking' | 'Overloading';
  vehicleId: string;
  location: string;
  time: string;
  fine: number;
}

export interface ParkingLot {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  totalSlots: number;
  occupied: number;
  pricePerHour: number;
}

export interface Bus {
  id: string;
  route: string;
  location: string;
  lat: number;
  lng: number;
  passengers: number;
  capacity: number;
  eta: number;
  delay: number;
  status: 'On Time' | 'Delayed' | 'Early';
}

export interface CitizenReport {
  id: string;
  category: 'Traffic Jam' | 'Accident' | 'Road Damage' | 'Illegal Parking' | 'Broken Signal';
  location: string;
  description: string;
  reportedAt: string;
  status: 'Submitted' | 'Under Review' | 'Resolved';
  upvotes: number;
}

export const congestionFromDensity = (d: number): Congestion =>
  d < 30 ? 'Low' : d < 60 ? 'Medium' : d < 85 ? 'High' : 'Critical';

export const severityColor = (s: Severity) =>
  s === 'Minor' ? 'emerald' : s === 'Moderate' ? 'amber' : 'rose';

export const congestionColor = (c: Congestion) =>
  c === 'Low' ? 'emerald' : c === 'Medium' ? 'amber' : c === 'High' ? 'orange' : 'rose';

const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const ZONE_NAMES = [
  'Anna Nagar', 'T Nagar', 'Marina Beach', 'Guindy', 'Velachery',
  'Adyar', 'Mylapore', 'Egmore', 'Porur', 'Sholinganallur',
  'Tambaram', 'Ambattur', 'Kodambakkam', 'Vadapalani', 'Royapettah',
];

const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 };

export const generateZones = (): Zone[] =>
  ZONE_NAMES.map((name, i) => {
    const density = Math.round(rnd(15, 95));
    return {
      id: `Z${String(i + 1).padStart(2, '0')}`,
      name,
      lat: CHENNAI_CENTER.lat + rnd(-0.08, 0.08),
      lng: CHENNAI_CENTER.lng + rnd(-0.08, 0.08),
      density,
      vehicles: Math.round(density * rnd(8, 14)),
      avgSpeed: Math.round(60 - density * 0.5),
      congestion: congestionFromDensity(density),
      roads: Math.round(rnd(12, 40)),
      incidents: Math.round(rnd(0, 3)),
    };
  });

export const generateSignals = (): SignalIntersection[] => {
  const names = [
    'Anna Salai Signal', 'Gemini Flyover', 'Tidel Park Junction', 'Saidapet Signal',
    'Poonamallee High Rd', 'Marina Signal', 'Egmore Junction', 'Porur Junction',
    'Velachery Main', 'Sholinganallur Jn', 'Tambaram Signal', 'Adyar Signal',
  ];
  return names.map((name, i) => {
    const waiting = Math.round(rnd(5, 80));
    const phase: 'NS' | 'EW' = i % 2 === 0 ? 'NS' : 'EW';
    const greenTimer = Math.round(rnd(15, 60));
    return {
      id: `S${String(i + 1).padStart(2, '0')}`,
      name,
      lat: CHENNAI_CENTER.lat + rnd(-0.07, 0.07),
      lng: CHENNAI_CENTER.lng + rnd(-0.07, 0.07),
      phase,
      greenTimer,
      redTimer: Math.round(rnd(20, 70)),
      waitingVehicles: waiting,
      aiRecommendedGreen: Math.max(15, Math.min(70, Math.round(waiting * 0.7))),
      hasEmergency: Math.random() < 0.12,
      pedestrian: Math.random() < 0.3,
    };
  });
};

export const generateEmergencyVehicles = (): EmergencyVehicle[] => {
  const types: EmergencyVehicle['type'][] = ['Ambulance', 'Fire Truck', 'Police'];
  const dests = ['Apollo Hospital', 'Govt General Hospital', 'KMC Hospital', 'Fire Station 4', 'Central Station'];
  return Array.from({ length: 3 }, (_, i) => ({
    id: `EV${String(i + 1).padStart(2, '0')}`,
    type: pick(types),
    location: pick(ZONE_NAMES),
    lat: CHENNAI_CENTER.lat + rnd(-0.06, 0.06),
    lng: CHENNAI_CENTER.lng + rnd(-0.06, 0.06),
    destination: pick(dests),
    eta: Math.round(rnd(3, 18)),
    speed: Math.round(rnd(40, 90)),
    corridorActive: Math.random() < 0.6,
  }));
};

export const generateIncidents = (count = 6): Incident[] => {
  const types = ['Vehicle Collision', 'Sudden Stop', 'Road Accident', 'Abnormal Movement'];
  const detectors: Incident['detectedBy'][] = ['Computer Vision', 'Audio Sensor', 'IoT Sensor', 'Citizen Report'];
  const severities: Severity[] = ['Minor', 'Moderate', 'Critical'];
  const statuses: Incident['status'][] = ['Active', 'Responding', 'Cleared'];
  return Array.from({ length: count }, (_, i) => ({
    id: `INC${String(i + 1).padStart(3, '0')}`,
    type: pick(types),
    location: pick(ZONE_NAMES) + ' Road',
    lat: CHENNAI_CENTER.lat + rnd(-0.07, 0.07),
    lng: CHENNAI_CENTER.lng + rnd(-0.07, 0.07),
    severity: pick(severities),
    time: `${String(Math.round(rnd(0, 23))).padStart(2, '0')}:${String(Math.round(rnd(0, 59))).padStart(2, '0')}`,
    status: pick(statuses),
    detectedBy: pick(detectors),
  }));
};

export const generateSoundEvents = () => {
  const types = ['Crash Sound', 'Horn Explosion', 'Screaming', 'Glass Breaking', 'Siren Detected', 'Heavy Traffic Noise'];
  return types.map((t, i) => ({
    id: `SND${String(i + 1).padStart(3, '0')}`,
    type: t,
    location: pick(ZONE_NAMES) + ' Road',
    riskLevel: pick(['Low', 'Medium', 'High', 'Critical'] as const),
    confidence: Math.round(rnd(60, 99)),
    time: `${String(Math.round(rnd(0, 23))).padStart(2, '0')}:${String(Math.round(rnd(0, 59))).padStart(2, '0')}`,
  }));
};

export const generateRoadDamages = (): RoadDamage[] => {
  const types: RoadDamage['type'][] = ['Pothole', 'Broken Road', 'Waterlogging', 'Obstacle', 'Damaged Sign'];
  const severities: Severity[] = ['Minor', 'Moderate', 'Critical'];
  const priorities: RoadDamage['repairPriority'][] = ['Low', 'Medium', 'High', 'Urgent'];
  const statuses: RoadDamage['status'][] = ['Reported', 'Scheduled', 'In Repair', 'Completed'];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `RD${String(i + 1).padStart(3, '0')}`,
    type: pick(types),
    location: pick(ZONE_NAMES) + ' Road',
    lat: CHENNAI_CENTER.lat + rnd(-0.07, 0.07),
    lng: CHENNAI_CENTER.lng + rnd(-0.07, 0.07),
    severity: pick(severities),
    reportedAt: `2026-07-${String(Math.round(rnd(10, 31))).padStart(2, '0')}`,
    repairPriority: pick(priorities),
    status: pick(statuses),
  }));
};

export const generateViolations = (count = 8): Violation[] => {
  const types: Violation['type'][] = ['Red Light', 'No Helmet', 'Wrong Side', 'Illegal Parking', 'Overloading'];
  return Array.from({ length: count }, (_, i) => ({
    id: `V${String(i + 1).padStart(3, '0')}`,
    type: pick(types),
    vehicleId: `TN ${String(Math.round(rnd(1, 99))).padStart(2, '0')} ${String.fromCharCode(65 + Math.round(rnd(0, 25)))}${String.fromCharCode(65 + Math.round(rnd(0, 25)))} ${String(Math.round(rnd(1000, 9999)))}`,
    location: pick(ZONE_NAMES) + ' Road',
    time: `${String(Math.round(rnd(0, 23))).padStart(2, '0')}:${String(Math.round(rnd(0, 59))).padStart(2, '0')}`,
    fine: pick([100, 200, 250, 500, 1000, 1500]),
  }));
};

export const generateParkingLots = (): ParkingLot[] => {
  const names = ['Express Avenue Mall', 'Phoenix Mall', 'Citi Center', 'Marina Parking', 'Central Station Lot', 'Tidel Park Garage', 'Forum Mall', 'SPI Cinemas'];
  return names.map((name, i) => {
    const total = Math.round(rnd(80, 400));
    const occupied = Math.round(rnd(20, total - 10));
    return {
      id: `P${String(i + 1).padStart(2, '0')}`,
      name,
      location: pick(ZONE_NAMES),
      lat: CHENNAI_CENTER.lat + rnd(-0.06, 0.06),
      lng: CHENNAI_CENTER.lng + rnd(-0.06, 0.06),
      totalSlots: total,
      occupied,
      pricePerHour: pick([20, 30, 40, 50, 60]),
    };
  });
};

export const generateBuses = (): Bus[] => {
  const routes = ['Route 1: T Nagar → Airport', 'Route 5: CMBT → Tambaram', 'Route 21: Broadway → Sholinganallur', 'Route 27: Anna Nagar → Guindy', 'Route 18: Velachery → Marina', 'Route 7: Porur → Egmore'];
  const statuses: Bus['status'][] = ['On Time', 'Delayed', 'Early'];
  return routes.map((route, i) => {
    const capacity = 60;
    const passengers = Math.round(rnd(15, capacity));
    return {
      id: `BUS${String(i + 1).padStart(3, '0')}`,
      route,
      location: pick(ZONE_NAMES),
      lat: CHENNAI_CENTER.lat + rnd(-0.06, 0.06),
      lng: CHENNAI_CENTER.lng + rnd(-0.06, 0.06),
      passengers,
      capacity,
      eta: Math.round(rnd(1, 25)),
      delay: Math.round(rnd(-3, 12)),
      status: pick(statuses),
    };
  });
};

export const generateCitizenReports = (): CitizenReport[] => {
  const categories: CitizenReport['category'][] = ['Traffic Jam', 'Accident', 'Road Damage', 'Illegal Parking', 'Broken Signal'];
  const statuses: CitizenReport['status'][] = ['Submitted', 'Under Review', 'Resolved'];
  const descriptions = [
    'Heavy jam near signal, no police present.',
    'Two-wheeler hit by car, need ambulance.',
    'Large pothole causing accidents.',
    'Car parked blocking ambulance lane.',
    'Signal not working since morning.',
  ];
  return Array.from({ length: 7 }, (_, i) => ({
    id: `CR${String(i + 1).padStart(3, '0')}`,
    category: pick(categories),
    location: pick(ZONE_NAMES),
    description: pick(descriptions),
    reportedAt: `2026-07-${String(Math.round(rnd(20, 31))).padStart(2, '0')} ${String(Math.round(rnd(0, 23))).padStart(2, '0')}:${String(Math.round(rnd(0, 59))).padStart(2, '0')}`,
    status: pick(statuses),
    upvotes: Math.round(rnd(1, 80)),
  }));
};

// Hourly traffic pattern data (24h) — simulated with morning + evening peaks
export const hourlyTrafficData = Array.from({ length: 24 }, (_, h) => {
  const morningPeak = Math.exp(-Math.pow(h - 9, 2) / 8) * 80;
  const eveningPeak = Math.exp(-Math.pow(h - 18.5, 2) / 10) * 95;
  const base = 20;
  const noise = rnd(-8, 8);
  const density = Math.max(8, Math.min(100, Math.round(base + morningPeak + eveningPeak + noise)));
  return {
    hour: `${String(h).padStart(2, '0')}:00`,
    density,
    vehicles: density * 12 + Math.round(rnd(-40, 40)),
    speed: Math.max(8, Math.round(60 - density * 0.45)),
    accidents: Math.max(0, Math.round(density / 25 + rnd(-1, 2))),
  };
});

export const weeklyCongestionTrend = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
  day,
  avgCongestion: Math.round(rnd(45, 80)),
  peakCongestion: Math.round(rnd(70, 99)),
  incidents: Math.round(rnd(3, 18)),
}));

export const signalComparisonData = [
  { metric: 'Avg Wait Time (s)', normal: 95, ai: 42 },
  { metric: 'Fuel Used (L)', normal: 280, ai: 145 },
  { metric: 'Congestion Index', normal: 78, ai: 41 },
  { metric: 'Throughput (veh)', normal: 520, ai: 880 },
];

// AI prediction — next 60 min
export const predictionData = Array.from({ length: 12 }, (_, i) => ({
  time: `+${(i + 1) * 5}m`,
  predicted: Math.max(10, Math.min(98, Math.round(55 + Math.sin(i / 2) * 18 + rnd(-6, 6)))),
  confidence: Math.round(rnd(82, 96)),
}));

export const fuelEcoData = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  fuelSaved: Math.round(rnd(40, 220)),
  co2Reduced: Math.round(rnd(15, 90)),
  timeSaved: Math.round(rnd(120, 900)),
}));
