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
  Legend,
} from "recharts";
import type { EvolutionSeries } from "@/lib/stats";
import { formatSeconds } from "@/lib/time";

const Y_MIN_TOTAL = 25 * 60;
const TIME_STROKE = "#b044e0";
const CHAPTER_STROKE = "#4AB3C8";
const DEATHS_STROKE = "#E8B84B";

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
      return [
        {
          id: "total",
          label: "Temps total",
          points: data.map((p) => ({ date: p.date, value: p.seconds })),
        },
      ];
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
  const timeValues = active.points.map((p) => p.value);
  const minTime = Math.min(...timeValues);
  const maxTime = Math.max(...timeValues);
  const timePad = Math.max(15, (maxTime - minTime) * 0.15 || 30);
  const yMinTime = isTotal ? Y_MIN_TOTAL : Math.max(0, minTime - timePad);
  const yMaxTime = Math.max(yMinTime + 60, maxTime + timePad);

  const deathValues = active.points
    .map((p) => p.deaths)
    .filter((d): d is number => d != null);
  const showDeaths = deathValues.length > 0;
  const minDeaths = showDeaths ? Math.min(...deathValues) : 0;
  const maxDeaths = showDeaths ? Math.max(...deathValues) : 0;
  const deathPad = Math.max(2, (maxDeaths - minDeaths) * 0.15 || 5);
  const yMinDeaths = showDeaths ? Math.max(0, Math.floor(minDeaths - deathPad)) : 0;
  const yMaxDeaths = showDeaths ? Math.ceil(maxDeaths + deathPad) : 10;

  const timeStroke = isTotal ? TIME_STROKE : CHAPTER_STROKE;

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

      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={active.points}
          margin={{ top: 10, right: showDeaths ? 8 : 8, left: 4, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            fontSize={11}
            tick={{ fill: "var(--muted)" }}
            interval="preserveStartEnd"
            tickMargin={4}
          />
          <YAxis
            yAxisId="time"
            fontSize={10}
            tick={{ fill: "var(--muted)" }}
            tickFormatter={(v) => formatSeconds(v)}
            domain={[yMinTime, yMaxTime]}
            width={76}
          />
          {showDeaths && (
            <YAxis
              yAxisId="deaths"
              orientation="right"
              fontSize={10}
              tick={{ fill: DEATHS_STROKE }}
              tickFormatter={(v) => String(Math.round(v))}
              domain={[yMinDeaths, yMaxDeaths]}
              width={36}
              allowDecimals={false}
            />
          )}
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "Morts") return [Math.round(value), "Morts"];
              return [formatSeconds(value), "Temps"];
            }}
            labelFormatter={(label) => `Run du ${label}`}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: "0.75rem",
              color: "var(--foreground)",
            }}
            labelStyle={{ color: "var(--muted)" }}
          />
          {showDeaths && (
            <Legend
              verticalAlign="top"
              height={28}
              formatter={(value) => (
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{value}</span>
              )}
            />
          )}
          <Line
            yAxisId="time"
            type="monotone"
            dataKey="value"
            name="Temps"
            stroke={timeStroke}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
          {showDeaths && (
            <Line
              yAxisId="deaths"
              type="monotone"
              dataKey="deaths"
              name="Morts"
              stroke={DEATHS_STROKE}
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={{ r: 3 }}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted">
        {active.points.length} point{active.points.length > 1 ? "s" : ""} · {active.label}
        {showDeaths && " + morts"}
        {!isTotal && " (uniquement les runs avec ce split renseigné)"}
      </p>
    </div>
  );
}
