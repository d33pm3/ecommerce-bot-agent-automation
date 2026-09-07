// AUTO-GENERATED from the Glossonaut CrewAI MVP pack. Do not edit by hand.
// Source: config/authority.yaml, config/routing_matrix.yaml, config/templates.yaml

export const AUTHORITY = {
  "version": "1.0",
  "effective_from": "2026-08-27",
  "hitl": {
    "any_payout_requires_human": true,
    "any_goodwill_requires_human": true,
    "info_only_may_auto_clear": true
  },
  "proposal_caps_inr": {
    "agent": 500,
    "team_lead": 2000,
    "ops_head": null
  },
  "four_eyes": {
    "required_above_inr": 500,
    "maker_cannot_equal_checker": true
  },
  "confidence": {
    "route_hint_threshold": 0.75,
    "partial_enrichment_cap": 0.74
  },
  "queues": [
    "Q-RefundHITL",
    "Q-Safety",
    "Q-CourierOps",
    "Q-GrievanceOfficer",
    "Q-Legal",
    "Q-Social",
    "Q-PolicyOps"
  ],
  "sla": {
    "refund_initiation_business_hours": 48,
    "refund_reflection_business_days": 7,
    "refund_reflection_outer_days": 15,
    "grievance_ack_hours": 48,
    "grievance_redressal_days": 30,
    "safety_first_touch_hours": 2
  }
} as const;
export type PsSpec = { theme: string; severity: string; s1: boolean; clauses: string[]; money_likely: boolean; queue_if_money: string };
export const ROUTING_THEMES: Record<string, { name: string; lead_workload: string[] }> = {
  "T1": {
    "name": "Order fulfilment & status integrity",
    "lead_workload": [
      "A1",
      "A4"
    ]
  },
  "T2": {
    "name": "Delivery partner, in-transit, conduct",
    "lead_workload": [
      "A1",
      "A4",
      "A5"
    ]
  },
  "T3": {
    "name": "Wrong / delayed / unverifiable delivery",
    "lead_workload": [
      "A1",
      "A3",
      "A4"
    ]
  },
  "T4": {
    "name": "Authenticity, expiry, fitment, quality",
    "lead_workload": [
      "A1",
      "A2",
      "A3",
      "A4",
      "A5"
    ]
  },
  "T5": {
    "name": "Exchange, returns, reverse logistics",
    "lead_workload": [
      "A1",
      "A2",
      "A3",
      "A4"
    ]
  },
  "T6": {
    "name": "Pricing, discounts, refund value & timelines",
    "lead_workload": [
      "A2",
      "A3",
      "A4"
    ]
  },
  "T7": {
    "name": "Policy interpretation & complaint handling",
    "lead_workload": [
      "A2",
      "A3",
      "A5"
    ]
  },
  "T8": {
    "name": "Escalations, overrides, merchant, social",
    "lead_workload": [
      "A3",
      "A5"
    ]
  }
};
export const PS_SPECS: Record<string, PsSpec> = {
  "PS-1.1": {
    "theme": "T1",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-1.RET-04",
      "KB-6.PREC-01"
    ],
    "money_likely": true,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-1.3": {
    "theme": "T1",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-2.CAN-04",
      "KB-3.SLA-01"
    ],
    "money_likely": true,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-1.5": {
    "theme": "T1",
    "severity": "S3",
    "s1": false,
    "clauses": [
      "KB-2.CAN-01",
      "KB-2.CAN-02"
    ],
    "money_likely": false,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-2.1": {
    "theme": "T2",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-2.CAN-03",
      "KB-3.SLA-01"
    ],
    "money_likely": true,
    "queue_if_money": "Q-CourierOps"
  },
  "PS-2.3": {
    "theme": "T2",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-1.RET-05",
      "KB-6.PREC-03"
    ],
    "money_likely": true,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-2.7": {
    "theme": "T2",
    "severity": "S1",
    "s1": true,
    "clauses": [
      "KB-7.STAT-03",
      "KB-8.P10-01"
    ],
    "money_likely": false,
    "queue_if_money": "Q-Safety"
  },
  "PS-3.1": {
    "theme": "T3",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-1.RET-04",
      "KB-6.PREC-03"
    ],
    "money_likely": true,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-3.2": {
    "theme": "T3",
    "severity": "S3",
    "s1": false,
    "clauses": [
      "KB-1.RET-04",
      "KB-5.EXC-02"
    ],
    "money_likely": true,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-3.4": {
    "theme": "T3",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-1.RET-08",
      "KB-6.PREC-01"
    ],
    "money_likely": true,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-4.1": {
    "theme": "T4",
    "severity": "S1",
    "s1": true,
    "clauses": [
      "KB-1.RET-07",
      "KB-7.STAT-02"
    ],
    "money_likely": true,
    "queue_if_money": "Q-Safety"
  },
  "PS-4.4": {
    "theme": "T4",
    "severity": "S1",
    "s1": true,
    "clauses": [
      "KB-1.RET-06",
      "KB-7.STAT-02"
    ],
    "money_likely": false,
    "queue_if_money": "Q-Safety"
  },
  "PS-4.8": {
    "theme": "T4",
    "severity": "S3",
    "s1": false,
    "clauses": [
      "KB-5.EXC-02",
      "KB-1.RET-02"
    ],
    "money_likely": false,
    "queue_if_money": "Q-PolicyOps"
  },
  "PS-5.1": {
    "theme": "T5",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-1.RET-09",
      "KB-3.SLA-01"
    ],
    "money_likely": true,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-5.2": {
    "theme": "T5",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-2.CAN-03",
      "KB-3.SLA-01"
    ],
    "money_likely": true,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-6.1": {
    "theme": "T6",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-3.SLA-01",
      "KB-7.STAT-01"
    ],
    "money_likely": true,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-6.5": {
    "theme": "T6",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-3.SLA-02",
      "KB-3.SLA-03"
    ],
    "money_likely": true,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-6.6": {
    "theme": "T6",
    "severity": "S3",
    "s1": false,
    "clauses": [
      "KB-3.FEE-01"
    ],
    "money_likely": true,
    "queue_if_money": "Q-RefundHITL"
  },
  "PS-7.1": {
    "theme": "T7",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-1.RET-03",
      "KB-6.PREC-03"
    ],
    "money_likely": true,
    "queue_if_money": "Q-PolicyOps"
  },
  "PS-8.1": {
    "theme": "T8",
    "severity": "S2",
    "s1": false,
    "clauses": [
      "KB-8.P10-01",
      "KB-7.STAT-01"
    ],
    "money_likely": false,
    "queue_if_money": "Q-GrievanceOfficer"
  },
  "PS-8.3": {
    "theme": "T8",
    "severity": "S1",
    "s1": true,
    "clauses": [
      "KB-7.STAT-01"
    ],
    "money_likely": false,
    "queue_if_money": "Q-GrievanceOfficer"
  },
  "PS-8.8": {
    "theme": "T8",
    "severity": "S1",
    "s1": true,
    "clauses": [
      "KB-7.STAT-01",
      "KB-8.P10-01"
    ],
    "money_likely": false,
    "queue_if_money": "Q-Social"
  },
  "PS-8.9": {
    "theme": "T8",
    "severity": "S1",
    "s1": true,
    "clauses": [
      "KB-7.STAT-01",
      "KB-7.STAT-03"
    ],
    "money_likely": false,
    "queue_if_money": "Q-Legal"
  },
  "PS-UNKNOWN": {
    "theme": "T7",
    "severity": "S3",
    "s1": false,
    "clauses": [],
    "money_likely": false,
    "queue_if_money": "Q-PolicyOps"
  }
};
export const DRAFT_TEMPLATES: Record<string, { id: string; body: string }> = {
  "refund_item": {
    "id": "TPL-REFUND-ITEM",
    "body": "Hi {first_name} — we confirmed {issue_summary}. Your refund of ₹{amount} is recommended to {instrument} and will be initiated within 48 business hours after approval. Case {case_id} stays open with us until it lands. We're sorry the galaxy glitched.\n"
  },
  "safety_allergy": {
    "id": "TPL-SAFETY-ALLERGY",
    "body": "Hi {first_name} — thank you for flagging the reaction and sharing evidence. For your safety this is with our quality desk (not an automatic return). Case {case_id}. Please pause use of batch {batch_code}. A specialist will contact you within 2 hours.\n"
  },
  "redispatch": {
    "id": "TPL-REDISPATCH",
    "body": "Hi {first_name} — the delivery attempt on {order_id} does not show a verified contact. We can reship {sku_name} at the original price, or refund ₹{amount} to {instrument} after approval. Case {case_id}. You should not have to chase three teams.\n"
  },
  "info_policy": {
    "id": "TPL-INFO",
    "body": "Hi {first_name} — on case {case_id}, the current Glossonaut rule is: {clause_plain}. If that does not match what you received, reply with your order ID and we will run a full review.\n"
  },
  "reject_ineligible": {
    "id": "TPL-REJECT",
    "body": "Hi {first_name} — we reviewed case {case_id} against clause {clause_id}. This request is outside the published return rule. If you want a goodwill review, a specialist will take it from here. We will not close this without a named owner.\n"
  }
};
