import { cn } from "@/lib/utils";

export function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-[0.78rem] tracking-tight", className)}>{children}</span>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "navy" | "maroon" | "good" | "warn" | "bad";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground border-border",
    navy: "bg-navy text-navy-foreground border-navy",
    maroon: "bg-primary text-primary-foreground border-primary",
    good: "bg-success/12 text-success border-success/35",
    warn: "bg-warning/14 text-warning border-warning/35",
    bad: "bg-destructive/12 text-destructive border-destructive/35",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-2">
      <div>
        {eyebrow ? (
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone = "navy",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "navy" | "maroon" | "good" | "warn";
}) {
  const bar: Record<string, string> = {
    navy: "bg-navy",
    maroon: "bg-primary",
    good: "bg-success",
    warn: "bg-warning",
  };
  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-card p-4">
      <div className={cn("absolute left-0 top-0 h-full w-1", bar[tone])} />
      <div className="pl-2">
        <div className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 text-2xl font-semibold tabular-nums text-navy">{value}</div>
        {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
      </div>
    </div>
  );
}

const SPINE = [
  { id: "A1a", label: "Parse" },
  { id: "A1b", label: "Enrich & Classify" },
  { id: "A2", label: "Knowledge" },
  { id: "A3", label: "Interpretation" },
  { id: "A4", label: "Recommendation" },
  { id: "A5", label: "Escalation" },
];

export function SpineDiagram({ animate = false }: { animate?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {SPINE.map((s, i) => (
        <div key={s.id} className="flex items-center gap-1.5">
          <div
            className={cn(
              "rounded border border-navy/25 bg-card px-2.5 py-1.5 text-left",
              animate && "glx-step-in",
            )}
            style={animate ? { animationDelay: `${i * 120}ms` } : undefined}
          >
            <div className="font-mono text-[0.68rem] font-semibold text-primary">{s.id}</div>
            <div className="text-[0.7rem] text-navy">{s.label}</div>
          </div>
          {i < SPINE.length - 1 ? (
            <span className={cn("font-mono text-xs text-muted-foreground", animate && "glx-pulse")}>
              →
            </span>
          ) : null}
        </div>
      ))}
      <span className="ml-2 rounded border border-primary/40 bg-primary/8 px-2 py-1 font-mono text-[0.66rem] uppercase text-primary">
        money → human desk
      </span>
    </div>
  );
}
