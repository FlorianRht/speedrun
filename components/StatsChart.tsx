"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { EvolutionSeries } from "@/lib/stats";
import { formatSeconds } from "@/lib/time";

const Y_MIN_TOTAL = 25 * 60;

export function StatsChart({
  data,
  series,
}: {
  /** @deprecated Prefer series */
  data?: { date: string; seconds: number }[];
  series?: EvolutionSeries[];
}) {
  const allSeries = useMemo<EvolutionSeries[]>(() => {
    if (series && series.length > 0) return series;
    if (data && data.length > 0) {
      return [{ id: "total", label: "Temps total", points: data }];
    }
    return [];
  }, [series, data]);

  const [activeId, setActiveId] = useState(allSeries[0]?.id ?? "total");
  const active = allSeries.find((s) => s.id === activeId) ?? allSeries[0];

  if (!active || active.points.length === 0) {
    return (
      <div className="text-sm text-muted py-12 text-center">
        Pas encore assez de runs pour afficher un graphique.
      </div>
    );
  }

  const isTotal = active.id === "total";
  const values = active.points.map((p) => p.seconds);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const pad = Math.max(15, (maxVal - minVal) * 0.15 || 30);
  const yMin = isTotal ? Y_MIN_TOTAL : Math.max(0, minVal - pad);
  const yMax = Math.max(yMin + 60, maxVal + pad);

  return (
    <div className="w-full max-w-full space-y-4">
      {allSeries.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          {allSeries.map((s) => {
            const selected = s.id === active.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveId(s.id)}
                className={`touch-manipulation shrink-0 rounded-full px-3.5 py-2.5 text-xs font-medium transition active:opacity-70 ${
                  selected
                    ? "bg-berry text-white"
                    : "text-muted hover:text-foreground"
                }`}
                style={
                  selected
                    ? undefined
                    : { background: "var(--surface)", border: "1px solid var(--card-border)" }
                }
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={active.points} margin={{ top: 10, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            fontSize={11}
            tick={{ fill: "var(--muted)" }}
            interval="preserveStartEnd"
            tickMargin={4}
          />
          <YAxis
            fontSize={10}
            tick={{ fill: "var(--muted)" }}
            tickFormatter={(v) => formatSeconds(v)}
            domain={[yMin, yMax]}
            width={76}
          />
          <Tooltip
            formatter={(value: number) => [formatSeconds(value), active.label]}
            labelFormatter={(label) => `Run du ${label}`}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: "0.75rem",
              color: "var(--foreground)",
            }}
            labelStyle={{ color: "var(--muted)" }}
          />
          <Line
            type="monotone"
            dataKey="seconds"
            stroke={isTotal ? "#b044e0" : "#4AB3C8"}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted">
        {active.points.length} point{active.points.length > 1 ? "s" : ""} · {active.label}
        {!isTotal && " (uniquement les runs avec ce split renseigné)"}
      </p>
    </div>
  );
}
