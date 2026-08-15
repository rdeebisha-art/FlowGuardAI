import { useState } from 'react';
import {
  FlaskConical, Play, Pause, RotateCcw, CarFront, Siren, TrafficCone, AlertTriangle,
  TrendingUp, Gauge, Fuel, Clock, ArrowRight, Cpu,
} from 'lucide-react';
import { GlassCard, StatCard, SectionTitle, Badge, ProgressBar, LiveDot } from '@/components/ui';
import { CityMap } from '@/components/CityMap';
import { ChartCard, CHART_COLORS, axisProps, tooltipStyle } from '@/components/ChartPrimitives';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/AppContext';

type Scenario = 'traffic_increase' | 'emergency' | 'accident' | 'signal_opt';

const SCENARIOS: { id: Scenario; label: string; desc: string; icon: React.ReactNode; tone: string }[] = [
  { id: 'traffic_increase', label: 'Traffic Increase', desc: 'Simulate 2× morning peak surge', icon: <CarFront size={18} />, tone: 'amber' },
  { id: 'emergency', label: 'Emergency Vehicle', desc: 'Ambulance crossing the city', icon: <Siren size={18} />, tone: 'rose' },
  { id: 'accident', label: 'Accident Situation', desc: 'Multi-vehicle collision event', icon: <AlertTriangle size={18} />, tone: 'orange' },
  { id: 'signal_opt', label: 'Signal Optimization', desc: 'Compare fixed vs AI timing', icon: <TrafficCone size={18} />, tone: 'cyan' },
];

