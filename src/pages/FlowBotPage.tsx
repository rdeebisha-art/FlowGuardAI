import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, Sparkles, Navigation, CarFront, ParkingSquare, Siren, Bus } from 'lucide-react';
import { GlassCard, SectionTitle, Badge, LiveDot } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Msg {
  id: number;
  role: 'user' | 'bot';
  text: string;
}

const SUGGESTIONS = [
  { icon: <Navigation size={14} />, text: 'Best route to reach airport?' },
  { icon: <ParkingSquare size={14} />, text: 'Parking near Phoenix Mall?' },
  { icon: <Siren size={14} />, text: 'Emergency: ambulance needed at T Nagar' },
  { icon: <CarFront size={14} />, text: 'Traffic status in Anna Nagar' },
  { icon: <Bus size={14} />, text: 'When is the next bus to Guindy?' },
];

const botReply = (q: string): string => {
  const s = q.toLowerCase();
  if (s.includes('airport')) return 'Use the bypass route via Gemini Flyover and OMR. Estimated time reduced by 20 minutes. Current airport route has medium congestion (48%).';
  if (s.includes('parking') && s.includes('phoenix')) return 'Phoenix Mall parking: 84 slots available out of 400. ₹40/hour. I can reserve a slot for you — just say "reserve 2 hours at Phoenix Mall".';
  if (s.includes('emergency') || s.includes('ambulance')) return 'Emergency acknowledged. Green corridor activated from T Nagar to Apollo Hospital. Nearest ambulance EV01 dispatched, ETA 7 minutes. Nearby drivers alerted.';
  if (s.includes('anna nagar')) return 'Anna Nagar: High congestion (72%). 1,180 vehicles, avg speed 24 km/h. AI signals extending green on Anna Salai. Consider Velachery Main as alternate.';
  if (s.includes('bus') && s.includes('guindy')) return 'Route 27 (Anna Nagar → Guindy): next bus BUS027 arriving in 6 minutes, currently 38/60 passengers. On time.';
  if (s.includes('route')) return 'Recommended route: Gemini Flyover bypass. Avoid Anna Salai (critical congestion). Travel time: 28 min vs 42 min normal — 33% faster.';
  if (s.includes('hello') || s.includes('hi') || s.includes('hey')) return 'Hello! I am FlowBot AI, your smart city traffic assistant. Ask me about routes, parking, traffic status, emergencies, or public transport.';
  return 'I can help with current traffic status, best route suggestions, parking availability, emergency guidance, and public transport info. Try asking "Best route to reach airport?"';
};

export function FlowBotPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, role: 'bot', text: 'Hello! I am FlowBot AI, your smart city traffic assistant. How can I help you navigate the city today?' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: Date.now(), role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: Date.now() + 1, role: 'bot', text: botReply(text) }]);
    }, 900);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="FlowBot AI Assistant"
        subtitle="Conversational AI for routes, parking, traffic status & emergency guidance"
        icon={<Bot size={18} />}
        right={<Badge tone="cyan" pulse>online</Badge>}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* CHAT */}
        <GlassCard strong className="lg:col-span-2 flex flex-col h-[640px]">
          <div className="flex items-center gap-3 p-4 border-b border-slate-700/40">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center glow-cyan">
              <Bot size={20} className="text-slate-900" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">FlowBot AI</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1"><LiveDot tone="emerald" /> online · responds instantly</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex gap-3 animate-rise', m.role === 'user' && 'flex-row-reverse')}>
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  m.role === 'bot' ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-900' : 'bg-slate-700 text-slate-300',
                )}>
                  {m.role === 'bot' ? <Bot size={16} /> : <span className="text-xs font-bold">You</span>}
                </div>
                <div className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                  m.role === 'bot' ? 'bg-slate-800/60 text-slate-200 rounded-tl-sm' : 'bg-cyan-500/15 border border-cyan-400/20 text-cyan-100 rounded-tr-sm',
                )}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3 animate-rise">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-900 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-800/60 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* INPUT */}
          <div className="p-4 border-t border-slate-700/40">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setListening((l) => !l)}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0',
                  listening ? 'bg-rose-500/20 text-rose-400 border border-rose-400/40' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40',
                )}
              >
                <Mic size={18} />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(input)}
                placeholder={listening ? 'Listening…' : 'Ask FlowBot anything…'}
                className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40"
              />
              <button
                onClick={() => send(input)}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 flex items-center justify-center shrink-0 transition-shadow hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              >
                <Send size={16} />
              </button>
            </div>
            {listening && (
              <div className="mt-2 flex items-center justify-center gap-1.5">
                {Array.from({ length: 14 }, (_, i) => (
                  <span key={i} className="w-1 bg-rose-400/70 rounded-full" style={{ height: `${8 + Math.random() * 20}px`, animation: `pulse-ring 0.8s ease-in-out ${i * 0.05}s infinite alternate` }} />
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        {/* SUGGESTIONS + CAPABILITIES */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" /> Try asking
            </h3>
            <div className="space-y-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s.text)}
                  className="w-full flex items-center gap-2 p-3 rounded-lg bg-slate-900/40 border border-slate-700/40 hover:border-cyan-400/30 text-left text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <span className="text-cyan-400">{s.icon}</span>
                  {s.text}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-semibold text-white text-sm mb-3">FlowBot Capabilities</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Current traffic status', <CarFront size={14} key="c" className="text-cyan-400" />],
                ['Best route suggestions', <Navigation size={14} key="n" className="text-emerald-400" />],
                ['Parking availability', <ParkingSquare size={14} key="p" className="text-amber-400" />],
                ['Emergency guidance', <Siren size={14} key="s" className="text-rose-400" />],
                ['Public transport info', <Bus size={14} key="b" className="text-blue-400" />],
              ].map(([label, ic], i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300">
                  {ic} <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-violet-500/10 border border-violet-400/20 text-xs text-violet-200">
              Supports voice input & 3 languages (EN/TA/HI).
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
