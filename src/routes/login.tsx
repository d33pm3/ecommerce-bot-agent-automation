import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SpineDiagram } from "@/components/glx/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_USERS, setSession, useSession } from "@/lib/glx/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Staff sign-in · Glossronaut Ops Console" },
      {
        name: "description",
        content:
          "Sign in to the Glossronaut Cosmetics operations console to run the five-agent order-exception pipeline and the Human Desk.",
      },
      { property: "og:title", content: "Staff sign-in · Glossronaut Ops Console" },
      {
        property: "og:description",
        content: "Ops Analyst and Desk Approver sign-in for the Glossronaut case pipeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, ready } = useSession();
  const [email, setEmail] = useState("ops@glossronaut.in");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) void navigate({ to: "/" });
  }, [ready, session, navigate]);


  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setError("Unknown staff account. Use ops@glossronaut.in or desk@glossronaut.in.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters in this demo.");
      return;
    }
    setSession(user);
    void navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 lg:grid-cols-[1fr_26rem]">
        <div>
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-primary">
            Glossronaut Cosmetics · Make-up for the Girl gone Galactic
          </div>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-navy">
            Operations console for order, refund and exception cases
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Five agents run one sequential spine and write one locked artefact each. Nothing in the
            pipeline can move a rupee — every refund and every goodwill credit stops at the Human
            Desk first.
          </p>
          <div className="mt-8">
            <SpineDiagram />
          </div>
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {[
              ["A2 quotes, never paraphrases", "Static clause lookup with a version stamp. No retrieval, no model prose."],
              ["A3 decides in code", "Windows, weights, instruments and amounts are deterministic TypeScript."],
              ["A5 always runs", "Every case gets an explicit trigger list and a manual_required verdict."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-md border border-border bg-card p-4">
                <div className="text-sm font-semibold text-navy">{t}</div>
                <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={submit}
          className="h-fit rounded-md border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-navy">Staff sign-in</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Demo accounts. Role decides whether you can approve money.
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="any 4+ characters"
                autoComplete="current-password"
              />
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </div>
          <div className="mt-5 space-y-2 border-t border-border pt-4">
            {DEMO_USERS.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => {
                  setEmail(u.email);
                  setPassword("demo");
                }}
                className="w-full rounded border border-border px-3 py-2 text-left text-xs hover:bg-muted"
              >
                <span className="font-mono">{u.email}</span>
                <span className="ml-2 text-muted-foreground">
                  {u.role === "desk_approver" ? "Desk Approver" : "Ops Analyst"}
                </span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
