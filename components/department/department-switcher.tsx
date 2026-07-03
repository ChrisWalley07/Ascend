"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";

import { selectSportDepartmentAction } from "@/app/actions/department";
import { cn } from "@/lib/utils";
import { DEPARTMENT_LIST, type DepartmentId } from "@/lib/departments";

type Props = {
  currentDepartment: DepartmentId;
  compact?: boolean;
};

export function DepartmentSwitcher({ currentDepartment, compact }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const current = DEPARTMENT_LIST.find((d) => d.id === currentDepartment) ?? DEPARTMENT_LIST[0];
  const Icon = current.icon;

  const handleChange = (value: string) => {
    if (value === currentDepartment) return;
    startTransition(async () => {
      const result = await selectSportDepartmentAction(value);
      if (result.error) return;
      router.refresh();
    });
  };

  return (
    <div className={cn("relative", compact ? "px-3 py-2" : "px-3 pb-3")}>
      {!compact && (
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Sport mode
        </p>
      )}
      <div className="relative">
        <div
          className={cn(
            "pointer-events-none flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5",
            isPending && "opacity-60",
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime/10 ring-1 ring-lime/20">
            <Icon className="h-3.5 w-3.5 text-lime" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">{current.label}</p>
            {!compact && (
              <p className="truncate text-[10px] text-muted-foreground">{current.tagline}</p>
            )}
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </div>
        <select
          aria-label="Switch sport mode"
          value={currentDepartment}
          disabled={isPending}
          onChange={(e) => handleChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {DEPARTMENT_LIST.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
