"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { selectSportDepartmentAndRedirect } from "@/app/actions/department";
import { buttonVariants } from "@/components/ui/button";
import { DEPARTMENT_LIST, type DepartmentId } from "@/lib/departments";
import { cn } from "@/lib/utils";

type Props = {
  initialDepartment?: DepartmentId | null;
  variant?: "onboarding" | "home";
};

export function DepartmentPicker({ initialDepartment, variant = "onboarding" }: Props) {
  const [selected, setSelected] = useState<DepartmentId | null>(initialDepartment ?? null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (id: DepartmentId) => {
    setSelected(id);
    setError(null);

    if (variant === "onboarding") {
      startTransition(async () => {
        const result = await selectSportDepartmentAndRedirect(id);
        if (result?.error) setError(result.error);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "grid gap-3",
          variant === "onboarding" ? "sm:grid-cols-3" : "sm:grid-cols-3 max-w-3xl mx-auto",
        )}
      >
        {DEPARTMENT_LIST.map((dept) => {
          const Icon = dept.icon;
          const active = selected === dept.id;

          return (
            <button
              key={dept.id}
              type="button"
              disabled={isPending && variant === "onboarding"}
              onClick={() => handleSelect(dept.id)}
              className={cn(
                "group relative rounded-2xl border p-5 text-left transition-all duration-200",
                "hover:border-lime/35 hover:bg-lime/5",
                active
                  ? "border-lime/40 bg-lime/8 ring-1 ring-lime/25"
                  : "border-white/10 bg-white/3",
                isPending && variant === "onboarding" && "opacity-70",
              )}
            >
              {active && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-lime text-black">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <div
                className={cn(
                  "mb-3 flex h-11 w-11 items-center justify-center rounded-xl ring-1",
                  active ? "bg-lime/15 ring-lime/30" : "bg-white/5 ring-white/10",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-lime" : dept.accentClass)} />
              </div>
              <p className="text-base font-semibold text-foreground">{dept.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{dept.description}</p>
              {variant === "onboarding" && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {dept.highlights.slice(0, 3).map((h) => (
                    <li
                      key={h}
                      className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      {variant === "home" && selected && (
        <div className="flex justify-center pt-2">
          <Link
            href={`/signup?department=${selected}`}
            className={cn(buttonVariants({ size: "lg" }), "bg-lime px-8 text-black hover:bg-lime/90")}
          >
            Start as {DEPARTMENT_LIST.find((d) => d.id === selected)?.label} athlete
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {isPending && variant === "onboarding" && (
        <p className="text-center text-sm text-muted-foreground">Setting up your department…</p>
      )}
    </div>
  );
}
