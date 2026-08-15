import {
  Cpu, CarFront, Siren, AlertTriangle, TrafficCone, Construction, MessageSquareWarning,
  Activity, Shield, Bell, TrendingUp, Zap, Wallet,
} from 'lucide-react';
import { useApp, AppNotification } from '@/lib/AppContext';
import { GlassCard, StatCard, SectionTitle, Badge, Table, LiveDot } from '@/components/ui';
import { ChartCard, CHART_COLORS, axisProps, tooltipStyle } from '@/components/ChartPrimitives';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import { hourlyTrafficData, weeklyCongestionTrend } from '@/lib/simulation';
import { cn } from '@/lib/utils';
import { useRealtimeTable } from '@/lib/useRealtime';
import { CitizenReportRow, RoadDamageRow, ParkingReservationRow } from '@/lib/supabase';
import { MapPin } from 'lucide-react';

export function AdminPage() {
  const { zones, signals, emergencies, incidents, roadDamages, violations, parkingLots, buses, citizenReports, notifications } = useApp();
  const { rows: dbReports } = useRealtimeTable<CitizenReportRow>('citizen_reports', { order: 'created_at', limit: 8 });
  const { rows: dbDamage } = useRealtimeTable<RoadDamageRow>('road_damage', { order: 'created_at', limit: 50 });
  const { rows: dbReservations } = useRealtimeTable<ParkingReservationRow>('parking_reservations', { order: 'created_at', limit: 50 });

  const totalVehicles = zones.reduce((a, z) => a + z.vehicles, 0);
  const activeAlerts = notifications.length;
  const emergencyCases = emergencies.length;
  const accidents = incidents.length;
  const signalEfficiency = 87;
  const damageReports = roadDamages.length;
  const complaints = citizenReports.length;

  const systemHealth = [
    { name: 'AI Engine', value: 98, fill: CHART_COLORS.cyan },
    { name: 'IoT Sensors', value: 94, fill: CHART_COLORS.emerald },
    { name: 'CV Pipeline', value: 91, fill: CHART_COLORS.amber },
    { name: 'Network', value: 96, fill: CHART_COLORS.blue },
  ];

  const moduleDist = [
    { name: 'Monitoring', value: 100, color: CHART_COLORS.cyan },
    { name: 'Prediction', value: 92, color: CHART_COLORS.violet },
    { name: 'Signals', value: 87, color: CHART_COLORS.amber },
    { name: 'Emergency', value: 95, color: CHART_COLORS.rose },
    { name: 'Parking', value: 78, color: CHART_COLORS.emerald },
    { name: 'Transport', value: 84, color: CHART_COLORS.blue },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Admin Smart City Control Center"
        subtitle="Unified operations dashboard for the entire FlowGuard AI platform"
        icon={<Cpu size={18} />}
        right={<Badge tone="rose" pulse>command mode</Badge>}
      />

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Vehicles Monitored" value={totalVehicles.toLocaleString()} icon={<CarFront size={18} />} tone="cyan" delta="+3.2%" />
        <StatCard label="Active Alerts" value={activeAlerts} icon={<Bell size={18} />} tone="amber" />
        <StatCard label="Emergency Cases" value={emergencyCases} icon={<Siren size={18} />} tone="rose" />
        <StatCard label="Accident Reports" value={accidents} icon={<AlertTriangle size={18} />} tone="orange" />
        <StatCard label="Signal Efficiency" value={`${signalEfficiency}%`} icon={<TrafficCone size={18} />} tone="emerald" delta="+5%" />
        <StatCard label="Road Damage Reports" value={damageReports} icon={<Construction size={18} />} tone="amber" />
        <StatCard label="Citizen Complaints" value={complaints} icon={<MessageSquareWarning size={18} />} tone="violet" />
        <StatCard label="Live DB Reports" value={dbReports.length} icon={<LiveDot tone="emerald" />} tone="emerald" delta="realtime" />
        <StatCard label="Live DB Damage" value={dbDamage.length} icon={<Construction size={18} />} tone="amber" />
        <StatCard label="Live Reservations" value={dbReservations.length} icon={<Wallet size={18} />} tone="cyan" />
      </div>

      {/* LIVE NOTIFICATIONS + DB FEED + SYSTEM HEALTH */}
      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-1">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Bell size={16} className="text-amber-400" /> Live Notifications
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {notifications.map((n: AppNotification) => (
              <div key={n.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-700/40">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('w-2 h-2 rounded-full', n.level === 'critical' ? 'bg-rose-500' : n.level === 'warning' ? 'bg-amber-500' : 'bg-cyan-500')} />
                  <span className="text-sm font-medium text-white">{n.title}</span>
                  <span className="ml-auto text-[10px] text-slate-500">{n.time}</span>
                </div>
                <p className="text-xs text-slate-400">{n.message}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-1">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <MessageSquareWarning size={16} className="text-emerald-400" /> Live Citizen Reports <LiveDot tone="emerald" />
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {dbReports.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No live reports yet.</p>
            ) : dbReports.map((r) => (
              <div key={r.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-700/40 animate-rise">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{r.category}</span>
                  <Badge tone={r.status === 'Resolved' ? 'emerald' : r.status === 'Under Review' ? 'amber' : 'cyan'}>{r.status}</Badge>
                </div>
                <p className="text-xs text-slate-400 truncate">{r.description}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                  <MapPin size={10} className="text-cyan-400" /> {r.location}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <ChartCard title="System Health" subtitle="Real-time subsystem performance" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart innerRadius="25%" outerRadius="100%" data={systemHealth} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={8} />
              <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right"
                formatter={(v) => <span className="text-xs text-slate-300">{v}</span>} />
              <Tooltip {...tooltipStyle} />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ANALYTICS GRID */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="City Traffic Flow (24h)" subtitle="Vehicles & density over time">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminVeh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="hour" {...axisProps} interval={3} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="vehicles" stroke={CHART_COLORS.cyan} strokeWidth={2} fill="url(#adminVeh)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Congestion & Incidents" subtitle="Trend across the week">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyCongestionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="day" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Legend formatter={(v) => <span className="text-xs text-slate-300">{v}</span>} />
              <Bar dataKey="avgCongestion" fill={CHART_COLORS.cyan} radius={[4, 4, 0, 0]} name="Avg Congestion" />
              <Bar dataKey="incidents" fill={CHART_COLORS.rose} radius={[4, 4, 0, 0]} name="Incidents" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Module Performance" subtitle="Health score per AI module">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={moduleDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {moduleDist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend formatter={(v) => <span className="text-xs text-slate-300">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Operations Summary" subtitle="Counts across all subsystems">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={[
                { name: 'Zones', value: zones.length },
                { name: 'Signals', value: signals.length },
                { name: 'Emergency', value: emergencies.length },
                { name: 'Incidents', value: incidents.length },
                { name: 'Damage', value: roadDamages.length },
                { name: 'Violations', value: violations.length },
                { name: 'Parking', value: parkingLots.length },
                { name: 'Buses', value: buses.length },
                { name: 'Reports', value: citizenReports.length },
              ]}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="name" {...axisProps} angle={-30} textAnchor="end" height={50} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" fill={CHART_COLORS.violet} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ALERTS TABLE */}
      <GlassCard className="p-5">
        <SectionTitle title="Critical Alerts Log" subtitle="All active & recent alerts" icon={<Shield size={18} />}
          right={<Badge tone="rose"><LiveDot tone="rose" /> monitoring</Badge>} />
        <Table
          headers={['Source', 'Message', 'Level', 'Time']}
          rows={notifications.map((n) => [
            <span className="font-medium text-white">{n.title}</span>,
            <span className="text-slate-300">{n.message}</span>,
            <Badge tone={n.level === 'critical' ? 'rose' : n.level === 'warning' ? 'amber' : 'cyan'}>{n.level}</Badge>,
            <span className="text-xs text-slate-400">{n.time}</span>,
          ])}
        />
      </GlassCard>

      {/* ANALYTICS REPORT */}
      <GlassCard strong className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Daily Analytics Report</h3>
            <p className="text-xs text-slate-400">Auto-generated · {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Avg wait time', value: '42s', change: '-55%', icon: <Zap size={16} />, tone: 'emerald' },
            { label: 'Fuel consumed', value: '145 L', change: '-48%', icon: <TrendingUp size={16} />, tone: 'cyan' },
            { label: 'Emergency response', value: '7.2 min', change: '-40%', icon: <Siren size={16} />, tone: 'rose' },
            { label: 'Citizen satisfaction', value: '4.6/5', change: '+0.3', icon: <Activity size={16} />, tone: 'amber' },
          ].map((m, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3',
                m.tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                m.tone === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                m.tone === 'rose' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400')}>
                {m.icon}
              </div>
              <div className="text-2xl font-bold text-white">{m.value}</div>
              <div className="text-xs text-slate-400 mt-1">{m.label}</div>
              <div className={cn('text-xs mt-1 font-medium', m.change.startsWith('-') ? 'text-emerald-400' : 'text-emerald-400')}>{m.change} vs last week</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
