// AUTO-GENERATED from the Glossonaut CrewAI MVP pack. Do not edit by hand.
// Source: data/cases.db (cases) + eval/golden/G1-G8.json

export type GenCaseShell = { case_id: string; order_id: string | null; customer_id: string; channel: string; theme_id: string; ps_id: string; severity: string; s1_flag: number; status: string; is_golden: number; message_text: string; created_ts: string };
export const GEN_CASE_SHELLS: GenCaseShell[] = [
  {
    "case_id": "GLX-CASE-G001",
    "order_id": "GLX-ORD-G001",
    "customer_id": "GLX-CUST-G001",
    "channel": "chat",
    "theme_id": "T1",
    "ps_id": "PS-1.1",
    "severity": "S2",
    "s1_flag": 0,
    "status": "seeded",
    "is_golden": 1,
    "message_text": "Ordered 3 lipsticks in one box, only 2 arrived. Tracking says delivered. Warehouse says weight matched. I want my money.",
    "created_ts": "2026-08-23T10:14:00"
  },
  {
    "case_id": "GLX-CASE-G002",
    "order_id": "GLX-ORD-G002",
    "customer_id": "GLX-CUST-G002",
    "channel": "chat",
    "theme_id": "T2",
    "ps_id": "PS-2.1",
    "severity": "S2",
    "s1_flag": 0,
    "status": "seeded",
    "is_golden": 1,
    "message_text": "Nobody called. Tracking shows attempted and now returning to origin. I was home. I still want the order.",
    "created_ts": "2026-08-16T09:00:00"
  },
  {
    "case_id": "GLX-CASE-G003",
    "order_id": "GLX-ORD-G003",
    "customer_id": "GLX-CUST-G003",
    "channel": "chat",
    "theme_id": "T3",
    "ps_id": "PS-3.4",
    "severity": "S2",
    "s1_flag": 0,
    "status": "seeded",
    "is_golden": 1,
    "message_text": "App says delivered with POD. I never received the Boss Babe Kit. No OTP was asked.",
    "created_ts": "2026-08-17T11:00:00"
  },
  {
    "case_id": "GLX-CASE-G004",
    "order_id": "GLX-ORD-G004",
    "customer_id": "GLX-CUST-G004",
    "channel": "chat",
    "theme_id": "T4",
    "ps_id": "PS-4.4",
    "severity": "S1",
    "s1_flag": 1,
    "status": "seeded",
    "is_golden": 1,
    "message_text": "Used the Nova 210 foundation last night, woke up with a rash. Photo attached. Refund immediately.",
    "created_ts": "2026-08-25T08:00:00"
  },
  {
    "case_id": "GLX-CASE-G005",
    "order_id": "GLX-ORD-G005",
    "customer_id": "GLX-CUST-G005",
    "channel": "chat",
    "theme_id": "T5",
    "ps_id": "PS-5.1",
    "severity": "S2",
    "s1_flag": 0,
    "status": "seeded",
    "is_golden": 1,
    "message_text": "Return pickup scheduled twice. Nobody came. Refund is stuck on awaiting warehouse.",
    "created_ts": "2026-08-15T13:00:00"
  },
  {
    "case_id": "GLX-CASE-G006",
    "order_id": "GLX-ORD-G006",
    "customer_id": "GLX-CUST-G006",
    "channel": "chat",
    "theme_id": "T6",
    "ps_id": "PS-6.5",
    "severity": "S2",
    "s1_flag": 0,
    "status": "seeded",
    "is_golden": 1,
    "message_text": "Please refund to my UPI. Do not put this in Glossonaut wallet. I paid from wallet gift card last time and cannot use it.",
    "created_ts": "2026-08-20T10:00:00"
  },
  {
    "case_id": "GLX-CASE-G007",
    "order_id": "GLX-ORD-G007",
    "customer_id": "GLX-CUST-G007",
    "channel": "chat",
    "theme_id": "T7",
    "ps_id": "PS-7.1",
    "severity": "S2",
    "s1_flag": 0,
    "status": "seeded",
    "is_golden": 1,
    "message_text": "Opened the lip twist to use it and the mechanism is broken on first turn. Agent said used products cannot be returned.",
    "created_ts": "2026-08-23T15:00:00"
  },
  {
    "case_id": "GLX-CASE-G008",
    "order_id": null,
    "customer_id": "GLX-CUST-G008",
    "channel": "social",
    "theme_id": "T8",
    "ps_id": "PS-8.9",
    "severity": "S1",
    "s1_flag": 1,
    "status": "seeded",
    "is_golden": 1,
    "message_text": "Filing NCH grievance tomorrow. Tagging Glossonaut. Order never came and support said escalated four times.",
    "created_ts": "2026-08-27T18:00:00"
  }
];
export type GoldenExpectation = { id: string; case_id: string; order_id: string | null; ps_id: string; theme_id: string; s1_flags?: string[]; expected_a2_clauses: string[]; expected_a3: Record<string, unknown>; expected_a4: Record<string, unknown>; expected_a5: { manual_required: boolean; queue: string | null }; fail_if?: string };
export const GOLDEN: GoldenExpectation[] = [
  {
    "id": "G1",
    "case_id": "GLX-CASE-G001",
    "order_id": "GLX-ORD-G001",
    "ps_id": "PS-1.1",
    "theme_id": "T1",
    "s1_flags": [],
    "expected_a2_clauses": [
      "KB-1.RET-04",
      "KB-6.PREC-01"
    ],
    "expected_a3": {
      "eligibility": "in_policy_yes",
      "refund_amount": 249.0,
      "refund_mode": "original_payment_source",
      "ambiguity_flag": false
    },
    "expected_a4": {
      "defer_execution": true,
      "selected_contains": "refund"
    },
    "expected_a5": {
      "manual_required": true,
      "queue": "Q-RefundHITL"
    }
  },
  {
    "id": "G2",
    "case_id": "GLX-CASE-G002",
    "order_id": "GLX-ORD-G002",
    "ps_id": "PS-2.1",
    "theme_id": "T2",
    "s1_flags": [],
    "expected_a2_clauses": [
      "KB-2.CAN-03",
      "KB-3.SLA-01"
    ],
    "expected_a3": {
      "eligibility": "in_policy_yes",
      "refund_amount": 314.0,
      "refund_mode": "bank_transfer",
      "redispatch_offered": true
    },
    "expected_a4": {
      "defer_execution": true,
      "prefer": "redispatch"
    },
    "expected_a5": {
      "manual_required": true,
      "queue": "Q-CourierOps"
    }
  },
  {
    "id": "G3",
    "case_id": "GLX-CASE-G003",
    "order_id": "GLX-ORD-G003",
    "ps_id": "PS-3.4",
    "theme_id": "T3",
    "s1_flags": [],
    "expected_a2_clauses": [
      "KB-1.RET-08",
      "KB-6.PREC-01"
    ],
    "expected_a3": {
      "eligibility": "conditional",
      "otp_verified": false
    },
    "expected_a4": {
      "defer_execution": true
    },
    "expected_a5": {
      "manual_required": true,
      "queue": "Q-RefundHITL"
    }
  },
  {
    "id": "G4",
    "case_id": "GLX-CASE-G004",
    "order_id": "GLX-ORD-G004",
    "ps_id": "PS-4.4",
    "theme_id": "T4",
    "s1_flags": [
      "allergy"
    ],
    "expected_a2_clauses": [
      "KB-1.RET-06",
      "KB-7.STAT-02"
    ],
    "expected_a3": {
      "eligibility": "in_policy_no",
      "refund_amount": 0,
      "exception_candidate": true
    },
    "expected_a4": {
      "in_policy_refund_option": false
    },
    "expected_a5": {
      "manual_required": true,
      "queue": "Q-Safety"
    },
    "fail_if": "auto_refund"
  },
  {
    "id": "G5",
    "case_id": "GLX-CASE-G005",
    "order_id": "GLX-ORD-G005",
    "ps_id": "PS-5.1",
    "theme_id": "T5",
    "expected_a2_clauses": [
      "KB-1.RET-09",
      "KB-3.SLA-01"
    ],
    "expected_a3": {
      "eligibility": "conditional",
      "failed_pickups": 2
    },
    "expected_a4": {
      "offer_label_or_drop_point": true,
      "defer_execution": true
    },
    "expected_a5": {
      "manual_required": true,
      "queue": "Q-RefundHITL"
    }
  },
  {
    "id": "G6",
    "case_id": "GLX-CASE-G006",
    "order_id": "GLX-ORD-G006",
    "ps_id": "PS-6.5",
    "theme_id": "T6",
    "expected_a2_clauses": [
      "KB-3.SLA-02",
      "KB-3.SLA-03"
    ],
    "expected_a3": {
      "eligibility": "in_policy_yes",
      "refund_mode": "original_payment_source",
      "wallet_forced": false
    },
    "expected_a4": {
      "defer_execution": true
    },
    "expected_a5": {
      "manual_required": true,
      "queue": "Q-RefundHITL"
    }
  },
  {
    "id": "G7",
    "case_id": "GLX-CASE-G007",
    "order_id": "GLX-ORD-G007",
    "ps_id": "PS-7.1",
    "theme_id": "T7",
    "expected_a2_clauses": [
      "KB-1.RET-03",
      "KB-6.PREC-03"
    ],
    "expected_a3": {
      "eligibility": "in_policy_yes",
      "seal_intact_override": true
    },
    "expected_a4": {
      "defer_execution": true
    },
    "expected_a5": {
      "manual_required": true,
      "queue": "Q-PolicyOps"
    }
  },
  {
    "id": "G8",
    "case_id": "GLX-CASE-G008",
    "order_id": null,
    "ps_id": "PS-8.9",
    "theme_id": "T8",
    "s1_flags": [
      "nch",
      "legal"
    ],
    "expected_a2_clauses": [
      "KB-7.STAT-01",
      "KB-7.STAT-03"
    ],
    "expected_a3": {
      "eligibility": "exception_candidate"
    },
    "expected_a4": {
      "in_policy_refund_option": false
    },
    "expected_a5": {
      "manual_required": true,
      "queue": "Q-Legal"
    }
  }
];
