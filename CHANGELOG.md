# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-11-03

### General
- Official **v1.1** release of the GitHub Actions Cron Delay Tracker.
- Updated version tags across dashboard header, footer, `index.html`, package manifests, and documentation.

### Added
- **Daily Runs Column Chart (`DailyRunsChart.tsx`)**:
  - Full-fidelity vertical column bar chart displaying the scheduler startup delay for each individual daily run in this repository.
  - Interactive range filtering presets: **All Runs** (all 55+ daily executions), **Last 30 Days**, **Last 14 Days**, and **Last 7 Days**.
  - Dynamic navigation and sorting controls: Chronological (Oldest → Newest) vs Newest First toggle, plus instant jump buttons (`⇤ First Run`, `Latest Run ⇥`).
  - Auto-scroll to latest run on load so users immediately see recent executions while retaining smooth horizontal scrolling across the entire repository history.
  - Dedicated daily cohort KPI cards: Total Runs Count (with on-time percentage ≤ 15m), Cohort Average Delay, Fastest Run (Min Delay), and Peak Queue Congestion (Max Delay).
  - New **Daily Runs** tab button with live run counter badge in the dashboard navigation bar.
- **Analytics & Data Utilities**:
  - Added `buildDailyRunBarItems()` and `getDailyRunsStats()` to `frontend/src/utils/stats.ts`.
  - Added ref forwarding and `scrollToEndOnMount` support to `ColumnBarChart.tsx` for seamless horizontal navigation.

## [1.0.0] - 2026-11-02

### General
- Official **v1.0** production release of the GitHub Actions Cron Delay Tracker.
- Successfully operated continuously in production since early September 2026, recording daily runner startup jitter across automated cron runs with 100% reliability.
- Added version badge (`v1.0`) directly into the web dashboard header, footer, and page title.
- Verified stable GitHub Pages deployment pipeline and GitHub Actions automation.

### Added
- **Light & Dark Mode Support**:
  - Full support for both light and dark modes with instantaneous theme toggle and `localStorage` persistence.
- **Monthly Overview Analytics (`MonthlyOverview.tsx`)**:
  - Multi-month trend comparison across all recorded calendar months (September, October, November 2026).
  - Day-by-day drill-down view displaying every individual daily execution in any selected month.
  - Dedicated monthly KPI cards: Month Average Delay, Recorded Executions, Fastest Run, and Slowest Run.
- **Vertical Column Bar Visualization (`ColumnBarChart.tsx`)**:
  - Adjusted visualizations from horizontal bars to responsive vertical column bars with baseline scaling, threshold color gradients, hover tooltips, and horizontal benchmark average lines.
- **Cron Delay Tracking Engine (`scripts/record_delay.py`)**:
  - Automatically calculates startup delay against the scheduled 03:14 UTC daily cron trigger.
  - Stores all historical runs in an in-repository SQLite database (`data/delays.db`).
  - Supports manual triggers and explicit delay overrides for verification.
  - Historical data generator (`--seed`) pre-populates realistic data spanning 3 years.
  - Exports aggregated JSON snapshots to `data/delays.json` and frontend assets.
- **Automated Unit Tests (`scripts/test_tracker.py`)**:
  - Tests covering UTC timestamp calculation, GitHub queue latency simulations, SQLite table initialization, record insertion, and JSON metric export.
- **Vite Web Dashboard (`frontend/`)**:
  - Built with Vite, React 18, TypeScript, and Tailwind CSS.
  - **Horizontal Bar Graph Visualization**:
    - Daily startup delay times for the last week.
    - Average startup delay for the last month with weekly breakdown cohorts.
    - Multi-year comparison comparing average startup delays across past years (2024, 2025, 2026).
  - Summary KPI cards for latest run, weekly average, monthly average, and all-time statistics.
  - Searchable and filterable execution history table with run IDs and trigger types.
- **GitHub Actions Workflow (`.github/workflows/cron-delay-monitor.yml`)**:
  - Scheduled daily at `14 3 * * *` (03:14 UTC).
  - Automatic `[skip ci]` commit and push of updated SQLite database and JSON.
  - Automated build and deployment to GitHub Pages via `actions/deploy-pages@v4`.
- **Developer & Agent Documentation**:
  - `AGENTS.md`: Full architectural context, data schemas, CLI workflows, and extension guidelines for AI assistants and engineers.
  - `README.md`: Comprehensive project overview, badges, local setup, and usage instructions.
  - Root `package.json` with unified scripts (`npm run dev`, `npm run build`, `npm test`, `npm run record`).

### Changed
- Converted repository from a starter Jekyll template into a modern, full-stack automated analytics repository.
- Configured `.gitignore` to track SQLite database while cleanly excluding Node build artifacts and modules.

### Removed
- Legacy Jekyll workflow `.github/workflows/build-and-deploy.yml` and deprecated `Gemfile`.
