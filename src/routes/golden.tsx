import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/glx/AppShell";
import { ArtefactCard } from "@/components/glx/ArtefactView";
import { inr, Kpi, Mono, Pill, SectionTitle } from "@/components/glx/bits";
import { Button } from "@/components/ui/button";
import { runAllGolden } from "@/lib/glx/golden";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/golden")({
  head: () => ({
    meta: [
      { title: "Golden Evals · Glossronaut Ops Console" },
      {
        name: "description",
        content:
          "Replays the eight golden Glossronaut cases through the live A1–A5 spine and diffs every A2 clause, A3 amount and A5 queue against the expected outcomes in the pack.",
      },
      { property: "og:title", content: "Golden Evals · Glossronaut Ops Console" },
      {
        property: "og:description",
        content: "G1–G8 regression traces: allergy must never auto-refund, money must always stop at the desk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GoldenPage,
});

function GoldenPage() {
  const outcomes = useMemo(() => runAllGolden(), []);
  const [openId, setOpenId] = useState<string | null>(outcomes[0]?.expectation.id ?? null);

  const passed = outcomes.filter((o) => o.passed).length;
  const gated = outcomes.filter((o) => o.run.a5.manual_required).length;
  const money = outcomes.reduce((n, o) => n + o.run.a4.selected_amount, 0);
  const open = outcomes.find((o) => o.expectation.id === openId) ?? null;

  return (
    <AppShell>
      <SectionTitle
        eyebrow="09 · Golden evals"
        title="G1–G8 replayed through the live spine"
        right={
          <Pill tone={passed === outcomes.length ? "good" : "maroon"}>
            {passed}/{outcomes.length} traces matching
          </Pill>
        }
      />
      <p className="mb-5 max-w-4xl text-sm text-muted-foreground">
        Every case shell in <Mono>cases.db</Mono> is pushed through A1a → A1b → A2 → A3 → A4 → A5 with
        no shortcuts, and each artefact is diffed field-by-field against{" "}
        <Mono>eval/golden/G*.json</Mono>. G4 is the hard one: the build fails if an allergic reaction
        ever produces an automatic refund.
      </p>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <Kpi label="Traces matching expectations" value={`${passed} / ${outcomes.length}`} />
        <Kpi label="Stopped at a human gate" value={`${gated} / ${outcomes.length}`} />
        <Kpi label="Money recommended, none paid" value={inr(money)} />
        <Kpi label="Refund rows created by agents" value="0" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <div className="space-y-2">
          {outcomes.map((o) => {
            const fails = o.checks.filter((c) => !c.pass).length;
            return (
              <button
                key={o.expectation.id}
                type="button"
                onClick={() => setOpenId(o.expectation.id)}
                className={cn(
                  "w-full rounded-md border bg-card p-3 text-left transition-colors",
                  openId === o.expectation.id ? "border-primary" : "border-border hover:border-navy/40",
                )}
              >
                <div className="flex items-center gap-2">
                  <Mono className="text-primary">{o.expectation.id}</Mono>
                  <Mono className="text-muted-foreground">{o.expectation.ps_id}</Mono>
                  <span className="ml-auto">
                    <Pill tone={o.passed ? "good" : "maroon"}>
                      {o.passed ? "match" : `${fails} mismatch`}
                    </Pill>
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{o.messageText}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.7rem]">
                  <Pill tone="navy">{o.run.a3.eligibility}</Pill>
                  <Pill tone="neutral">{inr(o.run.a4.selected_amount)}</Pill>
                  <Pill tone={o.run.a5.manual_required ? "maroon" : "neutral"}>
                    {o.run.a5.queue ?? "info only"}
                  </Pill>
                </div>
              </button>
            );
          })}
        </div>

        {open ? (
          <div className="space-y-4">
            <div className="rounded-md border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="maroon">{open.expectation.case_id}</Pill>
                <Mono className="text-muted-foreground">
                  order {open.expectation.order_id ?? "unlinked"}
                </Mono>
                <span className="ml-auto">
                  <Pill tone={open.passed ? "good" : "maroon"}>
                    {open.passed ? "all checks matched" : "mismatch"}
                  </Pill>
                </span>
              </div>
              <p className="mt-3 border-l-2 border-primary/40 pl-3 text-sm italic text-navy">
                “{open.messageText}”
              </p>
            </div>

            <div className="overflow-hidden rounded-md border border-border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy/5 font-mono uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Check</th>
                    <th className="px-3 py-2">Expected</th>
                    <th className="px-3 py-2">Live spine</th>
                    <th className="px-3 py-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {open.checks.map((c) => (
                    <tr key={c.field} className="border-t border-border/70">
                      <td className="px-3 py-2 font-medium text-navy">{c.field}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{c.expected}</td>
                      <td className="px-3 py-2 font-mono text-navy">{c.actual}</td>
                      <td className="px-3 py-2">
                        <Pill tone={c.pass ? "good" : "maroon"}>{c.pass ? "match" : "differs"}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SectionTitle eyebrow="Artefact trail" title="Six locked artefacts from this replay" />
            <div className="space-y-3">
              {open.run.artefacts.map((a) => (
                <ArtefactCard key={a.id} artefact={a} />
              ))}
            </div>

            <div className="rounded-md border border-navy/20 bg-navy/5 p-4 text-xs text-muted-foreground">
              <Button variant="outline" size="sm" onClick={() => setOpenId(null)}>
                Collapse trace
              </Button>
              <p className="mt-3">
                Replays are read-only: nothing here writes a case, a desk task or a refund row. The
                only path that creates money is a Desk Approver acting on 04 Human Desk.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-8 text-sm text-muted-foreground">
            Pick a golden trace to inspect its artefacts and diff table.
          </div>
        )}
      </div>
    </AppShell>
  );
}
