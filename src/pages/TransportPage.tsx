import { Bus, Users, Clock, MapPin, Route, TrendingUp, Gauge } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { GlassCard, StatCard, SectionTitle, Badge, ProgressBar, LiveDot } from '@/components/ui';
import { CityMap } from '@/components/CityMap';
import { ChartCard, CHART_COLORS, axisProps, tooltipStyle } from '@/components/ChartPrimitives';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export function TransportPage() {
  const { buses } = useApp();

  const totalPassengers = buses.reduce((a, b) => a + b.passengers, 0);
  const onTime = buses.filter((b) => b.status === 'On Time').length;
  const avgDelay = (buses.reduce((a, b) => a + Math.max(0, b.delay), 0) / buses.length).toFixed(1);

  const points = buses.map((b) => ({
    id: b.id, name: b.route, lat: b.lat, lng: b.lng,
    tone: b.status === 'Delayed' ? 'amber' : b.status === 'Early' ? 'emerald' : 'blue',
    label: `${b.id} · ${b.passengers}/${b.capacity} pax · ETA ${b.eta}m`,
    radius: 8,
  }));

  const densityData = buses.map((b) => ({ route: `R${b.id.slice(3)}`, passengers: b.passengers, capacity: b.capacity }));

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Public Transport Intelligence"
        subtitle="Track buses, predict arrivals & optimize routes with AI"
        icon={<Bus size={18} />}
        right={<Badge tone="blue" pulse>{buses.length} routes live</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Buses" value={buses.length} icon={<Bus size={18} />} tone="blue" />
        <StatCard label="Passengers Now" value={totalPassengers} icon={<Users size={18} />} tone="cyan" />
        <StatCard label="On-Time Rate" value={`${Math.round((onTime / buses.length) * 100)}%`} icon={<Clock size={18} />} tone="emerald" />
        <StatCard label="Avg Delay" value={`${avgDelay}m`} icon={<TrendingUp size={18} />} tone="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Live Bus Tracking</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time GPS positions across all routes</p>
            </div>
            <Badge tone="blue"><LiveDot tone="cyan" /> GPS</Badge>
          </div>
          <CityMap points={points} height={380} />
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Arrival Predictions</h3>
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {buses.map((b) => (
              <div key={b.id} className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400">{b.id}</span>
                  <Badge tone={b.status === 'On Time' ? 'emerald' : b.status === 'Delayed' ? 'amber' : 'cyan'}>{b.status}</Badge>
                </div>
                <div className="text-sm text-white truncate">{b.route}</div>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={11} className="text-cyan-400" />{b.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-slate-400">ETA</span>
                  <span className={`font-bold ${b.delay > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>{b.eta}m {b.delay > 0 ? `(+${b.delay})` : b.delay < 0 ? `(${b.delay})` : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Passenger Density by Route" subtitle="Load factor across active routes">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={densityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="route" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="capacity" fill={CHART_COLORS.slate} radius={[4, 4, 0, 0]} name="Capacity" />
              <Bar dataKey="passengers" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} name="Passengers" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="On-Time Performance Trend" subtitle="Weekly punctuality (%)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={[82, 85, 79, 88, 91, 87, 92].map((v, i) => ({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], pct: v }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="day" {...axisProps} />
              <YAxis {...axisProps} domain={[70, 100]} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="pct" stroke={CHART_COLORS.emerald} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ROUTE OPTIMIZATION */}
      <GlassCard className="p-5">
        <SectionTitle title="Smart Route Optimization" subtitle="AI recommendations to improve service" icon={<Route size={18} />} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { route: 'Route 5', rec: 'Add 2 buses at 6 PM peak — demand +34%', save: '8 min wait' },
            { route: 'Route 21', rec: 'Reroute via OMR bypass — avoids IT corridor jam', save: '12 min saved' },
            { route: 'Route 18', rec: 'Increase frequency on weekends', save: '+22% ridership' },
          ].map((r, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40">
              <div className="text-sm font-medium text-white mb-1">{r.route}</div>
              <div className="text-xs text-slate-300 mb-2">{r.rec}</div>
              <Badge tone="emerald"><Gauge size={11} className="mr-1" /> {r.save}</Badge>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* LOAD FACTOR */}
      <GlassCard className="p-5">
        <h3 className="font-semibold text-white text-sm mb-4">Bus Load Factor</h3>
        <div className="space-y-3">
          {buses.map((b) => (
            <div key={b.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{b.id} · {b.route.split(':')[0]}</span>
                <span className="text-slate-400">{b.passengers}/{b.capacity} ({Math.round((b.passengers / b.capacity) * 100)}%)</span>
              </div>
              <ProgressBar value={b.passengers} max={b.capacity} tone={b.passengers / b.capacity > 0.85 ? 'rose' : b.passengers / b.capacity > 0.6 ? 'amber' : 'emerald'} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
