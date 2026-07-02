"use client";

import { createElement } from "react";

import { ICONS, type IconName } from "@/lib/icons";

export function AppIcon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return createElement(ICONS[name], { className });
}
