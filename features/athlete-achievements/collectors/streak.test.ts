import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computeTrainingStreakDays } from "./streak";

describe("computeTrainingStreakDays", () => {
  it("returns 0 for no sessions", () => {
    assert.equal(computeTrainingStreakDays([], new Date("2026-06-26")), 0);
  });

  it("counts consecutive calendar days ending on asOf", () => {
    const asOf = new Date("2026-06-26T18:00:00");
    const dates = [
      new Date("2026-06-26T07:00:00"),
      new Date("2026-06-25T19:00:00"),
      new Date("2026-06-24T08:00:00"),
      new Date("2026-06-22T08:00:00"),
    ];

    assert.equal(computeTrainingStreakDays(dates, asOf), 3);
  });

  it("ignores future sessions", () => {
    const asOf = new Date("2026-06-26");
    const dates = [new Date("2026-06-27"), new Date("2026-06-26")];
    assert.equal(computeTrainingStreakDays(dates, asOf), 1);
  });
});
