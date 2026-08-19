"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  data: Record<string, number>;
};

const GAP = 2;
const LEFT_GUTTER = 28;
const TOP_GUTTER = 20;
const WEEK_LABELS = ["", "L", "", "M", "", "V", ""];
const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

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
    .sort((a, b) => a - b);
  let color = PANEL_COLORS[thresholds[0]];
  for (const threshold of thresholds) {
    if (threshold > count) {
      color = PANEL_COLORS[threshold];
      break;
    }
    color = PANEL_COLORS[threshold];
  }
  return color;
}

export function ContributionCalendar({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rectSize, setRectSize] = useState(10);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const startDate = useMemo(() => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - 1);
    return startOfWeek(d);
  }, [today]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      const weeks = Math.ceil((today.getTime() - startDate.getTime()) / (7 * 86400000)) + 1;
      const available = Math.max(0, width - LEFT_GUTTER);
      const size = Math.floor((available - weeks * GAP) / weeks);
      setRectSize(Math.max(3, Math.min(14, size)));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [startDate, today]);

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

  const svgWidth = LEFT_GUTTER + weeks.length * rectSize + (weeks.length - 1) * GAP;
  const svgHeight = TOP_GUTTER + 7 * rectSize + 6 * GAP;

  return (
    <div ref={containerRef} className="w-full max-w-full overflow-hidden space-y-3">
      <svg
        width="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="text-muted"
        role="img"
        aria-label="Calendrier d'activité des runs"
      >
        {WEEK_LABELS.map((label, row) =>
          label ? (
            <text
              key={label + row}
              x={0}
              y={TOP_GUTTER + row * (rectSize + GAP) + rectSize * 0.75}
              fontSize={10}
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
                  fontSize={10}
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
                    rx={2}
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

      <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs text-muted">
        {LEGEND_LEVELS.map((level) => (
          <div key={level.threshold} className="flex items-center gap-1">
            <span className="tabular-nums">
              {level.threshold === 0 ? "0" : `${level.threshold}+`}
            </span>
            <span
              className="inline-block rounded-sm shrink-0"
              style={{
                width: rectSize,
                height: rectSize,
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
  );
}
