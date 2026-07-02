import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  subtitle?: string;
};

export function MetricCard({ label, value, subtitle }: MetricCardProps) {
  return (
    <Card className="border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between">
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
        </div>
        {subtitle ? <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p> : null}
      </CardContent>
    </Card>
  );
}
