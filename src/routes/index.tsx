import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/glx/AppShell";
import { inr, Kpi, Mono, Pill, SectionTitle, SpineDiagram } from "@/components/glx/bits";
import { Button } from "@/components/ui/button";
import { STEPS } from "@/lib/glx/pipeline";
import { resetDemoData, useStore } from "@/lib/glx/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Home · Glossronaut Cosmetics Ops Console" },
      {
        name: "description",
        content:
          "Glossronaut's five-agent order-exception console: run the A1–A5 pipeline on a customer complaint, then approve every rupee at the Human Desk.",
      },
      { property: "og:title", content: "Command Home · Glossronaut Cosmetics Ops Console" },
      {
        property: "og:description",
        content:
          "Sequential agent spine for returns, refunds and courier exceptions, with a hard human gate on money.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const store = useStore();
  const cases = store.cases;
  const awaiting = cases.filter((c) => c.status === "awaiting_desk");
  const approved = cases.filter((c) => c.status === "approved");
  const s1 = cases.filter((c) => c.severity === "S1" && c.status !== "closed");
  const moneyHeld = awaiting.reduce((n, c) => n + c.amount, 0);
  const paid = store.rmas.reduce((n, r) => n + r.amount, 0);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-primary">
            01 · Command home
          </div>
          <h1 className="mt-1 text-3xl font-bold text-navy">Case operations</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            One complaint in, one locked artefact per agent out, and a desk signature on anything
            that costs money.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="lg">
            <Link to="/run">New case</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/desk">
              Human desk
              {awaiting.length > 0 ? ` (${awaiting.length})` : ""}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Cases run" value={String(cases.length)} hint="this browser session" />
        <Kpi
          label="Awaiting desk"
          value={String(awaiting.length)}
          hint="manual_required = true"
          tone="maroon"
        />
        <Kpi label="Money held pending approval" value={inr(moneyHeld)} tone="warn" hint="not paid" />
        <Kpi label="Refund rows created" value={String(store.rmas.length)} tone="good" hint={inr(paid)} />
        <Kpi label="S1 open" value={String(s1.length)} tone="maroon" hint="safety / legal / social" />
      </div>

      <div className="mt-8 rounded-md border border-border bg-card p-5">
        <SectionTitle eyebrow="The spine" title="A1a → A1b → A2 → A3 → A4 → A5" />
        <SpineDiagram animate />
        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {STEPS.map((s) => (
            <div key={s.id} className="rounded border border-border bg-muted/40 p-3">
              <Pill tone="maroon">{s.id}</Pill>
              <div className="mt-1.5 text-[0.8rem] font-semibold text-navy">{s.agent}</div>
              <div className="mt-1 text-[0.72rem] leading-snug text-muted-foreground">{s.job}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <SectionTitle
          eyebrow="Recent"
          title="Last 8 cases"
          right={
            cases.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => resetDemoData()}>
                Reset demo data
              </Button>
            ) : null
          }
        />
        {cases.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No cases yet. Start one from the seeded complaints.
            </p>
            <Button asChild className="mt-4">
              <Link to="/run">Run the crew</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 font-mono text-[0.66rem] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Case</th>
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Theme / PS-ID</th>
                  <th className="px-3 py-2">Eligibility</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Queue</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 8).map((c) => (
                  <tr key={c.id} className="border-t border-border align-middle">
                    <td className="px-3 py-2">
                      <Link to="/case/$caseId" params={{ caseId: c.id }} className="hover:underline">
                        <Mono className="text-primary">{c.id}</Mono>
                      </Link>
                      <div className="text-[0.7rem] text-muted-foreground">
                        {c.customerName ?? "unmatched customer"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Mono>{c.orderId ?? "—"}</Mono>
                    </td>
                    <td className="px-3 py-2">
                      <Pill tone="navy">{c.theme}</Pill>{" "}
                      <Mono className="text-muted-foreground">{c.psId}</Mono>
                    </td>
                    <td className="px-3 py-2">
                      <Mono>{c.eligibility ?? "—"}</Mono>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{inr(c.amount)}</td>
                    <td className="px-3 py-2">
                      <Mono className="text-muted-foreground">{c.queue ?? "—"}</Mono>
                    </td>
                    <td className="px-3 py-2">
                      <Pill
                        tone={
                          c.status === "approved"
                            ? "good"
                            : c.status === "awaiting_desk"
                              ? "warn"
                              : c.status === "with_grievance_officer"
                                ? "bad"
                                : "neutral"
                        }
                      >
                        {c.status.replaceAll("_", " ")}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
