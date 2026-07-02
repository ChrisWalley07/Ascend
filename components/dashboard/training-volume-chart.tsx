"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { ChartPoint } from "@/lib/types";

type TrainingVolumeChartProps = {
  data: ChartPoint[];
};

const chartConfig = {
  value: {
    label: "Volume (kg)",
    color: "oklch(0.93 0.24 128)",
  },
} satisfies ChartConfig;

export function TrainingVolumeChart({ data }: TrainingVolumeChartProps) {
  const max = Math.max(...data.map((d) => d.value));
  const avg = Math.round(data.reduce((s, d) => s + d.value, 0) / data.length);

  return (
    <div className="surface p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Training Volume
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {max.toLocaleString()}
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">kg peak</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">7-day avg</p>
          <p className="text-sm font-semibold text-lime">{avg.toLocaleString()} kg</p>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[180px] w-full">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.93 0.24 128)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="oklch(0.93 0.24 128)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "oklch(0.52 0 0)", fontSize: 11, fontWeight: 500 }}
            tickMargin={8}
          />
          <YAxis hide />
          <ReferenceLine
            y={avg}
            stroke="oklch(0.93 0.24 128)"
            strokeDasharray="4 4"
            strokeOpacity={0.3}
            strokeWidth={1}
          />
          <ChartTooltip
            cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
            content={
              <ChartTooltipContent
                indicator="line"
                className="bg-card border-white/10 text-foreground shadow-xl"
              />
            }
          />
          <Area
            dataKey="value"
            type="monotone"
            fill="url(#volGrad)"
            stroke="oklch(0.93 0.24 128)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "oklch(0.93 0.24 128)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
