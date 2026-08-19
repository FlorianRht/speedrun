"use client";

import { useEffect, useRef, useState } from "react";
import { formatSeconds } from "@/lib/time";

type ValueType = "time" | "integer" | "decimal";

type Props = {
  value: number | null;
  type: ValueType;
  decimals?: number;
  delay?: number;
  duration?: number;
  highlight?: boolean;
  className?: string;
};

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

function formatValue(value: number, type: ValueType, decimals: number): string {
  if (type === "time") return formatSeconds(value);
  if (type === "integer") return String(Math.round(value));
  return value.toFixed(decimals);
}

function defaultDuration(value: number, type: ValueType): number {
  if (type === "integer") return Math.min(900, 350 + value * 8);
  if (type === "decimal") return 1000;
  return Math.min(1600, 900 + value * 0.05);
}

export function AnimatedValue({
  value,
  type,
  decimals = 1,
  delay = 0,
  duration,
  highlight = false,
  className = "",
}: Props) {
  const [display, setDisplay] = useState("-");
  const [popping, setPopping] = useState(false);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPopping(false);

    if (value === null || Number.isNaN(value)) {
      setDisplay("-");
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(formatValue(value, type, decimals));
      return;
    }

    const animDuration = duration ?? defaultDuration(value, type);
    const startAt = performance.now() + delay;
    setDisplay(formatValue(0, type, decimals));

    const tick = (now: number) => {
      if (now < startAt) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min((now - startAt) / animDuration, 1);
      const current = value * easeOutExpo(progress);
      setDisplay(formatValue(current, type, decimals));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      setDisplay(formatValue(value, type, decimals));
      if (highlight) {
        setPopping(true);
        window.setTimeout(() => setPopping(false), 400);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, type, decimals, delay, duration, highlight]);

  return (
    <span
      className={`tabular-nums inline-block ${popping ? "animate-stat-pop" : ""} ${className}`}
    >
      {display}
    </span>
  );
}
