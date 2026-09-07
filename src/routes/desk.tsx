import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/glx/AppShell";
import { inr, Mono, Pill, SectionTitle } from "@/components/glx/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  ApplicableClauseSet,
  EscalationDecision,
  InterpretationResult,
  ResolutionPlan,
} from "@/lib/glx/agents";
import {
  approveAsRecommended,
  approveWithEdit,
  rejectToA4,
  sendToGrievanceOfficer,
  useSession,
  useStore,
} from "@/lib/glx/store";
import type { CaseRecord } from "@/lib/glx/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/desk")({
  head: () => ({
    meta: [
      { title: "Human Desk · Glossronaut Ops Console" },
      {
        name: "description",
        content:
          "The approval gate: every Glossronaut case where a rupee would move waits here for a Desk Approver to approve, edit, reject to A4 or route to the Grievance Officer.",
      },
      { property: "og:title", content: "Human Desk · Glossronaut Ops Console" },
      {
        property: "og:description",
        content: "Queue of manual_required cases with clause evidence, A3 math and the A4 draft.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeskPage,
});

const REASONS = [
  "GOODWILL_SERVICE_RECOVERY",
  "PARTIAL_EVIDENCE",
  "PLATFORM_FAULT_CONFIRMED",
  "SAFETY_EXCEPTION",
  "AMOUNT_CORRECTION",
];

function payload<T>(c: CaseRecord, agent: string): T | null {
  const a = [...c.artefacts].reverse().find((x) => x.agent === agent);
  return a ? (a.payload as unknown as T) : null;
}

function clock(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  const hrs = ms / 3_600_000;
  const label =
    hrs < 0
      ? `breached ${Math.abs(Math.round(hrs))}h ago`
      : hrs < 48
        ? `${Math.round(hrs)}h left`
        : `${Math.round(hrs / 24)}d left`;
  return { label, breached: hrs < 0, urgent: hrs >= 0 && hrs < 12 };
}

function DeskPage() {
  const { session } = useSession();
  const { cases } = useStore();
  const queue = cases.filter(
    (c) => c.manualRequired && (c.status === "awaiting_desk" || c.status === "with_grievance_officer"),
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const open = queue.find((c) => c.id === openId) ?? queue[0] ?? null;

  return (
    <AppShell>
      <SectionTitle
        eyebrow="04 · Human desk"
        title="Approval gate for anything payable"
        right={<Pill tone="maroon">{queue.length} waiting</Pill>}
      />

      {queue.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            The desk is clear. Run a case that lands on an amount above ₹0 and it will appear here.
          </p>
          <Button asChild className="mt-4">
            <Link to="/run">Run the crew</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
          <div className="space-y-2">
            {queue.map((c) => {
              const ack = clock(c.ackDueAt);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setOpenId(c.id)}
                  className={cn(
                    "w-full rounded-md border p-3 text-left transition-colors",
                    open?.id === c.id
                      ? "border-primary bg-primary/8"
                      : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Mono className="text-primary">{c.id}</Mono>
                    <Pill tone={c.severity === "S1" ? "bad" : "neutral"}>{c.severity}</Pill>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Pill tone="navy">{c.queue}</Pill>
                    <Pill tone={c.amount > 0 ? "warn" : "neutral"}>{inr(c.amount)}</Pill>
                  </div>
                  <div className="mt-1.5 line-clamp-2 text-[0.72rem] text-muted-foreground">
                    {c.rawText}
                  </div>
                  <div
                    className={cn(
                      "mt-1.5 font-mono text-[0.66rem] uppercase",
                      ack.breached
                        ? "text-destructive"
                        : ack.urgent
                          ? "text-warning"
                          : "text-muted-foreground",
                    )}
                  >
                    ack {ack.label}
                  </div>
                </button>
              );
            })}
          </div>

          {open ? <DeskDetail key={open.id} c={open} canApprove={session?.role === "desk_approver"} /> : null}
        </div>
      )}
    </AppShell>
  );
}

function DeskDetail({ c, canApprove }: { c: CaseRecord; canApprove: boolean }) {
  const { session } = useSession();
  const a2 = payload<ApplicableClauseSet>(c, "A2");
  const a3 = payload<InterpretationResult>(c, "A3");
  const a4 = payload<ResolutionPlan>(c, "A4");
  const a5 = payload<EscalationDecision>(c, "A5");

  const [amount, setAmount] = useState(String(c.amount));
  const [instrument, setInstrument] = useState(c.instrument);
  const [reason, setReason] = useState(REASONS[0]!);
  const [checker, setChecker] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const editAmount = Number(amount) || 0;
  const needsChecker = editAmount > 500;

  const guard = (): boolean => {
    if (!session) return false;
    if (!canApprove) {
      setError("This account is an Ops Analyst. Only a Desk Approver can act on money.");
      return false;
    }
    setError(null);
    return true;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Mono className="text-primary">{c.id}</Mono>
          <Pill tone="navy">{c.queue}</Pill>
          <Pill tone={c.severity === "S1" ? "bad" : "neutral"}>{c.severity}</Pill>
          <Pill tone="neutral">confidence {c.confidence.toFixed(2)}</Pill>
          <Button asChild size="sm" variant="outline" className="ml-auto">
            <Link to="/case/$caseId" params={{ caseId: c.id }}>
              Full case file
            </Link>
          </Button>
        </div>
        <p className="mt-3 whitespace-pre-wrap rounded border border-border bg-muted/50 p-3 font-mono text-[0.76rem] leading-relaxed">
          {c.rawText}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-navy">Clauses A2 quoted</h3>
          {a2?.clauses.length ? (
            <ul className="mt-2 space-y-2">
              {a2.clauses.map((cl) => (
                <li key={cl.id} className="rounded border border-border p-2">
                  <Pill tone="maroon">{cl.id}</Pill>
                  <p className="mt-1 font-mono text-[0.74rem] leading-relaxed text-navy">
                    “{cl.text}”
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">No clause matched — gap flagged.</p>
          )}
          {a2 ? (
            <div className="mt-2 flex gap-1.5">
              <Pill tone={a2.gap ? "bad" : "good"}>gap {String(a2.gap)}</Pill>
              <Pill tone={a2.conflict ? "warn" : "good"}>conflict {String(a2.conflict)}</Pill>
              <Pill tone="neutral">{a2.version}</Pill>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-navy">A3 interpretation</h3>
            {a3 ? (
              <div className="mt-2 space-y-1.5 text-xs">
                <div>
                  <Pill tone="navy">{a3.eligibility}</Pill>{" "}
                  <Pill tone={a3.amount > 0 ? "warn" : "neutral"}>{inr(a3.amount)}</Pill>{" "}
                  <Pill tone="neutral">{a3.instrument}</Pill>
                </div>
                <p className="font-mono text-[0.72rem] leading-relaxed text-navy">
                  {a3.amount_math}
                </p>
                <div className="text-muted-foreground">
                  trail: <Mono>{a3.reasoning_trail.join(" · ")}</Mono>
                </div>
                {a3.notes.map((n) => (
                  <div key={n} className="text-muted-foreground">
                    · {n}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-navy">A4 options and draft</h3>
            {a4 ? (
              <>
                <ul className="mt-2 space-y-1.5">
                  {a4.options.map((o) => (
                    <li
                      key={o.rank}
                      className={cn(
                        "rounded border p-2 text-xs",
                        o.selected ? "border-primary bg-primary/6" : "border-border",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-navy">
                          {o.rank}. {o.label}
                        </span>
                        <Mono>{inr(o.amount)}</Mono>
                      </div>
                      <div className="mt-0.5 text-muted-foreground">{o.detail}</div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 whitespace-pre-wrap rounded border border-navy/20 bg-muted/50 p-2.5 text-[0.76rem] leading-relaxed">
                  {a4.customer_draft}
                </p>
                <div className="mt-2 flex gap-1.5">
                  <Pill tone={a4.validator.passed ? "good" : "bad"}>
                    validator {a4.validator.passed ? "passed" : "failed"}
                  </Pill>
                  <Pill tone="neutral">defer_execution {String(a4.defer_execution)}</Pill>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {a5 ? (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-navy">A5 triggers evaluated</h3>
          <div className="mt-2 grid gap-1.5 md:grid-cols-2 xl:grid-cols-3">
            {a5.triggers_evaluated.map((t) => (
              <div
                key={t.trigger}
                className={cn(
                  "rounded border p-2 text-[0.72rem]",
                  t.fired ? "border-warning/50 bg-warning/8" : "border-border",
                )}
              >
                <Mono className={t.fired ? "text-warning" : "text-muted-foreground"}>
                  {t.trigger}
                </Mono>
                <div className="text-muted-foreground">{t.detail}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-md border border-primary/40 bg-primary/6 p-4">
        <h3 className="text-sm font-semibold text-primary">Desk decision</h3>
        <p className="mt-1 text-xs text-navy">
          Approving is the only way a refund row is created in this system. Everything you do here is
          written to the Override Register first.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div>
            <Label htmlFor="amt">Amount (₹)</Label>
            <Input
              id="amt"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="inst">Instrument</Label>
            <Input
              id="inst"
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              className="mt-1 font-mono text-xs"
            />
          </div>
          <div>
            <Label>Reason code</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="chk">
              Checker email {needsChecker ? <span className="text-primary">· required &gt; ₹500</span> : null}
            </Label>
            <Input
              id="chk"
              value={checker}
              onChange={(e) => setChecker(e.target.value)}
              placeholder="second approver"
              className="mt-1 font-mono text-xs"
            />
          </div>
        </div>

        <div className="mt-3">
          <Label htmlFor="cmt">Note / reason in words</Label>
          <Textarea
            id="cmt"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1 text-sm"
            placeholder="Why this decision, in one line."
          />
        </div>

        {error ? <p className="mt-2 text-xs font-semibold text-destructive">{error}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              if (!guard() || !session) return;
              approveAsRecommended(c.id, session);
            }}
          >
            Approve as recommended · {inr(c.amount)}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!guard() || !session) return;
              if (needsChecker && (!checker.trim() || checker.trim() === session.email)) {
                setError(
                  "KB-8.EXC-02: above ₹500 the maker and checker cannot be the same person. Enter a different checker email.",
                );
                return;
              }
              if (!comment.trim()) {
                setError("An edited amount needs a written reason.");
                return;
              }
              approveWithEdit(c.id, session, {
                amount: editAmount,
                instrument,
                reasonCode: reason,
                comment: comment.trim(),
                checker: needsChecker ? checker.trim() : checker.trim() || null,
              });
            }}
          >
            Approve with edit · {inr(editAmount)}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!guard() || !session) return;
              if (!comment.trim()) {
                setError("Say what A4 must reconsider before rejecting.");
                return;
              }
              rejectToA4(c.id, session, comment.trim());
            }}
          >
            Reject back to A4
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!guard() || !session) return;
              sendToGrievanceOfficer(c.id, session);
            }}
          >
            Send to Grievance Officer
          </Button>
        </div>
      </div>
    </div>
  );
}
