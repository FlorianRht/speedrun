"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatSeconds } from "@/lib/time";

type Point = { date: string; seconds: number };

export function StatsChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-muted py-12 text-center">
        Pas encore assez de runs pour afficher un graphique.
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            fontSize={11}
            tick={{ fill: "var(--muted)" }}
            interval="preserveStartEnd"
            tickMargin={4}
          />
          <YAxis
            fontSize={11}
            tick={{ fill: "var(--muted)" }}
            tickFormatter={(v) => formatSeconds(v)}
            width={58}
          />
          <Tooltip
            formatter={(value: number) => [formatSeconds(value), "Temps"]}
            labelFormatter={(label) => `Run du ${label}`}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: "0.75rem",
              color: "var(--foreground)",
            }}
            labelStyle={{ color: "var(--muted)" }}
          />
          <Line type="monotone" dataKey="seconds" stroke="#b044e0" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
