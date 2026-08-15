import {
  Radar, Activity, Brain, TrafficCone, Siren, CarFront, AudioLines, Construction,
  ShieldAlert, ParkingSquare, Bus, Bot, Leaf, Cpu, FlaskConical, ArrowRight,
  Cpu as CpuIcon, Satellite, Zap, TrendingDown,
} from 'lucide-react';
import { useApp, PageId } from '@/lib/AppContext';
import { GlassCard, StatCard, Badge, SectionTitle, LiveDot } from '@/components/ui';
import { CityMap } from '@/components/CityMap';
import { ChartCard, CHART_COLORS, axisProps, tooltipStyle } from '@/components/ChartPrimitives';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { hourlyTrafficData } from '@/lib/simulation';

const FEATURES: { id: PageId; icon: React.ReactNode; title: string; desc: string; tone: string }[] = [
  { id: 'monitor', icon: <Activity size={20} />, title: 'AI Traffic Monitoring', desc: 'Real-time density, vehicle counts & congestion across all city zones.', tone: 'cyan' },
  { id: 'prediction', icon: <Brain size={20} />, title: 'AI Prediction Engine', desc: 'Forecast congestion up to 60 minutes ahead with alternate routes.', tone: 'violet' },
  { id: 'signals', icon: <TrafficCone size={20} />, title: 'Smart Signal Optimization', desc: 'Dynamic signal timing based on density, emergency & pedestrian flow.', tone: 'amber' },
  { id: 'emergency', icon: <Siren size={20} />, title: 'Emergency Green Corridor', desc: 'Auto-detect ambulances & fire trucks, clear paths instantly.', tone: 'rose' },
  { id: 'accident', icon: <CarFront size={20} />, title: 'AI Accident Detection', desc: 'Computer vision detects collisions and dispatches help automatically.', tone: 'orange' },
  { id: 'sound', icon: <AudioLines size={20} />, title: 'Sound Incident Detection', desc: 'Audio AI flags crashes, horns, screams & sirens across the city.', tone: 'amber' },
  { id: 'road', icon: <Construction size={20} />, title: 'Road Damage Detection', desc: 'Detect potholes, waterlogging & obstacles from camera feeds.', tone: 'amber' },
  { id: 'violation', icon: <ShieldAlert size={20} />, title: 'Traffic Violation Detection', desc: 'Auto-fine red-light jumps, no-helmet & wrong-side violations.', tone: 'rose' },
  { id: 'parking', icon: <ParkingSquare size={20} />, title: 'Smart Parking', desc: 'Find, reserve and pay for parking with live slot availability.', tone: 'emerald' },
  { id: 'transport', icon: <Bus size={20} />, title: 'Public Transport Intelligence', desc: 'Track buses, predict arrivals & optimize routes with AI.', tone: 'blue' },
  { id: 'citizen', icon: <CpuIcon size={20} />, title: 'Citizen Reporting', desc: 'Residents report jams, damage & violations with photo evidence.', tone: 'amber' },
  { id: 'flowbot', icon: <Bot size={20} />, title: 'FlowBot AI Assistant', desc: 'Conversational AI for routes, parking, traffic & emergencies.', tone: 'cyan' },
  { id: 'eco', icon: <Leaf size={20} />, title: 'Eco-Friendly Routing', desc: 'Green routes, emission tracking & low-emission zones.', tone: 'emerald' },
  { id: 'simulation', icon: <FlaskConical size={20} />, title: 'Digital Twin Simulation', desc: 'Test traffic scenarios in a virtual city before deploying changes.', tone: 'cyan' },
];

const toneRing: Record<string, string> = {
  cyan: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-400 group-hover:border-cyan-400/50',
  emerald: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-400/50',
  amber: 'border-amber-400/20 bg-amber-500/10 text-amber-400 group-hover:border-amber-400/50',
  rose: 'border-rose-400/20 bg-rose-500/10 text-rose-400 group-hover:border-rose-400/50',
  violet: 'border-violet-400/20 bg-violet-500/10 text-violet-400 group-hover:border-violet-400/50',
  blue: 'border-blue-400/20 bg-blue-500/10 text-blue-400 group-hover:border-blue-400/50',
  orange: 'border-orange-400/20 bg-orange-500/10 text-orange-400 group-hover:border-orange-400/50',
};

