import { useState } from 'react';
import {
  Activity, CarFront, Gauge, MapPin, TrendingUp, Clock, AlertTriangle, Route,
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { GlassCard, StatCard, SectionTitle, Badge, CongestionMeter, Table, LiveDot } from '@/components/ui';
import { CityMap } from '@/components/CityMap';
import { ChartCard, CHART_COLORS, axisProps, tooltipStyle } from '@/components/ChartPrimitives';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { hourlyTrafficData, weeklyCongestionTrend, congestionColor } from '@/lib/simulation';
import { cn } from '@/lib/utils';

const tonePie: Record<string, string> = {
  Low: CHART_COLORS.emerald, Medium: CHART_COLORS.amber, High: CHART_COLORS.orange, Critical: CHART_COLORS.rose,
};

export function MonitorPage() {
  const { t, zones } = useApp();
  const [selectedZone, setSelectedZone] = useState(zones[0]?.id || '');

  const totalVehicles = zones.reduce((a, z) => a + z.vehicles, 0);
  const avgSpeed = Math.round(zones.reduce((a, z) => a + z.avgSpeed, 0) / zones.length);
  const avgDensity = Math.round(zones.reduce((a, z) => a + z.density, 0) / zones.length);
  const critical = zones.filter((z) => z.congestion === 'Critical' || z.congestion === 'High').length;

  const congestionDist = ['Low', 'Medium', 'High', 'Critical'].map((c) => ({
    name: c,
    value: zones.filter((z) => z.congestion === c).length,
  }));

  const zone = zones.find((z) => z.id === selectedZone) || zones[0];

  const mapPoints = zones.map((z) => ({
    id: z.id,
    name: z.name,
    lat: z.lat,
    lng: z.lng,
    tone: z.congestion === 'Critical' ? 'rose' : z.congestion === 'High' ? 'orange' : z.congestion === 'Medium' ? 'amber' : 'emerald',
    label: `${z.congestion} · ${z.vehicles} vehicles · ${z.avgSpeed} km/h`,
    radius: 6 + z.density / 14,
  }));

  return (
    <div className="space-y-6">
      <SectionTitle
        title="AI Smart Traffic Monitoring"
        subtitle="Live density, vehicle flow & congestion across all city zones"
        icon={<Activity size={18} />}
        right={<Badge tone="emerald" pulse>{t('live')} · updated 4s</Badge>}
      />

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Vehicles Tracked" value={totalVehicles.toLocaleString()} icon={<CarFront size={18} />} tone="cyan" delta="+3.2%" />
        <StatCard label="Avg Speed (city)" value={avgSpeed} unit={t('kmh')} icon={<Gauge size={18} />} tone="emerald" />
        <StatCard label="Avg Congestion" value={avgDensity} unit="%" icon={<TrendingUp size={18} />} tone="amber" />
        <StatCard label="High/Critical Zones" value={critical} icon={<AlertTriangle size={18} />} tone="rose" />
      </div>

      {/* MAP + ZONE LIST */}
      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Interactive Traffic Heatmap</h3>
              <p className="text-xs text-slate-400 mt-0.5">Color = congestion level · size = vehicle volume</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {(['Low', 'Medium', 'High', 'Critical'] as const).map((c) => (
                <span key={c} className="inline-flex items-center gap-1 text-slate-400">
                  <span className={cn('w-2 h-2 rounded-full', `bg-${congestionColor(c)}-400`)} /> {c}
                </span>
              ))}
            </div>
          </div>
          <CityMap points={mapPoints} height={380} />
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-3">Zone Status</h3>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {zones.map((z) => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={cn(
                  'w-full text-left p-3 rounded-xl border transition-all',
                  selectedZone === z.id ? 'bg-cyan-500/10 border-cyan-400/30' : 'bg-slate-900/30 border-slate-700/40 hover:border-slate-600',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white flex items-center gap-1.5">
                    <MapPin size={13} className="text-cyan-400" /> {z.name}
                  </span>
                  <Badge tone={congestionColor(z.congestion) as 'emerald' | 'amber' | 'orange' | 'rose'}>{z.congestion}</Badge>
                </div>
                <CongestionMeter value={z.density} />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>{z.vehicles} veh</span>
                  <span>{z.avgSpeed} km/h</span>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* SELECTED ZONE DETAIL */}
      {zone && (
        <div className="grid lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 lg:col-span-1">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <MapPin size={16} className="text-cyan-400" /> {zone.name}
            </h3>
            <Badge tone={congestionColor(zone.congestion) as 'emerald' | 'amber' | 'orange' | 'rose'}>{zone.congestion}</Badge>
            <div className="mt-4 space-y-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">Vehicles</div>
                <div className="text-2xl font-bold text-white">{zone.vehicles}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Avg Speed</div>
                <div className="text-2xl font-bold text-white">{zone.avgSpeed} <span className="text-sm text-slate-400">km/h</span></div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Active Roads</div>
                <div className="text-2xl font-bold text-white">{zone.roads}</div>
              </div>
            </div>
          </GlassCard>

          <ChartCard title="Hourly Density" subtitle={`${zone.name} — past 24h`} className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="zArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.amber} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="hour" {...axisProps} interval={3} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="density" stroke={CHART_COLORS.amber} strokeWidth={2} fill="url(#zArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ANALYTICS GRID */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Peak Traffic Hours" subtitle="City-wide congestion pattern (24h)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="hour" {...axisProps} interval={3} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="speed" stroke={CHART_COLORS.emerald} strokeWidth={2} dot={false} name="Avg Speed" />
              <Line type="monotone" dataKey="density" stroke={CHART_COLORS.rose} strokeWidth={2} dot={false} name="Density %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Congestion Distribution" subtitle="Zones by congestion level">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={congestionDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {congestionDist.map((e, i) => (
                  <Cell key={i} fill={tonePie[e.name]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend formatter={(v) => <span className="text-xs text-slate-300">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Congestion Trend" subtitle="Average vs peak density">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyCongestionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="day" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="avgCongestion" fill={CHART_COLORS.cyan} radius={[4, 4, 0, 0]} name="Avg" />
              <Bar dataKey="peakCongestion" fill={CHART_COLORS.rose} radius={[4, 4, 0, 0]} name="Peak" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Accident Statistics" subtitle="Incidents by hour">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="hour" {...axisProps} interval={3} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="accidents" fill={CHART_COLORS.orange} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* VEHICLE FLOW TABLE */}
      <GlassCard className="p-5">
        <SectionTitle title="Vehicle Flow Statistics" subtitle="Live per-zone breakdown" icon={<Route size={18} />}
          right={<Badge tone="cyan"><LiveDot tone="cyan" /> streaming</Badge>} />
        <Table
          headers={['Zone', t('congestion'), t('vehicles'), t('avgSpeed'), 'Density', 'Incidents']}
          rows={zones.map((z) => [
            <span className="font-medium text-white">{z.name}</span>,
            <Badge tone={congestionColor(z.congestion) as 'emerald' | 'amber' | 'orange' | 'rose'}>{z.congestion}</Badge>,
            <span className="tabular-nums">{z.vehicles}</span>,
            <span className="tabular-nums">{z.avgSpeed} {t('kmh')}</span>,
            <div className="w-24"><CongestionMeter value={z.density} /></div>,
            <span className={z.incidents > 1 ? 'text-rose-400' : 'text-slate-300'}>{z.incidents}</span>,
          ])}
        />
      </GlassCard>

      {/* TRAVEL TIME PREDICTION */}
      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { from: 'Anna Nagar', to: 'Airport', normal: 52, ai: 34 },
          { from: 'T Nagar', to: 'Guindy', normal: 38, ai: 22 },
          { from: 'Velachery', to: 'Egmore', normal: 45, ai: 28 },
        ].map((r, i) => (
          <GlassCard key={i} hover className="p-5">
            <div className="flex items-center gap-2 text-cyan-400 mb-3">
              <Clock size={16} />
              <span className="text-xs font-medium uppercase tracking-wide">Travel Time Prediction</span>
            </div>
            <div className="text-sm text-white font-medium">{r.from} → {r.to}</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-900/40 p-3">
                <div className="text-xs text-slate-400">Normal</div>
                <div className="text-xl font-bold text-rose-400">{r.normal} <span className="text-xs">min</span></div>
              </div>
              <div className="rounded-lg bg-cyan-500/10 p-3 border border-cyan-400/20">
                <div className="text-xs text-cyan-300">AI Route</div>
                <div className="text-xl font-bold text-emerald-400">{r.ai} <span className="text-xs">min</span></div>
              </div>
            </div>
            <div className="mt-3 text-xs text-emerald-400">Save {r.normal - r.ai} min ({Math.round((1 - r.ai / r.normal) * 100)}%)</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
