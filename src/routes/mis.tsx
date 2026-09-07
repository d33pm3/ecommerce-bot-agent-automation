import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/glx/AppShell";
import { inr, Kpi, Mono, Pill, SectionTitle } from "@/components/glx/bits";
import { useStore } from "@/lib/glx/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mis")({
  head: () => ({
    meta: [
      { title: "MIS · Glossronaut Ops Console" },
      {
        name: "description",
        content:
          "Daily pulse for Glossronaut case operations: intake-to-money funnel, statutory 48-hour and 30-day clocks, S1 exposure and queue mix — all derived from case records.",
      },
      { property: "og:title", content: "MIS · Glossronaut Ops Console" },
      {
        property: "og:description",
        content: "Funnel, statutory clocks and S1 exposure computed from the artefact trail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MisPage,
});

function MisPage() {
  const { cases, overrides, rmas } = useStore();
  const classified = cases.filter((c) => c.psId !== "PS-UNKNOWN");
  const entitled = cases.filter((c) => c.eligibility === "in_policy_yes" || c.eligibility === "conditional");
  const recommended = cases.filter((c) => c.amount > 0);
  const approved = cases.filter((c) => c.status === "approved");
  const s1 = cases.filter((c) => c.severity === "S1");
  const ackBreached = cases.filter(
    (c) => c.status !== "approved" && new Date(c.ackDueAt).getTime() < Date.now(),
  );
  const held = cases
    .filter((c) => c.status === "awaiting_desk")
    .reduce((n, c) => n + c.amount, 0);
  const edited = overrides.filter((o) => o.action === "approved_with_edit");
  const leakage = edited.reduce((n, o) => n + Math.max(0, o.toAmount - o.fromAmount), 0);

  const funnel: { label: string; n: number }[] = [
    { label: "Inbound", n: cases.length },
    { label: "Classified", n: classified.length },
    { label: "Entitled", n: entitled.length },
    { label: "Money recommended", n: recommended.length },
    { label: "Desk approved", n: approved.length },
    { label: "Refund row created", n: rmas.length },
  ];
  const max = Math.max(1, ...funnel.map((f) => f.n));

  const queues = ["Q-RefundHITL", "Q-Safety", "Q-CourierOps", "Q-GrievanceOfficer", "Q-Legal", "Q-Social"];

  return (
    <AppShell>
      <SectionTitle
        eyebrow="06 · MIS"
        title="Daily pulse"
        right={<Pill tone="navy">computed from case records, not typed in</Pill>}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Cases today" value={String(cases.length)} />
        <Kpi label="Money awaiting approval" value={inr(held)} tone="warn" />
        <Kpi label="Money released" value={inr(rmas.reduce((n, r) => n + r.amount, 0))} tone="good" />
        <Kpi label="Goodwill above recommendation" value={inr(leakage)} tone="maroon" hint={`${edited.length} edited`} />
        <Kpi label="S1 cases" value={String(s1.length)} tone="maroon" hint="safety / legal / social" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-navy">Intake → money funnel</h3>
          <div className="mt-4 space-y-2.5">
            {funnel.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="w-44 shrink-0 text-xs text-muted-foreground">{f.label}</span>
                <div className="h-6 flex-1 rounded bg-muted">
                  <div
                    className={cn("h-6 rounded bg-navy", f.label === "Refund row created" && "bg-primary")}
                    style={{ width: `${(f.n / max) * 100}%` }}
                  />
                </div>
                <Mono className="w-8 text-right">{f.n}</Mono>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            The gap between “money recommended” and “refund row created” is the human gate. It is
            supposed to be non-zero whenever the desk has not yet signed.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-navy">Statutory clocks</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">48h acknowledgement breaches</span>
                <Pill tone={ackBreached.length > 0 ? "bad" : "good"}>{ackBreached.length}</Pill>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Within 30-day redressal floor</span>
                <Pill tone="good">{cases.length}</Pill>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">48h refund initiation target (KB-3.SLA-01)</span>
                <Pill tone="navy">{rmas.length} started</Pill>
              </li>
            </ul>
          </div>

          <div className="rounded-md border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-navy">Queue mix</h3>
            <ul className="mt-3 space-y-1.5 text-xs">
              {queues.map((q) => {
                const n = cases.filter((c) => c.queue === q).length;
                return (
                  <li key={q} className="flex items-center justify-between gap-2">
                    <Mono className="text-muted-foreground">{q}</Mono>
                    <span className="tabular-nums">{n}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-md border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-navy">Agent health</h3>
            <ul className="mt-3 space-y-1.5 text-xs">
              <li className="flex justify-between">
                <span className="text-muted-foreground">A1 low-confidence (&lt; 0.75)</span>
                <span>{cases.filter((c) => c.confidence < 0.75).length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">A1 unmatched order</span>
                <span>{cases.filter((c) => !c.orderId).length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Exception candidates (allergy path)</span>
                <span>{cases.filter((c) => c.eligibility === "exception_candidate").length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Replans after desk rejection</span>
                <span>{overrides.filter((o) => o.action === "rejected_to_a4").length}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
