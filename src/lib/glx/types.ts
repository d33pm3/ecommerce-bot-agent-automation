export type Channel = "chat" | "email" | "social" | "marketplace";

export type PaymentMode = "prepaid_upi" | "prepaid_card" | "cod" | "wallet_gv";

export type OrderStatus =
  | "created"
  | "pending"
  | "packed"
  | "shipped"
  | "in_transit"
  | "stuck_in_transit"
  | "delivered"
  | "delivered_late"
  | "rto"
  | "cancelled";

export type Product = {
  sku: string;
  name: string;
  mrp: number;
  fragile: boolean;
  leakable: boolean;
  unitWeightG: number;
};

export type Customer = {
  id: string;
  name: string;
  city: string;
  pin: string;
  phone: string;
};

export type OrderItem = {
  sku: string;
  name: string;
  qty: number;
  linePaid: number;
  unitPrice: number;
  shade: string | null;
  batch: string | null;
  expiry: string | null;
};

export type Order = {
  id: string;
  customerId: string;
  status: OrderStatus;
  placedAt: string;
  deliveredAt: string | null;
  promisedAt: string | null;
  isGolden: boolean;
  items: OrderItem[];
  failedPickups: number;
  payment: {
    mode: PaymentMode;
    amountPaid: number;
    shippingCharged: number;
    codFee: number;
    reference: string;
  };
  shipment: {
    awb: string;
    courier: string;
    status: OrderStatus;
    expectedWeightG: number;
    packedWeightG: number;
    otpVerified: boolean;
    fakeAttemptFlag: boolean;
    batch: string | null;
    dispatchedAt: string | null;
  };
};


export type AgentId = "A1a" | "A1b" | "A2" | "A3" | "A4" | "A5";

export type ArtefactField = { label: string; value: string };

export type Artefact = {
  id: string;
  agent: AgentId;
  agentName: string;
  type: string;
  version: number;
  createdAt: string;
  supersedes: string | null;
  payload: Record<string, unknown>;
};

export type Eligibility = "in_policy_yes" | "in_policy_no" | "conditional" | "exception_candidate";

export type Queue =
  | "Q-RefundHITL"
  | "Q-Safety"
  | "Q-CourierOps"
  | "Q-GrievanceOfficer"
  | "Q-Legal"
  | "Q-Social"
  | "Q-PolicyOps";

export type CaseStatus =
  | "running"
  | "awaiting_desk"
  | "information_reply"
  | "approved"
  | "rejected_to_a4"
  | "with_grievance_officer"
  | "closed";

export type Rma = {
  id: string;
  caseId: string;
  amount: number;
  instrument: string;
  state: "initiated" | "reflected";
  initiatedAt: string;
  reflectByAt: string;
};

export type OverrideEntry = {
  id: string;
  caseId: string;
  action:
    | "approved_as_recommended"
    | "approved_with_edit"
    | "rejected_to_a4"
    | "sent_to_grievance_officer";
  maker: string;
  checker: string | null;
  fromAmount: number;
  toAmount: number;
  instrument: string;
  reasonCode: string;
  comment: string;
  at: string;
};

export type CaseRecord = {
  id: string;
  createdAt: string;
  channel: Channel;
  rawText: string;
  orderId: string | null;
  customerName: string | null;
  theme: string;
  psId: string;
  severity: "S1" | "S2" | "S3";
  confidence: number;
  eligibility: Eligibility | null;
  amount: number;
  instrument: string;
  manualRequired: boolean;
  queue: Queue | null;
  status: CaseStatus;
  artefacts: Artefact[];
  ackDueAt: string;
  redressDueAt: string;
};

export type StaffRole = "ops_analyst" | "desk_approver";

export type Session = { email: string; name: string; role: StaffRole };
