# Glossronaut Cosmetics — Operations Console

**Author:** DK Mendiratta

Unofficial staff operations console for a dummy cosmetics brand. Five agents run a visible Plan–Execute sequence on a customer complaint and stop at a Human Desk whenever a rupee would move.

This is not a storefront and not a “build me an e-commerce website” starter.

The five-agent plan is in [docs/ops-console-plan.md](docs/ops-console-plan.md).

## This is / this is not

**This is** an unofficial Glossronaut Cosmetics **staff operations console** (5-agent Plan–Execute demo).
**This is** a local React / TanStack app: parse → enrich → clause lookup → rules → recommend → escalate, then Human Desk.
**This is** an evaluation build; money actions stop at HITL.
**This is not** a customer-facing storefront or Shopify/Amazon bot.
**This is not** CrewAI, a live multi-LLM runtime, or a RAG/web researcher (A2 is a static clause table).
**This is not** real payments, courier, or SMS.
**This is not** official Glossronaut or marketplace software.
**This is not** a complete `src/` tree on `main` — the runnable source is in `Codebase.zip`.

## The five agents

| Agent | Job |
|---|---|
| A1a Parse | Normalise the complaint; extract order / SKU / AWB; S1 flags |
| A1b Enrich | Join the mock order; theme T1–T8 |
| A2 Knowledge | Static clause lookup — no RAG, no web |
| A3 Interpretation | Pure TypeScript entitlement rules |
| A4 Recommendation | Options + customer draft; never sends; money → defer |
| A5 Escalation | Always `manual_required`; cannot create a refund row |

Detail, pages, and Human Desk rules: [docs/ops-console-plan.md](docs/ops-console-plan.md).

## Where the source is

The **complete application source** is in [`Codebase.zip`](Codebase.zip), under:

- `3_ecommerce bot agent automation/src/`
- `3_ecommerce bot agent automation/public/`

There is no runnable `src/` on `main`. Extract the zip before `npm run dev`.

## Run the eval build

Requires Node.js 18+ and npm or Bun.

```bash
git clone https://github.com/d33pm3/ecommerce-bot-agent-automation.git
cd ecommerce-bot-agent-automation
unzip -o Codebase.zip
cp -a "3_ecommerce bot agent automation/src/." src/
cp -a "3_ecommerce bot agent automation/public/." public/
npm i
npm run dev
```

After extract, `src/routes/login.tsx` must exist. If it does not, the zip did not unpack.

Demo staff (do not change — the seeded login expects these):

- `ops@glossronaut.in` — Ops Analyst
- `desk@glossronaut.in` — Desk Approver
- any password ≥ 4 characters

## What is not deployed

- There is no hosted URL, GitHub Pages site, or live storefront.
- There is no payment API, courier API, or SMS gateway on the pipeline path.
- A2 does not search the web. A4 never sends the customer draft.
- Do not treat demo refunds, RMAs, or MIS figures as commerce records.

## License

MIT. See `LICENSE`.

You may use this code; this is not a live store, not a payment system, and not a customer-facing full fledged bot.
