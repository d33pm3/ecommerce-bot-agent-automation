import { useEffect, useState } from "react";

import type {
  Artefact,
  CaseRecord,
  OverrideEntry,
  Rma,
  Session,
} from "./types";
import { runA5, type ApplicableClauseSet, type EscalationDecision, type IssueObject, type ParsedIntake, type ResolutionPlan, type InterpretationResult } from "./agents";

const KEY = "glx.console.v1";
const SESSION_KEY = "glx.session.v1";

export type StoreState = {
  cases: CaseRecord[];
  overrides: OverrideEntry[];
  rmas: Rma[];
  seq: number;
};

const EMPTY: StoreState = { cases: [], overrides: [], rmas: [], seq: 1 };

let state: StoreState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): StoreState {
  if (typeof window === "undefined") return EMPTY;
  if (loaded) return state;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...(JSON.parse(raw) as StoreState) };
  } catch {
    state = EMPTY;
  }
  return state;
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota — demo only */
  }
}

function commit(next: StoreState) {
  state = next;
  persist();
  for (const l of listeners) l();
}

export function getState(): StoreState {
  return load();
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Client-only store hook. Returns the empty state during SSR. */
export function useStore(): StoreState {
  const [snap, setSnap] = useState<StoreState>(EMPTY);
  useEffect(() => {
    setSnap(getState());
    return subscribe(() => setSnap({ ...getState() }));
  }, []);
  return snap;
}

export function nextCaseId(): string {
  const s = load();
  const year = new Date().getFullYear();
  return `GLX-CASE-${year}-${String(s.seq).padStart(5, "0")}`;
}

export function makeArtefact(
  agent: Artefact["agent"],
  agentName: string,
  type: string,
  payload: Record<string, unknown>,
  version = 1,
  supersedes: string | null = null,
): Artefact {
  return {
    id: `${agent}-${type}-v${version}-${Math.random().toString(36).slice(2, 8)}`,
    agent,
    agentName,
    type,
    version,
    createdAt: new Date().toISOString(),
    supersedes,
    payload,
  };
}

export function saveCase(rec: CaseRecord) {
  const s = load();
  const exists = s.cases.some((c) => c.id === rec.id);
  commit({
    ...s,
    seq: exists ? s.seq : s.seq + 1,
    cases: exists ? s.cases.map((c) => (c.id === rec.id ? rec : c)) : [rec, ...s.cases],
  });
}

export function getCase(id: string): CaseRecord | null {
  return load().cases.find((c) => c.id === id) ?? null;
}

function updateCase(id: string, fn: (c: CaseRecord) => CaseRecord) {
  const s = load();
  commit({ ...s, cases: s.cases.map((c) => (c.id === id ? fn(c) : c)) });
}

function addOverride(entry: OverrideEntry) {
  const s = load();
  commit({ ...s, overrides: [entry, ...s.overrides] });
}

function addRma(rma: Rma) {
  const s = load();
  commit({ ...s, rmas: [rma, ...s.rmas] });
}

function oid() {
  return Math.random().toString(36).slice(2, 10);
}

/* ------------------------- desk actions ------------------------- */

export function approveAsRecommended(caseId: string, session: Session) {
  const c = getCase(caseId);
  if (!c) return;
  const now = new Date();
  if (c.amount > 0) {
    addRma({
      id: `GLX-RMA-${oid().toUpperCase().slice(0, 6)}`,
      caseId,
      amount: c.amount,
      instrument: c.instrument,
      state: "initiated",
      initiatedAt: now.toISOString(),
      reflectByAt: new Date(now.getTime() + 48 * 3_600_000).toISOString(),
    });
  }
  addOverride({
    id: oid(),
    caseId,
    action: "approved_as_recommended",
    maker: session.email,
    checker: null,
    fromAmount: c.amount,
    toAmount: c.amount,
    instrument: c.instrument,
    reasonCode: "AS_RECOMMENDED",
    comment: "Approved without change to the A4 recommendation.",
    at: now.toISOString(),
  });
  updateCase(caseId, (x) => ({ ...x, status: "approved" }));
}

export function approveWithEdit(
  caseId: string,
  session: Session,
  edit: { amount: number; instrument: string; reasonCode: string; comment: string; checker: string | null },
) {
  const c = getCase(caseId);
  if (!c) return;
  const now = new Date();
  if (edit.amount > 0) {
    addRma({
      id: `GLX-RMA-${oid().toUpperCase().slice(0, 6)}`,
      caseId,
      amount: edit.amount,
      instrument: edit.instrument,
      state: "initiated",
      initiatedAt: now.toISOString(),
      reflectByAt: new Date(now.getTime() + 48 * 3_600_000).toISOString(),
    });
  }
  addOverride({
    id: oid(),
    caseId,
    action: "approved_with_edit",
    maker: session.email,
    checker: edit.checker,
    fromAmount: c.amount,
    toAmount: edit.amount,
    instrument: edit.instrument,
    reasonCode: edit.reasonCode,
    comment: edit.comment,
    at: now.toISOString(),
  });
  updateCase(caseId, (x) => ({
    ...x,
    amount: edit.amount,
    instrument: edit.instrument,
    status: "approved",
  }));
}

export function rejectToA4(caseId: string, session: Session, comment: string) {
  const c = getCase(caseId);
  if (!c) return;
  const planArt = [...c.artefacts].reverse().find((a) => a.agent === "A4");
  const a5Art = [...c.artefacts].reverse().find((a) => a.agent === "A5");
  if (!planArt || !a5Art) return;

  const plan = planArt.payload as unknown as ResolutionPlan;
  const revised: ResolutionPlan = {
    ...plan,
    options: plan.options.map((o) => ({ ...o, selected: o.kind === "evidence" })),
    selected_amount: 0,
    defer_execution: false,
    validator: { a3_amount: 0, plan_amount: 0, passed: true },
    customer_draft: `${plan.customer_draft}\n\n[Replanned after desk rejection: ${comment}]`,
  };
  const newPlanArt = makeArtefact(
    "A4",
    "Resolution Recommendation",
    "ResolutionPlan",
    revised as unknown as Record<string, unknown>,
    planArt.version + 1,
    planArt.id,
  );

  const issue = [...c.artefacts].find((a) => a.agent === "A1b")?.payload as unknown as IssueObject;
  const parsed = [...c.artefacts].find((a) => a.agent === "A1a")?.payload as unknown as ParsedIntake;
  const a2 = [...c.artefacts].find((a) => a.agent === "A2")?.payload as unknown as ApplicableClauseSet;
  const a3 = [...c.artefacts].find((a) => a.agent === "A3")?.payload as unknown as InterpretationResult;
  const a5 = runA5(issue, a2, { ...a3, amount: 0 }, revised, parsed);
  const newA5Art = makeArtefact(
    "A5",
    "Escalation Agent",
    "EscalationDecision",
    a5 as unknown as Record<string, unknown>,
    a5Art.version + 1,
    a5Art.id,
  );

  addOverride({
    id: oid(),
    caseId,
    action: "rejected_to_a4",
    maker: session.email,
    checker: null,
    fromAmount: c.amount,
    toAmount: 0,
    instrument: "not_applicable",
    reasonCode: "REJECTED_TO_A4",
    comment,
    at: new Date().toISOString(),
  });

  updateCase(caseId, (x) => ({
    ...x,
    amount: 0,
    status: a5.manual_required ? "awaiting_desk" : "information_reply",
    queue: a5.queue,
    artefacts: [...x.artefacts, newPlanArt, newA5Art],
  }));
}

export function sendToGrievanceOfficer(caseId: string, session: Session) {
  const c = getCase(caseId);
  if (!c) return;
  addOverride({
    id: oid(),
    caseId,
    action: "sent_to_grievance_officer",
    maker: session.email,
    checker: null,
    fromAmount: c.amount,
    toAmount: c.amount,
    instrument: c.instrument,
    reasonCode: "GO_ROUTE",
    comment: "Routed to Grievance Officer; 48-hour acknowledgement clock started.",
    at: new Date().toISOString(),
  });
  updateCase(caseId, (x) => ({
    ...x,
    queue: "Q-GrievanceOfficer",
    status: "with_grievance_officer",
    ackDueAt: new Date(Date.now() + 48 * 3_600_000).toISOString(),
  }));
}

export function resetDemoData() {
  commit(EMPTY);
}

/* --------------------------- session --------------------------- */

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(s: Session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  for (const l of listeners) l();
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  for (const l of listeners) l();
}

export function useSession(): { session: Session | null; ready: boolean } {
  const [session, setS] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setS(getSession());
    setReady(true);
    return subscribe(() => setS(getSession()));
  }, []);
  return { session, ready };
}

export const DEMO_USERS: { email: string; name: string; role: Session["role"] }[] = [
  { email: "ops@glossronaut.in", name: "Ops Analyst — Demo User", role: "ops_analyst" },
  { email: "desk@glossronaut.in", name: "Desk Approver — Demo User", role: "desk_approver" },
];

export type { EscalationDecision };
