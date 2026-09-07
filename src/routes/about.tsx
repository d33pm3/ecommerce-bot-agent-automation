import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/glx/AppShell";
import { Mono, Pill, SectionTitle, SpineDiagram } from "@/components/glx/bits";
import { STEPS } from "@/lib/glx/pipeline";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Architecture · Glossronaut Ops Console" },
      {
        name: "description",
        content:
          "How the five-agent Plan-Execute spine works at Glossronaut: one artefact per agent, deterministic interpretation, and a hard human gate on every rupee.",
      },
      { property: "og:title", content: "Architecture · Glossronaut Ops Console" },
      {
        property: "og:description",
        content: "Roles, handoffs and why agent isolation is treated as a defect, not a feature.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const HANDOFFS: { from: string; to: string; carries: string }[] = [
  { from: "A1a", to: "A1b", carries: "ParsedIntake — text, sub-issues, unvalidated entities, S1 flags" },
  { from: "A1b", to: "A2", carries: "IssueObject — theme, PS-ID, order state, payment mode, S1 flags" },
  { from: "A2", to: "A3", carries: "ApplicableClauseSet — verbatim clauses, version, gap / conflict" },
  { from: "A3", to: "A4", carries: "InterpretationResult — eligibility, amount, instrument, clause trail" },
  { from: "A4", to: "A5", carries: "ResolutionPlan — ranked options, selected amount, defer_execution" },
  { from: "A5", to: "Human Desk", carries: "EscalationDecision — manual_required, queue, triggers_evaluated" },
];




function AboutPage() {
  return (
    <AppShell>
      <SectionTitle eyebrow="08 · Architecture" title="Five agents, one spine, one gate" />
      <div className="mb-8 rounded-md border border-border bg-card p-5">
        <SpineDiagram animate />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {STEPS.map((s) => (
            <div key={s.id} className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Pill tone="maroon">{s.id}</Pill>
                <span className="text-sm font-semibold text-navy">{s.agent}</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.job}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-navy">Handoff contract</h3>
            <ul className="mt-2 space-y-2">
              {HANDOFFS.map((h) => (
                <li key={`${h.from}-${h.to}`} className="text-xs">
                  <Mono className="text-primary">
                    {h.from} → {h.to}
                  </Mono>
                  <div className="text-muted-foreground">{h.carries}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-primary/35 bg-primary/6 p-4">
            <h3 className="text-sm font-semibold text-primary">Why isolation is a defect</h3>
            <p className="mt-2 text-xs leading-relaxed text-navy">
              An agent that can be addressed directly is an agent that can be talked around. If a
              user could reach A3 without A2, the interpretation would rest on remembered policy
              instead of quoted policy. If A4 could be reached without A3, an amount would exist
              with no entitlement behind it. If A5 could be skipped, money would move without a
              recorded trigger. The spine is the control: each agent only ever consumes the artefact
              above it, cannot edit that artefact, and cannot execute the next one&apos;s job.
            </p>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-navy">Structural guarantees in this build</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              <li>· There is no pay function anywhere on the pipeline path — only a desk action writes an RMA row.</li>
              <li>· Artefacts are append-only; a replan writes v2 with a <Mono>supersedes</Mono> pointer.</li>
              <li>· A4 refuses to hand off when its selected amount ≠ the A3 amount.</li>
              <li>· A5 always emits a non-empty <Mono>triggers_evaluated</Mono> list, including for information-only answers.</li>
              <li>· Allergy is never commercially returnable; it routes to Q-Safety with ₹0.</li>
              <li>· Ops Analyst can run the crew but every money action is refused for that role.</li>
              <li>· Edited amounts above ₹500 require a second checker per KB-8.EXC-02.</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
