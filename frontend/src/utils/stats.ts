import { BarItem, CronRun, MonthSummary, SummaryData } from '../types';

export function formatDuration(minutes: number): string {
  if (minutes < 1) {
    const sec = Math.round(minutes * 60);
    return `${sec}s`;
  }
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const remMin = Math.round(minutes % 60);
    return remMin > 0 ? `${hrs}h ${remMin}m` : `${hrs}h`;
  }
  const min = Math.floor(minutes);
  const sec = Math.round((minutes - min) * 60);
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

export function buildWeekBarItems(runs: CronRun[]): BarItem[] {
  // Take last 7 runs or runs from the last 7 days sorted chronologically
  const sorted = [...runs].sort(
    (a, b) => new Date(a.actual_time).getTime() - new Date(b.actual_time).getTime()
  );
  const recent = sorted.slice(-7);

  return recent.map((run) => {
    const dateObj = new Date(run.actual_time);
    const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
    const formattedDate = dateObj.toLocaleDateString(undefined, {
      month: 'numeric',
      day: 'numeric',
    });
    const timeStr = dateObj.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
    });

    return {
      id: run.id,
      label: `${dayName} ${formattedDate}`,
      subLabel: `${timeStr} UTC`,
      value: run.delay_minutes,
      formattedValue: `${run.delay_minutes.toFixed(1)}m (${formatDuration(run.delay_minutes)})`,
      timestamp: run.actual_time,
      extraInfo: `Scheduled: ${new Date(run.scheduled_time).toISOString().substring(11, 19)} UTC | Actual: ${new Date(run.actual_time).toISOString().substring(11, 19)} UTC | Delay: ${formatDuration(run.delay_minutes)}`,
    };
  });
}

export function buildMonthlySummaries(runs: CronRun[]): MonthSummary[] {
  const grouped: Record<string, CronRun[]> = {};

  for (const run of runs) {
    const key = run.actual_time.substring(0, 7); // "YYYY-MM"
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(run);
  }

  const keys = Object.keys(grouped).sort(); // chronological "2026-09", "2026-10", "2026-11"

  return keys.map((key) => {
    const monthRuns = [...grouped[key]].sort(
      (a, b) => new Date(a.actual_time).getTime() - new Date(b.actual_time).getTime()
    );
    const delays = monthRuns.map((r) => r.delay_minutes);
    const avg = delays.reduce((acc, d) => acc + d, 0) / delays.length;
    const min = Math.min(...delays);
    const max = Math.max(...delays);

    // Format month name: "October 2026"
    const [yearStr, monthStr] = key.split('-');
    const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
    const monthName = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const shortName = date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

    return {
      monthKey: key,
      monthName,
      shortName,
      avgDelayMinutes: Math.round(avg * 100) / 100,
      minDelayMinutes: Math.round(min * 100) / 100,
      maxDelayMinutes: Math.round(max * 100) / 100,
      runCount: monthRuns.length,
      runs: monthRuns,
    };
  });
}

export function buildMonthDailyBarItems(monthSummary: MonthSummary): BarItem[] {
  return monthSummary.runs.map((run) => {
    const dateObj = new Date(run.actual_time);
    const day = dateObj.getUTCDate();
    const weekday = dateObj.toLocaleDateString(undefined, { weekday: 'short' });

    return {
      id: run.id,
      label: `${day} (${weekday})`,
      subLabel: `${dateObj.toISOString().substring(11, 16)} UTC`,
      value: run.delay_minutes,
      formattedValue: `${run.delay_minutes.toFixed(1)}m (${formatDuration(run.delay_minutes)})`,
      timestamp: run.actual_time,
      extraInfo: `Date: ${dateObj.toISOString().substring(0, 10)} | Scheduled: 03:14 UTC | Actual: ${dateObj.toISOString().substring(11, 19)} UTC | Delay: ${formatDuration(run.delay_minutes)}`,
    };
  });
}

export function buildAllMonthsBarItems(summaries: MonthSummary[]): BarItem[] {
  return summaries.map((summary) => {
    return {
      id: `month-${summary.monthKey}`,
      label: summary.shortName,
      subLabel: `${summary.runCount} cron runs`,
      value: summary.avgDelayMinutes,
      formattedValue: `${summary.avgDelayMinutes.toFixed(1)}m avg (${formatDuration(summary.avgDelayMinutes)})`,
      extraInfo: `${summary.monthName}: ${summary.runCount} runs | Avg: ${formatDuration(summary.avgDelayMinutes)} | Min: ${formatDuration(summary.minDelayMinutes)} | Max: ${formatDuration(summary.maxDelayMinutes)}`,
    };
  });
}

export function buildMonthWeeklyBarItems(runs: CronRun[]): BarItem[] {
  // Group the last 30 days of runs into 4 weekly cohorts
  const sorted = [...runs].sort(
    (a, b) => new Date(b.actual_time).getTime() - new Date(a.actual_time).getTime()
  );
  const last30 = sorted.slice(0, 30);

  // Split into 4 chunks (approx 7-8 days each)
  const chunks = [
    { label: 'Past 7 Days (W1)', runs: last30.slice(0, 7) },
    { label: '8-14 Days Ago (W2)', runs: last30.slice(7, 14) },
    { label: '15-21 Days Ago (W3)', runs: last30.slice(14, 21) },
    { label: '22-30 Days Ago (W4)', runs: last30.slice(21, 30) },
  ];

  return chunks
    .filter((c) => c.runs.length > 0)
    .map((c, idx) => {
      const delays = c.runs.map((r) => r.delay_minutes);
      const avg = delays.reduce((acc, d) => acc + d, 0) / delays.length;
      return {
        id: `month-week-${idx}`,
        label: c.label,
        subLabel: `${c.runs.length} runs`,
        value: Math.round(avg * 100) / 100,
        formattedValue: `${avg.toFixed(1)}m avg (${formatDuration(avg)})`,
        extraInfo: `Average startup delay over ${c.runs.length} runs: ${formatDuration(avg)}`,
      };
    });
}

export function buildYearlyBarItems(summary: SummaryData): BarItem[] {
  return summary.yearly_averages.map((yearStat) => {
    return {
      id: `year-${yearStat.year}`,
      label: `Year ${yearStat.year}`,
      subLabel: `${yearStat.run_count} recorded cron executions`,
      value: yearStat.avg_delay_minutes,
      formattedValue: `${yearStat.avg_delay_minutes.toFixed(1)}m avg (${formatDuration(yearStat.avg_delay_minutes)})`,
      extraInfo: `Yearly average delay: ${formatDuration(yearStat.avg_delay_minutes)} across ${yearStat.run_count} executions`,
    };
  });
}
