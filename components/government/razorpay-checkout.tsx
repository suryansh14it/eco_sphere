"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import {
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Payment gateway checkout that mirrors the Razorpay web experience.
 *
 * The settlement back-end is part of the simulation: every payment succeeds
 * after a short processing animation and returns a `pay_...` reference id,
 * so the government funding flow can be exercised end to end without keys.
 */

export function parseRupees(label: string): number {
  const m = String(label).match(/([\d.]+)\s*(cr|crore|l|lakh|k|thousand)?/i);
  if (!m) return 0;
  const value = parseFloat(m[1]) || 0;
  const mult: Record<string, number> = {
    cr: 1e7, crore: 1e7, l: 1e5, lakh: 1e5, k: 1e3, thousand: 1e3,
  };
  return Math.round(value * (mult[(m[2] || "").toLowerCase()] || 1));
}

const formatINR = (n: number) => new Intl.NumberFormat("en-IN").format(n);

/** Pretty INR grouping, exported for the pay buttons elsewhere. */
export const formatRupees = formatINR;

interface RazorpayCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Requested amount as written in the request, e.g. "₹1.6Cr". */
  amountLabel: string;
  /** Who is being paid, shown in the header + success screen. */
  payee: string;
  /** The NGO's UPI VPA (e.g. "probetrust@upi") — the QR pays into this. */
  vpa?: string;
  /** Memo attached to the UPI QR (e.g. project title). */
  note?: string;
  /** Fired exactly once when the payment succeeds. */
  onPaid: (paymentId: string) => void;
}

type Stage = "select" | "processing" | "success";
type Method = "upi" | "card" | "netbanking" | "wallet";

const METHODS: { id: Method; label: string; icon: typeof Smartphone }[] = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Cards", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

const UPI_APPS = ["GPay", "PhonePe", "Paytm", "BHIM"];

const BANKS = [
  "HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank",
  "Kotak Bank", "Yes Bank", "Punjab National Bank", "Bank of Baroda",
];

const WALLETS = ["Paytm Wallet", "PhonePe Wallet", "GPay Wallet", "Freecharge"];

