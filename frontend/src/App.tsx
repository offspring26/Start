import React, { useState, useEffect } from 'react';
import fallbackData from './data/delays.json';
import { DelayDataset } from './types';
import { MetricCards } from './components/MetricCards';
import { ColumnBarChart } from './components/ColumnBarChart';
import { MonthlyOverview } from './components/MonthlyOverview';
import { DelayTable } from './components/DelayTable';
import {
  buildWeekBarItems,
  buildYearlyBarItems,
} from './utils/stats';
import {
  Clock,
  Activity,
  Layers,
  CalendarRange,
  BarChart3,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';

export const App: React.FC = () => {
  const [data, setData] = useState<DelayDataset>(fallbackData as unknown as DelayDataset);
  const [activeTab, setActiveTab] = useState<'all' | 'week' | 'month' | 'years'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'dark'; // default to dark
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      // Attempt to fetch latest generated json dynamically
      const response = await fetch('./data/delays.json', { cache: 'no-store' });
      if (response.ok) {
        const freshData = await response.json();
        setData(freshData);
      }
    } catch (err) {
      console.warn('Using bundled dataset fallback:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const weekItems = buildWeekBarItems(data.runs);
  const yearlyItems = buildYearlyBarItems(data.summary);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar / Header */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  GitHub Actions Cron Delay Tracker
                </h1>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30">
                  v1.0
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800/50">
                  03:14 UTC Daily
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Measuring real scheduler startup latency vs target cron trigger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Theme Toggle (Light / Dark mode) */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex items-center justify-center p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Refresh snapshot button */}
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-lg transition-colors"
              title="Reload latest data snapshot"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cron Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Metrics Cards */}
        <MetricCards summary={data.summary} />

        {/* View Selection Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Visuals</span>
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'week'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Last Week</span>
            </button>
            <button
              onClick={() => setActiveTab('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'month'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Monthly Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('years')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'years'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Past Years</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Last updated:{' '}
            <span className="text-slate-700 dark:text-slate-300 font-mono">
              {new Date(data.generated_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Visualizations (Vertical Column Bar Charts & Monthly Overview) */}
        <div className="space-y-8">
          {/* Section 1: Last Week Delays (Vertical Columns) */}
          {(activeTab === 'all' || activeTab === 'week') && (
            <ColumnBarChart
              title="Last Week Daily Startup Delays"
              subtitle="Startup latency recorded for each individual morning cron run at 03:14 UTC"
              items={weekItems}
              averageValue={data.summary.last_week_avg_minutes}
              unit="min"
            />
          )}

          {/* Section 2: Comprehensive Monthly Overview */}
          {(activeTab === 'all' || activeTab === 'month') && (
            <MonthlyOverview runs={data.runs} />
          )}

          {/* Section 3: Average of the Last Years (Vertical Columns) */}
          {(activeTab === 'all' || activeTab === 'years') && (
            <ColumnBarChart
              title="Multi-Year Comparison: Average Delay of the Last Years"
              subtitle="Comparing average runner startup queue delays across annual cron executions"
              items={yearlyItems}
              averageValue={data.summary.all_time_avg_minutes}
              unit="min"
            />
          )}
        </div>

        {/* Execution History Table */}
        <DelayTable runs={data.runs} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 mt-12 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>
              Automated via GitHub Actions cron (
              <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded">
                14 3 * * *
              </code>
              )
            </span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">v1.0</span>
          </div>
          <div>
            <span>
              Data stored in SQLite repository file:{' '}
              <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded">
                data/delays.db
              </code>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
