import React from 'react';
import { Clock, Calendar, TrendingDown, TrendingUp, CheckCircle, Database } from 'lucide-react';
import { SummaryData } from '../types';
import { formatDuration } from '../utils/stats';

interface MetricCardsProps {
  summary: SummaryData;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary }) => {
  const latest = summary.latest_run;

  const getStatusBadge = (delayMinutes: number) => {
    if (delayMinutes <= 3.0) {
      return {
        text: 'Optimal Queue',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800/60',
      };
    }
    if (delayMinutes <= 7.0) {
      return {
        text: 'Nominal Delay',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/60 dark:border-indigo-800/60',
      };
    }
    if (delayMinutes <= 15.0) {
      return {
        text: 'Queue Congestion',
        color: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/60 dark:border-amber-800/60',
      };
    }
    return {
      text: 'High Delay',
      color: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/60 dark:border-rose-800/60',
    };
  };

  const latestBadge = latest ? getStatusBadge(latest.delay_minutes) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Latest Run Delay */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-lg relative overflow-hidden backdrop-blur transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Latest Run Delay
          </span>
          <Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">
            {latest ? `${latest.delay_minutes.toFixed(1)}` : '--'}
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            min {latest ? `(${formatDuration(latest.delay_minutes)})` : ''}
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          {latestBadge && (
            <span className={`px-2 py-0.5 rounded-full border font-medium text-[11px] ${latestBadge.color}`}>
              {latestBadge.text}
            </span>
          )}
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {latest
              ? new Date(latest.actual_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : ''}
          </span>
        </div>
      </div>

      {/* Last Week Average */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-lg backdrop-blur transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Last Week Avg
          </span>
          <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">
            {summary.last_week_avg_minutes.toFixed(1)}
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            min ({formatDuration(summary.last_week_avg_minutes)})
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          {summary.last_week_avg_minutes <= summary.last_month_avg_minutes ? (
            <>
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Faster</span> than monthly average
            </>
          ) : (
            <>
              <TrendingUp className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="text-amber-600 dark:text-amber-400 font-medium">Higher</span> than monthly average
            </>
          )}
        </div>
      </div>

      {/* Last Month Average */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-lg backdrop-blur transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Last Month Avg
          </span>
          <CheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">
            {summary.last_month_avg_minutes.toFixed(1)}
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            min ({formatDuration(summary.last_month_avg_minutes)})
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Target baseline: 03:14:00 UTC</span>
        </div>
      </div>

      {/* Multi-Year / All Time */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-lg backdrop-blur transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            All-Time Average
          </span>
          <Database className="w-4 h-4 text-purple-500 dark:text-purple-400" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">
            {summary.all_time_avg_minutes.toFixed(1)}
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            min ({formatDuration(summary.all_time_avg_minutes)})
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{summary.yearly_averages.length} tracked years</span>
          <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
            {summary.total_runs.toLocaleString()} runs
          </span>
        </div>
      </div>
    </div>
  );
};
