import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { WeeklyDigest } from "@/features/weekly-digest";
import { cn } from "@/lib/utils";

type Props = {
  digest: WeeklyDigest;
  className?: string;
};

export function WeeklyDigestCard({ digest, className }: Props) {
  return (
    <section className={cn("rounded-2xl border border-white/8 bg-white/[0.02] p-4", className)}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {digest.weekLabel}
        </p>
        <Link href="/coach" className="text-[10px] text-muted-foreground hover:text-lime flex items-center gap-0.5">
          Coach <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <p className="text-sm font-semibold text-foreground">{digest.headline}</p>
      <ul className="mt-2 space-y-1">
        {digest.bullets.map((bullet, i) => (
          <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
            <span className="text-lime/60 shrink-0">·</span>
            {bullet}
          </li>
        ))}
      </ul>
    </section>
  );
}
