import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { Pill } from "./bits";
import { Button } from "@/components/ui/button";
import { clearSession, useSession, useStore } from "@/lib/glx/store";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string }[] = [
  { to: "/", label: "Command" },
  { to: "/run", label: "Run crew" },
  { to: "/desk", label: "Human desk" },
  { to: "/overrides", label: "Overrides" },
  { to: "/mis", label: "MIS" },
  { to: "/policy", label: "Policy cabinet" },
  { to: "/golden", label: "Golden evals" },
  { to: "/about", label: "Architecture" },

];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const store = useStore();
  const pending = store.cases.filter((c) => c.status === "awaiting_desk").length;

  useEffect(() => {
    if (ready && !session) void navigate({ to: "/login" });
  }, [ready, session, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-navy/20 bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-4 px-6 py-3">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight">Glossronaut Cosmetics</span>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-navy-foreground/65">
              Ops Console
            </span>
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded px-2.5 py-1.5 text-[0.82rem] transition-colors",
                  pathname === n.to
                    ? "bg-primary text-primary-foreground"
                    : "text-navy-foreground/80 hover:bg-navy-foreground/10",
                )}
              >
                {n.label}
                {n.to === "/desk" && pending > 0 ? (
                  <span className="ml-1.5 rounded bg-primary px-1 font-mono text-[0.65rem]">
                    {pending}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
          {session ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[0.78rem] leading-tight">{session.name}</div>
                <div className="font-mono text-[0.64rem] uppercase text-navy-foreground/65">
                  {session.role === "desk_approver" ? "can approve money" : "cannot approve money"}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-navy-foreground/30 bg-transparent text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground"
                onClick={() => {
                  clearSession();
                  void navigate({ to: "/login" });
                }}
              >
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-6 py-6">{children}</main>
      <footer className="mx-auto max-w-[1440px] px-6 pb-10 pt-2">
        <Pill tone="neutral">
          Prototype · seeded OMS · no payment, SMS or courier API is called anywhere in this build
        </Pill>
      </footer>
    </div>
  );
}
