import { cn } from "@/lib/utils";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

type AscendLogoProps = {
  /** Icon only, wordmark only, or both */
  variant?: "full" | "icon" | "wordmark";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  layout?: "horizontal" | "vertical";
  className?: string;
  showTagline?: boolean;
};

const iconSizes = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
  xl: "h-16 w-16",
  hero: "h-24 w-24",
};

const wordmarkSizes = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-3xl",
  hero: "text-5xl",
};

export function AscendMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="ascend-peak" x1="8" y1="34" x2="32" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6BB800" />
          <stop offset="0.45" stopColor="#9AE635" />
          <stop offset="1" stopColor="#D4FF70" />
        </linearGradient>
        <linearGradient id="ascend-glow" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B6FF3B" stopOpacity="0.35" />
          <stop offset="1" stopColor="#B6FF3B" stopOpacity="0" />
        </linearGradient>
        <filter id="ascend-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glow behind peak */}
      <ellipse cx="20" cy="22" rx="14" ry="12" fill="url(#ascend-glow)" />

      {/* Ascending steps — momentum before the peak */}
      <rect x="7" y="26" width="5" height="6" rx="1" fill="#B6FF3B" fillOpacity="0.28" />
      <rect x="13" y="21" width="5" height="11" rx="1" fill="#B6FF3B" fillOpacity="0.45" />

      {/* Main peak — upward thrust */}
      <path
        d="M20 7L33 31H7L20 7Z"
        fill="url(#ascend-peak)"
        filter="url(#ascend-soft)"
      />

      {/* Highlight ridge */}
      <path
        d="M20 7L12 28H20V7Z"
        fill="white"
        fillOpacity="0.12"
      />

      {/* Summit marker */}
      <circle cx="20" cy="11" r="2.2" fill="#F5FFD6" />
      <circle cx="20" cy="11" r="1" fill="#B6FF3B" />

      {/* Upward trajectory line */}
      <path
        d="M10 30C14 24 17 18 20 11"
        stroke="#D4FF70"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 3"
        opacity="0.7"
      />
    </svg>
  );
}

export function AscendLogo({
  variant = "full",
  size = "md",
  layout = "horizontal",
  className,
  showTagline = false,
}: AscendLogoProps) {
  const showIcon = variant === "full" || variant === "icon";
  const showWordmark = variant === "full" || variant === "wordmark";

  return (
    <div
      className={cn(
        "flex items-center",
        layout === "vertical" ? "flex-col gap-4 text-center" : "gap-2.5",
        className,
      )}
    >
      {showIcon && (
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center rounded-xl bg-lime/10 ring-1 ring-lime/25 shadow-[0_0_24px_oklch(0.93_0.24_128/18%)]",
            iconSizes[size],
            size === "hero" && "rounded-2xl shadow-[0_0_48px_oklch(0.93_0.24_128/28%)]",
          )}
        >
          <AscendMark className={cn(size === "hero" ? "h-[58%] w-[58%]" : "h-[62%] w-[62%]")} />
        </div>
      )}
      {showWordmark && (
        <div className={cn("min-w-0 leading-none", layout === "vertical" && "space-y-2")}>
          <p
            className={cn(
              "font-bold tracking-[0.18em] text-foreground",
              wordmarkSizes[size],
            )}
          >
            {APP_NAME}
          </p>
          {showTagline && (
            <p
              className={cn(
                "font-medium uppercase tracking-[0.22em] text-muted-foreground",
                size === "hero" ? "text-xs" : "mt-1 text-[10px]",
              )}
            >
              {APP_TAGLINE}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