/** Group a card number into runs of 4, e.g. 4111111111111111 -> 4111 1111 ... */
const formatCardNumber = (raw: string) =>
  raw.replace(/[^\d]/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export function RazorpayCheckout({
  open,
  onOpenChange,
  amountLabel,
  payee,
  vpa,
  note,
  onPaid,
}: RazorpayCheckoutProps) {
  const [stage, setStage] = useState<Stage>("select");
  const [paymentId, setPaymentId] = useState("");
  const [method, setMethod] = useState<Method>("upi");
  const [bank, setBank] = useState(BANKS[0]);
  const [wallet, setWallet] = useState(WALLETS[0]);
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [vpaInput, setVpaInput] = useState("");

  const rupees = parseRupees(amountLabel);
  const paidLabel = `₹${formatINR(rupees)}`;
  // The NGO provides its UPI ID on the funding request; fall back to the
  // house VPA if an older request has none.
  const payTo = vpa?.trim() || "ecosphere@upi";

  // UPI deep link: scannable with any UPI app.
  const upiLink = `upi://pay?pa=${encodeURIComponent(payTo)}&pn=${encodeURIComponent(
    payee
  )}&am=${rupees}&cu=INR&tn=${encodeURIComponent(note || "EcoSphere funding payment")}`;

  // Reset whenever a new payment session opens.
  useEffect(() => {
    if (open) {
      setStage("select");
      setPaymentId("");
      setMethod("upi");
      setBank(BANKS[0]);
      setWallet(WALLETS[0]);
      setCard("");
      setExpiry("");
      setCvv("");
      setVpaInput("");
    }
  }, [open]);

  const pay = () => {
    if (stage === "processing") return;
    setStage("processing");
    // Settlement always succeeds after a moment.
    setTimeout(() => {
      const id = `pay_${Math.random().toString(36).slice(2, 10)}${Date.now()
        .toString(36)
        .slice(-4)}`;
      setPaymentId(id);
      setStage("success");
      onPaid(id);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => stage !== "processing" && onOpenChange(o)}>
      <DialogContent className="flex max-h-[92vh] w-[764px] max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] flex-row gap-0 overflow-hidden border-none bg-white p-0 font-sans shadow-2xl [direction:ltr] [&>button]:hidden">
        <DialogTitle className="sr-only">Complete your payment</DialogTitle>

        {/* ================= Left: payment summary ================= */}
        <div className="hidden w-[230px] shrink-0 flex-col justify-between border-r bg-[#f5f6f8] px-5 py-6 sm:flex">
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-white text-xl font-black text-[#2b84ea] shadow-sm ring-1 ring-black/5">
              {initialsOf(payee || "Eco")}
            </div>
            <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Amount payable
            </p>
            <p className="text-center text-2xl font-bold leading-tight text-slate-800">{paidLabel}</p>
            <p className="mt-1 text-center text-xs text-slate-500">
              to <span className="font-semibold text-slate-600">{payee}</span>
            </p>

            <div className="mt-5 space-y-1 rounded-md bg-white p-3 text-[11px] shadow-sm ring-1 ring-black/5">
              <p className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-500">Pay to</span>
                <span className="truncate text-slate-700" title={payTo}>{payTo}</span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-500">For</span>
                <span className="truncate text-slate-700" title={note || undefined}>{note || "Funding payment"}</span>
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Lock className="h-3 w-3" />
              100% secure payments
            </p>
            <p className="mt-1 text-base font-black tracking-tight text-slate-700">
              razor<span className="text-[#2b84ea]">pay</span>
            </p>
          </div>
        </div>

        {/* ================= Right: method pane ================= */}
        <div className="flex min-w-0 flex-1 flex-col">
          {stage === "select" && (
            <>
              {/* Method selector — the recognisable row of circular icons */}
              <div className="flex items-start justify-center gap-4 border-b border-slate-100 bg-white px-4 pb-3 pt-3">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    className="flex flex-col items-center gap-1 focus:outline-none"
                    onClick={() => setMethod(m.id)}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                        method === m.id
                          ? "border-[#2b84ea] bg-blue-50 text-[#2b84ea]"
                          : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      <m.icon className="h-4 w-4" />
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold",
                        method === m.id ? "text-[#2b84ea]" : "text-slate-500"
                      )}
                    >
                      {m.label}
                    </span>
                  </button>
                ))}
                <button
                  className="ml-1 self-start text-slate-400 transition-colors hover:text-slate-700"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close checkout"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Method bodies */}
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {method === "upi" && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-600">Scan this QR code</p>
                    <div className="flex items-center gap-4 rounded-md border border-slate-200 bg-slate-50/70 p-3">
                      <div className="rounded border border-slate-200 bg-white p-1.5">
                        <QRCode value={upiLink} size={116} />
                      </div>
                      <div className="min-w-0 text-xs text-slate-500">
                        <p className="font-semibold text-slate-700">Scan & pay with any UPI app</p>
                        <p className="mt-1 break-all font-mono text-[11px]">{payTo}</p>
                        <p className="mt-2 text-[11px]">{paidLabel} · {payee}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">Available</span>
                      {UPI_APPS.map((app) => (
                        <span
                          key={app}
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                    <div className="rounded-md border border-dashed border-slate-200 p-3">
                      <label className="text-xs font-semibold text-slate-600">Or enter your UPI ID</label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <input
                          value={vpaInput}
                          onChange={(e) => setVpaInput(e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#2b84ea]"
                        />
                        <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1.5 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {payTo} verified
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {method === "card" && (
                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      <p className="text-xs font-semibold text-slate-600">Enter card details</p>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <span className="rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">VISA</span>
                        <span className="flex items-center">
                          <span className="h-3.5 w-3.5 rounded-full bg-red-500/90" />
                          <span className="-ml-1.5 h-3.5 w-3.5 rounded-full bg-amber-400/90" />
                        </span>
                        <span className="rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">RuPay</span>
                      </div>
                    </div>
                    <div className="rounded-md border border-slate-200 p-3">
                      <label className="text-[11px] font-semibold text-slate-500">Card Number</label>
                      <input
                        value={card}
                        onChange={(e) => setCard(formatCardNumber(e.target.value))}
                        placeholder="4111 1111 1111 1111"
                        inputMode="numeric"
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm tracking-wider text-slate-800 outline-none placeholder:font-sans placeholder:tracking-normal focus:border-[#2b84ea]"
                      />
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500">Expiry (MM/YY)</label>
                          <input
                            value={expiry}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                              setExpiry(raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw);
                            }}
                            placeholder="12/28"
                            inputMode="numeric"
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm text-slate-800 outline-none placeholder:font-sans focus:border-[#2b84ea]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500">CVV</label>
                          <input
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                            placeholder="•••"
                            inputMode="numeric"
                            type="password"
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm text-slate-800 outline-none placeholder:font-sans focus:border-[#2b84ea]"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="text-[11px] font-semibold text-slate-500">Name on card</label>
                        <input
                          placeholder="Full name as printed on card"
                          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#2b84ea]"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      This instrument is already authorized for the transaction. Enter anything and
                      press pay — the token is verified by the issuer on our side.
                    </p>
                  </div>
                )}

                {method === "netbanking" && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600">Select your bank</p>
                    <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                      {BANKS.map((b) => (
                        <label
                          key={b}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors",
                            bank === b
                              ? "border-[#2b84ea] bg-blue-50/60 font-semibold text-[#2b84ea]"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          )}
                          onClick={() => setBank(b)}
                        >
                          {b}
                          <span
                            className={cn(
                              "h-4 w-4 rounded-full border",
                              bank === b
                                ? "border-[7px] border-[#2b84ea]"
                                : "border-slate-300"
                            )}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {method === "wallet" && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600">Select your wallet</p>
                    {WALLETS.map((w) => (
                      <label
                        key={w}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors",
                          wallet === w
                            ? "border-[#2b84ea] bg-blue-50/60 font-semibold text-[#2b84ea]"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        )}
                        onClick={() => setWallet(w)}
                      >
                        {w}
                        <span
                          className={cn(
                            "h-4 w-4 rounded-full border",
                            wallet === w ? "border-[7px] border-[#2b84ea]" : "border-slate-300"
                          )}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Sticky pay bar + trust footer */}
              <div className="border-t border-slate-100 bg-white px-5 py-3">
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-[#2b84ea] py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1c6fd0]"
                  onClick={pay}
                >
                  <Lock className="h-3.5 w-3.5" />
                  Pay {paidLabel}
                </button>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  {payee} uses Razorpay to process payments securely
                </p>
                <p className="mt-0.5 text-center text-[13px] font-black tracking-tight text-slate-700">
                  razor<span className="text-[#2b84ea]">pay</span>
                </p>
              </div>
            </>
          )}

          {/* ---------- Processing ---------- */}
          {stage === "processing" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
              <Loader2 className="h-9 w-9 animate-spin text-[#2b84ea]" />
              <p className="text-sm font-semibold text-slate-700">Processing your payment…</p>
              <p className="text-xs text-slate-400">Do not close this window or press back.</p>
            </div>
          )}

          {/* ---------- Success ---------- */}
          {stage === "success" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-slate-800">Payment Successful</p>
              <p className="text-sm text-slate-500">
                {paidLabel} paid to {payee}
              </p>
              <div className="mt-1 w-full rounded-md bg-slate-50 px-4 py-2.5 text-center font-mono text-xs text-slate-500 ring-1 ring-black/5">
                Payment ID: {paymentId}
              </div>
              <p className="mt-1 max-w-[300px] text-center text-[11px] leading-relaxed text-slate-400">
                The amount has been credited to {payTo}. The funding request is now marked as paid
                and {payee} has been notified.
              </p>
              <button
                className="mt-3 w-full rounded-[4px] bg-[#2b84ea] py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1c6fd0]"
                onClick={() => onOpenChange(false)}
              >
                Done
              </button>
              <p className="mt-1 text-[10px] text-slate-400">
                <Lock className="mr-1 inline h-3 w-3" />
                Powered by razor<span className="font-black text-[#2b84ea]">pay</span>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