export function HomePage() {
  const { t, setPage, zones } = useApp();

  const totalVehicles = zones.reduce((a, z) => a + z.vehicles, 0);

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative">
        <div className="cc-grid-bg absolute inset-0 rounded-3xl opacity-40 pointer-events-none" />
        <GlassCard strong className="relative overflow-hidden p-8 lg:p-14">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-medium mb-6">
                <Radar size={14} className="animate-spin-slow" />
                {t('home_hero_badge')}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                <span className="gradient-text">{t('home_hero_title')}</span>
              </h1>
              <p className="mt-5 text-slate-400 text-base lg:text-lg leading-relaxed max-w-xl">
                {t('home_hero_sub')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => setPage('monitor')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-semibold text-sm hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow"
                >
                  {t('home_hero_cta')} <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => setPage('admin')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white font-medium text-sm hover:border-cyan-400/30 transition-colors"
                >
                  {t('home_hero_cta2')}
                </button>
              </div>
              <div className="mt-8 flex items-center gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-2"><LiveDot tone="emerald" /> Live IoT feeds</span>
                <span className="inline-flex items-center gap-2"><Satellite size={14} className="text-cyan-400" /> Computer vision active</span>
                <span className="inline-flex items-center gap-2"><Zap size={14} className="text-amber-400" /> AI inference running</span>
              </div>
            </div>

            <div className="relative">
              <CityMap
                points={zones.map((z) => ({
                  id: z.id,
                  name: z.name,
                  lat: z.lat,
                  lng: z.lng,
                  tone: z.congestion === 'Critical' ? 'rose' : z.congestion === 'High' ? 'orange' : z.congestion === 'Medium' ? 'amber' : 'emerald',
                  label: `${z.congestion} · ${z.vehicles} vehicles`,
                  radius: 7 + z.density / 12,
                }))}
                height={340}
                interactive={false}
              />
              <div className="absolute top-3 left-3 glass rounded-lg px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2">
                <LiveDot tone="cyan" /> Live city grid
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('home_stats_zones')} value={zones.length} icon={<Activity size={18} />} tone="cyan" delta="+2" />
        <StatCard label={t('home_stats_vehicles')} value={`${(totalVehicles / 1000).toFixed(1)}k`} icon={<CarFront size={18} />} tone="emerald" delta="+8%" />
        <StatCard label={t('home_stats_signals')} value="248" icon={<TrafficCone size={18} />} tone="amber" />
        <StatCard label={t('home_stats_co2')} value="1.4" unit="tons" icon={<TrendingDown size={18} />} tone="emerald" delta="-12%" />
      </section>

      {/* TRAFFIC PATTERN PREVIEW */}
      <section className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="24-Hour Traffic Pattern" subtitle="Simulated city-wide vehicle density" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hDensity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="hour" {...axisProps} interval={3} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="density" stroke={CHART_COLORS.cyan} strokeWidth={2} fill="url(#hDensity)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <GlassCard className="p-5">
          <SectionTitle title="Why FlowGuard AI" subtitle="A unified intelligent transport stack" icon={<Cpu size={18} />} />
          <div className="space-y-3 text-sm text-slate-300">
            {[
              ['Predicts congestion before it forms', <Brain size={16} key="b" className="text-violet-400" />],
              ['Cuts emergency response time by 40%', <Siren size={16} key="s" className="text-rose-400" />],
              ['Reduces fuel use 35% via AI signals', <TrafficCone size={16} key="t" className="text-amber-400" />],
              ['Empowers citizens to report issues', <ShieldAlert size={16} key="sa" className="text-amber-400" />],
            ].map(([txt, ic], i) => (
              <div key={i} className="flex items-center gap-3">
                {ic}
                <span className="text-slate-300">{txt}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* FEATURES GRID */}
      <section>
        <SectionTitle
          title="Complete Smart City Suite"
          subtitle="16 integrated AI modules covering every layer of urban mobility"
          icon={<Cpu size={18} />}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <button key={f.id} onClick={() => setPage(f.id)} className="text-left">
              <GlassCard hover className="p-5 h-full group">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${toneRing[f.tone]}`}>
                  {f.icon}
                </div>
                <h3 className="mt-4 font-semibold text-white text-sm">{f.title}</h3>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight size={12} />
                </div>
              </GlassCard>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <GlassCard strong className="p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 cc-grid-bg opacity-30 pointer-events-none" />
          <div className="relative">
            <Badge tone="cyan" pulse>{t('live')}</Badge>
            <h2 className="mt-4 text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Step into the command center
            </h2>
            <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
              Monitor the entire city in real time, dispatch emergency vehicles, predict congestion, and optimize signals — all from one AI-driven dashboard.
            </p>
            <button
              onClick={() => setPage('admin')}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-semibold text-sm hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-shadow"
            >
              <Cpu size={16} /> Open Admin Control Center <ArrowRight size={16} />
            </button>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
