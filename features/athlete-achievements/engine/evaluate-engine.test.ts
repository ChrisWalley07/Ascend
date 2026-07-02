import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { defineAchievement } from "../types/definition";
import { achievementId } from "../types/ids";
import { runAchievementEngine } from "./evaluate-engine";
import { isRequirementMet } from "./evaluate-requirement";
import { crossfitTestAchievements } from "./test-fixtures";

function buildContext(
  metrics: Record<string, number>,
  completed: string[] = [],
) {
  return {
    userId: "user-1",
    asOf: new Date("2026-06-01T12:00:00.000Z"),
    metrics,
    completedAchievementIds: new Set(completed.map(achievementId)),
    activeCategories: ["crossfit", "hyrox", "running", "weightlifting"] as const,
  };
}

describe("runAchievementEngine", () => {
  it("completes first-wod when workout_count reaches 1", () => {
    const result = runAchievementEngine({
      definitions: crossfitTestAchievements,
      context: buildContext({ workout_count: 1 }),
      options: { categories: ["crossfit"] },
    });

    assert.equal(result.completed.length, 1);
    assert.equal(result.completed[0]?.id, achievementId("crossfit.first-wod"));
    assert.equal(result.earnedXp, 50);
    assert.equal(result.newlyCompleted.length, 1);
    assert.equal(result.completionPercent, 33);
  });

  it("keeps fran-sub-5 locked until first-wod is completed", () => {
    const result = runAchievementEngine({
      definitions: crossfitTestAchievements,
      context: buildContext({ fran_time_seconds: 280 }),
      options: { categories: ["crossfit"] },
    });

    const fran = result.locked.find((item) => item.id === achievementId("crossfit.fran-sub-5"));
    assert.ok(fran);
    assert.equal(fran.completed, false);
    assert.equal(fran.unlocked, false);
    assert.ok(!result.completed.some((item) => item.id === achievementId("crossfit.fran-sub-5")));
  });

  it("unlocks and completes chained achievements in one pass", () => {
    const result = runAchievementEngine({
      definitions: crossfitTestAchievements,
      context: buildContext({
        workout_count: 1,
        fran_time_seconds: 280,
      }),
      options: { categories: ["crossfit"] },
    });

    const fran = result.completed.find((item) => item.id === achievementId("crossfit.fran-sub-5"));
    assert.ok(fran);
    assert.equal(result.earnedXp, 430);
    assert.equal(result.newlyUnlocked.includes(achievementId("crossfit.fran-sub-5")), true);
  });

  it("calculates partial progress for available achievements", () => {
    const result = runAchievementEngine({
      definitions: crossfitTestAchievements,
      context: buildContext({
        workout_count: 1,
        streak_days: 3,
      }),
      options: { categories: ["crossfit"] },
    });

    const streak = result.available.find((item) => item.id === achievementId("crossfit.week-streak"));
    assert.ok(streak);
    assert.equal(streak.progress.percent, 43);
    assert.equal(result.nextAchievements[0]?.id, achievementId("crossfit.week-streak"));
  });

  it("does not re-award XP for prior completions", () => {
    const firstWodId = achievementId("crossfit.first-wod");
    const result = runAchievementEngine({
      definitions: crossfitTestAchievements,
      context: buildContext({ workout_count: 1 }, ["crossfit.first-wod"]),
      options: {
        categories: ["crossfit"],
        priorCompleted: new Map([
          [firstWodId, { completedAt: "2026-05-01T00:00:00.000Z", xpAwarded: 50 }],
        ]),
      },
    });

    assert.equal(result.newlyCompleted.length, 0);
    assert.equal(result.newlyEarnedXp, 0);
    assert.equal(result.earnedXp, 50);
  });

  it("partitions achievements into locked, available, and completed", () => {
    const result = runAchievementEngine({
      definitions: crossfitTestAchievements,
      context: buildContext({
        workout_count: 1,
        streak_days: 2,
      }),
      options: { categories: ["crossfit"] },
    });

    assert.equal(
      result.locked.length + result.available.length + result.completed.length,
      result.all.length,
    );
    assert.ok(result.nextAchievements.length <= 5);
  });
});

describe("isRequirementMet", () => {
  it("supports compound requirements", () => {
    const compound = defineAchievement({
      id: "test.compound",
      title: "Compound",
      description: "Test",
      category: "crossfit",
      difficulty: "beginner",
      icon: { name: "star" },
      xp: 10,
      prerequisites: [],
      rarity: "common",
      requirements: {
        id: "root",
        label: "All",
        kind: "compound",
        operator: "all",
        requirements: [
          {
            id: "a",
            label: "A",
            kind: "count",
            metric: "workout_count",
            target: 2,
          },
          {
            id: "b",
            label: "B",
            kind: "numeric",
            metric: "engine_score",
            operator: "gte",
            target: 70,
          },
        ],
      },
    });

    assert.equal(
      isRequirementMet(compound.requirements, { workout_count: 1, engine_score: 80 }),
      false,
    );
    assert.equal(
      isRequirementMet(compound.requirements, { workout_count: 2, engine_score: 80 }),
      true,
    );
  });
});
