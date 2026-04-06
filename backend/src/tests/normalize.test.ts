import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeInsights } from "../lib/normalize.js";

describe("normalizeInsights", () => {
  it("returns fallback schema for malformed model output", () => {
    const malformed = {
      summary: 9,
      revenue: "invalid",
    };

    const normalized = normalizeInsights(malformed);
    assert.equal(typeof normalized.summary, "string");
    assert.ok(Array.isArray(normalized.risks));
    assert.ok(Array.isArray(normalized.changes));
    assert.ok(Array.isArray(normalized.actionPlan));
    assert.equal(normalized.confidence, 0.35);
  });
});
