"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { CheckCircle2, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Demo payment gateway that mimics the Razorpay checkout experience.
 *
 * It is deliberately not real money: "Pay" always succeeds after a short
 * processing animation and returns a `pay_...` reference id, so the
 * government funding flow can be exercised end to end without keys.
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
  /** Fired exactly once when the simulated payment succeeds. */
  onPaid: (paymentId: string) => void;
}

type Stage = "select" | "processing" | "success";

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
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");

  const rupees = parseRupees(amountLabel);
  const paidLabel = `₹${formatINR(rupees)}`;
  // The NGO provides its UPI ID on the funding request; fall back to a
  // placeholder if an older request has none.
  const payTo = vpa?.trim() || "ecosphere.demo@upi";

  // Demo UPI deep link: scannable with any UPI app, and honestly fictional.
  const upiLink = `upi://pay?pa=${encodeURIComponent(payTo)}&pn=${encodeURIComponent(
    payee
  )}&am=${rupees}&cu=INR&tn=${encodeURIComponent(note || "EcoSphere funding payment")}`;

  // Reset whenever a new payment session opens.
  useEffect(() => {
    if (open) {
      setStage("select");
      setPaymentId("");
      setMethod("upi");
    }
  }, [open]);

  const pay = () => {
    setStage("processing");
    // Demo gateway: settlement always succeeds after a moment.
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
      <DialogContent className="max-w-md overflow-hidden border-none bg-white p-0 [&>button]:hidden">
        {/* ---------- Razorpay-style header ---------- */}
        <div className="flex items-center justify-between bg-[#0d2a4f] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2b84ea] font-sans text-base font-black text-white">
              R
            </div>
            <span className="font-sans text-lg font-semibold tracking-tight text-white">
              Razorpay
            </span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-blue-100">
              Demo
            </span>
          </div>
          <button
            className="text-blue-100/80 transition-colors hover:text-white"
            onClick={() => onOpenChange(false)}
            aria-label="Close checkout"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="bg-[#123a68] px-4 pb-3 pt-1 text-center">
          <p className="font-sans text-[11px] uppercase tracking-wide text-blue-200">
            Paying {payee}
          </p>
          <p className="font-sans text-2xl font-bold text-white">{paidLabel}</p>
        </div>

        {/* ---------- Processing ---------- */}
        {stage === "processing" && (
          <div className="flex flex-col items-center gap-4 px-6 py-14">
            <Loader2 className="h-10 w-10 animate-spin text-[#2b84ea]" />
            <p className="font-sans text-sm font-medium text-stone-700">
              Processing payment securely...
            </p>
            <p className="font-sans text-xs text-stone-400">
              Contacting the UPI network. Do not close this window.
            </p>
          </div>
        )}

        {/* ---------- Success ---------- */}
        {stage === "success" && (
          <div className="flex flex-col items-center gap-3 px-6 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" />
            </div>
            <p className="font-sans text-xl font-semibold text-stone-900">Payment Successful</p>
            <p className="font-sans text-sm text-stone-600">
              {paidLabel} paid to {payee}
            </p>
            <div className="mt-1 w-full rounded-lg bg-stone-50 px-4 py-3 text-center font-mono text-xs text-stone-500">
              Payment ID: {paymentId}
            </div>
            <p className="mt-1 font-sans text-[11px] text-stone-400">
              Demo gateway — no real money moved. The funding request is marked paid.
            </p>
            <button
              className="mt-2 w-full rounded-md bg-[#2b84ea] py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#1c6fd0]"
              onClick={() => onOpenChange(false)}
            >
              Continue
            </button>
          </div>
        )}

        {/* ---------- Method selection ---------- */}
        {stage === "select" && (
          <div className="font-sans">
            {/* Method tabs */}
            <div className="grid grid-cols-3 divide-x divide-stone-100 border-b border-stone-100">
              {(
                [
                  { id: "upi", label: "UPI / QR" },
                  { id: "card", label: "Card" },
                  { id: "netbanking", label: "Netbanking" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  className={cn(
                    "px-3 py-2.5 text-xs font-semibold transition-colors",
                    method === m.id
                      ? "border-b-2 border-[#2b84ea] bg-blue-50/60 text-[#2b84ea]"
                      : "text-stone-500 hover:bg-stone-50"
                  )}
                  onClick={() => setMethod(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {method === "upi" && (
              <div className="space-y-4 px-5 py-5">
                {/* UPI app tiles */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "GPay", bg: "bg-white border border-stone-200", text: "text-stone-800" },
                    { name: "PhonePe", bg: "bg-[#5f259f]", text: "text-white" },
                    { name: "Paytm", bg: "bg-[#00baf2]", text: "text-white" },
                  ].map((app) => (
                    <div
                      key={app.name}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold",
                        app.bg,
                        app.text
                      )}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-black/10 text-[10px] font-black">
                        {app.name[0]}
                      </span>
                      {app.name}
                    </div>
                  ))}
                </div>

                {/* QR */}
                <div className="flex flex-col items-center gap-2 rounded-lg border border-stone-200 bg-stone-50/70 px-4 py-4">
                  <p className="text-xs font-semibold text-stone-700">Scan to pay with any UPI app</p>
                  <div className="rounded-lg border-4 border-[#2b84ea]/20 bg-white p-2">
                    <QRCode value={upiLink} size={148} />
                  </div>
                  <p className="break-all text-center font-mono text-[11px] text-stone-500">
                    {payTo} · {payee}
                  </p>
                </div>

                <button
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2b84ea] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1c6fd0]"
                  onClick={pay}
                >
                  <Lock className="h-3.5 w-3.5" />
                  Pay {paidLabel}
                </button>
              </div>
            )}

            {method === "card" && (
              <div className="space-y-3 px-5 py-5">
                <input
                  disabled
                  placeholder="Card number (4111 1111 1111 1111)"
                  className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-400"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    disabled
                    placeholder="MM / YY"
                    className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-400"
                  />
                  <input
                    disabled
                    placeholder="CVV"
                    className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-400"
                  />
                  <input
                    disabled
                    placeholder="Name on card"
                    className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-400"
                  />
                </div>
                <p className="text-[11px] text-stone-400">
                  Card payments are unavailable in this demo — use the UPI / QR tab.
                </p>
                <button
                  className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-stone-200 py-3 text-sm font-semibold text-stone-400"
                  disabled
                >
                  <Lock className="h-3.5 w-3.5" />
                  Pay {paidLabel}
                </button>
              </div>
            )}

            {method === "netbanking" && (
              <div className="space-y-3 px-5 py-5">
                <div className="flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-stone-50/70 py-8 text-sm text-stone-500">
                  <ShieldCheck className="h-5 w-5 text-stone-300" />
                  Netbanking is unavailable in this demo — use the UPI / QR tab.
                </div>
                <button
                  className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-stone-200 py-3 text-sm font-semibold text-stone-400"
                  disabled
                >
                  <Lock className="h-3.5 w-3.5" />
                  Pay {paidLabel}
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 border-t border-stone-100 bg-stone-50/60 py-2.5 text-[10px] text-stone-400">
              <Lock className="h-3 w-3" />
              Secured by Razorpay (simulated) · 100% payment success guarantee
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
