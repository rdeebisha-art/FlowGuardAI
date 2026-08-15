import { Leaf, Wind, Fuel, Clock, Route, TrendingDown, Trees, Globe } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { GlassCard, StatCard, SectionTitle, Badge, LiveDot } from '@/components/ui';
import { ChartCard, CHART_COLORS, axisProps, tooltipStyle } from '@/components/ChartPrimitives';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { fuelEcoData } from '@/lib/simulation';

export function EcoPage() {
  const { zones } = useApp();

  const totalFuel = fuelEcoData.reduce((a, d) => a + d.fuelSaved, 0);
  const totalCo2 = fuelEcoData.reduce((a, d) => a + d.co2Reduced, 0);
  const totalTime = fuelEcoData.reduce((a, d) => a + d.timeSaved, 0);

  const emissionSources = [
    { name: 'Cars', value: 48, color: CHART_COLORS.cyan },
    { name: 'Bikes', value: 22, color: CHART_COLORS.emerald },
    { name: 'Buses', value: 18, color: CHART_COLORS.amber },
    { name: 'Trucks', value: 12, color: CHART_COLORS.rose },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Green & Eco-Friendly Traffic System"
        subtitle="Environmental analytics — emissions reduced, fuel saved, sustainable routes"
        icon={<Leaf size={18} />}
        right={<Badge tone="emerald" pulse>eco mode on</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="CO₂ Reduced Today" value={(totalCo2 / 1000).toFixed(1)} unit="tons" icon={<Wind size={18} />} tone="emerald" delta="-12%" />
        <StatCard label="Fuel Saved" value={totalFuel.toLocaleString()} unit="L" icon={<Fuel size={18} />} tone="cyan" />
        <StatCard label="Time Saved" value={`${Math.round(totalTime / 60)}h`} icon={<Clock size={18} />} tone="amber" />
        <StatCard label="Green Routes Active" value={14} icon={<Route size={18} />} tone="emerald" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="CO₂ Reduction (24h)" subtitle="Kilograms of CO₂ saved by AI optimization" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={fuelEcoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="co2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.emerald} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="hour" {...axisProps} interval={3} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="co2Reduced" stroke={CHART_COLORS.emerald} strokeWidth={2.5} fill="url(#co2)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Emission Sources" subtitle="Share of city CO₂ by vehicle type">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={emissionSources} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {emissionSources.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend formatter={(v) => <span className="text-xs text-slate-300">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Fuel Saved & Time Saved (24h)" subtitle="Liters of fuel and minutes of time recovered">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={fuelEcoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="hour" {...axisProps} interval={3} />
            <YAxis yAxisId="l" {...axisProps} />
            <YAxis yAxisId="r" orientation="right" {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Legend formatter={(v) => <span className="text-xs text-slate-300">{v}</span>} />
            <Bar yAxisId="l" dataKey="fuelSaved" fill={CHART_COLORS.cyan} radius={[4, 4, 0, 0]} name="Fuel (L)" />
            <Bar yAxisId="r" dataKey="timeSaved" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} name="Time (min)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* GREEN ROUTES */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Route size={16} className="text-emerald-400" /> Green Route Recommendations
          </h3>
          <div className="space-y-3">
            {[
              { route: 'Anna Nagar → Airport', via: 'Via OMR Bypass', co2: '-34%', time: '28 min', dist: '12.4 km' },
              { route: 'T Nagar → Guindy', via: 'Via Beach Road', co2: '-22%', time: '22 min', dist: '7.8 km' },
              { route: 'Velachery → Egmore', via: 'Via Mount Road', co2: '-18%', time: '31 min', dist: '14.2 km' },
            ].map((r, i) => (
              <div key={i} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{r.route}</span>
                  <Badge tone="emerald"><Leaf size={11} className="mr-1" /> {r.co2}</Badge>
                </div>
                <div className="text-xs text-slate-300 mb-2">{r.via}</div>
                <div className="flex gap-4 text-xs text-slate-400">
                  <span><Clock size={11} className="inline mr-1 text-amber-400" />{r.time}</span>
                  <span><Route size={11} className="inline mr-1 text-cyan-400" />{r.dist}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Globe size={16} className="text-cyan-400" /> Low Emission Zones
          </h3>
          <div className="space-y-3">
            {zones.slice(0, 6).map((z) => (
              <div key={z.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-700/40">
                <div className="flex items-center gap-2">
                  <Trees size={16} className="text-emerald-400" />
                  <span className="text-sm text-white">{z.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">AQI {Math.round(40 + z.density * 0.6)}</span>
                  <Badge tone={z.density > 70 ? 'rose' : z.density > 50 ? 'amber' : 'emerald'}>
                    {z.density > 70 ? 'High' : z.density > 50 ? 'Moderate' : 'Clean'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* IMPACT */}
      <GlassCard strong className="p-6 border-emerald-400/20">
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <TrendingDown size={28} className="text-emerald-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{(totalCo2 / 1000).toFixed(1)}t</div>
            <div className="text-xs text-slate-400 mt-1">CO₂ avoided today</div>
          </div>
          <div>
            <Fuel size={28} className="text-cyan-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{totalFuel.toLocaleString()}L</div>
            <div className="text-xs text-slate-400 mt-1">Fuel saved today</div>
          </div>
          <div>
            <Trees size={28} className="text-emerald-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{Math.round(totalCo2 / 21)}</div>
            <div className="text-xs text-slate-400 mt-1">Tree-equivalent / day</div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-emerald-300">
          <LiveDot tone="emerald" /> Equivalent to planting {Math.round(totalCo2 / 21)} trees daily
        </div>
      </GlassCard>
    </div>
  );
}
