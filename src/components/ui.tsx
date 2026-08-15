import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function GlassCard({
  children,
  className,
  strong,
  hover,
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        strong ? 'glass-strong' : 'glass',
        'rounded-2xl',
        hover && 'glass-hover',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  icon,
  right,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  tone = 'cyan',
  delta,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  tone?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'violet' | 'orange';
  delta?: string;
}) {
  const tones: Record<string, string> = {
    cyan: 'text-cyan-400 border-cyan-400/20 bg-cyan-500/10',
    emerald: 'text-emerald-400 border-emerald-400/20 bg-emerald-500/10',
    amber: 'text-amber-400 border-amber-400/20 bg-amber-500/10',
    rose: 'text-rose-400 border-rose-400/20 bg-rose-500/10',
    blue: 'text-blue-400 border-blue-400/20 bg-blue-500/10',
    violet: 'text-violet-400 border-violet-400/20 bg-violet-500/10',
    orange: 'text-orange-400 border-orange-400/20 bg-orange-500/10',
  };
  return (
    <GlassCard hover className="p-5">
      <div className="flex items-center justify-between">
        <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center', tones[tone])}>
          {icon}
        </div>
        {delta && <span className="text-xs text-emerald-400 font-medium">{delta}</span>}
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white tracking-tight tabular-nums">{value}</span>
          {unit && <span className="text-sm text-slate-400">{unit}</span>}
        </div>
        <p className="text-sm text-slate-400 mt-1">{label}</p>
      </div>
    </GlassCard>
  );
}

export function Badge({
  children,
  tone = 'slate',
  pulse,
}: {
  children: ReactNode;
  tone?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'orange' | 'blue' | 'violet' | 'slate';
  pulse?: boolean;
}) {
  const tones: Record<string, string> = {
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    orange: 'bg-orange-500/15 text-orange-300 border-orange-400/30',
    blue: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
    violet: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
    slate: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        tones[tone],
      )}
    >
      {pulse && <span className={cn('w-1.5 h-1.5 rounded-full live-dot', `text-${tone}-400`)} />}
      {children}
    </span>
  );
}

export function CongestionMeter({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const tone = pct < 30 ? 'emerald' : pct < 60 ? 'amber' : pct < 85 ? 'orange' : 'rose';
  const colors: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-400',
    amber: 'from-amber-500 to-amber-400',
    orange: 'from-orange-500 to-orange-400',
    rose: 'from-rose-500 to-rose-400',
  };
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>Density</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/40 overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', colors[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  max,
  tone = 'cyan',
}: {
  value: number;
  max: number;
  tone?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'violet';
}) {
  const pct = Math.min(100, (value / max) * 100);
  const colors: Record<string, string> = {
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    blue: 'bg-blue-400',
    violet: 'bg-violet-400',
  };
  return (
    <div className="h-2 rounded-full bg-slate-700/40 overflow-hidden">
      <div className={cn('h-full rounded-full transition-all duration-500', colors[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function LiveDot({ tone = 'emerald' }: { tone?: string }) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
  };
  return <span className={cn('w-2 h-2 rounded-full live-dot', colors[tone] || 'text-emerald-400')} />;
}

export function EmptyState({ icon, title, subtitle }: { icon?: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-slate-600 mb-3">{icon}</div>}
      <p className="text-slate-400">{title}</p>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400 border-b border-slate-700/50">
            {headers.map((h, i) => (
              <th key={i} className="py-3 px-3 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="py-3 px-3 text-slate-200">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
