import { GLOBAL_MIN, GLOBAL_MAX } from "~/data/formatted";
import {
  normalOperating,
  upperOperating,
  lowerOperating,
} from "~/data/formatted/operatingZones";

// Interpolate value for a given day from a break array
function interpolate(
  breaks: { day: number; value: number }[],
  day: number
): number {
  if (!breaks || breaks.length === 0) return 0;
  for (let i = 0; i < breaks.length - 1; i++) {
    const d0 = breaks[i];
    const d1 = breaks[i + 1];
    if (d0 && d1 && d0.day <= day && d1.day >= day) {
      const t = (day - d0.day) / (d1.day - d0.day);
      return d0.value + t * (d1.value - d0.value);
    }
  }
  const found = breaks.find((b) => b.day === day);
  if (found) return found.value;
  const first = breaks[0];
  const last = breaks[breaks.length - 1];
  if (!first || !last) return 0;
  return day < first.day ? first.value : last.value;
}

function getAreaData(bounds: { upper: { day: number; value: number }[]; lower: { day: number; value: number }[] }) {
  const allDays = Array.from(
    new Set([
      ...bounds.upper.map((d) => d.day),
      ...bounds.lower.map((d) => d.day),
    ])
  ).sort((a, b) => a - b);

  return allDays.map((day) => ({
    day,
    upper: interpolate(bounds.upper, day),
    lower: interpolate(bounds.lower, day),
  }));
}

function getSingleAreaData(breaks: { day: number; value: number }[]) {
  const allDays = Array.from(new Set(breaks.map((d) => d.day))).sort((a, b) => a - b);
  return allDays.map((day) => ({
    day,
    value: interpolate(breaks, day),
  }));
}

export function useOperatingZones() {
  return {
    GLOBAL_MIN,
    GLOBAL_MAX,
    normalOperating,
    upperOperating,
    lowerOperating,
    interpolate,
    getAreaData,
    getSingleAreaData,
  };
}
