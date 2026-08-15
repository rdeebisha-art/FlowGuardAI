import { useState } from 'react';
import { ParkingSquare, MapPin, Clock, Wallet, Car, Check, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { GlassCard, StatCard, SectionTitle, Badge, ProgressBar, LiveDot, EmptyState } from '@/components/ui';
import { CityMap } from '@/components/CityMap';
import { supabase, ParkingReservationRow } from '@/lib/supabase';
import { useRealtimeTable } from '@/lib/useRealtime';

export function ParkingPage() {
  const { parkingLots } = useApp();
  const { rows: reservations, loading } = useRealtimeTable<ParkingReservationRow>('parking_reservations', { order: 'created_at' });
  const [selected, setSelected] = useState(parkingLots[0]?.id || '');
  const [hours, setHours] = useState(2);
  const [reserved, setReserved] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reservedSlot, setReservedSlot] = useState<number | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const totalSlots = parkingLots.reduce((a, p) => a + p.totalSlots, 0);
  const occupied = parkingLots.reduce((a, p) => a + p.occupied, 0);
  const available = totalSlots - occupied;

  const lot = parkingLots.find((p) => p.id === selected) || parkingLots[0];
  const lotAvail = lot ? lot.totalSlots - lot.occupied : 0;
  const cost = lot ? lot.pricePerHour * hours : 0;

  const points = parkingLots.map((p) => ({
    id: p.id, name: p.name, lat: p.lat, lng: p.lng,
    tone: p.occupied / p.totalSlots > 0.85 ? 'rose' : p.occupied / p.totalSlots > 0.6 ? 'amber' : 'emerald',
    label: `${p.totalSlots - p.occupied} / ${p.totalSlots} available · ₹${p.pricePerHour}/hr`,
    radius: 9,
  }));

  const reserve = async () => {
    if (!lot || lotAvail === 0) return;
    setReserving(true);
    setDbError(null);
    const slot = Math.floor(Math.random() * lotAvail) + 1;
    const { error } = await supabase.from('parking_reservations').insert({
      lot_id: lot.id,
      lot_name: lot.name,
      location: lot.location,
      hours,
      cost,
      slot_number: slot,
      status: 'Reserved',
    });
    setReserving(false);
    if (error) { setDbError(error.message); return; }
    setReserved(true);
    setReservedSlot(slot);
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return d.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Smart Parking Management"
        subtitle="Reserve slots — saved to a live database, synced across viewers in realtime"
        icon={<ParkingSquare size={18} />}
        right={<Badge tone="emerald" pulse><LiveDot tone="emerald" /> realtime</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Slots" value={totalSlots.toLocaleString()} icon={<ParkingSquare size={18} />} tone="cyan" />
        <StatCard label="Available" value={available.toLocaleString()} icon={<Check size={18} />} tone="emerald" />
        <StatCard label="Occupied" value={occupied.toLocaleString()} icon={<Car size={18} />} tone="amber" />
        <StatCard label="Live Reservations" value={reservations.length} icon={<Wallet size={18} />} tone="violet" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* LOT LIST */}
        <GlassCard className="p-5">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Search parking lots…"
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40"
            />
          </div>
          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {parkingLots.map((p) => {
              const avail = p.totalSlots - p.occupied;
              const pct = p.occupied / p.totalSlots;
              return (
                <button
                  key={p.id}
                  onClick={() => { setSelected(p.id); setReserved(false); setReservedSlot(null); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selected === p.id ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-slate-900/40 border-slate-700/40 hover:border-slate-600'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white truncate">{p.name}</span>
                    <Badge tone={pct > 0.85 ? 'rose' : pct > 0.6 ? 'amber' : 'emerald'}>{avail} left</Badge>
                  </div>
                  <ProgressBar value={p.occupied} max={p.totalSlots} tone={pct > 0.85 ? 'rose' : pct > 0.6 ? 'amber' : 'emerald'} />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {p.location}</span>
                    <span>₹{p.pricePerHour}/hr</span>
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* MAP */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Digital Parking Map</h3>
              <p className="text-xs text-slate-400 mt-0.5">Green = available · red = nearly full</p>
            </div>
            <Badge tone="cyan"><LiveDot tone="cyan" /> {parkingLots.length} lots</Badge>
          </div>
          <CityMap points={points} height={420} />
        </GlassCard>
      </div>

      {/* RESERVATION */}
      {lot && (
        <GlassCard className="p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                <ParkingSquare size={18} className="text-emerald-400" /> {lot.name}
              </h3>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                <MapPin size={13} className="text-cyan-400" /> {lot.location}
              </p>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="p-3 rounded-lg bg-slate-900/40">
                  <div className="text-xs text-slate-400">Total</div>
                  <div className="text-xl font-bold text-white">{lot.totalSlots}</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                  <div className="text-xs text-emerald-300">Available</div>
                  <div className="text-xl font-bold text-emerald-400">{lotAvail}</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-400/20">
                  <div className="text-xs text-amber-300">Occupied</div>
                  <div className="text-xl font-bold text-amber-400">{lot.occupied}</div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300 flex items-center gap-1"><Clock size={14} /> Duration</span>
                  <span className="text-sm text-white font-medium">{hours} hour{hours > 1 ? 's' : ''}</span>
                </div>
                <input type="range" min={1} max={12} value={hours} onChange={(e) => { setHours(Number(e.target.value)); setReserved(false); setReservedSlot(null); }} className="w-full" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1"><span>1h</span><span>12h</span></div>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-slate-900/40 rounded-xl p-5 border border-slate-700/40">
              <div>
                <div className="text-xs text-slate-400 mb-1">Estimated Cost</div>
                <div className="text-4xl font-bold text-emerald-400">₹{cost}</div>
                <div className="text-xs text-slate-400 mt-1">₹{lot.pricePerHour} × {hours}h</div>

                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Slot type</span><span className="text-white">Standard</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">EV charging</span><span className="text-emerald-400">Available</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Security</span><span className="text-white">24/7 CCTV</span></div>
                </div>
              </div>

              <button
                onClick={reserve}
                disabled={reserving || reserved || lotAvail === 0}
                className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-semibold text-sm disabled:opacity-60 transition-shadow hover:shadow-[0_0_24px_rgba(52,211,153,0.3)] flex items-center justify-center gap-2"
              >
                {reserved ? <><CheckCircle2 size={16} /> Reservation Confirmed</>
                  : reserving ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                  : lotAvail === 0 ? 'Fully Occupied' : 'Reserve Slot Now'}
              </button>
              {dbError && <div className="mt-2 text-xs text-rose-400 text-center">{dbError}</div>}
              {reserved && reservedSlot != null && (
                <div className="mt-3 text-center text-xs text-emerald-400 flex items-center justify-center gap-1 animate-rise">
                  <CheckCircle2 size={14} /> Slot #{reservedSlot} reserved at {lot.name} · saved to live DB
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* LIVE RESERVATIONS */}
      <GlassCard className="p-5">
        <SectionTitle title="Live Reservations" subtitle="Real records from the database, synced in realtime" icon={<Wallet size={18} />}
          right={<Badge tone="violet"><LiveDot tone="cyan" /> {reservations.length} active</Badge>} />
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400 flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading…</div>
        ) : reservations.length === 0 ? (
          <EmptyState icon={<ParkingSquare size={32} />} title="No reservations yet" subtitle="Reserve a slot above — it'll appear here instantly." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reservations.slice(0, 9).map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40 animate-rise">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{r.lot_name}</span>
                  <Badge tone="emerald">{r.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Slot #{r.slot_number}</span>
                  <span><Clock size={11} className="inline mr-1 text-amber-400" />{r.hours}h</span>
                  <span className="text-emerald-400 font-medium">₹{r.cost}</span>
                  <span className="ml-auto">{fmtTime(r.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
