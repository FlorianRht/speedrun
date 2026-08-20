"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  data: Record<string, number>;
};

const GAP = 3;
const LEFT_GUTTER = 18;
const TOP_GUTTER = 18;
const WEEK_LABELS = ["", "L", "", "M", "", "V", ""];
const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MOBILE_WEEKS = 16; // ~4 mois

const PANEL_COLORS: Record<number, string> = {
  0: "var(--card-border, #2a2a3a)",
  1: "#6b21a840",
  2: "#6b21a870",
  4: "#9333eaaa",
  8: "#b044e0",
};

const LEGEND_LEVELS = Object.entries(PANEL_COLORS)
  .map(([threshold, color]) => ({ threshold: Number(threshold), color }))
  .sort((a, b) => a.threshold - b.threshold);

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCount(data: Record<string, number>, date: Date): number {
  const iso = toIsoDate(date);
  if (data[iso] != null) return data[iso];
  const legacy = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  return data[legacy] ?? 0;
}

function colorForCount(count: number): string {
  const thresholds = Object.keys(PANEL_COLORS)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    if (count >= threshold) {
      return PANEL_COLORS[threshold];
    }
  }

  return PANEL_COLORS[0];
}

export function ContributionCalendar({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isMobile = width > 0 && width < 640;

  const startDate = useMemo(() => {
    if (isMobile) {
      const d = addDays(today, -(MOBILE_WEEKS - 1) * 7);
      return startOfWeek(d);
    }
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - 1);
    return startOfWeek(d);
  }, [today, isMobile]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const weeks = useMemo(() => {
    const result: { date: Date; count: number }[][] = [];
    let cursor = new Date(startDate);

    while (cursor <= today) {
      const week: { date: Date; count: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const date = addDays(cursor, i);
        if (date <= today) {
          week.push({ date, count: getCount(data, date) });
        }
      }
      if (week.length > 0) result.push(week);
      cursor = addDays(cursor, 7);
    }
    return result;
  }, [data, startDate, today]);

  const rectSize = useMemo(() => {
    if (width <= 0 || weeks.length === 0) return isMobile ? 14 : 10;
    const available = Math.max(0, width - LEFT_GUTTER);
    const size = Math.floor((available - (weeks.length - 1) * GAP) / weeks.length);
    if (isMobile) return Math.max(12, Math.min(16, size));
    return Math.max(8, Math.min(14, size));
  }, [width, weeks.length, isMobile]);

  const svgWidth = LEFT_GUTTER + weeks.length * rectSize + Math.max(0, weeks.length - 1) * GAP;
  const svgHeight = TOP_GUTTER + 7 * rectSize + 6 * GAP;
  const labelSize = isMobile ? 11 : 10;

  return (
    <div ref={containerRef} className="w-full max-w-full space-y-3">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="text-muted max-w-full"
        role="img"
        aria-label="Calendrier d'activité des runs"
      >
        {WEEK_LABELS.map((label, row) =>
          label ? (
            <text
              key={label + row}
              x={0}
              y={TOP_GUTTER + row * (rectSize + GAP) + rectSize * 0.78}
              fontSize={labelSize}
              fill="currentColor"
            >
              {label}
            </text>
          ) : null
        )}

        {weeks.map((week, col) => {
          const firstDay = week[0]?.date;
          const prevMonth = col > 0 ? weeks[col - 1][0]?.date.getMonth() : null;
          const showMonth =
            firstDay && (col === 0 || firstDay.getMonth() !== prevMonth);

          return (
            <g key={col}>
              {showMonth && firstDay && (
                <text
                  x={LEFT_GUTTER + col * (rectSize + GAP)}
                  y={12}
                  fontSize={labelSize}
                  fill="currentColor"
                >
                  {MONTH_LABELS[firstDay.getMonth()]}
                </text>
              )}
              {week.map(({ date, count }, row) => {
                const x = LEFT_GUTTER + col * (rectSize + GAP);
                const y = TOP_GUTTER + row * (rectSize + GAP);
                const title = `${date.toLocaleDateString("fr-FR")} : ${count} run${count > 1 ? "s" : ""}`;
                return (
                  <rect
                    key={toIsoDate(date)}
                    x={x}
                    y={y}
                    width={rectSize}
                    height={rectSize}
                    rx={3}
                    fill={colorForCount(count)}
                  >
                    <title>{title}</title>
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>{isMobile ? "4 derniers mois" : "12 derniers mois"}</span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {LEGEND_LEVELS.map((level) => (
            <div key={level.threshold} className="flex items-center gap-1">
              <span className="tabular-nums">
                {level.threshold === 0 ? "0" : `${level.threshold}+`}
              </span>
              <span
                className="inline-block rounded-sm shrink-0"
                style={{
                  width: Math.max(10, Math.min(rectSize, 12)),
                  height: Math.max(10, Math.min(rectSize, 12)),
                  backgroundColor: level.color,
                }}
                title={
                  level.threshold === 0
                    ? "Aucune run"
                    : `${level.threshold}+ run${level.threshold > 1 ? "s" : ""}`
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
