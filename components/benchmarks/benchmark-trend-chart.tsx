"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

type TrendPoint = { label: string; value: number };

const chartConfig = {
  value: {
    label: "Score",
    color: "oklch(0.93 0.24 128)",
  },
} satisfies ChartConfig;

export function BenchmarkTrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length < 2) return null;

  return (
    <ChartContainer config={chartConfig} className="h-[140px] w-full">
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "oklch(0.52 0 0)", fontSize: 10 }}
          tickMargin={6}
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
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={{ r: 3, fill: "oklch(0.93 0.24 128)", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "oklch(0.93 0.24 128)", strokeWidth: 0 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
