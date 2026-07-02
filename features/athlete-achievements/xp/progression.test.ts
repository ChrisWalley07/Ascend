import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateXpProgression,
} from "./calculate.ts";
import {
  getCumulativeXpForLevel,
  getLevelFromTotalXp,
} from "./progression.ts";

describe("XP progression thresholds", () => {
  it("matches the defined level 1–3 curve", () => {
    assert.equal(getCumulativeXpForLevel(1), 0);
    assert.equal(getCumulativeXpForLevel(2), 250);
    assert.equal(getCumulativeXpForLevel(3), 600);
  });

  it("scales exponentially from level 4", () => {
    assert.equal(getCumulativeXpForLevel(4), 1440);
    assert.equal(getCumulativeXpForLevel(5), 3456);
  });
});

describe("calculateXpProgression", () => {
  it("starts at level 1 with 0 XP", () => {
    const progress = calculateXpProgression(0);
    assert.equal(progress.currentLevel, 1);
    assert.equal(progress.totalXp, 0);
    assert.equal(progress.xpToNextLevel, 250);
    assert.equal(progress.progressPercent, 0);
    assert.equal(progress.levelTitle, "Rookie");
  });

  it("reports mid-level progress correctly", () => {
    const progress = calculateXpProgression(125);
    assert.equal(progress.currentLevel, 1);
    assert.equal(progress.xpInCurrentLevel, 125);
    assert.equal(progress.xpToNextLevel, 125);
    assert.equal(progress.progressPercent, 50);
  });

  it("levels up at 250 XP", () => {
    const progress = calculateXpProgression(250);
    assert.equal(progress.currentLevel, 2);
    assert.equal(progress.xpToNextLevel, 350);
    assert.equal(progress.levelTitle, "Trainee");
  });

  it("reaches level 3 at 600 XP", () => {
    const progress = calculateXpProgression(600);
    assert.equal(progress.currentLevel, 3);
    assert.equal(progress.xpForNextLevel, 1440);
  });

  it("derives level from total XP", () => {
    assert.equal(getLevelFromTotalXp(599), 2);
    assert.equal(getLevelFromTotalXp(600), 3);
    assert.equal(getLevelFromTotalXp(1439), 3);
    assert.equal(getLevelFromTotalXp(1440), 4);
  });
});
