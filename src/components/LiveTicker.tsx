import { Siren, Construction, CarFront, AlertTriangle, ParkingSquare, Activity } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export function LiveTicker() {
  const { zones, incidents, emergencies } = useApp();

  const critical = zones.filter((z) => z.congestion === 'Critical').length;
  const activeIncidents = incidents.filter((i) => i.status === 'Active').length;
  const items = [
    { icon: <Activity size={14} />, text: `${zones.length} zones live · ${critical} critical` },
    { icon: <CarFront size={14} />, text: `${zones.reduce((a, z) => a + z.vehicles, 0).toLocaleString()} vehicles tracked` },
    { icon: <AlertTriangle size={14} />, text: `${activeIncidents} active incidents` },
    { icon: <Siren size={14} />, text: `${emergencies.length} emergency vehicles in transit` },
    { icon: <Construction size={14} />, text: 'Road repair scheduled: Anna Salai' },
    { icon: <ParkingSquare size={14} />, text: 'Parking available: Phoenix Mall — 84 slots' },
  ];

  return (
    <div className="border-b border-cyan-400/10 bg-slate-950/40 overflow-hidden">
      <div className="ticker-track py-2">
        {[...items, ...items].map((it, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs text-slate-400 px-6">
            <span className="text-cyan-400">{it.icon}</span>
            {it.text}
            <span className="text-slate-700 ml-4">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
