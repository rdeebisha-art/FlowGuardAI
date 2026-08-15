import { Siren, Ambulance, Flame, Shield, Navigation, Clock, MapPin, Radio, Bell } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { GlassCard, StatCard, SectionTitle, Badge, LiveDot } from '@/components/ui';
import { CityMap } from '@/components/CityMap';

const typeIcon = (type: string) =>
  type === 'Ambulance' ? <Ambulance size={18} /> : type === 'Fire Truck' ? <Flame size={18} /> : <Shield size={18} />;

export function EmergencyPage() {
  const { emergencies, zones } = useApp();

  const activeCorridors = emergencies.filter((e) => e.corridorActive).length;
  const avgEta = Math.round(emergencies.reduce((a, e) => a + e.eta, 0) / emergencies.length);

  const points = [
    ...emergencies.map((e) => ({
      id: e.id,
      name: `${e.type} ${e.id}`,
      lat: e.lat,
      lng: e.lng,
      tone: 'rose' as const,
      label: `ETA ${e.eta} min · ${e.speed} km/h`,
      radius: 11,
    })),
    ...zones.slice(0, 6).map((z) => ({
      id: z.id, name: z.name, lat: z.lat, lng: z.lng,
      tone: 'blue' as const, label: z.name, radius: 5,
    })),
  ];

  const corridors = emergencies.filter((e) => e.corridorActive).map((e) => ({
    points: [[e.lat, e.lng], [e.lat + 0.02, e.lng + 0.02]] as [number, number][],
    color: '#f43f5e',
  }));

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Emergency Vehicle Green Corridor"
        subtitle="AI auto-detects emergency vehicles and clears signal corridors in real time"
        icon={<Siren size={18} />}
        right={<Badge tone="rose" pulse>{activeCorridors} corridors active</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Vehicles in Transit" value={emergencies.length} icon={<Siren size={18} />} tone="rose" />
        <StatCard label="Active Green Corridors" value={activeCorridors} icon={<Navigation size={18} />} tone="emerald" />
        <StatCard label="Avg ETA" value={avgEta} unit="min" icon={<Clock size={18} />} tone="amber" />
        <StatCard label="Response Time Saved" value={42} unit="%" icon={<Radio size={18} />} tone="cyan" delta="-42%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Live Emergency Tracking</h3>
              <p className="text-xs text-slate-400 mt-0.5">Red routes = active green corridors</p>
            </div>
            <Badge tone="rose"><LiveDot tone="rose" /> tracking</Badge>
          </div>
          <CityMap points={points} routes={corridors} height={400} />
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Active Vehicles</h3>
          <div className="space-y-3">
            {emergencies.map((e) => (
              <div key={e.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${e.corridorActive ? 'bg-rose-500/15 text-rose-400 border border-rose-400/30' : 'bg-slate-700/40 text-slate-400'}`}>
                    {typeIcon(e.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white">{e.type}</div>
                    <div className="text-xs text-slate-400">{e.id} · {e.location}</div>
                  </div>
                  {e.corridorActive && <Badge tone="rose" pulse>Corridor</Badge>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">Speed</div>
                    <div className="text-sm font-bold text-white">{e.speed}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">ETA</div>
                    <div className="text-sm font-bold text-amber-400">{e.eta}m</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Dest</div>
                    <div className="text-xs font-bold text-cyan-400 truncate">{e.destination.split(' ')[0]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI ACTIONS */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Radio size={16} className="text-rose-400" /> AI Actions Executed
          </h3>
          <div className="space-y-2">
            {[
              'Detected ambulance EV01 via siren + GPS triangulation',
              'Pre-empted signals S04, S07, S11 to green along corridor',
              'Alerted 142 nearby drivers via FlowBot broadcast',
              'Computed fastest route via Gemini Flyover (-8 min)',
              'Notified Apollo Hospital ED of incoming patient',
              'Cleared parked vehicles from emergency lane on Anna Salai',
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-700/40">
                <span className="w-6 h-6 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-sm text-slate-300">{a}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Bell size={16} className="text-amber-400" /> Driver Alerts Broadcast
          </h3>
          <div className="space-y-3">
            {[
              { msg: 'Ambulance approaching Anna Salai — please yield right of way.', time: '12:42', zone: 'Anna Nagar' },
              { msg: 'Fire truck en route to Egmore — avoid Gemini Flyover.', time: '12:38', zone: 'Egmore' },
              { msg: 'Police vehicle in pursuit on Tidel Park Junction.', time: '12:30', zone: 'Tidel Park' },
            ].map((al, i) => (
              <div key={i} className="p-3 rounded-lg bg-amber-500/10 border border-amber-400/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-amber-300 font-medium flex items-center gap-1"><MapPin size={11} /> {al.zone}</span>
                  <span className="text-[10px] text-slate-500">{al.time}</span>
                </div>
                <p className="text-sm text-slate-200">{al.msg}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
