import React, { useState, useRef, useEffect } from 'react';
import { BarItem } from '../types';
import { Info } from 'lucide-react';
import { formatDuration } from '../utils/stats';

interface ColumnBarChartProps {
  title: string;
  subtitle?: string;
  items: BarItem[];
  unit?: string;
  averageValue?: number;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  scrollToEndOnMount?: boolean;
}

export const ColumnBarChart: React.FC<ColumnBarChartProps> = ({
  title,
  subtitle,
  items,
  unit = 'min',
  averageValue,
  scrollContainerRef,
  scrollToEndOnMount = false,
}) => {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const internalRef = useRef<HTMLDivElement>(null);
  const activeScrollRef = scrollContainerRef || internalRef;

  useEffect(() => {
    if (scrollToEndOnMount && activeScrollRef.current) {
      // Allow DOM layout to complete before scrolling
      const timer = setTimeout(() => {
        if (activeScrollRef.current) {
          activeScrollRef.current.scrollLeft = activeScrollRef.current.scrollWidth;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [items, scrollToEndOnMount, activeScrollRef]);

  if (!items || items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400 shadow-sm">
        No delay records available for this view.
      </div>
    );
  }

  const maxValue = Math.max(...items.map((it) => it.value), 1);
  const chartMax = Math.ceil(maxValue * 1.15 * 10) / 10;

  const getBarColor = (val: number, customColor?: string) => {
    if (customColor) return customColor;
    if (val <= 3.0) return 'from-emerald-500 to-teal-400';
    if (val <= 6.5) return 'from-indigo-500 to-blue-400';
    if (val <= 12.0) return 'from-amber-500 to-yellow-400';
    return 'from-rose-500 to-orange-400';
  };

  const getBadgeColor = (val: number) => {
    if (val <= 3.0) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800/40';
    if (val <= 6.5) return 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/60 dark:border-indigo-800/40';
    if (val <= 12.0) return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/60 dark:border-amber-800/40';
    return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/60 dark:border-rose-800/40';
  };

  // Grid steps (0%, 25%, 50%, 75%, 100%)
  const gridSteps = [1.0, 0.75, 0.5, 0.25, 0.0];

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm dark:shadow-xl backdrop-blur transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800/80 gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {title}
          </h3>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {averageValue !== undefined && (
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">Section Avg:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {averageValue.toFixed(1)} {unit} ({formatDuration(averageValue)})
            </span>
          </div>
        )}
      </div>

      {/* Main Vertical Chart Area */}
      <div className="mt-6 relative">
        <div className="flex">
          {/* Y-Axis scale labels */}
          <div className="w-14 sm:w-16 shrink-0 h-64 sm:h-72 flex flex-col justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-slate-500 pr-2 border-r border-slate-200 dark:border-slate-800 text-right select-none py-1">
            {gridSteps.map((fraction) => {
              const val = chartMax * fraction;
              return (
                <div key={fraction} className="truncate">
                  {val >= 60 ? `${(val / 60).toFixed(1)}h` : `${Math.round(val)}m`}
                </div>
              );
            })}
          </div>

          {/* Columns & Grid Area */}
          <div ref={activeScrollRef} className="flex-1 relative h-64 sm:h-72 overflow-x-auto pl-2 sm:pl-3 pb-8 scroll-smooth">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 right-0 pointer-events-none flex flex-col justify-between py-1">
              {gridSteps.map((fraction) => (
                <div
                  key={fraction}
                  className="w-full border-b border-slate-100 dark:border-slate-800/60 border-dashed"
                />
              ))}
            </div>

            {/* Average Horizontal Benchmark Line */}
            {averageValue !== undefined && averageValue <= chartMax && (
              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-amber-500/80 dark:border-amber-400/70 z-10 pointer-events-none transition-all duration-500"
                style={{ bottom: `${(averageValue / chartMax) * 100}%` }}
              >
                <span className="absolute -top-3 right-2 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 shadow-xs">
                  Avg: {averageValue.toFixed(1)}m
                </span>
              </div>
            )}

            {/* Vertical Columns */}
            <div
              className={`relative z-10 h-full flex items-end ${
                items.length <= 10 ? 'justify-around gap-2 sm:gap-4' : 'justify-start gap-2 sm:gap-3 min-w-max'
              }`}
            >
              {items.map((item) => {
                const percentage = Math.min(100, Math.max(3, (item.value / chartMax) * 100));
                const isHovered = hoveredId === item.id;

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col items-center h-full justify-end select-none"
                    style={{ width: items.length <= 8 ? '72px' : items.length <= 14 ? '56px' : '44px' }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Tooltip on Hover (positioned above the column) */}
                    {isHovered && (
                      <div className="absolute -top-16 z-30 min-w-[160px] p-2 bg-slate-900 text-white dark:bg-slate-950 dark:text-slate-100 text-[11px] rounded-lg shadow-xl border border-slate-700 dark:border-slate-800 pointer-events-none text-center transform -translate-x-1/2 left-1/2">
                        <div className="font-semibold">{item.label}</div>
                        <div className={`font-mono text-[10px] mt-0.5 inline-block px-1.5 py-0.5 rounded border ${getBadgeColor(item.value)}`}>
                          {item.value.toFixed(1)} min ({formatDuration(item.value)})
                        </div>
                        {item.subLabel && <div className="text-slate-400 text-[10px] mt-0.5">{item.subLabel}</div>}
                      </div>
                    )}

                    {/* Value Badge above column */}
                    <span
                      className={`text-[10px] font-mono font-medium mb-1 truncate transition-opacity ${
                        isHovered
                          ? 'opacity-100 scale-105 font-bold text-slate-900 dark:text-white'
                          : 'opacity-75 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.value >= 60 ? `${(item.value / 60).toFixed(1)}h` : `${Math.round(item.value)}m`}
                    </span>

                    {/* Column Track & Animated Bar */}
                    <div className="w-full h-full flex items-end justify-center">
                      <div className="w-full max-w-[48px] h-full flex items-end bg-slate-100/90 dark:bg-slate-950/60 rounded-t-lg border border-slate-200/70 dark:border-slate-800/60 overflow-hidden relative group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-colors">
                        <div
                          className={`w-full rounded-t-md bg-gradient-to-t ${getBarColor(
                            item.value,
                            item.barColor
                          )} transition-all duration-500 ease-out shadow-sm ${
                            isHovered ? 'brightness-110' : ''
                          }`}
                          style={{ height: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* X-Axis Column Label */}
                    <div className="absolute -bottom-7 w-full text-center">
                      <div className="text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate" title={item.label}>
                        {item.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected hover info card */}
        {hoveredId !== null && (
          <div className="mt-3 text-xs bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex items-center gap-2 text-slate-700 dark:text-slate-300 animate-fadeIn">
            <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="truncate">
              {items.find((it) => it.id === hoveredId)?.extraInfo ||
                items.find((it) => it.id === hoveredId)?.label}
            </span>
          </div>
        )}
      </div>

      {/* Chart legend and scale */}
      <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> &lt; 3m (Optimal)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" /> 3-6.5m (Normal)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> 6.5-12m (Queue load)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> &gt; 12m (High delay)
          </span>
        </div>
        <div className="font-mono text-slate-500 dark:text-slate-400">
          Scale: 0 to {chartMax.toFixed(1)} {unit} ({formatDuration(chartMax)})
        </div>
      </div>
    </div>
  );
};