export function SimulationPage() {
  const { zones } = useApp();
  const [scenario, setScenario] = useState<Scenario>('traffic_increase');
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);

  const runSim = () => {
    if (running) {
      setRunning(false);
      return;
    }
    setRunning(true);
    setTick(0);
    const id = setInterval(() => {
      setTick((t) => {
        if (t >= 20) {
          setRunning(false);
          clearInterval(id);
          return 20;
        }
        return t + 1;
      });
    }, 400);
  };

  const reset = () => { setRunning(false); setTick(0); };

  // generate before/after series
  const beforeData = Array.from({ length: 21 }, (_, i) => ({
    t: i,
    baseline: 50 + Math.sin(i / 4) * 10,
    surge: scenario === 'traffic_increase' ? 50 + Math.sin(i / 4) * 10 + (i * 2.2) : 50 + Math.sin(i / 4) * 10,
  }));
  const afterData = beforeData.map((d) => ({
    ...d,
    ai: scenario === 'traffic_increase' ? d.surge - Math.min(28, tick * 1.4) : d.baseline - Math.min(20, tick),
  }));

  const before = { wait: 95, fuel: 280, congestion: 78, throughput: 520 };
  const after = { wait: 42, fuel: 145, congestion: 41, throughput: 880 };

  const points = zones.slice(0, 8).map((z) => ({
    id: z.id, name: z.name, lat: z.lat, lng: z.lng,
    tone: scenario === 'accident' && z.id === 'Z01' ? 'rose' : scenario === 'emergency' && z.id === 'Z02' ? 'rose' : 'cyan',
    label: z.name,
  }));

  const simRoute = scenario === 'emergency' || scenario === 'accident'
    ? [{ points: [[13.08, 80.27], [13.07, 80.26], [13.06, 80.25]] as [number, number][], color: '#f43f5e' }]
    : [];

  return (
    <div className="space-y-6">
      <SectionTitle
        title="AI Traffic Simulation Mode"
        subtitle="Digital twin — test scenarios in a virtual city before deploying changes"
        icon={<FlaskConical size={18} />}
        right={<Badge tone="cyan" pulse>digital twin v2</Badge>}
      />

      {/* SCENARIO PICKER */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => { setScenario(s.id); reset(); }}
            className={cn(
              'p-4 rounded-xl border text-left transition-all',
              scenario === s.id ? 'bg-cyan-500/10 border-cyan-400/40 glow-cyan' : 'glass border-slate-700/40 hover:border-slate-600',
            )}
          >
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3 border',
              scenario === s.id ? 'bg-cyan-500/15 text-cyan-400 border-cyan-400/30' : 'bg-slate-800/60 text-slate-400 border-slate-700/40')}>
              {s.icon}
            </div>
            <div className="text-sm font-medium text-white">{s.label}</div>
            <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* CONTROLS */}
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={runSim}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-shadow',
              running ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40' : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 hover:shadow-[0_0_24px_rgba(34,211,238,0.3)]',
            )}
          >
            {running ? <><Pause size={16} /> Pause Simulation</> : <><Play size={16} /> Run Simulation</>}
          </button>
          <button onClick={reset} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-300 text-sm hover:border-cyan-400/30">
            <RotateCcw size={16} /> Reset
          </button>
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Simulation progress</span>
              <span className="tabular-nums">{tick}/20</span>
            </div>
            <ProgressBar value={tick} max={20} tone="cyan" />
          </div>
          <Badge tone={running ? 'cyan' : 'slate'} pulse={running}>
            {running ? 'running' : 'idle'}
          </Badge>
        </div>
      </GlassCard>

      {/* MAP + METRICS */}
      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Cpu size={16} className="text-cyan-400" /> Digital Twin City
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{SCENARIOS.find((s) => s.id === scenario)?.label} scenario</p>
            </div>
            <Badge tone={running ? 'cyan' : 'slate'}>{running ? <><LiveDot tone="cyan" /> simulating</> : 'paused'}</Badge>
          </div>
          <CityMap points={points} routes={simRoute} height={360} />
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Live Sim Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Vehicles in sim', value: Math.round(580 + tick * 24), icon: <CarFront size={14} />, tone: 'cyan' },
              { label: 'Avg wait (s)', value: Math.round(95 - tick * 2.6), icon: <Clock size={14} />, tone: 'amber' },
              { label: 'Congestion %', value: Math.round(78 - tick * 1.8), icon: <Gauge size={14} />, tone: 'rose' },
              { label: 'Throughput', value: Math.round(520 + tick * 18), icon: <TrendingUp size={14} />, tone: 'emerald' },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-900/40 border border-slate-700/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">{m.icon} {m.label}</span>
                  <span className="text-lg font-bold text-white tabular-nums">{m.value}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* BEFORE / AFTER CHART */}
      <ChartCard title="Before vs After — Congestion Over Simulation" subtitle="Baseline (no AI) vs AI-optimized response">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={afterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="t" {...axisProps} label={{ value: 'sim step', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 10 }} />
            <YAxis {...axisProps} domain={[0, 100]} />
            <Tooltip {...tooltipStyle} />
            <Legend formatter={(v) => <span className="text-xs text-slate-300">{v}</span>} />
            <ReferenceLine x={tick} stroke={CHART_COLORS.cyan} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="surge" stroke={CHART_COLORS.rose} strokeWidth={2} dot={false} name="Without AI" />
            <Line type="monotone" dataKey="ai" stroke={CHART_COLORS.emerald} strokeWidth={2.5} dot={false} name="With AI" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* BEFORE / AFTER COMPARISON CARDS */}
      <div>
        <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <ArrowRight size={16} className="text-cyan-400" /> Improvement Summary
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Avg Wait Time', before: before.wait, after: after.wait, unit: 's', icon: <Clock size={18} />, tone: 'amber' },
            { label: 'Fuel Used', before: before.fuel, after: after.fuel, unit: 'L', icon: <Fuel size={18} />, tone: 'cyan' },
            { label: 'Congestion Index', before: before.congestion, after: after.congestion, unit: '', icon: <Gauge size={18} />, tone: 'rose' },
            { label: 'Throughput', before: before.throughput, after: after.throughput, unit: 'veh', icon: <TrendingUp size={18} />, tone: 'emerald' },
          ].map((m, i) => {
            const improve = m.before > m.after ? Math.round((1 - m.after / m.before) * 100) : Math.round((m.after / m.before - 1) * 100);
            return (
              <GlassCard key={i} hover className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className={cn('w-9 h-9 rounded-lg flex items-center justify-center',
                    m.tone === 'amber' ? 'bg-amber-500/10 text-amber-400' :
                    m.tone === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                    m.tone === 'rose' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400')}>
                    {m.icon}
                  </span>
                  <span className="text-xs text-slate-400">{m.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-lg bg-slate-900/40 text-center">
                    <div className="text-[10px] text-rose-400 mb-0.5">Before</div>
                    <div className="text-lg font-bold text-rose-400">{m.before}<span className="text-[10px]"> {m.unit}</span></div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-center">
                    <div className="text-[10px] text-emerald-400 mb-0.5">After</div>
                    <div className="text-lg font-bold text-emerald-400">{m.after}<span className="text-[10px]"> {m.unit}</span></div>
                  </div>
                </div>
                <div className={cn('mt-3 text-center text-xs font-medium', m.before > m.after ? 'text-emerald-400' : 'text-emerald-400')}>
                  {m.before > m.after ? '↓' : '↑'} {improve}% improvement
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Simulations Run Today" value={47} icon={<FlaskConical size={18} />} tone="cyan" />
        <StatCard label="Scenarios Validated" value={12} icon={<Cpu size={18} />} tone="violet" />
        <StatCard label="Avg Improvement" value={55} unit="%" icon={<TrendingUp size={18} />} tone="emerald" delta="+8%" />
        <StatCard label="Deploy Success Rate" value={96} unit="%" icon={<Gauge size={18} />} tone="amber" />
      </div>
    </div>
  );
}
