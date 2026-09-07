import {
  GEN_CUSTOMERS,
  GEN_ORDERS,
  GEN_ORDER_ITEMS,
  GEN_PAYMENTS,
  GEN_PICKUPS,
  GEN_PRODUCTS,
  GEN_SHIPMENTS,
} from "./data/ops.gen";
import { GEN_CASE_SHELLS } from "./data/golden.gen";
import type { Customer, Order, OrderStatus, PaymentMode, Product } from "./types";

/* ------------------------------------------------------------------ *
 * Catalogue — data/ops.db products
 * ------------------------------------------------------------------ */

export const PRODUCTS: Product[] = GEN_PRODUCTS.map((p) => ({
  sku: p.sku_id,
  name: p.product_name,
  mrp: p.base_price,
  fragile: p.is_fragile === 1,
  leakable: p.is_leakable === 1,
  unitWeightG: p.weight_g,
}));

const PRODUCT_BY_SKU = new Map(PRODUCTS.map((p) => [p.sku, p]));

const PIN_CITY: Record<string, string> = {
  "226001": "Lucknow",
  "110001": "New Delhi",
  "560001": "Bengaluru",
  "400001": "Mumbai",
  "831004": "Jamshedpur",
  "380001": "Ahmedabad",
  "600001": "Chennai",
  "500001": "Hyderabad",
  "700001": "Kolkata",
  "411001": "Pune",
};

export const CUSTOMERS: Customer[] = GEN_CUSTOMERS.map((c) => ({
  id: c.customer_id,
  name: c.customer_name,
  city: PIN_CITY[c.pincode] ?? c.pincode,
  pin: c.pincode,
  phone: `+91 ${c.phone.slice(0, 5)} ${c.phone.slice(5)}`,
}));

/* ------------------------------------------------------------------ *
 * OMS projection — orders joined with items, shipment and payment legs
 * ------------------------------------------------------------------ */

const ITEMS_BY_ORDER = new Map<string, typeof GEN_ORDER_ITEMS>();
for (const item of GEN_ORDER_ITEMS) {
  const list = ITEMS_BY_ORDER.get(item.order_id) ?? [];
  list.push(item);
  ITEMS_BY_ORDER.set(item.order_id, list);
}
const SHIP_BY_ORDER = new Map(GEN_SHIPMENTS.map((s) => [s.order_id, s]));
const PAY_BY_ORDER = new Map(GEN_PAYMENTS.map((p) => [p.order_id, p]));

const PICKUPS_BY_ORDER = new Map<string, typeof GEN_PICKUPS>();
for (const p of GEN_PICKUPS) {
  const list = PICKUPS_BY_ORDER.get(p.order_id) ?? [];
  list.push(p);
  PICKUPS_BY_ORDER.set(p.order_id, list);
}

function mode(raw: string): PaymentMode {
  if (raw === "cod") return "cod";
  if (raw === "wallet_gv") return "wallet_gv";
  if (raw === "prepaid_card") return "prepaid_card";
  return "prepaid_upi";
}

function project(o: (typeof GEN_ORDERS)[number]): Order {
  const rawItems = ITEMS_BY_ORDER.get(o.order_id) ?? [];
  const ship = SHIP_BY_ORDER.get(o.order_id);
  const pay = PAY_BY_ORDER.get(o.order_id);
  const itemTotal = rawItems.reduce((sum, i) => sum + i.unit_price * i.qty, 0);
  const extra = Math.max(Math.round((o.amount_paid - itemTotal) * 100) / 100, 0);
  const pm = mode(o.payment_mode);

  return {
    id: o.order_id,
    customerId: o.customer_id,
    status: o.status as OrderStatus,
    placedAt: o.order_ts,
    deliveredAt: ship?.delivered_ts ?? null,
    promisedAt: o.promised_date,
    isGolden: o.is_golden === 1,
    items: rawItems.map((i) => ({
      sku: i.sku_id,
      name: PRODUCT_BY_SKU.get(i.sku_id)?.name ?? i.sku_id,
      qty: i.qty,
      linePaid: Math.round(i.unit_price * i.qty * 100) / 100,
      unitPrice: i.unit_price,
      shade: i.shade,
      batch: i.batch_code,
      expiry: i.expiry_date,
    })),
    payment: {
      mode: pm,
      amountPaid: o.amount_paid,
      shippingCharged: pm === "cod" ? 0 : extra,
      codFee: pm === "cod" ? extra : 0,
      reference: pay?.reference ?? "—",
    },
    shipment: {
      awb: ship?.awb ?? "—",
      courier: ship?.courier ?? "unassigned",
      status: (ship?.shipment_status ?? o.status) as OrderStatus,
      expectedWeightG: ship?.weight_expected_g ?? 0,
      packedWeightG: ship?.weight_packed_g ?? 0,
      otpVerified: ship?.otp_verified === 1,
      fakeAttemptFlag: ship?.fake_attempt_flag === 1,
      batch: rawItems[0]?.batch_code ?? null,
      dispatchedAt: ship?.dispatch_ts ?? null,
    },
    failedPickups: (PICKUPS_BY_ORDER.get(o.order_id) ?? []).filter((p) => p.result === "failed").length,
  };
}

export const ORDERS: Order[] = GEN_ORDERS.map(project);

const ORDER_INDEX = new Map(ORDERS.map((o) => [o.id.toUpperCase(), o]));

export const GOLDEN_ORDERS = ORDERS.filter((o) => o.isGolden);

export function findOrder(id: string | null): Order | null {
  if (!id) return null;
  return ORDER_INDEX.get(id.trim().toUpperCase()) ?? null;
}

export function customerOf(order: Order | null): Customer | null {
  if (!order) return null;
  return CUSTOMERS.find((c) => c.id === order.customerId) ?? null;
}

export function customerById(id: string | null): Customer | null {
  if (!id) return null;
  return CUSTOMERS.find((c) => c.id === id) ?? null;
}

/* ------------------------------------------------------------------ *
 * Golden case shells (data/cases.db) — the demo chips on 02 Run Crew
 * ------------------------------------------------------------------ */

export const GOLDEN_CASES = GEN_CASE_SHELLS;

const GOLDEN_LABELS: Record<string, string> = {
  "GLX-CASE-G001": "G1 · Short-pack — 3 lipsticks, 2 arrived",
  "GLX-CASE-G002": "G2 · Fake NDR — COD order gone RTO",
  "GLX-CASE-G003": "G3 · Marked delivered, no OTP",
  "GLX-CASE-G004": "G4 · Allergy — rash from Nova 210",
  "GLX-CASE-G005": "G5 · Pickup never happened (twice)",
  "GLX-CASE-G006": "G6 · Wallet vs original source",
  "GLX-CASE-G007": "G7 · Opened to find a defect",
  "GLX-CASE-G008": "G8 · NCH / legal escalation",
};

export const DEMO_CHIPS: {
  label: string;
  text: string;
  orderId: string | null;
  channel: string;
  caseId: string;
}[] = GEN_CASE_SHELLS.map((c) => ({
  caseId: c.case_id,
  label: GOLDEN_LABELS[c.case_id] ?? c.case_id,
  text: c.message_text,
  orderId: c.order_id,
  channel: c.channel,
}));
