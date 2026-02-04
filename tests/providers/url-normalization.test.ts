import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { normalizeUrlLike } from "../../src/brief.js";

// These tests focus on provider URL detection/normalization parity.
// (Normalization happens in normalizeUrlLike.)

describe("provider URL normalization", () => {
  test("accepts YouTube youtu.be short links", () => {
    const u = normalizeUrlLike("https://youtu.be/dQw4w9WgXcQ?t=43");
    assert.ok(u);
    assert.match(u, /^https:\/\//);
  });

  test("accepts Vimeo player URLs", () => {
    const u = normalizeUrlLike("https://player.vimeo.com/video/76979871");
    assert.ok(u);
    assert.match(u, /^https:\/\//);
  });

  test("normalizes unlisted Vimeo URLs to preserve the hash (h)", () => {
    const u = normalizeUrlLike("https://vimeo.com/76979871/abcdef1234");
    assert.equal(u, "https://vimeo.com/76979871?h=abcdef1234");
  });

  test("normalizes unlisted Vimeo URLs on channels paths to preserve the hash (h)", () => {
    const u = normalizeUrlLike("https://vimeo.com/channels/staffpicks/76979871/abcdef1234");
    assert.equal(u, "https://vimeo.com/76979871?h=abcdef1234");
  });

  test("accepts Loom share URLs", () => {
    const u = normalizeUrlLike("https://www.loom.com/share/0123456789abcdef0123456789abcdef");
    assert.ok(u);
    assert.match(u, /^https:\/\//);
  });
});
