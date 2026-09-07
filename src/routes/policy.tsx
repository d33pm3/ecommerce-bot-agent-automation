import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/glx/AppShell";
import { Mono, Pill, SectionTitle } from "@/components/glx/bits";
import { CLAUSES, POLICY_VERSION, THEMES } from "@/lib/glx/policy";

export const Route = createFileRoute("/policy")({
  head: () => ({
    meta: [
      { title: "Policy Cabinet · Glossronaut Ops Console" },
      {
        name: "description",
        content:
          "Read-only clause register the A2 knowledge agent quotes verbatim: returns, cancellations, service levels, precedence, statutory and exception caps.",
      },
      { property: "og:title", content: "Policy Cabinet · Glossronaut Ops Console" },
      {
        property: "og:description",
        content: "The single source of truth A2 looks up — verbatim clauses with version stamps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PolicyPage,
});

function PolicyPage() {
  return (
    <AppShell>
      <SectionTitle
        eyebrow="07 · Policy cabinet"
        title="Clause register A2 reads"
        right={<Pill tone="navy">version {POLICY_VERSION} · read-only</Pill>}
      />
      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        A2 performs a keyed lookup over this table and copies the text character-for-character into
        its artefact. It does not search the web, retrieve embeddings, or restate policy in a
        model&apos;s own words. If a lookup misses, A2 sets <Mono>gap=true</Mono> and the spine
        continues to A3.
      </p>

      <div className="space-y-3">
        {CLAUSES.map((c) => (
          <div key={c.id} className="rounded-md border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="maroon">{c.id}</Pill>
              <span className="text-xs text-muted-foreground">{c.book}</span>
              <Mono className="ml-auto text-muted-foreground">{c.version}</Mono>
            </div>
            <p className="mt-2 font-mono text-[0.82rem] leading-relaxed text-navy">“{c.text}”</p>
          </div>
        ))}
      </div>

      <SectionTitle eyebrow="Classifier registry" title="Theme and problem-statement catalogue" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {THEMES.map((t) => (
          <div key={t.theme} className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Pill tone="navy">{t.theme}</Pill>
              <span className="text-sm font-semibold text-navy">{t.label}</span>
            </div>
            <ul className="mt-2 space-y-1">
              {t.problems.map((p) => (
                <li key={p.id} className="flex gap-2 text-xs">
                  <Mono className="text-primary">{p.id}</Mono>
                  <span className="text-muted-foreground">{p.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Anything that does not fit becomes <Mono>PS-UNKNOWN</Mono> with confidence ≤ 0.74, and still
        runs A2 through A5.
      </p>
    </AppShell>
  );
}
