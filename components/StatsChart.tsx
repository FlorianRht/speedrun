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
      <div className="text-sm text-ink/50 py-12 text-center">
        Pas encore assez de runs pour afficher un graphique.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#241F3A15" />
        <XAxis dataKey="date" fontSize={12} tick={{ fill: "#241F3A99" }} />
        <YAxis
          fontSize={12}
          tick={{ fill: "#241F3A99" }}
          tickFormatter={(v) => formatSeconds(v)}
          width={80}
        />
        <Tooltip
          formatter={(value: number) => [formatSeconds(value), "Temps"]}
          labelFormatter={(label) => `Run du ${label}`}
        />
        <Line type="monotone" dataKey="seconds" stroke="#8B2E6B" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
