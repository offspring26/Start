import React, { useState, useRef } from 'react';
import { CronRun } from '../types';
import {
  buildDailyRunBarItems,
  getDailyRunsStats,
  formatDuration,
} from '../utils/stats';
import { ColumnBarChart } from './ColumnBarChart';
import {
  CalendarDays,
  Zap,
  Activity,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface DailyRunsChartProps {
  runs: CronRun[];
}

export const DailyRunsChart: React.FC<DailyRunsChartProps> = ({ runs }) => {
  const [range, setRange] = useState<'all' | '30' | '14' | '7'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!runs || runs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
        No daily cron runs recorded in this repository yet.
      </div>
    );
  }

  // Ensure chronological baseline
  const sortedChronological = [...runs].sort(
    (a, b) => new Date(a.actual_time).getTime() - new Date(b.actual_time).getTime()
  );

  // Apply range slice
  let filteredRuns = sortedChronological;
  if (range === '30') {
    filteredRuns = sortedChronological.slice(-30);
  } else if (range === '14') {
    filteredRuns = sortedChronological.slice(-14);
  } else if (range === '7') {
    filteredRuns = sortedChronological.slice(-7);
  }

  const stats = getDailyRunsStats(filteredRuns);
  const barItems = buildDailyRunBarItems(filteredRuns, sortOrder);

  const scrollToStart = () => {
    scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const scrollToEnd = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const getFastestDate = () => {
    if (!stats.fastestRun) return '';
    const d = new Date(stats.fastestRun.actual_time);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getSlowestDate = () => {
    if (!stats.slowestRun) return '';
    const d = new Date(stats.slowestRun.actual_time);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Control Header & Filters */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Daily Execution Delays: Each Run
              </h2>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {filteredRuns.length} daily runs
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive column chart for every single scheduled 03:14 UTC daily execution
            </p>
          </div>
        </div>

        {/* Range & View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Range pills */}
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => setRange('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                range === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({runs.length})
            </button>
            <button
              onClick={() => setRange('30')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                range === '30'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setRange('14')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                range === '14'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setRange('7')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                range === '7'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Days
            </button>
          </div>

          {/* Sort order toggle */}
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 transition-colors"
            title="Toggle chronological sorting"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'asc' ? 'Oldest → Newest' : 'Newest → Oldest'}</span>
          </button>

          {/* Jump to start / end scroll buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
            <button
              onClick={scrollToStart}
              className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center text-xs"
              title="Scroll to beginning"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline ml-0.5">Start</span>
            </button>
            <button
              onClick={scrollToEnd}
              className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center text-xs border-l border-slate-200 dark:border-slate-700/80"
              title="Scroll to latest run"
            >
              <span className="hidden sm:inline mr-0.5">Latest</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cohort KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Runs Count */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Runs Count</span>
            <CalendarDays className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.count}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">runs</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {stats.onSchedulePercent}% on-time (≤ 15m)
          </div>
        </div>

        {/* Average Delay */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Average Delay</span>
            <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.avg.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">min</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {formatDuration(stats.avg)} cohort average
          </div>
        </div>

        {/* Fastest Queue Run */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Fastest Run</span>
            <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.min.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">min</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {getFastestDate()} • Run #{stats.fastestRun?.github_run_number ?? stats.fastestRun?.id}
          </div>
        </div>

        {/* Slowest / Peak Delay */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Peak Delay</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
              {stats.max.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">min</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {getSlowestDate()} • {formatDuration(stats.max)}
          </div>
        </div>
      </div>

      {/* Main Daily Column Bar Chart */}
      <ColumnBarChart
        title="Daily Execution Delays: Each Run (03:14 UTC)"
        subtitle={`Startup latency for ${barItems.length} daily cron executions in this repository (${sortOrder === 'asc' ? 'chronological order' : 'newest first'})`}
        items={barItems}
        averageValue={stats.avg}
        unit="min"
        scrollContainerRef={scrollRef}
        scrollToEndOnMount={sortOrder === 'asc'}
      />
    </div>
  );
};
