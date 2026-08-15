import { useState } from 'react';
import { TrafficCone, Clock, Fuel, Gauge, Users, Footprints, Siren, Sparkles, Check } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { GlassCard, StatCard, SectionTitle, Badge, ProgressBar, LiveDot } from '@/components/ui';
import { ChartCard, CHART_COLORS, axisProps, tooltipStyle } from '@/components/ChartPrimitives';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { signalComparisonData } from '@/lib/simulation';
import { cn } from '@/lib/utils';

export function SignalsPage() {
  const { signals } = useApp();
  const [selected, setSelected] = useState(signals[0]?.id || '');
  const sig = signals.find((s) => s.id === selected) || signals[0];

  const emergencyCount = signals.filter((s) => s.hasEmergency).length;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Smart AI Traffic Signal Optimization"
        subtitle="Dynamic signal timing driven by density, emergency vehicles & pedestrian flow"
        icon={<TrafficCone size={18} />}
        right={<Badge tone="amber" pulse>AI timing active</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Intersections Managed" value={signals.length} icon={<TrafficCone size={18} />} tone="amber" />
        <StatCard label="Avg Wait Reduction" value={55} unit="%" icon={<Clock size={18} />} tone="emerald" delta="-55%" />
        <StatCard label="Fuel Saved Today" value={135} unit="L" icon={<Fuel size={18} />} tone="cyan" />
        <StatCard label="Emergency Priorities" value={emergencyCount} icon={<Siren size={18} />} tone="rose" />
      </div>

      {/* SIGNAL SIMULATOR */}
      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Signal Control Console</h3>
            <Badge tone="emerald"><LiveDot tone="emerald" /> auto-optimizing</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
            {signals.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={cn(
                  'p-2.5 rounded-lg text-left border transition-all',
                  selected === s.id ? 'bg-amber-500/10 border-amber-400/40' : 'bg-slate-900/40 border-slate-700/40 hover:border-slate-600',
                )}
              >
                <div className="text-xs font-medium text-white truncate">{s.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.waitingVehicles} waiting</div>
              </button>
            ))}
          </div>

          {sig && (
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Visual signal */}
              <div className="flex flex-col items-center justify-center bg-slate-900/40 rounded-xl p-6 border border-slate-700/40">
                <div className="text-xs text-slate-400 mb-3">{sig.name}</div>
                <div className="flex flex-col gap-3 items-center">
                  <div className={cn('w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all', sig.phase === 'NS' ? 'bg-emerald-500/30 border-emerald-400 glow-emerald' : 'bg-slate-700/40 border-slate-600')}>
                    <span className={cn('text-2xl font-bold', sig.phase === 'NS' ? 'text-emerald-300' : 'text-slate-500')}>{sig.greenTimer}</span>
                  </div>
                  <div className="text-xs text-emerald-400 font-medium">NS GREEN</div>
                  <div className={cn('w-16 h-16 rounded-full border-4 flex items-center justify-center', sig.phase === 'EW' ? 'bg-rose-500/30 border-rose-400 glow-rose' : 'bg-slate-700/40 border-slate-600')}>
                    <span className={cn('text-2xl font-bold', sig.phase === 'EW' ? 'text-rose-300' : 'text-slate-500')}>{sig.redTimer}</span>
                  </div>
                  <div className="text-xs text-rose-400 font-medium">EW RED</div>
                </div>
              </div>

              {/* AI recommendation */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs font-medium mb-2">
                    <Sparkles size={14} /> AI RECOMMENDATION
                  </div>
                  <div className="text-sm text-white">
                    Extend NS green to <span className="font-bold text-cyan-300">{sig.aiRecommendedGreen}s</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {sig.waitingVehicles} vehicles waiting · {sig.pedestrian ? 'pedestrian crossing detected' : 'no pedestrian'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-slate-900/40">
                    <div className="flex items-center gap-1 text-xs text-slate-400"><Users size={12} /> Waiting</div>
                    <div className="text-lg font-bold text-white">{sig.waitingVehicles}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/40">
                    <div className="flex items-center gap-1 text-xs text-slate-400"><Gauge size={12} /> Phase</div>
                    <div className="text-lg font-bold text-white">{sig.phase}</div>
                  </div>
                  {sig.hasEmergency && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-400/30 col-span-2">
                      <div className="flex items-center gap-2 text-rose-300 text-xs font-medium">
                        <Siren size={14} /> Emergency override — green corridor active
                      </div>
                    </div>
                  )}
                  {sig.pedestrian && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-400/30 col-span-2">
                      <div className="flex items-center gap-2 text-amber-300 text-xs font-medium">
                        <Footprints size={14} /> Pedestrian phase triggered
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Normal vs AI comparison */}
        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Normal vs AI Optimized</h3>
          <div className="space-y-4">
            {signalComparisonData.map((m) => {
              const max = Math.max(m.normal, m.ai);
              return (
                <div key={m.metric}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-300">{m.metric}</span>
                    <span className="text-emerald-400 font-medium">-{Math.round((1 - m.ai / m.normal) * 100)}%</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-rose-400 w-12">Normal</span>
                      <div className="flex-1"><ProgressBar value={m.normal} max={max} tone="rose" /></div>
                      <span className="text-xs text-slate-400 w-10 text-right tabular-nums">{m.normal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-400 w-12">AI</span>
                      <div className="flex-1"><ProgressBar value={m.ai} max={max} tone="emerald" /></div>
                      <span className="text-xs text-slate-400 w-10 text-right tabular-nums">{m.ai}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-xs text-emerald-200 flex items-center gap-2">
            <Check size={14} /> 69% avg wait time reduction
          </div>
        </GlassCard>
      </div>

      {/* COMPARISON CHART */}
      <ChartCard title="Signal Performance: Normal vs AI Optimized" subtitle="Across all 12 intersections today">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={signalComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="metric" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Legend formatter={(v) => <span className="text-xs text-slate-300">{v}</span>} />
            <Bar dataKey="normal" fill={CHART_COLORS.rose} radius={[4, 4, 0, 0]} name="Normal Signal" />
            <Bar dataKey="ai" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} name="AI Optimized" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* SIGNAL LIST */}
      <GlassCard className="p-5">
        <SectionTitle title="All Intersections" subtitle="Live signal status" icon={<TrafficCone size={18} />} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {signals.map((s) => (
            <div key={s.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40 hover:border-amber-400/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{s.name}</span>
                {s.hasEmergency && <Siren size={14} className="text-rose-400" />}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-slate-400">Green</div>
                  <div className="text-sm font-bold text-emerald-400">{s.greenTimer}s</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Red</div>
                  <div className="text-sm font-bold text-rose-400">{s.redTimer}s</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Waiting</div>
                  <div className="text-sm font-bold text-amber-400">{s.waitingVehicles}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
