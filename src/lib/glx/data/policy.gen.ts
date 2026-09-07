// AUTO-GENERATED from the Glossonaut CrewAI MVP pack. Do not edit by hand.
// Source: data/policy.db (policy_clauses, policy_registry, policy_alias)

export type GenClause = { clause_id: string; kb_ref: string; policy_section: string; verbatim: string; version: string; effective_from: string };
export const GEN_CLAUSES: GenClause[] = [
  {
    "clause_id": "KB-1.RET-01",
    "kb_ref": "KB-1",
    "policy_section": "P6.2",
    "verbatim": "Issue-based return claims are valid within 15 days of delivery.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-1.RET-02",
    "kb_ref": "KB-1",
    "policy_section": "P6.1",
    "verbatim": "Default return philosophy is issue-based: damaged, wrong, expired, missing, empty, duplicate or used-product-as-delivered. Liberal no-questions-asked returns apply only if a campaign overlay is published.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-1.RET-03",
    "kb_ref": "KB-1",
    "policy_section": "P6.4",
    "verbatim": "Refund or replacement requires warehouse receipt with original packaging, seals and labels intact, except where a defective-delivery ground is established.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-1.RET-04",
    "kb_ref": "KB-1",
    "policy_section": "P6.5",
    "verbatim": "Wrong or short-shipped items are eligible for refund or replacement of the missing or wrong unit. A matching dispatch-weight log is not sufficient denial evidence by itself.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-1.RET-05",
    "kb_ref": "KB-1",
    "policy_section": "P6.1",
    "verbatim": "Damaged, leaked or broken products on defective-delivery grounds are eligible after evidence review. Transit damage is not classified as customer misuse without photographic QC shared on the case.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-1.RET-06",
    "kb_ref": "KB-1",
    "policy_section": "P6.7",
    "verbatim": "Allergic reactions are not eligible for return. Route to safety review and manufacturer; commercial refund is an exception, not a right.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-1.RET-07",
    "kb_ref": "KB-1",
    "policy_section": "P6.1",
    "verbatim": "Suspected counterfeit, failed batch verification or opened-stock reshipped as new is a safety and brand-protection matter. It is not closable by a refund bot alone.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-1.RET-08",
    "kb_ref": "KB-1",
    "policy_section": "P4.5",
    "verbatim": "Marked-delivered-not-received requires OTP and geo-stamp review. Courier POD alone does not close the claim.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-1.RET-09",
    "kb_ref": "KB-1",
    "policy_section": "P6.11",
    "verbatim": "Reverse pickup is assigned within 48 hours and collected within 5 working days. After two failed pickups the customer must be offered a prepaid label or drop-point with refund-on-scan recommended.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-1.RET-10",
    "kb_ref": "KB-1",
    "policy_section": "P6.10",
    "verbatim": "Sale-campaign periods may carry special return rules only when disclosed on the promotion banner. Campaign is an overlay, not a silent denial.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-1.RET-11",
    "kb_ref": "KB-1",
    "policy_section": "P6.8",
    "verbatim": "Combo packs, kits and GWP return whole and unopened unless the platform failed to ship a component. Missing-freebie clawback is forbidden when the freebie was never delivered.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-1.RET-12",
    "kb_ref": "KB-1",
    "policy_section": "P6.1",
    "verbatim": "Optional liberal tier: unused full-size products may be returned within 14 days only when that overlay is active. Default MVP overlay is off.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-2.CAN-01",
    "kb_ref": "KB-2",
    "policy_section": "P5",
    "verbatim": "Customer may cancel free of charge until dispatch or while status is Pending. Full refund to source.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-2.CAN-02",
    "kb_ref": "KB-2",
    "policy_section": "P5",
    "verbatim": "Post-dispatch pre-delivery cancellation is a refuse-delivery / return flow. Refund waits for package movement unless the attempt is unverified.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-2.CAN-03",
    "kb_ref": "KB-2",
    "policy_section": "P5",
    "verbatim": "RTO after uncontacted or unverified delivery attempts is treated as platform-attributable. Refund is not gated on warehouse receipt.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-2.CAN-04",
    "kb_ref": "KB-2",
    "policy_section": "P1.6",
    "verbatim": "Operator-initiated cancel for stock-out, unserviceable pin or pricing error: auto-refund prepaid within 48 hours. Goodwill may be proposed; coupon-only settlement is not the default.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-3.FEE-01",
    "kb_ref": "KB-3",
    "policy_section": "P7",
    "verbatim": "Shipping fee is refundable only for verified defective or incorrect deliveries. COD fee is normally non-refundable.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-3.FEE-02",
    "kb_ref": "KB-3",
    "policy_section": "P2",
    "verbatim": "COD is pin-code dependent. Published cap is the registry value of cod_order_cap.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-3.SLA-01",
    "kb_ref": "KB-3",
    "policy_section": "P7",
    "verbatim": "Refund initiation target is 48 business hours from trigger (cancellation, verified return, or Human Desk approval when HITL applies). Reflection target 7 business days, hard outer bound 15.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-3.SLA-02",
    "kb_ref": "KB-3",
    "policy_section": "P7",
    "verbatim": "Refunds default to the original payment source. Wallet or store credit requires explicit customer opt-in recorded on the case.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-3.SLA-03",
    "kb_ref": "KB-3",
    "policy_section": "P7",
    "verbatim": "COD refunds are paid by bank transfer to the customer-provided account. No cash refunds.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-3.SLA-04",
    "kb_ref": "KB-3",
    "policy_section": "P3",
    "verbatim": "When delivery exceeds the promised date with no proactive update, delivery fee is refundable and delay goodwill may be proposed from the exception matrix.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-3.SLA-05",
    "kb_ref": "KB-3",
    "policy_section": "P3",
    "verbatim": "Dispatch SLA is 48 working hours from order confirmation. Sale-period target may extend to 5 days only when disclosed.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-4.PRO-01",
    "kb_ref": "KB-4",
    "policy_section": "P7",
    "verbatim": "Refund equals amount actually paid on the invoice. Coupon benefits are reversed proportionally. BXGY is apportioned on weighted average. First-purchase offers are forfeited on cancel or return.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-4.PRO-02",
    "kb_ref": "KB-4",
    "policy_section": "P7",
    "verbatim": "GWP clawback reduces refund only when the gift was delivered and not returned. A freebie that never shipped cannot reduce the refund.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-5.EXC-01",
    "kb_ref": "KB-5",
    "policy_section": "P6.6",
    "verbatim": "Universal exclusions: misuse damage, used or altered product, missing original packaging and freebies, tampered serials, out-of-window requests, customized products, personal-care appliances.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-5.EXC-02",
    "kb_ref": "KB-5",
    "policy_section": "P6.6",
    "verbatim": "Shade mismatch versus the product display page is excluded as a preference claim. A different SKU or a documented picking error is a wrong-item ground, not shade-preference.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-6.PREC-01",
    "kb_ref": "KB-6",
    "policy_section": "P6",
    "verbatim": "Statutory rules override express, campaign and base policy.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-6.PREC-02",
    "kb_ref": "KB-6",
    "policy_section": "P6",
    "verbatim": "Express overlay overrides sale-campaign and base where an express product or pin was sold. Sale-campaign overrides base only when banner-disclosed.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-6.PREC-03",
    "kb_ref": "KB-6",
    "policy_section": "P6",
    "verbatim": "Where a defect, mis-shipment or authenticity concern is established, the seal-intact or unused condition shall not bar the claim.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-6.PREC-04",
    "kb_ref": "KB-6",
    "policy_section": "P6",
    "verbatim": "Shade-exchange for unused swatchable units may be offered when overlay POL shade-exchange is active. MVP overlay is off; wrong-SKU remains RET-04.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-7.STAT-01",
    "kb_ref": "KB-7",
    "policy_section": "P9",
    "verbatim": "Grievance acknowledgement within 48 hours; redressal within 30 days under the Consumer Protection (E-Commerce) Rules, 2020.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-7.STAT-02",
    "kb_ref": "KB-7",
    "policy_section": "P9",
    "verbatim": "Product-safety, suspected adulteration, adverse event or counterfeit requires a named human owner, batch capture and a documented decision. Bot-only closure is forbidden.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-7.STAT-03",
    "kb_ref": "KB-7",
    "policy_section": "P9",
    "verbatim": "Legal notice, NCH/INGRAM numbers, consumer-court threats and delivery-personnel misconduct are S1. They terminate at Q-Legal, Q-GrievanceOfficer or Q-Safety.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-8.EXC-01",
    "kb_ref": "KB-8",
    "policy_section": "P5.3",
    "verbatim": "Out-of-policy refunds, exchanges or goodwill require documented maker-checker approval with a reason code.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-8.EXC-02",
    "kb_ref": "KB-8",
    "policy_section": "P5.3",
    "verbatim": "Goodwill and out-of-policy credits: agent proposal cap INR 500; team lead INR 2000; ops head above. Maker and checker cannot be the same person above INR 500.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-8.P10-01",
    "kb_ref": "KB-8",
    "policy_section": "P10",
    "verbatim": "A case is closed only when money, evidence, communication, record (reason code + clause + version + actor) and statutory outer bound are satisfied.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  },
  {
    "clause_id": "KB-8.P10-02",
    "kb_ref": "KB-8",
    "policy_section": "P10",
    "verbatim": "Template closure of an open-evidence ticket is a control failure. Escalated is not a close-code.",
    "version": "v1.0",
    "effective_from": "2026-08-27"
  }
];
export type GenRegistryRow = { parameter: string; value_text: string | null; value_num: number | null; unit: string | null; clause_id: string };
export const GEN_REGISTRY: GenRegistryRow[] = [
  {
    "parameter": "cod_fee",
    "value_text": "49",
    "value_num": 49.0,
    "unit": "INR",
    "clause_id": "KB-3.FEE-01"
  },
  {
    "parameter": "cod_order_cap",
    "value_text": "20000",
    "value_num": 20000.0,
    "unit": "INR",
    "clause_id": "KB-3.FEE-02"
  },
  {
    "parameter": "delivery_attempts",
    "value_text": "3",
    "value_num": 3.0,
    "unit": "attempts",
    "clause_id": "KB-2.CAN-03"
  },
  {
    "parameter": "delivery_sla",
    "value_text": "metros 3 days; India 10 days",
    "value_num": 10.0,
    "unit": "days",
    "clause_id": "KB-3.SLA-04"
  },
  {
    "parameter": "dispatch_sla",
    "value_text": "48 working hours",
    "value_num": 48.0,
    "unit": "working_hours",
    "clause_id": "KB-3.SLA-05"
  },
  {
    "parameter": "first_purchase_forfeit_on_return",
    "value_text": "true",
    "value_num": 1.0,
    "unit": "boolean",
    "clause_id": "KB-4.PRO-01"
  },
  {
    "parameter": "free_cancellation_window",
    "value_text": "until_dispatch_or_pending",
    "value_num": null,
    "unit": null,
    "clause_id": "KB-2.CAN-01"
  },
  {
    "parameter": "free_shipping_threshold",
    "value_text": "799",
    "value_num": 799.0,
    "unit": "INR",
    "clause_id": "KB-3.FEE-01"
  },
  {
    "parameter": "goodwill_agent_cap",
    "value_text": "500",
    "value_num": 500.0,
    "unit": "INR",
    "clause_id": "KB-8.EXC-02"
  },
  {
    "parameter": "goodwill_lead_cap",
    "value_text": "2000",
    "value_num": 2000.0,
    "unit": "INR",
    "clause_id": "KB-8.EXC-02"
  },
  {
    "parameter": "grievance_ack_sla",
    "value_text": "48 hours",
    "value_num": 48.0,
    "unit": "hours",
    "clause_id": "KB-7.STAT-01"
  },
  {
    "parameter": "grievance_redressal_sla",
    "value_text": "30 days",
    "value_num": 30.0,
    "unit": "days",
    "clause_id": "KB-7.STAT-01"
  },
  {
    "parameter": "high_value_verification",
    "value_text": "5000",
    "value_num": 5000.0,
    "unit": "INR",
    "clause_id": "KB-2.CAN-04"
  },
  {
    "parameter": "non_receipt_trigger",
    "value_text": "10 days from dispatch",
    "value_num": 10.0,
    "unit": "days",
    "clause_id": "KB-1.RET-08"
  },
  {
    "parameter": "order_confirmation",
    "value_text": "instant email+SMS",
    "value_num": null,
    "unit": null,
    "clause_id": "KB-3.SLA-05"
  },
  {
    "parameter": "refund_initiation_sla",
    "value_text": "48 business hours",
    "value_num": 48.0,
    "unit": "business_hours",
    "clause_id": "KB-3.SLA-01"
  },
  {
    "parameter": "refund_reflection_sla",
    "value_text": "7 business days; outer 15",
    "value_num": 7.0,
    "unit": "business_days",
    "clause_id": "KB-3.SLA-01"
  },
  {
    "parameter": "return_review_sla",
    "value_text": "48 hours",
    "value_num": 48.0,
    "unit": "hours",
    "clause_id": "KB-1.RET-03"
  },
  {
    "parameter": "return_window_issue_based",
    "value_text": "15 days from delivery",
    "value_num": 15.0,
    "unit": "days",
    "clause_id": "KB-1.RET-01"
  },
  {
    "parameter": "return_window_liberal",
    "value_text": "14 days unused full-size; overlay off",
    "value_num": 14.0,
    "unit": "days",
    "clause_id": "KB-1.RET-12"
  },
  {
    "parameter": "reverse_pickup_sla",
    "value_text": "assign 48h; collect 5 working days",
    "value_num": 5.0,
    "unit": "working_days",
    "clause_id": "KB-1.RET-09"
  },
  {
    "parameter": "ticket_reference_mandatory",
    "value_text": "customer-visible CaseID required",
    "value_num": null,
    "unit": null,
    "clause_id": "KB-8.P10-01"
  },
  {
    "parameter": "unauthorized_charge_window",
    "value_text": "30 days",
    "value_num": 30.0,
    "unit": "days",
    "clause_id": "KB-7.STAT-01"
  }
];
export const GEN_ALIASES: Record<string, string> = {
  "POL-001": "KB-3.SLA-05",
  "POL-002": "KB-2.CAN-01",
  "POL-003": "KB-1.RET-01",
  "POL-004": "KB-1.RET-06",
  "POL-005": "KB-3.SLA-01",
  "POL-006": "KB-3.FEE-01",
  "POL-007": "KB-7.STAT-01",
  "POL-008": "KB-8.P10-01",
  "POL-PREC-01": "KB-6.PREC-01",
  "POL-PREC-02": "KB-6.PREC-02",
  "POL-PREC-03": "KB-6.PREC-03",
  "POL-PREC-04": "KB-6.PREC-04",
  "POL-RFND-02": "KB-3.SLA-02",
  "T&C-DELAY-01": "KB-3.SLA-04"
};
