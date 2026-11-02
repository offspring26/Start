import React, { useState } from 'react';
import { CronRun } from '../types';
import {
  buildMonthlySummaries,
  buildMonthDailyBarItems,
  buildAllMonthsBarItems,
  formatDuration,
} from '../utils/stats';
import { ColumnBarChart } from './ColumnBarChart';
import { CalendarRange, Activity, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MonthlyOverviewProps {
  runs: CronRun[];
}

export const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({ runs }) => {
  const summaries = buildMonthlySummaries(runs);

  // Default to the latest month with runs (or 'all' if no runs)
  const defaultMonth = summaries.length > 0 ? summaries[summaries.length - 1].monthKey : 'all';
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(defaultMonth);

  if (summaries.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
        No monthly records available.
      </div>
    );
  }

  const selectedMonth = summaries.find((s) => s.monthKey === selectedMonthKey);
  const isAllView = selectedMonthKey === 'all';

  // Bar items
  const chartItems = isAllView
    ? buildAllMonthsBarItems(summaries)
    : selectedMonth
    ? buildMonthDailyBarItems(selectedMonth)
    : [];

  const chartTitle = isAllView
    ? 'Monthly Overview: Multi-Month Trend Comparison'
    : `${selectedMonth?.monthName} Daily Startup Delays`;

  const chartSubtitle = isAllView
    ? 'Comparing average runner startup queue jitter across each recorded month'
    : `Detailed day-by-day scheduler startup latency for ${selectedMonth?.runCount} cron runs in ${selectedMonth?.monthName}`;

  const chartAvg = isAllView
    ? Math.round(
        (summaries.reduce((acc, s) => acc + s.avgDelayMinutes, 0) / summaries.length) * 100
      ) / 100
    : selectedMonth?.avgDelayMinutes;

  return (
    <div className="space-y-6">
      {/* Month Selection Bar */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Monthly Overview</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a month to inspect daily executions or compare month-over-month averages
            </p>
          </div>
        </div>

        {/* Month Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedMonthKey('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isAllView
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Months ({summaries.length})
          </button>
          {summaries.map((s) => (
            <button
              key={s.monthKey}
              onClick={() => setSelectedMonthKey(s.monthKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedMonthKey === s.monthKey
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Month KPI Cards */}
      {selectedMonth && !isAllView && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-lg">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span className="font-medium uppercase tracking-wider">Month Average</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {selectedMonth.avgDelayMinutes.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">min</span>
            </div>
            <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              ~{formatDuration(selectedMonth.avgDelayMinutes)} average
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-lg">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span className="font-medium uppercase tracking-wider">Recorded Runs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {selectedMonth.runCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">executions</span>
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              100% daily schedule uptime
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-lg">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span className="font-medium uppercase tracking-wider">Fastest Run</span>
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {selectedMonth.minDelayMinutes.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">min</span>
            </div>
            <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {formatDuration(selectedMonth.minDelayMinutes)} delay
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-lg">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span className="font-medium uppercase tracking-wider">Slowest Run</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {selectedMonth.maxDelayMinutes.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">min</span>
            </div>
            <div className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {formatDuration(selectedMonth.maxDelayMinutes)} max delay
            </div>
          </div>
        </div>
      )}

      {/* Vertical Column Chart for Selected Month / All Months */}
      <ColumnBarChart
        title={chartTitle}
        subtitle={chartSubtitle}
        items={chartItems}
        averageValue={chartAvg}
        unit="min"
      />

      {/* Multi-Month Summary Table (shown in All Months view) */}
      {isAllView && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-lg">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Monthly Performance Summary
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Recorded Runs</th>
                  <th className="py-2.5 px-3">Average Delay</th>
                  <th className="py-2.5 px-3">Fastest Delay</th>
                  <th className="py-2.5 px-3">Slowest Delay</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {summaries.map((s) => (
                  <tr key={s.monthKey} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {s.monthName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {s.runCount} runs
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {s.avgDelayMinutes.toFixed(1)}m ({formatDuration(s.avgDelayMinutes)})
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                      {formatDuration(s.minDelayMinutes)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-rose-600 dark:text-rose-400">
                      {formatDuration(s.maxDelayMinutes)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedMonthKey(s.monthKey)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        View Daily Runs →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
