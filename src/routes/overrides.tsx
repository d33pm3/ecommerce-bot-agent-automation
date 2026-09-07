import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/glx/AppShell";
import { inr, Mono, Pill, SectionTitle } from "@/components/glx/bits";
import { useStore } from "@/lib/glx/store";

export const Route = createFileRoute("/overrides")({
  head: () => ({
    meta: [
      { title: "Override Register · Glossronaut Ops Console" },
      {
        name: "description",
        content:
          "Immutable log of every human decision on a Glossronaut case: who acted, what changed, the reason code, the checker and the timestamp.",
      },
      { property: "og:title", content: "Override Register · Glossronaut Ops Console" },
      {
        property: "og:description",
        content: "Append-only audit of desk approvals, edited amounts, rejections and GO routings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverridesPage,
});

export function actionTone(action: string) {
  if (action === "approved_as_recommended") return "good" as const;
  if (action === "approved_with_edit") return "warn" as const;
  if (action === "rejected_to_a4") return "bad" as const;
  return "navy" as const;
}

function OverridesPage() {
  const { overrides, rmas } = useStore();

  return (
    <AppShell>
      <SectionTitle
        eyebrow="05 · Override register"
        title="Immutable human decision log"
        right={<Pill tone="navy">append-only · {overrides.length} entries</Pill>}
      />
      <p className="mb-5 max-w-3xl text-sm text-muted-foreground">
        Every desk action writes a row here before the case status changes. Rows are never edited or
        deleted. An edited amount above ₹500 must carry a checker distinct from the maker, per
        KB-8.EXC-02.
      </p>

      {overrides.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No human decisions recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 font-mono text-[0.66rem] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Case</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Maker</th>
                <th className="px-3 py-2">Checker</th>
                <th className="px-3 py-2 text-right">From → to</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Comment</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="whitespace-nowrap px-3 py-2">
                    <Mono className="text-muted-foreground">
                      {new Date(o.at).toLocaleString("en-IN")}
                    </Mono>
                  </td>
                  <td className="px-3 py-2">
                    <Link to="/case/$caseId" params={{ caseId: o.caseId }} className="hover:underline">
                      <Mono className="text-primary">{o.caseId}</Mono>
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Pill tone={actionTone(o.action)}>{o.action.replaceAll("_", " ")}</Pill>
                  </td>
                  <td className="px-3 py-2">
                    <Mono>{o.maker}</Mono>
                  </td>
                  <td className="px-3 py-2">
                    {o.checker ? (
                      <Mono>{o.checker}</Mono>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                    {inr(o.fromAmount)} → <strong>{inr(o.toAmount)}</strong>
                    <div className="text-[0.7rem] text-muted-foreground">{o.instrument}</div>
                  </td>
                  <td className="px-3 py-2">
                    <Mono>{o.reasonCode}</Mono>
                  </td>
                  <td className="max-w-sm px-3 py-2 text-xs text-muted-foreground">{o.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SectionTitle eyebrow="Money legs" title="Refund rows created by the desk" />
      {rmas.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No refund row exists. The pipeline cannot create one — only a desk approval can.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 font-mono text-[0.66rem] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">RMA</th>
                <th className="px-3 py-2">Case</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2">Instrument</th>
                <th className="px-3 py-2">State</th>
                <th className="px-3 py-2">Reflect by</th>
              </tr>
            </thead>
            <tbody>
              {rmas.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <Mono className="text-primary">{r.id}</Mono>
                  </td>
                  <td className="px-3 py-2">
                    <Mono>{r.caseId}</Mono>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{inr(r.amount)}</td>
                  <td className="px-3 py-2">
                    <Mono>{r.instrument}</Mono>
                  </td>
                  <td className="px-3 py-2">
                    <Pill tone="good">{r.state}</Pill>
                  </td>
                  <td className="px-3 py-2">
                    <Mono className="text-muted-foreground">
                      {new Date(r.reflectByAt).toLocaleString("en-IN")}
                    </Mono>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
