import { AUTHORITY, DRAFT_TEMPLATES } from "./data/config.gen";
import { CLAUSES, POLICY_VERSION, clauses, problemLabel, psSpec, resolveClauseId, themeLabel } from "./policy";
import { customerOf, findOrder } from "./seed";
import type { Channel, Eligibility, Order, Queue } from "./types";

/* ------------------------------------------------------------------ *
 * A1a — Parse
 * ------------------------------------------------------------------ */

export type ParsedIntake = {
  artefact: "ParsedIntake";
  channel: Channel;
  normalised_text: string;
  sub_issues: string[];
  entities: { order_id: string | null; sku: string | null; awb: string | null; validated: false };
  s1_flags: string[];
  unactionable: boolean;
};

const S1_KEYWORDS: { key: string; words: string[] }[] = [
  { key: "allergy", words: ["allerg", "rash", "burning", "itch", "swell", "reaction", "breakout", "broke out"] },
  { key: "fake", words: ["fake product", "counterfeit", "not genuine", "duplicate product"] },
  { key: "nch", words: ["nch", "national consumer helpline", "consumer helpline"] },
  { key: "legal", words: ["legal", "lawyer", "consumer court", "legal notice", "grievance"] },
  { key: "threatened", words: ["threat", "threatened"] },
  { key: "harassment", words: ["harass", "misbehav", "abused"] },
];

