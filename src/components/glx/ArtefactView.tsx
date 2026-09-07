import { Mono, Pill } from "./bits";
import type { Artefact } from "@/lib/glx/types";
import { cn } from "@/lib/utils";

function humanLabel(key: string) {
  return key.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());
}

function Scalar({ value }: { value: unknown }) {
  if (typeof value === "boolean") {
    return <Pill tone={value ? "good" : "neutral"}>{value ? "true" : "false"}</Pill>;
  }
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }
  if (typeof value === "number") return <Mono>{String(value)}</Mono>;
  return <span className="text-sm leading-snug">{String(value)}</span>;
}

function Value({ k, value }: { k: string; value: unknown }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground">none</span>;
    if (typeof value[0] === "object" && value[0] !== null) {
      return (
        <div className="space-y-1.5">
          {(value as Record<string, unknown>[]).map((row, i) => (
            <div key={i} className="rounded border border-border bg-muted/50 p-2">
              {Object.entries(row).map(([rk, rv]) => (
                <div key={rk} className="flex gap-2 text-xs">
                  <span className="w-36 shrink-0 font-mono text-[0.68rem] uppercase text-muted-foreground">
                    {rk}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Scalar value={rv} />
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-wrap gap-1">
        {(value as unknown[]).map((v, i) => (
          <Pill key={i} tone={k.includes("s1") || k.includes("fired") ? "warn" : "neutral"}>
            {String(v)}
          </Pill>
        ))}
      </div>
    );
  }
  if (typeof value === "object" && value !== null) {
    return (
      <div className="rounded border border-border bg-muted/50 p-2">
        {Object.entries(value as Record<string, unknown>).map(([ok, ov]) => (
          <div key={ok} className="flex gap-2 text-xs">
            <span className="w-36 shrink-0 font-mono text-[0.68rem] uppercase text-muted-foreground">
              {ok}
            </span>
            <span className="min-w-0 flex-1">
              <Scalar value={ov} />
            </span>
          </div>
        ))}
      </div>
    );
  }
  return <Scalar value={value} />;
}

export function ArtefactBody({ payload }: { payload: Record<string, unknown> }) {
  return (
    <dl className="divide-y divide-border">
      {Object.entries(payload)
        .filter(([k]) => k !== "artefact")
        .map(([k, v]) => (
          <div key={k} className="grid grid-cols-1 gap-1 py-2 md:grid-cols-[13rem_1fr] md:gap-3">
            <dt className="font-mono text-[0.7rem] uppercase tracking-wide text-muted-foreground">
              {humanLabel(k)}
            </dt>
            <dd className="min-w-0">
              <Value k={k} value={v} />
            </dd>
          </div>
        ))}
    </dl>
  );
}

export function ArtefactCard({
  artefact,
  locked = false,
  className,
}: {
  artefact: Artefact;
  locked?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-border bg-card", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <Pill tone="maroon">{artefact.agent}</Pill>
          <span className="text-sm font-semibold text-navy">{artefact.type}</span>
          <Mono className="text-muted-foreground">v{artefact.version}</Mono>
        </div>
        <div className="flex items-center gap-2">
          {artefact.supersedes ? <Pill tone="warn">supersedes</Pill> : null}
          {locked ? <Pill tone="navy">locked</Pill> : null}
          <Mono className="text-muted-foreground">
            {new Date(artefact.createdAt).toLocaleTimeString("en-IN")}
          </Mono>
        </div>
      </div>
      <div className="px-3 py-1">
        <ArtefactBody payload={artefact.payload} />
      </div>
    </div>
  );
}
