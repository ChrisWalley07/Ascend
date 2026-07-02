"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

type LineDatum = { label: string; value: number };

const chartConfig = {
  value: {
    label: "Value",
    color: "oklch(0.93 0.24 128)",
  },
} satisfies ChartConfig;

export function PerformanceLineChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: LineDatum[];
}) {
  return (
    <div className="surface p-5">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/60">{description}</p>
      </div>
      <ChartContainer config={chartConfig} className="h-[180px] w-full">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "oklch(0.52 0 0)", fontSize: 10, fontWeight: 500 }}
            tickMargin={8}
          />
          <YAxis hide />
          <ChartTooltip
            cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
            content={
              <ChartTooltipContent
                indicator="line"
                className="bg-card border-white/10 text-foreground shadow-xl"
              />
            }
          />
          <Line
            dataKey="value"
            stroke="var(--color-value)"
            type="monotone"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "oklch(0.93 0.24 128)", strokeWidth: 0 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
