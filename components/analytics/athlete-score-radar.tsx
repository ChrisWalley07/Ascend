"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

type RadarDatum = { metric: string; current: number; previous?: number };

const chartConfig = {
  current: {
    label: "Current",
    color: "oklch(0.93 0.24 128)",
  },
  previous: {
    label: "Previous",
    color: "oklch(0.50 0 0)",
  },
} satisfies ChartConfig;

export function AthleteScoreRadar({
  data,
  showPrevious = false,
}: {
  data: RadarDatum[];
  showPrevious?: boolean;
}) {
  return (
    <ChartContainer config={chartConfig} className="mx-auto h-[260px] w-full max-w-lg">
      <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <PolarGrid
          stroke="rgba(255,255,255,0.07)"
          radialLines={false}
        />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: "oklch(0.52 0 0)", fontSize: 11, fontWeight: 500 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="bg-card border-white/10 text-foreground shadow-xl"
            />
          }
        />
        {showPrevious && (
          <Radar
            dataKey="previous"
            stroke="var(--color-previous)"
            fill="var(--color-previous)"
            fillOpacity={0.08}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )}
        <Radar
          dataKey="current"
          stroke="var(--color-current)"
          fill="var(--color-current)"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ r: 3, fill: "oklch(0.93 0.24 128)", strokeWidth: 0 }}
        />
      </RadarChart>
    </ChartContainer>
  );
}
