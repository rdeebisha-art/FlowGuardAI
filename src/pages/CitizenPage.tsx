import { useState, useRef } from 'react';
import {
  MessageSquareWarning, MapPin, Send, ThumbsUp, CheckCircle2,
  TrafficCone, CarFront, Construction, ShieldAlert, Siren, Crosshair, Loader2, Camera,
} from 'lucide-react';
import { GlassCard, StatCard, SectionTitle, Badge, LiveDot, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';
import { supabase, uploadEvidence, CitizenReportRow } from '@/lib/supabase';
import { useRealtimeTable } from '@/lib/useRealtime';

const categoryIcon = (c: string) => {
  switch (c) {
    case 'Traffic Jam': return <TrafficCone size={16} />;
    case 'Accident': return <CarFront size={16} />;
    case 'Road Damage': return <Construction size={16} />;
    case 'Illegal Parking': return <ShieldAlert size={16} />;
    case 'Broken Signal': return <Siren size={16} />;
    default: return <MessageSquareWarning size={16} />;
  }
};

const statusTone = (s: string) =>
  s === 'Resolved' ? 'emerald' : s === 'Under Review' ? 'amber' : 'cyan';

const CATEGORIES = ['Traffic Jam', 'Accident', 'Road Damage', 'Illegal Parking', 'Broken Signal'] as const;

export function CitizenPage() {
  const { rows: reports, loading, error, reload } = useRealtimeTable<CitizenReportRow>('citizen_reports', { order: 'created_at' });
  const [form, setForm] = useState<{ category: typeof CATEGORIES[number]; location: string; description: string }>({
    category: 'Traffic Jam', location: '', description: '',
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const fileRef = useRef<HTMLInputElement>(null);

  const resolved = reports.filter((r) => r.status === 'Resolved').length;
  const review = reports.filter((r) => r.status === 'Under Review').length;
  const filtered = filter === 'All' ? reports : reports.filter((r) => r.category === filter);

  const captureGps = () => {
    if (!navigator.geolocation) {
      setSubmitError('Geolocation not supported by this browser.');
      return;
    }
    setLocating(true);
    setSubmitError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (!form.location) setForm((f) => ({ ...f, location: `GPS ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }));
        setLocating(false);
      },
      (err) => {
        setSubmitError(err.code === 1 ? 'Location permission denied.' : 'Could not get location.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setSubmitting(true);
    setSubmitError(null);
    const url = await uploadEvidence(file);
    if (url) setPhotoUrl(url);
    else setSubmitError('Photo upload failed. Report will be submitted without a photo.');
    setSubmitting(false);
  };

  const submit = async () => {
    if (!form.location || !form.description) return;
    setSubmitting(true);
    setSubmitError(null);
    const { error: insError } = await supabase.from('citizen_reports').insert({
      category: form.category,
      location: form.location,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      description: form.description,
      photo_url: photoUrl,
      status: 'Submitted',
      upvotes: 0,
    });
    setSubmitting(false);
    if (insError) {
      setSubmitError(insError.message);
      return;
    }
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 2500);
    setForm({ category: 'Traffic Jam', location: '', description: '' });
    setCoords(null);
    setPhotoUrl(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const upvote = async (r: CitizenReportRow) => {
    await supabase.from('citizen_reports').update({ upvotes: r.upvotes + 1 }).eq('id', r.id);
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Citizen Reporting System"
        subtitle="Live reports stored in a real database — synced instantly across every viewer"
        icon={<MessageSquareWarning size={18} />}
        right={<Badge tone="emerald" pulse><LiveDot tone="emerald" /> realtime DB</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Reports" value={reports.length} icon={<MessageSquareWarning size={18} />} tone="amber" />
        <StatCard label="Under Review" value={review} icon={<MessageSquareWarning size={18} />} tone="cyan" />
        <StatCard label="Resolved" value={resolved} icon={<CheckCircle2 size={18} />} tone="emerald" />
        <StatCard label="Connection" value="LIVE" icon={<LiveDot tone="emerald" />} tone="emerald" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* REPORT FORM */}
        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-1">Submit a Report</h3>
          <p className="text-xs text-emerald-400 mb-4 flex items-center gap-1"><LiveDot tone="emerald" /> saved to real database</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, category: c })}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2.5 rounded-lg border text-[10px] transition-all',
                      form.category === c ? 'bg-amber-500/10 border-amber-400/40 text-amber-300' : 'bg-slate-900/40 border-slate-700/40 text-slate-400 hover:border-slate-600',
                    )}
                  >
                    {categoryIcon(c)}
                    <span className="leading-tight">{c}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Location</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Anna Nagar 3rd Ave"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-10 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40"
                />
                <button
                  onClick={captureGps}
                  title="Use my GPS location"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                >
                  {locating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
                </button>
              </div>
              {coords && (
                <div className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={11} /> GPS locked: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue…"
                rows={3}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Photo Evidence (real upload)</label>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhoto} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-700/60 bg-slate-950/40 flex flex-col items-center justify-center overflow-hidden hover:border-cyan-400/30 transition-colors"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="evidence" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={28} className="text-slate-500 mb-1" />
                    <span className="text-xs text-slate-500">Tap to take / upload photo</span>
                  </>
                )}
              </button>
            </div>

            {submitError && <div className="text-xs text-rose-400">{submitError}</div>}

            <button
              onClick={submit}
              disabled={submitting || justSubmitted || !form.location || !form.description}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-900 font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-shadow hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]"
            >
              {justSubmitted ? <><CheckCircle2 size={16} /> Report Saved to DB</>
                : submitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                : <><Send size={16} /> Submit Report</>}
            </button>
            {justSubmitted && (
              <div className="text-center text-xs text-emerald-400 animate-rise flex items-center justify-center gap-1">
                <CheckCircle2 size={14} /> Visible now to every viewer in realtime
              </div>
            )}
          </div>
        </GlassCard>

        {/* REPORTS LIST */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              Community Reports <LiveDot tone="emerald" />
            </h3>
            <div className="flex gap-1 flex-wrap">
              {['All', ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[11px] border transition-colors',
                    filter === c ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300' : 'bg-slate-900/40 border-slate-700/40 text-slate-400 hover:text-white',
                  )}
                >
                  {c === 'All' ? 'All' : c.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="text-xs text-rose-400 mb-3">DB error: {error}</div>}

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading live reports…
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<MessageSquareWarning size={32} />} title="No reports yet" subtitle="Be the first to report a traffic issue." />
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filtered.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40 hover:border-slate-600 transition-colors animate-rise">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                        {categoryIcon(r.category)}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-white">{r.category}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{r.id.slice(0, 8)}</div>
                      </div>
                    </div>
                    <Badge tone={statusTone(r.status) as 'emerald' | 'amber' | 'cyan'}>{r.status}</Badge>
                  </div>
                  {r.photo_url && (
                    <img src={r.photo_url} alt="evidence" className="w-full h-32 object-cover rounded-lg mb-2 border border-slate-700/40" />
                  )}
                  <p className="text-sm text-slate-300 mb-2">{r.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={11} className="text-cyan-400" /> {r.location}</span>
                    <span>{fmtTime(r.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/40">
                    <button onClick={() => upvote(r)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors">
                      <ThumbsUp size={13} /> {r.upvotes} upvotes
                    </button>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <LiveDot tone="cyan" /> realtime
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={reload} className="mt-3 text-xs text-slate-500 hover:text-cyan-400 transition-colors">Reload from DB</button>
        </GlassCard>
      </div>
    </div>
  );
}
