import { createFileRoute, Link, useParams } from "@tanstack/react-router";

import { AppShell } from "@/components/glx/AppShell";
import { ArtefactCard } from "@/components/glx/ArtefactView";
import { inr, Mono, Pill, SectionTitle } from "@/components/glx/bits";
import { Button } from "@/components/ui/button";
import { problemLabel, themeLabel } from "@/lib/glx/policy";
import { useStore } from "@/lib/glx/store";

export const Route = createFileRoute("/case/$caseId")({
  head: () => ({
    meta: [
      { title: "Case file · Glossronaut Ops Console" },
      {
        name: "description",
        content:
          "Append-only case file: the raw customer text plus every artefact the five Glossronaut agents wrote, in order, with versions and supersedes pointers.",
      },
      { property: "og:title", content: "Case file · Glossronaut Ops Console" },
      {
        property: "og:description",
        content: "One locked artefact per agent, never edited — replans append a new version.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CaseFile,
});

function CaseFile() {
  const { caseId } = useParams({ from: "/case/$caseId" });
  const { cases, overrides, rmas } = useStore();
  const c = cases.find((x) => x.id === caseId);

  if (!c) {
    return (
      <AppShell>
        <div className="rounded-md border border-dashed border-border bg-card p-12 text-center">
          <h1 className="text-lg font-semibold text-navy">Case not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cases live in this browser only. Run a new one to see the full artefact trail.
          </p>
          <Button asChild className="mt-4">
            <Link to="/run">Run the crew</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const caseOverrides = overrides.filter((o) => o.caseId === c.id);
  const caseRmas = rmas.filter((r) => r.caseId === c.id);

  return (
    <AppShell>
      <SectionTitle
        eyebrow="03 · Case file"
        title={c.id}
        right={
          <div className="flex items-center gap-2">
            <Pill tone={c.status === "approved" ? "good" : c.status === "awaiting_desk" ? "warn" : "neutral"}>
              {c.status.replaceAll("_", " ")}
            </Pill>
            {c.status === "awaiting_desk" ? (
              <Button asChild size="sm">
                <Link to="/desk">Open at desk</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-navy">Raw customer text</h3>
            <p className="mt-2 whitespace-pre-wrap rounded border border-border bg-muted/50 p-3 font-mono text-[0.76rem] leading-relaxed">
              {c.rawText}
            </p>
            <dl className="mt-3 space-y-1.5 text-xs">
              {[
                ["Channel", c.channel],
                ["Order", c.orderId ?? "unmatched"],
                ["Customer", c.customerName ?? "unmatched"],
                ["Theme", `${c.theme} · ${themeLabel(c.theme)}`],
                ["Problem", `${c.psId} · ${problemLabel(c.psId)}`],
                ["Severity", c.severity],
                ["Confidence", c.confidence.toFixed(2)],
                ["Eligibility", c.eligibility ?? "—"],
                ["Amount on record", inr(c.amount)],
                ["Instrument", c.instrument],
                ["Queue", c.queue ?? "—"],
                ["Ack due", new Date(c.ackDueAt).toLocaleString("en-IN")],
                ["Redress due", new Date(c.redressDueAt).toLocaleString("en-IN")],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-28 shrink-0 font-mono text-[0.66rem] uppercase text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="min-w-0 flex-1">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-navy">Human actions on this case</h3>
            {caseOverrides.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                None yet. Nothing has been paid or promised.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {caseOverrides.map((o) => (
                  <li key={o.id} className="rounded border border-border p-2 text-xs">
                    <Pill tone="navy">{o.action.replaceAll("_", " ")}</Pill>
                    <div className="mt-1 text-muted-foreground">
                      {o.maker} · {inr(o.fromAmount)} → {inr(o.toAmount)} · {o.reasonCode}
                    </div>
                    <div className="mt-0.5">{o.comment}</div>
                  </li>
                ))}
              </ul>
            )}
            {caseRmas.length > 0 ? (
              <div className="mt-3 border-t border-border pt-3">
                {caseRmas.map((r) => (
                  <div key={r.id} className="text-xs">
                    <Pill tone="good">refund row {r.id}</Pill>
                    <div className="mt-1 text-muted-foreground">
                      {inr(r.amount)} via {r.instrument} · reflect by{" "}
                      {new Date(r.reflectByAt).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Pill tone="maroon">append-only timeline</Pill>
            <Mono className="text-muted-foreground">{c.artefacts.length} artefacts</Mono>
          </div>
          <ol className="space-y-4 border-l-2 border-navy/20 pl-5">
            {c.artefacts.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[1.72rem] top-4 h-3 w-3 rounded-full border-2 border-navy bg-background" />
                <ArtefactCard artefact={a} locked />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </AppShell>
  );
}
