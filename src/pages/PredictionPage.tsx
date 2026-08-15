import { Brain, TrendingUp, Route, Clock, Sparkles, AlertTriangle, Navigation } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { GlassCard, StatCard, SectionTitle, Badge, LiveDot } from '@/components/ui';
import { CityMap } from '@/components/CityMap';
import { ChartCard, CHART_COLORS, axisProps, tooltipStyle } from '@/components/ChartPrimitives';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { predictionData, hourlyTrafficData } from '@/lib/simulation';

const ROUTES = [
  { name: 'Anna Salai (Direct)', delay: 18, density: 82, recommended: false, eta: 42 },
  { name: 'Via Gemini Flyover', delay: 6, density: 45, recommended: true, eta: 28 },
  { name: 'Via Beach Road', delay: 12, density: 58, recommended: false, eta: 35 },
];

export function PredictionPage() {
  const { zones } = useApp();

  const points = zones.map((z) => ({
    id: z.id, name: z.name, lat: z.lat, lng: z.lng,
    tone: z.congestion === 'Critical' ? 'rose' : z.congestion === 'High' ? 'orange' : z.congestion === 'Medium' ? 'amber' : 'emerald',
    label: `${z.congestion}`,
  }));

  // recommended route polyline (simulated)
  const route = [
    [13.08, 80.27], [13.06, 80.25], [13.05, 80.24], [13.04, 80.23],
  ] as [number, number][];

  return (
    <div className="space-y-6">
      <SectionTitle
        title="AI Traffic Prediction Engine"
        subtitle="Forecasting congestion up to 60 minutes ahead using historical & live patterns"
        icon={<Brain size={18} />}
        right={<Badge tone="violet" pulse>Predicting · 92% accuracy</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Prediction Horizon" value={60} unit="min" icon={<Clock size={18} />} tone="violet" />
        <StatCard label="Confidence Score" value={92} unit="%" icon={<Sparkles size={18} />} tone="cyan" />
        <StatCard label="Congestion Spikes Predicted" value={3} icon={<AlertTriangle size={18} />} tone="amber" />
        <StatCard label="Avg Delay Reduction" value={14} unit="min" icon={<TrendingUp size={18} />} tone="emerald" delta="-32%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="Traffic Prediction — Next 60 Minutes" subtitle="Forecasted density % with confidence" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={predictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.violet} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={CHART_COLORS.violet} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="time" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 100]} />
              <Tooltip {...tooltipStyle} />
              <ReferenceLine y={70} stroke={CHART_COLORS.amber} strokeDasharray="4 4" label={{ value: 'High threshold', fill: '#f59e0b', fontSize: 10 }} />
              <Area type="monotone" dataKey="predicted" stroke={CHART_COLORS.violet} strokeWidth={2.5} fill="url(#pred)" name="Predicted Density" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" /> Predicted Hotspots
          </h3>
          <div className="space-y-3">
            {zones.slice(0, 5).map((z, i) => (
              <div key={z.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-700/40">
                <div>
                  <div className="text-sm text-white font-medium">{z.name}</div>
                  <div className="text-xs text-slate-400">in {5 + i * 8} min</div>
                </div>
                <Badge tone={z.density > 70 ? 'rose' : z.density > 50 ? 'amber' : 'emerald'}>
                  {z.density > 70 ? 'Critical' : z.density > 50 ? 'High' : 'Medium'}
                </Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ALTERNATE ROUTES */}
      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-1">
          <h3 className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
            <Route size={16} className="text-cyan-400" /> Recommended Route
          </h3>
          <p className="text-xs text-slate-400 mb-4">Anna Nagar → Airport</p>
          <div className="space-y-3">
            {ROUTES.map((r) => (
              <div
                key={r.name}
                className={`p-4 rounded-xl border transition-all ${
                  r.recommended
                    ? 'bg-emerald-500/10 border-emerald-400/30 glow-emerald'
                    : 'bg-slate-900/40 border-slate-700/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{r.name}</span>
                  {r.recommended && <Badge tone="emerald">Best</Badge>}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div>
                    <div className="text-xs text-slate-400">ETA</div>
                    <div className="text-sm font-bold text-white">{r.eta}m</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Delay</div>
                    <div className={`text-sm font-bold ${r.delay > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>{r.delay}m</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Density</div>
                    <div className="text-sm font-bold text-white">{r.density}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-xs text-cyan-200">
            <Navigation size={12} className="inline mr-1" />
            Expected delay reduction: <span className="font-bold">20 minutes</span> via Gemini Flyover bypass.
          </div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Predicted Route Map</h3>
              <p className="text-xs text-slate-400 mt-0.5">Dashed line = AI recommended corridor</p>
            </div>
            <Badge tone="emerald"><LiveDot tone="emerald" /> optimal</Badge>
          </div>
          <CityMap points={points} routes={[{ points: route, color: '#34d399' }]} height={360} />
        </GlassCard>
      </div>

      {/* HISTORICAL ANALYSIS */}
      <ChartCard title="Historical Pattern Analysis" subtitle="7-day rolling density baseline used by the AI model">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="hist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.4} />
                <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="hour" {...axisProps} interval={3} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="density" stroke={CHART_COLORS.cyan} strokeWidth={2} fill="url(#hist)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
