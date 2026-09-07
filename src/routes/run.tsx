import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/glx/AppShell";
import { ArtefactCard } from "@/components/glx/ArtefactView";
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
import { runCrew, STEPS, type RunResult } from "@/lib/glx/pipeline";
import { DEMO_CHIPS } from "@/lib/glx/seed";
import { nextCaseId, saveCase, useSession } from "@/lib/glx/store";
import type { Channel } from "@/lib/glx/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/run")({
  head: () => ({
    meta: [
      { title: "Run the crew · Glossronaut Ops Console" },
      {
        name: "description",
        content:
          "Paste a customer complaint and watch Glossronaut's A1a–A5 agents run in sequence, each writing one locked artefact before money reaches the Human Desk.",
      },
      { property: "og:title", content: "Run the crew · Glossronaut Ops Console" },
      {
        property: "og:description",
        content: "Live agent stepper with an artefact inspector for every handoff.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RunPage,
});

const CHANNELS: Channel[] = ["chat", "email", "social", "marketplace"];

function RunPage() {
  const { session } = useSession();
  const [text, setText] = useState("");
  const [orderId, setOrderId] = useState("");
  const [channel, setChannel] = useState<Channel>("chat");
  const [result, setResult] = useState<RunResult | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [selected, setSelected] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const running = result !== null && revealed < STEPS.length;

  const start = () => {
    if (text.trim().length < 8) return;
    timers.current.forEach(clearTimeout);
    const run = runCrew({
      caseId: nextCaseId(),
      rawText: text.trim(),
      channel,
      orderIdHint: orderId.trim() ? orderId.trim().toUpperCase() : null,
    });
    setResult(run);
    setRevealed(0);
    setSelected(0);
    timers.current = STEPS.map((_, i) =>
      setTimeout(
        () => {
          setRevealed(i + 1);
          setSelected(i);
          if (i === STEPS.length - 1) saveCase(run.caseRecord);
        },
        650 * (i + 1),
      ),
    );
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setResult(null);
    setRevealed(0);
    setText("");
    setOrderId("");
  };

  return (
    <AppShell>
      <SectionTitle
        eyebrow="02 · New case / run crew"
        title="Sequential Plan-Execute run"
        right={
          result ? (
            <div className="flex items-center gap-2">
              <Mono className="text-primary">{result.caseRecord.id}</Mono>
              <Button variant="outline" size="sm" onClick={reset}>
                New run
              </Button>
            </div>
          ) : null
        }
      />

      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-navy">Customer input</h3>
            <div className="mt-3 space-y-3">
              <div>
                <Label htmlFor="text">Complaint text</Label>
                <Textarea
                  id="text"
                  rows={7}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste exactly what the customer wrote…"
                  className="mt-1 text-sm"
                  disabled={result !== null}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="order">Order id (optional)</Label>
                  <Input
                    id="order"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="GLX-ORD-0007"
                    className="mt-1 font-mono text-xs"
                    disabled={result !== null}
                  />
                </div>
                <div>
                  <Label>Channel</Label>
                  <Select
                    value={channel}
                    onValueChange={(v) => setChannel(v as Channel)}
                    disabled={result !== null}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNELS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={start}
                disabled={result !== null || text.trim().length < 8}
              >
                {running ? "Running…" : "Run A1a → A5"}
              </Button>
              <p className="text-[0.7rem] leading-snug text-muted-foreground">
                The run never pays anything. If A3 lands on an amount above ₹0, A5 forces the case to
                the Human Desk.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-navy">Seeded complaints</h3>
            <div className="mt-3 space-y-2">
              {DEMO_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  disabled={result !== null}
                  onClick={() => {
                    setText(chip.text);
                    setOrderId(chip.orderId ?? "");
                    setChannel(chip.channel as Channel);
                  }}
                  className="w-full rounded border border-border p-2.5 text-left transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.8rem] font-semibold text-navy">{chip.label}</span>
                    <Mono className="text-muted-foreground">{chip.orderId ?? "no order"}</Mono>
                  </div>
                  <div className="mt-1 line-clamp-2 text-[0.72rem] text-muted-foreground">
                    {chip.text}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
              {STEPS.map((s, i) => {
                const done = result !== null && revealed > i;
                const active = result !== null && revealed === i;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!done}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "rounded border p-3 text-left transition-all",
                      done
                        ? selected === i
                          ? "border-primary bg-primary/8"
                          : "border-border bg-card hover:bg-muted"
                        : "border-dashed border-border bg-muted/30 opacity-60",
                      active && "glx-pulse border-navy",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Mono className="font-semibold text-primary">{s.id}</Mono>
                      <span className="font-mono text-[0.62rem] uppercase text-muted-foreground">
                        {done ? "written" : active ? "running" : "queued"}
                      </span>
                    </div>
                    <div className="mt-1 text-[0.76rem] font-semibold leading-tight text-navy">
                      {s.agent.split("·")[1]?.trim() ?? s.agent}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {result === null ? (
            <div className="mt-6 rounded-md border border-dashed border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Pick a seeded complaint or paste your own, then run the spine. Artefacts appear here
                one agent at a time.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {revealed >= STEPS.length ? (
                <div
                  className={cn(
                    "rounded-md border p-4",
                    result.a5.manual_required
                      ? "border-primary/40 bg-primary/6"
                      : "border-success/40 bg-success/8",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={result.a5.manual_required ? "maroon" : "good"}>
                      manual_required = {String(result.a5.manual_required)}
                    </Pill>
                    <Pill tone="navy">{result.a5.queue ?? "no queue"}</Pill>
                    <Pill tone={result.a4.selected_amount > 0 ? "warn" : "neutral"}>
                      recommended {inr(result.a4.selected_amount)}
                    </Pill>
                    <Pill tone="neutral">{result.a3.eligibility}</Pill>
                    <div className="ml-auto flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/case/$caseId" params={{ caseId: result.caseRecord.id }}>
                          Case file
                        </Link>
                      </Button>
                      {result.a5.manual_required ? (
                        <Button asChild size="sm">
                          <Link to="/desk">Go to Human Desk</Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-navy">
                    {result.a5.manual_required
                      ? "No money has moved. The pipeline stopped at A5 and parked the case in a human queue — a refund row can only be created by a Desk Approver."
                      : "Information-only answer: nothing payable, so the reply can go out without a desk signature. A5 still recorded its full trigger list."}
                  </p>
                </div>
              ) : null}

              {STEPS.slice(0, revealed).map((s, i) => {
                const art = result.artefacts[i]!;
                return (
                  <div
                    key={s.id}
                    className={cn("glx-step-in", selected === i ? "" : "hidden xl:block")}
                  >
                    <ArtefactCard artefact={art} locked />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {session?.role === "ops_analyst" ? (
        <p className="mt-6 text-xs text-muted-foreground">
          You are signed in as an Ops Analyst: you can run the crew, but the Human Desk will refuse
          any money action from this account.
        </p>
      ) : null}
    </AppShell>
  );
}
