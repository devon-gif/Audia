"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, AlertCircle } from "lucide-react";

interface CancelSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: "pro" | "elite";
  subscriptionId: string;
  onApplyDiscount: (subscriptionId: string, tier: "pro" | "elite") => Promise<void>;
}

type CancellationReason = "too_expensive" | "not_enough_shows" | "technical_issues" | "other";

const REASONS = [
  { id: "too_expensive", label: "Too expensive" },
  { id: "not_enough_shows", label: "Not enough shows" },
  { id: "technical_issues", label: "Technical issues" },
  { id: "other", label: "Other" },
];

export default function CancelSubscriptionModal({
  open,
  onOpenChange,
  currentTier,
  subscriptionId,
  onApplyDiscount,
}: CancelSubscriptionModalProps) {
  const [phase, setPhase] = useState<"question" | "offer">("question");
  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [loading, setLoading] = useState(false);

  // Pricing based on tier
  const offerPrice = currentTier === "pro" ? "$1.99" : "$5.99";
  const originalPrice = currentTier === "pro" ? "$4.99" : "$9.99";

  const handleReasonSubmit = () => {
    if (selectedReason) {
      setPhase("offer");
    }
  };

  const handleClaimDiscount = async () => {
    setLoading(true);
    try {
      await onApplyDiscount(subscriptionId, currentTier);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to apply discount:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPhase("question");
    setSelectedReason(null);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            {/* VisuallyHidden title for accessibility */}
            <span className="sr-only">
              <Dialog.Title>Cancel Subscription</Dialog.Title>
            </span>

            <div className="relative overflow-hidden rounded-3xl bg-black/90 backdrop-blur-[60px] border border-white/10 shadow-2xl shadow-black/50">
              {/* Ambient orange glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {phase === "question" ? (
                    <motion.div
                      key="question"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Phase 1: The Question */}
                      <div className="text-center mb-6">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                          <AlertCircle size={24} className="text-orange-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          We're sorry to see you go
                        </h3>
                        <p className="text-zinc-400 text-sm">
                          Help us improve by telling us why you're leaving.
                        </p>
                      </div>

                      {/* Reason options */}
                      <div className="space-y-2 mb-6">
                        {REASONS.map((reason) => (
                          <button
                            key={reason.id}
                            onClick={() => setSelectedReason(reason.id as CancellationReason)}
                            className={`w-full p-4 rounded-xl border transition-all text-left ${
                              selectedReason === reason.id
                                ? "bg-orange-500/10 border-orange-500/30 text-white"
                                : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/[0.08] hover:border-white/20"
                            }`}
                          >
                            <span className="text-sm font-medium">{reason.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Continue button */}
                      <button
                        onClick={handleReasonSubmit}
                        disabled={!selectedReason}
                        className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-all border border-white/10"
                      >
                        Continue
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="offer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Phase 2: The Offer */}
                      <div className="text-center mb-6">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                          <Sparkles size={24} className="text-orange-400" />
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs font-semibold text-orange-300 mb-3">
                          <Sparkles size={12} />
                          Special Founder Offer
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Don't go just yet!
                        </h3>
                        <p className="text-zinc-400 text-sm">
                          We value you as an early supporter. Here's an exclusive deal:
                        </p>
                      </div>

                      {/* Offer card */}
                      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/30 rounded-2xl p-6 mb-6">
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                          <span className="text-4xl font-bold text-white">{offerPrice}</span>
                          <span className="text-zinc-400 text-lg">/mo</span>
                        </div>
                        <div className="text-center">
                          <span className="text-zinc-500 line-through text-sm">{originalPrice}/mo</span>
                          <span className="text-orange-400 text-sm ml-2">for 6 months</span>
                        </div>
                        <p className="text-zinc-300 text-sm text-center mt-3">
                          Stay with us at a reduced rate. No commitment, cancel anytime.
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-3">
                        <button
                          onClick={handleClaimDiscount}
                          disabled={loading}
                          className="w-full py-3.5 rounded-xl bg-[#FF6600] hover:bg-[#FF7A00] text-white font-semibold transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Applying...
                            </>
                          ) : (
                            "Claim 6-Month Discount"
                          )}
                        </button>
                        <button
                          onClick={handleClose}
                          disabled={loading}
                          className="w-full py-3.5 rounded-xl bg-transparent hover:bg-white/5 text-zinc-400 hover:text-zinc-300 font-medium transition-all text-sm"
                        >
                          No thanks, continue with cancellation
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
