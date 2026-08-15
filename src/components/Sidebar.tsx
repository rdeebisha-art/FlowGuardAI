import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Activity, Brain, TrafficCone, Siren, CarFront, AudioLines,
  Construction, ShieldAlert, ParkingSquare, Bus, MessageSquareWarning, Bot,
  Leaf, Cpu, FlaskConical, Radar, Menu, X, Bell, Search, Globe, RefreshCw,
} from 'lucide-react';
import { useApp, PageId } from '@/lib/AppContext';
import { LANGS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { LiveDot } from './ui';

interface NavItem {
  id: PageId;
  labelKey: string;
  icon: React.ReactNode;
  tone?: string;
}
interface NavGroup {
  titleKey: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    titleKey: 'groups_overview',
    items: [
      { id: 'home', labelKey: 'nav_home', icon: <LayoutDashboard size={18} /> },
      { id: 'monitor', labelKey: 'nav_monitor', icon: <Activity size={18} />, tone: 'cyan' },
      { id: 'admin', labelKey: 'nav_admin', icon: <Cpu size={18} />, tone: 'rose' },
    ],
  },
  {
    titleKey: 'groups_intelligence',
    items: [
      { id: 'prediction', labelKey: 'nav_prediction', icon: <Brain size={18} />, tone: 'violet' },
      { id: 'signals', labelKey: 'nav_signals', icon: <TrafficCone size={18} />, tone: 'amber' },
      { id: 'simulation', labelKey: 'nav_simulation', icon: <FlaskConical size={18} />, tone: 'cyan' },
    ],
  },
  {
    titleKey: 'groups_response',
    items: [
      { id: 'emergency', labelKey: 'nav_emergency', icon: <Siren size={18} />, tone: 'rose' },
      { id: 'accident', labelKey: 'nav_accident', icon: <CarFront size={18} />, tone: 'orange' },
      { id: 'sound', labelKey: 'nav_sound', icon: <AudioLines size={18} />, tone: 'amber' },
      { id: 'road', labelKey: 'nav_road', icon: <Construction size={18} />, tone: 'amber' },
      { id: 'violation', labelKey: 'nav_violation', icon: <ShieldAlert size={18} />, tone: 'rose' },
    ],
  },
  {
    titleKey: 'groups_citizen',
    items: [
      { id: 'parking', labelKey: 'nav_parking', icon: <ParkingSquare size={18} />, tone: 'emerald' },
      { id: 'transport', labelKey: 'nav_transport', icon: <Bus size={18} />, tone: 'blue' },
      { id: 'citizen', labelKey: 'nav_citizen', icon: <MessageSquareWarning size={18} />, tone: 'amber' },
      { id: 'flowbot', labelKey: 'nav_flowbot', icon: <Bot size={18} />, tone: 'cyan' },
    ],
  },
  {
    titleKey: 'groups_system',
    items: [
      { id: 'eco', labelKey: 'nav_eco', icon: <Leaf size={18} />, tone: 'emerald' },
    ],
  },
];

const toneText: Record<string, string> = {
  cyan: 'text-cyan-400', emerald: 'text-emerald-400', amber: 'text-amber-400',
  rose: 'text-rose-400', violet: 'text-violet-400', blue: 'text-blue-400', orange: 'text-orange-400',
};

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { page, setPage, t } = useApp();

  const go = (p: PageId) => {
    setPage(p);
    onClose();
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-72 z-50 lg:z-30 glass-strong border-r border-cyan-400/10 flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-cyan-400/10 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center glow-cyan">
            <Radar size={20} className="text-slate-900" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white tracking-tight leading-none gradient-text">{t('appName')}</div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">{t('tagline')}</div>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV.map((group) => (
            <div key={group.titleKey}>
              <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {t(group.titleKey)}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = page === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => go(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group',
                        active
                          ? 'bg-cyan-500/10 text-white border border-cyan-400/25'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent',
                      )}
                    >
                      <span className={cn(active ? (toneText[item.tone || 'cyan']) : 'text-slate-500 group-hover:text-slate-300')}>
                        {item.icon}
                      </span>
                      <span className="truncate text-left">{t(item.labelKey)}</span>
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 glow-cyan" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-cyan-400/10 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <LiveDot tone="emerald" />
            <span>All systems operational</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { t, lang, setLang, refresh, notifications } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 glass border-b border-cyan-400/10 h-16 flex items-center gap-3 px-4 lg:px-6">
      <button onClick={onMenu} className="lg:hidden text-slate-300 hover:text-white">
        <Menu size={22} />
      </button>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            placeholder={t('search')}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-700/40">
        <LiveDot tone="emerald" />
        <span className="font-medium text-emerald-400">{t('live')}</span>
        <span className="text-slate-500">|</span>
        <span className="tabular-nums">{clock.toLocaleTimeString()}</span>
      </div>

      <button
        onClick={refresh}
        title={t('refresh')}
        className="w-9 h-9 rounded-lg bg-slate-900/40 border border-slate-700/40 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
      >
        <RefreshCw size={16} />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowLang((s) => !s)}
          className="w-9 h-9 rounded-lg bg-slate-900/40 border border-slate-700/40 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
        >
          <Globe size={16} />
        </button>
        {showLang && (
          <div className="absolute right-0 mt-2 w-36 glass-strong rounded-xl p-1 z-50" onMouseLeave={() => setShowLang(false)}>
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setShowLang(false); }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  lang === l.code ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-300 hover:bg-slate-800/50',
                )}
              >
                <span className="w-5 text-center text-xs font-semibold">{l.flag}</span>
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowNotif((s) => !s)}
          className="relative w-9 h-9 rounded-lg bg-slate-900/40 border border-slate-700/40 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
        >
          <Bell size={16} />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white font-bold flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>
        {showNotif && (
          <div className="absolute right-0 mt-2 w-80 glass-strong rounded-xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-slate-700/40 text-sm font-semibold text-white">
              {t('activeAlerts')}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b border-slate-800/40 hover:bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      n.level === 'critical' ? 'bg-rose-500' : n.level === 'warning' ? 'bg-amber-500' : 'bg-cyan-500',
                    )} />
                    <span className="text-sm font-medium text-white">{n.title}</span>
                    <span className="ml-auto text-[10px] text-slate-500">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-400">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
