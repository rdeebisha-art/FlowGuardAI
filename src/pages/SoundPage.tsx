import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioLines, Volume2, AlertTriangle, MapPin, Mic, Activity, MicOff } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { GlassCard, StatCard, SectionTitle, Badge, LiveDot } from '@/components/ui';
import { ChartCard, CHART_COLORS, axisProps, tooltipStyle } from '@/components/ChartPrimitives';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const riskTone = (r: string) =>
  r === 'Critical' ? 'rose' : r === 'High' ? 'orange' : r === 'Medium' ? 'amber' : 'emerald';

interface LiveSoundEvent {
  id: string;
  type: string;
  db: number;
  risk: string;
  time: string;
}

// Classify a loud sound by its frequency profile into a likely event type.
function classifyEvent(freqData: Uint8Array): string {
  const len = freqData.length;
  const lowAvg = avg(freqData.slice(0, Math.floor(len * 0.15)));
  const midAvg = avg(freqData.slice(Math.floor(len * 0.15), Math.floor(len * 0.5)));
  const highAvg = avg(freqData.slice(Math.floor(len * 0.5)));
  if (highAvg > 70 && midAvg < 60) return 'Glass Breaking';
  if (lowAvg > 90 && midAvg > 80) return 'Crash Sound';
  if (midAvg > 85 && lowAvg > 70) return 'Horn Explosion';
  if (lowAvg > 80 && highAvg > 60) return 'Screaming';
  if (midAvg > 70 && midAvg < 85) return 'Siren Detected';
  return 'Heavy Traffic Noise';
}

