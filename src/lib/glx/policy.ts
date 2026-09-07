import { GEN_ALIASES, GEN_CLAUSES, GEN_REGISTRY } from "./data/policy.gen";
import { AUTHORITY, PS_SPECS, ROUTING_THEMES } from "./data/config.gen";

export type Clause = {
  id: string;
  text: string;
  version: string;
  book: string;
  section: string;
  effectiveFrom: string;
};

export const POLICY_VERSION = GEN_CLAUSES[0]?.version ?? "v1.0";

const BOOK_NAMES: Record<string, string> = {
  "KB-1": "Book 1 — Returns & replacements",
  "KB-2": "Book 2 — Cancellations & RTO",
  "KB-3": "Book 3 — Service levels, refunds & fees",
  "KB-5": "Book 5 — Exchanges & shades",
  "KB-6": "Book 6 — Precedence rules",
  "KB-7": "Book 7 — Statutory & grievance",
  "KB-8": "Book 8 — Exceptions, P10 & goodwill",
};

/** Ratified clause set loaded verbatim from the pack's policy.db. A2 quotes these character-for-character. */
export const CLAUSES: Clause[] = GEN_CLAUSES.map((c) => ({
  id: c.clause_id,
  text: c.verbatim,
  version: c.version,
  book: BOOK_NAMES[c.kb_ref] ?? c.kb_ref,
  section: c.policy_section,
  effectiveFrom: c.effective_from,
}));

export const REGISTRY = GEN_REGISTRY;
export const ALIASES = GEN_ALIASES;
export const AUTHORITY_CONFIG = AUTHORITY;

/** Feed / architecture aliases are resolved onto ratified clause ids before lookup. */
export function resolveClauseId(id: string): string {
  return GEN_ALIASES[id] ?? id;
}

export function clause(id: string): Clause | null {
  const resolved = resolveClauseId(id);
  return CLAUSES.find((c) => c.id === resolved) ?? null;
}

export function clauses(ids: string[]): Clause[] {
  return ids.map((id) => clause(id)).filter((c): c is Clause => c !== null);
}

export const PS_LABELS: Record<string, string> = {
  "PS-1.1": "Short-pack — unit missing from box",
  "PS-1.3": "Sale-period cancellation",
  "PS-1.5": "Cannot cancel — already shipped",
  "PS-2.1": "Fake / unverified delivery attempt",
  "PS-2.3": "Leak or breakage in transit",
  "PS-2.7": "Courier misconduct",
  "PS-3.1": "Wrong item shipped",
  "PS-3.2": "Wrong shade shipped",
  "PS-3.4": "Marked delivered, not received",
  "PS-4.1": "Suspected counterfeit",
  "PS-4.4": "Allergy / adverse reaction",
  "PS-4.8": "Shade vs product photo",
  "PS-5.1": "Return pickup never happens",
  "PS-5.2": "Lost in reverse logistics",
  "PS-6.1": "Refund SLA breach",
  "PS-6.5": "Wallet credit vs original source",
  "PS-6.6": "Fee not refunded",
  "PS-7.1": "Opened to find defect vs seal-intact rule",
  "PS-8.1": "Escalation over a fake claim",
  "PS-8.3": "Grievance Officer loop-back",
  "PS-8.8": "Social media escalation",
  "PS-8.9": "NCH / legal notice",
  "PS-UNKNOWN": "Unclassified — human triage",
};

export type ThemeDef = {
  theme: string;
  label: string;
  leadWorkload: string[];
  problems: { id: string; label: string; severity: string; s1: boolean; clauses: string[]; queue: string }[];
};

export const THEMES: ThemeDef[] = Object.entries(ROUTING_THEMES).map(([theme, def]) => ({
  theme,
  label: def.name,
  leadWorkload: def.lead_workload,
  problems: Object.entries(PS_SPECS)
    .filter(([id, spec]) => spec.theme === theme && id !== "PS-UNKNOWN")
    .map(([id, spec]) => ({
      id,
      label: PS_LABELS[id] ?? id,
      severity: spec.severity,
      s1: spec.s1,
      clauses: spec.clauses,
      queue: spec.queue_if_money,
    })),
}));

export function psSpec(psId: string) {
  return PS_SPECS[psId] ?? PS_SPECS["PS-UNKNOWN"]!;
}

export function problemLabel(psId: string): string {
  return PS_LABELS[psId] ?? "Unclassified";
}

export function themeLabel(theme: string): string {
  return ROUTING_THEMES[theme]?.name ?? "Unclassified";
}

export { PS_SPECS };
