import { describe, expect, test } from "bun:test";

import { runAllGolden } from "./golden";

describe("golden agent pipeline", () => {
  for (const outcome of runAllGolden()) {
    test(`${outcome.expectation.case_id} matches its expected decision trail`, () => {
      const failures = outcome.checks.filter((check) => !check.pass);

      expect(failures).toEqual([]);
    });
  }
});