function avg(arr: Uint8Array): number {
  if (!arr.length) return 0;
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function dbRisk(db: number): string {
  if (db > 95) return 'Critical';
  if (db > 80) return 'High';
  if (db > 65) return 'Medium';
  return 'Low';
}

export function SoundPage() {
  const { soundEvents } = useApp();
  const [listening, setListening] = useState(false);
  const [denied, setDenied] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(48).fill(8));
  const [liveEvents, setLiveEvents] = useState<LiveSoundEvent[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastEventRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setListening(false);
    setBars(Array(48).fill(8));
    setCurrentDb(0);
  }, []);

  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buf);

    // sample 48 bars across the spectrum
    const step = Math.floor(buf.length / 48) || 1;
    const sampled = Array.from({ length: 48 }, (_, i) => {
      const slice = buf.slice(i * step, (i + 1) * step);
      return Math.max(8, Math.round((avg(slice) / 255) * 100));
    });
    setBars(sampled);

    // compute decibels from RMS-ish value
    const rms = Math.sqrt(avg(buf) / 255);
    const db = Math.round(20 * Math.log10(Math.max(0.0001, rms)) + 90);
    setCurrentDb(Math.max(0, db));

    // detect loud spike -> log an event (throttled to 1 per 2.5s)
    const now = Date.now();
    if (db > 72 && now - lastEventRef.current > 2500) {
      lastEventRef.current = now;
      const type = classifyEvent(buf);
      const risk = dbRisk(db);
      const evt: LiveSoundEvent = {
        id: `LIVE-${now}`,
        type,
        db,
        risk,
        time: new Date().toLocaleTimeString(),
      };
      setLiveEvents((prev) => [evt, ...prev].slice(0, 12));
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    try {
      setDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;
      setListening(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setDenied(true);
    }
  }, [tick]);

  useEffect(() => () => stop(), [stop]);

  const dbTone = currentDb > 95 ? 'rose' : currentDb > 80 ? 'orange' : currentDb > 65 ? 'amber' : 'emerald';
  const byType = soundEvents.map((s) => ({ type: s.type.replace(' Detected', ''), confidence: s.confidence }));

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Sound-Based Traffic Incident Detection"
        subtitle="Real microphone analysis + AI audio event classification"
        icon={<AudioLines size={18} />}
        right={
          <Badge tone={listening ? 'rose' : 'amber'} pulse={listening}>
            {listening ? <><LiveDot tone="rose" /> REAL MIC LIVE</> : 'simulated'}
          </Badge>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Audio Sensors" value={48} icon={<Mic size={18} />} tone="amber" />
        <StatCard label="Simulated Events (24h)" value={soundEvents.length} icon={<Activity size={18} />} tone="cyan" />
        <StatCard label="Real Detected Now" value={liveEvents.length} icon={<AlertTriangle size={18} />} tone={dbTone as 'rose' | 'amber' | 'emerald' | 'orange'} />
        <StatCard label="Live Sound Level" value={currentDb} unit="dB" icon={<Volume2 size={18} />} tone={dbTone as 'rose' | 'amber' | 'emerald' | 'orange'} />
      </div>

      {/* REAL MIC ANALYZER */}
      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <AudioLines size={16} className="text-amber-400" /> {listening ? 'Real Microphone Spectrum' : 'Simulated Audio Spectrum'}
            </h3>
            <div className="flex items-center gap-2">
              {listening && <Badge tone={dbTone as 'rose' | 'amber' | 'emerald' | 'orange'} pulse={currentDb > 80}>{currentDb} dB</Badge>}
              <button
                onClick={listening ? stop : start}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  listening
                    ? 'bg-rose-500/15 text-rose-300 border-rose-400/40 hover:bg-rose-500/25'
                    : 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/25'
                }`}
              >
                {listening ? <><MicOff size={14} /> Stop Mic</> : <><Mic size={14} /> Start Real Mic</>}
              </button>
            </div>
          </div>

          {denied && (
            <div className="mb-3 p-3 rounded-lg bg-rose-500/10 border border-rose-400/30 text-xs text-rose-300">
              Microphone access denied. Allow mic permission in your browser to use real-time sound detection.
            </div>
          )}

          <div className="flex items-end justify-between gap-1 h-40 bg-slate-950/60 rounded-xl p-4 border border-slate-700/40">
            {bars.map((h, i) => {
              const isPeak = listening && h > 75;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all duration-75 ${isPeak ? 'bg-rose-400' : 'bg-gradient-to-t from-cyan-500 to-cyan-300'}`}
                  style={{ height: `${h}%`, opacity: 0.85 }}
                />
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-xs text-slate-400">
            <span>0 Hz</span><span>4 kHz</span><span>8 kHz</span><span>16 kHz</span>
          </div>
          {listening && (
            <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
              <LiveDot tone={currentDb > 80 ? 'rose' : 'cyan'} />
              {currentDb > 72 ? <span className="text-rose-400">Loud sound detected — classifying…</span> : <span>Analyzing real audio in real time. Make a loud noise to trigger detection.</span>}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Detection Capabilities</h3>
          <div className="space-y-2">
            {[
              ['Crash sound', 'rose'],
              ['Vehicle horn explosion', 'amber'],
              ['Screaming', 'rose'],
              ['Glass breaking', 'orange'],
              ['Siren detection', 'cyan'],
              ['Heavy traffic noise', 'emerald'],
            ].map(([label, tone], i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-700/40">
                <span className="text-sm text-slate-300">{label}</span>
                <Badge tone={tone as 'rose' | 'amber' | 'orange' | 'cyan' | 'emerald'}>trained</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* REAL DETECTED EVENTS */}
      {liveEvents.length > 0 && (
        <GlassCard className="p-5 border-rose-400/20">
          <SectionTitle title="Real Detected Events" subtitle="Captured from your microphone just now" icon={<Mic size={18} />}
            right={<Badge tone="rose" pulse>live capture</Badge>} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveEvents.map((e) => (
              <div key={e.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40 animate-rise">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{e.type}</span>
                  <Badge tone={riskTone(e.risk) as 'emerald' | 'amber' | 'orange' | 'rose'} pulse={e.risk === 'Critical'}>{e.risk}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Volume2 size={11} className="text-cyan-400" /> {e.db} dB</span>
                  <span className="tabular-nums">{e.time}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* SIMULATED EVENTS */}
      <GlassCard className="p-5">
        <SectionTitle title="Simulated Sound Events" subtitle="City-wide AI audio classification (simulated feed)" icon={<AudioLines size={18} />} />
        <div className="grid sm:grid-cols-2 gap-3">
          {soundEvents.map((s) => (
            <div key={s.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40 hover:border-amber-400/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{s.type}</span>
                <Badge tone={riskTone(s.riskLevel) as 'emerald' | 'amber' | 'orange' | 'rose'} pulse={s.riskLevel === 'Critical'}>{s.riskLevel} risk</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><MapPin size={11} className="text-cyan-400" /> {s.location}</span>
                <span className="tabular-nums">{s.time}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>AI confidence</span>
                  <span className="tabular-nums">{s.confidence}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-700/40 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${s.confidence}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard strong className="p-5 border-rose-400/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white">Critical Alert</span>
              <Badge tone="rose" pulse>auto-generated</Badge>
            </div>
            <p className="text-sm text-slate-300">
              Possible accident detected at <span className="text-white font-medium">Anna Nagar Road</span>.
              Crash sound with 94% confidence. Glass-breaking signature identified. Emergency response recommended —
              nearest ambulance dispatched, ETA 7 minutes.
            </p>
          </div>
        </div>
      </GlassCard>

      <ChartCard title="Detection Confidence by Event Type" subtitle="AI audio classification accuracy">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis type="number" {...axisProps} domain={[0, 100]} />
            <YAxis type="category" dataKey="type" {...axisProps} width={120} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="confidence" fill={CHART_COLORS.amber} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
