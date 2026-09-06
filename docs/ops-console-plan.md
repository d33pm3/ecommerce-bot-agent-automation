# Glossronaut Cosmetics — Operations Console (5-agent Plan-Execute prototype)

Copied from `glossronaut-cosmetics-operations-console-5-agent-plan-execut-2026-08-28.md` so visitors can open the plan under a short path.

## What gets built

A staff operations console, not a landing page. Home is the Command Center. Staff pick or paste a customer complaint, the console runs A1a → A1b → A2 → A3 → A4 → A5 in visible sequence, writes one locked artefact per agent, and stops at a Human Desk whenever a rupee would move. MIS reads only what the prototype actually recorded.

## Pages

- `/login` — demo staff login. `ops@glossronaut.in` = Ops Analyst, `desk@glossronaut.in` = Desk Approver, any password ≥ 4 chars. Session in localStorage; role gates money actions.
- `/` — Command Center: KPI strip, animated A1→A5 spine, New case, last 8 cases.
- `/run` — New Case / Run Crew: left input pane (message, order-id picker, channel, three demo chips), centre vertical stepper with 800 ms stagger and waiting/running/passed/blocked states, right Case File stack where artefacts append and upstream cards lock.
- `/case/$caseId` — append-only timeline of the six artefacts plus raw customer text.
- `/desk` — Human Desk queues with the four actions, role-gated.
- `/overrides` — immutable Override Register.
- `/mis` — daily pulse, funnel A1→A5, statutory clocks, S1 open, last 20 cases, honest footnote.
- `/policy` — read-only Policy Cabinet, the eleven mock clauses verbatim with version v1.0.
- `/about` — architecture: five agents, handoffs, why agent isolation is a defect.

## The engine (deterministic where it matters)

- **A1a Parse** — normalisation, sub-issue split, order id / SKU / AWB extraction, S1 keyword detection (allergy, rash, fake, NCH, legal, threatened, harassment). Entities `validated: false`. Blank/garbage input → `unactionable: true`.
- **A1b Enrich & Classify** — joins the mock order, shipment, items, payment, weights, OTP flag; assigns Theme T1–T8 and PS-ID from the fixed catalogue with confidence 0–1. Unknown order → enrichment partial, confidence 0.74. Cannot clear S1 flags.
- **A2 Knowledge Search** — static keyed lookup over the hardcoded clause table. No RAG, no web, no paraphrase: clause text is rendered character-for-character from the same source the Policy Cabinet reads. Misses set `gap: true` and continue.
- **A3 Interpretation** — pure TypeScript rules: 15-day issue window, pre-dispatch free cancel, allergy → `in_policy_no` + `exception_candidate`, short-pack/wrong item → item refund (weight match alone never denies), fake attempt + no OTP + RTO → platform-attributable and not gated on warehouse receipt, amount = paid value of affected lines, shipping only on platform fault, COD fee not refunded, instrument prepaid → source / COD → bank transfer / wallet only on request, conflicting clauses → `ambiguity_flag` with no coin-flip. Reasoning trail may cite only clause IDs A2 returned.
- **A4 Recommendation** — ranks 2–3 options, validator asserts selected amount === A3 amount (mismatch shows a red banner and blocks handoff), `defer_execution: true` whenever amount > 0, plus a warm customer draft with Case ID and next timestamp. Never sends.
- **A5 Escalation** — always runs, always emits `manual_required` and a non-empty `triggers_evaluated`, assigns Q-RefundHITL / Q-Safety / Q-CourierOps / Q-GrievanceOfficer / Q-Legal / Q-Social. Cannot create a refund row.

Enforcement is structural, not prompt text: no pay API exists in the pipeline path, artefact rows are insert-only, and each step's writer is the only code allowed to produce its artefact type. The three scripted demos (short-pack, allergy, fake NDR) resolve to the exact traces in the brief so a founder demo never drifts.

## Human Desk

Queue filters, then a case pane with original message, A3 entitlement, A4 draft and clause trail. Approve recommended creates the RMA in `initiated`, starts the reflection timer and logs `approved_as_recommended`. Approve with edit requires amount, instrument and a reason code; above ₹500 it demands checker PIN `2468` and logs both user labels. Reject to A4 requires a comment, appends a superseding ResolutionPlan version and re-runs A5. Send to Grievance Officer moves the case to Q-GrievanceOfficer and starts the 48-hour acknowledgement clock. Ops Analyst can run the crew but every money action is refused for that role.

## Data

Lovable Cloud (Postgres): `staff_users`, `customers`, `products`, `orders`, `order_items`, `shipments`, `payments`, `cases`, `artefacts`, `desk_tasks`, `override_register`, `rma`. Seeded in the migration with the eleven clauses and eight orders including GLX-ORD-0007 (short-pack, 210g vs 240g), GLX-ORD-0021 (Nova 210 allergy, batch B00211), GLX-ORD-0014 (COD ₹314, RTO, fake attempt, OTP false), a shade mismatch, a pending cancellable order, a >₹2000 prepaid, a wallet-paid order, and an order-less social/NCH case. Indian customers across 226001, 110001, 831004. Case IDs `GLX-CASE-YYYY-#####`.

## Design

Cream `#F7F1E8` page, maroon `#7A1F2B` primary, navy `#1B365D` structure, white cards, Inter/Arial, semantic tokens only. 1440px desktop first, tablet usable, dense monospaced audit surfaces. No gradient-AI aesthetic.

## Technical notes

- Agent modules in `src/lib/crew/*` with a Zod schema per artefact and a validator gate between steps; orchestration runs through server functions so the pipeline path is server-owned.
- A1a/A1b classification and the A4 draft copy use Lovable AI with structured output and a deterministic fallback keyed to the demo chips; A2, A3 and A5 are pure code.
- Tables get explicit grants plus RLS; staff read/write is allowed for the demo roles, and the refund row is writable only by the desk action path.

## Not in scope

Real payments, live courier or SMS, CrewAI/Python runtime, customer-facing storefront, auto-adjudication.