export function runA1a(input: {
  rawText: string;
  channel: Channel;
  orderIdHint: string | null;
}): ParsedIntake {
  const text = input.rawText.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();

  const orderMatch = /glx-ord-[a-z]?\d{3,4}/i.exec(text);
  const skuMatch = /glx-sku-\d{3}/i.exec(text);
  const awbMatch = /awb[\s-]?[a-z0-9]{4,}/i.exec(text);

  const s1 = S1_KEYWORDS.filter((g) => g.words.some((w) => lower.includes(w))).map((g) => g.key);

  const subIssues = text
    .split(/(?<=[.!?])\s+|\band\b(?=\s+(?:now|it|they|my))/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  return {
    artefact: "ParsedIntake",
    channel: input.channel,
    normalised_text: text,
    sub_issues: subIssues.length > 0 ? subIssues : text.length > 0 ? [text] : [],
    entities: {
      order_id: orderMatch?.[0]?.toUpperCase() ?? (input.orderIdHint ? input.orderIdHint.toUpperCase() : null),
      sku: skuMatch?.[0]?.toUpperCase() ?? null,
      awb: awbMatch?.[0]?.toUpperCase().replace(/\s/g, "") ?? null,
      validated: false,
    },
    s1_flags: s1,
    unactionable: text.length < 8,
  };
}

/* ------------------------------------------------------------------ *
 * A1b — Enrich & Classify
 * ------------------------------------------------------------------ */

export type IssueObject = {
  artefact: "IssueObject";
  order_id: string | null;
  customer: string | null;
  order_state: string;
  payment_mode: string;
  amount_paid: number;
  items: string[];
  expected_weight_g: number;
  packed_weight_g: number;
  otp_verified: boolean;
  fake_attempt_flag: boolean;
  failed_pickups: number;
  batch: string | null;
  theme: string;
  theme_label: string;
  ps_id: string;
  ps_label: string;
  child_notes: string[];
  severity: "S1" | "S2" | "S3";
  confidence: number;
  enrichment: "complete" | "partial";
  s1_flags: string[];
  lead_workload: string[];
};

function classify(lower: string, order: Order | null, s1: string[]): { psId: string; child: string[] } {
  const has = (...w: string[]) => w.some((x) => lower.includes(x));

  if (s1.includes("allergy")) return { psId: "PS-4.4", child: [] };
  if (has("nch", "consumer helpline", "consumer court", "legal notice", "lawyer"))
    return { psId: "PS-8.9", child: [] };
  if (has("harass", "misbehav", "abused", "threatened")) return { psId: "PS-2.7", child: [] };
  if (has("counterfeit", "not genuine", "fake product", "suspect the product is fake"))
    return { psId: "PS-4.1", child: [] };
  if (has("pickup", "reverse pickup", "return pickup"))
    return { psId: has("lost", "never reached the warehouse") ? "PS-5.2" : "PS-5.1", child: [] };
  if (has("opened", "used product", "seal", "first turn", "mechanism is broken"))
    return { psId: "PS-7.1", child: [] };
  if (
    has("nobody called", "no one called", "nobody came", "no one came", "fake attempt", "attempted", "returning to origin") ||
    (order?.shipment.fakeAttemptFlag === true && order.status === "rto")
  )
    return { psId: "PS-2.1", child: order?.status === "rto" ? ["reverse leg on RTO"] : [] };
  if (has("short", "missing", "only 2", "only two", "one less", "did not receive one"))
    return { psId: "PS-1.1", child: [] };
  if (has("marked delivered", "shows delivered", "says delivered", "pod", "never received"))
    return { psId: "PS-3.4", child: [] };
  if (has("wrong shade", "different shade", "shade is wrong")) return { psId: "PS-3.2", child: [] };
  if (has("not like the photo", "different from the photo", "vs photo")) return { psId: "PS-4.8", child: [] };
  if (has("wrong item", "wrong product", "different product")) return { psId: "PS-3.1", child: [] };
  if (has("leak", "spilled", "cracked", "broken")) return { psId: "PS-2.3", child: [] };
  if (has("wallet")) return { psId: "PS-6.5", child: [] };
  if (has("cod fee", "fee not refunded", "shipping not refunded")) return { psId: "PS-6.6", child: [] };
  if (has("still not refunded", "refund is stuck", "no refund yet", "48 hours", "sla"))
    return { psId: "PS-6.1", child: [] };
  if (has("cancel"))
    return {
      psId: order && (order.status === "created" || order.status === "pending") ? "PS-1.3" : "PS-1.5",
      child: [],
    };
  if (has("twitter", "instagram", "x.com", "post about", "tagging", "tag you")) return { psId: "PS-8.8", child: [] };
  if (has("grievance officer")) return { psId: "PS-8.3", child: [] };
  return { psId: "PS-UNKNOWN", child: [] };
}

export function runA1b(parsed: ParsedIntake): IssueObject {
  const order = findOrder(parsed.entities.order_id);
  const customer = customerOf(order);
  const lower = parsed.normalised_text.toLowerCase();
  const c = classify(lower, order, parsed.s1_flags);
  const spec = psSpec(c.psId);

  const enrichment: "complete" | "partial" = order ? "complete" : "partial";
  const s1Flags = [...parsed.s1_flags];
  if (spec.s1 && s1Flags.length === 0) s1Flags.push(c.psId.toLowerCase().replace("ps-", "ps"));

  const severity = (s1Flags.length > 0 ? "S1" : spec.severity) as "S1" | "S2" | "S3";

  let confidence = 0.93;
  if (!order && c.psId !== "PS-8.9") confidence = AUTHORITY.confidence.partial_enrichment_cap;
  if (c.psId === "PS-UNKNOWN") confidence = Math.min(confidence, 0.62);
  if (parsed.unactionable) confidence = 0.4;

  return {
    artefact: "IssueObject",
    order_id: order?.id ?? parsed.entities.order_id,
    customer: customer?.name ?? null,
    order_state: order?.status ?? "unlinked",
    payment_mode: order?.payment.mode ?? "unknown",
    amount_paid: order?.payment.amountPaid ?? 0,
    items: order
      ? order.items.map(
          (i) => `${i.qty} × ${i.name}${i.shade ? ` (${i.shade})` : ""} — ₹${i.linePaid} · batch ${i.batch ?? "—"}`,
        )
      : [],
    expected_weight_g: order?.shipment.expectedWeightG ?? 0,
    packed_weight_g: order?.shipment.packedWeightG ?? 0,
    otp_verified: order?.shipment.otpVerified ?? false,
    fake_attempt_flag: order?.shipment.fakeAttemptFlag ?? false,
    failed_pickups: order?.failedPickups ?? 0,
    batch: order?.shipment.batch ?? null,
    theme: spec.theme,
    theme_label: themeLabel(spec.theme),
    ps_id: c.psId,
    ps_label: problemLabel(c.psId),
    child_notes: c.child,
    severity,
    confidence: Number(confidence.toFixed(2)),
    enrichment,
    s1_flags: s1Flags,
    lead_workload: [],
  };
}

/* ------------------------------------------------------------------ *
 * A2 — Knowledge Search (keyed lookup over policy.db, no RAG)
 * ------------------------------------------------------------------ */

export type ApplicableClauseSet = {
  artefact: "ApplicableClauseSet";
  lookup_key: string;
  version: string;
  clauses: { id: string; text: string; section: string }[];
  aliases_resolved: { alias: string; clause_id: string }[];
  missing: string[];
  gap: boolean;
  conflict: boolean;
  method: string;
};

const CONFLICT_PAIRS: [string, string][] = [
  ["KB-1.RET-03", "KB-6.PREC-03"],
  ["KB-1.RET-06", "KB-8.EXC-02"],
];

export function runA2(issue: IssueObject): ApplicableClauseSet {
  const spec = psSpec(issue.ps_id);
  const requested = spec.clauses;
  const resolvedIds = requested.map((id) => resolveClauseId(id));
  const set = clauses(resolvedIds);
  const found = set.map((c) => c.id);
  const missing = resolvedIds.filter((id) => !found.includes(id));
  const conflict = CONFLICT_PAIRS.some(([a, b]) => found.includes(a) && found.includes(b));

  return {
    artefact: "ApplicableClauseSet",
    lookup_key: `${issue.theme} / ${issue.ps_id} / ${issue.order_state} / ${issue.payment_mode}${
      issue.s1_flags.length ? ` / s1:${issue.s1_flags.join("+")}` : ""
    }`,
    version: POLICY_VERSION,
    clauses: set.map((c) => ({ id: c.id, text: c.text, section: c.section })),
    aliases_resolved: requested
      .map((id, i) => ({ alias: id, clause_id: resolvedIds[i]! }))
      .filter((r) => r.alias !== r.clause_id),
    missing,
    gap: set.length === 0,
    conflict,
    method: `static keyed lookup: routing_matrix[${issue.ps_id}] → policy.db (${CLAUSES.length} ratified clauses, ${POLICY_VERSION}) — no retrieval, no paraphrase`,
  };
}

/* ------------------------------------------------------------------ *
 * A3 — Policy Interpretation (deterministic trees, ported from the pack)
 * ------------------------------------------------------------------ */

export type InterpretationResult = {
  artefact: "InterpretationResult";
  eligibility: Eligibility;
  amount: number;
  amount_math: string;
  instrument: string;
  sla_hours: number;
  platform_fault: boolean;
  within_window: boolean | null;
  days_since_delivery: number | null;
  exception_candidate: boolean;
  ambiguity_flag: boolean;
  seal_intact_override: boolean;
  redispatch_offered: boolean;
  wallet_forced: boolean;
  failed_pickups: number;
  otp_verified: boolean;
  statutory_floor_check: "pass" | "review";
  reasoning_trail: string[];
  notes: string[];
};

function instrumentFor(order: Order | null, lower: string): string {
  if (!order) return "not_determined";
  if (order.payment.mode === "cod") return "bank_transfer";
  if (/(refund|credit).{0,30}(to|in|into).{0,15}wallet/.test(lower) && !/do not|don't|not.*wallet/.test(lower))
    return "wallet_customer_requested";
  return "original_payment_source";
}

export function runA3(issue: IssueObject, a2: ApplicableClauseSet, rawText: string): InterpretationResult {
  const order = findOrder(issue.order_id);
  const lower = rawText.toLowerCase();
  const allowed = a2.clauses.map((c) => c.id);
  const trail: string[] = [];
  const notes: string[] = [];
  const cite = (id: string) => {
    if (allowed.includes(id) && !trail.includes(id)) trail.push(id);
  };
  for (const id of allowed) cite(id);

  const paid = order?.payment.amountPaid ?? issue.amount_paid;
  const instrument = instrumentFor(order, lower);

  let days: number | null = null;
  let withinWindow: boolean | null = null;
  if (order?.deliveredAt) {
    days = Math.floor((Date.now() - new Date(order.deliveredAt).getTime()) / 86_400_000);
    withinWindow = days <= 15;
  }

  const result: InterpretationResult = {
    artefact: "InterpretationResult",
    eligibility: "conditional",
    amount: 0,
    amount_math: "No monetary entitlement computed.",
    instrument,
    sla_hours: AUTHORITY.sla.refund_initiation_business_hours,
    platform_fault: false,
    within_window: withinWindow,
    days_since_delivery: days,
    exception_candidate: false,
    ambiguity_flag: a2.conflict,
    seal_intact_override: false,
    redispatch_offered: false,
    wallet_forced: false,
    failed_pickups: issue.failed_pickups,
    otp_verified: issue.otp_verified,
    statutory_floor_check: "pass",
    reasoning_trail: trail,
    notes,
  };

  const ps = issue.ps_id;

  if (ps === "PS-4.4") {
    result.eligibility = "in_policy_no";
    result.amount = 0;
    result.exception_candidate = true;
    result.sla_hours = AUTHORITY.sla.safety_first_touch_hours;
    result.instrument = "not_applicable";
    result.amount_math = "Commercial entitlement ₹0 — an allergic reaction is not a returnable ground (KB-1.RET-06).";
    notes.push("Safety review and manufacturer notification required. Goodwill is an exception, not a right.");
    notes.push(`Batch ${issue.batch ?? "unknown"} logged for quality review; first touch within 2 hours.`);
  } else if (ps === "PS-8.9" || ps === "PS-8.3" || ps === "PS-8.1" || ps === "PS-8.8") {
    result.eligibility = "exception_candidate";
    result.amount = 0;
    result.exception_candidate = true;
    result.instrument = "not_applicable";
    result.amount_math = "Escalation channel handling — no commercial position is coined by the pipeline.";
    result.statutory_floor_check = "review";
    notes.push("Statutory clock applies: acknowledgement in 48 hours, redressal within 30 days.");
  } else if (ps === "PS-4.8" || ps === "PS-3.2") {
    result.eligibility = "in_policy_no";
    result.amount = 0;
    result.instrument = "not_applicable";
    result.amount_math = "Shade perception claim — no entitlement without established mis-shipment or defect.";
    notes.push("Evidence (neutral-light photo, batch shot) supports an exchange decision, not an automatic refund.");
  } else if (ps === "PS-1.1") {
    const line = order?.items[0] ?? null;
    const unit = line ? line.unitPrice : 0;
    result.eligibility = "in_policy_yes";
    result.amount = unit;
    result.platform_fault = true;
    result.amount_math = line
      ? `One unit missing of ${order?.items.length ?? 0} shipped lines → unit price ₹${unit} × 1 affected unit = ₹${unit}`
      : "Affected line not resolvable from OMS.";
    notes.push(
      `Packed weight ${issue.packed_weight_g}g vs expected ${issue.expected_weight_g}g (Δ ${
        issue.expected_weight_g - issue.packed_weight_g
      }g). KB-1.RET-04: a matching weight log alone cannot deny a count shortfall.`,
    );
  } else if (ps === "PS-2.1") {
    result.eligibility = "in_policy_yes";
    result.amount = paid;
    result.platform_fault = true;
    result.redispatch_offered = true;
    result.amount_math = `Platform-attributable RTO — full amount paid ₹${paid} refundable, fees included, not gated on warehouse receipt (KB-2.CAN-03).`;
    notes.push("Unverified attempt with no OTP: refund not gated on warehouse receipt; re-dispatch offered first.");
    if (order?.payment.mode === "cod") notes.push("COD refund is paid by bank transfer (KB-3.SLA-03) — no cash refunds.");
  } else if (ps === "PS-3.1" || ps === "PS-2.3" || ps === "PS-5.2" || ps === "PS-6.1" || ps === "PS-6.5" || ps === "PS-6.6") {
    result.eligibility = "in_policy_yes";
    result.amount = paid;
    result.platform_fault = ps !== "PS-6.5" && ps !== "PS-6.6";
    result.amount_math = `Amount actually paid on the affected order = ₹${paid}, refunded to ${instrument}.`;
    if (ps === "PS-6.5") {
      result.wallet_forced = false;
      notes.push(
        "Refund goes to the original payment source. Wallet credit is used only where the customer explicitly asked for it.",
      );
    }
    if (ps === "PS-6.6") notes.push("COD convenience fee is normally not refunded unless platform fault is established.");
    if (ps === "PS-6.1") result.statutory_floor_check = "review";
  } else if (ps === "PS-7.1") {
    result.eligibility = "in_policy_yes";
    result.amount = paid;
    result.seal_intact_override = true;
    result.ambiguity_flag = true;
    result.amount_math = `Defect established on first use → seal-intact bar disapplied (KB-6.PREC-03); refund ₹${paid}.`;
    notes.push("KB-1.RET-03 requires seals intact; KB-6.PREC-03 overrides it where a defect is established. Human read required.");
  } else if (ps === "PS-3.4" || ps === "PS-5.1") {
    result.eligibility = "conditional";
    result.amount = paid;
    result.amount_math = `Conditional entitlement of ₹${paid} pending the evidence leg (${
      ps === "PS-3.4" ? "POD / OTP verification" : "pickup audit"
    }).`;
    if (ps === "PS-3.4")
      notes.push(`OTP verified: ${issue.otp_verified ? "yes" : "no"}. No OTP on a marked-delivered order shifts the burden to the platform.`);
    else
      notes.push(
        `${issue.failed_pickups} failed pickup attempts on record — offer a self-ship label or drop point; refund must not wait on a third attempt.`,
      );
  } else if (ps === "PS-1.3") {
    const cancellable = order?.status === "created" || order?.status === "pending";
    result.eligibility = cancellable ? "in_policy_yes" : "in_policy_no";
    result.amount = cancellable ? paid : 0;
    result.amount_math = cancellable
      ? `Pre-dispatch cancellation — full ₹${paid} reversible (KB-2.CAN-01).`
      : "Order already dispatched — free cancellation window closed.";
  } else if (ps === "PS-1.5") {
    result.eligibility = "in_policy_no";
    result.amount = 0;
    result.instrument = "not_applicable";
    result.amount_math = "Shipment already dispatched — cancellation refused; return route applies after delivery.";
  } else if (ps === "PS-4.1" || ps === "PS-2.7") {
    result.eligibility = "exception_candidate";
    result.exception_candidate = true;
    result.amount = 0;
    result.instrument = "not_applicable";
    result.amount_math =
      ps === "PS-4.1"
        ? "Authenticity investigation first — batch verification before any money decision."
        : "Conduct investigation with the courier partner before any commercial position.";
  } else {
    result.eligibility = "conditional";
    result.amount = 0;
    result.exception_candidate = true;
    result.instrument = "not_applicable";
    result.amount_math = "Unclassified problem statement — human triage before any entitlement.";
    if (a2.gap) notes.push("A2 returned no keyed clause set for this problem statement (gap=true).");
  }

  if (withinWindow === false && result.amount > 0 && ["PS-1.1", "PS-3.1", "PS-2.3", "PS-7.1"].includes(ps)) {
    result.eligibility = "conditional";
    notes.push(`Delivered ${days} days ago — outside the 15-day issue window (KB-1.RET-01).`);
  }

  if (issue.enrichment === "partial" && result.amount > 0) {
    result.amount = 0;
    result.eligibility = "conditional";
    result.amount_math = "Amount suppressed: no OMS order matched, so paid value cannot be validated.";
    notes.push("Enrichment partial — link the order before any money leg.");
  }

  if (result.amount === 0) result.instrument = result.instrument === "not_determined" ? "not_determined" : result.instrument;
  return result;
}

/* ------------------------------------------------------------------ *
 * A4 — Resolution Recommendation
 * ------------------------------------------------------------------ */

export type ResolutionOption = {
  rank: number;
  kind: "refund" | "replacement" | "redispatch" | "evidence" | "reject" | "goodwill" | "safety" | "label";
  label: string;
  amount: number;
  detail: string;
  selected: boolean;
};

export type ResolutionPlan = {
  artefact: "ResolutionPlan";
  options: ResolutionOption[];
  selected_amount: number;
  instrument: string;
  defer_execution: boolean;
  goodwill_proposal: number;
  in_policy_refund_option: boolean;
  preferred_alternative: string | null;
  template_id: string;
  validator: { a3_amount: number; plan_amount: number; passed: boolean };
  customer_draft: string;
  next_update_at: string;
};

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function fillTemplate(key: keyof typeof DRAFT_TEMPLATES, vars: Record<string, string>) {
  const tpl = DRAFT_TEMPLATES[key as string]!;
  const body = tpl.body.trim().replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
  return { id: tpl.id, body };
}

export function runA4(
  caseId: string,
  issue: IssueObject,
  a3: InterpretationResult,
  rawText: string,
): ResolutionPlan {
  const next = new Date(Date.now() + a3.sla_hours * 3_600_000);
  const options: ResolutionOption[] = [];
  const first = (issue.customer ?? "there").split(" ")[0] ?? "there";
  let templateKey: keyof typeof DRAFT_TEMPLATES = "info_policy";
  let preferred: string | null = null;
  let goodwill = 0;

  if (issue.ps_id === "PS-4.4") {
    templateKey = "safety_allergy";
    options.push({
      rank: 1,
      kind: "safety",
      label: "Safety review + adverse-event questionnaire",
      amount: 0,
      detail: `Batch ${issue.batch ?? "unknown"} logged for manufacturer review; stop-use guidance shared; no commercial refund offered by the pipeline.`,
      selected: true,
    });
    options.push({
      rank: 2,
      kind: "evidence",
      label: "Request photographs and usage timeline",
      amount: 0,
      detail: "Builds the safety file and any later exception decision.",
      selected: false,
    });
    goodwill = AUTHORITY.proposal_caps_inr.agent;
    options.push({
      rank: 3,
      kind: "goodwill",
      label: `Goodwill proposal for the Human Desk (cap ${inr(goodwill)})`,
      amount: 0,
      detail: `Out-of-policy. KB-8.EXC-02 caps the agent proposal at ${inr(goodwill)}; the desk decides, never the pipeline.`,
      selected: false,
    });
  } else if (a3.amount > 0 && issue.ps_id === "PS-2.1") {
    templateKey = "redispatch";
    preferred = "redispatch";
    options.push({
      rank: 1,
      kind: "redispatch",
      label: "Re-dispatch with verified-attempt instructions",
      amount: 0,
      detail: "Customer keeps the product they wanted; courier flagged for a fake-attempt audit.",
      selected: false,
    });
    options.push({
      rank: 2,
      kind: "refund",
      label: `Refund ${inr(a3.amount)} on platform-fault RTO`,
      amount: a3.amount,
      detail: `${a3.amount_math} Instrument: ${a3.instrument}.`,
      selected: true,
    });
    options.push({
      rank: 3,
      kind: "evidence",
      label: "Pull courier attempt logs and call records",
      amount: 0,
      detail: "Courier-ops evidence leg, runs in parallel with the money leg.",
      selected: false,
    });
  } else if (a3.amount > 0 && issue.ps_id === "PS-5.1") {
    templateKey = "refund_item";
    options.push({
      rank: 1,
      kind: "refund",
      label: `Refund ${inr(a3.amount)} without waiting on a third pickup`,
      amount: a3.amount,
      detail: `${a3.amount_math} Instrument: ${a3.instrument}.`,
      selected: true,
    });
    options.push({
      rank: 2,
      kind: "label",
      label: "Issue a self-ship label or nearest drop point",
      amount: 0,
      detail: `Two failed pickups on record (${a3.failed_pickups}). Reverse leg moves to customer-controlled dispatch.`,
      selected: false,
    });
    options.push({
      rank: 3,
      kind: "evidence",
      label: "Courier pickup audit",
      amount: 0,
      detail: "Attempt records requested from the reverse-logistics partner.",
      selected: false,
    });
  } else if (a3.amount > 0) {
    templateKey = "refund_item";
    options.push({
      rank: 1,
      kind: "refund",
      label: `${a3.eligibility === "conditional" ? "Conditional refund" : "Refund"} ${inr(a3.amount)}`,
      amount: a3.amount,
      detail: `${a3.amount_math} Instrument: ${a3.instrument}. Initiation within ${a3.sla_hours} business hours of desk approval.`,
      selected: true,
    });
    options.push({
      rank: 2,
      kind: "replacement",
      label: "Replacement or price-protect dispatch",
      amount: 0,
      detail: "Equal-value substitute where the exact shade is out of stock.",
      selected: false,
    });
    options.push({
      rank: 3,
      kind: "evidence",
      label: "Request unboxing evidence before settlement",
      amount: 0,
      detail: "Only if the desk wants a stronger evidence file; adds friction for the customer.",
      selected: false,
    });
  } else if (a3.eligibility === "in_policy_no") {
    templateKey = "reject_ineligible";
    options.push({
      rank: 1,
      kind: "reject",
      label: "Explain the policy position with clause text",
      amount: 0,
      detail: "Information-only reply quoting the applicable clause verbatim.",
      selected: true,
    });
    options.push({
      rank: 2,
      kind: "evidence",
      label: "Offer an evidence route to reopen",
      amount: 0,
      detail: "Named owner stays on the case; no silent closure.",
      selected: false,
    });
    goodwill = AUTHORITY.proposal_caps_inr.agent;
    options.push({
      rank: 3,
      kind: "goodwill",
      label: `Goodwill review proposal (cap ${inr(goodwill)})`,
      amount: 0,
      detail: "Proposal only — the desk holds the money decision.",
      selected: false,
    });
  } else {
    templateKey = "info_policy";
    options.push({
      rank: 1,
      kind: "evidence",
      label: "Request evidence and hold the clock",
      amount: 0,
      detail: "Ask for the specific artefacts the clause set needs before any money position.",
      selected: true,
    });
    options.push({
      rank: 2,
      kind: "reject",
      label: "Explain the policy position with clause text",
      amount: 0,
      detail: "Information-only reply quoting the applicable clause verbatim.",
      selected: false,
    });
    if (a3.ambiguity_flag || a3.exception_candidate) {
      goodwill = AUTHORITY.proposal_caps_inr.agent;
      options.push({
        rank: 3,
        kind: "goodwill",
        label: `Goodwill proposal for the Human Desk (≤ ${inr(goodwill)})`,
        amount: 0,
        detail: "Proposal only. KB-8.EXC-02 forbids maker = checker above ₹500.",
        selected: false,
      });
    }
  }

  const selected = options.find((o) => o.selected) ?? options[0];
  const planAmount = selected ? selected.amount : 0;

  const draft = fillTemplate(templateKey, {
    first_name: first,
    case_id: caseId,
    amount: String(planAmount || a3.amount),
    instrument: a3.instrument.replaceAll("_", " "),
    issue_summary: issue.ps_label.toLowerCase(),
    order_id: issue.order_id ?? "—",
    sku_name: issue.items[0]?.split(" — ")[0] ?? "your item",
    batch_code: issue.batch ?? "—",
    clause_plain: a3.amount_math,
    clause_id: a3.reasoning_trail[0] ?? "KB-1.RET-01",
  });

  return {
    artefact: "ResolutionPlan",
    options,
    selected_amount: planAmount,
    instrument: a3.instrument,
    defer_execution: planAmount > 0,
    goodwill_proposal: goodwill,
    in_policy_refund_option: options.some((o) => o.kind === "refund"),
    preferred_alternative: preferred,
    template_id: draft.id,
    validator: { a3_amount: a3.amount, plan_amount: planAmount, passed: planAmount === a3.amount },
    customer_draft: `${draft.body}\n\nNext update by ${next.toLocaleString("en-IN")}.`,
    next_update_at: next.toISOString(),
  };
}

/* ------------------------------------------------------------------ *
 * A5 — Escalation (HITL gate, ported from the pack's a5_triggers)
 * ------------------------------------------------------------------ */

export type EscalationDecision = {
  artefact: "EscalationDecision";
  manual_required: boolean;
  queue: Queue | null;
  secondary_queues: Queue[];
  triggers_evaluated: { trigger: string; fired: boolean; detail: string }[];
  triggers_fired: string[];
  sla_hours: number;
  ack_due_at: string;
  redress_due_at: string;
  closure_verification_required: true;
  can_create_refund_row: false;
};

export function runA5(
  issue: IssueObject,
  a2: ApplicableClauseSet,
  a3: InterpretationResult,
  a4: ResolutionPlan,
  parsed: ParsedIntake,
): EscalationDecision {
  const spec = psSpec(issue.ps_id);
  const goodwill = a4.goodwill_proposal > 0;
  const threshold = AUTHORITY.confidence.route_hint_threshold;

  const evaluated: { trigger: string; fired: boolean; detail: string }[] = [
    { trigger: "amount>0", fired: a4.selected_amount > 0, detail: `selected amount ${inr(a4.selected_amount)}` },
    {
      trigger: "goodwill>0",
      fired: goodwill,
      detail: goodwill ? `goodwill proposal cap ${inr(a4.goodwill_proposal)}` : "no goodwill proposal",
    },
    { trigger: "s1_flag", fired: issue.s1_flags.length > 0 || spec.s1, detail: issue.s1_flags.join(", ") || (spec.s1 ? `${issue.ps_id} is S1 by matrix` : "none") },
    { trigger: "ambiguity", fired: a3.ambiguity_flag, detail: a3.ambiguity_flag ? "conflicting clauses" : "no conflict" },
    { trigger: "policy_gap", fired: a2.gap, detail: a2.gap ? "no keyed clause set" : "clause set found" },
    { trigger: "clause_conflict", fired: a2.conflict, detail: a2.conflict ? "A2 flagged conflicting clauses" : "none" },
    {
      trigger: `confidence<${threshold}`,
      fired: issue.confidence < threshold,
      detail: `confidence ${issue.confidence}`,
    },
    { trigger: "enrichment_partial", fired: issue.enrichment === "partial", detail: issue.enrichment },
    {
      trigger: "exception_candidate",
      fired: a3.exception_candidate,
      detail: a3.exception_candidate ? "out-of-policy path" : "no",
    },
    {
      trigger: "keyword_nch_legal_social",
      fired:
        ["nch", "legal", "threatened", "harassment"].some((k) => parsed.s1_flags.includes(k)) ||
        issue.ps_id.startsWith("PS-8"),
      detail: issue.ps_id.startsWith("PS-8") ? issue.ps_id : parsed.s1_flags.join(", ") || "none",
    },
    { trigger: "validator_failed", fired: !a4.validator.passed, detail: a4.validator.passed ? "A3 = A4 amount" : "amount mismatch" },
    { trigger: "unactionable_input", fired: parsed.unactionable, detail: parsed.unactionable ? "no case content" : "actionable" },
  ];

  const fired = evaluated.filter((t) => t.fired).map((t) => t.trigger);
  let manual = fired.length > 0 || spec.s1;
  if (a4.selected_amount > 0 && AUTHORITY.hitl.any_payout_requires_human) manual = true;

  let queue: Queue | null = spec.queue_if_money as Queue;
  const secondary: Queue[] = [];

  if (issue.s1_flags.includes("allergy") || issue.ps_id === "PS-4.4") queue = "Q-Safety";
  else if (issue.ps_id === "PS-8.9" || issue.s1_flags.includes("legal") || issue.s1_flags.includes("nch")) queue = "Q-Legal";
  else if (issue.ps_id === "PS-2.7") queue = "Q-Safety";
  else if (issue.ps_id === "PS-2.1") queue = "Q-CourierOps";
  else if (issue.ps_id === "PS-7.1" || issue.ps_id === "PS-UNKNOWN" || issue.ps_id === "PS-4.8") queue = "Q-PolicyOps";
  else if (issue.ps_id === "PS-8.8") queue = "Q-Social";
  else if (issue.ps_id === "PS-8.1" || issue.ps_id === "PS-8.3") queue = "Q-GrievanceOfficer";
  else if (a4.selected_amount > 0) queue = "Q-RefundHITL";

  if (queue !== "Q-RefundHITL" && a4.selected_amount > 0) secondary.push("Q-RefundHITL");

  if (!manual) {
    queue = null;
    fired.push("info_only");
    evaluated.push({ trigger: "info_only", fired: true, detail: "information-only answer, no money leg" });
  }
  if (manual && fired.length === 0) {
    fired.push("mandatory_gate");
    evaluated.push({ trigger: "mandatory_gate", fired: true, detail: "S1 problem statement per routing matrix" });
  }

  const now = Date.now();
  return {
    artefact: "EscalationDecision",
    manual_required: manual,
    queue,
    secondary_queues: secondary,
    triggers_evaluated: evaluated,
    triggers_fired: fired,
    sla_hours: a3.sla_hours,
    ack_due_at: new Date(now + AUTHORITY.sla.grievance_ack_hours * 3_600_000).toISOString(),
    redress_due_at: new Date(now + AUTHORITY.sla.grievance_redressal_days * 86_400_000).toISOString(),
    closure_verification_required: true,
    can_create_refund_row: false,
  };
}
