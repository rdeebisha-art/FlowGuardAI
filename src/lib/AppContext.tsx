import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import * as sim from './simulation';
import { Lang } from './i18n';
import { dicts } from './i18n';

export type PageId =
  | 'home' | 'monitor' | 'prediction' | 'signals' | 'emergency'
  | 'accident' | 'sound' | 'road' | 'violation' | 'parking'
  | 'transport' | 'citizen' | 'flowbot' | 'eco' | 'admin' | 'simulation';

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  page: PageId;
  setPage: (p: PageId) => void;

  zones: sim.Zone[];
  signals: sim.SignalIntersection[];
  emergencies: sim.EmergencyVehicle[];
  incidents: sim.Incident[];
  soundEvents: ReturnType<typeof sim.generateSoundEvents>;
  roadDamages: sim.RoadDamage[];
  violations: sim.Violation[];
  parkingLots: sim.ParkingLot[];
  buses: sim.Bus[];
  citizenReports: sim.CitizenReport[];
  notifications: AppNotification[];
  refresh: () => void;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  level: 'info' | 'warning' | 'critical';
  time: string;
}

const Ctx = createContext<AppCtx | null>(null);

const makeData = () => ({
  zones: sim.generateZones(),
  signals: sim.generateSignals(),
  emergencies: sim.generateEmergencyVehicles(),
  incidents: sim.generateIncidents(),
  soundEvents: sim.generateSoundEvents(),
  roadDamages: sim.generateRoadDamages(),
  violations: sim.generateViolations(),
  parkingLots: sim.generateParkingLots(),
  buses: sim.generateBuses(),
  citizenReports: sim.generateCitizenReports(),
});

const initialNotifications: AppNotification[] = [
  { id: 'N1', title: 'AI Prediction', message: 'Congestion spike predicted on Anna Salai in 25 minutes.', level: 'warning', time: '2m ago' },
  { id: 'N2', title: 'Emergency Corridor', message: 'Ambulance EV01 green corridor activated — ETA 7 min.', level: 'critical', time: '5m ago' },
  { id: 'N3', title: 'Accident Detection', message: 'Minor collision detected at T Nagar Road.', level: 'warning', time: '11m ago' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const [page, setPage] = useState<PageId>('home');
  const [data, setData] = useState(makeData);
  const [notifications, setNotifications] = useState(initialNotifications);

  const t = useCallback((key: string) => dicts[lang][key] ?? dicts.en[key] ?? key, [lang]);

  const refresh = useCallback(() => {
    setData(makeData());
    const alerts: Omit<AppNotification, 'id' | 'time'>[] = [
      { title: 'Signal Optimization', message: 'AI recomputed timings across 12 intersections.', level: 'info' },
      { title: 'Sound Detection', message: 'Horn explosion flagged at Egmore Junction.', level: 'warning' },
      { title: 'Citizen Report', message: 'New pothole reported on Velachery Main Road.', level: 'info' },
    ];
    const a = alerts[Math.floor(Math.random() * alerts.length)];
    setNotifications((prev) => [
      { ...a, id: `N${Date.now()}`, time: 'just now' },
      ...prev.slice(0, 7),
    ]);
  }, []);

  // Live tick — update zone densities slightly every 4s
  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => ({
        ...d,
        zones: d.zones.map((z) => {
          const nd = Math.max(8, Math.min(99, z.density + Math.round((Math.random() - 0.5) * 10)));
          return {
            ...z,
            density: nd,
            vehicles: Math.round(nd * 12),
            avgSpeed: Math.max(8, Math.round(60 - nd * 0.5)),
            congestion: sim.congestionFromDensity(nd),
          };
        }),
        signals: d.signals.map((s) => ({
          ...s,
          greenTimer: Math.max(0, s.greenTimer - 1) === 0 ? Math.round(20 + Math.random() * 40) : Math.max(0, s.greenTimer - 1),
          waitingVehicles: Math.max(0, s.waitingVehicles + Math.round((Math.random() - 0.5) * 12)),
        })),
        emergencies: d.emergencies.map((e) => ({
          ...e,
          eta: Math.max(1, e.eta - (Math.random() < 0.3 ? 1 : 0)),
          speed: Math.round(40 + Math.random() * 50),
        })),
        buses: d.buses.map((b) => ({
          ...b,
          eta: Math.max(0, b.eta - (Math.random() < 0.2 ? 1 : 0)),
          passengers: Math.max(0, Math.min(b.capacity, b.passengers + Math.round((Math.random() - 0.5) * 8))),
        })),
      }));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const value: AppCtx = {
    lang, setLang, t, page, setPage,
    notifications,
    ...data,
    refresh,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp must be used within AppProvider');
  return c;
}
