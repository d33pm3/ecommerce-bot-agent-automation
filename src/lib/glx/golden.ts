import { GEN_CASE_SHELLS, GOLDEN, type GoldenExpectation } from "./data/golden.gen";
import { runCrew, type RunResult } from "./pipeline";
import type { Channel } from "./types";

export type GoldenCheck = { field: string; expected: string; actual: string; pass: boolean };

export type GoldenOutcome = {
  expectation: GoldenExpectation;
  messageText: string;
  run: RunResult;
  checks: GoldenCheck[];
  passed: boolean;
};

function eq(field: string, expected: unknown, actual: unknown): GoldenCheck {
  const e = Array.isArray(expected) ? [...expected].sort().join(", ") : String(expected);
  const a = Array.isArray(actual) ? [...actual].sort().join(", ") : String(actual);
  return { field, expected: e, actual: a, pass: e === a };
}

/** Replays a golden case shell through the live spine and diffs it against eval/golden/*.json. */
export function runGolden(expectation: GoldenExpectation): GoldenOutcome {
  const shell = GEN_CASE_SHELLS.find((c) => c.case_id === expectation.case_id)!;
  const run = runCrew({
    caseId: shell.case_id,
    rawText: shell.message_text,
    channel: shell.channel as Channel,
    orderIdHint: shell.order_id,
  });

  const { issue, a2, a3, a4, a5 } = run;
  const checks: GoldenCheck[] = [
    eq("ps_id", expectation.ps_id, issue.ps_id),
    eq("theme_id", expectation.theme_id, issue.theme),
    eq("A2 clauses", expectation.expected_a2_clauses, a2.clauses.map((c) => c.id)),
  ];

  const a3e = expectation.expected_a3 as Record<string, unknown>;
  if ("eligibility" in a3e) checks.push(eq("A3 eligibility", a3e["eligibility"], a3.eligibility));
  if ("refund_amount" in a3e) checks.push(eq("A3 amount", Number(a3e["refund_amount"]), a3.amount));
  if ("refund_mode" in a3e) checks.push(eq("A3 instrument", a3e["refund_mode"], a3.instrument));
  if ("ambiguity_flag" in a3e) checks.push(eq("A3 ambiguity", a3e["ambiguity_flag"], a3.ambiguity_flag));
  if ("exception_candidate" in a3e)
    checks.push(eq("A3 exception_candidate", a3e["exception_candidate"], a3.exception_candidate));
  if ("otp_verified" in a3e) checks.push(eq("A3 otp_verified", a3e["otp_verified"], a3.otp_verified));
  if ("failed_pickups" in a3e) checks.push(eq("A3 failed_pickups", a3e["failed_pickups"], a3.failed_pickups));
  if ("seal_intact_override" in a3e)
    checks.push(eq("A3 seal_intact_override", a3e["seal_intact_override"], a3.seal_intact_override));
  if ("wallet_forced" in a3e) checks.push(eq("A3 wallet_forced", a3e["wallet_forced"], a3.wallet_forced));
  if ("redispatch_offered" in a3e)
    checks.push(eq("A3 redispatch_offered", a3e["redispatch_offered"], a3.redispatch_offered));

  const a4e = expectation.expected_a4 as Record<string, unknown>;
  if ("defer_execution" in a4e) checks.push(eq("A4 defer_execution", a4e["defer_execution"], a4.defer_execution));
  if ("selected_contains" in a4e) {
    const selected = a4.options.find((o) => o.selected);
    checks.push(eq("A4 selected option", a4e["selected_contains"], selected?.kind ?? "none"));
  }
  if ("prefer" in a4e) checks.push(eq("A4 preferred alternative", a4e["prefer"], a4.preferred_alternative));
  if ("in_policy_refund_option" in a4e)
    checks.push(eq("A4 refund option offered", a4e["in_policy_refund_option"], a4.in_policy_refund_option));
  if ("offer_label_or_drop_point" in a4e)
    checks.push(
      eq("A4 self-ship label offered", a4e["offer_label_or_drop_point"], a4.options.some((o) => o.kind === "label")),
    );
  checks.push(eq("A4 validator (A3 = plan)", true, a4.validator.passed));

  checks.push(eq("A5 manual_required", expectation.expected_a5.manual_required, a5.manual_required));
  checks.push(eq("A5 queue", expectation.expected_a5.queue, a5.queue));
  checks.push(eq("A5 triggers non-empty", true, a5.triggers_fired.length > 0));
  checks.push(eq("A5 cannot create refund row", false, a5.can_create_refund_row));

  if (expectation.fail_if === "auto_refund") {
    checks.push(eq("no auto-refund (amount = 0)", 0, a4.selected_amount));
    checks.push(eq("no refund option offered", false, a4.in_policy_refund_option));
  }

  return {
    expectation,
    messageText: shell.message_text,
    run,
    checks,
    passed: checks.every((c) => c.pass),
  };
}

export function runAllGolden(): GoldenOutcome[] {
  return GOLDEN.map(runGolden);
}

export { GOLDEN };
