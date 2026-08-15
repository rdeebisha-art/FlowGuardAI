import { CarFront, AlertTriangle, Siren, MapPin, Building2, Route, Eye, Video } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { GlassCard, StatCard, SectionTitle, Badge, LiveDot, Table } from '@/components/ui';
import { CityMap } from '@/components/CityMap';
import { ChartCard, CHART_COLORS, axisProps, tooltipStyle } from '@/components/ChartPrimitives';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { severityColor } from '@/lib/simulation';

export function AccidentPage() {
  const { incidents } = useApp();

  const active = incidents.filter((i) => i.status === 'Active').length;
  const responding = incidents.filter((i) => i.status === 'Responding').length;
  const critical = incidents.filter((i) => i.severity === 'Critical').length;

  const points = incidents.map((i) => ({
    id: i.id, name: i.type, lat: i.lat, lng: i.lng,
    tone: i.severity === 'Critical' ? 'rose' : i.severity === 'Moderate' ? 'amber' : 'emerald',
    label: `${i.severity} · ${i.location} · ${i.status}`,
    radius: i.severity === 'Critical' ? 12 : 8,
  }));

  const byType = ['Vehicle Collision', 'Sudden Stop', 'Road Accident', 'Abnormal Movement'].map((tp) => ({
    type: tp.replace('Vehicle ', ''),
    count: incidents.filter((i) => i.type === tp).length,
  }));

  return (
    <div className="space-y-6">
      <SectionTitle
        title="AI Accident Detection System"
        subtitle="Computer vision detects collisions, sudden stops & abnormal movement in real time"
        icon={<CarFront size={18} />}
        right={<Badge tone="rose" pulse>{active} active</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Incidents Today" value={incidents.length} icon={<AlertTriangle size={18} />} tone="amber" />
        <StatCard label="Active Accidents" value={active} icon={<CarFront size={18} />} tone="rose" />
        <StatCard label="Responding" value={responding} icon={<Siren size={18} />} tone="cyan" />
        <StatCard label="Critical" value={critical} icon={<AlertTriangle size={18} />} tone="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Incident Map</h3>
              <p className="text-xs text-slate-400 mt-0.5">Color = severity · size = severity weight</p>
            </div>
            <Badge tone="cyan"><LiveDot tone="cyan" /> CV scanning</Badge>
          </div>
          <CityMap points={points} height={380} />
        </GlassCard>

        {/* CV FEED SIMULATION */}
        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
            <Video size={16} className="text-cyan-400" /> Computer Vision Feed
          </h3>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-cyan-400/20">
            <div className="absolute inset-0 cc-grid-bg opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Eye size={40} className="text-cyan-400/40" />
            </div>
            <div className="absolute inset-x-0 h-0.5 bg-cyan-400/60 scan-line" />
            <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] text-cyan-300">
              <LiveDot tone="rose" /> CAM-07 · Anna Salai
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-slate-300">
              <span>Analyzing 14 frames/s</span>
              <span className="text-emerald-400">No anomaly</span>
            </div>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            {[
              ['Collision detection', 'Active'],
              ['Lane deviation', 'Active'],
              ['Sudden deceleration', 'Active'],
              ['Debris on road', 'Active'],
            ].map(([k, v], i) => (
              <div key={i} className="flex justify-between p-2 rounded bg-slate-900/40">
                <span className="text-slate-400">{k}</span>
                <span className="text-emerald-400">{v}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* INCIDENT TABLE */}
      <GlassCard className="p-5">
        <SectionTitle title="Detected Incidents" subtitle="All accidents flagged by AI" icon={<AlertTriangle size={18} />} />
        <Table
          headers={['ID', 'Type', 'Location', 'Severity', 'Detected By', 'Time', 'Status']}
          rows={incidents.map((i) => [
            <span className="font-mono text-xs text-slate-400">{i.id}</span>,
            <span className="text-white">{i.type}</span>,
            <span className="text-slate-300 flex items-center gap-1"><MapPin size={11} className="text-cyan-400" /> {i.location}</span>,
            <Badge tone={severityColor(i.severity) as 'emerald' | 'amber' | 'rose'}>{i.severity}</Badge>,
            <span className="text-xs text-slate-400">{i.detectedBy}</span>,
            <span className="tabular-nums text-slate-400">{i.time}</span>,
            <Badge tone={i.status === 'Active' ? 'rose' : i.status === 'Responding' ? 'amber' : 'emerald'}>{i.status}</Badge>,
          ])}
        />
      </GlassCard>

      {/* AUTO RESPONSE */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Siren size={16} className="text-rose-400" /> Auto Emergency Response
          </h3>
          <div className="space-y-2">
            {[
              ['Emergency alert generated', 'Dispatched to 108 control room'],
              ['Location captured', 'Anna Nagar Road, lat 13.085, lng 80.215'],
              ['Nearest hospital identified', 'Apollo Hospital — 2.4 km away'],
              ['Fastest rescue route sent', 'Via Gemini Flyover — ETA 6 min'],
              ['Traffic signals pre-empted', 'Corridor cleared on route'],
            ].map(([k, v], i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-700/40">
                <span className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div>
                  <div className="text-sm text-white">{k}</div>
                  <div className="text-xs text-slate-400">{v}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-emerald-400" /> Nearest Emergency Facilities
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Apollo Hospital', dist: '2.4 km', eta: 6, beds: 12 },
              { name: 'Govt General Hospital', dist: '3.8 km', eta: 9, beds: 24 },
              { name: 'KMC Hospital', dist: '5.1 km', eta: 12, beds: 8 },
            ].map((h, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <Building2 size={14} className="text-emerald-400" /> {h.name}
                  </span>
                  <Badge tone="emerald">{h.beds} beds</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span><MapPin size={11} className="inline mr-1 text-cyan-400" />{h.dist}</span>
                  <span><Route size={11} className="inline mr-1 text-amber-400" />{h.eta} min</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <ChartCard title="Accidents by Type" subtitle="Detected via computer vision this week">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="type" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="count" fill={CHART_COLORS.rose} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
