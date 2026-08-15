import { ReactNode } from 'react';
import { GlassCard } from './ui';

export const CHART_COLORS = {
  cyan: '#22d3ee',
  emerald: '#34d399',
  amber: '#f59e0b',
  rose: '#f43f5e',
  blue: '#38bdf8',
  violet: '#a78bfa',
  orange: '#fb923c',
  slate: '#64748b',
};

export const axisProps = {
  stroke: '#475569',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

export const tooltipStyle = {
  contentStyle: {
    background: 'rgba(8, 15, 35, 0.95)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: 10,
    color: '#e2e8f0',
    fontSize: 12,
  },
  labelStyle: { color: '#94a3b8', marginBottom: 4 },
  itemStyle: { color: '#e2e8f0' },
};

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <GlassCard className={`p-5 ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </GlassCard>
  );
}
