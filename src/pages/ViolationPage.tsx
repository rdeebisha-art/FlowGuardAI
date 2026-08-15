import { ShieldAlert, Camera, MapPin, Clock, FileImage, Eye } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { GlassCard, StatCard, SectionTitle, Badge, LiveDot } from '@/components/ui';
import { ChartCard, CHART_COLORS, axisProps, tooltipStyle } from '@/components/ChartPrimitives';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const typeTone = (t: string) =>
  t === 'Red Light' ? 'rose' : t === 'No Helmet' ? 'amber' : t === 'Wrong Side' ? 'orange' : t === 'Illegal Parking' ? 'amber' : 'violet';

export function ViolationPage() {
  const { violations } = useApp();

  const totalFines = violations.reduce((a, v) => a + v.fine, 0);
  const byType = ['Red Light', 'No Helmet', 'Wrong Side', 'Illegal Parking', 'Overloading'].map((tp) => ({
    type: tp,
    count: violations.filter((v) => v.type === tp).length,
  }));

  return (
    <div className="space-y-6">
      <SectionTitle
        title="AI Traffic Violation Detection"
        subtitle="Automated enforcement for red-light, helmet, wrong-side & parking violations"
        icon={<ShieldAlert size={18} />}
        right={<Badge tone="rose" pulse>enforcement active</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Violations Today" value={violations.length} icon={<ShieldAlert size={18} />} tone="rose" />
        <StatCard label="Fines Generated" value={`₹${totalFines.toLocaleString()}`} icon={<ShieldAlert size={18} />} tone="amber" />
        <StatCard label="Auto-Challans Issued" value={violations.length} icon={<FileImage size={18} />} tone="cyan" />
        <StatCard label="Repeat Offenders" value={3} icon={<Eye size={18} />} tone="violet" />
      </div>

      {/* EVIDENCE CARDS */}
      <div>
        <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <Camera size={16} className="text-rose-400" /> Violation Records with Evidence
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {violations.map((v) => (
            <GlassCard key={v.id} hover className="overflow-hidden">
              {/* simulated evidence photo */}
              <div className="relative aspect-video bg-slate-950 border-b border-slate-700/40 overflow-hidden">
                <div className="absolute inset-0 cc-grid-bg opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={36} className="text-slate-600" />
                </div>
                <div className="absolute inset-x-0 h-0.5 bg-rose-400/50 scan-line" />
                <div className="absolute top-2 left-2 text-[10px] text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded">EVIDENCE</div>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-slate-400">
                  <span>{v.vehicleId}</span>
                  <span>{v.time}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge tone={typeTone(v.type) as 'rose' | 'amber' | 'orange' | 'violet'}>{v.type}</Badge>
                  <span className="text-xs text-slate-500 font-mono">{v.id}</span>
                </div>
                <div className="text-sm text-white font-mono mb-1">{v.vehicleId}</div>
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                  <MapPin size={11} className="text-cyan-400" /> {v.location}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                  <Clock size={11} className="text-amber-400" /> {v.time}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700/40">
                  <span className="text-xs text-slate-400">Fine</span>
                  <span className="text-sm font-bold text-rose-400">₹{v.fine}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <ChartCard title="Violations by Type" subtitle="Automated detection breakdown (today)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="type" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="count" fill={CHART_COLORS.rose} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <GlassCard className="p-5 border-emerald-400/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white">Enforcement Impact</span>
              <Badge tone="emerald"><LiveDot tone="emerald" /> 30-day trend</Badge>
            </div>
            <p className="text-sm text-slate-300">
              Since AI enforcement went live: <span className="text-emerald-400 font-medium">red-light violations down 62%</span>,
              helmet compliance up to 91%, and average fine-collection time cut from 14 days to 2 days via instant e-challans.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
