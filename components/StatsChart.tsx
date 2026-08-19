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

const Y_MIN_SECONDS = 25 * 60;

export function StatsChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-muted py-12 text-center">
        Pas encore assez de runs pour afficher un graphique.
      </div>
    );
  }

  const maxSeconds = Math.max(...data.map((d) => d.seconds));
  const yMax = Math.max(Y_MIN_SECONDS + 120, maxSeconds + 120);

  return (
    <div className="w-full max-w-full">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 8, left: 4, bottom: 0 }}>
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
            domain={[Y_MIN_SECONDS, yMax]}
            width={76}
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
