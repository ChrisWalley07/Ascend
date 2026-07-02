export type {
  SportSlug,
  SportView,
  SportContext,
} from "@/domain/models/sport";

export {
  SPORT_VIEW_COOKIE,
  toSportSlug,
  toSportDepartment,
  toSportView,
  isSportView,
  resolveActiveView,
  canSwitchViews,
  buildSportContext,
} from "@/domain/models/sport";
