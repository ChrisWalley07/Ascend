"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { TimeSeriesPoint } from "@/features/performance-prediction/types";

const chartConfig = {
  actual: {
    label: "Actual",
    color: "oklch(0.93 0.24 128)",
  },
  projected: {
    label: "Projected",
    color: "oklch(0.75 0.17 60)",
  },
} satisfies ChartConfig;

type Props = {
  title: string;
  description?: string;
  data: TimeSeriesPoint[];
  projectedValue?: number | null;
  className?: string;
};

export function PredictionTrendChart({ title, description, data, projectedValue, className }: Props) {
  const chartData = data.map((point) => ({
    label: point.label,
    actual: point.projected ? undefined : point.value,
    projected: point.projected ? point.value : undefined,
    bridge: point.projected ? undefined : point.value,
  }));

  const lastActual = [...data].reverse().find((p) => !p.projected);
  if (lastActual && projectedValue != null) {
    const bridgeIndex = chartData.findIndex((d) => d.label === lastActual.label);
    if (bridgeIndex >= 0) {
      chartData[bridgeIndex] = { ...chartData[bridgeIndex], bridge: lastActual.value, projected: lastActual.value };
    }
  }

  const mergedData = chartData.map((row, index) => {
    const prev = chartData[index - 1];
    if (row.projected != null && prev?.actual != null && row.projected === prev.actual) {
      return { ...row, actual: prev.actual };
    }
    return row;
  });

  return (
    <div className={className ?? "surface p-5"}>
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground/60">{description}</p>}
      </div>
      <ChartContainer config={chartConfig} className="h-[160px] w-full">
        <LineChart
          data={
            mergedData.length > 0
              ? mergedData
              : [{ label: "—", actual: 0, projected: undefined, bridge: undefined }]
          }
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "oklch(0.52 0 0)", fontSize: 10, fontWeight: 500 }}
            tickMargin={8}
          />
          <YAxis hide domain={["auto", "auto"]} />
          <ChartTooltip
            cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
            content={<ChartTooltipContent indicator="line" className="bg-card border-white/10 text-foreground shadow-xl" />}
          />
          <Line
            dataKey="actual"
            stroke="var(--color-actual)"
            type="monotone"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            activeDot={{ r: 4, fill: "oklch(0.93 0.24 128)", strokeWidth: 0 }}
          />
          <Line
            dataKey="projected"
            stroke="var(--color-projected)"
            type="monotone"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 3, fill: "oklch(0.75 0.17 60)", strokeWidth: 0 }}
            connectNulls
          />
          {projectedValue != null && (
            <ReferenceLine
              y={projectedValue}
              stroke="oklch(0.75 0.17 60 / 0.35)"
              strokeDasharray="4 4"
            />
          )}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
