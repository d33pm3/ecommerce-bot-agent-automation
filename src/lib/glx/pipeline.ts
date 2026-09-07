import {
  runA1a,
  runA1b,
  runA2,
  runA3,
  runA4,
  runA5,
  type ApplicableClauseSet,
  type EscalationDecision,
  type InterpretationResult,
  type IssueObject,
  type ParsedIntake,
  type ResolutionPlan,
} from "./agents";
import { makeArtefact } from "./store";
import type { Artefact, CaseRecord, Channel } from "./types";

export type StepId = "A1a" | "A1b" | "A2" | "A3" | "A4" | "A5";

export const STEPS: { id: StepId; agent: string; job: string }[] = [
  { id: "A1a", agent: "A1 · Parse", job: "Normalise text, split sub-issues, extract entities, detect S1 keywords" },
  { id: "A1b", agent: "A1 · Enrich & Classify", job: "Match the order, attach OMS facts, assign Theme + PS-ID + confidence" },
  { id: "A2", agent: "A2 · Knowledge Search", job: "Static keyed lookup — verbatim clauses, version, gap / conflict flags" },
  { id: "A3", agent: "A3 · Policy Interpretation", job: "Deterministic rules — eligibility, amount, instrument, clause trail" },
  { id: "A4", agent: "A4 · Resolution Recommendation", job: "Rank options, validate amount against A3, draft the customer reply" },
  { id: "A5", agent: "A5 · Escalation", job: "Evaluate every trigger, set manual_required, assign the queue" },
];

export type RunResult = {
  caseRecord: CaseRecord;
  parsed: ParsedIntake;
  issue: IssueObject;
  a2: ApplicableClauseSet;
  a3: InterpretationResult;
  a4: ResolutionPlan;
  a5: EscalationDecision;
  artefacts: Artefact[];
};

/** Runs the whole sequential spine. Pure — the caller decides when to persist. */
export function runCrew(input: {
  caseId: string;
  rawText: string;
  channel: Channel;
  orderIdHint: string | null;
}): RunResult {
  const parsed = runA1a({ rawText: input.rawText, channel: input.channel, orderIdHint: input.orderIdHint });
  const issue = runA1b(parsed);
  const a2 = runA2(issue);
  const a3 = runA3(issue, a2, parsed.normalised_text);
  const a4 = runA4(input.caseId, issue, a3, parsed.normalised_text);
  const a5 = runA5(issue, a2, a3, a4, parsed);

  const artefacts: Artefact[] = [
    makeArtefact("A1a", "Order Issue Identification — Parse", "ParsedIntake", parsed as unknown as Record<string, unknown>),
    makeArtefact("A1b", "Order Issue Identification — Enrich & Classify", "IssueObject", issue as unknown as Record<string, unknown>),
    makeArtefact("A2", "Knowledge Search", "ApplicableClauseSet", a2 as unknown as Record<string, unknown>),
    makeArtefact("A3", "Policy Interpretation", "InterpretationResult", a3 as unknown as Record<string, unknown>),
    makeArtefact("A4", "Resolution Recommendation", "ResolutionPlan", a4 as unknown as Record<string, unknown>),
    makeArtefact("A5", "Escalation Agent", "EscalationDecision", a5 as unknown as Record<string, unknown>),
  ];

  const caseRecord: CaseRecord = {
    id: input.caseId,
    createdAt: new Date().toISOString(),
    channel: input.channel,
    rawText: input.rawText,
    orderId: issue.order_id,
    customerName: issue.customer,
    theme: issue.theme,
    psId: issue.ps_id,
    severity: issue.severity,
    confidence: issue.confidence,
    eligibility: a3.eligibility,
    amount: a4.selected_amount,
    instrument: a4.instrument,
    manualRequired: a5.manual_required,
    queue: a5.queue,
    status: a5.manual_required ? "awaiting_desk" : "information_reply",
    artefacts,
    ackDueAt: a5.ack_due_at,
    redressDueAt: a5.redress_due_at,
  };

  return { caseRecord, parsed, issue, a2, a3, a4, a5, artefacts };
}
