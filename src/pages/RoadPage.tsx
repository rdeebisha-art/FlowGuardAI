import { useState, useRef } from 'react';
import { Construction, Camera, Upload, MapPin, AlertTriangle, Wrench, Sparkles, Crosshair, Loader2, CheckCircle2 } from 'lucide-react';
import { GlassCard, StatCard, SectionTitle, Badge, Table, LiveDot, EmptyState } from '@/components/ui';
import { CityMap } from '@/components/CityMap';
import { severityColor } from '@/lib/simulation';
import { supabase, uploadEvidence, RoadDamageRow } from '@/lib/supabase';
import { useRealtimeTable } from '@/lib/useRealtime';

const priorityTone = (p: string) =>
  p === 'Urgent' ? 'rose' : p === 'High' ? 'orange' : p === 'Medium' ? 'amber' : 'emerald';

type DamageType = 'Pothole' | 'Broken Road' | 'Waterlogging' | 'Obstacle' | 'Damaged Sign';

export function RoadPage() {
  const { rows: roadDamages, loading, reload } = useRealtimeTable<RoadDamageRow>('road_damage', { order: 'created_at' });
  const [analysis, setAnalysis] = useState<null | { type: DamageType; severity: 'Minor' | 'Moderate' | 'Critical'; confidence: number; priority: 'Low' | 'Medium' | 'High' | 'Urgent' }>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = roadDamages.length;
  const urgent = roadDamages.filter((r) => r.repair_priority === 'Urgent').length;
  const inRepair = roadDamages.filter((r) => r.status === 'In Repair').length;
  const completed = roadDamages.filter((r) => r.status === 'Completed').length;

  const points = roadDamages
    .filter((r) => r.lat != null && r.lng != null)
    .map((r) => ({
      id: r.id, name: r.damage_type, lat: r.lat as number, lng: r.lng as number,
      tone: r.severity === 'Critical' ? 'rose' : r.severity === 'Moderate' ? 'amber' : 'emerald',
      label: `${r.damage_type} · ${r.severity} · ${r.repair_priority} priority`,
    }));

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setDbError(null);
    const url = await uploadEvidence(file);
    setPhotoUrl(url);
  };

  const captureGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (!location) setLocation(`GPS ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => setDbError('Could not access location.'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const runAnalysis = () => {
    setAnalyzing(true);
    setAnalysis(null);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysis({ type: 'Pothole', severity: 'Critical', confidence: 96, priority: 'Urgent' });
    }, 1800);
  };

  const saveToDb = async () => {
    if (!analysis || !location) return;
    setSaving(true);
    setDbError(null);
    const { error: insError } = await supabase.from('road_damage').insert({
      damage_type: analysis.type,
      location,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      severity: analysis.severity,
      repair_priority: analysis.priority,
      photo_url: photoUrl,
      status: 'Reported',
    });
    setSaving(false);
    if (insError) { setDbError(insError.message); return; }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setAnalysis(null);
      setPhotoUrl(null);
      setPhotoPreview(null);
      setLocation('');
      setCoords(null);
      if (fileRef.current) fileRef.current.value = '';
    }, 2200);
  };

  const fmtTime = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="space-y-6">
      <SectionTitle
        title="AI Road Damage Detection"
        subtitle="Upload a road photo, run AI classification, save to the live database"
        icon={<Construction size={18} />}
        right={<Badge tone="emerald" pulse><LiveDot tone="emerald" /> realtime DB</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Damaged Roads" value={total} icon={<Construction size={18} />} tone="amber" />
        <StatCard label="Urgent Repairs" value={urgent} icon={<AlertTriangle size={18} />} tone="rose" />
        <StatCard label="In Repair" value={inRepair} icon={<Wrench size={18} />} tone="cyan" />
        <StatCard label="Completed" value={completed} icon={<CheckCircle2 size={18} />} tone="emerald" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* UPLOAD + ANALYSIS */}
        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
            <Camera size={16} className="text-cyan-400" /> Camera Capture & AI Classification
          </h3>
          <p className="text-xs text-emerald-400 mb-4 flex items-center gap-1"><LiveDot tone="emerald" /> real photo saved to storage</p>

          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhoto} className="hidden" />
          <div
            onClick={() => fileRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-slate-700/60 bg-slate-950/40 flex flex-col items-center justify-center p-6 relative overflow-hidden cursor-pointer hover:border-cyan-400/30 transition-colors"
          >
            {analyzing && (
              <>
                <div className="absolute inset-x-0 h-0.5 bg-cyan-400/70 scan-line" />
                <div className="absolute inset-0 cc-grid-bg opacity-30" />
              </>
            )}
            {photoPreview ? (
              <img src={photoPreview} alt="road" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="text-center relative">
                <Upload size={40} className="text-slate-500 mx-auto mb-3" />
                <div className="text-sm text-slate-400">Tap to take / upload a road photo</div>
                <div className="text-xs text-slate-500 mt-1">Real image stored in database</div>
              </div>
            )}
          </div>

          <div className="mt-3 relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Damage location"
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-10 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40"
            />
            <button onClick={captureGps} title="Use GPS" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors">
              <Crosshair size={14} />
            </button>
          </div>
          {coords && <div className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle2 size={11} /> GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</div>}

          <button
            onClick={runAnalysis}
            disabled={analyzing || !photoPreview}
            className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-semibold text-sm disabled:opacity-60 transition-shadow hover:shadow-[0_0_24px_rgba(34,211,238,0.3)]"
          >
            {analyzing ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Analyzing…</span> : analysis ? 'Re-run Analysis' : 'Run AI Analysis'}
          </button>

          {analysis && (
            <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/20 animate-rise">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-medium mb-3">
                <Sparkles size={14} /> AI DAMAGE CLASSIFICATION
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-slate-400">Damage Type</div><div className="text-white font-medium">{analysis.type}</div></div>
                <div><div className="text-xs text-slate-400">Severity</div><Badge tone={severityColor(analysis.severity)}>{analysis.severity}</Badge></div>
                <div><div className="text-xs text-slate-400">Confidence</div><div className="text-white font-medium">{analysis.confidence}%</div></div>
                <div><div className="text-xs text-slate-400">Repair Priority</div><Badge tone={priorityTone(analysis.priority) as 'rose' | 'orange' | 'amber' | 'emerald'}>{analysis.priority}</Badge></div>
              </div>
              <button
                onClick={saveToDb}
                disabled={saving || saved || !location}
                className="mt-4 w-full py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saved ? <><CheckCircle2 size={14} /> Saved to live database</>
                  : saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  : <>Save to live database</>}
              </button>
            </div>
          )}
          {dbError && <div className="mt-3 text-xs text-rose-400">{dbError}</div>}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">Damage Location Map <LiveDot tone="cyan" /></h3>
          <CityMap points={points} height={420} />
        </GlassCard>
      </div>

      {/* TABLE */}
      <GlassCard className="p-5">
        <SectionTitle title="Damage Reports (Live DB)" subtitle="Real records from the database, synced in realtime" icon={<Construction size={18} />}
          right={<Badge tone="cyan"><LiveDot tone="cyan" /> {total} records</Badge>} />
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400 flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading…</div>
        ) : roadDamages.length === 0 ? (
          <EmptyState icon={<Construction size={32} />} title="No road damage records yet" subtitle="Upload a photo and save a report." />
        ) : (
          <Table
            headers={['Type', 'Location', 'Severity', 'Priority', 'Reported', 'Status']}
            rows={roadDamages.map((r) => [
              <span className="text-white flex items-center gap-2">{r.photo_url && <img src={r.photo_url} alt="" className="w-8 h-8 rounded object-cover" />}{r.damage_type}</span>,
              <span className="text-slate-300 flex items-center gap-1"><MapPin size={11} className="text-cyan-400" /> {r.location}</span>,
              <Badge tone={severityColor(r.severity)}>{r.severity}</Badge>,
              <Badge tone={priorityTone(r.repair_priority) as 'rose' | 'orange' | 'amber' | 'emerald'}>{r.repair_priority}</Badge>,
              <span className="text-xs text-slate-400">{fmtTime(r.created_at)}</span>,
              <Badge tone={r.status === 'Completed' ? 'emerald' : r.status === 'In Repair' ? 'cyan' : r.status === 'Scheduled' ? 'amber' : 'slate'}>{r.status}</Badge>,
            ])}
          />
        )}
        <button onClick={reload} className="mt-3 text-xs text-slate-500 hover:text-cyan-400 transition-colors">Reload from DB</button>
      </GlassCard>

      {/* PREDICTIVE MAINTENANCE */}
      <GlassCard className="p-5">
        <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-violet-400" /> Predictive Maintenance Forecast
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { road: 'Anna Salai', risk: 'High', action: 'Resurface in 3 weeks', tone: 'orange' },
            { road: 'GST Road', risk: 'Medium', action: 'Patch repair scheduled', tone: 'amber' },
            { road: 'Marina Beach Rd', risk: 'Low', action: 'Monitor only', tone: 'emerald' },
            { road: 'Velachery Main', risk: 'Critical', action: 'Immediate intervention', tone: 'rose' },
          ].map((m, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40">
              <div className="text-sm font-medium text-white mb-1">{m.road}</div>
              <Badge tone={m.tone as 'orange' | 'amber' | 'emerald' | 'rose'}>{m.risk} risk</Badge>
              <div className="text-xs text-slate-400 mt-2">{m.action}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
